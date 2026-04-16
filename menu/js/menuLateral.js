function menuLateral(rol) {

    const esAdmin = (rol === "administrador");
    const esProgramador = (rol === "programador");
    const esPromotor = (rol === "promotor");
    const esAlumno = (rol === "alumno");

    // Permisos (solo para no alumnos)
    const verPersonal = esAdmin || esProgramador || esPromotor;
    const verEscuelas = esAdmin || esProgramador || esPromotor;
    const verHistorial = esAdmin || esProgramador || esPromotor;
    const verEventos = esAdmin || esProgramador || esPromotor;

    return `
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">

<ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

<!-- LOGO -->
<a class="sidebar-brand d-flex align-items-center justify-content-center" href="/menu">
    <div class="sidebar-brand-icon">
        <i class="fas fa-gamepad"></i>
    </div>
    <div class="sidebar-brand-text mx-2">IntegraGames</div>
</a>

<hr class="sidebar-divider my-0">

<!-- INICIO (TODOS) -->
<li class="nav-item active">
    <a class="nav-link" href="/menu">
        <i class="fas fa-home"></i>
        <span>Inicio</span>
    </a>
</li>

<!-- ADMINISTRACIÓN (NO ALUMNOS) -->
${!esAlumno ? `

<hr class="sidebar-divider">

<div class="sidebar-heading">
Administración
</div>

${verPersonal ? `
<li class="nav-item">
    <a class="nav-link" href="/personal">
        <i class="fas fa-user"></i>
        <span>Personal</span>
    </a>
</li>
` : ''}

${verEventos ? `
<li class="nav-item">
    <a class="nav-link" href="/eventos">
        <i class="fas fa-calendar-alt"></i>
        <span>Eventos</span>
    </a>
</li>
` : ''}

${verEscuelas ? `
<li class="nav-item">
    <a class="nav-link" href="/escuelas">
        <i class="fas fa-school"></i>
        <span>Escuelas</span>
    </a>
</li>
` : ''}

${verHistorial ? `
<li class="nav-item">
    <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseUsuarios">
        <i class="fas fa-users"></i>
        <span>Historial</span>
    </a>

    <div id="collapseUsuarios" class="collapse">
        <div class="bg-white py-2 collapse-inner rounded">
            <h6 class="collapse-header">Historial:</h6>

            <a class="collapse-item" href="/encargadoEvento">
                <i class="fas fa-user-tie"></i> Eventos
            </a>

            <a class="collapse-item" href="/lista">
                <i class="fas fa-users"></i> Participantes
            </a>
        </div>
    </div>
</li>
` : ''}

` : ''}

<hr class="sidebar-divider">

<div class="sidebar-heading">
Información
</div>

<li class="nav-item">
    <a class="nav-link" href="https://share.google/2xNdfPbTZln7FfE9E">
        <i class="fas fa-university"></i>
        <span>UTM</span>
    </a>
</li>

<hr class="sidebar-divider">

<div class="sidebar-heading">
Contacto
</div>

<li class="nav-item">
    <a class="nav-link" href="https://www.facebook.com/share/1CTdx2LSvG/">
        <i class="fab fa-facebook"></i>
        <span>Facebook</span>
    </a>
</li>

<li class="nav-item">
    <a class="nav-link" href="https://www.instagram.com/utmmorelia">
        <i class="fab fa-instagram"></i>
        <span>Instagram</span>
    </a>
</li>

<li class="nav-item">
    <a class="nav-link" href="https://www.tiktok.com/@utmorelia">
        <i class="fab fa-tiktok"></i>
        <span>TikTok</span>
    </a>
</li>

<hr class="sidebar-divider">

<div class="sidebar-heading">
Sesión
</div>

<li class="nav-item">
    <a class="nav-link" href="/logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Salir</span>
    </a>
</li>

<hr class="sidebar-divider d-none d-md-block">

<div class="text-center d-none d-md-inline">
    <button class="rounded-circle border-0" id="sidebarToggle"></button>
</div>

</ul>
`;
}

module.exports = menuLateral;