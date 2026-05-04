const API_BASE_URL = ''; // Si despliegas el backend, pon aquí su URL, p.ej. 'https://mi-backend.onrender.com'

const MUNICIPIOS_FALLBACK = [
    { codigo: 15759, nombre: 'Tunja' },
    { codigo: 17001, nombre: 'Manizales' },
    { codigo: 11001, nombre: 'Bogotá, D.C.' },
    { codigo: 13001, nombre: 'Cartagena de Indias' },
    { codigo: 15238, nombre: 'Duitama' },
    { codigo: 52001, nombre: 'Pasto' },
    { codigo: 5001, nombre: 'Medellín' },
    { codigo: 41551, nombre: 'Pitalito' },
    { codigo: 68001, nombre: 'Bucaramanga' },
    { codigo: 5045, nombre: 'Apartadó' },
    { codigo: 5154, nombre: 'Bogotá Salitre' },
    { codigo: 73001, nombre: 'Ibagué' },
    { codigo: 8001, nombre: 'Barranquilla' },
    { codigo: 76834, nombre: 'Tuluá' },
    { codigo: 73449, nombre: 'Melgar' },
    { codigo: 73349, nombre: 'Honda' },
    { codigo: 63001, nombre: 'Armenia' },
    { codigo: 86865, nombre: 'Villagarzón' },
    { codigo: 52356, nombre: 'Ipiales' },
    { codigo: 86571, nombre: 'Pereira' },
    { codigo: 66001, nombre: 'Sogamoso' },
    { codigo: 15001, nombre: 'Medellín Sur' },
    { codigo: 18001, nombre: 'Florencia' },
    { codigo: 76111, nombre: 'Buga' },
    { codigo: 44430, nombre: 'Planeta Rica' },
    { codigo: 54001, nombre: 'Cúcuta' },
    { codigo: 20001, nombre: 'Valledupar' },
    { codigo: 47001, nombre: 'Santa Marta' },
    { codigo: 76001, nombre: 'Cali' },
    { codigo: 25290, nombre: 'Fusagasugá' },
    { codigo: 50001, nombre: 'Villavicencio' },
    { codigo: 8433, nombre: 'Garzón' },
    { codigo: 68755, nombre: 'Socorro' },
    { codigo: 86001, nombre: 'Espinal' },
    { codigo: 15176, nombre: 'Chiquinquirá' },
    { codigo: 76147, nombre: 'Girardot' },
    { codigo: 25307, nombre: 'Montería' },
    { codigo: 86885, nombre: 'Neiva' },
    { codigo: 23001, nombre: 'Aguachica' },
    { codigo: 41001, nombre: 'San Gil' },
    { codigo: 68679, nombre: 'Aguazul' },
    { codigo: 76109, nombre: 'Popayán' },
    { codigo: 73268, nombre: 'La Plata' },
    { codigo: 73563, nombre: 'Yarumal' },
    { codigo: 25053, nombre: 'Ocaña' },
    { codigo: 85139, nombre: 'Maicao' },
    { codigo: 41396, nombre: 'Buenaventura' },
    { codigo: 5887, nombre: 'Pamplona' },
    { codigo: 19001, nombre: 'Cartagena Norte' },
    { codigo: 85010, nombre: 'Yopal' },
    { codigo: 85001, nombre: 'Caucasia' },
    { codigo: 70001, nombre: 'Sincelejo' },
    { codigo: 27001, nombre: 'Quibdó' }
];

function poblarMunicipios(municipios) {
    const munOrigen = document.getElementById('mun_origen');
    const munDestino = document.getElementById('mun_destino');
    municipios.forEach(mun => {
        const opt = document.createElement('option');
        opt.value = mun.codigo;
        opt.textContent = `${mun.nombre} (${mun.codigo})`;
        munOrigen.appendChild(opt.cloneNode(true));
        munDestino.appendChild(opt.cloneNode(true));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Llenar dropdown de horas (0-23)
    const horaSelect = document.getElementById('hora');
    for (let i = 0; i < 24; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        horaSelect.appendChild(option);
    }

    // Cargar municipios desde el backend si existe, sino usar la lista local
    if (API_BASE_URL) {
        fetch(`${API_BASE_URL}/municipios`)
            .then(res => res.json())
            .then(municipios => {
                if (!municipios || municipios.length === 0) throw new Error('Lista de municipios vacía');
                poblarMunicipios(municipios);
            })
            .catch(() => poblarMunicipios(MUNICIPIOS_FALLBACK));
    } else {
        poblarMunicipios(MUNICIPIOS_FALLBACK);
    }

    // Manejar envío del formulario
    document.getElementById('prediccion-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultadoDiv = document.getElementById('resultado');
        const errorDiv = document.getElementById('error');
        resultadoDiv.classList.add('oculto');
        errorDiv.classList.add('oculto');

        // Obtener y validar campos
        const terminal = document.getElementById('terminal').value;
        const clase = document.getElementById('clase_vehiculo').value;
        const nivel = document.getElementById('nivel_servicio').value;
        const munOrigen = document.getElementById('mun_origen').value;
        const munDestino = document.getElementById('mun_destino').value;
        const fechaDate = document.getElementById('fecha').value; // YYYY-MM-DD
        const hora = document.getElementById('hora').value;
        const tipo = document.getElementById('tipo_despacho').value;
        const despachos = document.getElementById('despachos').value;

        if (!terminal || !clase || !nivel || !munOrigen || !munDestino || !fechaDate || !hora || !tipo || !despachos) {
            mostrarError('Todos los campos son obligatorios');
            return;
        }

        // Formatear fecha a "2023 May 18 12:00:00 AM"
        const fechaObj = new Date(fechaDate + 'T00:00:00');
        const meses = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const mes = meses[fechaObj.getMonth()];
        const dia = fechaObj.getDate();
        const anio = fechaObj.getFullYear();
        const fechaFormateada = `${anio} ${mes} ${dia} 12:00:00 AM`;

        const payload = {
            terminal: terminal,
            clase_vehiculo: clase,
            nivel_servicio: nivel,
            mun_origen: munOrigen,
            mun_destino: munDestino,
            fecha: fechaFormateada,
            hora: hora,
            tipo_despacho: tipo,
            despachos: despachos
        };

        try {
            const response = await fetch(`${API_BASE_URL}/predecir`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.error) {
                mostrarError(data.error);
            } else {
                document.getElementById('valor-predicho').textContent = data.prediccion;
                resultadoDiv.classList.remove('oculto');
            }
        } catch (err) {
            mostrarError('Error de conexión');
        }
    });

    function mostrarError(mensaje) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = mensaje;
        errorDiv.classList.remove('oculto');
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./static/js/sw.js');
    }
});