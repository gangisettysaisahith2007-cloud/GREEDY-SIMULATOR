const Utils = {
    createElement(tag, className = '', content = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (content) el.innerHTML = content;
        return el;
    },

    createCard(title, content) {
        const card = this.createElement('div', 'module-card fade-in');
        if (title) {
            const h2 = this.createElement('h2', '', title);
            card.appendChild(h2);
        }
        if (content) {
            if (typeof content === 'string') {
                const p = this.createElement('div', '', content);
                card.appendChild(p);
            } else {
                card.appendChild(content);
            }
        }
        return card;
    },

    createInput(label, id, type = 'number', value = '', placeholder = '') {
        const group = this.createElement('div', 'input-group');
        const labelEl = this.createElement('label', '', label);
        labelEl.setAttribute('for', id);
        const input = this.createElement('input');
        input.id = id;
        input.type = type;
        input.value = value;
        input.placeholder = placeholder;
        group.appendChild(labelEl);
        group.appendChild(input);
        return group;
    },

    createButton(text, onClick, type = 'primary') {
        const btn = this.createElement('button', `btn btn-${type}`, text);
        btn.onclick = onClick;
        return btn;
    },

    // Core Algorithms
    solveKnapsack01(capacity, items) {
        const n = items.length;
        const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
        for (let i = 1; i <= n; i++) {
            const { profit, weight } = items[i - 1];
            for (let j = 0; j <= capacity; j++) {
                if (weight <= j) {
                    dp[i][j] = Math.max(profit + dp[i - 1][j - weight], dp[i - 1][j]);
                } else {
                    dp[i][j] = dp[i - 1][j];
                }
            }
        }
        return { maxProfit: dp[n][capacity], table: dp };
    },

    solveFractional(capacity, items) {
        const sortedItems = [...items].sort((a, b) => (b.profit / b.weight) - (a.profit / a.weight));
        let currentCapacity = capacity;
        let totalProfit = 0;
        const results = [];
        for (const item of sortedItems) {
            if (currentCapacity >= item.weight) {
                results.push({ ...item, fraction: 1 });
                totalProfit += item.profit;
                currentCapacity -= item.weight;
            } else if (currentCapacity > 0) {
                const fraction = currentCapacity / item.weight;
                results.push({ ...item, fraction });
                totalProfit += item.profit * fraction;
                currentCapacity = 0;
            } else {
                results.push({ ...item, fraction: 0 });
            }
        }
        return { maxProfit: totalProfit, items: results };
    },

    solveExhaustive(capacity, items) {
        let maxProfit = 0;
        let bestSubset = [];
        let subsetCount = 0;

        function getSubsets(i, currentW, currentP, currentS) {
            if (i === items.length) {
                subsetCount++;
                if (currentW <= capacity && currentP >= maxProfit) {
                    if (currentP > maxProfit || (currentP === maxProfit && bestSubset.length === 0)) {
                        maxProfit = currentP;
                        bestSubset = [...currentS];
                    }
                }
                return;
            }
            getSubsets(i + 1, currentW + items[i].weight, currentP + items[i].profit, [...currentS, items[i]]);
            getSubsets(i + 1, currentW, currentP, currentS);
        }
        getSubsets(0, 0, 0, []);
        return { maxProfit, bestSubset, subsetCount };
    }
};
