import * as UI from './ui.js';
import { PALABRAS_CLAVE_LISTA } from '../data/palabras.js';
import {
    MAX_PLAYERS, MAX_NAME_LENGTH, MIN_NAME_LENGTH, MIN_PLAYERS,
    GAME_STATE_KEY, PLAYER_LIST_KEY, IMPOSTORS_KEY, USED_WORDS_KEY,
    CONFIGS_KEY, GAME_MODE_KEY, PANEL_PLAYER_KEY, KEY_START,
    ROLE_IMPOSTOR, ROLE_TRIPULANTE, ROLE_COMPLICE, ROLE_DETECTIVE,
    ROLE_PARANOICO, ROLE_GEMELO, ROLE_GLITCH, ROLE_VIDENTE,
    ROLE_POETA, ROLE_DESPISTADO, ROLES_DATA, ROLE_NARRADOR,
    ROLE_LOBO, ROLE_LOBO_BLANCO, ROLE_ALDEANO, ROLES_LOBO_DATA,
    MODE_IMPOSTOR, MODE_LOBO, ROLE_LOBO_CACHORRO,
} from './config.js';

// === VARIABLES DE ESTADO ===
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
 * @param {string|number} impostorsOption - Opción seleccionada (e.g., "1", "RANDOM_30").
 */
export function saveImpostorsCount(impostorsOption) {
    try {
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
        if (storedCount) return storedCount;
    } catch (e) {
        console.error("Error al cargar la opción de impostores:", e);
        localStorage.removeItem(IMPOSTORS_KEY);
    }
    return null;
}

/**
 * Guarda la lista básica de jugadores (ID y nombre) en localStorage.
 */
function savePlayerList() {
    const basicPlayers = players.map(p => ({ id: p.id, name: p.name }));
    try {
        localStorage.setItem(PLAYER_LIST_KEY, JSON.stringify(basicPlayers));
    } catch (e) {
        console.error("Error al guardar la lista de jugadores:", e);
    }
}

/**
 * Carga la lista de jugadores desde localStorage y restaura el estado.
 * @returns {boolean} True si se cargó una lista válida, false en caso contrario.
 */
export function loadPlayerList() {
    try {
        const storedList = localStorage.getItem(PLAYER_LIST_KEY);
        if (storedList) {
            const list = JSON.parse(storedList);
            if (list.length > 0) {
                players = list;
                nextPlayerId = list.reduce((max, p) => Math.max(max, p.id), 0) + 1;
                refreshPlayerListUI();
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
 * Reordena la lista de jugadores tras un evento de arrastrar y soltar.
 * @param {number} draggedId - ID del jugador arrastrado.
 * @param {number} targetId - ID del jugador objetivo.
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

/**
 * Solicita a la UI que redibuje la lista de jugadores con los datos actuales.
 */
function refreshPlayerListUI() {
    UI.renderPlayerList(players, removePlayer, editPlayerName, reorderPlayers);
}

/**
 * Añade un jugador a la lista global.
 * @param {string} name - Nombre del jugador.
 * @returns {boolean} True si se añadió, false si falló la validación.
 */
export function addPlayer(name) {
    const cleanName = name.trim().toUpperCase();

    // Validaciones
    if (cleanName.length === 0 || cleanName.length > MAX_NAME_LENGTH) return false;
    if (players.length >= MAX_PLAYERS) {
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
 * Elimina un jugador de la lista.
 * @param {number} id - ID del jugador a eliminar.
 */
export function removePlayer(id) {
    players = players.filter(p => p.id !== id);
    savePlayerList();
    refreshPlayerListUI();
}

/**
 * Modifica el nombre de un jugador existente.
 * @param {number} id - ID del jugador.
 * @param {string} newName - Nuevo nombre a asignar.
 * @returns {true|string} True si tuvo éxito, o un mensaje de error si falló.
 */
export function editPlayerName(id, newName) {
    const cleanName = newName.trim().toUpperCase();

    // Validaciones
    if (cleanName.length === 0 || cleanName.length > MAX_NAME_LENGTH) {
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
        return true;
    }
    return "Error desconocido al editar el jugador.";
}

/**
 * Guarda el array de roles especiales activados en localStorage.
 * @param {Array<string>} roles - Lista de IDs de roles seleccionados.
 */
export function guardarPreferenciasRoles(roles) {
    localStorage.setItem(CONFIGS_KEY, JSON.stringify(roles));
}

/**
 * Recupera las preferencias de roles especiales guardadas.
 * @returns {Array<string>} Lista de roles seleccionados.
 */
export function cargarPreferenciasRoles() {
    const saved = localStorage.getItem(CONFIGS_KEY);
    return saved ? JSON.parse(saved) : [];
}

/**
 * Selecciona una palabra aleatoria asegurando que no se repita según el historial.
 * @returns {Object} El objeto de la palabra seleccionada de PALABRAS_CLAVE_LISTA.
 */
function seleccionarPalabra() {
    // Filtrar las palabras no usadas
    const availableWords = PALABRAS_CLAVE_LISTA.filter(word => !usedWordsHistory.includes(word));
    let palabraSeleccionada;

    if (availableWords.length === 0) {
        // Si todas las palabras han sido usadas, resetear el historial
        resetUsedWordsHistory();
        palabraSeleccionada = shuffleArray(PALABRAS_CLAVE_LISTA)[0];
    } else {
        // Seleccionar una palabra aleatoria de las disponibles
        palabraSeleccionada = shuffleArray(availableWords)[0];
    }

    // Añadir la palabra seleccionada al historial y guardarlo
    usedWordsHistory.push(palabraSeleccionada);
    saveUsedWordsHistory();
    return palabraSeleccionada;
}

/**
 * Mezcla aleatoriamente un array sin mutar el original.
 * @param {Array} array - El array a mezclar.
 * @returns {Array} Una nueva versión del array mezclada.
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
        const j = Math.floor(Math.random() * (i + 1));
        [rolesBarajados[i], rolesBarajados[j]] = [rolesBarajados[j], rolesBarajados[i]];
    }

    return rolesBarajados;
}

/**
 * Genera y mezcla la lista de roles que se asignarán a los jugadores.
 * @param {number} totalPlayers - Número total de participantes.
 * @param {number} numImpostors - Número de enemigos (impostores o lobos).
 * @param {Array<string>} rolesPermitidos - IDs de roles especiales habilitados.
 * @returns {Array<string>} Array de strings con los roles asignados.
 */
export function asignarRoles(totalPlayers, numImpostors, rolesPermitidos) {
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;
    let roles = [];

    if (mode === MODE_IMPOSTOR) {
        // --- LÓGICA MODO IMPOSTOR ---

        // 1. Añadir Impostores
        for (let i = 0; i < numImpostors; i++) roles.push(ROLE_IMPOSTOR);

        // 2. Añadir los roles especiales seleccionados (si caben)
        // Barajamos los permitidos por si hay más seleccionados que huecos
        let especialesBarajados = shuffleArray([...rolesPermitidos]);

        // El límite de especiales es que quede al menos un tripulante normal
        // O añadir todos los seleccionados si el número de jugadores lo permite
        especialesBarajados.forEach(rol => {
            if (roles.length < totalPlayers - 1) roles.push(rol);
        });

        // 3. Rellenar el resto con Tripulantes normales
        const totalActual = roles.length;
        for (let i = 0; i < (totalPlayers - totalActual); i++) roles.push(ROLE_TRIPULANTE);
    } else {
        // --- LÓGICA MODO CASTRO NEGRO ---
        
        // 1. Añador al narrador si está activado
        if (rolesPermitidos.includes(ROLE_NARRADOR)) {
            roles.push(ROLE_NARRADOR);
            rolesPermitidos = rolesPermitidos.filter(r => r !== ROLE_NARRADOR);
        }

        // 2. Añadir a los Lobos
        for (let i = 0; i < numImpostors; i++) roles.push(ROLE_LOBO);

        // 3. Añadir los roles especiales seleccionados
        // Barajamos los permitidos por si hay más seleccionados que huecos
        let especialesBarajados = shuffleArray([...rolesPermitidos]);
        especialesBarajados.forEach(id => {
            if (roles.length < totalPlayers - 1) roles.push(id);
        });

        // 4. Rellenar el resto con Aldeanos normales
        while (roles.length < totalPlayers) roles.push(ROLE_ALDEANO);
    }

    // Mezcla los roles para asignarlos aleatoriamente a los jugadores
    return shuffleArray(roles);
}

/**
 * Crea las tarjetas de los jugadores en el DOM y asigna sus eventos de clic.
 * @param {Array<Object>} playerList - Lista de objetos de jugadores.
 * @param {Array<string>} roles - Lista de roles correspondientes a cada jugador.
 * @param {string|Object} palabraSecreta - Palabra asignada para la partida.
 */
function generarTarjetas(playerList, roles, palabraSecreta) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // Limpiar el tablero anterior

    for (let i = 0; i < playerList.length; i++) {
        const player = playerList[i]; // Obtener el objeto jugador
        const card = document.createElement('div');
        card.className = "relative bg-tarjeta p-4 rounded-lg shadow-xl border border-gray-700 flex items-center justify-center cursor-pointer transition duration-300 transform hover:scale-[1.03] active:scale-[0.98] aspect-[16/9]";

        const content = document.createElement('div');
        content.className = 'text-xl md:text-3xl font-bold text-acento truncate';
        content.textContent = player.name;

        card.onclick = function () {
            revelarRol(player, palabraSecreta);
        };

        card.appendChild(content);
        gameBoard.appendChild(card);
    }
}

/**
 * Recupera el estado completo de una partida en curso desde localStorage.
 * @returns {Object|null} Objeto con jugadores y palabra, o null si no hay partida.
 */
export function loadGameState() {
    try {
        const storedState = localStorage.getItem(GAME_STATE_KEY);
        if (storedState) return JSON.parse(storedState);
    } catch (e) {
        console.error("Error al cargar el estado de la partida desde localStorage:", e);
        // Limpiar el almacenamiento si el JSON está corrupto
        localStorage.removeItem(GAME_STATE_KEY);
    }
    return null;
}

/**
 * Limpia el estado de la partida actual pero mantiene la lista de jugadores.
 */
export function clearGameState() {
    nextPlayerId = players.length > 0 ? players.reduce((max, p) => Math.max(max, p.id), 0) + 1 : 1;
    savePlayerList();
    localStorage.removeItem(GAME_STATE_KEY); // Limpiar el estado de partida

    // Buscamos todas las claves que empiecen por nuestro prefijo y las borramos
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(PANEL_PLAYER_KEY)) localStorage.removeItem(key);
    });
}

/**
 * Finaliza la partida actual tras confirmación del usuario.
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
 * Inicializa el proceso de una nueva partida (asignación, procesado y renderizado).
 * @param {string} impostorsOption - Opción de configuración de enemigos.
 * @param {Array<string>} rolesPermitidos - Lista de roles especiales activos.
 */
export function iniciarPartida(impostorsOption, rolesPermitidos = []) {
    if (players.length < MIN_PLAYERS) {
        alert(`Necesitas al menos ${MIN_PLAYERS} jugadores para empezar.`);
        return;
    }

    const numImpostors = calcularNumImpostores(impostorsOption); // Calcular el número de impostores
    const finalImpostors = Math.min(numImpostors, players.length); //Asegurarse que no haya mas impostores que jugadores
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;

    // Seleccionar la palabra si NO es modo CASTRO NEGRO
    let palabraSecreta = '-';
    if (mode !== MODE_LOBO) {
        palabraSecreta = seleccionarPalabra();
    }

    // asignarRoles SÓLO retorna el array de roles.
    const roles = asignarRoles(players.length, finalImpostors, rolesPermitidos);

    // Asignar los roles a los jugadores
    players.forEach((player, index) => {
        player.role = roles[index];
        player.extraInfo = {}; // Inicializar para evitar errores
    });

    // Procesar la información cruzada
    // Aquí es donde el Cómplice se entera de quién es el Impostor, etc.
    procesarInformacionRoles(players);

    generarTarjetas(players, roles, palabraSecreta);

    UI.ocultarBotonesInicio();
    UI.mostrarTablero();

    // =========================================================
    // GUARDAR ESTADO EN localStorage
    // =========================================================

    const gameState = {
        palabra: palabraSecreta,
        jugadores: players.map(p => ({
            name: p.name,
            role: p.role,
            extraInfo: p.extraInfo || {}
        }))
    };

    try {
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    } catch (e) {
        console.error("Error al guardar el estado de la partida:", e);
    }
}

/**
 * Genera información adicional para los roles especiales (vínculos, letras, conteos).
 * @param {Array<Object>} listaJugadores - La lista de jugadores de la partida actual.
 */
export function procesarInformacionRoles(listaJugadores) {
    const todosLosImpostores = listaJugadores.filter(p => p.role === ROLE_IMPOSTOR);
    const todosLosCiviles = listaJugadores.filter(p => p.role === ROLE_TRIPULANTE);

    listaJugadores.forEach(player => {
        // --- FUNCIÓN HELPER PARA OBTENER UN ELEMENTO ALEATORIO DE UN ARRAY ---
        const getRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

        let data = null;

        switch (player.role) {
            case ROLE_DETECTIVE:
                data = {};
                listaJugadores.forEach(p => {
                    data[p.role] = (data[p.role] || 0) + 1;
                });
                break;
            case ROLE_COMPLICE:
            case ROLE_VIDENTE:
                data = getRandom(todosLosImpostores); //Impostor aleatorio
                break;
            case ROLE_PARANOICO:
                const impoAleatorio = getRandom(todosLosImpostores); //Impostor aleatorio

                // Persona aleatoria (que no sea él mismo ni el impostor elegido)
                const candidatosParaOtro = listaJugadores.filter(p => p.id !== player.id && p.id !== (impoAleatorio ? impoAleatorio.id : null));
                const personaAleatoria = getRandom(candidatosParaOtro);

                let parejaSospechosa = [impoAleatorio, personaAleatoria];

                // Si el número aleatorio es menor a 0.5, invertimos el orden
                if (Math.random() < 0.5) parejaSospechosa = [personaAleatoria, impoAleatorio];

                data = parejaSospechosa;
                break;
            case ROLE_GEMELO:
                const todosLosGemelos = listaJugadores.filter(p => p.role === ROLE_GEMELO);

                if (todosLosGemelos.length === 2) {
                    // Si hay dos, el dato extra es el OTRO gemelo
                    const compa = todosLosGemelos.find(p => p.id !== player.id);
                    data = { name: compa.name, role: compa.role };
                } else {
                    // Si solo hay uno, el dato extra es un tripulante
                    data = getRandom(todosLosCiviles);
                }
                break;
            case ROLE_POETA:
                const letras = "BCDFLMPRSTV";
                data = { letra: letras[Math.floor(Math.random() * letras.length)] };
                break;
        }
        player.extraInfo = data;
    });
}

/**
 * Genera el HTML y abre el modal para mostrar el rol asignado a un jugador.
 * @param {Object} player - El objeto del jugador a revelar.
 * @param {Object|string} palabraSecreta - La palabra clave y categoría de la partida.
 */
export function revelarRol(player, palabraSecreta) {
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;
    const contenedor = document.getElementById('role-modal');
    if (!contenedor) return;

    if (mode === MODE_LOBO) {
        // --- DISEÑO PARA MOODO CASTRO NEGRO ---
        const configRol = ROLES_LOBO_DATA.find(r => r.id === player.role) || { icon: '❓', color: 'gray-500', name: 'Desconocido', description: '' };
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
            <div class="mt-2 shrink-0">
                <button id="modal-close-btn" class="mt-2 w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition duration-150 text-lg">
                ¡Entendido! Ocultar y pasar.
                </button>
            </div>
        </div>`;
    } else {
        // --- DISEÑO PARA MODO IMPOSTOR ---
        const data = player.extraInfo;
        const configRol = ROLES_DATA.find(r => r.id === player.role) || { icon: '❓', color: 'gray-500' };
        const borderClass = `border-${configRol.color}`;
        const bgClass = `bg-${configRol.color}`;
        const textClass = `text-${configRol.color}`;

        // --- FUNCIÓN HELPER PARA GENERAR EL BLOQUE DE HABILIDAD ---
        const generarBloquePista = (titulo, contenido) => `
            <div class="bg-black/30 p-2 rounded-lg border-l-4 ${borderClass} mb-3 text-center">
                <p class="text-[10px] ${textClass} font-bold uppercase mb-1">${titulo}</p>
                <p class="text-sm font-bold text-white uppercase italic">${contenido}</p>
            </div>`;

        const divPalabra = `
            <div class="${bgClass}/10 border ${borderClass}/30 rounded-xl p-4 mb-4 text-center">
                <p class="text-[10px] ${textClass} font-bold uppercase mb-1">Palabra Secreta</p>
                <p class="text-4xl font-black text-white uppercase tracking-wide">${palabraSecreta.palabra}</p>
            </div>`;

        // Detectamos si su acompañante es también un Gemelo
        const esParejaReal = data && data.role === ROLE_GEMELO;

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
                html: divPalabra
            },
            [ROLE_COMPLICE]: {
                hint: "Protege su identidad a toda costa. Si él cae, tú también.",
                html: `${divPalabra}${generarBloquePista("Lealtad al Impostor", (data?.name || 'DESCONOCIDO') + ' EL IMPOSTOR')}`
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
                html: `${divPalabra}${generarBloquePista("Regla de Comunicación", (data?.letra ? `EMPIEZA CON "${data.letra}"` : "REGLA DESCONOCIDA"))}`
            },
            [ROLE_GEMELO]: {
                hint: esParejaReal
                    ? "Os habéis reconocido. Pero si uno muere el otro morirá también"
                    : "Es inocente, pero no sabe quién eres tú. Protégelo sin exponerte.",
                html: `${divPalabra}${generarBloquePista(esParejaReal ? "Alma Gemela" : "Vínculo Unilateral", 'Conoces A ' + (data?.name || "NADIE"))}`
            },
            [ROLE_DETECTIVE]: {
                hint: "Usa los números para detectar si alguien miente sobre su rol.",
                html: `${divPalabra}${generarBloquePista("Recuento de Objetivos", (data ? Object.entries(data).map(([r, c]) => `${c} ${r}`).join(" / ") : "ERROR"))}`
            },
            [ROLE_PARANOICO]: {
                hint: "Uno de ellos es el impostor. El otro es un misterio.",
                html: `${divPalabra}${generarBloquePista("Sospecha Dividida", (Array.isArray(data) ? `${data[0]?.name} / ${data[1]?.name}` : "???"))}`
            }
        };

        const rolContent = ROLES_STYLE[player.role] || ROLES_STYLE[ROLE_TRIPULANTE];

        contenedor.innerHTML = `
        <div class="rol-card bg-tarjeta rounded-2xl p-6 border-t-8 ${borderClass} shadow-2xl flex flex-col w-full max-w-[450px] mx-auto min-h-[400px]">
            <div class="flex items-center gap-3 mb-6">
                <span class="text-4xl">${configRol.icon}</span>
                <span class="text-2xl font-bold uppercase text-white">${player.name}</span>
            </div>
            <div class="flex-grow flex flex-col justify-center">${rolContent.html}</div>
            <p class="text-xs text-slate-400 leading-relaxed italic">${rolContent.hint}</p>
            <div class="mt-2 shrink-0">
                <button id="modal-close-btn" 
                class="mt-2 w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition duration-150 text-lg">
                ¡Entendido! Ocultar y pasar.
                </button>
            </div>
        </div>`;
    }
    UI.abrirModalRevelar();
}

/**
 * Reconstruye la sesión de juego desde un estado guardado.
 * @param {Object} state - Objeto que contiene jugadores, roles e información extra.
 */
export function restorePartida(state) {
    players = [];
    let currentId = 1;
    let roles = [];
    state.jugadores.forEach(playerObj => {
        // playerObj tiene esta forma: { name: "...", role: "...", extraInfo: {...} }
        players.push({
            id: currentId,
            name: playerObj.name,
            role: playerObj.role,
            extraInfo: playerObj.extraInfo || {}
        });
        roles.push(playerObj.role);
        currentId++;
    });

    nextPlayerId = currentId;
    generarTarjetas(players, roles, state.palabra);
    UI.ocultarBotonesInicio();
    UI.mostrarTablero();
    console.log("Partida restaurada con éxito.");
}

/**
 * Borra del almacenamiento local todas las variables que pertenecen al juego.
 */
export function limpiarTodasVariables() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(KEY_START)) localStorage.removeItem(key);
    });
    console.log("✅ Todas las variables de juego han sido borradas");
}

/**
 * Realiza el cálculo matemático para determinar cuántos enemigos habrá en la partida.
 * @param {string|number} impostorsOption - Opción de configuración (e.g., "3", "RANDOM_50").
 * @returns {number} Número final de enemigos.
 */
function calcularNumImpostores(impostorsOption) {
    const totalPlayers = players.length;
    const minImpostors = 1;
    if (totalPlayers < MIN_PLAYERS) return 0;
    const maxAbsoluteLimit = totalPlayers;

    // 1. Opción de número fijo (1, 2, 3, 4)
    const fixedNum = parseInt(impostorsOption, 10);
    if (!isNaN(fixedNum) && fixedNum >= minImpostors) return Math.min(fixedNum, maxAbsoluteLimit);

    // 2. Opción Aleatoria (RANDOM_X)
    let maxLimit = maxAbsoluteLimit;
    switch (impostorsOption) {
        // Máximo el 30% de los jugadores.
        case 'RANDOM_30': maxLimit = Math.min(Math.ceil(totalPlayers * 0.30), maxAbsoluteLimit); break;
        // Máximo el 50% de los jugadores.
        case 'RANDOM_50': maxLimit = Math.min(Math.ceil(totalPlayers * 0.50), maxAbsoluteLimit); break;
        case 'RANDOM_MAX': break;
        default: return minImpostors;
    }

    // Si el límite superior es 0 (ej: totalPlayers=2, RANDOM_30), lo forzamos a 1 si es posible.
    // Pero si totalPlayers >= MIN_PLAYERS, el límite siempre será >= 1.
    const upperLimit = Math.max(minImpostors, maxLimit);

    // Generar el número aleatorio (entre minImpostors y upperLimit, ambos incluidos)
    // El rango ahora es: [1, totalPlayers]
    return Math.floor(Math.random() * (upperLimit - minImpostors + 1)) + minImpostors;
}

/**
 * Prepara la información de revelación final para el modo Impostor.
 * @returns {Object} Grupos de jugadores clasificados para la UI final.
 */
export function obtenerRevelacionRoles() {
    // --- FUNCIÓN HELPER PARA OBTENER EL ICONO/COLOR ---
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

/**
 * Prepara la información de revelación final para el modo Lobo.
 * @returns {Object} Grupos de jugadores clasificados para la UI final.
 */
export function obtenerRevelacionLobo() {
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

/**
 * Selecciona un jugador al azar de la lista actual para sorteos rápidos.
 */
export function elegirJugadorAleatorio() {
    if (players.length === 0) return;
    const elegido = players[Math.floor(Math.random() * players.length)];
    UI.mostrarElegido(elegido.name);
}