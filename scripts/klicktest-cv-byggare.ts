/**
 * Klicktestet för CV-byggaren "Direkt på arket"
 * (docs/design/skiss-cv-byggare-2026-11-16.html), i riktig Chrome.
 *
 *   npx tsx scripts/klicktest-cv-byggare.ts skapa  --ut <mapp>
 *   npx tsx scripts/klicktest-cv-byggare.ts klicka --ut <mapp> [--bas URL] [--bara gratis|premium|full|upp|kvot]
 *   npx tsx scripts/klicktest-cv-byggare.ts radera --ut <mapp>
 *
 * Tre konton med adresser *@jobbcoach-qa.test, unika per körning:
 *   gratis   nytt gratiskonto utan CV (Pixel 7: hela flödet, sedan uppladdning på dator)
 *   premium  betalande (1440 px: flödet, premiummall och Word)
 *   full     gratis med två CV (spärren i startbladet)
 * Raderingen går bara på id:n skriptet själv skapat (konton.json), och
 * räknar raderna före delete (feedback_testdata_stadning).
 * Skärmdumparna hamnar i --ut, aldrig i git.
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import { NORMALT_CV } from '../src/lib/cv/word/__tests__/fixtures'

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
const UT = path.resolve(arg('ut', 'qa-cv-byggare')!)
const BAS = arg('bas', 'http://localhost:8320')!
const BARA = arg('bara')
fs.mkdirSync(UT, { recursive: true })
const KONTOFIL = path.join(UT, 'konton.json')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type Roll = 'gratis' | 'premium' | 'full'
interface Konto {
  roll: Roll
  epost: string
  id: string
}

async function skapa() {
  const tid = Date.now()
  const konton: Konto[] = []
  for (const roll of ['gratis', 'premium', 'full'] as Roll[]) {
    const epost = `qa-byggare-${roll}-${tid}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email: epost,
      password: `QaByggare!${tid}`,
      email_confirm: true,
      user_metadata: { full_name: 'Sara Holm' },
    })
    if (error || !data.user) throw new Error(`createUser ${roll}: ${error?.message}`)
    const id = data.user.id
    const premium = roll === 'premium'
    const { error: pe } = await sb
      .from('profiles')
      .update({
        full_name: 'Sara Holm',
        phone: '070 123 45 67',
        location: 'Göteborg',
        onboarding_track: 'cv',
        free_cv_exports_used: 0,
        subscription_tier: premium ? 'premium' : 'free',
        premium_scope: premium ? 'allt' : null,
        premium_until: premium ? new Date(Date.now() + 3 * 86400000).toISOString() : null,
      })
      .eq('id', id)
    if (pe) throw new Error(`profiles ${roll}: ${pe.message}`)
    if (roll === 'full') {
      for (const n of [1, 2]) {
        const { error: ce } = await sb.from('cv_texts').insert({
          user_id: id,
          file_name: `Gammalt CV ${n}.pdf`,
          original_file_path: '',
          cv_text: `${NORMALT_CV.personalInfo.fullName}\n${NORMALT_CV.summary}`,
          structured_data: NORMALT_CV,
        })
        if (ce) throw new Error(`cv_texts: ${ce.message}`)
      }
    }
    konton.push({ roll, epost, id })
    console.log('SKAPAD', roll, epost, id)
  }
  fs.writeFileSync(KONTOFIL, JSON.stringify(konton, null, 2))
}

async function radera() {
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) as Konto[]
  const ids = konton.map((k) => k.id)
  for (const tabell of ['cv_texts', 'formatted_cv_downloads', 'user_activities', 'ai_usage_costs', 'cv_analysis_jobs']) {
    const { count } = await sb.from(tabell).select('*', { count: 'exact', head: true }).in('user_id', ids)
    if (!count) {
      console.log(`${tabell}: 0 rader`)
      continue
    }
    const { error } = await sb.from(tabell).delete().in('user_id', ids)
    console.log(`${tabell}: ${count} rader${error ? ' FEL ' + error.message : ' raderade'}`)
  }
  // Uppladdade filer ligger i cvs/users/<user_id>/.
  for (const id of ids) {
    const { data: filer } = await sb.storage.from('cvs').list(`users/${id}`)
    const vagar = (filer ?? []).map((f) => `users/${id}/${f.name}`)
    if (vagar.length) {
      const { error } = await sb.storage.from('cvs').remove(vagar)
      console.log(`cvs/users/${id}: ${vagar.length} filer${error ? ' FEL ' + error.message : ' raderade'}`)
    }
  }
  for (const k of konton) {
    const { error } = await sb.auth.admin.deleteUser(k.id)
    console.log(error ? `FEL radera ${k.epost} (${k.id}): ${error.message}` : `RADERAD ${k.epost} (${k.id})`)
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

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DATOR = { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false }

const resultat: string[] = []
const kontroll = (ok: boolean, text: string) => {
  resultat.push(`${ok ? 'OK  ' : 'FEL '} ${text}`)
  console.log(`${ok ? 'OK  ' : 'FEL '} ${text}`)
}
const vila = (ms: number) => new Promise((r) => setTimeout(r, ms))
let nr = 0
const bild = async (page: Page, namn: string) => {
  nr++
  await page.screenshot({ path: path.join(UT, `${String(nr).padStart(2, '0')}-${namn}.png`) as `${string}.png` })
}

async function vantaPa(page: Page, sel: string, ms = 20000) {
  return page.waitForSelector(sel, { visible: true, timeout: ms }).catch(() => null)
}
async function klickaText(page: Page, borjar: string, inom = 'body') {
  const ok = await page.evaluate(
    (t, inom) => {
      const rot = document.querySelector(inom) ?? document.body
      const el = [...rot.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('button, a')].find(
        (e) => e.innerText.trim().startsWith(t) && !(e as HTMLButtonElement).disabled && e.getBoundingClientRect().width > 0
      )
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    borjar,
    inom
  )
  if (!ok) throw new Error(`hittade ingen knapp "${borjar}"`)
}
async function skriv(page: Page, sel: string, text: string) {
  await page.click(sel, { clickCount: 3 })
  await page.type(sel, text, { delay: 5 })
}
async function vantaFil(mapp: string, slut: string, ms = 90000) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    const f = fs.readdirSync(mapp).find((x) => x.endsWith(slut))
    if (f) return path.join(mapp, f)
    await vila(500)
  }
  return null
}
async function vantaSparat(page: Page) {
  await page.waitForSelector('[data-sparat]', { timeout: 20000 }).catch(() => null)
}
async function cvRader(id: string) {
  const { data } = await sb.from('cv_texts').select('id, file_name, structured_data, section_titles').eq('user_id', id).order('created_at', { ascending: false })
  return data ?? []
}

async function oppna(browser: Browser, k: Konto, vy: typeof PIXEL7 | typeof DATOR, fel: string[], morkt = false) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|posthog|ERR_BLOCKED|402|Failed to load resource|jc-samtycke/i.test(m.text())) fel.push('konsol: ' + m.text().slice(0, process.env.LANG_FEL ? 4000 : 200))
  })
  page.on('pageerror', (e) => fel.push('sidfel: ' + String(e).slice(0, 200)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 500 && u.startsWith(BAS)) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  await page.setViewport(vy)
  if (morkt) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
  for (const c of await sessionsCookie(k.epost)) await page.setCookie({ ...c, url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  const nedMapp = path.join(UT, `ned-${k.roll}-${vy.width}`)
  fs.mkdirSync(nedMapp, { recursive: true })
  const cdp = await browser.target().createCDPSession()
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: nedMapp, browserContextId: (ctx as unknown as { id: string }).id })
  return { ctx, page, nedMapp }
}

/** Ett jobb med Jobbcoachens punkter, via Nästa-luckan. */
async function fyllJobb(page: Page, steg: string, coach: boolean) {
  await klickaText(page, 'Lägg till ett jobb')
  const blad = await vantaPa(page, '#e-titel')
  kontroll(Boolean(blad), `${steg}: erfarenhetsbladet öppnas från Nästa-luckan`)
  kontroll(page.url().includes('ark=erfarenhet'), `${steg}: bladet står i adressen (${new URL(page.url()).search})`)
  await skriv(page, '#e-titel', 'Kundtjänstmedarbetare')
  await skriv(page, '#e-arb', 'Nordvik Service AB')
  await page.select('#e-fran-m', '8')
  await skriv(page, '#e-fran-a', '2022')
  await page.evaluate(() => {
    const cb = [...document.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].find((c) => c.parentElement?.innerText.includes('Pågående'))
    cb?.click()
  })
  // Enter ger en ny rad direkt (Enter-buggen i gamla byggaren).
  await page.click('#e-punkter')
  await page.keyboard.type('Ärenden i telefon och chatt')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  const rader = await page.$eval('#e-punkter', (t) => (t as HTMLTextAreaElement).value.split('\n').length)
  kontroll(rader >= 3, `${steg}: Enter ger nya rader i punkterna (${rader} rader)`)
  if (coach) {
    await page.click('[data-coach-knapp]')
    await vila(300)
    await bild(page, `${steg}-jobbcoach-skriver`)
    const start = Date.now()
    await page.waitForFunction(() => !document.querySelector('[data-coach-knapp][aria-busy="true"]'), { timeout: 12000 }).catch(() => null)
    const tid = Date.now() - start
    const text = await page.$eval('#e-punkter', (t) => (t as HTMLTextAreaElement).value)
    const rad = await page.evaluate(() => document.body.innerText.includes('Jobbcoachen skrev'))
    kontroll(rad && text.split('\n').length >= 2, `${steg}: Skriv punkter åt mig fyller fältet (${tid} ms, ${text.split('\n').length} rader)`)
    kontroll(!/—/.test(text), `${steg}: punkterna saknar tankstreck`)
    await bild(page, `${steg}-jobbcoach-klar`)
  }
  await klickaText(page, 'Spara', '[role=dialog]')
  await vantaSparat(page)
  await vila(1200)
  kontroll(!page.url().includes('ark='), `${steg}: Spara stänger bladet (${new URL(page.url()).search})`)
}

async function fyllUtbildning(page: Page, steg: string) {
  await page.click('[data-avsnitt-knapp="utbildning"]')
  kontroll(Boolean(await vantaPa(page, '#u-utb')), `${steg}: tryck på utbildningsavsnittet öppnar bladet`)
  await skriv(page, '#u-utb', 'Samhällsvetenskapsprogrammet')
  await skriv(page, '#u-skola', 'Polhemsgymnasiet')
  await skriv(page, '#u-fran', '2019')
  await skriv(page, '#u-till', '2022')
  await klickaText(page, 'Spara', '[role=dialog]')
  await vantaSparat(page)
  await vila(1000)
}

async function fyllKompetenser(page: Page, steg: string) {
  await page.click('[data-avsnitt-knapp="kompetenser"]')
  kontroll(Boolean(await vantaPa(page, '#k-falt')), `${steg}: kompetensbladet öppnas`)
  await page.type('#k-falt', 'Zendesk')
  await page.keyboard.press('Enter')
  await page.type('#k-falt', 'Reklamationer, ')
  await klickaText(page, '+ Kundbemötande', '[role=dialog]').catch(() => undefined)
  const chips = await page.$$eval('[role=dialog] li', (l) => l.map((x) => (x as HTMLElement).innerText.trim()).filter(Boolean))
  kontroll(chips.some((c) => c.startsWith('Zendesk')) && chips.some((c) => c.startsWith('Reklamationer')), `${steg}: chipsfältet tar Enter och komma (${chips.slice(0, 5).join(', ')})`)
  await klickaText(page, 'Spara', '[role=dialog]')
  await vantaSparat(page)
  await vila(1000)
}

async function fyllProfil(page: Page, steg: string, coach: boolean) {
  await page.click('[data-avsnitt-knapp="profil"]')
  kontroll(Boolean(await vantaPa(page, '#p-text')), `${steg}: profilbladet öppnas`)
  const rad = await page.evaluate(() => document.body.innerText.includes('Jobbcoachen kan skriva ett förslag utifrån dina jobb'))
  kontroll(rad, `${steg}: profilbladet erbjuder förslaget när ett jobb finns`)
  if (coach) {
    await page.click('[data-coach-knapp]')
    await page.waitForFunction(() => !document.querySelector('[data-coach-knapp][aria-busy="true"]'), { timeout: 12000 }).catch(() => null)
    const t = await page.$eval('#p-text', (x) => (x as HTMLTextAreaElement).value)
    kontroll(t.length > 40, `${steg}: profilförslaget står i fältet (${t.length} tecken)`)
  } else {
    await skriv(page, '#p-text', 'Kundtjänstmedarbetare med vana vid telefon och chatt.')
  }
  await klickaText(page, 'Spara', '[role=dialog]')
  await vantaSparat(page)
  await vila(1000)
}

async function gratisFlode(browser: Browser, k: Konto) {
  const fel: string[] = []
  const steg = 'gratis-pixel7'
  const { ctx, page, nedMapp } = await oppna(browser, k, PIXEL7, fel)
  const t0 = Date.now()
  await page.goto(`${BAS}/dashboard/skapa-cv?fran=mina_cv&steg=3`, { waitUntil: 'networkidle2', timeout: 120000 })
  kontroll(Boolean(await vantaPa(page, '[data-startblad]')), `${steg}: startbladet står över arket (${Date.now() - t0} ms)`)
  kontroll(!page.url().includes('steg='), `${steg}: gamla ?steg= tas bort ur adressen`)
  await bild(page, `${steg}-start`)
  await skriv(page, '[data-start-titel]', 'Kundtjänstmedarbetare')
  await vila(1500)
  await page.click('[data-start-skriv]')
  await vila(1500)
  const spok = await page.$$eval('[data-lagg-till]', (l) => l.map((x) => x.getAttribute('data-lagg-till')))
  kontroll(spok.includes('erfarenhet') && spok.includes('profil'), `${steg}: tomma avsnitt har Lägg till vid rubriken (${spok.join(', ')})`)
  const spokText = await page.evaluate(() => {
    const f = document.querySelector<HTMLIFrameElement>('.dok-ark-yta iframe')
    return f?.contentDocument?.body.innerText ?? ''
  })
  kontroll(spokText.includes('Hur många ärenden du tog emot per dag'), `${steg}: spöktexten följer titeln (kundtjänst)`)
  await bild(page, `${steg}-arket-tomt`)
  kontroll((await cvRader(k.id)).length === 0, `${steg}: ingen CV-rad innan första bladet sparats`)

  await fyllJobb(page, steg, true)
  const rader1 = await cvRader(k.id)
  kontroll(rader1.length === 1, `${steg}: CV-raden skapas vid första sparade bladet (${rader1.length})`)
  kontroll(page.url().includes(`cv=${rader1[0]?.id}`), `${steg}: ?cv= står i adressen`)
  const sd = rader1[0]?.structured_data as { experience?: { position: string; startDate: string; description: string[] }[]; bygge?: { utkast: boolean } }
  kontroll(sd?.experience?.[0]?.position === 'Kundtjänstmedarbetare' && sd?.experience?.[0]?.startDate === '2022-08', `${steg}: jobbet sparas i CVMetadata-format (${sd?.experience?.[0]?.startDate})`)
  kontroll(sd?.bygge?.utkast === true, `${steg}: CV:t är märkt utkast`)
  await bild(page, `${steg}-efter-jobb`)

  // Bakåtgesten stänger bladet, inte byggaren.
  await page.click('[data-avsnitt-knapp="utbildning"]')
  await vantaPa(page, '#u-utb')
  await page.goBack()
  await vila(1000)
  const kvar = await page.$('#u-utb')
  kontroll(!kvar && page.url().includes('/dashboard/skapa-cv'), `${steg}: bakåtgesten stänger bladet och stannar i byggaren`)

  await fyllUtbildning(page, steg)
  await fyllKompetenser(page, steg)
  await bild(page, `${steg}-forslag-profil`)
  const forslag = await page.$eval('[data-forslag]', (e) => e.getAttribute('data-forslag')).catch(() => null)
  kontroll(forslag === 'profil', `${steg}: ett förslag ovanför raden, profilen sist (${forslag})`)
  await fyllProfil(page, steg, true)
  await bild(page, `${steg}-ifyllt`)

  // Mallbyte i remsan och tillbaka till Linne.
  await klickaText(page, 'Björk').catch(() => undefined)
  await vila(2500)
  await bild(page, `${steg}-mall-bjork`)
  await klickaText(page, 'Linne').catch(() => undefined)
  await vila(2500)

  // PDF i Linne, gratis.
  await klickaText(page, 'Spara och ladda ner PDF')
  const pdf = await vantaFil(nedMapp, '.pdf')
  kontroll(Boolean(pdf) && fs.readFileSync(pdf!).subarray(0, 4).toString() === '%PDF', `${steg}: PDF i Linne laddas ner (${pdf ? path.basename(pdf) : 'ingen'})`)
  await vila(1500)
  const final = await page.evaluate(() => document.body.innerText.includes('Klart. Ditt CV är nedladdat.') && document.body.innerText.includes('Analysera ditt CV'))
  kontroll(final, `${steg}: finalen med Analysera ditt CV som nästa steg`)
  await bild(page, `${steg}-final`)
  const rader2 = await cvRader(k.id)
  const sd2 = rader2[0]?.structured_data as { bygge?: { utkast: boolean }; summary?: string }
  await vila(1500)
  const rader3 = await cvRader(k.id)
  kontroll((rader3[0]?.structured_data as { bygge?: { utkast: boolean } })?.bygge?.utkast === false, `${steg}: CV:t märkt klart efter nedladdningen`)
  kontroll(Boolean(sd2?.summary), `${steg}: profilen sparad`)

  // Mina CV visar CV:t, återkomst via ?cv=.
  await page.goto(`${BAS}/dashboard/profil/cv`, { waitUntil: 'networkidle2' })
  kontroll((await page.evaluate(() => document.body.innerText)).includes('CV - Sara Holm'), `${steg}: Mina CV visar CV:t`)
  await bild(page, `${steg}-mina-cv`)
  await page.goto(`${BAS}/dashboard/skapa-cv?cv=${rader3[0].id}`, { waitUntil: 'networkidle2' })
  await vila(1500)
  const start = await page.$('[data-startblad]')
  const iframe = await page.evaluate(() => document.querySelector<HTMLIFrameElement>('.dok-ark-yta iframe')?.contentDocument?.body.innerText ?? '')
  kontroll(!start && iframe.includes('Nordvik Service AB'), `${steg}: återkomst via ?cv= visar arket utan startblad`)
  await bild(page, `${steg}-aterkomst`)
  kontroll(fel.length === 0, `${steg}: inga konsolfel eller 5xx${fel.length ? ': ' + fel.slice(0, 5).join(' | ') : ''}`)
  await ctx.close()

  // Mörkt läge på arket.
  const fel2: string[] = []
  const m = await oppna(browser, k, PIXEL7, fel2, true)
  await m.page.goto(`${BAS}/dashboard/skapa-cv?cv=${rader3[0].id}`, { waitUntil: 'networkidle2' })
  await vila(1500)
  await bild(m.page, 'gratis-pixel7-morkt')
  await m.page.waitForSelector('[data-avsnitt-knapp="erfarenhet"]', { timeout: 15000 })
  await m.page.click('[data-avsnitt-knapp="erfarenhet"]')
  await vila(1200)
  await bild(m.page, 'gratis-pixel7-morkt-blad')
  await m.ctx.close()
}

async function uppladdning(browser: Browser, k: Konto) {
  const fel: string[] = []
  const steg = 'gratis-dator-upp'
  // Andra CV:t kräver bekräftad e-post (befintlig regel i /api/cv/upload).
  await sb.from('profiles').update({ email_verified_at: new Date().toISOString() }).eq('id', k.id)
  const { ctx, page } = await oppna(browser, k, DATOR, fel)
  // En test-PDF med ett påhittat CV.
  const pdfVag = path.join(UT, 'test-cv.pdf')
  if (!fs.existsSync(pdfVag)) {
    const p2 = await ctx.newPage()
    await p2.setContent(
      `<h1>Erik Lindberg</h1><p>erik.lindberg@example.com · 070 765 43 21 · Uppsala</p><h2>Arbetslivserfarenhet</h2><p><b>Lagerarbetare</b>, Logistikbolaget AB, 2019 till 2024</p><ul><li>Plockade order med truck</li><li>Ansvarade för inleverans</li></ul><h2>Utbildning</h2><p>Fordonsprogrammet, Uppsala, 2016 till 2019</p><h2>Kompetenser</h2><p>Truckkort A och B, Lagersystem</p>`
    )
    await p2.pdf({ path: pdfVag, format: 'A4' })
    await p2.close()
  }
  await page.goto(`${BAS}/dashboard/skapa-cv`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vantaPa(page, '[data-startblad]')
  await bild(page, `${steg}-start`)
  await page.click('[data-start-ladda]')
  const input = await page.waitForSelector('[data-startblad] input[type=file]', { timeout: 15000 })
  await (input as unknown as { uploadFile: (p: string) => Promise<void> }).uploadFile(pdfVag)
  await vila(800)
  await page.evaluate(() => {
    const cb = document.querySelector<HTMLInputElement>('[data-startblad] input[type=checkbox]')
    cb?.click()
  })
  await bild(page, `${steg}-samtycke`)
  await klickaText(page, 'Ladda upp CV', '[data-startblad]')
  await page.waitForFunction(() => location.search.includes('cv='), { timeout: 90000 }).catch(() => null)
  await vila(4000)
  const iframe = await page.evaluate(() => document.querySelector<HTMLIFrameElement>('.dok-ark-yta iframe')?.contentDocument?.body.innerText ?? '')
  kontroll(iframe.includes('Logistikbolaget') || iframe.includes('Lagerarbetare'), `${steg}: uppladdat CV fyller arket`)
  kontroll(!page.url().includes('upp=1'), `${steg}: engångsparametrarna tas bort`)
  await bild(page, `${steg}-arket`)
  const rad = (await cvRader(k.id)).find((r) => (r.structured_data as { bygge?: unknown })?.bygge)
  kontroll(Boolean(rad), `${steg}: uppladdat CV sparat i CVMetadata-form med bygge`)
  kontroll(fel.length === 0, `${steg}: inga konsolfel eller 5xx${fel.length ? ': ' + fel.slice(0, 5).join(' | ') : ''}`)
  await ctx.close()
}

async function premiumFlode(browser: Browser, k: Konto) {
  const fel: string[] = []
  const steg = 'premium-1440'
  const { ctx, page, nedMapp } = await oppna(browser, k, DATOR, fel)
  const t0 = Date.now()
  await page.goto(`${BAS}/dashboard/skapa-cv?mall=linne`, { waitUntil: 'networkidle2', timeout: 120000 })
  kontroll(Boolean(await vantaPa(page, '[data-startblad]')), `${steg}: startbladet centrerat (${Date.now() - t0} ms)`)
  await bild(page, `${steg}-start`)
  await page.click('[data-start-skriv]')
  await vila(1500)
  await bild(page, `${steg}-arket-tomt`)
  await fyllJobb(page, steg, false)
  // Dockat blad: Esc stänger och fokus går tillbaka.
  await page.click('[data-avsnitt-knapp="utbildning"]')
  const dockad = await vantaPa(page, '[data-bygg-blad]')
  kontroll(Boolean(dockad), `${steg}: bladet dockas till höger på dator`)
  await bild(page, `${steg}-dockat-blad`)
  await page.keyboard.press('Escape')
  await vila(800)
  kontroll(!(await page.$('[data-bygg-blad]')), `${steg}: Esc stänger det dockade bladet`)
  await fyllUtbildning(page, steg)
  await bild(page, `${steg}-miniminiva`)

  // Premiummall i kolumnen, Word.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll<HTMLButtonElement>('aside button')].find((x) => x.innerText.includes('Koppar') && x.getBoundingClientRect().width > 0)
    b?.click()
  })
  await vila(3000)
  await bild(page, `${steg}-premiummall`)
  await page.evaluate(() => {
    const w = [...document.querySelectorAll<HTMLButtonElement>('[role=radio]')].find((b) => b.innerText.includes('Word') && b.getBoundingClientRect().width > 0)
    w?.click()
  })
  await vila(500)
  await klickaText(page, 'Spara och ladda ner Word')
  const docx = await vantaFil(nedMapp, '.docx')
  kontroll(Boolean(docx) && fs.readFileSync(docx!).subarray(0, 2).toString() === 'PK' && docx!.includes('koppar'), `${steg}: Word i premiummallen laddas ner som Premium (${docx ? path.basename(docx) : 'ingen'})`)
  await vila(1500)
  await bild(page, `${steg}-final`)
  kontroll(fel.length === 0, `${steg}: inga konsolfel eller 5xx${fel.length ? ': ' + fel.slice(0, 5).join(' | ') : ''}`)
  await ctx.close()
}

async function fullFlode(browser: Browser, k: Konto) {
  const fel: string[] = []
  const steg = 'full-pixel7'
  const { ctx, page } = await oppna(browser, k, PIXEL7, fel)
  await page.goto(`${BAS}/dashboard/skapa-cv`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vantaPa(page, '[data-startblad]')
  const text = await page.evaluate(() => document.querySelector('[data-startblad]')?.textContent ?? '')
  kontroll(text.includes('Du har två sparade CV') && !text.includes('Skriv från början'), `${steg}: spärren för antal CV står i startbladet`)
  await bild(page, `${steg}-sparr`)
  kontroll(fel.length === 0, `${steg}: inga konsolfel eller 5xx${fel.length ? ': ' + fel.slice(0, 5).join(' | ') : ''}`)
  await ctx.close()
}

/** Jobbcoachens kvot slut: PaywallCard i bladet, knappen kvar som spärrad. */
async function kvotFlode(browser: Browser, k: Konto) {
  const fel: string[] = []
  const steg = 'gratis-pixel7-kvot'
  const rader = Array.from({ length: 12 }, () => ({
    user_id: k.id,
    feature_name: 'cv_bygg_punkter',
    endpoint: '/api/cv/bygg/forslag',
    ai_model: 'qa',
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    cost_usd: 0,
    cost_sek: 0,
    metadata: { qa: true },
  }))
  const { error } = await sb.from('ai_usage_costs').insert(rader)
  kontroll(!error, `${steg}: dagens tolv förslag förbrukade (${error?.message ?? 'ok'})`)
  const cv = (await cvRader(k.id)).find((r) => (r.structured_data as { experience?: unknown[] })?.experience?.length)
  const { ctx, page } = await oppna(browser, k, PIXEL7, fel)
  await page.goto(`${BAS}/dashboard/skapa-cv?cv=${cv?.id}&ark=erfarenhet:0`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vantaPa(page, '[data-coach-knapp]')
  await page.click('[data-coach-knapp]')
  await page.waitForFunction(() => document.body.innerText.includes('Dagens förslag från Jobbcoachen är använda'), { timeout: 15000 }).catch(() => null)
  const text = await page.evaluate(() => document.body.innerText)
  const sparrad = await page.$eval('[data-coach-knapp]', (b) => (b as HTMLButtonElement).disabled).catch(() => false)
  kontroll(text.includes('Dagens förslag från Jobbcoachen är använda') && sparrad, `${steg}: PaywallCard i bladet och knappen spärrad`)
  await bild(page, `${steg}-paywall`)
  kontroll(fel.length === 0, `${steg}: inga konsolfel eller 5xx${fel.length ? ': ' + fel.slice(0, 5).join(' | ') : ''}`)
  await ctx.close()
}

async function klicka() {
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) as Konto[]
  const k = (r: Roll) => konton.find((x) => x.roll === r)!
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
  try {
    if (!BARA || BARA === 'full') await fullFlode(browser, k('full'))
    if (!BARA || BARA === 'gratis') await gratisFlode(browser, k('gratis'))
    if (!BARA || BARA === 'upp') await uppladdning(browser, k('gratis'))
    if (!BARA || BARA === 'premium') await premiumFlode(browser, k('premium'))
    if (!BARA || BARA === 'kvot') await kvotFlode(browser, k('gratis'))
  } catch (e) {
    kontroll(false, `avbrutet: ${(e as Error).message}`)
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, `resultat${BARA ? '-' + BARA : ''}.txt`), resultat.join('\n'))
  }
}

const cmd = process.argv[2]
;(cmd === 'skapa' ? skapa() : cmd === 'radera' ? radera() : cmd === 'klicka' ? klicka() : Promise.reject(new Error('skapa | klicka | radera'))).catch((e) => {
  console.error(e)
  process.exit(1)
})
