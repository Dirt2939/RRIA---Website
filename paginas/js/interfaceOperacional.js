
class InterfaceOperacional {
    constructor() {
        this.currentScreen = 'screen-search';
        this.isXRayActive = false;
        this.frame = document.getElementById('phone-frame');
        this.screens = document.querySelectorAll('.app-screen');

        // Estado
        this.selectedLocationKey = null; // 'MORRO' ou 'CALCADAO'

        // Cache DOM
        this.xrayBtn = document.getElementById('btn-xray');
        this.xrayLayer = document.getElementById('xray-layer');
        this.statusIndicator = document.getElementById('system-status');

        this.init();
    }

    init() {
        this.setup3DTilt();
        this.setupControls();
        console.log('Interface Operacional Iniciada');
    }

    // --- 3D TILT EFFECT ---
    setup3DTilt() {
        // Desativa tilt se for tela pequena (melhor controle via CSS, mas bom garantir)
        if (window.innerWidth <= 900) return;

        const container = document.querySelector('.device-stage');

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calcula rotação (-15deg a +15deg)
            const xPct = x / rect.width;
            const yPct = y / rect.height;

            const rotateX = (0.5 - yPct) * 20; // Invertido para movimento natural
            const rotateY = (xPct - 0.5) * 20;

            this.frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(0.85)`;
        });

        container.addEventListener('mouseleave', () => {
            this.frame.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(0.85)';
        });
    }

    setupControls() {
        // Toggle XRay
        this.xrayBtn.addEventListener('click', () => this.toggleXRay());

        // Removed Dark Mode Listener to prevent crash
    }

    // --- SCREEN NAVIGATION ---
    goToScreen(screenId) {
        // Remove active class from all
        this.screens.forEach(s => {
            s.classList.remove('active');
            s.style.opacity = '0';
        });

        // Activate new screen with delay for transition
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            setTimeout(() => target.style.opacity = '1', 50);
            this.currentScreen = screenId;

            // Re-render XRay if active
            if (this.isXRayActive) this.renderXRayPins();
        }
    }

    selectDestination(name, key) {
        console.log(`Destino selecionado: ${name} [${key}]`);
        this.selectedLocationKey = key; // Save selection for events

        // 1. Show Loading
        this.goToScreen('screen-loading');

        // 2. Simulate Calculation
        setTimeout(() => {
            // 3. Show Result
            this.goToScreen('screen-navigation');

            // Preenche dados fictícios baseados no destino
            document.querySelector('.nav-header .street-name').textContent = `Via para ${name}`;

            // Reset state
            this.triggerEvent('CLEAR');
        }, 1500);
    }

    endNavigation() {
        this.triggerEvent('CLEAR'); // Reseta estado antes de sair
        this.goToScreen('screen-search');
    }


    // --- X-RAY MODE ---
    // --- X-RAY MODE ---
    toggleXRay() {
        if (this.currentScreen !== 'screen-navigation') {
            alert('O Raio-X de Dados só está disponível durante a navegação ativa.');
            return;
        }

        this.isXRayActive = !this.isXRayActive;
        this.xrayBtn.classList.toggle('active', this.isXRayActive);
        document.body.classList.toggle('xray-active', this.isXRayActive);

        if (this.isXRayActive) {
            this.renderXRayPins();
        } else {
            this.xrayLayer.innerHTML = '';
        }
    }

    renderXRayPins() {
        this.xrayLayer.innerHTML = ''; // Limpa anteriores

        const activeScreenEl = document.getElementById(this.currentScreen);
        if (!activeScreenEl) return;

        const elements = activeScreenEl.querySelectorAll('[data-db-source]');

        elements.forEach(el => {
            this.createPin(el);
        });
    }

    createPin(targetEl) {
        const source = targetEl.dataset.dbSource; // "Tabela: X | Campo: Y"
        const rect = targetEl.getBoundingClientRect();
        const frameRect = this.frame.getBoundingClientRect(); // Relativo ao frame

        // Ajuste fino para elementos do rodapé (nav-footer)
        const isFooter = targetEl.closest('.nav-footer');
        const verticalOffset = isFooter ? 20 : -6; // Mais para baixo se for rodapé

        // Posição relativa ao container do celular (que possui position: relative)
        const top = rect.top - frameRect.top + (rect.height / 2) + verticalOffset;
        const left = rect.left - frameRect.left + (rect.width / 2) - 6;

        const pin = document.createElement('div');
        pin.className = 'xray-pin';
        pin.style.top = `${top}px`;
        pin.style.left = `${left}px`;

        const tooltip = document.createElement('div');
        tooltip.className = 'xray-tooltip';
        tooltip.textContent = source;
        tooltip.style.top = `${top - 30}px`;
        tooltip.style.left = `${left + 15}px`;

        this.xrayLayer.appendChild(pin);
        this.xrayLayer.appendChild(tooltip);
    }

    // --- EVENTS SIMULATION ---
    triggerEvent(type) {
        if (this.currentScreen !== 'screen-navigation') {
            alert('Vá para a tela de navegação primeiro (selecione um destino).');
            return;
        }

        const alertFab = document.getElementById('alert-fab');
        const etaValue = document.getElementById('eta-value');
        const mapBackground = document.querySelector('.map-background');

        // Reset styles
        alertFab.style.display = 'none';
        mapBackground.style.filter = '';

        // Reset Buttons Highlight
        document.querySelectorAll('.event-card').forEach(btn => btn.classList.remove('active-event'));

        // Path to images in paginas/img/
        // Format: morro_via-liberada.png, calcadao_acidente.png
        // Default prefix
        const prefix = this.selectedLocationKey === 'MORRO' ? 'morro' : 'calcadao';

        if (type === 'TRAFFIC') {
            this.showFab('Trânsito Detectado', '#f59e0b');
            etaValue.textContent = '22 min (+8)';
            etaValue.style.color = '#f59e0b';
            this.updateMapImage(`${prefix}_transito-intenso.png`);
            this.highlightButton(0);

        } else if (type === 'ACCIDENT') {
            this.showFab('Acidente! Recalculando...', '#ef4444');
            etaValue.textContent = '35 min (+15)';
            etaValue.style.color = '#ef4444';

            // Handle inconsistent naming: morro-acidente vs calcadao_acidente
            let imgName = `${prefix}_acidente.png`;
            if (prefix === 'morro') imgName = 'morro-acidente.png';

            this.updateMapImage(imgName);
            this.highlightButton(1);

        } else if (type === 'CLEAR') {
            etaValue.textContent = '14 min';
            etaValue.style.color = 'var(--primary)';
            this.updateMapImage(`${prefix}_via-liberada.png`);
            this.highlightButton(2);
        }
    }

    showFab(text, color) {
        const fab = document.getElementById('alert-fab');
        fab.style.display = 'flex';
        fab.querySelector('span:last-child').textContent = text;
        fab.style.background = color;
    }

    updateMapImage(filename) {
        const mapBg = document.querySelector('.map-background');
        mapBg.style.backgroundImage = `url('../../paginas/img/${filename}')`;
    }

    highlightButton(index) {
        const buttons = document.querySelectorAll('.event-card');
        if (buttons[index]) buttons[index].classList.add('active-event');
    }
}

// Inicializa
const app = new InterfaceOperacional();
