const express = require('express');
const router = express.Router();
const connection = require('../config/conexion');

// Middleware de sesión (equivalente a session_start)
router.get('/', (req, res) => {

    // Verificar sesión
    if (!req.session.usuario) {
        return res.redirect('../RegistroAdmin/login');
    }

    const rol = req.session.rol;

    // CONSULTA (exactamente igual)
    const sql = `SELECT 
    e.id_evento,
    e.nombre_evento,
    e.lugar,
    e.fecha,
    GROUP_CONCAT(DISTINCT r.nombre SEPARATOR ', ') AS nombre_responsable,
    COUNT(DISTINCT p.id_participante) AS total_personas
    FROM evento e
    LEFT JOIN evento_responsable er ON e.id_evento = er.id_evento
    LEFT JOIN responsable r ON er.id_responsable = r.id_responsable
    LEFT JOIN participante p ON e.id_evento = p.id_evento
    GROUP BY e.id_evento`;

    connection.query(sql, (err, resDB) => {
        if (err) throw err;

        let filas = '';

        if (resDB.length === 0) {
            filas += `
                <tr>
                    <td colspan="4">No hay registros</td>
                </tr>
            `;
        } else {
            resDB.forEach(row => {
                let fecha = row.fecha 
                    ? new Date(row.fecha).toLocaleDateString('es-MX') 
                    : '-';

                let responsable = row.nombre_responsable || 'Sin asignar';

                filas += `
                    <tr>
                        <td>${row.nombre_evento}</td>
                        <td>${row.lugar}</td>
                        <td>${fecha}</td>
                        <td>${responsable}</td>
                        <td>${row.total_personas}</td>
                    </tr>
                `;
            });
        }

        // RESPUESTA HTML (equivalente al PHP + HTML)
        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Eventos Registrados</title>

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

<h2>Eventos Registrados</h2>

<div class="card p-3">

<div class="d-flex justify-content-between align-items-center mb-3">
<input type="text" id="buscador" class="form-control w-50" placeholder="Buscar evento...">

<button onclick="exportTableToExcel()" class="btn btn-success">
Exportar a Excel
</button>
</div>

<p><strong>Total de registros:</strong> ${resDB.length}</p>

<div class="table-responsive">
<table class="table table-bordered text-center">

<thead>
<tr>
<th>Evento</th>
<th>Lugar</th>
<th>Fecha</th>
<th>Responsable</th>
<th>Total Personas</th>
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
        let evento = fila.children[0].textContent.toLowerCase();
        let lugar = fila.children[1].textContent.toLowerCase();
        let fecha = fila.children[2].textContent.toLowerCase();
        let responsable = fila.children[3].textContent.toLowerCase();

        if (
            evento.includes(filtro) ||
            lugar.includes(filtro) ||
            fecha.includes(filtro) ||
            responsable.includes(filtro)
        ) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
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