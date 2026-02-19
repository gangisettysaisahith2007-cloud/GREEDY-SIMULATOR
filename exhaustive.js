function renderExhaustive(container) {
    container.innerHTML = '';

    const introContent = `
        <p>The <strong>Exhaustive Search</strong> approach guarantees an optimal solution by checking every possible combination (subset) of items.</p>
        <p>For $n$ items, there are <strong>$2^n$</strong> possible subsets.</p>
        <p><strong>Complexity:</strong> $O(2^n)$ Time | $O(n)$ Space</p>
    `;
    container.appendChild(Utils.createCard('The Brute Force Tax', introContent));

    const simulatorLayout = Utils.createElement('div', 'simulator-layout');

    // Left side: Inputs
    const inputPanel = Utils.createElement('div', 'input-panel');
    const inputCard = Utils.createCard('Simulation Settings', '');

    const capacityInput = Utils.createInput('Capacity', 'ex-capacity', 'number', '15');
    capacityInput.querySelector('input').classList.add('full-width-input');
    inputCard.appendChild(capacityInput);

    const itemControls = Utils.createElement('div', 'item-controls');
    itemControls.innerHTML = `
        <div class="input-card-header">
            <h3>Items (Max 5 for visualization)</h3>
        </div>
        <div class="items-grid-container">
            <div class="items-grid-header">
                <div>Profit</div>
                <div>Weight</div>
                <div></div>
            </div>
            <div class="items-grid-body" id="ex-items-container">
                <div class="item-row">
                    <input type="number" class="item-profit" value="40">
                    <input type="number" class="item-weight" value="5">
                    <button class="btn-remove-item">×</button>
                </div>
                <div class="item-row">
                    <input type="number" class="item-profit" value="50">
                    <input type="number" class="item-weight" value="10">
                    <button class="btn-remove-item">×</button>
                </div>
                <div class="item-row">
                    <input type="number" class="item-profit" value="100">
                    <input type="number" class="item-weight" value="12">
                    <button class="btn-remove-item">×</button>
                </div>
            </div>
        </div>
        <div class="add-item-container">
            <button id="add-item-ex" class="btn btn-secondary" style="width: 100%;">+ Add Item</button>
        </div>
    `;
    inputCard.appendChild(itemControls);

    const btnGroup = Utils.createElement('div', 'action-buttons-group');
    const runBtn = Utils.createButton('Run Brute Force', runExhaustiveSimulation);
    const resetBtn = Utils.createButton('Reset', () => renderExhaustive(container), 'secondary');
    btnGroup.appendChild(runBtn);
    btnGroup.appendChild(resetBtn);
    inputCard.appendChild(btnGroup);

    const optionsGroup = Utils.createElement('div', 'options-group', '');
    optionsGroup.style.marginTop = '1rem';
    optionsGroup.innerHTML = `
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="ex-show-labels" checked> 
            <span>Show Decision Tree Labels</span>
        </label>
    `;
    inputCard.appendChild(optionsGroup);

    inputPanel.appendChild(inputCard);
    simulatorLayout.appendChild(inputPanel);

    // Right side: Visualizations
    const vizPanel = Utils.createElement('div', 'viz-panel');

    const treeCard = Utils.createCard('Decision Tree (Vertical Layout)', '');
    const treeContainer = Utils.createElement('div', 'viz-container');
    treeContainer.id = 'ex-tree-container';
    treeContainer.style.background = '#fff';
    treeContainer.style.height = '600px';
    treeContainer.style.overflow = 'auto';
    treeContainer.style.position = 'relative'; // For tooltips
    treeCard.appendChild(treeContainer);

    // Add Legend
    const legend = Utils.createElement('div', 'tree-legend');
    legend.innerHTML = `
        <div style="display: flex; gap: 1rem; margin-top: 1rem; font-size: 0.85rem; padding: 0.5rem; background: #f9f9f9; border-radius: 4px; border: 1px solid #eee;">
            <div style="display: flex; align-items: center; gap: 0.4rem;"><span style="width: 12px; height: 12px; background: var(--accent-red); border-radius: 50%;"></span> Optimal</div>
            <div style="display: flex; align-items: center; gap: 0.4rem;"><span style="width: 12px; height: 12px; background: #4caf50; border-radius: 50%;"></span> Valid</div>
            <div style="display: flex; align-items: center; gap: 0.4rem;"><span style="width: 12px; height: 12px; background: #888; border-radius: 50%;"></span> Overweight</div>
            <div style="display: flex; align-items: center; gap: 0.4rem;"><span style="width: 20px; height: 2px; background: var(--accent-red);"></span> Optimal Path</div>
        </div>
    `;
    treeCard.appendChild(legend);
    vizPanel.appendChild(treeCard);

    const resultsSummary = Utils.createCard('Analysis Results', `
        <div id="ex-results" style="display: none;">
            <p>Total Combinations Explored: <span id="ex-count" style="font-weight: bold; color: var(--accent-red);">0</span></p>
            <p>Optimal Profit Found: <span id="ex-max-profit" style="font-weight: bold; color: var(--accent-red);">$0</span></p>
            <div id="ex-best-subset" style="margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 4px;"></div>
        </div>
    `);
    vizPanel.appendChild(resultsSummary);

    simulatorLayout.appendChild(vizPanel);
    container.appendChild(simulatorLayout);

    document.getElementById('add-item-ex').onclick = () => {
        const rows = document.querySelectorAll('#ex-items-container .item-row').length;
        if (rows >= 5) {
            alert("Visualization is limited to 5 items.");
            return;
        }
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="number" class="item-profit" value="0">
            <input type="number" class="item-weight" value="0">
            <button class="btn-remove-item">×</button>
        `;
        document.getElementById('ex-items-container').appendChild(row);
        attachRemoveEventsEx();
    };

    function attachRemoveEventsEx() {
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.onclick = (e) => e.target.closest('.item-row').remove();
        });
    }
    attachRemoveEventsEx();
}

async function runExhaustiveSimulation() {
    const capacity = parseInt(document.getElementById('ex-capacity').value);
    const showLabels = document.getElementById('ex-show-labels').checked;

    if (isNaN(capacity) || capacity < 0) {
        alert("Please enter a valid non-negative capacity.");
        return;
    }

    const items = [];
    document.querySelectorAll('#ex-items-container .item-row').forEach((row, idx) => {
        const profit = parseInt(row.querySelector('.item-profit').value);
        const weight = parseInt(row.querySelector('.item-weight').value);
        if (!isNaN(profit) && !isNaN(weight) && profit >= 0 && weight > 0) {
            items.push({ id: idx + 1, profit, weight });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one valid item.");
        return;
    }

    let subsetCount = 0;
    let maxProfit = 0;
    let bestSubsetIds = new Set();

    // Data for D3 Tree
    const treeData = {
        name: "Start",
        children: [],
        pathItems: [],
        totalWeight: 0,
        totalProfit: 0
    };

    function getSubsets(index, currentWeight, currentProfit, currentItems, parentNode) {
        if (index === items.length) {
            subsetCount++;
            const isValid = currentWeight <= capacity;
            if (isValid && currentProfit >= maxProfit) {
                if (currentProfit > maxProfit || (currentProfit === maxProfit && bestSubsetIds.size === 0)) {
                    maxProfit = currentProfit;
                    bestSubsetIds = new Set(currentItems.map(it => it.id));
                }
            }

            parentNode.status = isValid ? 'leaf' : 'invalid';
            parentNode.finalProfit = currentProfit;
            parentNode.finalWeight = currentWeight;

            // Comprehensive Leaf Node Label
            const subsetText = currentItems.length > 0 ?
                `{${currentItems.map(it => `(${it.profit},${it.weight})`).join(', ')}}` :
                'Empty';

            parentNode.leafLabel = `Subset: ${subsetText}\nTotal: $${currentProfit}, ${currentWeight}kg\nStatus: ${isValid ? 'Valid' : 'Invalid'}`;
            return;
        }

        const item = items[index];
        // Branch 1: Include item (Recursive Step)
        const includeNode = {
            name: `Include Item #${item.id} (P:${item.profit}, W:${item.weight})`,
            children: [],
            decision: 'include',
            itemId: item.id,
            pathItems: [...parentNode.pathItems, item.id],
            totalWeight: currentWeight + item.weight,
            totalProfit: currentProfit + item.profit
        };
        parentNode.children.push(includeNode);
        getSubsets(index + 1, currentWeight + item.weight, currentProfit + item.profit, [...currentItems, item], includeNode);

        // Branch 2: Exclude item (Recursive Step)
        const excludeNode = {
            name: `Exclude Item #${item.id} (P:${item.profit}, W:${item.weight})`,
            children: [],
            decision: 'exclude',
            itemId: item.id,
            pathItems: [...parentNode.pathItems],
            totalWeight: currentWeight,
            totalProfit: currentProfit
        };
        parentNode.children.push(excludeNode);
        getSubsets(index + 1, currentWeight, currentProfit, currentItems, excludeNode);
    }

    getSubsets(0, 0, 0, [], treeData);

    // Second pass to mark optimal path
    function markOptimalPath(node) {
        let isPartOfOptimal = false;

        if (!node.children || node.children.length === 0) {
            if (node.status === 'leaf' && node.finalProfit === maxProfit) {
                const pathSet = new Set(node.pathItems);
                if (pathSet.size === bestSubsetIds.size && [...pathSet].every(id => bestSubsetIds.has(id))) {
                    isPartOfOptimal = true;
                }
            }
        } else {
            for (const child of node.children) {
                if (markOptimalPath(child)) isPartOfOptimal = true;
            }
        }

        node.isOptimal = isPartOfOptimal;
        return isPartOfOptimal;
    }
    markOptimalPath(treeData);

    renderD3Tree(treeData, showLabels);

    const resultsDiv = document.getElementById('ex-results');
    resultsDiv.style.display = 'block';
    document.getElementById('ex-count').textContent = subsetCount;
    document.getElementById('ex-max-profit').textContent = `$${maxProfit}`;

    const subsetDisplay = document.getElementById('ex-best-subset');
    subsetDisplay.innerHTML = maxProfit > 0 ?
        `<strong>Best Subset Identified:</strong><br>` + items.filter(it => bestSubsetIds.has(it.id)).map(it => `Item #${it.id} (P:$${it.profit}, W:${it.weight}kg)`).join('<br>') +
        `<br><strong>Total Weight:</strong> ${items.filter(it => bestSubsetIds.has(it.id)).reduce((sum, item) => sum + item.weight, 0)}kg` :
        `<strong>No valid subset fits the capacity.</strong>`;

    // Store for Comparative Analysis
    window.KnapsackResults.exhaustive = {
        maxProfit: maxProfit,
        strategy: 'Brute Force',
        complexity: 'O(2^n)',
        isOptimal: true
    };
}

function renderD3Tree(data, showLabels) {
    const container = document.getElementById('ex-tree-container');
    container.innerHTML = '';

    // Create Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tree-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#333")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("z-index", "1000")
        .style("pointer-events", "none");

    const margin = { top: 40, right: 150, bottom: 60, left: 150 };
    const width = Math.max(1000, container.clientWidth - margin.left - margin.right);
    const height = 500;

    const svg = d3.select("#ex-tree-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Vertical orientation: size([width, height])
    const treemap = d3.tree().size([width, height]);

    let nodes = d3.hierarchy(data, d => d.children);
    nodes = treemap(nodes);

    // Links
    svg.selectAll(".link")
        .data(nodes.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .style("stroke", d => d.data.isOptimal ? 'var(--accent-red)' : '#ccc')
        .style("stroke-width", d => d.data.isOptimal ? '3px' : '1.5px')
        .style("fill", "none")
        .attr("d", d => {
            return "M" + d.x + "," + d.y
                + "C" + d.x + "," + (d.y + d.parent.y) / 2
                + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
                + " " + d.parent.x + "," + d.parent.y;
        });

    // Nodes
    const node = svg.selectAll(".node")
        .data(nodes.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                .html(`Current Total Weight: ${d.data.totalWeight}kg<br>Current Total Profit: $${d.data.totalProfit}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });

    node.append("circle")
        .attr("r", 7)
        .style("fill", d => {
            if (d.data.status === 'invalid') return '#888'; // Gray for overweight
            if (d.data.status === 'leaf') return d.data.isOptimal ? 'var(--accent-red)' : '#4caf50';
            return d.data.isOptimal ? 'var(--accent-red)' : '#333';
        });

    if (showLabels) {
        node.append("text")
            .attr("dy", d => d.children ? "-1.5em" : "1.5em")
            .style("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight", d => d.data.isOptimal ? "bold" : "normal")
            .attr("y", d => d.children ? 0 : 5)
            .each(function (d) {
                const el = d3.select(this);
                const label = d.children ? d.data.name : d.data.leafLabel;
                const lines = label.split('\n');
                lines.forEach((line, i) => {
                    el.append("tspan")
                        .attr("x", 0)
                        .attr("dy", i === 0 ? 0 : "1.1em")
                        .text(line);
                });
            });
    }
}
