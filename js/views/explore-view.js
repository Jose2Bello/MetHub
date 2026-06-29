/**
 * MetHub — Controlador de Vista: Exploración Avanzada (#explore)
 * Versión Final: Implementación Completa con Indicadores Estadísticos en Vivo (RF-05)
 */

function renderExploreView() {
    const container = document.createElement('div');
    container.className = 'view-explore';

    // VARIABLES DE ESTADO INTERNO DE LA VISTA
    let currentSearchIds = [];
    let currentPage = 1;
    const itemsPerPage = 12; // Requerimiento 4.2.3
    let debounceTimer = null;

    // 1. TÍTULO DE LA VISTA
    const title = document.createElement('h1');
    title.textContent = 'Exploración Avanzada de la Colección';
    container.appendChild(title);

    // ==========================================================================
    // 2. PANEL DE FILTROS Y BÚSQUEDA
    // ==========================================================================
    const searchForm = document.createElement('div');
    searchForm.className = 'search-form';
    searchForm.style.backgroundColor = 'var(--bg-surface)';
    searchForm.style.padding = '20px';
    searchForm.style.border = '1px solid var(--color-border)';
    searchForm.style.borderRadius = '6px';
    searchForm.style.marginBottom = '30px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar por palabra clave (ej: Rembrandt, Gold, Vase)...';
    searchInput.className = 'input-text';
    searchInput.style.width = '100%';
    searchInput.style.padding = '10px';
    searchInput.style.marginBottom = '15px';
    searchInput.style.borderRadius = '4px';
    searchInput.style.border = '1px solid var(--color-border)';
    searchForm.appendChild(searchInput);

    const filtersContainer = document.createElement('div');
    filtersContainer.style.display = 'flex';
    filtersContainer.style.gap = '20px';
    filtersContainer.style.flexWrap = 'wrap';
    filtersContainer.style.alignItems = 'center';

    const deptSelect = document.createElement('select');
    deptSelect.className = 'select-dept';
    deptSelect.style.padding = '10px';
    deptSelect.style.borderRadius = '4px';
    deptSelect.style.border = '1px solid var(--color-border)';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Todos los Departamentos';
    deptSelect.appendChild(defaultOption);
    filtersContainer.appendChild(deptSelect);

    const highlightLabel = document.createElement('label');
    highlightLabel.style.display = 'flex';
    highlightLabel.style.alignItems = 'center';
    highlightLabel.style.gap = '5px';
    const highlightCheck = document.createElement('input');
    highlightCheck.type = 'checkbox';
    highlightLabel.appendChild(highlightCheck);
    highlightLabel.appendChild(document.createTextNode('Solo Obras Destacadas'));
    filtersContainer.appendChild(highlightLabel);

    const imagesLabel = document.createElement('label');
    imagesLabel.style.display = 'flex';
    imagesLabel.style.alignItems = 'center';
    imagesLabel.style.gap = '5px';
    const imagesCheck = document.createElement('input');
    imagesCheck.type = 'checkbox';
    imagesCheck.checked = true;
    imagesLabel.appendChild(imagesCheck);
    imagesLabel.appendChild(document.createTextNode('Solo con Imagen Disponible'));
    filtersContainer.appendChild(imagesLabel);

    searchForm.appendChild(filtersContainer);
    container.appendChild(searchForm);

    // ==========================================================================
    // 3. SECCIÓN DE ESTADÍSTICAS EN VIVO (Contenedor de Métricas Agregadas RF-05)
    // ==========================================================================
    const liveStatsContainer = document.createElement('div');
    liveStatsContainer.className = 'stats-section';
    container.appendChild(liveStatsContainer);

    // ==========================================================================
    // 4. CONTENEDOR DE LA REJILLA DE RESULTADOS
    // ==========================================================================
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'gallery-grid';
    container.appendChild(resultsContainer);

    const statusMessage = document.createElement('p');
    statusMessage.textContent = 'Escribe un término arriba para comenzar a explorar la colección.';
    statusMessage.style.color = 'var(--color-muted)';
    statusMessage.style.textAlign = 'center';
    statusMessage.style.padding = '40px 0';
    statusMessage.style.width = '100%';
    resultsContainer.appendChild(statusMessage);

    // ==========================================================================
    // 5. CONTROLES DE PAGINACIÓN
    // ==========================================================================
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-controls';
    paginationContainer.style.display = 'flex';
    paginationContainer.style.justifyContent = 'center';
    paginationContainer.style.gap = '15px';
    paginationContainer.style.marginTop = '30px';

    const btnPrev = document.createElement('button');
    btnPrev.textContent = '← Anterior';
    btnPrev.disabled = true;

    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = 'Página 1 de 1';
    pageIndicator.style.alignSelf = 'center';

    const btnNext = document.createElement('button');
    btnNext.textContent = 'Siguiente →';
    btnNext.disabled = true;

    paginationContainer.appendChild(btnPrev);
    paginationContainer.appendChild(pageIndicator);
    paginationContainer.appendChild(btnNext);
    container.appendChild(paginationContainer);

    // ==========================================================================
    // 6. ANALIZADOR DE MÉTRICAS EN TIEMPO REAL (LÓGICA RF-05)
    // ==========================================================================
    function calculateLivePageStats(artworks) {
        liveStatsContainer.innerHTML = ''; // Limpiar estadísticas previas

        if (!artworks || artworks.length === 0) return;

        const deptCounts = {};
        const centuryCounts = {};

        artworks.forEach(art => {
            // A. Procesar Frecuencia de Departamentos
            const dept = art.department || 'Desconocido';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;

            // B. Extracción e Identificación de Siglos (Regex e Inferencia básica)
            let century = 'Indeterminado';
            const dateStr = (art.objectDate || '').toLowerCase();
            const periodStr = (art.period || '').toLowerCase();

            // Evaluar si la API ya define explícitamente el siglo en texto
            const centuryMatch = dateStr.match(/(\d+)(st|nd|rd|th)\s+century/);
            if (centuryMatch) {
                century = `Siglo ${centuryMatch[1]}`;
            } else {
                // Intentar extraer números que parezcan años de 3 o 4 dígitos
                const yearMatches = dateStr.match(/\b(\d{3,4})\b/g);
                if (yearMatches && yearMatches.length > 0) {
                    const year = parseInt(yearMatches[0], 10);
                    if (!isNaN(year) && year > 0) {
                        const calculatedCentury = Math.ceil(year / 100);
                        century = `Siglo ${calculatedCentury}`;
                    }
                } else if (periodStr && periodStr !== '—') {
                    century = art.period; // Caída controlada al Periodo histórico si no hay año numérico
                }
            }
            centuryCounts[century] = (centuryCounts[century] || 0) + 1;
        });

        // Encontrar la Moda (El valor más repetido) para Departamentos
        let dominantDept = 'Desconocido';
        let maxDeptCount = 0;
        Object.entries(deptCounts).forEach(([dept, count]) => {
            if (count > maxDeptCount) {
                maxDeptCount = count;
                dominantDept = dept;
            }
        });

        // Encontrar la Moda para el Siglo / Época
        let dominantCentury = 'Indeterminado';
        let maxCenturyCount = 0;
        Object.entries(centuryCounts).forEach(([cen, count]) => {
            if (count > maxCenturyCount) {
                maxCenturyCount = count;
                dominantCentury = cen;
            }
        });

        // --- Renderizar los Bloques Visuales de las Métricas Agregadas ---
        const statsTitle = document.createElement('h3');
        statsTitle.textContent = 'Métricas de la Página Actual';
        statsTitle.style.fontSize = '1.1rem';
        statsTitle.style.marginBottom = '15px';
        liveStatsContainer.appendChild(statsTitle);

        const wrapper = document.createElement('div');
        wrapper.className = 'stats-container';

        const deptCard = document.createElement('div');
        deptCard.className = 'stats-card';
        deptCard.innerHTML = `<span>Departamento Común</span><strong>${dominantDept}</strong><small style="color: var(--color-muted)">Aparece ${maxDeptCount} vez/veces en esta página</small>`;

        const centuryCard = document.createElement('div');
        centuryCard.className = 'stats-card';
        centuryCard.innerHTML = `<span>Época/Siglo Dominante</span><strong>${dominantCentury}</strong><small style="color: var(--color-muted)">Representa a ${maxCenturyCount} obra(s) listada(s)</small>`;

        wrapper.appendChild(deptCard);
        wrapper.appendChild(centuryCard);
        liveStatsContainer.appendChild(wrapper);
    }

    // ==========================================================================
    // 7. CONTROLADOR CENTRAL DE LOGICA ASÍNCRONA
    // ==========================================================================
    function executeSearch() {
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            liveStatsContainer.innerHTML = '';
            statusMessage.textContent = 'Escribe un término arriba para comenzar a explorar la colección.';
            resultsContainer.appendChild(statusMessage);
            currentSearchIds = [];
            updatePaginationUI();
            return;
        }

        resultsContainer.innerHTML = '';
        liveStatsContainer.innerHTML = '';
        statusMessage.textContent = 'Buscando en los servidores del Met...';
        resultsContainer.appendChild(statusMessage);

        let extraParams = '';
        if (deptSelect.value) extraParams += `&departmentId=${deptSelect.value}`;
        if (highlightCheck.checked) extraParams += `&isHighlight=true`;
        if (imagesCheck.checked) extraParams += `&hasImages=true`;

        MetAPI.searchObjects(query, extraParams)
            .then(data => {
                resultsContainer.innerHTML = '';

                if (!data || !data.objectIDs || data.objectIDs.length === 0) {
                    statusMessage.textContent = 'No se encontraron obras con los filtros aplicados.';
                    resultsContainer.appendChild(statusMessage);
                    currentSearchIds = [];
                    updatePaginationUI();
                    return;
                }

                currentSearchIds = data.objectIDs;
                currentPage = 1;
                renderCurrentPageResults();
            })
            .catch(err => {
                console.error("Fallo en la búsqueda de explore:", err);
                resultsContainer.innerHTML = '';
                statusMessage.textContent = 'Error de red al conectar con el Met Museum. Intente de nuevo.';
                resultsContainer.appendChild(statusMessage);
            });
    }

    async function renderCurrentPageResults() {
        resultsContainer.innerHTML = '';
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageIds = currentSearchIds.slice(startIndex, endIndex);

        const innerLoading = document.createElement('p');
        innerLoading.className = 'loading-state';
        innerLoading.textContent = `Cargando obras de la página ${currentPage}...`;
        resultsContainer.appendChild(innerLoading);

        updatePaginationUI();

        // Resolución Concurrente Obligatoria (RNF-04)
        const artworks = await MetAPI.resolveObjectIDs(pageIds);
        innerLoading.remove();

        if (artworks.length === 0) {
            statusMessage.textContent = 'Las obras de esta sección no pudieron ser procesadas.';
            resultsContainer.appendChild(statusMessage);
            return;
        }

        // NUEVO: Invocar el cálculo estadístico dinámico sobre las obras devueltas
        calculateLivePageStats(artworks);

        // Renderizar las tarjetas resultantes (RNF-07)
        artworks.forEach(artwork => {
            const card = document.createElement('div');
            card.className = 'artwork-card';

            const img = document.createElement('img');
            img.src = artwork.primaryImageSmall || 'https://placehold.co/400x300?text=Sin+Imagen';
            img.alt = artwork.title || 'Obra del Met';
            card.appendChild(img);

            const cardTitle = document.createElement('h3');
            cardTitle.textContent = artwork.title || 'Título desconocido';
            cardTitle.style.fontSize = '1rem';

            const cardArtist = document.createElement('p');
            cardArtist.textContent = artwork.artistDisplayName || 'Artista desconocido';

            const cardMeta = document.createElement('p');
            cardMeta.textContent = `${artwork.objectDate || '—'} | ${artwork.department || '—'}`;
            cardMeta.style.fontSize = '0.8rem';

            card.appendChild(cardTitle);
            card.appendChild(cardArtist);
            card.appendChild(cardMeta);

            card.addEventListener('click', () => {
                window.location.hash = `#detail/${artwork.objectID}`;
            });

            resultsContainer.appendChild(card);
        });
    }

    function updatePaginationUI() {
        const totalPages = Math.ceil(currentSearchIds.length / itemsPerPage) || 1;
        pageIndicator.textContent = `Página ${currentPage} de ${totalPages} (Total: ${currentSearchIds.length})`;
        
        btnPrev.disabled = (currentPage === 1);
        btnNext.disabled = (currentPage === totalPages || currentSearchIds.length === 0);
    }

    // ==========================================================================
    // 8. LISTENERS CON DEBOUNCE Y MANEJO DE EVENTOS
    // ==========================================================================
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            executeSearch();
        }, 500);
    });

    deptSelect.addEventListener('change', () => executeSearch());
    highlightCheck.addEventListener('change', () => executeSearch());
    imagesCheck.addEventListener('change', () => executeSearch());

    btnPrev.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPageResults();
        }
    });

    btnNext.addEventListener('click', () => {
        const totalPages = Math.ceil(currentSearchIds.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPageResults();
        }
    });

    // ==========================================================================
    // EXTRAS: CARGA INICIAL DE DEPARTAMENTOS
    // ==========================================================================
    MetAPI.getDepartments().then(data => {
        if (data && data.departments) {
            data.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.departmentId;
                option.textContent = dept.displayName;
                deptSelect.appendChild(option);
            });
        }
    }).catch(err => console.error(err));

    return container;
}