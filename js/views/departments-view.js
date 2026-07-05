function renderDepartmentsView() {
    const container = document.createElement('div');
    container.className = 'departments-view-container';
    container.style.padding = '30px';

    const title = document.createElement('h1');
    title.textContent = 'Áreas Curatoriales y Departamentos';
    title.style.marginBottom = '25px';
    container.appendChild(title);

    // Contenedor Grid
    const grid = document.createElement('div');
    grid.className = 'departments-grid';
    container.appendChild(grid);

    // Descripciones institucionales base para los departamentos principales del MET
    // Si la API devuelve un ID que no esté aquí, usará una descripción genérica automática
    const descripcionesDeptos = {
        1: 'Mobiliario, textiles, esculturas y elementos arquitectónicos que narran la evolución del diseño norteamericano.',
        3: 'Armas, armaduras y heráldicas de caballeros europeos, así como piezas de combate de Asia y América.',
        5: 'Trajes, indumentarias y accesorios de alta costura que documentan la moda desde el siglo XVII hasta hoy.',
        6: 'Grabados, esculturas y artefactos ceremoniales de las antiguas civilizaciones de América, África y Oceanía.',
        7: 'Tablillas cuneiformes, relieves palaciegos y sellos cilíndricos del antiguo Oriente Próximo.',
        8: 'Telas, papiros, sarcófagos y amuletos dorados de las dinastías del antiguo Egipto.',
        9: 'Pinturas, esculturas, cerámicas, grabados y artes decorativas de las grandes tradiciones de Europa.',
        11: 'Obras maestras de la pintura europea desde el Renacimiento hasta el Postimpresionismo.',
        12: 'Instrumentos musicales de todo el mundo, valorados por su diseño técnico y su herencia cultural.',
        13: 'Arte sacro, tapices, relicarios bizantinos y vidrieras que iluminaron la Edad Media occidental.',
        14: 'Fotografías desde los inicios del daguerrotipo en el siglo XIX hasta las vanguardias contemporáneas.',
        21: 'Pinturas y esculturas de los movimientos artísticos más influyentes de los siglos XX y XXI.'
    };

    // 1. Llamamos a la API para obtener los departamentos oficiales
    MetAPI.getDepartments().then(data => {
        grid.textContent = ''; // Limpiamos pantalla de carga

        data.departments.forEach(depto => {
            // Creamos la estructura base de la tarjeta inmediatamente para que el grid se arme rápido
            const card = document.createElement('div');
            card.className = 'department-card';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'dept-card-image';
            
            // Imagen temporal de carga limpia
            const img = document.createElement('img');
            img.src = 'https://via.placeholder.com/400x250/eeeeee/999999?text=Cargando+Portada...';
            img.alt = depto.displayName;
            imgContainer.appendChild(img);

            const infoContainer = document.createElement('div');
            infoContainer.className = 'dept-card-info';

            const deptTitle = document.createElement('h3');
            deptTitle.textContent = depto.displayName;

            const deptDesc = document.createElement('p');
            // Buscamos su descripción o le asignamos una genérica pulida
            deptDesc.textContent = descripcionesDeptos[depto.departmentId] || 'Colección histórica que alberga piezas arqueológicas y expresiones estéticas invaluables de esta región.';

            infoContainer.appendChild(deptTitle);
            infoContainer.appendChild(deptDesc);

            card.appendChild(imgContainer);
            card.appendChild(infoContainer);

            // Al hacer clic, navega a tu galería paginada directa
            card.addEventListener('click', () => {
                window.location.hash = `#department-gallery/${depto.departmentId}`;
            });

            grid.appendChild(card);

            //Buscamos la portada aleatoria en segundo plano para no congelar la app
            obtenerPortadaAleatoria(depto.departmentId, img);
        });
    }).catch(err => {
        console.error("Error al renderizar el menú cuadriculado:", err);
        grid.innerHTML = '<p>Error al sincronizar las áreas curatoriales.</p>';
    });

    return container;
}

async function obtenerPortadaAleatoria(deptId, imgElement) {
    try {
        // Consultamos los objetos de este departamento específico
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${deptId}`);
        const data = await response.json();

        if (data.objectIDs && data.objectIDs.length > 0) {
            const ids = data.objectIDs;
            let intento = 0;
            let imagenEncontrada = false;

            // Hacemos hasta 5 intentos aleatorios para encontrar una obra que SÍ tenga foto pública
            while (intento < 5 && !imagenEncontrada) {
                const idAzar = ids[Math.floor(Math.random() * ids.length)];
                const obra = await MetAPI.getObjectDetails(idAzar);

                // Si la obra tiene imagen pequeña o grande, la inyectamos de inmediato
                if (obra && (obra.primaryImageSmall || obra.primaryImage)) {
                    imgElement.src = obra.primaryImageSmall || obra.primaryImage;
                    imagenEncontrada = true;
                }
                intento++;
            }

            // Si tras los intentos aleatorios no pescamos ninguna con foto, usamos un respaldo digno del MET
            if (!imagenEncontrada) {
                imgElement.src = 'assets/no-image-placeholder.png'; // Tu imagen de repuesto corporativa
            }
        }
    } catch (error) {
        console.error(`No se pudo cargar la portada aleatoria para depto ${deptId}:`, error);
        imgElement.src = 'assets/no-image-placeholder.png';
    }
}