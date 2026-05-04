import pickle
import pandas as pd
import torch
from flask import Flask, render_template, request, jsonify
import datetime
from mapeo_municipios import MUNICIPIOS

app = Flask(__name__)

# Cargar el modelo una sola vez al iniciar
with open('modelo-RN-regresion-pasajerosDL.pkl', 'rb') as f:
    modelo_dict = pickle.load(f)
    modelo = modelo_dict['model']
    scaler = modelo_dict['scaler']
    features = modelo_dict['features']

# Diccionarios de mapeo para los municipios (código → nombre legible)
# Debes completar esta lista con los nombres reales del DIVIPOLA.
municipios_r = MUNICIPIOS


NIVEL_SERVICIO_MAP = {
    'LUJO': 3.0,
    'BASICO': 1.0,
    'PREFERENCIAL DE LUJO': 2.0,
    'PREFERENCIAL': 2.0,
}

def construir_registro(data):
    registro = {feat: 0 for feat in features}

    nivel = str(data['nivel_servicio']).strip().upper()
    if nivel in NIVEL_SERVICIO_MAP:
        registro['NIVEL_SERVICIO'] = NIVEL_SERVICIO_MAP[nivel]
    else:
        registro['NIVEL_SERVICIO'] = float(nivel)

    registro['MUNICIPIO_ORIGEN_RUTA'] = int(data['mun_origen'])
    registro['MUNICIPIO_DESTINO_RUTA'] = int(data['mun_destino'])
    registro['HORA_DESPACHO'] = int(data['hora'])
    registro['DESPACHOS'] = int(data['despachos'])
    registro['TIPO_DESPACHO_TRANSITO'] = 1 if 'transito' in str(data['tipo_despacho']).strip().lower() else 0

    clase = str(data['clase_vehiculo']).strip().upper()
    clave_clase = f'CLASE_VEHICULO_{clase}'
    if clave_clase in registro:
        registro[clave_clase] = 1

    terminal = str(data['terminal']).strip().upper()
    clave_terminal = f'TERMINAL_{terminal}'
    if clave_terminal in registro:
        registro[clave_terminal] = 1

    fecha_str = str(data['fecha']).strip()
    try:
        fecha = datetime.datetime.strptime(fecha_str, '%Y %b %d %I:%M:%S %p')
    except ValueError:
        fecha = datetime.datetime.fromisoformat(fecha_str)

    registro['FECHA_ANIO'] = fecha.year
    registro['FECHA_MES'] = fecha.month
    registro['FECHA_DIA'] = fecha.day
    registro['FECHA_DIA_SEMANA'] = fecha.weekday()

    return registro
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predecir', methods=['POST'])
def predecir():
    try:
        data = request.get_json()
        registro = construir_registro(data)
        df = pd.DataFrame([registro], columns=features)

        X_scaled = scaler.transform(df)
        modelo.eval()
        with torch.no_grad():
            salida = modelo(torch.from_numpy(X_scaled.astype('float32')))
        prediccion = salida.cpu().numpy().ravel()[0]

        return jsonify({'prediccion': round(float(prediccion), 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/municipios')
def obtener_municipios():
    """Devuelve lista de municipios con código y nombre para llenar los dropdowns."""
    municipios = [{'codigo': cod, 'nombre': nom} for cod, nom in municipios_r.items()]
    return jsonify(municipios)

if __name__ == '__main__':
    app.run(debug=True, port=5000)