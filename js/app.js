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