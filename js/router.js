function handleRouting() {
    const hash = window.location.hash || '#home';
    const appContainer = document.getElementById('app');
    
    if (!appContainer) return;
    
    // Al cambiar de vista, limpiamos por completo el contenedor principal
    appContainer.textContent = ''; 

    // 1. Manejo de Rutas Dinámicas
    if (hash.startsWith('#detail/')) {
        const id = hash.split('/')[1];
        if (id) {
            appContainer.appendChild(renderDetailView(id));
            return;
        }
    }
    
    if (hash.startsWith('#artist/')) {
        const name = decodeURIComponent(hash.split('/')[1]);
        const title = document.createElement('h1');
        title.textContent = `Obras del artista: ${name}`;
        appContainer.appendChild(title);
        return;
    }

    // 2. Manejo de Rutas Estáticas
    switch (hash) {
        case '#home':
            appContainer.appendChild(renderHomeView());
            break;
            
        case '#explore':
            appContainer.appendChild(renderExploreView());
            break;
            
        case '#departments':
            const depTitle = document.createElement('h1');
            depTitle.textContent = 'Sección de Departamentos';
            appContainer.appendChild(depTitle);
            break;
            
        case '#compare':
            const compTitle = document.createElement('h1');
            compTitle.textContent = 'Comparador Interactivo';
            appContainer.appendChild(compTitle);
            break;
            
        default:
            const errorTitle = document.createElement('h1');
            errorTitle.textContent = '404 - Vista no encontrada';
            appContainer.appendChild(errorTitle);
            break;
    }
}

// Escuchas globales del ciclo de vida de la navegación
window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);