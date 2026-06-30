async function renderDetailView(id) {
    const container = document.createElement('div');
    container.className = 'detail-container';
    
    // 1. Mostrar estado de carga mientras llega la respuesta
    container.innerHTML = `<p class="loading-state">Cargando detalles de la obra...</p>`;

    try {
        // 2. Llamada a la API (Asíncrona)
        const obra = await MetAPI.getObjectDetails(id);
        
        // 3. Renderizar la estructura completa
        container.innerHTML = `
            <div class="split-layout">
                <div class="column-left">
                    <img src="${obra.primaryImage || 'placeholder.jpg'}" alt="${obra.title}">
                    <div id="additional-gallery" class="gallery-grid"></div>
                </div>
                <div class="column-right">
                    <h1>${obra.title || 'Sin título'}</h1>
                    <p><strong>Artista:</strong> <a href="#artist/${encodeURIComponent(obra.artistDisplayName)}">${obra.artistDisplayName || 'Artista desconocido'}</a></p>
                    <p><strong>Fecha:</strong> ${obra.objectDate || '—'}</p>
                    <p><strong>Medio:</strong> ${obra.medium || '—'}</p>
                    <p><strong>Dimensiones:</strong> ${obra.dimensions || '—'}</p>
                    <p><strong>Cultura:</strong> ${obra.culture || '—'}</p>
                    <p><strong>Periodo:</strong> ${obra.period || '—'}</p>
                    <p><strong>Crédito:</strong> ${obra.creditLine || '—'}</p>
                </div>
            </div>
        `;

        // 4. Renderizar imágenes adicionales (RF-08)
        const gallery = container.querySelector('#additional-gallery');
        if (obra.additionalImages && obra.additionalImages.length > 0) {
            obra.additionalImages.forEach(imgUrl => {
                const img = document.createElement('img');
                img.src = imgUrl;
                gallery.appendChild(img);
            });
        }

    } catch (error) {
        container.innerHTML = `<div class="error-state">Error al cargar la obra.</div>`;
    }
    
    return container;
}