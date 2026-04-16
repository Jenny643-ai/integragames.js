const express = require('express');
const router = express.Router();
const connection = require('../config/conexion');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

/* =========================
   CONFIGURAR MULTER
========================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/eventos'); // IMPORTANTE: carpeta pública
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });

/* =========================
   RUTA PRINCIPAL
========================= */
router.get('/', (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    const sql = "SELECT * FROM evento ORDER BY fecha DESC";

    connection.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.send("Error en BD");
        }

        let eventosHTML = '';

        if (result.length > 0) {

            result.forEach(row => {

                let imagenPath = path.join(__dirname, '../public/img/eventos/', row.imagen || '');
                let imagen = (row.imagen && fs.existsSync(imagenPath))
                    ? '/img/eventos/' + row.imagen
                    : '/img/default.png';

                eventosHTML += `
                <tr>
                    <td><img src="${imagen}" class="img-evento"></td>
                    <td>${row.nombre_evento}</td>
                    <td>${row.fecha}</td>
                    <td>${row.lugar}</td>
                    <td>${row.observaciones}</td>
                    <td>
                        <button class="btn btn-warning btn-sm"
                            onclick="editarEvento(
                            '${row.id_evento}',
                            '${row.nombre_evento}',
                            '${row.fecha}',
                            '${row.lugar}',
                            '${row.observaciones}'
                        )">✏️</button>

                        <button class="btn btn-danger btn-sm"
                            onclick="eliminarEvento('${row.id_evento}')">🗑️</button>
                    </td>
                </tr>
                `;
            });

        } else {
            eventosHTML = `<tr><td colspan="6" class="text-center">No hay eventos</td></tr>`;
        }

        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Eventos</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
body { background:#f4f6f9; }

.container-box {
    background:white;
    padding:20px;
    border-radius:15px;
    box-shadow:0 5px 15px rgba(0,0,0,0.1);
}

.img-evento {
    width:90px;
    height:90px;
    object-fit:cover;
    border-radius:10px;
}

td { vertical-align:middle; }
</style>
</head>

<body>

<div class="container mt-4">
<div class="container-box">

<h2 class="mb-4">📅 Eventos</h2>

<!-- CREAR -->
<form action="/eventos/crear" method="POST" enctype="multipart/form-data" class="row g-2 mb-3">
    <div class="col-md-2">
        <input type="text" name="nombre_evento" class="form-control" placeholder="Nombre" required>
    </div>

    <div class="col-md-2">
        <input type="date" name="fecha" class="form-control" required>
    </div>

    <div class="col-md-2">
        <input type="text" name="lugar" class="form-control" placeholder="Lugar" required>
    </div>

    <div class="col-md-3">
        <input type="text" name="observaciones" class="form-control" placeholder="Observaciones">
    </div>

    <div class="col-md-2">
        <input type="file" name="imagen" class="form-control">
    </div>

    <div class="col-md-1 d-grid">
        <button class="btn btn-success">Guardar</button>
    </div>
</form>

<!-- TABLA -->
<div class="table-responsive">
<table class="table table-hover table-bordered">

<thead class="table-dark">
<tr>
    <th>Imagen</th>
    <th>Nombre</th>
    <th>Fecha</th>
    <th>Lugar</th>
    <th>Observaciones</th>
    <th>Acciones</th>
</tr>
</thead>

<tbody>
${eventosHTML}
</tbody>

</table>
</div>

</div>
</div>

<!-- FORM ELIMINAR -->
<form id="formEliminar" action="/eventos/eliminar" method="POST" style="display:none;">
<input type="hidden" name="id_evento" id="deleteIdEvento">
</form>

<!-- FORM EDITAR -->
<div class="container mt-3">
<form action="/eventos/editar" method="POST" enctype="multipart/form-data" class="row g-2">

<input type="hidden" name="id_evento" id="editIdEvento">

<div class="col-md-2">
<input type="text" name="nombre_evento" id="editNombre" class="form-control">
</div>

<div class="col-md-2">
<input type="date" name="fecha" id="editFecha" class="form-control">
</div>

<div class="col-md-2">
<input type="text" name="lugar" id="editLugar" class="form-control">
</div>

<div class="col-md-3">
<input type="text" name="observaciones" id="editObservaciones" class="form-control">
</div>

<div class="col-md-2">
<input type="file" name="imagen" class="form-control">
</div>

<div class="col-md-1 d-grid">
<button class="btn btn-primary">Actualizar</button>
</div>

</form>
</div>

<script>
function eliminarEvento(id){
    document.getElementById('deleteIdEvento').value=id;
    document.getElementById('formEliminar').submit();
}

function editarEvento(id,nombre,fecha,lugar,obs){
    document.getElementById('editIdEvento').value=id;
    document.getElementById('editNombre').value=nombre;
    document.getElementById('editFecha').value=fecha;
    document.getElementById('editLugar').value=lugar;
    document.getElementById('editObservaciones').value=obs;

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}
</script>

</body>
</html>
        `);

    });
});

/* ================= CREAR ================= */
router.post('/crear', upload.single('imagen'), (req, res) => {

    const { nombre_evento, fecha, lugar, observaciones } = req.body;
    let imagen = req.file ? req.file.filename : "";

    const sql = `
    INSERT INTO evento (nombre_evento, fecha, lugar, observaciones, imagen)
    VALUES (?,?,?,?,?)`;

    connection.query(sql, [nombre_evento, fecha, lugar, observaciones, imagen], err => {
        if (err) return res.send("Error");
        res.redirect('/eventos');
    });
});

/* ================= ELIMINAR ================= */
router.post('/eliminar', (req, res) => {

    const id = req.body.id_evento;

    connection.query("DELETE FROM evento WHERE id_evento=?", [id], err => {
        if (err) return res.send("Error");
        res.redirect('/eventos');
    });
});

/* ================= EDITAR ================= */
router.post('/editar', upload.single('imagen'), (req, res) => {

    const { id_evento, nombre_evento, fecha, lugar, observaciones } = req.body;

    let sql = `
    UPDATE evento SET 
    nombre_evento=?, fecha=?, lugar=?, observaciones=?`;

    let params = [nombre_evento, fecha, lugar, observaciones];

    if (req.file) {
        sql += ", imagen=?";
        params.push(req.file.filename);
    }

    sql += " WHERE id_evento=?";
    params.push(id_evento);

    connection.query(sql, params, err => {
        if (err) return res.send("Error");
        res.redirect('/eventos');
    });
});

module.exports = router;