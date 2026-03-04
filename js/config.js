// === CONFIGURACIÓN DE JUGADORES ===
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

// === CONFIGURACIÓN DE NOMBRES ===
export const MAX_NAME_LENGTH = 15;
export const MIN_NAME_LENGTH = 1;

// === IDENTIFICADORES DE ROLES ===
export const ROLE_IMPOSTOR = "IMPOSTOR";
export const ROLE_TRIPULANTE = "TRIPULANTE";
export const ROLE_COMPLICE = "COMPLICE";
export const ROLE_PARANOICO = "PARANOICO";
export const ROLE_GLITCH = "GLITCH";
export const ROLE_POETA = "POETA";
export const ROLE_DESPISTADO = "DESPISTADO"
export const ROLE_VIDENTE = "VIDENTE";
export const ROLE_GEMELO = "GEMELO";
export const ROLE_DETECTIVE = "DETECTIVE";
export const ROLE_GEMELO_EXTRA = "ROLE_GEMELO_EXTRA";

export const ROLES_DATA = [
    { id: ROLE_IMPOSTOR, name: "Impostor", icon: "💀", color: "red-500" },
    { id: ROLE_TRIPULANTE, name: "Tripulante", icon: "👤", color: "slate-400" },
    { id: ROLE_DETECTIVE, name: "Detective", icon: "🕵️", color: "blue-400" },
    { id: ROLE_COMPLICE, name: "Cómplice", icon: "🎭", color: "rose-400" },
    { id: ROLE_PARANOICO, name: "Paranoico", icon: "🧪", color: "yellow-500" },
    { id: ROLE_VIDENTE, name: "Vidente", icon: "🔮", color: "purple-400" },
    { id: ROLE_GLITCH, name: "Glitch", icon: "👾", color: "fuchsia-500" },
    { id: ROLE_DESPISTADO, name: "Despistado", icon: "😵‍💫", color: "orange-400" },
    { id: ROLE_GEMELO, name: "Gemelo", icon: "👯", color: "green-400" },
    { id: ROLE_POETA, name: "Poeta", icon: "✍️", color: "indigo-300" },
    { id: ROLE_GEMELO_EXTRA, name: "2º Gemelo", icon: "➕", color: "green-400" }
];

// === CLAVES DE ALMACENAMIENTO (LocalStorage) ===
export const GAME_STATE_KEY = 'elImpostor_estadoActual';
export const PLAYER_LIST_KEY = 'elImpostor_listaJugadores';
export const IMPOSTORS_KEY = 'elImpostor_numImpostores';
export const USED_WORDS_KEY = 'elImpostor_palabrasUsadas';
export const CONFIGS_KEY = 'elImpostor_configuraciones';