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
let ilova = null;

/**
 * Asosiy Ilova Klassi
 * Vizualizatsiyaning barcha komponentlarini muvofiqlashtiradi
 */
class YolTopishIlovasi {
    constructor() {
        // Canvas elementini olish
        this.kanvas = document.getElementById('grid-canvas');
        
        // Grid konfiguratsiyasi
        this.katakOlchami = 20;
        this.ustunlar = 40;
        this.qatorlar = 25;
        
        // Ekran kengligi asosida grid o'lchamini sozlash
        this.gridOlchaminiSozla();
        
        // Asosiy komponentlarni ishga tushirish
        this.grid = new Grid(this.ustunlar, this.qatorlar, this.katakOlchami);
        this.vizualizator = new Visualizer(this.kanvas, this.grid);
        this.agentMenejer = new AgentManager(this.grid);
        
        // Boshlang'ich agentlarni yaratish
        this.agentMenejer.createAgents(1);
        
        // Sichqoncha holati
        this.sichqonchaBosilgan = false;
        this.oxirgiSichqonchaKatak = { x: -1, y: -1 };
        this.tosiqQoshilmoqda = true;
        
        // Maqsad pozitsiyasi (sichqoncha kursori)
        this.maqsadPozitsiya = { x: -1, y: -1 };
        
        // Animatsiya holati
        this.ishlamoqda = true;
        this.yolTopishKutish = 0;
        this.yolTopishOraliq = 100; // yo'l topish yangilanishlari orasidagi ms
        
        // Ma'lumot paneli uchun algoritm tavsiflari
        this.algoritmTavsiflari = {
            bfs: {
                sarlavha: '<i class="fas fa-layer-group"></i> Kenglik Bo\'yicha Qidiruv (BFS)',
                mazmun: `
                    <p><strong>Qanday ishlaydi:</strong> BFS joriy chuqurlikdagi barcha qo'shnilarni ko'rib chiqadi, keyin keyingi chuqurlik darajasidagi tugunlarga o'tadi. Navbat (FIFO) ishlatadi.</p>
                    <p><strong>Xususiyatlari:</strong></p>
                    <ul>
                        <li>Eng qisqa yo'lni kafolatlaydi</li>
                        <li>Tugunlarni qatma-qat (qatlam-qatlam) ko'rib chiqadi</li>
                        <li>Suvdagi to'lqinlar kabi kengayadi</li>
                        <li>Vaqt murakkabligi: O(V + E)</li>
                    </ul>
                    <p><strong>Vizual xulqi:</strong> Agentdan kengayib borayotgan doiralarda tugunlar tekshiriladi.</p>
                `
            },
            dfs: {
                sarlavha: '<i class="fas fa-arrow-down-long"></i> Chuqurlik Bo\'yicha Qidiruv (DFS)',
                mazmun: `
                    <p><strong>Qanday ishlaydi:</strong> DFS bir yo'nalishda iloji boricha chuqurga kirib ketadi, keyin orqaga qaytib boshqa yo'nalishlarni tekshiradi. Stek (LIFO) ishlatadi.</p>
                    <p><strong>Xususiyatlari:</strong></p>
                    <ul>
                        <li>Chuqurroq kirib ketadi</li>
                        <li>Yo'li ba'zan aylanma (uzunroq) bo'ladi</li>
                        <li>Eng qisqa yo'lni KAFOLATLAMAYDI</li>
                        <li>Vaqt murakkabligi: O(V + E)</li>
                    </ul>
                    <p><strong>Vizual xulqi:</strong> Agent bir yo'nalishda chuqurga boradi, keyin orqaga qaytadi.</p>
                `
            },
            dijkstra: {
                sarlavha: '<i class="fas fa-route"></i> Dijkstra Algoritmi',
                mazmun: `
                    <p><strong>Qanday ishlaydi:</strong> Dijkstra algoritmi og'irlikli graflarda eng qisqa (eng arzon) yo'lni topadi. Ustuvorlik navbatidan foydalanadi.</p>
                    <p><strong>Xususiyatlari:</strong></p>
                    <ul>
                        <li>Og'irlikli graflarda eng optimal yo'lni kafolatlaydi</li>
                        <li>Eng kichik masofali tugunni birinchi qayta ishlaydi</li>
                        <li>Vaqt murakkabligi: O((V + E) log V)</li>
                        <li>Manfiy og'irliklarni qo'llab-quvvatlamaydi</li>
                    </ul>
                    <p><strong>Vizual xulqi:</strong> Eng arzon yo'l bilan yuradi, optimallik kafolatlanadi.</p>
                `
            },
            prim: {
                sarlavha: '<i class="fas fa-diagram-project"></i> Prim Algoritmi (MST)',
                mazmun: `
                    <p><strong>Qanday ishlaydi:</strong> Prim algoritmi Minimal Qamrab Oluvchi Daraxt (MST) quradi. Bevosita quvlamaydi, balki grafni bog'lab harakat yo'nalishini ko'rsatadi.</p>
                    <p><strong>Xususiyatlari:</strong></p>
                    <ul>
                        <li>BARCHA yetib boriladigan tugunlarni ulaydigan daraxt yaratadi</li>
                        <li>Umumiy qirra og'irligini minimallashtiradi</li>
                        <li>Ikki nuqta orasidagi yo'lni TOPMAYDI</li>
                        <li>Vaqt murakkabligi: O(E log V)</li>
                    </ul>
                    <p><strong>Vizual xulqi:</strong> Tarmoq strukturasini (MST) ko'rsatadi, bevosita quvlamaydi.</p>
                `
            }
        };
        
        // Hodisa tinglovchilarni ishga tushirish
        this.hodisaTinglovchilarniOrnat();
        
        // Ba'zi boshlang'ich to'siqlarni yaratish
        this.grid.generateRandomObstacles(0.2, this.agentMenejer.getAgentPositions());
        
        // Asosiy tsiklni boshlash
        this.oxirgiVaqt = performance.now();
        this.asosiyTsikl();
    }

    /**
     * Mavjud ekran kengligiga qarab grid o'lchamini sozlaydi
     */
    gridOlchaminiSozla() {
        const konteyner = document.querySelector('.visualization-container');
        const maksKenglik = konteyner ? konteyner.clientWidth - 40 : 800;
        
        // Kenglikka qarab ustunlarni sozlash
        this.ustunlar = Math.min(50, Math.floor(maksKenglik / this.katakOlchami));
        this.qatorlar = Math.min(30, Math.floor((maksKenglik * 0.6) / this.katakOlchami));
        
        // Minimal o'lchamni ta'minlash
        this.ustunlar = Math.max(20, this.ustunlar);
        this.qatorlar = Math.max(15, this.qatorlar);
    }

    /**
     * Foydalanuvchi interaksiyalari uchun barcha hodisa tinglovchilarni o'rnatadi
     */
    hodisaTinglovchilarniOrnat() {
        // Canvas sichqoncha hodisalari
        this.kanvas.addEventListener('mousedown', (e) => this.sichqonchaBosildiQaytaIshla(e));
        this.kanvas.addEventListener('mouseup', () => this.sichqonchaQoyildiQaytaIshla());
        this.kanvas.addEventListener('mouseleave', () => this.sichqonchaQoyildiQaytaIshla());
        this.kanvas.addEventListener('mousemove', (e) => this.sichqonchaHarakatQaytaIshla(e));
        
        // Mobil uchun teginish hodisalari
        this.kanvas.addEventListener('touchstart', (e) => this.teginishBoshlashQaytaIshla(e));
        this.kanvas.addEventListener('touchend', () => this.sichqonchaQoyildiQaytaIshla());
        this.kanvas.addEventListener('touchmove', (e) => this.teginishHarakatQaytaIshla(e));
        
        // Algoritm tanlash
        const algoritmTanlash = document.getElementById('algorithm-select');
        algoritmTanlash.addEventListener('change', (e) => {
            this.agentMenejer.setAlgorithm(e.target.value);
            this.algoritmMalumotiniYangila(e.target.value);
            this.grid.clearVisualization();
        });
        
        // Quvlovchi soni slayderi
        const quvlovchiSlayider = document.getElementById('chaser-count');
        const quvlovchiDispley = document.getElementById('chaser-count-display');
        quvlovchiSlayider.addEventListener('input', (e) => {
            const son = parseInt(e.target.value);
            quvlovchiDispley.textContent = son;
            this.agentMenejer.setAgentCount(son);
        });
        
        // Tezlikni boshqarish slayderi
        const tezlikSlayider = document.getElementById('speed-control');
        const tezlikDispley = document.getElementById('speed-display');
        tezlikSlayider.addEventListener('input', (e) => {
            const tezlik = parseInt(e.target.value);
            tezlikDispley.textContent = tezlik;
            this.agentMenejer.setSpeed(tezlik);
        });
        
        // To'siqlarni tozalash tugmasi
        document.getElementById('clear-obstacles').addEventListener('click', () => {
            this.grid.clearObstacles();
        });
        
        // Tasodifiy to'siqlar tugmasi
        document.getElementById('random-obstacles').addEventListener('click', () => {
            this.grid.generateRandomObstacles(0.25, this.agentMenejer.getAgentPositions());
        });
        
        // Agentlarni qayta tiklash tugmasi
        document.getElementById('reset-agents').addEventListener('click', () => {
            this.agentMenejer.resetAgents();
        });
        
        // Oyna o'lchamini o'zgartirish
        window.addEventListener('resize', () => {
            this.gridOlchaminiSozla();
            // Yangi o'lchamlar bilan gridni qayta yaratish
            this.grid = new Grid(this.ustunlar, this.qatorlar, this.katakOlchami);
            this.vizualizator = new Visualizer(this.kanvas, this.grid);
            this.agentMenejer = new AgentManager(this.grid);
            this.agentMenejer.createAgents(parseInt(quvlovchiSlayider.value));
            this.agentMenejer.setAlgorithm(algoritmTanlash.value);
            this.grid.generateRandomObstacles(0.2, this.agentMenejer.getAgentPositions());
        });
        
        // Standart algoritm ma'lumoti bilan ishga tushirish
        this.algoritmMalumotiniYangila('bfs');
    }

    /**
     * Sichqoncha bosilishi hodisasini boshqaradi
     */
    sichqonchaBosildiQaytaIshla(e) {
        this.sichqonchaBosilgan = true;
        const rect = this.kanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridPos = this.grid.pixelToGrid(x, y);
        
        // Agent pozitsiyasiga bosilganligini tekshirish
        const agentPozitsiyalari = this.agentMenejer.getAgentPositions();
        const agentKatagimi = agentPozitsiyalari.some(
            pos => pos.x === gridPos.x && pos.y === gridPos.y
        );
        
        if (!agentKatagimi && this.grid.isValidCell(gridPos.x, gridPos.y)) {
            // To'siq qo'shilayotganmi yoki olib tashlanayotganini aniqlash
            this.tosiqQoshilmoqda = !this.grid.isObstacle(gridPos.x, gridPos.y);
            this.grid.setObstacle(gridPos.x, gridPos.y, this.tosiqQoshilmoqda);
            this.oxirgiSichqonchaKatak = gridPos;
        }
    }

    /**
     * Sichqoncha qo'yib yuborilishi hodisasini boshqaradi
     */
    sichqonchaQoyildiQaytaIshla() {
        this.sichqonchaBosilgan = false;
        this.oxirgiSichqonchaKatak = { x: -1, y: -1 };
    }

    /**
     * Sichqoncha harakati hodisasini boshqaradi
     */
    sichqonchaHarakatQaytaIshla(e) {
        const rect = this.kanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridPos = this.grid.pixelToGrid(x, y);
        
        // Maqsad pozitsiyasini yangilash
        if (this.grid.isValidCell(gridPos.x, gridPos.y) && 
            !this.grid.isObstacle(gridPos.x, gridPos.y)) {
            this.maqsadPozitsiya = gridPos;
            this.vizualizator.setTarget(gridPos.x, gridPos.y);
        }
        
        // To'siq chizishni boshqarish
        if (this.sichqonchaBosilgan) {
            const agentPozitsiyalari = this.agentMenejer.getAgentPositions();
            const agentKatagimi = agentPozitsiyalari.some(
                pos => pos.x === gridPos.x && pos.y === gridPos.y
            );
            
            if (!agentKatagimi && 
                this.grid.isValidCell(gridPos.x, gridPos.y) &&
                (gridPos.x !== this.oxirgiSichqonchaKatak.x || gridPos.y !== this.oxirgiSichqonchaKatak.y)) {
                this.grid.setObstacle(gridPos.x, gridPos.y, this.tosiqQoshilmoqda);
                this.oxirgiSichqonchaKatak = gridPos;
            }
        }
    }

    /**
     * Teginish boshlash hodisasini boshqaradi
     */
    teginishBoshlashQaytaIshla(e) {
        e.preventDefault();
        const teginish = e.touches[0];
        this.sichqonchaBosildiQaytaIshla({ clientX: teginish.clientX, clientY: teginish.clientY });
    }

    /**
     * Teginish harakati hodisasini boshqaradi
     */
    teginishHarakatQaytaIshla(e) {
        e.preventDefault();
        const teginish = e.touches[0];
        this.sichqonchaHarakatQaytaIshla({ clientX: teginish.clientX, clientY: teginish.clientY });
    }

    /**
     * Algoritm ma'lumot panelini yangilaydi
     */
    algoritmMalumotiniYangila(algoritm) {
        const malumoatPaneli = document.getElementById('algorithm-info');
        const malumot = this.algoritmTavsiflari[algoritm];
        
        if (malumot) {
            malumoatPaneli.innerHTML = `
                <h3>${malumot.sarlavha}</h3>
                ${malumot.mazmun}
            `;
        }
    }

    /**
     * Statistika displeyini yangilaydi
     */
    statistikaniYangila() {
        const stat = this.agentMenejer.getStats();
        
        document.getElementById('nodes-explored').textContent = stat.nodesExplored;
        document.getElementById('path-length').textContent = stat.pathLength;
        document.getElementById('algorithm-time').textContent = `${stat.time.toFixed(2)}ms`;
    }

    /**
     * Asosiy o'yin tsikli
     */
    asosiyTsikl() {
        const joriyVaqt = performance.now();
        const deltaVaqt = joriyVaqt - this.oxirgiVaqt;
        this.oxirgiVaqt = joriyVaqt;
        
        // Yo'l topishni muntazam oraliqda yangilash
        this.yolTopishKutish -= deltaVaqt;
        if (this.yolTopishKutish <= 0) {
            this.yolTopishKutish = this.yolTopishOraliq;
            
            // Maqsad yaroqli bo'lsa yo'llarni yangilash
            if (this.maqsadPozitsiya.x >= 0 && this.maqsadPozitsiya.y >= 0) {
                this.agentMenejer.updatePaths(this.maqsadPozitsiya);
                this.statistikaniYangila();
            }
        }
        
        // Agentlarni yangilash
        this.agentMenejer.update();
        
        // Hamma narsani chizish
        this.vizualizator.render(this.agentMenejer);
        
        // Tsiklni davom ettirish
        if (this.ishlamoqda) {
            requestAnimationFrame(() => this.asosiyTsikl());
        }
    }

    /**
     * Ilovani to'xtatadi
     */
    toxtata() {
        this.ishlamoqda = false;
    }
}

// DOM tayyor bo'lganda ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    // Barcha skriptlar yuklanganiga ishonch hosil qilish uchun kichik kechikish
    setTimeout(() => {
        // Asosiy ilovani ishga tushirish
        ilova = new YolTopishIlovasi();
        
        console.log('🚀 Yo\'l Topish Vizualizatori ishga tushirildi!');
        console.log('📝 Ko\'rsatmalar:');
        console.log('   - Maqsadni o\'rnatish uchun sichqonchangizni harakatlantiring');
        console.log('   - To\'siqlarni qo\'shish/olib tashlash uchun bosib torting');
        console.log('   - Algoritmlar: BFS, DFS, Dijkstra, Prim (MST)');
    }, 100);
});

// Nosozliklarni tuzatish uchun eksport
window.YolTopishIlovasi = YolTopishIlovasi;
window.ilova = ilova;

