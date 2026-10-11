// scripts/qa-rummen-vag3b.mjs
// Klicktest av våg 3b (passflödet och resultatskärmarna) i riktig Chrome mot
// förhandsvisningen /dashboard/tester/forhandsvisning-pass (fixturer ur
// riktiga V7-frågor; migreringarna för testmotorn är inte körda i prod, så
// /api/traning går inte att köra mot prod-databasen ännu).
//
//   node scripts/qa-rummen-vag3b.mjs --port 5233             # allt
//   node scripts/qa-rummen-vag3b.mjs --port 5233 --bara ramar
//   node scripts/qa-rummen-vag3b.mjs --radera                # radera kontot
//
// Kräver en server på porten där förhandsvisningen finns: next dev, eller
// ett produktionsbygge startat med TRANING_FORHANDSVISNING=1.
//
// Delar (--bara):
//   ramar   varje ram (P1, P2, P3, P4, S1, M0, M1, M1 betalande, O1, K1,
//           uppvärmning) på Pixel 7 (412 px, adressfältet emulerat) och 1280,
//           ljust och mörkt. Skärmdump per ram. Kontroller: primär handling
//           (kopparknappen) inom viewport utan scroll, inga konsolfel, inga
//           4xx/5xx, ingen horisontell scroll, inget rött i passet, koppar som
//           text på väggen bara som koppar-ljus, axeltexten 11 px i DOM,
//           tidsraden byter inte färg.
//   klick   passet från P1 till P4 med tumtryck (touchscreen.tap) på 412 px:
//           fel svar, regeln, nästa, "Vet inte, visa regeln", sista frågan,
//           resultatet, genomgången. En skärmdump per steg. Kontroll att
//           sidan aldrig laddas om mellan frågorna (navigeringar räknas).
//   matning mätningen M0 till M1: ingen regel under tiden, resultatet med
//           betalväggen.
//   uppv    uppvärmningen: tre frågor, ingen tidsrad, klar-vyn.
//   reducerad prefers-reduced-motion: resultatet står i sluttillståndet direkt.
//
// Kontot qa-rummen-3b-*@jobbcoach-qa.test skapas med id och raderas med id
// (feedback_testdata_stadning). Antalet rader räknas före varje delete.
//
// Resultat: docs/qa/rummen/vag-3b/ (skärmdumpar) och resultat.json.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

function arg(namn, fallback) {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const flagga = (namn) => process.argv.includes('--' + namn)

const PORT = arg('port', '5233')
const BAS = `http://localhost:${PORT}`
const BARA = arg('bara') ? arg('bara').split(',') : null
const UT = path.resolve(arg('ut', 'docs/qa/rummen/vag-3b'))
const KONTOFIL = path.resolve('scripts/.qa-rummen-3b-konton.json')
fs.mkdirSync(UT, { recursive: true })
const kor = (del) => !BARA || BARA.includes(del)

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p))
if (!CHROME) throw new Error('Hittade ingen Chrome')

const PIXEL = {
  // Pixel 7 med Chromes adressfält framme: 915 px skärm, cirka 56 px fält.
  viewport: { width: 412, height: 915 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
// Adressfältet ligger redan i viewportens höjd ovan (fixed-skalen följer den synliga ytan).
const ADRESSFALT = 0

const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /Download the React DevTools/i, /\[Fast Refresh\]/i, /\[HMR\]/i, /Invalid source map/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

/* ------------------------------------------------------------------ konto */

async function skapaKonto() {
  if (fs.existsSync(KONTOFIL)) return JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  const ts = Date.now()
  const email = `qa-rummen-3b-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaRummen3b!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Andersson', password_set: true },
  })
  if (error) throw new Error(error.message)
  const id = data.user.id
  const k = { email, id }
  fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
  await vanta(600)
  const { error: pErr } = await sb.from('profiles').upsert({ id, email, full_name: 'Anna Andersson', email_verified_at: new Date().toISOString() })
  if (pErr) throw new Error('profil: ' + pErr.message)
  console.log('skapade', email, id)
  return k
}

async function raderaKonto() {
  if (!fs.existsSync(KONTOFIL)) return console.log('inget konto att radera')
  const k = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  for (const t of ['logic_test_v4_sessions', 'user_activities', 'onboarding_progress', 'scheduled_emails', 'email_schedule', 'email_log', 'user_ui_flags', 'notifications', 'premium_grants']) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
    if (error) continue
    if (count) {
      const { error: dErr } = await sb.from(t).delete().eq('user_id', k.id)
      console.log(`  ${t}: ${count} rader ${dErr ? 'FEL ' + dErr.message : 'raderade'}`)
    }
  }
  const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
  await sb.from('profiles').delete().eq('id', k.id)
  const { error } = await sb.auth.admin.deleteUser(k.id)
  console.log(`raderade ${k.email} (profiles: ${pc ?? 0}) ${error ? error.message : 'ok'}`)
  fs.unlinkSync(KONTOFIL)
}

/* ----------------------------------------------------------------- sidan */

const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
let payload = null
async function payloadFor(email) {
  if (payload) return payload
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await sb.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
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

async function nySida(browser, { form, system, email, reducerad = false }) {
  const page = await browser.newPage()
  if (form === 'pixel7') await page.emulate(PIXEL)
  else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: system },
    { name: 'prefers-reduced-motion', value: reducerad ? 'reduce' : 'no-preference' },
  ])
  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      localStorage.removeItem('tema')
    } catch {}
  })
  const logg = { konsol: [], http: [], navigeringar: 0 }
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const t = m.text()
      if (!BRUS.some((r) => r.test(t))) logg.konsol.push(t.slice(0, Number(process.env.KONSOL_LANGD ?? 300)))
    }
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 160)}`)
  })
  page.on('framenavigated', (f) => {
    if (f === page.mainFrame()) logg.navigeringar++
  })
  return { page, logg }
}

async function oppna(page, ram, extra = '') {
  await page.goto(`${BAS}/dashboard/tester/forhandsvisning-pass?ram=${ram}${extra}`, { waitUntil: 'networkidle0', timeout: 90000 })
  await page.waitForSelector('[data-pass-shell], [data-resultat], [data-kvitto]', { timeout: 30000 })
  // Utvecklarlägets N-märke ligger annars i varje skärmdump.
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  // Mobil: rulla bodyn ett steg för att få fram adressfältets beteende (som i 1b).
  await page.evaluate(() => window.scrollTo(0, 1))
  await vanta(1500)
}

/** Kontrollerna per vy. Körs i sidan. */
async function kontroll(page, form) {
  return page.evaluate(
    (form, ADRESSFALT) => {
      const synligHojd = innerHeight - (form === 'pixel7' ? ADRESSFALT : 0)
      const knappar = [...document.querySelectorAll('.knapp-primar')].filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })
      const primar = knappar.map((el) => {
        const r = el.getBoundingClientRect()
        return { text: el.textContent.trim().slice(0, 60), inomViewport: r.top >= 0 && r.bottom <= synligHojd, bottom: Math.round(r.bottom) }
      })
      // Rött: --fel får inte användas i passet.
      const fel = getComputedStyle(document.documentElement).getPropertyValue('--fel').trim().toLowerCase()
      const rott = [...document.querySelectorAll('[data-pass-shell] *, [data-resultat] *')].filter((el) => {
        const s = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        if (r.width === 0) return false
        return [s.color, s.borderTopColor, s.backgroundColor].some((c) => {
          const m = c.match(/\d+/g)
          if (!m || !fel.startsWith('#')) return false
          const hex = '#' + m.slice(0, 3).map((x) => Number(x).toString(16).padStart(2, '0')).join('')
          return hex === fel
        })
      }).length
      // Kopparfärgad text på väggen ska vara koppar-ljus.
      const koppar = getComputedStyle(document.documentElement).getPropertyValue('--koppar').trim()
      const hexFor = (c) => {
        const m = c.match(/\d+/g)
        return m ? '#' + m.slice(0, 3).map((x) => Number(x).toString(16).padStart(2, '0')).join('').toUpperCase() : ''
      }
      const kopparTextPaVagg = [...document.querySelectorAll('.vagg *')].filter((el) => {
        if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false
        return hexFor(getComputedStyle(el).color) === koppar.toUpperCase()
      }).length
      // Axeltext: 11 px eller mer.
      const axel = [...document.querySelectorAll('.vagg span, .vagg figcaption span, figcaption span')]
        .filter((el) => el.textContent.trim() && el.getBoundingClientRect().width > 0)
        .map((el) => parseFloat(getComputedStyle(el).fontSize))
      const minstaText = axel.length ? Math.min(...axel) : null
      const tidsrad = document.querySelector('[role=progressbar] i')
      return {
        primar,
        antalPrimar: primar.length,
        rott,
        kopparTextPaVagg,
        minstaText,
        tidsradFarg: tidsrad ? getComputedStyle(tidsrad).backgroundColor : null,
        horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      }
    },
    form,
    ADRESSFALT
  )
}

async function skarmdump(page, namn) {
  const fil = path.join(UT, `${namn}.png`)
  await page.screenshot({ path: fil, fullPage: false })
  return path.relative(process.cwd(), fil).split(path.sep).join('/')
}

/* ------------------------------------------------------------------ delar */

const resultat = { datum: new Date().toISOString(), bas: BAS, ramar: [], klick: [], fel: [] }

async function delRamar(browser, k) {
  const ALLA = ['P1', 'P2', 'P3', 'P4', 'S1', 'M0', 'M1', 'M1&betalande=1', 'O1', 'K1', 'uppvarmning']
  const RAMAR = arg('ramar') ? ALLA.filter((r) => arg('ramar').split(',').includes(r.split('&')[0])) : ALLA
  const FORMER = arg('former') ? arg('former').split(',') : ['pixel7', 'desktop']
  const SYSTEM = arg('system') ? arg('system').split(',') : ['light', 'dark']
  for (const form of FORMER) {
    for (const system of SYSTEM) {
      const { page, logg } = await nySida(browser, { form, system, email: k.email })
      for (const ram of RAMAR) {
        const [namn, extra] = ram.split('&')
        await oppna(page, namn, extra ? '&' + extra : '')
        const kon = await kontroll(page, form)
        const fil = await skarmdump(page, `ram-${namn}${extra ? '-betalande' : ''}-${form}-${system === 'dark' ? 'morkt' : 'ljust'}`)
        // Resultatskärmarna: en dump till längst ner.
        let filBotten = null
        if (['P4', 'S1', 'M1', 'O1'].includes(namn)) {
          await page.evaluate(() => {
            const m = document.querySelector('[data-resultat] main')
            if (m) m.scrollTop = m.scrollHeight
          })
          await vanta(400)
          filBotten = await skarmdump(page, `ram-${namn}${extra ? '-betalande' : ''}-${form}-${system === 'dark' ? 'morkt' : 'ljust'}-botten`)
        }
        const rad = { ram: ram.replace('&', ' '), form, system, fil, filBotten, ...kon, konsol: [...logg.konsol], http: [...logg.http] }
        logg.konsol.length = 0
        logg.http.length = 0
        resultat.ramar.push(rad)
        const problem = []
        if (kon.antalPrimar > 1) problem.push(`${kon.antalPrimar} kopparknappar`)
        if (kon.primar.some((p) => !p.inomViewport)) problem.push('kopparknappen utanför viewport')
        if (kon.rott) problem.push(`rött på ${kon.rott} element`)
        if (kon.kopparTextPaVagg) problem.push(`ren koppar som text på väggen (${kon.kopparTextPaVagg})`)
        if (kon.minstaText != null && kon.minstaText < 11) problem.push(`text ${kon.minstaText} px`)
        if (kon.horisontellScroll) problem.push('horisontell scroll')
        if (rad.konsol.length) problem.push(`konsolfel: ${rad.konsol.join(' | ')}`)
        if (rad.http.length) problem.push(`http: ${rad.http.join(' | ')}`)
        if (problem.length) resultat.fel.push(`${rad.ram} ${form} ${system}: ${problem.join('; ')}`)
        console.log(`${rad.ram.padEnd(16)} ${form.padEnd(8)} ${system.padEnd(5)} primär ${kon.antalPrimar} ${problem.length ? 'PROBLEM ' + problem.join('; ') : 'ok'}`)
      }
      await page.close()
    }
  }
}

async function tumtryck(page, selector) {
  const el = await page.waitForSelector(selector, { visible: true, timeout: 15000 })
  const box = await el.boundingBox()
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
}

/** Tryck på ett alternativ: rätt (data-ratt-index lärs ur fixturen via regeln) eller ett givet index. */
async function valjAlternativ(page, index) {
  const knappar = await page.$$('[role=radiogroup] button[role=radio]')
  const box = await knappar[index].boundingBox()
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
}

async function knappMedText(page, text) {
  return page.evaluateHandle((t) => [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim().startsWith(t)) ?? null, text)
}

async function tryckText(page, text) {
  const h = await knappMedText(page, text)
  const el = h.asElement()
  if (!el) throw new Error(`hittade inte "${text}"`)
  const box = await el.boundingBox()
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
}

async function delKlick(browser, k) {
  for (const system of ['light', 'dark']) {
    const tema = system === 'dark' ? 'morkt' : 'ljust'
    const { page, logg } = await nySida(browser, { form: 'pixel7', system, email: k.email })
    const steg = []
    const dump = async (namn, extra = {}) => {
      const fil = await skarmdump(page, `klick-pass-${tema}-${String(steg.length + 1).padStart(2, '0')}-${namn}`)
      const kon = await kontroll(page, 'pixel7')
      steg.push({ namn, fil, ...kon, ...extra })
      return kon
    }
    await oppna(page, 'P1')
    const navStart = logg.navigeringar
    await dump('p1-fraga-3')
    // Ett fel svar: det första alternativet som inte är rätt. Rätt avslöjas efter trycket.
    await valjAlternativ(page, 0)
    await page.waitForSelector('.regelpanel', { timeout: 15000 })
    await vanta(400)
    const efterSvar = await page.evaluate(() => ({
      dim: document.querySelectorAll('[role=radiogroup] button.opacity-\\[\\.38\\]').length,
      alla: document.querySelectorAll('[role=radiogroup] button').length,
      rad: document.querySelector('.regelpanel p')?.textContent ?? '',
    }))
    await dump('p2-regeln', efterSvar)
    await tryckText(page, 'Nästa fråga')
    await page.waitForSelector('[role=radiogroup] button:not([disabled])', { timeout: 15000 })
    await vanta(300)
    await dump('fraga-4')
    // "Vet inte, visa regeln" räknas som fel.
    await tryckText(page, 'Vet inte, visa regeln')
    await page.waitForSelector('.regelpanel', { timeout: 15000 })
    await vanta(300)
    const vetInte = await page.evaluate(() => document.querySelector('.regelpanel p')?.textContent ?? '')
    await dump('vet-inte-regeln', { rad: vetInte })
    // Resten: svara med alternativ 1 och gå vidare tills resultatet.
    for (let i = 0; i < 12; i++) {
      const klar = await page.evaluate(() => !!document.querySelector('[data-resultat]'))
      if (klar) break
      const harRegel = await page.evaluate(() => !!document.querySelector('.regelpanel'))
      if (harRegel) {
        const visa = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Visa resultatet'))
        if (visa) await dump('p3-sista-fragan')
        await tryckText(page, visa ? 'Visa resultatet' : 'Nästa fråga')
        await vanta(500)
        continue
      }
      await valjAlternativ(page, 1)
      await page.waitForSelector('.regelpanel, [data-resultat]', { timeout: 15000 })
      await vanta(300)
    }
    await page.waitForSelector('[data-resultat]', { timeout: 20000 })
    await vanta(1600)
    await dump('p4-resultatet')
    await page.evaluate(() => {
      const m = document.querySelector('[data-resultat] main')
      if (m) m.scrollTop = m.scrollHeight
    })
    await vanta(400)
    await dump('p4-resultatet-botten')
    // Genomgången via kopparknappen.
    const genomga = await page.evaluate(() => document.querySelector('.knapp-primar')?.textContent?.trim() ?? '')
    await tumtryck(page, '.knapp-primar')
    await page.waitForSelector('[data-pass-shell] .regelpanel', { timeout: 15000 })
    await vanta(400)
    await dump('genomgangen', { knapp: genomga })
    await tryckText(page, 'Tillbaka till resultatet').catch(() => {})
    const navigeringar = logg.navigeringar - navStart
    resultat.klick.push({ flode: 'pass', system, steg, navigeringar, konsol: [...logg.konsol], http: [...logg.http] })
    if (navigeringar > 0) resultat.fel.push(`klick pass ${system}: sidan laddades om ${navigeringar} gånger mellan frågorna`)
    if (logg.konsol.length) resultat.fel.push(`klick pass ${system}: konsolfel ${logg.konsol.join(' | ')}`)
    console.log(`klick pass ${system}: ${steg.length} steg, navigeringar ${navigeringar}`)
    await page.close()
  }
}

async function delMatning(browser, k) {
  const { page, logg } = await nySida(browser, { form: 'pixel7', system: 'light', email: k.email })
  const steg = []
  await oppna(page, 'M0')
  steg.push({ namn: 'm0-fraga-1', fil: await skarmdump(page, 'klick-matning-01-fraga-1') })
  let regelUnderTiden = 0
  for (let i = 0; i < 10; i++) {
    if (await page.evaluate(() => !!document.querySelector('[data-resultat]'))) break
    const knappar = await page.$$('[role=radiogroup] button[role=radio]:not([disabled])')
    if (!knappar.length) {
      await vanta(300)
      continue
    }
    const box = await knappar[2].boundingBox()
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
    await vanta(450)
    if (await page.evaluate(() => !!document.querySelector('.regelpanel'))) regelUnderTiden++
    if (i === 0) steg.push({ namn: 'm0-fraga-2', fil: await skarmdump(page, 'klick-matning-02-fraga-2') })
  }
  await page.waitForSelector('[data-resultat]', { timeout: 20000 })
  await vanta(1600)
  steg.push({ namn: 'm1', fil: await skarmdump(page, 'klick-matning-03-m1'), ...(await kontroll(page, 'pixel7')) })
  resultat.klick.push({ flode: 'matning', steg, regelUnderTiden, navigeringar: logg.navigeringar - 1, konsol: [...logg.konsol] })
  if (regelUnderTiden) resultat.fel.push(`mätningen visade regeln under tiden (${regelUnderTiden})`)
  console.log(`klick mätning: regel under tiden ${regelUnderTiden}`)
  await page.close()
}

async function delUppvarmning(browser, k) {
  const { page, logg } = await nySida(browser, { form: 'pixel7', system: 'light', email: k.email })
  const steg = []
  await oppna(page, 'uppvarmning')
  const tidsrad = await page.evaluate(() => !!document.querySelector('[role=progressbar]'))
  steg.push({ namn: 'fraga-1', fil: await skarmdump(page, 'klick-uppvarmning-01-fraga-1'), tidsrad })
  for (let i = 0; i < 3; i++) {
    await valjAlternativ(page, 0)
    await page.waitForSelector('.regelpanel', { timeout: 15000 })
    await vanta(300)
    steg.push({ namn: `svar-${i + 1}`, fil: await skarmdump(page, `klick-uppvarmning-0${i + 2}-svar-${i + 1}`) })
    await tryckText(page, i === 2 ? 'Klar' : 'Nästa fråga')
    await vanta(400)
  }
  steg.push({ namn: 'klar', fil: await skarmdump(page, 'klick-uppvarmning-05-klar') })
  resultat.klick.push({ flode: 'uppvarmning', steg, konsol: [...logg.konsol] })
  if (tidsrad) resultat.fel.push('uppvärmningen har en tidsrad')
  console.log(`klick uppvärmning: tidsrad ${tidsrad}`)
  await page.close()
}

async function delReducerad(browser, k) {
  const { page } = await nySida(browser, { form: 'pixel7', system: 'light', email: k.email, reducerad: true })
  await oppna(page, 'P4')
  await vanta(50)
  const opacitet = await page.evaluate(() => [...document.querySelectorAll('.steg')].map((e) => getComputedStyle(e).opacity))
  const fil = await skarmdump(page, 'reducerad-rorelse-P4')
  resultat.klick.push({ flode: 'reducerad', fil, opacitet })
  if (opacitet.some((o) => o !== '1')) resultat.fel.push(`reducerad rörelse: stegen står inte i sluttillståndet (${opacitet.join(',')})`)
  console.log('reducerad rörelse', opacitet.join(','))
  await page.close()
}

/* ------------------------------------------------------------------- kör */

if (flagga('radera')) {
  await raderaKonto()
  process.exit(0)
}

const k = await skapaKonto()
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
try {
  if (kor('ramar')) await delRamar(browser, k)
  if (kor('klick')) await delKlick(browser, k)
  if (kor('matning')) await delMatning(browser, k)
  if (kor('uppv')) await delUppvarmning(browser, k)
  if (kor('reducerad')) await delReducerad(browser, k)
} finally {
  await browser.close()
  const fil = path.join(UT, BARA ? `resultat-${BARA.join('-')}.json` : 'resultat.json')
  fs.writeFileSync(fil, JSON.stringify(resultat, null, 2))
  console.log(`\n${resultat.fel.length} problem. Resultat i ${path.relative(process.cwd(), fil)}`)
  for (const f of resultat.fel) console.log(' -', f)
}
