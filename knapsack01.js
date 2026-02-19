function renderKnapsack01(container) {
    container.innerHTML = '';

    const introContent = `
        <p>In the <strong>0/1 Knapsack Problem</strong>, you cannot break items. You either take the item (1) or you don't (0). This "all or nothing" property makes it impossible to solve with a simple Greedy strategy in all cases.</p>
        <p>Instead, we use <strong>Dynamic Programming (DP)</strong> to build a solution by solving sub-problems and storing their results in a table.</p>
    `;
    container.appendChild(Utils.createCard('The 0/1 Knapsack Constraint', introContent));

    const simulatorLayout = Utils.createElement('div', 'simulator-layout');

    // Left side: Inputs
    const inputPanel = Utils.createElement('div', 'input-panel');
    const inputCard = Utils.createCard('Simulation Settings', '');

    const capacityInput = Utils.createInput('Knapsack Capacity', 'knap01-capacity', 'number', '10');
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
            <div class="items-grid-body" id="knap01-items-container">
                <div class="item-row">
                    <input type="number" class="item-profit" value="60">
                    <input type="number" class="item-weight" value="2">
                    <button class="btn-remove-item">×</button>
                </div>
                <div class="item-row">
                    <input type="number" class="item-profit" value="100">
                    <input type="number" class="item-weight" value="3">
                    <button class="btn-remove-item">×</button>
                </div>
                <div class="item-row">
                    <input type="number" class="item-profit" value="120">
                    <input type="number" class="item-weight" value="5">
                    <button class="btn-remove-item">×</button>
                </div>
            </div>
        </div>
        <div class="add-item-container">
            <button id="add-item-01" class="btn btn-secondary" style="width: 100%;">+ Add Item</button>
        </div>
    `;
    inputCard.appendChild(itemControls);

    const btnGroup = Utils.createElement('div', 'action-buttons-group');
    const runBtn = Utils.createButton('Run Simulation', runKnapsack01Simulation);
    const resetBtn = Utils.createButton('Reset', () => renderKnapsack01(container), 'secondary');
    btnGroup.appendChild(runBtn);
    btnGroup.appendChild(resetBtn);
    inputCard.appendChild(btnGroup);

    const optionsGroup = Utils.createElement('div', 'options-group', '');
    optionsGroup.style.marginTop = '1rem';
    optionsGroup.innerHTML = `
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="knap01-show-steps" checked> 
            <span>Show Calculation Steps</span>
        </label>
    `;
    inputCard.appendChild(optionsGroup);

    inputPanel.appendChild(inputCard);

    // Greedy Failure Example
    const failureCard = Utils.createCard('Greedy vs Optimal', '<p>Greedy fails when a large, valuable item blocks several smaller items that together are worth more.</p>');
    failureCard.appendChild(Utils.createButton('Load Counterexample', loadCounterexample01, 'secondary'));
    inputPanel.appendChild(failureCard);

    simulatorLayout.appendChild(inputPanel);

    // Right side: Visualizations
    const vizPanel = Utils.createElement('div', 'viz-panel');

    const resultsCard = Utils.createCard('Execution & Results', '');
    resultsCard.id = 'knap01-results-card';
    resultsCard.innerHTML = `
        <div id="knap01-summary" style="margin-bottom: 1.5rem; font-weight: bold; font-size: 1.2rem; display: none;">
            Max Profit: <span id="knap01-max-profit" style="color: var(--accent-red);">0</span>
        </div>
        <div id="knap01-viz-container" class="viz-container" style="flex-direction: column; align-items: flex-start; padding: 1rem; overflow: auto; height: 500px; display: none;">
            <!-- DP Table goes here -->
        </div>
        <div id="knap01-steps" style="margin-top: 1rem; font-style: italic; color: #666;"></div>
    `;
    vizPanel.appendChild(resultsCard);

    const selectionCard = Utils.createCard('Selected Items', '<div id="knap01-selections">Run simulation to see selected items...</div>');
    vizPanel.appendChild(selectionCard);

    simulatorLayout.appendChild(vizPanel);
    container.appendChild(simulatorLayout);

    // Event Delegations
    document.getElementById('add-item-01').onclick = () => {
        const container = document.getElementById('knap01-items-container');
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="number" class="item-profit" value="0">
            <input type="number" class="item-weight" value="0">
            <button class="btn-remove-item">×</button>
        `;
        container.appendChild(row);
        attachRemoveEvents01();
    };

    function attachRemoveEvents01() {
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.onclick = (e) => e.target.closest('.item-row').remove();
        });
    }
    window.attachRemoveEvents01 = attachRemoveEvents01; // Make it accessible
    attachRemoveEvents01();
}

function loadCounterexample01() {
    const capacityInput = document.getElementById('knap01-capacity');
    capacityInput.value = 4;

    const container = document.getElementById('knap01-items-container');
    container.innerHTML = `
        <div class="item-row">
            <input type="number" class="item-profit" value="24">
            <input type="number" class="item-weight" value="3">
            <button class="btn-remove-item">×</button>
        </div>
        <div class="item-row">
            <input type="number" class="item-profit" value="15">
            <input type="number" class="item-weight" value="2">
            <button class="btn-remove-item">×</button>
        </div>
        <div class="item-row">
            <input type="number" class="item-profit" value="15">
            <input type="number" class="item-weight" value="2">
            <button class="btn-remove-item">×</button>
        </div>
    `;
    attachRemoveEvents01();
    alert("Loaded! Greedy would take the $24 item (3kg) first, leaving 1kg space and a total profit of $24. Optimal takes the two $15 items (2kg each) for a total of $30.");
}

async function runKnapsack01Simulation() {
    const capacityVal = document.getElementById('knap01-capacity').value;
    const capacity = parseInt(capacityVal);
    const showSteps = document.getElementById('knap01-show-steps').checked;

    if (isNaN(capacity) || capacity < 0) {
        alert("Please enter a valid non-negative capacity.");
        return;
    }

    const items = [];
    document.querySelectorAll('#knap01-items-container .item-row').forEach(row => {
        const profit = parseInt(row.querySelector('.item-profit').value);
        const weight = parseInt(row.querySelector('.item-weight').value);
        if (!isNaN(profit) && !isNaN(weight) && profit >= 0 && weight > 0) {
            items.push({ profit, weight });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one valid item (Profit >= 0, Weight > 0).");
        return;
    }

    const n = items.length;
    // Initializing DP table with 0s
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    const vizContainer = document.getElementById('knap01-viz-container');
    const summary = document.getElementById('knap01-summary');
    const stepsDiv = document.getElementById('knap01-steps');
    const detectionsDiv = document.getElementById('knap01-selections');

    vizContainer.style.display = 'block';
    summary.style.display = 'block';
    vizContainer.innerHTML = '';
    stepsDiv.innerHTML = '';
    detectionsDiv.innerHTML = 'Calculating...';

    // Create Table
    const table = document.createElement('table');
    table.className = 'dp-table';
    table.style.fontSize = '0.9rem';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Item / Cap</th>';
    for (let j = 0; j <= capacity; j++) headerRow.innerHTML += `<th>${j}</th>`;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    for (let i = 0; i <= n; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${i === 0 ? 'Base' : 'Item ' + i}</td>`;
        for (let j = 0; j <= capacity; j++) {
            row.innerHTML += `<td id="dp-${i}-${j}">${dp[i][j]}</td>`;
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    vizContainer.appendChild(table);

    // Animation & DP Calculation
    for (let i = 1; i <= n; i++) {
        const weight = items[i - 1].weight;
        const profit = items[i - 1].profit;

        for (let j = 0; j <= capacity; j++) {
            const cell = document.getElementById(`dp-${i}-${j}`);

            let val;
            if (weight <= j) {
                // dp[i][j] = max(profit + dp[i-1][j-weight], dp[i-1][j])
                const include = profit + dp[i - 1][j - weight];
                const exclude = dp[i - 1][j];
                val = Math.max(include, exclude);

                if (showSteps) {
                    cell.style.backgroundColor = '#fff9c4';
                    stepsDiv.innerHTML = `<strong>Step (Item ${i}, Cap ${j}):</strong><br>Item weight (${weight}) &le; Capacity (${j}).<br>Include: ${profit} + dp[${i - 1}][${j - weight}](${dp[i - 1][j - weight]}) = ${include}<br>Exclude: dp[${i - 1}][${j}](${dp[i - 1][j]}) = ${exclude}<br>Result: max(${include}, ${exclude}) = ${val}`;
                    await new Promise(r => setTimeout(r, 100));
                }
            } else {
                // dp[i][j] = dp[i-1][j]
                val = dp[i - 1][j];
                if (showSteps) {
                    cell.style.backgroundColor = '#fce4ec';
                    stepsDiv.innerHTML = `<strong>Step (Item ${i}, Cap ${j}):</strong><br>Item weight (${weight}) > Capacity (${j}). Cannot include.<br>Result: dp[${i - 1}][${j}] = ${val}`;
                    await new Promise(r => setTimeout(r, 50));
                }
            }

            dp[i][j] = val;
            cell.textContent = val;
            if (showSteps) cell.style.backgroundColor = '';
        }
    }

    const maxProfit = dp[n][capacity];
    document.getElementById('knap01-max-profit').textContent = maxProfit;
    stepsDiv.innerHTML = "<strong>Table complete!</strong> Now backtracking to find items...";

    // Backtracking to find selected items
    const selected = [];
    let i = n, j = capacity;
    while (i > 0 && j > 0) {
        const currentCell = document.getElementById(`dp-${i}-${j}`);
        if (dp[i][j] !== dp[i - 1][j]) {
            // Item i was included
            selected.push(items[i - 1]);
            currentCell.style.border = '2px solid var(--accent-red)';
            currentCell.style.backgroundColor = '#ffebee';
            j -= items[i - 1].weight;
        }
        i--;
    }

    detectionsDiv.innerHTML = '<h4>Optimal Selection:</h4><ul>' +
        (selected.length > 0 ? selected.map(item => `<li>Item (Profit: $${item.profit}, Weight: ${item.weight}kg)</li>`).join('') : '<li>No items selected.</li>') +
        '</ul>';

    // Store result for Comparative Analysis
    window.KnapsackResults.knapsack01 = {
        maxProfit: maxProfit,
        strategy: 'Dynamic Programming',
        complexity: 'O(n * W)',
        isOptimal: true
    };
}
