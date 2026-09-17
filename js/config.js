// === CONFIGURACIÓN DE MODOS ===
export const MODE_IMPOSTOR = 'IMPOSTOR';
export const MODE_LOBO = 'LOBO';
export const MODE_CAMELOT = 'CAMELOT';

// === CONFIGURACIÓN DE JUGADORES ===
//export const MIN_PLAYERS = 3;
//export const MAX_PLAYERS = 20;
export const GAME_LIMITS = {
    [MODE_IMPOSTOR]: { min: 3, max: 20 },
    [MODE_LOBO]:     { min: 8, max: 22 },
    [MODE_CAMELOT]:  { min: 5, max: 10 }
};

// === CONFIGURACIÓN DE NOMBRES ===
export const MAX_NAME_LENGTH = 15;
export const MIN_NAME_LENGTH = 1;

export const OPCIONES_ENEMIGOS = {
    IMPOSTOR: [
        { label: "1 Impostor", value: 1 },
        { label: "2 Impostores", value: 2 },
        { label: "3 Impostores", value: 3 },
        { label: "4 Impostores", value: 4 },
        { label: "Impostores Random >30%", value: "RANDOM_30" },
        { label: "Impostores Random >50%", value: "RANDOM_50" },
        { label: "Impostores Random", value: "RANDOM_MAX" }
    ],
    LOBO: [
        { label: "2 Lobos", value: 2 },
        { label: "3 Lobos", value: 3 },
        { label: "4 Lobos", value: 4 }
    ]
};

// === IDENTIFICADORES DE ROLES IMPOSTOR ===
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
export const ROLE_GEMELO_EXTRA = "GEMELO_EXTRA";
export const ROLE_JUEZ = "JUEZ";

export const ROLE_IMPOSTOR_ESPE_TRIPULACION = [
    ROLE_DETECTIVE, ROLE_PARANOICO, ROLE_GLITCH, ROLE_DESPISTADO, 
    ROLE_VIDENTE, ROLE_POETA, ROLE_GEMELO, ROLE_JUEZ, ROLE_GEMELO_EXTRA
];
export const ROLE_IMPOSTOR_ESPE_IMPOSTOR = [
    ROLE_COMPLICE
];

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
    { id: ROLE_GEMELO_EXTRA, name: "2º Gemelo", icon: "➕", color: "green-400" },
    { id: ROLE_JUEZ, name: "Juez", icon: "🧑🏻‍⚖️", color: "amber-400" }
];

// === IDENTIFICADORES DE ROLES LOBO ===
export const ROLE_NARRADOR = "NARRADOR";
export const ROLE_LOBO = "LOBO";
export const ROLE_ALDEANO = "ALDEANO";
export const ROLE_PITONISA = "PITONISA";
export const ROLE_CAZADOR = "CAZADOR";
export const ROLE_CUPIDO = "CUPIDO";
export const ROLE_BRUJA = "BRUJA";
export const ROLE_ZORRO = "ZORRO";
export const ROLE_PROTECTOR = "PROTECTOR";
export const ROLE_ALCALDE = "ALCALDE";
export const ROLE_LOBO_BLANCO = "LOBO_BLANCO";
export const ROLE_LOBO_CACHORRO = "LOBO_CACHORRO";
export const ROLE_ANCIANO = "ANCIANO";
export const ROLE_CUERVO = "CUERVO";

export const ROLE_LOBO_ESPE_ALDEA = [
    ROLE_ALCALDE, ROLE_PITONISA, ROLE_ZORRO, ROLE_BRUJA, ROLE_CUERVO, 
    ROLE_PROTECTOR, ROLE_CAZADOR, ROLE_CUPIDO, ROLE_ANCIANO, ROLE_NARRADOR
];
export const ROLE_LOBO_ESPE_LOBOS = [
    ROLE_LOBO_CACHORRO, ROLE_LOBO_BLANCO
];

export const ROLES_LOBO_DATA = [
    { id: ROLE_LOBO, name: "Hombre Lobo", icon: "🐺", color: "red-500", description: "Cada noche, tú y los tuyos elegís a una víctima para devorarla. ¡No dejes que te descubran!" },
    { id: ROLE_LOBO_CACHORRO, name: "Cachorro", icon: "🦴", color: "red-300", description: "Si el pueblo te lincha, los lobos se enfurecen y podrán matar a dos víctimas la noche siguiente." },
    { id: ROLE_LOBO_BLANCO, name: "Lobo Blanco", icon: "🐾", color: "slate-50", description: "Despierta con los lobos, pero cada dos noches puede eliminar a un hombre lobo. Su objetivo es ser el único superviviente." },
    { id: ROLE_ALDEANO, name: "Aldeano", icon: "👨‍🌾", color: "gray-400", description: "No tienes poderes especiales, pero tu voto es vital para linchar a los lobos." },
    { id: ROLE_ALCALDE, name: "Alcalde", icon: "🎖️", color: "amber-500", description: "Tu voto vale por dos en las votaciones del pueblo. Si mueres, debes elegir a tu sucesor." },
    { id: ROLE_PITONISA, name: "Pitonisa", icon: "🔮", color: "indigo-400", description: "El ojo que todo lo ve. Cada noche puedes conocer la verdadera identidad de un jugador." },
    { id: ROLE_ZORRO, name: "Zorro", icon: "🦊", color: "orange-400", description: "Si señalas a un grupo de 3 y hay al menos un lobo, tu instinto te avisará. Si no, pierdes tu poder." },
    { id: ROLE_BRUJA, name: "Bruja", icon: "🧙‍♀️", color: "purple-500", description: "Posees dos pociones: una para devolver la vida y otra para arrebatarla. Úsalas con sabiduría." },
    { id: ROLE_CUERVO, name: "Cuervo", icon: "🐦‍⬛", color: "blue-500", description: "Al final de la noche, señala a alguien. Ese jugador tendrá dos votos en contra automáticamente en el consejo." },
    { id: ROLE_PROTECTOR, name: "Protector", icon: "🛡️", color: "sky-400", description: "Cada noche proteges a alguien de las garras de los lobos. No puedes proteger a la misma persona dos veces seguidas." },
    { id: ROLE_CAZADOR, name: "Cazador", icon: "🏹", color: "emerald-500", description: "Si los lobos te matan o el pueblo te lincha, tienes una última bala para llevarte a alguien contigo." },
    { id: ROLE_CUPIDO, name: "Cupido", icon: "💘", color: "pink-400", description: "Al inicio, une a dos almas. Si uno muere, el otro morirá de pena. Su objetivo es sobrevivir juntos." },
    { id: ROLE_ANCIANO, name: "Anciano", icon: "👴", color: "slate-400", description: "Sobrevive al primer ataque de los lobos. Si el pueblo lo lincha, todos pierden sus poderes." },
    { id: ROLE_NARRADOR, name: "Narrador", icon: "🎙️", color: "slate-500", description: "Eres el maestro de ceremonias. Conoces todos los roles y guías la noche. ¡No juegas, pero mandas!" }
];

// === ROLES DE CAMELOT ===
export const ROLE_MERLIN = "MERLIN";
export const ROLE_PERCIVAL = "PERCIVAL";
export const ROLE_SERVIDOR = "SERVIDOR";
export const ROLE_ASESINO = "ASESINO";
export const ROLE_MORGANA = "MORGANA";
export const ROLE_MORDRED = "MORDRED";
export const ROLE_OBERON = "OBERON";
export const ROLE_ESBIRRO = "ESBIRRO";

export const ROLE_CAMELOT_ESPE_ALIADO = [ROLE_MERLIN, ROLE_PERCIVAL];
export const ROLE_CAMELOT_ESPE_MORDRED = [ROLE_ASESINO, ROLE_MORGANA, ROLE_OBERON, ROLE_MORDRED];

export const ROLES_DISTRIBUTION_CAMELOT = [
    { jug: 5, aliados: 3, mordred: 2 },
    { jug: 6, aliados: 4, mordred: 2 },
    { jug: 7, aliados: 4, mordred: 3 },
    { jug: 8, aliados: 5, mordred: 3 },
    { jug: 9, aliados: 6, mordred: 3 },
    { jug: 10, aliados: 6, mordred: 4 },
];

export const ROLES_CAMELOT_DATA = [
    // --- BANDO DE ARTURO (BUENOS) ---
    {
        id: ROLE_MERLIN, name: 'Merlín', icon: '🧙‍♂️', color: "blue-500",
        description: 'Conoce la identidad de casi todos los Malvados, pero debe mantener su identidad en secreto (si el Asesino lo descubre al final, pierden los Leales).',
    },
    {
        id: ROLE_PERCIVAL, name: 'Percival', icon: '🛡️', color: "blue-500",
        description: 'Conoce quiénes son Merlín y Morgana, pero no sabe cuál es cuál.',
    },
    {
        id: ROLE_SERVIDOR, name: 'Servidor de Arturo', icon: '👨‍🌾', color: "blue-500",
        description: 'Leal a Arturo. No tiene habilidades especiales ni información adicional.',
    },

    // --- BANDO DE MORDRED (MALVADOS) ---
    {
        id: ROLE_ASESINO, name: 'El Asesino', icon: '🗡️', color: "red-500",
        description: 'Si los Leales completan 3 misiones, tiene la oportunidad final de adivinar quién es Merlín para robar la victoria.',
    },
    {
        id: ROLE_MORGANA, name: 'Morgana', icon: '🔮', color: "red-500",
        description: 'Se hace pasar por Merlín ante los ojos de Percival para confundir al bando leal.',
    },
    {
        id: ROLE_MORDRED, name: 'Mordred', icon: '👑', color: "red-500",
        description: 'Su presencia es desconocida para Merlín (Merlín no lo ve como malvado).',
    },
    {
        id: ROLE_OBERON, name: 'Oberón', icon: '🎭', color: "red-500",
        description: 'Es malvado, pero no conoce a sus compañeros malvados ni ellos lo conocen a él.',
    },
    {
        id: ROLE_ESBIRRO, name: 'Esbirro de Mordred', icon: '🐺', color: "red-500",
        description: 'Malvado sin habilidades especiales. Conoce a sus compañeros malvados.',
    }
];

// === CLAVES DE ALMACENAMIENTO (LocalStorage) ===
export const KEY_START = 'elImpostor_';
export const GAME_STATE_KEY = KEY_START + 'estadoActual';
export const PLAYER_LIST_KEY = KEY_START + 'listaJugadores';
export const IMPOSTORS_KEY = KEY_START + 'numImpostores';
export const USED_WORDS_KEY = KEY_START + 'palabrasUsadas';
export const CONFIGS_KEY = KEY_START + 'configuraciones';
export const GAME_MODE_KEY = KEY_START + 'gameMode';
export const PANEL_PLAYER_KEY = KEY_START + 'panel_';
export const CAMELOT_MISSIONS_KEY = KEY_START + 'camelot_misiones';
export const CAMELOT_VOTES_KEY = KEY_START + 'camelot_votos';
