const express = require("express");
const router = express.Router();
const connection = require("../config/conexion.js");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const encabezado = require('../menu/js/encabezado');
const menuLateral = require('../menu/js/menuLateral');
const barraSuperior = require('../menu/js/barraSuperior');
const piePagina = require('../menu/js/piePagina');
const logoutModal = require('../menu/js/logoutModal');

// ================= CONFIGURAR MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./img/responsables/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// ================= VISTA =================
router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/RegistroAdmin/login.html");
  }

  const rol = req.session.rol;
  const topbar = await barraSuperior(req); 

  const sql = "SELECT * FROM responsable";
  connection.query(sql, (err, result) => {
    if (err) throw err;

    let html = "";
    result.forEach((row) => {
      // Lógica original para renderizar los empleados
      const rutaImagen = path.join(
        __dirname,
        "../img/responsables/",
        row.imagen || "",
      );
      const imagen =
        row.imagen && fs.existsSync(rutaImagen)
          ? "/img/responsables/" + row.imagen
          : "/img/responsables/sinFoto.jpg";

      html += `
            <div class="col-12 mb-3">
                <div class="card shadow-sm p-3 d-flex flex-row justify-content-between align-items-center" style="border-radius:15px;">
                    <div class="d-flex align-items-center">
                        <img src="${imagen}" style="width:60px; height:60px; object-fit:cover; border-radius: 50%; margin-right:15px;">
                        <div>
                            <h6 class="mb-1">${row.nombre}</h6>
                            <small class="text-muted">
                                Correo: ${row.correo}<br>
                                Contraseña: ${row.contraseña}<br>
                                Rol: ${row.rol}
                            </small>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-info btn-sm"
                            data-toggle="modal"
                            data-target="#modalEditar"
                            onclick="editarRegistro('${row.id_responsable}', '${row.nombre}', '${row.correo}', '${row.contraseña}', '${row.rol}', '${imagen}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm"
                            data-toggle="modal"
                            data-target="#modalEliminar"
                            onclick="borraRegistro('${row.id_responsable}','${row.nombre}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
    });

    // Enviamos la respuesta con la estructura del menú y los modales incluidos
    res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                ${encabezado()}
                <link rel="icon" href="/img/logo.png">
                <link href="/css/styles.css" rel="stylesheet">
            </head>
            <body id="page-top" class="sidebar-toggled">
                <div id="wrapper">
                    ${menuLateral(rol)} 
                    <div id="content-wrapper" class="d-flex flex-column">
                        <div id="content">
                            ${topbar}
                            <div class="container-fluid mt-4">
                                <h1>Panel de personal</h1>
                                <div class="card shadow mb-4">
                                    <div class="card-header">
                                        <button class="btn btn-success" data-toggle="modal" data-target="#modalCrear">
                                            Nuevo empleado
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            ${html}
                                        </div>
                                    </div>
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
                
                <div class="modal fade" id="modalCrear">
                    <div class="modal-dialog">
                        <div class="modal-content p-3">
                            <form action="/personal/crear" method="POST" enctype="multipart/form-data">
                                <input type="text" name="nombre" class="form-control mb-2" placeholder="Nombre" required>
                                <input type="email" name="correo" class="form-control mb-2" placeholder="Correo" required>
                                <input type="text" name="contrasena" class="form-control mb-2" placeholder="Contraseña" required>
                                <select name="rol" class="form-control mb-2" required>
                                    <option value="">Seleccione rol</option>
                                    <option value="administrador">Administrador</option>
                                    <option value="programador">Programador</option>
                                    <option value="promotor">Promotor</option>
                                </select>
                                <input type="file" name="imagen" class="form-control mb-2">
                                <button class="btn btn-success">Guardar</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="modal fade" id="modalEditar">
                    <div class="modal-dialog">
                        <div class="modal-content p-3">
                            <form action="/personal/editar" method="POST" enctype="multipart/form-data">
                                <input type="hidden" id="editId" name="id">
                                <input type="text" id="editNombre" name="nombre" class="form-control mb-2" required>
                                <input type="email" id="editCorreo" name="correo" class="form-control mb-2" required>
                                <input type="text" id="editContrasena" name="contrasena" class="form-control mb-2" required>
                                <select id="editRol" name="rol" class="form-control mb-2" required>
                                    <option value="administrador">Administrador</option>
                                    <option value="programador">Programador</option>
                                    <option value="promotor">Promotor</option>
                                </select>
                                <img id="previewImagen" width="100" class="mb-2 rounded">
                                <input type="file" name="imagen" class="form-control mb-2">
                                <button class="btn btn-primary">Guardar cambios</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="modal fade" id="modalEliminar">
                    <div class="modal-dialog">
                        <div class="modal-content p-3">
                            <form action="/personal/eliminar" method="POST">
                                <input type="hidden" id="deleteIdusuario" name="id_responsable">
                                <p>¿Eliminar a <strong id="nombreEmpleado"></strong>?</p>
                                <button class="btn btn-danger">Eliminar</button>
                            </form>
                        </div>
                    </div>
                </div>

                <script src="/vendor/jquery/jquery.min.js"></script>
                <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
                <script src="/vendor/jquery-easing/jquery.easing.min.js"></script>
                <script src="/js/sb-admin-2.min.js"></script>
                
                <script>
                    function editarRegistro(id, nombre, correo, contrasena, rol, imagen) {
                        document.getElementById('editId').value = id;
                        document.getElementById('editNombre').value = nombre;
                        document.getElementById('editCorreo').value = correo;
                        document.getElementById('editContrasena').value = contrasena;
                        document.getElementById('editRol').value = rol;
                        document.getElementById('previewImagen').src = imagen;
                    }
                    function borraRegistro(id, nombre) {
                        document.getElementById('deleteIdusuario').value = id;
                        document.getElementById('nombreEmpleado').innerText = nombre;
                    }
                </script>
            </body>
            </html>
        `);
  });
});

// ================= CREAR =================
router.post("/crear", upload.single("imagen"), (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  const imagenNombre = req.file ? req.file.filename : "sinFoto.jpg";

  const sql = `
        INSERT INTO responsable(nombre, correo, contraseña, rol, imagen)
        VALUES (?, ?, ?, ?, ?)
    `;

  connection.query(
    sql,
    [nombre, correo, contrasena, rol, imagenNombre],
    (err) => {
      if (err) throw err;
      res.redirect("/personal");
    },
  );
});

// ================= EDITAR =================
router.post("/editar", upload.single("imagen"), (req, res) => {
  const { id, nombre, correo, contrasena, rol } = req.body;

  connection.query(
    "SELECT imagen FROM responsable WHERE id_responsable = ?",
    [id],
    (err, result) => {
      if (err) throw err;

      let imagenNombre = result.length > 0 ? result[0].imagen : "sinFoto.jpg";

      if (req.file) {
        imagenNombre = req.file.filename;
      }

      const sql = `
                UPDATE responsable SET
                    nombre = ?,
                    correo = ?,
                    contraseña = ?,
                    rol = ?,
                    imagen = ?
                WHERE id_responsable = ?
            `;

      connection.query(
        sql,
        [nombre, correo, contrasena, rol, imagenNombre, id],
        (err2) => {
          if (err2) throw err2;
          res.redirect("/personal");
        },
      );
    },
  );
});

// ================= ELIMINAR =================
router.post("/eliminar", (req, res) => {
  const id = req.body.id_responsable;

  connection.query(
    "DELETE FROM responsable WHERE id_responsable = ?",
    [id],
    (err) => {
      if (err) throw err;
      res.redirect("/personal");
    },
  );
});

module.exports = router;
