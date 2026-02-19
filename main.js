// Global state to track results across modules
window.KnapsackResults = {
    knapsack01: null,
    fractional: null,
    exhaustive: null
};

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    const moduleTitle = document.getElementById('module-title');
    const contentArea = document.getElementById('content-area');
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.querySelector('.sidebar');

    // Modules mapping
    const modules = {
        intro: {
            title: 'Introduction to Knapsack',
            render: renderIntro
        },
        knapsack01: {
            title: '0/1 Knapsack Problem (DP)',
            render: renderKnapsack01
        },
        fractional: {
            title: 'Fractional Knapsack (Greedy)',
            render: renderFractional
        },
        exhaustive: {
            title: 'Exhaustive Knapsack (Brute Force)',
            render: renderExhaustive
        },
        analysis: {
            title: 'Comparative Analysis',
            render: renderAnalysis
        }
    };

    function switchModule(moduleKey) {
        const module = modules[moduleKey];
        if (!module) return;

        // Update UI
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.module === moduleKey);
        });
        moduleTitle.textContent = module.title;
        contentArea.innerHTML = '<div class="loader">Loading...</div>';

        // Fake loading for effect
        setTimeout(() => {
            module.render(contentArea);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);

        // Update URL hash
        window.location.hash = moduleKey;

        // Close sidebar on mobile
        sidebar.classList.remove('open');
    }

    // Event Listeners
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchModule(item.dataset.module);
        });
    });

    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Handle initial state and hash changes
    function handleRouting() {
        const hash = window.location.hash.replace('#', '');
        if (modules[hash]) {
            switchModule(hash);
        } else {
            switchModule('intro');
        }
    }

    window.addEventListener('hashchange', handleRouting);
    handleRouting();
});
