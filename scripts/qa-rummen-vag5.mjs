// scripts/qa-rummen-vag5.mjs
// Klicktest av våg 5 (spec-rummen avsnitt 6, 17.3 och 17.4,
// docs/design/copy-premium-2026-10-11.md) i riktig Chrome mot ett lokalt
// produktionsbygge: Pixel 7 (412), 360 och 1280, ljust och mörkt.
//
//   priser       /priser utloggad: H1, prisraden, knappen, schema, inga gamla paket
//   vaggar       varje betalvägg för gratiskontot: mallarna, LinkedIn, Bli upptäckt,
//                CV-analysen, brevets nedladdning, provlägets låsta rad, sidomenyns
//                lås (GraValSheet), 1f och W3 i testhemmet, M1 efter mätningen
//   forslag      registreringsförslaget (jc_signup med intent) visar bara månaden
//   prenumeration  gratis, Premium och en befintlig spårkund (CV-paketet)
//   kontakt      kontaktformuläret i inloggat: nätverksfel och 500 ger fel, aldrig Tack;
//                inget meddelande når servern (anropet stoppas i webbläsaren)
//   kop          ett köpsteg från /priser inloggad till Stripe Checkout i TESTLÄGE
//                (kräver att bygget startats med .env.test.local i processen)
//   knappar      knappkontrollen på 360 px på våg 5:s routes
//
//   node scripts/qa-rummen-vag5.mjs --port 5250 [--bara priser,vaggar] [--behall] [--radera]
//
// Kontona får unika adresser per körning (qa-v5-<roll>-<tid>@jobbcoach-qa.test,
// feedback_testdata_stadning). Id:n sparas i scripts/.qa-v5-konton.json och
// raderas efteråt per id, räknade före delete. Inga mejl skickas: bygget körs
// med en ogiltig Resend-nyckel och kontaktformulärets POST stoppas i webbläsaren.

import fs from 'node:fs'
import path from 'node:path'
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
const PORT = arg('port', '5250')
const BAS = `http://localhost:${PORT}`
const BARA = arg('bara') ? arg('bara').split(',') : null
const kor = (d) => !BARA || BARA.includes(d)
const UT = path.resolve(arg('ut', 'docs/qa/rummen/vag-5'))
const KONTOFIL = 'scripts/.qa-v5-konton.json'
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
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /stripe\.com/i, /ERR_FAILED/]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
const resultat = { datum: new Date().toISOString(), bas: BAS, delar: {}, fel: [] }
const fel = (t) => {
  resultat.fel.push(t)
  console.log('FEL', t)
}
const notera = (del, rad) => {
  ;(resultat.delar[del] ??= []).push(rad)
  console.log(del, JSON.stringify(rad).slice(0, 240))
}

/** Gamla paket och förbjudna former i synlig text (copy-premium avsnitt 7). */
const FORBJUDET = /Hela paketet|Dagspasset|Träningspaketet|CV-paketet|paketen|Uppgradera|Skaffa|Premium-paketet|Jobbcoachen Premium|alla tre|Från 49 kr|kr\/mån|—/
const FORMER = [
  ['pixel7', 'light'],
  ['pixel7', 'dark'],
  ['smal', 'light'],
  ['desktop', 'light'],
  ['desktop', 'dark'],
]
const sys = (s) => (s === 'light' ? 'ljust' : 'morkt')

/* ------------------------------------------------------------ konton */

async function skapaKonton() {
  if (fs.existsSync(KONTOFIL)) {
    console.log('återanvänder', KONTOFIL)
    return JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  }
  const ts = Date.now()
  const ut = {}
  for (const roll of ['gratis', 'premium', 'spar', 'ny']) {
    const email = `qa-v5-${roll}-${ts}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: 'QaVag5!' + ts,
      email_confirm: true,
      user_metadata: { full_name: 'Anna Andersson', password_set: true },
    })
    if (error) throw new Error(`${roll}: ${error.message}`)
    const id = data.user.id
    ut[roll] = { email, id, dyn: {} }
    fs.writeFileSync(KONTOFIL, JSON.stringify(ut, null, 2))
    await vanta(400)
    const profil = { id, email, full_name: 'Anna Andersson', goal_role: 'Projektledare', location: 'Göteborg' }
    if (roll === 'gratis') profil.onboarding_intent = 'cv'
    if (roll === 'premium' || roll === 'spar') {
      const om30 = new Date(Date.now() + 30 * 86400000).toISOString()
      Object.assign(profil, { subscription_tier: 'premium', premium_until: om30, premium_source: 'onetime_30d' })
    }
    const { error: pErr } = await sb.from('profiles').upsert(profil)
    if (pErr) throw new Error(`profil ${roll}: ${pErr.message}`)
    if (roll === 'premium' || roll === 'spar') {
      const om30 = new Date(Date.now() + 30 * 86400000).toISOString()
      const { error: gErr } = await sb.from('premium_grants').insert({
        user_id: id,
        stripe_event_id: `qa_v5_${roll}_${ts}`,
        days: 30,
        source: 'onetime_30d',
        scope: roll === 'spar' ? 'cv' : 'allt',
        premium_until_after: om30,
      })
      if (gErr) throw new Error(`grant ${roll}: ${gErr.message}`)
    }
    if (roll === 'gratis') {
      // Ett CV och ett personligt brev, så att mallarnas, analysens och
      // brevets betalväggar går att nå.
      const { data: cv, error: cErr } = await sb
        .from('cv_texts')
        .insert({ user_id: id, file_name: 'Anna_CV.pdf', original_file_path: `qa/${id}/cv.pdf`, cv_text: 'Anna Andersson. Projektledare med sju års erfarenhet. Göteborg.' })
        .select('id')
        .single()
      if (cErr) throw new Error('cv: ' + cErr.message)
      ut[roll].dyn.cv = cv.id
      const { data: brev, error: bErr } = await sb
        .from('letters')
        .insert({ user_id: id, title: 'Projektledare, Volvo Cars', company_name: 'Volvo Cars', job_title: 'Projektledare', content: 'Hej,\n\nJag söker tjänsten som projektledare.\n\nVänliga hälsningar\nAnna' })
        .select('id')
        .single()
      if (bErr) console.log('brev kunde inte skapas (fortsätter):', bErr.message)
      else ut[roll].dyn.brev = brev.id
    }
    fs.writeFileSync(KONTOFIL, JSON.stringify(ut, null, 2))
    console.log('skapad', roll, email)
  }
  return ut
}

async function raderaKonton() {
  if (!fs.existsSync(KONTOFIL)) return
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  const logg = []
  for (const [roll, k] of Object.entries(konton)) {
    if (!/^qa-v5-[a-z]+-\d+@jobbcoach-qa\.test$/.test(k.email)) throw new Error('vägrar radera ' + k.email)
    for (const t of [
      'job_application_events',
      'job_applications',
      'letters',
      'cv_texts',
      'cv_analysis_jobs',
      'logic_test_v4_sessions',
      'premium_grants',
      'user_activities',
      'email_schedule',
      'email_log',
      'user_ui_flags',
      'notifications',
      'test_planer',
      'contact_messages',
    ]) {
      const { count, error: cErr } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
      if (cErr) continue
      if (count) {
        const { error } = await sb.from(t).delete().eq('user_id', k.id)
        logg.push(`${roll} ${t}: ${count} rader räknade, ${error ? 'FEL ' + error.message : 'raderade'}`)
      }
    }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
    await sb.from('profiles').delete().eq('id', k.id)
    const { error } = await sb.auth.admin.deleteUser(k.id)
    logg.push(`${roll} ${k.id}: profiles ${pc ?? 0}, auth ${error ? error.message : 'raderad'}`)
  }
  fs.unlinkSync(KONTOFIL)
  fs.writeFileSync(path.join(UT, 'stadning.txt'), logg.join('\n') + '\n')
  console.log(logg.join('\n'))
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

async function nySida(browser, { form, system, email = null, cookies = [] }) {
  const page = await browser.newPage()
  if (form === 'pixel7') await page.emulate(PIXEL)
  else if (form === 'smal') await page.emulate({ ...PIXEL, viewport: { ...PIXEL.viewport, width: 360, height: 780 } })
  else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
  if (email) {
    const p = await payloadFor(email)
    const CHUNK = 3200
    if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
    else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  }
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  for (const c of cookies) await page.setCookie({ ...c, url: BAS, path: '/' })
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
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 160)}`)
  })
  return { page, logg }
}

async function besok(page, url) {
  await page.goto(BAS + url, { waitUntil: 'networkidle0', timeout: 90000, referer: BAS + '/dashboard/profil' })
  // Adressfältet på mobil: rulla body en pixel, som i de andra skripten.
  await page.evaluate(() => window.scrollTo(0, 1)).catch(() => {})
  await vanta(900)
}
const bild = (page, del, namn, full = false) => {
  fs.mkdirSync(path.join(UT, del), { recursive: true })
  return page.screenshot({ path: path.join(UT, del, `${namn}.png`), fullPage: full })
}
const text = (page) => page.evaluate(() => document.body.innerText)
const forbjudet = (t) => (t.match(new RegExp(FORBJUDET.source, 'g')) ?? []).slice(0, 6)

/** Klicka på första element vars text matchar. Returnerar sant om något klickades. */
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

/** Primär handling inom viewport, utan scroll. */
const primarIBild = (page) =>
  page.evaluate(() => {
    const k = [...document.querySelectorAll('.knapp-primar')].find((e) => e.getBoundingClientRect().width > 0)
    if (!k) return null
    const r = k.getBoundingClientRect()
    return { text: k.innerText.trim(), iBild: r.top >= 0 && r.bottom <= window.innerHeight }
  })

/* ------------------------------------------------------------ delarna */

async function delPriser(browser) {
  for (const [form, system] of FORMER) {
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
      const schema = await page.evaluate(() =>
        [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
          try {
            return JSON.parse(s.textContent || 'null')
          } catch {
            return null
          }
        })
      )
      const agg = JSON.stringify(schema).match(/"AggregateOffer"/) ? schema : null
      const knapp = await primarIBild(page)
      const rad = {
        form,
        system,
        h1,
        titel,
        knapp,
        prisrad: /149 kr i månaden, säg upp när du vill\./.test(t) || /Säg upp när du vill/.test(t),
        aggregateOffer: !!agg,
        offerCount: JSON.stringify(schema).match(/"offerCount":\s*"?(\d+)/)?.[1] ?? null,
        betyg: /aggregateRating|"Review"/.test(JSON.stringify(schema)),
        forbjudet: forbjudet(t),
        konsol: logg.konsol,
        http: logg.http,
      }
      notera('priser', rad)
      if (h1 !== 'Jobbcoach Premium, 149 kr i månaden') fel(`${tag}: h1 "${h1}"`)
      if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
      if (rad.offerCount !== '1') fel(`${tag}: offerCount ${rad.offerCount}`)
      if (rad.betyg) fel(`${tag}: betyg i schemat`)
      if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
    } catch (e) {
      fel(`priser ${form}/${system}: ${e.message}`)
    } finally {
      await page.close()
    }
  }
}

/**
 * Betalväggarna för gratiskontot. Varje steg: öppna vyn, utlös väggen om den
 * kräver ett tryck, fotografera, kontrollera knapp, prisrad och förbjudna ord.
 */
async function delVaggar(browser, konton) {
  const g = konton.gratis
  const steg = [
    { namn: 'mallar', url: '/dashboard/cv-mallar', tryck: /Premium/, sel: '[data-last], button, a, [role="button"]' },
    { namn: 'linkedin', url: '/dashboard/linkedin-optimizer' },
    { namn: 'bli-upptackt', url: '/dashboard/bli-upptackt' },
    { namn: 'jobbmatchning', url: '/dashboard/jobbmatchning' },
    { namn: 'tester-alla', url: '/dashboard/tester/alla' },
    { namn: 'hem-1f', url: '/dashboard/tester/forhandsvisning?tillstand=1f' },
    { namn: 'hem-W3', url: '/dashboard/tester/forhandsvisning?tillstand=W3' },
    { namn: 'hem-1a', url: '/dashboard/tester/forhandsvisning?tillstand=1a' },
    { namn: 'pass-M1', url: '/dashboard/tester/forhandsvisning-pass?ram=M1', hela: true },
    { namn: 'mina-cv', url: '/dashboard/profil/cv' },
    ...(g.dyn.brev ? [{ namn: 'brev', url: `/dashboard/mina-brev/${g.dyn.brev}`, tryck: /Ladda ner|PDF/ }] : []),
  ]
  for (const [form, system] of FORMER) {
    for (const s of steg) {
      const { page, logg } = await nySida(browser, { form, system, email: g.email })
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
        const rad = {
          steg: s.namn,
          form,
          system,
          tryckt,
          knapp: /Köp Premium, 149 kr i månaden/.test(t),
          prisrad: /Jobbcoach Premium, 149 kr i månaden\. Säg upp när du vill\.|149 kr i månaden, säg upp när du vill\./.test(t),
          ingarIPremium: /[Ii]ngår i (Jobbcoach )?Premium/.test(t),
          forbjudet: forbjudet(t),
          konsol: logg.konsol,
          http: logg.http,
        }
        notera('vaggar', rad)
        if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
        if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
        if (logg.http.some((h) => /^5/.test(h))) fel(`${tag}: ${logg.http.join('; ')}`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
    // Sidomenyns lås på dator: tryck på en låst rad, GraValSheet öppnas.
    if (form === 'desktop') {
      const { page, logg } = await nySida(browser, { form, system, email: g.email })
      const tag = `sidomeny-${form}-${sys(system)}`
      try {
        await besok(page, '/dashboard/profil/cv')
        const badge = await page.evaluate(() => {
          const nav = document.querySelector('nav, aside')
          return nav ? nav.innerText : ''
        })
        await bild(page, 'vaggar', `${tag}-01`)
        const tryckt = await klickaText(page, /LinkedIn|Bli upptäckt|Jobbmatchning/, 'aside button, nav button, aside a, nav a')
        await vanta(1200)
        await bild(page, 'vaggar', `${tag}-02-gravalsheet`)
        const t = await text(page)
        notera('vaggar', {
          steg: 'sidomeny',
          form,
          system,
          tryckt,
          badge149: /149 kr i månaden/.test(badge),
          fran49: /Från 49 kr/.test(badge),
          knapp: /Köp Premium, 149 kr i månaden/.test(t),
          forbjudet: forbjudet(t),
          konsol: logg.konsol,
        })
        if (/Från 49 kr/.test(badge)) fel(`${tag}: Från 49 kr i sidomenyn`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

async function delForslag(browser, konton) {
  const k = konton.ny
  for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['desktop', 'light']]) {
    for (const intent of ['tester', 'cv']) {
      const varde = encodeURIComponent(JSON.stringify({ intent, entry: 'direkt' }))
      const { page, logg } = await nySida(browser, { form, system, email: k.email, cookies: [{ name: 'jc_signup', value: varde }] })
      const tag = `forslag-${intent}-${form}-${sys(system)}`
      try {
        await besok(page, '/dashboard/valkommen')
        await vanta(1500)
        await bild(page, 'forslag', tag)
        const t = await text(page)
        const href = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href') || '').filter((h) => h.includes('paket=')))
        const rad = { intent, form, system, url: page.url().replace(BAS, ''), premium: /Premium/.test(t), hrefs: href, forbjudet: forbjudet(t), konsol: logg.konsol }
        notera('forslag', rad)
        if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
        if (href.some((h) => !/paket=all_month/.test(h))) fel(`${tag}: köplänk till annat än all_month ${href.join(' ')}`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

async function delPrenumeration(browser, konton) {
  for (const roll of ['gratis', 'premium', 'spar']) {
    for (const [form, system] of FORMER) {
      const { page, logg } = await nySida(browser, { form, system, email: konton[roll].email })
      const tag = `prenumeration-${roll}-${form}-${sys(system)}`
      try {
        await besok(page, '/dashboard/profil/prenumeration')
        await bild(page, 'prenumeration', tag)
        await bild(page, 'prenumeration', `${tag}-hela`, true)
        const t = await text(page)
        const h1 = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() ?? null)
        // CV-paketet får stå för den befintliga spårkunden: det är hennes paket.
        const for_ = roll === 'spar' ? forbjudet(t.replace(/CV-paketet/g, '')) : forbjudet(t)
        const rad = { roll, form, system, h1, knapp: /Köp Premium, 149 kr i månaden/.test(t), duHarPremium: /Du har Premium|Jobbcoach Premium/.test(t), forbjudet: for_, konsol: logg.konsol, http: logg.http }
        notera('prenumeration', rad)
        if (for_.length) fel(`${tag}: förbjudet ${for_.join(', ')}`)
        if (logg.konsol.length) fel(`${tag}: konsolfel ${logg.konsol[0]}`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

/**
 * Kontaktformuläret i inloggat. Anropet till servern stoppas i webbläsaren
 * (abort eller ett påhittat 500), så inget meddelande skickas. Kontroll: ett
 * fel syns som fel, "Tack" syns aldrig.
 */
async function delKontakt(browser, konton) {
  const g = konton.gratis
  for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['desktop', 'light']]) {
    for (const lage of ['natfel', 'serverfel']) {
      const { page, logg } = await nySida(browser, { form, system, email: g.email })
      const tag = `kontakt-${lage}-${form}-${sys(system)}`
      const poster = []
      try {
        await page.setRequestInterception(true)
        page.on('request', (req) => {
          const u = req.url()
          if (req.method() === 'POST' && u.startsWith(BAS) && /\/api\/(contact|kontakt)/.test(u)) {
            poster.push(u.replace(BAS, ''))
            if (lage === 'natfel') req.abort('internetdisconnected')
            else req.respond({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'QA: påhittat serverfel' }) })
            return
          }
          req.continue()
        })
        await besok(page, '/dashboard/kontakt')
        await bild(page, 'kontakt', `${tag}-01`)
        // Fyll i fälten som finns: ämne/val, meddelande.
        await page.evaluate(() => {
          const satt = (el, v) => {
            const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype
            Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
            el.dispatchEvent(new Event('input', { bubbles: true }))
            el.dispatchEvent(new Event('change', { bubbles: true }))
          }
          for (const s of document.querySelectorAll('main select')) if (s.options.length > 1) satt(s, s.options[1].value)
          for (const i of document.querySelectorAll('main input[type="text"], main input:not([type])')) if (!i.value) satt(i, 'QA våg 5, skickas inte')
          for (const i of document.querySelectorAll('main input[type="email"]')) if (!i.value) satt(i, 'qa-v5@jobbcoach-qa.test')
          for (const t of document.querySelectorAll('main textarea')) satt(t, 'QA våg 5: det här meddelandet stoppas i webbläsaren och når aldrig servern.')
          for (const r of document.querySelectorAll('main input[type="radio"]')) {
            r.click()
            break
          }
        })
        await vanta(300)
        await bild(page, 'kontakt', `${tag}-02-ifyllt`)
        const tryckt = await klickaText(page, /^(Skicka|Skicka meddelandet|Skicka meddelande)$/, 'main button')
        await vanta(2500)
        await bild(page, 'kontakt', `${tag}-03-efter`)
        const t = await text(page)
        const rad = { lage, form, system, tryckt, poster, tack: /Tack/.test(t), felVisat: /gick inte|Försök igen|kunde inte|fel/i.test(t), konsol: logg.konsol }
        notera('kontakt', rad)
        if (!poster.length) fel(`${tag}: inget anrop till kontakt-API:t (simulerad submit?)`)
        if (rad.tack) fel(`${tag}: "Tack" visas på fel`)
        if (!rad.felVisat) fel(`${tag}: inget fel visas`)
      } catch (e) {
        fel(`${tag}: ${e.message}`)
      } finally {
        await page.close()
      }
    }
  }
}

/**
 * Ett köpsteg ända till Stripe Checkout i testläge. Bygget måste ha startats
 * med .env.test.local i processen, annars går kassan mot livenyckeln: då
 * stannar delen vid steget före och säger det.
 */
async function delKop(browser, konton) {
  const g = konton.gratis
  const testlage = process.env.QA_STRIPE_TESTLAGE === '1'
  for (const [form, system] of [['pixel7', 'light'], ['desktop', 'light']]) {
    const { page, logg } = await nySida(browser, { form, system, email: g.email })
    const tag = `kop-${form}-${sys(system)}`
    try {
      await page.goto(BAS + '/priser', { waitUntil: 'networkidle0', timeout: 90000 })
      await vanta(700)
      await bild(page, 'kop', `${tag}-01-priser`)
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {}), klickaText(page, /^Köp Premium, 149 kr i månaden$/)])
      await vanta(1200)
      await bild(page, 'kop', `${tag}-02-kopsteg`)
      const url2 = page.url().replace(BAS, '')
      const t2 = await text(page)
      // Samtyckesrutan.
      await page.evaluate(() => {
        const box = document.querySelector('main input[type="checkbox"]')
        if (box && !box.checked) box.click()
      })
      await vanta(400)
      await bild(page, 'kop', `${tag}-03-samtycke`)
      let checkout = null
      if (testlage) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}),
          klickaText(page, /^Till betalning/),
        ])
        await page.waitForFunction(() => location.hostname.includes('stripe.com'), { timeout: 45000 }).catch(() => {})
        await vanta(2500)
        checkout = page.url().replace(/(cs_test_[A-Za-z0-9]{6})[A-Za-z0-9#%]+/, '$1…')
        await bild(page, 'kop', `${tag}-04-stripe-checkout`)
      }
      const t4 = testlage ? await text(page) : ''
      const rad = {
        form,
        url2,
        kopsteg: /valj-spar\?paket=all_month/.test(url2),
        premium: /Jobbcoach Premium/.test(t2),
        forbjudet: forbjudet(t2),
        testlage,
        checkout,
        stripeTest: /checkout\.stripe\.com/.test(checkout ?? '') && /cs_test_/.test(checkout ?? ''),
        stripeVisarPremium: /Jobbcoach Premium|Hela paketet/.test(t4) ? (t4.match(/Jobbcoach Premium|Hela paketet/) ?? [])[0] : null,
        konsol: logg.konsol,
        http: logg.http,
      }
      notera('kop', rad)
      if (!rad.kopsteg) fel(`${tag}: köpsteget nåddes inte (${url2})`)
      if (rad.forbjudet.length) fel(`${tag}: förbjudet ${rad.forbjudet.join(', ')}`)
      if (testlage && !rad.stripeTest) fel(`${tag}: Stripe Checkout i testläge nåddes inte (${checkout})`)
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
    ['gratis', '/dashboard/profil/prenumeration'],
    ['premium', '/dashboard/profil/prenumeration'],
    ['spar', '/dashboard/profil/prenumeration'],
    ['gratis', '/dashboard/valj-spar?paket=all_month&steg=kop'],
    ['gratis', '/dashboard/cv-mallar'],
    ['gratis', '/dashboard/linkedin-optimizer'],
    ['gratis', '/dashboard/bli-upptackt'],
    ['gratis', '/dashboard/tester/alla'],
    ['gratis', '/dashboard/tester/forhandsvisning?tillstand=1f'],
    ['gratis', '/dashboard/tester/forhandsvisning?tillstand=W3'],
    ['gratis', '/dashboard/tester/forhandsvisning-pass?ram=M1'],
    ['gratis', '/dashboard/kontakt'],
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
try {
  if (kor('priser')) await delPriser(browser)
  if (kor('vaggar')) await delVaggar(browser, konton)
  if (kor('forslag')) await delForslag(browser, konton)
  if (kor('prenumeration')) await delPrenumeration(browser, konton)
  if (kor('kontakt')) await delKontakt(browser, konton)
  if (kor('kop')) await delKop(browser, konton)
  if (kor('knappar')) await delKnappar(browser, konton)
} finally {
  await browser.close()
  const fil = path.join(UT, BARA ? `resultat-${BARA.join('-')}.json` : 'resultat.json')
  fs.writeFileSync(fil, JSON.stringify(resultat, null, 2))
  console.log(`\n${resultat.fel.length} fel. Resultat i ${fil}`)
  if (!flagga('behall')) await raderaKonton()
}
