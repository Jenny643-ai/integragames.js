const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'menu'));

/* =========================
   CONEXIÓN DB
========================= */
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

/* =========================
   ARCHIVOS ESTÁTICOS (IMPORTANTE)
========================= */
app.use(express.static(__dirname));

app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/vendor', express.static(path.join(__dirname, 'vendor')));

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

            return res.redirect('/menu');

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
   MENÚ
========================= */
const menuRouter = require('./menu/menu');
app.use('/menu', verificarSesion, menuRouter);

const perfilRouter = require('./menu/perfil');
app.use('/', verificarSesion, perfilRouter);


/* =========================
   EVENTOS 
========================= */
const eventosRouter = require('./cruds/eventos'); 
app.use('/eventos', verificarSesion, eventosRouter);

const encargadoEventoRouter = require('./cruds/encargadoEvento');
app.use('/encargadoEvento', verificarSesion, encargadoEventoRouter);

const listaRouter = require('./cruds/lista');
app.use('/lista', verificarSesion, listaRouter);

const personalRouter = require('./cruds/personal');
app.use('/personal', verificarSesion, personalRouter);

/* =========================
   API EVENTOS
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
   VISTA ESCUELAS
========================= */
app.get('/escuelas', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, 'registroEscuela/escuelas.html'));
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
   CREAR ESCUELA
========================= */
app.post('/api/escuelas', (req, res) => {

    const { nombre, direccion, telefono } = req.body;

    const sql = `
        INSERT INTO escuela (nombre_escuela, direccion, telefono)
        VALUES (?, ?, ?)
    `;

    connection.query(sql, [nombre, direccion, telefono], (err) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error al crear escuela" });
        }

        res.json({ mensaje: "Escuela creada correctamente" });
    });

});

/* =========================
   EDITAR ESCUELA
========================= */
app.put('/api/escuelas/:id', (req, res) => {

    const id = req.params.id;
    const { nombre, direccion, telefono } = req.body;

    const sql = `
        UPDATE escuela
        SET nombre_escuela = ?, direccion = ?, telefono = ?
        WHERE id_escuela = ?
    `;

    connection.query(sql, [nombre, direccion, telefono, id], (err) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error al actualizar escuela" });
        }

        res.json({ mensaje: "Escuela actualizada correctamente" });
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