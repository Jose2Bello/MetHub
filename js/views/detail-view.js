function renderDetailView(artworkId) {
    const container = document.createElement('div');
    container.className = 'artwork-detail-view';

    // 1. Botón para volver atrás
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back';
    backBtn.textContent = '← Volver';
    backBtn.addEventListener('click', () => {
        window.history.back();
    });
    container.appendChild(backBtn);

    // 2. Contenedor de carga
    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'loading-text';
    loadingMessage.textContent = 'Cargando detalles de la obra maestra...';
    container.appendChild(loadingMessage);

    // 3. Contenedor principal de dos columnas
    const detailLayout = document.createElement('div');
    detailLayout.className = 'detail-layout';
    detailLayout.style.display = 'none'; 
    container.appendChild(detailLayout);

    // Llamada a la función asíncrona
    loadArtworkDetails(artworkId, loadingMessage, detailLayout);

    return container;
}


async function loadArtworkDetails(id, loadingElement, layoutElement) {
    try {
        const obra = await MetAPI.getObjectDetails(id);

        loadingElement.remove(); 
        layoutElement.style.display = 'flex'; 

        // --- COLUMNA IZQUIERDA: IMAGEN ---
        const leftColumn = document.createElement('div');
        leftColumn.className = 'detail-media-column';

        const img = document.createElement('img');
        img.src = obra.primaryImage || obra.primaryImageSmall || 'assets/no-image.png';
        img.alt = obra.title || 'Obra del Met';
        img.className = 'detail-main-image';
        leftColumn.appendChild(img);

        // --- COLUMNA DERECHA: INFORMACIÓN ---
        const rightColumn = document.createElement('div');
        rightColumn.className = 'detail-info-column';

        const title = document.createElement('h1');
        title.className = 'detail-title';
        title.textContent = obra.title || 'Sin título';

        const artist = document.createElement('h2');
        artist.className = 'detail-artist';
        artist.textContent = obra.artistDisplayName || 'Artista desconocido';
        
        if (obra.artistDisplayBio) {
            const bio = document.createElement('span');
            bio.className = 'artist-bio';
            bio.textContent = ` (${obra.artistDisplayBio})`;
            artist.appendChild(bio);
        }

        const divider = document.createElement('hr');
        const metaList = document.createElement('div');
        metaList.className = 'detail-meta-list';

        function addMetaRow(label, value) {
            if (value && value.toString().trim() !== '') {
                const row = document.createElement('p');
                row.className = 'meta-row';
                const boldLabel = document.createElement('strong');
                boldLabel.textContent = `${label}: `;
                row.appendChild(boldLabel);
                row.appendChild(document.createTextNode(value));
                metaList.appendChild(row);
            }
        }

        addMetaRow('Fecha / Período', obra.objectDate);
        addMetaRow('Departamento', obra.department);
        addMetaRow('Cultura', obra.culture);
        addMetaRow('Medio / Técnica', obra.medium);
        addMetaRow('Dimensiones', obra.dimensions);
        addMetaRow('Clasificación', obra.classification);
        addMetaRow('Lugar de origen', obra.country || obra.geographyType);
        addMetaRow('Línea de crédito', obra.creditLine);

        rightColumn.appendChild(title);
        rightColumn.appendChild(artist);
        rightColumn.appendChild(divider);
        rightColumn.appendChild(metaList);

        layoutElement.appendChild(leftColumn);
        layoutElement.appendChild(rightColumn);

    } catch (error) {
        console.error("Error al cargar el detalle de la obra:", error);
        loadingElement.textContent = 'No se pudieron cargar los detalles de esta obra de arte.';
    }
}