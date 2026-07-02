function renderDepartmentGalleryView(deptId) {
    const container = document.createElement('div');
    container.className = 'department-gallery-view';

    // 1. Título dinámico
    const title = document.createElement('h1');
    title.textContent = 'Cargando obras del departamento...';
    container.appendChild(title);

    // 2. Buscador simple
    const searchContainer = document.createElement('div');
    searchContainer.className = 'simple-search-container';
    searchContainer.innerHTML = `
        <input type="text" id="gallery-search" placeholder="Buscar dentro de este departamento...">
        <button id="btn-gallery-search">Buscar 🔍</button>
    `;
    container.appendChild(searchContainer);

    // 3. Cuadrícula de obras (Grid)
    const grid = document.createElement('div');
    grid.className = 'artwork-grid'; 
    container.appendChild(grid);

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    paginationContainer.style.textAlign = 'center';
    paginationContainer.style.marginTop = '20px';
    container.appendChild(paginationContainer);

    // Inicializamos la galería pasando también el contenedor de paginación
    initDepartmentGallery(deptId, title, grid, paginationContainer);

    return container;
}
async function initDepartmentGallery(deptId, titleElement, gridElement, paginationElement) {
    // Variables de control de estado de la paginación
    let todosLosIDs = [];
    let paginaActual = 1;
    const obrasPorPagina = 9; // 9 obras nos da un bloque perfecto de 3x3

    try {
        // A. Obtener el nombre del departamento
        const deptData = await MetAPI.getDepartments();
        const currentDept = deptData.departments.find(d => d.departmentId == deptId);
        if (currentDept) {
            titleElement.textContent = `Colección: ${currentDept.displayName}`;
        }

        // B. Buscar la lista completa de IDs del departamento
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${deptId}`);
        const data = await response.json();

        if (!data.objectIDs || data.objectIDs.length === 0) {
            gridElement.innerHTML = '<p>No se encontraron obras en este departamento.</p>';
            return;
        }

        // Guardamos todos los IDs recibidos de la API
        todosLosIDs = data.objectIDs;

        // Función interna para renderizar una página específica
        async function mostrarPagina(pagina) {
            gridElement.innerHTML = '<p>Cargando obras de esta página...</p>';
            
            // Calculamos los índices del lote actual
            const inicio = (pagina - 1) * obrasPorPagina;
            const fin = inicio + obrasPorPagina;
            const IDsDeLaPagina = todosLosIDs.slice(inicio, fin);

            gridElement.textContent = ''; // Limpiamos el grid

            // Renderizamos las tarjetas del lote actual
            for (const id of IDsDeLaPagina) {
                try {
                    const obra = await MetAPI.getObjectDetails(id);
                    
                    const card = document.createElement('div');
                    card.className = 'artwork-card';
                    
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'artwork-image-container';

                    const img = document.createElement('img');
                    img.src = obra.primaryImageSmall || 'assets/no-image.png'; 
                    img.alt = obra.title || 'Sin título';
                    imgContainer.appendChild(img);
                    
                    const infoContainer = document.createElement('div');
                    infoContainer.className = 'artwork-info';

                    const cardTitle = document.createElement('h3');
                    cardTitle.textContent = obra.title || 'Sin título';

                    const cardAuthor = document.createElement('p');
                    cardAuthor.className = 'artist-name';
                    cardAuthor.textContent = `Por: ${obra.artistDisplayName || 'Artista desconocido'}`;

                    infoContainer.appendChild(cardTitle);
                    infoContainer.appendChild(cardAuthor);
                    
                    card.appendChild(imgContainer);
                    card.appendChild(infoContainer);
                    
                    card.addEventListener('click', () => {
                        window.location.hash = `#detail/${obra.objectID}`;
                    });

                    gridElement.appendChild(card);
                } catch (err) {
                    console.error(`Error cargando la obra con ID ${id}:`, err);
                }
            }

            // Actualizar los controles de los botones abajo
            renderizarBotonesPaginacion();
        }

        // Función interna para dibujar los controles de paginación
        function renderizarBotonesPaginacion() {
            paginationElement.textContent = ''; // Limpiamos controles viejos
            const totalPaginas = Math.ceil(todosLosIDs.length / obrasPorPagina);

            // Botón Anterior
            const btnAnterior = document.createElement('button');
            btnAnterior.textContent = '← Anterior';
            btnAnterior.className = 'btn-pagination'; // Reutiliza clases del proyecto
            btnAnterior.disabled = paginaActual === 1;
            btnAnterior.style.marginRight = '10px';
            btnAnterior.addEventListener('click', () => {
                if (paginaActual > 1) {
                    paginaActual--;
                    mostrarPagina(paginaActual);
                    window.scrollTo(0, 0); // Sube la pantalla suavemente al cambiar de página
                }
            });

            // Indicador de página
            const infoTexto = document.createElement('span');
            infoTexto.textContent = ` Página ${paginaActual} de ${totalPaginas} `;
            infoTexto.style.fontWeight = 'bold';

            // Botón Siguiente
            const btnSiguiente = document.createElement('button');
            btnSiguiente.textContent = 'Siguiente →';
            btnSiguiente.className = 'btn-pagination';
            btnSiguiente.disabled = paginaActual === totalPaginas;
            btnSiguiente.style.marginLeft = '10px';
            btnSiguiente.addEventListener('click', () => {
                if (paginaActual < totalPaginas) {
                    paginaActual++;
                    mostrarPagina(paginaActual);
                    window.scrollTo(0, 0);
                }
            });

            paginationElement.appendChild(btnAnterior);
            paginationElement.appendChild(infoTexto);
            paginationElement.appendChild(btnSiguiente);
        }

        // Disparamos la carga de la primera página al iniciar
        mostrarPagina(paginaActual);

    } catch (error) {
        console.error("Error general en la galería paginada:", error);
        gridElement.innerHTML = '<p>Error al sincronizar con la colección del museo.</p>';
    }
}