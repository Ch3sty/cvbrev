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
//     noll i dashboard, shell och rum. Övriga mönster räknas men stoppar inte.

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
if (vag === '1b') {
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
  grind1b = gra + lucide.length
  rader.push('', `## Våg 1b: grå klasser i inloggat (${omfang.length} filer): ${gra} träffar i ${perFil.length} filer`)
  for (const [f, n] of perFil.sort((a, b) => b[1] - a[1])) rader.push(`${String(n).padStart(5)}  ${f}`)
  rader.push(`Undantag: ${UNDANTAG.map(String).join(', ')}, rader med klassen dokument (pappersytan, spec 13.1) och kommentarsrader.`)
}

const text = rader.join('\n') + '\n'
process.stdout.write(text)
const i = process.argv.indexOf('--ut')
if (i >= 0) fs.writeFileSync(process.argv[i + 1], text)
if (process.argv.includes('--noll')) {
  if (vag === '1b' ? grind1b > 0 : summa > 0 || lucide.length > 0) process.exit(1)
}
