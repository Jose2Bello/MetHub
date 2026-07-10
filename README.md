# MetHub — Explorador de la Colección del Met Museum (Edición Académica)

MetHub es una aplicación web de tipo **Single Page Application (SPA)** desarrollada en JavaScript modular nativo (Vanilla JS) que consume e interactúa en tiempo real con la API de acceso abierto del Museo Metropolitano de Arte de Nueva York (The Met). El sistema permite explorar colecciones masivas, filtrar interactivamente por departamentos, consultar la galería completa de artistas específicos y realizar comparaciones técnicas y cronológicas minuciosas entre piezas de arte histórico.

Este proyecto ha sido estructurado bajo estrictos criterios de optimización asíncrona, robustez frente a datos inconsistentes provistos por servicios externos, prevención de inyecciones de código y modularidad limpia.

---

## Datos del Proyecto e Integrantes
* **Institución:** Universidad Rafael Urdaneta (URU).
* **Materia / Contexto:** Proyecto de Desarrollo Web - Ingeniería de Computación.
* **Integrantes y División del Trabajo:**
  * **José Andrés Bello López:** Diseño y desarrollo de la arquitectura del enrutador (`router.js`), lógica asíncrona en cascada, implementación del control anti-saturación de peticiones, algoritmos de comparación y sincronización matemática de datos.
  * **Santiago Salas:** Maquetación estructural de interfaces, diseño de hojas de estilo (`styles.css`), provisión y optimización de assets gráficos, estructuración semántica del DOM y desarrollo del componente de contingencia para el tratamiento de recursos de imagen faltantes.

---

## Decisiones Técnicas Relevantes y Arquitectura

Para cumplir con los lineamientos del Documento de Requerimientos y maximizar el rendimiento, se tomaron decisiones de ingeniería de software clave que prescinden por completo de frameworks pesados (como React, Angular o Vue):

1. **Enrutamiento Limpio basado en Hashes (`router.js`):** La navegación se gestiona interceptando globalmente el evento `hashchange` del objeto `window`. El enrutador aísla la ruta base (`path`) de los parámetros de consulta (`queryParams`), previniendo que los caracteres de búsqueda interfieran con la lógica de navegación dinámica.
2. **Ciclo de Renderizado Síncrono-Asíncrono:** Para erradicar errores de tipo `TypeError` al intentar inyectar promesas pendientes en el DOM, cada vista es una función pura que crea y retorna de manera **síncrona e inmediata** un contenedor estructural (un nodo del DOM vacío o con pantallas de carga). Posteriormente, una sub-función **asíncrona** se encarga de rellenar los datos en segundo plano una vez que la API responde.
3. **Manejo Concurrente con `Promise.allSettled`:** En lugar de utilizar `Promise.all` (que se cancela por completo si una sola petición de red falla), la aplicación procesa la descarga paralela de múltiples fichas técnicas de objetos de forma independiente. Esto garantiza que si una pintura no responde, el resto de la galería se renderice sin colapsar la interfaz del usuario.
4. **Seguridad contra Ataques de Inyección:** Se restringe rigurosamente el uso de `innerHTML` al procesar datos que provienen de la API externa. Toda inserción de texto o metadatos se realiza mediante la creación estática de elementos (`document.createElement`) y la asignación por `textContent`, blindando la aplicación.

---

## Explicación Detallada de los Componentes e Interfaces

La aplicación se compone de **6 vistas principales**, cada una diseñada de manera modular y autónoma:

### 1. Vista de Inicio (`home-view.js`)
* **Descripción:** Es el punto de control y bienvenida de MetHub. Proporciona un entorno visual sobrio y museístico que introduce al usuario en la experiencia del catálogo digital.
* **Funcionamiento Interno:** Renderiza un diseño de bienvenida que incluye un banner destacado del museo (utilizando el recurso `20BREUER-superJumbo-v3.jpg`) y botones semánticos de redirección que manipulan el `window.location.hash` de forma orgánica para guiar al usuario hacia las secciones de exploración o departamentos.

### 2. Vista de Exploración y Búsqueda (`explore-view.js`)
* **Descripción:** Interfaz de búsqueda global unificada que permite interrogar libremente el índice de metadatos de las 470,000 obras del museo.
* **Funcionamiento Interno:** Captura los términos introducidos por el usuario y realiza peticiones condicionales al endpoint `/search`. Procesa los arreglos de identificadores devueltos y activa un lote asíncrono para descargar y mostrar las mini-fichas en una cuadrícula responsiva orientada al usuario.

### 3. Vista de Departamentos (`departments-view.js`)
* **Descripción:** Agrupa de manera estructurada y taxonómica las colecciones del museo de acuerdo a sus 21 divisiones físicas oficiales (como Arte Egipcio, Instrumentos Musicales o la Colección Robert Lehman).
* **Funcionamiento Interno:** Renderiza una matriz de tarjetas estéticas que representan cada departamento del Met Museum. Cada tarjeta está vinculada dinámicamente a un evento de clic que actualiza el hash hacia la ruta de galería específica (`#department-gallery/id`), inyectando el identificador numérico oficial provisto por el catálogo.

### 4. Vista de Galería por Departamento (`department-gallery-view.js`)
* **Descripción:** Despliega de forma exclusiva las obras que forman parte del inventario del departamento seleccionado en la vista anterior.
* **Funcionamiento Interno:** Recibe el parámetro `deptId` desde el enrutador, ejecuta una petición filtrada (`/search?departmentId=ID`) para obtener las obras con imágenes disponibles en esa sección, y renderiza concurrentemente un lote inicial de tarjetas de arte, permitiendo al usuario profundizar de manera segmentada en la historia del arte.

### 5. Vista de Detalle de la Obra (`detail-view.js`)
* **Descripción:** Pantalla de visualización exhaustiva orientada a una única pieza de arte. Muestra los metadatos completos y expandidos requeridos por la rúbrica.
* **Funcionamiento Interno:** Extrae el ID de la obra desde la URL, consulta el endpoint `/objects/ID` y despliega en alta resolución la imagen de la obra junto a sus datos técnicos: Título, Autor (con enlace interactivo a su biografía), Cultura de origen, Período cronológico, Técnica/Medio utilizado, Dimensiones físicas y Clasificación. Cuenta con un botón de **"Comparar Obra"**, el cual serializa el objeto actual y lo almacena temporalmente en el `localStorage` del navegador para transferirlo al módulo comparador de manera transparente.

### 6. Vista del Módulo Comparador Avanzado (`compare-view.js`)
* **Descripción:** Herramienta interactiva avanzada que permite la yuxtaposición y el análisis crítico lado a lado de dos piezas de arte de forma simultánea.
* **Funcionamiento Interno y Sub-Funciones:**
  * **Doble Panel Simultáneo:** Estructura dos columnas de interacción independientes (Panel A y Panel B). Si el usuario accedió desde la Vista de Detalle, el Panel A lee el `localStorage` e inicializa automáticamente fijando esa obra; en caso contrario, ambos paneles inician en estado de búsqueda.
  * **Buscador Interno con Debounce:** Cada panel posee un campo de texto con un temporizador (*debounce*) de 400ms. Evita disparar peticiones instantáneas a la API por cada letra tecleada, mitigando el tráfico innecesario.
  * **Bloqueo Físico Anti-Saturación:** En el instante en que comienza una consulta asíncrona, la función inyecta la propiedad `disabled = true` en los inputs y botones del panel activo. Esto congela la interfaz temporalmente durante el flujo de red, impidiendo que clics repetidos o desesperados colapsen la API del Met.
  * **Validación de Restricción Cruzada:** Al desplegar los resultados de búsqueda en un panel, el algoritmo verifica el ID de la obra seleccionada en el panel espejo. Si coinciden, la tarjeta se renderiza con opacidad reducida, cursor inhabilitado y la etiqueta `[Ya seleccionada]`, impidiendo la duplicidad de datos.
  * **Tabla de Atributos Dinámica:** Al estar fijadas ambas obras, se genera dinámicamente una matriz que evalúa los 8 criterios mínimos exigidos. El sistema procesa los strings mediante `.toLowerCase()` y añade la clase CSS `.diferente` a las filas cuyos textos diverjan, ofreciendo un contraste visual inmediato.
  * **Cálculo de Delta Cronológico:** Extrae los valores numéricos correspondientes a los años de finalización de ambas obras (`objectEndDate`) y calcula de forma matemática el valor absoluto de su diferencia (`Math.abs`), desplegando un banner inferior que indica la brecha exacta de tiempo que separa la creación de ambas piezas.

### 7. Vista de Galería Exclusiva del Artista con Paginación (`artist-view.js`)
* **Descripción:** Pantalla dinámica encargada de recopilar y listar de forma masiva todas las piezas de arte del catálogo asociadas al nombre de un autor en particular.
* **Funcionamiento Interno y Paginación:**
  * **Captura Temática:** Se activa al hacer clic en el nombre de cualquier artista en la aplicación. El enrutador extrae el string y lo decodifica limpiamente mediante `decodeURIComponent` para evitar fallos con los espacios y caracteres especiales en la URL.
  * **Estrategia de Carga por Bloques:** Al iniciar, realiza una consulta rápida al endpoint `/search?artistOrCulture=true&q=Nombre` para absorber el arreglo completo de identificadores del autor. En lugar de procesarlos todos simultáneamente (lo cual provocaría un bloqueo de IP por spam de peticiones), la vista implementa un estado interno que fracciona el arreglo utilizando `.slice()`.
  * **Función `cargarSiguienteBloque`:** Renderiza los elementos en tandas estrictas de 8 en 8 obras mediante el uso coordinado de `Promise.allSettled`. Al final de la cuadrícula, genera un botón interactivo dinámico que le indica al usuario cuántas piezas quedan pendientes en el catálogo (ej: *"Ver más obras (24 restantes)"*). Cuando el inventario total es consumido, el botón se destruye limpiamente en el DOM y se inyecta un mensaje de cierre de colección.

---

## Robustez frente a Inconsistencias (Tratamiento de Datos)

* **Estrategia de Control de Nulos (Campos Incompletos):** Dado que el inventario del museo posee miles de piezas arqueológicas de autores desconocidos o metadatos perdidos, la aplicación procesa cada respuesta mediante operadores lógicos de cortocircuito (`||`). Si la API devuelve valores nulos o vacíos, el sistema los convierte automáticamente en textos limpios como `"Anónimo"`, `"Desconocido"` o `"No especificado"`, evitando que las palabras nativas de JavaScript se filtren en la pantalla.
* **Mapeo de Imágenes de Contingencia (SVG Inline Patches):** Uno de los retos técnicos más grandes de la API del Met es que muchas obras carecen de fotografía digital libre o sus enlaces externos fallan temporalmente. Para mitigar esto, las tarjetas implementan un escuchador de eventos `onerror` en sus etiquetas de imagen. Si el recurso falla en cargar o no existe, el sistema inyecta en caliente una cadena de datos vectoriales:
  `data:image/svg+xml;utf8,<svg...><text>Sin imagen</text></svg>`
  Estableciendo un fondo `#1a1a1a` que preserva intacta la simetría, maquetación y elegancia visual de la cuadrícula diseñada por Santiago sin romper el flujo del DOM.

---

## 💻 Instrucciones para la Ejecución del Proyecto

De total conformidad con la Sección 9 (Consideraciones Adicionales) de la cátedra, la aplicación fue diseñada para operar de forma transparente en entornos planos de archivos locales sin requerir dependencias, compiladores o la instalación obligatoria de servidores de desarrollo:

1. Descargue o clone los archivos del proyecto dentro de un directorio local en su computadora.
2. Localice el archivo principal **`index.html`** ubicado en la raíz del proyecto.
3. Haga doble clic sobre el archivo `index.html` o arrástrelo hacia la ventana de cualquier navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari).
4. La aplicación se inicializará instantáneamente bajo el protocolo seguro de archivos locales (`file:///...`), desplegando la navegación por hashes y permitiendo el uso completo de todas las funcionalidades dinámicas (búsquedas, detalles, galería de artistas paginada y comparador de obras).

---

## 📝 Aviso de Acceso Abierto (Open Access Disclaimer)

De acuerdo con las pautas de uso educativo requeridas, los datos, metadatos y recursos de imágenes consumidos por esta aplicación web se extraen de la API oficial del Metropolitan Museum of Art (The Met) y forman parte del programa de Dominio Público y Acceso Abierto del museo. Los estudiantes responsables certifican que el uso de estas piezas gráficas e informativas se realiza de manera estrictamente académica, de investigación y sin fines comerciales de lucro.