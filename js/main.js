/**
 * ===========================================
 * ASOSIY ILOVA MODULI
 * ===========================================
 * 
 * Bu ilovaning asosiy kirish nuqtasi.
 * U barcha komponentlarni ishga tushiradi va foydalanuvchi
 * interaksiyalarini boshqaradi.
 * 
 * Ilova oqimi:
 * 1. Grid, vizualizator va agent menejerni ishga tushirish
 * 2. Foydalanuvchi boshqaruvlari uchun hodisa tinglovchilarni o'rnatish
 * 3. Asosiy o'yin tsiklini ishga tushirish (yangilash → chizish → takrorlash)
 */

// Global ilova holati
let app = null;

/**
 * Asosiy Ilova Klassi
 * Vizualizatsiyaning barcha komponentlarini muvofiqlashtiradi
 */
class PathfindingApp {
    constructor() {
        // Canvas elementini olish
        this.canvas = document.getElementById('grid-canvas');
        
        // Grid konfiguratsiyasi
        this.cellSize = 20;
        this.cols = 40;
        this.rows = 25;
        
        // Ekran kengligi asosida grid o'lchamini sozlash
        this.adjustGridSize();
        
        // Asosiy komponentlarni ishga tushirish
        this.grid = new Grid(this.cols, this.rows, this.cellSize);
        this.visualizer = new Visualizer(this.canvas, this.grid);
        this.agentManager = new AgentManager(this.grid);
        
        // Boshlang'ich agentlarni yaratish
        this.agentManager.createAgents(1);
        
        // Sichqoncha holati
        this.mouseDown = false;
        this.lastMouseCell = { x: -1, y: -1 };
        this.isAddingObstacle = true;
        
        // Maqsad pozitsiyasi (sichqoncha kursori)
        this.targetPosition = { x: -1, y: -1 };
        
        // Animatsiya holati
        this.isRunning = true;
        this.pathfindingCooldown = 0;
        this.pathfindingInterval = 100; // yo'l topish yangilanishlari orasidagi ms
        
        // Ma'lumot paneli uchun algoritm tavsiflari
        this.algorithmDescriptions = {
            bfs: {
                title: '📚 Kenglik Bo\'yicha Qidiruv (BFS)',
                content: `
                    <p><strong>Qanday ishlaydi:</strong> BFS joriy chuqurlikdagi barcha qo'shnilarni ko'rib chiqadi, keyin keyingi chuqurlik darajasidagi tugunlarga o'tadi. Keyingi qaysi tugunga tashrif buyurishni kuzatish uchun navbat (FIFO) ishlatadi.</p>
                    <p><strong>Xususiyatlari:</strong></p>
                    <ul>
                        <li>Og'irliksiz graflarda eng qisqa yo'lni kafolatlaydi</li>
                        <li>Tugunlarni qatma-qat ko'rib chiqadi (suvdagi to'lqinlar kabi)</li>
                        <li>Vaqt murakkabligi: O(V + E)</li>
                        <li>Xotira murakkabligi: O(V)</li>
                    </ul>
                    <p><strong>Eng yaxshi qo'llaniladi:</strong> Barcha qirralar teng og'irlikka ega bo'lganda eng qisqa yo'lni topish.</p>
                `
            },
            dijkstra: {
                title: '📐 Dijkstra Algoritmi',
                content: `
                    <p><strong>Qanday ishlaydi:</strong> Dijkstra algoritmi og'irlikli graflarda eng qisqa yo'lni topadi. U har doim eng kichik ma'lum masofaga ega tugunni birinchi qayta ishlaydi, ustuvorlik navbatidan foydalanadi.</p>
                    <p><strong>Xususiyatlari:</strong></p>
                    <ul>
                        <li>Og'irlikli graflarda eng qisqa yo'lni kafolatlaydi</li>
                        <li>Tugunlarni boshlanish nuqtasidan masofa tartibida ko'rib chiqadi</li>
                        <li>Vaqt murakkabligi: O((V + E) log V)</li>
                        <li>Manfiy qirra og'irliklarini bajara olmaydi</li>
                    </ul>
                    <p><strong>Eng yaxshi qo'llaniladi:</strong> Qirralar turli xarajatlarga ega bo'lgan og'irlikli graflar.</p>
                `
            },
            prim: {
                title: '🌳 Prim Algoritmi (MST)',
                content: `
                    <p><strong>Qanday ishlaydi:</strong> Prim algoritmi Minimal Yoyilgan Daraxt (MST) quradi, o'sib borayotgan daraxtga yangi cho'qqini ulaydigan eng arzon qirrani takroriy qo'shish orqali.</p>
                    <p><strong>Xususiyatlari:</strong></p>
                    <ul>
                        <li>BARCHA yetib boriladigan tugunlarni ulaydigan daraxt yaratadi</li>
                        <li>Umumiy qirra og'irligini minimallashtiradi</li>
                        <li>Ikki nuqta orasidagi yo'lni TOPMAYDI</li>
                        <li>Vaqt murakkabligi: O(E log V)</li>
                    </ul>
                    <p><strong>Eng yaxshi qo'llaniladi:</strong> Tarmoq dizayni, klasterlash va yoyilgan daraxt muammolari.</p>
                `
            }
        };
        
        // Hodisa tinglovchilarni ishga tushirish
        this.setupEventListeners();
        
        // Ba'zi boshlang'ich to'siqlarni yaratish
        this.grid.generateRandomObstacles(0.2, this.agentManager.getAgentPositions());
        
        // Asosiy tsiklni boshlash
        this.lastTime = performance.now();
        this.mainLoop();
    }

    /**
     * Mavjud ekran kengligiga qarab grid o'lchamini sozlaydi
     */
    adjustGridSize() {
        const container = document.querySelector('.visualization-container');
        const maxWidth = container ? container.clientWidth - 40 : 800;
        
        // Kenglikka qarab ustunlarni sozlash
        this.cols = Math.min(50, Math.floor(maxWidth / this.cellSize));
        this.rows = Math.min(30, Math.floor((maxWidth * 0.6) / this.cellSize));
        
        // Minimal o'lchamni ta'minlash
        this.cols = Math.max(20, this.cols);
        this.rows = Math.max(15, this.rows);
    }

    /**
     * Foydalanuvchi interaksiyalari uchun barcha hodisa tinglovchilarni o'rnatadi
     */
    setupEventListeners() {
        // Canvas sichqoncha hodisalari
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Mobil uchun teginish hodisalari
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', () => this.handleMouseUp());
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // Algoritm tanlash
        const algorithmSelect = document.getElementById('algorithm-select');
        algorithmSelect.addEventListener('change', (e) => {
            this.agentManager.setAlgorithm(e.target.value);
            this.updateAlgorithmInfo(e.target.value);
            this.grid.clearVisualization();
        });
        
        // Quvlovchi soni slayderi
        const chaserSlider = document.getElementById('chaser-count');
        const chaserDisplay = document.getElementById('chaser-count-display');
        chaserSlider.addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            chaserDisplay.textContent = count;
            this.agentManager.setAgentCount(count);
        });
        
        // Tezlikni boshqarish slayderi
        const speedSlider = document.getElementById('speed-control');
        const speedDisplay = document.getElementById('speed-display');
        speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            speedDisplay.textContent = speed;
            this.agentManager.setSpeed(speed);
        });
        
        // To'siqlarni tozalash tugmasi
        document.getElementById('clear-obstacles').addEventListener('click', () => {
            this.grid.clearObstacles();
        });
        
        // Tasodifiy to'siqlar tugmasi
        document.getElementById('random-obstacles').addEventListener('click', () => {
            this.grid.generateRandomObstacles(0.25, this.agentManager.getAgentPositions());
        });
        
        // Agentlarni qayta tiklash tugmasi
        document.getElementById('reset-agents').addEventListener('click', () => {
            this.agentManager.resetAgents();
        });
        
        // Oyna o'lchamini o'zgartirish
        window.addEventListener('resize', () => {
            this.adjustGridSize();
            // Yangi o'lchamlar bilan gridni qayta yaratish
            this.grid = new Grid(this.cols, this.rows, this.cellSize);
            this.visualizer = new Visualizer(this.canvas, this.grid);
            this.agentManager = new AgentManager(this.grid);
            this.agentManager.createAgents(parseInt(chaserSlider.value));
            this.agentManager.setAlgorithm(algorithmSelect.value);
            this.grid.generateRandomObstacles(0.2, this.agentManager.getAgentPositions());
        });
        
        // Standart algoritm ma'lumoti bilan ishga tushirish
        this.updateAlgorithmInfo('bfs');
    }

    /**
     * Sichqoncha bosilishi hodisasini boshqaradi
     */
    handleMouseDown(e) {
        this.mouseDown = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridPos = this.grid.pixelToGrid(x, y);
        
        // Agent pozitsiyasiga bosilganligini tekshirish
        const agentPositions = this.agentManager.getAgentPositions();
        const isAgentCell = agentPositions.some(
            pos => pos.x === gridPos.x && pos.y === gridPos.y
        );
        
        if (!isAgentCell && this.grid.isValidCell(gridPos.x, gridPos.y)) {
            // To'siq qo'shilayotganmi yoki olib tashlanayotganini aniqlash
            this.isAddingObstacle = !this.grid.isObstacle(gridPos.x, gridPos.y);
            this.grid.setObstacle(gridPos.x, gridPos.y, this.isAddingObstacle);
            this.lastMouseCell = gridPos;
        }
    }

    /**
     * Sichqoncha qo'yib yuborilishi hodisasini boshqaradi
     */
    handleMouseUp() {
        this.mouseDown = false;
        this.lastMouseCell = { x: -1, y: -1 };
    }

    /**
     * Sichqoncha harakati hodisasini boshqaradi
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridPos = this.grid.pixelToGrid(x, y);
        
        // Maqsad pozitsiyasini yangilash
        if (this.grid.isValidCell(gridPos.x, gridPos.y) && 
            !this.grid.isObstacle(gridPos.x, gridPos.y)) {
            this.targetPosition = gridPos;
            this.visualizer.setTarget(gridPos.x, gridPos.y);
        }
        
        // To'siq chizishni boshqarish
        if (this.mouseDown) {
            const agentPositions = this.agentManager.getAgentPositions();
            const isAgentCell = agentPositions.some(
                pos => pos.x === gridPos.x && pos.y === gridPos.y
            );
            
            if (!isAgentCell && 
                this.grid.isValidCell(gridPos.x, gridPos.y) &&
                (gridPos.x !== this.lastMouseCell.x || gridPos.y !== this.lastMouseCell.y)) {
                this.grid.setObstacle(gridPos.x, gridPos.y, this.isAddingObstacle);
                this.lastMouseCell = gridPos;
            }
        }
    }

    /**
     * Teginish boshlash hodisasini boshqaradi
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }

    /**
     * Teginish harakati hodisasini boshqaradi
     */
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }

    /**
     * Algoritm ma'lumot panelini yangilaydi
     */
    updateAlgorithmInfo(algorithm) {
        const infoPanel = document.getElementById('algorithm-info');
        const info = this.algorithmDescriptions[algorithm];
        
        if (info) {
            infoPanel.innerHTML = `
                <h3>${info.title}</h3>
                ${info.content}
            `;
        }
    }

    /**
     * Statistika displeyini yangilaydi
     */
    updateStats() {
        const stats = this.agentManager.getStats();
        
        document.getElementById('nodes-explored').textContent = stats.nodesExplored;
        document.getElementById('path-length').textContent = stats.pathLength;
        document.getElementById('algorithm-time').textContent = `${stats.time.toFixed(2)}ms`;
    }

    /**
     * Asosiy o'yin tsikli
     */
    mainLoop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Yo'l topishni muntazam oraliqda yangilash
        this.pathfindingCooldown -= deltaTime;
        if (this.pathfindingCooldown <= 0) {
            this.pathfindingCooldown = this.pathfindingInterval;
            
            // Maqsad yaroqli bo'lsa yo'llarni yangilash
            if (this.targetPosition.x >= 0 && this.targetPosition.y >= 0) {
                this.agentManager.updatePaths(this.targetPosition);
                this.updateStats();
            }
        }
        
        // Agentlarni yangilash
        this.agentManager.update();
        
        // Hamma narsani chizish
        this.visualizer.render(this.agentManager);
        
        // Tsiklni davom ettirish
        if (this.isRunning) {
            requestAnimationFrame(() => this.mainLoop());
        }
    }

    /**
     * Ilovani to'xtatadi
     */
    stop() {
        this.isRunning = false;
    }
}

// DOM tayyor bo'lganda ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    // Barcha skriptlar yuklanganiga ishonch hosil qilish uchun kichik kechikish
    setTimeout(() => {
        app = new PathfindingApp();
        console.log('🚀 Yo\'l Topish Vizualizatori ishga tushirildi!');
        console.log('📝 Ko\'rsatmalar:');
        console.log('   - Maqsadni o\'rnatish uchun sichqonchangizni harakatlantiring');
        console.log('   - To\'siqlarni qo\'shish/olib tashlash uchun bosib torting');
        console.log('   - Algoritmlar va sozlamalarni o\'zgartirish uchun boshqaruvlardan foydalaning');
    }, 100);
});

// Nosozliklarni tuzatish uchun eksport
window.PathfindingApp = PathfindingApp;
