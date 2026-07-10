function renderArtistView(artistNameClean) {
    const artistName = decodeURIComponent(artistNameClean);

    // 1. CREACIÓN DEL CONTENEDOR BASE (Síncrono)
    const container = document.createElement('div');
    container.className = 'artist-view-container';
    container.style.padding = '30px';
    container.style.maxWidth = '1200px';
    container.style.margin = '0 auto';

    // Botón para volver atrás
    const btnVolver = document.createElement('button');
    btnVolver.textContent = '⬅ Volver';
    btnVolver.style.cssText = 'padding: 8px 16px; margin-bottom: 20px; background: var(--bg-tarjetas); color: var(--texto-primario); border: 1px solid var(--color-borde); border-radius: 4px; cursor: pointer; font-weight: bold;';
    btnVolver.addEventListener('click', () => {
        window.history.back();
    });
    container.appendChild(btnVolver);

    // Cabecera de la Vista
    const headerHeader = document.createElement('div');
    headerHeader.style.marginBottom = '30px';
    
    const title = document.createElement('h1');
    title.style.fontFamily = "'BlackChancery', var(--font-serif)";
    title.style.color = 'var(--color-accent)';
    title.style.margin = '0 0 10px 0';
    title.textContent = `Galería de: ${artistName}`;
    headerHeader.appendChild(title);

    const subTitle = document.createElement('p');
    subTitle.style.fontStyle = 'italic';
    subTitle.style.color = 'var(--texto-secundario)';
    subTitle.textContent = `Explorando las colecciones y piezas exhibidas en el museo asociadas a este autor.`;
    headerHeader.appendChild(subTitle);
    container.appendChild(headerHeader);

    // Contenedor de estado / Carga
    const statusBox = document.createElement('div');
    statusBox.style.cssText = 'text-align: center; padding: 40px; font-size: 1.2rem; font-weight: 500;';
    statusBox.textContent = 'Buscando obras del artista en el catálogo... ⏳';
    container.appendChild(statusBox);

    // Grid de tarjetas
    const galleryGrid = document.createElement('div');
    galleryGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; margin-top: 20px;';
    container.appendChild(galleryGrid);

    // Contenedor inferior para el botón de paginación
    const paginationBox = document.createElement('div');
    paginationBox.style.cssText = 'display: flex; justify-content: center; margin-top: 40px;';
    container.appendChild(paginationBox);

    // --- VARIABLES DE CONTROL DE PAGINACIÓN (ESTADO INTERNO) ---
    let todosLosIds = [];
    let posicionActual = 0;
    const ELEMENTOS_POR_PAGINA = 8;

    // Botón dinámico "Cargar más"
    const btnCargarMas = document.createElement('button');
    btnCargarMas.style.cssText = 'padding: 12px 24px; background: var(--color-accent); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1rem; display: none; transition: background 0.2s;';
    btnCargarMas.addEventListener('mouseenter', () => btnCargarMas.style.filter = 'brightness(0.9)');
    btnCargarMas.addEventListener('mouseleave', () => btnCargarMas.style.filter = 'brightness(1)');
    paginationBox.appendChild(btnCargarMas);


    const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&q=${encodeURIComponent(artistName)}`;

    fetch(searchUrl)
        .then(res => res.json())
        .then(data => {
            if (!data.objectIDs || data.objectIDs.length === 0) {
                statusBox.textContent = `❌ No se encontraron registros de obras con imágenes para "${artistName}".`;
                return;
            }

            // Guardamos todos los IDs encontrados en el estado de la vista
            todosLosIds = data.objectIDs;
            statusBox.style.display = 'none';

            // Ejecutamos la carga del primer bloque de 8
            cargarSiguienteBloque();
        })
        .catch(() => {
            statusBox.textContent = '⚠️ Hubo un problema de conexión con el servidor de la API.';
        });

    // --- FUNCIÓN QUE RESUELVE CADA PÁGINA (BLOQUE) ---
    async function cargarSiguienteBloque() {
        // Bloqueamos el botón temporalmente para que no hagan spam clics mientras carga la página
        btnCargarMas.disabled = true;
        btnCargarMas.textContent = 'Cargando más obras... ⏳';

        // Extraemos el segmento (página) correspondiente
        const limiteSiguiente = posicionActual + ELEMENTOS_POR_PAGINA;
        const loteIds = todosLosIds.slice(posicionActual, limiteSiguiente);

        const promesas = loteIds.map(id => {
            return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null);
        });

        const resultados = await Promise.allSettled(promesas);

        resultados.forEach(res => {
            if (res.status === 'rejected' || !res.value) return;
            const obra = res.value;

            // Construcción de la Tarjeta
            const card = document.createElement('div');
            card.style.cssText = 'background: var(--bg-tarjetas); border: 1px solid var(--color-borde); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;';
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            });

            card.addEventListener('click', () => {
                window.location.hash = `#detail/${obra.objectID}`;
            });

            // Imagen con Parche SVG Integrado
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = 'height: 220px; background: #1a1a1a; display: flex; align-items: center; justify-content: center; overflow: hidden;';

            const img = document.createElement('img');
            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
            
            const srcImg = obra.primaryImageSmall || obra.primaryImage;
            if (srcImg) {
                img.src = srcImg;
            } else {
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" font-family="sans-serif" font-size="10" fill="%23555" text-anchor="middle" dy=".3em">Sin imagen</text></svg>';
                img.style.backgroundColor = '#1a1a1a'; 
            }

            img.onerror = function() {
                this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" font-family="sans-serif" font-size="10" fill="%23555" text-anchor="middle" dy=".3em">Sin imagen</text></svg>';
                this.style.backgroundColor = '#1a1a1a';
            };

            imgContainer.appendChild(img);
            card.appendChild(imgContainer);

            // Información
            const infoBody = document.createElement('div');
            infoBody.style.padding = '15px';
            infoBody.style.display = 'flex';
            infoBody.style.flexDirection = 'column';
            infoBody.style.gap = '8px';

            const oTitle = document.createElement('h3');
            oTitle.style.cssText = 'margin: 0; font-size: 1rem; color: var(--texto-primario); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            oTitle.textContent = obra.title || 'Sin título';
            infoBody.appendChild(oTitle);

            const oDate = document.createElement('p');
            oDate.style.cssText = 'margin: 0; font-size: 0.85rem; color: var(--texto-secundario);';
            oDate.textContent = `Año: ${obra.objectDate || 'Desconocido'}`;
            infoBody.appendChild(oDate);

            const oDept = document.createElement('span');
            oDept.style.cssText = 'font-size: 0.75rem; background: var(--bg-principal); padding: 4px 8px; border-radius: 4px; width: fit-content; border: 1px solid var(--color-borde); color: var(--texto-secundario);';
            oDept.textContent = obra.department || 'General';
            infoBody.appendChild(oDept);

            card.appendChild(infoBody);
            galleryGrid.appendChild(card);
        });

        // Actualizamos el puntero de nuestra posición en el arreglo global
        posicionActual += ELEMENTOS_POR_PAGINA;

        // Evaluamos si quedan más obras por mostrar para reconfigurar el botón
        if (posicionActual < todosLosIds.length) {
            btnCargarMas.disabled = false;
            btnCargarMas.style.display = 'block';
            btnCargarMas.textContent = `Ver más obras (${todosLosIds.length - posicionActual} restantes)`;
        } else {
            // Si ya cargamos todo, ocultamos el botón limpiamente
            btnCargarMas.style.display = 'none';
            
            const endMsg = document.createElement('p');
            endMsg.textContent = '✨ Has llegado al final de la colección de este artista.';
            endMsg.style.cssText = 'color: var(--texto-secundario); font-style: italic;';
            paginationBox.appendChild(endMsg);
        }
    }

    // Vinculamos el clic del botón a la ejecución de la siguiente tanda
    btnCargarMas.addEventListener('click', cargarSiguienteBloque);

    return container;
}