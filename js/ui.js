import { ROLES_DATA, ROLES_LOBO_DATA, ROLE_IMPOSTOR, ROLE_TRIPULANTE, ROLE_LOBO, ROLE_ALDEANO, ROLE_GEMELO, ROLE_GEMELO_EXTRA, GAME_MODE_KEY, OPCIONES_ENEMIGOS, PANEL_PLAYER_KEY, MODE_IMPOSTOR, MODE_LOBO } from './config.js';

// Variable global para rastrear el ID del jugador durante el arrastre
let draggedPlayerId = null;

// =========================================================
// 1. GESTIÓN DE PANTALLAS Y NAVEGACIÓN
// =========================================================

/** 
 * Configura y muestra el layout principal del tablero de juego ocultando el inicio.
 * Ajusta visualmente los botones según el modo (Impostor o Lobo).
 */
export function mostrarTablero() {
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR; // Detectar el modo actual
    const revealBtn = document.getElementById('reveal-roles-btn');

    document.getElementById('start-buttons').classList.add('hidden');
    document.getElementById('game-layout').classList.remove('hidden');
    document.querySelector('footer').classList.add('hidden');

    document.getElementById('reset-game-btn').classList.remove('hidden');
    document.getElementById('reset-game-btn').classList.add('flex');

    revealBtn.classList.remove('hidden');
    revealBtn.classList.add('flex');

    // Lógica condicional para el botón de inicio aleatorio y el resumen de roles
    const randomBtn = document.getElementById('random-start-btn');
    if (mode === MODE_LOBO) {
        randomBtn.classList.add('hidden');
        randomBtn.classList.remove('flex');
        revealBtn.innerHTML = `<span class="mr-2">🏘️</span> Estado De Aldea`;
    } else {
        randomBtn.classList.remove('hidden');
        randomBtn.classList.add('flex');
        revealBtn.innerHTML = `<span class="mr-2">📂</span> Ver Roles`;
    }
}

/** 
 * Oculta el layout del juego y restaura la pantalla de configuración inicial.
 */
export function ocultarTablero() {
    document.getElementById('start-buttons').classList.remove('hidden');
    document.getElementById('game-layout').classList.add('hidden');
    document.querySelector('footer').classList.remove('hidden');

    document.getElementById('reset-game-btn').classList.add('hidden');
    document.getElementById('reset-game-btn').classList.remove('flex');

    document.getElementById('reveal-roles-btn').classList.add('hidden');
    document.getElementById('reveal-roles-btn').classList.remove('flex');

    document.getElementById('random-start-btn').classList.add('hidden');
    document.getElementById('random-start-btn').classList.remove('flex');
}

/**
 * Muestra específicamente el contenedor de botones de inicio.
 */
export function mostrarBotonesInicio() {
    document.getElementById('start-buttons').classList.remove('hidden');
}

/**
 * Oculta específicamente el contenedor de botones de inicio.
 */
export function ocultarBotonesInicio() {
    document.getElementById('start-buttons').classList.add('hidden');
}

// =========================================================
// 2. GESTIÓN DE MODALES
// =========================================================

/** * Muestra el modal genérico con un título y cuerpo HTML específico.
 * @param {string} title - Título del modal.
 * @param {string} body - Contenido HTML del rol o mensaje.
 */
export function mostrarModal(title, body) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('role-modal').classList.remove('hidden');
}

/** 
 * Oculta el modal genérico. 
 */
export function ocultarModal() {
    document.getElementById('role-modal').classList.add('hidden');
}

/**
 * Activa la visualización del modal de revelación de rol asignado.
 * Inyecta dinámicamente el evento de cierre al botón generado.
 */
export function abrirModalRevelar() {
    const modal = document.getElementById('role-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            cerrarModalRevelar();
        }, { once: true });
    }
}

/**
 * Cierra el modal de revelación de rol y limpia su contenido interno.
 */
export function cerrarModalRevelar() {
    const modal = document.getElementById('role-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    modal.classList.remove('flex');

    const content = document.getElementById('modal-body-content');
    if (content) content.innerHTML = '';
}

// =========================================================
// 3. RENDERIZADO DE LISTA Y JUGADORES
// =========================================================

/**
 * Dibuja la lista de jugadores en el DOM con soporte para edición, eliminación y Drag & Drop.
 * @param {Array<Object>} playersList - Lista de objetos {id, name}.
 * @param {Function} removePlayerCallback - Función del core para borrar jugador.
 * @param {Function} editPlayerCallback - Función del core para editar nombre.
 * @param {Function} reorderPlayerCallback - Función del core para reordenar lista.
 */
export function renderPlayerList(playersList, removePlayerCallback, editPlayerCallback, reorderPlayerCallback) {
    const listElement = document.getElementById('players-list');
    const emptyMessage = document.getElementById('empty-list-message');
    listElement.innerHTML = '';

    if (playersList.length === 0) {
        emptyMessage.classList.remove('hidden');
        return;
    }

    emptyMessage.classList.add('hidden');

    playersList.forEach(player => {
        const listItem = document.createElement('li');
        listItem.draggable = true;
        listItem.dataset.id = player.id;
        listItem.className = 'flex justify-between items-center bg-gray-900 p-2 rounded-lg border border-gray-700 cursor-grab transition duration-150 relative';

        // --- LÓGICA DRAG & DROP ---
        listItem.addEventListener('dragstart', (e) => {
            draggedPlayerId = player.id;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', player.id);
            setTimeout(() => listItem.classList.add('opacity-50'), 0);
        });

        // Evento dragend: Limpia los estilos
        listItem.addEventListener('dragend', () => {
            listItem.classList.remove('opacity-50');
            listElement.querySelectorAll('li').forEach(li => li.classList.remove('border-acento'));
        });

        // Evento dragenter: Añade el borde visual
        listItem.addEventListener('dragenter', (e) => {
            if (e.currentTarget.dataset.id != draggedPlayerId) {
                e.currentTarget.classList.add('border-2', 'border-acento', '-translate-y-0.5');
            }
        });

        // Evento dragover: Permite soltar aquí
        listItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        // Evento dragleave: Limpia el estilo de feedback
        listItem.addEventListener('dragleave', (e) => {
            e.currentTarget.classList.remove('border-2', 'border-acento', '-translate-y-0.5');
        });

        // Evento drop: Maneja la lógica de reordenamiento
        listItem.addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('border-2', 'border-acento', '-translate-y-0.5');
            const targetId = parseInt(e.currentTarget.dataset.id);
            const sourceId = parseInt(draggedPlayerId);
            if (sourceId && targetId && sourceId !== targetId) {
                reorderPlayerCallback(sourceId, targetId);
            }
        });

        // --- NOMBRE DEL JUGADOR (EDITABLE) ---
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-white text-base md:text-lg truncate flex-1 cursor-pointer hover:text-acento transition duration-150';
        nameSpan.textContent = player.name;

        // LÓGICA DE EDICIÓN AL HACER CLIC
        nameSpan.onclick = function () {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = player.name;
            input.maxLength = 15;
            input.className = 'flex-1 p-1 bg-gray-700 border border-acento text-white rounded-md focus:outline-none';

            // Bandera para evitar doble ejecución
            let isEditing = true;
            const finishEdit = (newName) => {
                if (!isEditing) return;
                isEditing = false;
                const trimmedName = newName.trim().toUpperCase();
                let result = null;

                // 1. Llamada a la función de juego
                if (trimmedName && trimmedName !== player.name) {
                    result = editPlayerCallback(player.id, trimmedName);
                }

                // 2. Manejo de errores (Alerta y Reversión de UI)
                if (typeof result === 'string') alert(result);

                // 3. Revertir UI si no hubo éxito (result !== true)
                if (result !== true) {
                    if (listItem.contains(input)) {
                        listItem.replaceChild(nameSpan, input);
                        nameSpan.textContent = player.name;
                    }
                }
            };

            // Evento al presionar ENTER
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') finishEdit(input.value); });

            // Evento al perder el foco (clic fuera)
            input.addEventListener('blur', () => { finishEdit(input.value); });

            // Reemplazar y enfocar
            listItem.replaceChild(input, nameSpan);
            input.focus();
        };

        // --- BOTÓN ELIMINAR ---
        const deleteButton = document.createElement('button');
        deleteButton.className = 'text-red-400 hover:text-red-500 transition duration-150 p-1 ml-2';
        deleteButton.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
        deleteButton.onclick = () => removePlayerCallback(player.id);

        listItem.appendChild(nameSpan);
        listItem.appendChild(deleteButton);
        listElement.appendChild(listItem);
    });
}

// =========================================================
// 4. REVELACIÓN FINAL Y PANEL DEL NARRADOR
// =========================================================

/**
 * Muestra el modal final de roles con las listas de impostores, especiales y civiles.
 * @param {Object} data - Objeto con arrays {impostores, especiales, inocentes}.
 */
export function mostrarModalRoles(data) {
    const impList = document.getElementById('impostors-list-reveal');
    const specList = document.getElementById('special-list-reveal');
    const civList = document.getElementById('civilians-list-reveal');

    const renderLista = (listaElement, elementos) => {
        listaElement.innerHTML = '';
        elementos.forEach(item => {
            const li = document.createElement('li');
            const colorClase = item.color ? `text-${item.color}` : 'text-white';
            li.className = `flex items-center gap-2 ${colorClase} font-medium`;
            const texto = item.rol ? `${item.nombre} (${item.rol})` : item.nombre;
            li.innerHTML = `<span>${item.icon}</span> ${texto}`;
            listaElement.appendChild(li);
        });
    };

    renderLista(impList, data.impostores);
    renderLista(specList, data.especiales);
    renderLista(civList, data.inocentes);

    document.getElementById('roles-modal').classList.replace('hidden', 'flex');
}

/**
 * Genera y muestra la guía detallada para el Narrador en el modo Lobo.
 * Incluye estados de vida, pociones y orden de la noche.
 * @param {Object} datosAgrupados - Jugadores agrupados por {especiales, lobos, inocentes}.
 */
export function mostrarGuiaNarrador(datosAgrupados) {
    const contenedor = document.getElementById('modal-content');
    if (!contenedor) return;

    // Generar las secciones de forma dinámica
    const renderSeccion = (titulo, jugadores, colorClase) => {
        if (!jugadores || jugadores.length === 0) return '';
        return `
            <div class="mb-4">
                <h3 class="${colorClase} font-bold border-b border-gray-600 mb-2">${titulo}</h3>
                <div class="grid grid-cols-2 gap-1">
                    ${jugadores.map(p => generarTarjetaDetallada(p)).join('')}
                </div>
            </div>
        `;
    };

    contenedor.innerHTML = `
        <div class="w-full max-w-lg mx-auto">
            <h2 class="text-xl font-black text-acento uppercase text-center mb-4">Panel del Narrador</h2>
            <div class="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                ${renderSeccion('LOBOS', datosAgrupados.lobos, 'text-indigo-500')}
                ${renderSeccion('ROLES ESPECIALES', datosAgrupados.especiales, 'text-amber-400')}
                ${renderSeccion('ALDEANOS', datosAgrupados.inocentes, 'text-gray-400')}
            </div>
        </div>
        <div class="mt-1 p-3 bg-gray-900 border border-indigo-500/30 rounded-lg">
            <!--<p class="text-[9px] text-gray-400 uppercase font-black text-center mb-2">Orden de la Noche</p>-->
            <div class="grid grid-cols-3 gap-2 text-[10px] text-gray-200">
                <span class="bg-gray-800 p-1 rounded">1. 🛡️ Protector</span>
                <span class="bg-gray-800 p-1 rounded">2. 🔮 Pitonisa</span>
                <span class="bg-gray-800 p-1 rounded">3. 🦊 Zorro</span>
                <span class="bg-gray-800 p-1 rounded">4. 🐦‍⬛ Cuervo</span>
                <span class="bg-gray-800 p-1 rounded">5. 🐺 Lobos</span>
                <span class="bg-gray-800 p-1 rounded">6. 🧙‍♀️ Bruja</span>
            </div>
        </div>
    `;

    document.getElementById('roles-modal').classList.replace('hidden', 'flex');
}

/**
 * Genera el HTML de una tarjeta de jugador para el panel del narrador con controles de estado.
 * @param {Object} p - Objeto del jugador con icon y nombre.
 * @returns {string} String de HTML para la fila del jugador.
 */
function generarTarjetaDetallada(p) {
    const estadoGuardado = JSON.parse(localStorage.getItem(`${PANEL_PLAYER_KEY}${p.nombre}`)) || {
        muerto: false,
        enamorado: false,
        pocionVida: false,
        pocionMuerte: false
    };

    return `
        <div class="flex items-center justify-between bg-gray-800/60 rounded border-b border-gray-700 player-row ${estadoGuardado.muerto ? 'opacity-30' : ''}" id="row-${p.nombre}" data-nombre="${p.nombre}">
            <div class="flex items-center overflow-hidden">
                <span class="text-lg">${p.icon}</span>
                <span class="text-xs font-bold text-slate-400 truncate pl-2 ">${p.nombre}</span>
            </div>
            <div class="flex items-center gap-1">
                ${p.id === 'BRUJA' ? `
                    <div class="flex gap-0.5 border-r border-gray-600 pr-1">
                        <button onclick="toggleEstadoPanel('${p.nombre}', 'pocionVida')" class="bg-blue-900/30 rounded ${estadoGuardado.pocionVida ? 'opacity-30' : ''}">🧪</button>
                        <button onclick="toggleEstadoPanel('${p.nombre}', 'pocionMuerte')" class="bg-red-900/30 rounded ${estadoGuardado.pocionMuerte ? 'opacity-30' : ''}">☠️</button>
                    </div>
                ` : ''}
                <button onclick="toggleEstadoPanel('${p.nombre}', 'muerto')" class="hover:bg-red-900 rounded">💀</button>
                <button onclick="toggleEstadoPanel('${p.nombre}', 'enamorado')" class="pr-1 text-gray-500 hover:text-pink-400 transition-colors ${estadoGuardado.enamorado ? 'text-pink-500' : 'text-gray-500'} btn-corazon">
                    <span>${estadoGuardado.enamorado ? '💘' : '🤍'}</span>
                </button>
            </div>
        </div>
    `;
}

// =========================================================
// 5. CONFIGURACIÓN Y PREFERENCIAS
// =========================================================

/**
 * Obtiene los IDs de los roles especiales que están marcados en la interfaz.
 * @returns {Array<string>} Lista de IDs de roles seleccionados.
 */
export function getSelectedRoles() {
    const checkboxes = document.querySelectorAll('.role-check:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Muestra el modal de inicio rápido indicando el nombre del jugador que debe empezar.
 * @param {string} nombre - Nombre del jugador elegido.
 */
export function mostrarElegido(nombre) {
    const modal = document.getElementById('start-player-modal');
    const nameDisplay = document.getElementById('start-player-name');
    nameDisplay.textContent = nombre.toUpperCase();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * Sincroniza visualmente los checkboxes de roles con una lista de preferencias.
 * @param {Array<string>} rolesList - Lista de roles que deben estar marcados.
 */
export function aplicarPreferenciasRolesUI(rolesList) {
    const checkboxes = document.querySelectorAll('.role-check');
    checkboxes.forEach(cb => {
        cb.checked = rolesList.includes(cb.value);
    });

    // Tras marcar los checks, forzar la validación de los gemelos
    const checkPrin = document.getElementById(`check-${ROLE_GEMELO}`);
    if (checkPrin) checkPrin.dispatchEvent(new Event('change'));
}

/**
 * Crea dinámicamente los checkboxes de roles especiales según el modo de juego activo.
 * Gestiona también la dependencia visual entre roles hermanos (como los gemelos).
 */
export function generarCheckboxesRoles() {
    const container = document.getElementById('roles-checkboxes');
    if (!container) return;
    container.innerHTML = '';

    // 1. Detectar el modo de juego
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;

    // 2. Elegir qué lista de roles mostrar
    const currentRolesData = (mode === MODE_LOBO) ? ROLES_LOBO_DATA : ROLES_DATA;

    // 3. Definir qué roles NO mostrar en la lista de selección (los básicos)
    const excludeIds = [ROLE_IMPOSTOR, ROLE_TRIPULANTE, ROLE_LOBO, ROLE_ALDEANO];
    const rolesEspeciales = currentRolesData.filter(rol => !excludeIds.includes(rol.id));

    rolesEspeciales.forEach(rol => {
        const label = document.createElement('label');
        const isExtra = rol.id === ROLE_GEMELO_EXTRA;
        label.className = `flex items-center space-x-2 text-sm cursor-pointer hover:text-white transition-colors ${isExtra ? 'ml-6 border-l border-gray-700 pl-2' : ''}`;
        label.innerHTML = `
            <input type="checkbox" value="${rol.id}" id="check-${rol.id}" class="role-check accent-acento w-4 h-4">
            <span class="flex items-center gap-1">
                <span>${rol.icon}</span>
                <span class="${isExtra ? 'text-[11px] text-gray-400' : ''}">${rol.name}</span>
            </span>
        `;
        container.appendChild(label);
    });

    // Activar la lógica de gemelos solo si estamos en modo Impostor
    if (mode === MODE_IMPOSTOR) {
        const checkPrincipal = document.getElementById(`check-${ROLE_GEMELO}`);
        const checkExtra = document.getElementById(`check-${ROLE_GEMELO_EXTRA}`);
        if (checkPrincipal && checkExtra) {
            const sincronizarGemelos = () => {
                if (!checkPrincipal.checked) {
                    checkExtra.checked = false;
                    checkExtra.disabled = true;
                    checkExtra.parentElement.classList.add('opacity-40', 'pointer-events-none');
                } else {
                    checkExtra.disabled = false;
                    checkExtra.parentElement.classList.remove('opacity-40', 'pointer-events-none');
                }
            };
            checkPrincipal.addEventListener('change', sincronizarGemelos);
            sincronizarGemelos();
        }
    }
}

/**
 * Actualiza las opciones del elemento <select> de cantidad de enemigos basándose en el modo actual.
 */
export function actualizarSelectorCantidad() {
    const selector = document.getElementById('impostors-select');
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;
    const opciones = OPCIONES_ENEMIGOS[mode] || OPCIONES_ENEMIGOS.IMPOSTOR;

    selector.innerHTML = '';
    opciones.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.value;
        el.textContent = opt.label;
        selector.appendChild(el);
    });
}

/**
 * Cambia los textos, enlaces y clases CSS del body para reflejar el tema visual (Lobo o Impostor).
 */
export function aplicarTemaVisual() {
    const mode = localStorage.getItem(GAME_MODE_KEY) || MODE_IMPOSTOR;
    const body = document.body;
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const labelNumImpostores = document.getElementById('label-num-impostores');
    const linkGuia = document.getElementById('linkGuia');

    if (mode === MODE_LOBO) {
        body.classList.add('tema-lobo');
        heroTitle.innerHTML = `El miedo tiene <span class="font-impostor text-acento">garras</span>`;
        heroSubtitle.innerHTML = "Al caer el sol, los vecinos se vuelven presas. Encuentra a la bestia antes de que el último aliento se apague.";
        labelNumImpostores.innerHTML = "Número de Lobos";
        linkGuia.href = `https://da-caro.github.io/setup-and-play/el-impostor-castronegro.html`;
    } else {
        body.classList.remove('tema-lobo');
        heroTitle.innerHTML = `La <span class="font-impostor text-acento">verdad</span> es un privilegio`;
        heroSubtitle.innerHTML = "Solo los elegidos conocen el secreto. Los demás deberán improvisar para sobrevivir. ¿Serás capaz de mantener la máscara hasta el final?";
        labelNumImpostores.innerHTML = "Número de Impostores";
        linkGuia.href = `https://da-caro.github.io/setup-and-play/el-impostor.html`;
    }
}

/**
 * Alterna el estilo visual (colores y estados activos) de los botones de cambio de modo.
 * @param {string} modo - El modo de juego seleccionado (MODE_IMPOSTOR | MODE_LOBO).
 */
export function actualizarEstiloBotones(modo) {
    const btnImpostor = document.getElementById('btn-mode-impostor');
    const btnWolf = document.getElementById('btn-mode-wolf');

    if (modo === MODE_IMPOSTOR) {
        btnImpostor.classList.add('bg-red-600', 'text-white');
        btnImpostor.classList.remove('text-gray-400');
        btnWolf.classList.remove('bg-indigo-600', 'text-white');
        btnWolf.classList.add('text-gray-400');
    } else {
        btnWolf.classList.add('bg-indigo-600', 'text-white');
        btnWolf.classList.remove('text-gray-400');
        btnImpostor.classList.remove('bg-red-600', 'text-white');
        btnImpostor.classList.add('text-gray-400');
    }
}