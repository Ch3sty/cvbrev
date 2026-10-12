// Snuttar för verktygssidorna (del A): två nya telefonskärmar, brevmallarnas
// miniatyrer, datapunktsobjekten och tre större objekt. Läses in av build-a.js
// ovanpå snuttarna i build.js. Allt är SVG med tokens, ingen text i bild.

const status = (ljus) => `<div class="s-status" style="color:${ljus ? '#fff' : 'var(--ink-1)'}"><span>14:05</span><svg viewBox="0 0 40 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="5" y="4" width="3" height="7" rx="1"/><rect x="10" y="2" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="11" rx="1"/><rect x="24" y="1" width="14" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="26" y="3" width="9" height="5" rx="1"/></svg></div>`;

const bock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

// ---------- Brevmallarna som miniatyrer (90 x 120, samma hand som CV-arket) ----------
const P = 'var(--papper-skarm)', I = 'var(--ink-1)', K = 'var(--kant-stark)', KO = 'var(--koppar)', T = 'var(--rum-ton)';
const ark = (inre) => `<svg viewBox="0 0 90 120" fill="none" stroke="${I}" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="84" height="114" rx="6" fill="${P}" stroke-width="2.2"/>${inre}</svg>`;
const rader = (x1, x2, y0, n, steg, tunn) => {
  let s = '';
  for (let i = 0; i < n; i++) { const kort = (i % 3 === 2) ? 0.72 : 1; s += `<path d="M${x1} ${y0 + i * steg}h${(x2 - x1) * kort}" stroke="${tunn ? K : I}"/>`; }
  return s;
};
const MALLAR = {
  klassisk: ark(`<path d="M30 16h30" stroke-width="3"/><path d="M34 24h22" stroke="${K}"/>${rader(14, 76, 40, 9, 7.5)}<path d="M14 110h22"/>`),
  minimalist: ark(`<path d="M20 18h22" stroke-width="3"/>${rader(20, 70, 44, 7, 8.5, true)}<path d="M20 106h14"/>`),
  kompakt: ark(`<path d="M12 15h26" stroke-width="3"/><path d="M44 15h34" stroke="${K}"/><path d="M12 22h66" stroke="${K}"/>${rader(12, 78, 34, 12, 6.2)}<path d="M12 110h22"/>`),
  modern: ark(`<rect x="10" y="12" width="4" height="96" rx="2" fill="${KO}" stroke="none"/><path d="M22 18h30" stroke-width="3"/><rect x="58" y="12" width="20" height="16" rx="2" fill="${T}" stroke="none"/>${rader(22, 78, 42, 8, 8)}<path d="M22 108h20"/>`),
  executive: ark(`<rect x="7" y="7" width="24" height="106" rx="3" fill="${T}" stroke="none"/><path d="M12 20h14M12 30h14M12 40h10" stroke="${I}"/><path d="M38 16h30" stroke-width="3"/>${rader(38, 80, 32, 10, 7.5)}`),
  kreativ: ark(`<rect x="3" y="3" width="84" height="26" rx="6" fill="${KO}" stroke="none"/><path d="M14 16h32" stroke="var(--koppar-text)" stroke-width="3"/>${rader(14, 76, 42, 8, 8)}<path d="M14 108h22"/>`),
  traditionell: ark(`<path d="M50 14h28" stroke-width="3"/><path d="M58 22h20" stroke="${K}"/><path d="M12 36h30"/>${rader(12, 78, 48, 8, 7.5)}<path d="M12 110h20"/>`),
};

// ---------- Datapunkter ur CV:t (64, currentColor, en kopparyta) ----------
const obj = (inre) => `<div class="obj"><svg viewBox="0 0 64 64">${inre}</svg></div>`;
const VOBJ = {
  yrke: obj(`<rect x="8" y="12" width="48" height="40" rx="6"/><circle cx="22" cy="28" r="6"/><path d="M14 44c1-6 4-9 8-9s7 3 8 9M36 24h14M36 32h10"/><rect x="36" y="40" width="12" height="4" rx="2" fill="var(--koppar)" stroke="none"/>`),
  kompetens: obj(`<rect x="6" y="10" width="26" height="12" rx="6"/><rect x="36" y="10" width="22" height="12" rx="6"/><rect x="6" y="26" width="18" height="12" rx="6"/><rect x="28" y="26" width="30" height="12" rx="6"/><rect x="6" y="42" width="30" height="12" rx="6"/><rect x="40" y="42" width="18" height="12" rx="6" fill="var(--koppar)" stroke="none"/>`),
  utbildning: obj(`<path d="M6 24 32 12l26 12-26 12z"/><path d="M16 29v14c0 4 7 8 16 8s16-4 16-8V29"/><path d="M58 24v14"/><circle cx="58" cy="42" r="4" fill="var(--koppar)" stroke="none"/>`),
  plats: obj(`<circle cx="32" cy="34" r="24" stroke-dasharray="4 4" opacity=".55"/><path d="M32 46c-7-8-12-13-12-19a12 12 0 0 1 24 0c0 6-5 11-12 19z"/><circle cx="32" cy="27" r="4" fill="var(--koppar)" stroke="none"/>`),
  sprak: obj(`<path d="M8 12a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H22l-8 7v-7h0a6 6 0 0 1-6-6z"/><path d="M16 16h18M16 23h10"/><path d="M56 34a6 6 0 0 0-6-6H30a6 6 0 0 0-6 6v10a6 6 0 0 0 6 6h16l8 7v-7a6 6 0 0 0 2-6z"/><path d="M32 38h16M32 45h8" stroke="var(--koppar)" stroke-width="3"/>`),
  erfarenhet: obj(`<path d="M6 40h52"/><circle cx="14" cy="40" r="5" fill="var(--panel)"/><circle cx="32" cy="40" r="5" fill="var(--panel)"/><circle cx="50" cy="40" r="6" fill="var(--koppar)" stroke="none"/><path d="M14 35V22h12M32 35V16h12" opacity=".6"/>`),
  // Brevet i tre stycken (200 x 240): öppning, mitten, avslut, en sida
  tre: `<svg viewBox="0 0 200 240" fill="none" stroke="var(--ink-1)" stroke-width="2.5" stroke-linecap="round"><rect x="20" y="8" width="160" height="224" rx="10" fill="var(--panel)"/><path d="M40 30h44" stroke-width="3.5"/><path d="M40 42h28" stroke="var(--kant-stark)"/><rect x="34" y="60" width="4" height="40" rx="2" fill="var(--koppar)" stroke="none"/><path d="M48 64h110M48 76h100M48 88h74"/><rect x="34" y="112" width="4" height="52" rx="2" fill="var(--kant-stark)" stroke="none"/><path d="M48 116h110M48 128h110M48 140h96M48 152h80"/><rect x="34" y="176" width="4" height="28" rx="2" fill="var(--kant-stark)" stroke="none"/><path d="M48 180h110M48 192h64"/><path d="M40 218h40"/></svg>`,
  // Tre CV-mallar i solfjäder (220 x 170)
  cvmallar: `<svg viewBox="0 0 220 170" fill="none" stroke="var(--ink-1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-8 60 100)"><rect x="18" y="28" width="92" height="124" rx="8" fill="var(--panel)"/><circle cx="38" cy="50" r="8" fill="var(--insunken)"/><path d="M54 46h30M54 56h20M30 76h60M30 88h60M30 100h44M30 112h60M30 124h36"/></g><g transform="rotate(7 160 100)"><rect x="112" y="28" width="92" height="124" rx="8" fill="var(--panel)"/><rect x="112" y="28" width="30" height="124" rx="8" fill="var(--rum-ton)" stroke="none"/><path d="M112 28h30v124h-30z"/><path d="M120 50h14M120 60h14M152 46h40M152 58h30M152 78h44M152 90h44M152 102h30M152 114h44"/></g><rect x="64" y="12" width="92" height="124" rx="8" fill="var(--panel)"/><path d="M80 32h40" stroke-width="3.5"/><path d="M80 42h24" stroke="var(--kant-stark)"/><path d="M80 62h60M80 74h60M80 86h44M80 98h60M80 110h40"/><rect x="80" y="118" width="26" height="6" rx="3" fill="var(--koppar)" stroke="none"/></svg>`,
};

module.exports = {
  // Mallminiatyrerna: {{MALL:klassisk}} och så vidare
  'MALL:klassisk': () => MALLAR.klassisk,
  'MALL:minimalist': () => MALLAR.minimalist,
  'MALL:kompakt': () => MALLAR.kompakt,
  'MALL:modern': () => MALLAR.modern,
  'MALL:executive': () => MALLAR.executive,
  'MALL:kreativ': () => MALLAR.kreativ,
  'MALL:traditionell': () => MALLAR.traditionell,

  // Objekt
  'VOBJ:yrke': () => VOBJ.yrke,
  'VOBJ:kompetens': () => VOBJ.kompetens,
  'VOBJ:utbildning': () => VOBJ.utbildning,
  'VOBJ:plats': () => VOBJ.plats,
  'VOBJ:sprak': () => VOBJ.sprak,
  'VOBJ:erfarenhet': () => VOBJ.erfarenhet,
  'VOBJ:tre': () => VOBJ.tre,
  'VOBJ:cvmallar': () => VOBJ.cvmallar,

  // Brevflödets steg 2: annonsen läst, kraven mot CV:t. Samma persona som TEL:brev.
  'TEL:annons': () => `
<div class="tel glid rum-brev" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-kick">Personligt brev, steg 2 av 4</div><div class="s-rub">Det annonsen kräver</div><div class="s-sub">Projektledare, Sweco Göteborg. Sju krav i texten, sex av dem täcks av ditt CV.</div></div>
  <div class="s-golv">
    <div class="s-kort">
      <div class="s-kick2">Krav i annonsen</div>
      <div class="v-chips">
        <span class="v-chip"><i>${bock}</i>Projektledning, bygg</span>
        <span class="v-chip"><i>${bock}</i>Offentlig upphandling, LOU</span>
        <span class="v-chip"><i>${bock}</i>Budgetansvar</span>
        <span class="v-chip"><i>${bock}</i>AMA</span>
        <span class="v-chip"><i>${bock}</i>Tidplan</span>
        <span class="v-chip"><i>${bock}</i>Entreprenadjuridik</span>
        <span class="v-chip saknas">PMP-certifiering, saknas i CV:t</span>
      </div>
      <p class="s-dim" style="margin-top:8px">Brevet bygger på det du täcker och nämner inte det som saknas.</p>
    </div>
    <div class="s-kort">
      <div class="s-kick2">Mall, ton och språk</div>
      <div class="s-rad"><span>Mall</span><b>Klassisk</b></div>
      <div class="s-rad" style="margin-top:6px"><span>Ton</span><b>Saklig</b></div>
      <div class="s-rad" style="margin-top:6px"><span>Språk</span><b>Svenska</b></div>
    </div>
  </div>
  <div class="s-fot"><div class="s-knapp">Skriv brevet</div><div class="s-hem"></div></div>
</div></div>`,

  // Matchningens steg 1 och 2: CV:t aktiverat, datapunkterna lästa, sökningen igång.
  'TEL:aktivera': () => `
<div class="tel glid rum-jobb" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-kick">Jobbmatchning</div><div class="s-rub">CV:t är aktiverat</div><div class="s-sub">Sex datapunkter lästa ur projektledare-cv.pdf. Nu söker vi i Platsbanken.</div></div>
  <div class="s-golv">
    <div class="s-kort">
      <div class="s-kick2">Ur ditt CV</div>
      <dl class="v-data">
        <dt>Yrkesroller</dt><dd>Projektledare bygg, uppdragsledare</dd>
        <dt>Kompetenser</dt><dd>LOU, AMA, budgetansvar, BAS-P</dd>
        <dt>Utbildning</dt><dd>Civilingenjör, väg och vatten</dd>
        <dt>Plats</dt><dd>Göteborg</dd>
        <dt>Språk</dt><dd>Svenska, engelska</dd>
        <dt>Erfarenhet</dt><dd>Sex år, senior</dd>
      </dl>
    </div>
    <div class="s-kort">
      <div class="s-rad"><b style="font-size:12px">Söker bland 1 843 lediga jobb</b><span class="s-dim" style="white-space:nowrap">62 %</span></div>
      <div class="s-mät" style="margin-top:8px"><i style="width:62%"></i></div>
      <p class="s-dim" style="margin-top:8px">Alla annonser i Platsbanken, även de med en annan titel än din.</p>
    </div>
  </div>
  <div class="s-fot"><div class="s-knapp">Visa träffarna</div><div class="s-hem"></div></div>
</div></div>`,
};
