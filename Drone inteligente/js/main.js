// ===== MAIN.JS REFACTORED - COM 100 SOLICITAÇÕES =====

// Estado global da aplicação
let appState = {
    syncInProgress: false,
    selectedDestination: '',
    drones: {
        1: { id: 'Alpha-01', status: 'available', battery: 85, location: 'Base Central', lastMission: '14:32 - Centro' },
        2: { id: 'Beta-02', status: 'delivering', battery: 62, destination: 'Zona Norte', lastMission: '14:00 - Zona Norte' },
        3: { id: 'Gamma-03', status: 'charging', battery: 34, chargingTime: 45, lastMission: '13:15 - Aeroporto' }
    },
    deliveryInProgress: false,
    userRequests: [] // Aqui vamos armazenar as solicitações de 100 usuários
};

// Gerar 100 solicitações de usuários
const possibleDestinations = ['centro', 'zona-norte', 'zona-sul', 'zona-leste', 'zona-oeste', 'aeroporto', 'hospital', 'universidade'];
for (let i = 1; i <= 100; i++) {
    const randomDest = possibleDestinations[Math.floor(Math.random() * possibleDestinations.length)];
    appState.userRequests.push({
        user: `Usuário ${i}`,
        destination: randomDest,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending'
    });
}

// Espera o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    initializeElements();
    setupEventListeners();
    initializeUserData();
    startPeriodicUpdates();
    processUserRequests(); // Processar solicitações dos usuários
    console.log('🚁 Dashboard carregado com 100 solicitações simuladas!');
});

/** Verifica se o usuário está autenticado */
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('droneDeliveryAuth');
    const username = localStorage.getItem('droneDeliveryUser');

    if (!isAuthenticated || isAuthenticated !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('username').textContent = username || 'Admin';
}

/** Inicializa elementos do DOM */
function initializeElements() {
    window.syncBtn = document.getElementById('syncBtn');
    window.destinationSelect = document.getElementById('destination');
    window.deliverBtn = document.getElementById('deliverBtn');
    window.logoutBtn = document.getElementById('logoutBtn');
    window.activityLog = document.getElementById('activityLog');
    window.modalOverlay = document.getElementById('modalOverlay');
    window.toastContainer = document.getElementById('toastContainer');
}

/** Configura event listeners */
function setupEventListeners() {
    syncBtn.addEventListener('click', handleSyncDrones);
    destinationSelect.addEventListener('change', handleDestinationChange);
    deliverBtn.addEventListener('click', handleStartDelivery);
    logoutBtn.addEventListener('click', handleLogout);

    // Modal handlers
    document.getElementById('modalCancel').addEventListener('click', () => modalOverlay.classList.remove('show'));
}

/** Inicializa dados do usuário e sistema */
function initializeUserData() {
    updateSystemStatus();
    updateDroneCards();
    addLogEntry('Sistema inicializado com sucesso', 'success');
}

/** Sincroniza drones */
function handleSyncDrones() {
    if (appState.syncInProgress) return;

    appState.syncInProgress = true;
    syncBtn.classList.add('loading');

    addLogEntry('Iniciando sincronização dos drones...', 'info');

    setTimeout(() => {
        addLogEntry('Verificando status dos drones...', 'info');

        setTimeout(() => {
            appState.syncInProgress = false;
            syncBtn.classList.remove('loading');
            syncBtn.classList.add('success');

            addLogEntry('Todos os drones sincronizados com sucesso', 'success');
            updateDroneCards();
            showToast('Sincronização concluída!', 'success');

            setTimeout(() => syncBtn.classList.remove('success'), 2500);
        }, 1500);
    }, 1000);
}

/** Manipula mudança de destino */
function handleDestinationChange() {
    appState.selectedDestination = destinationSelect.value;
    deliverBtn.disabled = !appState.selectedDestination;
    deliverBtn.style.opacity = appState.selectedDestination ? '1' : '0.6';
    deliverBtn.style.cursor = appState.selectedDestination ? 'pointer' : 'not-allowed';

    if (appState.selectedDestination) {
        addLogEntry(`Destino selecionado: ${getDestinationName(appState.selectedDestination)}`, 'info');
    }
}

/** Inicia entrega */
function handleStartDelivery() {
    if (!appState.selectedDestination || appState.deliveryInProgress) return;

    const destination = getDestinationName(appState.selectedDestination);

    showModal(
        'Confirmar Entrega',
        `Iniciar entrega para ${destination}?`,
        () => startDeliveryProcess(destination)
    );
}

/** Processo de entrega */
function startDeliveryProcess(destination) {
    appState.deliveryInProgress = true;

    const availableDrone = Object.values(appState.drones).find(d => d.status === 'available');
    if (!availableDrone) {
        showToast('Nenhum drone disponível!', 'warning');
        appState.deliveryInProgress = false;
        return;
    }

    availableDrone.status = 'delivering';
    availableDrone.destination = destination;

    addLogEntry(`Entrega iniciada - Drone ${availableDrone.id}`, 'success');
    updateDroneCards();
    showToast(`Entrega para ${destination} iniciada`, 'success');

    setTimeout(() => completeDelivery(availableDrone, destination), 500);
}

/** Completa entrega */
function completeDelivery(drone, destination) {
    drone.status = 'available';
    drone.destination = null;
    drone.battery = Math.max(drone.battery - 15, 0);

    appState.deliveryInProgress = false;

    addLogEntry(`Entrega concluída - Drone ${drone.id}`, 'success');
    showToast(`Entrega para ${destination} concluída!`, 'success');
    updateDroneCards();
    updateSystemStatus();
}

/** Atualiza cards de drones */
function updateDroneCards() {
    const droneCards = document.querySelectorAll('.drone-card');

    droneCards.forEach(card => {
        const id = parseInt(card.dataset.drone);
        const drone = appState.drones[id];

        card.querySelector('.drone-status').textContent = capitalizeFirst(drone.status);
        card.querySelector('.battery-fill').style.width = `${drone.battery}%`;

        if (drone.status === 'charging') card.classList.add('charging-animation');
        else card.classList.remove('charging-animation');
    });
}

/** Atualiza status do sistema */
function updateSystemStatus() {
    const activeDrones = Object.values(appState.drones).filter(d => d.status === 'delivering').length;
    document.getElementById('activeDrones').textContent = activeDrones;
}

/** Logs */
function addLogEntry(message, type = 'info') {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.innerHTML = `<span class="log-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span> <span class="log-message">${message}</span>`;
    activityLog.prepend(logItem);
}

/** Toast */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => toast.remove(), 4000);
}

/** Modal */
function showModal(title, message, onConfirm) {
    modalOverlay.querySelector('h3').textContent = title;
    modalOverlay.querySelector('p').textContent = message;
    modalOverlay.classList.add('show');

    const confirmBtn = document.getElementById('modalConfirm');
    confirmBtn.onclick = () => {
        onConfirm();
        modalOverlay.classList.remove('show');
    };
}

/** Utils */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getDestinationName(id) {
    const map = {
        'centro': 'Centro da Cidade',
        'zona-norte': 'Zona Norte',
        'zona-sul': 'Zona Sul',
        'zona-leste': 'Zona Leste',
        'zona-oeste': 'Zona Oeste',
        'aeroporto': 'Aeroporto',
        'hospital': 'Hospital Central',
        'universidade': 'Universidade'
    };
    return map[id] || id;
}

/** Logout */
function handleLogout() {
    showModal('Confirmar Logout', 'Deseja realmente sair?', () => {
        localStorage.removeItem('droneDeliveryAuth');
        localStorage.removeItem('droneDeliveryUser');
        window.location.href = 'login.html';
    });
}

/** Periodic Updates */
function startPeriodicUpdates() {
    setInterval(() => {
        simulateBatteryChanges();
        updateDroneCards();
        updateSystemStatus();
    }, 30000);
}

/** Simula alterações de bateria */
function simulateBatteryChanges() {
    Object.values(appState.drones).forEach(drone => {
        if (drone.status === 'delivering') drone.battery = Math.max(0, drone.battery - 5);
        if (drone.status === 'available' && drone.battery < 20) {
            drone.status = 'charging';
            drone.chargingTime = 45;
            addLogEntry(`Drone ${drone.id} iniciando recarga`, 'warning');
        }
    });
}

/** Processa solicitações de usuários */
function processUserRequests() {
    if (appState.deliveryInProgress) return;

    const pendingRequests = appState.userRequests.filter(r => r.status === 'pending');

    if (!pendingRequests.length) return;

    pendingRequests.forEach(request => {
        const availableDrone = Object.values(appState.drones).find(d => d.status === 'available');
        if (availableDrone) {
            availableDrone.status = 'delivering';
            availableDrone.destination = request.destination;
            request.status = 'delivered';

            addLogEntry(`Entrega iniciada para ${request.user} - Drone ${availableDrone.id}`, 'success');
            updateDroneCards();
        }
    });
}
