function handleRouting() {
    const hash = window.location.hash || '#home';
    const appContainer = document.getElementById('app');
    if (!appContainer) return;
    
    // Al cambiar de vista, limpiamos por completo el contenedor principal una sola vez
    appContainer.textContent = ''; 

    // --- LÓGICA DE SEPARACIÓN (Ruta Base vs Parámetros) ---
   
    const [path, queryParams] = hash.split('?');
    const params = new URLSearchParams(queryParams);
    // -----------------------------------------------------

    // 1. Manejo de Rutas Dinámicas (Detalle, Galería de Departamento y Artista)
    
    // Ruta: #detail/ID
    if (path.startsWith('#detail/')) {
        const id = path.split('/')[1];
        if (id) {
            appContainer.appendChild(renderDetailView(id));
            return;
        }
    }

    // Ruta: #department-gallery/ID
    if (path.startsWith('#department-gallery/')) {
        const deptId = path.split('/')[1];
        if (deptId) {
            appContainer.appendChild(renderDepartmentGalleryView(deptId));
            return;
        }
    }
    
    // Ruta: #artist/NombreArtista
    if (path.startsWith('#artist/')) {
        const artistName = path.split('/')[1]; 
        if (artistName) {
            appContainer.appendChild(renderArtistView(artistName));
            return;
        }
    }

    // 2. Manejo de Rutas Estáticas
    switch (path) {
        case '#home':
            appContainer.appendChild(renderHomeView());
            break;

        case '#explore':
            // Usamos directamente los parámetros ya extraídos arriba de forma limpia
            const deptIdExplore = params.get('departmentId'); 
            appContainer.appendChild(renderExploreView(deptIdExplore)); 
            break;

        case '#departments':
            // Inyección limpia y sincrónica (Soluciona el error .then de la consola)
            appContainer.appendChild(renderDepartmentsView()); 
            break;

        case '#compare':
            // Inyección limpia de la vista autónoma del comparador
            appContainer.appendChild(renderCompareView());
            break;

        default:
            // Mensaje de respaldo semántico controlado en caso de error 404
            const errorHeading = document.createElement('h1');
            errorHeading.textContent = '404 - Página no encontrada';
            errorHeading.style.textAlign = 'center';
            errorHeading.style.marginTop = '5px';
            appContainer.appendChild(errorHeading);
            break;
    }
}

// Escuchas globales del ciclo de vida de la navegación
window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);