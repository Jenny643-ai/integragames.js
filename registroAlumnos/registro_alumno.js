const API_EVENTOS = '/api/eventos';
const API_ESCUELAS = '/api/escuelas';
const API_REGISTRO = '/guardar_alumno';

window.onload = () => {
    cargarEscuelas();
    cargarEventos();
};

/* =====================
   ESCUELAS
===================== */
async function cargarEscuelas() {
    try {
        const res = await fetch(API_ESCUELAS);

        if (!res.ok) throw new Error("No autorizado");

        const data = await res.json();

        const select = document.getElementById('id_escuela');
        select.innerHTML = '<option value="">Selecciona una escuela</option>';

        data.forEach(e => {
            select.innerHTML += `
                <option value="${e.id_escuela}">
                    ${e.nombre_escuela}
                </option>
            `;
        });

    } catch (error) {
        console.error("Error cargando escuelas:", error);
        alert("Error cargando escuelas");
    }
}

/* =====================
   EVENTOS
===================== */
async function cargarEventos() {
    try {
        const res = await fetch(API_EVENTOS);

        if (!res.ok) throw new Error("No autorizado");

        const data = await res.json();

        const select = document.getElementById('id_evento');
        select.innerHTML = '<option value="">Selecciona un evento</option>';

        data.forEach(e => {
            select.innerHTML += `
                <option value="${e.id_evento}">
                    ${e.nombre_evento}
                </option>
            `;
        });

    } catch (error) {
        console.error("Error cargando eventos:", error);
        alert("Error cargando eventos");
    }
}

/* =====================
   REGISTRAR
===================== */
document.getElementById('formRegistro').addEventListener('submit', async (e) => {

    e.preventDefault();

    const body = {
        nombre: document.getElementById('nombre').value,
        edad: document.getElementById('edad').value,
        id_evento: document.getElementById('id_evento').value,
        id_escuela: document.getElementById('id_escuela').value
    };

    try {
        const resp = await fetch(API_REGISTRO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await resp.json();

        if (!resp.ok) {
            alert(data.error || "Error al registrar");
            return;
        }

        alert("Registro exitoso");
        window.location.href = "/menu";

    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor");
    }

});