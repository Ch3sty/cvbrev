// scripts/rummen-omfang.mjs
// Vilka filer renderas i inloggat? Följer importerna (statiska, dynamiska
// och next/dynamic) från src/app/dashboard och ger mängden .tsx/.ts-filer
// som nås därifrån. Används av grep-rummen.mjs (--vag 1b) och av
// mappningen i våg 1b (spec-rummen 13.1): "src/app/dashboard och varje
// komponent som renderas där".
//
//   node scripts/rummen-omfang.mjs            # listar filerna
//   node scripts/rummen-omfang.mjs --delade   # bara de som även nås från publika sidor

import fs from 'node:fs'
import path from 'node:path'

const ROT = process.cwd()
const SRC = path.join(ROT, 'src')
const TILLAGG = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts']

function los(fran, spec) {
  let bas
  if (spec.startsWith('@/')) bas = path.join(SRC, spec.slice(2))
  else if (spec.startsWith('.')) bas = path.resolve(path.dirname(fran), spec)
  else return null
  if (fs.existsSync(bas) && fs.statSync(bas).isFile()) return bas
  for (const t of TILLAGG) {
    const p = bas + t
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  return null
}

const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|^\s*import\s*['"]([^'"]+)['"]/gm

function importer(fil) {
  const text = fs.readFileSync(fil, 'utf8')
  const ut = []
  for (const m of text.matchAll(IMPORT_RE)) {
    const spec = m[1] || m[2] || m[3]
    const p = los(fil, spec)
    if (p && /\.(tsx?|jsx?)$/.test(p)) ut.push(p)
  }
  return ut
}

function filerUnder(dir) {
  if (!fs.existsSync(dir)) return []
  const ut = []
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name)
    if (d.isDirectory()) ut.push(...filerUnder(p))
    else if (/\.(tsx?|jsx?)$/.test(p) && !/__tests__|\.test\./.test(p)) ut.push(p)
  }
  return ut
}

export function nabara(startfiler) {
  const sett = new Set()
  const ko = [...startfiler]
  while (ko.length) {
    const f = ko.pop()
    if (sett.has(f)) continue
    sett.add(f)
    for (const i of importer(f)) if (!sett.has(i)) ko.push(i)
  }
  return sett
}

const rel = (p) => path.relative(ROT, p).split(path.sep).join('/')

/** Filer som renderas i inloggat (src/app/dashboard och allt de importerar). */
export function inloggatFiler() {
  return [...nabara(filerUnder(path.join(SRC, 'app', 'dashboard')))].map(rel).sort()
}

/** Filer som nås från publika rutter (allt i src/app utom dashboard, admin och api). */
export function publikaFiler() {
  const app = path.join(SRC, 'app')
  const start = filerUnder(app).filter((p) => {
    const r = rel(p)
    return !r.startsWith('src/app/dashboard/') && !r.startsWith('src/app/admin/') && !r.startsWith('src/app/api/')
  })
  return [...nabara(start)].map(rel).sort()
}

if (import.meta.url === `file:///${process.argv[1].split(path.sep).join('/')}` || process.argv[1]?.endsWith('rummen-omfang.mjs')) {
  const inl = inloggatFiler()
  if (process.argv.includes('--delade')) {
    const pub = new Set(publikaFiler())
    for (const f of inl) if (pub.has(f) && f.endsWith('.tsx')) console.log(f)
  } else {
    for (const f of inl) if (f.endsWith('.tsx')) console.log(f)
  }
}
