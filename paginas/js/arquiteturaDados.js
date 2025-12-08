/**
 * Arquitetura de Dados - JavaScript Otimizado
 * Controlador de Visualização DER + Zoom + MiniMapa + Raio-X
 */

document.addEventListener('DOMContentLoaded', () => {
    const app = new DERApplication();
    app.init();
});

class DERApplication {
    constructor() {
        this.svg = document.getElementById('der-svg');
        this.artboard = document.getElementById('der-artboard');
        this.wrapper = document.getElementById('der-wrapper');
        this.miniMapContainer = document.getElementById('mini-map');

        // Estado da Transformação
        this.state = {
            scale: 1,
            panning: false,
            pointX: 0,
            pointY: 0,
            startX: 0,
            startY: 0,
            viewX: 0,
            viewY: 0
        };

        // Configurações
        this.minZoom = 0.5;
        this.maxZoom = 3.0;
        this.zoomStep = 0.2;
    }

    init() {
        if (!this.svg) return;

        this.setupControls();
        this.setupPanZoom();
        this.setupMiniMap();
        this.setupXRay();

        // Ajuste inicial à tela
        setTimeout(() => this.fitToScreen(), 100);

        // Resize handler
        window.addEventListener('resize', () => this.fitToScreen());
    }

    setupControls() {
        document.getElementById('btn-zoom-in').onclick = () => this.zoom(1);
        document.getElementById('btn-zoom-out').onclick = () => this.zoom(-1);
        document.getElementById('btn-fit-screen').onclick = () => this.fitToScreen();
        document.getElementById('btn-reset-view').onclick = () => this.fitToScreen();
    }

    setupPanZoom() {
        // Mouse Down (Início do Pan)
        this.wrapper.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.state.startX = e.clientX - this.state.viewX;
            this.state.startY = e.clientY - this.state.viewY;
            this.state.panning = true;
            this.wrapper.style.cursor = 'grabbing';
        });

        // Mouse Up (Fim do Pan)
        this.wrapper.addEventListener('mouseup', () => {
            this.state.panning = false;
            this.wrapper.style.cursor = 'grab';
        });

        // Mouse Leave (Fim do Pan se sair da área)
        this.wrapper.addEventListener('mouseleave', () => {
            this.state.panning = false;
            this.wrapper.style.cursor = 'grab';
        });

        // Mouse Move (Movendo)
        this.wrapper.addEventListener('mousemove', (e) => {
            if (!this.state.panning) return;
            e.preventDefault();
            this.state.viewX = e.clientX - this.state.startX;
            this.state.viewY = e.clientY - this.state.startY;
            this.updateTransform();
        });

        // Wheel (Zoom com Scrool)
        this.wrapper.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const direction = e.deltaY > 0 ? -1 : 1;
                this.zoom(direction);
            }
        });

        // Touch Events
        this.wrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.state.startX = e.touches[0].clientX - this.state.viewX;
                this.state.startY = e.touches[0].clientY - this.state.viewY;
                this.state.panning = true;
            }
        });

        this.wrapper.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.state.panning) {
                e.preventDefault(); // Evita scroll da página
                this.state.viewX = e.touches[0].clientX - this.state.startX;
                this.state.viewY = e.touches[0].clientY - this.state.startY;
                this.updateTransform();
            }
        });

        this.wrapper.addEventListener('touchend', () => {
            this.state.panning = false;
        });
    }

    updateTransform() {
        // Aplica a transformação no grupo principal do SVG
        this.artboard.style.transform = `translate(${this.state.viewX}px, ${this.state.viewY}px) scale(${this.state.scale})`;
        this.updateMiniMapViewport();
    }

    zoom(direction) {
        let newScale = this.state.scale + (direction * this.zoomStep);

        // Limites
        newScale = Math.min(Math.max(newScale, this.minZoom), this.maxZoom);

        // Zoom no centro da tela (simplificado)
        // Idealmente calcularia offset para manter o mouse no lugar, mas centro é ok para MVP
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const centerX = wrapperRect.width / 2;
        const centerY = wrapperRect.height / 2;

        // Ajuste de compensação para zoom centralizado
        // x' = x - (scaleDiff * offset)
        // Simplificando: Apenas atualiza escala por enquanto para evitar bugs complexos de matemática de matriz
        this.state.scale = newScale;
        this.updateTransform();
    }

    fitToScreen() {
        // Enquadra todo o conteúdo (0,0 até 900,650) na tela
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const contentWidth = 900; // Largura do viewBox atualizado
        const contentHeight = 650; // Altura do viewBox atualizado

        // Calcula escala para caber (com margem)
        const scaleX = (wrapperRect.width - 40) / contentWidth;
        const scaleY = (wrapperRect.height - 40) / contentHeight;
        let fitScale = Math.min(scaleX, scaleY);

        // No mobile, evitar zoom muito pequeno para garantir legibilidade
        if (window.innerWidth < 900) {
            fitScale = Math.max(fitScale, 1.3); // Zoom mínimo inicial para mobile
        } else {
            // PC: Zoom mínimo ajustável
            fitScale = Math.max(fitScale, 1.0);
        }

        this.state.scale = fitScale;

        // Centraliza inicialmente
        this.state.viewX = (wrapperRect.width - (contentWidth * this.state.scale)) / 2;
        this.state.viewY = (wrapperRect.height - (contentHeight * this.state.scale)) / 2;

        // AJUSTE FINO DE POSIÇÃO
        // Se quiser alterar onde o mapa começa focado:
        if (window.innerWidth < 900) {
            // --- MOBILE ---
            // Valores POSITIVOS (+) -> Movem o mapa para Baixo/Direita (você vê mais o Topo/Esquerda)
            const deslocarParaDireita = 330;
            const deslocarParaBaixo = 120;

            this.state.viewX += deslocarParaDireita;
            this.state.viewY += deslocarParaBaixo;
        } else {
            // --- PC / DESKTOP ---
            // Configure aqui a posição inicial no PC
            const deslocarPC_X = -100;   // Aumente para mover p/ direita
            const deslocarPC_Y = 50;   // Aumente para mover p/ baixo

            this.state.viewX += deslocarPC_X;
            this.state.viewY += deslocarPC_Y;
        }

        this.updateTransform();
    }

    setupMiniMap() {
        // Cria uma cópia do SVG para o minimapa
        const miniSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        miniSvg.setAttribute('viewBox', '0 0 1200 600');
        miniSvg.style.width = '100%';
        miniSvg.style.height = '100%';
        miniSvg.style.pointerEvents = 'none'; // A visualização é passiva

        // Clona o conteúdo do artboard
        miniSvg.innerHTML = this.artboard.innerHTML;
        this.miniMapContainer.appendChild(miniSvg);

        // Cria o viewport indicator
        this.viewportRect = document.createElement('div');
        this.viewportRect.className = 'mini-map-viewport';
        this.miniMapContainer.parentElement.appendChild(this.viewportRect);

        // Interação no MiniMapa (clique para pular)
        this.miniMapContainer.parentElement.addEventListener('mousedown', (e) => {
            // Lógica para mover viewport
            // TBD: Implementação complexa, deixar para v2
            // Por enquanto apenas visualização
        });
    }

    updateMiniMapViewport() {
        if (!this.viewportRect) return;

        // Cálculos para o retângulo vermelho no mini-mapa
        // Tamanho do MiniMapa
        const mapRect = this.miniMapContainer.getBoundingClientRect();

        // Proporção do SVG Real vs Container
        const contentWidth = 1200;
        const contentHeight = 600;

        // Fator de escala do minimapa (ex: minimapa é 200px larg, content é 1200 -> 1/6)
        const mapScale = mapRect.width / contentWidth;

        // Área visível no wrapper principal
        const wrapperRect = this.wrapper.getBoundingClientRect();

        // Tamanho do viewport no minimapa (inverso da escala do zoom principal)
        // width = (wrapperWidth / currentScale) * mapScale
        const viewW = (wrapperRect.width / this.state.scale) * mapScale;
        const viewH = (wrapperRect.height / this.state.scale) * mapScale;

        // Posição
        // x = (-viewX / currentScale) * mapScale
        const x = (-this.state.viewX / this.state.scale) * mapScale;
        const y = (-this.state.viewY / this.state.scale) * mapScale;

        this.viewportRect.style.width = `${viewW}px`;
        this.viewportRect.style.height = `${viewH}px`;
        this.viewportRect.style.left = `${x}px`;
        this.viewportRect.style.top = `${y}px`;
    }

    setupXRay() {
        const nameEl = document.getElementById('xray-entity-name');
        const detailsEl = document.getElementById('xray-details');

        // Dicionário de Descrições
        const descriptions = {
            'Rua': 'Representa cada via do mapa usada no cálculo da rota.',
            'Trecho': 'Define o pedaço específico de uma rua entre dois pontos.',
            'Rota': 'Conjunto ordenado de trechos que forma o caminho da origem ao destino.',
            'Evento': 'Identifica o tipo de ocorrência e o impacto na rota.',
            'Ponto': 'Coordenada geográfica específica onde eventos acontecem.',
            'Contém': 'Uma rua é formada por um ou mais trechos sequenciais.',
            'Composição': 'Uma rota é composta por uma sequência de trechos conectados.',
            'Afetar': 'Um evento impacta diretamente o tempo ou viabilidade de uma rota.',
            'Acontecimento': 'Um evento acontece em um ponto geográfico específico.'
        };

        // Seleciona Entidades e Relacionamentos
        // Nota: A classe .relation-group deve ser adicionada no SVG
        const interactiveElements = document.querySelectorAll('.entity-group, .relation-group');

        interactiveElements.forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Evita pan do mapa

                // Reset Visual (remove destaque de todos)
                interactiveElements.forEach(item => {
                    const box = item.querySelector('.entity-box, .relation-shape');
                    if (box) {
                        box.style.stroke = '';
                        box.style.strokeWidth = '';
                        box.style.filter = '';
                    }
                });

                // Aplica Destaque no Selecionado
                const box = el.querySelector('.entity-box, .relation-shape');
                if (box) {
                    box.style.stroke = 'var(--cor-botao)';
                    box.style.strokeWidth = '3px';
                    box.style.filter = 'drop-shadow(0 0 4px var(--cor-botao))';
                }

                // Coleta Dados
                const name = el.dataset.name;
                const type = el.dataset.type; // 'entity' ou 'relation'
                const rawAttrs = el.dataset.attrs || "";
                const description = descriptions[name] || "Sem descrição disponível.";

                // Atualiza Painel Header
                nameEl.innerHTML = `
                    <span style="color: var(--cor-texto-muted); font-size: 0.8em; font-weight:normal; margin-right: 12px; white-space: nowrap;">
                        ${type === 'entity' ? 'Entidade:' : 'Relacionamento:'}
                    </span>
                    <span style="font-size: 1.1em;">${name}</span>
                `;

                // Monta Conteúdo Detalhado
                let htmlContent = `
                    <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee;">
                        <p style="color: #555; line-height: 1.5; font-size: 0.95rem;">${description}</p>
                    </div>
                `;

                if (rawAttrs) {
                    const attrs = rawAttrs.split(',');
                    htmlContent += `
                        <p class="info-label" style="margin-top:0;">Atributos</p>
                        <ul style="list-style: none; padding-left: 0;">
                            ${attrs.map(attr => `
                                <li style="padding: 6px 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; font-size: 0.85rem;">
                                    <span style="width: 6px; height: 6px; background: #ccc; border-radius: 50%; margin-right: 8px;"></span>
                                    ${attr.trim()}
                                </li>
                            `).join('')}
                        </ul>
                    `;
                }

                detailsEl.innerHTML = htmlContent;
            });
        });

        // Clique fora limpa seleção
        this.wrapper.addEventListener('click', (e) => {
            if (e.target.closest('.entity-group') || e.target.closest('.relation-group')) return;

            interactiveElements.forEach(item => {
                const box = item.querySelector('.entity-box, .relation-shape');
                if (box) {
                    box.style.stroke = '';
                    box.style.strokeWidth = '';
                    box.style.filter = '';
                }
            });
            nameEl.textContent = 'Nenhuma seleção';
            detailsEl.innerHTML = '<p style="color: #999; font-style: italic;">Clique em um elemento do diagrama para ver os detalhes.</p>';
        });
    }
}
