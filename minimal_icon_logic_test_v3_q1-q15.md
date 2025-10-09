# 🧩 Minimal Icon Logic Test v3 — Komplett frågebank (15 frågor)

Stil: Grundläggande geometriska former och ikoner med fokus på visuell tydlighet.

---

## FRÅGA 1 — Progression av antal (svårighet 1)
**ID:** v3-q1-count-progression
**Regel:** Antalet prickar ökar med en för varje kolumn (1, 2, 3). Raden ändrar prickarnas position (topp, mitt, botten) inom ramen.
**Korrekt svar:** C (index 2)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="50" cy="30" r="8" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="35" cy="30" r="8" fill="#000"/><circle cx="65" cy="30" r="8" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="30" r="8" fill="#000"/><circle cx="50" cy="30" r="8" fill="#000"/><circle cx="75" cy="30" r="8" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="50" cy="50" r="8" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="35" cy="50" r="8" fill="#000"/><circle cx="65" cy="50" r="8" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="50" r="8" fill="#000"/><circle cx="50" cy="50" r="8" fill="#000"/><circle cx="75" cy="50" r="8" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="50" cy="70" r="8" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="35" cy="70" r="8" fill="#000"/><circle cx="65" cy="70" r="8" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="50" cy="70" r="8" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="35" cy="70" r="8" fill="#000"/><circle cx="65" cy="70" r="8" fill="#000"/></svg>
**C — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="70" r="8" fill="#000"/><circle cx="50" cy="70" r="8" fill="#000"/><circle cx="75" cy="70" r="8" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="50" r="8" fill="#000"/><circle cx="50" cy="50" r="8" fill="#000"/><circle cx="75" cy="50" r="8" fill="#000"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="70" r="8" fill="#000"/><circle cx="75" cy="70" r="8" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="50" cy="30" r="8" fill="#000"/><circle cx="50" cy="50" r="8" fill="#000"/><circle cx="50" cy="70" r="8" fill="#000"/></svg>

---

## FRÅGA 2 — Enkel rotation (svårighet 1)
**ID:** v3-q2-simple-rotation
**Regel:** Pilen roterar 90° medurs för varje steg i raden. Formen är densamma för alla rader.
**Korrekt svar:** B (index 1)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(0, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(0, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(0, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**B — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(270, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(0, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(45, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></g></svg>

---

## FRÅGA 3 — Latin square (svårighet 1)
**ID:** v3-q3-latin-square
**Regel:** Varje rad och kolumn måste innehålla exakt en av varje symbol (Pac-Man, stjärna, hjärta).
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,20 L61.8,40.9 L85.1,42.4 L67.5,59.1 L72.2,82.3 L50,70 L27.8,82.3 L32.5,59.1 L14.9,42.4 L38.2,40.9Z" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,30 C40,-10 0,15 50,60 C100,15 60,-10 50,30 Z" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,20 L61.8,40.9 L85.1,42.4 L67.5,59.1 L72.2,82.3 L50,70 L27.8,82.3 L32.5,59.1 L14.9,42.4 L38.2,40.9Z" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,30 C40,-10 0,15 50,60 C100,15 60,-10 50,30 Z" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,30 C40,-10 0,15 50,60 C100,15 60,-10 50,30 Z" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,20 L61.8,40.9 L85.1,42.4 L67.5,59.1 L72.2,82.3 L50,70 L27.8,82.3 L32.5,59.1 L14.9,42.4 L38.2,40.9Z" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,30 C40,-10 0,15 50,60 C100,15 60,-10 50,30 Z" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M50,20 L61.8,40.9 L85.1,42.4 L67.5,59.1 L72.2,82.3 L50,70 L27.8,82.3 L32.5,59.1 L14.9,42.4 L38.2,40.9Z" fill="#000"/></g></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000"/></svg>

---

## FRÅGA 4 — Alternerande fyllning (svårighet 1)
**ID:** v3-q4-alternating-fill
**Regel:** Fyllningen alternerar mellan fylld och ofylld för varje cell, läst radvis.
**Korrekt svar:** D (index 3)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**D — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(45, 50, 50)"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></g></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"></svg>

---

## FRÅGA 5 — Positionssekvens (svårighet 1)
**ID:** v3-q5-position-sequence
**Regel:** En prick rör sig medurs ett steg i taget mellan de fyra hörnen på ramen.
**Korrekt svar:** C (index 2)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="25" r="8" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="75" cy="25" r="8" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="75" cy="75" r="8" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="75" r="8" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="25" r="8" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="75" cy="25" r="8" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="75" cy="75" r="8" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="75" r="8" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="75" r="8" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="75" cy="75" r="8" fill="#000"/></svg>
**C — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="25" cy="25" r="8" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="75" cy="25" r="8" fill="#000"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><circle cx="50" cy="50" r="8" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/></svg>

---

## FRÅGA 6 — Union av linjer (svårighet 2)
**ID:** v3-q6-line-union
**Regel:** I varje rad är Kolumn 3 en sammanslagning (union) av alla linjer från Kolumn 1 och 2.
**Korrekt svar:** D (index 3)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="25" x2="50" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/><line x1="50" y1="25" x2="50" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="75" x2="75" y2="25" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/><line x1="25" y1="75" x2="75" y2="25" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="25" stroke="#000" stroke-width="2.5"/><line x1="25" y1="75" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="25" y2="75" stroke="#000" stroke-width="2.5"/><line x1="75" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="25" stroke="#000" stroke-width="2.5"/><line x1="25" y1="75" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="25" y2="75" stroke="#000" stroke-width="2.5"/><line x1="75" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/><line x1="50" y1="25" x2="50" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**D — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/><line x1="25" y1="75" x2="75" y2="25" stroke="#000" stroke-width="2.5"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"></svg>

---

## FRÅGA 7 — Två attribut per axel (svårighet 2)
**ID:** v3-q7-attribute-grid
**Regel:** Raden bestämmer formen (cirkel, kvadrat, triangel). Kolumnen bestämmer fyllnadsgrad (kontur, grå, svart).
**Korrekt svar:** E (index 4)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#808080" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#808080" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="#808080" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="#808080" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**E — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="#000" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M50 20 L80 75 L20 75 Z" fill="#000" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></g></svg>

---

## FRÅGA 8 — Räkna slutpunkter (svårighet 2)
**ID:** v3-q8-endpoint-count
**Regel:** Antalet "slutpunkter" (ändar på linjer) i figuren ökar med 1 för varje kolumn (2, 3, 4).
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 75 L 25 25 L 75 25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 M 25 75 L 75 75 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="25" x2="50" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 75 L 50 25 L 75 75" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 75 M 25 75 L 75 25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 75 L 25 50 L 50 25 L 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 L 25 50 L 50 75 L 75 50 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 75 L 25 50 L 50 25 L 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 75 M 25 75 L 75 25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M25,25 L75,25 L75,75 L25,75 L25,25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 75 L 50 25 L 75 75" fill="none" stroke="#000" stroke-width="2.5"/></svg>

---

## FRÅGA 9 — Vertikal spegling (svårighet 2)
**ID:** v3-q9-reflection
**Regel:** Kolumn 2 är en vertikal spegelbild av Kolumn 1. Kolumn 3 är en vertikal spegelbild av Kolumn 2 (och därmed identisk med Kolumn 1).
**Korrekt svar:** F (index 5)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 75 L 75 75 L 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 0 1 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 75 A 25 25 0 0 0 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 0 1 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 50 L 25 75" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 75 L 75 50 L 25 25" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 75 L 75 50 L 25 25" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 25 25 L 75 50 L 25 75" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></g></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 75 25 L 25 50 L 75 75" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 0 1 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**F — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 50 L 25 75" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>

---

## FRÅGA 10 — Skärning (A ∩ B) (svårighet 2)
**ID:** v3-q10-intersection
**Regel:** I varje rad är Kolumn 3 skärningen (intersection) av formerna i Kolumn 1 och 2, dvs den del som är gemensam för båda.
**Korrekt svar:** B (index 1)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="25" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="25" height="50" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="25" height="25" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 50 L 20 80 L 80 80 Z" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**B — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 50 L 20 80 L 80 80 Z" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="12.5" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 50 L 20 80 L 80 80 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,75 A25,25 0 0,0 25,50 H75 A25,25 0 0,0 50,75 Z" fill="#000"/></svg>

---

## FRÅGA 11 — Kretsande objekt (svårighet 2)
**ID:** v3-q11-orbital
**Regel:** En liten prick kretsar runt en central cirkel i 45°-steg moturs för varje cell, läst radvis.
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="80" cy="50" r="6" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="71.2" cy="28.8" r="6" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="20" r="6" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="28.8" cy="28.8" r="6" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="20" cy="50" r="6" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="28.8" cy="71.2" r="6" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="80" r="6" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="71.2" cy="71.2" r="6" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="80" cy="50" r="6" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="71.2" cy="71.2" r="6" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="80" r="6" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="#000"/><circle cx="80" cy="50" r="6" fill="none" stroke="#fff" stroke-width="2"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="20" cy="50" r="6" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="71.2" cy="28.8" r="6" fill="#000"/></svg>

---

## FRÅGA 12 — Byte av position (svårighet 2)
**ID:** v3-q12-swap
**Regel:** Det finns alltid en svart och en vit cirkel. För varje steg i raden byter de plats med varandra. Mönstret återställs för varje ny rad.
**Korrekt svar:** D (index 3)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="12" fill="#000"/><circle cx="65" cy="65" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="65" cy="65" r="12" fill="#000"/><circle cx="35" cy="35" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="12" fill="#000"/><circle cx="65" cy="65" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="30" r="12" fill="#000"/><circle cx="50" cy="70" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="70" r="12" fill="#000"/><circle cx="50" cy="30" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="30" r="12" fill="#000"/><circle cx="50" cy="70" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="30" cy="50" r="12" fill="#000"/><circle cx="70" cy="50" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="70" cy="50" r="12" fill="#000"/><circle cx="30" cy="50" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="70" cy="50" r="12" fill="#000"/><circle cx="30" cy="50" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="30" cy="50" r="12" fill="#000"/><circle cx="70" cy="50" r="12" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="30" cy="50" r="12" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="70" cy="50" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**D — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="30" cy="50" r="12" fill="#000"/><circle cx="70" cy="50" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="30" r="12" fill="#000"/><circle cx="50" cy="70" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="12" fill="#000"/><circle cx="65" cy="65" r="12" fill="none" stroke="#000" stroke-width="2.5"/></svg>

---

## FRÅGA 13 — Storleksprogression (svårighet 1)
**ID:** v3-q13-size-progression
**Regel:** Formen växer i storlek för varje kolumn (liten, mellan, stor). Raden bestämmer vilken form som används.
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 40 L55 50 L50 60 L45 50 Z" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 30 L65 50 L50 70 L35 50 Z" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L75 50 L50 80 L25 50 Z" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M45,45 L55,45 L55,55 L45,55 Z" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M35,35 L65,35 L65,65 L35,65 Z" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M25,25 L75,25 L75,75 L25,75 Z" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,42.5 L53.5,52.5 L46.5,52.5 Z" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,35 L62,65 L38,65 Z" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,20 L80,80 L20,80 Z" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,35 L62,65 L38,65 Z" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,42.5 L53.5,52.5 L46.5,52.5 Z" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50,20 L80,80 L20,80 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L75 50 L50 80 L25 50 Z" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M50,20 L80,80 L20,80 Z" fill="#000"/></g></svg>

---

## FRÅGA 14 — Subtraktion av form (svårighet 2)
**ID:** v3-q14-shape-subtraction
**Regel:** Kolumn 3 är resultatet av Kolumn 1 minus Kolumn 2 (den inre formen "stansas ut").
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000"/><circle cx="50" cy="50" r="15" fill="#fff"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="15" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/><rect x="40" y="40" width="20" height="20" fill="#fff"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="40" y="40" width="20" height="20" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/><circle cx="50" cy="60" r="10" fill="#fff"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="60" r="10" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="60" r="10" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/><circle cx="50" cy="60" r="10" fill="#fff"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/><circle cx="50" cy="40" r="10" fill="#fff"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>

---

## FRÅGA 15 — Svepande linje (svårighet 2)
**ID:** v3-q15-sweep
**Regel:** En linje ritas från centrum och utåt. För varje steg i raden läggs en ny linje till, 90° medurs från den föregående.
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="85" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="85" y2="50" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="50" y2="85" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="85" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="85" y2="50" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="50" y2="85" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="85" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="85" y2="50" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="50" y2="85" stroke="#000" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="85" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="15" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="85" y2="50" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="50" y2="85" stroke="#000" stroke-width="2.5"/><line x1="50" y1="50" x2="15" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="50" y2="85" stroke="#000" stroke-width="2.5"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="50" x2="15" y2="50" stroke="#000" stroke-width="2.5"/></svg>