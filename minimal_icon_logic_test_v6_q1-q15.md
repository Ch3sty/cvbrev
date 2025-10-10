# 🧩 Minimal Icon Logic Test v6 — Avancerad Nivå (15 frågor)

Stil: Komplexa kombinationer, logiska operationer och villkorliga regler med full visuell tydlighet.

---

## FRÅGA 1 — Två variabler: Rotation & Fyllning (svårighet 2)
**ID:** v6-q1-rot-fill
**Regel:** Formen roterar 90° medurs för varje kolumn. Fyllningen alternerar (fylld/ofylld) för varje rad.
**Korrekt svar:** B (index 1)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(0, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(0, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></g></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></g></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></g></svg>
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
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></g></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(0, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#808080"/></g></svg>

---

## FRÅGA 2 — Formbyte och position (svårighet 2)
**ID:** v6-q2-shape-position
**Regel:** Raden bestämmer formen (L-form, T-form, Z-form). Kolumnen bestämmer positionen inom ramen (övre vänster, mitten, nedre höger).
**Korrekt svar:** F (index 5)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 25 25 V 50 H 50" fill="none" stroke="#000" stroke-width="3"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 40 40 V 65 H 65" fill="none" stroke="#000" stroke-width="3"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 55 V 80 H 80" fill="none" stroke="#000" stroke-width="3"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 25 37.5 H 50 M 37.5 25 V 50" fill="none" stroke="#000" stroke-width="3"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 40 52.5 H 65 M 52.5 40 V 65" fill="none" stroke="#000" stroke-width="3"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 67.5 H 80 M 67.5 55 V 80" fill="none" stroke="#000" stroke-width="3"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 25 25 H 50 V 50 H 25" fill="none" stroke="#000" stroke-width="3"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 40 40 H 65 V 65 H 40" fill="none" stroke="#000" stroke-width="3"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 25 25 H 50 V 50 H 25" fill="none" stroke="#000" stroke-width="3"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 40 40 H 65 V 65 H 40" fill="none" stroke="#000" stroke-width="3"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 67.5 H 80 M 67.5 55 V 80" fill="none" stroke="#000" stroke-width="3"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 55 V 80 H 80" fill="none" stroke="#000" stroke-width="3"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 55 H 80 V 80 H 55" fill="none" stroke="#000" stroke-width="3"/></svg>
**F — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 55 H 80 V 80 H 55" fill="none" stroke="#000" stroke-width="3"/></svg>

---

## FRÅGA 3 — Union (Addition) av element (svårighet 2)
**ID:** v6-q3-union
**Regel:** Kolumn 3 är en sammanslagning (union) av alla unika element från Kolumn 1 och 2. Raden bestämmer vilka former som används.
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="12" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="65" cy="65" r="12" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="12" fill="#000"/><circle cx="65" cy="65" r="12" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="20" height="20" fill="#000"/><rect x="55" y="55" width="20" height="20" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="55" y="25" width="20" height="20" fill="#000"/><rect x="25" y="55" width="20" height="20" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="20" height="20" fill="#000"/><rect x="55" y="55" width="20" height="20" fill="#000"/><rect x="55" y="25" width="20" height="20" fill="#000"/><rect x="25" y="55" width="20" height="20" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 25 L60 45 L40 45 Z" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 75 L60 55 L40 55 Z" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 25 L60 45 L40 45 Z" fill="#000"/><path d="M50 75 L60 55 L40 55 Z" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 25 L60 45 L40 45 Z" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 75 L60 55 L40 55 Z" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="20" height="20" fill="#000"/><rect x="55" y="55" width="20" height="20" fill="#000"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="12" fill="#000"/><circle cx="65" cy="65" r="12" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"></svg>

---

## FRÅGA 4 — Analogiregel (A:B :: C:?) (svårighet 3)
**ID:** v6-q4-analogy
**Regel:** Transformationen från Kolumn 1 till 2 (rotera 180° och lägg till en prick i mitten) är densamma för varje rad.
**Korrekt svar:** C (index 2)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 50 75 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 25 25 L 75 25 L 50 75 Z" fill="none" stroke="#000" stroke-width="2.5"/></g><circle cx="50" cy="50" r="5" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 50 75 Z" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="50" r="5" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 25 75 L 75 75" fill="none" stroke="#000" stroke-width="3"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 25 25 L 25 75 L 75 75" fill="none" stroke="#000" stroke-width="3"/></g><circle cx="50" cy="50" r="5" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 25 75 L 75 75" fill="none" stroke="#000" stroke-width="3"/><circle cx="50" cy="50" r="5" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="none" stroke="#000" stroke-width="2.5"/></g><circle cx="50" cy="50" r="5" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="none" stroke="#000" stroke-width="2.5"/></g></svg>
**C — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="50" r="5" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 50 75 Z" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="50" r="5" fill="#000"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="none" stroke="#000" stroke-width="2.5"/></g><circle cx="50" cy="50" r="5" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill="#000"/><circle cx="50" cy="50" r="5" fill="#fff"/></svg>

---

## FRÅGA 5 — XOR av linjer (svårighet 3)
**ID:** v6-q5-line-xor
**Regel:** I varje rad, när Kolumn 1 och 2 läggs ovanpå varandra, försvinner de linjer som är gemensamma (XOR). Resultatet visas i Kolumn 3.
**Korrekt svar:** E (index 4)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/><line x1="25" y1="75" x2="75" y2="25" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/><line x1="25" y1="75" x2="75" y2="25" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/><line x1="50" y1="25" x2="50" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="25" x2="50" y2="75" stroke="#000" stroke-width="2.5"/><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 75 L 25 75 Z M 25 50 L 75 50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 25 75 L 75 75 L 75 25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**E — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"></svg>

---

## FRÅGA 6 — Villkorlig transformation (svårighet 3)
**ID:** v6-q6-conditional-transform
**Regel:** För varje steg åt höger: OM formen är fylld, roterar den 90° medurs. OM den är ofylld, speglas den vertikalt.
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 30 70 L 30 30 L 70 50 Z" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90 50 50)"><path d="M 30 70 L 30 30 L 70 50 Z" fill="#000"/></g></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180 50 50)"><path d="M 30 70 L 30 30 L 70 50 Z" fill="#000"/></g></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 50" fill="none" stroke="#000" stroke-width="3"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(50, 50) scale(1, -1) translate(-50, -50)"><path d="M 25 25 L 75 25 L 75 50" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 50" fill="none" stroke="#000" stroke-width="3"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 75 V 25 H 75" fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(50, 50) scale(1, -1) translate(-50, -50)"><path d="M 25 75 V 25 H 75" fill="#000" stroke="#000" stroke-width="3" stroke-linejoin="round"/></g></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(50, 50) scale(1, -1) translate(-50, -50) rotate(90, 50, 50)"><path d="M 25 75 V 25 H 75" fill="#000" stroke="#000" stroke-width="3" stroke-linejoin="round"/></g></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(90, 50, 50)"><path d="M 25 75 V 25 H 75" fill="#000" stroke="#000" stroke-width="3" stroke-linejoin="round"/></g></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(50, 50) scale(1, 1) translate(-50, -50)"><path d="M 25 75 V 25 H 75" fill="#000" stroke="#000" stroke-width="3" stroke-linejoin="round"/></g></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(50, 50) scale(1, -1) translate(-50, -50)"><path d="M 25 75 V 25 H 75" fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round"/></g></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="rotate(180, 50, 50)"><path d="M 30 70 L 30 30 L 70 50 Z" fill="#000"/></g></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 50" fill="none" stroke="#000" stroke-width="3"/></svg>

---

## FRÅGA 7 — Räkna slutna ytor (svårighet 3)
**ID:** v6-q7-closed-areas
**Regel:** Antalet prickar i en cell är lika med antalet helt slutna ytor i figuren i samma cell.
**Korrekt svar:** A (index 0)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 75 M 25 75 L 75 25" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="50" r="8" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 75 L 25 75 Z" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="50" r="8" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 0 50.01 25 Z" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="50" r="8" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 75 L 25 75 Z M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="37.5" cy="50" r="8" fill="#000"/><circle cx="62.5" cy="50" r="8" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 0 50.01 25 Z M 25 50 L 75 50" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="37.5" r="8" fill="#000"/><circle cx="50" cy="62.5" r="8" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 L 25 75 L 75 75 Z M 50 75 L 25 25 L 75 25 Z" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="37.5" cy="50" r="8" fill="#000"/><circle cx="62.5" cy="50" r="8" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 50 50 L 25 25 M 25 75 L 75 75 L 50 50 L 25 75" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="37.5" r="8" fill="#000"/><circle cx="50" cy="62.5" r="8" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 0 50.01 25 Z M 50 35 A 15 15 0 1 0 50.01 35 Z" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="35" cy="50" r="8" fill="#000"/><circle cx="65" cy="50" r="8" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 75 L 25 75 Z M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="37.5" cy="37.5" r="5" fill="#000"/><circle cx="62.5" cy="37.5" r="5" fill="#000"/><circle cx="37.5" cy="62.5" r="5" fill="#000"/><circle cx="62.5" cy="62.5" r="5" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 75 L 25 75 Z M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="50" r="8" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 75 L 25 75 Z M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="37.5" cy="50" r="8" fill="#000"/><circle cx="62.5" cy="50" r="8" fill="#000"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 25 L 75 75 L 25 75 Z M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 25 A 25 25 0 1 0 50.01 25 Z M 50 35 A 15 15 0 1 0 50.01 35 Z" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="35" cy="50" r="8" fill="#000"/><circle cx="65" cy="50" r="8" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 25 25 L 75 75 M 25 75 L 75 25" fill="none" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="50" r="8" fill="#000"/></svg>

---

## FRÅGA 8 — Subtraktion av form (med inverterad linje) (svårighet 3)
**ID:** v6-q8-subtraction-inverted
**Regel:** Kolumn 3 är resultatet av Kolumn 1 minus Kolumn 2. Om en linje "stansas ut" ur en fylld yta, blir den resulterande linjen vit.
**Korrekt svar:** F (index 5)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000"/><line x1="25" y1="25" x2="75" y2="75" stroke="#fff" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/><line x1="25" y1="50" x2="75" y2="50" stroke="#fff" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/><line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/><line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/><line x1="25" y1="50" x2="75" y2="50" stroke="#fff" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**F — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="20" x2="50" y2="80" stroke="#000" stroke-width="2.5"/></svg>

---

## FRÅGA 9 — Latin square (form & fyllning) (svårighet 3)
**ID:** v6-q9-sudoku
**Regel:** Varje rad och kolumn måste innehålla exakt en av varje form (pil, plus, måne) OCH exakt en av varje fyllning (svart, grå, ofylld).
**Korrekt svar:** D (index 3)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" fill="#808080"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" fill="#808080"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" fill="#808080"/></svg>
**D — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#808080"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" fill="#808080"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#808080" stroke-width="2.5"/></svg>

---

## FRÅGA 10 — Addition av element (svårighet 2)
**ID:** v6-q10-element-addition
**Regel:** I varje rad är antalet element i Kolumn 3 summan av antalet element i Kolumn 1 och Kolumn 2.
**Korrekt svar:** D (index 3)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="10" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="50" r="10" fill="#000"/><circle cx="65" cy="50" r="10" fill="#000"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="30" r="10" fill="#000"/><circle cx="30" cy="65" r="10" fill="#000"/><circle cx="70" cy="65" r="10" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="10" fill="#000"/><circle cx="65" cy="35" r="10" fill="#000"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="65" r="10" fill="#000"/><circle cx="65" cy="65" r="10" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="10" fill="#000"/><circle cx="65" cy="35" r="10" fill="#000"/><circle cx="35" cy="65" r="10" fill="#000"/><circle cx="65" cy="65" r="10" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="30" r="10" fill="#000"/><circle cx="30" cy="65" r="10" fill="#000"/><circle cx="70" cy="65" r="10" fill="#000"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="10" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="30" r="10" fill="#000"/><circle cx="30" cy="65" r="10" fill="#000"/><circle cx="70" cy="65" r="10" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="10" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="10" fill="#000"/><circle cx="65" cy="35" r="10" fill="#000"/></svg>
**D — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="28" r="10" fill="#000"/><circle cx="28" cy="50" r="10" fill="#000"/><circle cx="72" cy="50" r="10" fill="#000"/><circle cx="50" cy="72" r="10" fill="#000"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="35" cy="35" r="10" fill="#000"/><circle cx="65" cy="35" r="10" fill="#000"/><circle cx="35" cy="65" r="10" fill="#000"/><circle cx="65" cy="65" r="10" fill="#000"/><circle cx="50" cy="50" r="10" fill="#000"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="35" r="10" fill="#000"/><circle cx="50" cy="65" r="10" fill="#000"/></svg>

---

## FRÅGA 11 — Två variabler: Form & Position (svårighet 2)
**ID:** v6-q11-shape-position
**Regel:** Raden bestämmer formen (L-form, T-form, Z-form). Kolumnen bestämmer positionen inom ramen (övre vänster, mitten, nedre höger).
**Korrekt svar:** F (index 5)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 25 25 V 50 H 50" fill="none" stroke="#000" stroke-width="3"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 40 40 V 65 H 65" fill="none" stroke="#000" stroke-width="3"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 55 V 80 H 80" fill="none" stroke="#000" stroke-width="3"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 25 37.5 H 50 M 37.5 25 V 50" fill="none" stroke="#000" stroke-width="3"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 40 52.5 H 65 M 52.5 40 V 65" fill="none" stroke="#000" stroke-width="3"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 67.5 H 80 M 67.5 55 V 80" fill="none" stroke="#000" stroke-width="3"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 25 25 H 50 V 50 H 25" fill="none" stroke="#000" stroke-width="3"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 40 40 H 65 V 65 H 40" fill="none" stroke="#000" stroke-width="3"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 25 25 H 50 V 50 H 25" fill="none" stroke="#000" stroke-width="3"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 40 40 H 65 V 65 H 40" fill="none" stroke="#000" stroke-width="3"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 67.5 H 80 M 67.5 55 V 80" fill="none" stroke="#000" stroke-width="3"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 55 V 80 H 80" fill="none" stroke="#000" stroke-width="3"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 55 H 80 V 80 H 55" fill="none" stroke="#000" stroke-width="3"/></svg>
**F — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1"/><path d="M 55 55 H 80 V 80 H 55" fill="none" stroke="#000" stroke-width="3"/></svg>

---

## FRÅGA 12 — Latin square (form & fyllning) (svårighet 3)
**ID:** v6-q12-sudoku
**Regel:** Varje rad och kolumn måste innehålla exakt en av varje form (pil, plus, måne) OCH exakt en av varje fyllning (svart, grå, ofylld).
**Korrekt svar:** D (index 3)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" fill="#808080"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" fill="#808080"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" fill="#000"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" fill="#808080"/></svg>
**D — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#808080"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" fill="#808080"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="none" stroke="#808080" stroke-width="2.5"/></svg>

---

## FRÅGA 13 — Villkorlig förändring (svårighet 3)
**ID:** v6-q13-conditional
**Regel:** Formen ändras baserat på dess position: I den vänstra kolumnen är formen en triangel. I mittenkolumnen är den en kvadrat. I den högra kolumnen är den en cirkel. Fyllningen är alltid densamma inom en rad.
**Korrekt svar:** C (index 2)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="#000" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**C — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000" stroke="#000" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 75 L20 75 Z" fill="#000" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000" stroke="#000" stroke-width="2.5"/></svg>

---

## FRÅGA 14 — Subtraktion av form (med inverterad linje) (svårighet 3)
**ID:** v6-q14-subtraction-inverted
**Regel:** Kolumn 3 är resultatet av Kolumn 1 minus Kolumn 2. Om en linje "stansas ut" ur en fylld yta, blir den resulterande linjen vit.
**Korrekt svar:** F (index 5)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000"/><line x1="25" y1="25" x2="75" y2="75" stroke="#fff" stroke-width="2.5"/></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><rect x="25" y="25" width="50" height="50" fill="#000"/></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/><line x1="25" y1="50" x2="75" y2="50" stroke="#fff" stroke-width="2.5"/></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="50" x2="75" y2="50" stroke="#000" stroke-width="2.5"/></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/><line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="2.5"/></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/><line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="2.5"/></svg>
**B:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="#000"/></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><path d="M50 20 L80 80 L20 80 Z" fill="none" stroke="#000" stroke-width="2.5"/></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="25" fill="#000"/><line x1="25" y1="50" x2="75" y2="50" stroke="#fff" stroke-width="2.5"/></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="25" y1="25" x2="75" y2="75" stroke="#000" stroke-width="2.5"/></svg>
**F — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><line x1="50" y1="20" x2="50" y2="80" stroke="#000" stroke-width="2.5"/></svg>

---

## FRÅGA 15 — Tre variabler: Form, Rotation & Position (svårighet 3)
**ID:** v6-q15-three-variables
**Regel:** Raden bestämmer formen (pil, T-kors, L-form). Kolumnen bestämmer rotationen (0°, 90°, 180°). Dessutom flyttar sig hela formen ett steg diagonalt (neråt höger) för varje cell.
**Korrekt svar:** B (index 1)

### Matrix 3×3

**R1C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(-15, -15) rotate(0, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R1C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(0, 0) rotate(90, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R1C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(15, 15) rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>
**R2C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(-15, -15) rotate(0, 50, 50)"><path d="M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**R2C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(0, 0) rotate(90, 50, 50)"><path d="M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**R2C3:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(15, 15) rotate(180, 50, 50)"><path d="M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**R3C1:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(-15, -15) rotate(0, 50, 50)"><path d="M 25 25 V 75 H 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**R3C2:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(0, 0) rotate(90, 50, 50)"><path d="M 25 25 V 75 H 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**R3C3 – TOM (? cell)**

### Svarsalternativ

**A:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(0, 0) rotate(180, 50, 50)"><path d="M 25 25 V 75 H 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**B — (RÄTT):**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(15, 15) rotate(180, 50, 50)"><path d="M 25 25 V 75 H 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**C:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(15, 15) rotate(90, 50, 50)"><path d="M 25 25 V 75 H 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**D:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(15, 15) rotate(180, 50, 50)"><path d="M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**E:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(15, 15) rotate(270, 50, 50)"><path d="M 25 25 V 75 H 75" fill="none" stroke="#000" stroke-width="3"/></g></svg>
**F:**
<svg viewBox="0 0 100 100" width="100" height="100" shape-rendering="geometricPrecision"><g transform="translate(15, 15) rotate(180, 50, 50)"><path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="#000"/></g></svg>