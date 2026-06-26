(function() {
    console.log("MetHub SPA cargada correctamente.");
    if (!window.location.hash) {
        window.location.hash = '#home';
    }
})();