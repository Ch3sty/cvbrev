// scripts/artikelbild/mall.mjs
// =============================================================================
// Artikelbilden "På bordet" (docs/design/koncept-artikelbilder-2026-11-14.md):
// en mall per ämne. Underlaget fyller i ett litet objekt per artikel, mallen
// ritar SVG:n. Ingen fri komposition: mått, lägen, färger, typsnitt och de
// fasta orden står här och ändras bara med art-directors beslut.
//
// Text som ska läsas står alltid rakt (0 grader) och i 28 px (läsrader) eller
// 20 px (versala etiketter och axeltal, märkta data-liten). Bara matrisen och
// det tomma arket bakom huvudkortet lutar.
//
// Ren modul utan beroenden. Radbrytningen får en mätfunktion (mat) som
// artikelbild.ts hämtar ur Chrome med de riktiga typsnitten; valideringen mäter
// sedan varje rad igen med getBBox (minst 24 px luft till ruta eller kort).
// =============================================================================

export const RUM = {
  tran: { ljus: '#93A0EC', vagg: '#1B2246', ton: '#DFE3F6' },
  cv:   { ljus: '#7FCFCA', vagg: '#113538', ton: '#D7ECEA' },
  brev: { ljus: '#E29DCB', vagg: '#3A1930', ton: '#F0DCE8' },
  jobb: { ljus: '#8FD3A0', vagg: '#1B3324', ton: '#DCEBDD' },
  neu:  { ljus: '#C9C8D2', vagg: '#26262C', ton: '#E2E1E6' },
};
export const F = {
  papper: '#FFFFFF', ink: '#1C1917', ink2: '#57534E', ink3: '#6B645E',
  kant: '#E3E1DC', kantStark: '#C9C6BF', insankt: '#F4F3F0',
  figInk: '#020617', figGra: '#CBD5E1', figRam: '#64748B',
  koppar: '#E07A2F', kopparInk: '#A8491A', kopparMjuk: '#FBE3D0',
};
/** Mallens egna ord: kontrolleras inte mot artikeln. */
export const FAST_ORD = [
  'PROFIL', 'ERFARENHET', 'INTERVJUFRÅGA', 'LÖNESAMTALET', 'Jobbcoachen', 'Hej,', 'Lön i dag', 'sekunder',
  'ett helt svar', 'skillnaden om året', 'procent mer', 'Situation', 'Uppgift', 'Handling', 'Resultat',
  // Chippen på testkorten: provets egna rubriker.
  'DIN FRÅGA', 'STAR', 'UPPGIFT', 'PÅSTÅENDE', 'SYNONYM', 'MOTSATSORD', 'TALSERIE', 'STANINE', 'RESULTAT', 'SLUTSATS',
];
/** Fiktiva personer i CV-arket när yrket saknar exempelsida (exempelsidornas namn läses in i artikelbild.ts). */
export const PERSONER_RESERV = ['Maria Nilsson', 'Erik Lindberg', 'Sara Ahmed', 'Johan Berg', 'Lina Karlsson', 'Ali Hassan', 'Emma Svensson', 'Oskar Lund', 'Nora Eriksson', 'David Holm'];

export const MIN_BROD = 28, MIN_LITEN = 20, MARGINAL = 24;
export const DISPLAY = "'Schibsted Grotesk', Inter, Arial, sans-serif";
export const BROD = 'Inter, Arial, sans-serif';

export const t = (v) => (typeof v === 'string' ? v : v.text);
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(/[^\x00-\x7F]/g, (c) => `&#${c.codePointAt(0)};`);

/** Fel i underlaget som stoppar bilden (radbrytning som inte ryms och liknande). */
export class MallFel extends Error {}

/* ------------------------------------------------------------ radbrytning */
/**
 * Bryter en text i rader som ryms inom maxW px. En lista behålls som den är
 * (handbruten), en sträng bryts girigt på mellanslag. Fler rader än maxRader
 * stoppar bilden: välj en kortare mening hellre än mindre text.
 */
export function bryt(ctx, varde, { size, weight, fam = BROD, maxW, maxRader, namn }) {
  const text = Array.isArray(varde) ? null : t(varde);
  let lines;
  if (Array.isArray(varde)) lines = varde.map(t);
  else {
    const ord = text.split(/\s+/).filter(Boolean);
    lines = [];
    let rad = '';
    for (const o of ord) {
      const prov = rad ? `${rad} ${o}` : o;
      if (!rad || ctx.mat(prov, size, weight, fam) <= maxW) rad = prov;
      else { lines.push(rad); rad = o; }
    }
    if (rad) lines.push(rad);
  }
  for (const l of lines) if (ctx.mat(l, size, weight, fam) > maxW) ctx.fel.push(`${namn}: raden "${l}" är bredare än ${maxW} px`);
  if (lines.length > maxRader) ctx.fel.push(`${namn}: ${lines.length} rader (högst ${maxRader}). Välj en kortare mening.`);
  return lines;
}

/* --------------------------------------------------------------- kort */
/** Ett rakt kort med platt skugga. data-kort bär måtten så att mätningen hittar kanten. */
function kort({ x, y, w, h, rum, r = 28, inner = '', rot = 0, huvud = false }) {
  const cx = x + w / 2, cy = y + h / 2;
  return `<g${huvud ? ' data-huvud="1"' : ''}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}>
<rect x="${x}" y="${y + 22}" width="${w}" height="${h}" rx="${r}" fill="${RUM[rum].vagg}" opacity="0.32"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${F.papper}"/>
<g transform="translate(${x} ${y})" data-kort="0,0,${w},${h}">${inner}</g>
</g>`;
}
/** Det tomma arket bakom huvudkortet: lutar, bär ingen text. */
function arkBakom(x, y, w, h, rum, r = 28) {
  const cx = x + w / 2, cy = y + h / 2;
  return `<g transform="rotate(-5 ${cx} ${cy})"><rect x="${x - 14}" y="${y + 12}" width="${w}" height="${h}" rx="${r}" fill="${RUM[rum].vagg}" opacity="0.22"/><rect x="${x - 14}" y="${y - 6}" width="${w}" height="${h}" rx="${r}" fill="${RUM[rum].ton}"/></g>`;
}
/** En ruta inne i kortet (markering, bubbla): texten mäts mot rutan, inte kortet. */
function ruta(x, y, w, h, attrs, inner) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attrs}/><g data-ruta="${x},${y},${w},${h}">${inner}</g>`;
}
const rader = (lines, x, y0, lh, size, weight, fill, fam = BROD) =>
  lines.map((l, i) => `<text x="${x}" y="${y0 + i * lh}" font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(l)}</text>`).join('');
const chip = (ctx, text, rum, x = 40, y = 40) => {
  const w = Math.round(ctx.mat(text, 20, 700) + text.length * 1.5 + 40);
  return `<rect x="${x}" y="${y}" width="${w}" height="44" rx="22" fill="${RUM[rum].ton}"/><text data-liten="1" x="${x + 20}" y="${y + 30}" font-family="${BROD}" font-size="20" font-weight="700" letter-spacing="1.5" fill="${RUM[rum].vagg}">${esc(text)}</text>`;
};

function etikett(text, rum) {
  return `<text data-etikett="1" x="154" y="196" font-family="${DISPLAY}" font-size="64" font-weight="800" letter-spacing="-1.5" fill="${RUM[rum].vagg}">${esc(t(text))}</text>`;
}
function ram(rum, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
<rect width="1536" height="1024" fill="${RUM[rum].ljus}"/>
<circle cx="1040" cy="540" r="430" fill="${RUM[rum].ton}" opacity="0.45"/>
${inner}
</svg>`;
}
/** Huvudkortets läge: rakt, x 740, y 250. */
const HX = 740, HY = 250;

/* ---------------------------------------------------------------- figurer */
/** Luckan som i produkten: streckad ram och ritat frågetecken, ingen text, inget orange. */
function lucka(size, sw = 5.5) {
  return `<g transform="scale(${size / 100})" fill="none" stroke="${F.figRam}" stroke-linecap="round" stroke-linejoin="round">
<rect x="16" y="16" width="68" height="68" rx="8" stroke-width="${sw * 0.72}" stroke-dasharray="5 4"/>
<path d="M38 40 A12 12 0 1 1 55 51 Q50 55 50 62" stroke-width="${sw * 1.4}"/>
<circle cx="50" cy="73" r="3.2" fill="${F.figRam}" stroke="none"/></g>`;
}
/**
 * En figur ur testernas ritare (FigurV7, SpatialSvg) i en ruta. svg är
 * ritarens innehåll i 0-100-rymden, förritat av figurer.tsx.
 */
const figurIRuta = (svg, x, y, size, luft = 0.1) => {
  const s = (size * (1 - 2 * luft)) / 100;
  return `<g transform="translate(${x + size * luft} ${y + size * luft}) scale(${s})">${svg}</g>`;
};

/** Matrisen (3 × 3 eller 2 × 2): ingen text, så kortet får luta som provkortet på sidan. */
function matrisKort(u, rum) {
  const n = u.kolumner, pad = 36, cell = Math.round(528 / n);
  const w = pad * 2 + cell * n;
  let inner = '';
  for (let i = 1; i < n; i++) inner += `<path d="M${pad + cell * i} ${pad}v${cell * n}M${pad} ${pad + cell * i}h${cell * n}" stroke="${F.kant}" stroke-width="3"/>`;
  u.celler.forEach((c, i) => {
    const cx = pad + (i % n) * cell, cy = pad + Math.floor(i / n) * cell;
    if (c === null) inner += `<rect x="${cx}" y="${cy}" width="${cell}" height="${cell}" fill="${F.insankt}"/><g transform="translate(${cx} ${cy})">${lucka(cell)}</g>`;
    else inner += figurIRuta(c, cx, cy, cell, 0);
  });
  return kort({ x: HX, y: HY, w, h: w, rum, inner, rot: -4, huvud: true });
}
/** Figurserien: fem figurer och luckan, tre per rad som i provets smala kolumn. */
function serieKort(u, rum) {
  const pad = 36, cell = 176, w = pad * 2 + cell * 3, h = pad * 2 + cell * 2;
  let inner = `<path d="M${pad + cell} ${pad}v${cell * 2}M${pad + cell * 2} ${pad}v${cell * 2}M${pad} ${pad + cell}h${cell * 3}" stroke="${F.kant}" stroke-width="3"/>`;
  u.celler.forEach((c, i) => {
    const cx = pad + (i % 3) * cell, cy = pad + Math.floor(i / 3) * cell;
    if (c === null) inner += `<rect x="${cx}" y="${cy}" width="${cell}" height="${cell}" fill="${F.insankt}"/><g transform="translate(${cx} ${cy})">${lucka(cell)}</g>`;
    else inner += figurIRuta(c, cx, cy, cell, 0);
  });
  return kort({ x: HX, y: HY + 40, w, h, rum, inner, rot: -4, huvud: true });
}
/** Spatial förmåga: vikningen (eller tärningen) steg för steg och luckan sist. Ingen text. */
function spatialKort(u, rum) {
  // Stegen två i bredd med pil emellan och luckan sist: stort nog att läsas i 360 px.
  const rutor = [...u.steg, null]; // förritade SpatialSvg-figurer, null är luckan
  const pad = 36, gap = 48, cell = 240, w = 600;
  const rows = Math.ceil(rutor.length / 2), h = pad * 2 + rows * cell + (rows - 1) * 36;
  let inner = '';
  rutor.forEach((s, i) => {
    const ensam = i === rutor.length - 1 && rutor.length % 2 === 1;
    const x = ensam ? (w - cell) / 2 : pad + (i % 2) * (cell + gap), y = pad + Math.floor(i / 2) * (cell + 36);
    inner += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="18" fill="${F.insankt}"/>`;
    inner += s === null ? `<g transform="translate(${x} ${y})">${lucka(cell)}</g>` : figurIRuta(s, x, y, cell, 0.04);
    if (i % 2 === 0 && i + 1 < rutor.length && !(i + 1 === rutor.length - 1 && rutor.length % 2 === 1)) {
      const ax = x + cell + gap / 2 - 6, ay = y + cell / 2;
      inner += `<path d="M${ax} ${ay - 12}l12 12-12 12" fill="none" stroke="${F.figRam}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });
  return kort({ x: HX, y: HY + (rows === 1 ? 160 : 0), w, h, rum, inner, rot: -4, huvud: true });
}

/** Talserien: talen i rutor, luckan sist. Raka kort, eftersom talen är text. */
function talserieKort(ctx, u, rum) {
  const tal = u.visade.map(String), luckor = u.luckor;
  const alla = [...tal, ...Array(luckor).fill(null)];
  const per = alla.length > 6 ? 4 : 3, rows = Math.ceil(alla.length / per);
  const bw = Math.floor((520 - (per - 1) * 16) / per), bh = 112;
  // Minst 440 px högt kort: rutorna centreras i höjdled under chippen.
  const naturlig = 112 + rows * (bh + 16) + 24, top = 112 + Math.max(0, Math.round((440 - naturlig) / 2));
  let s = chip(ctx, 'TALSERIE', rum);
  alla.forEach((v, i) => {
    const x = 40 + (i % per) * (bw + 16), y = top + Math.floor(i / per) * (bh + 16);
    if (v === null) {
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="16" fill="${F.insankt}" stroke="${F.figRam}" stroke-width="3" stroke-dasharray="9 7"/>`;
      s += `<g transform="translate(${x + bw / 2 - 56} ${y + bh / 2 - 56})">${lucka(112).replace(/<rect[^>]*\/>/, '')}</g>`;
    } else {
      s += ruta(x, y, bw, bh, `rx="16" fill="${F.papper}" stroke="${F.kantStark}" stroke-width="3"`,
        `<text x="${x + bw / 2}" y="${y + bh / 2 + 17}" text-anchor="middle" font-family="${DISPLAY}" font-size="48" font-weight="800" fill="${F.ink}">${esc(v)}</text>`);
      if (ctx.mat(v, 48, 800, DISPLAY) > bw - 48) ctx.fel.push(`talserie: talet ${v} ryms inte i rutan`);
    }
  });
  const h = Math.max(440, naturlig);
  return arkBakom(HX, HY, 600, h, rum) + kort({ x: HX, y: HY, w: 600, h, rum, inner: s, huvud: true });
}
/** Ordförrådet: ordet i versaler och alternativen som chipp, som i provet. */
function ordKort(ctx, u, rum) {
  let s = chip(ctx, u.ordTyp === 'antonym' ? 'MOTSATSORD' : 'SYNONYM', rum);
  s += `<text x="40" y="168" font-family="${DISPLAY}" font-size="60" font-weight="800" letter-spacing="1" fill="${F.ink}">${esc(u.ord.toUpperCase())}</text>`;
  if (ctx.mat(u.ord.toUpperCase(), 60, 800, DISPLAY) > 520) ctx.fel.push(`ord: ${u.ord} ryms inte`);
  let x = 40, y = 210;
  const B = 'ABCDE';
  u.options.forEach((o, i) => {
    const w = Math.ceil(ctx.mat(o, 28, 500) + ctx.mat(B[i], 20, 700) + 14 + 56);
    if (x + w > 560) { x = 40; y += 98; }
    s += ruta(x, y, w, 84, `rx="42" fill="${F.papper}" stroke="${F.kantStark}" stroke-width="3"`,
      `<text data-liten="1" x="${x + 28}" y="${y + 52}" font-family="${BROD}" font-size="20" font-weight="700" fill="${F.ink3}">${B[i]}</text><text x="${x + 28 + ctx.mat(B[i], 20, 700) + 14}" y="${y + 52}" font-family="${BROD}" font-size="28" font-weight="500" fill="${F.ink}">${esc(o)}</text>`);
    x += w + 14;
  });
  // Alternativen läses mot chippen (24 px luft till ruta), inte bara mot kortet.
  const h = y + 84 + 40;
  return arkBakom(HX, HY, 600, h, rum) + kort({ x: HX, y: HY, w: 600, h, rum, inner: s, huvud: true });
}
/**
 * Textuppgift (deduktiv, verbal, numerisk, personlighet): chip, uppgiften i
 * 32 px och antingen alternativen som chipp eller skalan 1 till 5.
 */
/** Hur många rader svarschippen blir i 520 px (samma flöde som i fragaKort). */
function antalRader(ctx, alternativ) {
  let x = 40, n = 1;
  for (const o of alternativ) {
    const w = Math.ceil(ctx.mat(t(o), 28, 500) + 56);
    if (x + w > 560) { x = 40; n++; }
    x += w + 14;
  }
  return n;
}
function fragaKort(ctx, f, rum) {
  const lines = bryt(ctx, f.uppgiftText, { size: 32, weight: 700, fam: DISPLAY, maxW: 520, maxRader: 5, namn: 'uppgiften' });
  let s = chip(ctx, t(f.chip), rum);
  // Huvudkortet är minst 440 px högt (konceptet, avsnitt 2). Ett kort kort får
  // luften jämnt fördelad: uppgiften och svarsraden centreras under chippen.
  const svarH = f.alternativ?.length ? 10 + 84 + 98 * (antalRader(ctx, f.alternativ) - 1) : f.skala ? 16 + 56 : 0;
  const textSlut = 150 + (lines.length - 1) * 44 + 44;
  const extra = Math.max(0, 440 - 44 - svarH - textSlut);
  const textY = 150 + Math.round(extra / 2);
  s += rader(lines, 40, textY, 44, 32, 700, F.ink, DISPLAY);
  let y = textY + (lines.length - 1) * 44 + 44 + Math.round(extra / 4);
  if (y + svarH + 44 < 440) y = 440 - 44 - svarH;
  if (f.alternativ?.length) {
    let x = 40;
    y += 10;
    f.alternativ.forEach((o, i) => {
      const txt = t(o);
      const w = Math.ceil(ctx.mat(txt, 28, 500) + 56);
      if (x + w > 560) { x = 40; y += 98; }
      s += ruta(x, y, w, 84, `rx="42" fill="${F.papper}" stroke="${F.kantStark}" stroke-width="3"`,
        `<text x="${x + 28}" y="${y + 52}" font-family="${BROD}" font-size="28" font-weight="500" fill="${F.ink}">${esc(txt)}</text>`);
      x += w + 14;
    });
    y += 84;
  } else if (f.skala) {
    // Skalan 1 till 5 som provets reglage, inget läge valt.
    y += 16;
    const sw = 92, gap = 15;
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * (sw + gap);
      s += `<rect x="${x}" y="${y}" width="${sw}" height="56" rx="14" fill="${F.insankt}" stroke="${F.kantStark}" stroke-width="3"/>`;
      s += `<text data-liten="1" x="${x + sw / 2}" y="${y + 36}" text-anchor="middle" font-family="${BROD}" font-size="22" font-weight="700" fill="${F.ink2}">${i + 1}</text>`;
    }
    y += 56;
  }
  const h = y + 44;
  return arkBakom(HX, HY, 600, h, rum) + kort({ x: HX, y: HY, w: 600, h, rum, inner: s, huvud: true });
}
/** Resultatskalan (stanine och liknande): staplar med andel, de vanligaste stegen i orange. */
function skalaKort(ctx, f, rum) {
  const n = f.staplar.length, max = Math.max(...f.staplar);
  const bw = Math.floor((520 - (n - 1) * 10) / n), base = 420;
  let s = chip(ctx, t(f.chip), rum);
  f.staplar.forEach((v, i) => {
    const hh = Math.round(30 + (v / max) * 250), x = 40 + i * (bw + 10), a = f.lyft.includes(i + 1);
    s += `<rect x="${x}" y="${base - hh}" width="${bw}" height="${hh}" rx="10" fill="${a ? F.koppar : F.kantStark}"/>`;
    s += `<text data-liten="1" x="${x + bw / 2}" y="${base + 40}" text-anchor="middle" font-family="${BROD}" font-size="24" font-weight="700" fill="${F.ink2}">${i + 1}</text>`;
  });
  const h = base + 40 + 44;
  return arkBakom(HX, HY, 600, h, rum) + kort({ x: HX, y: HY, w: 600, h, rum, inner: s, huvud: true });
}

/* ------------------------------------------------------- vänsterkorten */
/** Tre citat med bock. Ett citat får brytas i två rader; hellre tre korta rader än sex små. */
function bockKort(ctx, rum, lista, y = 330) {
  const w = 560;
  let inner = '', cy = 44;
  lista.forEach((r, i) => {
    const lines = bryt(ctx, r, { size: 28, weight: 600, maxW: 560 - 88 - MARGINAL, maxRader: 2, namn: `citat ${i + 1}` });
    const mid = cy + 26;
    inner += `<circle cx="50" cy="${mid}" r="21" fill="${F.ink}"/><path d="M40 ${mid} l7 7 l14 -15" fill="none" stroke="${F.papper}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    inner += rader(lines, 88, mid + 10, 38, 28, 600, F.ink);
    cy += 76 + (lines.length - 1) * 38;
  });
  if (lista.length < 2 || lista.length > 3) ctx.fel.push(`det lilla kortet har ${lista.length} citat (2 eller 3)`);
  return kort({ x: 154, y, w, h: cy, rum, r: 24, inner });
}
function tidOchSkala(ctx, rum, { tid, tidText, rubrik, skala, lyft }) {
  const w = 560, h = 350;
  let s = `<circle cx="78" cy="88" r="34" fill="none" stroke="${F.koppar}" stroke-width="8"/><path d="M78 66v24l14 10" fill="none" stroke="${F.koppar}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<text x="132" y="108" font-family="${DISPLAY}" font-size="60" font-weight="800" letter-spacing="-1.5" fill="${F.ink}">${esc(t(tid))}</text>`;
  const tx = Math.max(300, Math.ceil(132 + ctx.mat(t(tid), 60, 800, DISPLAY) + 24));
  s += `<text x="${tx}" y="106" font-family="${BROD}" font-size="28" font-weight="500" fill="${F.ink2}">${esc(t(tidText))}</text>`;
  s += `<text x="40" y="186" font-family="${BROD}" font-size="28" font-weight="600" fill="${F.ink2}">${esc(t(rubrik))}</text>`;
  const n = skala.length, gap = 8, bw = Math.floor((480 - gap * (n - 1)) / n), bx = 40, base = 292;
  skala.forEach((v, i) => {
    const hh = 20 + Math.round(v * 70), a = lyft.includes(i + 1);
    s += `<rect x="${bx + i * (bw + gap)}" y="${base - hh}" width="${bw}" height="${hh}" rx="8" fill="${a ? F.koppar : F.kantStark}"/>`;
    s += `<text data-liten="1" x="${bx + i * (bw + gap) + bw / 2}" y="${base + 28}" text-anchor="middle" font-family="${BROD}" font-size="20" font-weight="700" fill="${F.ink2}">${i + 1}</text>`;
  });
  return kort({ x: 154, y: 320, w, h, rum, r: 24, inner: s });
}
/** Ett tal i en hel ring (ingen andel: en andel utan källa skulle läsas som ett värde). */
function ringKort(ctx, rum, { tal, enhet = 'sekunder', text = 'ett helt svar' }) {
  const w = 560, cx = 112, cy = 115, r = 72;
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${F.koppar}" stroke-width="18"/>`;
  s += `<text x="${cx}" y="${cy + 16}" text-anchor="middle" font-family="${DISPLAY}" font-size="46" font-weight="800" letter-spacing="-1" fill="${F.ink}">${esc(t(tal))}</text>`;
  if (ctx.mat(t(tal), 46, 800, DISPLAY) > 2 * (r - 9) - 16) ctx.fel.push(`ringens tal "${t(tal)}" ryms inte i ringen`);
  const e = bryt(ctx, enhet, { size: 36, weight: 800, fam: DISPLAY, maxW: w - 220 - MARGINAL, maxRader: 1, namn: 'ringens enhet' });
  const l = bryt(ctx, text, { size: 28, weight: 500, maxW: w - 220 - MARGINAL, maxRader: 2, namn: 'ringens text' });
  s += rader(e, 220, 104, 40, 36, 800, F.ink, DISPLAY);
  s += rader(l, 220, 146, 36, 28, 500, F.ink2);
  return kort({ x: 154, y: 330, w, h: 230 + (l.length - 1) * 36, rum, r: 24, inner: s });
}
function talKort(ctx, rum, rubrik, tal) {
  const w = 560, h = 196;
  let s = `<text x="40" y="72" font-family="${BROD}" font-size="28" font-weight="600" fill="${F.ink2}">${esc(t(rubrik))}</text>`;
  s += `<text x="40" y="144" font-family="${DISPLAY}" font-size="60" font-weight="800" letter-spacing="-1.5" fill="${F.ink}">${esc(t(tal))}</text>`;
  return kort({ x: 154, y: 330, w, h, rum, r: 24, inner: s });
}

/* --------------------------------------------------------------- arken */
function stapelRad(y, w, x = 48) { return `<rect x="${x}" y="${y}" width="${w}" height="12" rx="6" fill="${F.kant}"/>`; }
export const CV_SEKTIONER = ['PROFIL', 'ERFARENHET', 'KOMPETENSER', 'UTBILDNING', 'SPRÅK', 'INTRESSEN', 'REFERENSER', 'KONTAKT'];
function cvArk(ctx, namn, yrke, profilVarde, sektion = 'PROFIL') {
  if (!CV_SEKTIONER.includes(sektion)) ctx.fel.push(`okänd CV-sektion ${sektion} (${CV_SEKTIONER.join(", ")})`);
  const profil = bryt(ctx, profilVarde, { size: 28, weight: 500, maxW: 444, maxRader: 4, namn: 'profilen' });
  bryt(ctx, yrke, { size: 28, weight: 500, maxW: 488, maxRader: 1, namn: 'yrket' });
  let s = `<text x="48" y="88" font-family="${DISPLAY}" font-size="40" font-weight="800" letter-spacing="-0.8" fill="${F.ink}">${esc(namn)}</text>`;
  s += `<text x="48" y="126" font-family="${BROD}" font-size="28" font-weight="500" fill="${F.ink2}">${esc(t(yrke))}</text>`;
  s += `<line x1="48" y1="156" x2="512" y2="156" stroke="${F.kant}" stroke-width="2"/>`;
  s += `<text data-liten="1" x="48" y="202" font-family="${BROD}" font-size="20" font-weight="700" letter-spacing="2" fill="${F.ink3}">PROFIL</text>`;
  // Ringen ligger i den sektion raden hör hemma i (art-director 2026-11-15):
  // PROFIL överst som förut, annars två grå profilrader och sektionen under.
  let top = 222;
  if (sektion !== 'PROFIL') {
    s += stapelRad(top + 4, 440) + stapelRad(top + 28, 360);
    top += 80;
    s += `<text data-liten="1" x="48" y="${top}" font-family="${BROD}" font-size="20" font-weight="700" letter-spacing="2" fill="${F.ink3}">${esc(sektion)}</text>`;
    top += 20;
  }
  const lh = 40, h = profil.length * lh + 50;
  s += ruta(30, top, 500, h, `rx="14" fill="${F.kopparMjuk}" stroke="${F.koppar}" stroke-width="5"`, rader(profil, 62, top + 54, lh, 28, 500, F.ink));
  let y = top + h + 54;
  if (sektion === 'PROFIL') {
    s += `<text data-liten="1" x="48" y="${y}" font-family="${BROD}" font-size="20" font-weight="700" letter-spacing="2" fill="${F.ink3}">ERFARENHET</text>`;
    y += 26;
  } else y -= 24;
  // Grå rader bara så långt kortet räcker: allt slutar minst 24 px ovanför kanten (640).
  for (const [w, fet] of [[300, 1], [440, 0], [380, 0], [0, 0], [280, 1], [440, 0], [380, 0]]) {
    if (y + 14 > 640 - MARGINAL) break;
    if (w) s += fet ? `<rect x="48" y="${y}" width="${w}" height="14" rx="7" fill="${F.kantStark}"/>` : stapelRad(y, w);
    y += fet ? 26 : 24;
  }
  return s;
}
function brevArk(ctx, mottagare, styckeVarde, halsning = "Hej,", lage = 'inledning') {
  const stycke = bryt(ctx, styckeVarde, { size: 28, weight: 500, maxW: 444, maxRader: 4, namn: 'inledningen' });
  bryt(ctx, mottagare, { size: 28, weight: 600, maxW: 488, maxRader: 1, namn: 'ansökansraden' });
  let s = `<text x="48" y="80" font-family="${BROD}" font-size="28" font-weight="600" fill="${F.ink3}">${esc(t(mottagare))}</text>`;
  s += `<text x="48" y="142" font-family="${DISPLAY}" font-size="36" font-weight="800" letter-spacing="-0.5" fill="${F.ink}">${esc(t(halsning))}</text>`;
  const lh = 40, h = stycke.length * lh + 50;
  const markering = (top) => ruta(30, top, 500, h, `rx="14" fill="${F.kopparMjuk}" stroke="${F.koppar}" stroke-width="5"`, rader(stycke, 62, top + 54, lh, 28, 500, F.ink));
  if (lage === 'avslut') {
    // Avslutningen inringad (art-director 2026-11-15): brödtexten först, ringen
    // sist i brevet och en kort namnrad under, som i ett riktigt brev.
    let y = 184;
    for (const w of [460, 440, 470, 320, 0, 460, 450, 420, 380]) {
      if (w) s += stapelRad(y, w);
      y += 24;
    }
    const top = y + 12;
    s += markering(top);
    if (top + h + 24 + 12 <= 640 - MARGINAL) s += `<rect x="48" y="${top + h + 24}" width="180" height="14" rx="7" fill="${F.kantStark}"/>`;
    return s;
  }
  if (lage !== 'inledning') ctx.fel.push(`okänt läge för brevet: ${lage} (inledning eller avslut)`);
  const top = 172;
  s += markering(top);
  let y = top + h + 44;
  for (const w of [460, 440, 470, 320, 0, 460, 450, 420, 0, 220]) {
    if (y + 12 > 640 - MARGINAL) break;
    if (w) s += stapelRad(y, w);
    y += 24;
  }
  return s;
}
const ARK = (sheet, rum) => arkBakom(HX + 40, HY, 560, 640, rum, 18) + kort({ x: HX + 40, y: HY, w: 560, h: 640, rum, r: 18, inner: sheet, huvud: true });

/* --------------------------------------------------------- intervjukortet */
export const FRAGEKORT_CHIP = ['INTERVJUFRÅGA', 'DIN FRÅGA', 'STAR'];
function fragekort(ctx, fragaVarde, delar, rum, ringOrange = false, chipText = 'INTERVJUFRÅGA') {
  // Chippen säger vem som ställer frågan (art-director 2026-11-15): intervjuaren, läsaren själv eller metoden.
  if (!FRAGEKORT_CHIP.includes(chipText)) ctx.fel.push('frågekortets chip ska vara ' + FRAGEKORT_CHIP.join(', '));
  const fraga = bryt(ctx, fragaVarde, { size: 32, weight: 700, fam: DISPLAY, maxW: 600 - 40 - MARGINAL, maxRader: 3, namn: 'intervjufrågan' });
  const w = 600, h = 140 + fraga.length * 42 + 20 + delar.length * 86 + 30;
  let s = chip(ctx, chipText, rum);
  s += rader(fraga, 40, 140, 42, 32, 700, F.ink, DISPLAY);
  let y = 140 + fraga.length * 42 + 20;
  delar.forEach(([bokstav, namn, andel, accent]) => {
    bryt(ctx, namn, { size: 28, weight: 600, maxW: 600 - 112 - MARGINAL, maxRader: 1, namn: 'delens namn' });
    s += `<circle cx="66" cy="${y + 28}" r="26" fill="${accent ? F.koppar : F.ink}"/><text x="66" y="${y + 38}" text-anchor="middle" font-family="${DISPLAY}" font-size="28" font-weight="800" fill="${F.papper}">${esc(bokstav)}</text>`;
    s += `<text x="112" y="${y + 22}" font-family="${BROD}" font-size="28" font-weight="600" fill="${F.ink2}">${esc(t(namn))}</text>`;
    s += `<rect x="112" y="${y + 34}" width="${Math.round(440 * andel)}" height="18" rx="9" fill="${accent ? F.koppar : F.kantStark}"/>`;
    y += 86;
  });
  // Orange på exakt en sak: en del, eller ingen när delarna är likvärdiga och ringen bär orange.
  const orange = delar.filter((d) => d[3]).length;
  if (!(orange === 1 || (orange === 0 && ringOrange))) ctx.fel.push('frågekortet ska ha exakt en del i orange (eller ingen, med ringen till vänster)');
  return arkBakom(HX, HY, w, h, rum) + kort({ x: HX, y: HY, w, h, rum, inner: s, huvud: true });
}

/* ------------------------------------------------------------ lönekortet */
function stapelKort(ctx, staplar, summa, summaText, rum, chipText = 'LÖNESAMTALET') {
  // Lönekortet. Utan staplar (artikeln har bara en skillnad, inga två lönelägen)
  // bär kortet bara summan; hellre ett tal ur artikeln än två påhittade.
  const w = 600;
  let s = chip(ctx, t(chipText), rum);
  let y = 130;
  if (staplar.length) {
    const max = Math.max(...staplar.map((st) => st.tal));
    staplar.forEach(({ namn, varde, tal, accent }) => {
      bryt(ctx, namn, { size: 28, weight: 600, maxW: 520, maxRader: 1, namn: 'stapelns namn' });
      s += `<text x="40" y="${y + 24}" font-family="${BROD}" font-size="28" font-weight="600" fill="${F.ink2}">${esc(t(namn))}</text>`;
      const bw = Math.round(340 * (tal / max));
      s += `<rect x="40" y="${y + 40}" width="${bw}" height="44" rx="12" fill="${accent ? F.koppar : F.kantStark}"/>`;
      s += `<text x="${40 + bw + 16}" y="${y + 72}" font-family="${DISPLAY}" font-size="32" font-weight="800" fill="${F.ink}">${esc(t(varde))}</text>`;
      y += 124;
    });
    if (staplar.filter((x) => x.accent).length !== 1) ctx.fel.push('lönekortet ska ha exakt en stapel i orange');
    s += `<line x1="40" y1="${y + 8}" x2="560" y2="${y + 8}" stroke="${F.kant}" stroke-width="2"/>`;
  } else y -= 10;
  s += `<text x="40" y="${y + 96}" font-family="${DISPLAY}" font-size="76" font-weight="800" letter-spacing="-2" fill="${F.kopparInk}">${esc(t(summa))}</text>`;
  const l = bryt(ctx, summaText, { size: 28, weight: 500, maxW: 520, maxRader: staplar.length ? 1 : 3, namn: 'summans text' });
  s += rader(l, 40, y + 140, 38, 28, 500, F.ink2);
  const h = staplar.length ? 580 : y + 140 + (l.length - 1) * 38 + 44;
  return arkBakom(HX, HY, w, h, rum) + kort({ x: HX, y: HY, w, h, rum, inner: s, huvud: true });
}

/* ------------------------------------------------------------ Jobbcoachen */
function chattKort(ctx, fragaVarde, svarVarde, rum) {
  const fraga = bryt(ctx, fragaVarde, { size: 28, weight: 500, maxW: 444, maxRader: 3, namn: 'frågan' });
  const svar = bryt(ctx, svarVarde, { size: 28, weight: 500, maxW: 444, maxRader: 3, namn: 'svaret' });
  const w = 600, lh = 40;
  let s = `<circle cx="66" cy="66" r="26" fill="${F.koppar}"/><text x="66" y="76" text-anchor="middle" font-family="${DISPLAY}" font-size="28" font-weight="800" fill="${F.papper}">J</text>`;
  s += `<text x="108" y="76" font-family="${DISPLAY}" font-size="28" font-weight="800" fill="${F.ink}">Jobbcoachen</text>`;
  const bh1 = fraga.length * lh + 50;
  s += ruta(w - 40 - 500, 120, 500, bh1, `rx="24" fill="${RUM[rum].vagg}"`, rader(fraga, w - 40 - 500 + 32, 120 + 54, lh, 28, 500, F.papper));
  const y2 = 120 + bh1 + 24, bh2 = svar.length * lh + 50;
  s += ruta(40, y2, 500, bh2, `rx="24" fill="${F.insankt}"`, rader(svar, 72, y2 + 54, lh, 28, 500, F.ink));
  const h = y2 + bh2 + 44;
  return arkBakom(HX, HY, w, h, rum) + kort({ x: HX, y: HY, w, h, rum, inner: s, huvud: true });
}

/* ------------------------------------------------------------------ mallar */
/**
 * ctx: { mat(text, size, weight, fam) → px, fel: [], uppgift(id) → förritad uppgift }.
 * Uppgifterna (matris, serie, spatial, talserie, ord) hämtas av artikelbild.ts
 * ur src/lib/artikelfigurer och ritas med testernas egna ritare.
 */
export const MALLAR = {
  tester(ctx, f, rum) {
    const v = f.vanster;
    const vanster = v.typ === 'bockar' ? bockKort(ctx, rum, v.rader) : v.typ === 'tidskala' ? tidOchSkala(ctx, rum, v) : (ctx.fel.push(`okänt vänsterkort ${v.typ}`), '');
    const h = f.huvud;
    let huvud = '';
    if (h.typ === 'fraga') huvud = fragaKort(ctx, h, rum);
    else if (h.typ === 'skala') huvud = skalaKort(ctx, h, rum);
    else {
      const u = ctx.uppgift(h.uppgift);
      if (!u) ctx.fel.push(`okänd uppgift ${h.uppgift}`);
      else if (u.typ !== h.typ) ctx.fel.push(`uppgiften ${h.uppgift} är ${u.typ}, inte ${h.typ}`);
      else huvud = { matris: matrisKort, serie: serieKort, spatial: spatialKort }[u.typ]?.(u, rum)
        ?? (u.typ === 'talserie' ? talserieKort(ctx, u, rum) : ordKort(ctx, u, rum));
    }
    return ram(rum, etikett(f.etikett, rum) + vanster + huvud);
  },
  cv(ctx, f, rum) { return ram(rum, etikett(f.etikett, rum) + bockKort(ctx, rum, f.grepp) + ARK(cvArk(ctx, f.namn, f.yrke, f.profil, f.sektion), rum)); },
  brev(ctx, f, rum) { return ram(rum, etikett(f.etikett, rum) + bockKort(ctx, rum, f.grepp) + ARK(brevArk(ctx, f.mottagare, f.stycke, f.halsning, f.lage), rum)); },
  intervju(ctx, f, rum) {
    const v = f.vanster ?? { typ: 'ring', tal: f.tal };
    const vanster = v.typ === 'ring' ? ringKort(ctx, rum, v) : bockKort(ctx, rum, v.rader);
    return ram(rum, etikett(f.etikett, rum) + vanster + fragekort(ctx, f.fraga, f.delar, rum, v.typ === 'ring', f.chip));
  },
  lon(ctx, f, rum) {
    return ram(rum, etikett(f.etikett, rum) + talKort(ctx, rum, f.talRubrik ?? 'Lön i dag', f.lonIdag) + stapelKort(ctx, f.staplar ?? [], f.summa, f.summaText ?? 'skillnaden om året', rum, f.chip ?? 'LÖNESAMTALET'));
  },
  karriar(ctx, f, rum) { return ram(rum, etikett(f.etikett, rum) + bockKort(ctx, rum, f.grepp) + chattKort(ctx, f.fraga, f.svar, rum)); },
};
