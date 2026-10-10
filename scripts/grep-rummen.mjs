// scripts/grep-rummen.mjs
// Grep-listan i Rummen (spec-rummen-2026-10-10 avsnitt 1.7, designsystem.md
// avsnitt 10). Räknar träffar per mönster och fil i src/app/dashboard och
// src/components, utanför src/components/ui. Raden med font-display undantas
// (vikterna 700 och 800 får stå där).
//
//   node scripts/grep-rummen.mjs                 # skriv till stdout
//   node scripts/grep-rummen.mjs --ut fil.txt    # och till fil
//   node scripts/grep-rummen.mjs --noll          # exit 1 om något mönster har träffar

import fs from 'node:fs'
import path from 'node:path'

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

const text = rader.join('\n') + '\n'
process.stdout.write(text)
const i = process.argv.indexOf('--ut')
if (i >= 0) fs.writeFileSync(process.argv[i + 1], text)
if (process.argv.includes('--noll') && (summa > 0 || lucide.length > 0)) process.exit(1)
