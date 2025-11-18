document.addEventListener('DOMContentLoaded', function() {
    // ========== VERIFICAR SESIÓN Y CARGAR DATOS DEL USUARIO ==========
    const datosUsuarioJSON = localStorage.getItem('usuarioActual');

    if (!datosUsuarioJSON) {
        // Si no hay usuario logueado, redirigir al login
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'login.html';
        return;
    }

    const datosUsuario = JSON.parse(datosUsuarioJSON);
    console.log('Usuario logueado:', datosUsuario);

    // ========== MOSTRAR INFORMACIÓN DEL USUARIO ==========
    // Actualizar el nombre en el menú desplegable
    const infoUsuarioSpan = document.querySelector('.info-usuario span');
    if (infoUsuarioSpan) {
        infoUsuarioSpan.textContent = datosUsuario.nombre;
    }

    // Actualizar el nombre en el botón del menú
    const alternadorSpan = document.querySelector('.alternador-usuario span');
    if (alternadorSpan) {
        alternadorSpan.textContent = datosUsuario.nombre;
    }

    // ========== MENÚ DESPLEGABLE DE USUARIO ==========
    const alternadorUsuario = document.querySelector('.alternador-usuario');
    const menuUsuario = document.querySelector('.menu-usuario');

    if (alternadorUsuario && menuUsuario) {
        alternadorUsuario.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            menuUsuario.classList.toggle('activo');
        });

        // Cerrar el menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!menuUsuario.contains(e.target)) {
                menuUsuario.classList.remove('activo');
            }
        });
    }

    // ========== CERRAR SESIÓN ==========
    const btnCerrarSesion = document.querySelector('.cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                localStorage.removeItem('usuarioActual');
                window.location.href = 'login.html';
            }
        });
    }

    // ========== CONTROL DE ACCESO AL DASHBOARD ADMIN ==========
    const linkAdmin = document.querySelector('a[href="dashboardAdmin.html"]');
    if (linkAdmin) {
        if (datosUsuario.role !== 'admin' && datosUsuario.rol !== 'admin') {
            linkAdmin.style.display = 'none';
        }
    }

    // ========== VER MÁS / VER MENOS ==========
    const masAutos = document.getElementById('masAutos');
    const btnVerMas = document.getElementById('botonVerMas');
    const btnVerMenos = document.getElementById('botonVerMenos');

    if (btnVerMas && btnVerMenos && masAutos) {
        btnVerMas.classList.add('visible');
        btnVerMenos.classList.remove('visible');

        function toggleMasAutos() {
            if (masAutos.classList.contains('visible')) {
                masAutos.classList.remove('visible');
                masAutos.classList.add('oculto');
                btnVerMas.classList.add('visible');
                btnVerMenos.classList.remove('visible');
            } else {
                masAutos.classList.remove('oculto');
                masAutos.classList.add('visible');
                btnVerMas.classList.remove('visible');
                btnVerMenos.classList.add('visible');
            }
        }

        btnVerMas.addEventListener('click', toggleMasAutos);
        btnVerMenos.addEventListener('click', toggleMasAutos);
    }

    // ========== MODAL DE ALQUILER ==========
    const modal = document.getElementById('rentalModal');
    const closeModal = document.getElementById('closeModal');
    const confirmRental = document.getElementById('confirmRental');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const diasDeRenta = document.getElementById('diasDeRenta');
    const costoDeRenta = document.getElementById('costoDeRenta');

    // Variable global para guardar los datos de la API
    let autosData = [];
    let precioAutoSeleccionado = 0;

    // Calcular costo total según días
    if (diasDeRenta && costoDeRenta) {
        diasDeRenta.addEventListener('input', () => {
            let dias = parseInt(diasDeRenta.value) || 0;
            
            // Limitar a máximo 30 días
            if (dias > 30) {
                dias = 30;
                diasDeRenta.value = 30;
            }
            
            // Calcular costo total
            const costoTotal = dias * precioAutoSeleccionado;
            costoDeRenta.value = costoTotal > 0 ? costoTotal : '';
        });
    }

    // Event delegation: escucha clics en botones de alquilar
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.addEventListener('click', (e) => {
            if (e.target.matches('.tarjeta-auto button')) {
                const index = parseInt(e.target.dataset.index);
                const auto = autosData[index];
                
                if (auto) {
                    document.getElementById('carBrand').innerText = `${auto.marca} ${auto.modelo}`;
                    document.getElementById('ownerName').innerText = auto.dueno;
                    document.getElementById('carPlate').innerText = auto.patente;
                    document.getElementById('engineType').innerText = auto.motor;
                    
                    // Guardar precio del auto seleccionado
                    precioAutoSeleccionado = parseFloat(auto.precioDia) || 0;
                    
                    // Limpiar campos de días y costo
                    if (diasDeRenta) diasDeRenta.value = '';
                    if (costoDeRenta) costoDeRenta.value = '';
                    
                    modal.classList.remove('hidden');
                }
            }
        });
    }

    // Cerrar modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Habilitar botón cuando aceptan términos
    if (termsCheckbox && confirmRental) {
        termsCheckbox.addEventListener('change', () => {
            confirmRental.disabled = !termsCheckbox.checked;
        });
    }

    // Submit del formulario
    const rentalForm = document.getElementById('rentalForm');
if (rentalForm) {
    rentalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const patente = document.getElementById('carPlate').innerText;
    
        const autoSeleccionado = autosData.find(auto => auto.patente === patente);
        const fechaInicio = new Date();
        const fechaFin = new Date();

        fechaFin.setDate(fechaFin.getDate() + parseInt(diasDeRenta.value));
        
        const alquiler = {
            id: "",
            userId: datosUsuario,
            carId: autoSeleccionado,
            fechaInicio: fechaInicio.toLocaleDateString('es-AR'),
            fechaFin: fechaFin.toLocaleDateString('es-AR'),
            estado: true,
            total: parseInt(costoDeRenta.value)
        };
        
        console.log('Alquiler a enviar:', alquiler);

        await rents(alquiler);
        await cambioEstadoAuto(autoSeleccionado.id);

        modal.classList.add('hidden');
        
        rentalForm.reset();
        if (termsCheckbox) termsCheckbox.checked = false;
        if (confirmRental) confirmRental.disabled = true;
    });
}

async function cambioEstadoAuto(autoId){
    try{
        const response = await fetch(`https://6911ddec52a60f10c81f988f.mockapi.io/api/cars/${autoId}`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({disponible: "rentado"})
        })
}catch(error){
    console.error("Error al cambiar el estado del auto:", error);
}
}
// Almacena los datos del alquiler en la API
async function rents(alquiler){
    try{
        const response = await fetch("https://6911ee1952a60f10c81fdd21.mockapi.io/api/rentals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(alquiler)
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Alquiler registrado exitosamente:", data);
        alert("¡Alquiler registrado con éxito!");
        return data;

    } catch(error) {
        console.error("Error al registrar el alquiler:", error);
        alert("Error al registrar el alquiler. Por favor, intenta nuevamente.");
        throw error;
    }
}

    // ========== BÚSQUEDA DE AUTOS ==========
    const inputBusqueda = document.querySelector('.contenedor-busqueda input');
    const botonBusqueda = document.querySelector('.contenedor-busqueda button');

    // Función para mostrar los autos (con o sin filtro)
    function mostrarAutos(autosFiltrados) {
        document.querySelector("#grilla1").innerHTML = "";
        document.querySelector("#grilla2").innerHTML = "";
        document.querySelector("#masAutos").innerHTML = "";

        if (autosFiltrados.length === 0) {
            document.querySelector("#grilla1").innerHTML = 
                '<p style="color: #666; text-align: center; grid-column: 1/-1; padding: 40px;">No se encontraron autos que coincidan con tu búsqueda.</p>';
            return;
        }

        let contador = 0;
        
        autosFiltrados.forEach((auto, index) => {
            if (auto.disponible === "disponible") {
                let tarjeta = document.createElement("div");
                tarjeta.classList.add("tarjeta-auto");
                tarjeta.innerHTML = `
                    <img src="${auto.img}" alt="${auto.marca} ${auto.modelo}" />
                    <h3>${auto.marca} ${auto.modelo}</h3>
                    <p>Precio por día: $${auto.precioDia}</p>
                    <button data-index="${index}">Alquilar</button>
                `;
                
                if(contador < 3) {
                    document.querySelector("#grilla1").appendChild(tarjeta);
                    contador++;
                } else if(contador < 6) {
                    document.querySelector("#grilla2").appendChild(tarjeta);
                    contador++;
                } else {
                    document.querySelector("#masAutos").appendChild(tarjeta);
                    contador++;
                }
            }
        });
    }

    // Función para buscar autos
    function buscarAutos() {
        const textoBusqueda = inputBusqueda.value.toLowerCase().trim();
        
        // Si no hay texto, mostrar todos los autos
        if (textoBusqueda === '') {
            mostrarAutos(autosData);
            return;
        }

        // Filtrar autos que coincidan parcialmente
        const autosFiltrados = autosData.filter(auto => {
            const marcaModelo = `${auto.marca} ${auto.modelo}`.toLowerCase();
            const marca = auto.marca.toLowerCase();
            const modelo = auto.modelo.toLowerCase();
            
            return marcaModelo.includes(textoBusqueda) ||
                   marca.includes(textoBusqueda) ||
                   modelo.includes(textoBusqueda);
        });

        mostrarAutos(autosFiltrados);
        console.log(`Búsqueda: "${textoBusqueda}" - ${autosFiltrados.length} resultados encontrados`);
    }

    // Evento al hacer clic en el botón de búsqueda
    if (botonBusqueda) {
        botonBusqueda.addEventListener('click', buscarAutos);
    }

    // Evento al presionar Enter en el input
    if (inputBusqueda) {
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarAutos();
            }
        });

        // Búsqueda en tiempo real
        inputBusqueda.addEventListener('input', () => {
            buscarAutos();
        });
    }

    // ========== CARGAR AUTOS DESDE LA API ==========
    async function cargarAutos() {
        try {
            console.log('Iniciando carga de autos desde la API...');
            
            const respuesta = await fetch("https://6911ddec52a60f10c81f988f.mockapi.io/api/cars");
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const autos = await respuesta.json();
            console.log('Datos recibidos de la API:', autos);
            
            autosData = autos;
            
            // Mostrar todos los autos inicialmente
            mostrarAutos(autosData);
            
            console.log(`${autos.length} autos cargados correctamente para ${datosUsuario.nombre}`);
            
        } catch(error) {
            console.error("Error al cargar los autos:", error);
            document.querySelector("#grilla1").innerHTML = 
                '<p style="color: red; text-align: center;">Error al cargar los autos. Por favor, recarga la página.</p>';
        }
    }

    cargarAutos();
});