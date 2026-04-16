const express = require("express");
const router = express.Router();
const connection = require("../config/db"); // Verifica que la ruta a tu conexión sea correcta

router.post("/", (req, res) => {
  // 1. Verificar si hay sesión activa
  if (!req.session.usuario) {
    return res.redirect("../RegistroAdmin/login");
  }

  const nombreUsuario = req.session.usuario;

  // 2. Obtener id_participante usando Consultas Preparadas (?) por seguridad
  const sqlUser = "SELECT id_participante FROM participante WHERE nombre = ?";

  connection.query(sqlUser, [nombreUsuario], (err, resultUser) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error al buscar el participante");
    }

    // Verificar si se encontró al usuario
    if (resultUser.length === 0) {
      return res.send(
        "Error: No se encontró el ID del participante en la base de datos.",
      );
    }

    const id_participante = resultUser[0].id_participante;

    // 3. Obtener datos del formulario (req.body)
    const { calificacion, comentario, id_juego } = req.body;

    // 4. Insertar en la tabla 'satisfaccion'
    // IMPORTANTE: Usamos ? para evitar que caracteres raros rompan la consulta
    const sqlInsert = `
            INSERT INTO satisfaccion 
            (calificacion, comentario, id_participante, id_juego)
            VALUES (?, ?, ?, ?)
        `;

    connection.query(
      sqlInsert,
      [calificacion, comentario, id_participante, id_juego],
      (err2) => {
        if (err2) {
          console.error(err2);
          return res.send("Error al guardar la encuesta: " + err2.message);
        }

        // 5. Respuesta de éxito
        res.send(`
                <script>
                    alert('¡Gracias por tu opinión! Tu calificación ha sido registrada.');
                    window.location.href = '../menu';
                </script>
            `);
      },
    );
  });
});

module.exports = router;
