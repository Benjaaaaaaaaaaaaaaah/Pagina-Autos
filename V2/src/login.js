const btnLogin = document.querySelector("#btn-login");
btnLogin.addEventListener("click", loginUsuer);

async function loginUsuer(){
    const user = document.querySelector("#username-login").value;
    const password = document.querySelector("#password-login").value;

    try{
        const response = await fetch("https://6911ddec52a60f10c81f988f.mockapi.io/api/users");
        if(!response.ok){
            alert("Error al conectar con la api");
            return;
        }
        const listaUsuarios = await response.json();
        const usuario = listaUsuarios.find(u => (u.nombre === user || u.email === user) && u.password === password);

        if(usuario){
            alert("login exitoso");
            if(usuario.role === "admin"){
                window.location.href = "dashboardAdmin.html";
            }else{
                window.location.href = "dashboardUsuario.html";
            }
        }else{
            alert("Usuario o contraseña incorrectos");
        }
    }catch(error){
        console.error("Error en el login del usuario: ", error);
    }
}