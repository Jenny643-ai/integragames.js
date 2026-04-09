const express = require('express');
const router = express.Router();
const connection = require('../config/conexion');

router.get('/perfil', (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    const usuarioActual = req.session.usuario;
    const rol = req.session.rol;

    const sql = "SELECT * FROM responsable WHERE nombre=?";

    connection.query(sql, [usuarioActual], (err, result) => {

        if (err) throw err;
        if (result.length === 0) {
            return res.send("Usuario no encontrado");
        }

        const user = result[0];

        let imagen = (!user.imagen)
            ? "/img/responsables/sinFoto.jpg"
            : "/img/responsables/" + user.imagen;

        res.render('perfil', {
            user,
            rol,
            imagen,
            session: req.session
        });

    });
});

module.exports = router;