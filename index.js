/**
 * RRIA Professional Index Logic
 * Handles animations, transitions, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initSmoothScroll();
    initPageTransitions();
});

/* 1. SCROLL REVEAL ANIMATION */
function initScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px', // Trigger slightly before element is consistently visible
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    // Target elements
    const revealElements = document.querySelectorAll('.reveal-up, .feature-card, .timeline-step, .team-member');

    revealElements.forEach((el, index) => {
        // Add basic reveal class if not present
        if (!el.classList.contains('reveal-up') && !el.classList.contains('feature-card') && !el.classList.contains('timeline-step')) {
            el.classList.add('reveal-up');
        }

        // Add staggered delays for groups
        if (el.parentElement.classList.contains('features-grid') ||
            el.parentElement.classList.contains('timeline') ||
            el.parentElement.classList.contains('team-wrapper')) {
            // Simple modular index delay logic
            const delay = (Array.from(el.parentElement.children).indexOf(el) % 3) * 150;
            el.style.transitionDelay = `${delay}ms`;
        }

        revealObserver.observe(el);
    });
}

/* 2. SMOOTH SCROLL */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* 3. PAGE TRANSITIONS */
function initPageTransitions() {
    // Handle outgoing links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const isInternal = href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto');

            if (isInternal) {
                e.preventDefault();
                document.body.classList.add('fade-out');

                // Wait for animation then navigate
                setTimeout(() => {
                    window.location.href = href;
                }, 300); // match css transition duration
            }
        });
    });
}
