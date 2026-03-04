import { ROLES_DATA, ROLE_IMPOSTOR, ROLE_TRIPULANTE, ROLE_GEMELO, ROLE_GEMELO_EXTRA } from './config.js';

/** 
 * Muestra el layout del juego.
 */

export function mostrarTablero() {
    document.getElementById('start-buttons').classList.add('hidden');
    document.getElementById('game-layout').classList.remove('hidden');
    document.querySelector('footer').classList.add('hidden')

    document.getElementById('reset-game-btn').classList.remove('hidden');
    document.getElementById('reset-game-btn').classList.add('flex');

    document.getElementById('reveal-roles-btn').classList.remove('hidden');
    document.getElementById('reveal-roles-btn').classList.add('flex');

    document.getElementById('random-start-btn').classList.remove('hidden');
    document.getElementById('random-start-btn').classList.add('flex');
}

/** 
 * Oculta el layout del juego. 
 */
export function ocultarTablero() {
    document.getElementById('start-buttons').classList.remove('hidden');
    document.getElementById('game-layout').classList.add('hidden');
    document.querySelector('footer').classList.remove('hidden')

    document.getElementById('reset-game-btn').classList.add('hidden');
    document.getElementById('reset-game-btn').classList.remove('flex');

    document.getElementById('reveal-roles-btn').classList.add('hidden');
    document.getElementById('reveal-roles-btn').classList.remove('flex');

    document.getElementById('random-start-btn').classList.add('hidden');
    document.getElementById('random-start-btn').classList.remove('flex');
}

/**
 * Muestra los botones de inicio y oculta los controles del juego.
 */
export function mostrarBotonesInicio() {
    document.getElementById('start-buttons').classList.remove('hidden');
    //document.getElementById('reset-game-btn').classList.add('hidden');
}

/**
 * Oculta los botones de inicio y muestra los controles del juego.
 */
export function ocultarBotonesInicio() {
    document.getElementById('start-buttons').classList.add('hidden');
    //document.getElementById('reset-game-btn').classList.remove('hidden');
}


let draggedPlayerId = null;

/** * Muestra el modal con el contenido del rol. 
 * @param {string} title Título del modal.
 * @param {string} body Contenido HTML del rol.
 */
export function mostrarModal(title, body, roleId) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('role-modal').classList.remove('hidden');
}

/** * Oculta el modal. 
 */
export function ocultarModal() {
    document.getElementById('role-modal').classList.add('hidden');
}

/**
 * Hace visible el modal de revelación de rol.
 * El contenido ya debe haber sido inyectado previamente por revelarRol.
 */
export function abrirModalRevelar() {
    const modal = document.getElementById('role-modal');
    if (!modal) return;

    // Mostramos el modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Buscamos el botón que se acaba de inyectar en el DOM
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        // Asignamos el evento de cierre (se dispara una sola vez)
        closeBtn.addEventListener('click', () => {
            cerrarModalRevelar();
        }, { once: true });
    }
}

/**
 * Oculta el modal de revelación de rol.
 */
export function cerrarModalRevelar() {
    const modal = document.getElementById('role-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    modal.classList.remove('flex');

    // Opcional: Limpiar el contenido para evitar que se vea el rol anterior 
    // brevemente la próxima vez que se abra.
    const content = document.getElementById('modal-body-content');
    if (content) content.innerHTML = '';
}

/**
 * Renderiza la lista de jugadores en el área de configuración, incluyendo botones de eliminación y edición.
 * @param {Array<{id: number, name: string}>} playersList - Array de objetos de jugador.
 * @param {function} removePlayerCallback - Función para eliminar un jugador (Game.removePlayer).
 * @param {function} editPlayerCallback - Función para editar el nombre del jugador (Game.editPlayerName).
 * @param {function} reorderPlayerCallback - Función para reordenar la lista (Game.reorderPlayers).
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

        // === CAMBIOS PARA DRAG AND DROP ===
        listItem.draggable = true; // Hace el elemento arrastrable
        listItem.dataset.id = player.id; // Almacena el ID del jugador
        // Añadimos 'cursor-grab' y 'transition'
        listItem.className = 'flex justify-between items-center bg-gray-900 p-2 rounded-lg border border-gray-700 cursor-grab transition duration-150 relative';

        // Evento dragstart: Guarda el ID del jugador arrastrado y añade clase de estilo
        listItem.addEventListener('dragstart', (e) => {
            draggedPlayerId = player.id;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', player.id);
            setTimeout(() => listItem.classList.add('opacity-50'), 0);
        });

        // Evento dragend: Limpia los estilos
        listItem.addEventListener('dragend', () => {
            listItem.classList.remove('opacity-50');
            // Asegurarse de que todos los elementos pierden el borde de dragover
            listElement.querySelectorAll('li').forEach(li => li.classList.remove('border-acento'));
        });

        // Evento dragenter: Añade el borde visual
        listItem.addEventListener('dragenter', (e) => {
            if (e.currentTarget.dataset.id != draggedPlayerId) {
                e.currentTarget.classList.add('border-2', 'border-acento', '-translate-y-0.5'); // Borde de feedback
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
                // Llamar a la lógica de reordenamiento en game.js
                reorderPlayerCallback(sourceId, targetId);
            }
        });
        // ===================================

        // Player Name (Editable)
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

            // === BANDERA PARA EVITAR DOBLE EJECUCIÓN ===
            let isEditing = true;

            const finishEdit = (newName) => {
                if (!isEditing) return; // Si ya se ejecutó, salimos inmediatamente.
                isEditing = false; // Desactivar la bandera para evitar re-entrada.

                const trimmedName = newName.trim().toUpperCase();
                let result = null;

                // 1. Llamada a la función de juego
                if (trimmedName && trimmedName !== player.name) {
                    result = editPlayerCallback(player.id, trimmedName);
                }

                // 2. Manejo de errores (Alerta y Reversión de UI)
                if (typeof result === 'string') {
                    alert(result); // <--- ÚNICO LUGAR DONDE SE MUESTRA EL ALERT
                }

                // 3. Revertir UI si no hubo éxito (result !== true)
                if (result !== true) {
                    // Si el elemento <input> sigue en el DOM, lo reemplazamos por el <span> original.
                    if (listItem.contains(input)) {
                        listItem.replaceChild(nameSpan, input);
                        nameSpan.textContent = player.name;
                    }
                }

                // Si 'result' fue true, game.js llamará a refreshPlayerListUI, reconstruyendo la lista.
            };

            // Evento al presionar ENTER
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    finishEdit(input.value);
                }
            });

            // Evento al perder el foco (clic fuera)
            input.addEventListener('blur', () => {
                // Ejecución directa, la bandera 'isEditing' se encarga de evitar duplicados.
                finishEdit(input.value);
            });

            // Reemplazar y enfocar
            listItem.replaceChild(input, nameSpan);
            input.focus();
        };

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'text-red-400 hover:text-red-500 transition duration-150 p-1 ml-2';
        deleteButton.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;

        deleteButton.onclick = () => {
            removePlayerCallback(player.id);
        };

        listItem.appendChild(nameSpan);
        listItem.appendChild(deleteButton);
        listElement.appendChild(listItem);
    });
}

export function mostrarModalRoles(data) {
    const impList = document.getElementById('impostors-list-reveal');
    const specList = document.getElementById('special-list-reveal');
    const civList = document.getElementById('civilians-list-reveal');

    const renderLista = (listaElement, elementos) => {
        listaElement.innerHTML = '';
        elementos.forEach(item => {
            const li = document.createElement('li');
            // 'item' ahora trae el .color desde game.js (vía ROLES_DATA)
            const colorClase = item.color ? `text-${item.color}` : 'text-white';

            li.className = `flex items-center gap-2 ${colorClase} font-medium`;
            const texto = item.rol ? `${item.nombre} (${item.rol})` : item.nombre;
            li.innerHTML = `<span>${item.icon}</span> ${texto}`;
            listaElement.appendChild(li);
        });
    };

    // Llamada simplificada:
    renderLista(impList, data.impostores);
    renderLista(specList, data.especiales);
    renderLista(civList, data.inocentes);

    document.getElementById('roles-modal').classList.replace('hidden', 'flex');
}

// Función para obtener los roles seleccionados por el usuario
export function getSelectedRoles() {
    const checkboxes = document.querySelectorAll('.role-check:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

export function mostrarElegido(nombre) {
    const modal = document.getElementById('start-player-modal');
    const nameDisplay = document.getElementById('start-player-name');

    nameDisplay.textContent = nombre.toUpperCase();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * Marca los checkboxes de roles según la lista proporcionada.
 * @param {Array<string>} rolesList - Lista de roles a marcar.
 */
export function aplicarPreferenciasRolesUI(rolesList) {
    const checkboxes = document.querySelectorAll('.role-check');
    checkboxes.forEach(cb => {
        cb.checked = rolesList.includes(cb.value);
    });

    // IMPORTANTE: Tras marcar los checks, forzar la validación de los gemelos
    const checkPrin = document.getElementById(`check-${ROLE_GEMELO}`);
    if (checkPrin) {
        // Esto dispara manualmente la lógica de habilitar/deshabilitar el 2º gemelo
        checkPrin.dispatchEvent(new Event('change'));
    }
}

export function generarCheckboxesRoles() {
    const container = document.getElementById('roles-checkboxes');
    if (!container) return;

    container.innerHTML = '';

    const rolesEspeciales = ROLES_DATA.filter(rol =>
        rol.id !== ROLE_IMPOSTOR && rol.id !== ROLE_TRIPULANTE
    );

    rolesEspeciales.forEach(rol => {
        const label = document.createElement('label');
        // Usamos la constante ROLE_GEMELO_EXTRA de config.js
        //const isExtra = rol.id === ROLE_GEMELO_EXTRA;
        const isExtra = false;

        label.className = `flex items-center space-x-2 text-sm cursor-pointer hover:text-white transition-colors ${isExtra ? 'ml-6 border-l border-gray-700 pl-2' : ''}`;

        label.innerHTML = `
            <input type="checkbox" value="${rol.id}" id="check-${rol.id}" class="role-check accent-red-500 w-4 h-4">
            <span class="flex items-center gap-1">
                <span>${rol.icon}</span>
                <span class="${isExtra ? 'text-[11px] text-gray-400' : ''}">${rol.name}</span>
            </span>
        `;

        container.appendChild(label);
    });

    // --- LÓGICA DE VALIDACIÓN CORREGIDA ---
    // Usamos el ID dinámico basado en el valor de la constante
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

        // Ejecución inmediata por si hay datos cargados previamente
        sincronizarGemelos();
    }
}