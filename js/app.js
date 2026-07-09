const temaGuardado = localStorage.getItem('tema_preferido');
const botónTema = document.getElementById('theme-toggle');

(function() {
    console.log("MetHub SPA cargada correctamente.");
    if (!window.location.hash) {
        window.location.hash = '#home';
    }
})();

if (temaGuardado === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (botónTema) botónTema.textContent = '☀️'; 
} else {
    if (botónTema) botónTema.textContent = '🌙'; 
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const htmlElement = document.documentElement;
            const temaActual = htmlElement.getAttribute('data-theme');
            
            if (temaActual === 'dark') {
                // Cambiar a Modo Claro
                htmlElement.removeAttribute('data-theme');
                localStorage.setItem('tema_preferido', 'light');
                themeToggleBtn.textContent = '🌙';
            } else {
                // Cambiar a Modo Oscuro
                htmlElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('tema_preferido', 'dark');
                themeToggleBtn.textContent = '☀️';
            }
        });
        
    } 
});

window.createArtImage = function(src, alt) {
    const img = document.createElement('img');
    
    if (src) {
        img.src = src;
    } else {
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" font-family="sans-serif" font-size="10" fill="%23555" text-anchor="middle" dy=".3em">Sin imagen</text></svg>';
        img.style.backgroundColor = '#1a1a1a'; 
    }

    img.onerror = function() {
        this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" font-family="sans-serif" font-size="10" fill="%23555" text-anchor="middle" dy=".3em">Sin imagen</text></svg>';
        this.style.backgroundColor = '#1a1a1a';
    };
    
    return img;
};