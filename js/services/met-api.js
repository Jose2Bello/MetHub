/**
 * MetHub — Módulo de Servicio de API Centralizado
 * Gestiona peticiones distribuidas, timeouts con AbortController y resoluciones concurrentes.
 */

const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';
const REQUEST_TIMEOUT = 10000; // Timeout recomendado de 10 segundos

/**
 * Realiza una petición fetch genérica asegurando un tiempo límite de respuesta.
 * @param {string} url - URL completa del endpoint.
 * @returns {Promise<any>} - Datos parseados a formato JSON.
 */
async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error; // Propaga el error para controlarlo en la UI (ErrorState)
    }
}

/**
 * Servicio Central de la API MetHub
 */
const MetAPI = {
    /**
     * Obtiene el listado de los 19 departamentos curatoriales del museo.
     * Endpoint: GET /departments
     */
    async getDepartments() {
        const url = `${MET_API_BASE}/departments`;
        return await fetchWithTimeout(url);
    },

    /**
     * Realiza una búsqueda general de IDs basados en un término y filtros.
     * Endpoint: GET /search?q={query}&{filtros}
     * @param {string} query - Término de búsqueda.
     * @param {string} extraParams - Filtros URL-encoded (ej: "&isHighlight=true&hasImages=true")
     */
    async searchObjects(query, extraParams = '') {
        // Codificamos el query para evitar roturas por caracteres especiales o espacios
        const sanitizedQuery = encodeURIComponent(query);
        const url = `${MET_API_BASE}/search?q=${sanitizedQuery}${extraParams}`;
        return await fetchWithTimeout(url);
    },

    /**
     * Obtiene los detalles específicos de una sola obra de arte.
     * Endpoint: GET /objects/:id
     */
    async getObjectDetails(id) {
        const url = `${MET_API_BASE}/objects/${id}`;
        return await fetchWithTimeout(url);
    },

    /**
     * MOTOR DE RESOLUCIÓN CON CONCURRENCIA (OBLIGATORIO RNF-04)
     * Toma un arreglo de objectIDs, ejecuta peticiones simultáneas en paralelo
     * y extrae únicamente aquellas obras que se cargaron con éxito.
     * @param {Array<number>} ids - Listado de identificadores únicos a resolver.
     * @returns {Promise<Array<any>>} - Arreglo de objetos de obras resueltas y normalizadas.
     */
    async resolveObjectIDs(ids) {
        if (!ids || ids.length === 0) return [];

        // Mapeamos cada ID a una promesa fetch de forma paralela
        const promises = ids.map(id => this.getObjectDetails(id));

        // Ejecutamos de manera concurrente con allSettled para evitar que una caída tumbe todo
        const results = await Promise.allSettled(promises);

        // Filtramos las promesas resueltas exitosamente y normalizamos sus datos nulos
        return results
            .filter(result => result.status === 'fulfilled')
            .map(result => this.sanitizeArtworkData(result.value));
    },

    /**
     * Sanitizador de datos nulos o vacíos (OBLIGATORIO RNF-05)
     * Evita que valores incompletos rompan el renderizado en la interfaz.
     */
    sanitizeArtworkData(data) {
        return {
            objectID: data.objectID,
            title: data.title || 'Sin título',
            artistDisplayName: data.artistDisplayName || 'Artista desconocido',
            artistDisplayBio: data.artistDisplayBio || 'Sin descripción biográfica disponible.',
            objectDate: data.objectDate || '—',
            department: data.department || 'Sin departamento asignado',
            medium: data.medium || 'Técnica no especificada',
            dimensions: data.dimensions || 'Dimensiones no disponibles',
            culture: data.culture || '—',
            period: data.period || '—',
            classification: data.classification || '—',
            creditLine: data.creditLine || 'Donación/Adquisición privada',
            primaryImageSmall: data.primaryImageSmall || '', 
            primaryImage: data.primaryImage || '',
            additionalImages: data.additionalImages || [],
            objectURL: data.objectURL || 'https://www.metmuseum.org/',
            tags: data.tags ? data.tags.map(t => t.term) : []
        };
    }
};