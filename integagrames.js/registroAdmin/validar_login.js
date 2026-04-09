const express = require('express');
const router = express.Router();
const connection = require('../config/conexion'); // tu conexión MySQL

router.post('/validar_login', (req, res) => {

    const correo = req.body.correo.trim();
    const password = req.body.password.trim();

    /* BUSCAR EN RESPONSABLE */
    const sql = `
        SELECT * FROM responsable 
        WHERE correo = ? 
        AND contraseña = ?
    `;

    connection.query(sql, [correo, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.send("Error en servidor");
        }

        if (results.length > 0) {

            const datos = results[0];

            // SESIÓN
            req.session.usuario = datos.nombre;
            req.session.rol = datos.rol.toLowerCase();

            // 🔥 IMPORTANTE: TU MENÚ ES DINÁMICO
            return res.redirect('/menu');

        } else {

            // 🔥 RUTA CORRECTA DE TU LOGIN
            return res.redirect('/RegistroAdmin/login.html?error=1');

        }
    });

});

module.exports = router;