/* 
   RRIA - Mapa Layout Logic
   Handles Mobile Drawer & Proxy Clicks.
*/

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------
       1. MOBILE SIDEBAR (DRAWER) LOGIC
       (Kept generically, but specific bottom sheet logic is in mapaMobile.js)
    ----------------------------------------------- */
    // The previous mobile toggle logic might conflict or be redundant if we have a bottom sheet.
    // However, keeping standard proxy logic here.

    /* -----------------------------------------------
       2. PROXY CLICKS (Sidebar -> Map)
    ----------------------------------------------- */
    const controlItems = document.querySelectorAll('.control-item');

    controlItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target-id');
            const mapPoint = document.querySelector(`.map-point[data-id="${targetId}"]`);

            if (mapPoint) {
                // Dispatch synthetic click to SVG
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                mapPoint.dispatchEvent(event);

                // Note: closing logic is now in mapaMobile.js for the sheet

                // Highlight active item
                controlItems.forEach(i => i.style.borderColor = '#e2e8f0');
                item.style.borderColor = '#3E8BF0';
            }
        });
    });

    /* -----------------------------------------------
       3. PROXY FULLSCREEN
    ----------------------------------------------- */
    const sidebarFsBtn = document.getElementById('btn-fullscreen-sidebar');

    if (sidebarFsBtn) {
        sidebarFsBtn.addEventListener('click', () => {
            const originalFsBtn = document.getElementById('fullscreen-btn');
            const exitFsBtn = document.getElementById('exit-fullscreen-btn');

            if (!document.fullscreenElement) {
                if (originalFsBtn) originalFsBtn.click();
            } else {
                if (exitFsBtn) exitFsBtn.click();
            }
        });
    }

    // Update Text on Change
    const updateFsText = () => {
        if (!sidebarFsBtn) return;

        if (document.fullscreenElement) {
            sidebarFsBtn.innerHTML = '<span class="material-icons-round">fullscreen_exit</span> Sair da Tela Cheia';
        } else {
            sidebarFsBtn.innerHTML = '<span class="material-icons-round">fullscreen</span> Tela Cheia';
        }
    };

    document.addEventListener('fullscreenchange', updateFsText);
    document.addEventListener('webkitfullscreenchange', updateFsText);

});
