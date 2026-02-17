// ===== INTERACTIVE GRAPH BUILDER =====
const GraphBuilder = {
    vertices: [],
    edges: [],
    mode: 'vertex', // 'vertex' or 'edge'
    selectedVertex: null,
    nextLabel: 65, // ASCII 'A'
    svg: null,

    init() {
        const canvas = document.getElementById('gb-canvas');
        if (!canvas || this.svg) return;
        canvas.innerHTML = '';
        this.svg = d3.select(canvas).append('svg')
            .attr('width', '100%').attr('height', '100%');

        canvas.addEventListener('click', (e) => {
            if (this.mode !== 'vertex') return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Don't add if too close to existing
            const tooClose = this.vertices.some(v => Math.hypot(v.x - x, v.y - y) < 40);
            if (tooClose) return;
            const label = String.fromCharCode(this.nextLabel++);
            this.vertices.push({ label, x, y });
            this.redraw();
            this.updateCounts();
        });
    },

    setMode(mode) {
        this.mode = mode;
        this.selectedVertex = null;
        const canvas = document.getElementById('gb-canvas');
        if (canvas) {
            canvas.classList.toggle('edge-mode', mode === 'edge');
        }
        document.querySelectorAll('.gb-mode-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(`gb-${mode}-btn`);
        if (activeBtn) activeBtn.classList.add('active');
        const info = document.getElementById('gb-mode-info');
        if (info) info.textContent = mode === 'vertex'
            ? 'Click on canvas to add vertices'
            : 'Click two vertices to connect them with an edge';
    },

    clear() {
        this.vertices = [];
        this.edges = [];
        this.nextLabel = 65;
        this.selectedVertex = null;
        this.redraw();
        this.updateCounts();
        document.getElementById('gb-mst-results').innerHTML = '';
    },

    updateCounts() {
        const vc = document.getElementById('gb-vertex-count');
        const ec = document.getElementById('gb-edge-count');
        if (vc) vc.textContent = `Vertices: ${this.vertices.length}`;
        if (ec) ec.textContent = `Edges: ${this.edges.length}`;
    },

    redraw() {
        if (!this.svg) return;
        this.svg.selectAll('*').remove();

        // Draw edges
        this.edges.forEach((edge, idx) => {
            const v1 = this.vertices.find(v => v.label === edge.u);
            const v2 = this.vertices.find(v => v.label === edge.v);
            if (!v1 || !v2) return;

            this.svg.append('line')
                .attr('x1', v1.x).attr('y1', v1.y)
                .attr('x2', v2.x).attr('y2', v2.y)
                .attr('stroke', edge.inMST ? '#DC2626' : '#D1D5DB')
                .attr('stroke-width', edge.inMST ? 3 : 2)
                .attr('class', `gb-edge-${idx}`);

            this.svg.append('text')
                .attr('x', (v1.x + v2.x) / 2)
                .attr('y', (v1.y + v2.y) / 2 - 8)
                .attr('text-anchor', 'middle')
                .attr('font-size', 12).attr('font-weight', 700)
                .attr('fill', edge.inMST ? '#DC2626' : '#6B7280')
                .text(edge.weight);
        });

        // Draw vertices
        const self = this;
        this.vertices.forEach(v => {
            const g = this.svg.append('g').attr('transform', `translate(${v.x},${v.y})`);
            g.append('circle').attr('r', 20)
                .attr('fill', v === this.selectedVertex ? '#DC2626' : '#111')
                .attr('stroke', '#DC2626').attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .on('click', function (event) {
                    event.stopPropagation();
                    if (self.mode === 'edge') self.handleEdgeClick(v);
                });

            g.append('text')
                .attr('text-anchor', 'middle').attr('dy', 5)
                .attr('fill', '#FFF').attr('font-size', 13).attr('font-weight', 700)
                .text(v.label)
                .style('pointer-events', 'none');
        });
    },

    handleEdgeClick(vertex) {
        if (!this.selectedVertex) {
            this.selectedVertex = vertex;
            this.redraw();
        } else if (this.selectedVertex === vertex) {
            this.selectedVertex = null;
            this.redraw();
        } else {
            const exists = this.edges.some(e =>
                (e.u === this.selectedVertex.label && e.v === vertex.label) ||
                (e.v === this.selectedVertex.label && e.u === vertex.label)
            );
            if (exists) {
                this.selectedVertex = null;
                this.redraw();
                return;
            }
            const weight = prompt(`Enter weight for edge ${this.selectedVertex.label}-${vertex.label}:`, '1');
            if (weight !== null && !isNaN(parseInt(weight))) {
                this.edges.push({
                    u: this.selectedVertex.label,
                    v: vertex.label,
                    weight: parseInt(weight),
                    inMST: false
                });
            }
            this.selectedVertex = null;
            this.redraw();
            this.updateCounts();
        }
    },

    async generateMST(algo) {
        if (this.vertices.length < 2 || this.edges.length === 0) {
            alert('Please add at least 2 vertices and 1 edge.');
            return;
        }

        // Reset MST flags
        this.edges.forEach(e => e.inMST = false);

        const vLabels = this.vertices.map(v => v.label);
        let result;

        if (algo === 'kruskal') {
            result = this.runKruskal(vLabels, this.edges);
        } else {
            result = this.runPrim(vLabels, this.edges);
        }

        // Animate edges one by one
        for (const step of result.steps) {
            await Utils.delay(600);
            if (step.added) {
                const edge = this.edges.find(e =>
                    (e.u === step.u && e.v === step.v) || (e.v === step.u && e.u === step.v)
                );
                if (edge) edge.inMST = true;
            }
            this.redraw();
        }

        let html = `<div class="card" style="margin-top:16px">
            <div class="card-title"><span class="icon">🏗️</span> MST Result (${algo === 'kruskal' ? "Kruskal's" : "Prim's"})</div>`;
        html += Utils.resultBox('Total Weight', result.totalWeight,
            `MST Edges: ${result.mstEdges.map(e => `${e.u}-${e.v}(${e.weight})`).join(', ')}`);
        html += '<div class="step-container">';
        result.steps.forEach((step, i) => {
            html += `<div class="step-item ${step.added ? 'completed' : ''}">
                <div class="step-number" style="background:${step.added ? '#16A34A' : '#DC2626'};color:white">${i + 1}</div>
                <div class="step-text">${step.text}</div>
            </div>`;
        });
        html += '</div></div>';
        document.getElementById('gb-mst-results').innerHTML = html;
    },

    runKruskal(vertices, edges) {
        const sorted = [...edges].sort((a, b) => a.weight - b.weight);
        const parent = {}, rank = {};
        vertices.forEach(v => { parent[v] = v; rank[v] = 0; });
        function find(x) { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; }
        function union(a, b) {
            const ra = find(a), rb = find(b);
            if (ra === rb) return false;
            if (rank[ra] < rank[rb]) parent[ra] = rb;
            else if (rank[ra] > rank[rb]) parent[rb] = ra;
            else { parent[rb] = ra; rank[ra]++; }
            return true;
        }

        const mstEdges = [], steps = [];
        let totalWeight = 0;
        for (const edge of sorted) {
            const canAdd = union(edge.u, edge.v);
            if (canAdd) {
                mstEdges.push(edge);
                totalWeight += edge.weight;
                steps.push({ added: true, u: edge.u, v: edge.v, text: `Add <strong>${edge.u}-${edge.v}</strong> (w=${edge.weight}) ✅ No cycle` });
            } else {
                steps.push({ added: false, u: edge.u, v: edge.v, text: `Skip <strong>${edge.u}-${edge.v}</strong> (w=${edge.weight}) ❌ Would create cycle` });
            }
        }
        return { mstEdges, totalWeight, steps };
    },

    runPrim(vertices, edges) {
        const adj = {};
        vertices.forEach(v => { adj[v] = []; });
        edges.forEach(e => {
            adj[e.u].push({ to: e.v, weight: e.weight });
            adj[e.v].push({ to: e.u, weight: e.weight });
        });

        const key = {}, inMST = new Set(), parent = {};
        vertices.forEach(v => { key[v] = Infinity; parent[v] = null; });
        key[vertices[0]] = 0;

        const mstEdges = [], steps = [];
        let totalWeight = 0;

        for (let i = 0; i < vertices.length; i++) {
            let u = null, minKey = Infinity;
            for (const v of vertices) {
                if (!inMST.has(v) && key[v] < minKey) { minKey = key[v]; u = v; }
            }
            if (u === null) break;
            inMST.add(u);

            if (parent[u] !== null) {
                mstEdges.push({ u: parent[u], v: u, weight: key[u] });
                totalWeight += key[u];
                steps.push({ added: true, u: parent[u], v: u, text: `Add <strong>${parent[u]}-${u}</strong> (w=${key[u]}) ✅ Minimum key vertex` });
            } else {
                steps.push({ added: true, u, v: u, text: `Start from <strong>${u}</strong> (initial)` });
            }

            for (const nb of adj[u]) {
                if (!inMST.has(nb.to) && nb.weight < key[nb.to]) {
                    key[nb.to] = nb.weight;
                    parent[nb.to] = u;
                }
            }
        }
        return { mstEdges, totalWeight, steps };
    },

    loadPreset(num) {
        this.clear();
        const presets = {
            1: {
                vertices: [
                    { label: 'A', x: 200, y: 80 }, { label: 'B', x: 400, y: 80 },
                    { label: 'C', x: 300, y: 250 }
                ],
                edges: [{ u: 'A', v: 'B', weight: 4 }, { u: 'A', v: 'C', weight: 2 }, { u: 'B', v: 'C', weight: 1 }]
            },
            2: {
                vertices: [
                    { label: 'A', x: 150, y: 100 }, { label: 'B', x: 350, y: 60 },
                    { label: 'C', x: 450, y: 200 }, { label: 'D', x: 300, y: 350 },
                    { label: 'E', x: 100, y: 280 }
                ],
                edges: [
                    { u: 'A', v: 'B', weight: 2 }, { u: 'B', v: 'C', weight: 3 },
                    { u: 'C', v: 'D', weight: 1 }, { u: 'D', v: 'E', weight: 4 },
                    { u: 'E', v: 'A', weight: 5 }, { u: 'B', v: 'D', weight: 6 },
                    { u: 'A', v: 'C', weight: 7 }
                ]
            }
        };
        const p = presets[num];
        this.vertices = p.vertices.map(v => ({ ...v }));
        this.edges = p.edges.map(e => ({ ...e, inMST: false }));
        this.nextLabel = 65 + this.vertices.length;
        this.redraw();
        this.updateCounts();
    }
};
