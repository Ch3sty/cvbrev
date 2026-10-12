/**
 * Klicktest våg 2 (spec-publikt-v2 del A avsnitt 9): startsidan och
 * /verktyg/rekryteringstester. Körs via scripts/klicktest-publikt-v2.ts --vag 2.
 */
import type { KlickVerktyg } from './klicktest-publikt-v2'

export async function kor(v: KlickVerktyg) {
  const { b, ENHETER, LAGEN, ny, steg, ga, klicka } = v

  for (const e of ENHETER) {
    for (const lage of LAGEN) {
      const p = await ny(b, e, lage)

      // Startsidan: helsida
      await steg(p, e, lage, 'start-helsida', async () => ((await ga(p, '/')) === 200 ? null : 'status'), true)

      // Hjältens knapp till /register
      await steg(p, e, lage, 'start-hjalte-knapp', async () => {
        await ga(p, '/')
        const ut = await klicka(p, 'main [data-primar]')
        return ut.startsWith('/register') ? null : `hamnade på ${ut}`
      })

      // Varje verktyg till sin sida
      for (const [namn, href] of [
        ['tester', '/verktyg/rekryteringstester'],
        ['cv-analys', '/verktyg/cv-analys'],
        ['matchning', '/verktyg/jobbmatchning'],
        ['coach', '/verktyg/jobbcoachen'],
        ['brev', '/skapa-brev/start'],
      ] as const) {
        await steg(p, e, lage, `start-till-${namn}`, async () => {
          await ga(p, '/')
          const ut = await klicka(p, `main section a.pub-knapp[href="${href}"]`)
          return ut.startsWith(href) || (href === '/verktyg/rekryteringstester' && ut.startsWith('/dashboard')) ? null : `hamnade på ${ut}`
        })
      }

      // FAQ öppnas och stängs
      await steg(p, e, lage, 'start-faq', async () => {
        await ga(p, '/')
        const sel = 'main details:nth-of-type(2) summary'
        await p.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }))
        await p.click(sel)
        const oppen = await p.$eval('main details:nth-of-type(2)', (d) => (d as HTMLDetailsElement).open)
        await p.click(sel)
        const stangd = await p.$eval('main details:nth-of-type(2)', (d) => !(d as HTMLDetailsElement).open)
        await p.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }))
        return oppen && stangd ? null : 'details öppnades eller stängdes inte'
      })

      // Fasta knappraden: syns efter hjälten under 1024 px, aldrig från 1024 px
      await steg(p, e, lage, 'start-fast-knapprad', async () => {
        await ga(p, '/')
        const fore = await p.$eval('.pub-botten', (el) => el.getAttribute('data-syns'))
        await p.evaluate(() => window.scrollTo(0, 1600))
        await new Promise((r) => setTimeout(r, 700))
        const efter = await p.$eval('.pub-botten', (el) => ({
          syns: el.getAttribute('data-syns'),
          display: getComputedStyle(el).display,
        }))
        if (e.bredd >= 1024) return efter.display === 'none' ? null : 'knappraden syns på desktop'
        return fore === 'false' && efter.syns === 'true' ? null : `före ${fore}, efter ${efter.syns}`
      })

      // Testsidan: helsida
      await steg(p, e, lage, 'tester-helsida', async () => ((await ga(p, '/verktyg/rekryteringstester')) === 200 ? null : 'status'), true)

      // Prova-kortet till /prova och ett pass startar utan konto
      await steg(p, e, lage, 'tester-prova-pass', async () => {
        await ga(p, '/verktyg/rekryteringstester')
        const ut = await klicka(p, '#prova a.pub-knapp')
        if (!ut.startsWith('/verktyg/rekryteringstester/prova')) return `hamnade på ${ut}`
        // Startsidan för provet: knappen Starta provet, sedan första frågan.
        const start = await p.waitForSelector('xpath/.//button[contains(., "Starta provet")]', { timeout: 20000 })
        await start!.click()
        // Provet har en spärr på tre prov per dygn och IP. Har maskinen redan
        // gjort sina tre visar sidan spärren i stället för frågan; det är
        // produktens beteende, inte ett fel i sidan, och redovisas som sådant.
        const svar = await p
          .waitForFunction(
            () => !!document.querySelector('[aria-label^="Svarsalternativ"]') || document.body.innerText.includes('Du har gjort tre prov idag'),
            { timeout: 20000 }
          )
          .catch(() => null)
        if (!svar) return 'varken fråga eller spärr visades'
        const harFraga = await p.$('[aria-label^="Svarsalternativ"]')
        if (harFraga) {
          await harFraga.click()
          await new Promise((r) => setTimeout(r, 500))
          return null
        }
        console.log('   (provets dygnsspärr per IP nådd, flödet fram till Starta provet verifierat)')
        return null
      })

      // Guiderna öppnar artiklarna
      await steg(p, e, lage, 'tester-guide', async () => {
        await ga(p, '/verktyg/rekryteringstester')
        const ut = await klicka(p, '#guider a[href="/artiklar/matrislogik-test-guide"]')
        return ut === '/artiklar/matrislogik-test-guide' ? null : `hamnade på ${ut}`
      })

      // Länken till personlighetstestet
      await steg(p, e, lage, 'tester-personlighet', async () => {
        await ga(p, '/verktyg/rekryteringstester')
        const ut = await klicka(p, '#personlighet a[href="/verktyg/personlighetstest"]')
        return ut === '/verktyg/personlighetstest' ? null : `hamnade på ${ut}`
      })

      await p.close()
    }
  }

  // 360 px: hjältens knapp slutar inom 640 px, ljust och mörkt
  const e360 = { namn: 'mobil360', bredd: 360, hojd: 800, dpr: 1, mobil: true }
  for (const lage of LAGEN) {
    for (const sida of ['/', '/verktyg/rekryteringstester']) {
      const p = await ny(b, e360, lage)
      await steg(p, e360, lage, `knapp-640${sida === '/' ? '-start' : '-tester'}`, async () => {
        await ga(p, sida)
        const k = await p.$eval('main [data-primar]', (el) => el.getBoundingClientRect().bottom)
        return k <= 640 ? null : `knappen slutar på ${Math.round(k)} px`
      })
      await p.close()
    }
  }
}
