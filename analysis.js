function renderAnalysis(container) {
    container.innerHTML = '';

    const introContent = `
        <p>This dashboard compares algorithm results and provides a data-driven recommendation on the best strategy for your specific problem.</p>
    `;
    container.appendChild(Utils.createCard('Algorithm Comparative Dashboard', introContent));

    const results = window.KnapsackResults;
    const missing = [];
    if (!results || !results.knapsack01) missing.push('0/1 Knapsack');
    if (!results || !results.fractional) missing.push('Fractional Knapsack');
    if (!results || !results.exhaustive) missing.push('Exhaustive Search');

    if (missing.length > 0) {
        const warning = Utils.createCard('⚠️ Simulations Incomplete', `
            <p style="color: #666;">Populate this dashboard by running individual simulations first:</p>
            <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
                ${missing.map(m => `<li>${m}</li>`).join('')}
            </ul>
            <p>Go to these modules, enter data, and click <strong>"Run Simulation"</strong>.</p>
        `);
        container.appendChild(warning);
    }

    // 1. Comparison Table
    const tableCard = Utils.createCard('Consolidated Results Table', '<div id="analysis-table-container">Run all modules to see full comparison.</div>');
    container.appendChild(tableCard);

    // 2. Visual Graphs (Chart.js)
    const chartsCard = Utils.createCard('Visual Performance & Complexity', '');
    const chartsGrid = Utils.createElement('div', 'analysis-charts-grid');
    chartsGrid.style.display = 'grid';
    chartsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    chartsGrid.style.gap = '2rem';

    // Profit Bar Chart
    const profitBox = Utils.createElement('div', 'chart-box');
    profitBox.innerHTML = '<canvas id="profit-comparison-chart"></canvas>';
    chartsGrid.appendChild(profitBox);

    // Complexity Line Chart
    const complexityBox = Utils.createElement('div', 'chart-box');
    complexityBox.innerHTML = '<canvas id="complexity-growth-chart"></canvas>';
    chartsGrid.appendChild(complexityBox);

    // Strategy Pie Chart
    const strategyBox = Utils.createElement('div', 'chart-box');
    strategyBox.innerHTML = '<canvas id="strategy-distribution-chart"></canvas>';
    chartsGrid.appendChild(strategyBox);

    chartsCard.appendChild(chartsGrid);
    container.appendChild(chartsCard);

    // 3. Explanation Panel
    const explanationCard = Utils.createCard('Which Algorithm Performs Best and Why?', `
        <div class="explanation-content" style="line-height: 1.6;">
            <p>Choosing the "best" algorithm isn't just about the highest profit—it's about the balance between <strong>accuracy</strong> and <strong>computational cost</strong>.</p>
            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4 style="color: var(--accent-red);">1. The Efficiency Factor</h4>
                    <p>The <strong>Greedy</strong> approach is incredibly fast ($O(n \log n)$) and gives the absolute best results for <em>Fractional</em> problems. However, it fails to find the global optimum for 0/1 problems because it makes "locally optimal" choices that might exclude better full-item combinations later.</p>
                </div>
                <div>
                    <h4 style="color: var(--accent-red);">2. The Optimality Factor</h4>
                    <p><strong>Dynamic Programming</strong> is the gold standard for discrete 0/1 problems. It uses a table to "remember" sub-problems, ensuring it explores all valid combinations without the exponential slowdown of Brute Force. While slower than Greedy, it guarantees the best answer where Greedy might settle for less.</p>
                </div>
            </div>
            <p style="margin-top: 1rem;"><strong>Exhaustive Search</strong> (Brute Force) is mathematically perfect but practically useless for large datasets. With just 20 items, it would need to check over 1 million subsets, making it the least efficient choice.</p>
        </div>
    `);
    container.appendChild(explanationCard);

    // 4. Final Decision Summary Box
    const decisionBoxContainer = Utils.createElement('div', 'decision-box-container');
    decisionBoxContainer.id = 'final-decision-box';
    container.appendChild(decisionBoxContainer);

    if (missing.length < 3) {
        updateAnalysisTable(results);
        renderProfitChart(results);
        renderComplexityChart();
        renderStrategyChart();
        updateDecisionBox(results);
    }
}

function updateAnalysisTable(results) {
    const tableDiv = document.getElementById('analysis-table-container');
    const data = [
        { name: '0/1 (DP)', key: 'knapsack01', color: '#2196f3' },
        { name: 'Fractional', key: 'fractional', color: '#4caf50' },
        { name: 'Exhaustive', key: 'exhaustive', color: '#888' }
    ];

    // Determine if Fractional is strictly better (higher profit)
    const isFractionalBest = results.fractional && results.knapsack01 && results.fractional.maxProfit > results.knapsack01.maxProfit;

    tableDiv.innerHTML = `
        <table class="dp-table">
            <thead>
                <tr>
                    <th>Algorithm</th>
                    <th>Strategy Type</th>
                    <th>Max Profit</th>
                    <th>Time Complexity</th>
                    <th>Optimality</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => {
        const res = results[item.key];
        if (!res) return `<tr style="opacity: 0.5;"><td>${item.name}</td><td colspan="4">No data</td></tr>`;

        const isBest = (item.key === 'fractional') || (item.key === 'knapsack01' && !isFractionalBest);
        const rowStyle = isBest ? 'border-left: 4px solid var(--accent-red);' : '';

        return `
                        <tr style="${rowStyle}">
                            <td><strong>${item.name}</strong></td>
                            <td>${res.strategy}</td>
                            <td class="highlight" style="font-weight: bold; color: ${isBest ? 'var(--accent-red)' : '#333'};">
                                $${res.maxProfit.toFixed(1)}
                                ${isBest ? ' <span style="font-size: 10px;">(BEST)</span>' : ''}
                            </td>
                            <td>${res.complexity}</td>
                            <td style="color: ${res.isOptimal ? 'green' : 'orange'};">${res.isOptimal ? 'Optimal' : 'Sub-optimal'}</td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;
}

function updateDecisionBox(results) {
    const box = document.getElementById('final-decision-box');
    const isFractionalInput = results.fractional && results.knapsack01 && (results.fractional.maxProfit > results.knapsack01.maxProfit);

    const bestStrategy = isFractionalInput ? "Greedy (Fractional)" : "Dynamic Programming (0/1)";
    const reason = isFractionalInput ?
        "Your inputs allowed for fractional parts, where Greedy provides the absolute highest profit with $O(n \log n)$ speed." :
        "For discrete 0/1 items, DP is the most efficient optimal strategy, avoiding the $O(2^n)$ cost of Brute Force.";

    box.innerHTML = `
        <div style="margin-top: 2rem; padding: 1.5rem; background: var(--accent-red); color: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(211, 47, 47, 0.3);">
            <h3 style="margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 0.5rem;">🎯 Final Decision Summary</h3>
            <p style="font-size: 1.1rem;"><strong>Best Strategy:</strong> ${bestStrategy}</p>
            <p style="margin-top: 0.5rem; font-style: italic; opacity: 0.9;"><strong>Reason:</strong> ${reason}</p>
        </div>
    `;
}

function renderProfitChart(results) {
    const ctx = document.getElementById('profit-comparison-chart').getContext('2d');
    const labels = [];
    const values = [];
    const colors = [];

    // Logic: Highlight the one that gives max profit
    const maxVal = Math.max(
        results.knapsack01 ? results.knapsack01.maxProfit : 0,
        results.fractional ? results.fractional.maxProfit : 0,
        results.exhaustive ? results.exhaustive.maxProfit : 0
    );

    if (results.knapsack01) {
        labels.push('0/1 (DP)');
        values.push(results.knapsack01.maxProfit);
        colors.push(results.knapsack01.maxProfit === maxVal ? '#d32f2f' : '#2196f3');
    }
    if (results.fractional) {
        labels.push('Fractional');
        values.push(results.fractional.maxProfit);
        colors.push(results.fractional.maxProfit === maxVal ? '#d32f2f' : '#4caf50');
    }
    if (results.exhaustive) {
        labels.push('Exhaustive');
        values.push(results.exhaustive.maxProfit);
        colors.push('#888');
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Max Profit ($)',
                data: values,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            plugins: { title: { display: true, text: 'Profit Comparison (Last Simulations)' } }
        }
    });
}

function renderComplexityChart() {
    const ctx = document.getElementById('complexity-growth-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: [2, 4, 8, 12, 16],
            datasets: [
                { label: 'Greedy: O(n log n)', data: [1, 3, 11, 20, 32], borderColor: '#4caf50', fill: false },
                { label: 'DP: O(n*W)', data: [10, 20, 40, 60, 80], borderColor: '#2196f3', fill: false },
                { label: 'Exhaustive: O(2^n)', data: [4, 16, 256, 4096, 65536], borderColor: '#f44336', fill: false }
            ]
        },
        options: {
            plugins: { title: { display: true, text: 'Time Complexity Trend (Log Scale)' } },
            scales: { y: { type: 'logarithmic' } }
        }
    });
}

function renderStrategyChart() {
    const ctx = document.getElementById('strategy-distribution-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Optimal Strategy', 'Sub-optimal strategy'],
            datasets: [{
                data: [2, 1], // Just a representative static distribution for these variants
                backgroundColor: ['var(--accent-red)', '#CCC']
            }]
        },
        options: {
            plugins: { title: { display: true, text: 'Solution Optimality Overview' } }
        }
    });
}
