const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Configurar sesiones
app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: true
}));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta del panel
app.get('/panel', (req, res) => {

    // Validar sesión (equivalente a PHP)
    if (!req.session.id_responsable) {
        return res.redirect('/login.html');
    }

    // Mostrar mensaje si viene ?ok
    const ok = req.query.ok;

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Panel IntegraGames</title>

        <link href="/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link href="/css/sb-admin-2.min.css" rel="stylesheet">
        <link href="/vendor/fontawesome-free/css/all.min.css" rel="stylesheet">
    </head>

    <body id="page-top">

    <div id="wrapper">

        <!-- MENU LATERAL -->
        ${getMenuLateral()}

        <div id="content-wrapper" class="d-flex flex-column">

            <div id="content">

                <!-- BARRA SUPERIOR -->
                ${getBarraSuperior()}

                <div class="container-fluid">

                    ${ok ? `
                        <div class="alert alert-success text-center">
                            <i class="fa-solid fa-circle-check"></i>
                            Entraste correctamente al sistema
                        </div>
                    ` : ''}

                    <h1 class="h3 mb-4 text-gray-800">Panel IntegraGames</h1>

                    <p>Bienvenido <b>${req.session.nombre}</b></p>

                    <a href="/index.html" class="btn btn-secondary btn-sm">
                        Volver al inicio
                    </a>

                </div>

            </div>

        </div>

    </div>

    <script src="/vendor/jquery/jquery.min.js"></script>
    <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="/vendor/jquery-easing/jquery.easing.min.js"></script>
    <script src="/js/sb-admin-2.min.js"></script>

    </body>
    </html>
    `);
});

// Simulación de includes (menu y barra)
function getMenuLateral() {
    return `<div>MENÚ LATERAL (Aquí pones tu HTML del menú)</div>`;
}

function getBarraSuperior() {
    return `<div>BARRA SUPERIOR (Aquí pones tu HTML de la barra)</div>`;
}

// Servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});