/*
   RRIA - Mapa UI Logic V2
   Handles external UI interactions and delegates them only via standard events.
   Does not access internal map logic directly.
*/

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------
       1. MAP INTERACTION PROXY
    ----------------------------------------------- */
    const controlCards = document.querySelectorAll('.control-card');

    controlCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target-id');
            // Find map point
            const mapPoint = document.querySelector(`.map-point[data-id="${targetId}"]`);

            if (mapPoint) {
                // Simulate click on SVG point
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                mapPoint.dispatchEvent(event);

                // Visual feedback
                setActiveCard(card);

                // On mobile, collapse sidebar after selection to show map
                collapseSidebar();
            }
        });
    });

    function setActiveCard(activeCard) {
        controlCards.forEach(c => c.classList.remove('active'));
        activeCard.classList.add('active');
    }

    /* -----------------------------------------------
       2. FULLSCREEN PROXY
    ----------------------------------------------- */
    const sidebarFsBtn = document.getElementById('sidebar-fullscreen');
    if (sidebarFsBtn) {
        sidebarFsBtn.addEventListener('click', () => {
            const originalFsBtn = document.getElementById('fullscreen-btn');
            const exitFsBtn = document.getElementById('exit-fullscreen-btn');

            // Toggle Logic based on what's available/visible in DOM interactions
            // We rely on the fact that if document.fullscreenElement is null, we request it.
            if (!document.fullscreenElement) {
                if (originalFsBtn) originalFsBtn.click();
            } else {
                if (exitFsBtn) exitFsBtn.click();
            }
        });
    }

    // Monitor fullscreen change to update sidebar button text
    const updateFsState = () => {
        if (!sidebarFsBtn) return;
        const iconSpan = sidebarFsBtn.querySelector('span'); // Material Icon

        if (document.fullscreenElement) {
            sidebarFsBtn.childNodes[sidebarFsBtn.childNodes.length - 1].textContent = " Sair da Tela Cheia";
            if (iconSpan) iconSpan.textContent = "fullscreen_exit";
        } else {
            sidebarFsBtn.childNodes[sidebarFsBtn.childNodes.length - 1].textContent = " Tela Cheia";
            if (iconSpan) iconSpan.textContent = "fullscreen";
        }
    };

    document.addEventListener('fullscreenchange', updateFsState);
    document.addEventListener('webkitfullscreenchange', updateFsState);

    /* -----------------------------------------------
       3. MOBILE SIDEBAR LOGIC (Drawer)
    ----------------------------------------------- */
    const sidebar = document.querySelector('.sidebar');
    const sidebarTitle = document.querySelector('.sidebar-title');

    // Toggle on sidebar header click (or drag handle area)
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            // Only toggle if clicking empty areas or header, not specific inner buttons
            // But for simple UX, let's toggle if valid
            if (window.innerWidth <= 768) {
                // Determine if we should expand
                const isCard = e.target.closest('.control-card');
                const isBtn = e.target.closest('.btn-primary-action');

                if (!isCard && !isBtn) {
                    sidebar.classList.toggle('open');
                }
            }
        });
    }

    function collapseSidebar() {
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('open');
        }
    }
});
