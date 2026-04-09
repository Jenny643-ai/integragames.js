const API = 'http://localhost:3000/api/escuelas';
window.onload = cargar;

// =====================
// CARGAR
// =====================
async function cargar() {

    const tabla = document.querySelector("#tablaEscuelas tbody");

    if (!tabla) {
        console.error("No se encontró la tabla");
        return;
    }

    const res = await fetch(API);
    const data = await res.json();

    tabla.innerHTML = '';

    if (data.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5">No hay registros</td></tr>`;
        return;
    }

    data.forEach(e => {
        tabla.innerHTML += `
        <tr>
            <td>${e.id_escuela}</td>
            <td>${e.nombre_escuela}</td>
            <td>${e.direccion}</td>
            <td>${e.telefono}</td>
            <td>
                <button class="btn btn-primary btn-sm"
                    onclick="editar(
                        ${e.id_escuela},
                        '${e.nombre_escuela}',
                        '${e.direccion}',
                        '${e.telefono}'
                    )">
                    Editar
                </button>
            </td>
        </tr>`;
    });
}

// =====================
// GUARDAR / ACTUALIZAR
// =====================
async function guardar() {

    const token = localStorage.getItem('token');

    const id = document.getElementById('id').value;

    const body = {
        nombre: document.getElementById('nombre').value,
        direccion: document.getElementById('direccion').value,
        telefono: document.getElementById('telefono').value
    };

    let url = API;
    let method = 'POST';

    if (id) {
        url += '/' + id;
        method = 'PUT';
    }

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error);
        return;
    }

    location.reload();
}

// =====================
// EDITAR
// =====================
function editar(id, nombre, direccion, telefono) {
    document.getElementById('id').value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('direccion').value = direccion;
    document.getElementById('telefono').value = telefono;

    new bootstrap.Modal(document.getElementById('modal')).show();
}

function abrirModal() {
    document.getElementById('id').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('telefono').value = '';

    new bootstrap.Modal(document.getElementById('modal')).show();
}

// =====================
// BUSCAR
// =====================
document.getElementById("buscador").addEventListener("keyup", function () {
    let texto = this.value.toLowerCase();
    let filas = document.querySelectorAll("#tablaEscuelas tbody tr");

    filas.forEach(f => {
        f.style.display = f.textContent.toLowerCase().includes(texto) ? "" : "none";
    });
});

// =====================
// ORDENAR
// =====================
document.getElementById("orden").addEventListener("change", function () {
    let filas = Array.from(tabla.rows);

    filas.sort((a, b) => {
        let A = a.cells[1].innerText.toLowerCase();
        let B = b.cells[1].innerText.toLowerCase();

        return this.value === "asc"
            ? A.localeCompare(B)
            : B.localeCompare(A);
    });

    filas.forEach(f => tabla.appendChild(f));
});