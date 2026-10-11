/**
 * Klicktest av testsidan och resultatsidan i tester-lyftet (Provbladet) i
 * riktig Chrome mot ett produktionsbygge.
 *
 *   npx tsx scripts/qa-tester-lyft-resultat.ts --port 5260
 *   npx tsx scripts/qa-tester-lyft-resultat.ts --radera
 *
 * Ett eget gratiskonto, qa-lyft-res-a-<tid>@jobbcoach-qa.test, gör tre
 * riktiga test (logik grund, verbalt grund, numeriskt grund):
 *
 * - logiken klickas igenom i testvyn, femton frågor
 * - verbalt och numeriskt startas med knappen på testsidan och besvaras sedan
 *   via testets egna answer- och complete-rutter inifrån sidan (samma cookie,
 *   samma rättning), med varierad tid per fråga så att tempot syns
 *
 * Plus en gammal session utan meta och med answers som objekt, insatt med
 * id. Varje sida fotograferas på 360, 412 och 1280, ljust och mörkt, i
 * docs/qa/tester-lyft/resultat/. Kontot och alla dess rader raderas med id
 * efteråt; raderna räknas före varje delete (feedback_testdata_stadning).
 */

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import { laddaEnv } from './_env'
import { selectPassagesForSession as verbalUrval } from '../src/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as numUrval } from '../src/lib/numericalTest/selectPassages'

laddaEnv()

const arg = (n: string, f: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const PORT = arg('port', '5260')
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/tester-lyft/resultat')
const KONTOFIL = path.resolve('scripts/.qa-lyft-res-konto.json')
fs.mkdirSync(UT, { recursive: true })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))!
const UA_MOBIL = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
const FORMER = {
  m360: { viewport: { width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: UA_MOBIL },
  pixel7: { viewport: { width: 412, height: 915 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: UA_MOBIL },
  desktop: { viewport: { width: 1280, height: 900, deviceScaleFactor: 1 }, userAgent: '' },
} as const
type Form = keyof typeof FORMER
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /Download the React DevTools/i]
const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface Konto {
  email: string
  id: string
  sessioner: Record<string, string>
}

async function skapaKonto(): Promise<Konto> {
  if (fs.existsSync(KONTOFIL)) return JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  const ts = Date.now()
  const email = `qa-lyft-res-a-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaLyftRes!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Andersson', password_set: true },
  })
  if (error) throw new Error(error.message)
  const k: Konto = { email, id: data.user.id, sessioner: {} }
  fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
  await vanta(600)
  const { error: pErr } = await sb.from('profiles').upsert({ id: k.id, email, full_name: 'Anna Andersson', email_verified_at: new Date().toISOString() })
  if (pErr) throw new Error('profil: ' + pErr.message)
  console.log('skapade', email, k.id)
  return k
}

function spara(k: Konto) {
  fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
}

const TABELLER = ['logic_test_v4_sessions', 'user_activities', 'onboarding_progress', 'scheduled_emails', 'email_schedule', 'email_log', 'user_ui_flags', 'notifications', 'premium_grants', 'daily_usage']

async function raderaKonto() {
  if (!fs.existsSync(KONTOFIL)) return console.log('inget konto att radera')
  const k: Konto = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  if (!k.email.startsWith('qa-lyft-res-') || !k.email.endsWith('@jobbcoach-qa.test')) throw new Error('inte ett eget QA-konto')
  const rapport: Record<string, number> = {}
  for (const t of TABELLER) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
    if (error || !count) continue
    const { error: dErr } = await sb.from(t).delete().eq('user_id', k.id)
    rapport[t] = count
    console.log(`  ${t}: ${count} rader ${dErr ? 'FEL ' + dErr.message : 'raderade'}`)
  }
  const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
  await sb.from('profiles').delete().eq('id', k.id)
  const { error } = await sb.auth.admin.deleteUser(k.id)
  console.log(`raderade ${k.email} (profiles: ${pc ?? 0}) ${error ? error.message : 'ok'}`)
  fs.writeFileSync(path.join(UT, 'radering.json'), JSON.stringify({ email: k.email, id: k.id, rader: rapport, profiler: pc ?? 0 }, null, 2))
  fs.unlinkSync(KONTOFIL)
}

const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
let payload: string | null = null
async function payloadFor(email: string) {
  if (payload) return payload
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties!.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  payload =
    'base64-' +
    Buffer.from(
      JSON.stringify({
        access_token: s.session.access_token,
        refresh_token: s.session.refresh_token,
        expires_at: s.session.expires_at,
        expires_in: s.session.expires_in,
        token_type: 'bearer',
        user: s.session.user,
      })
    ).toString('base64')
  return payload
}

interface Logg {
  konsol: string[]
  http: string[]
}

async function nySida(browser: Browser, form: Form, tema: 'light' | 'dark', email: string) {
  const page = await browser.newPage()
  const f = FORMER[form]
  if (f.userAgent) await page.emulate(f as never)
  else await page.setViewport(f.viewport)
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema }])
  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      localStorage.setItem('pwa_install_dismissed_at', String(Date.now()))
      localStorage.removeItem('tema')
    } catch {}
  })
  const logg: Logg = { konsol: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error' && !BRUS.some((r) => r.test(m.text()))) logg.konsol.push(m.text().slice(0, 300))
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String((e as Error).message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  return { page, logg }
}

async function ga(page: Page, url: string, vantaPa: string) {
  await page.goto(BAS + url, { waitUntil: 'networkidle0', timeout: 120000 })
  await page.waitForSelector(vantaPa, { timeout: 60000 })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(1600)
}

/** Helsidesbild: skalet rullar i main, så fönstret görs lika högt som innehållet. */
async function bild(page: Page, namn: string) {
  const vp = page.viewport()!
  const hojd = await page.evaluate(() => {
    const m = document.querySelector('.dashboard-main-content') as HTMLElement | null
    return m ? m.scrollHeight + (innerHeight - m.clientHeight) : document.documentElement.scrollHeight
  })
  await page.setViewport({ ...vp, height: Math.min(Math.max(hojd, vp.height), 7000) })
  await vanta(400)
  await page.screenshot({ path: path.join(UT, `${namn}.png`) as `${string}.png` })
  await page.setViewport(vp)
  await vanta(200)
}

/** Det som ska gälla på varje sida: ingen sidledsrullning, inga förbjudna tal i löptext, inget rött. */
async function matt(page: Page) {
  return page.evaluate(() => {
    const main = (document.querySelector('main') ?? document.body) as HTMLElement
    const text = main.innerText
    const rott = [...main.querySelectorAll('*')].filter((el) => {
      const c = getComputedStyle(el).color
      const m = c.match(/rgb\((\d+), (\d+), (\d+)\)/)
      if (!m) return false
      const [r, g, b] = m.slice(1).map(Number)
      return r > 150 && g < 80 && b < 80 && (el as HTMLElement).innerText?.trim()
    }).length
    const knapp = [...document.querySelectorAll('button, a')].find((b) => b.className.includes('knapp-primar') && (b as HTMLElement).offsetParent)
    const kr = knapp?.getBoundingClientRect()
    return {
      horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      mittpunktsrad: /\d[^\n]*·[^\n]*\d/.test(text),
      dittBastaKolon: /Ditt bästa:/.test(text),
      procentOrd: /\d+ procent/.test(text),
      percentil: /percentil|Bättre än/i.test(text),
      nastaNiva: /nästa nivå|Prova nästa/i.test(text),
      rodText: rott,
      primarKnapp: knapp ? (knapp as HTMLElement).innerText.trim() : null,
      primarIVy: kr ? kr.bottom <= innerHeight && kr.top >= 0 : null,
      missar: document.querySelectorAll('[data-missar] li').length,
    }
  })
}

const FORM_LISTA: Form[] = ['m360', 'pixel7', 'desktop']
const TEMAN: ('light' | 'dark')[] = ['light', 'dark']
const resultat: Record<string, unknown>[] = []

async function fotografera(browser: Browser, k: Konto, url: string, vantaPa: string, namn: string, extra?: (page: Page, prefix: string) => Promise<Record<string, unknown>>) {
  for (const form of FORM_LISTA) {
    for (const tema of TEMAN) {
      const { page, logg } = await nySida(browser, form, tema, k.email)
      const prefix = `${namn}-${form}-${tema === 'light' ? 'ljust' : 'morkt'}`
      try {
        await ga(page, url, vantaPa)
        const m = await matt(page)
        await bild(page, `${prefix}-01`)
        const x = extra ? await extra(page, prefix) : {}
        resultat.push({ vy: prefix, ...m, ...x, konsol: logg.konsol, http: logg.http })
        console.log(prefix, JSON.stringify(m), JSON.stringify(x), 'konsol', logg.konsol.length, 'http', logg.http.join(',') || 0)
      } catch (e) {
        resultat.push({ vy: prefix, fel: String(e), konsol: logg.konsol, http: logg.http })
        console.log(prefix, 'FEL', String(e))
        await page.screenshot({ path: path.join(UT, `${prefix}-FEL.png`) as `${string}.png` }).catch(() => {})
      }
      await page.close()
    }
  }
}

/* ------------------------------ Testen ------------------------------ */

async function starta(page: Page, slug: string): Promise<string> {
  await ga(page, `/dashboard/tester/${slug}`, 'button.knapp-primar')
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button.knapp-primar')].find((e) => /Starta testet|Gör om testet/.test((e as HTMLElement).innerText)) as HTMLElement
    b.click()
  })
  await page.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 120000 })
  return page.url().split('/test/')[1].split(/[/?#]/)[0]
}

async function gorMatris(browser: Browser, k: Konto) {
  if (k.sessioner.matris) return
  const { page } = await nySida(browser, 'pixel7', 'light', k.email)
  const id = await starta(page, 'matrislogik-grund')
  await page.waitForSelector('button[aria-label^="Svarsalternativ"]', { timeout: 60000 })
  await vanta(800)
  for (let i = 0; i < 15; i++) {
    const svar = page
      .waitForResponse((r) => /\/answer$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST', { timeout: 30000 })
      .then((r) => r.status())
    // Slumpat alternativ: ger en blandning av rätt och fel.
    const bokstav = 'ABCDEF'[Math.floor(Math.random() * 6)]
    await page.evaluate((l) => {
      const knappar = [...document.querySelectorAll('button[aria-label^="Svarsalternativ"]')].filter((e) => (e as HTMLElement).offsetParent !== null) as HTMLElement[]
      const b = knappar.find((e) => e.getAttribute('aria-label') === `Svarsalternativ ${l}`) ?? knappar[0]
      b.scrollIntoView({ block: 'center' })
      b.click()
    }, bokstav)
    const st = await svar
    if (st !== 200) console.log('matris svar', i + 1, st)
    await vanta(900 + Math.floor(Math.random() * 1500))
  }
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /^Lämna in$/.test(e.innerText.trim())) as HTMLElement | undefined
    b?.click()
  })
  await vanta(800)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /Avsluta och se resultat/.test(e.innerText)) as HTMLElement | undefined
    b?.click()
  })
  await page.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
  await page.waitForSelector('[data-resultat]', { timeout: 60000 })
  await vanta(1500)
  await bild(page, 'matris-direkt-efter-testet-pixel7-ljust')
  k.sessioner.matris = id
  spara(k)
  await page.close()
  console.log('matris klar', id)
}

/** Verbalt och numeriskt: startas på testsidan, besvaras via testets egna rutter inifrån sidan. */
async function gorViaRutter(browser: Browser, k: Konto, typ: 'verbal' | 'numerisk') {
  if (k.sessioner[typ]) return
  const slug = typ === 'verbal' ? 'verbal-resonemang' : 'numeriskt-test'
  const api = typ === 'verbal' ? '/api/verbalTestV1' : '/api/numericalTest'
  const { page } = await nySida(browser, 'pixel7', 'light', k.email)
  const id = await starta(page, slug)
  await vanta(1500)
  const kroppar: Record<string, unknown>[] = []
  if (typ === 'verbal') {
    for (const p of verbalUrval(id)) {
      p.statements.forEach((st, j) => {
        const alla = ['true', 'false', 'cannot_say'] as const
        const ratt = Math.random() < 0.75
        const answer = ratt ? st.correctAnswer : alla.find((a) => a !== st.correctAnswer)!
        kroppar.push({ sessionId: id, passageId: p.id, statementIndex: j, answer, timeSpent: 8 + Math.floor(Math.random() * 40) })
      })
    }
  } else {
    for (const p of numUrval(id)) {
      for (const q of p.questions) {
        if (Math.random() < 0.08) continue // några obesvarade
        const ratt = Math.random() < 0.7
        const fel = q.options.find((o) => o.id !== q.correctAnswerId)!
        kroppar.push({ sessionId: id, passageId: p.id, questionId: q.id, selectedAnswerId: ratt ? q.correctAnswerId : fel.id, timeSpent: 20 + Math.floor(Math.random() * 90) })
      }
    }
  }
  const status = await page.evaluate(
    async (api, kroppar, id) => {
      const ut: number[] = []
      for (const b of kroppar) {
        const r = await fetch(`${api}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
        ut.push(r.status)
      }
      const c = await fetch(`${api}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: id }) })
      ut.push(c.status)
      return ut
    },
    api,
    kroppar,
    id
  )
  const fel = status.filter((s) => s !== 200)
  console.log(typ, 'svar', status.length - 1, 'fel status', fel.length ? fel : 0)
  await ga(page, `/dashboard/tester/${slug}/test/${id}/results`, '[data-resultat]')
  await bild(page, `${typ}-direkt-efter-testet-pixel7-ljust`)
  k.sessioner[typ] = id
  spara(k)
  await page.close()
}

/** En gammal session: oblandad, utan meta och med answers som objekt, som de 77 i prod. */
async function gammalSession(k: Konto) {
  if (k.sessioner.gammal) return
  const id = randomUUID()
  const fore = new Date(Date.now() - 40 * 86400000)
  const { error } = await sb.from('logic_test_v4_sessions').insert({
    id,
    user_id: k.id,
    test_type: 'matrislogik',
    answers: { _mock: true },
    score: 9,
    time_spent: 905,
    started_at: fore.toISOString(),
    created_at: fore.toISOString(),
    completed_at: new Date(fore.getTime() + 905000).toISOString(),
  })
  if (error) throw new Error('gammal session: ' + error.message)
  k.sessioner.gammal = id
  spara(k)
  console.log('gammal session', id)
}

async function main() {
  if (process.argv.includes('--radera')) return raderaKonto()
  const k = await skapaKonto()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  try {
    // Testsidan som ny användare, innan något test är gjort.
    if (Object.keys(k.sessioner).length === 0) await fotografera(browser, k, '/dashboard/tester/matrislogik-grund', 'button.knapp-primar', 'testsida-tom-logik')

    await gorMatris(browser, k)
    await gorViaRutter(browser, k, 'verbal')
    await gorViaRutter(browser, k, 'numerisk')
    await gammalSession(k)

    // Testsidorna med försök.
    const visaForsok = async (page: Page, prefix: string) => {
      await page.evaluate(() => {
        const s = document.querySelector('[data-testsida-resultat] details summary') as HTMLElement | null
        s?.scrollIntoView({ block: 'center' })
        s?.click()
      })
      await vanta(400)
      await bild(page, `${prefix}-02-forsok`)
      return { forsokRader: await page.evaluate(() => document.querySelectorAll('[data-forsok-lista] li').length) }
    }
    await fotografera(browser, k, '/dashboard/tester/matrislogik-grund', '[data-testsida-resultat]', 'testsida-logik', visaForsok)
    await fotografera(browser, k, '/dashboard/tester/verbal-resonemang', '[data-testsida-resultat]', 'testsida-verbal', visaForsok)
    await fotografera(browser, k, '/dashboard/tester/numeriskt-test', '[data-testsida-resultat]', 'testsida-numeriskt', visaForsok)

    // Resultatsidorna, plus genomgången efter klick på kopparknappen.
    const gaIgenom = async (page: Page, prefix: string) => {
      const harKnapp = await page.evaluate(() => {
        const b = document.querySelector('[data-resultat] section[aria-label="Genomgång"] button.knapp-primar, [data-resultat] section[aria-label="Genomgång"] a.knapp-primar') as HTMLElement | null
        if (!b || b.tagName === 'A') return b ? 'lank' : null
        b.click()
        return 'knapp'
      })
      if (harKnapp !== 'knapp') return { genomgang: harKnapp }
      await page.waitForSelector('#genomgang', { timeout: 30000 })
      await vanta(1500)
      await bild(page, `${prefix}-02-genomgang`)
      return { genomgang: 'oppnad', genomgangRader: await page.evaluate(() => document.querySelectorAll('#genomgang li').length) }
    }
    await fotografera(browser, k, `/dashboard/tester/matrislogik-grund/test/${k.sessioner.matris}/results`, '[data-resultat]', 'resultat-logik', gaIgenom)
    await fotografera(browser, k, `/dashboard/tester/verbal-resonemang/test/${k.sessioner.verbal}/results`, '[data-resultat]', 'resultat-verbal', gaIgenom)
    await fotografera(browser, k, `/dashboard/tester/numeriskt-test/test/${k.sessioner.numerisk}/results`, '[data-resultat]', 'resultat-numeriskt', gaIgenom)
    await fotografera(browser, k, `/dashboard/tester/matrislogik-grund/test/${k.sessioner.gammal}/results`, '[data-resultat]', 'resultat-gammal', async (page) => ({
      saknasText: await page.evaluate(() => /Genomgången saknas/.test(document.body.innerText)),
    }))
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
    if (!process.argv.includes('--behall')) await raderaKonto()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
