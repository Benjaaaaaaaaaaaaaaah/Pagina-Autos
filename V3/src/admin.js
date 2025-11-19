// Variables globales
let autoActual = null;
let autosData = [];

document.addEventListener('DOMContentLoaded', function() {
    // ========== VERIFICAR SESIÓN Y PERMISOS DE ADMIN ==========
    const datosUsuarioJSON = localStorage.getItem('usuarioActual');

    if (!datosUsuarioJSON) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'login.html';
        return;
    }

    const datosUsuario = JSON.parse(datosUsuarioJSON);
    
    // Verificar que sea administrador
    if (datosUsuario.role !== 'admin' && datosUsuario.rol !== 'admin') {
        alert('No tienes permisos para acceder a esta página');
        window.location.href = 'dashboardUsuario.html';
        return;
    }

    console.log('Admin logueado:', datosUsuario);

    // ========== MOSTRAR INFORMACIÓN DEL USUARIO ==========
    const infoUsuarioSpan = document.querySelector('.info-usuario span');
    if (infoUsuarioSpan) {
        infoUsuarioSpan.textContent = datosUsuario.nombre;
    }

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

    // ========== TOGGLE DEL FORMULARIO ==========
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    const camposFormulario = document.getElementById('camposFormulario');

    if (toggleFormBtn && camposFormulario) {
        toggleFormBtn.addEventListener('click', function() {
            camposFormulario.classList.toggle('visible');
            toggleFormBtn.classList.toggle('activo');
            
            // Cambiar texto del botón
            const span = toggleFormBtn.querySelector('span');
            if (camposFormulario.classList.contains('visible')) {
                span.textContent = 'Cancelar';
            } else {
                span.textContent = 'Agregar Auto';
            }
        });
    }

    // ========== AGREGAR AUTO CON API ==========
    const agregarAutoBtn = document.getElementById('agregarAutoBtn');
    
    if (agregarAutoBtn) {
        agregarAutoBtn.addEventListener('click', async function() {
            const marca = document.getElementById('marcaAuto').value.trim();
            const modelo = document.getElementById('modeloAuto').value.trim();
            const precio = document.getElementById('precioAuto').value.trim();
            const imagen = document.getElementById('imagenAuto').value.trim();
            const dueno = document.getElementById('nombreDueño').value.trim();
            const patente = document.getElementById('patenteAuto').value.trim();
            const motor = document.getElementById('motor').value.trim();

            // Validaciones
            if (!marca || !modelo || !precio || !imagen || !dueno || !patente || !motor) {
                alert('Por favor completa todos los campos');
                return;
            }

            if (isNaN(precio) || precio <= 0) {
                alert('El precio debe ser un número mayor a 0');
                return;
            }

            // Crear objeto auto
            const nuevoAuto = {
                marca: marca,
                modelo: modelo,
                precioDia: precio,
                img: imagen,
                dueno: dueno,
                patente: patente.toUpperCase(),
                motor: motor,
                disponible: "disponible"
            };

            console.log('Agregando auto:', nuevoAuto);

            try {
                const response = await fetch('https://6911ddec52a60f10c81f988f.mockapi.io/api/cars', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(nuevoAuto)
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const autoCreado = await response.json();
                console.log('Auto creado exitosamente:', autoCreado);
                
                alert(`Auto agregado exitosamente\n\nMarca: ${marca}\nModelo: ${modelo}\nPrecio: $${precio}\nPatente: ${patente}`);
                
                // Limpiar formulario
                document.getElementById('marcaAuto').value = '';
                document.getElementById('modeloAuto').value = '';
                document.getElementById('precioAuto').value = '';
                document.getElementById('imagenAuto').value = '';
                document.getElementById('nombreDueño').value = '';
                document.getElementById('patenteAuto').value = '';
                document.getElementById('motor').value = '';
                
                // Cerrar formulario
                camposFormulario.classList.remove('visible');
                toggleFormBtn.classList.remove('activo');
                toggleFormBtn.querySelector('span').textContent = 'Agregar Auto';
                
                // Recargar lista de autos
                await cargarAutos();

            } catch (error) {
                console.error('Error al agregar auto:', error);
                alert('Error al agregar el auto. Por favor, intenta nuevamente.');
            }
        });
    }

    // ========== CERRAR MODAL AL HACER CLIC FUERA ==========
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('modalEditar');
        if (modal && e.target === modal) {
            cerrarModalEditar();
        }
    });

    // ========== BÚSQUEDA DE AUTOS ==========
    const inputBusqueda = document.querySelector('.contenedor-busqueda input');
    const botonBusqueda = document.querySelector('.contenedor-busqueda button');

    function buscarAutos() {
        const textoBusqueda = inputBusqueda.value.toLowerCase().trim();
        
        if (textoBusqueda === '') {
            mostrarAutos(autosData);
            return;
        }

        const autosFiltrados = autosData.filter(auto => {
            const marcaModelo = `${auto.marca} ${auto.modelo}`.toLowerCase();
            const patente = auto.patente.toLowerCase();
            
            return marcaModelo.includes(textoBusqueda) || 
                   patente.includes(textoBusqueda);
        });

        mostrarAutos(autosFiltrados);
        console.log(`Búsqueda: "${textoBusqueda}" - ${autosFiltrados.length} resultados`);
    }

    if (botonBusqueda) {
        botonBusqueda.addEventListener('click', buscarAutos);
    }

    if (inputBusqueda) {
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarAutos();
            }
        });

        inputBusqueda.addEventListener('input', buscarAutos);
    }

    // ========== CARGAR AUTOS DESDE LA API ==========
    async function cargarAutos() {
        try {
            console.log('Cargando autos desde la API...');
            
            const response = await fetch('https://6911ddec52a60f10c81f988f.mockapi.io/api/cars');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const autos = await response.json();
            console.log('Autos cargados:', autos);
            
            autosData = autos;
            mostrarAutos(autos);
            actualizarEstadisticas(autos);
            
        } catch (error) {
            console.error('Error al cargar autos:', error);
            alert('Error al cargar los autos. Por favor, recarga la página.');
        }
    }

    // ========== MOSTRAR AUTOS POR ESTADO ==========
    function mostrarAutos(autos) {
        const contenedorDisponibles = document.getElementById('autosDisponibles');
        const contenedorRentados = document.getElementById('autosRentados');
        const contenedorTaller = document.getElementById('autosTaller');

        // Limpiar contenedores
        contenedorDisponibles.innerHTML = '';
        contenedorRentados.innerHTML = '';
        contenedorTaller.innerHTML = '';

        autos.forEach(auto => {
            const tarjeta = crearTarjetaAuto(auto);
            
            switch(auto.disponible) {
                case 'disponible':
                    contenedorDisponibles.appendChild(tarjeta);
                    break;
                case 'alquilado':
                case 'rentado':
                    contenedorRentados.appendChild(tarjeta);
                    break;
                case 'taller':
                    contenedorTaller.appendChild(tarjeta);
                    break;
                default:
                    contenedorDisponibles.appendChild(tarjeta);
            }
        });

        // Mostrar mensaje si no hay autos en alguna categoría
        if (contenedorDisponibles.children.length === 0) {
            contenedorDisponibles.innerHTML = '<p style="color: #666; text-align: center; padding: 20px; grid-column: 1/-1;">No hay autos disponibles</p>';
        }
        if (contenedorRentados.children.length === 0) {
            contenedorRentados.innerHTML = '<p style="color: #666; text-align: center; padding: 20px; grid-column: 1/-1;">No hay autos rentados</p>';
        }
        if (contenedorTaller.children.length === 0) {
            contenedorTaller.innerHTML = '<p style="color: #666; text-align: center; padding: 20px; grid-column: 1/-1;">No hay autos en taller</p>';
        }
    }

    // ========== CREAR TARJETA DE AUTO ==========
    function crearTarjetaAuto(auto) {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-auto');
        tarjeta.dataset.estado = auto.disponible;
        tarjeta.dataset.id = auto.id;

        let badgeClass = '';
        let badgeTexto = '';
        
        switch(auto.disponible) {
            case 'disponible':
                badgeClass = 'disponible';
                badgeTexto = 'Disponible';
                break;
            case 'alquilado':
            case 'rentado':
                badgeClass = 'rentado';
                badgeTexto = 'Rentado';
                break;
            case 'taller':
                badgeClass = 'taller';
                badgeTexto = '<i class="fas fa-tools"></i>';
                break;
        }

        tarjeta.innerHTML = `
            <div class="badge-estado ${badgeClass}">${badgeTexto}</div>
            <img src="${auto.img}" alt="${auto.marca} ${auto.modelo}" onerror="this.src='img/default-car.jpg'" />
            <h3>${auto.marca} ${auto.modelo}</h3>
            <p><strong>Precio por día:</strong> $${auto.precioDia}</p>
            <p><strong>Patente:</strong> ${auto.patente}</p>
            ${auto.disponible === 'alquilado' || auto.disponible === 'rentado' ? 
                `<p class="info-renta"><i class="fas fa-user"></i> Rentado por: ${auto.dueno}</p>` : 
                ''}
            <button class="edit-admin" onclick="abrirModalEditar(this)">Modificar</button>
            <button class="delete-admin" onclick="eliminarAuto('${auto.id}')">Eliminar</button>
        `;

        return tarjeta;
    }

    // Inicializar cargando los autos
    cargarAutos();
});

// ========== FUNCIÓN PARA ABRIR EL MODAL DE EDICIÓN ==========
function abrirModalEditar(boton) {
    const tarjeta = boton.closest('.tarjeta-auto');
    const autoId = tarjeta.dataset.id;
    
    autoActual = autosData.find(auto => auto.id === autoId);
    
    if (!autoActual) {
        alert('No se pudo cargar la información del auto');
        return;
    }

    const modal = document.getElementById('modalEditar');
    
    // Llenar el formulario con los datos actuales
    document.getElementById('editMarca').value = autoActual.marca;
    document.getElementById('editModelo').value = autoActual.modelo;
    document.getElementById('editPrecio').value = autoActual.precioDia;
    document.getElementById('editImagen').value = autoActual.img;
    document.getElementById('editPatente').value = autoActual.patente;
    document.getElementById('editDueno').value = autoActual.dueno;
    document.getElementById('editMotor').value = autoActual.motor;
    document.getElementById('editEstado').value = autoActual.disponible;
    
    modal.classList.remove('hidden');
}

// ========== FUNCIÓN PARA CERRAR EL MODAL ==========
function cerrarModalEditar() {
    document.getElementById('modalEditar').classList.add('hidden');
    autoActual = null;
}

// ========== FUNCIÓN PARA GUARDAR CAMBIOS ==========
async function guardarCambios() {
    if (!autoActual) {
        alert('Error: No hay auto seleccionado');
        return;
    }

    const marca = document.getElementById('editMarca').value.trim();
    const modelo = document.getElementById('editModelo').value.trim();
    const precio = document.getElementById('editPrecio').value.trim();
    const imagen = document.getElementById('editImagen').value.trim();
    const patente = document.getElementById('editPatente').value.trim();
    const dueno = document.getElementById('editDueno').value.trim();
    const motor = document.getElementById('editMotor').value.trim();
    const estado = document.getElementById('editEstado').value;
    
    // Validaciones
    if (!marca || !modelo || !precio || !imagen || !patente || !dueno || !motor) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        alert('El precio debe ser un número mayor a 0');
        return;
    }

    const autoActualizado = {
        marca: marca,
        modelo: modelo,
        precioDia: precio,
        img: imagen,
        patente: patente.toUpperCase(),
        dueno: dueno,
        motor: motor,
        disponible: estado
    };

    console.log('Actualizando auto:', autoActualizado);

    try {
        const response = await fetch(`https://6911ddec52a60f10c81f988f.mockapi.io/api/cars/${autoActual.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(autoActualizado)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const autoModificado = await response.json();
        console.log('Auto actualizado exitosamente:', autoModificado);
        
        
        cerrarModalEditar();
        
        // Recargar lista de autos
        const response2 = await fetch('https://6911ddec52a60f10c81f988f.mockapi.io/api/cars');
        const autos = await response2.json();
        autosData = autos;
        mostrarAutos(autos);
        actualizarEstadisticas(autos);

    } catch (error) {
        console.error('Error al actualizar auto:', error);
        alert('Error al modificar el auto. Por favor, intenta nuevamente.');
    }
}

// ========== FUNCIÓN PARA ELIMINAR AUTO ==========
async function eliminarAuto(autoId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este auto? Esta acción no se puede deshacer.')) {
        return;
    }

    console.log('Eliminando auto:', autoId);

    try {
        const response = await fetch(`https://6911ddec52a60f10c81f988f.mockapi.io/api/cars/${autoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        console.log('Auto eliminado exitosamente');
        alert('Auto eliminado exitosamente');
        
        // Recargar lista de autos
        const response2 = await fetch('https://6911ddec52a60f10c81f988f.mockapi.io/api/cars');
        const autos = await response2.json();
        autosData = autos;
        mostrarAutos(autos);

    } catch (error) {
        console.error('Error al eliminar auto:', error);
        alert('Error al eliminar el auto. Por favor, intenta nuevamente.');
    }
}

// ========== FUNCIÓN PARA MOSTRAR AUTOS (necesaria para las funciones globales) ==========
function mostrarAutos(autos) {
    const contenedorDisponibles = document.getElementById('autosDisponibles');
    const contenedorRentados = document.getElementById('autosRentados');
    const contenedorTaller = document.getElementById('autosTaller');

    // Limpiar contenedores
    contenedorDisponibles.innerHTML = '';
    contenedorRentados.innerHTML = '';
    contenedorTaller.innerHTML = '';

    autos.forEach(auto => {
        const tarjeta = crearTarjetaAuto(auto);
        
        switch(auto.disponible) {
            case 'disponible':
                contenedorDisponibles.appendChild(tarjeta);
                break;
            case 'alquilado':
            case 'rentado':
                contenedorRentados.appendChild(tarjeta);
                break;
            case 'taller':
                contenedorTaller.appendChild(tarjeta);
                break;
            default:
                contenedorDisponibles.appendChild(tarjeta);
        }
    });

    // Mostrar mensaje si no hay autos en alguna categoría
    if (contenedorDisponibles.children.length === 0) {
        contenedorDisponibles.innerHTML = '<p style="color: #666; text-align: center; padding: 20px; grid-column: 1/-1;">No hay autos disponibles</p>';
    }
    if (contenedorRentados.children.length === 0) {
        contenedorRentados.innerHTML = '<p style="color: #666; text-align: center; padding: 20px; grid-column: 1/-1;">No hay autos rentados</p>';
    }
    if (contenedorTaller.children.length === 0) {
        contenedorTaller.innerHTML = '<p style="color: #666; text-align: center; padding: 20px; grid-column: 1/-1;">No hay autos en taller</p>';
    }
}

// ========== FUNCIÓN PARA CREAR TARJETA DE AUTO ==========
function crearTarjetaAuto(auto) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta-auto');
    tarjeta.dataset.estado = auto.disponible;
    tarjeta.dataset.id = auto.id;

    let badgeClass = '';
    let badgeTexto = '';
    
    switch(auto.disponible) {
        case 'disponible':
            badgeClass = 'disponible';
            badgeTexto = 'Disponible';
            break;
        case 'alquilado':
        case 'rentado':
            badgeClass = 'rentado';
            badgeTexto = 'Rentado';
            break;
        case 'taller':
            badgeClass = 'taller';
            badgeTexto = '<i class="fas fa-tools"></i>';
            break;
    }

    tarjeta.innerHTML = `
        <div class="badge-estado ${badgeClass}">${badgeTexto}</div>
        <img src="${auto.img}" alt="${auto.marca} ${auto.modelo}" onerror="this.src='img/default-car.jpg'" />
        <h3>${auto.marca} ${auto.modelo}</h3>
        <p><strong>Precio por día:</strong> $${auto.precioDia}</p>
        <p><strong>Patente:</strong> ${auto.patente}</p>
        ${auto.disponible === 'alquilado' || auto.disponible === 'rentado' ? 
            `<p class="info-renta"><i class="fas fa-user"></i> Rentado por: ${auto.dueno}</p>` : 
            ''}
        <button class="edit-admin" onclick="abrirModalEditar(this)">Modificar</button>
        <button class="delete-admin" onclick="eliminarAuto('${auto.id}')">Eliminar</button>
    `;

    return tarjeta;
}

// ========== FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS ==========
function actualizarEstadisticas(autos) {
    // Contar autos por estado
    const disponibles = autos.filter(auto => auto.disponible === 'disponible').length;
    const rentados = autos.filter(auto => auto.disponible === 'alquilado' || auto.disponible === 'rentado').length;
    const taller = autos.filter(auto => auto.disponible === 'taller').length;
    const total = autos.length;
    
    // Actualizar tarjetas de resumen
    const cantidadDisponibles = document.getElementById('cantidadDisponibles');
    const cantidadRentados = document.getElementById('cantidadRentados');
    const cantidadTaller = document.getElementById('cantidadTaller');
    const cantidadTotal = document.getElementById('cantidadTotal');
    
    if (cantidadDisponibles) cantidadDisponibles.textContent = disponibles;
    if (cantidadRentados) cantidadRentados.textContent = rentados;
    if (cantidadTaller) cantidadTaller.textContent = taller;
    if (cantidadTotal) cantidadTotal.textContent = total;
    
    // Calcular porcentajes
    const porcentajeDisponibles = total > 0 ? Math.round((disponibles / total) * 100) : 0;
    const porcentajeRentados = total > 0 ? Math.round((rentados / total) * 100) : 0;
    const porcentajeTaller = total > 0 ? Math.round((taller / total) * 100) : 0;
    
    // Actualizar gráfico de barras
    const barraDisponibles = document.getElementById('barraDisponibles');
    const barraRentados = document.getElementById('barraRentados');
    const barraTaller = document.getElementById('barraTaller');
    
    if (barraDisponibles) {
        barraDisponibles.style.width = porcentajeDisponibles + '%';
        const spanPorcentajeDisp = document.getElementById('porcentajeDisponibles');
        if (spanPorcentajeDisp) spanPorcentajeDisp.textContent = porcentajeDisponibles + '%';
    }
    
    if (barraRentados) {
        barraRentados.style.width = porcentajeRentados + '%';
        const spanPorcentajeRent = document.getElementById('porcentajeRentados');
        if (spanPorcentajeRent) spanPorcentajeRent.textContent = porcentajeRentados + '%';
    }
    
    if (barraTaller) {
        barraTaller.style.width = porcentajeTaller + '%';
        const spanPorcentajeTall = document.getElementById('porcentajeTaller');
        if (spanPorcentajeTall) spanPorcentajeTall.textContent = porcentajeTaller + '%';
    }
}

// ========== FUNCIÓN PARA ACTUALIZAR GRÁFICO DE DONA ==========
function actualizarGraficoDona(disponibles, rentados, taller, total) {
    const svgDona = document.getElementById('svgDona');
    const leyendaDona = document.getElementById('leyendaDona');
    const numeroTotalDona = document.getElementById('numeroTotalDona');
    
    if (!svgDona || !leyendaDona || !numeroTotalDona) return;
    
    // Actualizar número total
    numeroTotalDona.textContent = total;
    
    // Limpiar segmentos anteriores
    const circles = svgDona.querySelectorAll('circle:not(:first-child)');
    circles.forEach(circle => circle.remove());
    
    if (total === 0) {
        leyendaDona.innerHTML = '<p style="text-align: center; color: #666;">No hay datos disponibles</p>';
        return;
    }
    
    const radio = 80;
    const circunferencia = 2 * Math.PI * radio;
    
    let offsetActual = 0;
    
    // Colores
    const colores = {
        disponible: '#4CAF50',
        rentado: '#FF9800',
        taller: '#F44336'
    };
    
    // Datos de los segmentos
    const segmentos = [
        { nombre: 'Disponibles', cantidad: disponibles, porcentaje: Math.round((disponibles/total)*100), color: colores.disponible },
        { nombre: 'Rentados', cantidad: rentados, porcentaje: Math.round((rentados/total)*100), color: colores.rentado },
        { nombre: 'En Taller', cantidad: taller, porcentaje: Math.round((taller/total)*100), color: colores.taller }
    ];
    
    // Crear segmentos
    segmentos.forEach(segmento => {
        if (segmento.cantidad > 0) {
            const porcentajeSegmento = segmento.cantidad / total;
            const longitudSegmento = circunferencia * porcentajeSegmento;
            const espacioSegmento = circunferencia - longitudSegmento;
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '100');
            circle.setAttribute('cy', '100');
            circle.setAttribute('r', radio);
            circle.setAttribute('fill', 'transparent');
            circle.setAttribute('stroke', segmento.color);
            circle.setAttribute('stroke-width', '40');
            circle.setAttribute('stroke-dasharray', `${longitudSegmento} ${espacioSegmento}`);
            circle.setAttribute('stroke-dashoffset', -offsetActual);
            
            svgDona.appendChild(circle);
            
            offsetActual += longitudSegmento;
        }
    });
    
    // Actualizar leyenda
    leyendaDona.innerHTML = '';
    segmentos.forEach(segmento => {
        if (segmento.cantidad > 0) {
            const itemLeyenda = document.createElement('div');
            itemLeyenda.className = 'item-leyenda';
            itemLeyenda.innerHTML = `
                <div class="color-leyenda" style="background-color: ${segmento.color}"></div>
                <div class="info-leyenda">
                    <span>${segmento.nombre}</span>
                    <span>${segmento.cantidad} (${segmento.porcentaje}%)</span>
                </div>
            `;
            leyendaDona.appendChild(itemLeyenda);
        }
    });
}