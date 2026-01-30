/**
 * ===========================================
 * GRID MODULI
 * ===========================================
 * 
 * Bu modul grid (to'r) ko'rinishi va boshqarishni amalga oshiradi.
 * Grid - bu 2D massiv bo'lib, har bir katak quyidagi qiymatlarni olishi mumkin:
 * - 0: Bo'sh (o'tish mumkin)
 * - 1: To'siq (o'tib bo'lmaydi)
 * 
 * Grid yo'l topish algoritmlari uchun asos bo'lib xizmat qiladi.
 */

class Grid {
    /**
     * Yangi Grid obyektini yaratadi
     * @param {number} cols - Griddagi ustunlar soni
     * @param {number} rows - Griddagi qatorlar soni
     * @param {number} cellSize - Har bir katak o'lchami pikselda
     */
    constructor(cols, rows, cellSize) {
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;
        
        // Gridni barcha bo'sh kataklar (0) bilan ishga tushirish
        this.cells = this.createEmptyGrid();
        
        // Vizualizatsiya uchun tekshirilgan tugunlarni kuzatish
        this.exploredNodes = new Set();
        
        // Vizualizatsiya uchun joriy yo'lni saqlash
        this.currentPath = [];
        
        // Prim algoritmi vizualizatsiyasi uchun MST qirralarini saqlash
        this.mstEdges = [];
    }

    /**
     * Nollar bilan to'ldirilgan bo'sh grid yaratadi
     * @returns {Array<Array<number>>} Nollardan iborat 2D massiv
     */
    createEmptyGrid() {
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                grid[row][col] = 0; // 0 = bo'sh katak
            }
        }
        return grid;
    }

    /**
     * Griddagi barcha to'siqlarni tozalaydi
     */
    clearObstacles() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = 0;
            }
        }
        this.clearVisualization();
    }

    /**
     * Vizualizatsiya ma'lumotlarini tozalaydi (tekshirilgan tugunlar, yo'l, MST)
     */
    clearVisualization() {
        this.exploredNodes.clear();
        this.currentPath = [];
        this.mstEdges = [];
    }

    /**
     * Gridda tasodifiy to'siqlarni hosil qiladi
     * @param {number} density - Katakda to'siq bo'lish ehtimolligi (0-1)
     * @param {Array<Object>} agentPositions - Saqlanishi kerak bo'lgan agent pozitsiyalari massivi
     */
    generateRandomObstacles(density = 0.25, agentPositions = []) {
        this.clearObstacles();
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Agent pozitsiyalarida to'siq qo'ymaslik
                const isAgentPosition = agentPositions.some(
                    pos => pos.x === col && pos.y === row
                );
                
                if (!isAgentPosition && Math.random() < density) {
                    this.cells[row][col] = 1; // 1 = to'siq
                }
            }
        }
    }

    /**
     * Belgilangan grid pozitsiyasida to'siqni almashtiradi
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     */
    toggleObstacle(col, row) {
        if (this.isValidCell(col, row)) {
            this.cells[row][col] = this.cells[row][col] === 0 ? 1 : 0;
        }
    }

    /**
     * Belgilangan grid pozitsiyasida to'siq o'rnatadi
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @param {boolean} isObstacle - To'siq qo'yish yoki olib tashlash
     */
    setObstacle(col, row, isObstacle) {
        if (this.isValidCell(col, row)) {
            this.cells[row][col] = isObstacle ? 1 : 0;
        }
    }

    /**
     * Katak to'siq ekanligini tekshiradi
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @returns {boolean} Agar katak to'siq bo'lsa true
     */
    isObstacle(col, row) {
        if (!this.isValidCell(col, row)) return true; // Chegaradan tashqarini to'siq deb hisoblash
        return this.cells[row][col] === 1;
    }

    /**
     * Katak koordinatalari grid chegarasida ekanligini tekshiradi
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @returns {boolean} Agar koordinatalar to'g'ri bo'lsa true
     */
    isValidCell(col, row) {
        return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
    }

    /**
     * Katak o'tish mumkinligini tekshiradi (to'siq emas)
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @returns {boolean} Agar katakdan o'tish mumkin bo'lsa true
     */
    isWalkable(col, row) {
        return this.isValidCell(col, row) && !this.isObstacle(col, row);
    }

    /**
     * Katakning barcha to'g'ri qo'shnilarini oladi (4 yo'nalish: yuqori, pastki, chap, o'ng)
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @returns {Array<Object>} Qo'shni pozitsiyalari massivi {x, y}
     */
    getNeighbors(col, row) {
        const neighbors = [];
        
        // 4 yo'nalishli harakat: yuqori, o'ng, pastki, chap
        const directions = [
            { dx: 0, dy: -1 },  // Yuqori
            { dx: 1, dy: 0 },   // O'ng
            { dx: 0, dy: 1 },   // Pastki
            { dx: -1, dy: 0 }   // Chap
        ];

        for (const dir of directions) {
            const newCol = col + dir.dx;
            const newRow = row + dir.dy;

            if (this.isWalkable(newCol, newRow)) {
                neighbors.push({ x: newCol, y: newRow });
            }
        }

        return neighbors;
    }

    /**
     * Diagonal qo'shnilarni ham oladi (8 yo'nalish)
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @returns {Array<Object>} Qo'shni pozitsiyalari massivi {x, y}
     */
    getNeighbors8(col, row) {
        const neighbors = [];
        
        // 8 yo'nalishli harakat
        const directions = [
            { dx: 0, dy: -1 },   // Yuqori
            { dx: 1, dy: -1 },   // Yuqori-O'ng
            { dx: 1, dy: 0 },    // O'ng
            { dx: 1, dy: 1 },    // Pastki-O'ng
            { dx: 0, dy: 1 },    // Pastki
            { dx: -1, dy: 1 },   // Pastki-Chap
            { dx: -1, dy: 0 },   // Chap
            { dx: -1, dy: -1 }   // Yuqori-Chap
        ];

        for (const dir of directions) {
            const newCol = col + dir.dx;
            const newRow = row + dir.dy;

            if (this.isWalkable(newCol, newRow)) {
                neighbors.push({ x: newCol, y: newRow });
            }
        }

        return neighbors;
    }

    /**
     * Piksel koordinatalarini grid koordinatalariga o'zgartiradi
     * @param {number} pixelX - Pikseldagi X koordinata
     * @param {number} pixelY - Pikseldagi Y koordinata
     * @returns {Object} Grid koordinatalari {x, y}
     */
    pixelToGrid(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / this.cellSize),
            y: Math.floor(pixelY / this.cellSize)
        };
    }

    /**
     * Grid koordinatalarini piksel koordinatalariga o'zgartiradi (katak markazi)
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @returns {Object} Katak markazidagi piksel koordinatalari {x, y}
     */
    gridToPixel(col, row) {
        return {
            x: col * this.cellSize + this.cellSize / 2,
            y: row * this.cellSize + this.cellSize / 2
        };
    }

    /**
     * Katak pozitsiyasi uchun noyob kalit yaratadi (Set va Map uchun ishlatiladi)
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @returns {string} Noyob string kalit
     */
    static positionKey(col, row) {
        return `${col},${row}`;
    }

    /**
     * Pozitsiya kalitini koordinatalarga qaytaradi
     * @param {string} key - Pozitsiya kalit stringi
     * @returns {Object} Koordinatalar {x, y}
     */
    static parsePositionKey(key) {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
    }

    /**
     * Tugunni tekshirilgan deb belgilaydi (vizualizatsiya uchun)
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     */
    markExplored(col, row) {
        this.exploredNodes.add(Grid.positionKey(col, row));
    }

    /**
     * Tugun tekshirilganligini tekshiradi
     * @param {number} col - Ustun indeksi
     * @param {number} row - Qator indeksi
     * @returns {boolean} Agar tugun tekshirilgan bo'lsa true
     */
    isExplored(col, row) {
        return this.exploredNodes.has(Grid.positionKey(col, row));
    }

    /**
     * Vizualizatsiya uchun joriy yo'lni o'rnatadi
     * @param {Array<Object>} path - Pozitsiyalar massivi {x, y}
     */
    setPath(path) {
        this.currentPath = path;
    }

    /**
     * Prim algoritmi vizualizatsiyasi uchun MST qirralarini o'rnatadi
     * @param {Array<Object>} edges - Qirra obyektlari massivi {from: {x, y}, to: {x, y}}
     */
    setMSTEdges(edges) {
        this.mstEdges = edges;
    }

    /**
     * Griddagi barcha o'tish mumkin bo'lgan kataklarni oladi
     * @returns {Array<Object>} O'tish mumkin bo'lgan katak pozitsiyalari massivi {x, y}
     */
    getAllWalkableCells() {
        const cells = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.isWalkable(col, row)) {
                    cells.push({ x: col, y: row });
                }
            }
        }
        return cells;
    }
}

// Boshqa modullarda ishlatish uchun eksport
window.Grid = Grid;
