
// Verificar si el usuario ya está logueado
window.addEventListener('DOMContentLoaded', function() {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        // Si ya está logueado, redirigir según su rol
        if (usuario.role === "admin" || usuario.rol === "admin") {
            window.location.href = "dashboardAdmin.html";
        } else {
            window.location.href = "dashboardUsuario.html";
        }
    }
});

// Manejar el envío del formulario
const formLogin = document.querySelector("#formLogin");
formLogin.addEventListener("submit", loginUser);

async function loginUser(e) {
    e.preventDefault();
    
    const user = document.querySelector("#usuario-login").value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const password = document.querySelector("#contrasena-login").value;
    const mensajeError = document.getElementById('mensajeError');

    // Validar que los campos no estén vacíos
    if (!user || !password) {
        mensajeError.textContent = "Por favor, completa todos los campos";
        mensajeError.style.display = 'block';
        setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 3000);
        return;
    }

    try {
        const response = await fetch("https://6911ddec52a60f10c81f988f.mockapi.io/api/users");
        
        if (!response.ok) {
            mensajeError.textContent = "Error al conectar con la API";
            mensajeError.style.display = 'block';
            setTimeout(() => {
                mensajeError.style.display = 'none';
            }, 3000);
            return;
        }
        
        const listaUsuarios = await response.json();
        
        // Buscar usuario
        const usuario = listaUsuarios.find(u => 
            (u.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === user || u.email.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === user) && u.password === password
        );

        if (usuario) {
            // Guardar en localStorage SOLO si el usuario existe
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            
            
            // Verificar el rol y redirigir
            if (usuario.role === "admin" || usuario.rol === "admin") {
                window.location.href = "dashboardAdmin.html";
            } else {
                window.location.href = "dashboardUsuario.html";
            }
        } else {
            mensajeError.textContent = "Usuario o contraseña incorrectos";
            mensajeError.style.display = 'block';
            setTimeout(() => {
                mensajeError.style.display = 'none';
            }, 3000);
        }
        
    } catch (error) {
        console.error("Error en el login del usuario:", error);
        mensajeError.textContent = "Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.";
        mensajeError.style.display = 'block';
        setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 3000);
    }
}