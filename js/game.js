import * as UI from './ui.js';
import { PALABRAS_CLAVE_LISTA } from '../data/palabras.js';
import {
    MAX_PLAYERS,
    MAX_NAME_LENGTH,
    MIN_NAME_LENGTH,
    MIN_PLAYERS
} from './config.js';

// === VARIABLES DE ESTADO (ASUMIDAS DE PASOS ANTERIORES) ===
let players = [];
let nextPlayerId = 1;

let gameSettings = {
    numPlayers: 0,
    numImpostors: 0,
    palabraSecreta: ''
};


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
    refreshPlayerListUI();
    return true;
}

/**
 * Elimina un jugador por su ID.
 * @param {number} id ID del jugador a eliminar.
 */
export function removePlayer(id) {
    players = players.filter(p => p.id !== id);
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
        refreshPlayerListUI();
        return true; // Éxito
    }
    return "Error desconocido al editar el jugador.";
}

/**
 * Genera una palabra secreta aleatoria de la lista disponible.
 * @returns {string} La palabra secreta elegida.
 */
function seleccionarPalabra() {
    // Usamos PALABRAS_CLAVE_LISTA importada
    const indice = Math.floor(Math.random() * PALABRAS_CLAVE_LISTA.length);

    // Retornamos solo la propiedad 'palabra' del objeto
    return PALABRAS_CLAVE_LISTA[indice].palabra;
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

    // Define las clases CSS para las tarjetas
    const cardBaseClasses = "relative bg-tarjeta p-4 rounded-lg shadow-xl border border-gray-700 aspect-square flex items-center justify-center cursor-pointer transition duration-300 transform hover:scale-[1.03] active:scale-[0.98]";


    for (let i = 0; i < playerList.length; i++) {
        const player = playerList[i]; // Obtenemos el objeto jugador
        const role = roles[i];

        const card = document.createElement('div');
        card.className = "relative bg-tarjeta p-4 rounded-lg shadow-xl border border-gray-700 aspect-square flex items-center justify-center cursor-pointer transition duration-300 transform hover:scale-[1.03] active:scale-[0.98]";

        // Contenido de la tarjeta ahora es solo el número de jugador
        const content = document.createElement('div');
        content.className = 'text-3xl md:text-5xl font-bold font-agente text-acento truncate';
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
 * Elimina el estado de la partida guardada y devuelve la UI al estado inicial.
 */
export function finalizarPartida() {
    if (confirm("¿Estás seguro de que quieres volver a la pantalla de inicio?")) {
        UI.mostrarBotonesInicio();
        UI.ocultarTablero();
        document.getElementById('game-board').innerHTML = '<p>Pulsa Empezar para jugar.</p>';
    }
}

/**
 * Inicia una nueva partida con el número de jugadores e impostores seleccionados.
 * @param {string} impostorsStr Número de impostores como string.
 */
export function iniciarPartida(impostorsStr) {
    const numPlayers = players.length;
    const numImpostors = parseInt(impostorsStr, 10);

    // Validación: Mínimo 4 jugadores
    if (numPlayers < 3) {
        alert("Se requieren al menos 4 jugadores para empezar la partida.");
        return;
    }

    // Validación básica de impostores
    if (numImpostors >= numPlayers) {
        alert("El número de Impostores debe ser menor que el número de jugadores.");
        return;
    }

    // 1. Configurar estado de la partida
    gameSettings.numPlayers = numPlayers;
    gameSettings.numImpostors = numImpostors;
    gameSettings.palabraSecreta = seleccionarPalabra();

    // 2. Asignar roles aleatoriamente (Asegúrate de que 'players' no esté vacío)
    const rolesAsignados = asignarRoles(numPlayers, numImpostors);

    // 3. Crear las tarjetas y la interfaz
    // Pasamos el array de objetos de jugador completo
    generarTarjetas(players, rolesAsignados, gameSettings.palabraSecreta);

    // 4. Mostrar la interfaz de juego
    UI.ocultarBotonesInicio();
    UI.mostrarTablero();
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
        title += ` - ¡TRIPULANTE!`;
        body = `
            <p class="text-base text-texto-gris mb-3">Tu clave secreta es:</p>
            <p class="text-5xl font-extrabold text-white font-agente mb-4">${palabraSecreta}</p>
            <p class="text-lg text-texto-gris">Da una pista relacionada con esta palabra sin ser demasiado obvio.</p>
        `;
    } else {
        title += ` - ¡IMPOSTOR!`;
        body = `
            <p class="text-5xl font-extrabold text-red-400 font-agente mb-4">NO TIENES LA PALABRA</p>
            <p class="text-lg text-texto-gris">Escucha las pistas de los demás atentamente. Debes inventar una pista creíble.</p>
        `;
    }

    UI.mostrarModal(title, body);
}