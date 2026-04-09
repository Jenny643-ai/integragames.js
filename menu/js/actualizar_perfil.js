const express = require('express');
const router = express.Router();
const connection = require('../../config/conexion');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'temp/' });

router.post('/', upload.single('imagen'), (req, res) => {

    // VALIDAR SESIÓN
    if (!req.session.usuario) {
        return res.redirect('../../RegistroAdmin/login');
    }

    const usuarioActual = req.session.usuario;

    // OBTENER USUARIO
    const sqlUser = "SELECT * FROM responsable WHERE nombre=?";
    connection.query(sqlUser, [usuarioActual], (err, result) => {

        if (err) return res.send("Error: " + err);

        const user = result[0];

        if (!user) {
            return res.send("Usuario no encontrado");
        }

        // CONSERVAR DATOS
        const nuevoNombre = req.body.nombre || user.nombre;
        const correo = req.body.correo || user.correo;
        const passwordNueva = req.body.password || null;
        const actual = req.body.actual || '';
        let imagenNombre = user.imagen;

        // VALIDAR CONTRASEÑA
        if (passwordNueva) {
            if (!(actual === user.contraseña)) {
                return res.send(`
                    <script>
                        alert('Contraseña incorrecta');
                        window.history.back();
                    </script>
                `);
            }
        }

        // SUBIR IMAGEN
        if (req.file) {

            const nombreArchivo = Date.now() + "_" + req.file.originalname;
            const rutaFinal = path.join(__dirname, "../../img/responsables/", nombreArchivo);

            fs.renameSync(req.file.path, rutaFinal);

            imagenNombre = nombreArchivo;
        }

        // UPDATE
        let sql = `
            UPDATE responsable SET 
            nombre=?,
            correo=?,
            imagen=?
        `;

        let params = [nuevoNombre, correo, imagenNombre];

        if (passwordNueva) {
            sql += ", contraseña=?";
            params.push(passwordNueva);
        }

        sql += " WHERE nombre=?";
        params.push(usuarioActual);

        connection.query(sql, params, (err2) => {

            if (err2) return res.send("Error: " + err2);

            req.session.usuario = nuevoNombre;

            return res.redirect('../perfil?ok=1');
        });

    });

});

module.exports = router;