// eliminar sesión
localStorage.removeItem('token');
localStorage.removeItem('usuario');
localStorage.removeItem('rol');

// redirigir al login
window.location.href = 'login.html';