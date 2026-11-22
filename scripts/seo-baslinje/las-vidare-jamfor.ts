/**
 * Läs vidare före och efter urvalsbytet 2026-11-22 (SEO:s uppföljning 7.1).
 * Räknar inlänkar från Läs vidare per artikel med det gamla urvalet (taggar,
 * sedan de nyaste) och det nya (src/lib/artiklar/lasVidare.ts), listar de
 * artiklar som tappar alla sina inlänkar, och skriver undantagsfilen med en
 * LANK_BORTA-rad per länk som försvinner ur en artikels Läs vidare.
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/seo-baslinje/las-vidare-jamfor.ts [--skriv]
 *
 * --skriv ger en rad per länk som lämnar Läs vidare (138 den 2026-11-22).
 * Grinden behöver bara de länkar som försvinner helt ur artikeln; den
 * incheckade filen är rensad till de 135 grinden visade.
 */
import fs from 'fs'
import { parseISO } from 'date-fns'
import { getAllPostsMeta, type PostMeta } from '../../src/lib/blog'
import { valjLasVidare } from '../../src/lib/artiklar/lasVidare'

const UT = 'scripts/seo-baslinje/las-vidare-kluster-2026-11-22-undantag.json'

/** Urvalet som det var till och med 2026-11-22 (artiklar/[slug]/page.tsx). */
function gammalt(alla: PostMeta[], slug: string, taggar: string[]): PostMeta[] {
  const andra = alla.filter((p) => p.slug !== slug)
  const tid = (p: PostMeta) => (p.date ? parseISO(p.date).getTime() : 0)
  let urval: PostMeta[] = []
  if (taggar.length > 0) {
    urval = andra
      .map((p) => ({ p, gemensamma: p.tags?.filter((t) => taggar.includes(t)).length || 0 }))
      .filter((x) => x.gemensamma > 0)
      .sort((a, b) => b.gemensamma - a.gemensamma || tid(b.p) - tid(a.p))
      .slice(0, 3)
      .map((x) => x.p)
  }
  if (urval.length < 3) {
    const senaste = andra.filter((p) => !urval.some((u) => u.slug === p.slug)).sort((a, b) => tid(b) - tid(a))
    urval = [...urval, ...senaste].slice(0, 3)
  }
  return urval
}

const alla = getAllPostsMeta()
const fore = new Map<string, string[]>()
const efter = new Map<string, string[]>()
for (const p of alla) {
  fore.set(p.slug, gammalt(alla, p.slug, p.tags || []).map((x) => x.slug))
  efter.set(p.slug, valjLasVidare(alla, p.slug, p.tags || []).map((x) => x.slug))
}
const inlankar = (m: Map<string, string[]>) => {
  const r = new Map<string, number>(alla.map((p) => [p.slug, 0]))
  for (const lista of m.values()) for (const s of lista) r.set(s, (r.get(s) ?? 0) + 1)
  return r
}
const inF = inlankar(fore)
const inE = inlankar(efter)
const skillnad = alla.map((p) => ({ slug: p.slug, fore: inF.get(p.slug)!, efter: inE.get(p.slug)!, d: inE.get(p.slug)! - inF.get(p.slug)! }))
const utanInlank = skillnad.filter((s) => s.fore > 0 && s.efter === 0)
const andradeSidor = alla.filter((p) => fore.get(p.slug)!.join() !== efter.get(p.slug)!.join())

const lankBorta: Array<{ path: string; lank: string; datum: string; skal: string }> = []
for (const p of alla) {
  const e = new Set(efter.get(p.slug))
  for (const s of fore.get(p.slug)!) {
    if (!e.has(s)) {
      lankBorta.push({
        path: `/artiklar/${p.slug}`,
        lank: `/artiklar/${s}`,
        datum: '2026-11-22',
        skal: 'Läs vidare fylls på ur samma kluster (getCtaVariantForTags) närmast i tid i stället för med de nyaste (SEO-slutgranskningen 2026-11-22, punkt 7.1).',
      })
    }
  }
}

console.log(`artiklar ${alla.length}, sidor med ändrad Läs vidare ${andradeSidor.length}, länkar ur Läs vidare ${lankBorta.length}`)
console.log(`hade inlänk före men ingen efter: ${utanInlank.length ? utanInlank.map((s) => s.slug).join(', ') : 'ingen'}`)
console.log(`utan inlänk före: ${skillnad.filter((s) => s.fore === 0).length}, utan inlänk efter: ${skillnad.filter((s) => s.efter === 0).length}`)
const sorterad = [...skillnad].sort((a, b) => a.d - b.d || a.slug.localeCompare(b.slug))
console.log('\nTappar mest:')
for (const s of sorterad.slice(0, 10)) console.log(`  ${s.slug}: ${s.fore} -> ${s.efter} (${s.d})`)
console.log('\nVinner mest:')
for (const s of sorterad.slice(-10).reverse()) console.log(`  ${s.slug}: ${s.fore} -> ${s.efter} (+${s.d})`)

if (process.argv.includes('--skriv')) {
  const fil = {
    _om:
      'Läs vidare fylls på ur samma kluster innan de nyaste tas (SEO-slutgranskningen 2026-11-22, punkt 7.1; src/lib/artiklar/lasVidare.ts). Raderna är exakt de länkar som lämnar en artikels Läs vidare, räknade med scripts/seo-baslinje/las-vidare-jamfor.ts mot artiklarna i content/artiklar 2026-11-22. Läses av scripts/seo-diff-artiklar.ts.',
    LANK_BORTA: lankBorta,
  }
  fs.writeFileSync(UT, JSON.stringify(fil, null, 2) + '\n')
  console.log(`\nskrev ${UT}`)
}
