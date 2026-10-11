// scripts/qa-rummen-final.mjs
// Slutligt klicktest av designomgången Rummen (spec-rummen avsnitt 1.4,
// 17 till 24) i riktig Chrome mot ett lokalt produktionsbygge startat med
// TRANING_FORHANDSVISNING=1 och KONTAKT_MOTTAGARE=delivered@resend.dev.
// Pixel 7 (412), 360 och 1280, ljust och mörkt.
//
//   rum            de fem rummen (Rekryteringstester, CV, Personliga brev,
//                  Jobbsöket, Profil) för tre konton, hård omladdning på Pixel 7
//   forhand        Rekryteringstesters förhandsvisningar: hemvyns 20 tillstånd
//                  och passets 10 ramar
//   alla           /dashboard/tester/alla med provraden, gratis och Premium
//   priser         /priser utloggad
//   vaggar         varje betalvägg för gratiskontot, CV-gränsen och de låsta
//                  brevkorten för datakontot, intervjuprovets kvotspärr (429
//                  simulerat i webbläsaren), sidomenyns lås
//   prenumeration  gratis, Premium och spårkund
//   registrering   /register steg 1 och 2 med signUp stoppad i webbläsaren
//                  (inget konto, inget mejl), förslaget i steg 3 via jc_signup
//   kontakt        båda formulären: nätverksfel (stoppat i webbläsaren) och en
//                  lyckad väg var till delivered@resend.dev
//   spar409        köpsteget för en spårkund: 409 med upgradeAvailable leder
//                  till prenumerationssidan (svaret simulerat i webbläsaren,
//                  eftersom en spårprenumeration bara finns i Stripe)
//   kop            köpsteget fram till Stripe Checkout i TESTLÄGE mot --kopport
//   knappar        knappkontrollen på 360 px på alla routes ovan
//
//   node scripts/qa-rummen-final.mjs --port 5200 --kopport 5201 [--bara rum,priser] [--behall] [--radera]
//
// Kontona: qa-final-<roll>-<tid>@jobbcoach-qa.test, id:n i
// scripts/.qa-final-konton.json, raderas per id efteråt med räkning före
// delete och en kontrollräkning efter (feedback_testdata_stadning).

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'
import { kontrolleraKnappar } from './qa-rummen-knappar-360.mjs'

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
const arg = (namn, fallback) => {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const flagga = (namn) => process.argv.includes('--' + namn)
const PORT = arg('port', '5200')
const BAS = `http://localhost:${PORT}`
const KOPPORT = arg('kopport', null)
const BARA = arg('bara') ? arg('bara').split(',') : null
const kor = (d) => !BARA || BARA.includes(d)
const UT = path.resolve(arg('ut', 'docs/qa/rummen/final'))
const KONTOFIL = 'scripts/.qa-final-konton.json'
fs.mkdirSync(UT, { recursive: true })

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const inloggning = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /stripe\.com/i, /ERR_FAILED/, /ERR_INTERNET_DISCONNECTED/]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
const TS = Date.now()
const resultat = { datum: new Date().toISOString(), bas: BAS, delar: {}, fel: [], varningar: [] }
const fel = (t) => {
  resultat.fel.push(t)
  console.log('FEL', t)
}
const varning = (t) => {
  resultat.varningar.push(t)
  console.log('VARNING', t)
}
const notera = (del, rad) => {
  ;(resultat.delar[del] ??= []).push(rad)
  console.log(del, JSON.stringify(rad).slice(0, 200))
}

/** Gamla paket och förbjudna former i synlig text (copy-premium avsnitt 7). */
const FORBJUDET = /Hela paketet|Dagspasset|Träningspaketet|CV-paketet|paketen|Uppgradera|Skaffa|Premium-paketet|Jobbcoachen Premium|alla tre|Från 49 kr|kr\/mån|Ladda ned|—/
const ALLA_FORMER = [
  ['pixel7', 'light'],
  ['pixel7', 'dark'],
  ['smal', 'light'],
  ['smal', 'dark'],
  ['desktop', 'light'],
  ['desktop', 'dark'],
]
const sys = (s) => (s === 'light' ? 'ljust' : 'morkt')
const dag = (n) => new Date(Date.now() - n * 86400000).toISOString()

/* ------------------------------------------------------------ konton */

async function skapaKonton() {
  if (fs.existsSync(KONTOFIL)) {
    console.log('återanvänder', KONTOFIL)
    return JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  }
  const ut = {}
  for (const roll of ['gratis', 'premium', 'mycket', 'spar', 'ny']) {
    const email = `qa-final-${roll}-${TS}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: 'QaFinal!' + TS,
      email_confirm: true,
      user_metadata: { full_name: 'Anna Andersson', password_set: true },
    })
    if (error) throw new Error(`${roll}: ${error.message}`)
    const id = data.user.id
    ut[roll] = { email, id, dyn: {} }
    fs.writeFileSync(KONTOFIL, JSON.stringify(ut, null, 2))
    await vanta(500)
    const profil = {
      id,
      email,
      full_name: 'Anna Andersson',
      goal_role: 'Projektledare',
      location: 'Göteborg',
      email_verified_at: new Date().toISOString(),
    }
    if (roll === 'gratis') profil.onboarding_intent = 'tester'
    if (roll === 'mycket') profil.onboarding_intent = 'cv'
    const { error: pErr } = await sb.from('profiles').upsert(profil)
    if (pErr) throw new Error(`profil ${roll}: ${pErr.message}`)
    if (roll === 'premium' || roll === 'spar') {
      const om30 = new Date(Date.now() + 30 * 86400000).toISOString()
      const { data: g, error: gErr } = await sb
        .from('premium_grants')
        .insert({
          user_id: id,
          stripe_event_id: `qa_final_${roll}_${TS}`,
          days: 30,
          source: 'onetime_30d',
          scope: roll === 'spar' ? 'cv' : 'allt',
          premium_until_after: om30,
        })
        .select('id')
        .single()
      if (gErr) throw new Error(`grant ${roll}: ${gErr.message}`)
      ut[roll].dyn.grant = g.id
    }
    if (roll === 'gratis') {
      const { data: cv, error: cErr } = await sb
        .from('cv_texts')
        .insert({ user_id: id, file_name: 'Anna_CV.pdf', original_file_path: `qa/${id}/cv.pdf`, cv_text: 'Anna Andersson. Projektledare med sju års erfarenhet. Göteborg.' })
        .select('id')
        .single()
      if (cErr) throw new Error('cv: ' + cErr.message)
      ut[roll].dyn.cv = cv.id
      const { data: brev, error: bErr } = await sb
        .from('letters')
        .insert({ user_id: id, title: 'Projektledare, Volvo Cars', company: 'Volvo Cars', job_title: 'Projektledare', content: 'Hej,\n\nJag söker tjänsten som projektledare.\n\nVänliga hälsningar\nAnna', is_saved: true, language: 'sv' })
        .select('id')
        .single()
      if (bErr) varning('brev gratis: ' + bErr.message)
      else ut[roll].dyn.brev = brev.id
    }
    if (roll === 'mycket') {
      const cvText =
        'Anna Andersson. Projektledare med sju års erfarenhet av IT-projekt i offentlig sektor. Upphandling, agila team, budgetansvar på 12 miljoner kronor. Göteborg.'
      const cv = []
      for (let i = 0; i < 4; i++) cv.push({ user_id: id, file_name: `Anna_CV_${i + 1}.pdf`, original_file_path: `qa/${id}/cv${i}.pdf`, cv_text: cvText, created_at: dag(20 - i * 4) })
      const { error: cvErr } = await sb.from('cv_texts').insert(cv)
      if (cvErr) varning('cv mycket: ' + cvErr.message)
      const foretag = ['Klarna', 'Volvo Cars', 'Region Västra Götaland', 'Spotify', 'Ericsson', 'Saab']
      const brev = foretag.map((f, i) => ({
        user_id: id,
        title: `Projektledare, ${f}`,
        company: f,
        job_title: 'Projektledare',
        content: `Hej,\n\nJag söker tjänsten som projektledare hos ${f}. Under sju år har jag lett IT-projekt i offentlig sektor.\n\nVänliga hälsningar\nAnna Andersson`,
        tonality: 'professionell',
        job_description: 'Vi söker en projektledare.',
        cv_text: cvText,
        is_saved: true,
        language: 'sv',
        created_at: dag(18 - i * 3),
        updated_at: dag(18 - i * 3),
      }))
      const { data: brevRader, error: bErr } = await sb.from('letters').insert(brev).select('id')
      if (bErr) varning('brev mycket: ' + bErr.message)
      const ans = foretag.map((f, i) => ({
        user_id: id,
        job_title: 'Projektledare',
        company: f,
        application_channel: 'ad',
        letter_id: brevRader?.[i]?.id ?? null,
        applied_at: dag(30 - i * 5).slice(0, 10),
        current_status: 'applied',
      }))
      const { data: ansRader, error: aErr } = await sb.from('job_applications').insert(ans).select('id')
      if (aErr) varning('ansökningar mycket: ' + aErr.message)
      const typer = ['matrislogik', 'matrislogik', 'matrislogik', 'matrislogik-expert', 'numerical-reasoning', 'verbal-resonemang', 'matrislogik', 'matrislogik']
      const sess = typer.map((t, i) => ({ user_id: id, test_type: t, started_at: dag(14 - i), completed_at: dag(14 - i), score: 8 + (i % 5), answers: [] }))
      const { data: sessRader, error: sErr } = await sb.from('logic_test_v4_sessions').insert(sess).select('id, test_type')
      if (sErr) varning('sessioner mycket: ' + sErr.message)
      ut[roll].dyn = {
        brev: brevRader?.[0]?.id ?? null,
        ansokan: ansRader?.[0]?.id ?? null,
        testResultat: sessRader?.find((s) => s.test_type === 'matrislogik')?.id ?? null,
      }
    }
    fs.writeFileSync(KONTOFIL, JSON.stringify(ut, null, 2))
    console.log('skapad', roll, email)
  }
  return ut
}

const TABELLER = [
  'job_application_events',
  'job_applications',
  'letters',
  'cv_texts',
  'cv_analysis_jobs',
  'logic_test_v4_sessions',
  'premium_grants',
  'user_activities',
  'user_activity_log',
  'email_schedule',
  'email_log',
  'user_ui_flags',
  'notifications',
  'test_planer',
  'test_nivapunkter',
  'test_milstolpar',
  'cancel_intents',
  'anon_interview_samples',
]

/** Rate-limit-raden för den publika kontaktvägen, nyckeln är den påhittade IP:n. */
const qaIp = () => `qa-final-${TS}`
const hashIp = (ip) => crypto.createHash('sha256').update(ip + (env.RATE_LIMIT_PEPPER ?? 'jobbcoach')).digest('hex')

async function raderaKonton() {
  if (!fs.existsSync(KONTOFIL)) return
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  const logg = []
  for (const [roll, k] of Object.entries(konton)) {
    if (!/^qa-final-[a-z]+-\d+@jobbcoach-qa\.test$/.test(k.email)) throw new Error('vägrar radera ' + k.email)
    for (const t of TABELLER) {
      const { count, error: cErr } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
      if (cErr) continue
      if (count > 500) throw new Error(`${t}: ${count} rader för ${roll}, fler än ett testkonto kan ha`)
      if (count) {
        const { error } = await sb.from(t).delete().eq('user_id', k.id)
        logg.push(`${roll} ${t}: ${count} rader räknade, ${error ? 'FEL ' + error.message : 'raderade'}`)
      }
    }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
    await sb.from('profiles').delete().eq('id', k.id)
    const { error } = await sb.auth.admin.deleteUser(k.id)
    logg.push(`${roll} ${k.id}: profiles ${pc ?? 0} räknade, auth ${error ? error.message : 'raderad'}`)
  }
  // Kontrollräkning: noll rader kvar per konto och tabell.
  let kvar = 0
  for (const [roll, k] of Object.entries(konton)) {
    for (const t of TABELLER) {
      const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
      if (!error && count) {
        kvar += count
        logg.push(`KVAR ${roll} ${t}: ${count}`)
      }
    }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
    const { data: au } = await sb.auth.admin.getUserById(k.id)
    if (pc) kvar += pc
    if (au?.user) {
      kvar += 1
      logg.push(`KVAR ${roll} auth.users`)
    }
  }
  logg.push(`Kontrollräkning efter radering: ${kvar} rader kvar för ${Object.keys(konton).length} konton.`)
  fs.unlinkSync(KONTOFIL)
  fs.appendFileSync(path.join(UT, 'stadning.txt'), logg.join('\n') + '\n')
  console.log(logg.join('\n'))
}

async function raderaRateLimit(ip) {
  const h = hashIp(ip)
  const { count } = await sb.from('public_rate_limits').select('*', { count: 'exact', head: true }).eq('ip_hash', h).eq('scope', 'kontakt')
  let rad = `public_rate_limits ip_hash(${ip}) scope kontakt: ${count ?? 0} rader räknade`
  if (count) {
    if (count > 2) throw new Error('fler rate-limit-rader än väntat, avbryter')
    const { error } = await sb.from('public_rate_limits').delete().eq('ip_hash', h).eq('scope', 'kontakt')
    rad += error ? `, FEL ${error.message}` : ', raderade'
  }
  const { count: efter } = await sb.from('public_rate_limits').select('*', { count: 'exact', head: true }).eq('ip_hash', h)
  rad += `; kvar efteråt: ${efter ?? 0}`
  fs.appendFileSync(path.join(UT, 'stadning.txt'), rad + '\n')
  console.log(rad)
}

/* ------------------------------------------------------------ sidor */

const payloadCache = new Map()
async function payloadFor(email) {
  if (payloadCache.has(email)) return payloadCache.get(email)
  const { data: link, error: lErr } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  if (lErr) throw new Error(lErr.message)
  const { data: s, error } = await inloggning().auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const { access_token, refresh_token, expires_at, expires_in, user } = s.session
  const p = 'base64-' + Buffer.from(JSON.stringify({ access_token, refresh_token, expires_at, expires_in, token_type: 'bearer', user })).toString('base64')
  payloadCache.set(email, p)
  return p
}

async function nySida(browser, { form, system, email = null, cookies = [], bas = BAS }) {
  // Eget kontext per sida: annars delar sidorna kakor, och en utloggad sida
  // blir inloggad med förra sidans konto.
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  page.once('close', () => ctx.close().catch(() => {}))
  if (form === 'pixel7') await page.emulate(PIXEL)
  else if (form === 'smal') await page.emulate({ ...PIXEL, viewport: { ...PIXEL.viewport, width: 360, height: 780 } })
  else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
  if (email) {
    const p = await payloadFor(email)
    const CHUNK = 3200
    if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: bas, path: '/' })
    else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: bas, path: '/' })
  }
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: bas, path: '/' })
  for (const c of cookies) await page.setCookie({ ...c, url: bas, path: '/' })
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      localStorage.removeItem('tema')
    } catch {}
  })
  const logg = { konsol: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error' && !BRUS.some((r) => r.test(m.text()))) logg.konsol.push(m.text().slice(0, 300))
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(bas) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(bas, '').slice(0, 160)}`)
  })
  return { page, logg }
}

async function besok(page, url, bas = BAS) {
  await page.goto(bas + url, { waitUntil: 'networkidle0', timeout: 90000 })
  // Adressfältet på mobil: rulla body en pixel, som i de andra skripten.
  await page.evaluate(() => window.scrollTo(0, 1)).catch(() => {})
  await vanta(800)
}
const bild = (page, del, namn, full = false) => {
  fs.mkdirSync(path.join(UT, del), { recursive: true })
  return page.screenshot({ path: path.join(UT, del, `${namn}.png`), fullPage: full })
}
const text = (page) => page.evaluate(() => document.body.innerText)
const forbjudet = (t) => (t.match(new RegExp(FORBJUDET.source, 'g')) ?? []).slice(0, 6)

async function klickaText(page, re, selektor = 'button, a, [role="button"]') {
  return page.evaluate(
    (src, sel) => {
      const r = new RegExp(src)
      const el = [...document.querySelectorAll(sel)].find((e) => r.test((e.innerText || e.textContent || '').trim()) && e.getBoundingClientRect().width > 0)
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    re.source,
    selektor
  )
}

/** Läget på sidan: primärknapp i bild, header/nav synliga, vit yta i mörkt läge. */
const lage = (page) =>
  page.evaluate(() => {
    const synlig = (el) => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
    }
    const knappar = [...document.querySelectorAll('.knapp-primar')].filter(synlig)
    const forsta = knappar[0]
    const r = forsta?.getBoundingClientRect()
    const header = [...document.querySelectorAll('header')].some(synlig)
    const nav = [...document.querySelectorAll('nav')].some(synlig)
    // Vita ytor större än en tiondel av skärmen i mörkt läge (pappersytan
    // i dokument räknas inte: den har klassen dokument).
    const vita = []
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      for (const el of document.querySelectorAll('main *, body > div > div')) {
        const s = getComputedStyle(el)
        if (s.backgroundColor !== 'rgb(255, 255, 255)') continue
        if (el.closest('.dokument, [data-dokument], iframe, svg')) continue
        const b = el.getBoundingClientRect()
        if (b.width * b.height > (innerWidth * innerHeight) / 10 && synlig(el)) vita.push((el.className?.toString?.() || el.tagName).slice(0, 80))
        if (vita.length > 3) break
      }
    }
    return {
      primarer: knappar.length,
      primarText: forsta?.innerText.trim() ?? null,
      primarIBild: r ? r.top >= 0 && r.bottom <= innerHeight : null,
      header,
      nav,
      vita,
      h1: document.querySelector('h1')?.innerText.trim() ?? null,
    }
  })

/* ------------------------------------------------------------ delarna */

const RUM = [
  ['tester', '/dashboard/tester'],
  ['cv', '/dashboard/profil/cv'],
  ['brev', '/dashboard/mina-brev'],
  ['jobbsok', '/dashboard'],
  ['profil', '/dashboard/profil'],
]

async function delRum(browser, konton) {
  for (const roll of ['gratis', 'premium', 'mycket']) {
    for (const [form, system] of ALLA_FORMER) {
      for (const [rum, url] of RUM) {
        const { page, logg } = await nySida(browser, { form, system, email: konton[roll].email })
        const tag = `${rum}-${roll}-${form}-${sys(system)}`
        try {
          await besok(page, url)
          await bild(page, `rum/${rum}`, tag)
          let omladdad = null
          if (form === 'pixel7' && system === 'light') {
            // Hård omladdning: cachen av, samma vy ska komma tillbaka.
            await page.setCacheEnabled(false)
            await page.reload({ waitUntil: 'networkidle0', timeout: 90000 })
            await page.evaluate(() => window.scrollTo(0, 1)).catch(() => {})
            await vanta(800)
            await bild(page, `rum/${rum}`, `${tag}-omladdad`)
            omladdad = (await page.evaluate(() => document.querySelector('h1')?.innerText.trim() ?? null)) ?? 'utan h1'
          }
          const l = await lage(page)
          const t = await text(page)
          const rad = { roll, rum, form, system, ...l, omladdad, forbjudet: forbjudet(t), konsol: logg.konsol, http: logg.http }
          notera('rum', rad)
          if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
          if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
          if (logg.http.some((h) => /^5/.test(h))) fel(`${tag}: ${logg.http.join('; ')}`)
          if (!l.header && !l.nav) fel(`${tag}: varken header eller nav synlig`)
          if (l.primarer > 1) fel(`${tag}: ${l.primarer} primärknappar`)
          if (l.vita.length) fel(`${tag}: vit yta i mörkt läge ${l.vita.join(' | ')}`)
          if (omladdad && l.h1 && omladdad !== l.h1) fel(`${tag}: annan h1 efter omladdning (${omladdad})`)
        } catch (e) {
          fel(`${tag}: ${e.message}`)
        } finally {
          await page.close()
        }
      }
    }
  }
}

const TILLSTAND = ['T1', 'T1s', '1a', '1as', '1t', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1p', 'X1', 'L1', 'W1', 'W2', 'W3', 'W4']
const RAMAR = ['P1', 'P2', 'P3', 'P4', 'S1', 'M0', 'M1', 'O1', 'K1', 'uppvarmning']

async function delForhand(browser, konton) {
  const former = ALLA_FORMER
  const sidor = [
    ...TILLSTAND.filter((t) => !t.startsWith('W')).map((t) => ['hemvy', t, `/dashboard/tester/forhandsvisning?tillstand=${t}`, ['pixel7', 'smal']]),
    ...TILLSTAND.filter((t) => t.startsWith('W')).map((t) => ['hemvy', t, `/dashboard/tester/forhandsvisning?tillstand=${t}`, ['desktop']]),
    ...RAMAR.map((r) => ['pass', r, `/dashboard/tester/forhandsvisning-pass?ram=${r}`, ['pixel7', 'smal', 'desktop']]),
  ]
  for (const [form, system] of former) {
    for (const [typ, kod, url, formerFor] of sidor) {
      if (!formerFor.includes(form)) continue
      const { page, logg } = await nySida(browser, { form, system, email: konton.gratis.email })
      const tag = `${typ}-${kod}-${form}-${sys(system)}`
      try {
        await besok(page, url)
        await bild(page, `forhandsvisning/${typ}`, tag)
        const l = await lage(page)
        const t = await text(page)
        const rad = { typ, kod, form, system, ...l, forbjudet: forbjudet(t), konsol: logg.konsol, http: logg.http }
        notera('forhand', rad)
        if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
        if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
        if (logg.http.some((h) => /^[45]/.test(h))) fel(`${tag}: ${logg.http.join('; ')}`)
        if (l.primarer > 1) fel(`${tag}: ${l.primarer} primärknappar`)
        if (l.vita.length) fel(`${tag}: vit yta i mörkt läge ${l.vita.join(' | ')}`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

async function delAlla(browser, konton) {
  for (const roll of ['gratis', 'premium']) {
    for (const [form, system] of ALLA_FORMER) {
      const { page, logg } = await nySida(browser, { form, system, email: konton[roll].email })
      const tag = `alla-${roll}-${form}-${sys(system)}`
      try {
        await besok(page, '/dashboard/tester/alla')
        await bild(page, 'tester-alla', tag)
        await bild(page, 'tester-alla', `${tag}-hela`, true)
        const t = await text(page)
        const l = await lage(page)
        const rad = { roll, form, system, ...l, provrad: /Provläge|Generalrepetition|provformat|Samma format som/i.test(t), forbjudet: forbjudet(t), konsol: logg.konsol, http: logg.http }
        notera('alla', rad)
        if (!rad.provrad) fel(`${tag}: provraden syns inte`)
        if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
        if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
        if (l.vita.length) fel(`${tag}: vit yta i mörkt läge ${l.vita.join(' | ')}`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

async function delPriser(browser) {
  for (const [form, system] of ALLA_FORMER) {
    const { page, logg } = await nySida(browser, { form, system })
    try {
      await page.goto(BAS + '/priser', { waitUntil: 'networkidle0', timeout: 90000 })
      await vanta(700)
      const tag = `priser-${form}-${sys(system)}`
      await bild(page, 'priser', tag)
      await bild(page, 'priser', `${tag}-hela`, true)
      const t = await text(page)
      const h1 = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() ?? null)
      const titel = await page.title()
      const schema = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent || ''))
      const rad = {
        form,
        system,
        h1,
        titel,
        offerCount: schema.join('').match(/"offerCount":\s*"?(\d+)/)?.[1] ?? null,
        betyg: /aggregateRating|"Review"/.test(schema.join('')),
        dygn: /dygn/.test(t),
        forbjudet: forbjudet(t),
        konsol: logg.konsol,
        http: logg.http,
      }
      notera('priser', rad)
      if (h1 !== 'Jobbcoach Premium, 149 kr i månaden') fel(`${tag}: h1 "${h1}"`)
      if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
      if (rad.offerCount !== '1') fel(`${tag}: offerCount ${rad.offerCount}`)
      if (rad.betyg) fel(`${tag}: betyg i schemat`)
      if (rad.dygn) fel(`${tag}: "dygn" på prissidan`)
      if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
    } catch (e) {
      fel(`priser ${form}/${system}: ${e.message}`)
    } finally {
      await page.close()
    }
  }
}

const VAGG_FORMER = [
  ['pixel7', 'light'],
  ['pixel7', 'dark'],
  ['smal', 'light'],
  ['desktop', 'light'],
  ['desktop', 'dark'],
]

async function delVaggar(browser, konton) {
  const g = konton.gratis
  const m = konton.mycket
  const steg = [
    { namn: 'mallar', konto: g, url: '/dashboard/cv-mallar', tryck: /Premium/, sel: '[data-last], button, a, [role="button"]' },
    { namn: 'linkedin', konto: g, url: '/dashboard/linkedin-optimizer' },
    { namn: 'bli-upptackt', konto: g, url: '/dashboard/bli-upptackt' },
    { namn: 'jobbmatchning', konto: g, url: '/dashboard/jobbmatchning' },
    { namn: 'jobbcoachen', konto: g, url: '/dashboard/jobbcoachen' },
    { namn: 'cv-analys', konto: g, url: '/dashboard/cv-analys' },
    { namn: 'tester-alla', konto: g, url: '/dashboard/tester/alla', tryck: /Provläge|Ingår i Premium/, sel: 'a, button, [role="button"]' },
    { namn: 'hem-1f', konto: g, url: '/dashboard/tester/forhandsvisning?tillstand=1f' },
    { namn: 'hem-W3', konto: g, url: '/dashboard/tester/forhandsvisning?tillstand=W3' },
    { namn: 'pass-M1', konto: g, url: '/dashboard/tester/forhandsvisning-pass?ram=M1', hela: true },
    { namn: 'cv-grans', konto: m, url: '/dashboard/profil/cv' },
    { namn: 'brevkort-kvot', konto: m, url: '/dashboard/mina-brev' },
    ...(g.dyn.brev ? [{ namn: 'brev-nedladdning', konto: g, url: `/dashboard/mina-brev/${g.dyn.brev}`, tryck: /Ladda ner|PDF/ }] : []),
  ]
  for (const [form, system] of VAGG_FORMER) {
    for (const s of steg) {
      const { page, logg } = await nySida(browser, { form, system, email: s.konto.email })
      const tag = `${s.namn}-${form}-${sys(system)}`
      try {
        await besok(page, s.url)
        await bild(page, 'vaggar', `${tag}-01`)
        let tryckt = false
        if (s.tryck) {
          tryckt = await klickaText(page, s.tryck, s.sel)
          await vanta(1200)
          await bild(page, 'vaggar', `${tag}-02-vagg`)
        }
        if (s.hela) await bild(page, 'vaggar', `${tag}-hela`, true)
        const t = await text(page)
        const l = await lage(page)
        const rad = {
          steg: s.namn,
          form,
          system,
          tryckt,
          knapp: /Köp Premium, 149 kr i månaden/.test(t),
          prisrad: /Jobbcoach Premium, 149 kr i månaden\. Säg upp när du vill\.|149 kr i månaden, säg upp när du vill\./.test(t),
          ingarIPremium: /[Ii]ngår i (Jobbcoach )?Premium/.test(t),
          primarer: l.primarer,
          vita: l.vita,
          forbjudet: forbjudet(t),
          konsol: logg.konsol,
          http: logg.http,
        }
        notera('vaggar', rad)
        if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
        if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
        if (logg.http.some((h) => /^5/.test(h))) fel(`${tag}: ${logg.http.join('; ')}`)
        if (l.vita.length) fel(`${tag}: vit yta i mörkt läge ${l.vita.join(' | ')}`)
        if (!rad.knapp && !rad.ingarIPremium) varning(`${tag}: varken köpknapp eller "Ingår i Premium" i texten`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
    // Sidomenyns lås på dator: tryck på en låst rad, arket öppnas.
    if (form === 'desktop') {
      const { page, logg } = await nySida(browser, { form, system, email: g.email })
      const tag = `sidomeny-${form}-${sys(system)}`
      try {
        await besok(page, '/dashboard/profil/cv')
        await bild(page, 'vaggar', `${tag}-01`)
        const tryckt = await klickaText(page, /LinkedIn|Bli upptäckt|Jobbmatchning/, 'aside button, nav button')
        await vanta(1200)
        await bild(page, 'vaggar', `${tag}-02-ark`)
        const t = await text(page)
        notera('vaggar', { steg: 'sidomeny', form, system, tryckt, knapp: /Köp Premium, 149 kr i månaden/.test(t), forbjudet: forbjudet(t), konsol: logg.konsol })
        if (forbjudet(t).length) fel(`${tag}: förbjudet ${forbjudet(t).join(', ')}`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
  await delIntervjuprov(browser, konton)
}

/**
 * Intervjuprovets kvotspärr i en artikel. Svaret 429 simuleras i webbläsaren
 * (kvoten tar slut först efter flera bedömningar, och varje bedömning är ett
 * AI-anrop). Kontroll: spärren ritas, länken går till köpsteget med
 * plats=intervjuprov och betalvagg_visad skjuts med samma plats.
 */
async function delIntervjuprov(browser, konton) {
  for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['desktop', 'light']]) {
    const { page, logg } = await nySida(browser, { form, system, email: konton.gratis.email })
    const tag = `intervjuprov-${form}-${sys(system)}`
    const handelser = []
    try {
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const u = req.url()
        if (req.method() === 'POST' && u.includes('/api/public/intervjuprov')) {
          return req.respond({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'quota',
              message: 'Du har använt dagens bedömningar. Fler ingår i Premium.',
              upgradeHref: '/dashboard/valj-spar?paket=all_month&steg=kop&plats=intervjuprov',
            }),
          })
        }
        if (/posthog|\/ingest|\/e\/\?|\/i\/v0\/e/.test(u) && req.method() === 'POST') {
          const kropp = req.postData() || ''
          if (/betalvagg_visad/.test(kropp)) handelser.push(kropp.match(/"plats":"([a-z_]+)"/)?.[1] ?? 'okänd')
        }
        req.continue()
      })
      await besok(page, '/artiklar/styrkor-svagheter-intervju')
      const finns = await page.evaluate(() => {
        const t = [...document.querySelectorAll('textarea')].find((x) => x.getBoundingClientRect().width > 0)
        if (!t) return false
        t.scrollIntoView({ block: 'center' })
        return true
      })
      if (!finns) {
        varning(`${tag}: inget intervjuprov i artikeln`)
        continue
      }
      await page.type('textarea', 'Min största styrka är att jag håller ihop projekt när det blir rörigt. I mitt senaste uppdrag på Volvo tog jag över ett försenat projekt med tolv personer, delade upp arbetet i tvåveckorsperioder och vi levererade tre veckor före den nya planen.', { delay: 2 })
      await vanta(300)
      await bild(page, 'vaggar', `${tag}-01-svar`)
      const tryckt = await page.evaluate(() => {
        const t = document.querySelector('textarea')
        const yta = t?.closest('aside, section, form, div[class*="rounded"]') ?? document
        const b = [...yta.querySelectorAll('button')].find((x) => /Bedöm|Skicka|Få/.test(x.innerText) && !x.disabled)
        if (!b) return false
        b.click()
        return true
      })
      await vanta(2500)
      await bild(page, 'vaggar', `${tag}-02-sparr`)
      const lank = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href') || '').find((h) => h.includes('plats=intervjuprov')) ?? null)
      const t = await text(page)
      const rad = { steg: 'intervjuprov', form, system, tryckt, lank, handelser, forbjudet: forbjudet(t), konsol: logg.konsol }
      notera('vaggar', rad)
      if (!lank) fel(`${tag}: länken till köpsteget med plats=intervjuprov saknas`)
      if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
    } catch (e) {
      fel(`${tag}: ${e.message}`)
    } finally {
      await page.close()
    }
  }
}

async function delPrenumeration(browser, konton) {
  for (const roll of ['gratis', 'premium', 'spar']) {
    for (const [form, system] of ALLA_FORMER) {
      const { page, logg } = await nySida(browser, { form, system, email: konton[roll].email })
      const tag = `prenumeration-${roll}-${form}-${sys(system)}`
      try {
        await besok(page, '/dashboard/profil/prenumeration')
        await bild(page, 'prenumeration', tag)
        await bild(page, 'prenumeration', `${tag}-hela`, true)
        const t = await text(page)
        const l = await lage(page)
        // CV-paketet får stå för spårkunden: det är hennes paket.
        const for_ = roll === 'spar' ? forbjudet(t.replace(/CV-paketet/g, '')) : forbjudet(t)
        const rad = { roll, form, system, h1: l.h1, primarer: l.primarer, primarText: l.primarText, knapp: /Köp Premium, 149 kr i månaden/.test(t), vita: l.vita, forbjudet: for_, konsol: logg.konsol, http: logg.http }
        notera('prenumeration', rad)
        if (for_.length) fel(`${tag}: förbjudet ${for_.join(', ')}`)
        if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
        if (roll === 'premium' && l.primarer !== 0) fel(`${tag}: ${l.primarer} primärknappar för Premium (ska vara 0)`)
        if (roll !== 'premium' && l.primarer !== 1) fel(`${tag}: ${l.primarer} primärknappar (ska vara 1)`)
        if (l.vita.length) fel(`${tag}: vit yta i mörkt läge ${l.vita.join(' | ')}`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

async function delRegistrering(browser, konton) {
  for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['smal', 'light'], ['desktop', 'light']]) {
    const { page, logg } = await nySida(browser, { form, system })
    const tag = `register-${form}-${sys(system)}`
    const stoppade = []
    try {
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const u = req.url()
        // signUp, bekräftelsemejlet och post-signup stoppas: inget konto, inget mejl.
        if (req.method() === 'POST' && (/\/auth\/v1\/signup/.test(u) || /\/api\/auth\/(post-signup|send-confirmation)/.test(u))) {
          stoppade.push(u.replace(/^https?:\/\/[^/]+/, ''))
          return req.abort('internetdisconnected')
        }
        req.continue()
      })
      await besok(page, '/register')
      await bild(page, 'registrering', `${tag}-01-val`)
      const valt = await page.evaluate(() => {
        const b = document.querySelector('[data-intent="tester"]') || document.querySelector('[role="radio"]')
        if (!b) return null
        b.click()
        return b.getAttribute('data-intent')
      })
      await vanta(400)
      await bild(page, 'registrering', `${tag}-02-valt`)
      await klickaText(page, /^Fortsätt/)
      await vanta(1200)
      await bild(page, 'registrering', `${tag}-03-konto`)
      await page.waitForSelector('input[type="email"]', { timeout: 15000 })
      if (await page.$('input[autocomplete="name"]')) await page.type('input[autocomplete="name"]', 'Anna Andersson')
      await page.type('input[type="email"]', `qa-final-reg-${TS}@jobbcoach-qa.test`)
      await page.type('input[type="password"]', 'QaFinal!' + TS)
      await vanta(300)
      await bild(page, 'registrering', `${tag}-04-ifyllt`)
      const fore = page.url()
      await page.evaluate(() => {
        const b = document.querySelector('footer button[type="submit"]') || [...document.querySelectorAll('button[type="submit"]')].pop()
        b?.click()
      })
      await vanta(3000)
      await bild(page, 'registrering', `${tag}-05-natfel`)
      const t = await text(page)
      const rad = { form, system, valt, stoppade, kvar: page.url() === fore, felVisat: /gick inte|nådde inte|Försök igen|kunde inte|internet|anslutning/i.test(t), forbjudet: forbjudet(t), konsol: logg.konsol }
      notera('registrering', rad)
      if (!stoppade.some((s) => /signup/.test(s))) fel(`${tag}: signUp nåddes aldrig (stoppades inte)`)
      if (!rad.kvar) fel(`${tag}: sidan lämnades trots nätverksfel (${page.url()})`)
      if (!rad.felVisat) fel(`${tag}: inget fel visas vid nätverksfel`)
      if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
    } catch (e) {
      fel(`${tag}: ${e.message}`)
    } finally {
      await page.close()
    }
  }
  // Steg 3, förslaget, för ett nytt konto (skapat med service-nyckeln, inget mejl).
  const k = konton.ny
  for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['desktop', 'light']]) {
    for (const intent of ['tester', 'cv']) {
      const varde = encodeURIComponent(JSON.stringify({ intent, entry: 'direkt' }))
      const { page, logg } = await nySida(browser, { form, system, email: k.email, cookies: [{ name: 'jc_signup', value: varde }] })
      const tag = `forslag-${intent}-${form}-${sys(system)}`
      try {
        await besok(page, '/dashboard/valkommen')
        await vanta(1200)
        await bild(page, 'registrering', tag)
        const t = await text(page)
        const href = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href') || '').filter((h) => h.includes('paket=')))
        const l = await lage(page)
        const rad = { intent, form, system, url: page.url().replace(BAS, ''), premium: /Premium/.test(t), hrefs: href, primarIBild: l.primarIBild, forbjudet: forbjudet(t), konsol: logg.konsol }
        notera('registrering', rad)
        if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
        if (href.some((h) => !/paket=all_month/.test(h))) fel(`${tag}: köplänk till annat än all_month ${href.join(' ')}`)
        if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

/** Fyll formuläret som innehåller textarean, utan honungsfältet. */
const fyllFormular = (page, epost) =>
  page.evaluate((epost) => {
    const satt = (el, v) => {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }
    const ta = [...document.querySelectorAll('textarea')].find((t) => t.getBoundingClientRect().width > 0)
    const form = ta?.closest('form') ?? document.querySelector('main')
    const synlig = (el) => el.tabIndex !== -1 && !el.closest('[aria-hidden="true"]') && el.getBoundingClientRect().width > 1
    for (const s of form.querySelectorAll('select')) if (synlig(s) && s.options.length > 1) satt(s, s.options[1].value)
    for (const i of form.querySelectorAll('input[type="text"], input:not([type])')) if (synlig(i) && !i.value) satt(i, i.name === 'name' ? 'Anna Andersson' : 'QA slutlig körning, Rummen')
    for (const i of form.querySelectorAll('input[type="email"]')) if (synlig(i) && !i.value) satt(i, epost)
    if (ta) satt(ta, 'QA av Rummen 2026-10-11. Det här meddelandet går till delivered@resend.dev (Resends testadress) eller stoppas i webbläsaren, aldrig till supporten.')
    for (const r of form.querySelectorAll('input[type="radio"]')) {
      if (synlig(r)) {
        r.click()
        break
      }
    }
    return true
  }, epost)

const skicka = (page) =>
  page.evaluate(() => {
    const ta = [...document.querySelectorAll('textarea')].find((t) => t.getBoundingClientRect().width > 0)
    const form = ta?.closest('form')
    const b = form?.querySelector('button[type="submit"]') ?? [...document.querySelectorAll('main button')].find((x) => /^Skicka/.test(x.innerText.trim()))
    if (!b) return false
    b.scrollIntoView({ block: 'center' })
    b.click()
    return true
  })

async function delKontakt(browser, konton) {
  const g = konton.gratis
  const ytor = [
    ['inloggat', '/dashboard/kontakt', g.email],
    ['publikt', '/kontakt', null],
  ]
  for (const [yta, url, email] of ytor) {
    // Nätverksfel: POST stoppas i webbläsaren, inget når servern.
    for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['smal', 'light'], ['desktop', 'light']]) {
      const { page, logg } = await nySida(browser, { form, system, email })
      const tag = `kontakt-${yta}-natfel-${form}-${sys(system)}`
      const poster = []
      try {
        await page.setRequestInterception(true)
        page.on('request', (req) => {
          const u = req.url()
          if (req.method() === 'POST' && u.startsWith(BAS) && /\/api\/contact/.test(u)) {
            poster.push(u.replace(BAS, ''))
            return req.abort('internetdisconnected')
          }
          req.continue()
        })
        await besok(page, url)
        await bild(page, 'kontakt', `${tag}-01`)
        await fyllFormular(page, `qa-final-kontakt-${TS}@jobbcoach-qa.test`)
        await vanta(300)
        const tryckt = await skicka(page)
        await vanta(2500)
        await bild(page, 'kontakt', `${tag}-02-efter`)
        const t = await text(page)
        const rad = { yta, lage: 'natfel', form, system, tryckt, poster, tack: /Tack/.test(t), felVisat: /nådde inte|gick inte|Försök igen|kunde inte/i.test(t), konsol: logg.konsol }
        notera('kontakt', rad)
        if (!poster.length) fel(`${tag}: inget anrop till /api/contact`)
        if (rad.tack) fel(`${tag}: "Tack" visas på nätverksfel`)
        if (!rad.felVisat) fel(`${tag}: inget fel visas`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
    // Lyckad väg: en gång per yta, servern skickar till delivered@resend.dev.
    {
      const { page, logg } = await nySida(browser, { form: 'desktop', system: 'light', email })
      const tag = `kontakt-${yta}-lyckad-desktop-ljust`
      const svar = []
      try {
        if (yta === 'publikt') await page.setExtraHTTPHeaders({ 'x-forwarded-for': qaIp() })
        page.on('response', async (r) => {
          if (r.request().method() === 'POST' && /\/api\/contact/.test(r.url())) svar.push(r.status())
        })
        await besok(page, url)
        await fyllFormular(page, `qa-final-kontakt-${TS}@jobbcoach-qa.test`)
        await vanta(300)
        await bild(page, 'kontakt', `${tag}-01-ifyllt`)
        const tryckt = await skicka(page)
        await vanta(5000)
        await bild(page, 'kontakt', `${tag}-02-tack`)
        const t = await text(page)
        const rad = { yta, lage: 'lyckad', tryckt, svar, tack: /Tack/.test(t), konsol: logg.konsol }
        notera('kontakt', rad)
        if (!svar.includes(200)) fel(`${tag}: inget 200 från /api/contact (${svar.join(',')})`)
        if (!rad.tack) fel(`${tag}: inget Tack efter 200`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

/** Spårkunden i köpsteget: 409 med upgradeAvailable leder till prenumerationssidan. */
async function delSpar409(browser, konton) {
  const k = konton.spar
  for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['desktop', 'light']]) {
    const { page, logg } = await nySida(browser, { form, system, email: k.email })
    const tag = `spar409-${form}-${sys(system)}`
    try {
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        if (req.method() === 'POST' && req.url().includes('/api/stripe/create-plan-session')) {
          // Samma kropp som rutten ger en spårkund (create-plan-session, KOPSTEG.harSpar).
          return req.respond({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Du har CV-paketet. Byt till Premium på prenumerationssidan.', upgradeAvailable: true, upgradeUrl: '/api/stripe/create-upgrade-session', bytUrl: '/dashboard/profil/prenumeration', currentScope: 'cv' }),
          })
        }
        req.continue()
      })
      await besok(page, '/dashboard/valj-spar?paket=all_month&steg=kop')
      await bild(page, 'spar409', `${tag}-01-kopsteg`)
      await page.evaluate(() => {
        const box = document.querySelector('main input[type="checkbox"], input[type="checkbox"]')
        if (box && !box.checked) box.click()
      })
      await vanta(300)
      await klickaText(page, /^Till betalning/)
      await vanta(2000)
      await bild(page, 'spar409', `${tag}-02-besked`)
      const t = await text(page)
      const beskedet = /Du har CV-paketet\. Byt till Premium på prenumerationssidan\./.test(t)
      const premiumPastaende = /Du har redan Jobbcoach Premium/.test(t)
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {}), klickaText(page, /^Till prenumerationssidan$/)])
      await vanta(1000)
      await bild(page, 'spar409', `${tag}-03-prenumeration`)
      const url = page.url().replace(BAS, '')
      const rad = { form, system, beskedet, premiumPastaende, url, konsol: logg.konsol }
      notera('spar409', rad)
      if (!beskedet) fel(`${tag}: spårkundens besked syns inte`)
      if (premiumPastaende) fel(`${tag}: köpsteget påstår Premium för en spårkund`)
      if (!url.startsWith('/dashboard/profil/prenumeration')) fel(`${tag}: hamnade på ${url}`)
    } catch (e) {
      fel(`${tag}: ${e.message}`)
    } finally {
      await page.close()
    }
  }
}

/** Ett köpsteg ända till Stripe Checkout i testläge, mot servern på --kopport. */
async function delKop(browser, konton) {
  if (!KOPPORT) return varning('kop: --kopport saknas, hoppar över')
  const bas = `http://localhost:${KOPPORT}`
  const g = konton.gratis
  for (const [form, system] of [['pixel7', 'light'], ['desktop', 'light']]) {
    const { page, logg } = await nySida(browser, { form, system, email: g.email, bas })
    const tag = `kop-${form}-${sys(system)}`
    try {
      await page.goto(bas + '/priser', { waitUntil: 'networkidle0', timeout: 90000 })
      await vanta(700)
      await bild(page, 'kop', `${tag}-01-priser`)
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {}), klickaText(page, /^Köp Premium, 149 kr i månaden$/)])
      await vanta(1200)
      await bild(page, 'kop', `${tag}-02-kopsteg`)
      const url2 = page.url().replace(bas, '')
      const t2 = await text(page)
      await page.evaluate(() => {
        const box = document.querySelector('main input[type="checkbox"], input[type="checkbox"]')
        if (box && !box.checked) box.click()
      })
      await vanta(400)
      await bild(page, 'kop', `${tag}-03-samtycke`)
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}), klickaText(page, /^Till betalning/)])
      await page.waitForFunction(() => location.hostname.includes('stripe.com'), { timeout: 45000 }).catch(() => {})
      await vanta(3000)
      const checkout = page.url().replace(/(cs_test_[A-Za-z0-9]{6})[A-Za-z0-9#%]+/, '$1…')
      await bild(page, 'kop', `${tag}-04-stripe-checkout`)
      const t4 = await text(page)
      const rad = {
        form,
        url2,
        kopsteg: /valj-spar\?paket=all_month/.test(url2),
        premium: /Jobbcoach Premium/.test(t2),
        forbjudet: forbjudet(t2),
        checkout,
        stripeTest: /checkout\.stripe\.com/.test(checkout) && /cs_test_/.test(checkout),
        stripeVisar: (t4.match(/Jobbcoach Premium|Hela paketet/) ?? [null])[0],
        testlageMarkering: /testläge|test mode|TEST/i.test(t4),
        konsol: logg.konsol,
        http: logg.http,
      }
      notera('kop', rad)
      if (!rad.kopsteg) fel(`${tag}: köpsteget nåddes inte (${url2})`)
      if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
      if (!rad.stripeTest) fel(`${tag}: Stripe Checkout i testläge nåddes inte (${checkout})`)
    } catch (e) {
      fel(`${tag}: ${e.message}`)
    } finally {
      await page.close()
    }
  }
}

async function delKnappar(browser, konton) {
  const rutter = [
    ['ut', '/priser'],
    ['ut', '/kontakt'],
    ['ut', '/register'],
    ...RUM.flatMap(([, u]) => [['gratis', u], ['premium', u], ['mycket', u]]),
    ['gratis', '/dashboard/profil/prenumeration'],
    ['premium', '/dashboard/profil/prenumeration'],
    ['spar', '/dashboard/profil/prenumeration'],
    ['gratis', '/dashboard/valj-spar?paket=all_month&steg=kop'],
    ['gratis', '/dashboard/cv-mallar'],
    ['gratis', '/dashboard/linkedin-optimizer'],
    ['gratis', '/dashboard/bli-upptackt'],
    ['gratis', '/dashboard/jobbmatchning'],
    ['gratis', '/dashboard/tester/alla'],
    ['gratis', '/dashboard/kontakt'],
    ...TILLSTAND.filter((t) => !t.startsWith('W')).map((t) => ['gratis', `/dashboard/tester/forhandsvisning?tillstand=${t}`]),
    ...RAMAR.map((r) => ['gratis', `/dashboard/tester/forhandsvisning-pass?ram=${r}`]),
  ]
  const ut = { datum: new Date().toISOString(), bredd: 360, rutter: [], rott: [] }
  for (const [roll, url] of rutter) {
    const { page } = await nySida(browser, { form: 'smal', system: 'light', email: roll === 'ut' ? null : konton[roll].email })
    try {
      await besok(page, url)
      const k = await kontrolleraKnappar(page)
      ut.rutter.push({ roll, url, knappar: k.knappar.map((b) => `${b.text} (${b.tecken})`), rott: k.rott })
      for (const r of k.rott) ut.rott.push({ roll, url, ...r })
    } catch (e) {
      ut.rutter.push({ roll, url, fel: e.message })
    } finally {
      await page.close()
    }
  }
  fs.writeFileSync(path.join(UT, 'knappar-360.json'), JSON.stringify(ut, null, 2))
  notera('knappar', { rutter: ut.rutter.length, rott: ut.rott.length })
  if (ut.rott.length) fel(`knappar-360: ${ut.rott.length} knappar svämmar över`)
}

/* ------------------------------------------------------------ körningen */

if (flagga('radera')) {
  await raderaKonton()
  process.exit(0)
}
const konton = await skapaKonton()
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] })
let kontaktKord = false
try {
  if (kor('rum')) await delRum(browser, konton)
  if (kor('forhand')) await delForhand(browser, konton)
  if (kor('alla')) await delAlla(browser, konton)
  if (kor('priser')) await delPriser(browser)
  if (kor('vaggar')) await delVaggar(browser, konton)
  if (kor('prenumeration')) await delPrenumeration(browser, konton)
  if (kor('registrering')) await delRegistrering(browser, konton)
  if (kor('kontakt')) {
    kontaktKord = true
    await delKontakt(browser, konton)
  }
  if (kor('spar409')) await delSpar409(browser, konton)
  if (kor('kop')) await delKop(browser, konton)
  if (kor('knappar')) await delKnappar(browser, konton)
} finally {
  await browser.close()
  const fil = path.join(UT, BARA ? `resultat-${BARA.join('-')}.json` : 'resultat.json')
  fs.writeFileSync(fil, JSON.stringify(resultat, null, 2))
  console.log(`\n${resultat.fel.length} fel, ${resultat.varningar.length} varningar. Resultat i ${fil}`)
  if (kontaktKord) {
    await raderaRateLimit(qaIp())
    for (const ip of (arg('extraip') ?? '').split(',').filter(Boolean)) await raderaRateLimit(ip)
  }
  if (!flagga('behall')) await raderaKonton()
}
