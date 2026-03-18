import * as UI from './ui.js';
import { PALABRAS_CLAVE_LISTA } from '../data/palabras.js';
import {
    MAX_PLAYERS,
    MAX_NAME_LENGTH,
    MIN_NAME_LENGTH,
    MIN_PLAYERS,
    GAME_STATE_KEY,
    PLAYER_LIST_KEY,
    IMPOSTORS_KEY,
    USED_WORDS_KEY,
    CONFIGS_KEY,
    GAME_MODE_KEY,
    PANEL_PLAYER_KEY,
    KEY_START,
    ROLE_IMPOSTOR,
    ROLE_TRIPULANTE,
    ROLE_COMPLICE,
    ROLE_DETECTIVE,
    ROLE_PARANOICO,
    ROLE_GEMELO,
    ROLE_GLITCH,
    ROLE_VIDENTE,
    ROLE_POETA,
    ROLE_DESPISTADO,
    ROLES_DATA,
    ROLE_NARRADOR,
    ROLE_LOBO,
    ROLE_LOBO_BLANCO,
    ROLE_ALDEANO,
    ROLES_LOBO_DATA,
    MODE_IMPOSTOR,
    MODE_LOBO,
    ROLE_LOBO_CACHORRO,

} from './config.js';


// === VARIABLES DE ESTADO (ASUMIDAS DE PASOS ANTERIORES) ===
let players = [];
let nextPlayerId = 1;
let usedWordsHistory = [];

let gameSettings = {
    numPlayers: 0,
    numImpostors: 0,
    palabraSecreta: ''
};

// =========================================================
// LÓGICA DE PERSISTENCIA DE PALABRAS USADAS
// =========================================================

/**
 * Carga el historial de palabras usadas desde localStorage.
 */
export function loadUsedWordsHistory() {
    try {
        const storedHistory = localStorage.getItem(USED_WORDS_KEY);
        if (storedHistory) {
            usedWordsHistory = JSON.parse(storedHistory);
            console.log(`Historial de palabras cargado: ${usedWordsHistory.length} usadas.`);
        } else {
            usedWordsHistory = [];
        }
    } catch (e) {
        console.error("Error al cargar el historial de palabras:", e);
        usedWordsHistory = []; // Resetear en caso de error de parseo
    }
}

/**
 * Guarda el historial de palabras usadas en localStorage.
 */
function saveUsedWordsHistory() {
    try {
        localStorage.setItem(USED_WORDS_KEY, JSON.stringify(usedWordsHistory));
    } catch (e) {
        console.error("Error al guardar el historial de palabras:", e);
    }
}

/**
 * Reinicia el historial de palabras usadas (lo vacía).
 */
function resetUsedWordsHistory() {
    usedWordsHistory = [];
    saveUsedWordsHistory();
    console.log("¡Todas las palabras han sido usadas! El historial ha sido vaciado.");
}

// =========================================================
// LÓGICA DE PERSISTENCIA DE LISTA (PRE-PARTIDA)
// =========================================================

/**
 * Guarda la opción de impostores seleccionada en localStorage.
 * @param {string} impostorsOption Opción seleccionada (e.g., "1", "RANDOM_30").
 */
export function saveImpostorsCount(impostorsOption) { // Aseguramos que sea exportada
    try {
        // Guardamos el valor tal cual, como cadena de texto
        localStorage.setItem(IMPOSTORS_KEY, impostorsOption.toString());
    } catch (e) {
        console.error("Error al guardar la opción de impostores:", e);
    }
}

/**
 * Carga la opción de impostores desde localStorage.
 * @returns {string|null} El valor de opción de impostores guardado o null si no existe.
 */
export function loadImpostorsCount() {
    try {
        const storedCount = localStorage.getItem(IMPOSTORS_KEY);
        if (storedCount) {
            // CORRECCIÓN: Devolver el valor crudo como string, SIN parseInt()
            return storedCount;
        }
    } catch (e) {
        console.error("Error al cargar la opción de impostores:", e);
        localStorage.removeItem(IMPOSTORS_KEY);
    }
    return null;
}

/**
 * Guarda la lista actual de jugadores (solo ID y nombre) en localStorage.
 */
function savePlayerList() {
    // Mapeamos el array para asegurar que no se guarden propiedades temporales como 'role'
    const basicPlayers = players.map(p => ({ id: p.id, name: p.name }));
    try {
        localStorage.setItem(PLAYER_LIST_KEY, JSON.stringify(basicPlayers));
    } catch (e) {
        console.error("Error al guardar la lista de jugadores:", e);
    }
}

/**
 * Carga la lista de jugadores desde localStorage si existe.
 * @returns {boolean} True si se cargó una lista, false si no.
 */
export function loadPlayerList() {
    try {
        const storedList = localStorage.getItem(PLAYER_LIST_KEY);
        if (storedList) {
            const list = JSON.parse(storedList);
            if (list.length > 0) {
                players = list; // Restaurar el array global
                // Restaurar el siguiente ID correctamente
                nextPlayerId = list.reduce((max, p) => Math.max(max, p.id), 0) + 1;
                // Redibujar la lista en la UI
                refreshPlayerListUI();
                console.log("Lista de jugadores restaurada.");
                return true;
            }
        }
    } catch (e) {
        console.error("Error al cargar la lista de jugadores:", e);
        localStorage.removeItem(PLAYER_LIST_KEY); // Limpiar lista corrupta
    }
    return false;
}


/**
 * Reordena la lista de jugadores basándose en el elemento arrastrado y el objetivo.
 * @param {number} draggedId ID del jugador arrastrado.
 * @param {number} targetId ID del jugador objetivo (donde se suelta).
 */
export function reorderPlayers(draggedId, targetId) {
    if (draggedId === targetId) return;

    const draggedIndex = players.findIndex(p => p.id === draggedId);
    const targetIndex = players.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // 1. Obtener el jugador arrastrado
    const [draggedPlayer] = players.splice(draggedIndex, 1);

    // 2. Insertar el jugador en la nueva posición
    players.splice(targetIndex, 0, draggedPlayer);
    savePlayerList();
    // 3. Refrescar la UI
    refreshPlayerListUI();
}

// Llama a la función de renderizado de la UI, pasando la lista actual y los callbacks
function refreshPlayerListUI() {
    UI.renderPlayerList(players, removePlayer, editPlayerName, reorderPlayers);
}


/**
 * Añade un jugador a la lista.
 * @param {string} name Nombre del jugador.
 * @returns {boolean} True si se añadió, false si falló la validación.
 */
export function addPlayer(name) {
    const cleanName = name.trim().toUpperCase();

    // Validaciones
    if (cleanName.length === 0 || cleanName.length > MAX_NAME_LENGTH) { // Usamos MAX_NAME_LENGTH
        return false;
    }
    if (players.length >= MAX_PLAYERS) { // Usamos MAX_PLAYERS
        alert(`Máximo ${MAX_PLAYERS} jugadores alcanzado.`);
        return false;
    }
    if (players.some(p => p.name === cleanName)) {
        alert("Ese nombre ya está en la lista.");
        return false;
    }

    const newPlayer = { id: nextPlayerId++, name: cleanName };
    players.push(newPlayer);
    savePlayerList();
    refreshPlayerListUI();
    return true;
}

/**
 * Elimina un jugador por su ID.
 * @param {number} id ID del jugador a eliminar.
 */
export function removePlayer(id) {
    players = players.filter(p => p.id !== id);
    savePlayerList();
    refreshPlayerListUI();
}

/**
 * Edita el nombre de un jugador por su ID y refresca la lista si es válido.
 * @param {number} id ID del jugador a editar.
 * @param {string} newName El nuevo nombre del jugador.
 * @returns {true | string} True si se editó. Si falló, retorna un mensaje de error (string).
 */
export function editPlayerName(id, newName) {
    const cleanName = newName.trim().toUpperCase();

    // === VALIDACIÓN: Nombre vacío o demasiado largo ===
    if (cleanName.length === 0 || cleanName.length > MAX_NAME_LENGTH) { // Usamos MAX_NAME_LENGTH
        return `El nombre no es válido (${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} caracteres).`;
    }

    if (players.some(p => p.name === cleanName && p.id !== id)) {
        return "Ese nombre ya está en uso.";
    }

    const playerIndex = players.findIndex(p => p.id === id);
    if (playerIndex !== -1) {
        players[playerIndex].name = cleanName;
        savePlayerList();
        refreshPlayerListUI();
        return true; // Éxito
    }
    return "Error desconocido al editar el jugador.";
}

/**
 * Guarda el array de roles seleccionados en localStorage.
 * @param {Array<string>} roles - Lista de strings con los values de los roles.
 */
export function guardarPreferenciasRoles(roles) {
    localStorage.setItem(CONFIGS_KEY, JSON.stringify(roles));
}

/**
 * Recupera los roles guardados.
 * @returns {Array<string>} Array de roles o un array vacío si no hay nada.
 */
export function cargarPreferenciasRoles() {
    const saved = localStorage.getItem(CONFIGS_KEY);
    return saved ? JSON.parse(saved) : [];
}

/**
 * Selecciona una palabra clave aleatoria de la lista disponible que no haya sido usada.
 * @returns {string} La palabra clave seleccionada.
 */
function seleccionarPalabra() {
    // 1. Filtrar las palabras no usadas
    const availableWords = PALABRAS_CLAVE_LISTA.filter(word =>
        !usedWordsHistory.includes(word)
    );

    let palabraSeleccionada;

    if (availableWords.length === 0) {
        // 2. Si todas las palabras han sido usadas, resetear el historial
        resetUsedWordsHistory();

        // Usar la lista completa nuevamente para la selección
        palabraSeleccionada = shuffleArray(PALABRAS_CLAVE_LISTA)[0];
    } else {
        // 3. Seleccionar una palabra aleatoria de las disponibles
        palabraSeleccionada = shuffleArray(availableWords)[0];
    }

    // 4. Añadir la palabra seleccionada al historial y guardarlo
    usedWordsHistory.push(palabraSeleccionada);
    saveUsedWordsHistory();

    return palabraSeleccionada;
}

/**
 * Mezcla aleatoriamente un array.
 * @param {Array<any>} array El array a mezclar.
 * @returns {Array<any>} El array mezclado.
 */
function shuffleArray(array) {
    /*
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
    */
    // 1. Creamos una copia del array de roles para no mutar el original
    let rolesBarajados = [...array];

    // 2. Algoritmo Fisher-Yates
    for (let i = rolesBarajados.length - 1; i > 0; i--) {
        // Elegimos un índice aleatorio entre 0 e i
        const j = Math.floor(Math.random() * (i + 1));
        // Intercambiamos los elementos
        [rolesBarajados[i], rolesBarajados[j]] = [rolesBarajados[j], rolesBarajados[i]];
    }

    // 3. Ahora usa 'rolesBarajados' para devolver los resultados
    return rolesBarajados;
}

/**
 * Genera un array de roles (IMPOSTOR/PALABRA) y los mezcla.
 * @param {number} totalPlayers Número total de jugadores.
 * @param {number} numImpostors Número de impostores.
 * @returns {Array<string>} Array de roles mezclado.
 */
export function asignarRoles(totalPlayers, numImpostors, rolesPermitidos) {
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;
    let roles = [];

    if (mode === MODE_IMPOSTOR) {
        // --- TU LÓGICA ACTUAL DE IMPOSTOR ---

        // 1. Añadir Impostores
        for (let i = 0; i < numImpostors; i++) {
            roles.push(ROLE_IMPOSTOR);
        }

        // 2. Añadir los roles especiales seleccionados (si caben)
        // Barajamos los permitidos por si hay más seleccionados que huecos
        let especialesBarajados = shuffleArray([...rolesPermitidos]);

        // El límite de especiales suele ser que quede al menos un tripulante normal
        // O simplemente añadir todos los seleccionados si el número de jugadores lo permite
        especialesBarajados.forEach(rol => {
            if (roles.length < totalPlayers - 1) { // Dejamos al menos un hueco
                roles.push(rol);
            }
        });

        // 3. Rellenar el resto con Tripulantes normales
        const totalActual = roles.length;
        for (let i = 0; i < (totalPlayers - totalActual); i++) {
            roles.push(ROLE_TRIPULANTE);
        }

    } else {
        // --- LÓGICA CASTRO NEGRO ---
        // 1. GESTIÓN PRIORITARIA DEL NARRADOR
        if (rolesPermitidos.includes(ROLE_NARRADOR)) {
            roles.push(ROLE_NARRADOR);
            rolesPermitidos = rolesPermitidos.filter(r => r !== ROLE_NARRADOR);
        }

        // 2. CREAR EL POOL PARA LOS DEMÁS (ahora quedan menos jugadores)
        // 2.1. Añadimos los Lobos
        for (let i = 0; i < numImpostors; i++) {
            roles.push(ROLE_LOBO);
        }

        // 2.2. Añadimos los roles especiales seleccionados (Pitonisa, Bruja, etc.)
        // Barajamos los permitidos por si hay más seleccionados que huecos
        let especialesBarajados = shuffleArray([...rolesPermitidos]);
        especialesBarajados.forEach(id => {
            if (roles.length < totalPlayers - 1) {
                roles.push(id);
            }
        });
        // 2.3. El resto son Aldeanos
        while (roles.length < totalPlayers) {
            roles.push(ROLE_ALDEANO);
        }
    }


    // Mezcla los roles para asignarlos aleatoriamente a los jugadores
    return shuffleArray(roles);
}

/**
 * Crea la interfaz de las tarjetas de jugador en el DOM.
 * @param {number} numPlayers Número total de tarjetas a crear.
 * @param {Array<string>} roles Array de roles mezclado.
 * @param {string} palabraSecreta La palabra que verán los tripulantes.
 */
function generarTarjetas(playerList, roles, palabraSecreta) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // Limpiar cualquier tarjeta anterior

    for (let i = 0; i < playerList.length; i++) {
        const player = playerList[i]; // Obtenemos el objeto jugador
        const role = roles[i];

        const card = document.createElement('div');
        card.className = "relative bg-tarjeta p-4 rounded-lg shadow-xl border border-gray-700 flex items-center justify-center cursor-pointer transition duration-300 transform hover:scale-[1.03] active:scale-[0.98] aspect-[16/9]";
        // Contenido de la tarjeta ahora es solo el número de jugador
        const content = document.createElement('div');
        content.className = 'text-xl md:text-3xl font-bold text-acento truncate';
        content.textContent = player.name; // <-- USAMOS EL NOMBRE

        // =========================================================
        // LÓGICA DE CLIC MODIFICADA PARA USAR EL MODAL
        // =========================================================
        card.onclick = function () {
            // Pasamos el nombre del jugador a revelarRol
            revelarRol(player, palabraSecreta);
        };
        // =========================================================

        card.appendChild(content);
        gameBoard.appendChild(card);
    }
}

/**
 * Carga el estado de la partida desde localStorage si existe.
 * @returns {Object|null} El objeto de estado del juego o null si no existe.
 */
export function loadGameState() {
    try {
        const storedState = localStorage.getItem(GAME_STATE_KEY);
        if (storedState) {
            return JSON.parse(storedState);
        }
    } catch (e) {
        console.error("Error al cargar el estado de la partida desde localStorage:", e);
        // Limpiamos el almacenamiento si el JSON está corrupto
        localStorage.removeItem(GAME_STATE_KEY);
    }
    return null;
}

/**
 * Resetea el estado del juego y limpia el estado de partida guardado.
 */
export function clearGameState() {
    // Si la partida terminó, aseguramos que players[] tenga solo id/name
    // (aunque restorePartida lo hace al inicio, este es un buen seguro)
    // Recalculamos el nextPlayerId por si un jugador fue eliminado durante la partida
    nextPlayerId = players.length > 0 ? players.reduce((max, p) => Math.max(max, p.id), 0) + 1 : 1;

    // Guardamos la lista actual de jugadores (solo id/name)
    savePlayerList();

    // Limpiamos el estado de partida (roles, palabra secreta)
    localStorage.removeItem(GAME_STATE_KEY);

    // Buscamos todas las claves que empiecen por nuestro prefijo y las borramos
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(PANEL_PLAYER_KEY)) {
            localStorage.removeItem(key);
        }
    });

    console.log("Estado de la partida limpiado.");
}

/**
 * Elimina el estado de la partida guardada y devuelve la UI al estado inicial.
 */
export function finalizarPartida() {
    if (confirm("¿Estás seguro de que quieres volver a la pantalla de inicio?")) {
        clearGameState();
        UI.mostrarBotonesInicio();
        UI.ocultarTablero();
        document.getElementById('game-board').innerHTML = '<p>Pulsa Empezar para jugar.</p>';
    }
}

/**
 * Inicia la partida: asigna roles, elige palabra y guarda el estado.
 * @param {string|number} impostorsOption Valor seleccionado (e.g., "3", "RANDOM_50").
 */
export function iniciarPartida(impostorsOption, rolesPermitidos = []) {
    if (players.length < MIN_PLAYERS) {
        alert(`Necesitas al menos ${MIN_PLAYERS} jugadores para empezar.`);
        return;
    }

    // === NUEVO PASO: CALCULAR EL NÚMERO REAL DE IMPOSTORES ===
    const numImpostors = calcularNumImpostores(impostorsOption);

    // Aseguramos que el resultado no sea mayor que jugadores.length
    const finalImpostors = Math.min(numImpostors, players.length);

    // 1. Detectar el modo actual
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;

    // 2. Solo seleccionar palabra si NO es modo Lobo
    let palabraSecreta = '-';
    if (mode !== MODE_LOBO) {
        palabraSecreta = seleccionarPalabra();
        console.log(palabraSecreta)
    }

    // 2. Llamar a asignarRoles con el número total de jugadores y el número de impostores
    // La función asignarRoles SÓLO retorna el array de roles.
    const roles = asignarRoles(players.length, finalImpostors, rolesPermitidos);
    // --- FIN DE CORRECCIÓN ---

    // 2. Asignar esos roles a los objetos de los jugadores
    players.forEach((player, index) => {
        player.role = roles[index];
        player.extraInfo = {}; // Inicializar siempre para evitar errores
    });

    // 3. LLAMADA CLAVE: Procesar la información cruzada
    // Aquí es donde el Cómplice se entera de quién es el Impostor, etc.
    procesarInformacionRoles(players);

    console.log(players)

    generarTarjetas(players, roles, palabraSecreta);

    UI.ocultarBotonesInicio();
    UI.mostrarTablero();

    // =========================================================
    // LÓGICA DE ROBUSTEZ: GUARDAR ESTADO EN localStorage
    // =========================================================

    // 1. Crear el objeto de estado en el formato solicitado
    const gameState = {
        palabra: palabraSecreta,
        jugadores: players.map(p => ({
            name: p.name,
            role: p.role,
            extraInfo: p.extraInfo || {} // Guardamos la info extra o un objeto vacío
        }))
    };

    // 2. Serializar el objeto a JSON y guardar
    try {
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
        console.log("Estado de la partida guardado en localStorage.");
    } catch (e) {
        console.error("Error al guardar el estado de la partida en localStorage:", e);
    }
}

// =========================================================
// NUEVA FUNCIÓN PARA GESTIONAR LA VISTA DE ROL EN EL MODAL
// =========================================================

/**
 * Procesa la información técnica de los roles especiales.
 * Modifica directamente los objetos dentro de la lista de jugadores proporcionada.
 * @param {Array} listaJugadores - La lista de jugadores a procesar.
 */
export function procesarInformacionRoles(listaJugadores) {
    // Pre-filtros para las selecciones aleatorias
    const todosLosImpostores = listaJugadores.filter(p => p.role === ROLE_IMPOSTOR);
    const todosLosCiviles = listaJugadores.filter(p => p.role === ROLE_TRIPULANTE);

    listaJugadores.forEach(player => {
        // Helper para obtener un elemento aleatorio de un array
        const getRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;


        let data = null;

        switch (player.role) {
            case ROLE_DETECTIVE:
                // Conteo: { "IMPOSTOR": 1, "TRIPULANTE": 5, ... }
                data = {};
                listaJugadores.forEach(p => {
                    data[p.role] = (data[p.role] || 0) + 1;
                });
                break;

            case ROLE_COMPLICE:
            case ROLE_VIDENTE:
                // Objeto de un impostor aleatorio
                data = getRandom(todosLosImpostores);
                break;

            case ROLE_PARANOICO:
                // Array: [Impostor Aleatorio, Persona Aleatoria (no él mismo ni el impo elegido)]
                // 1. Elegimos un impostor aleatorio
                const impoAleatorio = getRandom(todosLosImpostores);

                // 2. Elegimos una persona aleatoria (que no sea él mismo ni el impostor elegido)
                const candidatosParaOtro = listaJugadores.filter(p =>
                    p.id !== player.id &&
                    p.id !== (impoAleatorio ? impoAleatorio.id : null)
                );
                const personaAleatoria = getRandom(candidatosParaOtro);

                // 3. Creamos el array con ambos
                let parejaSospechosa = [impoAleatorio, personaAleatoria];

                // 4. --- EL TRUCO: Aleatorizar el orden del array ---
                // Si el número aleatorio es menor a 0.5, los invertimos
                if (Math.random() < 0.5) {
                    parejaSospechosa = [personaAleatoria, impoAleatorio];
                }

                data = parejaSospechosa;
                break;

            case ROLE_GEMELO:
                // 1. Buscamos a todos los gemelos en la lista
                const todosLosGemelos = listaJugadores.filter(p => p.role === ROLE_GEMELO);

                if (todosLosGemelos.length === 2) {
                    // 2. Si hay exactamente dos, el dato extra es el OTRO gemelo
                    const compa = todosLosGemelos.find(p => p.id !== player.id);
                    // ✅ Guardamos nombre y rol para que revelarRol sepa si es Gemelo o Civil
                    data = { name: compa.name, role: compa.role };
                } else {
                    // 3. Si solo hay uno (o configuración distinta), mantiene la lógica del civil
                    data = getRandom(todosLosCiviles);
                }
                break;

            case ROLE_POETA:
                // Objeto con la letra
                const letras = "BCDFLMPRSTV";
                data = { letra: letras[Math.floor(Math.random() * letras.length)] };
                break;

            case ROLE_LOBO:
                const otrosLobos = listaJugadores
                    .filter(p => p.role === ROLE_LOBO && p.id !== player.id)
                    .map(p => p.name);

                player.extraInfo = otrosLobos.length > 0
                    ? { compañeros: otrosLobos.join(", ") }
                    : { compañeros: "Estás solo en esta cacería..." };
                break;
        }

        // Modificamos el objeto original directamente
        player.extraInfo = data;
    });
}



/**
 * Muestra el contenido del rol del jugador en un modal.
 * @param {number} playerIndex Índice del jugador (0, 1, 2...).
 * @param {string} role El rol asignado ("IMPOSTOR" o "PALABRA").
 * @param {string} palabraSecreta La palabra clave (si es tripulante).
 */
/**
 * Genera el contenido visual de la tarjeta de rol basándose en extraInfo
 * y abre el modal de revelación.
 */
export function revelarRol(player, palabraSecreta) {
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;

    const contenedor = document.getElementById('role-modal');
    if (!contenedor) return;

    if (mode === MODE_LOBO) {
        // --- DISEÑO PARA CASTRO NEGRO (Sin palabra) ---
        let infoExtraHTML = '';

        // --- MEJORA: Obtener datos directamente de la configuración ---
        const configRol = ROLES_LOBO_DATA.find(r => r.id === player.role) || { icon: '❓', color: 'gray-500' };

        // Mapeo de estilos de borde de Tailwind basados en el color de la config
        // Nota: Como en config.js usas "red-500", aquí lo convertimos a "border-red-500"
        const borderClass = `border-${configRol.color}`;
        const bgClass = `bg-${configRol.color}`;
        const textClass = `text-${configRol.color}`;

        contenedor.innerHTML = `
        <div class="rol-card bg-tarjeta rounded-2xl p-6 border-t-8 ${borderClass} shadow-2xl flex flex-col w-full max-w-[450px] mx-auto min-h-[400px]">
            <div class="flex items-center gap-3 mb-6">
                <span class="text-4xl">${configRol.icon}</span>
                <span class="text-2xl font-bold uppercase text-white">${player.name}</span>
            </div>
            <div class="flex-grow flex flex-col justify-center">        
                <div class="${bgClass}/10 border ${borderClass}/30 rounded-xl p-4 mb-4 text-center">
                    <p class="text-[10px] ${textClass} font-bold uppercase mb-1">Rol</p>
                    <p class="text-4xl font-black text-white uppercase">${configRol.name}</p>
                </div>
                <div class="bg-black/30 p-2 rounded-lg border-l-4 ${borderClass} mb-3 text-center">
                    <p class="text-sm font-semibold text-white italic">${configRol.description || "Tu destino está escrito en las estrellas de Castronegro."}</p>
                </div>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed italic"></p>
            <div class="mt-2 shrink-0">
                <button id="modal-close-btn" 
                class="mt-2 w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition duration-150 text-lg">
                ¡Entendido! Ocultar y pasar.
                </button>
            </div>
        </div>
    `;

    } else {
        const data = player.extraInfo; // Información técnica procesada previamente

        // --- MEJORA: Obtener datos directamente de la configuración ---
        const configRol = ROLES_DATA.find(r => r.id === player.role) || { icon: '❓', color: 'gray-500' };

        // Mapeo de estilos de borde de Tailwind basados en el color de la config
        // Nota: Como en config.js usas "red-500", aquí lo convertimos a "border-red-500"
        const borderClass = `border-${configRol.color}`;
        const bgClass = `bg-${configRol.color}`;
        const textClass = `text-${configRol.color}`;

        // --- FUNCIÓN HELPER PARA GENERAR EL BLOQUE DE HABILIDAD ---
        const generarBloquePista = (titulo, contenido) => `
        <div class="bg-black/30 p-2 rounded-lg border-l-4 ${borderClass} mb-3 text-center">
            <p class="text-[10px] ${textClass} font-bold uppercase mb-1">${titulo}</p>
            <p class="text-sm font-bold text-white uppercase italic">${contenido}</p>
        </div>
    `;
        const divPalabra = `
        <div class="${bgClass}/10 border ${borderClass}/30 rounded-xl p-4 mb-4 text-center">
            <p class="text-[10px] ${textClass} font-bold uppercase mb-1">Palabra Secreta</p>
            <p class="text-4xl font-black text-white uppercase tracking-wide">${palabraSecreta.palabra}</p>
        </div>`

        // 1. Detectamos si su acompañante es también un Gemelo para cambiar los textos
        const esParejaReal = data && data.role === ROLE_GEMELO;

        // Contenido específico de cada rol (la lógica interna)
        const ROLES_STYLE = {
            [ROLE_IMPOSTOR]: {
                hint: "No conoces la palabra. Observa y miente para que no te descubran.",
                html: `<div class="py-6 mb-4 text-center">
                    <p class="text-4xl font-black tracking-tighter uppercase">
                        <span class="text-white">ERES EL</span> <span class="text-red-600 font-impostor">IMPOSTOR</span>
                    </p>
                   </div>`
            },
            [ROLE_TRIPULANTE]: {
                hint: "Describe la palabra sutilmente. No se lo pongas fácil al Impostor.",
                html: `${divPalabra}`
            },
            [ROLE_COMPLICE]: {
                hint: "Protege su identidad a toda costa. Si él cae, tú también.",
                html: `${divPalabra}
                   ${generarBloquePista("Lealtad al Impostor", (data?.name || 'DESCONOCIDO') + ' EL IMPOSTOR')}`
            },
            [ROLE_VIDENTE]: {
                hint: "Has visto la verdad en las sombras. Guía a los demás sin que los traidores noten tu don.",
                html: `<div class="py-6 mb-4 text-center">
                    <p class="text-4xl font-black tracking-tighter uppercase">No conoces la palabra</p>
                   </div>
                   ${generarBloquePista("Revelación Divina", (data?.name || 'ALGUIEN') + ' ES IMPOSTOR')}`
            },
            [ROLE_GLITCH]: {
                hint: "El sistema ha fallado. Debes deducir la palabra completa antes de que te detecten.",
                html: `<div class="py-6 mb-4 text-center">
                    <p class="text-4xl font-black tracking-tighter uppercase">
                        <p class="text-4xl font-black tracking-tighter uppercase">No conoces la palabra</p>
                    </p>
                   </div>
                   ${generarBloquePista(
                    "Dato Corrupto",
                    (palabraSecreta.palabra.split('').map((char, i) => {
                        if (char === ' ') return '&nbsp;&nbsp;'; // Mantiene el espacio visualmente claro
                        return i % 2 === 0 ? char : "_";
                    }
                    ).join(' ')))}`
            },
            [ROLE_DESPISTADO]: {
                hint: "Tienes una idea general del tema, pero la palabra exacta se te escapa.",
                html: `<div class="py-6 mb-4 text-center">
                    <p class="text-4xl font-black tracking-tighter uppercase">
                        <p class="text-4xl font-black tracking-tighter uppercase">No conoces la palabra</p>
                    </p>
                   </div>
                   ${generarBloquePista("Pista Difusa", (palabraSecreta.categoria))}`
            },
            [ROLE_POETA]: {
                hint: "Debes seguir esta instrucción al dar tus pistas o serás descubierto.",
                html: `${divPalabra}
                   ${generarBloquePista("Regla de Comunicación", (data?.letra ? `EMPIEZA CON "${data.letra}"` : "REGLA DESCONOCIDA"))}`
            },
            [ROLE_GEMELO]: {
                // El hint cambia según si es un vínculo mutuo o no
                hint: esParejaReal
                    ? "Os habéis reconocido. Ambos sabéis vuestros roles y sois de total confianza. Pero si uno muere el otro morirá también"
                    : "Es inocente, pero no sabe quién eres tú. Protégelo sin exponerte.",
                html: `
            ${divPalabra}
            ${generarBloquePista(
                    esParejaReal ? "Alma Gemela" : "Vínculo Unilateral",
                    'Conoces A ' + (data?.name || "NADIE")
                )}`
            },
            [ROLE_DETECTIVE]: {
                hint: "Usa los números para detectar si alguien miente sobre su rol.",
                html: `${divPalabra}
                   ${generarBloquePista("Recuento de Objetivos", (data ? Object.entries(data).map(([r, c]) => `${c} ${r}`).join(" / ") : "ERROR"))}`
            },
            [ROLE_PARANOICO]: {
                hint: "Uno de ellos es el impostor. El otro es un misterio.",
                html: `${divPalabra}
                   ${generarBloquePista("Sospecha Dividida", (Array.isArray(data) ? `${data[0]?.name} / ${data[1]?.name}` : "???"))}`
            }
        };

        // Si el rol no tiene un HTML específico, usamos el de Tripulante por defecto
        const rolContent = ROLES_STYLE[player.role] || ROLES_STYLE[ROLE_TRIPULANTE];

        // Inyectar el HTML con la estructura de tarjeta del archivo test5.html
        contenedor.innerHTML = `
        <div class="rol-card bg-tarjeta rounded-2xl p-6 border-t-8 ${borderClass} shadow-2xl flex flex-col w-full max-w-[450px] mx-auto min-h-[400px]">
            <div class="flex items-center gap-3 mb-6">
                <span class="text-4xl">${configRol.icon}</span>
                <span class="text-2xl font-bold uppercase text-white">${player.name}</span>
            </div>
            <div class="flex-grow flex flex-col justify-center">
                ${rolContent.html}
            </div>
            <p class="text-xs text-slate-400 leading-relaxed italic">${rolContent.hint}</p>
            <div class="mt-2 shrink-0">
                <button id="modal-close-btn" 
                class="mt-2 w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition duration-150 text-lg">
                ¡Entendido! Ocultar y pasar.
                </button>
            </div>
        </div>
    `;
    }

    // Abrir el modal usando la lógica de UI
    UI.abrirModalRevelar();
}

/**
 * Restaura el estado de la partida desde el objeto cargado de localStorage.
 * Reconstruye el array de jugadores global y redibuja el tablero.
 * @param {Object} state Objeto de estado cargado: {palabra: string, jugadores: Array<Object>}.
 */
export function restorePartida(state) {
    // 1. Resetear el estado global y configurar IDs
    players = [];
    let currentId = 1;
    let roles = [];

    // 2. Reconstruir el array de jugadores
    state.jugadores.forEach(playerObj => {
        // playerObj tiene esta forma: { name: "...", role: "...", extraInfo: {...} }

        players.push({
            id: currentId,
            name: playerObj.name,
            role: playerObj.role,
            extraInfo: playerObj.extraInfo || {} // Recuperamos la info especial (Mudo, Detective, etc.)
        });

        roles.push(playerObj.role);

        currentId++;
    });

    // 3. Establecer el siguiente ID disponible
    nextPlayerId = currentId;

    // 4. Redibujar el tablero y la UI
    // Usamos el array players reconstruido y los roles/palabra del estado cargado
    generarTarjetas(players, roles, state.palabra);

    // Ocultar pantalla de inicio y mostrar tablero
    UI.ocultarBotonesInicio();
    UI.mostrarTablero();

    console.log("Partida restaurada con éxito.");
}

/**
 * Elimina todas las variables de estado del juego y palabras usadas del almacenamiento local.
 */
export function limpiarTodasVariables() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(KEY_START)) {
            localStorage.removeItem(key);
        }
    });
    console.log("✅ Todas las variables de juego han sido borradas");
}

/**
 * Calcula el número real de impostores basándose en la opción seleccionada.
 * @param {string} impostorsOption Valor seleccionado (e.g., "3", "RANDOM_50").
 * @returns {number} El número real de impostores a utilizar.
 */
function calcularNumImpostores(impostorsOption) {
    const totalPlayers = players.length;
    const minImpostors = 1;

    // --- Validación de Mínimos ---
    if (totalPlayers < MIN_PLAYERS) {
        return 0; // No se puede iniciar con menos del mínimo
    }

    // El límite absoluto superior: se establece como el número total de jugadores.
    // Si numImpostors = totalPlayers, todos serán impostores.
    const maxAbsoluteLimit = totalPlayers;

    // 1. Opción de número fijo (1, 2, 3, 4)
    const fixedNum = parseInt(impostorsOption, 10);
    if (!isNaN(fixedNum) && fixedNum >= minImpostors) {
        // Usamos el número fijo, limitado por el número total de jugadores (maxAbsoluteLimit).
        return Math.min(fixedNum, maxAbsoluteLimit);
    }

    // 2. Opción Aleatoria (RANDOM_X)
    let maxLimit = maxAbsoluteLimit; // Inicialmente, el límite es el máximo absoluto

    switch (impostorsOption) {
        case 'RANDOM_30':
            // Máximo el 30% de los jugadores.
            maxLimit = Math.min(Math.ceil(totalPlayers * 0.30), maxAbsoluteLimit); // Usamos Math.ceil para redondear al alza
            break;
        case 'RANDOM_50':
            // Máximo el 50% de los jugadores.
            maxLimit = Math.min(Math.ceil(totalPlayers * 0.50), maxAbsoluteLimit); // Usamos Math.ceil para redondear al alza
            break;
        case 'RANDOM_MAX':
            // SOLICITUD: No hay límite superior estricto. El límite es el número total de jugadores.
            // maxLimit ya es igual a maxAbsoluteLimit (totalPlayers).
            break;
        default:
            // Opción no reconocida, usamos 1 por defecto.
            return minImpostors;
    }

    // Si el límite superior es 0 (ej: totalPlayers=2, RANDOM_30), lo forzamos a 1 si es posible.
    // Pero si totalPlayers >= MIN_PLAYERS, el límite siempre será >= 1.
    const upperLimit = Math.max(minImpostors, maxLimit);

    // Generar el número aleatorio (entre minImpostors y upperLimit, ambos incluidos)
    // El rango ahora es: [1, totalPlayers]
    return Math.floor(Math.random() * (upperLimit - minImpostors + 1)) + minImpostors;
}

/**
 * Obtiene la clasificación de jugadores según su rol actual para la pantalla final.
 * @returns {Object} { impostores: [], especiales: [], inocentes: [] }
 */
export function obtenerRevelacionRoles() {
    // Función de ayuda para obtener icono/color de la config
    const getRoleInfo = (roleId) => ROLES_DATA.find(r => r.id === roleId) || {};

    return {
        impostores: players
            .filter(p => p.role === ROLE_IMPOSTOR)
            .map(p => ({
                nombre: p.name,
                ...getRoleInfo(ROLE_IMPOSTOR)
            })),

        especiales: players
            .filter(p => p.role !== ROLE_IMPOSTOR && p.role !== ROLE_TRIPULANTE)
            .map(p => ({
                nombre: p.name,
                rol: p.role,
                ...getRoleInfo(p.role)
            })),

        inocentes: players
            .filter(p => p.role === ROLE_TRIPULANTE)
            .map(p => ({
                nombre: p.name,
                ...getRoleInfo(ROLE_TRIPULANTE)
            }))
    };
}

export function obtenerRevelacionLobo() {
    // IMPORTANTE: Asegúrate de importar ROLES_LOBO_DATA en game.js
    const getRoleInfo = (roleId) => ROLES_LOBO_DATA.find(r => r.id === roleId) || {};

    return {
        lobos: players
            .filter(p => p.role === ROLE_LOBO || p.role === ROLE_LOBO_BLANCO || p.role === ROLE_LOBO_CACHORRO)
            .map(p => ({ nombre: p.name, ...getRoleInfo(p.role) })),

        especiales: players
            .filter(p => p.role !== ROLE_NARRADOR && p.role !== ROLE_ALDEANO && p.role !== ROLE_LOBO && p.role !== ROLE_LOBO_BLANCO && p.role !== ROLE_LOBO_CACHORRO)
            .map(p => ({ nombre: p.name, ...getRoleInfo(p.role) })),

        inocentes: players
            .filter(p => p.role === ROLE_ALDEANO)
            .map(p => ({ nombre: p.name, ...getRoleInfo(p.role) }))
    };
}

export function elegirJugadorAleatorio() {
    if (players.length === 0) return;

    const indiceAleatorio = Math.floor(Math.random() * players.length);
    const elegido = players[indiceAleatorio];

    UI.mostrarElegido(elegido.name);
}
