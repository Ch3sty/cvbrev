/**
 * Helskärmen och mallytan på dator och mobil (ägarens fynd 2026-11-16):
 * hjälpraden efter enheten, "Alla N" i helskärmen, remsan som använder
 * bredden, tangentbordet (pilar, plus/minus, Esc, fokus), grupprubrikernas
 * band, tomma grupper, formatbrickorna, fliken "Sidan 2 börjar här", den
 * fasta raden 1024 till 2560 px, pennan vid rubrikerna och titeln som går
 * att ändra (och följer med till PDF och Word).
 *
 *   npx tsx scripts/klicktest-helskarm-dator.ts skapa  --ut <mapp>
 *   npx tsx scripts/klicktest-helskarm-dator.ts klicka --ut <mapp> [--bas URL] [--snabb]
 *   npx tsx scripts/klicktest-helskarm-dator.ts radera --ut <mapp>
 *
 * Kontot: qa-helskarm-dator-<tid>@jobbcoach-qa.test (Premium, långt CV).
 * Raderingen går bara på id:t i konton.json (räknas före delete). Bilder
 * och filer hamnar i --ut, aldrig i git.
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import { CV_LANGDER } from '../src/lib/cv/word/__tests__/fixtures'
import { MALL_KATALOG } from '../src/lib/cv/mallar/katalog'
import { CHROME, lasPdfGeometri } from './lib/pdf-verktyg'

function laddaEnv() {
  for (const fil of ['.env.local', '../../../.env.local']) {
    if (!fs.existsSync(fil)) continue
    for (const rad of fs.readFileSync(fil, 'utf8').split(/\r?\n/)) {
      const i = rad.indexOf('=')
      if (i < 0 || rad.trim().startsWith('#')) continue
      const k = rad.slice(0, i).trim()
      if (!process.env[k]) process.env[k] = rad.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    }
  }
}
laddaEnv()

const arg = (n: string, f?: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const UT = path.resolve(arg('ut', 'qa-helskarm-dator')!)
const BAS = arg('bas', 'http://localhost:3107')!
const SNABB = process.argv.includes('--snabb')
fs.mkdirSync(UT, { recursive: true })
const KONTOFIL = path.join(UT, 'konton.json')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface Konto { epost: string; id: string; cvId?: string }
const lasKonton = (): Konto[] => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : [])
const sparaKonton = (k: Konto[]) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))

const resultat: string[] = []
const kontroll = (ok: boolean, text: string) => {
  resultat.push(`${ok ? 'OK  ' : 'FEL '} ${text}`)
  console.log(`${ok ? 'OK  ' : 'FEL '} ${text}`)
}
const vila = (ms: number) => new Promise((r) => setTimeout(r, ms))

/* ------------------------------------------------------------- konton */

async function skapa() {
  const tid = Date.now()
  const konton = lasKonton()
  const epost = `qa-helskarm-dator-${tid}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({ email: epost, password: `QaHelskarmDator!${tid}`, email_confirm: true, user_metadata: { full_name: 'Märta Söderström-Ångström' } })
  if (error || !data.user) throw new Error(`createUser: ${error?.message}`)
  konton.push({ epost, id: data.user.id })
  sparaKonton(konton)
  const { error: pe } = await sb
    .from('profiles')
    .update({
      full_name: 'Märta Söderström-Ångström',
      onboarding_track: 'cv',
      subscription_tier: 'premium',
      premium_scope: 'allt',
      premium_until: new Date(Date.now() + 2 * 86400000).toISOString(),
    })
    .eq('id', data.user.id)
  if (pe) throw new Error(`profiles: ${pe.message}`)
  const cv = CV_LANGDER.langt
  const { data: rad, error: ce } = await sb
    .from('cv_texts')
    .insert({ user_id: data.user.id, file_name: 'Marta.pdf', original_file_path: '', cv_text: `${cv.personalInfo.fullName}\n${cv.summary}`, structured_data: cv })
    .select('id')
    .single()
  if (ce || !rad) throw new Error(`cv_texts: ${ce?.message}`)
  konton[konton.length - 1].cvId = rad.id
  sparaKonton(konton)
  console.log('SKAPAD', epost, data.user.id)
}

async function radera() {
  const konton = lasKonton()
  const ids = konton.map((k) => k.id).filter(Boolean)
  if (ids.length === 0) return console.log('inga konton')
  for (const tabell of ['cv_texts', 'formatted_cv_downloads', 'user_activities']) {
    const { count } = await sb.from(tabell).select('*', { count: 'exact', head: true }).in('user_id', ids)
    const { error } = await sb.from(tabell).delete().in('user_id', ids)
    console.log(`${tabell}: ${count ?? 0} rader${error ? ' FEL ' + error.message : ' raderade'}`)
  }
  for (const k of konton) {
    const { error } = await sb.auth.admin.deleteUser(k.id)
    console.log(error ? `FEL radera ${k.epost}: ${error.message}` : `RADERAD ${k.epost} (${k.id})`)
  }
}

async function sessionsCookie(epost: string) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost })
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: s, error } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
  const payload =
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
  const namn = `sb-${ref}-auth-token`
  const C = 3200
  if (payload.length <= C) return [{ name: namn, value: payload }]
  const ut: { name: string; value: string }[] = []
  for (let i = 0, n = 0; i < payload.length; i += C, n++) ut.push({ name: `${namn}.${n}`, value: payload.slice(i, i + C) })
  return ut
}

/* ------------------------------------------------------------- sidor */

type Vy = { namn: string; width: number; height: number; deviceScaleFactor: number; isMobile: boolean; hasTouch: boolean }
const DATOR = (b: number, h: number): Vy => ({ namn: `d${b}`, width: b, height: h, deviceScaleFactor: 1, isMobile: false, hasTouch: false })
const PIXEL7: Vy = { namn: 'pixel7', width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const UA_PIXEL7 = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'

async function nySida(browser: Browser, vy: Vy, tema: 'ljus' | 'mork', samtycke = true) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const fel: string[] = []
  page.on('pageerror', (e) => fel.push('js: ' + String(e).slice(0, 200)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 500 && u.startsWith(BAS)) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  if (vy.isMobile) await page.setUserAgent(UA_PIXEL7)
  await page.setViewport(vy)
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema === 'mork' ? 'dark' : 'light' }])
  if (samtycke) await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  return { page, ctx, fel }
}

let ipNr = 10
const nyIp = () => `10.79.${Math.floor(Date.now() / 1000) % 250}.${ipNr++ % 250}`

async function bild(page: Page, namn: string) {
  await page.screenshot({ path: path.join(UT, `${namn}.png`) as `${string}.png` })
}

/** Ett långt CV som PDF att ladda upp, skrivet av Chrome ur mallens HTML. */
async function langPdf(browser: Browser): Promise<string> {
  const fil = path.join(UT, 'Marta-langt-CV.pdf')
  if (fs.existsSync(fil)) return fil
  const { renderaMallHtml } = await import('../src/lib/cv/rendera-mall-html')
  const p = await browser.newPage()
  await p.setContent(renderaMallHtml(CV_LANGDER.langt, 'linne')!.replace(/url\(\/fonts/g, `url(${BAS}/fonts`), { waitUntil: 'networkidle0' })
  await p.pdf({ path: fil, format: 'A4', printBackground: true })
  await p.close()
  return fil
}

const rubrik = (page: Page) => page.$eval('[data-helskarm] [data-helskarm-rubrik]', (e) => (e as HTMLElement).innerText.trim()).catch(() => '')
const helskarmOppen = (page: Page) => page.$('[data-helskarm] [data-helskarm-rubrik]').then(Boolean)

async function oppnaHelskarm(page: Page) {
  await page.waitForSelector('.dok-ark-yta button.top-2[aria-label="Läs i helskärm"]', { timeout: 60000, visible: true })
  await page.evaluate(() => {
    const b = document.querySelector<HTMLButtonElement>('.dok-ark-yta button.top-2[aria-label="Läs i helskärm"]')!
    b.scrollIntoView({ block: 'center' })
  })
  await vila(200)
  await page.click('.dok-ark-yta button.top-2[aria-label="Läs i helskärm"]')
  await page.waitForSelector('[data-helskarm] [data-helskarm-rubrik]', { timeout: 20000 })
  await vila(500)
}

async function vantaSidor(page: Page) {
  await page.waitForSelector('[data-helskarm] ol[data-sidor] img', { timeout: 120000 })
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('[data-helskarm] ol[data-sidor] img')].every((i) => i.complete && i.naturalWidth > 0), { timeout: 30000 })
  await vila(300)
}

const nasta = (namn: string, steg: number) => {
  const i = MALL_KATALOG.findIndex((m) => m.namn === namn)
  return MALL_KATALOG[(i + steg + MALL_KATALOG.length) % MALL_KATALOG.length].namn
}
const mallnamn = (r: string) => r.split(',')[0].trim()

/** Helskärmen: hjälprad, remsa, klick, pilar, Alla-arket, zoom, Esc. */
async function provaHelskarm(page: Page, steg: string, vy: Vy, opt: { flerSidor?: boolean } = {}) {
  const dator = !vy.isMobile
  await oppnaHelskarm(page)
  await bild(page, `${steg}-a-helskarm`)
  // Fokus i dialogen.
  const fokusIDialog = await page.evaluate(() => Boolean(document.activeElement?.closest('[data-helskarm]')))
  kontroll(fokusIDialog, `${steg}: fokus flyttas in i helskärmen`)
  // Cookie-bannern ligger aldrig över helskärmen.
  const banner = await page.evaluate(() => {
    const b = document.querySelector<HTMLElement>('.cookie-banner-container')
    return b ? getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().height > 0 : false
  })
  kontroll(!banner, `${steg}: ingen cookie-banner över helskärmen`)

  // Hjälpraden följer enheten.
  const hjalp = await page.$eval('[data-helskarm] [data-hjalp]', (e) => ({ typ: e.getAttribute('data-hjalp'), text: (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim() })).catch(() => null)
  if (dator) kontroll(hjalp?.typ === 'dator' && !/nyp|svep/i.test(hjalp.text) && /byter mall/.test(hjalp.text) && /Esc/.test(hjalp.text), `${steg}: hjälpraden för mus och tangentbord ("${hjalp?.text}")`)
  else kontroll(hjalp?.typ === 'peka' && /Nyp/.test(hjalp.text), `${steg}: hjälpraden för pekskärm ("${hjalp?.text}")`)

  // Remsan.
  const remsa = await page.evaluate(() => {
    const d = document.querySelector('[data-helskarm]')!
    const r = d.querySelector<HTMLElement>('[data-remsa="dator"]')
    const minis = [...d.querySelectorAll<HTMLElement>('[role=list] button[aria-pressed]')]
    const rullare = r?.querySelector<HTMLElement>('.overflow-x-auto')
    const lista = r?.querySelector<HTMLElement>('[role=list]')
    const lr = lista?.getBoundingClientRect()
    const rr = rullare?.getBoundingClientRect()
    return {
      dator: Boolean(r),
      antal: minis.length,
      bredd: minis[0] ? Math.round(minis[0].getBoundingClientRect().width) : 0,
      rullar: rullare ? rullare.scrollWidth > rullare.clientWidth + 1 : false,
      pilar: d.querySelectorAll('button[aria-label^="Fler mallar"]').length,
      vansterLuft: lr && rr ? Math.round(lr.left - rr.left) : 0,
      hogerLuft: lr && rr ? Math.round(rr.right - lr.right) : 0,
      formater: minis.every((m) => m.querySelector('[data-format]')),
    }
  })
  if (dator) {
    kontroll(remsa.dator && remsa.antal === MALL_KATALOG.length && remsa.bredd === 80, `${steg}: remsan visar alla ${remsa.antal} mallar, ${remsa.bredd} px`)
    kontroll(remsa.rullar ? remsa.pilar === 2 : Math.abs(remsa.vansterLuft - remsa.hogerLuft) <= 4, `${steg}: remsan ${remsa.rullar ? 'rullar med pilar' : `centrerad (${remsa.vansterLuft}/${remsa.hogerLuft} px)`}`)
  } else {
    kontroll(!remsa.dator && remsa.antal >= 3 && remsa.bredd === 64 && remsa.pilar === 0, `${steg}: mobilens remsa oförändrad (${remsa.antal} mallar, ${remsa.bredd} px)`)
  }
  kontroll(remsa.formater, `${steg}: formatbrickor på varje miniatyr i remsan`)

  // Sidorna fyller höjden på datorn.
  await vantaSidor(page)
  const sidor = await page.evaluate(() => {
    const yta = document.querySelector<HTMLElement>('[data-helskarm] .overflow-auto')!
    const ark = document.querySelector<HTMLElement>('[data-helskarm] ol[data-sidor] li > div')!
    const ol = document.querySelector<HTMLElement>('[data-helskarm] ol[data-sidor]')!
    return { b: Math.round(ark.getBoundingClientRect().width), h: Math.round(ark.getBoundingClientRect().height), ytaH: yta.clientHeight, spalter: Number(ol.dataset.spalter), sidor: Number(ol.dataset.sidor), sidled: yta.scrollWidth - yta.clientWidth }
  })
  if (dator) {
    kontroll(sidor.b >= 540 && sidor.b <= 1200, `${steg}: sidan ${sidor.b} px bred (540 till 1200)`)
    if (vy.height >= 1000) kontroll(sidor.h + 58 <= sidor.ytaH + 1, `${steg}: hela sidan och sidnumret ryms i höjd (${sidor.h} + 58 av ${sidor.ytaH} px)`)
    if (opt.flerSidor && vy.width >= 1440) kontroll(sidor.spalter === 2, `${steg}: ${sidor.sidor} sidor bredvid varandra (${sidor.spalter} spalter)`)
  }
  kontroll(sidor.sidled <= 0, `${steg}: ingen sidled vid zoom 1 (${sidor.sidled})`)
  await bild(page, `${steg}-b-sidor`)

  // Klick på en miniatyr.
  const fore = mallnamn(await rubrik(page))
  const mal = await page.evaluate((f) => {
    const b = [...document.querySelectorAll<HTMLButtonElement>('[data-helskarm] [role=list] button[aria-pressed="false"]')].find((x) => !x.getAttribute('aria-label')!.startsWith(f))
    b?.scrollIntoView({ inline: 'center', block: 'nearest' })
    return b?.getAttribute('aria-label')?.split(',')[0] ?? null
  }, fore)
  if (mal) {
    await vila(300)
    const sel = `[data-helskarm] [role=list] button[aria-label^="${mal},"]`
    if (dator) await page.hover(sel)
    if (dator) {
      const hover = await page.$eval(sel, (b) => getComputedStyle(b.querySelector('span')!).borderColor)
      kontroll(Boolean(hover), `${steg}: hover på miniatyren (${hover})`)
    }
    await page.click(sel)
    await vila(600)
    kontroll(mallnamn(await rubrik(page)) === mal, `${steg}: klick på ${mal} byter mall (${await rubrik(page)})`)
  }

  // Piltangenterna (dator).
  if (dator) {
    const a = mallnamn(await rubrik(page))
    await page.keyboard.press('ArrowRight')
    await vila(500)
    const b = mallnamn(await rubrik(page))
    kontroll(b === nasta(a, 1), `${steg}: pil höger byter ${a} till ${b}`)
    await page.keyboard.press('ArrowLeft')
    await vila(500)
    kontroll(mallnamn(await rubrik(page)) === a, `${steg}: pil vänster tillbaka till ${a}`)
  }

  // "Alla N" öppnar arket ovanpå helskärmen; Esc stänger bara arket.
  await page.click('[data-helskarm] button[data-alla]')
  await page.waitForSelector('.dok-ark', { visible: true, timeout: 5000 }).catch(() => undefined)
  await vila(500)
  const ark = await page.evaluate(() => {
    const a = document.querySelector<HTMLElement>('.dok-ark')
    if (!a) return { synligt: false, overst: false, fokus: false }
    const r = a.getBoundingClientRect()
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(80, r.height / 2))
    return { synligt: r.height > 100, overst: Boolean(el && a.contains(el)), fokus: Boolean(document.activeElement && a.contains(document.activeElement)) }
  })
  kontroll(ark.synligt && ark.overst, `${steg}: "Alla ${MALL_KATALOG.length}" öppnar arket ovanpå helskärmen`)
  kontroll(ark.fokus, `${steg}: fokus i Alla-arket`)
  await bild(page, `${steg}-c-alla`)
  await page.keyboard.press('Escape')
  await vila(400)
  kontroll(!(await page.$('.dok-ark')) && (await helskarmOppen(page)), `${steg}: Esc stänger bara Alla-arket, helskärmen står kvar`)
  // Välj en mall i arket.
  await page.click('[data-helskarm] button[data-alla]')
  await page.waitForSelector('.dok-ark', { visible: true, timeout: 5000 })
  await vila(400)
  const valIArket = await page.evaluate((nu) => {
    const b = [...document.querySelectorAll<HTMLButtonElement>('.dok-ark button[aria-pressed="false"]')].find((x) => x.getAttribute('aria-label')?.includes(', P') && !x.getAttribute('aria-label')!.startsWith(nu))
    return b?.getAttribute('aria-label')?.split(',')[0] ?? null
  }, mallnamn(await rubrik(page)))
  if (valIArket) {
    await page.evaluate((n) => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('.dok-ark button[aria-pressed="false"]')].find((x) => x.getAttribute('aria-label')?.startsWith(n + ','))!
      b.scrollIntoView({ block: 'center' })
    }, valIArket)
    await vila(200)
    await page.click(`.dok-ark button[aria-label^="${valIArket},"]`)
    await vila(800)
    kontroll(!(await page.$('.dok-ark')) && (await helskarmOppen(page)) && mallnamn(await rubrik(page)) === valIArket, `${steg}: val av ${valIArket} i Alla-arket stänger arket och byter mall i helskärmen`)
    const fokusVald = await page.evaluate(() => document.activeElement?.getAttribute('aria-pressed') === 'true')
    kontroll(fokusVald, `${steg}: fokus på den valda miniatyren efter valet`)
  } else kontroll(false, `${steg}: hittade ingen mall att välja i arket`)

  // Zoom.
  await vantaSidor(page)
  const bredd = () => page.$eval('[data-helskarm] ol[data-sidor] li > div', (e) => Math.round(e.getBoundingClientRect().width))
  const b0 = await bredd()
  if (dator) {
    await page.click('[data-helskarm] button[data-zoom="in"]')
    await vila(300)
    const b1 = await bredd()
    await page.keyboard.press('+')
    await vila(300)
    const b2 = await bredd()
    const mitt = await page.evaluate(() => {
      const y = document.querySelector<HTMLElement>('[data-helskarm] .overflow-auto')!
      return y.scrollWidth > y.clientWidth ? Math.abs(y.scrollLeft - (y.scrollWidth - y.clientWidth) / 2) < 4 : true
    })
    await bild(page, `${steg}-d-zoom`)
    await page.keyboard.press('-')
    await page.keyboard.press('-')
    await vila(300)
    const b3 = await bredd()
    kontroll(b1 > b0 && b2 > b1 && b3 === b0, `${steg}: zooma in med knappen och plus, ut med minus (${b0}, ${b1}, ${b2}, ${b3})`)
    kontroll(mitt, `${steg}: zoomad sida centrerad i sidled`)
  } else {
    await page.click('[data-helskarm] button[data-zoom="vaxla"]')
    await vila(300)
    const b1 = await bredd()
    await page.click('[data-helskarm] button[data-zoom="vaxla"]')
    await vila(300)
    kontroll(b1 > b0 * 1.7 && (await bredd()) === b0, `${steg}: zoomknappen växlar (${b0}, ${b1})`)
  }

  // Tab stannar i dialogen.
  for (let i = 0; i < 40; i++) await page.keyboard.press('Tab')
  kontroll(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-helskarm]'))), `${steg}: Tab stannar i helskärmen`)

  await page.keyboard.press('Escape')
  await vila(400)
  kontroll(!(await helskarmOppen(page)), `${steg}: Esc stänger helskärmen`)
}

/** Mallytan i vanliga vyn: kolumnen, banden, formatbrickor, fasta raden. */
async function provaMallyta(page: Page, steg: string, vy: Vy) {
  if (vy.isMobile) {
    // Remsans "Alla N" i vanliga vyn.
    await page.evaluate(() => document.querySelector<HTMLElement>('.mallyta button[data-alla]')?.scrollIntoView({ block: 'center' }))
    await vila(300)
    await page.click('.mallyta button[data-alla]')
    await page.waitForSelector('.dok-ark', { visible: true, timeout: 5000 }).catch(() => undefined)
    await vila(400)
    const grupper = await page.$$eval('.dok-ark section', (s) => s.map((x) => ({ namn: x.getAttribute('aria-label'), n: x.querySelectorAll('button[aria-pressed]').length })))
    kontroll(grupper.length > 0 && grupper.every((g) => g.n > 0), `${steg}: Alla-arket utan tomma grupper (${grupper.map((g) => `${g.namn} ${g.n}`).join(', ')})`)
    await bild(page, `${steg}-alla-ark`)
    await page.keyboard.press('Escape')
    await vila(300)
    return
  }
  // Kolumnens "Visa alla".
  await page.evaluate(() => [...document.querySelectorAll<HTMLButtonElement>('aside button')].find((b) => /Visa alla/.test(b.textContent ?? ''))?.click())
  await vila(1200)
  const kolumn = await page.evaluate(() => {
    const aside = document.querySelector('aside')!
    const ovan = [...aside.querySelectorAll<HTMLElement>(':scope > div > .grid button[aria-pressed]')].map((b) => b.getAttribute('aria-label')!.split(',')[0])
    const sektioner = [...aside.querySelectorAll('section')]
    const ids = sektioner.flatMap((s) => [...s.querySelectorAll('button[aria-pressed]')].map((b) => b.getAttribute('aria-label')!.split(',')[0]))
    const h3 = sektioner.map((s) => s.querySelector('h3')!)
    const rull = h3[0]?.closest('.overflow-y-auto') as HTMLElement | null
    // Ytan bakom kolumnen: första förälder utanför rullbehållaren med bakgrund.
    let el: HTMLElement | null = rull?.parentElement ?? null
    let bakom = ''
    while (el) {
      const c = getComputedStyle(el).backgroundColor
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
        bakom = c
        break
      }
      el = el.parentElement
    }
    return {
      ovan,
      grupper: sektioner.map((s) => ({ namn: s.getAttribute('aria-label'), n: s.querySelectorAll('button[aria-pressed]').length })),
      dubbletter: ids.filter((x, i) => ids.indexOf(x) !== i || ovan.includes(x)),
      totalt: ids.length + ovan.length,
      band: h3.map((h) => getComputedStyle(h).backgroundColor),
      bakom,
      brickor: [...aside.querySelectorAll('button[aria-pressed][aria-label]')].every((b) => {
        const f = b.querySelector('[data-format]')?.getAttribute('data-format') ?? ''
        const word = /Word/.test(b.getAttribute('aria-label') ?? '')
        return f.includes('pdf') && f.includes('word') === word
      }),
    }
  })
  kontroll(kolumn.grupper.every((g) => g.n > 0), `${steg}: inga tomma grupper i kolumnen (${kolumn.grupper.map((g) => `${g.namn} ${g.n}`).join(', ')})`)
  kontroll(kolumn.dubbletter.length === 0 && kolumn.totalt === MALL_KATALOG.length, `${steg}: varje mall en gång i kolumnen (${kolumn.totalt}, dubbletter: ${kolumn.dubbletter.join(', ') || 'inga'})`)
  kontroll(kolumn.band.every((b) => b === kolumn.bakom), `${steg}: grupprubrikernas band i ytans färg (${[...new Set(kolumn.band)].join(' ')} mot ${kolumn.bakom})`)
  kontroll(kolumn.brickor, `${steg}: PDF-bricka på alla, W bara på Word-mallarna`)
  await page.evaluate(() => document.querySelector('aside section')?.scrollIntoView({ block: 'center' }))
  await vila(300)
  await bild(page, `${steg}-kolumn`)
  // Kolumnens hover.
  const h = await page.$('aside section button[aria-pressed="false"]')
  if (h) {
    const fore = await h.evaluate((b) => getComputedStyle(b.querySelector('span')!).borderTopColor)
    await h.hover()
    await vila(250)
    const efter = await h.evaluate((b) => getComputedStyle(b.querySelector('span')!).borderTopColor)
    kontroll(fore !== efter, `${steg}: miniatyren byter kant vid hover (${fore} till ${efter})`)
  }
  // Ett val i kolumnen.
  const valKolumn = await page.evaluate(() => {
    const b = document.querySelector<HTMLButtonElement>('aside section button[aria-pressed="false"]')
    const n = b?.getAttribute('aria-label')?.split(',')[0]
    b?.click()
    return n
  })
  await vila(800)
  const radNu = await page.$eval('aside button[aria-pressed="true"][aria-label]', (e) => e.getAttribute('aria-label') ?? '').catch(() => '')
  kontroll(Boolean(valKolumn && radNu.startsWith(valKolumn)), `${steg}: klick i kolumnen byter till ${valKolumn} (${radNu})`)
}

/** Den fasta raden: varje kontroll hel, inget överlappar, ingen dold rullning. */
async function provaFastRad(page: Page, steg: string) {
  const m = await page.evaluate(() => {
    const rad = document.querySelector<HTMLElement>('[data-fast-rad]')!
    const rr = rad.getBoundingClientRect()
    const kontroller = [...rad.querySelectorAll<HTMLElement>('button')].filter((b) => b.offsetParent !== null)
    const fel: string[] = []
    for (const k of kontroller) {
      const r = k.getBoundingClientRect()
      const namn = (k.getAttribute('aria-label') || k.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30)
      if (r.left < rr.left - 1 || r.right > rr.right + 1 || r.right > window.innerWidth) fel.push(`${namn} utanför raden`)
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      if (!el || (!k.contains(el) && el.tagName !== 'NEXTJS-PORTAL')) fel.push(`${namn} täckt av ${el?.tagName}.${(el as HTMLElement)?.className?.toString().slice(0, 30)}`)
      if (k.scrollWidth > k.clientWidth + 2 && !k.querySelector('.truncate')) fel.push(`${namn} klipps`)
    }
    const rullare = [...rad.querySelectorAll<HTMLElement>('.overflow-x-auto')].filter((e) => e.offsetParent !== null)
    for (const r of rullare) if (r.scrollWidth > r.clientWidth + 1) fel.push(`verktygsraden rullar (${r.scrollWidth} > ${r.clientWidth})`)
    return { fel, antal: kontroller.length }
  })
  kontroll(m.fel.length === 0, `${steg}: fasta raden hel, ${m.antal} kontroller${m.fel.length ? ': ' + m.fel.join('; ') : ''}`)
}

/** Pennan vid en rubrik: musen till pennan och klick, sedan Enter med tangentbordet. */
async function provaPenna(page: Page, steg: string, vy: Vy) {
  const sel = '.dok-ark-yta button[aria-label^="Byt rubrik"]'
  const finns = await page.$(sel)
  if (!finns) return kontroll(false, `${steg}: ingen rubrik att trycka på`)
  if (vy.isMobile) {
    // Pekskärm: ingen hovring, trycket på rubriken öppnar arket.
    await page.evaluate((s) => document.querySelector<HTMLElement>(s)!.scrollIntoView({ block: 'center' }), sel)
    await vila(400)
    await page.tap(sel)
    await vila(600)
    const ark = await page.$eval('.dok-ark h2', (h) => (h as HTMLElement).innerText).catch(() => '')
    kontroll(/Rubrik/i.test(ark), `${steg}: tryck på rubriken öppnar rubrikarket ("${ark}")`)
    await page.keyboard.press('Escape')
    await vila(400)
    return
  }
  await page.evaluate((s) => document.querySelector<HTMLElement>(s)!.scrollIntoView({ block: 'center' }), sel)
  await vila(400)
  const r = await finns.boundingBox()
  await page.mouse.move(r!.x + 20, r!.y + r!.height / 2)
  await vila(200)
  const penna = await page.$eval(sel, (b) => {
    const p = b.querySelector('span')
    const r = p?.getBoundingClientRect()
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
  })
  if (!penna) return kontroll(false, `${steg}: pennan syns inte vid hover`)
  // Flytta musen i små steg till pennan.
  await page.mouse.move(penna.x, penna.y, { steps: 12 })
  await vila(150)
  const kvar = await page.$eval(sel, (b) => Boolean(b.querySelector('span')))
  kontroll(kvar, `${steg}: pennan står kvar när musen går till den`)
  await page.mouse.click(penna.x, penna.y)
  await vila(600)
  const ark = await page.$eval('.dok-ark h2', (h) => (h as HTMLElement).innerText).catch(() => '')
  kontroll(/Rubrik/i.test(ark), `${steg}: klick på pennan öppnar rubrikarket ("${ark}")`)
  await page.keyboard.press('Escape')
  await vila(400)
  // Tangentbordet: fokus visar pennan, Enter öppnar.
  await page.focus(sel)
  await vila(150)
  const syns = await page.$eval(sel, (b) => Boolean(b.querySelector('span')))
  await page.keyboard.press('Enter')
  await vila(600)
  const ark2 = await page.$eval('.dok-ark h2', (h) => (h as HTMLElement).innerText).catch(() => '')
  kontroll(syns && /Rubrik/i.test(ark2), `${steg}: fokus visar pennan och Enter öppnar rubrikarket`)
  await page.keyboard.press('Escape')
  await vila(400)
}

/** Titeln på arket: tryck, skriv, spara, och dokumentet visar den nya titeln. */
async function provaTitel(page: Page, steg: string, ny: string): Promise<boolean> {
  const sel = '.dok-ark-yta button[data-huvud="titel"]'
  if (!(await page.$(sel))) {
    kontroll(false, `${steg}: titeln går inte att trycka på`)
    return false
  }
  await page.evaluate((s) => document.querySelector<HTMLElement>(s)!.scrollIntoView({ block: 'center' }), sel)
  await vila(300)
  await page.hover(sel)
  await vila(150)
  const penna = await page.$eval(sel, (b) => Boolean(b.querySelector('span')))
  await page.click(sel)
  await page.waitForSelector('.dok-ark input[data-falt="titel"]', { visible: true, timeout: 5000 })
  await vila(300)
  const fokus = await page.evaluate(() => document.activeElement?.getAttribute('data-falt'))
  kontroll(penna && fokus === 'titel', `${steg}: tryck på titeln öppnar arket med titelfältet i fokus (penna ${penna}, fokus ${fokus})`)
  await bild(page, `${steg}-titel-ark`)
  await page.evaluate(() => {
    const i = document.querySelector<HTMLInputElement>('.dok-ark input[data-falt="titel"]')!
    i.select()
  })
  await page.keyboard.type(ny)
  await page.evaluate(() => [...document.querySelectorAll<HTMLButtonElement>('.dok-ark button')].find((b) => b.innerText.trim() === 'Spara')!.click())
  const ok = await page
    .waitForFunction(
      (t) => {
        const f = document.querySelector<HTMLIFrameElement>('.dok-ark-yta iframe')
        return f?.contentDocument?.querySelector('[data-falt="titel"]')?.textContent?.trim() === t
      },
      { timeout: 30000 },
      ny
    )
    .then(() => true)
    .catch(() => false)
  kontroll(ok, `${steg}: arket visar den nya titeln "${ny}"`)
  return ok
}

async function utloggad(browser: Browser, vy: Vy, tema: 'ljus' | 'mork') {
  const steg = `ut-${vy.namn}-${tema}`
  const { page, ctx, fel } = await nySida(browser, vy, tema, !(vy.namn === 'd1280' && tema === 'ljus'))
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': nyIp() })
  await page.goto(`${BAS}/cv-mallar`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(1500)
  await provaHelskarm(page, `${steg}-1-exempel`, vy)
  await provaMallyta(page, `${steg}-2-mallyta`, vy)
  if (!SNABB || vy.namn === 'd1920') {
    // Uppladdat långt CV: fliken under arket, pennan, titeln, två sidor bredvid varandra.
    const input = await page.$('#ladda-upp input[type=file]')
    await input!.uploadFile(await langPdf(browser))
    await page.waitForFunction(() => document.body.innerText.includes('Vi hittade'), { timeout: 120000 }).catch(() => undefined)
    await vila(3500)
    await page.evaluate(() => document.querySelector('.dok-ark-yta')?.scrollIntoView({ block: 'end' }))
    await vila(500)
    const flik = await page.evaluate(() => {
      const f = document.querySelector<HTMLElement>('[data-sidan2]')
      const a = document.querySelector<HTMLElement>('.dok-ark-yta')!
      const band = document.querySelector<HTMLElement>('[data-band] p')
      if (!f) return null
      const fr = f.getBoundingClientRect()
      const ar = a.getBoundingClientRect()
      const br = band?.getBoundingClientRect()
      const krock = br ? !(br.right <= fr.left || br.left >= fr.right || br.bottom <= fr.top || br.top >= fr.bottom) : false
      return { utanfor: fr.top >= ar.bottom - 0.5, krock, text: f.innerText }
    })
    kontroll(Boolean(flik?.utanfor && !flik.krock), `${steg}: "${flik?.text}" hänger under arket, utanför CV:ts text och utan krock med raden`)
    await bild(page, `${steg}-3-flik`)
    await provaPenna(page, `${steg}-4-penna`, vy)
    await provaTitel(page, `${steg}-5-titel`, 'Lagerchef')
    if (!vy.isMobile) await provaHelskarm(page, `${steg}-6-eget`, vy, { flerSidor: true })
  }
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function inloggad(browser: Browser, k: Konto, vy: Vy, tema: 'ljus' | 'mork', medFil: boolean) {
  const steg = `in-${vy.namn}-${tema}`
  const { page, ctx, fel } = await nySida(browser, vy, tema)
  for (const c of await sessionsCookie(k.epost)) await page.setCookie({ ...c, url: BAS, path: '/' })
  await page.goto(`${BAS}/dashboard/cv-mallar?mall=linne&cv=${k.cvId}`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(3000)
  await provaHelskarm(page, `${steg}-1-mina-mallar`, vy, { flerSidor: true })
  await provaMallyta(page, `${steg}-2-mallyta`, vy)
  if (!vy.isMobile) await provaFastRad(page, `${steg}-3-fastrad`)
  if (medFil) {
    // Titeln följer med till PDF och Word.
    await page.goto(`${BAS}/dashboard/cv-mallar?mall=linne&cv=${k.cvId}`, { waitUntil: 'networkidle2', timeout: 120000 })
    await vila(3000)
    const ny = `Driftchef ${Date.now() % 1000}`
    if (await provaTitel(page, `${steg}-4-titel`, ny)) {
      const sparad = await sb.from('cv_texts').select('structured_data').eq('id', k.cvId!).single()
      kontroll((sparad.data?.structured_data as { personalInfo?: { title?: string } })?.personalInfo?.title === ny, `${steg}: titeln sparad i CV:t`)
      for (const format of ['pdf', 'docx'] as const) {
        await page.evaluate((f) => {
          const knappar = [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] [role=radio]')].filter((b) => b.offsetParent !== null)
          knappar.find((b) => (f === 'pdf' ? /^PDF/ : /^Word/).test((b.getAttribute('aria-label') || b.innerText).trim()))?.click()
        }, format)
        await vila(600)
        const vald = await page.evaluate(() => [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] [role=radio][aria-checked="true"]')].filter((b) => b.offsetParent !== null).map((b) => (b.getAttribute('aria-label') || b.innerText).trim()).join())
        if (!new RegExp(format === 'pdf' ? '^PDF' : '^Word').test(vald)) await bild(page, `${steg}-format-${format}`)
        // Begäran som knappen skickar, upprepad med samma kaka (sidan läser
        // svaret som ström, så puppeteer ser ingen kropp).
        const begaran = page.waitForRequest((r) => r.url().includes('/api/cv/generate-formatted') && r.method() === 'POST', { timeout: 120000 })
        await page.evaluate(() => [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] button')].find((b) => /Ladda ner/.test(b.innerText))!.click())
        const req = await begaran
        const kaka = (await page.cookies()).map((c) => `${c.name}=${c.value}`).join('; ')
        const r = await fetch(req.url(), { method: 'POST', headers: { 'Content-Type': 'application/json', cookie: kaka }, body: req.postData() })
        const buf = Buffer.from(await r.arrayBuffer())
        fs.writeFileSync(path.join(UT, `${steg}-titel.${format}`), buf)
        let text = ''
        if (format === 'pdf') text = (await lasPdfGeometri(buf)).rader.map((x) => x.text).join('\n')
        else {
          const JSZip = (await import('jszip')).default
          try {
            const zip = await JSZip.loadAsync(buf)
            text = (await zip.file('word/document.xml')!.async('string')).replace(/<[^>]+>/g, '')
          } catch {
            text = ''
          }
        }
        kontroll(r.ok && text.includes(ny), `${steg}: nedladdad ${format.toUpperCase()} har titeln "${ny}" (valt format ${vald})`)
        await vila(1500)
        await page.keyboard.press('Escape')
        await vila(500)
      }
    }
  }
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

/** Fasta raden från 1024 till 2560 px, med och utan fotoknapp, låst och olåst Word. */
async function fastaRaden(browser: Browser) {
  const bredder = SNABB ? [1024, 1260, 1440, 1920, 2560] : [1024, 1100, 1200, 1260, 1280, 1300, 1400, 1440, 1500, 1600, 1700, 1800, 1920, 2000, 2200, 2400, 2560]
  for (const tema of ['ljus', 'mork'] as const) {
    for (const mall of ['siluett', 'linne', 'koppar']) {
      const { page, ctx } = await nySida(browser, DATOR(1280, 900), tema)
      await page.setExtraHTTPHeaders({ 'x-forwarded-for': nyIp() })
      await page.goto(`${BAS}/cv-mallar/prova?mall=${mall}`, { waitUntil: 'networkidle2', timeout: 120000 })
      // Ett eget CV ger fotoknappen (utloggad visas den med CV).
      await page.evaluate(() => {
        const n = document.querySelector<HTMLInputElement>('input[placeholder="Ditt namn"]')
        n?.focus()
      })
      await page.keyboard.type('Märta Söderström-Ångström')
      await vila(1500)
      for (const b of bredder) {
        await page.setViewport({ width: b, height: 900 })
        await vila(250)
        await provaFastRad(page, `fastrad-${tema}-${mall}-${b}`)
        if ([1024, 1260, 1440, 2560].includes(b) && tema === 'ljus') {
          await page.evaluate(() => document.querySelector('[data-fast-rad]')?.scrollIntoView({ block: 'end' }))
          await page.screenshot({ path: path.join(UT, `fastrad-${mall}-${b}.png`) as `${string}.png`, clip: await page.$eval('[data-fast-rad]', (e) => { const r = e.getBoundingClientRect(); return { x: 0, y: r.top, width: window.innerWidth, height: r.height } }) })
        }
      }
      await ctx.close()
    }
  }
}

async function klicka() {
  const [k] = lasKonton()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] })
  const vyer = [DATOR(1280, 800), DATOR(1920, 1080), DATOR(2560, 1440), PIXEL7]
  try {
    for (const vy of vyer) {
      for (const tema of ['ljus', 'mork'] as const) {
        if (SNABB && tema === 'mork' && vy.namn !== 'pixel7') continue
        await utloggad(browser, vy, tema).catch((e) => kontroll(false, `ut-${vy.namn}-${tema}: ${(e as Error).message}`))
        if (k) await inloggad(browser, k, vy, tema, vy.namn === 'd1920' && tema === 'ljus').catch((e) => kontroll(false, `in-${vy.namn}-${tema}: ${(e as Error).message}`))
      }
    }
    await fastaRaden(browser).catch((e) => kontroll(false, `fastrad: ${(e as Error).message}`))
  } finally {
    await browser.close()
  }
}

async function main() {
  const lage = process.argv[2]
  if (lage === 'skapa') await skapa()
  else if (lage === 'radera') await radera()
  else if (lage === 'klicka') await klicka()
  else return console.log('skapa | klicka | radera --ut <mapp>')
  if (resultat.length) {
    const fel = resultat.filter((r) => r.startsWith('FEL')).length
    fs.writeFileSync(path.join(UT, `resultat-${lage}.txt`), resultat.join('\n') + `\n\n${resultat.length - fel} av ${resultat.length} OK\n`)
    console.log(`\n${resultat.length - fel} av ${resultat.length} OK`)
    process.exitCode = fel ? 1 : 0
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
