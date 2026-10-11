// scripts/grep-rummen.mjs
// Grep-listan i Rummen (spec-rummen-2026-10-10 avsnitt 1.7, designsystem.md
// avsnitt 10). Räknar träffar per mönster och fil i src/app/dashboard och
// src/components, utanför src/components/ui. Raden med font-display undantas
// (vikterna 700 och 800 får stå där).
//
//   node scripts/grep-rummen.mjs                 # skriv till stdout
//   node scripts/grep-rummen.mjs --ut fil.txt    # och till fil
//   node scripts/grep-rummen.mjs --noll          # exit 1 om något mönster har träffar
//   node scripts/grep-rummen.mjs --vag 5 --noll  # paketbytet: "Hela paketet" och "Uppgradera" noll i användarytorna
//   node scripts/grep-rummen.mjs --vag 4 --noll  # våg 1b:s grindar plus grep-listan noll i inloggat
//     utanför testrummets kataloger (våg 2/3b), alias, lucide, InkPanel/PageHeader/MarginPlate
//     och CreateSheet (spec avsnitt 6, våg 4)
//   node scripts/grep-rummen.mjs --vag tester-v2 --noll # ordbytet i Testerna v2: mätning,
//     generalrepetition och provläge noll i strängar i src (kodnycklar och kommentarer undantagna)
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
// Våg 2 och våg 4 kör 1b:s grindar plus sina egna (nedan).
if (vag === '1b' || vag === '2' || vag === '4') {
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

// ------------------------------------------------------------ våg 4
// Grindarna efter våg 4 (spec avsnitt 6, våg 4, och 1.7): grep-listan noll
// i allt som renderas i inloggat, utanför undantagen. Testrummets filer
// (src/app/dashboard/tester, src/components/tests, src/components/traning,
// src/components/personalityTest) byggs om av våg 2 och 3b parallellt; de
// räknas och listas för sig men stoppar inte våg 4.
let grind4 = 0
if (vag === '4') {
  const UNDANTAG4 = [
    /^src\/components\/ui\//,
    /^src\/components\/cv-templates\//,
    /^src\/components\/letter-templates\//,
    /TemplatePreview/,
    // OG-bilderna är bilder, inte gränssnitt (toningar och vikter hör till dem).
    /^src\/app\/dashboard\/og-preview\//,
    /^src\/components\/og-preview\//,
    // Rekryterarens kort, visat som förhandsvisning i Bli upptäckt.
    /^src\/components\/candidate\/CardWorkStyleStrip\.tsx$/,
  ]
  const VAG23 = [
    /^src\/app\/dashboard\/tester\//,
    /^src\/components\/tests\//,
    /^src\/components\/traning\//,
    /^src\/components\/personalityTest\//,
    // Testbankernas renderare (testansvarig och våg 3a/3c).
    /^src\/lib\/logicTestV7\//,
  ]
  const MONSTER4 = [
    ['em-dash', /—/],
    ['Sparkles', /Sparkles/],
    ['bg-gradient', /bg-gradient/],
    ['linear-gradient', /linear-gradient/],
    ['animate-pulse', /animate-pulse/],
    ['shadow-(sm|md|lg|xl)', /shadow-(sm|md|lg|xl)\b/],
    ['rounded-3xl', /rounded-3xl/],
    ['font-(bold|extrabold|black) utan font-display', /font-(bold|extrabold|black)/],
    ['lucide-react', /from ['"]lucide-react['"]/],
    ['Trådens alias (mark, panel, insunken, accent, ink-1-mjuk/-kant/-accent)', /\b(?:bg|text|border|ring|from|to|via|fill|stroke|decoration|outline|divide|shadow)-(?:mark|panel|insunken|accent|accent-ink|accent-mjuk|ink-1-mjuk|ink-1-kant|ink-1-accent)\b(?!-)|var\(--(?:mark|panel|insunken|insunken-topp|accent|accent-ink|accent-mjuk|ink-1-mjuk|ink-1-kant)\)/],
    ['InkPanel, PageHeader, MarginPlate', /from ['"][^'"]*\/(InkPanel|PageHeader|MarginPlate)['"]|\b(INK_KNAPP|INK_LANK)\b/],
  ]
  const alla4 = inloggatFiler()
    .filter((f) => f.endsWith('.tsx'))
    .filter((f) => !UNDANTAG4.some((u) => u.test(f)))
  const egna = alla4.filter((f) => !VAG23.some((u) => u.test(f)))
  const andras = alla4.filter((f) => VAG23.some((u) => u.test(f)))
  const rakna = (filer, re, namn) => {
    const per = []
    for (const f of filer) {
      const n = fs
        .readFileSync(f, 'utf8')
        .split('\n')
        .filter((r) => re.test(r) && !(namn.startsWith('font-') && r.includes('font-display'))).length
      if (n) per.push([f, n])
    }
    return per
  }
  rader.push('', `## Våg 4: grep-listan i inloggat (${egna.length} egna filer, ${andras.length} i våg 2/3b:s kataloger)`)
  for (const [namn, re] of MONSTER4) {
    const per = rakna(egna, re, namn)
    const tot = per.reduce((s, [, n]) => s + n, 0)
    grind4 += tot
    const per23 = rakna(andras, re, namn)
    const tot23 = per23.reduce((s, [, n]) => s + n, 0)
    rader.push(`   ${namn}: ${tot} träffar${tot23 ? ` (och ${tot23} i våg 2/3b:s filer)` : ''}`)
    for (const [f, n] of per) rader.push(`${String(n).padStart(8)}  ${f}`)
  }
  // CreateSheet är borttagen (spec 2.1).
  if (fs.existsSync('src/components/dashboard/CreateSheet.tsx')) {
    grind4 += 1
    rader.push('   CreateSheet.tsx finns kvar')
  } else rader.push('   CreateSheet: borttagen')
  rader.push(
    `Undantag: ${UNDANTAG4.map(String).join(', ')}. Våg 2/3b:s kataloger räknas för sig: ${VAG23.map(String).join(', ')}.`
  )
  // RumIkoner är ett övergångslager (art-director 21.2 fråga 5): nya vyer
  // importerar Ikoner eller RumSymboler. Varnar, stoppar inte, för importer
  // utanför de filer som hade dem 2026-10-11 (scripts/rumikoner-baslinje.json).
  const baslinje = new Set(JSON.parse(fs.readFileSync('scripts/rumikoner-baslinje.json', 'utf8')).filer)
  const nyaRumIkoner = filer('src')
    .map((f) => f.split(path.sep).join('/'))
    .filter((f) => /.(tsx?|jsx?)$/.test(f) && !baslinje.has(f) && /from ['"][^'"]*RumIkoner['"]/.test(fs.readFileSync(f, 'utf8')))
  rader.push(`Varning (stoppar inte): nya importer av RumIkoner utanför baslinjen: ${nyaRumIkoner.length}`, ...nyaRumIkoner.map((f) => `       ${f}`))
}

// ------------------------------------------------------------ våg 5
// Paketbytet (spec-rummen 17.3 och 17.4, copy-premium avsnitt 7): "Hela
// paketet" och "Uppgradera" är noll i användarytorna. Räknar strängar och
// JSX-text i kodrader (kommentarer bort) i hela src, utom de interna ytorna
// (admin, cron) och innehållstexterna där ordet uppgradera betyder något
// annat (CV- och brevexemplens yrkestexter).
let grind5 = 0
if (vag === '5') {
  const UNDANTAG5 = [
    /^src\/app\/admin\//,
    /^src\/app\/api\/admin\//,
    /^src\/app\/api\/cron\//,
    /^src\/lib\/admin\//,
    /^src\/components\/admin\//,
    /^src\/lib\/ai\/analytics\/smart-alerts\.ts$/,
    // GAMLA_NAMN översätter gammal mejlmetadata: namnet står där med flit.
    /^src\/lib\/plans\/plans\.ts$/,
    /^src\/app\/\(public\)\/cv-exempel\//,
    /^src\/app\/\(public\)\/personligt-brev-exempel\//,
    /^src\/app\/\(public\)\/cv-mallar\/yrkesmall-content\.ts$/,
    /__tests__\//,
    /\.test\.tsx?$/,
  ]
  const MONSTER5 = [
    ['Hela paketet', /[Hh]ela paketet/],
    ['Uppgradera', /[Uu]ppgradera/],
  ]
  // En kodrad utan kommentarer, och bara det som står i en sträng eller som
  // JSX-text: identifierare som uppgradera() räknas inte.
  const strangar = (rad) => {
    const utan = rad.replace(/\s\/\/.*$/, '').replace(/\{\/\*.*?\*\/\}/g, '')
    const ut = []
    for (const m of utan.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`|>[^<>{}]+</g)) ut.push(m[0])
    return ut.join(' ')
  }
  const kodrader5 = (text) => {
    const ut = []
    let iBlock = false
    for (const rad of text.split(/\r?\n/)) {
      const t = rad.trim()
      if (iBlock) {
        if (t.includes('*/')) iBlock = false
        continue
      }
      if ((t.startsWith('/*') || t.startsWith('{/*')) && !t.includes('*/')) {
        iBlock = true
        continue
      }
      if (/^(\/\/|\*|\/\*|\{\/\*)/.test(t) || t.endsWith('*/}')) continue
      ut.push(rad)
    }
    return ut
  }
  const omfang5 = filer('src')
    .concat(
      fs.existsSync('src')
        ? (function tsFiler(dir) {
            const ut = []
            for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
              const p = path.join(dir, d.name)
              if (d.isDirectory()) ut.push(...tsFiler(p))
              else if (p.endsWith('.ts')) ut.push(p)
            }
            return ut
          })('src')
        : []
    )
    .map((f) => f.split(path.sep).join('/'))
    .filter((f) => !UNDANTAG5.some((u) => u.test(f)))
  rader.push('', `## Våg 5: paketbytet i användarytorna (${omfang5.length} filer i src, utom admin, cron och yrkestexterna)`)
  for (const [namn, re] of MONSTER5) {
    const per = []
    for (const f of omfang5) {
      const traffar = kodrader5(fs.readFileSync(f, 'utf8')).filter((r) => re.test(strangar(r)))
      if (traffar.length) per.push([f, traffar.length, traffar[0].trim().slice(0, 100)])
    }
    const tot = per.reduce((s, [, n]) => s + n, 0)
    grind5 += tot
    rader.push(`   ${namn}: ${tot} träffar`)
    for (const [f, n, forsta] of per) rader.push(`${String(n).padStart(8)}  ${f}  (${forsta})`)
  }
}

// ------------------------------------------------------------ testerna v2
// Ordbytet i Testerna v2 (riktlinjer-tester-v2 5.4 och ägarbeslutet
// 2026-10-11): mätning, nivåmätning, ommätning, "mät igen", generalrepetition
// och provläge är noll i strängar och JSX-text i hela src. Kommentarer och
// identifierare räknas inte, inte heller strängar som är kodnycklar (inga
// mellanslag, bara gemener, siffror, _ och -: händelsenamn, milstolpsnycklar
// och test_type står kvar med flit). Undantag som i våg 5: admin, cron och
// yrkestexterna där "mätning" betyder något annat.
let grindV2 = 0
if (vag === 'tester-v2') {
  const UNDANTAGV2 = [
    /^src\/app\/admin\//,
    /^src\/app\/api\/admin\//,
    /^src\/app\/api\/cron\//,
    /^src\/lib\/admin\//,
    /^src\/components\/admin\//,
    /^src\/app\/\(public\)\/cv-exempel\//,
    /^src\/app\/\(public\)\/personligt-brev-exempel\//,
    /^src\/app\/\(public\)\/cv-mallar\/yrkesmall-content\.ts$/,
    // CV-förslagens yrkestext ("resultatmätning") handlar inte om testerna.
    /^src\/lib\/cv\//,
    /__tests__\//,
    /\.test\.tsx?$/,
  ]
  const ORD = /[Nn]ivåmätning|[Oo]mmätning|[Mm]ätning|[Mm]ät igen|[Gg]eneralrepetition|[Pp]rovläge/
  const kodnyckel = (s) => /^['"`][a-z0-9_\-:.\/]*['"`]$/.test(s)
  const strangarV2 = (rad) => {
    const utan = rad.replace(/(^|\s)\/\/.*$/, '').replace(/\{\/\*.*?\*\/\}/g, '').replace(/\/\*.*?\*\//g, '')
    const ut = []
    for (const m of utan.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`|>[^<>{}=]+</g)) {
      if (!kodnyckel(m[0])) ut.push(m[0])
    }
    return ut.join(' ')
  }
  const kodraderV2 = (text) => {
    const ut = []
    let iBlock = false
    text.split(/\r?\n/).forEach((rad, i) => {
      const t = rad.trim()
      if (iBlock) {
        if (t.includes('*/')) iBlock = false
        return
      }
      if ((t.startsWith('/*') || t.startsWith('{/*')) && !t.includes('*/')) {
        iBlock = true
        return
      }
      if (/^(\/\/|\*|\/\*|\{\/\*)/.test(t) || t.endsWith('*/}')) return
      ut.push([i + 1, rad])
    })
    return ut
  }
  const tsOchTsx = (dir) => {
    const ut = []
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, d.name)
      if (d.isDirectory()) ut.push(...tsOchTsx(p))
      else if (/\.(ts|tsx)$/.test(p)) ut.push(p)
    }
    return ut
  }
  const omfangV2 = tsOchTsx('src')
    .map((f) => f.split(path.sep).join('/'))
    .filter((f) => !UNDANTAGV2.some((u) => u.test(f)))
  const traffar = []
  for (const f of omfangV2) {
    for (const [nr, r] of kodraderV2(fs.readFileSync(f, 'utf8'))) {
      if (ORD.test(strangarV2(r))) traffar.push(`${f}:${nr}  ${r.trim().slice(0, 110)}`)
    }
  }
  grindV2 = traffar.length
  rader.push('', `## Testerna v2: gamla ord i strängar (${omfangV2.length} filer i src): ${traffar.length} träffar`, ...traffar.map((t) => `       ${t}`))
}

const text = rader.join('\n') + '\n'
process.stdout.write(text)
const i = process.argv.indexOf('--ut')
if (i >= 0) fs.writeFileSync(process.argv[i + 1], text)
if (process.argv.includes('--noll')) {
  if (vag === '1b' ? grind1b > 0 : vag === '2' ? grind1b + grind2 > 0 : vag === '3b' ? grind3b > 0 : vag === '4' ? grind1b + grind4 > 0 : vag === '5' ? grind5 > 0 : vag === 'tester-v2' ? grindV2 > 0 : summa > 0 || lucide.length > 0) process.exit(1)
}
