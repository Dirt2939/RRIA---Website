/**
 * Motor de Decisão - JavaScript
 * Controla a simulação de cálculo de rotas em tempo real
 */

// Estado da aplicação
let isAnimating = false;
let currentStep = 0;
let selectedEvent = null;
let currentAnimationFrame = null; // Para cancelar animações

// Elementos DOM
const flowchartContainer = document.getElementById('flowchart');
const flowSteps = document.querySelectorAll('.flow-step');
const eventButtons = document.querySelectorAll('.event-btn');
const startButton = document.getElementById('btn-start');
const clearButton = document.getElementById('btn-clear');
const routePhase1 = document.getElementById('route-phase1');
const routePhase2 = document.getElementById('route-phase2');
const carMarker = document.getElementById('car-marker');
const eventIconsContainer = document.getElementById('event-icons');

// Rotas disponíveis
const routes = {
    initial: document.getElementById('route-initial'),
    toCol1: document.getElementById('route-to-col1'),
    top: document.getElementById('route-top'),
    bottom: document.getElementById('route-bottom')
};

// Cores dos eventos
const eventColors = {
    obra: '#5a99d4',
    acidente: '#5a99d4',
    bloqueio: '#5a99d4',
    clima: '#5a99d4'
};

/**
 * Habilita/desabilita botões de evento
 */
function toggleEventButtons(disabled) {
    eventButtons.forEach(btn => {
        btn.disabled = disabled;
    });
    startButton.disabled = disabled;
}

/**
 * Scroll automático no mobile para etapa ativa
 */
function scrollToStep(stepNumber) {
    if (window.innerWidth <= 768) {
        const step = document.querySelector(`[data-step="${stepNumber}"]`);
        if (step && flowchartContainer) {
            step.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

/**
 * Atualiza estado visual do fluxograma
 */
function updateFlowStep(step) {
    flowSteps.forEach(el => {
        const stepNum = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');

        if (stepNum < step) {
            el.classList.add('completed');
        } else if (stepNum === step) {
            el.classList.add('active');
        }
    });
    currentStep = step;
    scrollToStep(step);
}

/**
 * Remove todos os ícones de evento do mapa
 */
function clearEventIcons() {
    eventIconsContainer.innerHTML = '';
}

/**
 * Exibe ícone de evento no mapa
 */
function showEventIcon(type, x, y) {
    const color = eventColors[type];

    const icons = {
        obra: 'M20,18C20,18.56 19.56,19 19,19H5C4.44,19 4,18.56 4,18V14H5.5V12H4V8C4,7.44 4.44,7 5,7H9.5V5.5H10.5V7H13.5V5.5H14.5V7H19C19.56,7 20,7.44 20,8V12H18.5V14H20V18M14,14H10V12H14V14Z',
        acidente: 'M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16',
        bloqueio: 'M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z',
        clima: 'M6,14.03A1,1 0 0,1 7,15.03C7,15.58 6.55,16.03 6,16.03C3.24,16.03 1,13.79 1,11.03C1,8.27 3.24,6.03 6,6.03C7,3.68 9.3,2.03 12,2.03C15.43,2.03 18.24,4.69 18.5,8.06L19,8.03A4,4 0 0,1 23,12.03C23,14.23 21.21,16.03 19,16.03H18C17.45,16.03 17,15.58 17,15.03C17,14.47 17.45,14.03 18,14.03H19A2,2 0 0,0 21,12.03A2,2 0 0,0 19,10.03H17V9.03C17,6.27 14.76,4.03 12,4.03C9.5,4.03 7.45,5.84 7.06,8.21C6.73,8.09 6.37,8.03 6,8.03A3,3 0 0,0 3,11.03A3,3 0 0,0 6,14.03Z'
    };

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${x}, ${y}) scale(0)`);
    g.innerHTML = `
        <circle r="28" fill="${color}" opacity="0.95" />
        <g transform="translate(-12, -12) scale(1)">
            <path d="${icons[type]}" fill="white"/>
        </g>
    `;

    eventIconsContainer.appendChild(g);

    setTimeout(() => {
        g.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        g.setAttribute('transform', `translate(${x}, ${y}) scale(1)`);
    }, 10);
}

/**
 * Desenha rota no mapa com animação
 */
function drawRoute(routeElement, targetPath, callback) {
    const pathData = routeElement.getAttribute('d');
    targetPath.setAttribute('d', pathData);

    console.log('📏 Desenhando rota:', {
        pathData: pathData.substring(0, 50) + '...',
        pathLength: targetPath.getTotalLength()
    });

    const length = targetPath.getTotalLength();
    targetPath.style.strokeDasharray = length;
    targetPath.style.strokeDashoffset = length;
    targetPath.getBoundingClientRect();

    targetPath.style.transition = 'stroke-dashoffset 1s ease-in-out';
    targetPath.style.strokeDashoffset = '0';

    console.log('✅ Rota desenhada, aguardando animação...');

    if (callback) setTimeout(callback, 1000);
}

/**
 * Anima movimento do carro pela rota
 */
function animateCar(routeElement, targetPath, callback) {
    const length = routeElement.getTotalLength();
    // VELOCIDADE DO CARRO: Aumente este valor para deixar mais lento, diminua para mais rápido
    const duration = 2000; // em milissegundos (2 segundos)
    const startTime = performance.now();

    carMarker.style.transition = 'none';

    // Pega o comprimento total da rota visível
    const totalLength = targetPath ? targetPath.getTotalLength() : 0;

    function step(currentTime) {
        // Verifica se foi cancelado
        if (!isAnimating) {
            console.log('⛔ Animação cancelada');
            return;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const point = routeElement.getPointAtLength(progress * length);

        let angle = 0;
        if (progress < 0.95) {
            const nextPoint = routeElement.getPointAtLength((progress + 0.05) * length);
            angle = (Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI) + 90;
        }

        carMarker.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle}) scale(0.9)`);

        // Faz a rota sumir ATRÁS do carro (já percorrida)
        // Mostra apenas a parte que ainda falta percorrer (NA FRENTE)
        if (targetPath && totalLength > 0) {
            const traveled = progress * length;
            const remaining = totalLength - traveled;
            // Esconde a parte percorrida (atrás), mostra a parte restante (frente)
            targetPath.style.strokeDasharray = `0 ${traveled} ${remaining}`;
            targetPath.style.strokeDashoffset = '0';
        }

        if (progress < 1) {
            currentAnimationFrame = requestAnimationFrame(step);
        } else {
            console.log('✅ Animação concluída');
            currentAnimationFrame = null;
            if (callback) callback();
        }
    }

    console.log('🚗 Iniciando animação:', { routeLength: length, targetLength: totalLength });
    currentAnimationFrame = requestAnimationFrame(step);
}

/**
 * Inicia a jornada/simulação
 */
function startJourney() {
    if (isAnimating) return;
    isAnimating = true;
    toggleEventButtons(true);

    console.log('🚀 Iniciando viagem...');

    clearEventIcons();
    routePhase1.setAttribute('d', '');
    routePhase2.setAttribute('d', '');

    // IMPORTANTE: Restaura opacidade das rotas
    routePhase1.style.opacity = '0.85';
    routePhase2.style.opacity = '0.85';
    console.log('🎨 Opacidade das rotas restaurada para 0.85');

    updateFlowStep(2);
    carMarker.setAttribute('transform', 'translate(100, 300) scale(1)');

    setTimeout(() => {
        // Desenha rota completa até o destino
        drawRoute(routes.initial, routePhase1, () => {
            setTimeout(() => {
                // Anima carro apenas até a encruzilhada
                animateCar(routes.toCol1, routePhase1, () => {
                    if (selectedEvent) {
                        updateFlowStep(3);

                        setTimeout(() => {
                            showEventIcon(selectedEvent, 450, 300);

                            setTimeout(() => {
                                updateFlowStep(4);

                                // Apaga rota antiga
                                routePhase1.style.transition = 'opacity 0.5s';
                                routePhase1.style.opacity = '0';

                                setTimeout(() => {
                                    routePhase1.setAttribute('d', '');
                                    routePhase1.style.strokeDasharray = '0';
                                    routePhase1.style.strokeDashoffset = '0';
                                    routePhase1.style.opacity = '0.85';

                                    const alternativeRoute = Math.random() > 0.5 ? 'top' : 'bottom';

                                    setTimeout(() => {
                                        drawRoute(routes[alternativeRoute], routePhase2, () => {
                                            setTimeout(() => {
                                                updateFlowStep(5);
                                                animateCar(routes[alternativeRoute], routePhase2, () => {
                                                    updateFlowStep(6);
                                                    isAnimating = false;
                                                    toggleEventButtons(false);
                                                });
                                            }, 300);
                                        });
                                    }, 400);
                                }, 500);
                            }, 700);
                        }, 500);
                    } else {
                        // Sem evento: continua na rota direta
                        setTimeout(() => {
                            updateFlowStep(5);
                            animateCar(routes.initial, routePhase1, () => {
                                updateFlowStep(6);
                                isAnimating = false;
                                toggleEventButtons(false);
                            });
                        }, 300);
                    }
                });
            }, 300);
        });
    }, 500);
}

/**
 * Limpa simulação e reseta para estado inicial
 */
function clearSimulation() {
    console.log('🧹 Limpando simulação...');

    // Cancela animationFrame em andamento
    if (currentAnimationFrame) {
        cancelAnimationFrame(currentAnimationFrame);
        currentAnimationFrame = null;
        console.log('⛔ AnimationFrame cancelado');
    }

    // Força parar qualquer animação
    isAnimating = false;
    console.log('🛑 isAnimating = false');

    // Reseta fluxograma para estado inicial (sem nenhum ativo)
    updateFlowStep(0);

    // Limpa ícones de eventos
    clearEventIcons();

    // Habilita todos os botões
    toggleEventButtons(false);

    // Desmarca eventos selecionados
    eventButtons.forEach(btn => btn.classList.remove('selected'));
    selectedEvent = null;

    // Limpa completamente a primeira fase da rota
    routePhase1.setAttribute('d', '');
    routePhase1.style.transition = 'none';
    routePhase1.style.strokeDasharray = '0';
    routePhase1.style.strokeDashoffset = '0';
    routePhase1.style.opacity = '0';

    // Limpa completamente a segunda fase da rota
    routePhase2.setAttribute('d', '');
    routePhase2.style.transition = 'none';
    routePhase2.style.strokeDasharray = '0';
    routePhase2.style.strokeDashoffset = '0';
    routePhase2.style.opacity = '0';

    // Reseta o carro para a posição inicial (escondido)
    carMarker.style.transition = 'transform 0.3s ease';
    carMarker.setAttribute('transform', 'translate(100, 300) scale(0)');

    console.log('✅ Simulação completamente limpa!');
}

// Event Listeners
eventButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isAnimating) return;

        eventButtons.forEach(b => b.classList.remove('selected'));

        if (selectedEvent === btn.dataset.event) {
            selectedEvent = null;
        } else {
            btn.classList.add('selected');
            selectedEvent = btn.dataset.event;
        }
    });
});

startButton.addEventListener('click', () => {
    updateFlowStep(1);
    setTimeout(startJourney, 500);
});

clearButton.addEventListener('click', clearSimulation);

// Inicializa
clearSimulation();
