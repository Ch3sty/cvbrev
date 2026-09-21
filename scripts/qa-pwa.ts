/**
 * Klicktest av frågan om hemskärmen (docs/plan-pwa.md, avsnitt 7).
 *
 *   npx tsx scripts/qa-pwa.ts                 # mot localhost:5200
 *   npx tsx scripts/qa-pwa.ts --port 5300
 *
 * Kräver en byggd produktionsserver, precis som scripts/perf-inloggat.ts:
 *
 *   NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next build
 *   NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next start -p 5200
 *
 * Chrome skickar aldrig beforeinstallprompt till en sida på localhost utan
 * installerbarhetskriterierna uppfyllda, och den går inte att tvinga fram
 * via CDP. Vi skickar därför in ett eget event med samma form: prompt() och
 * userChoice, precis som webbläsarens. Det testar exakt det vår kod gör med
 * eventet. Det testar däremot INTE att Chrome verkligen erbjuder
 * installation, och det måste ägaren se på en riktig telefon.
 *
 * Emuleringen är Pixel 7, samma som perf-inloggat: 412x915, 3x CPU-strypning
 * och LTE.
 */

import { laddaEnv } from './_env'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

laddaEnv()

const CHROME_KANDIDATER = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]

const BILDKATALOG = path.join(process.cwd(), 'docs', 'qa', 'pwa')

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}

interface Fall {
  namn: string
  vantat: string
  utfall: string
  ok: boolean
}

const resultat: Fall[] = []

function kontrollera(namn: string, vantat: string, utfall: string) {
  const ok = vantat === utfall
  resultat.push({ namn, vantat, utfall, ok })
  console.log(`${ok ? 'OK  ' : 'FEL '} ${namn.padEnd(58)} ${utfall}`)
}

/**
 * Skriptet som planteras före varje sidladdning.
 *
 * Det gör två saker: skickar in ett syntetiskt beforeinstallprompt så att
 * vår store har något att öppna, och lägger requestInstallPrompt på window
 * så att testet kan trigga raden utan att gå igenom ett helt brevflöde.
 * Det senare går bara i testet; i appen anropas den från de fyra ställena.
 */
const PLANTERING = `
(() => {
  window.__pwaUtfall = null;

  // Samma form som Chromes event: prompt() öppnar systemdialogen, userChoice
  // svarar när användaren valt. Vi låter utfallet styras av testet.
  class SyntetisktInstallEvent extends Event {
    constructor() {
      super('beforeinstallprompt', { cancelable: true });
      this.platforms = ['web'];
      this.userChoice = new Promise((resolve) => {
        this.__svara = resolve;
      });
    }
    prompt() {
      window.__pwaDialogVisad = true;
      this.__svara({
        outcome: window.__pwaNastaSvar || 'accepted',
        platform: 'web',
      });
      return Promise.resolve();
    }
  }

  window.__pwaDialogVisad = false;
  window.__skickaInstallEvent = () => {
    window.dispatchEvent(new SyntetisktInstallEvent());
  };
})();
`

async function sidtext(page: Page): Promise<string> {
  return page.evaluate(() => document.body.innerText)
}

/**
 * Väntar tills PwaRegister har monterat och lagt sin krok på window.
 * Komponenten laddas lazy och registrerar på idle, så en fast väntetid
 * blir antingen för kort på en strypt CPU eller onödigt lång.
 */
async function vantaPaKrok(page: Page): Promise<void> {
  await page.waitForFunction(
    () => typeof (window as unknown as { __pwaTrigga?: unknown }).__pwaTrigga === 'function',
    { timeout: 30000 }
  )
}

/** Kör en trigger och vänta in resultatet. */
async function trigga(page: Page, trigger: string): Promise<boolean> {
  await vantaPaKrok(page)
  const svar = await page.evaluate(
    (t: string) =>
      (window as unknown as { __pwaTrigga: (x: string) => boolean }).__pwaTrigga(t),
    trigger
  )
  await new Promise((r) => setTimeout(r, 600))
  return svar
}

/** Klickar en knapp inuti installationsraden, inte någon annanstans i skalet. */
async function klickaIRaden(page: Page, vad: 'stang' | 'laggTill'): Promise<boolean> {
  return page.evaluate((v: string) => {
    const texter = Array.from(document.querySelectorAll('p'))
    const rad = texter.find((n) => n.textContent?.includes('Lägg Jobbcoach på hemskärmen'))
    const behallare = rad?.parentElement
    if (!behallare) return false
    const knappar = Array.from(behallare.querySelectorAll('button'))
    const knapp =
      v === 'stang'
        ? knappar.find((b) => b.getAttribute('aria-label') === 'Stäng')
        : knappar.find((b) => b.textContent?.trim() === 'Lägg till')
    if (!knapp) return false
    knapp.click()
    return true
  }, vad)
}

/**
 * Lämnar cookie-samtycket, om bannern står uppe.
 *
 * Bannern ligger på z-index 999 över hela nederkanten och är därför både ett
 * hinder för raden (regeln 'cookiebanner') och något som skymmer den i en
 * skärmdump. Den som fått frågan om hemskärmen har i praktiken redan svarat
 * på cookiefrågan, så det här är det realistiska läget.
 */
async function svaraPaCookies(page: Page): Promise<boolean> {
  const fanns = await page.evaluate(() => {
    const banner = document.querySelector('.cookie-banner-container')
    if (!banner) return false
    const knapp = Array.from(banner.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Acceptera'
    )
    knapp?.click()
    return true
  })
  if (fanns) await new Promise((r) => setTimeout(r, 600))
  return fanns
}

/**
 * Gör sidan redo att trigga: vänta in PwaRegister och lämna cookie-samtycket.
 *
 * Bannern monteras på idle med ett tak på 2500 ms, och regeln 'cookiebanner'
 * håller tillbaka raden så länge den står kvar. Varje fall som förväntar sig
 * raden måste därför passera bannern först, precis som en verklig användare.
 */
async function gorRedo(page: Page): Promise<void> {
  await vantaPaKrok(page)
  await page
    .waitForSelector('.cookie-banner-container', { timeout: 20000 })
    .catch(() => null)
  await svaraPaCookies(page)
}

/** Står raden på skärmen? */
async function radenSyns(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const noder = Array.from(document.querySelectorAll('p'))
    const rad = noder.find((n) => n.textContent?.includes('Lägg Jobbcoach på hemskärmen'))
    if (!rad) return false
    const r = rad.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
}

async function main() {
  const port = arg('port', '5200')!
  const bas = `http://localhost:${port}`

  const chrome = CHROME_KANDIDATER.find((p) => fs.existsSync(p))
  if (!chrome) throw new Error('Hittade ingen Chrome eller Edge.')

  const svar = await fetch(bas + '/login').catch(() => null)
  if (!svar) {
    throw new Error(
      `Ingen server på ${bas}. Kör först:\n` +
        `  NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next build\n` +
        `  NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next start -p ${port}`
    )
  }

  fs.mkdirSync(BILDKATALOG, { recursive: true })

  /* -------------------------------------------------- inloggning, som perf */

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: brevRader } = await sb.from('letters').select('user_id').limit(2000)
  const poang = new Map<string, number>()
  for (const r of brevRader ?? []) {
    if (r.user_id) poang.set(r.user_id, (poang.get(r.user_id) ?? 0) + 1)
  }

  let epost: string | null = null
  for (const [id] of [...poang.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    const { data } = await sb.auth.admin.getUserById(id)
    if (data?.user?.email) {
      epost = data.user.email
      break
    }
  }
  if (!epost) throw new Error('Hittade inget konto att testa med.')

  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost })
  const { data: sess, error: sessFel } = await sb.auth.verifyOtp({
    type: 'magiclink',
    token_hash: link!.properties.hashed_token,
  })
  if (sessFel || !sess?.session) throw new Error('Kunde inte skapa session: ' + sessFel?.message)

  const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
  const cookieNamn = `sb-${projektRef}-auth-token`
  const payload =
    'base64-' +
    Buffer.from(
      JSON.stringify({
        access_token: sess.session.access_token,
        refresh_token: sess.session.refresh_token,
        expires_at: sess.session.expires_at,
        expires_in: sess.session.expires_in,
        token_type: 'bearer',
        user: sess.session.user,
      })
    ).toString('base64')

  const browser: Browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  /**
   * En ny sida med Pixel 7-emulering, inloggningscookie och planteringen.
   * lagring låter ett fall starta med ett givet localStorage-läge.
   */
  async function nySida(opts: {
    ios?: boolean
    standalone?: boolean
    lagring?: Record<string, string>
  } = {}): Promise<Page> {
    const page = await browser.newPage()

    const ua = opts.ios
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'

    await page.emulate({
      viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      userAgent: ua,
    })

    const cdp = await page.createCDPSession()
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 3 })
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 70,
      downloadThroughput: (12 * 1024 * 1024) / 8,
      uploadThroughput: (3 * 1024 * 1024) / 8,
    })

    const CHUNK = 3200
    if (payload.length <= CHUNK) {
      await page.setCookie({ name: cookieNamn, value: payload, url: bas, path: '/' })
    } else {
      for (let i = 0, n = 0; i < payload.length; i += CHUNK, n++) {
        await page.setCookie({
          name: `${cookieNamn}.${n}`,
          value: payload.slice(i, i + CHUNK),
          url: bas,
          path: '/',
        })
      }
    }

    await page.evaluateOnNewDocument(PLANTERING)

    if (opts.standalone) {
      // display-mode går inte att emulera, så vi byter ut matchMedia för
      // just den frågan. Det är exakt det vår arStandalone() läser.
      await page.evaluateOnNewDocument(() => {
        const original = window.matchMedia.bind(window)
        window.matchMedia = ((q: string) =>
          q.includes('display-mode: standalone')
            ? ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList)
            : original(q)) as typeof window.matchMedia
      })
    }

    // localStorage delas mellan alla flikar på samma ursprung, så ett fall
    // som accepterar frågan skulle annars låsa alla fall efter det. Varje
    // sida börjar därför med att städa bort våra tre nycklar och lägga in
    // exakt det läge fallet vill ha.
    const rader = opts.lagring ?? {}
    await page.evaluateOnNewDocument((r: Record<string, string>) => {
      try {
        for (const n of [
          'jc_pwa_first_seen_at',
          'jc_pwa_dismissed_at',
          'jc_pwa_installed',
        ]) {
          window.localStorage.removeItem(n)
        }
        for (const [k, v] of Object.entries(r)) window.localStorage.setItem(k, v)
      } catch {
        /* privat läge */
      }
    }, rader)

    return page
  }

  const DYGN = 24 * 60 * 60 * 1000

  /* ------------------------------------------------------------- fall 1 */
  // Första besöket: ingen stämpel i localStorage, ingen rad.
  {
    const page = await nySida()
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await gorRedo(page)
    await page.evaluate(() => (window as any).__skickaInstallEvent())
    await trigga(page, 'letter_saved')
    kontrollera(
      'forsta besoket: ingen rad',
      'dold',
      (await radenSyns(page)) ? 'synlig' : 'dold'
    )
    const stampel = await page.evaluate(() =>
      window.localStorage.getItem('jc_pwa_first_seen_at')
    )
    kontrollera(
      'forsta besoket: sessionen stamplas anda',
      'stamplad',
      stampel ? 'stamplad' : 'ostamplad'
    )
    await page.close()
  }

  /* ------------------------------------------------------------ fall 1b */
  // Cookie-bannern uppe: ingen rad, den hade hamnat under bannern.
  {
    const page = await nySida({
      lagring: { jc_pwa_first_seen_at: String(Date.now() - 3 * DYGN) },
    })
    // Samtycket lever i en cookie, och tidigare fall kan ha lämnat det.
    // Vi tar bort den så att bannern säkert kommer upp.
    await page.deleteCookie({ name: 'cvBrevCookieConsent', url: bas })
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await vantaPaKrok(page)
    // Bannern monteras på idle, med ett tak på 2500 ms.
    await page.waitForSelector('.cookie-banner-container', { timeout: 20000 })
    await page.evaluate(() => (window as any).__skickaInstallEvent())
    await trigga(page, 'letter_saved')
    kontrollera(
      'cookie-bannern uppe: ingen rad',
      'dold',
      (await radenSyns(page)) ? 'synlig' : 'dold'
    )

    // Och när samtycket är lämnat kommer nästa trigger förbi.
    await svaraPaCookies(page)
    await trigga(page, 'letter_saved')
    kontrollera(
      'efter samtycket: raden kommer fram',
      'synlig',
      (await radenSyns(page)) ? 'synlig' : 'dold'
    )
    await page.close()
  }

  /* ------------------------------------------------------------- fall 2 */
  // Andra besöket, Android: raden ska visas efter en trigger.
  {
    const page = await nySida({
      lagring: { jc_pwa_first_seen_at: String(Date.now() - 3 * DYGN) },
    })
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await gorRedo(page)
    await page.evaluate(() => (window as any).__skickaInstallEvent())
    const svarade = await trigga(page, 'letter_saved')
    kontrollera('andra besoket, android: raden visas', 'synlig', (await radenSyns(page)) ? 'synlig' : 'dold')
    kontrollera('andra besoket: requestInstallPrompt svarar true', 'true', String(!!svarade))
    await page.screenshot({ path: path.join(BILDKATALOG, '01-raden-android.png') })

    // Avfärda och kontrollera att det sparas.
    const klickade = await klickaIRaden(page, 'stang')
    kontrollera('avfardad: krysset gar att traffa', 'ja', klickade ? 'ja' : 'nej')
    await new Promise((r) => setTimeout(r, 600))
    kontrollera('avfardad: raden forsvinner', 'dold', (await radenSyns(page)) ? 'synlig' : 'dold')
    const avfardad = await page.evaluate(() =>
      window.localStorage.getItem('jc_pwa_dismissed_at')
    )
    kontrollera('avfardad: sparas i localStorage', 'sparad', avfardad ? 'sparad' : 'osparad')
    await page.close()
  }

  /* ------------------------------------------------------------- fall 3 */
  // Avfärdad för 5 dagar sedan: ingen rad.
  {
    const page = await nySida({
      lagring: {
        jc_pwa_first_seen_at: String(Date.now() - 30 * DYGN),
        jc_pwa_dismissed_at: String(Date.now() - 5 * DYGN),
      },
    })
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await gorRedo(page)
    await page.evaluate(() => (window as any).__skickaInstallEvent())
    await trigga(page, 'first_match')
    kontrollera('avfardad for 5 dagar sedan: ingen rad', 'dold', (await radenSyns(page)) ? 'synlig' : 'dold')
    await page.close()
  }

  /* ------------------------------------------------------------- fall 4 */
  // Avfärdad för 31 dagar sedan: raden kommer tillbaka.
  {
    const page = await nySida({
      lagring: {
        jc_pwa_first_seen_at: String(Date.now() - 60 * DYGN),
        jc_pwa_dismissed_at: String(Date.now() - 31 * DYGN),
      },
    })
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await gorRedo(page)
    await page.evaluate(() => (window as any).__skickaInstallEvent())
    await trigga(page, 'cv_template_downloaded')
    kontrollera('avfardad for 31 dagar sedan: raden ater', 'synlig', (await radenSyns(page)) ? 'synlig' : 'dold')
    await page.close()
  }

  /* ------------------------------------------------------------- fall 5 */
  // Standalone: ingenting visas, oavsett trigger.
  {
    const page = await nySida({
      standalone: true,
      lagring: { jc_pwa_first_seen_at: String(Date.now() - 30 * DYGN) },
    })
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await gorRedo(page)
    await page.evaluate(() => (window as any).__skickaInstallEvent())
    await trigga(page, 'logic_test_completed')
    kontrollera('standalone: ingen rad', 'dold', (await radenSyns(page)) ? 'synlig' : 'dold')
    await page.close()
  }

  /* ------------------------------------------------------------- fall 6 */
  // Accepterad fråga: systemdialogen öppnas, raden försvinner, och frågan
  // ställs aldrig igen.
  {
    const page = await nySida({
      lagring: { jc_pwa_first_seen_at: String(Date.now() - 30 * DYGN) },
    })
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await gorRedo(page)
    await page.evaluate(() => (window as any).__skickaInstallEvent())
    await trigga(page, 'letter_saved')

    await klickaIRaden(page, 'laggTill')
    await new Promise((r) => setTimeout(r, 800))

    const dialogVisad = await page.evaluate(() => (window as any).__pwaDialogVisad === true)
    kontrollera('android: Lagg till oppnar systemdialogen', 'oppnad', dialogVisad ? 'oppnad' : 'inte oppnad')
    kontrollera('accepterad: raden forsvinner', 'dold', (await radenSyns(page)) ? 'synlig' : 'dold')
    const klar = await page.evaluate(() => window.localStorage.getItem('jc_pwa_installed'))
    kontrollera('accepterad: sparas som klar', 'true', String(klar))

    // Ny trigger i samma session ska inte ge något.
    await trigga(page, 'first_match')
    kontrollera('accepterad: ny trigger ger ingen rad', 'dold', (await radenSyns(page)) ? 'synlig' : 'dold')
    await page.close()
  }

  /* ------------------------------------------------------------- fall 7 */
  // iPhone: ingen beforeinstallprompt, men raden ska ändå visas, och
  // "Lägg till" ska öppna arket med de tre stegen.
  {
    const page = await nySida({
      ios: true,
      lagring: { jc_pwa_first_seen_at: String(Date.now() - 30 * DYGN) },
    })
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await gorRedo(page)
    // Inget installEvent skickas: Safari har inget sådant.
    await trigga(page, 'logic_test_completed')
    kontrollera('ios: raden visas utan beforeinstallprompt', 'synlig', (await radenSyns(page)) ? 'synlig' : 'dold')
    await page.screenshot({ path: path.join(BILDKATALOG, '02-raden-ios.png') })

    await klickaIRaden(page, 'laggTill')
    await new Promise((r) => setTimeout(r, 900))

    const text = await sidtext(page)
    const arketOppet =
      text.includes('Tre steg i Safari') && text.includes('Lägg till på hemskärmen')
    kontrollera('ios: Lagg till oppnar arket med tre steg', 'oppet', arketOppet ? 'oppet' : 'stangt')
    await page.screenshot({ path: path.join(BILDKATALOG, '03-ios-arket.png') })

    const dialogRoll = await page.evaluate(
      () => document.querySelector('[role="dialog"]') !== null
    )
    kontrollera('ios: arket ar en dialog', 'dialog', dialogRoll ? 'dialog' : 'ingen dialog')

    await page.evaluate(() => {
      const knappar = Array.from(document.querySelectorAll('button'))
      knappar.find((b) => b.textContent?.trim() === 'Klart')?.click()
    })
    await new Promise((r) => setTimeout(r, 600))
    kontrollera('ios: Klart stanger allt', 'dold', (await radenSyns(page)) ? 'synlig' : 'dold')
    const klar = await page.evaluate(() => window.localStorage.getItem('jc_pwa_installed'))
    kontrollera('ios: Klart sparas som klar', 'true', String(klar))
    await page.close()
  }

  /* ------------------------------------------------------------- fall 8 */
  // Manifestet och service workern.
  {
    const page = await nySida()
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })

    const manifestHref = await page.evaluate(
      () => document.querySelector('link[rel="manifest"]')?.getAttribute('href') ?? ''
    )
    kontrollera('manifestet lankas i head', '/manifest.webmanifest', manifestHref)

    const m = await (await fetch(bas + '/manifest.webmanifest')).json()
    kontrollera('manifest: name', 'Jobbcoach', String(m.name))
    kontrollera('manifest: short_name', 'Jobbcoach', String(m.short_name))
    kontrollera('manifest: display', 'standalone', String(m.display))
    kontrollera('manifest: start_url', '/dashboard?source=pwa', String(m.start_url))
    kontrollera('manifest: id', '/dashboard', String(m.id))
    kontrollera('manifest: lang', 'sv', String(m.lang))
    kontrollera('manifest: theme_color', '#EDE8DF', String(m.theme_color))
    kontrollera('manifest: background_color', '#EDE8DF', String(m.background_color))
    kontrollera('manifest: antal ikoner', '3', String((m.icons ?? []).length))
    kontrollera(
      'manifest: maskable finns',
      'ja',
      (m.icons ?? []).some((i: { purpose?: string }) => i.purpose === 'maskable') ? 'ja' : 'nej'
    )

    // Ikonerna ska gå att hämta och ha rätt mått.
    for (const ikon of m.icons ?? []) {
      const r = await fetch(bas + ikon.src)
      kontrollera(`ikon ${ikon.src} svarar 200`, '200', String(r.status))
    }

    const swSvar = await fetch(bas + '/sw.js')
    kontrollera('sw.js svarar 200', '200', String(swSvar.status))
    const swText = await swSvar.text()
    kontrollera(
      'sw.js har en fetch-hanterare',
      'ja',
      swText.includes("addEventListener('fetch'") ? 'ja' : 'nej'
    )
    // Kommentarerna i sw.js förklarar varför vi INTE anropar respondWith, så
    // ordet förekommer i filen. Vi letar efter ett riktigt anrop i stället.
    const kod = swText.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    kontrollera('sw.js anropar inte respondWith', 'ja', /respondWith\s*\(/.test(kod) ? 'nej' : 'ja')
    kontrollera('sw.js har ingen cache-oppning', 'ja', /caches\.open\s*\(/.test(kod) ? 'nej' : 'ja')

    // Registreringen sker på idle, så vi ger den en stund.
    await new Promise((r) => setTimeout(r, 5000))
    const swRegistrerad = await page.evaluate(async () => {
      const regs = await navigator.serviceWorker.getRegistrations()
      return regs.length > 0
    })
    kontrollera('service workern registreras', 'registrerad', swRegistrerad ? 'registrerad' : 'oregistrerad')

    const appleCapable = await page.evaluate(
      () =>
        document
          .querySelector('meta[name="apple-mobile-web-app-capable"]')
          ?.getAttribute('content') ?? ''
    )
    kontrollera('apple-mobile-web-app-capable', 'yes', appleCapable)

    // Next skriver numera den moderna, oprefixade taggen. Båda ska finnas:
    // iOS 16 och äldre läser bara den prefixade.
    const modernCapable = await page.evaluate(
      () =>
        document
          .querySelector('meta[name="mobile-web-app-capable"]')
          ?.getAttribute('content') ?? ''
    )
    kontrollera('mobile-web-app-capable', 'yes', modernCapable)

    const appleTitel = await page.evaluate(
      () =>
        document
          .querySelector('meta[name="apple-mobile-web-app-title"]')
          ?.getAttribute('content') ?? ''
    )
    kontrollera('apple-mobile-web-app-title', 'Jobbcoach', appleTitel)

    const statusBar = await page.evaluate(
      () =>
        document
          .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
          ?.getAttribute('content') ?? ''
    )
    kontrollera('apple status-bar-style', 'default', statusBar)

    const appleTouch = await page.evaluate(
      () => document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') ?? ''
    )
    kontrollera(
      'apple-touch-icon lankas',
      'ja',
      appleTouch.length > 0 ? 'ja' : 'nej'
    )

    const themeColor = await page.evaluate(
      () => document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? ''
    )
    kontrollera('theme-color i head', '#EDE8DF', themeColor)

    await page.close()
  }

  /* ------------------------------------------------------------- fall 9 */
  // CLS: raden får inte flytta något när den dyker upp.
  {
    const page = await nySida({
      lagring: { jc_pwa_first_seen_at: String(Date.now() - 30 * DYGN) },
    })
    await page.evaluateOnNewDocument(() => {
      ;(window as any).__cls = 0
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          const s = e as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
          if (!s.hadRecentInput) (window as any).__cls += s.value ?? 0
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 })
    await gorRedo(page)
    await page.evaluate(() => (window as any).__skickaInstallEvent())
    // Låt sidan lugna sig helt, så att det vi mäter är raden och inget annat.
    await new Promise((r) => setTimeout(r, 2500))
    const fore = await page.evaluate(() => (window as any).__cls as number)
    await trigga(page, 'letter_saved')
    await new Promise((r) => setTimeout(r, 1200))
    const efter = await page.evaluate(() => (window as any).__cls as number)
    const skift = Math.max(0, efter - fore)
    kontrollera('raden orsakar inget layoutskifte', '0', skift < 0.002 ? '0' : skift.toFixed(4))
    await page.close()
  }

  await browser.close()

  /* ------------------------------------------------------------ summering */

  const fel = resultat.filter((r) => !r.ok)
  console.log(
    `\n${resultat.length - fel.length} av ${resultat.length} kontroller gick igenom.`
  )
  if (fel.length) {
    console.log('\nFel:')
    for (const f of fel) console.log(`  ${f.namn}: vantade ${f.vantat}, fick ${f.utfall}`)
  }
  console.log(`\nSkarmdumpar i ${path.relative(process.cwd(), BILDKATALOG)}`)

  fs.writeFileSync(
    path.join(BILDKATALOG, 'resultat.json'),
    JSON.stringify(resultat, null, 2),
    'utf8'
  )

  process.exit(fel.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
