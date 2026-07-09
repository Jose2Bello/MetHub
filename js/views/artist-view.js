function renderArtistView(artistName) {
    const container = document.createElement('div');
    container.className = 'artist-view-container';
    container.style.padding = '30px';


    let paginaActual = 1;
    const obrasPorPagina = 12;
    let listaIds = [];

    // 1. Cabecera Inicial Estática
    const btnVolver = document.createElement('button');
    btnVolver.textContent = '← Volver';
    btnVolver.style.cssText = 'padding: 8px 16px; background: var(--bg-tarjetas); color: var(--texto-primario); border: 1px solid var(--color-borde); border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 20px;';
    btnVolver.addEventListener('click', () => window.history.back());
    container.appendChild(btnVolver);

    const headerSection = document.createElement('div');
    headerSection.style.marginBottom = '30px';

    const title = document.createElement('h1');
    title.style.fontFamily = "'BlackChancery', var(--font-serif)";
    title.style.color = 'var(--color-accent)';
    title.textContent = decodeURIComponent(artistName);
    headerSection.appendChild(title);

    const bioElement = document.createElement('p');
    bioElement.style.cssText = 'font-style: italic; color: var(--texto-secundario); margin-top: 8px; max-width: 800px;';
    bioElement.textContent = 'Buscando datos biográficos en la colección... ⏳';
    headerSection.appendChild(bioElement);

    const totalElement = document.createElement('span');
    totalElement.style.cssText = 'display: inline-block; margin-top: 5px; font-weight: bold; font-size: 0.95rem;';
    headerSection.appendChild(totalElement);

    container.appendChild(headerSection);

    // Contenedor de la Galería
    const grid = document.createElement('div');
    grid.className = 'artworks-grid';
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 25px;';
    container.appendChild(grid);

    // Contenedor de Paginación
    const paginationContainer = document.createElement('div');
    paginationContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 40px;';
    container.appendChild(paginationContainer);

    // --- FUNCIÓN DE RENDEREADO DECLARADA ANTES DE USARSE ---
    async function cargarPaginaArtista() {
        grid.textContent = 'Cargando obras del artista... ⏳';
        paginationContainer.textContent = '';

        const inicio = (paginaActual - 1) * obrasPorPagina;
        const fin = inicio + obrasPorPagina;
        const bloqueIds = listaIds.slice(inicio, fin);

        // Mapeamos los IDs a promesas. Nos aseguramos de usar fetch directo si MetAPI falla
        const promesasDetalle = bloqueIds.map(id => {
            return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null);
        });

        const resultados = await Promise.allSettled(promesasDetalle);
        grid.textContent = ''; // Limpiamos carga

        let bioEncontrada = false;
        let obrasRenderizadas = 0;

        resultados.forEach(res => {
            if (res.status === 'rejected' || !res.value) return;

            const obra = res.value;
            obrasRenderizadas++;

            if (!bioEncontrada && obra.artistDisplayBio) {
                bioElement.textContent = obra.artistDisplayBio;
                bioEncontrada = true;
            }

            const card = document.createElement('div');
            card.className = 'artwork-card';
            card.style.cssText = 'background: var(--bg-tarjetas); border: 1px solid var(--color-borde); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s;';
            card.addEventListener('click', () => window.location.hash = `#detail/${obra.objectID}`);

            const imgBox = document.createElement('div');
            imgBox.style.cssText = 'height: 200px; background: #eaeaea; display:flex; align-items:center; justify-content:center; overflow:hidden;';
            
            const img = document.createElement('img');
            img.src = obra.primaryImageSmall || obra.primaryImage || 'https://via.placeholder.com/300x200/f5f5f5/777777?text=Sin+Imagen';
            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
            imgBox.appendChild(img);

            const infoBox = document.createElement('div');
            infoBox.style.padding = '15px';

            const artTitle = document.createElement('h3');
            artTitle.style.cssText = 'margin: 0 0 8px 0; font-size: 1.05rem; color: var(--texto-primario);';
            artTitle.textContent = obra.title || 'Sin título';

            const artDate = document.createElement('p');
            artDate.style.cssText = 'margin: 0; font-size: 0.9rem; color: var(--texto-secundario);';
            artDate.textContent = obra.objectDate || 'Fecha desconocida';

            infoBox.appendChild(artTitle);
            infoBox.appendChild(artDate);
            card.appendChild(imgBox);
            card.appendChild(infoBox);
            grid.appendChild(card);
        });

        if (!bioEncontrada && paginaActual === 1) {
            bioElement.textContent = 'Artista documentado en las colecciones del museo.';
        }

        if (obrasRenderizadas === 0) {
            grid.textContent = 'Las obras de este lote no contienen imágenes públicas para mostrar.';
        }

        renderizarControlesPaginacion();
    }

    function renderizarControlesPaginacion() {
        const totalPaginas = Math.ceil(listaIds.length / obrasPorPagina);
        if (totalPaginas <= 1) return;

        const btnPrev = document.createElement('button');
        btnPrev.textContent = 'Anterior';
        btnPrev.disabled = paginaActual === 1;
        btnPrev.addEventListener('click', () => { paginaActual--; cargarPaginaArtista(); });

        const txtPagina = document.createElement('span');
        txtPagina.textContent = ` Página ${paginaActual} de ${totalPaginas} `;

        const btnNext = document.createElement('button');
        btnNext.textContent = 'Siguiente';
        btnNext.disabled = paginaActual === totalPaginas;
        btnNext.addEventListener('click', () => { paginaActual++; cargarPaginaArtista(); });

        paginationContainer.appendChild(btnPrev);
        paginationContainer.appendChild(txtPagina);
        paginationContainer.appendChild(btnNext);
    }

    const urlBusqueda = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(artistName)}&artistOrCulture=true`;
    
    fetch(urlBusqueda)
        .then(res => res.json())
        .then(data => {
            if (!data.objectIDs || data.objectIDs.length === 0) {
                bioElement.textContent = '';
                totalElement.textContent = 'Total de obras: 0';
                grid.textContent = 'No se encontraron obras asociadas a este artista.';
                return;
            }

            listaIds = data.objectIDs;
            totalElement.textContent = `Total de obras encontradas: ${listaIds.length}`;
            
            
            cargarPaginaArtista();
        })
        .catch(err => {
            console.error("Error en la consulta del artista:", err);
            bioElement.textContent = '';
            grid.textContent = 'Hubo un problema de conexión con el Met Museum. Intente recargar.';
        });

    return container;
}