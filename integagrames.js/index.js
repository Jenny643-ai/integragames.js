// Año automático
document.getElementById('year').textContent = new Date().getFullYear();

// Detectar sesión
const token = localStorage.getItem('token');

if (token) {
    console.log('Usuario ya autenticado');
    // window.location.href = 'portada.html';
}