/* 
   RRIA - Mobile Logic (Bottom Sheet)
   Handles expand/collapse interaction for mobile.
*/

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------
       BOTTOM SHEET LOGIC
    ----------------------------------------------- */
    const sidebar = document.querySelector('.sidebar');
    const handleArea = document.querySelector('.sheet-handle-area');
    const mobileToggle = document.getElementById('mobile-toggle-btn');

    // Safety check
    if (!sidebar || !handleArea) return;

    // Toggle function
    function toggleSheet() {
        sidebar.classList.toggle('expanded');
    }

    function expandSheet() {
        sidebar.classList.add('expanded');
    }

    function collapseSheet() {
        sidebar.classList.remove('expanded');
    }

    // 1. Handle Click
    handleArea.addEventListener('click', toggleSheet);

    // 2. Header Toggle Button (if present) - Kept for safety but user removing it
    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSheet();
        });
    }

    // 3. Auto-collapse on Selection
    const controlItems = document.querySelectorAll('.control-item');
    controlItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                collapseSheet();
            }
        });
    });

    // 4. Basic Touch/Drag Logic (Simple Swipe Support)
    let startY = 0;
    let currentY = 0;

    handleArea.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    handleArea.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
        const diff = startY - currentY;

        // If pulling up significantly
        if (diff > 30) {
            expandSheet();
        }
        // If pulling down significantly
        else if (diff < -30) {
            collapseSheet();
        }
    }, { passive: true });

});
