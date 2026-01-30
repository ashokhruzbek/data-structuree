# 🎯 Yo'l Topish Algoritmlari Vizualizatori

Graf va yo'l topish algoritmlarini vizualizatsiya qilish uchun interaktiv veb platforma. Bu ta'limiy vosita BFS, Dijkstra algoritmi va Prim algoritmi qanday ishlashini vizual, tushunarli tarzda namoyish etadi.

## 📖 Umumiy Ko'rinish

Bu platforma ko'rsatadi:
- To'siqlar bilan 2D grid
- Sichqoncha kursorini ta'qib qiluvchi agentlar (belgilar)
- Real vaqtda yo'l topish vizualizatsiyasi
- Qadam-baqadam algoritm tekshiruvi

## 🚀 Boshlash

### 1-variant: To'g'ridan-to'g'ri ochish
Shunchaki `index.html` faylini veb brauzerda oching.

### 2-variant: Live Server ishlatish
1. VS Code "Live Server" kengaytmasini o'rnating
2. `index.html` ustida o'ng tugmani bosing
3. "Open with Live Server" ni tanlang

## 🎮 Qanday Foydalanish

1. **Sichqonchangizni harakatlantiring** grid ustida - kursor maqsadga aylanadi
2. **Bosib torting** to'siqlarni qo'shish yoki olib tashlash uchun
3. **Algoritm tanlang** ochiluvchi menyudan
4. **Quvlovchilar sonini sozlang** slayder yordamida
5. **Animatsiya tezligini o'zgartiring** algoritmlarni tezroq yoki sekinroq ko'rish uchun

## 📚 Algoritmlar Tushuntirilgan

### 1. Kenglik Bo'yicha Qidiruv (BFS)

**Konsepsiya:** BFS grafni darajama-daraja ko'rib chiqadi, suvda tarqalayotgan to'lqinlar kabi.

**Qanday ishlaydi:**
```
1. Manba tugunidan boshlash
2. Barcha yaqin qo'shnilarni ziyorat qilish
3. Keyin o'sha qo'shnilarning barcha qo'shnilarini ziyorat qilish
4. Maqsad topilgunga qadar davom ettirish
```

**Asosiy Xususiyatlari:**
- **Navbat** (Birinchi-Kirgan-Birinchi-Chiqadi) ishlatadi
- Og'irliksiz graflarda **eng qisqa yo'lni** kafolatlaydi
- Vaqt: O(V + E), Xotira: O(V)

**Vizual Xulqi:** Agentdan kengayib borayotgan doiralarda tugunlar tekshirilayotganini ko'rasiz.

---

### 2. Dijkstra Algoritmi

**Konsepsiya:** Dijkstra har doim keyingi eng yaqin ziyorat qilinmagan tugunni tanlaydi.

**Qanday ishlaydi:**
```
1. Manbagacha masofani = 0, qolganlarini = ∞ qilib o'rnatish
2. Eng kichik masofaga ega tugunni tanlash
3. Barcha qo'shnilargacha masofalarni yangilash
4. Tugunni ziyorat qilingan deb belgilash
5. Maqsadga yetguncha takrorlash
```

**Asosiy Xususiyatlari:**
- **Ustuvorlik Navbati** (Min-Heap) ishlatadi
- Og'irlikli graflarda **eng qisqa yo'lni** kafolatlaydi
- Vaqt: O((V + E) log V), Xotira: O(V)

**Vizual Xulqi:** BFSga o'xshash, lekin qirra og'irliklariga qarab biroz boshqacha tartibda tekshirishi mumkin.

---

### 3. Prim Algoritmi (MST)

**Konsepsiya:** Prim barcha tugunlarni ulash uchun Minimal Yoyilgan Daraxt quradi.

**Qanday ishlaydi:**
```
1. Daraxtda bitta tugundan boshlash
2. Yangi tugunga eng arzon qirrani topish
3. O'sha tugun va qirrani daraxtga qo'shish
4. Barcha tugunlar ulangunga qadar takrorlash
```

**Asosiy Xususiyatlari:**
- Yo'l emas, daraxt hosil qiladi
- BARCHA yetib boriladigan tugunlarni ulaydi
- Umumiy qirra og'irligini minimallashtiradi
- Vaqt: O(E log V)

**Vizual Xulqi:** Qirralar birin-ketin paydo bo'lib, daraxt strukturasini hosil qilayotganini ko'rasiz.

## 📁 Loyiha Strukturasi

```
shoxruzbek/
├── index.html          # Asosiy HTML fayl
├── styles.css          # Stillar
├── README.md           # Ushbu hujjat
└── js/
    ├── grid.js         # Grid ifodalanishi va katak boshqaruvi
    ├── algorithms.js   # BFS, Dijkstra va Prim implementatsiyalari
    ├── agent.js        # Agent harakati va boshqaruvi
    ├── visualizer.js   # Canvas chizish
    └── main.js         # Ilova kirish nuqtasi
```

## 🔍 Kod Tushuntirishi

### Grid Moduli (`grid.js`)

Grid bu 2D massiv bo'lib, quyidagilarni ifodalaydi:
- `0` = Bo'sh katak (o'tiladigan)
- `1` = To'siq (bloklangan)

Asosiy metodlar:
```javascript
// Katakning yaroqli qo'shnilarini olish
getNeighbors(col, row) {
    // Yuqori, o'ng, pastki, chap qo'shnilarni qaytaradi
    // chegaralar ichida va o'tiladigan bo'lganlari
}

// Katakdan o'tish mumkinligini tekshirish
isWalkable(col, row) {
    return this.isValidCell(col, row) && !this.isObstacle(col, row);
}
```

### Algoritmlar Moduli (`algorithms.js`)

#### BFS Implementatsiyasi:
```javascript
bfs(start, target) {
    const queue = [];          // FIFO navbat
    const visited = new Set(); // Ziyorat qilinganlarni kuzatish
    const parent = new Map();  // Yo'lni qayta tiklash uchun
    
    queue.push(start);
    visited.add(startKey);
    
    while (queue.length > 0) {
        const current = queue.shift();  // Oldidan olish
        
        if (current === target) {
            return reconstructPath(parent, target);
        }
        
        for (const neighbor of getNeighbors(current)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent.set(neighbor, current);
                queue.push(neighbor);  // Navbatga qo'shish
            }
        }
    }
}
```

#### Dijkstra Implementatsiyasi:
```javascript
dijkstra(start, target) {
    const pq = new MinPriorityQueue();  // Ustuvorlik navbati
    const distance = new Map();          // Eng qisqa masofalar
    const parent = new Map();
    
    distance.set(start, 0);
    pq.enqueue(start, 0);
    
    while (!pq.isEmpty()) {
        const {element: current, priority: dist} = pq.dequeue();
        
        if (current === target) {
            return reconstructPath(parent, target);
        }
        
        for (const neighbor of getNeighbors(current)) {
            const newDist = dist + edgeWeight;
            
            if (newDist < distance.get(neighbor)) {
                distance.set(neighbor, newDist);
                parent.set(neighbor, current);
                pq.enqueue(neighbor, newDist);
            }
        }
    }
}
```

#### Prim Algoritmi:
```javascript
prim(start) {
    const pq = new MinPriorityQueue();
    const inMST = new Set();
    const mstEdges = [];
    
    inMST.add(start);
    
    // Boshlang'ichdan barcha qirralarni qo'shish
    for (const neighbor of getNeighbors(start)) {
        pq.enqueue({from: start, to: neighbor}, 1);
    }
    
    while (!pq.isEmpty()) {
        const {element: edge} = pq.dequeue();
        
        if (inMST.has(edge.to)) continue;
        
        inMST.add(edge.to);
        mstEdges.push(edge);
        
        // Yangi qirralarni qo'shish
        for (const neighbor of getNeighbors(edge.to)) {
            if (!inMST.has(neighbor)) {
                pq.enqueue({from: edge.to, to: neighbor}, 1);
            }
        }
    }
    
    return mstEdges;
}
```

### Ustuvorlik Navbati (`algorithms.js`)

Binar min-heap implementatsiyasi:
```javascript
class MinPriorityQueue {
    // Heap operatsiyalari
    enqueue(element, priority)  // O(log n)
    dequeue()                   // O(log n) - min qaytaradi
    isEmpty()                   // O(1)
}
```

## 🎨 Rang Qo'llanmasi

| Rang | Ma'nosi |
|------|---------|
| 🟢 Yashil | Agent (quvlovchi) |
| 🔴 Qizil | Maqsad (kursor) |
| ⬛ Qora kulrang | To'siq |
| 🔵 Ko'k | Tekshirilgan tugunlar |
| 🟡 Sariq | Yo'l / MST qirralari |

## ⚙️ Texnik Tafsilotlar

- **Chizish:** HTML5 Canvas API
- **Animatsiya:** Silliq 60fps uchun requestAnimationFrame
- **Ma'lumotlar Strukturalari:** 
  - Grid uchun 2D Massiv
  - Ziyorat kuzatuvi uchun Set
  - Ota-ona ko'rsatkichlari uchun Map
  - Ustuvorlik navbati uchun Binar Heap

## 🧠 Talabalar Uchun Asosiy Tushunchalar

### Graf Ifodalanishi
Grid bu graf bo'lib, quyidagi xususiyatlarga ega:
- Har bir katak - **cho'qqi**
- Har bir yonma-yon kataklar juftligi - **qirra**
- To'siqlar qirralarni olib tashlaydi (kataklarni yetib bo'lmaydigan qiladi)

### Yo'lni Qayta Tiklash
Maqsadni topgandan so'ng, orqaga kuzatamiz:
```javascript
function reconstructPath(parent, target) {
    const path = [];
    let current = target;
    
    while (current !== null) {
        path.unshift(current);
        current = parent.get(current);
    }
    
    return path;
}
```

### Vaqt va Xotira Muvozanati
- BFS oddiy, lekin navbat uchun O(V) xotira ishlatadi
- Dijkstra ko'proq xotira ishlatadi (ustuvorlik navbati) lekin og'irliklarni boshqaradi
- Prim daraxt strukturasi quradi, tarmoq muammolari uchun foydali

## 🤔 Taqqoslash Jadvali

| Xususiyat | BFS | Dijkstra | Prim |
|-----------|-----|----------|------|
| Maqsad | Eng qisqa yo'l | Eng qisqa yo'l | MST |
| Og'irlikli | Yo'q | Ha | Ha |
| Natija | Yo'l | Yo'l | Daraxt |
| Ma'lumotlar Strukturasi | Navbat | Ustuvorlik Navbati | Ustuvorlik Navbati |

## 📝 Litsenziya

Ushbu loyiha ta'lim maqsadlarida yaratilgan. O'rganish uchun erkin foydalaning va o'zgartiring!

---

**Ma'lumotlar Tuzilmalari Kursi Uchun Yaratilgan**  
*Interaktiv Algoritm Vizualizatsiyasi*
