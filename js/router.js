function handleRouting() {
    const hash = window.location.hash || '#home';
    const appContainer = document.getElementById('app');
    if (!appContainer) return;
    appContainer.textContent = '';
    
    // Al cambiar de vista, limpiamos por completo el contenedor principal
    appContainer.textContent = ''; 

    // --- LÓGICA DE SEPARACIÓN (Ruta Base vs Parámetros) ---
    
    const [path, queryParams] = hash.split('?');
    const params = new URLSearchParams(queryParams);
    // -----------------------------------------------------

    // 1. Manejo de Rutas Dinámicas (Detalle y Artista)
    if (path.startsWith('#detail/')) {
        const id = path.split('/')[1];
        if (id) {
            appContainer.appendChild(renderDetailView(id));
            return;
        }
    }

    if (hash.startsWith('#department-gallery/')) {
        const deptId = hash.split('/')[1];
        if (deptId) {
        // Renderiza la nueva vista pasándole el ID del departamento
        appContainer.appendChild(renderDepartmentGalleryView(deptId));
        return;
    }
}
    
    if (path.startsWith('#artist/')) {
        const name = decodeURIComponent(path.split('/')[1]);
        const title = document.createElement('h1');
        title.textContent = `Obras del artista: ${name}`;
        appContainer.appendChild(title);
        return;
    }

   
   switch (path) {
        case '#home':
            appContainer.appendChild(renderHomeView());
            break;
       case '#explore':
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const deptId = urlParams.get('departmentId'); // Extraemos el ID
            appContainer.appendChild(renderExploreView(deptId)); 
            break;
        case '#departments':
            renderDepartmentsView().then(view => appContainer.appendChild(view));
            break;
        case '#compare':
            appContainer.appendChild(renderCompareView());
            break;
        default:
            appContainer.innerHTML = '<h1>404 - Página no encontrada</h1>';
            break;
    }
}

// Escuchas globales del ciclo de vida de la navegación
window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);