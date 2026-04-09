const express = require('express');
const router = express.Router();
const connection = require('../config/conexion');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* =========================
   CONFIGURAR MULTER
========================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../img/eventos/');
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
        return res.redirect('../RegistroAdmin/login');
    }

    const rol = req.session.rol;

    const sql = "SELECT * FROM evento ORDER BY fecha DESC";

    connection.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.send("Error en BD");
        }

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
                                onclick="editarEvento(
                                '${row.id_evento}',
                                '${row.nombre_evento}',
                                '${row.fecha}',
                                '${row.lugar}',
                                '${row.observaciones}'
                            )">
                                ✏️
                            </button>

                            <button class="btn btn-danger btn-sm"
                                onclick="eliminarEvento('${row.id_evento}')">
                                🗑️
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

<h1>Eventos</h1>

<!-- CREAR -->
<form action="/eventos/crear" method="POST" enctype="multipart/form-data">
<input type="text" name="nombre_evento" placeholder="Nombre" required>
<input type="date" name="fecha" required>
<input type="text" name="lugar" placeholder="Lugar" required>
<textarea name="observaciones" placeholder="Observaciones"></textarea>
<input type="file" name="imagen">
<button>Guardar</button>
</form>

<hr>

<div class="row">
${eventosHTML}
</div>

</div>

<!-- FORM ELIMINAR -->
<form id="formEliminar" action="/eventos/eliminar" method="POST" style="display:none;">
<input type="hidden" name="id_evento" id="deleteIdEvento">
</form>

<!-- FORM EDITAR -->
<form id="formEditar" action="/eventos/editar" method="POST" enctype="multipart/form-data">
<input type="hidden" name="id_evento" id="editIdEvento">
<input type="text" name="nombre_evento" id="editNombre" placeholder="Nombre">
<input type="date" name="fecha" id="editFecha">
<input type="text" name="lugar" id="editLugar" placeholder="Lugar">
<textarea name="observaciones" id="editObservaciones"></textarea>
<input type="file" name="imagen">
<button type="submit">Guardar cambios</button>
</form>

<script>
function eliminarEvento(id) {
    document.getElementById('deleteIdEvento').value = id;
    document.getElementById('formEliminar').submit();
}

function editarEvento(id, nombre, fecha, lugar, observaciones) {
    document.getElementById('editIdEvento').value = id;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editFecha').value = fecha;
    document.getElementById('editLugar').value = lugar;
    document.getElementById('editObservaciones').value = observaciones;
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

    let imagenNombre = req.file ? req.file.filename : "";

    const sql = `
        INSERT INTO evento (nombre_evento, fecha, lugar, observaciones, imagen)
        VALUES ('${nombre_evento}','${fecha}','${lugar}','${observaciones}','${imagenNombre}')
    `;

    connection.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.send("Error al crear");
        }
        res.redirect('/eventos');
    });
});

/* ================= ELIMINAR ================= */
router.post('/eliminar', (req, res) => {

    const id = parseInt(req.body.id_evento);

    connection.query(`DELETE FROM evento WHERE id_evento='${id}'`, (err) => {
        if (err) {
            console.error(err);
            return res.send("Error al eliminar");
        }
        res.redirect('/eventos');
    });
});

/* ================= EDITAR ================= */
router.post('/editar', upload.single('imagen'), (req, res) => {

    const id = parseInt(req.body.id_evento);

    const { nombre_evento, fecha, lugar, observaciones } = req.body;

    let sql = `
        UPDATE evento SET 
        nombre_evento='${nombre_evento}',
        fecha='${fecha}',
        lugar='${lugar}',
        observaciones='${observaciones}'
    `;

    if (req.file) {
        sql += `, imagen='${req.file.filename}'`;
    }

    sql += ` WHERE id_evento='${id}'`;

    connection.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.send("Error al editar");
        }
        res.redirect('/eventos');
    });
});

module.exports = router;