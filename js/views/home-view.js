

function renderHomeView() {

    const container = document.createElement('div');
    container.className = 'view-home';


    const heroSection = document.createElement('section');
    heroSection.className = 'hero-section';
    
    const mainTitle = document.createElement('h1');
    mainTitle.textContent = 'Explora la colección del Met Museum';
    
    const heroDescription = document.createElement('p');
    heroDescription.className = 'hero-description';
    heroDescription.textContent = 'Bienvenido a MetHub, una inmersión digital interactiva a través de más de 5,000 años de cultura y creatividad global. Explora de forma dinámica las obras de arte más influyentes albergadas en el Metropolitan Museum of Art de Nueva York.';
    heroDescription.style.marginBottom = '30px';
    heroDescription.style.color = 'var(--color-muted)';

    const exploreBtn = document.createElement('button');
    exploreBtn.className = 'btn';
    exploreBtn.textContent = 'Ir al Buscador Avanzado 🔎';
    exploreBtn.style.marginBottom = '30px';
    
    // Al hacer click, cambiamos el hash global. El router lo detectará solo.
    exploreBtn.addEventListener('click', () => {
        window.location.hash = '#explore';
    });

    heroSection.appendChild(mainTitle);
    heroSection.appendChild(heroDescription);
    heroSection.appendChild(exploreBtn); 
    container.appendChild(heroSection);

    heroSection.appendChild(mainTitle);
    heroSection.appendChild(heroDescription);
    container.appendChild(heroSection);

 
    const statsSection = document.createElement('section');
    statsSection.className = 'stats-section';
    container.appendChild(statsSection);

    const gallerySection = document.createElement('section');
    gallerySection.className = 'gallery-section';
    
    const galleryTitle = document.createElement('h2');
    galleryTitle.textContent = 'Obras de Arte Destacadas';
    galleryTitle.style.marginTop = '40px';
    gallerySection.appendChild(galleryTitle);
    
    container.appendChild(gallerySection);

    // ==========================================================================
    // 3. INVOCACIÓN ASÍNCRONA (Población de Datos en Paralelo)
    // ==========================================================================
    
    // Creamos un indicador visual de carga temporal (Loading State)
    const loadingIndicator = document.createElement('p');
    loadingIndicator.textContent = 'Cargando tesoros del museo... Por favor, espere.';
    loadingIndicator.style.fontStyle = 'italic';
    loadingIndicator.style.color = 'var(--color-accent)';
    gallerySection.appendChild(loadingIndicator);

    // Ejecutamos la carga de datos de la API en segundo plano sin congelar la interfaz
    Promise.all([
        MetAPI.getDepartments(),
        MetAPI.searchObjects('sunflowers', '&isHighlight=true&hasImages=true') // Término inicial representativo
    ])
    .then(async ([departmentsData, searchData]) => {
        // Removemos el indicador de carga
        loadingIndicator.remove();

        // --- Renderizar Estadísticas Reales (Requerimiento 4.1.2) ---
        const totalDeps = departmentsData.departments ? departmentsData.departments.length : 0;
        const totalHighlights = searchData ? searchData.total : 0;

        const statsWrapper = document.createElement('div');
        statsWrapper.style.display = 'flex';
        statsWrapper.style.gap = '20px';
        statsWrapper.style.marginBottom = '20px';

        const cardDeps = document.createElement('div');
        cardDeps.className = 'artwork-card';
        cardDeps.innerHTML = `<strong>${totalDeps}</strong> Áreas Curatoriales`; // Uso estructural simple

        const cardHigh = document.createElement('div');
        cardHigh.className = 'artwork-card';
        cardHigh.innerHTML = `<strong>${totalHighlights}</strong> Obras Maestras Destacadas`;

        statsWrapper.appendChild(cardDeps);
        statsWrapper.appendChild(cardHigh);
        statsSection.appendChild(statsWrapper);

        // --- Resolver y Renderizar Galería (Requerimiento 4.1.3) ---
        if (!searchData || !searchData.objectIDs || searchData.objectIDs.length === 0) {
            const noResults = document.createElement('p');
            noResults.textContent = 'No se encontraron obras destacadas en este momento.';
            gallerySection.appendChild(noResults);
            return;
        }

        // Tomamos una porción (primeros 8 a 12 IDs) de acuerdo a la especificación
        const selectedIDs = searchData.objectIDs.slice(0, 8);

        // Invocamos nuestro Motor de Resolución Concurrente con Promise.allSettled
        const resolvedArtworks = await MetAPI.resolveObjectIDs(selectedIDs);

        if (resolvedArtworks.length === 0) {
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Error al resolver los detalles de las obras destacadas.';
            gallerySection.appendChild(errorMsg);
            return;
        }

        // Creamos la rejilla de visualización mapeada con los estilos
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        resolvedArtworks.forEach(artwork => {
            const card = document.createElement('div');
            card.className = 'artwork-card';
            card.style.display = 'inline-block';
            card.style.width = '280px';
            card.style.margin = '10px';
            card.style.verticalAlign = 'top';

            // Validamos existencia de imagen, si no colocamos un placeholder ordenado
            if (artwork.primaryImageSmall) {
                const img = document.createElement('img');
                img.src = artwork.primaryImageSmall;
                img.alt = artwork.title;
                img.style.width = '100%';
                img.style.height = '200px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                card.appendChild(img);
            } else {
                const placeholder = document.createElement('div');
                placeholder.style.width = '100%';
                placeholder.style.height = '200px';
                placeholder.style.backgroundColor = '#eee';
                placeholder.style.display = 'flex';
                placeholder.style.alignItems = 'center';
                placeholder.style.justifyContent = 'center';
                placeholder.style.fontSize = '0.9rem';
                placeholder.textContent = 'Sin imagen disponible';
                card.appendChild(placeholder);
            }

            const infoTitle = document.createElement('h3');
            infoTitle.textContent = artwork.title;
            infoTitle.style.fontSize = '1.1rem';
            infoTitle.style.marginTop = '10px';

            const infoArtist = document.createElement('p');
            infoArtist.textContent = `Por: ${artwork.artistDisplayName}`;
            infoArtist.style.fontSize = '0.9rem';
            infoArtist.style.color = 'var(--color-muted)';

            const infoMeta = document.createElement('p');
            infoMeta.textContent = `${artwork.objectDate} | ${artwork.department}`;
            infoMeta.style.fontSize = '0.8rem';
            infoMeta.style.marginTop = '5px';

            // Evento interactivo para navegar al detalle al hacer clic (Requerimiento 4.1.3)
            card.addEventListener('click', () => {
                window.location.hash = `#detail/${artwork.objectID}`;
            });

            card.appendChild(infoTitle);
            card.appendChild(infoArtist);
            card.appendChild(infoMeta);
            grid.appendChild(card);
        });

        gallerySection.appendChild(grid);
    })
    .catch(error => {
        console.error("Fallo general en la UI de Home:", error);
        loadingIndicator.remove();
        
        const errorState = document.createElement('div');
        errorState.className = 'error-state';
        errorState.style.padding = '20px';
        errorState.style.border = '1px dashed var(--color-accent)';
        
        const errorText = document.createElement('p');
        errorText.textContent = 'Hubo un inconveniente al conectar con los servidores del Met Museum.';
        errorText.style.color = 'var(--color-accent)';
        
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Reintentar carga';
        retryBtn.addEventListener('click', () => handleRouting());

        errorState.appendChild(errorText);
        errorState.appendChild(retryBtn);
        gallerySection.appendChild(errorState);
    });

    return container;
}