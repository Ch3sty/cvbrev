// scripts/qa-efterarbete.mjs
// Riktig webbläsartest av efterarbetet (docs/bygg-noter-paket.md,
// "Efterarbete: avgjort"): hemskärmen efter prestandaändringarna, en artikel
// med reklamkort, /verktyg/bli-upptackt och /verktyg/linkedin-optimering, på
// Pixel 7 (412 × 915) och desktop 1280, med systemets Chrome.
//
//   node scripts/qa-efterarbete.mjs http://localhost:5214
//
// Skapar ett tillfälligt QA-konto med Allt-veckan via service-rollen (samma
// mönster som scripts/qa-paket-d2-konton.mjs), loggar in genom formuläret
// som en ny användare och raderar kontot efteråt, även vid fel.
//
// Per vy: skärmdump till docs/qa/qa-efterarbete/, konsolfel, svar 4xx/5xx,
// antal h1, horisontell scroll, och att vyns primära handling ligger inom
// första skärmhöjden. Dessutom: cookie-samtycket syns, går att lämna och
// kommer inte tillbaka; PostHog laddas inte förrän besökaren scrollar;
// inloggad på en publik verktygssida skickas vidare till verktyget.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const BAS = process.argv[2] || 'http://localhost:5214'
const UT = 'docs/qa/qa-efterarbete'
fs.mkdirSync(UT, { recursive: true })

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PIXEL7 = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const resultat = []

async function skapaKonto() {
  const email = `qa-efterarbete-${Date.now()}@jobbcoach-qa.test`
  const password = 'QaEfterarbete!2026'
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Efterarbete' },
  })
  if (error) throw new Error(error.message)
  const userId = data.user.id
  await vanta(600)
  const om7 = new Date(Date.now() + 7 * 864e5).toISOString()
  const { error: pErr } = await admin.from('profiles').upsert({
    id: userId,
    email,
    full_name: 'Anna Efterarbete',
    goal_role: 'Projektledare',
    location: 'Göteborg',
    subscription_tier: 'premium',
    premium_scope: 'allt',
    premium_until: om7,
    current_period_end: om7,
    premium_source: 'stripe',
    subscription_status: 'active',
    subscription_id: 'sub_qa_efterarbete',
    onboarding_track: 'allt',
  })
  if (pErr) throw new Error('profil: ' + pErr.message)
  // Tillstånd C på hemskärmen: ett CV, två brev, tre ansökningar varav en tyst.
  await admin.from('cv_texts').insert({
    user_id: userId,
    file_name: 'Anna_CV.pdf',
    original_file_path: `qa/${userId}/Anna_CV.pdf`,
    cv_text: 'Anna Andersson. Projektledare med sju års erfarenhet av IT-projekt i offentlig sektor.',
  })
  for (const [company, job_title] of [
    ['Volvo Cars', 'Projektledare IT'],
    ['Göteborgs Stad', 'Digitaliseringsstrateg'],
  ]) {
    await admin.from('letters').insert({ user_id: userId, title: `Brev till ${company}`, company, job_title, content: 'Hej! Jag söker tjänsten.', is_saved: true })
  }
  const nu = Date.now()
  const ansokningar = [
    { company: 'Volvo Cars', job_title: 'Projektledare IT', current_status: 'applied', dagar: 20 },
    { company: 'Göteborgs Stad', job_title: 'Digitaliseringsstrateg', current_status: 'applied', dagar: 3 },
    { company: 'Ericsson', job_title: 'Delivery Manager', current_status: 'interview_invited', dagar: 1 },
  ]
  for (const a of ansokningar) {
    const t = new Date(nu - a.dagar * 864e5).toISOString()
    const { error: aErr } = await admin.from('job_applications').insert({
      user_id: userId,
      company: a.company,
      job_title: a.job_title,
      current_status: a.current_status,
      applied_at: t.slice(0, 10),
      status_updated_at: t,
      created_at: t,
    })
    if (aErr) console.warn('ansökan', aErr.message)
  }
  return { email, password, userId }
}

async function raderaKonto(k) {
  if (!k) return
  for (const tabell of ['job_applications', 'letters', 'cv_texts', 'premium_grants', 'user_activities', 'email_schedule', 'email_log']) {
    await admin.from(tabell).delete().eq('user_id', k.userId).then(() => {}, () => {})
  }
  await admin.from('profiles').delete().eq('id', k.userId).then(() => {}, () => {})
  const { error } = await admin.auth.admin.deleteUser(k.userId)
  const { data } = await admin.auth.admin.getUserById(k.userId)
  console.log('QA-kontot raderat:', error ? error.message : 'ok', data?.user ? '(finns kvar!)' : '(borta ur auth.users)')
}

async function nySida(browser, vy) {
  // Varje vy i en egen inkognitokontext: inga cookies från en tidigare
  // inloggning, så en publik sida ses som av en ny besökare.
  const kontext = await browser.createBrowserContext()
  const p = await kontext.newPage()
  p.once('close', () => kontext.close().catch(() => {}))
  p.setDefaultNavigationTimeout(120000)
  if (vy === 'pixel7') await p.emulate(PIXEL7)
  else await p.setViewport({ width: 1280, height: 900 })
  const fel = []
  const posthog = []
  p.on('pageerror', (e) => fel.push('sidfel: ' + String(e).slice(0, 160)))
  p.on('console', (m) => {
    if (m.type() === 'error' && !/posthog|gtm|googletag|Failed to load resource: net::ERR_BLOCKED/i.test(m.text())) fel.push('konsol: ' + m.text().slice(0, 160))
  })
  p.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !u.includes('/_next/static')) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  p.on('request', (r) => {
    if (/posthog/i.test(r.url()) || r.url().includes('i.posthog.com')) posthog.push(r.url())
  })
  return { p, fel, posthog }
}

async function kontroll(p) {
  return p.evaluate(() => {
    const h1 = document.querySelectorAll('h1').length
    const scroll = document.documentElement.scrollWidth > window.innerWidth + 1
    return { h1, horisontellScroll: scroll }
  })
}

async function primarInomVy(p, selektor) {
  return p.evaluate((sel) => {
    const el = sel ? document.querySelector(sel) : document.querySelector('main a[href], main button')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return r.top >= 0 && r.bottom <= window.innerHeight
  }, selektor)
}

async function skarmdump(p, namn) {
  await p.screenshot({ path: `${UT}/${namn}.png` })
}

async function scrollaTill(p, sel) {
  await p.evaluate((s) => {
    const el = document.querySelector(s)
    el?.scrollIntoView({ block: 'center', behavior: 'instant' })
  }, sel)
  await vanta(500)
}

async function publikt(browser, vy) {
  // Artikel med reklamkort, som ny besökare utan cookies.
  {
    const { p, fel, posthog } = await nySida(browser, vy)
    await p.goto(BAS + '/artiklar/logiska-tester', { waitUntil: 'networkidle2' })
    const posthogForeScroll = posthog.length
    const bannerVantar = await p
      .waitForSelector('#jc-samtycke', { visible: true, timeout: 6000 })
      .then(() => true)
      .catch(() => false)
    await skarmdump(p, `artikel-${vy}`)
    const k = await kontroll(p)
    // Inline-kortet efter andra stycket: rubriken från copywriterns granskning.
    const inline = await p.evaluate(() => {
      const el = [...document.querySelectorAll('p, span, div')].find((e) => e.textContent?.trim() === 'Öva på frågorna innan de räknas')
      if (!el) return false
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      return true
    })
    await vanta(1500)
    await skarmdump(p, `artikel-reklamkort-${vy}`)
    const posthogEfterScroll = posthog.length
    // Samtycket: acceptera, bannern försvinner och kommer inte tillbaka.
    let samtycke = 'ingen banner'
    if (bannerVantar) {
      await p.click('#rcc-confirm-button')
      await vanta(300)
      const borta = !(await p.$('#jc-samtycke'))
      const kaka = (await p.cookies()).find((c) => c.name === 'cvBrevCookieConsent')?.value
      await p.reload({ waitUntil: 'networkidle2' })
      await vanta(3500)
      const igen = !!(await p.$('#jc-samtycke'))
      samtycke = `accepterad, borta ${borta}, cookie ${kaka}, visas igen ${igen}`
    }
    resultat.push({
      vy,
      sida: 'artikel /artiklar/logiska-tester',
      ...k,
      reklamkort: inline,
      samtycke,
      posthog: `före scroll ${posthogForeScroll} anrop, efter scroll ${posthogEfterScroll}`,
      fel: [...fel],
    })
    await p.close()
  }

  for (const [namn, vag, slutText] of [
    ['bli-upptackt', '/verktyg/bli-upptackt', 'Profilen och testerna gör du utan att betala'],
    ['linkedin-optimering', '/verktyg/linkedin-optimering', 'LinkedIn-optimeringen ingår i CV-veckan'],
  ]) {
    const { p, fel } = await nySida(browser, vy)
    await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })
    await p.goto(BAS + vag, { waitUntil: 'networkidle2' })
    await skarmdump(p, `${namn}-${vy}`)
    const k = await kontroll(p)
    const primar = await primarInomVy(p, 'main a[href="/register"]')
    // Slutpanelen.
    const slut = await p.evaluate((t) => {
      const el = [...document.querySelectorAll('p, div, span')]
        .filter((e) => e.textContent?.includes(t) && e.getClientRects().length > 0)
        .sort((a, b) => (a.textContent?.length ?? 0) - (b.textContent?.length ?? 0))[0]
      if (!el) return false
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      return true
    }, slutText)
    await vanta(400)
    await skarmdump(p, `${namn}-slutpanel-${vy}`)
    // Kostnadsfrågan i FAQ, öppnad.
    const faq = await p.evaluate(() => {
      const s = [...document.querySelectorAll('summary')].find((e) => /kostar/i.test(e.textContent ?? ''))
      if (!s) return null
      s.click()
      s.scrollIntoView({ block: 'start', behavior: 'instant' })
      return s.parentElement?.textContent?.slice(0, 400) ?? ''
    })
    await vanta(400)
    await skarmdump(p, `${namn}-faq-${vy}`)
    const schema = await p.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' ')
    )
    resultat.push({
      vy,
      sida: vag,
      ...k,
      primarInomVy: primar,
      slutpanel: slut,
      faq: faq ? faq.replace(/\s+/g, ' ').slice(0, 220) : 'saknas',
      schemaGratis: /gratis att synas|1 optimering gratis/i.test(schema),
      fel: [...fel],
    })
    await p.close()
  }
}

async function inloggat(browser, vy, konto) {
  const { p, fel } = await nySida(browser, vy)
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })
  await p.goto(BAS + '/login', { waitUntil: 'networkidle2' })
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('button[type="submit"]')])
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 30000 }).catch(() => {})
  await vanta(1500)
  const efterInloggning = new URL(p.url()).pathname
  if (!efterInloggning.startsWith('/dashboard')) {
    await p.goto(BAS + '/dashboard', { waitUntil: 'networkidle2' })
  }
  // Hård omladdning, som ägaren gör.
  await p.reload({ waitUntil: 'networkidle2' })
  await vanta(1500)
  await skarmdump(p, `hemskarm-${vy}`)
  const k = await kontroll(p)
  const hem = await p.evaluate(() => {
    const header = document.querySelector('[data-dashboard-header]')
    const hr = header?.getBoundingClientRect()
    const nav = document.querySelector('nav[aria-label]')
    const text = document.querySelector('main')?.innerText ?? ''
    const knapp = [...document.querySelectorAll('main a, main button')].find((e) => /Följ upp|Skriv|Öppna|Fortsätt/.test(e.textContent ?? ''))
    const kr = knapp?.getBoundingClientRect()
    return {
      header: !!hr && hr.top >= 0 && hr.height > 0,
      nastaHandling: /tysta i över två veckor|Följ upp/.test(text),
      primarInomVy: kr ? kr.top >= 0 && kr.bottom <= window.innerHeight : null,
      navSynlig: !!nav,
    }
  })
  // Sidomenyns antal (desktop): ur summeringen, direkt från servern.
  const antal = await p.evaluate(() =>
    [...document.querySelectorAll('aside a, nav a')]
      .map((a) => a.textContent?.replace(/\s+/g, ' ').trim())
      .filter((t) => /\d/.test(t ?? ''))
      .slice(0, 6)
  )
  // Klientnavigering till profilen och tillbaka: intoningen vid sidbyte.
  await p.goto(BAS + '/dashboard/profil', { waitUntil: 'networkidle2' })
  await vanta(800)
  await skarmdump(p, `profil-${vy}`)
  // Inloggad på en publik verktygssida: skickas till verktyget.
  await p.goto(BAS + '/verktyg/linkedin-optimering', { waitUntil: 'networkidle2' })
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 15000 }).catch(() => {})
  const vidare = new URL(p.url()).pathname
  await vanta(800)
  await skarmdump(p, `linkedin-inloggad-${vy}`)
  resultat.push({
    vy,
    sida: '/dashboard (inloggad, Allt, hård omladdning)',
    efterInloggning,
    ...k,
    ...hem,
    sidomenyAntal: antal,
    inloggadPaLinkedinSidan: vidare,
    fel: [...fel],
  })
  await p.close()
}

let konto = null
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
try {
  konto = await skapaKonto()
  for (const vy of ['pixel7', 'desktop']) {
    await publikt(browser, vy)
    await inloggat(browser, vy, konto)
  }
} catch (e) {
  console.error('QA avbröts:', e)
  resultat.push({ avbrott: String(e) })
} finally {
  await browser.close()
  await raderaKonto(konto)
}
fs.writeFileSync(`${UT}/qa-resultat.json`, JSON.stringify(resultat, null, 2))
console.log(JSON.stringify(resultat, null, 2))
