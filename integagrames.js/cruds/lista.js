const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.get('/', (req, res) => {

    // Verificar sesión
    if (!req.session.usuario) {
        return res.redirect('../RegistroAdmin/login');
    }

    const rol = req.session.rol;

    // CONSULTA (idéntica)
    const sql = `SELECT 
    p.nombre,
    p.edad,
    e.nombre_evento,
    esc.nombre_escuela,
    r.tipo_juego,
    r.puntaje,
    r.fecha,
    s.calificacion,
    s.comentario
    FROM participante p
    LEFT JOIN evento e ON p.id_evento = e.id_evento
    LEFT JOIN escuela esc ON p.id_escuela = esc.id_escuela
    LEFT JOIN resultado r ON p.id_participante = r.id_participante
    LEFT JOIN satisfaccion s ON p.id_participante = s.id_participante`;

    connection.query(sql, (err, result) => {
        if (err) throw err;

        let filas = '';

        if (result.length === 0) {
            filas = `
                <tr>
                    <td colspan="9">No hay registros</td>
                </tr>
            `;
        } else {

            result.forEach(row => {

                let fecha = row.fecha
                    ? new Date(row.fecha).toLocaleDateString('es-MX')
                    : '-';

                let calificacionHTML = "-";

                if (row.calificacion !== null) {
                    if (row.calificacion >= 8) {
                        calificacionHTML = `<span class='badge badge-success'>${row.calificacion}</span>`;
                    } else if (row.calificacion >= 5) {
                        calificacionHTML = `<span class='badge badge-warning'>${row.calificacion}</span>`;
                    } else {
                        calificacionHTML = `<span class='badge badge-danger'>${row.calificacion}</span>`;
                    }
                }

                filas += `
                <tr>
                    <td>${row.nombre}</td>
                    <td>${row.edad}</td>
                    <td>${row.nombre_evento || '-'}</td>
                    <td>${row.nombre_escuela || '-'}</td>
                    <td>${row.tipo_juego || '-'}</td>
                    <td>${row.puntaje || '-'}</td>
                    <td>${fecha}</td>
                    <td>${calificacionHTML}</td>
                    <td>${row.comentario || '-'}</td>
                </tr>
                `;
            });
        }

        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Participantes</title>

<link rel="icon" href="../img/logo.png" type="image/png">
<link href="../vendor/fontawesome-free/css/all.min.css" rel="stylesheet">
<link href="../css/sb-admin-2.min.css" rel="stylesheet">

<style>
body {
    background: #eef4ff;
    font-family: 'Segoe UI';
}
h2 {
    color: #1e3a8a;
    font-weight: bold;
}
.card {
    border-radius: 18px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}
.table thead {
    background: #3b82f6;
    color: white;
}
.table tbody tr:hover {
    background: #e0ecff;
}
table {
    border-radius: 10px;
    overflow: hidden;
}
thead th {
    text-transform: uppercase;
    font-size: 13px;
}
tbody td {
    vertical-align: middle;
}
</style>
</head>

<body id="page-top" class="sidebar-toggled">

<div class="container-fluid mt-4">

<h2>Registros Completos</h2>

<div class="card p-3">

<div class="d-flex justify-content-between align-items-center mb-3">
<input type="text" id="buscador" class="form-control w-50" placeholder="Buscar evento...">

<button onclick="exportTableToExcel()" class="btn btn-success">
Exportar a Excel
</button>
</div>

<p><strong>Total de registros:</strong> ${result.length}</p>

<div class="table-responsive">
<table class="table table-bordered text-center">

<thead>
<tr>
<th>Nombre</th>
<th>Edad</th>
<th>Evento</th>
<th>Escuela</th>
<th>Juego</th>
<th>Puntaje</th>
<th>Fecha</th>
<th>Calificación</th>
<th>Comentario</th>
</tr>
</thead>

<tbody>
${filas}
</tbody>

</table>
</div>

</div>
</div>

<script>
document.getElementById("buscador").addEventListener("keyup", function() {
    let filtro = this.value.toLowerCase();
    let filas = document.querySelectorAll("tbody tr");

    filas.forEach(fila => {
        let texto = fila.textContent.toLowerCase();
        fila.style.display = texto.includes(filtro) ? "" : "none";
    });
});

function exportTableToExcel() {
    let table = document.querySelector("table").outerHTML;
    let url = 'data:application/vnd.ms-excel,' + escape(table);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'registros.xls';
    a.click();
}
</script>

</body>
</html>
        `);
    });

});

module.exports = router;