/**
 * ===========================================
 * AGENT MODULI
 * ===========================================
 * 
 * Bu modul yo'l topish algoritmlari yordamida kursorni
 * quvadigan agentlarni (belgilarni) boshqaradi.
 * 
 * Har bir agent quyidagilarga ega:
 * - Griddagi pozitsiya
 * - Maqsadga joriy yo'l
 * - Harakat tezligi va animatsiya holati
 * - Vizual farqlash uchun rang
 */

class Agent {
    /**
     * Yangi Agent yaratadi
     * @param {number} x - Boshlang'ich grid ustuni
     * @param {number} y - Boshlang'ich grid qatori
     * @param {string} color - Chizish uchun agent rangi
     * @param {number} id - Noyob agent identifikatori
     */
    constructor(x, y, color, id) {
        // Grid pozitsiyasi
        this.gridX = x;
        this.gridY = y;
        
        // Animatsiya uchun silliq piksel pozitsiyasi
        this.pixelX = x;
        this.pixelY = y;
        
        // Vizual xususiyatlar
        this.color = color;
        this.id = id;
        this.radius = 0.35; // Katak o'lchamiga nisbatan
        
        // Harakat xususiyatlari
        this.speed = 0.1; // Har bir kadrda grid kataklari
        this.path = [];
        this.pathIndex = 0;
        this.isMoving = false;
        
        // Maqsad pozitsiyasi
        this.targetX = x;
        this.targetY = y;
        
        // Animatsiya holati
        this.animationOffset = Math.random() * Math.PI * 2;
    }

    /**
     * Agentning yo'lini yangi maqsadga yangilaydi
     * @param {Array<Object>} path - Pozitsiyalar massivi {x, y}
     */
    setPath(path) {
        if (path && path.length > 0) {
            this.path = path;
            this.pathIndex = 0;
            this.isMoving = true;
        } else {
            this.path = [];
            this.isMoving = false;
        }
    }

    /**
     * Agentning yo'li bo'ylab pozitsiyasini yangilaydi
     * Grid kataklari orasida silliq harakatni amalga oshiradi
     */
    update() {
        if (!this.isMoving || this.path.length === 0) {
            return;
        }

        // Yo'ldan joriy maqsad katakni olish
        if (this.pathIndex >= this.path.length) {
            this.isMoving = false;
            return;
        }

        const targetCell = this.path[this.pathIndex];
        
        // Maqsad katakka yo'nalishni hisoblash
        const dx = targetCell.x - this.pixelX;
        const dy = targetCell.y - this.pixelY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Maqsad katakka yetib keldikmi tekshirish
        if (distance < this.speed) {
            // Maqsad katakka o'tish
            this.pixelX = targetCell.x;
            this.pixelY = targetCell.y;
            this.gridX = targetCell.x;
            this.gridY = targetCell.y;
            
            // Yo'ldagi keyingi katakka o'tish
            this.pathIndex++;
            
            if (this.pathIndex >= this.path.length) {
                this.isMoving = false;
            }
        } else {
            // Maqsad katakka qarab harakat qilish
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
            
            this.pixelX += moveX;
            this.pixelY += moveY;
        }
    }

    /**
     * Agentni boshlang'ich pozitsiyasiga qaytaradi
     * @param {number} x - Yangi grid ustuni
     * @param {number} y - Yangi grid qatori
     */
    reset(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.pixelX = x;
        this.pixelY = y;
        this.path = [];
        this.pathIndex = 0;
        this.isMoving = false;
    }

    /**
     * Joriy pozitsiyani oladi
     * @returns {Object} Joriy grid pozitsiyasi {x, y}
     */
    getPosition() {
        return { x: this.gridX, y: this.gridY };
    }

    /**
     * Joriy piksel pozitsiyasini oladi (silliq chizish uchun)
     * @returns {Object} Joriy piksel pozitsiyasi {x, y}
     */
    getPixelPosition() {
        return { x: this.pixelX, y: this.pixelY };
    }

    /**
     * Harakat tezligini o'rnatadi
     * @param {number} speed - Yangi tezlik qiymati
     */
    setSpeed(speed) {
        this.speed = speed;
    }
}

/**
 * ===========================================
 * AGENT MENEJER
 * ===========================================
 * 
 * Bir nechta agentlarni va ularning yo'l topishini boshqaradi.
 */
class AgentManager {
    /**
     * AgentManager yaratadi
     * @param {Grid} grid - Yo'l topish uchun grid
     */
    constructor(grid) {
        this.grid = grid;
        this.agents = [];
        this.algorithms = new Algorithms(grid);
        this.currentAlgorithm = 'bfs';
        
        // Agentlar uchun oldindan belgilangan ranglar
        this.agentColors = [
            '#2ecc71', // Yashil
            '#e74c3c', // Qizil
            '#9b59b6', // Binafsha
            '#f39c12', // Apelsin
            '#1abc9c'  // Teal
        ];
        
        // Oxirgi yo'l topish ishidan statistika
        this.lastStats = {
            nodesExplored: 0,
            pathLength: 0,
            time: 0
        };
    }

    /**
     * Grid markazida agentlar yaratadi
     * @param {number} count - Yaratiladigan agentlar soni
     */
    createAgents(count) {
        this.agents = [];
        
        // Markaz pozitsiyasini hisoblash
        const centerX = Math.floor(this.grid.cols / 2);
        const centerY = Math.floor(this.grid.rows / 2);
        
        for (let i = 0; i < count; i++) {
            // Agentlarni ustma-ust kelmasligi uchun biroz siljitish
            const offsetX = (i % 3) - 1;
            const offsetY = Math.floor(i / 3) - 1;
            
            let x = centerX + offsetX;
            let y = centerY + offsetY;
            
            // Pozitsiya o'tish mumkinligini ta'minlash
            if (!this.grid.isWalkable(x, y)) {
                x = centerX;
                y = centerY;
            }
            
            const agent = new Agent(
                x, y,
                this.agentColors[i % this.agentColors.length],
                i
            );
            
            this.agents.push(agent);
        }
    }

    /**
     * Agentlar sonini yangilaydi
     * @param {number} count - Yangi agentlar soni
     */
    setAgentCount(count) {
        const currentCount = this.agents.length;
        
        if (count > currentCount) {
            // Ko'proq agentlar qo'shish
            const centerX = Math.floor(this.grid.cols / 2);
            const centerY = Math.floor(this.grid.rows / 2);
            
            for (let i = currentCount; i < count; i++) {
                const agent = new Agent(
                    centerX, centerY,
                    this.agentColors[i % this.agentColors.length],
                    i
                );
                this.agents.push(agent);
            }
        } else if (count < currentCount) {
            // Ortiqcha agentlarni olib tashlash
            this.agents = this.agents.slice(0, count);
        }
    }

    /**
     * Yo'l topish algoritmini o'rnatadi
     * @param {string} algorithm - Algoritm nomi ('bfs', 'dijkstra', 'prim')
     */
    setAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
    }

    /**
     * Barcha agentlarning maqsadga yo'llarini yangilaydi
     * @param {Object} target - Maqsad pozitsiyasi {x, y}
     */
    updatePaths(target) {
        // Yangi yo'l topishdan oldin vizualizatsiyani tozalash
        this.grid.clearVisualization();
        
        // Prim algoritmi uchun maqsadga yo'l topmaymiz
        if (this.currentAlgorithm === 'prim') {
            // Birinchi agent pozitsiyasidan Prim ni ishga tushirish
            if (this.agents.length > 0) {
                const result = this.algorithms.prim(this.agents[0].getPosition());
                this.lastStats = {
                    nodesExplored: result.nodesExplored,
                    pathLength: result.edgeCount,
                    time: result.time
                };
            }
            return;
        }
        
        // BFS va Dijkstra uchun har bir agent uchun maqsadga yo'l topish
        let totalExplored = 0;
        let totalPathLength = 0;
        let totalTime = 0;
        
        for (const agent of this.agents) {
            const start = agent.getPosition();
            let result;
            
            // Algoritmni tanlash
            if (this.currentAlgorithm === 'bfs') {
                result = this.algorithms.bfs(start, target);
            } else if (this.currentAlgorithm === 'dijkstra') {
                result = this.algorithms.dijkstra(start, target);
            }
            
            if (result && result.found) {
                agent.setPath(result.path);
                totalPathLength = Math.max(totalPathLength, result.pathLength);
            }
            
            if (result) {
                totalExplored = Math.max(totalExplored, result.nodesExplored);
                totalTime = Math.max(totalTime, result.time);
            }
        }
        
        this.lastStats = {
            nodesExplored: totalExplored,
            pathLength: totalPathLength,
            time: totalTime
        };
    }

    /**
     * Barcha agentlarni yangilaydi
     */
    update() {
        for (const agent of this.agents) {
            agent.update();
        }
    }

    /**
     * Barcha agentlarni markazga qaytaradi
     */
    resetAgents() {
        const centerX = Math.floor(this.grid.cols / 2);
        const centerY = Math.floor(this.grid.rows / 2);
        
        for (let i = 0; i < this.agents.length; i++) {
            const offsetX = (i % 3) - 1;
            const offsetY = Math.floor(i / 3) - 1;
            
            let x = centerX + offsetX;
            let y = centerY + offsetY;
            
            if (!this.grid.isWalkable(x, y)) {
                x = centerX;
                y = centerY;
            }
            
            this.agents[i].reset(x, y);
        }
        
        this.grid.clearVisualization();
    }

    /**
     * Barcha agentlar uchun harakat tezligini o'rnatadi
     * @param {number} speed - Tezlik qiymati (1-10)
     */
    setSpeed(speed) {
        // 1-10 shkalasini haqiqiy harakat tezligiga o'zgartirish
        const actualSpeed = 0.05 + (speed / 10) * 0.2;
        
        for (const agent of this.agents) {
            agent.setSpeed(actualSpeed);
        }
    }

    /**
     * Barcha agentlarning pozitsiyalarini oladi (to'siqlardan qochish uchun)
     * @returns {Array<Object>} Pozitsiyalar massivi
     */
    getAgentPositions() {
        return this.agents.map(agent => agent.getPosition());
    }

    /**
     * Oxirgi yo'l topish statistikasini oladi
     * @returns {Object} Statistika obyekti
     */
    getStats() {
        return this.lastStats;
    }
}

// Boshqa modullarda ishlatish uchun eksport
window.Agent = Agent;
window.AgentManager = AgentManager;
