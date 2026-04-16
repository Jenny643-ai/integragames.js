const express = require('express');
const router = express.Router();
const connection = require('../config/conexion');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

//  IMPORTANTE (ESTO FALTABA)
const barraSuperior = require('../menu/js/barraSuperior');

/* =========================
   CONFIGURAR MULTER
========================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img/eventos');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });

/* =========================
   RUTA PRINCIPAL
========================= */
router.get('/', async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('/RegistroAdmin/login.html');
    }

    // 🔥 BARRA SUPERIOR
    const barra = await barraSuperior(req);

    const sql = "SELECT * FROM evento ORDER BY fecha DESC";

    connection.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.send("Error en BD");
        }

        let eventosHTML = '';

        if (result.length > 0) {

            result.forEach(row => {

                let fechaObj = new Date(row.fecha);

                let fechaFormateada = fechaObj.toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });

                let imagenPath = path.join(__dirname, '../img/eventos/', row.imagen || '');

                let imagen = (row.imagen && fs.existsSync(imagenPath))
                    ? '/img/eventos/' + row.imagen
                    : '/img/default.png';

                eventosHTML += `
                <tr>
                    <td><img src="${imagen}" class="img-evento"></td>
                    <td>${row.nombre_evento}</td>
                    <td>${fechaFormateada}</td>
                    <td>${row.lugar}</td>
                    <td>
                        <button class="btn btn-primary btn-sm"
                            onclick="editarEvento(
                            '${row.id_evento}',
                            '${row.nombre_evento}',
                            '${row.fecha}',
                            '${row.lugar}',
                            '${row.observaciones}'
                        )">Editar</button>

                        <button class="btn btn-danger btn-sm"
                            onclick="eliminarEvento('${row.id_evento}')">Eliminar</button>
                    </td>
                </tr>
                `;
            });

        } else {
            eventosHTML = `<tr><td colspan="5" class="text-center">No hay eventos</td></tr>`;
        }

        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Eventos</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<style>
body { background:#f4f6f9; }

.container-box {
    background:white;
    padding:20px;
    border-radius:15px;
    box-shadow:0 5px 15px rgba(0,0,0,0.1);
}

.img-evento {
    width:60px;
    height:60px;
    object-fit:cover;
    border-radius:10px;
}
</style>
</head>

<body>

${barra}

<div class="container mt-4">
<div class="container-box">

<div class="d-flex justify-content-between mb-3">
    <h3>Gestión de Eventos</h3>
    <button class="btn btn-success" onclick="abrirModal()">+ Nuevo</button>
</div>

<div class="table-responsive">
<table class="table table-hover table-bordered">

<thead class="table-light">
<tr>
    <th>Imagen</th>
    <th>Nombre</th>
    <th>Fecha</th>
    <th>Lugar</th>
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

<!-- MODAL -->
<div class="modal fade" id="modalEvento">
<div class="modal-dialog">
<div class="modal-content">

<form id="formEvento" action="/eventos/crear" method="POST" enctype="multipart/form-data">

<div class="modal-header">
    <h5 class="modal-title">Evento</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
</div>

<div class="modal-body">

<input type="hidden" name="id_evento" id="id_evento">

<input type="text" name="nombre_evento" id="nombre" class="form-control mb-2" placeholder="Nombre" required>

<input type="date" name="fecha" id="fecha" class="form-control mb-2" required>

<input type="text" name="lugar" id="lugar" class="form-control mb-2" placeholder="Lugar" required>

<textarea name="observaciones" id="observaciones" class="form-control mb-2" placeholder="Observaciones"></textarea>

<input type="file" name="imagen" class="form-control">

</div>

<div class="modal-footer">
    <button class="btn btn-primary w-100">Guardar</button>
</div>

</form>

</div>
</div>
</div>

<form id="formEliminar" action="/eventos/eliminar" method="POST" style="display:none;">
<input type="hidden" name="id_evento" id="deleteIdEvento">
</form>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<script>
let modal = new bootstrap.Modal(document.getElementById('modalEvento'));

function abrirModal(){
    document.getElementById('formEvento').action = '/eventos/crear';
    document.getElementById('formEvento').reset();
    modal.show();
}

function editarEvento(id,nombre,fecha,lugar,obs){
    document.getElementById('formEvento').action = '/eventos/editar';
    document.getElementById('id_evento').value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('fecha').value = fecha;
    document.getElementById('lugar').value = lugar;
    document.getElementById('observaciones').value = obs;
    modal.show();
}

function eliminarEvento(id){
    document.getElementById('deleteIdEvento').value = id;
    document.getElementById('formEliminar').submit();
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