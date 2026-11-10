const API_URL = 'http://localhost:8000/api';

const formulario = document.getElementById('formulario-ticket');
const campoIdPrestamo = document.getElementById('id-ticket');
const campoMotivo = document.getElementById('descripcion');
const campoDispositivo = document.getElementById('sala');
const campoPrioridad = document.getElementById('prioridad');

const tituloFormulario = document.getElementById(
    'titulo-formulario'
);

const listaPrestamos = document.getElementById('lista-tickets');
const sinPrestamos = document.getElementById('sin-tickets');

const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');

const botonGuardar = formulario.querySelector(
    'button[type="submit"]'
);

const botonCancelar = document.getElementById(
    'boton-cancelar'
);

const botonLogout = document.getElementById(
    'boton-logout'
);

cargarDatos();

formulario.addEventListener(
    'submit',
    async function (eventoEnvio) {
        eventoEnvio.preventDefault();

        ocultarMensajes();

        const idPrestamo = campoIdPrestamo.value;
        const motivoPrestamo = campoMotivo.value.trim();
        const dispositivo = campoDispositivo.value;
        const idPrioridad = campoPrioridad.value;

        if (motivoPrestamo === '' || idPrioridad === '') {
            mostrarError(
                'Debes completar el motivo y la prioridad.'
            );

            return;
        }

        bloquearFormulario(true);

        const datosPrestamo = {
            motivo_prestamo: motivoPrestamo,
            dispositivo: dispositivo === '' ? null : dispositivo,
            id_prioridad: Number(idPrioridad)
        };

        let metodo = 'POST';

        if (idPrestamo !== '') {
            metodo = 'PUT';
            datosPrestamo.id_prestamo = Number(idPrestamo);
        }

        try {
            const respuesta = await fetch(
                API_URL + '/prestamos',
                {
                    method: metodo,

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify(datosPrestamo)
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.error ||
                    'No fue posible guardar el préstamo.'
                );
            }

            mensajeExito.textContent = datos.mensaje;
            mensajeExito.hidden = false;

            volverModoCreacion();

            await cargarDatos();
        } catch (error) {
            mostrarError(error.message);
        } finally {
            bloquearFormulario(false);
        }
    }
);

botonCancelar.addEventListener('click', function () {
    volverModoCreacion();
    ocultarMensajes();
});

botonLogout.addEventListener('click', async function () {
    try {
        await fetch(
            API_URL + '/logout',
            {
                method: 'POST',
                credentials: 'include'
            }
        );
    } finally {
        window.location.replace('../index.html');
    }
});

async function cargarDatos() {
    try {
        const respuesta = await fetch(
            API_URL + '/prestamos',
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const datos = await respuesta.json();

        if (
            respuesta.status === 401 ||
            respuesta.status === 403
        ) {
            window.location.replace('../index.html');
            return;
        }

        if (!respuesta.ok) {
            throw new Error(
                datos.error ||
                'No fue posible obtener los préstamos.'
            );
        }

        cargarPrioridades(datos.prioridades);
        mostrarPrestamos(datos.prestamos);
    } catch (error) {
        mostrarError(error.message);
    }
}

function cargarPrioridades(prioridades) {
    const prioridadSeleccionada = campoPrioridad.value;

    campoPrioridad.innerHTML = '';

    const primeraOpcion = document.createElement('option');

    primeraOpcion.value = '';
    primeraOpcion.textContent = 'Selecciona una prioridad';

    campoPrioridad.appendChild(primeraOpcion);

    prioridades.forEach(function (prioridad) {
        const opcion = document.createElement('option');

        opcion.value = prioridad.id_prioridad;
        opcion.textContent = prioridad.nombre;

        campoPrioridad.appendChild(opcion);
    });

    campoPrioridad.value = prioridadSeleccionada;
}

function mostrarPrestamos(prestamos) {
    listaPrestamos.innerHTML = '';

    if (prestamos.length === 0) {
        sinPrestamos.hidden = false;
        return;
    }

    sinPrestamos.hidden = true;

    prestamos.forEach(function (prestamo) {
        const fila = document.createElement('tr');

        const celdaFecha = document.createElement('td');
        const celdaMotivo = document.createElement('td');
        const celdaDispositivo = document.createElement('td');
        const celdaPrioridad = document.createElement('td');
        const celdaAccion = document.createElement('td');

        celdaFecha.textContent = formatearFecha(prestamo.fecha);
        celdaMotivo.textContent = prestamo.motivo_prestamo;

        if (prestamo.dispositivo === null) {
            celdaDispositivo.textContent = 'Sin dispositivo';
        } else {
            celdaDispositivo.textContent = prestamo.dispositivo;
        }

        celdaPrioridad.textContent = prestamo.prioridad;

        const botonModificar = document.createElement('button');

        botonModificar.type = 'button';
        botonModificar.textContent = 'Modificar';

        botonModificar.addEventListener(
            'click',
            function () {
                cargarPrestamoEnFormulario(prestamo);
            }
        );

        celdaAccion.appendChild(botonModificar);

        fila.appendChild(celdaFecha);
        fila.appendChild(celdaMotivo);
        fila.appendChild(celdaDispositivo);
        fila.appendChild(celdaPrioridad);
        fila.appendChild(celdaAccion);

        listaPrestamos.appendChild(fila);
    });
}

function cargarPrestamoEnFormulario(prestamo) {
    campoIdPrestamo.value = prestamo.id_prestamo;
    campoMotivo.value = prestamo.motivo_prestamo;

    if (prestamo.dispositivo === null) {
        campoDispositivo.value = '';
    } else {
        campoDispositivo.value = prestamo.dispositivo;
    }

    campoPrioridad.value = prestamo.id_prioridad;

    tituloFormulario.textContent = 'Modificar préstamo';
    botonGuardar.textContent = 'Guardar cambios';
    botonCancelar.hidden = false;

    campoMotivo.focus();
}

function volverModoCreacion() {
    formulario.reset();

    campoIdPrestamo.value = '';

    tituloFormulario.textContent = 'Crear préstamo';
    botonGuardar.textContent = 'Crear préstamo';
    botonCancelar.hidden = true;
}

function bloquearFormulario(bloquear) {
    campoMotivo.disabled = bloquear;
    campoDispositivo.disabled = bloquear;
    campoPrioridad.disabled = bloquear;
    botonGuardar.disabled = bloquear;
    botonCancelar.disabled = bloquear;

    if (bloquear === true) {
        botonGuardar.textContent = 'Guardando...';
    } else if (campoIdPrestamo.value === '') {
        botonGuardar.textContent = 'Crear préstamo';
    } else {
        botonGuardar.textContent = 'Guardar cambios';
    }
}

function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.hidden = false;
}

function ocultarMensajes() {
    mensajeError.textContent = '';
    mensajeError.hidden = true;

    mensajeExito.textContent = '';
    mensajeExito.hidden = true;
}

function formatearFecha(fecha) {
    const fechaJavaScript = new Date(
        fecha.replace(' ', 'T')
    );

    return fechaJavaScript.toLocaleString('es-UY');
}