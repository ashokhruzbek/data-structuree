# 🎯 Yo'l Topish Algoritmlari Vizualizatori

## 📖 Loyiha Haqida

Bu interaktiv web platforma kursorni quvlaydigan agentlar (elementlar) yordamida yo'l topish algoritmlarini vizualizatsiya qiladi.

**Asosiy xususiyatlar:**
- Kursorni quvlaydigan elementlar (1-5 ta)
- To'siqlar bilan 2D grid maydoni
- Har bir algoritm o'ziga xos harakatlanadi
- Real vaqtda yo'l topish vizualizatsiyasi

---

## 🧮 Algoritmlar

### 1. 📚 BFS (Kenglik Bo'yicha Qidiruv)

**Qanday ishlaydi:** Qatlam-qatlam yuradi, suvdagi to'lqinlar kabi kengayadi.

**Xususiyatlari:**
- ✅ Eng qisqa yo'lni kafolatlaydi
- ✅ Navbat (FIFO) ishlatadi
- ✅ Vaqt murakkabligi: O(V + E)

**Vizual xulqi:** Agentdan kengayib borayotgan doiralarda tugunlar tekshiriladi.

---

### 2. 🔍 DFS (Chuqurlik Bo'yicha Qidiruv)

**Qanday ishlaydi:** Bir yo'nalishda iloji boricha chuqurga kirib ketadi, keyin orqaga qaytadi.

**Xususiyatlari:**
- ⚠️ Eng qisqa yo'lni KAFOLATLAMAYDI
- ✅ Stek (LIFO) ishlatadi
- ✅ Yo'li ba'zan aylanma (uzunroq) bo'ladi
- ✅ Vaqt murakkabligi: O(V + E)

**Vizual xulqi:** Agent bir yo'nalishda chuqurga boradi, keyin orqaga qaytib boshqa yo'nalishlarni tekshiradi.

---

### 3. 📐 Dijkstra Algoritmi

**Qanday ishlaydi:** Og'irlikli graflarda eng arzon (eng optimal) yo'lni topadi.

**Xususiyatlari:**
- ✅ Eng optimal yo'lni kafolatlaydi
- ✅ Ustuvorlik navbatidan foydalanadi
- ✅ Vaqt murakkabligi: O((V + E) log V)

**Vizual xulqi:** Eng arzon yo'l bilan yuradi, optimallik kafolatlanadi.

---

### 4. 🌳 Prim Algoritmi (MST)

**Qanday ishlaydi:** Minimal Qamrab Oluvchi Daraxt (Minimum Spanning Tree) quradi. Bevosita quvlamaydi, balki grafni bog'lab harakat yo'nalishini ko'rsatadi.

**Xususiyatlari:**
- ✅ BARCHA yetib boriladigan tugunlarni bog'laydi
- ✅ Umumiy qirra og'irligini minimallashtiradi
- ⚠️ Ikki nuqta orasidagi yo'lni TOPMAYDI
- ✅ Vaqt murakkabligi: O(E log V)

**Vizual xulqi:** Tarmoq strukturasini (MST) ko'rsatadi, agentlar bevosita quvlamaydi.

---

## 🚀 Ishga Tushirish

1. `index.html` faylini brauzerda oching
2. Algoritmni tanlang (BFS, DFS, Dijkstra, Prim)
3. Quvlovchilar sonini sozlang (1-5)
4. Sichqonchani harakatlantiring - agentlar kursorni quvadi

---

## 🎮 Foydalanish

| Amal | Natija |
|------|--------|
| Sichqonchani harakatlantirish | Maqsad (qizil) o'zgaradi |
| Bosib tortish | To'siqlar qo'shiladi/o'chiriladi |
| Algoritmni tanlash | Agentlar harakatlanish usuli o'zgaradi |
| Quvlovchilar soni | 1-5 orasida agent soni |
| Tezlik | Animatsiya tezligi |

---

## 📁 Fayl Tuzilmasi

```
shoxruzbek/
├── index.html      # Asosiy HTML sahifa
├── styles.css      # CSS stillari
├── README.md       # Hujjatlar
└── js/
    ├── algorithms.js   # BFS, DFS, Dijkstra, Prim algoritmlari
    ├── grid.js         # Grid (to'r) moduli
    ├── agent.js        # Agent (quvlovchi) moduli
    ├── visualizer.js   # Canvas vizualizatsiya
    └── main.js         # Asosiy ilova
```

---

## 🔄 Algoritmlar Taqqoslash

| Algoritm | Eng qisqa yo'l | Vizual xulqi | Qo'llanilishi |
|----------|----------------|--------------|---------------|
| BFS | ✅ Ha | Qatlam-qatlam kengayadi | Og'irliksiz graflar |
| DFS | ❌ Yo'q | Chuqurga kirib, qaytadi | Labirintlar |
| Dijkstra | ✅ Ha | Optimal yo'l | Og'irlikli graflar |
| Prim | - | MST quradi | Tarmoq dizayni |

---

## 👨‍💻 Muallif

Shoxruzbek

## 📝 Litsenziya

MIT License
