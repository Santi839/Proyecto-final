document.addEventListener('DOMContentLoaded', () => {
    // Llenar dropdown de horas (0-23)
    const horaSelect = document.getElementById('hora');
    for (let i = 0; i < 24; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        horaSelect.appendChild(option);
    }

    // Cargar municipios desde el backend
    fetch('/municipios')
        .then(res => res.json())
        .then(municipios => {
            const munOrigen = document.getElementById('mun_origen');
            const munDestino = document.getElementById('mun_destino');
            municipios.forEach(mun => {
                const opt = document.createElement('option');
                opt.value = mun.codigo;
                opt.textContent = `${mun.nombre} (${mun.codigo})`;
                munOrigen.appendChild(opt.cloneNode(true));
                munDestino.appendChild(opt.cloneNode(true));
            });
        });

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
            const response = await fetch('/predecir', {
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