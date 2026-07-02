async function renderDepartmentsView() {
    const container = document.createElement('div');
    container.className = 'departments-container';
    container.innerHTML = '<h1>Departamentos</h1><div class="departments-grid"></div>';
    const grid = container.querySelector('.departments-grid');

    try {
        // 1. Obtener los departamentos desde la API
        const data = await MetAPI.getDepartments();
        const departments = data.departments;

        // 2. Renderizar cada tarjeta
        departments.forEach(depto => {
            const card = document.createElement('div');
            card.className = 'artwork-card'; // Reutilizamos el estilo de tarjetas que ya tienes
            card.innerHTML = `<h3>${depto.displayName}</h3>`;

            // 3. Lógica de navegación filtrada (lo que ya tenías)
            card.addEventListener('click', () => {
                window.location.hash = `#explore?departmentId=${depto.departmentId}`;
            });

            grid.appendChild(card);
        });

    } catch (error) {
        grid.innerHTML = `<p>Error al cargar departamentos: ${error.message}</p>`;
    }

    return container;
}