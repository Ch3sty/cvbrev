// Bygger docs/design/tester-v2-2026-10-11/figurserier.html och renderar skärmdumpar hit.
// Kör: node node_modules/tsx/dist/cli.mjs bygg.tsx [--bara-html]
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { LuckaV3 } from '../grafik-v3/renderers.v3';
import { CellSerie, zonkontroll } from './renderers.serie';
import S from './geometri-serie.json';

const WT = 'C:/Users/chris/cvbrev/.claude/worktrees/omgang2';
const HAR = 'C:/Users/chris/AppData/Local/Temp/claude/c--Users-chris-cvbrev/fac165b0-fa4d-439d-8ef2-b30338e05c5d/scratchpad/figurserier';
const UT_HTML = path.join(WT, 'docs/design/tester-v2-2026-10-11/figurserier.html');
mkdirSync(HAR, { recursive: true });

type Fig = any;
type Serie = {
  id: string; variant: 'harnast' | 'bryter'; niva: 'grund' | 'avancerad' | 'expert'; regler: string; titel: string;
  rad: Fig[]; alternativ?: Fig[]; ratt: number; regel: string; misstag: Record<number, string>; not: string; primitiv: string;
};

const duo = (ytter: any, karna: any): Fig => ({ kind: 'duo', ytter, karna });
const kant = (lage: number, antal?: number) => (antal ? { typ: 'kant', lage, antal } : { typ: 'kant', lage });
const orb = (lage: number) => ({ typ: 'orbital', lage });
const pil = (vinkel: number) => ({ typ: 'pil', vinkel });
const form = (f: 'circle' | 'square' | 'diamond', fyllning: 'none' | 'black') => ({ typ: 'form', form: f, fyllning });
const vec = (angle: number, length: 'long' | 'short' = 'long', head: 'open' | 'filled' = 'open'): Fig => ({ kind: 'vector', angle, length, head });
const hjul = (filled: number[]): Fig => ({ kind: 'sectorwheel', filled });

const SERIER: Serie[] = [
  {
    id: 'fs-g-pil-45', variant: 'harnast', niva: 'grund', regler: 'en regel', titel: 'Pilen vrids 45 grader', primitiv: 'pil (klass A, oförändrad)',
    rad: [vec(0), vec(45), vec(90), vec(135), vec(180)],
    alternativ: [vec(270), vec(225, 'short'), vec(225), vec(315), vec(225, 'long', 'filled'), vec(270, 'short')],
    ratt: 2,
    regel: 'Pilen vrids 45 grader medurs i varje steg.',
    misstag: { 0: 'Pilen i A har vridits 90 grader från den femte. Steget i raden är 45 grader, ett halvt kvartsvarv.' },
    not: 'Period 8, fem visade lägen, facit är det sjätte. Två distraktorer på vridningen (270 och 315), tre på egenskaper raden håller fast (längd, spets). Ingen distraktor är en kopia av en visad figur (G9).',
  },
  {
    id: 'fs-a-kant-pil', variant: 'harnast', niva: 'avancerad', regler: 'två regler', titel: 'Pricken går längs kanten, pilen vrids 90 grader', primitiv: 'duo: kant + pil',
    rad: [duo(kant(7), pil(0)), duo(kant(0), pil(90)), duo(kant(1), pil(180)), duo(kant(2), pil(270)), duo(kant(3), pil(0))],
    alternativ: [duo(kant(4), pil(0)), duo(kant(3), pil(90)), duo(kant(4), pil(180)), duo(kant(4), pil(90)), duo(kant(5), pil(90)), duo(kant(4), pil(270))],
    ratt: 3,
    regel: 'Pricken går ett steg medurs längs kanten. Pilen vrids 90 grader medurs.',
    misstag: { 0: 'I A står pilen kvar som i den femte figuren. Pilen vrids 90 grader i varje steg; pricken har du rätt.' },
    not: 'Perioder 8 (pricken, steg 1) och 4 (pilen, steg 2). Pil 0 hör ihop med både prick 7 och prick 3, så rörelserna går inte i takt (G7). Hela figuren har period 8, facit (prick 4, pil 90) är ny (G9).',
  },
  {
    id: 'fs-e-orb-form', variant: 'harnast', niva: 'expert', regler: 'tre regler', titel: 'Satelliten tre steg, kärnan byter form, fyllningen växlar', primitiv: 'duo: orbital + form',
    rad: [duo(orb(0), form('circle', 'none')), duo(orb(3), form('square', 'black')), duo(orb(6), form('diamond', 'none')), duo(orb(1), form('circle', 'black')), duo(orb(4), form('square', 'none'))],
    alternativ: [duo(orb(7), form('diamond', 'none')), duo(orb(7), form('square', 'black')), duo(orb(6), form('diamond', 'black')), duo(orb(2), form('diamond', 'black')), duo(orb(7), form('diamond', 'black')), duo(orb(7), form('circle', 'black'))],
    ratt: 4,
    regel: 'Satelliten går tre steg medurs. Kärnan växlar cirkel, kvadrat, romb. Fyllningen växlar tom och svart.',
    misstag: { 0: 'A har rätt läge och rätt form men tom kärna. Fyllningen växlar tom och svart i varje steg, så den sjätte är svart.' },
    not: 'Perioder 8 (steg 3), 3 och 2: hela figuren 24. Inget par går i takt: cirkeln står med både tom och svart kärna, läge 0 och 1 med samma form. Kärnan fylls bara tom eller svart, aldrig grå (för svag på 18 px).',
  },
  {
    id: 'fs-b-g-pekar', variant: 'bryter', niva: 'grund', regler: 'en regel', titel: 'Pilen pekar på pricken, utom i en', primitiv: 'duo: kant + pil',
    rad: [duo(kant(1), pil(45)), duo(kant(3), pil(135)), duo(kant(4), pil(180)), duo(kant(6), pil(90)), duo(kant(7), pil(315)), duo(kant(0), pil(0))],
    ratt: 3,
    regel: 'Pilen pekar på pricken i fem av figurerna. I D pekar den bort från pricken.',
    misstag: { 5: 'I F pekar pilen rakt upp, mot pricken överst. Det följer regeln. Bara i D pekar pilen bort från pricken.' },
    not: 'Regelform: ordningen spelar ingen roll, fem figurer delar en relation och en bryter den. Alla sex har olika prickläge, så ingen figur återkommer (G9) och den som bryter skiljer sig från alla andra.',
  },
  {
    id: 'fs-b-a-hjul', variant: 'bryter', niva: 'avancerad', regler: 'två regler', titel: 'Tre sektorer som sitter ihop, utom i en', primitiv: 'sektorhjul (klass A, oförändrat)',
    rad: [hjul([0, 1, 2]), hjul([3, 4, 5]), hjul([6, 7, 0]), hjul([7, 1, 2]), hjul([2, 3, 4]), hjul([5, 6, 7])],
    ratt: 3,
    regel: 'Varje hjul har tre fyllda sektorer som sitter ihop. I D sitter de inte ihop: sektorn överst är tom.',
    misstag: { 0: 'A har tre fyllda sektorer som sitter ihop, som fyra andra hjul. I D är sektorn överst tom mellan de fyllda.' },
    not: 'Regelform med två egenskaper: antalet (tre) håller i alla sex, sammanhanget bryts i en. Hjulen står i sex olika vridningar.',
  },
  {
    id: 'fs-b-e-serie', variant: 'bryter', niva: 'expert', regler: 'tre regler', titel: 'Fem bildar en serie, en är instoppad', primitiv: 'duo: orbital + form',
    rad: [duo(orb(0), form('square', 'black')), duo(orb(7), form('diamond', 'none')), duo(orb(2), form('circle', 'none')), duo(orb(6), form('circle', 'black')), duo(orb(5), form('square', 'none')), duo(orb(4), form('diamond', 'black'))],
    ratt: 2,
    regel: 'Fem figurer bildar en serie: satelliten går ett steg moturs, kärnan växlar kvadrat, romb, cirkel och fyllningen växlar svart och tom. C är instoppad.',
    misstag: { 5: 'F är seriens femte figur: satelliten har gått ett steg moturs från E, kärnan är romb efter kvadrat och svart efter tom. Den instoppade är C, där satelliten står fel och formen är ur takt.' },
    not: 'Serieform: raden läses i ordning, en figur är instoppad. Bara när C tas bort blir de fem återstående en ren serie (kontrolleras av generatorn). C skiljer sig från alla andra figurer.',
  },
];

const svg = (cell: Fig) => renderToStaticMarkup(<svg viewBox="0 0 100 100" shapeRendering="geometricPrecision" aria-hidden="true"><CellSerie cell={cell} /></svg>);
const lucka = renderToStaticMarkup(<svg viewBox="0 0 100 100" shapeRendering="geometricPrecision" aria-hidden="true"><LuckaV3 /></svg>);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const B = (i: number) => String.fromCharCode(65 + i);

type Lage = { vald?: number; avslojad?: boolean; panel?: boolean };
const FRAGA = { harnast: 'Vilken figur kommer härnäst?', bryter: 'Vilken figur bryter mönstret?' };

/** Raden: en markup, ett rutnät. Css ger tre kolumner på 360 (två remsor med luft) och sex på dator. Hårlinjen är rutans vänsterkant. */
function remsor(celler: string[], _perRemsa: number) {
  return celler.join('');
}

function fraga(q: Serie, lage: Lage = {}, bred = false) {
  const perRemsa = bred ? S.rad.perRemsa1280 : S.rad.perRemsa360;
  const avslojad = !!lage.avslojad;
  let kort: string, alts = '';
  if (q.variant === 'harnast') {
    const rutor = q.rad.map((c) => `<div class="ruta">${svg(c)}</div>`);
    rutor.push(avslojad ? `<div class="ruta"><span class="ratt-fylld">${svg(q.alternativ![q.ratt])}</span></div>` : `<div class="ruta lucka">${lucka}</div>`);
    kort = `<div class="matrisyta kort" role="img" aria-label="Raden med fem figurer och en lucka sist"><div class="serie">${remsor(rutor, perRemsa)}</div></div>`;
    const alt = q.alternativ!.map((o, i) => {
      const arVald = lage.vald === i, arRatt = avslojad && q.ratt === i, dim = avslojad && !arVald && !arRatt;
      const kl = ['alt', arRatt ? 'ratt' : '', arVald ? 'vald' : '', dim ? 'dim' : ''].filter(Boolean).join(' ');
      const label = `Svarsalternativ ${B(i)}${arVald ? ', ditt svar' : ''}${arRatt ? ', rätt svar' : ''}`;
      return `<div class="${kl}" role="radio" aria-checked="${arVald}" aria-label="${label}"><span class="b" aria-hidden="true">${B(i)}</span>${arRatt ? '<span class="punkt" aria-hidden="true"></span>' : ''}<div class="fig">${svg(o)}</div></div>`;
    });
    alts = `<div class="matrisyta alts" role="radiogroup" aria-label="Svarsalternativ">${alt.join('')}</div>`;
  } else {
    const rutor = q.rad.map((c, i) => {
      const arVald = lage.vald === i, arRatt = avslojad && q.ratt === i;
      const kl = ['ruta', 'val', arRatt ? 'ratt' : '', arVald ? 'vald' : ''].filter(Boolean).join(' ');
      const label = `Figur ${B(i)}${arVald ? ', ditt svar' : ''}${arRatt ? ', den som bryter mönstret' : ''}`;
      return `<div class="${kl}" role="radio" aria-checked="${arVald}" aria-label="${label}"><span class="b" aria-hidden="true">${B(i)}</span>${arRatt ? '<span class="punkt" aria-hidden="true"></span>' : ''}${svg(c)}</div>`;
    });
    kort = `<div class="matrisyta kort" role="radiogroup" aria-label="Sex figurer, välj den som bryter mönstret"><div class="serie">${remsor(rutor, perRemsa)}</div></div>`;
  }
  const panel = lage.panel && avslojad
    ? `<div class="panel"><p class="ey">Regeln</p><p>${esc(q.regel)}</p>${lage.vald !== undefined && lage.vald !== q.ratt ? `<p class="ey" style="margin-top:12px">Ditt svar, ${B(lage.vald)}</p><p>${esc(q.misstag[lage.vald] ?? '')}</p>` : ''}<span class="knapp">Nästa</span></div>`
    : '';
  return `<div class="fraga${bred ? ' bred' : ''}"><p class="fragerad"><span>Uppgift 3 av 9</span><b>${FRAGA[q.variant]}</b></p>${kort}${alts}${panel}</div>`;
}

const noder = (html: string) => (html.match(/<(circle|rect|line|path|polygon|g|svg)\b/g) ?? []).length;
const kB = (html: string) => (Buffer.byteLength(html) / 1024).toFixed(1);
const NIVA: Record<string, string> = { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' };
const VARIANT = { harnast: 'Vilken kommer härnäst', bryter: 'Vilken bryter mönstret' };

const sektioner = SERIER.map((q, i) => {
  const h = fraga(q);
  const bara = h.replace(/<p class="fragerad">.*?<\/p>/, '');
  return `<section class="par" id="s${i + 1}">
  <header><p class="ey">${i + 1} · ${VARIANT[q.variant]} · ${NIVA[q.niva]}, ${q.regler}</p><h2>${esc(q.titel)}</h2><p class="meta"><code>${q.id}</code> · ${esc(q.primitiv)} · ${q.variant === 'harnast' ? 'rätt svar' : 'bryter'} ${B(q.ratt)}</p><p class="not">${esc(q.not)} ${noder(bara)} SVG-noder, ${kB(bara)} kB figurmarkup.</p></header>
  <div class="sida"><div class="kol"><p class="etikett">360 · före svar</p><div class="telefon">${h}</div></div><div class="kol"><p class="etikett">360 · efter svar, ${q.variant === 'harnast' ? 'valt A' : 'valt ' + B(Object.keys(q.misstag).map(Number)[0])}</p><div class="telefon">${fraga(q, { vald: q.variant === 'harnast' ? 0 : Object.keys(q.misstag).map(Number)[0], avslojad: true })}</div></div></div>
  </section>`;
}).join('\n');

const qH = SERIER[1], qB = SERIER[3];
const lagen = `<section class="par" id="lagen">
  <header><p class="ey">Lägen</p><h2>Val och genomgång utan att något flyttar sig</h2><p class="meta">Härnäst: valt alternativ får tjock bläckram, rätt får kopparram och kopparpunkt, övriga tonas till 38 procent, luckan fylls med facit i koppar-bläck. Bryter: figurerna är själva alternativen, bokstaven betyder valbar, valet ritas som en ram innanför rutan (inset) så att ingen hårlinje och ingen figur rör sig; i raden tonas ingenting ned, för det är raden förklaringen pekar på. Panelen bär bankens regel och misstag ordagrant.</p></header>
  <div class="sida fyra">
    <div class="kol"><p class="etikett">Härnäst · valt, inte skickat</p><div class="telefon">${fraga(qH, { vald: 0 })}</div></div>
    <div class="kol"><p class="etikett">Härnäst · efter svar, fel, med panelen</p><div class="telefon">${fraga(qH, { vald: 0, avslojad: true, panel: true })}</div></div>
    <div class="kol"><p class="etikett">Bryter · valt, inte skickat</p><div class="telefon">${fraga(qB, { vald: 5 })}</div></div>
    <div class="kol"><p class="etikett">Bryter · efter svar, rätt, med panelen</p><div class="telefon">${fraga(qB, { vald: 3, avslojad: true, panel: true })}</div></div>
  </div></section>`;

const dator = `<section class="par" id="dator">
  <header><p class="ey">Dator</p><h2>En remsa på 1280</h2><p class="meta">Frågekolumnen för figurserier är 640 px på dator (matrisens 420 räcker inte för sex rutor på samma skala). Rutan är 102 px som på mobilen, så figuren har exakt samma pixelstorlek på båda. Alternativen står sex i bredd, 100 px med 8 px luft, rakt under raden.</p></header>
  <div class="sida dator"><div class="kol"><p class="etikett">Härnäst · avancerad</p><div class="bredram">${fraga(SERIER[1], {}, true)}</div></div><div class="kol"><p class="etikett">Härnäst · expert, efter svar</p><div class="bredram">${fraga(SERIER[2], { vald: 0, avslojad: true }, true)}</div></div><div class="kol"><p class="etikett">Bryter · grund</p><div class="bredram">${fraga(SERIER[3], {}, true)}</div></div><div class="kol"><p class="etikett">Bryter · expert, valt</p><div class="bredram">${fraga(SERIER[5], { vald: 2 }, true)}</div></div></div></section>`;

// Zonkontrollen: samma json som renderaren.
const Z = zonkontroll();
const fmt = (x: number) => x.toFixed(1).replace('.', ',');
const kontroll = `<section class="par" id="kontroll">
  <header><p class="ey">Kontroll</p><h2>Zonerna i duo, räknat ur geometrin</h2><p class="meta">Kärnan ritas inom målad radie ${fmt(Z.maxKarna)} (största: pil, romb). Ytterelementets innerkant ligger tidigast på ${fmt(Z.minYtter)} (satelliten). Fritt i varje läge: ${fmt(Z.minGap)} enheter = ${fmt(Z.minGap * Z.skala)} px på 360 (G1 kräver 4 enheter, G5 3 px). Zonerna är koncentriska, så siffran gäller alla 8 × 8 lägen, alla vinklar och alla fyllningar. Två kantprickar i rad har ${fmt(Z.kantGrannar)} enheter fritt. G2-marginal mot [14, 86]: ${Z.g2.map((g) => `${esc(g.namn)} ${fmt(g.marginal)}`).join('; ')}.</p></header>
  <table class="tabell"><thead><tr><th>Kärna</th><th>Målad radie</th>${Z.ytter.map((y) => `<th>${esc(y.namn)}<br><small>innerkant ${fmt(y.inner)}</small></th>`).join('')}</tr></thead><tbody>
  ${Z.karnor.map((k) => `<tr><td>${esc(k.namn)}</td><td>${fmt(k.malad)}</td>${Z.ytter.map((y) => { const g = y.inner - k.malad; return `<td class="${g < 4 ? 'fel' : ''}">${fmt(g)}</td>`; }).join('')}</tr>`).join('')}
  </tbody></table></section>`;

const CSS = `
:root{color-scheme:light;
--koppar:#E07A2F;--koppar-ink:#A8491A;--koppar-djup:#C4621F;--koppar-ljus:#F4B98A;--koppar-mjuk:#FBE3D0;
--ink-1:#1A1A1F;--ink-2:#4A4A55;--ink-3:#65656E;
--papper:#FFFFFF;--papper-2:#F4F3F0;--kant:#E3E1DC;--kant-stark:#C9C6BF;
--golv:#EBEDF6;--vagg:#1B2246;--vagg-ink:#F5F6FC;--vagg-mjuk:#AEB4DA;--ton:#DFE3F6;--ton-ink:#3B4790;
--lyft:0 1px 2px rgba(20,20,40,.05),0 10px 24px -14px rgba(20,20,40,.18);
--display:"Schibsted Grotesk","Inter",system-ui,sans-serif;--body:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){color-scheme:dark;
--ink-1:#F3F2F7;--ink-2:#C7C6D0;--ink-3:#9391A1;--papper:#171B2E;--papper-2:#1D2238;--kant:#293050;--kant-stark:#3B4470;
--koppar-ink:#F2A368;--koppar-mjuk:rgba(224,122,47,.18);--golv:#0E1120;--ton:#232B55;--ton-ink:#B9C2F2;
--lyft:0 1px 2px rgba(0,0,0,.3),0 12px 28px -14px rgba(0,0,0,.6)}}
:root[data-theme="dark"]{color-scheme:dark;
--ink-1:#F3F2F7;--ink-2:#C7C6D0;--ink-3:#9391A1;--papper:#171B2E;--papper-2:#1D2238;--kant:#293050;--kant-stark:#3B4470;
--koppar-ink:#F2A368;--koppar-mjuk:rgba(224,122,47,.18);--golv:#0E1120;--ton:#232B55;--ton-ink:#B9C2F2;
--lyft:0 1px 2px rgba(0,0,0,.3),0 12px 28px -14px rgba(0,0,0,.6)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--golv);color:var(--ink-1);font:15px/23px var(--body);-webkit-font-smoothing:antialiased;padding:24px 16px 80px;overflow-x:hidden}
svg{display:block}
h1,h2{margin:0;font-family:var(--display);letter-spacing:-.02em;text-wrap:balance}
h1{font-size:30px;line-height:34px;font-weight:800}
h2{font-size:21px;line-height:26px;font-weight:700;margin-top:4px}
.wrap{max-width:1248px;margin:0 auto}
.intro{margin-bottom:28px;max-width:72ch}
.intro p{color:var(--ink-2);margin:10px 0 0}
.ey{margin:0;font-size:12px;line-height:16px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-3)}
.meta{margin:6px 0 0;font-size:13px;line-height:19px;color:var(--ink-2)}
.meta code,.intro code{font:12px/16px ui-monospace,Menlo,monospace;color:var(--ink-3)}
.not{margin:6px 0 0;font-size:13px;line-height:19px;color:var(--ink-3);max-width:80ch}
.tema{display:flex;gap:6px;margin-top:14px}
.tema button{min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--kant-stark);background:var(--papper);color:var(--ink-1);font:600 13px/16px var(--body);cursor:pointer}
.tema button[aria-pressed="true"]{background:var(--ink-1);color:var(--papper);border-color:var(--ink-1)}
.par{margin-top:36px;padding-top:24px;border-top:1px solid var(--kant-stark)}
.sida{display:flex;flex-wrap:wrap;gap:24px;margin-top:16px;align-items:flex-start}
.kol{flex:0 0 auto;max-width:100%}
.etikett{margin:0 0 8px;font-size:12px;line-height:16px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-3)}
.telefon{width:360px;max-width:100%;padding:16px;border-radius:24px;background:var(--golv);box-shadow:inset 0 0 0 1px var(--kant-stark)}
.bredram{width:${S.rad.kolumn1280}px;max-width:100%}
.fraga{display:flex;flex-direction:column;gap:14px}
.fragerad{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:0 0 -2px;font-size:13px;line-height:18px;color:var(--ink-3)}
.fragerad span{white-space:nowrap}
.fragerad b{color:var(--ink-1);font-weight:600;font-size:14px;text-align:right}
.kort{border-radius:16px;border:1px solid var(--kant);background:var(--papper);padding:10px;box-shadow:var(--lyft)}
/* Raden: remsor, inte rutnät. Hårlinjer bara mellan rutor i samma remsa, ${S.rad.remsluft} px luft mellan remsorna. */
.serie{display:grid;grid-template-columns:repeat(${S.rad.perRemsa360},minmax(0,1fr));column-gap:0;row-gap:${S.rad.remsluft}px}
.bred .serie{grid-template-columns:repeat(${S.rad.perRemsa1280},minmax(0,1fr))}
.ruta{position:relative;aspect-ratio:1;background:var(--papper);display:flex;align-items:center;justify-content:center;border-left:1px solid var(--kant)}
.ruta:nth-child(${S.rad.perRemsa360}n+1){border-left:0}
.bred .ruta:nth-child(${S.rad.perRemsa360}n+1){border-left:1px solid var(--kant)}
.bred .ruta:first-child{border-left:0}
.ruta svg,.ruta .ratt-fylld{width:100%;height:100%}
.ruta svg{padding:10%}
.ruta.lucka{background:var(--papper-2);border-radius:0 4px 4px 0}
.ruta .ratt-fylld{display:flex}
.ruta .b,.alt .b{position:absolute;left:${S.bryter.bokstav.left}px;top:${S.bryter.bokstav.top}px;z-index:1;font-size:${S.bryter.bokstav.px}px;line-height:16px;font-weight:${S.bryter.bokstav.vikt};color:var(--ink-3)}
.ruta.val{cursor:pointer}
.ruta.vald{box-shadow:inset 0 0 0 ${S.bryter.valRam}px var(--ink-1)}
.ruta.vald .b{color:var(--ink-1)}
.ruta.ratt{box-shadow:inset 0 0 0 ${S.bryter.rattRam}px var(--koppar)}
.ruta.ratt .b{color:var(--koppar-ink)}
.ruta.vald.ratt{box-shadow:inset 0 0 0 ${S.bryter.rattRam}px var(--koppar),inset 0 0 0 ${S.bryter.valdRattInre}px var(--koppar-mjuk)}
.ruta .punkt,.alt .punkt{position:absolute;right:${S.bryter.punkt.right}px;top:${S.bryter.punkt.top}px;width:${S.bryter.punkt.px}px;height:${S.bryter.punkt.px}px;border-radius:50%;background:var(--koppar)}
.alts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${S.rad.altLuft360}px}
.bred .alts{grid-template-columns:repeat(6,minmax(0,1fr));gap:${S.rad.altLuft1280}px}
.alt{position:relative;aspect-ratio:1;min-height:80px;border-radius:12px;border:1px solid var(--kant);background:var(--papper)}
.alt .fig{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:10%}
.alt .fig svg{width:100%;height:100%}
.alt.vald{border-color:var(--ink-1);box-shadow:inset 0 0 0 1px var(--ink-1)}
.alt.vald .b{color:var(--ink-1)}
.alt.ratt{border-color:var(--koppar);box-shadow:inset 0 0 0 1px var(--koppar)}
.alt.ratt .b{color:var(--koppar-ink)}
.alt.vald.ratt{box-shadow:inset 0 0 0 1px var(--koppar),0 0 0 3px var(--koppar-mjuk)}
.alt.dim{opacity:.38}
.panel{border-radius:16px;border:1px solid var(--kant);background:var(--papper);padding:14px 16px 16px;box-shadow:var(--lyft)}
.panel p{margin:4px 0 0;font-size:14px;line-height:21px;color:var(--ink-1)}
.panel .knapp{display:flex;align-items:center;justify-content:center;min-height:44px;margin-top:14px;border-radius:12px;background:var(--ink-1);color:var(--papper);font-weight:600;font-size:15px}
/* Färgmappningen ur globals.css (.matrisyta) */
.matrisyta{--m-ink:var(--ink-1);--m-gra:var(--kant-stark);--m-vit:var(--papper);--m-ram:var(--ink-3)}
.matrisyta [fill="#020617"]{fill:var(--m-ink)}.matrisyta [stroke="#020617"]{stroke:var(--m-ink)}
.matrisyta [fill="#CBD5E1"]{fill:var(--m-gra)}
.matrisyta [fill="white"],.matrisyta [fill="#FFFFFF"]{fill:var(--m-vit)}.matrisyta [stroke="white"],.matrisyta [stroke="#FFFFFF"]{stroke:var(--m-vit)}
.matrisyta [fill="#64748B"]{fill:var(--m-ram)}.matrisyta [stroke="#64748B"]{stroke:var(--m-ram)}
.matrisyta .ratt-fylld{--m-ink:var(--koppar-ink);--m-gra:var(--koppar-mjuk);--m-ram:var(--koppar)}
.sida.fyra .telefon{width:300px}
.sida.dator{gap:32px}
.tabell{margin-top:16px;border-collapse:collapse;font-size:13px;line-height:18px;max-width:100%;display:block;overflow-x:auto}
.tabell th,.tabell td{text-align:left;padding:6px 10px;border-bottom:1px solid var(--kant);vertical-align:top;font-variant-numeric:tabular-nums}
.tabell th{font-weight:600;color:var(--ink-2)}
.tabell th small{font-weight:500;color:var(--ink-3)}
.tabell td.fel{color:var(--koppar-ink);font-weight:600}
@media (min-width:1248px){.sida.fyra .telefon{width:288px}}
@media (max-width:420px){.telefon{padding:12px}.sida{gap:20px}}
`;

const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Figurserier grafik v3</title>
<meta name="description" content="Figurseriernas två varianter i Testerna, ritade med grafik v3: raden som remsa, den sammansatta primitiven duo, lägena, dator och zonkontrollen.">
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<header class="intro">
  <p class="ey">Rekryteringstester · figurserier, omgång 2 · art-director 2026-10-12</p>
  <h1>Figurserier: raden, figurerna och valet</h1>
  <p>Sex riktiga uppgifter i båda varianterna och på alla tre nivåerna, renderade ur celldata med grafik v3:s renderare och den nya sammansatta primitiven <code>duo</code> (ett ytterelement, ett kärnelement, koncentriska zoner). Raden är en remsa, inte ett rutnät: hårlinjer bara mellan figurer i samma remsa, två remsor på 360 och en på dator, luckan alltid sist. Måtten och reglerna står i <code>figurserier-spec.md</code>.</p>
  <div class="tema" role="group" aria-label="Färgläge"><button type="button" data-tema="light">Ljust</button><button type="button" data-tema="dark">Mörkt</button><button type="button" data-tema="system" aria-pressed="true">System</button></div>
</header>
${sektioner}
${lagen}
${dator}
${kontroll}
</div>
<script>
(function(){var r=document.documentElement,bs=document.querySelectorAll('[data-tema]');bs.forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-tema');if(t==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t);bs.forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})})})})();
</script>
</body>
</html>`;
writeFileSync(UT_HTML, html);
console.log('Skrev', UT_HTML, (Buffer.byteLength(html) / 1024).toFixed(0), 'kB');
for (const q of SERIER) { const h = fraga(q).replace(/<p class="fragerad">.*?<\/p>/, ''); console.log(q.id, noder(h), 'noder', kB(h), 'kB'); }
// Tyngsta tänkbara härnäst: 3×3-block i alla elva figurer.
const tung: Serie = { ...SERIER[0], rad: Array(5).fill({ kind: 'tile', pattern: 0b111101111 }), alternativ: Array(6).fill({ kind: 'tile', pattern: 0b111101111 }) };
const th = fraga(tung).replace(/<p class="fragerad">.*?<\/p>/, '');
console.log('tyngsta (tile × 11)', noder(th), 'noder', kB(th), 'kB');
console.log('zon: maxKarna', Z.maxKarna.toFixed(2), 'minYtter', Z.minYtter.toFixed(2), 'minGap', Z.minGap.toFixed(2), 'px', (Z.minGap * Z.skala).toFixed(2), 'kantGrannar', Z.kantGrannar);
for (const g of Z.g2) console.log('G2', g.namn, g.marginal.toFixed(2));
for (const k of Z.karnor) console.log('kärna', k.namn, k.malad.toFixed(2));

async function main() {
  if (process.argv.includes('--bara-html')) return;
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  const url = 'file:///' + UT_HTML.replace(/\\/g, '/');
  const vyer: [string, number, 'light' | 'dark'][] = [['m360-ljust', 360, 'light'], ['m360-morkt', 360, 'dark'], ['d1280-ljust', 1280, 'light'], ['d1280-morkt', 1280, 'dark']];
  for (const [namn, bredd, tema] of vyer) {
    await page.setViewport({ width: bredd, height: 900, deviceScaleFactor: 2 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema }]);
    await page.goto(url, { waitUntil: 'load' });
    const ids = bredd === 1280 ? ['s1', 's2', 's3', 's4', 's5', 's6', 'lagen', 'dator', 'kontroll'] : ['s1', 's2', 's3', 's4', 's5', 's6', 'lagen'];
    for (const id of ids) {
      const el = await page.$('#' + id);
      if (el) await el.screenshot({ path: path.join(HAR, `${namn}-${id}.png`) as `${string}.png` });
    }
  }
  await browser.close();
  console.log('Renderade till', HAR);
}
main().catch((e) => { console.error(e); process.exit(1); });
