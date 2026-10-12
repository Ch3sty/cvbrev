/**
 * Klicktest del B våg B2 (spec-publikt-v2 del B avsnitt 6): artiklarna och
 * arkivet. Tre artiklar: testklustret med tabell, CV-klustret med
 * mallvisningen och karriär utan produkt. Per artikel: helsida, hjältens
 * knapp, provkortets knapp (och ett pass utan konto en gång),
 * innehållsförteckningen, FAQ, relaterade och Mest lästa, fasta knappraden.
 * Arkivet: filter, sida 2 och ett kort.
 * Körs via scripts/klicktest-publikt-v2.ts --del b --vag 2.
 */
import type { KlickVerktyg } from './klicktest-publikt-v2'
import { forbjudet, knappInom640, slaIhop, smaText } from './klicktest-publikt-v2-b1'

const ARTIKLAR = [
  { slug: 'matrislogik-test-guide', primar: '/verktyg/rekryteringstester/prova', prova: '/verktyg/rekryteringstester/prova' },
  { slug: 'cv-mall-gratis-guide', primar: '/verktyg/cv-mallar', prova: '/verktyg/cv-mallar' },
  { slug: 'karriarbyte-olika-aldrar', primar: null, prova: null },
] as const

export async function kor(v: KlickVerktyg) {
  const { b, ENHETER, LAGEN, ny, steg, ga, klicka } = v
  let passKort = false

  // Ägarbeslut 2026-10-12: Pixel 7 och 1280 i ljust läge, en mörk helsida per sidtyp.
  void LAGEN
  for (const e of ENHETER) {
    for (const lage of ['ljus'] as const) {
      const p = await ny(b, e, lage)
      for (const a of ARTIKLAR) {
        const url = `/artiklar/${a.slug}`
        await steg(
          p,
          e,
          lage,
          `${a.slug}-helsida`,
          async () => {
            const s = await ga(p, url)
            if (s !== 200) return `status ${s}`
            return slaIhop(await smaText(p), await forbjudet(p))
          },
          true
        )
        await steg(p, e, lage, `${a.slug}-hjalte`, async () => {
          await ga(p, url)
          if (!a.primar) {
            const n = await p.$$eval('main [data-primar]', (l) => l.length)
            return n ? 'karriär utan produkt har en knapp i hjälten' : null
          }
          const ut = await klicka(p, 'main [data-primar]')
          return ut.startsWith(a.primar) ? null : `hamnade på ${ut}`
        })
        if (a.prova) {
          await steg(p, e, lage, `${a.slug}-provkort`, async () => {
            await ga(p, url)
            const ut = await klicka(p, '.ib-prova a.pub-knapp')
            if (!ut.startsWith(a.prova!)) return `hamnade på ${ut}`
            if (a.slug !== 'matrislogik-test-guide' || passKort) return null
            passKort = true
            const start = await p.waitForSelector('xpath/.//button[contains(., "Starta provet")]', { timeout: 20000 })
            await start!.click()
            const svar = await p
              .waitForFunction(
                () =>
                  !!document.querySelector('[aria-label^="Svarsalternativ"]') ||
                  document.body.innerText.includes('Du har gjort tre prov idag'),
                { timeout: 20000 }
              )
              .catch(() => null)
            return svar ? null : 'provet startade inte'
          })
        } else {
          await steg(p, e, lage, `${a.slug}-utan-produkt`, async () => {
            await ga(p, url)
            // Karriär utan produkt har inget kort i texten (som i dag) och ingen knapp.
            const n = await p.$$eval('.ib-prova, .pub-yta-premium', (l) => l.length)
            return n ? 'karriär utan produkt har ett reklamkort' : null
          })
        }
        await steg(p, e, lage, `${a.slug}-innehall`, async () => {
          await ga(p, url)
          if (e.mobil) {
            await p.$eval('.ib-toc-m summary', (el) => el.scrollIntoView({ block: 'center' }))
            await p.click('.ib-toc-m summary')
            await new Promise((r) => setTimeout(r, 300))
            const href = await p.$eval('.ib-toc-m li:nth-child(3) a', (el) => el.getAttribute('href')!)
            await p.click('.ib-toc-m li:nth-child(3) a')
            await new Promise((r) => setTimeout(r, 1200))
            const topp = await p.$eval(decodeURIComponent(href), (el) => el.getBoundingClientRect().top)
            return Math.abs(topp) < 160 ? null : `${href} hamnade ${Math.round(topp)} px från toppen`
          }
          const href = await p.$eval('[data-toc] .ib-toc a:nth-child(3)', (el) => el.getAttribute('href')!)
          await p.click('[data-toc] .ib-toc a:nth-child(3)')
          await new Promise((r) => setTimeout(r, 1500))
          const topp = await p.$eval(decodeURIComponent(href), (el) => el.getBoundingClientRect().top)
          if (Math.abs(topp) > 160) return `${href} hamnade ${Math.round(topp)} px från toppen`
          const aktiv = await p.$eval('[data-toc] a.toc-aktiv', (el) => el.getAttribute('href'))
          return aktiv === href ? null : `aktiv rubrik ${aktiv}, väntade ${href}`
        })
        await steg(p, e, lage, `${a.slug}-faq`, async () => {
          await ga(p, url)
          const sel = '.faq-container details:nth-of-type(2) summary'
          await p.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }))
          await p.click(sel)
          await new Promise((r) => setTimeout(r, 300))
          return (await p.$eval('.faq-container details:nth-of-type(2)', (d) => (d as HTMLDetailsElement).open))
            ? null
            : 'FAQ öppnades inte'
        })
        await steg(p, e, lage, `${a.slug}-relaterade`, async () => {
          await ga(p, url)
          const mal = await p.$eval('#las-vidare .ib-rel a', (el) => el.getAttribute('href')!)
          const ut = await klicka(p, '#las-vidare .ib-rel a')
          if (ut !== mal) return `relaterad: ${ut}, väntade ${mal}`
          await ga(p, url)
          const mal2 = await p.$eval('#las-vidare .ib-lankkol div:nth-child(2) a', (el) => el.getAttribute('href')!)
          const ut2 = await klicka(p, '#las-vidare .ib-lankkol div:nth-child(2) a')
          return ut2 === mal2 ? null : `Mest lästa: ${ut2}, väntade ${mal2}`
        })
        if (e.mobil && a.primar) {
          await steg(p, e, lage, `${a.slug}-fast-knapprad`, async () => {
            await ga(p, url)
            for (let i = 0; i < 12; i++) {
              await p.evaluate(() => window.scrollBy(0, 500))
              await new Promise((r) => setTimeout(r, 120))
            }
            await new Promise((r) => setTimeout(r, 500))
            const syns = await p.$eval('[data-sticky-mobil]', (el) => getComputedStyle(el).transform === 'none' || getComputedStyle(el).transform === 'matrix(1, 0, 0, 1, 0, 0)').catch(() => false)
            return syns ? null : 'fasta knappraden syns inte efter scroll'
          })
        }
      }

      // Arkivet
      await steg(
        p,
        e,
        lage,
        'arkiv-helsida',
        async () => {
          const s = await ga(p, '/artiklar')
          return s === 200 ? slaIhop(await smaText(p), await forbjudet(p)) : `status ${s}`
        },
        true
      )
      await steg(p, e, lage, 'arkiv-filter', async () => {
        await ga(p, '/artiklar')
        const ut = await klicka(p, '.ib-filter a:nth-child(2)')
        if (!ut.startsWith('/artiklar?tag=')) return `hamnade på ${ut}`
        return (await p.$$eval('.ib-filter a.aktiv', (l) => l.length)) === 1 ? null : 'inget aktivt filter'
      })
      await steg(p, e, lage, 'arkiv-sida-2', async () => {
        await ga(p, '/artiklar')
        const ut = await klicka(p, '.ib-sidor a[aria-label="Sida 2"]')
        return ut === '/artiklar?page=2' ? null : `hamnade på ${ut}`
      })
      await steg(p, e, lage, 'arkiv-kort', async () => {
        await ga(p, '/artiklar')
        const mal = await p.$eval('.ib-akort h2 a', (el) => el.getAttribute('href')!)
        const ut = await klicka(p, '.ib-akort h2 a')
        return ut === mal ? null : `hamnade på ${ut}, väntade ${mal}`
      })
      await p.close()
    }
  }

  // En mörk helsida per sidtyp (artikel och arkiv), Pixel 7.
  const pm = await ny(b, ENHETER[0], 'mork')
  await steg(pm, ENHETER[0], 'mork', 'artikel-helsida', async () => ((await ga(pm, '/artiklar/matrislogik-test-guide')) === 200 ? smaText(pm) : 'status'), true)
  await steg(pm, ENHETER[0], 'mork', 'arkiv-helsida', async () => ((await ga(pm, '/artiklar')) === 200 ? null : 'status'), true)
  await pm.close()

  // 360 px: hjältens knapp inom 640 px på testartikeln och CV-artikeln.
  const e360 = { namn: 'mobil360', bredd: 360, hojd: 800, dpr: 1, mobil: true }
  for (const lage of ['ljus'] as const) {
    const p = await ny(b, e360, lage)
    for (const a of ARTIKLAR.filter((x) => x.primar)) {
      await steg(p, e360, lage, `${a.slug}-360`, async () => {
        await ga(p, `/artiklar/${a.slug}`)
        return knappInom640(p)
      })
    }
    await p.close()
  }
}
