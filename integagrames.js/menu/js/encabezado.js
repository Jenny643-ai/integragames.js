function encabezado() {
    return `
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<meta name="description" content="Sistema IntegraGames - Gestión de alumnos y eventos">
<meta name="author" content="Equipo IntegraGames">

<title>Panel Principal | IntegraGames</title>

<link href="../vendor/fontawesome-free/css/all.min.css" rel="stylesheet">
<link href="../css/sb-admin-2.min.css" rel="stylesheet">

<link href="https://fonts.googleapis.com/css?family=Nunito:200,300,400,600,700,800,900" rel="stylesheet">

<style>

.sidebar-brand{
    font-size:20px;
    font-weight:bold;
    letter-spacing:1px;
}

.sidebar .nav-link i{
    font-size:16px;
    margin-right:8px;
}

.sidebar .nav-link:hover{
    background:rgba(255,255,255,0.1);
    border-radius:8px;
}

.sidebar .nav-link span{
    font-weight:500;
}

.sidebar-divider{
    border-top:1px solid rgba(255,255,255,0.2);
}

.sidebar-heading{
    font-size:12px;
    letter-spacing:1px;
    opacity:0.7;
}

</style>
`;
}

module.exports = encabezado;