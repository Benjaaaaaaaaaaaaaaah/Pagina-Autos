
const btnRegistrar = document.querySelector("#boton-registro");
btnRegistrar.addEventListener("click", guardarDatos);

async function guardarDatos(e){
    e.preventDefault();
    const username = document.querySelector("#usuario-registro").value.toLowerCase().trim();
    const password = document.querySelector("#contrasena-registro").value;
    const email = document.querySelector("#email-registro").value.toLowerCase().trim();

    const mensajeError = document.querySelector("#mensajeError");
// Corroborar que los campos no estén vacíos
    if(!username || !password || !email){
        mensajeError.textContent = "Por favor ingrese todos los datos correctamente";
        mensajeError.style.display = "block";
        setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 3000);
        return;
    }
// Almacenar datos en una constante
    const Usuario = {
        id: "",
        nombre: username,
        email: email,
        password: password,
        role: "user"
    }

    try{
        const Usuarios = await fetch("https://6911ddec52a60f10c81f988f.mockapi.io/api/users");

        const listaUsuarios = await Usuarios.json();
    // Verificar si el usuario o email ya existen
        const existe = listaUsuarios.find(u => u.email.toLowerCase().trim() === email || u.nombre.toLowerCase().trim() === username);

        if(existe){
            mensajeError.textContent = "El nombre de usuario o email ya existe";
            mensajeError.style.display = "block";
            setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 3000);
            return;
        }

        // Mandar datos a la API
        const response = await fetch("https://6911ddec52a60f10c81f988f.mockapi.io/api/users",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Usuario)
        })
        // Captar respuesta de la API y registrar usuario
        if(response.ok){
            alert("Usuario registrado con éxito");
            window.location.href = "login.html";
        }else{
            mensajeError.textContent = "Error al registrar el usuario";
            mensajeError.style.display = "block";
            setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 3000);
        }
    }catch(error){
        console.error("Error al registrar el usuario: ", error);
        mensajeError.textContent = "Error al conectar con el servidor. Por favor, intenta nuevamente.";
        mensajeError.style.display = "block";
        setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 3000);
    }
}