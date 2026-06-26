function renderHomeView() {
    const container = document.createElement('div');
    container.className = 'view-home';
    
    const title = document.createElement('h1');
    title.textContent = 'Explora la colección del Met (Vista Home)';
    
    container.appendChild(title);
    return container;
}