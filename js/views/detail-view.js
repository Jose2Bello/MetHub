function renderDetailView(id) {
    const container = document.createElement('div');
    const title = document.createElement('h1');
    title.textContent = `Detalle de la Obra ID: ${id}`;
    container.appendChild(title);
    return container;
}
