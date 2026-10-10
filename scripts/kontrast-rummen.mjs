// scripts/kontrast-rummen.mjs
// Kontrasten i Rummen, räknad maskinellt ur globals.css (spec-rummen-2026-10-10
// avsnitt 3.5 och våg 1a, acceptans 3).
//
//   node scripts/kontrast-rummen.mjs            # räkna och jämför med docs/designsystem.md
//   node scripts/kontrast-rummen.mjs --skriv    # skriv om tabellerna i designsystem.md
//
// Läser tokenvärdena direkt ur src/app/globals.css (rot-blocket, de fem rummen,
// mörkt läge i båda formerna), räknar WCAG 2.x-kontrast för varje par som
// förekommer, och kontrollerar:
//   1. inget textpar under 4,5:1 i något rum eller läge,
//   2. grafikpar (linje, punkt, knapp, kant som ensam gräns) minst 3:1 där de
//      har ett krav,
//   3. mörkt läge står identiskt i båda formerna (media och data-theme),
//   4. tabellerna i docs/designsystem.md (mellan markörerna kontrast:start och
//      kontrast:slut) stämmer med det som räknas här, på en decimal.
// Exit 1 vid avvikelse.

import fs from 'node:fs'

const CSS = fs.readFileSync('src/app/globals.css', 'utf8')
const DOK = 'docs/designsystem.md'
const SKRIV = process.argv.includes('--skriv')

const RUM = ['tran', 'cv', 'brev', 'jobb', 'neutral']
const RUMNAMN = { tran: 'Träningen', cv: 'CV', brev: 'Personliga brev', jobb: 'Jobbsöket', neutral: 'Konto' }

// ------------------------------------------------------------- tolkning
function block(selektorRegex) {
  const m = CSS.match(selektorRegex)
  if (!m) throw new Error('Hittade inte blocket ' + selektorRegex)
  return m[1]
}
function tokens(text) {
  const ut = {}
  for (const m of text.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) ut[m[1]] = m[2].trim()
  return ut
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const basLjus = tokens(block(/\n:root:has\(\[data-rum\]\) \{([^}]*)\}/))
const rumLjus = Object.fromEntries(
  RUM.map((r) => [r, tokens(block(new RegExp(esc(`[data-rum="${r}"], :root:has([data-rum="${r}"]) {`) + '([^}]*)\\}')))])
)
const basMorktAttr = tokens(block(/:root\[data-theme="dark"\]:has\(\[data-rum\]\) \{([^}]*)\}/))
const basMorktMedia = tokens(block(/:root:not\(\[data-theme="light"\]\):has\(\[data-rum\]\) \{([^}]*)\}/))
const rumMorktAttr = Object.fromEntries(
  RUM.map((r) => [r, tokens(block(new RegExp(esc(`:root[data-theme="dark"] [data-rum="${r}"], :root[data-theme="dark"]:has([data-rum="${r}"]) {`) + '([^}]*)\\}')))])
)
const rumMorktMedia = Object.fromEntries(
  RUM.map((r) => [
    r,
    tokens(block(new RegExp(esc(`:root:not([data-theme="light"]) [data-rum="${r}"], :root:not([data-theme="light"]):has([data-rum="${r}"]) {`) + '([^}]*)\\}'))),
  ])
)
// Trådens rot-block (publika sidor och adminen), för adminens spårfärger.
const traden = tokens(block(/\n:root \{([\s\S]*?)\n\}/))

const fel = []
/** Par med ett krav som specen själv inte uppfyller: redovisas, stoppar inte. */
const varningar = []

// Mörkt läge ska stå likadant i båda formerna.
const lika = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort())
if (!lika(basMorktAttr, basMorktMedia)) fel.push('Mörkt läge: rot-blocket skiljer sig mellan media och data-theme')
for (const r of RUM) if (!lika(rumMorktAttr[r], rumMorktMedia[r])) fel.push(`Mörkt läge: rummet ${r} skiljer sig mellan media och data-theme`)

function upplost(rum, lage) {
  const t = { ...basLjus, ...rumLjus[rum] }
  if (lage === 'morkt') Object.assign(t, basMorktAttr, rumMorktAttr[rum])
  return t
}

// ------------------------------------------------------------- WCAG
function rgb(hex) {
  const h = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(h)) return null
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}
function lum([r, g, b]) {
  const k = (c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b)
}
function kontrast(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}
const fmt = (x) => x.toFixed(1).replace('.', ',')

// ------------------------------------------------------------- paren
// typ: 'text' (minst 4,5), 'grafik' (minst 3), 'aldrig-text' (inget krav,
// men får aldrig bära text; redovisas), 'ton' (tonsteg, redovisas).
const PAR = [
  { fg: 'vagg-ink', bg: 'vagg', typ: 'text', roll: 'Rubrik och brödtext på väggen' },
  { fg: 'vagg-mjuk', bg: 'vagg', typ: 'text', roll: 'Dämpad text på väggen, ner till 11 px' },
  { fg: 'vagg-mjuk', bg: 'vagg-2', typ: 'text', roll: 'Dämpad text på väggens ljusa del' },
  { fg: 'vagg-ink', bg: 'vagg-2', typ: 'text', roll: 'Text på väggens ljusa del' },
  { fg: 'koppar-ljus', bg: 'vagg', typ: 'text', roll: 'Kopparfärgad text på väggen' },
  { fg: 'koppar-ljus', bg: 'vagg-2', typ: 'text', roll: 'Kopparfärgad text på väggens ljusa del' },
  { fg: 'ljus', bg: 'vagg', typ: 'text', roll: 'Siktets etikett' },
  { fg: 'koppar', bg: 'vagg', typ: 'grafik', roll: 'Linje, punkt, knapp på väggen' },
  { fg: 'koppar', bg: 'vagg-2', typ: 'aldrig-text', roll: 'Därför aldrig koppar som text på väggen' },
  { fg: 'vagg-svag', bg: 'vagg', typ: 'aldrig-text', roll: 'Streck och ihåliga märken, aldrig text' },
  { fg: 'koppar-text', bg: 'koppar', typ: 'text', roll: 'Primärknappen' },
  { fg: 'koppar-text', bg: 'koppar-djup', typ: 'text', roll: 'Primärknappen, toningens mörka ände' },
  { fg: 'ink-1', bg: 'golv', typ: 'text', roll: 'Text direkt på golvet' },
  { fg: 'ink-2', bg: 'golv', typ: 'text', roll: 'Brödtext på golvet' },
  { fg: 'ink-3', bg: 'golv', typ: 'text', roll: 'Metadata på golvet' },
  { fg: 'ink-1', bg: 'papper', typ: 'text', roll: 'Text på kort' },
  { fg: 'ink-2', bg: 'papper', typ: 'text', roll: 'Brödtext på kort' },
  { fg: 'ink-3', bg: 'papper', typ: 'text', roll: 'Metadata på kort' },
  { fg: 'ink-3', bg: 'papper-2', typ: 'text', roll: 'Metadata i fält' },
  { fg: 'ton-ink', bg: 'ton', typ: 'text', roll: 'Aktiv dörr, chip, regelpanel' },
  { fg: 'ton-ink', bg: 'papper', typ: 'text', roll: 'Rummets ton som text på kort' },
  { fg: 'koppar-ink', bg: 'papper', typ: 'text', roll: 'Koppar som text på kort' },
  { fg: 'koppar-ink', bg: 'golv', typ: 'text', roll: 'Koppar som text på golvet' },
  { fg: 'positiv', bg: 'papper', typ: 'text', roll: 'Sparat' },
  { fg: 'varning', bg: 'varning-mjuk', typ: 'text', roll: 'Varningsrad' },
  { fg: 'fel', bg: 'papper', typ: 'text', roll: 'Feltext' },
  { fg: 'fel', bg: 'fel-mjuk', typ: 'text', roll: 'Felrad' },
  { fg: 'koppar', bg: 'papper', typ: 'grafik', roll: 'Fokusring, kopparlinje på kort' },
  { fg: 'koppar', bg: 'golv', typ: 'fraga', roll: 'Fokusring på golvet. Under 3 i ljust läge, öppen fråga till art-director' },
  { fg: 'papper', bg: 'golv', typ: 'ton', roll: 'Tonsteg papper mot golv' },
]

// Sidomenyns aktiva dörr: vit ikon på rummets färg (ljust läge, spec 4.3).
const VIT = '#FFFFFF'

function rakna(lage) {
  const rader = []
  for (const p of PAR) {
    const v = {}
    for (const r of RUM) {
      const t = upplost(r, lage)
      const a = rgb(t[p.fg] ?? '')
      const b = rgb(t[p.bg] ?? '')
      if (!a || !b) {
        v[r] = null
        continue
      }
      const k = kontrast(a, b)
      v[r] = k
      if (p.typ === 'text' && k < 4.5) fel.push(`${lage} ${r}: ${p.fg} på ${p.bg} = ${fmt(k)}:1, under 4,5 för text`)
      if (p.typ === 'grafik' && k < 3) fel.push(`${lage} ${r}: ${p.fg} på ${p.bg} = ${fmt(k)}:1, under 3 för grafik`)
      if (p.typ === 'fraga' && k < 3) varningar.push(`${lage} ${r}: ${p.fg} på ${p.bg} = ${fmt(k)}:1, under 3 (öppen fråga, inte ett byggfel)`)
    }
    rader.push({ ...p, v })
  }
  if (lage === 'ljust') {
    const v = {}
    for (const r of RUM) {
      const k = kontrast(rgb(VIT), rgb(upplost(r, lage).rum))
      v[r] = k
      if (k < 3) fel.push(`ljust ${r}: vit på rum = ${fmt(k)}:1, under 3 för ikon`)
    }
    rader.push({ fg: 'vit', bg: 'rum', typ: 'grafik', roll: 'Aktiv dörr i sidomenyn (ikon)', v })
  }
  return rader
}

const KRAV = { text: 'AA, minst 4,5', grafik: 'grafik, minst 3', fraga: 'grafik, minst 3 (öppen)', 'aldrig-text': 'aldrig text', ton: 'tonsteg' }

function tabell(rader) {
  const huvud = `| Par | ${RUM.map((r) => RUMNAMN[r]).join(' | ')} | Krav | Roll |`
  const linje = `|---|${RUM.map(() => '---:').join('|')}|---|---|`
  const kropp = rader.map(
    (p) => `| \`${p.fg}\` på \`${p.bg}\` | ${RUM.map((r) => (p.v[r] == null ? 'n/a' : fmt(p.v[r]))).join(' | ')} | ${KRAV[p.typ]} | ${p.roll} |`
  )
  return [huvud, linje, ...kropp].join('\n')
}

const ljust = rakna('ljust')
const morkt = rakna('morkt')

// Adminens spårfärger (Tråden, panel #FFFFFF). ΔE76 i CIELAB mellan serierna.
function lab([r, g, b]) {
  const lin = (c) => {
    c /= 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const [R, G, B] = [lin(r), lin(g), lin(b)]
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]
}
// Deuteranopi (Machado 2009, svårighet 1,0) i linjärt RGB.
function deuter([r, g, b]) {
  const lin = (c) => {
    c /= 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const gam = (c) => Math.round(255 * Math.min(1, Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)))
  const [R, G, B] = [lin(r), lin(g), lin(b)]
  return [
    gam(0.367322 * R + 0.860646 * G - 0.227968 * B),
    gam(0.280085 * R + 0.672501 * G + 0.047413 * B),
    gam(-0.01182 * R + 0.04294 * G + 0.968881 * B),
  ]
}
const dE = (a, b) => {
  const [x, y] = [lab(a), lab(b)]
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}
const dcv = rgb(traden['diagram-cv'])
const dtest = rgb(traden['diagram-test'])
const dallt = rgb(traden['ink-1'])
const panel = rgb(traden.panel)
const admin = [
  `| Serie | Värde | Mot panel | Krav |`,
  `|---|---|---:|---|`,
  `| \`--diagram-cv\` (CV-paketet) | \`${traden['diagram-cv']}\` | ${fmt(kontrast(dcv, panel))} | grafik, minst 3 |`,
  `| \`--diagram-test\` (Träningspaketet) | \`${traden['diagram-test']}\` | ${fmt(kontrast(dtest, panel))} | grafik, minst 3 |`,
  `| \`--ink-1\` (Hela paketet) | \`${traden['ink-1']}\` | ${fmt(kontrast(dallt, panel))} | grafik, minst 3 |`,
].join('\n')
const adminDe = {
  cvTest: dE(dcv, dtest),
  cvAllt: dE(dcv, dallt),
  testAllt: dE(dtest, dallt),
  cvTestDeuter: dE(deuter(dcv), deuter(dtest)),
}
for (const [k, s] of [['diagram-cv', dcv], ['diagram-test', dtest]]) if (kontrast(s, panel) < 3) fel.push(`admin: ${k} under 3:1 mot panelen`)
const adminText =
  admin +
  `\n\nAvstånd i CIELAB (ΔE76): petrol mot indigo ${fmt(adminDe.cvTest)}, petrol mot ink-1 ${fmt(adminDe.cvAllt)}, indigo mot ink-1 ${fmt(adminDe.testAllt)}. ` +
  `Med deuteranopi (Machado 2009): petrol mot indigo ${fmt(adminDe.cvTestDeuter)}. Varje serie har direktetikett vid slutpunkten, så färgen är aldrig ensam bärare.`

const genererat =
  `### Ljust läge\n\n${tabell(ljust)}\n\n### Mörkt läge\n\nVäggen byter aldrig, så väggparen är desamma som i ljust läge.\n\n${tabell(morkt)}\n\n### Adminens spårfärger (Tråden, panel \`#FFFFFF\`)\n\n${adminText}`

// ------------------------------------------------------------- dokumentet
const START = '<!-- kontrast:start -->'
const SLUT = '<!-- kontrast:slut -->'
const dok = fs.readFileSync(DOK, 'utf8')
const i = dok.indexOf(START)
const j = dok.indexOf(SLUT)

if (SKRIV) {
  if (i < 0 || j < 0) throw new Error(`Markörerna ${START} och ${SLUT} saknas i ${DOK}`)
  const nytt = dok.slice(0, i + START.length) + '\n\n' + genererat + '\n\n' + dok.slice(j)
  fs.writeFileSync(DOK, nytt)
  console.log(`Skrev tabellerna i ${DOK}.`)
} else {
  if (i < 0 || j < 0) fel.push(`Markörerna ${START} och ${SLUT} saknas i ${DOK}`)
  else {
    const iDok = dok.slice(i + START.length, j).trim()
    if (iDok !== genererat.trim()) {
      const a = iDok.split('\n')
      const b = genererat.trim().split('\n')
      for (let n = 0; n < Math.max(a.length, b.length); n++) {
        if (a[n] !== b[n]) {
          fel.push(`designsystem.md avviker från uträkningen, första skillnaden:\n  dok:  ${a[n]}\n  räkn: ${b[n]}`)
          break
        }
      }
    }
  }
}

// ------------------------------------------------------------- rapport
const textpar = [...ljust, ...morkt].filter((p) => p.typ === 'text')
const lagsta = textpar.flatMap((p) => RUM.map((r) => ({ p, r, k: p.v[r] }))).filter((x) => x.k != null).sort((a, b) => a.k - b.k)[0]
console.log(`Par: ${PAR.length + 1} i ljust, ${PAR.length} i mörkt, fem rum.`)
console.log(`Textpar kontrollerade: ${textpar.length * RUM.length}. Lägsta: ${lagsta.p.fg} på ${lagsta.p.bg} i ${RUMNAMN[lagsta.r]} = ${fmt(lagsta.k)}:1.`)
console.log(`Admin: petrol ${fmt(kontrast(dcv, panel))}:1, indigo ${fmt(kontrast(dtest, panel))}:1 mot panelen, ΔE petrol/indigo ${fmt(adminDe.cvTest)} (deuteranopi ${fmt(adminDe.cvTestDeuter)}).`)
if (varningar.length) {
  console.log(`\n${varningar.length} öppna, till art-director:`)
  for (const v of varningar) console.log(' - ' + v)
}
if (fel.length) {
  console.log(`\n${fel.length} avvikelser:`)
  for (const f of fel) console.log(' - ' + f)
  process.exit(1)
}
console.log('\nInga avvikelser.')
