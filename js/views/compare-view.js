function renderCompareView() {
    const container = document.createElement('div');
    container.className = 'compare-view-container';
    container.style.padding = '30px';

    // Título Principal
    const title = document.createElement('h1');
    title.style.fontFamily = "'BlackChancery', var(--font-serif)";
    title.style.color = 'var(--color-accent)';
    title.textContent = 'Comparador Interactivo de Obras';
    container.appendChild(title);

    // Contenedor de las dos columnas de selección
    const gridLayout = document.createElement('div');
    gridLayout.style.cssText = 'display: flex; gap: 30px; flex-wrap: wrap; margin-top: 20px;';
    container.appendChild(gridLayout);

    // Espacio reservado abajo para la Tabla Comparativa Dinámica
    const tableContainer = document.createElement('div');
    tableContainer.style.marginTop = '40px';
    container.appendChild(tableContainer);

    // Variables de Estado de la vista en memoria
    let obraA = null;
    let obraB = null;

    // Inicialización por si viene una obra guardada desde la vista de detalles
    const obra1Guardada = localStorage.getItem('obra_seleccionada_1');
    const obra2Guardada = localStorage.getItem('obra_seleccionada_2');
    if (obra1Guardada) obraA = JSON.parse(obra1Guardada);
    if (obra2Guardada) obraB = JSON.parse(obra2Guardada);

    // Limpiamos la memoria inmediata del "acarreo"
    localStorage.removeItem('obra_seleccionada_1');
    localStorage.removeItem('obra_seleccionada_2');

    // Construcción y renderizado de los paneles iniciales
    const panelA = crearPanel('A');
    const panelB = crearPanel('B');
    gridLayout.appendChild(panelA);
    gridLayout.appendChild(panelB);

    // Dibujar la tabla si ya hay datos iniciales de acarreo
    actualizarTablaComparativa();

    // --- FUNCIÓN GENERADORA DE LOS PANELES DE BÚSQUEDA ---
    function crearPanel(letra) {
        const col = document.createElement('div');
        col.id = `panel-${letra}`;
        col.style.cssText = 'flex: 1; min-width: 300px; border: 1px solid var(--color-borde); padding: 20px; border-radius: 8px; background: var(--bg-tarjetas); display: flex; flex-direction: column; gap: 15px; position: relative;';

        const obraActual = (letra === 'A') ? obraA : obraB;

        if (obraActual) {
            // --- ESTADO: OBRA FIJADA / SELECCIONADA ---
            const h2 = document.createElement('h2');
            h2.textContent = `Obra ${letra}: Seleccionada`;
            h2.style.cssText = 'margin: 0; color: var(--color-accent); font-size: 1.2rem;';
            col.appendChild(h2);

            const imgBox = document.createElement('div');
            imgBox.style.cssText = 'height: 200px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden;';
            const img = document.createElement('img');
            img.src = obraActual.image;
            img.style.cssText = 'max-height: 100%; max-width: 100%; object-fit: contain;';
            imgBox.appendChild(img);
            col.appendChild(imgBox);

            const h3 = document.createElement('h3');
            h3.style.margin = '0';
            h3.textContent = obraActual.title;
            col.appendChild(h3);

            const pArtist = document.createElement('p');
            pArtist.style.margin = '0';
            pArtist.textContent = `Artista: ${obraActual.artist}`;
            col.appendChild(pArtist);

            const btnCambiar = document.createElement('button');
            btnCambiar.textContent = 'Cambiar selección 🔄';
            btnCambiar.style.cssText = 'padding: 8px 12px; background: var(--bg-principal); color: var(--texto-primario); border: 1px solid var(--color-borde); border-radius: 4px; cursor: pointer; font-weight: bold; align-self: flex-start;';
            btnCambiar.addEventListener('click', () => {
                if (letra === 'A') obraA = null;
                else obraB = null;
                
                const nuevoPanel = crearPanel(letra);
                gridLayout.replaceChild(nuevoPanel, col);
                actualizarTablaComparativa();
            });
            col.appendChild(btnCambiar);

        } else {
            // --- ESTADO INICIAL: MINI-BUSCADOR INTERNO CON DEBOUNCE ---
            const h2 = document.createElement('h2');
            h2.textContent = `Seleccionar Obra ${letra}`;
            h2.style.cssText = 'margin: 0; color: var(--texto-secundario); font-size: 1.2rem;';
            col.appendChild(h2);

            const inputBusqueda = document.createElement('input');
            inputBusqueda.type = 'text';
            inputBusqueda.id = `input-busqueda-${letra}`;
            inputBusqueda.placeholder = 'Busca una obra por nombre, artista, tema…';
            inputBusqueda.style.cssText = 'padding: 10px; border: 1px solid var(--color-borde); border-radius: 4px; background: var(--bg-principal); color: var(--texto-primario); width: 100%; box-sizing: border-box;';
            col.appendChild(inputBusqueda);

            const statusMsg = document.createElement('p');
            statusMsg.textContent = 'Busca y elige una obra para comparar.';
            statusMsg.style.cssText = 'font-style: italic; color: var(--texto-secundario); text-align: center; margin: 20px 0;';
            col.appendChild(statusMsg);

            const sugerenciasBox = document.createElement('div');
            sugerenciasBox.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
            col.appendChild(sugerenciasBox);

            // Debounce 400ms
            let debounceTimer;
            inputBusqueda.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                const query = inputBusqueda.value.trim();

                if (query.length < 3) {
                    sugerenciasBox.textContent = '';
                    statusMsg.style.display = 'block';
                    statusMsg.textContent = 'Busca y elige una obra para comparar.';
                    return;
                }

                statusMsg.style.display = 'block';
                statusMsg.textContent = 'Buscando coincidencias... ⏳';
                sugerenciasBox.textContent = '';

                debounceTimer = setTimeout(() => {
                    ejecutarBusquedaPanel(query, sugerenciasBox, statusMsg, col, letra);
                }, 400);
            });
        }

        return col;
    }

    // --- LOGICA ASÍNCRONA PARALELA ---
  function ejecutarBusquedaPanel(query, targetBox, txtStatus, panelOriginal, letra) {
        const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true`;

        // 1. >>> ANTES DEL FETCH: Bloqueamos los controles para evitar spam <<<
        const inputActual = document.getElementById(`input-busqueda-${letra}`);
        if (inputActual) inputActual.disabled = true;

        // Bloquear también botones de "Cambiar selección" que existan en el otro panel para evitar interrupciones
        const botonesCambiar = container.querySelectorAll('button');
        botonesCambiar.forEach(btn => btn.disabled = true);

        fetch(url)
            .then(res => res.json())
            .then(async data => {
                if (!data.objectIDs || data.objectIDs.length === 0) {
                    txtStatus.textContent = '❌ No se encontraron obras con ese término.';
                    // Desbloqueamos si no hay resultados
                    if (inputActual) inputActual.disabled = false;
                    botonesCambiar.forEach(btn => btn.disabled = false);
                    return;
                }

                txtStatus.textContent = 'Resolviendo fichas técnicas... ⏳';
                const loteIds = data.objectIDs.slice(0, 6);
                
                const promesas = loteIds.map(id => {
                    return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
                        .then(r => r.ok ? r.json() : null)
                        .catch(() => null);
                });

                const resultados = await Promise.allSettled(promesas);
                
                // 2. >>> DESPUÉS DEL FETCH (ÉXITO): Liberamos los controles globales <<<
                if (inputActual) inputActual.disabled = false;
                botonesCambiar.forEach(btn => btn.disabled = false);

                txtStatus.style.display = 'none';
                targetBox.textContent = '';

                resultados.forEach(res => {
                    if (res.status === 'rejected' || !res.value) return;
                    const obra = res.value;

                    const miniCard = document.createElement('div');
                    miniCard.style.cssText = 'display: flex; gap: 12px; padding: 8px; border: 1px solid var(--color-borde); border-radius: 4px; background: var(--bg-principal); align-items: center; cursor: pointer; transition: background 0.2s;';
                    
                    const obraEnEspejo = (letra === 'A') ? obraB : obraA;
                    if (obraEnEspejo && obraEnEspejo.id === obra.objectID) {
                        miniCard.style.opacity = '0.5';
                        miniCard.style.cursor = 'not-allowed';
                        miniCard.style.background = 'rgba(200,0,0,0.05)';
                        
                        const warning = document.createElement('span');
                        warning.textContent = '[Ya seleccionada]';
                        warning.style.cssText = 'font-size: 0.75rem; color: #a00; font-weight: bold; margin-left: auto;';
                        miniCard.appendChild(warning);
                    } else {
                        miniCard.addEventListener('mouseenter', () => miniCard.style.background = 'var(--bg-tarjetas)');
                        miniCard.addEventListener('mouseleave', () => miniCard.style.background = 'var(--bg-principal)');
                        
                        miniCard.addEventListener('click', () => {
                            const datosEstructurados = {
                                id: obra.objectID,
                                title: obra.title || 'Sin título',
                                artist: obra.artistDisplayName || 'Anónimo',
                                image: obra.primaryImageSmall || obra.primaryImage || 'https://via.placeholder.com/300x200/f5f5f5/777777?text=Sin+Imagen',
                                date: obra.objectDate || 'Desconocida',
                                medium: obra.medium || 'No especificado',
                                department: obra.department || 'No especificado',
                                classification: obra.classification || 'No catalogada',
                                culture: obra.culture || 'No especificada',
                                isHighlight: obra.isHighlight ? 'Sí' : 'No',
                                isPublicDomain: obra.isPublicDomain ? 'Sí' : 'No',
                                endDate: obra.objectEndDate || 0
                            };

                            if (letra === 'A') obraA = datosEstructurados;
                            else obraB = datosEchromada = datosEstructurados;

                            const panelFijado = crearPanel(letra);
                            gridLayout.replaceChild(panelFijado, panelOriginal);
                            actualizarTablaComparativa();
                        });
                    }

                    const miniImg = document.createElement('img');
                    miniImg.src = obra.primaryImageSmall || 'https://via.placeholder.com/60x60/f5f5f5/777777?text=No';
                    miniImg.style.cssText = 'width: 50px; height: 50px; object-fit: cover; border-radius: 2px; flex-shrink: 0;';
                    miniCard.appendChild(miniImg);

                    const textBox = document.createElement('div');
                    const tText = document.createElement('div');
                    tText.textContent = obra.title || 'Sin título';
                    tText.style.cssText = 'font-weight: bold; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;';
                    
                    const aText = document.createElement('div');
                    aText.textContent = obra.artistDisplayName || 'Anónimo';
                    aText.style.cssText = 'font-size: 0.8rem; color: var(--texto-secundario);';
                    
                    textBox.appendChild(tText);
                    textBox.appendChild(aText);
                    miniCard.appendChild(textBox);

                    targetBox.appendChild(miniCard);
                });
            })
            .catch(() => {
                // 3. >>> EN CASO DE ERROR: También garantizamos liberar la interfaz <<<
                if (inputActual) inputActual.disabled = false;
                botonesCambiar.forEach(btn => btn.disabled = false);
                
                txtStatus.style.display = 'block';
                txtStatus.textContent = '⚠️ Error en el servidor.';
            });
    }


   
    function actualizarTablaComparativa() {
        tableContainer.textContent = ''; 
        if (!obraA || !obraB) return;

        const table = document.createElement('table');
        table.style.cssText = 'width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.95rem; text-align: left;';

        const thead = document.createElement('thead');
        thead.style.cssText = 'background: var(--color-accent); color: white; font-weight: bold;';
        
        const trHead = document.createElement('tr');
        ['Característica', `Obra A: ${obraA.title}`, `Obra B: ${obraB.title}`].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.padding = '12px';
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        const criterios = [
            { label: 'Artista', campo: 'artist' },
            { label: 'Año / Época', campo: 'date' },
            { label: 'Departamento', campo: 'department' },
            { label: 'Técnica (Medium)', campo: 'medium' },
            { label: 'Clasificación', campo: 'classification' },
            { label: 'Cultura', campo: 'culture' },
            { label: '¿Es obra destacada?', campo: 'isHighlight' },
            { label: '¿Es de dominio público?', campo: 'isPublicDomain' }
        ];

        criterios.forEach(crit => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--color-borde)';

            const valA = String(obraA[crit.campo] || '').trim();
            const valB = String(obraB[crit.campo] || '').trim();

            const sonDiferentes = valA.toLowerCase() !== valB.toLowerCase();
            if (sonDiferentes) {
                tr.style.backgroundColor = 'rgba(255, 165, 0, 0.12)'; 
                tr.style.fontWeight = '500';
            }

            const tdLabel = document.createElement('td');
            tdLabel.textContent = crit.label;
            tdLabel.style.padding = '12px';
            if (sonDiferentes) tdLabel.textContent += ' 🔸';

            const tdA = document.createElement('td');
            tdA.textContent = valA || 'No especificado';
            tdA.style.padding = '12px';

            const tdB = document.createElement('td');
            tdB.textContent = valB || 'No especificado';
            tdB.style.padding = '12px';

            tr.appendChild(tdLabel);
            tr.appendChild(tdA);
            tr.appendChild(tdB);
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);

        const anioA = parseInt(obraA.endDate);
        const anioB = parseInt(obraB.endDate);

        if (!isNaN(anioA) && !isNaN(anioB) && anioA !== 0 && anioB !== 0) {
            const diferencia = Math.abs(anioA - anioB);
            const deltaBox = document.createElement('div');
            deltaBox.style.cssText = 'margin-top: 20px; padding: 15px; background: var(--bg-tarjetas); border: 1px dashed var(--color-accent); border-radius: 6px; text-align: center; font-size: 1.05rem; font-weight: bold;';
            deltaBox.textContent = `⏱️ Diferencia cronológica estimada entre ambas obras: ${diferencia} años.`;
            tableContainer.appendChild(deltaBox);
        }
    }

    return container;
}