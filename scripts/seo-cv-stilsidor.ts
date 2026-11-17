/**
 * Grinden för stilsidorna i SEO-svepet 2026-11-17 (docs/plan-seo-cv-kluster-2026-11-17.md,
 * avsnitt 4.3 och 4.4): minst 450 ord unik brödtext, minst fyra egna frågor,
 * minst tre inkommande innehållslänkar och tre utgående, galleri bara med
 * mallar som har egenskapen, och inga interna länkar kvar till 308-adresserna.
 *
 *   npx tsx scripts/seo-cv-stilsidor.ts --bas http://localhost:8300 [--sidor fil.txt]
 *
 * Unik text: block (p, li, h1 till h4, summary) i main utom ramen, arbetsytan
 * (#valj-mall) och det som är aria-hidden. Ett block som står ordagrant på
 * /cv-mallar eller på en annan stilsida räknas inte. Orden räknas som i
 * SEO-diffen (ord med minst en bokstav eller siffra).
 * Inkommande länkar räknas från sidorna i --sidor (en adress per rad eller
 * kommaseparerat) plus /cv-mallar och stilsidorna, bara i innehållet.
 */
import fs from 'node:fs'
import { JSDOM } from 'jsdom'
import { MALL_KATALOG } from '../src/lib/cv/mallar/katalog'

const STIL = ['/cv-mallar/word', '/cv-mallar/foto', '/cv-mallar/enkla'] as const
const KRAV = { ord: 450, faq: 4, in: 3, ut: 3 }
const TRESTO_OTTA = [
  '/artiklar/cv-mall-gratis-guide',
  '/artiklar/cv-mall-word-gratis',
  '/artiklar/cv-mall-pdf-gratis',
  '/cv-mall-gratis-guide',
  '/cv-mall-word-gratis',
  '/cv-mallar/saljare',
  '/cv-mallar/butikssaljare',
  '/cv-mallar/barnskotare',
  '/cv-mallar/ingenjor',
  '/cv-mallar/larare',
]

function arg(namn: string): string | undefined {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const bas = arg('bas') ?? 'http://localhost:8300'
const extra = (() => {
  const f = arg('sidor')
  if (!f) return [] as string[]
  const t = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : f
  return t.split(/[\s,]+/).filter((s) => s.startsWith('/'))
})()

const ord = (t: string) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
const norm = (t: string) => t.replace(/\s+/g, ' ').trim()

function iRam(el: Element): boolean {
  return Boolean(el.closest('[data-site-chrome]'))
}

interface Sida {
  path: string
  status: number
  block: string[]
  faq: string[]
  lankar: string[]
  galleri: string[]
}

async function hamta(path: string): Promise<Sida> {
  const svar = await fetch(bas + path, { redirect: 'manual' })
  const html = await svar.text()
  const doc = new JSDOM(html).window.document
  const main = (doc.querySelector('main') ?? doc.body).cloneNode(true) as Element
  main.querySelectorAll('script, style, noscript, template, [aria-hidden="true"], #valj-mall').forEach((e) => e.remove())
  const block: string[] = []
  main.querySelectorAll('p, li, h1, h2, h3, h4, summary').forEach((e) => {
    if (iRam(e)) return
    // Ett block i ett annat block räknas en gång (li med p inuti).
    if (e.parentElement?.closest('p, li, summary')) return
    const t = norm(e.textContent ?? '')
    if (t) block.push(t)
  })
  const faq = Array.from(main.querySelectorAll('summary'))
    .filter((e) => !iRam(e))
    .map((e) => norm(e.textContent ?? ''))
  const lankar = Array.from(doc.querySelectorAll('main a[href]'))
    .filter((a) => !iRam(a))
    .map((a) => (a.getAttribute('href') ?? '').replace(/^https:\/\/www\.jobbcoach\.ai/, ''))
    .filter((h) => h.startsWith('/'))
  const galleri = Array.from(doc.querySelectorAll('#mallarna a[href^="/cv-mallar/prova?mall="]'))
    .map((a) => new URL('http://x' + a.getAttribute('href')).searchParams.get('mall') ?? '')
  return { path, status: svar.status, block, faq, lankar, galleri: [...new Set(galleri)] }
}

async function main() {
  const lista = [...new Set(['/cv-mallar', ...STIL, ...extra])]
  const sidor = new Map<string, Sida>()
  for (const p of lista) sidor.set(p, await hamta(p))
  let fel = 0
  const rad = (ok: boolean, text: string) => {
    if (!ok) fel++
    console.log(`${ok ? 'ok ' : 'FEL'} ${text}`)
  }
  const hubb = sidor.get('/cv-mallar')!
  for (const s of STIL) {
    const sida = sidor.get(s)!
    console.log(`\n## ${s} (status ${sida.status})`)
    const andra = new Set([...hubb.block, ...STIL.filter((x) => x !== s).flatMap((x) => sidor.get(x)!.block)])
    const unika = sida.block.filter((b) => !andra.has(b))
    const unikaOrd = unika.reduce((n, b) => n + ord(b), 0)
    rad(unikaOrd >= KRAV.ord, `unik brödtext ${unikaOrd} ord (krav ${KRAV.ord}; ${unika.length} av ${sida.block.length} block)`)
    const andraFaq = new Set([...hubb.faq, ...STIL.filter((x) => x !== s).flatMap((x) => sidor.get(x)!.faq)])
    const egnaFaq = sida.faq.filter((q) => !andraFaq.has(q))
    rad(egnaFaq.length >= KRAV.faq, `egna frågor ${egnaFaq.length} av ${sida.faq.length} (krav ${KRAV.faq})`)
    const ut = [...new Set(sida.lankar.map((h) => h.split('#')[0].split('?')[0]))].filter(
      (h) => h !== s && (h.startsWith('/artiklar/') || h === '/cv-mallar' || (STIL as readonly string[]).includes(h)),
    )
    rad(ut.length >= KRAV.ut, `utgående innehållslänkar ${ut.length} (krav ${KRAV.ut}): ${ut.join(', ')}`)
    const in_ = [...sidor.values()].filter((x) => x.path !== s && x.lankar.some((h) => h.split('#')[0].split('?')[0] === s)).map((x) => x.path)
    rad(in_.length >= KRAV.in, `inkommande innehållslänkar ${in_.length} (krav ${KRAV.in}): ${in_.join(', ')}`)
    const stil = s.split('/').pop() as 'word' | 'foto' | 'enkla'
    const har = (id: string) => {
      const m = MALL_KATALOG.find((k) => k.id === id)
      return stil === 'word' ? m?.word : stil === 'foto' ? m?.foto : m?.familj === 'en-spalt'
    }
    const fel_ = sida.galleri.filter((id) => !har(id))
    const forvantat = MALL_KATALOG.filter((m) => har(m.id)).length
    rad(fel_.length === 0 && sida.galleri.length === forvantat, `galleriet ${sida.galleri.length} mallar, alla med egenskapen (väntat ${forvantat})`)
  }
  console.log('\n## Länkar till 308-adresserna')
  for (const x of sidor.values()) {
    const traffar = x.lankar.filter((h) => TRESTO_OTTA.includes(h.split('#')[0].split('?')[0]))
    if (traffar.length) rad(false, `${x.path} länkar till ${traffar.join(', ')}`)
  }
  console.log(`\nSidor lästa: ${sidor.size}. Fel: ${fel}`)
  process.exit(fel ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
