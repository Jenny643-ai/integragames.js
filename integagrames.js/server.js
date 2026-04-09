const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

/* CONEXIÓN DB */
const connection = require('./config/conexion');

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'integraGames',
    resave: false,
    saveUninitialized: true
}));

/* ARCHIVOS ESTÁTICOS */
app.use(express.static(__dirname));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   LOGIN
========================= */
app.post('/validar_login', (req, res) => {

    const correo = req.body.correo.trim();
    const password = req.body.password.trim();

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

            req.session.usuario = datos.nombre;
            req.session.rol = datos.rol;

            return res.redirect('/menu'); // ✅ CORRECTO

        } else {
            return res.redirect('/RegistroAdmin/login.html?error=1');
        }

    });

});

/* =========================
   LOGOUT
========================= */
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/RegistroAdmin/login.html');
    });
});

/* =========================
   PROTEGER RUTAS
========================= */
function verificarSesion(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/RegistroAdmin/login.html');
    }
    next();
}

/* =========================
   MENÚ (DINÁMICO)
========================= */

//  IMPORTAR TU MENÚ DINÁMICO
const menuRouter = require('./menu/menu');

//  USARLO AQUÍ
app.use('/menu', verificarSesion, menuRouter);

/* =========================
   EVENTOS
========================= */
app.get('/api/eventos', (req, res) => {

    const sql = "SELECT * FROM evento";

    connection.query(sql, (err, results) => {

        if (err) {
            console.error("Error eventos:", err);
            return res.status(500).json({ error: "Error en servidor" });
        }

        res.json(results);
    });

});

/* =========================
   ESCUELAS
========================= */
app.get('/api/escuelas', (req, res) => {

    const sql = "SELECT * FROM escuela";

    connection.query(sql, (err, results) => {

        if (err) {
            console.error("Error escuelas:", err);
            return res.status(500).json({ error: "Error en servidor" });
        }

        res.json(results);
    });

});

/* =========================
   REGISTRAR ALUMNO
========================= */
app.post('/guardar_alumno', (req, res) => {

    const { nombre, edad, id_evento, id_escuela } = req.body;

    if (!nombre || !edad || !id_evento || !id_escuela) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    const sql = `
        INSERT INTO participante (nombre, edad, id_evento, id_escuela)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(sql, [nombre, edad, id_evento, id_escuela], (err) => {

        if (err) {
            console.error("Error insertar:", err);
            return res.status(500).json({ error: "Error al guardar" });
        }

        res.json({
            mensaje: "Alumno registrado correctamente"
        });

    });

});

/* =========================
   ENCUESTA
========================= */
app.post('/guardar_encuesta', verificarSesion, (req, res) => {

    const usuario = req.session.usuario;

    const sqlUser = "SELECT id_participante FROM participante WHERE nombre=?";
    connection.query(sqlUser, [usuario], (err, resultUser) => {

        if (err || resultUser.length === 0) {
            return res.send("Usuario no encontrado");
        }

        const id_participante = resultUser[0].id_participante;

        const { calificacion, comentario, id_juego } = req.body;

        const sql = `
            INSERT INTO satisfaccion 
            (calificacion, comentario, id_participante, id_juego)
            VALUES (?, ?, ?, ?)
        `;

        connection.query(sql, [calificacion, comentario, id_participante, id_juego], (err) => {

            if (err) {
                console.error(err);
                return res.send("Error al guardar");
            }

            res.send(`
                <script>
                    alert('Gracias por tu opinión');
                    window.location.href='/menu';
                </script>
            `);

        });

    });

});

/* =========================
   SERVIDOR
========================= */
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});