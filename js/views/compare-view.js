function renderCompareView() {
    const container = document.createElement('div');
    container.className = 'compare-view-container';
    container.style.padding = '30px';

    const title = document.createElement('h1');
    title.textContent = 'Comparador Interactivo de Obras';
    container.appendChild(title);

    // Contenedor flexible para las dos columnas
    const compareGrid = document.createElement('div');
    compareGrid.className = 'compare-grid';
    compareGrid.style.display = 'flex';
    compareGrid.style.gap = '30px';
    compareGrid.style.marginTop = '20px';

    // Intentamos recuperar ambas obras del localStorage
    const obra1Guardada = localStorage.getItem('obra_seleccionada_1');
    const obra2Guardada = localStorage.getItem('obra_seleccionada_2');

    // --- COLUMNA 1: OBRA BASE ---
    const col1 = document.createElement('div');
    col1.className = 'compare-column';
    col1.style.flex = '1';
    col1.style.border = '1px solid #e0e0e0';
    col1.style.padding = '20px';
    col1.style.borderRadius = '8px';
    col1.style.background = '#fff';

    if (obra1Guardada) {
        const obra1 = JSON.parse(obra1Guardada);
        col1.innerHTML = `
            <h2 style="color: #800000; margin-top:0;">Obra Base (1)</h2>
            <div style="text-align:center; margin-bottom:15px; height:250px; display:flex; align-items:center; justify-content:center; background:#f5f5f5; border-radius:4px;">
                <img src="${obra1.image}" style="max-height:240px; max-width:100%; object-fit:contain;">
            </div>
            <h3>${obra1.title}</h3>
            <p><strong>Artista:</strong> ${obra1.artist}</p>
            <p><strong>Año:</strong> ${obra1.date}</p>
            <p><strong>Técnica:</strong> ${obra1.medium}</p>
            <button id="btn-clear-slot1" style="margin-top:15px; background:#a00; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Quitar Obra 1</button>
        `;
    } else {
        col1.innerHTML = `
            <h2 style="color: #777; margin-top:0;">Obra Base (1)</h2>
            <p style="color: #999; font-style: italic; text-align:center; margin-top:50px;">Ninguna obra seleccionada.<br>Explora la colección y añade una obra para comenzar.</p>
        `;
    }

    // --- COLUMNA 2: OBRA DE CONTRASTE ---
    const col2 = document.createElement('div');
    col2.className = 'compare-column';
    col2.style.flex = '1';
    col2.style.border = '1px solid #e0e0e0';
    col2.style.padding = '20px';
    col2.style.borderRadius = '8px';
    col2.style.background = '#fff';

    if (obra2Guardada) {
        const obra2 = JSON.parse(obra2Guardada);
        col2.innerHTML = `
            <h2 style="color: #2a52be; margin-top:0;">Obra de Contraste (2)</h2>
            <div style="text-align:center; margin-bottom:15px; height:250px; display:flex; align-items:center; justify-content:center; background:#f5f5f5; border-radius:4px;">
                <img src="${obra2.image}" style="max-height:240px; max-width:100%; object-fit:contain;">
            </div>
            <h3>${obra2.title}</h3>
            <p><strong>Artista:</strong> ${obra2.artist}</p>
            <p><strong>Año:</strong> ${obra2.date}</p>
            <p><strong>Técnica:</strong> ${obra2.medium}</p>
            <button id="btn-clear-slot2" style="margin-top:15px; background:#a00; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Quitar Obra 2</button>
        `;
    } else {
        col2.innerHTML = `
            <h2 style="color: #777; margin-top:0;">Obra de Contraste (2)</h2>
            <p style="color: #999; font-style: italic; text-align:center; margin-top:50px;">Esperando segunda obra...<br>Regresa a la galería, entra en otra obra y presiónala para contrastarla aquí automáticamente.</p>
        `;
    }

    compareGrid.appendChild(col1);
    compareGrid.appendChild(col2);
    container.appendChild(compareGrid);

    // Usamos setTimeout para asegurar que los elementos ya existan en el DOM antes de buscar sus IDs
    setTimeout(() => {
        const clearBtn1 = container.querySelector('#btn-clear-slot1');
        if (clearBtn1) {
            clearBtn1.addEventListener('click', () => {
                localStorage.removeItem('obra_seleccionada_1');
                window.location.reload(); // Refresca la vista para actualizar el estado
            });
        }

        const clearBtn2 = container.querySelector('#btn-clear-slot2');
        if (clearBtn2) {
            clearBtn2.addEventListener('click', () => {
                localStorage.removeItem('obra_seleccionada_2');
                window.location.reload();
            });
        }
    }, 0);

    return container;
}

// Generador de la tabla
function buildComparisonTable(obraA, obraB) {
    const keys = ['objectDate', 'medium', 'dimensions', 'culture', 'period'];
    let rows = keys.map(key => {
        const valA = obraA[key] || 'N/A';
        const valB = obraB[key] || 'N/A';
        const isDifferent = valA !== valB;
        
        return `
            <tr class="${isDifferent ? 'highlight' : ''}">
                <td>${valA}</td>
                <td><strong>${key.toUpperCase()}</strong></td>
                <td>${valB}</td>
            </tr>`;
    }).join('');

    return `
        <table class="comparison-table">
            <thead><tr><th>Obra A</th><th>Atributo</th><th>Obra B</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}