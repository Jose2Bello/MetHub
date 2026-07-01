
function renderCompareView() {
    const container = document.createElement('div');
    container.className = 'compare-view';

    const title = document.createElement('h1');
    title.textContent = 'Comparador de Obras';
    container.appendChild(title);

    const splitLayout = document.createElement('div');
    splitLayout.className = 'split-layout';

    
    function createPanel(idPrefix) {
        const panel = document.createElement('div');
        panel.className = `column-${idPrefix === 'a' ? 'left' : 'right'}`;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `id-${idPrefix}`;
        input.placeholder = `ID de Obra ${idPrefix.toUpperCase()}`;
        
        const btn = document.createElement('button');
        btn.textContent = `Cargar ${idPrefix.toUpperCase()}`;
        
        
        btn.addEventListener('click', () => loadCompare(idPrefix));
        
        panel.appendChild(input);
        panel.appendChild(btn);
        return panel;
    }

    splitLayout.appendChild(createPanel('a'));
    splitLayout.appendChild(createPanel('b'));
    container.appendChild(splitLayout);

    const resultDiv = document.createElement('div');
    resultDiv.id = 'comparison-result';
    resultDiv.style.marginTop = '20px';
    container.appendChild(resultDiv);

    return container;
}

// Variable de estado local para el comparador
let compareState = { a: null, b: null };

async function loadCompare(slot) {
    const inputId = document.getElementById(`id-${slot}`).value;
    if (!inputId) return;

    try {
        const obra = await MetAPI.getObjectDetails(inputId);
        compareState[slot] = obra;

  
        const panel = document.getElementById(`panel-${slot}`);
        
        panel.querySelectorAll('p').forEach(p => p.remove());

     
        const p = document.createElement('p');
        p.textContent = 'Cargado: ';
        const strong = document.createElement('strong');
        strong.textContent = obra.title || 'Título desconocido';
        p.appendChild(strong);
        panel.appendChild(p);

        // Si ambos slots tienen datos, construimos la tabla
        if (compareState.a && compareState.b) {
            const resultContainer = document.getElementById('comparison-result');
            resultContainer.innerHTML = ''; // Limpiamos el resultado anterior
            
            const table = buildComparisonTable(compareState.a, compareState.b);
            resultContainer.appendChild(table);
        }
    } catch (error) {
        alert("Error al cargar la obra. Verifica el ID.");
        console.error(error);
    }
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