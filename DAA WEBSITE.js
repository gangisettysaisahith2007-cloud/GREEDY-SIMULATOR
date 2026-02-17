// ===== MODULE 6: GREEDY VS OPTIMAL ANALYSIS =====
const Analysis = {
    chart: null,

    runCounterExample() {
        // Counter-example: Capacity=4, Items: A(w=3,p=4,r=1.33), B(w=2,p=3,r=1.5)
        const W = 4;
        const items = [
            { name: 'A', weight: 3, profit: 4, ratio: 4 / 3 },
            { name: 'B', weight: 2, profit: 3, ratio: 3 / 2 }
        ];

        // Greedy: pick by ratio (B first r=1.5 > A r=1.33)
        // Greedy picks B (w=2, p=3), remaining=2. A (w=3) doesn't fit. Total=3
        // Optimal (DP): pick A (w=3, p=4), remaining=1. B doesn't fit. Total=4

        // DP
        const dp = [[0, 0, 0, 0, 0], [0, 0, 0, 4, 4], [0, 0, 3, 4, 4]];

        const headers = ['Cap\\Item', '0', '1', '2', '3', '4'];
        const rows = [
            ['No items', 0, 0, 0, 0, 0],
            ['Item A (w=3, p=4)', 0, 0, 0, 4, 4],
            ['+ Item B (w=2, p=3)', 0, 0, 3, 4, 4]
        ];

        let html = '<div style="margin-top:16px">';
        html += '<div class="card"><div class="card-title"><span class="icon">📋</span> Counter-Example DP Table (Capacity=4)</div>';
        html += `<p style="font-size:13px;color:var(--gray-700);margin-bottom:12px">
      <strong>Items:</strong> A (weight=3, profit=4, ratio=1.33) | B (weight=2, profit=3, ratio=1.50)
    </p>`;
        html += Utils.createTable(headers, rows, {
            highlightCells: [[2, 5]]
        });
        html += '</div>';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';
        html += `<div class="result-box" style="border-left-color:#DC2626">
      <div class="result-label">Greedy (by ratio)</div>
      <div class="result-value">3</div>
      <div class="result-detail">Picks B first (higher ratio 1.50). A doesn't fit afterward. <strong>Suboptimal!</strong></div>
    </div>`;
        html += `<div class="result-box" style="border-left-color:#16A34A">
      <div class="result-label">DP Optimal</div>
      <div class="result-value">4</div>
      <div class="result-detail">Picks A alone (profit=4). Better than greedy by <strong>+1</strong>.</div>
    </div>`;
        html += '</div>';

        html += Utils.explanationPanel('🔍 Why Greedy Failed', `
      <ul>
        <li>Greedy committed to Item B (higher ratio) first, using 2 units of capacity for profit 3.</li>
        <li>Remaining capacity (2) couldn't fit Item A (weight 3).</li>
        <li>DP explored all combinations and found that taking only Item A yields profit 4.</li>
        <li><strong>Root cause:</strong> In 0/1 Knapsack, items are indivisible, so greedy's local optimal (highest ratio) doesn't always lead to the global optimum.</li>
      </ul>
    `);

        html += '</div>';
        document.getElementById('analysis-counter-results').innerHTML = html;

        // Build the comparison chart
        this.buildChart();
    },

    buildChart() {
        const ctx = document.getElementById('analysis-chart');
        if (!ctx) return;
        if (this.chart) this.chart.destroy();

        const problems = ['Fractional\nKnapsack', '0/1\nKnapsack', 'Job\nScheduling', 'Huffman\nCoding', "Kruskal's\nMST"];
        const greedyScores = [100, 75, 100, 100, 100]; // % of optimal achieved
        const dpScores = [100, 100, 100, 100, 100];

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: problems,
                datasets: [
                    {
                        label: 'Greedy (% of Optimal)',
                        data: greedyScores,
                        backgroundColor: '#DC2626',
                        borderRadius: 6,
                        borderWidth: 0
                    },
                    {
                        label: 'Optimal / DP',
                        data: dpScores,
                        backgroundColor: '#16A34A',
                        borderRadius: 6,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 110,
                        title: { display: true, text: '% of Optimal Solution' }
                    }
                }
            }
        });
    }
};

// Auto-build the analysis chart when module is shown
document.addEventListener('DOMContentLoaded', () => {
    // Build chart when analysis module is first displayed
    const observer = new MutationObserver(() => {
        const section = document.getElementById('mod-analysis');
        if (section && section.classList.contains('active') && !Analysis.chart) {
            Analysis.buildChart();
        }
    });
    observer.observe(document.querySelector('.content-area'), { childList: true, subtree: true, attributes: true });
});
