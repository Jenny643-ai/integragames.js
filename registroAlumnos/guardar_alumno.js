document.getElementById('formRegistro').addEventListener('submit', async (e) => {

    e.preventDefault();

    const body = {
        nombre: document.getElementById('nombre').value,
        edad: document.getElementById('edad').value,
        id_evento: document.getElementById('id_evento').value,
        id_escuela: document.getElementById('id_escuela').value
    };

    try {

        const resp = await fetch('/guardar_alumno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await resp.json();

        if (!resp.ok) {
            alert(data.error);
            return;
        }

        alert('Registro exitoso');

        // ✅ usar sesión del servidor
        window.location.href = "/menu";

    } catch (error) {
        alert('Error de conexión');
    }

});