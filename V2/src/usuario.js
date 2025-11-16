document.addEventListener('DOMContentLoaded', function() {
    const alternadorUsuario = document.querySelector('.alternador-usuario');
    const menuUsuario = document.querySelector('.menu-usuario');

    alternadorUsuario.addEventListener('click', function(e) {
        e.preventDefault();
        menuUsuario.classList.toggle('activo');
    });

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!menuUsuario.contains(e.target)) {
            menuUsuario.classList.remove('activo');
        }
    });

    // ============================================
    // VER MÁS / VER MENOS
    // ============================================
    const masAutos = document.getElementById('masAutos');
    const btnVerMas = document.getElementById('botonVerMas');
    const btnVerMenos = document.getElementById('botonVerMenos');

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

    // ============================================
    // MODAL DE ALQUILER
    // ============================================
    const modal = document.getElementById('rentalModal');
    const closeModal = document.getElementById('closeModal');
    const confirmRental = document.getElementById('confirmRental');
    const termsCheckbox = document.getElementById('termsCheckbox');

    // Variable global para guardar los datos de la API
    let autosData = [];

    // Event delegation: escucha clics en botones de alquilar
    document.querySelector('main').addEventListener('click', (e) => {
        if (e.target.matches('.tarjeta-auto button')) {
            const index = parseInt(e.target.dataset.index);
            const auto = autosData[index];
            
            if (auto) {
                document.getElementById('carBrand').innerText = `${auto.marca} ${auto.modelo}`;
                document.getElementById('ownerName').innerText = auto.dueño;
                document.getElementById('carPlate').innerText = auto.patente;
                document.getElementById('engineType').innerText = auto.motor;
                
                modal.classList.remove('hidden');
            }
        }
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Habilitar botón cuando aceptan términos
    termsCheckbox.addEventListener('change', () => {
        confirmRental.disabled = !termsCheckbox.checked;
    });

    // Submit del formulario
    document.getElementById('rentalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('¡Alquiler confirmado! Gracias por su reserva.');
        modal.classList.add('hidden');
    });

    // ============================================
    // CARGAR AUTOS DESDE LA API
    // ============================================
    async function cargarAutos() {
        try {
            // Vaciar grillas
            document.querySelector("#grilla1").innerHTML = "";
            document.querySelector("#grilla2").innerHTML = "";
            document.querySelector("#masAutos").innerHTML = "";

            const respuesta = await fetch("https://6911ddec52a60f10c81f988f.mockapi.io/api/cars");
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const autos = await respuesta.json();
            
            autosData = autos;
            contador = 0;
            autos.forEach((auto) => {
                if (auto.disponibilidad) {
                    let tarjeta = document.createElement("div");
                    tarjeta.classList.add("tarjeta-auto");
                    tarjeta.innerHTML = `
                        <img src="${auto.img}" alt="${auto.marca} ${auto.modelo}" />
                        <h3>${auto.marca} ${auto.modelo}</h3>
                        <p>Precio por día: $${auto.precio}</p>
                        <button data-index="${contador}">Alquilar</button>
                    `;
                    
                    if(contador < 3 && auto.disponibilidad === true) {
                        document.querySelector("#grilla1").appendChild(tarjeta);
                        contador++;
                    } else if(contador < 6) {
                        document.querySelector("#grilla2").appendChild(tarjeta);
                        contador++;
                    } else if(auto.disponibilidad === true) {
                        document.querySelector("#masAutos").appendChild(tarjeta);
                        contador++;
                    }
                }
            });
            
            console.log(`✅ ${autos.length} autos cargados correctamente`);
            
        } catch(error) {
            console.error("❌ Error al cargar los autos:", error);
            document.querySelector("#grilla1").innerHTML = 
                '<p style="color: red; text-align: center;">Error al cargar los autos. Por favor, recarga la página.</p>';
        }
    }

    // Iniciar carga
    cargarAutos();
});