/**
 * Den inloggade mallytan i CV-rummet (omgång 1, steg 2 och 3) för
 * klicktesterna: väljare, växeln för skarpa körningar och den påhittade
 * nedladdningen.
 *
 * Växeln: utan `--skarpt` gör klicktesterna inga riktiga nedladdningar
 * (generate-formatted besvaras i webbläsaren med en liten PDF eller Word-fil,
 * så att filraden, målgången och merförsäljningen syns) och skapar inga
 * konton via kontoarket. Med `--skarpt` går allt mot servern som förut (en
 * gång, i slutsteget).
 *
 *   npx tsx scripts/klicktest-cv-yta.ts prova --konton <qa-cv-rummet-konton.json> [--bas URL]
 *
 * `prova` öppnar Mallar med ett gratiskonto och ett Premiumkonto ur
 * scripts/qa-cv-rummet-konton.mjs och kontrollerar att väljarna nedan hittar
 * ytan (utan skarpa nedladdningar). Det är kontrollen att skripten är
 * körklara, inte klicktestet.
 */
import fs from 'fs'
import type { HTTPRequest, Page } from 'puppeteer-core'

export const SKARPT = process.argv.includes('--skarpt')

/** Väljarna på /dashboard/cv-mallar (MallarVy, MallGalleri, CvSparr, Final, Merforsaljning). */
export const YTA = {
  vagg: '[data-cv-vagg][data-sida="mallar"]',
  ladda: '[data-ladda-knapp]',
  format: '[role="radiogroup"][aria-label="Format"]',
  word: '[role="radiogroup"][aria-label="Format"] [role="radio"]:nth-child(2)',
  pdf: '[role="radiogroup"][aria-label="Format"] [role="radio"]:nth-child(1)',
  ruta: (id: string) => `[data-mall-ruta="${id}"]`,
  ark: '[data-ark-stor] .dok-ark-yta',
  arkIframe: '[data-ark-stor] .dok-ark-yta iframe',
  helskarm: '[data-ark-stor] .dok-ark-yta button.top-2[aria-label="Läs i helskärm"]',
  rubrik: '[data-ark-stor] .dok-ark-yta button[aria-label^="Byt rubrik"]',
  avsnitt: '[data-ark-stor] .dok-ark-yta button[data-avsnitt-knapp]',
  andraTexten: '[data-andra-texten]',
  pil: (sida: 'v' | 'h') => `.cv3m-pil[data-sida="${sida}"]`,
  gratisvag: '[data-gratisvag]',
  premiumkort: '[data-premiumkort]',
  sparr: (variant?: string) => (variant ? `[data-cv-sparr="${variant}"]` : '[data-cv-sparr]'),
  merforsaljning: '[data-merforsaljning]',
  final: '[data-final]',
  fastRad: '.cv3m-fast',
  panel: '[data-mallar-panel]',
} as const

/** Synlig = har en ruta på sidan (också fasta lager som målgången, där offsetParent är null). */
/** Klickar på första synliga träffen (dator och telefon har var sin kopia av vissa knappar). */
export async function klickaSynlig(page: Page, sel: string, ms = 20000): Promise<void> {
  await page.waitForFunction((s) => [...document.querySelectorAll<HTMLElement>(s)].some((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'), { timeout: ms }, sel)
  await page.evaluate((s) => {
    const el = [...document.querySelectorAll<HTMLElement>(s)].find((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden')!
    el.scrollIntoView({ block: 'center' })
    el.click()
  }, sel)
}

/** Finns en synlig träff? */
export async function synlig(page: Page, sel: string): Promise<boolean> {
  return page.evaluate((s) => [...document.querySelectorAll<HTMLElement>(s)].some((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'), sel)
}

/** Texten i första synliga träffen. */
export async function synligText(page: Page, sel: string): Promise<string> {
  return page.evaluate((s) => [...document.querySelectorAll<HTMLElement>(s)].find((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden')?.innerText ?? '', sel)
}

/** En giltig minsta PDF och ett zip-huvud för Word, så att filkontrollerna (%PDF, PK) håller. */
const PDF = Buffer.from('%PDF-1.4\n%klicktest\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')
const DOCX = Buffer.from('PK\u0003\u0004klicktest')

/**
 * Utan --skarpt: generate-formatted besvaras i webbläsaren (ingen fil skapas på
 * servern, gratisräknaren rörs inte). `traff` besvarar forsta-traff (målgången).
 * Anropa före page.goto.
 */
export async function fejkaNedladdning(page: Page, opts?: { traff?: unknown }): Promise<void> {
  if (SKARPT && opts?.traff === undefined) return
  await page.setRequestInterception(true)
  page.on('request', (r: HTTPRequest) => {
    if (r.isInterceptResolutionHandled()) return
    const u = r.url()
    if (!SKARPT && u.includes('/api/cv/generate-formatted')) {
      let docx = false
      try {
        docx = (JSON.parse(r.postData() ?? '{}') as { format?: string }).format === 'docx'
      } catch {
        docx = false
      }
      const kropp = docx ? DOCX : PDF
      return void r.respond({
        status: 200,
        contentType: docx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf',
        headers: { 'content-length': String(kropp.length) },
        body: kropp,
      })
    }
    if (opts?.traff !== undefined && u.includes('/api/cv/forsta-traff')) {
      return void r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(opts.traff) })
    }
    return void r.continue()
  })
}

/* --------------------------------------------- prova: hittar väljarna ytan? */

async function prova() {
  const { createClient } = await import('@supabase/supabase-js')
  const puppeteer = (await import('puppeteer-core')).default
  for (const rad of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const i = rad.indexOf('=')
    if (i < 0 || rad.trim().startsWith('#')) continue
    const k = rad.slice(0, i).trim()
    if (!process.env[k]) process.env[k] = rad.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
  const arg = (n: string, f?: string) => {
    const i = process.argv.indexOf('--' + n)
    return i >= 0 ? process.argv[i + 1] : f
  }
  const BAS = arg('bas', 'http://localhost:8332')!
  const konton = JSON.parse(fs.readFileSync(arg('konton')!, 'utf8')) as Record<string, { email: string; cv: Record<string, string> }>
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const cookie = async (epost: string) => {
    const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost })
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: s } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties.hashed_token })
    const ref = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
    const payload = 'base64-' + Buffer.from(JSON.stringify({ ...s!.session, user: s!.session!.user })).toString('base64')
    const namn = `sb-${ref}-auth-token`
    const ut: { name: string; value: string }[] = []
    for (let i = 0, n = 0; i < payload.length; i += 3200, n++) ut.push({ name: `${namn}.${n}`, value: payload.slice(i, i + 3200) })
    return ut.length === 1 ? [{ name: namn, value: payload }] : ut
  }
  const res: string[] = []
  const kontroll = (ok: boolean, t: string) => {
    res.push(`${ok ? 'OK ' : 'FEL'} ${t}`)
    console.log(`${ok ? 'OK ' : 'FEL'} ${t}`)
  }
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
  try {
    for (const [roll, vy] of [
      ['gratis', { width: 1280, height: 900 }],
      ['premium', { width: 412, height: 915, isMobile: true, hasTouch: true }],
    ] as const) {
      const k = konton[roll]
      const ctx = await browser.createBrowserContext()
      const page = await ctx.newPage()
      await page.setViewport(vy)
      for (const c of await cookie(k.email)) await page.setCookie({ ...c, url: BAS, path: '/' })
      await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
      await fejkaNedladdning(page, { traff: { traff: null } })
      await page.goto(`${BAS}/dashboard/cv-mallar?cv=${k.cv.analyserat}&mall=koppar`, { waitUntil: 'networkidle2', timeout: 120000 })
      await page.waitForSelector(YTA.arkIframe, { timeout: 60000 })
      const steg = `${roll} ${vy.width}`
      for (const [namn, sel] of Object.entries({ vagg: YTA.vagg, ladda: YTA.ladda, format: YTA.format, ark: YTA.ark, helskarm: YTA.helskarm, andraTexten: YTA.andraTexten, ruta: YTA.ruta('linne'), panel: YTA.panel })) {
        kontroll(await synlig(page, sel), `${steg}: ${namn} hittas`)
      }
      if (roll === 'gratis') {
        kontroll(await synlig(page, YTA.pil('h')), `${steg}: pilarna hittas`)
        kontroll(await synlig(page, YTA.gratisvag), `${steg}: gratisvägen hittas (Premiummall utan Premium)`)
        kontroll(await synlig(page, YTA.premiumkort), `${steg}: Premiumkortet hittas`)
        await klickaSynlig(page, YTA.ladda)
        await page.waitForSelector(YTA.sparr('mall'), { timeout: 20000 }).catch(() => null)
        kontroll(await synlig(page, YTA.sparr('mall')), `${steg}: knappen öppnar spärren mall`)
      } else {
        kontroll(await synlig(page, YTA.fastRad), `${steg}: den fasta raden hittas`)
        await klickaSynlig(page, YTA.ladda)
        await page.waitForSelector(YTA.final, { timeout: 30000 }).catch(() => null)
        kontroll(await synlig(page, YTA.final), `${steg}: nedladdningen (påhittad) öppnar målgången`)
      }
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
  if (res.some((r) => r.startsWith('FEL'))) process.exitCode = 1
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/klicktest-cv-yta.ts') && process.argv[2] === 'prova') {
  prova().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
