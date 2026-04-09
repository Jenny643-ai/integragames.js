const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.post('/', (req, res) => {

    const usuario = req.session.usuario;

    // Obtener id_participante
    const sqlUser = `SELECT id_participante FROM participante WHERE nombre='${usuario}'`;

    connection.query(sqlUser, (err, resultUser) => {
        if (err) throw err;

        const user = resultUser[0];
        const id_participante = user.id_participante;

        // Datos
        const { calificacion, comentario, id_juego } = req.body;

        // Insertar
        const sql = `INSERT INTO satisfaccion 
        (calificacion, comentario, id_participante, id_juego)
        VALUES 
        ('${calificacion}','${comentario}','${id_participante}','${id_juego}')`;

        connection.query(sql, (err2) => {
            if (err2) {
                return res.send("Error: " + err2);
            }

            res.send(`
                <script>
                    alert('Gracias por tu opinión');
                    window.location.href='../menu';
                </script>
            `);
        });

    });

});

module.exports = router;