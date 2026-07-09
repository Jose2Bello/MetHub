function renderDetailView(obraId) {
    const container = document.createElement('div');
    container.className = 'detail-view-container';
    container.style.padding = '30px';

    // Texto o indicador de carga inicial
    const loading = document.createElement('p');
    loading.textContent = 'Cargando detalles de la obra... ⏳';
    container.appendChild(loading);

    // Llamamos a la API para obtener los detalles de la obra única
    MetAPI.getObjectDetails(obraId).then(obra => {
        if (!obra) {
            container.textContent = 'No se pudo encontrar la información de esta obra.';
            return;
        }

        container.textContent = ''; // Limpiamos el texto de carga de manera segura

        // --- BOTÓN VOLVER ---
        const btnVolver = document.createElement('button');
        btnVolver.textContent = '← Volver';
        btnVolver.style.cssText = 'padding: 8px 16px; background: var(--bg-tarjetas); color: var(--texto-primario); border: 1px solid var(--color-borde); border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 20px;';
        btnVolver.addEventListener('click', () => window.history.back());
        container.appendChild(btnVolver);

        // --- CONTENEDOR PRINCIPAL DEL DETALLE (Layout de dos columnas) ---
        const detailLayout = document.createElement('div');
        detailLayout.style.cssText = 'display: flex; gap: 40px; flex-wrap: wrap; margin-top: 10px;';

        // PANEL IZQUIERDO: Imagen de la obra
        const imagePanel = document.createElement('div');
        imagePanel.style.cssText = 'flex: 1; min-width: 300px; text-align: center; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid var(--color-borde); display: flex; align-items: center; justify-content: center; max-height: 500px;';
        
        const img = document.createElement('img');
        img.src = obra.primaryImage || obra.primaryImageSmall || 'https://via.placeholder.com/400x400/f5f5f5/777777?text=Sin+Imagen+Disponible';
        img.style.cssText = 'max-width: 100%; max-height: 470px; object-fit: contain; border-radius: 4px;';
        imagePanel.appendChild(img);
        detailLayout.appendChild(imagePanel);

        // PANEL DERECHO: Información Técnica (Ficha)
        const infoPanel = document.createElement('div');
        infoPanel.style.cssText = 'flex: 1.2; min-width: 300px; display: flex; flex-direction: column; gap: 15px;';

        const title = document.createElement('h1');
        title.className = 'detail-title';
        title.style.cssText = 'margin-top: 0; color: var(--texto-primario);';
        title.textContent = obra.title || 'Sin título';
        infoPanel.appendChild(title);

        // --- FILA DEL ARTISTA INTERACTIVA (Requerimiento V-05) ---
        const pArtista = document.createElement('p');
        const strongArtist = document.createElement('strong');
        strongArtist.textContent = 'Artista: ';
        pArtista.appendChild(strongArtist);

        if (obra.artistDisplayName) {
            const linkArtista = document.createElement('a');
            linkArtista.textContent = obra.artistDisplayName;
            linkArtista.style.cssText = 'color: var(--color-accent); cursor: pointer; text-decoration: underline; font-weight: 500;';
            
            // Evento click que viaja a la nueva vista monográfica de artista
            linkArtista.addEventListener('click', () => {
                window.location.hash = `#artist/${encodeURIComponent(obra.artistDisplayName)}`;
            });
            pArtista.appendChild(linkArtista);
        } else {
            const spanAnonimo = document.createElement('span');
            spanAnonimo.textContent = 'Artista desconocido o anónimo';
            pArtista.appendChild(spanAnonimo);
        }
        infoPanel.appendChild(pArtista);

        // --- OTRAS FILAS DE INFORMACIÓN TÉCNICA (
        infoPanel.appendChild(crearFilaTecnica('Año / Época: ', obra.objectDate || 'No especificada'));
        infoPanel.appendChild(crearFilaTecnica('Técnica / Materiales: ', obra.medium || 'No especificado'));
        infoPanel.appendChild(crearFilaTecnica('Dimensión: ', obra.dimensions || 'No especificadas'));
        infoPanel.appendChild(crearFilaTecnica('Cultura: ', obra.culture || 'No especificada'));
        infoPanel.appendChild(crearFilaTecnica('Clasificación: ', obra.classification || 'No catalogada'));

        // --- BOTÓN ENVIAR AL COMPARADOR INTERACTIVO ---
        const compareBtn = document.createElement('button');
        compareBtn.textContent = 'Añadir al Comparador Interactivo 🏛️';
        compareBtn.style.cssText = 'margin-top: 20px; padding: 12px 24px; background: var(--color-accent); color: white; border: none; border-radius: 4px; font-size: 1rem; font-weight: bold; cursor: pointer; max-width: 320px; transition: background 0.2s;';
        
        // Mantener la lógica inteligente de slots automáticos que creamos antes
        compareBtn.addEventListener('click', () => {
            const obraParaComparar = {
                id: obra.objectID,
                title: obra.title || 'Sin título',
                artist: obra.artistDisplayName || 'Artista desconocido',
                image: obra.primaryImageSmall || obra.primaryImage || 'https://via.placeholder.com/300x200/f5f5f5/777777?text=Sin+Imagen',
                date: obra.objectDate || 'Desconocida',
                medium: obra.medium || 'No especificado',
                department: obra.department || 'No especificado',
                classification: obra.classification || 'No catalogada',
                culture: obra.culture || 'No especificada',
                isHighlight: obra.isHighlight ? 'Sí' : 'No',
                isPublicDomain: obra.isPublicDomain ? 'Sí' : 'No',
                endDate: obra.objectEndDate || null
            };
            
            const obra1Guardada = localStorage.getItem('obra_seleccionada_1');
            
            if (!obra1Guardada) {
                localStorage.setItem('obra_seleccionada_1', JSON.stringify(obraParaComparar));
            } else {
                const obra1 = JSON.parse(obra1Guardada);
                if (obra1.id === obraParaComparar.id) {
                    alert('¡Ya seleccionaste esta obra como la Obra Base! Elige una diferente para comparar.');
                    return;
                }
                localStorage.setItem('obra_seleccionada_2', JSON.stringify(obraParaComparar));
            }
            
            // Redirige al comparador de forma nativa
            window.location.hash = '#compare';
        });

        infoPanel.appendChild(compareBtn);
        detailLayout.appendChild(infoPanel);
        container.appendChild(detailLayout);

    }).catch(err => {
        console.error("Error cargando la obra de arte:", err);
        container.textContent = 'Ocurrió un error al cargar la ficha de detalles técnicos.';
    });

    return container;
}

// Función auxiliar reutilizable para inyectar filas con texto seguro
function crearFilaTecnica(label, valor) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = label;
    
    const span = document.createElement('span');
    span.textContent = valor;
    
    p.appendChild(strong);
    p.appendChild(span);
    return p;
}