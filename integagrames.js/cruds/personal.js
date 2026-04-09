const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const multer = require('multer');
const fs = require('fs');

// CONFIGURAR MULTER
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../img/responsables/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });

// ================= VISTA =================
router.get('/', (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('../RegistroAdmin/login');
    }

    const rol = req.session.rol;

    const sql = "SELECT * FROM responsable";

    connection.query(sql, (err, result) => {
        if (err) throw err;

        let html = '';

        result.forEach(row => {

            let imagen = (row.imagen && fs.existsSync("../img/responsables/" + row.imagen))
                ? "../img/responsables/" + row.imagen
                : "../img/responsables/sinFoto.jpg";

            html += `
            <div class="col-12 mb-3">
                <div class="card shadow-sm p-3 d-flex flex-row justify-content-between align-items-center" style="border-radius:15px;">

                    <div class="d-flex align-items-center">

                        <img src="${imagen}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; margin-right:15px;">

                        <div>
                            <h6 class="mb-1">${row.nombre}</h6>
                            <small class="text-muted">
                                <h7>Correo: "${row.correo}"</h7><br>
                                <h7>Contraseña: "${row.contraseña}"</h7><br>
                                <h7>Rol: "${row.rol}"</h7>
                            </small>
                        </div>

                    </div>

                    <div>

                        <button class="btn btn-info btn-sm"
                            data-toggle="modal"
                            data-target="#modalEditar"
                            onclick="editarRegistro(
                                '${row.id_responsable}',
                                '${row.nombre}',
                                '${row.correo}',
                                '${row.contraseña}',
                                '${row.rol}',
                                '${imagen}'
                            )">
                            <i class="fas fa-edit"></i>
                        </button>

                        <button class="btn btn-danger btn-sm"
                            data-toggle="modal"
                            data-target="#modalEliminar"
                            onclick="borraRegistro('${row.id_responsable}','${row.nombre}')">
                            <i class="fas fa-trash"></i>
                        </button>

                    </div>

                </div>
            </div>
            `;
        });

        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<link rel="icon" href="../img/logo.png">
<link href="../css/styles.css" rel="stylesheet">
</head>

<body>

<div class="container-fluid">
<h1>Panel de personal</h1>

<div class="card shadow mb-4">
<div class="card-header">
<button class="btn btn-success" data-toggle="modal" data-target="#modalCrear">
Nuevo empleado
</button>
</div>

<div class="card-body">
<div class="row">
${html}
</div>
</div>
</div>
</div>

<script>
function editarRegistro(id, nombre, correo, contrasena, rol, imagen) {
    document.getElementById('editId').value = id;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editCorreo').value = correo;
    document.getElementById('editContrasena').value = contrasena;
    document.getElementById('editRol').value = rol;
    document.getElementById('previewImagen').src = imagen;
}

function borraRegistro(id, nombre) {
    document.getElementById('deleteIdusuario').value = id;
    document.getElementById('nombreEmpleado').innerText = nombre;
}

function togglePassword(id, icono) {
    let input = document.getElementById(id);
    let icon = icono.querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}
</script>

</body>
</html>
        `);
    });
});

// ================= CREAR =================
router.post('/crear', (req, res) => {

    const { nombre, correo, contrasena, rol } = req.body;

    const imagenNombre = "sinFoto.jpg";

    const sql = `INSERT INTO responsable(nombre, correo, contraseña, rol, imagen)
    VALUES('${nombre}','${correo}','${contrasena}','${rol}','${imagenNombre}')`;

    connection.query(sql, (err) => {
        if (err) throw err;
        res.redirect('/personal');
    });
});

// ================= EDITAR =================
router.post('/editar', upload.single('imagen'), (req, res) => {

    const { id, nombre, correo, contrasena, rol } = req.body;

    connection.query(`SELECT imagen FROM responsable WHERE id_responsable='${id}'`, (err, result) => {

        if (err) throw err;

        let imagenNombre = result.length > 0 ? result[0].imagen : "";

        if (req.file) {
            imagenNombre = req.file.filename;
        }

        const sql = `UPDATE responsable SET 
            nombre='${nombre}', 
            correo='${correo}', 
            contraseña='${contrasena}', 
            rol='${rol}',
            imagen='${imagenNombre}'
            WHERE id_responsable='${id}'`;

        connection.query(sql, (err2) => {
            if (err2) throw err2;
            res.redirect('/personal');
        });

    });
});

// ================= ELIMINAR =================
router.post('/eliminar', (req, res) => {

    const id = req.body.id_responsable;

    const sql = `DELETE FROM responsable WHERE id_responsable='${id}'`;

    connection.query(sql, (err) => {
        if (err) throw err;
        res.redirect('/personal');
    });
});

module.exports = router;