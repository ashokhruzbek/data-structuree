/**
 * ===========================================
 * ALGORITMLAR MODULI
 * ===========================================
 * 
 * Bu modul yo'l topish algoritmlarini amalga oshiradi:
 * 1. Kenglik Bo'yicha Qidiruv (BFS) - Og'irliksiz graflarda eng qisqa yo'lni topadi
 * 2. Chuqurlik Bo'yicha Qidiruv (DFS) - Chuqurga kirib, keyin qaytadi
 * 3. Dijkstra Algoritmi - Og'irlikli graflarda eng qisqa yo'lni topadi
 * 4. Prim Algoritmi - Minimal Qamrab Oluvchi Daraxt (MST) quradi
 * 
 * Har bir algoritm vizualizatsiya uchun qadam-baqadam
 * tekshirish kuzatuvini o'z ichiga oladi.
 */

class Algorithms {
    /**
     * Grid bilan bog'langan Algorithms obyektini yaratadi
     * @param {Grid} grid - Algoritmlar bajariladigan grid
     */
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * ===========================================
     * KENGLIK BO'YICHA QIDIRUV (BFS)
     * ===========================================
     * 
     * BFS joriy chuqurlik darajasidagi barcha qo'shnilarni
     * keyingi chuqurlik darajasidagi tugunlarga o'tishdan oldin tekshiradi.
     * Bu og'irliksiz graflarda eng qisqa yo'lni kafolatlaydi.
     * 
     * Algoritm Bosqichlari:
     * 1. Boshlang'ich tugundan boshlash
     * 2. Boshlang'ich tugunni navbatga qo'shish va tashrif etilgan deb belgilash
     * 3. Navbat bo'sh bo'lmaguncha:
     *    a. Navbat oldidan tugunni olish
     *    b. Agar bu maqsad bo'lsa, yo'lni qayta tiklash
     *    c. Har bir tashrif etilmagan qo'shni uchun:
     *       - Tashrif etilgan deb belgilash
     *       - Ota-onani saqlash (yo'lni qayta tiklash uchun)
     *       - Navbatga qo'shish
     * 
     * Vaqt Murakkabligi: O(V + E) bu yerda V = tugunlar, E = qirralar
     * Xotira Murakkabligi: O(V) navbat va tashrif etilgan to'plam uchun
     * 
     * @param {Object} start - Boshlang'ich pozitsiya {x, y}
     * @param {Object} target - Maqsad pozitsiya {x, y}
     * @returns {Object} Yo'l, tekshirilgan tugunlar va statistikani o'z ichiga olgan natija
     */
    bfs(start, target) {
        const startTime = performance.now();
        
        // Oldingi vizualizatsiya ma'lumotlarini tozalash
        this.grid.clearVisualization();

        // BFS uchun navbat - tekshirish kerak bo'lgan pozitsiyalarni saqlaydi (FIFO tartibi)
        const queue = [];
        
        // Tashrif etilgan tugunlarni kuzatish uchun to'plam (qayta tashrif etishni oldini oladi)
        const visited = new Set();
        
        // Har bir tugunning ota-onasini saqlash uchun Map (yo'lni qayta tiklash uchun)
        const parent = new Map();
        
        // Qadam-baqadam vizualizatsiya uchun tekshirish tartibini kuzatish
        const explorationOrder = [];

        // Boshlang'ich pozitsiya bilan ishga tushirish
        const startKey = Grid.positionKey(start.x, start.y);
        queue.push(start);
        visited.add(startKey);
        parent.set(startKey, null); // Boshlang'ichning ota-onasi yo'q

        // BFS asosiy sikli
        while (queue.length > 0) {
            // Navbat oldidan elementni olish (FIFO)
            const current = queue.shift();
            const currentKey = Grid.positionKey(current.x, current.y);

            // Vizualizatsiya uchun tekshirishni qayd etish
            explorationOrder.push({ ...current });
            this.grid.markExplored(current.x, current.y);

            // Maqsadga yetib keldikmi tekshirish
            if (current.x === target.x && current.y === target.y) {
                const path = this.reconstructPath(parent, target);
                const endTime = performance.now();
                
                this.grid.setPath(path);
                
                return {
                    path: path,
                    explored: explorationOrder,
                    nodesExplored: explorationOrder.length,
                    pathLength: path.length,
                    time: endTime - startTime,
                    found: true
                };
            }

            // Barcha to'g'ri qo'shnilarni tekshirish
            const neighbors = this.grid.getNeighbors(current.x, current.y);
            
            for (const neighbor of neighbors) {
                const neighborKey = Grid.positionKey(neighbor.x, neighbor.y);

                // Faqat tashrif etilmagan qo'shnilarni qayta ishlash
                if (!visited.has(neighborKey)) {
                    visited.add(neighborKey);
                    parent.set(neighborKey, currentKey);
                    queue.push(neighbor);
                }
            }
        }

        // Yo'l topilmadi
        const endTime = performance.now();
        return {
            path: [],
            explored: explorationOrder,
            nodesExplored: explorationOrder.length,
            pathLength: 0,
            time: endTime - startTime,
            found: false
        };
    }

    /**
     * ===========================================
     * CHUQURLIK BO'YICHA QIDIRUV (DFS)
     * ===========================================
     * 
     * DFS bir yo'nalishda iloji boricha chuqurga kirib ketadi,
     * keyin orqaga qaytib boshqa yo'nalishlarni tekshiradi.
     * Bu eng qisqa yo'lni KAFOLATLAMAYDI, lekin ba'zi holatlarda foydali.
     * 
     * Algoritm Bosqichlari:
     * 1. Boshlang'ich tugundan boshlash
     * 2. Boshlang'ich tugunni stekga qo'shish
     * 3. Stek bo'sh bo'lmaguncha:
     *    a. Stek oxiridan tugunni olish (LIFO)
     *    b. Agar tashrif etilmagan bo'lsa:
     *       - Tashrif etilgan deb belgilash
     *       - Agar maqsad bo'lsa, yo'lni qayta tiklash
     *       - Barcha qo'shnilarni stekga qo'shish
     * 
     * Vaqt Murakkabligi: O(V + E)
     * Xotira Murakkabligi: O(V)
     * 
     * Xususiyatlari:
     * - Chuqurroq kirib ketadi
     * - Yo'li ba'zan aylanma (uzunroq) bo'ladi
     * - Labirintlarda foydali
     * 
     * @param {Object} start - Boshlang'ich pozitsiya {x, y}
     * @param {Object} target - Maqsad pozitsiya {x, y}
     * @returns {Object} Yo'l, tekshirilgan tugunlar va statistikani o'z ichiga olgan natija
     */
    dfs(start, target) {
        const startTime = performance.now();
        
        // Oldingi vizualizatsiya ma'lumotlarini tozalash
        this.grid.clearVisualization();

        // DFS uchun stek - tekshirish kerak bo'lgan pozitsiyalarni saqlaydi (LIFO tartibi)
        const stack = [];
        
        // Tashrif etilgan tugunlarni kuzatish uchun to'plam
        const visited = new Set();
        
        // Har bir tugunning ota-onasini saqlash uchun Map (yo'lni qayta tiklash uchun)
        const parent = new Map();
        
        // Qadam-baqadam vizualizatsiya uchun tekshirish tartibini kuzatish
        const explorationOrder = [];

        // Boshlang'ich pozitsiya bilan ishga tushirish
        const startKey = Grid.positionKey(start.x, start.y);
        stack.push(start);
        parent.set(startKey, null);

        // DFS asosiy sikli
        while (stack.length > 0) {
            // Stek oxiridan elementni olish (LIFO - Last In First Out)
            const current = stack.pop();
            const currentKey = Grid.positionKey(current.x, current.y);

            // Agar allaqachon tashrif etilgan bo'lsa, o'tkazib yuborish
            if (visited.has(currentKey)) {
                continue;
            }

            // Tashrif etilgan deb belgilash
            visited.add(currentKey);

            // Vizualizatsiya uchun tekshirishni qayd etish
            explorationOrder.push({ ...current });
            this.grid.markExplored(current.x, current.y);

            // Maqsadga yetib keldikmi tekshirish
            if (current.x === target.x && current.y === target.y) {
                const path = this.reconstructPath(parent, target);
                const endTime = performance.now();
                
                this.grid.setPath(path);
                
                return {
                    path: path,
                    explored: explorationOrder,
                    nodesExplored: explorationOrder.length,
                    pathLength: path.length,
                    time: endTime - startTime,
                    found: true
                };
            }

            // Barcha qo'shnilarni stekga qo'shish (teskari tartibda)
            const neighbors = this.grid.getNeighbors(current.x, current.y);
            
            // Qo'shnilarni teskari tartibda qo'shish
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const neighbor = neighbors[i];
                const neighborKey = Grid.positionKey(neighbor.x, neighbor.y);

                // Faqat tashrif etilmagan qo'shnilarni qo'shish
                if (!visited.has(neighborKey)) {
                    if (!parent.has(neighborKey)) {
                        parent.set(neighborKey, currentKey);
                    }
                    stack.push(neighbor);
                }
            }
        }

        // Yo'l topilmadi (DFS)
        const endTime = performance.now();
        return {
            path: [],
            explored: explorationOrder,
            nodesExplored: explorationOrder.length,
            pathLength: 0,
            time: endTime - startTime,
            found: false
        };
    }

    /**
     * ===========================================
     * DIJKSTRA ALGORITMI
     * ===========================================
     * 
     * Dijkstra algoritmi og'irlikli graflarda eng qisqa yo'lni topadi.
     * Bizning gridimizda turli harakatlar uchun turli og'irliklar ishlatamiz:
     * - Gorizontal/Vertikal harakatlar: og'irlik = 1
     * - Diagonal harakatlar: og'irlik = √2 ≈ 1.414 (agar yoqilgan bo'lsa)
     * 
     * Bu diagonal yorliqlar to'g'ri hisobga olinadigan
     * yanada real yo'l topish xatti-harakatini yaratadi.
     * 
     * Algoritm Bosqichlari:
     * 1. Masofalarni ishga tushirish: boshlang'ich = 0, boshqalari = cheksizlik
     * 2. Har doim eng yaqin tugunni qayta ishlash uchun ustuvor navbatdan foydalanish
     * 3. Har bir qo'shni uchun, agar qisqaroq yo'l topilsa:
     *    - Masofani yangilash
     *    - Ota-onani yangilash
     *    - Ustuvor navbatga qo'shish
     * 
     * Vaqt Murakkabligi: O((V + E) log V) ustuvor navbat bilan
     * Xotira Murakkabligi: O(V)
     * 
     * @param {Object} start - Boshlang'ich pozitsiya {x, y}
     * @param {Object} target - Maqsad pozitsiya {x, y}
     * @returns {Object} Yo'l, tekshirilgan tugunlar va statistikani o'z ichiga olgan natija
     */
    dijkstra(start, target) {
        const startTime = performance.now();
        
        // Oldingi vizualizatsiyani tozalash
        this.grid.clearVisualization();

        // Massiv yordamida Ustuvor Navbat amalga oshirilishi (soddalik uchun)
        // Ishlab chiqarishda yaxshiroq ishlash uchun to'g'ri min-heap ishlatish kerak
        const pq = new MinPriorityQueue();
        
        // Masofa xaritasi: har bir tugunga ma'lum bo'lgan eng qisqa masofani saqlaydi
        const distance = new Map();
        
        // Yo'lni qayta tiklash uchun ota-ona xaritasi
        const parent = new Map();
        
        // Qayta ishlangan tugunlarni kuzatish uchun to'plam
        const processed = new Set();
        
        // Vizualizatsiya uchun tekshirish tartibini kuzatish
        const explorationOrder = [];

        // Boshlang'ich pozitsiyani ishga tushirish
        const startKey = Grid.positionKey(start.x, start.y);
        distance.set(startKey, 0);
        parent.set(startKey, null);
        pq.enqueue(start, 0);

        // Dijkstra asosiy sikli
        while (!pq.isEmpty()) {
            // Eng kichik masofali tugunni olish
            const { element: current, priority: currentDist } = pq.dequeue();
            const currentKey = Grid.positionKey(current.x, current.y);

            // Agar allaqachon qayta ishlangan bo'lsa o'tkazib yuborish (dangasa o'chirish bilan bo'lishi mumkin)
            if (processed.has(currentKey)) continue;
            processed.add(currentKey);

            // Vizualizatsiya uchun tekshirishni qayd etish
            explorationOrder.push({ ...current });
            this.grid.markExplored(current.x, current.y);

            // Maqsadga yetib keldikmi tekshirish
            if (current.x === target.x && current.y === target.y) {
                const path = this.reconstructPath(parent, target);
                const endTime = performance.now();
                
                this.grid.setPath(path);
                
                return {
                    path: path,
                    explored: explorationOrder,
                    nodesExplored: explorationOrder.length,
                    pathLength: path.length,
                    time: endTime - startTime,
                    found: true
                };
            }

            // Og'irlikli qirralar bilan qo'shnilarni qayta ishlash
            const neighbors = this.grid.getNeighbors(current.x, current.y);
            
            for (const neighbor of neighbors) {
                const neighborKey = Grid.positionKey(neighbor.x, neighbor.y);

                // Allaqachon qayta ishlangan tugunlarni o'tkazib yuborish
                if (processed.has(neighborKey)) continue;

                // Qirra og'irligini hisoblash
                // Diagonal harakatlar √2 og'irlikka ega bo'lardi, lekin biz 4-yo'nalishli ishlatamiz
                // Yanada qiziqarli vizualizatsiya uchun biroz o'zgarish qo'shish
                const dx = Math.abs(neighbor.x - current.x);
                const dy = Math.abs(neighbor.y - current.y);
                const edgeWeight = dx + dy === 2 ? 1.414 : 1.0;

                // Yangi masofani hisoblash
                const newDist = currentDist + edgeWeight;

                // Qisqaroq yo'l topilsa yangilash
                const knownDist = distance.get(neighborKey) ?? Infinity;
                if (newDist < knownDist) {
                    distance.set(neighborKey, newDist);
                    parent.set(neighborKey, currentKey);
                    pq.enqueue(neighbor, newDist);
                }
            }
        }

        // Yo'l topilmadi
        const endTime = performance.now();
        return {
            path: [],
            explored: explorationOrder,
            nodesExplored: explorationOrder.length,
            pathLength: 0,
            time: endTime - startTime,
            found: false
        };
    }

    /**
     * ===========================================
     * PRIM ALGORITMI (Minimal Qamrab Oluvchi Daraxt)
     * ===========================================
     * 
     * Prim algoritmi barcha o'tish mumkin bo'lgan kataklarni
     * minimal umumiy qirra og'irligi bilan bog'laydigan
     * Minimal Qamrab Oluvchi Daraxt (MST) quradi.
     * 
     * Yo'l topish algoritmlaridan farqli o'laroq, Prim ikki nuqta
     * orasidagi yo'lni topmaydi. Buning o'rniga u quyidagi daraxtni yaratadi:
     * - Barcha yetib boriladigan tugunlarni bog'laydi
     * - Umumiy qirra og'irligini minimallashtiradi
     * - Sikllar yo'q
     * 
     * Algoritm Bosqichlari:
     * 1. Boshlang'ich tugundan boshlash
     * 2. Boshlang'ich tugundan barcha qirralarni ustuvor navbatga qo'shish
     * 3. Tashrif etilmagan tugunlar mavjud ekan:
     *    a. Tashrif etilmagan tugunga minimal og'irlikli qirrani olish
     *    b. Tugunni MST ga qo'shish
     *    c. Yangi tugundan barcha qirralarni navbatga qo'shish
     * 
     * Vaqt Murakkabligi: O(E log V) ustuvor navbat bilan
     * Xotira Murakkabligi: O(V + E)
     * 
     * @param {Object} start - Boshlang'ich pozitsiya {x, y}
     * @returns {Object} MST qirralari va statistikani o'z ichiga olgan natija
     */
    prim(start) {
        const startTime = performance.now();
        
        // Oldingi vizualizatsiyani tozalash
        this.grid.clearVisualization();

        // Qirralar uchun ustuvor navbat
        const pq = new MinPriorityQueue();
        
        // MST dagi tugunlarni kuzatish uchun to'plam
        const inMST = new Set();
        
        // Vizualizatsiya uchun MST qirralarini saqlash massivi
        const mstEdges = [];
        
        // Tekshirish tartibini kuzatish
        const explorationOrder = [];

        // Boshlang'ich tugun bilan boshlash
        const startKey = Grid.positionKey(start.x, start.y);
        inMST.add(startKey);
        explorationOrder.push({ ...start });
        this.grid.markExplored(start.x, start.y);

        // Boshlang'ich tugundan barcha qirralarni ustuvor navbatga qo'shish
        const startNeighbors = this.grid.getNeighbors(start.x, start.y);
        for (const neighbor of startNeighbors) {
            const edge = {
                from: { ...start },
                to: { ...neighbor },
                weight: 1 // Grid qirralari uchun bir xil og'irlik
            };
            pq.enqueue(edge, edge.weight);
        }

        // Prim asosiy sikli
        while (!pq.isEmpty()) {
            // Minimal og'irlikli qirrani olish
            const { element: edge } = pq.dequeue();
            const toKey = Grid.positionKey(edge.to.x, edge.to.y);

            // Agar manzil allaqachon MST da bo'lsa o'tkazib yuborish
            if (inMST.has(toKey)) continue;

            // MST ga qo'shish
            inMST.add(toKey);
            mstEdges.push(edge);
            explorationOrder.push({ ...edge.to });
            this.grid.markExplored(edge.to.x, edge.to.y);

            // Yangi tugundan barcha qirralarni navbatga qo'shish
            const neighbors = this.grid.getNeighbors(edge.to.x, edge.to.y);
            for (const neighbor of neighbors) {
                const neighborKey = Grid.positionKey(neighbor.x, neighbor.y);
                
                if (!inMST.has(neighborKey)) {
                    const newEdge = {
                        from: { ...edge.to },
                        to: { ...neighbor },
                        weight: 1
                    };
                    pq.enqueue(newEdge, newEdge.weight);
                }
            }
        }

        const endTime = performance.now();
        
        // Vizualizatsiya uchun MST qirralarini saqlash
        this.grid.setMSTEdges(mstEdges);
        
        return {
            edges: mstEdges,
            explored: explorationOrder,
            nodesExplored: explorationOrder.length,
            edgeCount: mstEdges.length,
            time: endTime - startTime
        };
    }

    /**
     * Ota-ona xaritasidan foydalanib maqsaddan boshlang'ichga yo'lni qayta tiklaydi
     * @param {Map} parent - Pozitsiya kalitlaridan ota-ona kalitlariga Map
     * @param {Object} target - Maqsad pozitsiya {x, y}
     * @returns {Array<Object>} Boshlang'ichdan maqsadga yo'l
     */
    reconstructPath(parent, target) {
        const path = [];
        let currentKey = Grid.positionKey(target.x, target.y);

        // Maqsaddan boshlang'ichga orqaga kuzatish
        while (currentKey !== null) {
            const pos = Grid.parsePositionKey(currentKey);
            path.unshift(pos); // Massiv boshiga qo'shish
            currentKey = parent.get(currentKey);
        }

        return path;
    }
}

/**
 * ===========================================
 * MIN USTUVOR NAVBAT (Yordamchi Klass)
 * ===========================================
 * 
 * Dijkstra va Prim algoritmlari uchun oddiy ustuvor navbat amalga oshirilishi.
 * O(log n) enqueue va dequeue operatsiyalari uchun binary heap ishlatadi.
 */
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    /**
     * Tugunning ota-ona indeksini qaytaradi
     */
    parentIndex(i) {
        return Math.floor((i - 1) / 2);
    }

    /**
     * Returns the left child index of a node
     */
    leftChildIndex(i) {
        return 2 * i + 1;
    }

    /**
     * Returns the right child index of a node
     */
    rightChildIndex(i) {
        return 2 * i + 2;
    }

    /**
     * Swaps two elements in the heap
     */
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    /**
     * Adds an element with given priority
     * @param {*} element - The element to add
     * @param {number} priority - The priority (lower = higher priority)
     */
    enqueue(element, priority) {
        this.heap.push({ element, priority });
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the element with highest priority (lowest value)
     * @returns {Object} Object containing element and priority
     */
    dequeue() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);

        return min;
    }

    /**
     * Moves an element up to maintain heap property
     */
    bubbleUp(index) {
        while (index > 0) {
            const parent = this.parentIndex(index);
            if (this.heap[parent].priority <= this.heap[index].priority) break;
            this.swap(parent, index);
            index = parent;
        }
    }

    /**
     * Moves an element down to maintain heap property
     */
    bubbleDown(index) {
        const length = this.heap.length;
        
        while (true) {
            const left = this.leftChildIndex(index);
            const right = this.rightChildIndex(index);
            let smallest = index;

            if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }

            if (smallest === index) break;
            
            this.swap(index, smallest);
            index = smallest;
        }
    }

    /**
     * Checks if the queue is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.heap.length === 0;
    }

    /**
     * Returns the number of elements in the queue
     * @returns {number}
     */
    size() {
        return this.heap.length;
    }
}

// Export for use in other modules
window.Algorithms = Algorithms;
window.MinPriorityQueue = MinPriorityQueue;
