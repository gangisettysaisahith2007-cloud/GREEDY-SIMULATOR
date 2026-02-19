function renderIntro(container) {
    container.innerHTML = '';

    // Intro Card
    const introContent = `
        <p>Imagine you have a backpack (knapsack) with a maximum weight capacity. You are presented with a set of items, each with its own weight and profit (value). Your goal is to fill the knapsack in a way that maximizes the total profit without exceeding the weight limit.</p>
        <div class="highlight-box" style="border-left: 4px solid var(--accent-red); padding: 1rem; background: #fff5f5; margin: 1.5rem 0;">
            <strong>The Challenge:</strong> How do you decide which items to take and which to leave behind?
        </div>
        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
            <div>
                <h3>Real-Life Examples</h3>
                <ul>
                    <li><strong>Bag Packing:</strong> Professional hikers choosing gear based on weight.</li>
                    <li><strong>Cargo Loading:</strong> Maximizing profit from shipping containers.</li>
                    <li><strong>Asset Allocation:</strong> Investors choosing which projects to fund.</li>
                </ul>
            </div>
            <div>
                <h3>Key Definitions</h3>
                <ul>
                    <li><strong>Weight ($w$):</strong> The physical cost or burden of an item.</li>
                    <li><strong>Profit ($p$):</strong> The reward or value gained from an item.</li>
                    <li><strong>Capacity ($W$):</strong> The maximum weight the bag can hold.</li>
                </ul>
            </div>
        </div>
    `;
    container.appendChild(Utils.createCard('What is the Knapsack Problem?', introContent));

    // Interactive Animation Card
    const vizCard = Utils.createCard('Interactive Illustration', 'Click the "Simulate Packing" button to see items being added to the knapsack.');
    const canvasContainer = Utils.createElement('div', 'viz-container');
    const canvas = Utils.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    canvasContainer.appendChild(canvas);
    vizCard.appendChild(canvasContainer);

    const controls = Utils.createElement('div', 'controls', '');
    controls.style.marginTop = '1rem';
    controls.style.display = 'flex';
    controls.style.gap = '1rem';

    const startBtn = Utils.createButton('Simulate Packing', () => startIntroAnimation(canvas));
    const resetBtn = Utils.createButton('Reset', () => resetIntroAnimation(canvas), 'secondary');

    controls.appendChild(startBtn);
    controls.appendChild(resetBtn);
    vizCard.appendChild(controls);

    container.appendChild(vizCard);

    // Variants Overview
    const variantsContent = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            <div class="variant-item" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px;">
                <h3 style="color: var(--accent-red);">0/1 Knapsack</h3>
                <p>Items cannot be divided. You either take the whole item or leave it. (Dynamic Programming)</p>
            </div>
            <div class="variant-item" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px;">
                <h3 style="color: var(--accent-red);">Fractional Knapsack</h3>
                <p>Items can be broken into smaller pieces. You can take a fraction of an item. (Greedy Strategy)</p>
            </div>
            <div class="variant-item" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px;">
                <h3 style="color: var(--accent-red);">Exhaustive Knapsack</h3>
                <p>Checking every possible combination of items to find the absolute best. (Brute Force)</p>
            </div>
        </div>
    `;
    container.appendChild(Utils.createCard('Types of Knapsack Variants', variantsContent));

    // Initialize canvas state
    resetIntroAnimation(canvas);
}

let animationId = null;

function resetIntroAnimation(canvas) {
    if (animationId) cancelAnimationFrame(animationId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw empty bag
    drawBag(ctx, 500, 300, 0);
    // Draw items on shelf
    drawItems(ctx, [
        { x: 100, y: 150, color: '#e57373', weight: 10, profit: 60, name: 'Item 1' },
        { x: 200, y: 150, color: '#81c784', weight: 20, profit: 100, name: 'Item 2' },
        { x: 300, y: 150, color: '#64b5f6', weight: 30, profit: 120, name: 'Item 3' }
    ]);
}

function drawBag(ctx, x, y, fillLevel) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y - 100, 150, 150);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x, y - 100, 150, 150);

    // Fill level
    ctx.fillStyle = 'rgba(211, 47, 47, 0.3)';
    ctx.fillRect(x, y + 50 - (fillLevel * 1.5), 150, fillLevel * 1.5);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Inter';
    ctx.fillText('KNAPSACK', x + 35, y + 80);
}

function drawItems(ctx, items) {
    items.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, 60, 60);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Inter';
        ctx.fillText(item.name, item.x + 5, item.y + 25);
        ctx.fillText(`$${item.profit}`, item.x + 5, item.y + 45);

        ctx.fillStyle = '#000';
        ctx.fillText(`Wt: ${item.weight}`, item.x, item.y + 80);
    });
}

function startIntroAnimation(canvas) {
    resetIntroAnimation(canvas);
    const ctx = canvas.getContext('2d');
    const items = [
        { x: 100, y: 150, color: '#e57373', weight: 10, profit: 60, name: 'Item 1', targetX: 545, targetY: 210 },
        { x: 200, y: 150, color: '#81c784', weight: 20, profit: 100, name: 'Item 2', targetX: 545, targetY: 210 },
        { x: 300, y: 150, color: '#64b5f6', weight: 30, profit: 120, name: 'Item 3', targetX: 545, targetY: 210 }
    ];

    let currentItemIdx = 0;
    let progress = 0;
    let fill = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBag(ctx, 500, 300, fill);

        // Draw static items
        const remainingItems = items.slice(currentItemIdx + 1);
        drawItems(ctx, remainingItems);

        // Animate current item
        if (currentItemIdx < items.length) {
            const item = items[currentItemIdx];
            const currentX = item.x + (item.targetX - item.x) * progress;
            const currentY = item.y + (item.targetY - item.y) * progress;

            ctx.fillStyle = item.color;
            ctx.fillRect(currentX, currentY, 60, 60);

            progress += 0.02;
            if (progress >= 1) {
                fill += item.weight;
                currentItemIdx++;
                progress = 0;
            }
            animationId = requestAnimationFrame(animate);
        } else {
            drawBag(ctx, 500, 300, fill);
            ctx.fillStyle = 'var(--accent-red)';
            ctx.font = 'bold 24px Inter';
            ctx.fillText('Packed!', 530, 180);
        }
    }
    animate();
}
