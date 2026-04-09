const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// CONFIGURAR MULTER (equivalente a $_FILES)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../img/eventos/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });

// RUTA PRINCIPAL
router.get('/', (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('../RegistroAdmin/login');
    }

    const rol = req.session.rol;

    const sql = "SELECT * FROM evento ORDER BY fecha DESC";

    connection.query(sql, (err, result) => {
        if (err) throw err;

        let eventosHTML = '';

        if (result.length > 0) {

            result.forEach(row => {

                let imagen = (row.imagen && fs.existsSync("../img/eventos/" + row.imagen))
                    ? "../img/eventos/" + row.imagen
                    : "../img/default.png";

                eventosHTML += `
                <div class="col-12 mb-3">
                    <div class="card shadow-sm p-3 d-flex flex-row justify-content-between align-items-center" style="border-radius:15px;">

                        <div class="d-flex align-items-center">
                            <img src="${imagen}" class="img-evento">

                            <div>
                                <h6 class="mb-1">${row.nombre_evento}</h6>

                                <small class="text-muted">
                                    Fecha: ${row.fecha}<br>
                                    Lugar: ${row.lugar}<br>
                                    Observaciones: ${row.observaciones}
                                </small>
                            </div>
                        </div>

                        <div>
                            <button class="btn btn-info btn-sm"
                                data-toggle="modal"
                                data-target="#modalEditar"
                                onclick="editarEvento(
                                '${row.id_evento}',
                                '${row.nombre_evento}',
                                '${row.fecha}',
                                '${row.lugar}',
                                '${row.observaciones}',
                                '${imagen}'
                            )">
                                <i class="fas fa-edit"></i>
                            </button>

                            <button class="btn btn-danger btn-sm"
                                data-toggle="modal"
                                data-target="#modalEliminar"
                                onclick="eliminarEvento('${row.id_evento}','${row.nombre_evento}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>

                    </div>
                </div>
                `;
            });

        } else {
            eventosHTML = "<p class='text-center'>No hay eventos registrados</p>";
        }

        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<link rel="icon" href="../img/logo.png">
<link href="../css/styles.css" rel="stylesheet">

<style>
.img-evento {
    width: 220px;
    height: 270px;
    object-fit: cover;
    border-radius: 15px;
    margin-right: 15px;
}
</style>
</head>

<body id="page-top">

<div class="container-fluid">

<div class="d-sm-flex align-items-center justify-content-between mb-4">
<h1 class="h3 text-gray-800">Eventos</h1>

<button class="btn btn-success" data-toggle="modal" data-target="#modalCrear">
<i class="fas fa-plus"></i> Nuevo Evento
</button>
</div>

<div class="card shadow mb-4">
<div class="card-body">
<div class="row">
${eventosHTML}
</div>
</div>
</div>

</div>

<!-- MODAL CREAR -->
<form action="/eventos/crear" method="POST" enctype="multipart/form-data">
<input type="text" name="nombre_evento" required>
<input type="date" name="fecha" required>
<input type="text" name="lugar" required>
<textarea name="observaciones"></textarea>
<input type="file" name="imagen">
<button name="crear">Guardar</button>
</form>

<script>
function eliminarEvento(id, nombre) {
    document.getElementById('deleteIdEvento').value = id;
    document.getElementById('nombreEvento').innerText = nombre;
}

function editarEvento(id, nombre, fecha, lugar, observaciones, imagen) {
    document.getElementById('editIdEvento').value = id;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editFecha').value = fecha;
    document.getElementById('editLugar').value = lugar;
    document.getElementById('editObservaciones').value = observaciones;
    document.getElementById('previewImagen').src = imagen;
}
</script>

</body>
</html>
        `);
    });
});

// ================= CREAR =================
router.post('/crear', upload.single('imagen'), (req, res) => {

    const { nombre_evento, fecha, lugar, observaciones } = req.body;

    let imagenNombre = "";

    if (req.file) {
        imagenNombre = req.file.filename;
    }

    const sql = `INSERT INTO evento (nombre_evento, fecha, lugar, observaciones, imagen)
    VALUES ('${nombre_evento}','${fecha}','${lugar}','${observaciones}','${imagenNombre}')`;

    connection.query(sql, (err) => {
        if (err) throw err;
        res.redirect('/eventos');
    });
});

// ================= ELIMINAR =================
router.post('/eliminar', (req, res) => {

    const id = parseInt(req.body.id_evento);

    connection.query(`DELETE FROM evento WHERE id_evento='${id}'`, (err) => {
        if (err) throw err;
        res.redirect('/eventos');
    });
});

// ================= EDITAR =================
router.post('/editar', upload.single('imagen'), (req, res) => {

    const id = parseInt(req.body.id_evento);

    if (id <= 0) {
        return res.send("Error: ID inválido");
    }

    const { nombre_evento, fecha, lugar, observaciones } = req.body;

    connection.query(`SELECT imagen FROM evento WHERE id_evento='${id}'`, (err, result) => {

        if (err) throw err;

        let imagenNombre = result.length > 0 ? result[0].imagen : "";

        if (req.file) {
            imagenNombre = req.file.filename;
        }

        const sql = `UPDATE evento SET 
            nombre_evento='${nombre_evento}',
            fecha='${fecha}',
            lugar='${lugar}',
            observaciones='${observaciones}',
            imagen='${imagenNombre}'
            WHERE id_evento='${id}'`;

        connection.query(sql, (err2) => {
            if (err2) throw err2;
            res.redirect('/eventos');
        });

    });
});

module.exports = router;