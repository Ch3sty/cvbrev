// scripts/qa-rummen-1a.mjs
// Klicktest av designomgången Rummen, våg 1a (docs/design/spec-rummen-2026-10-10.md,
// avsnitt 1 punkt 4 och avsnitt 6, våg 1a).
//
//   node scripts/qa-rummen-1a.mjs --port 5231 --fas fore
//   node scripts/qa-rummen-1a.mjs --port 5231 --fas efter
//
// Kräver en produktionsserver på porten (NEXT_DIST_DIR=.next-r1 npx next build,
// NEXT_DIST_DIR=.next-r1 npx next start -p 5231).
//
// Vad skriptet gör:
//  1. Skapar fyra engångskonton: gratis, Hela paketet via premium_grants, ett
//     med mycket data (fyra CV, fem brev, sex sökta tjänster, åtta
//     testsessioner) och ett super_admin för adminens diagram.
//  2. Fem vyer (dashboard, tester, CV, brev, profil) per konto, på Pixel 7 och
//     desktop 1280, i ljust och mörkt systemläge. Hård omladdning per vy
//     (cache av), skärmdump av första skärmen, kontroll av konsolfel, 4xx/5xx,
//     header och nav i bild, h1 i bild, ingen horisontell scroll. På Pixel 7
//     emuleras adressfältet med scrollTo på body: headern ska ligga kvar.
//  3. Acceptans 2 i våg 1a: tre vyer (dashboard, tester, profil) i tre lägen:
//     data-theme="dark" via localStorage.tema, systemets mörka läge utan
//     attribut, och data-theme="light" under mörkt systemläge. Golvets och
//     papperets beräknade färger skrivs till resultatet.
//  4. Adminens diagram (/admin, /admin/intakter, /admin/tratt) på desktop,
//     hela den inre scrollytan, före och efter tokenbytet.
//  5. Simulerat nätverksfel på profilens autospara: "Sparat" får inte synas.
//  6. Raderar alla konton och deras rader med id, aldrig med tidsfönster
//     (feedback_testdata_stadning).
//
// Resultat: docs/qa/rummen/vag-1a/<fas>/ (skärmdumpar) och resultat-<fas>.json.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

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

function arg(namn, fallback) {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const PORT = arg('port', '5231')
const FAS = arg('fas', 'efter')
const BARA = arg('bara') // 'vyer' | 'tema' | 'admin' | 'natfel'
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/rummen/vag-1a', FAS)
const KONTOFIL = path.resolve('scripts/.qa-rummen-1a-konton.json')
fs.mkdirSync(UT, { recursive: true })

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p))
if (!CHROME) throw new Error('Hittade ingen Chrome')

const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}

const VYER = [
  { namn: 'dashboard', path: '/dashboard' },
  { namn: 'tester', path: '/dashboard/tester' },
  { namn: 'cv', path: '/dashboard/profil/cv' },
  { namn: 'brev', path: '/dashboard/mina-brev' },
  { namn: 'profil', path: '/dashboard/profil' },
]

const ADMINVYER = [
  { namn: 'oversikt', path: '/admin' },
  { namn: 'intakter', path: '/admin/intakter' },
  { namn: 'tratt', path: '/admin/tratt' },
]

/** Brus som inte kommer från oss: tredjepartsskript som blockeras lokalt. */
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i]

const dag = (n) => new Date(Date.now() - n * 86400000).toISOString()

// ------------------------------------------------------------------ konton
async function skapaKonton() {
  const ts = Date.now()
  const ut = {}
  const losen = 'QaRummen1a!' + ts
  for (const namn of ['gratis', 'hela', 'mycket', 'admin']) {
    const email = `qa-rummen-1a-${namn}-${ts}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: losen,
      email_confirm: true,
      user_metadata: { full_name: `Anna ${namn}`, password_set: true },
    })
    if (error) throw new Error(`${namn}: ${error.message}`)
    const id = data.user.id
    ut[namn] = { email, id }
    fs.writeFileSync(KONTOFIL, JSON.stringify(ut, null, 2))
    await new Promise((r) => setTimeout(r, 500))
    const profil = { id, email, full_name: `Anna Andersson`, goal_role: 'Projektledare', location: 'Göteborg' }
    if (namn === 'hela' || namn === 'mycket') {
      const om30 = new Date(Date.now() + 30 * 86400000).toISOString()
      Object.assign(profil, { subscription_tier: 'premium', premium_until: om30, premium_source: 'onetime_30d' })
    }
    const { error: pErr } = await sb.from('profiles').upsert(profil)
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)

    if (namn === 'hela' || namn === 'mycket') {
      const om30 = new Date(Date.now() + 30 * 86400000).toISOString()
      const { error: gErr } = await sb.from('premium_grants').insert({
        user_id: id,
        stripe_event_id: `qa_rummen_1a_${namn}_${ts}`,
        days: 30,
        source: 'onetime_30d',
        scope: 'allt',
        premium_until_after: om30,
      })
      if (gErr) throw new Error(`grant ${namn}: ${gErr.message}`)
    }

    if (namn === 'mycket') {
      const cvText =
        'Anna Andersson. Projektledare med sju års erfarenhet av IT-projekt i offentlig sektor. Upphandling, agila team, budgetansvar på 12 miljoner kronor.'
      const cv = []
      for (let i = 0; i < 4; i++) {
        cv.push({ user_id: id, file_name: `Anna_CV_${i + 1}.pdf`, original_file_path: `qa/${id}/cv${i}.pdf`, cv_text: cvText, created_at: dag(20 - i * 4) })
      }
      const { error: cvErr } = await sb.from('cv_texts').insert(cv)
      if (cvErr) console.warn('cv', cvErr.message)

      const foretag = ['Klarna', 'Volvo Cars', 'Region Västra Götaland', 'Spotify', 'Ericsson']
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
      if (bErr) console.warn('brev', bErr.message)

      const ans = ['Klarna', 'Volvo Cars', 'Region Västra Götaland', 'Spotify', 'Ericsson', 'Saab'].map((f, i) => ({
        user_id: id,
        job_title: 'Projektledare',
        company: f,
        application_channel: 'ad',
        letter_id: brevRader?.[i]?.id ?? null,
        applied_at: dag(30 - i * 5),
        current_status: 'applied',
      }))
      const { error: aErr } = await sb.from('job_applications').insert(ans)
      if (aErr) console.warn('ansökningar', aErr.message)

      const typer = ['matrislogik', 'matrislogik', 'matrislogik', 'matrislogik-expert', 'numerical-reasoning', 'verbal-resonemang', 'matrislogik', 'matrislogik']
      const sess = typer.map((t, i) => ({
        user_id: id,
        test_type: t,
        started_at: dag(14 - i),
        completed_at: dag(14 - i),
        score: 8 + (i % 5),
        answers: [],
      }))
      const { error: sErr } = await sb.from('logic_test_v4_sessions').insert(sess)
      if (sErr) console.warn('sessioner', sErr.message)
    }

    if (namn === 'admin') {
      const { error: adErr } = await sb.from('admin_users').insert({ id, role: 'super_admin' })
      if (adErr) throw new Error('super_admin: ' + adErr.message)
    }
    console.log('skapad', namn, email)
  }
  return ut
}

async function raderaKonton() {
  if (!fs.existsSync(KONTOFIL)) return
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  for (const [namn, k] of Object.entries(konton)) {
    // Räkna först, radera sedan med kontots id. Aldrig tidsfönster.
    for (const t of [
      'job_application_events',
      'job_applications',
      'letters',
      'cv_texts',
      'logic_test_v4_sessions',
      'premium_grants',
      'user_activities',
      'email_schedule',
      'email_log',
      'cv_analysis_jobs',
    ]) {
      const { count } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
      if (count) {
        const { error } = await sb.from(t).delete().eq('user_id', k.id)
        console.log(`  ${namn} ${t}: ${count} rader ${error ? 'FEL ' + error.message : 'raderade'}`)
      }
    }
    if (namn === 'admin') await sb.from('admin_users').delete().eq('id', k.id)
    await sb.from('profiles').delete().eq('id', k.id)
    const { error } = await sb.auth.admin.deleteUser(k.id)
    console.log('raderad', namn, k.id, error ? error.message : 'ok')
  }
  fs.unlinkSync(KONTOFIL)
}

// ------------------------------------------------------------------ sessioner
const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
const payloadCache = new Map()

async function payloadFor(email) {
  if (payloadCache.has(email)) return payloadCache.get(email)
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } }).auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const p =
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
  payloadCache.set(email, p)
  return p
}

/**
 * Ny sida. form: 'pixel7' | 'desktop'. system: 'light' | 'dark' (prefers-color-scheme).
 * tema: undefined | 'ljust' | 'morkt' | 'system' skrivs till localStorage före första skriptet.
 */
async function nySida(browser, { form, system, email, tema }) {
  const page = await browser.newPage()
  if (form === 'pixel7') await page.emulate(PIXEL)
  else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
  const cdp = await page.createCDPSession()
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })

  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  // Samtycket besvarat, så bannern inte täcker navet i varje skärmdump.
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })

  await page.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      if (t) localStorage.setItem('tema', t)
      else localStorage.removeItem('tema')
    } catch {}
  }, tema ?? null)

  const logg = { konsol: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const t = m.text()
      if (!BRUS.some((r) => r.test(t))) logg.konsol.push(t.slice(0, 300))
    }
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && (u.startsWith(BAS) || u.includes('supabase.co')) && !BRUS.some((x) => x.test(u))) {
      logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 160)}`)
    }
  })
  return { page, logg }
}

async function kontroll(page, form) {
  return page.evaluate((form) => {
    const iBild = (el) => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && s.visibility !== 'hidden' && s.display !== 'none'
    }
    const header = document.querySelector('[data-dashboard-header]')
    const nav = document.querySelector('nav[aria-label="Huvudnavigation"]')
    const h1 = document.querySelector('main h1') || document.querySelector('h1')
    const main = document.querySelector('main.dashboard-main-content') || document.querySelector('main')
    const skal = document.querySelector('[data-rum]')
    const rot = getComputedStyle(document.documentElement)
    const kort = document.querySelector('main .bg-panel')
    return {
      header: iBild(header),
      nav: form === 'pixel7' ? iBild(nav) : null,
      h1: iBild(h1),
      h1Text: h1?.textContent?.trim().slice(0, 80) ?? null,
      horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      dataTheme: document.documentElement.dataset.theme ?? null,
      dataRum: skal?.getAttribute('data-rum') ?? null,
      colorScheme: rot.colorScheme,
      golv: main ? getComputedStyle(main).backgroundColor : null,
      papper: kort ? getComputedStyle(kort).backgroundColor : null,
      ink1: main ? getComputedStyle(main).getPropertyValue('--ink-1').trim() : null,
      accent: main ? getComputedStyle(main).getPropertyValue('--accent').trim() : null,
    }
  }, form)
}

async function besok(page, url) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  // Hård omladdning (cachen är av i CDP), så vi ser serverns första HTML.
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 1200))
}

// ------------------------------------------------------------------ körning
const resultat = { fas: FAS, bas: BAS, tid: new Date().toISOString(), vyer: [], tema: [], admin: [], natfel: null }

async function main() {
  const konton = await skapaKonton()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  try {
    // 2. Fem vyer × tre konton × två former × två systemlägen.
    if (!BARA || BARA === 'vyer') {
      for (const konto of ['gratis', 'hela', 'mycket']) {
        for (const form of ['pixel7', 'desktop']) {
          for (const system of ['light', 'dark']) {
            for (const vy of VYER) {
              const { page, logg } = await nySida(browser, { form, system, email: konton[konto].email })
              try {
                await besok(page, BAS + vy.path)
                const k = await kontroll(page, form)
                const fil = `${konto}-${form}-${system === 'light' ? 'ljust' : 'morkt'}-${vy.namn}.png`
                await page.screenshot({ path: path.join(UT, fil) })
                let adressfalt = null
                if (form === 'pixel7') {
                  // Adressfältet: rulla body som mobil Chrome gör när fältet döljs.
                  await page.evaluate(() => {
                    window.scrollTo(0, 120)
                    document.body.scrollTo?.(0, 120)
                  })
                  await new Promise((r) => setTimeout(r, 300))
                  adressfalt = await page.evaluate(() => {
                    const h = document.querySelector('[data-dashboard-header]')
                    return { headerTopp: h ? Math.round(h.getBoundingClientRect().top) : null, scrollY: Math.round(window.scrollY) }
                  })
                }
                resultat.vyer.push({ konto, form, system, vy: vy.namn, fil, ...k, adressfalt, konsol: logg.konsol, http: logg.http })
                const fel = []
                if (!k.header) fel.push('header ur bild')
                if (form === 'pixel7' && !k.nav) fel.push('nav ur bild')
                if (!k.h1) fel.push('h1 ur bild')
                if (k.horisontellScroll) fel.push('horisontell scroll')
                if (logg.konsol.length) fel.push(`${logg.konsol.length} konsolfel`)
                if (logg.http.length) fel.push(`${logg.http.length} 4xx/5xx`)
                console.log(`${fil.padEnd(44)} ${fel.length ? 'ANM: ' + fel.join(', ') : 'ok'}  golv ${k.golv} papper ${k.papper}`)
              } finally {
                await page.close()
              }
            }
          }
        }
      }
    }

    // 3. Acceptans 2: tre vyer i tre lägen, Pixel 7, kontot med mycket data.
    if (!BARA || BARA === 'tema') {
      const LAGEN = [
        { namn: 'attribut-morkt', system: 'light', tema: 'morkt' },
        { namn: 'system-morkt', system: 'dark', tema: undefined },
        { namn: 'attribut-ljust-under-morkt-system', system: 'dark', tema: 'ljust' },
      ]
      for (const lage of LAGEN) {
        for (const vy of VYER.filter((v) => ['dashboard', 'tester', 'profil'].includes(v.namn))) {
          const { page, logg } = await nySida(browser, { form: 'pixel7', system: lage.system, email: konton.mycket.email, tema: lage.tema })
          try {
            await besok(page, BAS + vy.path)
            const k = await kontroll(page, 'pixel7')
            const fil = `tema-${lage.namn}-${vy.namn}.png`
            await page.screenshot({ path: path.join(UT, fil) })
            resultat.tema.push({ lage: lage.namn, vy: vy.namn, fil, ...k, konsol: logg.konsol, http: logg.http })
            console.log(`${fil.padEnd(52)} theme=${k.dataTheme} scheme=${k.colorScheme} golv ${k.golv} papper ${k.papper}`)
          } finally {
            await page.close()
          }
        }
      }
    }

    // 4. Adminens diagram, desktop, hela scrollytan.
    if (!BARA || BARA === 'admin') {
      for (const system of ['light', 'dark']) {
        for (const vy of ADMINVYER) {
          const { page, logg } = await nySida(browser, { form: 'desktop', system, email: konton.admin.email })
          try {
            await besok(page, BAS + vy.path)
            try {
              await page.waitForFunction(() => document.querySelectorAll('.recharts-surface').length > 0, { timeout: 10000 })
            } catch {}
            await new Promise((r) => setTimeout(r, 1200))
            const hojd = await page.evaluate(() => {
              const m = document.querySelector('main.overflow-y-auto')
              return m ? Math.max(m.scrollHeight, m.clientHeight) : Math.max(document.body.scrollHeight, innerHeight)
            })
            await page.setViewport({ width: 1280, height: Math.min(Math.ceil(hojd) + 40, 9000), deviceScaleFactor: 1 })
            await new Promise((r) => setTimeout(r, 900))
            const farger = await page.evaluate(() => {
              const r = getComputedStyle(document.documentElement)
              const fills = new Set()
              document.querySelectorAll('.recharts-surface path, .recharts-surface rect, [class*="bg-diagram"]').forEach((el) => {
                const s = getComputedStyle(el)
                if (el.getAttribute('stroke')) fills.add('stroke ' + el.getAttribute('stroke'))
                if (el.getAttribute('fill')) fills.add('fill ' + el.getAttribute('fill'))
                if (el.className && String(el.className.baseVal ?? el.className).includes('bg-diagram')) fills.add('bg ' + s.backgroundColor)
              })
              return {
                diagramCv: r.getPropertyValue('--diagram-cv').trim(),
                diagramTest: r.getPropertyValue('--diagram-test').trim(),
                ink1: r.getPropertyValue('--ink-1').trim(),
                antalDiagram: document.querySelectorAll('.recharts-surface').length,
                farger: [...fills].slice(0, 40),
              }
            })
            // Före och efter bredvid varandra i vag-1a/admin/ (spec våg 1a, acceptans 4).
            const fil = `${FAS}-admin-${system === 'light' ? 'ljust' : 'morkt'}-${vy.namn}.png`
            const adminUt = path.resolve('docs/qa/rummen/vag-1a/admin')
            fs.mkdirSync(adminUt, { recursive: true })
            await page.screenshot({ path: path.join(adminUt, fil) })
            resultat.admin.push({ system, vy: vy.namn, fil: '../admin/' + fil, ...farger, konsol: logg.konsol, http: logg.http })
            console.log(`admin/${fil.padEnd(30)} cv=${farger.diagramCv} test=${farger.diagramTest} diagram=${farger.antalDiagram}`)
          } finally {
            await page.close()
          }
        }
      }
    }

    // 5. Nätverksfel på profilens autospara. Inget får säga "Sparat".
    if (!BARA || BARA === 'natfel') {
      const { page, logg } = await nySida(browser, { form: 'pixel7', system: 'light', email: konton.gratis.email })
      try {
        await besok(page, BAS + '/dashboard/profil')
        await page.setRequestInterception(true)
        let avbrutna = 0
        page.on('request', (req) => {
          const m = req.method()
          if ((m === 'POST' || m === 'PATCH' || m === 'PUT') && (req.url().includes('/rest/v1/') || req.url().includes('/api/'))) {
            avbrutna++
            req.abort('internetdisconnected')
          } else req.continue()
        })
        const falt = await page.$('main input[type="text"], main input:not([type])')
        let sparatSyns = null
        if (falt) {
          await falt.click({ clickCount: 3 })
          await falt.type('Malmö')
          await page.evaluate(() => document.activeElement?.blur())
          await new Promise((r) => setTimeout(r, 2500))
          sparatSyns = await page.evaluate(() => /\bSparat\b/.test(document.querySelector('main')?.innerText ?? ''))
        }
        await page.screenshot({ path: path.join(UT, 'natfel-profil-autospara.png') })
        resultat.natfel = { avbrutna, sparatSyns, faltHittat: !!falt, konsol: logg.konsol.length }
        console.log('nätverksfel profil:', resultat.natfel)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, `resultat-${FAS}.json`), JSON.stringify(resultat, null, 2))
    await raderaKonton()
  }
}

main().catch(async (e) => {
  console.error(e)
  await raderaKonton().catch(() => {})
  process.exit(1)
})
