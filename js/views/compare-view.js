// Estado único para la vista
const compareState = { a: null, b: null };

async function renderCompareView() {
    const container = document.createElement('div');
    container.className = 'compare-view';

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
        <div id="comparison-result" style="margin-top: 20px;"></div>
    `;
    return container;
}

// Función única y global de carga
window.loadCompare = async (slot) => {
    const inputId = document.getElementById(`id-${slot}`).value;
    if (!inputId) return;

    try {
        const obra = await MetAPI.getObjectDetails(inputId);
        compareState[slot] = obra;

        // Feedback: Actualiza el panel correspondiente
        const panel = document.getElementById(`panel-${slot}`);
        // Removemos feedback previo si existe para no acumular párrafos
        panel.querySelectorAll('p').forEach(p => p.remove());
        panel.insertAdjacentHTML('beforeend', `<p>✅ Cargado: <strong>${obra.title}</strong></p>`);

        // Generar tabla solo si ambos slots tienen datos
        if (compareState.a && compareState.b) {
            document.getElementById('comparison-result').innerHTML = buildComparisonTable(compareState.a, compareState.b);
        }
    } catch (error) {
        alert("Error al cargar la obra. Verifica el ID.");
        console.error(error);
    }
};

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