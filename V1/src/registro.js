const btnRegistrar = document.querySelector("#btn-register");
btnRegistrar.addEventListener("click", guardarDatos);

async function guardarDatos(){
    const username = document.querySelector("#user").value;
    const password = document.querySelector("#password").value;
    const email = document.querySelector("#email").value;

    if(!username || !password || !email){
        alert("Profavor ingrese todos los datos correctamente");
        return;
    }

    const Usuario = {
        nombre: username,
        email: email,
        password: password,
        role: "user"
    }

    try{
        const Usuarios = await fetch("https://6911ddec52a60f10c81f988f.mockapi.io/api/users");
        const listaUsuarios = await Usuarios.json();

        const existe = listaUsuarios.find(u => u.email === email || u.nombre === username);

        if(existe){
            alert("El nombre de usuario o email ya existe");
            return;
        }

        const response = await fetch("https://6911ddec52a60f10c81f988f.mockapi.io/api/users",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Usuario)
        })

        if(response.ok){
        alert("Usuario registradi con exito");
        window.location.href = "login.html";
    }else{
        alert("Error al registrar el usuario")
    }
    }catch(error){
        console.error("Error al registrar el usuario: ",error);
    }
}