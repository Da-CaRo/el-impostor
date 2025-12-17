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
    USED_WORDS_KEY
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
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Genera un array de roles (IMPOSTOR/PALABRA) y los mezcla.
 * @param {number} totalPlayers Número total de jugadores.
 * @param {number} numImpostors Número de impostores.
 * @returns {Array<string>} Array de roles mezclado.
 */
function asignarRoles(totalPlayers, numImpostors) {
    let roles = [];
    // Asigna los roles de Impostor
    for (let i = 0; i < numImpostors; i++) {
        roles.push("IMPOSTOR");
    }
    // Asigna los roles de Palabra (Tripulante)
    const numPalabras = totalPlayers - numImpostors;
    for (let i = 0; i < numPalabras; i++) {
        roles.push("PALABRA");
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
            revelarRol(player.name, role, palabraSecreta);
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
export function iniciarPartida(impostorsOption) {
    if (players.length < MIN_PLAYERS) {
        alert(`Necesitas al menos ${MIN_PLAYERS} jugadores para empezar.`);
        return;
    }

    // === NUEVO PASO: CALCULAR EL NÚMERO REAL DE IMPOSTORES ===
    const numImpostors = calcularNumImpostores(impostorsOption);

    // Aseguramos que el resultado no sea mayor que jugadores.length
    const finalImpostors = Math.min(numImpostors, players.length);

    // --- CORRECCIÓN APLICADA AQUÍ ---
    // 1. Obtener la palabra secreta por separado
    const palabraSecreta = seleccionarPalabra();
    console.log(palabraSecreta)

    // 2. Llamar a asignarRoles con el número total de jugadores y el número de impostores
    // La función asignarRoles SÓLO retorna el array de roles.
    const roles = asignarRoles(players.length, finalImpostors);
    // --- FIN DE CORRECCIÓN ---

    // Asignar los roles permanentemente a los jugadores 
    players = players.map((player, index) => ({
        ...player,
        role: roles[index] // Ahora 'roles' es un array y no undefined
    }));

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
            [p.name]: p.role
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
 * Muestra el contenido del rol del jugador en un modal.
 * @param {number} playerIndex Índice del jugador (0, 1, 2...).
 * @param {string} role El rol asignado ("IMPOSTOR" o "PALABRA").
 * @param {string} palabraSecreta La palabra clave (si es tripulante).
 */
function revelarRol(playerName, role, palabraSecreta) {
    let title = `${playerName}`;
    let body = '';

    if (role === "PALABRA") {
        //title += ` - ¡TRIPULANTE!`;
        body = `
            <p class="text-base text-texto-gris mb-3">Tu clave secreta es:</p>
            <p class="text-5xl font-extrabold text-white mb-4">${palabraSecreta.palabra}</p>
            <p class="text-lg text-texto-gris">Da una pista relacionada con esta palabra sin ser demasiado obvio.</p>
        `;
    } else {
        //title += ` - ¡IMPOSTOR!`;
        body = `
        
            <p class="text-5xl font-extrabold text-white mb-4">Eres el <span class="text-[--color-acento] font-impostor">Impostor</span></p>
            <p class="text-lg text-texto-gris">Escucha las pistas de los demás atentamente. Debes inventar una pista creíble.</p>
        `;
    }

    UI.mostrarModal(title, body);
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
    state.jugadores.forEach(playerRoleObj => {
        // playerRoleObj es de la forma { "Nombre": "ROL" }
        const playerName = Object.keys(playerRoleObj)[0];
        const role = playerRoleObj[playerName];

        // Creamos el objeto jugador completo (con ID y rol)
        players.push({
            id: currentId,
            name: playerName,
            role: role // Asignamos el rol cargado
        });
        roles.push(role); // Guardamos el rol para redibujar las tarjetas
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
    localStorage.clear()
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