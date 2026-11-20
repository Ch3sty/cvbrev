/**
 * Provrutornas server-HTML, omgång 2 steg C (testernas nya utseende på de
 * publika ytorna). Kompletterar scripts/seo-diff-artiklar.ts, som läser
 * rubriker, länkar, schema och ord men inte om provet finns i HTML:en.
 *
 * Per artikel med <ArtikelProv>: att rutan finns en gång i server-HTML:en,
 * att uppgift 1 går att svara på utan JavaScript-laddning (minst två
 * svarsknappar som inte är disabled), rutans data-cta-attribut, att rutan
 * inte har några rubriker (h1 till h4) och att ingen facitnyckel står i
 * sidan. Personlighetssidorna: att panelen med reglaget (fem radioknappar)
 * finns i server-HTML:en.
 *
 *   npx tsx scripts/qa-omgang2-publikt-prov.ts ta --bas https://www.jobbcoach.ai --ut docs/qa/seo-diff/omgang2-publikt-prov-fore.json
 *   npx tsx scripts/qa-omgang2-publikt-prov.ts ta --bas http://localhost:8300 --ut docs/qa/seo-diff/omgang2-publikt-prov-efter.json
 *   npx tsx scripts/qa-omgang2-publikt-prov.ts jamfor --fore <fore.json> --efter <efter.json>
 *
 * Grinden: exit 1 om något av kraven ovan inte håller i efter-avtrycket
 * eller om rutans attribut skiljer sig från före. Texten i rutan får ändras.
 *
 * Git Bash: kör med MSYS_NO_PATHCONV=1 om sidor anges med --sidor, annars
 * blir /artiklar/... en Windows-sökväg.
 */
import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

interface ProvAvtryck {
  path: string
  status: number
  /** Antal aside[data-artikel-prov] i sidan. */
  rutor: number
  attr: Record<string, string | null> | null
  /** Svarsknappar i rutan som inte är disabled. */
  svarsknappar: number
  /** h1 till h4 inne i rutan. */
  rubrikerIRutan: number
  /** Personlighetsprovets reglage: role=radio i sidan. */
  radio: number
  /** Facitnycklar i sidans HTML. */
  facit: string[]
  text: string
}

const ATTR = ['data-artikel-prov', 'data-cta-position', 'data-cta-cluster', 'data-cta-variant', 'data-cta-slug', 'aria-label']
const FACIT = /correctAnswer|correctAnswerId|"rattVisat"|"ratt":|"facit"/g

function artiklarMedProv(): string[] {
  const dir = 'content/artiklar'
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') && fs.readFileSync(path.join(dir, f), 'utf8').includes('<ArtikelProv'))
    .map((f) => `/artiklar/${f.replace(/\.mdx$/, '')}`)
    .sort()
}

const PERSONLIGHET = ['/artiklar/map-test-personlighetstest', '/artiklar/personlighetstest-jobb-guide', '/verktyg/personlighetstest']

function arg(namn: string): string | undefined {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function ta(bas: string, sida: string): Promise<ProvAvtryck> {
  const svar = await fetch(bas + sida, { redirect: 'manual' })
  const html = await svar.text()
  const doc = new JSDOM(html).window.document
  const rutor = doc.querySelectorAll('aside[data-artikel-prov]')
  const ruta = rutor[0] ?? null
  return {
    path: sida,
    status: svar.status,
    rutor: rutor.length,
    attr: ruta ? Object.fromEntries(ATTR.map((a) => [a, ruta.getAttribute(a)])) : null,
    svarsknappar: ruta ? ruta.querySelectorAll('button:not([disabled]), [role="radio"]:not([aria-disabled="true"])').length : 0,
    rubrikerIRutan: ruta ? ruta.querySelectorAll('h1, h2, h3, h4').length : 0,
    radio: doc.querySelectorAll('[role="radio"]').length,
    facit: [...new Set(html.match(FACIT) ?? [])],
    text: (ruta?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 240),
  }
}

function jamfor(fore: ProvAvtryck[], efter: ProvAvtryck[]): { rapport: string[]; fel: number } {
  const rapport: string[] = []
  let fel = 0
  const f = (s: string) => {
    fel++
    rapport.push(`FEL ${s}`)
  }
  for (const a of fore) {
    const b = efter.find((x) => x.path === a.path)
    if (!b) {
      f(`${a.path}: saknas i efter`)
      continue
    }
    if (b.status !== a.status) f(`${a.path}: status ${a.status} -> ${b.status}`)
    if (b.facit.length) f(`${a.path}: facitnyckel i HTML: ${b.facit.join(', ')}`)
    if (a.rutor > 0) {
      if (b.rutor !== a.rutor) f(`${a.path}: provrutor ${a.rutor} -> ${b.rutor}`)
      if (JSON.stringify(a.attr) !== JSON.stringify(b.attr)) f(`${a.path}: rutans attribut ${JSON.stringify(a.attr)} -> ${JSON.stringify(b.attr)}`)
      if (b.svarsknappar < 2) f(`${a.path}: uppgift 1 har ${b.svarsknappar} svarsknappar i server-HTML:en (före ${a.svarsknappar})`)
      if (b.rubrikerIRutan > 0) f(`${a.path}: ${b.rubrikerIRutan} rubriker inne i provrutan`)
      if (a.text !== b.text) rapport.push(`ok: ${a.path}: rutans text ändrad (tillåtet)`)
    }
    if (PERSONLIGHET.includes(a.path) && a.radio >= 5 && b.radio < 5) f(`${a.path}: reglaget saknas i server-HTML:en (${a.radio} -> ${b.radio} radio)`)
    if (!rapport.some((r) => r.includes(a.path))) rapport.push(`ok: ${a.path}`)
  }
  return { rapport, fel }
}

async function main() {
  const lage = process.argv[2]
  if (lage === 'ta') {
    const bas = arg('bas') ?? 'http://localhost:8300'
    const ut = arg('ut') ?? 'docs/qa/seo-diff/omgang2-publikt-prov.json'
    const lista = arg('sidor')?.split(',') ?? [...artiklarMedProv(), ...PERSONLIGHET]
    const avtryck: ProvAvtryck[] = []
    for (const s of lista) {
      const a = await ta(bas, s)
      avtryck.push(a)
      console.log(`${String(a.status).padEnd(4)} ${s.padEnd(48)} rutor ${a.rutor}  svar ${String(a.svarsknappar).padStart(2)}  rubriker ${a.rubrikerIRutan}  radio ${a.radio}  facit ${a.facit.length}`)
    }
    fs.mkdirSync(path.dirname(ut), { recursive: true })
    fs.writeFileSync(ut, JSON.stringify(avtryck, null, 2))
    console.log(`\nSparat: ${ut} (${avtryck.length} sidor)`)
    return
  }
  if (lage === 'jamfor') {
    const fore = JSON.parse(fs.readFileSync(arg('fore')!, 'utf8')) as ProvAvtryck[]
    const efter = JSON.parse(fs.readFileSync(arg('efter')!, 'utf8')) as ProvAvtryck[]
    const { rapport, fel } = jamfor(fore, efter)
    console.log(`# Provrutorna\n\nSidor: ${fore.length}  \nFel: ${fel}\n\n${rapport.map((r) => `- ${r}`).join('\n')}`)
    process.exit(fel ? 1 : 0)
  }
  console.log('Användning: ta --bas URL --ut fil.json | jamfor --fore a.json --efter b.json')
  process.exit(2)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
