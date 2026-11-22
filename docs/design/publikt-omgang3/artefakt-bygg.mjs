// Bygger artefaktsidan ur mallen och det som är ritat, och synkar allt till en mapp som går att publicera.
//   node docs/design/publikt-omgang3/artefakt-bygg.mjs <målmapp>
// Skriver ut listan över filer som ska med i publiceringen.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rot = path.dirname(fileURLToPath(import.meta.url))
const mal = process.argv[2]
if (!mal) { console.error('ange målmapp'); process.exit(1) }

// granskad: jag har själv sett de renderade bilderna i 375 eller 412 och 1440.
const GRANSKADE = new Set((process.env.GRANSKADE || 'start,cv-analys').split(','))
// sedd: första skärmen sedd i telefonbredd (412) av den som håller ihop arbetet.
const SEDDA = new Set((process.env.SEDDA || 'meny,funktioner,priser,om-oss,registrering,inloggning,artikelreklam,rekryteringstester,personlighetstest,skapa-cv,cv-mallar,linkedin,personligt-brev,brev-exempelnav,brev-exempel,brev-artikel,skapa-brev-start,sokta-tjanster,jobbmatchning,jobbcoachen,bli-upptackt').split(','))

const GRUPPER = [
  ['Hela sajten', 'neutral', [['start', 'Startsidan', '/'], ['meny', 'Menyn', 'alla sidor'], ['funktioner', 'Funktioner', '/funktioner'], ['priser', 'Priser', '/priser'], ['om-oss', 'Om oss', '/om-oss'], ['registrering', 'Skapa konto', '/register'], ['inloggning', 'Logga in', '/login'], ['artikelreklam', 'Artiklarnas reklam', '/artiklar/...']]],
  ['Rekryteringstester', 'tran', [['rekryteringstester', 'Rekryteringstester', '/verktyg/rekryteringstester'], ['personlighetstest', 'Personlighetstest', '/verktyg/personlighetstest']]],
  ['CV', 'cv', [['cv-analys', 'CV-analys', '/verktyg/cv-analys'], ['skapa-cv', 'Skapa CV', '/verktyg/skapa-cv'], ['cv-mallar', 'CV-mallar', '/cv-mallar'], ['linkedin', 'LinkedIn-profilen', '/verktyg/linkedin-optimering']]],
  ['Personliga brev', 'brev', [['personligt-brev', 'Personligt brev', '/verktyg/personligt-brev'], ['brev-exempelnav', 'Brevexempel, navet', '/personligt-brev-exempel'], ['brev-exempel', 'Brevexempel, ett yrke', '/personligt-brev-exempel/[yrke]'], ['brev-artikel', 'Artikel med mallvisaren', '/artiklar/...'], ['skapa-brev-start', 'Skriv brev, start', '/skapa-brev/start']]],
  ['Jobbsöket', 'jobb', [['sokta-tjanster', 'Sökta tjänster (ny sida)', '/verktyg/sokta-tjanster'], ['jobbmatchning', 'Jobbmatchning', '/verktyg/jobbmatchning'], ['jobbcoachen', 'Jobbcoachen', '/verktyg/jobbcoachen'], ['bli-upptackt', 'Bli upptäckt', '/verktyg/bli-upptackt']]],
]

const ren = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\s+/g, ' ').trim()

// Punkterna under den första rubriken som matchar mönstret, högst sex.
function punkter(md, monster) {
  const rader = md.split(/\r?\n/)
  const start = rader.findIndex((r) => /^#{2,3}\s/.test(r) && monster.test(r))
  if (start < 0) return []
  const ut = []
  for (let i = start + 1; i < rader.length; i++) {
    const r = rader[i]
    if (/^#{1,3}\s/.test(r)) break
    const m = r.match(/^\s{0,1}(?:[-*]|\d+\.)\s+(.*)/)
    if (m) ut.push(ren(m[1]))
    else if (/^\|/.test(r) && !/^\|\s*[-:]/.test(r) && ut.length < 6 && !/^\|\s*(I dag|Gammal|Före|Var)\b/i.test(r)) {
      const c = r.split('|').map((x) => x.trim()).filter(Boolean)
      if (c.length >= 2) ut.push(ren(`${c[0]} blir ${c[1]}`))
    }
  }
  return ut.filter((x) => x.length > 8).slice(0, 6).map((x) => (x.length > 260 ? x.slice(0, 257) + '…' : x))
}

fs.mkdirSync(path.join(mal, 'ut'), { recursive: true })
const filer = []
const data = GRUPPER.map(([namn, farg, sidor]) => ({ namn, farg, sidor: sidor.map(([id, n, adress]) => {
  const kalla = path.join(rot, 'ut', `skiss-${id}.html`)
  const not = path.join(rot, 'noter', `${id}.md`)
  const klar = fs.existsSync(kalla) && fs.existsSync(not)
  const s = { id, namn: n, adress, fil: klar ? `ut/skiss-${id}.html` : null, granskad: GRANSKADE.has(id), sedd: SEDDA.has(id) }
  if (klar) {
    fs.copyFileSync(kalla, path.join(mal, 'ut', `skiss-${id}.html`))
    filer.push(`ut/skiss-${id}.html`)
    const md = fs.readFileSync(not, 'utf8')
    s.andras = punkter(md, /ändras/i)
    s.beslut = punkter(md, /beslut/i)
  }
  return s
}) }))

// mallminiatyrerna som skisserna länkar till
const kopiera = (rel) => {
  const fran = path.join(rot, rel)
  if (!fs.existsSync(fran)) return
  for (const f of fs.readdirSync(fran, { withFileTypes: true })) {
    const r = rel + '/' + f.name
    if (f.isDirectory()) kopiera(r)
    else { fs.mkdirSync(path.join(mal, rel), { recursive: true }); fs.copyFileSync(path.join(rot, r), path.join(mal, r)); filer.push(r) }
  }
}
kopiera('underlag/mallar')
kopiera('underlag/artikelbild')

const mall = fs.readFileSync(path.join(rot, 'artefakt-mall.html'), 'utf8')
fs.writeFileSync(path.join(mal, 'publikt-omgang-3.html'), mall.replace('__DATA__', JSON.stringify(data)))
fs.writeFileSync(path.join(mal, 'filer.json'), JSON.stringify(filer))
const alla = data.flatMap((g) => g.sidor)
console.log(`ritade ${alla.filter((s) => s.fil).length} av ${alla.length}, granskade ${alla.filter((s) => s.fil && s.granskad).length}, filer ${filer.length}`)
console.log('saknas:', alla.filter((s) => !s.fil).map((s) => s.id).join(', ') || 'inget')
console.log('utan punkter:', alla.filter((s) => s.fil && (!s.andras.length)).map((s) => s.id).join(', ') || 'inga')
