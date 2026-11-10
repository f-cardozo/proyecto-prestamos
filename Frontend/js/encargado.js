const API_URL = 'http://localhost:8000/api';

const formulario = document.getElementById('formulario-ticket');
const campoIdPrestamo = document.getElementById('id-ticket');
const campoMotivo = document.getElementById('descripcion');
const campoDispositivo = document.getElementById('sala');
const campoPrioridad = document.getElementById('prioridad');
const campoEstado = document.getElementById('estado');

const contenedorEstado = document.getElementById(
    'contenedor-estado'
);

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
        const idEstado = campoEstado.value;

        if (motivoPrestamo === '' || idPrioridad === '') {
            mostrarError(
                'Debes completar el motivo y la prioridad.'
            );

            return;
        }

        if (idPrestamo !== '' && idEstado === '') {
            mostrarError(
                'Debes seleccionar el estado.'
            );

            return;
        }

        bloquearFormulario(true);

        const datosPrestamo = {
            motivo_prestamo: motivoPrestamo,
            dispositivo: dispositivo,
            id_prioridad: Number(idPrioridad)
        };

        let metodo = 'POST';

        if (idPrestamo !== '') {
            metodo = 'PUT';

            datosPrestamo.id_prestamo = Number(idPrestamo);
            datosPrestamo.id_estado = Number(idEstado);
        }

        try {
            const respuesta = await fetch(
                API_URL + '/encargado/prestamos',
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

            volverModoCreacion();

            mensajeExito.textContent = datos.mensaje;
            mensajeExito.hidden = false;

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
            API_URL + '/encargado/prestamos',
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

        cargarOpciones(
            campoPrioridad,
            datos.prioridades,
            'id_prioridad'
        );

        cargarOpciones(
            campoEstado,
            datos.estados,
            'id_estado'
        );

        mostrarPrestamos(datos.prestamos);
    } catch (error) {
        mostrarError(error.message);
    }
}

function cargarOpciones(
    select,
    elementos,
    nombreId
) {
    select.innerHTML = '';

    const primeraOpcion = document.createElement('option');

    primeraOpcion.value = '';
    primeraOpcion.textContent = 'Selecciona una opción';

    select.appendChild(primeraOpcion);

    elementos.forEach(function (elemento) {
        const opcion = document.createElement('option');

        opcion.value = elemento[nombreId];
        opcion.textContent = elemento.nombre;

        select.appendChild(opcion);
    });
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

        agregarCelda(fila, formatearFecha(prestamo.fecha));
        agregarCelda(fila, prestamo.creador);
        agregarCelda(fila, prestamo.motivo_prestamo);

        if (prestamo.dispositivo === null) {
            agregarCelda(fila, 'Sin dispositivo');
        } else {
            agregarCelda(fila, prestamo.dispositivo);
        }

        agregarCelda(fila, prestamo.prioridad);
        agregarCelda(fila, prestamo.estado);

        const celdaAccion = document.createElement('td');

        if (esModificable(prestamo.estado)) {
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
        } else {
            celdaAccion.textContent = 'No modificable';
        }

        fila.appendChild(celdaAccion);
        listaPrestamos.appendChild(fila);
    });
}

function agregarCelda(fila, contenido) {
    const celda = document.createElement('td');

    celda.textContent = contenido;

    fila.appendChild(celda);
}

function esModificable(estado) {
    const estadoNormalizado = estado
        .trim()
        .toLowerCase();

    return (
        estadoNormalizado === 'abierto' ||
        estadoNormalizado === 'en proceso' ||
        estadoNormalizado === 'solicitado'
    );
}

function cargarPrestamoEnFormulario(prestamo) {
    campoIdPrestamo.value = prestamo.id_prestamo;
    campoMotivo.value = prestamo.motivo_prestamo;
    campoPrioridad.value = prestamo.id_prioridad;
    campoEstado.value = prestamo.id_estado;

    if (prestamo.dispositivo === null) {
        campoDispositivo.value = '';
    } else {
        campoDispositivo.value = prestamo.dispositivo;
    }

    tituloFormulario.textContent = 'Modificar préstamo';
    botonGuardar.textContent = 'Guardar cambios';
    botonCancelar.hidden = false;
    contenedorEstado.hidden = false;

    campoMotivo.focus();
}

function volverModoCreacion() {
    formulario.reset();

    campoIdPrestamo.value = '';

    tituloFormulario.textContent = 'Crear préstamo';
    botonGuardar.textContent = 'Crear préstamo';
    botonCancelar.hidden = true;
    contenedorEstado.hidden = true;
}

function bloquearFormulario(bloquear) {
    campoMotivo.disabled = bloquear;
    campoDispositivo.disabled = bloquear;
    campoPrioridad.disabled = bloquear;
    campoEstado.disabled = bloquear;
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