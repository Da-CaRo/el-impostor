import * as UI from './ui.js';

// Lista de palabras posibles (puedes ampliarla)
const PALABRAS_CLAVE = ["Gato", "Perro", "Flor", "Coche", "Playa", "Nube", "Fuego", "Agua", "Luna", "Sol"];

// Almacenará la configuración del juego actual
let gameSettings = {
    numPlayers: 0,
    numImpostors: 0,
    palabraSecreta: ''
};

/**
 * Genera una palabra secreta aleatoria de la lista disponible.
 * @returns {string} La palabra secreta elegida.
 */
function seleccionarPalabra() {
    const indice = Math.floor(Math.random() * PALABRAS_CLAVE.length);
    return PALABRAS_CLAVE[indice];
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
function generarTarjetas(numPlayers, roles, palabraSecreta) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // Limpiar cualquier tarjeta anterior

    // Define las clases CSS para las tarjetas
    const cardBaseClasses = "relative bg-tarjeta p-4 rounded-lg shadow-xl border border-gray-700 aspect-square flex items-center justify-center cursor-pointer transition duration-300 transform hover:scale-[1.03] active:scale-[0.98]";


    for (let i = 0; i < numPlayers; i++) {
        const role = roles[i];

        const card = document.createElement('div');
        card.className = "relative bg-tarjeta p-4 rounded-lg shadow-xl border border-gray-700 aspect-square flex items-center justify-center cursor-pointer transition duration-300 transform hover:scale-[1.03] active:scale-[0.98]";

        // Contenido de la tarjeta ahora es solo el número de jugador
        const content = document.createElement('div');
        // Usamos la fuente grande de acento para la cara oculta
        content.className = 'text-3xl md:text-5xl font-bold font-agente text-acento';
        content.textContent = `${i + 1}`;

        // =========================================================
        // LÓGICA DE CLIC MODIFICADA PARA USAR EL MODAL
        // =========================================================
        card.onclick = function () {
            revelarRol(i, role, palabraSecreta);
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
 * @param {string} playersStr Número de jugadores como string.
 * @param {string} impostorsStr Número de impostores como string.
 */
export function iniciarPartida(playersStr, impostorsStr) {
    const numPlayers = parseInt(playersStr, 10);
    const numImpostors = parseInt(impostorsStr, 10);

    // Validación básica
    if (numImpostors >= numPlayers) {
        alert("El número de Impostores debe ser menor que el número de jugadores.");
        return;
    }

    // 1. Configurar estado de la partida
    gameSettings.numPlayers = numPlayers;
    gameSettings.numImpostors = numImpostors;
    gameSettings.palabraSecreta = seleccionarPalabra();

    // 2. Asignar roles aleatoriamente
    const rolesAsignados = asignarRoles(numPlayers, numImpostors);

    // 3. Crear las tarjetas y la interfaz
    generarTarjetas(numPlayers, rolesAsignados, gameSettings.palabraSecreta);

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
function revelarRol(playerIndex, role, palabraSecreta) {
    let title = `JUGADOR ${playerIndex + 1}`;
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