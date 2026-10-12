/**
 * Klicktest del B våg B3 (spec-publikt-v2 del B avsnitt 6): exempelsidorna
 * och hubbarna. Ett CV- och ett brevexempel för samma yrke: "Använd som
 * mall" till skapa-flödet med rätt mall, "Byt mall" laddar väljaren, länken
 * mellan syskonsidorna, ett relaterat yrke och den fasta knappen på mobil.
 * Hubben: sök och ett kort. En mörk helsida per sidtyp och hjältens knapp
 * inom 640 px på 360.
 * Körs via scripts/klicktest-publikt-v2.ts --del b --vag 3.
 */
import type { Page } from 'puppeteer-core'
import type { KlickVerktyg } from './klicktest-publikt-v2'
import { forbjudet, knappInom640, slaIhop, smaText } from './klicktest-publikt-v2-b1'

const YRKE = 'elevassistent'
const SIDOR = [
  { typ: 'cv', url: `/cv-exempel/${YRKE}`, primar: `/cv-mallar/start?yrke=${YRKE}&mall=norrsken`, fast: `/cv-mallar/start?yrke=${YRKE}`, syskon: `/personligt-brev-exempel/${YRKE}` },
  { typ: 'brev', url: `/personligt-brev-exempel/${YRKE}`, primar: `/skapa-brev/start?yrke=${YRKE}`, fast: `/skapa-brev/start?yrke=${YRKE}`, syskon: `/cv-exempel/${YRKE}` },
] as const

/** Talstreck och pilar i synlig text utanför papperet (där står perioder som 2019 – 2021). */
async function streck(p: Page): Promise<string | null> {
  const t = await p.evaluate(() => {
    const main = (document.querySelector('main') ?? document.body).cloneNode(true) as HTMLElement
    main.querySelectorAll('.ib-papper, [aria-hidden="true"]').forEach((el) => el.remove())
    return main.textContent ?? ''
  })
  const m = t.match(/.{0,30}( – |→|—).{0,30}/)
  return m ? `talstreck eller pil: "${m[0]}"` : null
}

export async function kor(v: KlickVerktyg) {
  const { b, ENHETER, ny, steg, ga, klicka } = v

  for (const e of ENHETER) {
    const lage = 'ljus' as const
    const p = await ny(b, e, lage)
    for (const s of SIDOR) {
      await steg(
        p,
        e,
        lage,
        `${s.typ}-helsida`,
        async () => {
          const st = await ga(p, s.url)
          if (st !== 200) return `status ${st}`
          const ark = await p.$eval('.ib-papper', (el) => (el.textContent ?? '').length).catch(() => 0)
          return slaIhop(ark < 600 ? 'papperet saknas i HTML' : null, await smaText(p), await forbjudet(p), await streck(p))
        },
        true
      )
      await steg(p, e, lage, `${s.typ}-anvand-som-mall`, async () => {
        await ga(p, s.url)
        const ut = await klicka(p, 'main [data-primar]')
        if (ut !== s.primar) return `hamnade på ${ut}`
        if (s.typ === 'cv') {
          // Mallväljaren ska ha exemplets mall vald.
          const vald = await p
            .$eval('[aria-checked="true"], [aria-pressed="true"], input[type=radio]:checked', (el) => el.outerHTML.slice(0, 300))
            .catch(() => '')
          if (vald && !/norrsken/i.test(vald)) return `vald mall är inte Norrsken: ${vald.slice(0, 120)}`
        }
        return null
      })
      await steg(p, e, lage, `${s.typ}-byt-mall`, async () => {
        await ga(p, s.url)
        await p.$eval('[data-byt-mall]', (el) => el.scrollIntoView({ block: 'center' }))
        await p.click('[data-byt-mall]')
        const valjare = await p.waitForSelector('.ib-valjare', { timeout: 20000 }).catch(() => null)
        if (!valjare) return 'väljaren laddades inte'
        await p.waitForFunction(() => /Välj mall|mall/i.test(document.querySelector('.ib-valjare')?.textContent ?? '') && !document.querySelector('.ib-valjare')?.textContent?.includes('Laddar'), { timeout: 20000 })
        const dold = await p.$eval('#exempel-papper', (el) => (el as HTMLElement).hidden)
        return dold ? null : 'papperet syns fortfarande bredvid väljaren'
      })
      await steg(p, e, lage, `${s.typ}-syskon`, async () => {
        await ga(p, s.url)
        const ut = await klicka(p, '.ib-par-lank')
        return ut === s.syskon ? null : `hamnade på ${ut}, väntade ${s.syskon}`
      })
      await steg(p, e, lage, `${s.typ}-relaterat-yrke`, async () => {
        await ga(p, s.url)
        const mal = await p.$eval('.ib-yrke a', (el) => el.getAttribute('href')!)
        const ut = await klicka(p, '.ib-yrke a')
        if (ut !== mal) return `hamnade på ${ut}, väntade ${mal}`
        return (await p.$$eval('.ib-papper', (l) => l.length)) ? null : 'relaterade yrket saknar papperet'
      })
      await steg(p, e, lage, `${s.typ}-faq`, async () => {
        await ga(p, s.url)
        const sel = '.pub-faq details:nth-of-type(2) summary'
        await p.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }))
        await p.click(sel)
        await new Promise((r) => setTimeout(r, 300))
        return (await p.$eval('.pub-faq details:nth-of-type(2)', (d) => (d as HTMLDetailsElement).open)) ? null : 'FAQ öppnades inte'
      })
      if (e.mobil) {
        await steg(p, e, lage, `${s.typ}-fast-knapp`, async () => {
          await ga(p, s.url)
          for (let i = 0; i < 12; i++) {
            await p.evaluate(() => window.scrollBy(0, 500))
            await new Promise((r) => setTimeout(r, 120))
          }
          await new Promise((r) => setTimeout(r, 500))
          const href = await p.$eval('[data-sticky-mobil] a', (el) => el.getAttribute('href')).catch(() => null)
          return href === s.fast ? null : `fasta knappen går till ${href}, väntade ${s.fast}`
        })
      }
    }

    // Hubben
    await steg(
      p,
      e,
      lage,
      'hubb-helsida',
      async () => {
        const st = await ga(p, '/cv-exempel')
        if (st !== 200) return `status ${st}`
        const n = await p.$$eval('#yrken > li', (l) => l.length)
        return slaIhop(n === 89 ? null : `${n} kort, väntade 89`, await smaText(p), await forbjudet(p), await streck(p))
      },
      true
    )
    await steg(p, e, lage, 'hubb-sok', async () => {
      await ga(p, '/cv-exempel')
      await p.type('#hubb-sok', 'underskö')
      await p.click('.ib-hubb-sok button')
      await new Promise((r) => setTimeout(r, 500))
      const synliga = await p.$$eval('#yrken > li:not([hidden])', (l) => l.map((x) => x.querySelector('h3')?.textContent))
      if (!synliga.includes('Undersköterska')) return `sökningen visar ${synliga.join(', ')}`
      if (synliga.length > 5) return `${synliga.length} kort syns efter sökningen`
      if (!p.url().includes('q=undersk')) return 'sökningen står inte i adressen'
      const ut = await klicka(p, '#yrken > li:not([hidden]) a')
      return ut.startsWith('/cv-exempel/') ? null : `kortet gick till ${ut}`
    })
    await steg(p, e, lage, 'hubb-sok-utan-js-adress', async () => {
      await ga(p, '/personligt-brev-exempel?q=kock')
      const synliga = await p.$$eval('#yrken > li:not([hidden]) h3', (l) => l.map((x) => x.textContent))
      return synliga.includes('Kock') && synliga.length < 10 ? null : `?q=kock visar ${synliga.length} kort`
    })
    await steg(p, e, lage, 'hubb-filter', async () => {
      await ga(p, '/cv-exempel')
      const ut = await klicka(p, '.ib-filter a:nth-child(2)')
      return ut.startsWith('/cv-exempel/kategori/') ? null : `hamnade på ${ut}`
    })
    await p.close()
  }

  // En mörk helsida per sidtyp, Pixel 7.
  const pm = await ny(b, ENHETER[0], 'mork')
  await steg(pm, ENHETER[0], 'mork', 'cv-helsida', async () => ((await ga(pm, SIDOR[0].url)) === 200 ? smaText(pm) : 'status'), true)
  await steg(pm, ENHETER[0], 'mork', 'brev-helsida', async () => ((await ga(pm, SIDOR[1].url)) === 200 ? smaText(pm) : 'status'), true)
  await steg(pm, ENHETER[0], 'mork', 'hubb-helsida', async () => ((await ga(pm, '/personligt-brev-exempel')) === 200 ? smaText(pm) : 'status'), true)
  await pm.close()

  // 360 px: hjältens knapp inom 640 px.
  const e360 = { namn: 'mobil360', bredd: 360, hojd: 800, dpr: 1, mobil: true }
  const p = await ny(b, e360, 'ljus')
  for (const url of [SIDOR[0].url, SIDOR[1].url, '/cv-exempel/projektledare', '/cv-exempel', '/personligt-brev-exempel']) {
    await steg(p, e360, 'ljus', `360${url.replace(/\//g, '-')}`, async () => {
      await ga(p, url)
      return knappInom640(p)
    })
  }
  await p.close()
}
