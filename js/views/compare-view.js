async function renderCompareView() {
    const container = document.createElement('div');
    container.className = 'compare-view';
    
    // UI de búsqueda inicial (RF-11)
    container.innerHTML = `
        <h1>Comparador de Obras</h1>
        <div class="split-layout">
            <div class="column-left" id="panel-a">
                <input type="text" id="id-a" placeholder="ID de Obra A">
                <button onclick="loadCompare('a')">Cargar A</button>
            </div>
            <div class="column-right" id="panel-b">
                <input type="text" id="id-b" placeholder="ID de Obra B">
                <button onclick="loadCompare('b')">Cargar B</button>
            </div>
        </div>
        <div id="comparison-result"></div>
    `;
    return container;
}

// Lógica de contraste (RF-12)
function buildComparisonTable(obraA, obraB) {
    const keys = ['objectDate', 'medium', 'dimensions', 'culture', 'period'];
    let rows = '';
    
    keys.forEach(key => {
        // Tu función compareValues adaptada
        const valA = obraA[key] || 'N/A';
        const valB = obraB[key] || 'N/A';
        const isDifferent = valA !== valB;
        
        rows += `
            <tr class="${isDifferent ? 'highlight' : ''}">
                <td>${valA}</td>
                <td><strong>${key.toUpperCase()}</strong></td>
                <td>${valB}</td>
            </tr>`;
    });

    return `
        <table class="comparison-table">
            <thead><tr><th>Obra A</th><th>Atributo</th><th>Obra B</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}