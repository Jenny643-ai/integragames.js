const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // 1. Verificación de sesión (Ruta absoluta para evitar errores)
  if (!req.session.usuario) {
    return res.redirect("/RegistroAdmin/login");
  }

  const rol = req.session.rol;

  // 2. Definición del objeto Juego
  // IMPORTANTE: Se quitaron los "../" para usar rutas raíz "/"
  const juego = {
    nombre: "Run Code",
    imagenes: [
      "/img/codeRun/runCode.2.png",
      "/img/codeRun/runCode.3.png",
      "/img/codeRun/runCode.png",
      "/img/codeRun/runCode.4.png",
    ],
    descripcion: [
      "El proyecto consiste en un videojuego de plataformas 2D desarrollado en Godot, en el cual el jugador controla un personaje que interactúa con distintos elementos del entorno, recolecta objetos y avanza a través de niveles. Esta versión incluye las bases del sistema jugable, como movimiento, interacción con objetos y control de la partida.",
    ],
    link: "/juegos/Code&Run/index.html",
  };

  // 3. Generación de HTML dinámico
  let indicadores = "";
  let imagenesHTML = "";
  let descripcionHTML = "";

  juego.imagenes.forEach((img, index) => {
    indicadores += `
            <li data-target="#carouselJuego" data-slide-to="${index}"
            class="${index === 0 ? "active" : ""}"></li>
        `;

    imagenesHTML += `
            <div class="carousel-item ${index === 0 ? "active" : ""}">
                <img src="${img}" class="rounded d-block w-100"
                style="height: 400px; object-fit: contain; background: #000;">
            </div>
        `;
  });

  juego.descripcion.forEach((linea) => {
    descripcionHTML += `<p class="mb-2 text-dark">${linea}</p>`;
  });

  // 4. Envío de la respuesta (res.send)
  // Se asegura de enviar el encabezado HTML correcto
  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IntegraGames - ${juego.nombre}</title>
    
    <link rel="icon" href="/img/logo.png" type="image/png">
    <link href="https://cdn.jsdelivr.net/npm/startbootstrap-sb-admin-2@4.1.4/css/sb-admin-2.min.css" rel="stylesheet">
    <link href="/css/styles.css" rel="stylesheet">
</head>

<body id="page-top" class="sidebar-toggled" style="background-color: #f8f9fc;">

<div class="container-fluid py-4">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="card shadow p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 class="m-0 font-weight-bold text-primary">${juego.nombre}</h3>
                    <a href="/" class="btn btn-sm btn-outline-secondary">Volver</a>
                </div>

                <div id="carouselJuego" class="carousel slide mb-4" data-ride="carousel">
                    <ol class="carousel-indicators">
                        ${indicadores}
                    </ol>
                    <div class="carousel-inner bg-dark rounded">
                        ${imagenesHTML}
                    </div>
                    <a class="carousel-control-prev" href="#carouselJuego" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </a>
                    <a class="carousel-control-next" href="#carouselJuego" role="button" data-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </a>
                </div>

                <div class="mb-4 bg-light p-3 rounded">
                    <h5 class="font-weight-bold">Acerca del juego:</h5>
                    ${descripcionHTML}
                </div>

                <div class="text-center">
                    <a href="${juego.link}" class="btn btn-primary btn-lg px-5 shadow">
                        <i class="fas fa-play mr-2"></i> Jugar Ahora
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js"></script>

</body>
</html>
    `);
});

module.exports = router;
