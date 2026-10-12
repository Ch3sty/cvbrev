// Bygger illustrationer.svg (symbolark) och illustrationer.html (galleri)
// ur de enskilda SVG-filerna i den här mappen. Kör: node bygg.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))

const MOTIV = [
  { id: 'illu-matris', namn: 'Logik, matris', sager: 'Du ska hitta regeln och fylla luckan.' },
  { id: 'illu-verbalt', namn: 'Verbalt', sager: 'Läs texten, ta ställning till påståendet.' },
  { id: 'illu-numeriskt', namn: 'Numeriskt', sager: 'Läs av, räkna, under tid.' },
  { id: 'illu-personlighet', namn: 'Personlighet', sager: 'Här finns inget rätt svar, bara ditt.' },
  { id: 'illu-provlage', namn: 'Provläge', sager: 'Som på riktigt, mot klockan, facit efteråt.' },
  { id: 'illu-scen-vagen', namn: 'Scenen: vägen', sager: 'Från ansökan via test till intervju.', scen: true },
  { id: 'illu-tomt-utveckling', namn: 'Tomt: Din utveckling', sager: 'Kurvan ritas när du gjort ditt första test.', tomt: true },
  { id: 'marke-grund', namn: 'Märke: Grund', sager: 'Första steget.', marke: true },
  { id: 'marke-avancerad', namn: 'Märke: Avancerad', sager: 'Två steg.', marke: true },
  { id: 'marke-expert', namn: 'Märke: Expert', sager: 'Hela trappan.', marke: true },
]

function las(id) {
  const src = readFileSync(join(dir, `${id}.svg`), 'utf8')
  const viewBox = src.match(/viewBox="([^"]+)"/)[1]
  const inner = src
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
  return { viewBox, inner }
}

const symboler = MOTIV.map((m) => {
  const { viewBox, inner } = las(m.id)
  return `  <symbol id="${m.id}" viewBox="${viewBox}" fill="none" stroke-linecap="round" stroke-linejoin="round">\n    ${inner.replace(/\n/g, '\n    ')}\n  </symbol>`
}).join('\n')

const ark = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
${symboler}
</defs>
</svg>
`
writeFileSync(join(dir, 'illustrationer.svg'), ark)

// ---------------------------------------------------------------- galleriet

const UNDERLAG = [
  { k: 'papper', namn: 'Papper (kort)' },
  { k: 'golv', namn: 'Golv' },
  { k: 'vagg', namn: 'Vägg (indigo)' },
]

function use(id, w, h, extra = '') {
  return `<svg width="${w}" height="${h}" ${extra}><use href="#${id}"/></svg>`
}

function rad(m) {
  if (m.marke) {
    return `<div class="rad"><div class="namn"><b>${m.namn}</b><span>${m.sager}</span></div>
      <div class="prov"><figure>${use(m.id, 132, 132)}<figcaption>132</figcaption></figure>
      <figure>${use(m.id, 48, 48)}<figcaption>48</figcaption></figure>
      <figure>${use(m.id, 24, 24)}<figcaption>24</figcaption></figure></div></div>`
  }
  if (m.scen) {
    return `<div class="rad"><div class="namn"><b>${m.namn}</b><span>${m.sager}</span></div>
      <div class="prov"><figure>${use(m.id, 240, 180)}<figcaption>240 × 180</figcaption></figure>
      <figure>${use(m.id, 128, 96)}<figcaption>128 × 96</figcaption></figure></div></div>`
  }
  return `<div class="rad"><div class="namn"><b>${m.namn}</b><span>${m.sager}</span></div>
    <div class="prov"><figure>${use(m.id, 240, 180)}<figcaption>240 × 180</figcaption></figure>
    <figure>${use(m.id, 160, 120)}<figcaption>160 × 120</figcaption></figure>
    <figure>${use(m.id, 128, 96)}<figcaption>128 × 96 (mobil, höjd 96)</figcaption></figure></div></div>`
}

function sektion(lage) {
  return UNDERLAG.map((u) => `
  <section class="yta ${u.k}">
    <h2>${u.namn}</h2>
    ${MOTIV.map(rad).join('\n')}
  </section>`).join('\n')
}

const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Illustrationer: Tester-lyftet</title>
<style>
  /* Tokens ur docs/designsystem.md v3, Träningens rum (indigo), och
     riktning.md: --illu-dim, --illu-fill, --illu-mjuk, --illu-accent. */
  :root{--koppar:#E07A2F;font-family:Inter,system-ui,sans-serif;}
  body{margin:0;background:#fff;color:#1A1A1F;}
  .lage{padding:24px 16px 48px;}
  .lage h1{font-size:22px;margin:0 0 4px;}
  .lage p.intro{margin:0 0 20px;font-size:13px;color:#65656E;max-width:720px;}
  .ljust{background:#F4F3F0;color:#1A1A1F;}
  .morkt{background:#07080F;color:#F3F2F7;}
  .morkt p.intro{color:#9391A1;}
  .yta{border-radius:16px;padding:16px;margin:0 0 16px;}
  .yta h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 12px;font-weight:600;opacity:.75;}
  .rad{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--kant);}
  .namn{width:180px;flex:0 0 auto;font-size:13px;line-height:18px;}
  .namn b{display:block;font-weight:600;}
  .namn span{opacity:.75;}
  .prov{display:flex;gap:24px;align-items:flex-end;flex-wrap:wrap;}
  figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px;}
  figcaption{font-size:11px;opacity:.6;}
  svg{display:block;}

  /* Ljust läge */
  .ljust .papper{background:#FFFFFF;color:#1A1A1F;--kant:#E3E1DC;--illu-dim:#65656E;--illu-fill:#FFFFFF;--illu-mjuk:#DFE3F6;--illu-accent:var(--koppar);}
  .ljust .golv{background:#EBEDF6;color:#1A1A1F;--kant:#C9C6BF;--illu-dim:#65656E;--illu-fill:#FFFFFF;--illu-mjuk:#DFE3F6;--illu-accent:var(--koppar);}
  /* Väggen byter aldrig */
  .vagg{background:linear-gradient(160deg,#2B3470,#1B2246 55%,#121737);color:#F5F6FC;--kant:rgba(255,255,255,.12);--illu-dim:#6F78B0;--illu-fill:#2B3470;--illu-mjuk:rgba(174,180,218,.18);--illu-accent:var(--koppar);}
  /* Mörkt läge */
  .morkt .papper{background:#171B2E;color:#F3F2F7;--kant:#293050;--illu-dim:#9391A1;--illu-fill:#171B2E;--illu-mjuk:#232B55;--illu-accent:var(--koppar);}
  .morkt .golv{background:#0E1120;color:#F3F2F7;--kant:#3B4470;--illu-dim:#9391A1;--illu-fill:#171B2E;--illu-mjuk:#232B55;--illu-accent:var(--koppar);}

  @media (max-width:640px){.namn{width:100%;}}
</style>
</head>
<body>
${ark}
<div class="lage ljust" id="ljust">
  <h1>Illustrationer, Tester-lyftet: ljust läge</h1>
  <p class="intro">Samma SVG på tre underlag. Bara <code>currentColor</code>, <code>--illu-dim</code>, <code>--illu-fill</code> och <code>--illu-mjuk</code> byter; kopparn är densamma överallt. Riktning: <code>../riktning.md</code>.</p>
  ${sektion('ljust')}
</div>
<div class="lage morkt" id="morkt">
  <h1>Mörkt läge</h1>
  <p class="intro">Golv och papper i Träningens mörka värden. Väggen är samma som i ljust läge.</p>
  ${sektion('morkt')}
</div>
</body>
</html>
`
writeFileSync(join(dir, 'illustrationer.html'), html)
console.log('skrev illustrationer.svg och illustrationer.html,', MOTIV.length, 'motiv')
