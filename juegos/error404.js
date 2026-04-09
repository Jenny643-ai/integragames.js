const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('../RegistroAdmin/login');
    }

    const rol = req.session.rol;

    // MISMO ARRAY
    const juego = {
        nombre: "'Error 404'",
        imagenes: [
            "../img/uno/uno.png",
            "../img/uno/uno.2.png",
            "../img/uno/uno.3.png",
            "../img/uno/uno.4.png"
        ],
        descripcion: [
            "Error 404 es un juego de cartas.",
            "Debes ganar cada partida.",
            "Pon a prueba tu lógica.",
            "Ideal para aprender jugando."
        ],
        link: "juego1.php"
    };

    let indicadores = '';
    let imagenesHTML = '';
    let descripcionHTML = '';

    juego.imagenes.forEach((img, index) => {
        indicadores += `
            <li data-target="#carouselJuego" data-slide-to="${index}"
            class="${index === 0 ? 'active' : ''}"></li>
        `;

        imagenesHTML += `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${img}" class="rounded"
                style="max-height: 100%; max-width: 100%; object-fit: contain;">
            </div>
        `;
    });

    juego.descripcion.forEach(linea => {
        descripcionHTML += `<p class="mb-2">${linea}</p>`;
    });

    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>

<link rel="icon" href="../img/logo.png" type="image/png">
<link href="../css/styles.css" rel="stylesheet">

</head>

<body id="page-top" class="sidebar-toggled">

<div class="container-fluid">

<div class="row justify-content-center">
<div class="col-lg-10">

<div class="card shadow p-4">

<h3 class="mb-3">${juego.nombre}</h3>

<div id="carouselJuego" class="carousel slide mb-4" data-ride="carousel">

<ol class="carousel-indicators">
${indicadores}
</ol>

<div class="carousel-inner">
${imagenesHTML}
</div>

<a class="carousel-control-prev" href="#carouselJuego" role="button" data-slide="prev">
<span class="carousel-control-prev-icon"></span>
</a>

<a class="carousel-control-next" href="#carouselJuego" role="button" data-slide="next">
<span class="carousel-control-next-icon"></span>
</a>

</div>

<div class="mb-4">
${descripcionHTML}
</div>

<div class="text-center">
<a href="${juego.link}" class="btn btn-primary px-5">
Jugar
</a>
</div>

</div>

</div>
</div>

</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/startbootstrap-sb-admin-2@4.1.4/js/sb-admin-2.min.js"></script>

</body>
</html>
    `);

});

module.exports = router;