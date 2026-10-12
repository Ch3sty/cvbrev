/**
 * Klicktest del B våg B4 (spec-publikt-v2 del B avsnitt 6): Räkna ut.
 * Lön efter skatt: ändra lön och kommun, kryssa kyrka och 66, öppna
 * jämförelsen; samma URL med parametrar utan JS ger samma resultat, och
 * formuläret räknar utan JS; Dela-länken. En rekryterarkalkylator. Hubben.
 * Pixel 7 och desktop i ljust läge, mörkt läge en gång per sidtyp, 360 för
 * hjältens knapp.
 *
 *   npx tsx scripts/klicktest-publikt-v2.ts --del b --vag 4 --port 8345
 */
import type { Page } from 'puppeteer-core'
import type { KlickVerktyg } from './klicktest-publikt-v2'
import { forbjudet, knappInom640, slaIhop, smaText } from './klicktest-publikt-v2-b1'

const LON = '/rakna-ut/lon-efter-skatt'

async function resultat(p: Page): Promise<string> {
  return p.$eval('#resultat .rk-tal', (el) => (el.firstChild?.textContent ?? '').replace(/\s/g, ' ').trim())
}

async function skriv(p: Page, sel: string, varde: string) {
  await p.$eval(sel, (el) => (el as HTMLElement).scrollIntoView({ block: 'center' }))
  await p.click(sel, { count: 3 })
  await p.keyboard.press('Backspace')
  await p.type(sel, varde)
  await new Promise((r) => setTimeout(r, 400))
}

export async function kor(v: KlickVerktyg) {
  const { b, ENHETER, ny, steg, ga, klicka, BAS } = v
  const ctx = b.defaultBrowserContext()
  await ctx.overridePermissions(BAS, ['clipboard-read', 'clipboard-write'])

  for (const e of ENHETER) {
    const p = await ny(b, e, 'ljus')

    await steg(p, e, 'ljus', 'lon-laddar', async () => {
      const s = await ga(p, LON)
      if (s !== 200) return `status ${s}`
      const t = await resultat(p)
      return slaIhop(t.includes('28 291') ? null : `standardresultatet är ${t}`, await forbjudet(p), await smaText(p))
    })

    await steg(p, e, 'ljus', 'lon-andra-lon-och-kommun', async () => {
      await skriv(p, '#lon', '42000')
      await p.select('#kommun', 'Dorotea')
      await new Promise((r) => setTimeout(r, 500))
      const t = await resultat(p)
      return t.includes('32 126') ? null : `42 000 kr i Dorotea gav ${t}, väntat 32 126 kr`
    })

    await steg(p, e, 'ljus', 'lon-kyrka-och-66', async () => {
      const fore = await resultat(p)
      await p.click('input[name="kyrka"]')
      await p.click('input[name="a66"]')
      await new Promise((r) => setTimeout(r, 600))
      const efter = await resultat(p)
      const url = p.url()
      return slaIhop(
        efter !== fore ? null : 'resultatet ändrades inte',
        url.includes('kyrka=1') && url.includes('a66=1') ? null : `adressen saknar kyrka och a66: ${url}`
      )
    })

    await steg(p, e, 'ljus', 'lon-jamfor', async () => {
      const kryss = await p.$$('.rk-avdelare input[type="checkbox"]')
      await kryss[0].click()
      await new Promise((r) => setTimeout(r, 500))
      const finns = await p.$('#lon2')
      const text = await p.$eval('#resultat', (el) => (el as HTMLElement).innerText)
      return slaIhop(finns ? null : 'fältet för ny lön saknas', text.includes('Skillnad per månad') ? null : 'jämförelsen syns inte i resultatet')
    })

    await steg(p, e, 'ljus', 'lon-dela', async () => {
      // På mobil öppnar Dela delningsmenyn (navigator.share); den fångas här.
      await p.evaluate(() => {
        const w = window as unknown as { __delat?: string }
        w.__delat = ''
        if ('share' in navigator) navigator.share = async (d?: ShareData) => void (w.__delat = d?.url ?? d?.text ?? '')
      })
      await p.bringToFront()
      await p.$eval('[data-cta="rakna-dela"]', (el) => (el as HTMLElement).scrollIntoView({ block: 'center' }))
      await p.click('[data-cta="rakna-dela"]')
      await new Promise((r) => setTimeout(r, 800))
      const knapp = await p.$eval('[data-cta="rakna-dela"]', (el) => el.textContent ?? '')
      const falt = await p.$eval('#resultat', (el) => (el.querySelector('input[readonly]') as HTMLInputElement | null)?.value ?? '')
      let lank = falt || (await p.evaluate(() => (window as unknown as { __delat?: string }).__delat ?? ''))
      if (!lank) lank = await p.evaluate(() => navigator.clipboard.readText().catch(() => '')).catch(() => '')
      if (!knapp.includes('kopierad') && !falt && !lank) return `delningen gav ingen länk (${knapp})`
      return lank && !lank.includes('lon=42000') ? `delningslänken saknar lönen: ${lank}` : null
    })

    // Hubben: hjältens knapp och ett kort.
    await steg(p, e, 'ljus', 'hubb-laddar', async () => {
      const s = await ga(p, '/rakna-ut')
      if (s !== 200) return `status ${s}`
      return slaIhop(await forbjudet(p), await smaText(p))
    })
    await steg(p, e, 'ljus', 'hubb-knapp-till-lon', async () => {
      const dit = await klicka(p, 'main a.pub-knapp[href="/rakna-ut/lon-efter-skatt"]')
      return dit === LON ? null : `hamnade på ${dit}`
    })
    await steg(p, e, 'ljus', 'hubb-kort-semester', async () => {
      await ga(p, '/rakna-ut')
      const dit = await klicka(p, 'main .rk-kort a[href="/rakna-ut/semesterersattning"]')
      return dit === '/rakna-ut/semesterersattning' ? null : `hamnade på ${dit}`
    })

    // En rekryterarkalkylator: byt kanal i sourcingtratten.
    await steg(p, e, 'ljus', 'sourcing-byt-kanal', async () => {
      const s = await ga(p, '/rakna-ut/sourcing')
      if (s !== 200) return `status ${s}`
      const fore = await resultat(p)
      const kort = await p.$$('[role="radiogroup"] button, [role="radiogroup"] [role="radio"]')
      if (kort.length < 3) return `hittade ${kort.length} kanaler`
      await kort[2].click()
      await new Promise((r) => setTimeout(r, 500))
      const efter = await resultat(p)
      return slaIhop(efter !== fore ? null : `resultatet stod kvar på ${fore}`, await forbjudet(p), await smaText(p))
    })
    await p.close()
  }

  // Utan JavaScript: samma URL med parametrar ger samma resultat, och formuläret räknar.
  const e = ENHETER[0]
  const p = await ny(b, e, 'ljus')
  await p.setJavaScriptEnabled(false)
  await steg(p, e, 'ljus', 'utan-js-url', async () => {
    const s = await ga(p, `${LON}?lon=42000&kommun=Dorotea`)
    if (s !== 200) return `status ${s}`
    const t = await resultat(p)
    return t.includes('32 126') ? null : `utan JS gav ${t}`
  })
  await steg(p, e, 'ljus', 'utan-js-formular', async () => {
    await ga(p, LON)
    await p.$eval('#lon', (el) => ((el as HTMLInputElement).value = '42000'))
    await p.$eval('#kommun', (el) => ((el as HTMLSelectElement).value = 'Dorotea'))
    await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), p.click('button[type="submit"][data-primar]')])
    const t = await resultat(p)
    const u = new URL(p.url())
    return t.includes('32 126') ? null : `formuläret utan JS gav ${t} på ${u.pathname + u.search}`
  })
  await p.close()

  // 360: hjältens knapp inom 640 px.
  const e360 = { namn: 'mobil360', bredd: 360, hojd: 800, dpr: 1, mobil: true }
  const p360 = await ny(b, e360, 'ljus')
  for (const sida of [LON, '/rakna-ut']) {
    await steg(p360, e360, 'ljus', `knapp-360${sida.replace(/\//g, '-')}`, async () => {
      await ga(p360, sida)
      return knappInom640(p360)
    })
  }
  // Träffsäkerheten: fyra metodkort står före knappen, men kalkylatorns första fält ska synas inom 640 px.
  await steg(p360, e360, 'ljus', 'forsta-faltet-360-traffsakerhet', async () => {
    await ga(p360, '/rakna-ut/traffsakerhet')
    const y = await p360.$eval('#kalkylator [role="radio"]', (el) => el.getBoundingClientRect().bottom)
    return y <= 640 ? null : `första fältet slutar på ${Math.round(y)} px`
  })
  await p360.close()

  // Mörkt läge, en gång per sidtyp, hela sidan.
  for (const enhet of ENHETER) {
    const pm = await ny(b, enhet, 'mork')
    for (const sida of [LON, '/rakna-ut']) {
      await steg(
        pm,
        enhet,
        'mork',
        `mork${sida.replace(/\//g, '-')}`,
        async () => {
          const s = await ga(pm, sida)
          return s === 200 ? await smaText(pm) : `status ${s}`
        },
        true
      )
    }
    await pm.close()
  }
}
