document.getElementById('formRegistro').addEventListener('submit', async (e) => {

    e.preventDefault();

    const body = {
        nombre: document.getElementById('nombre').value,
        edad: document.getElementById('edad').value,
        id_evento: document.getElementById('id_evento').value,
        id_escuela: document.getElementById('id_escuela').value
    };

    try {

        const resp = await fetch('http://localhost:3000/api/participantes', {
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

        // 💾 Guardar sesión (como PHP session)
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', data.usuario);
        localStorage.setItem('rol', data.rol);

        alert('Registro exitoso');

        // 🔁 Redirigir
        window.location.href = 'menu.html';

    } catch (error) {
        alert('Error de conexión');
    }

});