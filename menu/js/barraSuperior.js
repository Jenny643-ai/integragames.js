const connection = require('../../config/conexion');

function barraSuperior(req) {

    let fotoUsuario = "/img/responsables/sinFoto.jpg";

    const rol = req.session.rol;
    const usuario = req.session.usuario;

    const esAdmin = (rol === "administrador");
    const esProgramador = (rol === "programador");
    const esPromotor = (rol === "promotor");

    return new Promise((resolve, reject) => {

        if (rol !== "participante") {

            const sqlImg = "SELECT imagen FROM responsable WHERE nombre=?";

            connection.query(sqlImg, [usuario], (err, result) => {

                if (err) {
                    console.error(err);
                }

                if (!err && result.length > 0) {
                    const img = result[0].imagen;

                    if (img) {
                        fotoUsuario = "/img/responsables/" + img;
                    }
                }

                resolve(renderHTML());
            });

        } else {
            resolve(renderHTML());
        }

    });

    function renderHTML() {
        return `
<nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

    <div class="d-flex align-items-center">

        <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-2">
            <i class="fa fa-bars"></i>
        </button>

        <img src="/img/logo.png" style="height:70px;">

    </div>

    <ul class="navbar-nav ml-auto">

        <li class="nav-item dropdown no-arrow mx-1">
            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                <i class="fas fa-bell fa-fw"></i>
                <span class="badge badge-danger badge-counter">3+</span>
            </a>
        </li>

        <li class="nav-item dropdown no-arrow mx-1">
            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                <i class="fas fa-envelope fa-fw"></i>
                <span class="badge badge-danger badge-counter">7</span>
            </a>
        </li>

        <div class="topbar-divider d-none d-sm-block"></div>

        <li class="nav-item dropdown no-arrow">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" data-toggle="dropdown">

                <span class="mr-2 d-none d-lg-inline text-gray-600 small">
                    ${usuario} - ${rol}
                </span>

                ${rol !== "participante" ? `
                    <img src="${fotoUsuario}"
                    style="width:45px; height:45px; border-radius:50%; object-fit:cover;">
                ` : `
                    <div style="
                        width:45px;
                        height:45px;
                        border-radius:50%;
                        background:#eaeaea;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                    ">
                        <i class="fas fa-user"></i>
                    </div>
                `}

            </a>

            ${(esAdmin || esProgramador || esPromotor) ? `
            <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in">

                <a class="dropdown-item" href="/perfil">
                    <i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                    Perfil
                </a>

                <a class="dropdown-item" href="/logout">
                    <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                    Cerrar sesión
                </a>

            </div>
            ` : ''}

        </li>

    </ul>

</nav>
`;
    }
}

module.exports = barraSuperior;