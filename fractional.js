function renderFractional(container) {
    container.innerHTML = '';

    const introContent = `
        <p>In the <strong>Fractional Knapsack Problem</strong>, we can divide items into smaller parts. This allows us to fill the knapsack perfectly to maximize profit.</p>
        <p>The <strong>Greedy Strategy</strong> works optimally here: 
        <ol>
            <li>Calculate the <strong>Profit/Weight ratio</strong> for each item.</li>
            <li>Sort items by this ratio in descending order.</li>
            <li>Take as much of the highest-ratio item as possible.</li>
            <li>Move to the next item until the knapsack is full.</li>
        </ol>
    `;
    container.appendChild(Utils.createCard('The Greedy Superiority', introContent));

    const simulatorLayout = Utils.createElement('div', 'simulator-layout');

    // Left side: Inputs
    const inputPanel = Utils.createElement('div', 'input-panel');
    const inputCard = Utils.createCard('Simulation Settings', '');

    const capacityInput = Utils.createInput('Knapsack Capacity', 'frac-capacity', 'number', '50');
    capacityInput.querySelector('input').classList.add('full-width-input');
    inputCard.appendChild(capacityInput);

    const itemControls = Utils.createElement('div', 'item-controls');
    itemControls.innerHTML = `
        <div class="input-card-header">
            <h3>Items</h3>
        </div>
        <div class="items-grid-container">
            <div class="items-grid-header">
                <div>Profit</div>
                <div>Weight</div>
                <div></div>
            </div>
            <div class="items-grid-body" id="frac-items-container">
                <div class="item-row">
                    <input type="number" class="item-profit" value="60">
                    <input type="number" class="item-weight" value="10">
                    <button class="btn-remove-item">×</button>
                </div>
                <div class="item-row">
                    <input type="number" class="item-profit" value="100">
                    <input type="number" class="item-weight" value="20">
                    <button class="btn-remove-item">×</button>
                </div>
                <div class="item-row">
                    <input type="number" class="item-profit" value="120">
                    <input type="number" class="item-weight" value="30">
                    <button class="btn-remove-item">×</button>
                </div>
            </div>
        </div>
        <div class="add-item-container">
            <button id="add-item-frac" class="btn btn-secondary" style="width: 100%;">+ Add Item</button>
        </div>
    `;
    inputCard.appendChild(itemControls);

    const btnGroup = Utils.createElement('div', 'action-buttons-group');
    const runBtn = Utils.createButton('Run Simulation', runFractionalSimulation);
    const resetBtn = Utils.createButton('Reset', () => renderFractional(container), 'secondary');
    btnGroup.appendChild(runBtn);
    btnGroup.appendChild(resetBtn);
    inputCard.appendChild(btnGroup);

    inputPanel.appendChild(inputCard);
    simulatorLayout.appendChild(inputPanel);

    // Right side: Visualizations
    const vizPanel = Utils.createElement('div', 'viz-panel');

    const sortingCard = Utils.createCard('Ratio Sorting Table', '<div id="frac-sorting-container">Run simulation to see sorted ratios...</div>');
    vizPanel.appendChild(sortingCard);

    const chartCard = Utils.createCard('Fractional Selection Visualization', '');
    const canvasContainer = Utils.createElement('div', 'viz-container');
    const canvas = Utils.createElement('canvas');
    canvas.id = 'frac-chart';
    canvasContainer.appendChild(canvas);
    chartCard.appendChild(canvasContainer);
    vizPanel.appendChild(chartCard);

    const resultsSummary = Utils.createCard('Results Summary', `
        <div id="frac-results" style="display: none;">
            <p style="font-size: 1.2rem; font-weight: bold;">Total Profit: <span id="frac-total-profit" style="color: var(--accent-red);">$0</span></p>
            <div id="frac-steps-log" style="font-family: monospace; font-size: 0.9rem; background: #f8f9fa; padding: 1rem; border-radius: 4px; max-height: 200px; overflow-y: auto;"></div>
        </div>
    `);
    vizPanel.appendChild(resultsSummary);

    simulatorLayout.appendChild(vizPanel);
    container.appendChild(simulatorLayout);

    // Event Delegations
    document.getElementById('add-item-frac').onclick = () => {
        const container = document.getElementById('frac-items-container');
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="number" class="item-profit" value="0">
            <input type="number" class="item-weight" value="0">
            <button class="btn-remove-item">×</button>
        `;
        container.appendChild(row);
        attachRemoveEventsFrac();
    };

    function attachRemoveEventsFrac() {
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.onclick = (e) => e.target.closest('.item-row').remove();
        });
    }
    attachRemoveEventsFrac();
}

let fracChart = null;

async function runFractionalSimulation() {
    const capacityInput = document.getElementById('frac-capacity');
    const capacity = parseFloat(capacityInput.value);

    if (isNaN(capacity) || capacity < 0) {
        alert("Please enter a valid non-negative capacity.");
        return;
    }

    const items = [];
    document.querySelectorAll('#frac-items-container .item-row').forEach((row, idx) => {
        const profit = parseFloat(row.querySelector('.item-profit').value);
        const weight = parseFloat(row.querySelector('.item-weight').value);
        if (!isNaN(profit) && !isNaN(weight) && profit >= 0 && weight > 0) {
            items.push({
                id: idx + 1,
                profit,
                weight,
                ratio: profit / weight,
                fraction: 0
            });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one valid item (Profit >= 0, Weight > 0).");
        return;
    }

    // 1. Sort by Ratio in Descending Order
    items.sort((a, b) => b.ratio - a.ratio);

    // Render Sorting Table
    const sortingContainer = document.getElementById('frac-sorting-container');
    sortingContainer.innerHTML = `
        <table class="dp-table">
            <thead>
                <tr>
                    <th>Item ID</th>
                    <th>Profit</th>
                    <th>Weight</th>
                    <th>Profit/Weight Ratio</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr id="frac-row-${item.id}">
                        <td>#${item.id}</td>
                        <td>$${item.profit}</td>
                        <td>${item.weight}kg</td>
                        <td class="ratio-cell" style="font-weight: bold; color: var(--accent-red);">${item.ratio.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // 2. Greedy Selection
    let currentCapacity = capacity;
    let totalProfit = 0;
    const log = document.getElementById('frac-steps-log');
    const resultsDiv = document.getElementById('frac-results');
    resultsDiv.style.display = 'block';
    log.innerHTML = `<strong>Starting greedy selection for Capacity: ${capacity}kg</strong><br>`;

    for (const item of items) {
        const row = document.getElementById(`frac-row-${item.id}`);
        row.style.backgroundColor = '#fff9c4';
        await new Promise(r => setTimeout(r, 600));

        if (currentCapacity >= item.weight) {
            // Take full item
            item.fraction = 1;
            currentCapacity -= item.weight;
            totalProfit += item.profit;
            log.innerHTML += `<span style="color: green;">✔ Taken 100% of Item #${item.id}</span>. Remaining Capacity: ${currentCapacity.toFixed(2)}kg<br>`;
        } else if (currentCapacity > 0) {
            // Take fractional part
            item.fraction = currentCapacity / item.weight;
            const partialProfit = item.profit * item.fraction;
            totalProfit += partialProfit;
            log.innerHTML += `<span style="color: orange;">◓ Taken ${(item.fraction * 100).toFixed(1)}% of Item #${item.id}</span> (Profit: $${partialProfit.toFixed(2)}). Knapsack FULL!<br>`;
            currentCapacity = 0;
        } else {
            // No capacity remaining
            item.fraction = 0;
            log.innerHTML += `<span style="color: grey;">✖ Item #${item.id} skipped</span> (No capacity remaining).<br>`;
        }

        row.style.backgroundColor = '';
        updateFracChart(items);
    }

    document.getElementById('frac-total-profit').textContent = `$${totalProfit.toFixed(2)}`;
    log.innerHTML += `<br><strong>Final Max Profit: $${totalProfit.toFixed(2)}</strong>`;

    // Store result for Comparative Analysis
    window.KnapsackResults.fractional = {
        maxProfit: totalProfit,
        strategy: 'Greedy by Ratio',
        complexity: 'O(n log n)',
        isOptimal: true
    };
}

function updateFracChart(items) {
    const ctx = document.getElementById('frac-chart').getContext('2d');

    if (fracChart) fracChart.destroy();

    const data = {
        labels: items.map(i => `Item #${i.id}`),
        datasets: [{
            label: 'Selection Fraction (%)',
            data: items.map(i => i.fraction * 100),
            backgroundColor: items.map(i => i.fraction === 1 ? '#d32f2f' : (i.fraction > 0 ? '#ff8a80' : '#e0e0e0')),
            borderColor: '#000',
            borderWidth: 1
        }]
    };

    fracChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Percentage Taken (%)' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}
