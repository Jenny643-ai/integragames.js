const express = require('express');
const router = express.Router();
const connection = require('../config/conexion');
const multer = require('multer');

const encabezado = require('./js/encabezado');
const menuLateral = require('./js/menuLateral');
const barraSuperior = require('./js/barraSuperior');


// ================= MULTER =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img/responsables/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });


// ================= VER PERFIL =================
router.get('/perfil', async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('/RegistroAdmin/login.html');
    }

    const usuarioActual = req.session.usuario;
    const rol = req.session.rol;

    const sql = "SELECT * FROM responsable WHERE nombre=?";

    connection.query(sql, [usuarioActual], async (err, result) => {

        if (err) throw err;

        if (result.length === 0) {
            return res.send("Usuario no encontrado");
        }

        const user = result[0];

        const imagen = user.imagen
            ? '/img/responsables/' + user.imagen
            : '/img/responsables/sinFoto.jpg';

        const encabezadoHTML = encabezado();
        const menuLateralHTML = menuLateral(req);
        const barraSuperiorHTML = await barraSuperior(req);

        res.render('perfil', {
            user,
            rol,
            imagen,
            encabezadoHTML,
            menuLateralHTML,
            barraSuperiorHTML
        });

    });

});


// ================= ACTUALIZAR PERFIL =================
router.post('/perfil/actualizar', upload.single('imagen'), (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('/RegistroAdmin/login.html');
    }

    const usuarioActual = req.session.usuario;

    const { nombre, contrasena } = req.body;

    const sqlBuscar = "SELECT imagen FROM responsable WHERE nombre=?";

    connection.query(sqlBuscar, [usuarioActual], (err, result) => {

        if (err) throw err;

        let imagenNombre = result[0].imagen;

        if (req.file) {
            imagenNombre = req.file.filename;
        }

        const sqlUpdate = `
            UPDATE responsable
            SET nombre=?,
                contraseña=?,
                imagen=?
            WHERE nombre=?
        `;

        connection.query(
            sqlUpdate,
            [nombre, contrasena, imagenNombre, usuarioActual],
            (err2) => {

                if (err2) throw err2;

                req.session.usuario = nombre;

                res.redirect('/perfil');
            }
        );

    });

});

module.exports = router;