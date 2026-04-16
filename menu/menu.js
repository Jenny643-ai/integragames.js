const express = require("express");
const router = express.Router();
const connection = require("../config/conexion");

const menuLateral = require("./js/menuLateral");
const barraSuperior = require("./js/barraSuperior");
const encabezado = require("./js/encabezado");
const piePagina = require("./js/piePagina");
const logoutModal = require("./js/logoutModal");

router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/RegistroAdmin/login.html");
  }

  const rol = req.session.rol;

  const rolesPermitidos = ["administrador", "programador", "promotor"];

  let tarjetasHTML = "";

  // ================= EVENTOS PARA STAFF =================
  if (rolesPermitidos.includes(rol.toLowerCase())) {
    const hoy = new Date().toISOString().split("T")[0];

    const sql = `
            SELECT nombre_evento, imagen, observaciones, fecha
            FROM evento
            WHERE fecha >= ?
            ORDER BY fecha ASC
        `;

    const eventos = await new Promise((resolve) => {
      connection.query(sql, [hoy], (err, result) => {
        if (err) return resolve([]);
        resolve(result);
      });
    });

    if (eventos.length > 0) {
      eventos.forEach((evento) => {
        tarjetasHTML += `
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card shadow h-100">

                        <img src="/img/eventos/${evento.imagen}" class="card-img-top img-uniforme">

                        <div class="card-body d-flex flex-column">
                            <h6 class="font-weight-bold">${evento.nombre_evento}</h6>
                            <p class="text-muted small">${evento.observaciones}</p>
                        </div>

                    </div>
                </div>
                `;
      });
    } else {
      tarjetasHTML = `
            <div class="col-12 text-center">
                <p>No hay eventos programados.</p>
            </div>
            `;
    }
  } else {
    // ================= PARTICIPANTE =================
    const juegosInfo = [
      {
        nombre: "Tecnología de la información",
        imagen: "/img/utm2.png",
        descripcion: "Carrera con muchas oportunidades laborales.",
      },
      {
        nombre: "Por qué estudiar en la UTM",
        imagen: "/img/imagen3.jpeg",
        descripcion: "Educación de calidad y profesores capacitados.",
      },
      {
        nombre: "¿Te gustan los videojuegos?",
        imagen: "/img/imagen3.jpeg",
        descripcion: "Aprende a crear tus propios videojuegos.",
      },
      {
        nombre: "Día de San Valentín",
        imagen: "/img/imagen4.jpeg",
        descripcion: "Descripción del evento.",
      },
    ];

    juegosInfo.forEach((juego) => {
      tarjetasHTML += `
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="card shadow h-100">

                    <img src="${juego.imagen}" class="card-img-top img-uniforme">

                    <div class="card-body d-flex flex-column">
                        <h6 class="font-weight-bold">${juego.nombre}</h6>
                        <p class="text-muted small">${juego.descripcion}</p>
                    </div>

                </div>
            </div>
            `;
    });
  }

  // ================= LISTA DE JUEGOS =================
  const juegos = [
    {
      nombre: "Error 404",
      imagen: "/img/uno/uno.png",
      descripcion: "Juego de cartas competitivo.",
      link: "/juegos/Error404/index.html", // QUITAMOS EL .js
    },
    {
      nombre: "Code Run",
      imagen: "/img/codeRun/runCode.png",
      descripcion: "Evita enemigos y supera niveles.",
      link: "/juegos/Code&Run/index.html", // QUITAMOS EL .js
    },
    {
      nombre: "DesafioTech",
      imagen: "/img/juego3.jpg",
      descripcion: "Reglas básicas del juego.",
      link: "/juegos/DesafioTech/index.html", // QUITAMOS EL .js
    },
  ];

  let juegosHTML = "";

  juegos.forEach((juego) => {
    juegosHTML += `
        <div class="col-12 mb-4">
            <div class="card shadow">
                <div class="card-body">

                    <div class="row align-items-center">

                        <div class="col-md-4">
                            <img src="${juego.imagen}" class="img-fluid rounded img-uniforme">
                        </div>

                        <div class="col-md-6">
                            <h5>${juego.nombre}</h5>
                            <p class="text-muted">${juego.descripcion}</p>
                        </div>

                        <div class="col-md-2 text-center">
                            <a href="${juego.link}" class="btn btn-primary btn-sm">
                                Ver más
                            </a>
                        </div>

                    </div>

                </div>
            </div>
        </div>
        `;
  });

  const topbar = await barraSuperior(req);

  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
${encabezado()}
<link rel="icon" href="/img/logo.png" type="image/png">
<link href="/css/styles.css" rel="stylesheet">
</head>

<body id="page-top" class="sidebar-toggled">

<div id="wrapper">

${menuLateral(rol)}

<div id="content-wrapper" class="d-flex flex-column">
<div id="content">

${topbar}

<div class="container-fluid">

<div class="row mb-4">
<div class="col-12">
<div class="card shadow">
<div class="card-body text-center">
<h4 class="font-weight-bold">IntegraGames</h4>
<p class="mb-0">
Plataforma interactiva para la promoción de TI con contenido educativo y entretenido.
</p>
</div>
</div>
</div>
</div>

<div class="row">
${tarjetasHTML}
</div>

<div class="row mt-4">

<div class="col-12">
<h4 class="mb-4">Juegos</h4>
</div>

${juegosHTML}

</div>

</div>

</div>

${piePagina()}

</div>
</div>

<a class="scroll-to-top rounded" href="#page-top">
<i class="fas fa-angle-up"></i>
</a>

${logoutModal()}

<script src="/vendor/jquery/jquery.min.js"></script>
<script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="/vendor/jquery-easing/jquery.easing.min.js"></script>
<script src="/js/sb-admin-2.min.js"></script>

</body>
</html>
    `);
});

module.exports = router;
