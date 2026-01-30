/**
 * ===========================================
 * VIZUALIZATOR MODULI
 * ===========================================
 * 
 * Bu modul canvasda barcha chizish operatsiyalarini bajaradi.
 * U quyidagilarni chizadi:
 * - Kataklar bilan grid
 * - To'siqlar
 * - Tekshirilgan tugunlar (qadam-baqadam)
 * - Yo'llar va MST qirralari
 * - Agentlar va maqsad
 */

class Visualizer {
    /**
     * Visualizer yaratadi
     * @param {HTMLCanvasElement} canvas - Canvas elementi
     * @param {Grid} grid - Vizualizatsiya qilinadigan grid
     */
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid = grid;
        
        // Grid o'lchamiga qarab canvas o'lchamini o'rnatish
        this.updateCanvasSize();
        
        // Maqsad pozitsiyasi (sichqoncha kursori)
        this.targetX = -1;
        this.targetY = -1;
        
        // Animatsiya holati
        this.animationFrame = 0;
        
        // Vizualizatsiya uchun ranglar
        this.colors = {
            background: '#1a1a2e',
            gridLines: '#2d2d44',
            empty: '#1e1e32',
            obstacle: '#34495e',
            explored: '#3498db',
            exploredAlpha: 0.4,
            path: '#f1c40f',
            mst: '#f1c40f',
            target: '#e74c3c',
            agent: '#2ecc71'
        };
    }

    /**
     * Grid o'lchamlariga qarab canvas o'lchamini yangilaydi
     */
    updateCanvasSize() {
        this.canvas.width = this.grid.cols * this.grid.cellSize;
        this.canvas.height = this.grid.rows * this.grid.cellSize;
    }

    /**
     * Maqsad pozitsiyasini o'rnatadi
     * @param {number} x - Grid ustuni
     * @param {number} y - Grid qatori
     */
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    /**
     * Asosiy chizish funksiyasi - hamma narsani chizadi
     * @param {AgentManager} agentManager - Agent menejer
     */
    render(agentManager) {
        // Animatsiya kadrini oshirish
        this.animationFrame++;
        
        // Canvasni tozalash
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Tartibda chizish (orqadan oldinga)
        this.drawGrid();
        this.drawExploredNodes();
        this.drawPath();
        this.drawMST();
        this.drawTarget();
        this.drawAgents(agentManager);
    }

    /**
     * Grid kataklari va to'siqlarni chizadi
     */
    drawGrid() {
        const cellSize = this.grid.cellSize;
        
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const x = col * cellSize;
                const y = row * cellSize;
                
                if (this.grid.isObstacle(col, row)) {
                    // To'siqni chizish
                    this.ctx.fillStyle = this.colors.obstacle;
                    this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                    
                    // To'siqlarga 3D effekt qo'shish
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.fillRect(x + 1, y + 1, cellSize - 2, 3);
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    this.ctx.fillRect(x + 1, y + cellSize - 4, cellSize - 2, 3);
                } else {
                    // Bo'sh katakni chizish
                    this.ctx.fillStyle = this.colors.empty;
                    this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                }
            }
        }
        
        // Grid chiziqlarini chizish
        this.ctx.strokeStyle = this.colors.gridLines;
        this.ctx.lineWidth = 1;
        
        // Vertikal chiziqlar
        for (let col = 0; col <= this.grid.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * cellSize, 0);
            this.ctx.lineTo(col * cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Gorizontal chiziqlar
        for (let row = 0; row <= this.grid.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * cellSize);
            this.ctx.lineTo(this.canvas.width, row * cellSize);
            this.ctx.stroke();
        }
    }

    /**
     * Tekshirilgan tugunlarni animatsiya bilan chizadi
     */
    drawExploredNodes() {
        const cellSize = this.grid.cellSize;
        
        for (const key of this.grid.exploredNodes) {
            const pos = Grid.parsePositionKey(key);
            const x = pos.x * cellSize;
            const y = pos.y * cellSize;
            
            // Agar to'siq bo'lsa o'tkazib yuborish
            if (this.grid.isObstacle(pos.x, pos.y)) continue;
            
            // Animatsiyaga qarab alfa qiymatini hisoblash
            const baseAlpha = this.colors.exploredAlpha;
            const pulse = Math.sin(this.animationFrame * 0.05 + pos.x * 0.1 + pos.y * 0.1) * 0.1;
            
            this.ctx.fillStyle = `rgba(52, 152, 219, ${baseAlpha + pulse})`;
            this.ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        }
    }

    /**
     * Joriy yo'lni chizadi
     */
    drawPath() {
        const path = this.grid.currentPath;
        if (path.length < 2) return;
        
        const cellSize = this.grid.cellSize;
        const halfCell = cellSize / 2;
        
        // Yo'lni qalin chiziq sifatida chizish
        this.ctx.strokeStyle = this.colors.path;
        this.ctx.lineWidth = cellSize * 0.3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Yaltiroq effekt qo'shish
        this.ctx.shadowColor = this.colors.path;
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(
            path[0].x * cellSize + halfCell,
            path[0].y * cellSize + halfCell
        );
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(
                path[i].x * cellSize + halfCell,
                path[i].y * cellSize + halfCell
            );
        }
        
        this.ctx.stroke();
        
        // Soyani qayta tiklash
        this.ctx.shadowBlur = 0;
        
        // Yo'l tugunlarini doiralar sifatida chizish
        this.ctx.fillStyle = this.colors.path;
        for (const node of path) {
            const x = node.x * cellSize + halfCell;
            const y = node.y * cellSize + halfCell;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, cellSize * 0.15, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Prim algoritmi uchun MST qirralarini chizadi
     */
    drawMST() {
        const edges = this.grid.mstEdges;
        if (edges.length === 0) return;
        
        const cellSize = this.grid.cellSize;
        const halfCell = cellSize / 2;
        
        // MST qirralarini chizish
        this.ctx.strokeStyle = this.colors.mst;
        this.ctx.lineWidth = cellSize * 0.2;
        this.ctx.lineCap = 'round';
        
        // Yaltiroq effekt qo'shish
        this.ctx.shadowColor = this.colors.mst;
        this.ctx.shadowBlur = 8;
        
        for (const edge of edges) {
            const fromX = edge.from.x * cellSize + halfCell;
            const fromY = edge.from.y * cellSize + halfCell;
            const toX = edge.to.x * cellSize + halfCell;
            const toY = edge.to.y * cellSize + halfCell;
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromX, fromY);
            this.ctx.lineTo(toX, toY);
            this.ctx.stroke();
        }
        
        // Soyani qayta tiklash
        this.ctx.shadowBlur = 0;
        
        // MST tugunlarini chizish
        this.ctx.fillStyle = this.colors.mst;
        const drawnNodes = new Set();
        
        for (const edge of edges) {
            const fromKey = `${edge.from.x},${edge.from.y}`;
            const toKey = `${edge.to.x},${edge.to.y}`;
            
            if (!drawnNodes.has(fromKey)) {
                drawnNodes.add(fromKey);
                this.ctx.beginPath();
                this.ctx.arc(
                    edge.from.x * cellSize + halfCell,
                    edge.from.y * cellSize + halfCell,
                    cellSize * 0.15, 0, Math.PI * 2
                );
                this.ctx.fill();
            }
            
            if (!drawnNodes.has(toKey)) {
                drawnNodes.add(toKey);
                this.ctx.beginPath();
                this.ctx.arc(
                    edge.to.x * cellSize + halfCell,
                    edge.to.y * cellSize + halfCell,
                    cellSize * 0.15, 0, Math.PI * 2
                );
                this.ctx.fill();
            }
        }
    }

    /**
     * Maqsadni (kursor pozitsiyasi) chizadi
     */
    drawTarget() {
        if (this.targetX < 0 || this.targetY < 0) return;
        if (!this.grid.isValidCell(this.targetX, this.targetY)) return;
        
        const cellSize = this.grid.cellSize;
        const x = this.targetX * cellSize + cellSize / 2;
        const y = this.targetY * cellSize + cellSize / 2;
        
        // Pulsatsiya animatsiyasi
        const pulse = 1 + Math.sin(this.animationFrame * 0.1) * 0.15;
        const radius = cellSize * 0.35 * pulse;
        
        // Maqsad yaltiroqligini chizish
        this.ctx.shadowColor = this.colors.target;
        this.ctx.shadowBlur = 15;
        
        // Tashqi halqani chizish
        this.ctx.strokeStyle = this.colors.target;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Ichki doirani chizish
        this.ctx.fillStyle = this.colors.target;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Nishonni chizish
        const crossSize = radius * 0.7;
        this.ctx.beginPath();
        this.ctx.moveTo(x - crossSize, y);
        this.ctx.lineTo(x + crossSize, y);
        this.ctx.moveTo(x, y - crossSize);
        this.ctx.lineTo(x, y + crossSize);
        this.ctx.stroke();
        
        // Soyani qayta tiklash
        this.ctx.shadowBlur = 0;
    }

    /**
     * Barcha agentlarni chizadi
     * @param {AgentManager} agentManager - Agent menejer
     */
    drawAgents(agentManager) {
        const cellSize = this.grid.cellSize;
        
        for (const agent of agentManager.agents) {
            const pos = agent.getPixelPosition();
            const x = pos.x * cellSize + cellSize / 2;
            const y = pos.y * cellSize + cellSize / 2;
            const radius = cellSize * agent.radius;
            
            // Sakrash animatsiyasi
            const bounce = Math.sin(this.animationFrame * 0.15 + agent.animationOffset) * 2;
            const displayY = y + bounce;
            
            // Agent soyasini chizish
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(x, y + radius * 0.8, radius * 0.9, radius * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Agent yaltiroqligini chizish
            this.ctx.shadowColor = agent.color;
            this.ctx.shadowBlur = 10;
            
            // Agent tanasini chizish
            const gradient = this.ctx.createRadialGradient(
                x - radius * 0.3, displayY - radius * 0.3, 0,
                x, displayY, radius
            );
            gradient.addColorStop(0, this.lightenColor(agent.color, 30));
            gradient.addColorStop(1, agent.color);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, displayY, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Ko'zlarni chizish
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#fff';
            const eyeOffset = radius * 0.25;
            const eyeRadius = radius * 0.2;
            
            // Chap ko'z
            this.ctx.beginPath();
            this.ctx.arc(x - eyeOffset, displayY - radius * 0.1, eyeRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // O'ng ko'z
            this.ctx.beginPath();
            this.ctx.arc(x + eyeOffset, displayY - radius * 0.1, eyeRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Qorachiqlar
            this.ctx.fillStyle = '#333';
            const pupilRadius = eyeRadius * 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x - eyeOffset + pupilRadius * 0.3, displayY - radius * 0.05, pupilRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x + eyeOffset + pupilRadius * 0.3, displayY - radius * 0.05, pupilRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Agent raqamini chizish
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `bold ${radius * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText((agent.id + 1).toString(), x, displayY + radius * 0.4);
        }
    }

    /**
     * Hex rangni foizga yorqinlashtiradi
     * @param {string} color - Hex rang stringi
     * @param {number} percent - Yorqinlashtirish foizi
     * @returns {string} Yorqinlashtirilgan hex rang
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}

// Boshqa modullarda ishlatish uchun eksport
window.Visualizer = Visualizer;
