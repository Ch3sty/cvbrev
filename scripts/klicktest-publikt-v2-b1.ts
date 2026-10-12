/**
 * Klicktest del B våg B1 (spec-publikt-v2 del B avsnitt 6): förhandsvisningen
 * av innehållskomponenterna på Pixel 7, 360 och desktop, ljust och mörkt,
 * plus termrättelserna på verktygssidorna (SEO-granskningen av del A).
 * Körs via scripts/klicktest-publikt-v2.ts --del b --vag 1.
 *
 * Exporterar de gemensamma kontrollerna för del B: hjältens knapp inom
 * 640 px på 360, ingen text under 12 px utanför telefoner och ark, inga
 * förbjudna ord eller tecken i synlig text.
 */
import type { Page } from 'puppeteer-core'
import type { KlickVerktyg } from './klicktest-publikt-v2'

/** Interna designord och husregler som aldrig får synas (ägarens krav). */
const FORBJUDET = [/\bstation(er|en)?\b/i, /\bLäsrummet\b/, /\bbläck\b/i, /generalrepetition/i, /\bmätning(en)?\b/i, /\bfamiljer\b/i, /—/, / · /]

/** Text under 12 px utanför telefoner, ark och skärmläsartext. */
export async function smaText(p: Page): Promise<string | null> {
  const fynd = await p.evaluate(() => {
    const ut: string[] = []
    const main = document.querySelector('main') ?? document.body
    const w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    let n: Node | null
    while ((n = w.nextNode())) {
      const t = (n.textContent ?? '').trim()
      if (!t) continue
      const el = n.parentElement
      if (!el) continue
      if (el.closest('.pub-tel, .pub-telefon, .ib-papper, .ib-ark, [aria-hidden="true"], .sr-only, script, style, noscript, svg')) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (parseFloat(cs.fontSize) < 12) ut.push(`${cs.fontSize} "${t.slice(0, 40)}"`)
    }
    return ut.slice(0, 3)
  })
  return fynd.length ? `text under 12 px: ${fynd.join(', ')}` : null
}

/** Förbjudna ord och tecken i synlig text i main. */
export async function forbjudet(p: Page): Promise<string | null> {
  const text = await p.evaluate(() => (document.querySelector('main') ?? document.body).innerText)
  const traffar = FORBJUDET.filter((re) => re.test(text)).map((re) => {
    const m = text.match(re)
    const i = m?.index ?? 0
    return `${re} i "${text.slice(Math.max(0, i - 30), i + 30).replace(/\s+/g, ' ')}"`
  })
  return traffar.length ? `förbjudet: ${traffar.join(' | ')}` : null
}

/** Hjältens knapp ([data-primar]) slutar inom 640 px. */
export async function knappInom640(p: Page): Promise<string | null> {
  const k = await p.$eval('main [data-primar]', (el) => el.getBoundingClientRect().bottom).catch(() => null)
  if (k === null) return 'ingen [data-primar]'
  return k <= 640 ? null : `knappen slutar på ${Math.round(k)} px`
}

export function slaIhop(...delar: (string | null)[]): string | null {
  const f = delar.filter(Boolean)
  return f.length ? f.join('; ') : null
}

export async function kor(v: KlickVerktyg) {
  const { b, ENHETER, LAGEN, ny, steg, ga } = v
  const e360 = { namn: 'mobil360', bredd: 360, hojd: 800, dpr: 1, mobil: true }
  for (const e of [...ENHETER, e360]) {
    for (const lage of LAGEN) {
      const p = await ny(b, e, lage)
      await steg(
        p,
        e,
        lage,
        'forhandsvisning-innehall',
        async () => {
          const s = await ga(p, '/forhandsvisning-publikt/innehall')
          if (s !== 200) return `status ${s}`
          return slaIhop(e.bredd === 360 ? await knappInom640(p) : null, await smaText(p))
        },
        true
      )
      await p.close()
    }
  }

  // Termrättelserna på verktygssidorna (SEO-granskningen av del A).
  const e = ENHETER[1]
  const p = await ny(b, e, 'ljus')
  await steg(p, e, 'ljus', 'jobbcoachen-termer', async () => {
    await ga(p, '/verktyg/jobbcoachen')
    const t = await p.evaluate(() => document.documentElement.outerHTML)
    return t.includes('Karriärguiden') ? 'Karriärguiden finns kvar' : null
  })
  await steg(p, e, 'ljus', 'funktioner-valj-mall', async () => {
    await ga(p, '/funktioner')
    const n = await p.$$eval('main a[href="/dashboard/cv-mallar"]', (l) => l.length)
    return n ? 'länken till /dashboard/cv-mallar finns kvar' : null
  })
  await steg(p, e, 'ljus', 'jobbmatchning-ai', async () => {
    await ga(p, '/verktyg/jobbmatchning')
    const t = await p.evaluate(() => document.body.innerText)
    if (t.includes('matchnings-procent')) return 'matchnings-procent finns kvar'
    return t.includes('sedan gör AI jobbet') ? null : 'meningen om AI saknas'
  })
  await p.close()
}
