// scripts/grep-rummen.mjs
// Grep-listan i Rummen (spec-rummen-2026-10-10 avsnitt 1.7, designsystem.md
// avsnitt 10). Räknar träffar per mönster och fil i src/app/dashboard och
// src/components, utanför src/components/ui. Raden med font-display undantas
// (vikterna 700 och 800 får stå där).
//
//   node scripts/grep-rummen.mjs                 # skriv till stdout
//   node scripts/grep-rummen.mjs --ut fil.txt    # och till fil
//   node scripts/grep-rummen.mjs --noll          # exit 1 om något mönster har träffar
//   node scripts/grep-rummen.mjs --vag 1b --noll # grindarna efter våg 1b (spec 13.1 och 13.9):
//     text-gray-, bg-white, bg-gray-, border-gray- är noll i allt som renderas
//     i inloggat (rummen-omfang.mjs), utom src/components/ui, dokumentytorna
//     (brevet och CV-mallarnas förhandsvisning) och kommentarsrader; lucide
//     noll i dashboard, shell och rum. Väggen bär aldrig KNAPP_PRIMAR (spec
//     16.3.1): KNAPP_PRIMAR på samma rad som handling= eller action=, eller
//     innanför ett <RumHuvud>- eller <Vagg>-element, stoppar. Övriga mönster
//     räknas men stoppar inte.

import fs from 'node:fs'
import path from 'node:path'
import { inloggatFiler } from './rummen-omfang.mjs'

const MONSTER = [
  ['em-dash', /—/],
  ['Sparkles', /Sparkles/],
  ['bg-gradient', /bg-gradient/],
  ['linear-gradient i .tsx', /linear-gradient/],
  ['animate-pulse', /animate-pulse/],
  ['shadow-(sm|md|lg|xl)', /shadow-(sm|md|lg|xl)\b/],
  ['text-gray-', /text-gray-/],
  ['bg-white', /bg-white(?![\/\w-])/],
  ['rounded-3xl', /rounded-3xl/],
  ['font-(bold|extrabold|black) utan font-display', /font-(bold|extrabold|black)/],
  ['dark:-klasser', /(^|["' `])dark:/],
]
const LUCIDE_KATALOGER = ['src/components/dashboard', 'src/components/shell', 'src/components/rum']

function filer(dir) {
  if (!fs.existsSync(dir)) return []
  const ut = []
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name)
    if (d.isDirectory()) ut.push(...filer(p))
    else if (p.endsWith('.tsx')) ut.push(p)
  }
  return ut
}

const alla = [...filer('src/app/dashboard'), ...filer('src/components')]
  .map((p) => p.split(path.sep).join('/'))
  .filter((p) => !p.startsWith('src/components/ui/'))

const rader = []
let summa = 0
rader.push(`Grep-listan (spec-rummen avsnitt 1.7), ${new Date().toISOString().slice(0, 10)}. ${alla.length} filer.`)
for (const [namn, re] of MONSTER) {
  const perFil = []
  for (const f of alla) {
    const n = fs
      .readFileSync(f, 'utf8')
      .split('\n')
      .filter((r) => re.test(r) && !r.includes('font-display')).length
    if (n) perFil.push([f, n])
  }
  const tot = perFil.reduce((s, [, n]) => s + n, 0)
  summa += tot
  rader.push('', `## ${namn}: ${tot} träffar i ${perFil.length} filer`)
  for (const [f, n] of perFil.sort((a, b) => b[1] - a[1])) rader.push(`${String(n).padStart(5)}  ${f}`)
}
const lucide = LUCIDE_KATALOGER.flatMap(filer)
  .map((p) => p.split(path.sep).join('/'))
  .filter((f) => /from ['"]lucide-react['"]/.test(fs.readFileSync(f, 'utf8')))
rader.push('', `## lucide-react i ${LUCIDE_KATALOGER.join(', ')}: ${lucide.length} filer`, ...lucide.map((f) => `       ${f}`))

// ------------------------------------------------------------ våg 1b
const vagIdx = process.argv.indexOf('--vag')
const vag = vagIdx >= 0 ? process.argv[vagIdx + 1] : null
let grind1b = 0
// Våg 2 kör 1b:s grindar plus sina egna (nedan).
if (vag === '1b' || vag === '2') {
  // Dokumentytor: brevet och mallarnas förhandsvisning ska vara papper i
  // båda lägena (spec 13.1, undantag). Raderna står kvar med flit.
  const UNDANTAG = [
    /^src\/components\/ui\//,
    /^src\/components\/cv-templates\//,
    /^src\/components\/letter-templates\//,
    /TemplatePreview/,
  ]
  const GRA = /\b(text-gray-|bg-gray-|border-gray-)|\bbg-white(?![\/\w-])/
  const kommentar = (r) => /^\s*(\/\/|\*|\/\*|\{\/\*)/.test(r)
  const omfang = inloggatFiler().filter((f) => f.endsWith('.tsx') && !UNDANTAG.some((u) => u.test(f)))
  const perFil = []
  for (const f of omfang) {
    const n = fs.readFileSync(f, 'utf8').split('\n').filter((r) => GRA.test(r) && !kommentar(r) && !/["' ]dokument["' ]/.test(r)).length
    if (n) perFil.push([f, n])
  }
  const gra = perFil.reduce((a, [, n]) => a + n, 0)

  // Väggen bär aldrig KNAPP_PRIMAR (spec 16.3.1 punkt 1).
  const vaggTraffar = []
  for (const f of alla) {
    const kod = fs.readFileSync(f, 'utf8')
    kod.split('\n').forEach((r, i) => {
      if (/KNAPP_PRIMAR/.test(r) && /\b(handling|action)=/.test(r) && !kommentar(r)) vaggTraffar.push(`${f}:${i + 1}`)
    })
    for (const tagg of ['RumHuvud', 'Vagg']) {
      let fran = 0
      for (;;) {
        const start = kod.indexOf('<' + tagg, fran)
        if (start < 0) break
        fran = start + 1
        if (/\w/.test(kod[start + tagg.length + 1] ?? '')) continue
        // Taggens slut på djup 0: "/>" (självstängd) eller ">" följt av </tagg>.
        let djup = 0
        let slut = -1
        let sjalvstangd = false
        for (let i = start + 1; i < kod.length; i++) {
          const c = kod[i]
          if (c === '{') djup++
          else if (c === '}') djup--
          else if (djup === 0 && c === '>') {
            sjalvstangd = kod[i - 1] === '/'
            slut = i
            break
          }
        }
        if (slut < 0) break
        const stopp = sjalvstangd ? slut : kod.indexOf('</' + tagg + '>', slut)
        if (/KNAPP_PRIMAR/.test(kod.slice(start, stopp < 0 ? slut : stopp))) {
          vaggTraffar.push(`${f}:${kod.slice(0, start).split('\n').length} (<${tagg}>)`)
        }
      }
    }
  }
  rader.push('', `## Våg 1b: KNAPP_PRIMAR på väggen: ${vaggTraffar.length} träffar`, ...vaggTraffar.map((t) => `       ${t}`))

  grind1b = gra + lucide.length + vaggTraffar.length
  rader.push('', `## Våg 1b: grå klasser i inloggat (${omfang.length} filer): ${gra} träffar i ${perFil.length} filer`)
  for (const [f, n] of perFil.sort((a, b) => b[1] - a[1])) rader.push(`${String(n).padStart(5)}  ${f}`)
  rader.push(`Undantag: ${UNDANTAG.map(String).join(', ')}, rader med klassen dokument (pappersytan, spec 13.1) och kommentarsrader.`)
}

// ------------------------------------------------------------ våg 2
// Rekryteringstesters hemvy, ingång och kurva (spec-rummen 0 beslut 1 och
// 3b.3): koppar som text på väggen är alltid koppar-ljus, ren koppar bara
// linje, punkt och knapp; i src/components/traning får text-koppar bara stå
// som -ljus, -ink eller -text. Strängarna bor i copy-filerna (avsnitt 8)
// och har inga tankstreck. Förhandsvisningen har sin spärr.
let grind2 = 0
if (vag === '2') {
  const traffar = []
  for (const f of filer('src/components/traning').map((p) => p.split(path.sep).join('/'))) {
    fs.readFileSync(f, 'utf8').split('\n').forEach((r, i) => {
      if (/text-koppar(?![-\w])/.test(r)) traffar.push(`${f}:${i + 1} text-koppar`)
    })
  }
  for (const f of ['src/lib/traning/hem-copy.ts', 'src/lib/traning/kurvan-copy.ts', 'src/lib/traning/rubrik.ts', 'src/lib/traning/copy.ts']) {
    if (!fs.existsSync(f)) continue
    fs.readFileSync(f, 'utf8').split('\n').forEach((r, i) => {
      if (/[—–]/.test(r)) traffar.push(`${f}:${i + 1} tankstreck`)
    })
  }
  const fh = 'src/app/dashboard/tester/forhandsvisning/page.tsx'
  if (fs.existsSync(fh) && !fs.readFileSync(fh, 'utf8').includes("TRANING_FORHANDSVISNING === '1'")) traffar.push(`${fh}: saknar spärren`)
  grind2 = traffar.length
  rader.push('', `## Våg 2: koppar som text, tankstreck i copy och förhandsvisningens spärr: ${traffar.length} träffar`, ...traffar.map((t) => `       ${t}`))
}

// ------------------------------------------------------------ våg 3b
// Passet och resultatskärmarna (spec 6 våg 3b, acceptans 3 och 4):
//  - ren koppar som textfärg i src/components/traning: noll (på väggen är
//    kopparfärgad text alltid text-koppar-ljus, på golvet text-koppar-ink);
//  - --fel och fel-klasserna i passet: noll (aldrig rött på en missad fråga);
//  - lucide-react i src/components/traning: noll;
//  - KNAPP_PRIMAR innanför väggen: noll (samma regel som 1b);
//  - inga användartexter i JSX: varje >Text< i src/components/traning ska
//    komma ur copy (räknas, stoppar inte: falska träffar på kod går inte att
//    skilja ut med regex).
let grind3b = 0
if (vag === '3b') {
  const traning = filer('src/components/traning').map((p) => p.split(path.sep).join('/'))
  const kommentar = (r) => /^\s*(\/\/|\*|\/\*|\{\/\*)/.test(r)
  const rakna = (re) => {
    const ut = []
    for (const f of traning) {
      fs.readFileSync(f, 'utf8')
        .split('\n')
        .forEach((r, i) => {
          if (re.test(r) && !kommentar(r)) ut.push(`${f}:${i + 1}`)
        })
    }
    return ut
  }
  const kopparText = rakna(/\btext-koppar(?![-\w])/)
  // Rött i passet: bara passets och resultatens filer. Ingången (våg 2) har
  // sin sparfelsruta i felfärgerna, vilket är rätt: det är ett nätverksfel,
  // inte en missad fråga (sammanslagningen 2 + 3b).
  const fel = rakna(/--fel\b|\b(text|bg|border|ring|fill|stroke)-fel\b/).filter((t) => !t.startsWith('src/components/traning/Ingang.tsx:'))
  const lucideTraning = traning.filter((f) => /from ['"]lucide-react['"]/.test(fs.readFileSync(f, 'utf8')))
  const vaggPrimar = rakna(/<div className="vagg[^"]*"[^>]*>.*KNAPP_PRIMAR/)
  const jsxText = rakna(/>\s*[A-ZÅÄÖ][a-zåäö]+(\s+[a-zåäö]+){1,}\s*</)
  grind3b = kopparText.length + fel.length + lucideTraning.length + vaggPrimar.length
  rader.push('', `## Våg 3b (${traning.length} filer i src/components/traning)`)
  rader.push(`text-koppar som ren koppar: ${kopparText.length}`, ...kopparText.map((t) => `       ${t}`))
  rader.push(`--fel och fel-klasser i passet: ${fel.length}`, ...fel.map((t) => `       ${t}`))
  rader.push(`lucide-react: ${lucideTraning.length}`, ...lucideTraning.map((t) => `       ${t}`))
  rader.push(`KNAPP_PRIMAR på väggen: ${vaggPrimar.length}`, ...vaggPrimar.map((t) => `       ${t}`))
  rader.push(`Text i JSX (räknas, stoppar inte): ${jsxText.length}`, ...jsxText.map((t) => `       ${t}`))
}

const text = rader.join('\n') + '\n'
process.stdout.write(text)
const i = process.argv.indexOf('--ut')
if (i >= 0) fs.writeFileSync(process.argv[i + 1], text)
if (process.argv.includes('--noll')) {
  if (vag === '1b' ? grind1b > 0 : vag === '2' ? grind1b + grind2 > 0 : vag === '3b' ? grind3b > 0 : summa > 0 || lucide.length > 0) process.exit(1)
}
