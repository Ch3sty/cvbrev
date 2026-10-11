// scripts/qa-rummen-4.mjs
// Klicktest av designomgången Rummen, våg 4 (docs/design/spec-rummen-2026-10-10.md,
// avsnitt 1 punkt 4 och avsnitt 6 våg 4): CV-rummet (C1), brevrummet (B1),
// Jobbsöket (J1, J2), landningen i senaste rummet och "Spara som sökt tjänst".
// Byggt ur qa-rummen-4.mjs; vyer, ssr, dörrar, sidomeny och tema är samma
// kontroller som i 1b.
//
//   node scripts/qa-rummen-4.mjs --port 5244                 # allt
//   node scripts/qa-rummen-4.mjs --port 5244 --bara vyer     # en del
//   node scripts/qa-rummen-4.mjs --port 5244 --behall        # behåll kontona
//   node scripts/qa-rummen-4.mjs --radera                    # radera sparade konton
//   node scripts/qa-rummen-4.mjs --prefix qa-klar3 ...       # egna, unika adresser per körning
//
// --prefix ger adresserna <prefix>-<roll>-<tid>@jobbcoach-qa.test och en egen
// kontofil, så att två agenter aldrig delar konton (feedback_testdata_stadning,
// tillägget 2026-10-11).
//
// Kräver en produktionsserver (NEXT_DIST_DIR=.next-v4 npx next build,
// NEXT_DIST_DIR=.next-v4 npx next start -p 5244).
//
// Delar (--bara): vyer, ssr, dorrar, sidomeny, tema (som 1b) och
//   landning  /dashboard utan referens landar i rummet ur registreringens val
//             (gratiskontot har valt CV); med en referens inne i appen, och via
//             dörren till Jobbsöket, står Jobbsöket kvar.
//   spara     "Spara som sökt tjänst" i brevvyn: nätverksfel på POST ger aldrig
//             "sparad", ett lyckat POST ger raden i Sökta tjänster.
//
// Konton qa-rummen-4-*@jobbcoach-qa.test skapas med id och raderas med id,
// aldrig med tidsfönster (feedback_testdata_stadning). Antalet rader räknas
// före varje delete och skrivs ut.
//
// Resultat: docs/qa/rummen/vag-4/ (skärmdumpar i undermappar) och resultat.json.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'
import { QA_ANALYS } from './qa-rummen-4-analys.mjs'

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
const flagga = (namn) => process.argv.includes('--' + namn)

const PORT = arg('port', '5232')
const BARA = arg('bara') ? arg('bara').split(',') : null
const BEHALL = flagga('behall')
const ROUTEFILTER = arg('routes') ? arg('routes').split(',') : null
const KONTOFILTER = arg('konton') ? arg('konton').split(',') : null
const FORMFILTER = arg('former') ? arg('former').split(',') : null
const BAS = `http://localhost:${PORT}`
// --ut docs/qa/rummen/vag-4/efter-granskning för omkörningen efter spec 16.
const UT = path.resolve(arg('ut', 'docs/qa/rummen/vag-4'))
const PREFIX = arg('prefix', 'qa-rummen-4')
if (!/^qa-[a-z0-9-]+$/.test(PREFIX)) throw new Error('--prefix måste börja med qa- och bara ha a-z, 0-9 och -')
const KONTOFIL = path.resolve(`scripts/.${PREFIX}-konton.json`)
const RESULTATFIL = path.join(UT, BARA ? `resultat-${BARA.join('-')}.json` : 'resultat.json')
fs.mkdirSync(UT, { recursive: true })
const STANDARD = ['ssr', 'dorrar', 'sidomeny', 'tema', 'landning', 'vyer', 'spara']
const kor = (del) => (BARA ? BARA.includes(del) : STANDARD.includes(del))

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
const SMAL = { ...PIXEL, viewport: { ...PIXEL.viewport, width: 360, height: 780 } }

// Rummets vägg per rum (src/lib/rum/rum.ts, VAGG_FARG).
const VAGG = { tran: '#1b2246', cv: '#113538', brev: '#3a1930', jobb: '#1b3324', neutral: '#26262c' }

function rumForPath(p) {
  p = p.split('?')[0].replace(/\/+$/, '') || '/dashboard'
  const under = (x) => p === x || p.startsWith(x + '/')
  if (under('/dashboard/tester')) return 'tran'
  if (['/dashboard/profil/cv', '/dashboard/skapa-cv', '/dashboard/cv-analys', '/dashboard/cv-mallar', '/dashboard/linkedin-optimizer'].some(under)) return 'cv'
  if (['/dashboard/mina-brev', '/dashboard/skapa-brev'].some(under)) return 'brev'
  if (['/dashboard/profil', '/dashboard/valj-spar', '/dashboard/kontakt', '/dashboard/bugg-feedback', '/dashboard/valkommen', '/dashboard/vecka'].some(under)) return 'neutral'
  return 'jobb'
}

// Routes: listan i scripts/perf-inloggat.ts, samma namn, plus några till.
const ROUTES = [
  { namn: 'dashboard', path: '/dashboard' },
  { namn: 'profil', path: '/dashboard/profil' },
  { namn: 'profil-cv', path: '/dashboard/profil/cv' },
  { namn: 'prenumeration', path: '/dashboard/profil/prenumeration' },
  { namn: 'sokta-tjanster', path: '/dashboard/sokta-tjanster' },
  { namn: 'sokta-tjanster-id', path: '/dashboard/sokta-tjanster/ID', dyn: 'application' },
  { namn: 'mina-brev', path: '/dashboard/mina-brev' },
  { namn: 'mina-brev-id', path: '/dashboard/mina-brev/ID', dyn: 'letter' },
  { namn: 'mina-brev-id-edit', path: '/dashboard/mina-brev/ID/edit', dyn: 'letter' },
  { namn: 'cv-mallar', path: '/dashboard/cv-mallar' },
  { namn: 'cv-mallar-vald', path: '/dashboard/cv-mallar?mall=modern' },
  { namn: 'tester', path: '/dashboard/tester' },
  { namn: 'tester-slug', path: '/dashboard/tester/matrislogik-grund' },
  { namn: 'tester-personlighet', path: '/dashboard/tester/personlighet-grund' },
  { namn: 'tester-provlaget', path: '/dashboard/tester/matrislogik-prov' },
  { namn: 'intervju', path: '/dashboard/intervju' },
  { namn: 'bli-upptackt', path: '/dashboard/bli-upptackt' },
  { namn: 'meddelanden', path: '/dashboard/meddelanden' },
  { namn: 'kontakt', path: '/dashboard/kontakt' },
  { namn: 'bugg-feedback', path: '/dashboard/bugg-feedback' },
  { namn: 'tester-prov', path: '/dashboard/tester/matrislogik-grund/test/ID', dyn: 'testSession', flode: true },
  { namn: 'tester-resultat', path: '/dashboard/tester/matrislogik-grund/test/ID/results', dyn: 'testResult' },
  { namn: 'skapa-brev', path: '/dashboard/skapa-brev', flode: true },
  { namn: 'skapa-cv', path: '/dashboard/skapa-cv', flode: true },
  { namn: 'cv-analys', path: '/dashboard/cv-analys' },
  { namn: 'jobbmatchning', path: '/dashboard/jobbmatchning' },
  { namn: 'jobbcoachen', path: '/dashboard/jobbcoachen' },
  { namn: 'linkedin-optimizer', path: '/dashboard/linkedin-optimizer', flodeOmTillgang: true },
  { namn: 'arbetsstil', path: '/dashboard/arbetsstil' },
]
// Routes för gratis- och hela-kontona (allt för kontot med mycket data).
const KORTLISTA = ['dashboard', 'tester', 'tester-slug', 'profil-cv', 'mina-brev', 'sokta-tjanster', 'profil', 'prenumeration', 'intervju', 'cv-mallar', 'linkedin-optimizer', 'kontakt']

/** Brus som inte kommer från oss: tredjepartsskript som blockeras lokalt. */
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /ERR_INTERNET_DISCONNECTED/i]

const dag = (n) => new Date(Date.now() - n * 86400000).toISOString()
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

// ------------------------------------------------------------------ konton
async function skapaKonton() {
  if (fs.existsSync(KONTOFIL)) {
    const k = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
    if (k.gratis && k.hela && k.mycket) {
      console.log('återanvänder konton i', KONTOFIL)
      return k
    }
  }
  const ts = Date.now()
  const ut = {}
  const losen = 'QaRummen4!' + ts
  for (const namn of ['gratis', 'hela', 'mycket']) {
    const email = `${PREFIX}-${namn}-${ts}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: losen,
      email_confirm: true,
      user_metadata: { full_name: 'Anna Andersson', password_set: true },
    })
    if (error) throw new Error(`${namn}: ${error.message}`)
    const id = data.user.id
    ut[namn] = { email, id, dyn: {} }
    fs.writeFileSync(KONTOFIL, JSON.stringify(ut, null, 2))
    await vanta(500)
    const profil = { id, email, full_name: 'Anna Andersson', goal_role: 'Projektledare', location: 'Göteborg' }
    if (namn === 'gratis') profil.onboarding_intent = 'cv'
    if (namn !== 'gratis') {
      const om30 = new Date(Date.now() + 30 * 86400000).toISOString()
      Object.assign(profil, { subscription_tier: 'premium', premium_until: om30, premium_source: 'onetime_30d' })
    }
    const { error: pErr } = await sb.from('profiles').upsert(profil)
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)

    if (namn !== 'gratis') {
      const om30 = new Date(Date.now() + 30 * 86400000).toISOString()
      const { error: gErr } = await sb.from('premium_grants').insert({
        user_id: id,
        stripe_event_id: `${PREFIX.replace(/-/g, '_')}_${namn}_${ts}`,
        days: 30,
        source: 'onetime_30d',
        scope: 'allt',
        premium_until_after: om30,
      })
      if (gErr) throw new Error(`grant ${namn}: ${gErr.message}`)
    }

    if (namn === 'hela') {
      const { data: hCv, error: hErr } = await sb
        .from('cv_texts')
        .insert({
          user_id: id,
          file_name: 'Anna_CV.pdf',
          original_file_path: `qa/${id}/cv.pdf`,
          cv_text: 'Anna Andersson. Projektledare med sju års erfarenhet av IT-projekt i offentlig sektor. Göteborg.',
          created_at: dag(3),
        })
        .select('id')
        .single()
      if (hErr) console.warn('cv hela', hErr.message)
      // En sparad analys, så att "Åtgärda i CV:t" kan öppnas (21.3 punkt 2).
      if (hCv) {
        const { data: hJobb, error: hjErr } = await sb
          .from('cv_analysis_jobs')
          .insert({ user_id: id, cv_id: hCv.id, status: 'completed', display_name: 'Projektledare, Volvo Cars', created_at: dag(1), completed_at: dag(1), result: QA_ANALYS })
          .select('id')
          .single()
        if (hjErr) console.warn('analys hela', hjErr.message)
        ut[namn].dyn = { analysJob: hJobb?.id ?? null, cv: hCv.id }
        fs.writeFileSync(KONTOFIL, JSON.stringify(ut, null, 2))
      }
    }

    if (namn === 'mycket') {
      const cvText =
        'Anna Andersson. Projektledare med sju års erfarenhet av IT-projekt i offentlig sektor. Upphandling, agila team, budgetansvar på 12 miljoner kronor. Göteborg.'
      const cv = []
      for (let i = 0; i < 4; i++) {
        cv.push({ user_id: id, file_name: `Anna_CV_${i + 1}.pdf`, original_file_path: `qa/${id}/cv${i}.pdf`, cv_text: cvText, created_at: dag(20 - i * 4) })
      }
      const { data: cvRader, error: cvErr } = await sb.from('cv_texts').insert(cv).select('id, file_name, created_at')
      if (cvErr) console.warn('cv', cvErr.message)
      const senasteCv = [...(cvRader ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
      if (senasteCv) {
        const { data: anRad, error: anErr } = await sb.from('cv_analysis_jobs').insert({
          user_id: id,
          cv_id: senasteCv.id,
          status: 'completed',
          display_name: 'Projektledare, Västra Götalandsregionen',
          created_at: dag(2),
          completed_at: dag(2),
          result: {
            analysisType: 'premium',
            atsFriendliness: { score: 72, feedback: 'Sammanfattningen saknar yrkesroll och antal år.', missingKeywords: [] },
            profileSummary: { atsImpact: 9, changes: ['Yrkesroll och år först'], currentText: 'Driven person.', improvedText: 'Projektledare med sju år i offentlig sektor.' },
            roleBasedImprovements: [
              { roleTitle: 'Projektledare', company: 'Västra Götalandsregionen', period: '2019-2026', atsImpact: 5, currentText: 'Ansvarade för projekt.', suggestedText: 'Ledde åtta IT-projekt.', improvements: { keywords: [], grammarIssues: [], atsOptimization: true, hasQuantification: false } },
            ],
            skillSuggestions: [
              { skill: 'SAP', atsImpact: 4, source: 'annons', reasoning: 'Står i annonsen.', relevance: 'hög' },
              { skill: 'Agil projektledning', atsImpact: 3, source: 'annons', reasoning: 'Står i annonsen.', relevance: 'hög' },
            ],
            generalImprovements: [{ title: 'Datumformat', category: 'format', atsImpact: 2, description: 'Blandade datumformat i erfarenheten.' }],
            structuredCV: QA_ANALYS.structuredCV,
          },
        }).select('id').single()
        if (anErr) console.warn('analys', anErr.message)
        ut[namn].analysJob = anRad?.id ?? null
      }

      const foretag = ['Klarna', 'Volvo Cars', 'Region Västra Götaland', 'Spotify', 'Ericsson']
      const brev = foretag.map((f, i) => ({
        user_id: id,
        title: `Projektledare, ${f}`,
        company: f,
        job_title: 'Projektledare',
        content:
          i === 0
            ? `Hej,\n\nJag söker tjänsten som projektledare hos ${f}. Under sju år har jag lett agila team i Scrum och arbetat nära utvecklare med SQL och Git.\n\nVänliga hälsningar\nAnna Andersson`
            : `Hej,\n\nJag söker tjänsten som projektledare hos ${f}. Under sju år har jag lett IT-projekt i offentlig sektor.\n\nVänliga hälsningar\nAnna Andersson`,
        tonality: 'professionell',
        job_description:
          i === 0
            ? 'Vi söker en projektledare som leder utvecklingsteam i Scrum och Agile. Du har god förståelse för SQL och Azure, och har arbetat med Git i en DevOps-miljö.'
            : 'Vi söker en projektledare.',
        cv_text: cvText,
        is_saved: true,
        language: 'sv',
        created_at: dag(18 - i * 3),
        updated_at: dag(18 - i * 3),
      }))
      const { data: brevRader, error: bErr } = await sb.from('letters').insert(brev).select('id')
      if (bErr) console.warn('brev', bErr.message)

      const LAGEN = [
        ['Volvo Cars', 'interview_invited', 22, 1],
        ['Region Västra Götaland', 'applied', 16, 16],
        ['Spotify', 'no_response', 9, 3],
        ['Ericsson', 'interview_completed', 25, 4],
        ['Saab', 'applied', 4, 4],
      ]
      const ans = LAGEN.map(([f, status, sokt, andrad], i) => ({
        user_id: id,
        job_title: 'Projektledare',
        company: f,
        application_channel: 'ad',
        letter_id: brevRader?.[i + 1]?.id ?? null,
        applied_at: dag(sokt).slice(0, 10),
        current_status: status,
        status_updated_at: dag(andrad),
        created_at: dag(sokt),
      }))
      const { data: ansRader, error: aErr } = await sb.from('job_applications').insert(ans).select('id')
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
      const { data: sessRader, error: sErr } = await sb.from('logic_test_v4_sessions').insert(sess).select('id, test_type')
      if (sErr) console.warn('sessioner', sErr.message)
      const { data: pagaende, error: pgErr } = await sb
        .from('logic_test_v4_sessions')
        .insert({ user_id: id, test_type: 'matrislogik', started_at: new Date().toISOString(), answers: [] })
        .select('id')
      if (pgErr) console.warn('pågående session', pgErr.message)

      ut[namn].dyn = {
        letter: brevRader?.[0]?.id ?? null,
        application: ansRader?.[0]?.id ?? null,
        testResult: sessRader?.find((s) => s.test_type === 'matrislogik')?.id ?? null,
        testSession: pagaende?.[0]?.id ?? null,
        analysJob: ut[namn].analysJob ?? null,
      }
      fs.writeFileSync(KONTOFIL, JSON.stringify(ut, null, 2))
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
      'formatted_cv_downloads',
      'user_ui_flags',
      'notifications',
    ]) {
      const { count, error: cErr } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
      if (cErr) continue
      if (count) {
        const { error } = await sb.from(t).delete().eq('user_id', k.id)
        console.log(`  ${namn} ${t}: ${count} rader ${error ? 'FEL ' + error.message : 'raderade'}`)
      }
    }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
    await sb.from('profiles').delete().eq('id', k.id)
    const { error } = await sb.auth.admin.deleteUser(k.id)
    console.log(`raderad ${namn} ${k.id} (profiles: ${pc ?? 0}) ${error ? error.message : 'ok'}`)
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
  const { data: s, error } = await sb.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
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
 * Ny sida. form: 'pixel7' | 'smal' | 'desktop'. system: 'light' | 'dark'.
 * tema: undefined | 'ljust' | 'morkt' skrivs till localStorage före första skriptet.
 */
async function nySida(browser, { form, system, email, tema, js = true }) {
  const page = await browser.newPage()
  if (form === 'pixel7') await page.emulate(PIXEL)
  else if (form === 'smal') await page.emulate(SMAL)
  else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
  if (!js) await page.setJavaScriptEnabled(false)
  const cdp = await page.createCDPSession()
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })

  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })

  await page.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      // E-postbannern avfärdad, så den inte ligger i varje skärmdump.
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
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

async function besok(page, url) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000, referer: BAS + '/dashboard/profil' })
  // Hård omladdning (cachen är av i CDP), så vi ser serverns första HTML.
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 })
  await vanta(1200)
}

/** Kontrollerna per vy. Körs i sidan. */
async function kontroll(page, form) {
  return page.evaluate((form) => {
    const iBild = (el) => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && s.visibility !== 'hidden' && s.display !== 'none'
    }
    const rgb = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const [r, g, b, a = '1'] = m[1].split(/,\s*/)
      return { r: +r, g: +g, b: +b, a: +a }
    }
    const lum = ({ r, g, b }) => {
      const f = (c) => {
        c /= 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const kontrast = (a, b) => {
      const l1 = lum(a)
      const l2 = lum(b)
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    }
    const bakgrund = (el) => {
      let e = el
      while (e && e !== document.documentElement) {
        const c = rgb(getComputedStyle(e).backgroundColor)
        if (c && c.a > 0.5) return { c, el: e }
        // Väggens toning är en bakgrundsbild: räkna mot --vagg.
        const bi = getComputedStyle(e).backgroundImage
        if (bi && bi.includes('gradient') && e.classList.contains('vagg')) {
          const v = getComputedStyle(e).getPropertyValue('--vagg').trim()
          const hex = v.replace('#', '')
          return { c: { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), a: 1 }, el: e }
        }
        if (bi && bi.includes('gradient') && e.classList.contains('knapp-primar')) {
          return { c: { r: 224, g: 122, b: 47, a: 1 }, el: e }
        }
        e = e.parentElement
      }
      return { c: rgb(getComputedStyle(document.body).backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 }, el: document.body }
    }

    const topprad = document.querySelector('[data-topprad]')
    const nav = document.querySelector('nav[aria-label="Huvudmeny"]')
    const sidomeny = document.querySelector('nav[aria-label="Sidomeny"]')
    const flodeHuvud = document.querySelector('.fixed.inset-0.z-50 header')
    const h1 = [...document.querySelectorAll('h1')].find((h) => iBild(h)) || document.querySelector('h1')
    const skal = document.querySelector('[data-rum]')
    const meta = document.querySelector('meta[name="theme-color"]')
    const koppar = [...document.querySelectorAll('.knapp-primar')].filter((k) => {
      const s = getComputedStyle(k)
      return s.display !== 'none' && s.visibility !== 'hidden' && k.getClientRects().length > 0
    })
    const forstaKoppar = koppar[0]
    const kr = forstaKoppar ? forstaKoppar.getBoundingClientRect() : null

    // Vita ytor i mörkt läge (utanför dokumenten, som ska vara vita).
    const morkt = getComputedStyle(document.documentElement).colorScheme === 'dark'
    const vita = []
    const lagKontrast = []
    if (morkt) {
      for (const el of document.querySelectorAll('main *, [role="dialog"] *, aside *')) {
        if (el.closest('.dokument') || el.closest('svg') || el.tagName === 'IMG') continue
        const r = el.getBoundingClientRect()
        if (r.width < 48 || r.height < 28) continue
        const c = rgb(getComputedStyle(el).backgroundColor)
        if (c && c.a > 0.5 && c.r > 235 && c.g > 235 && c.b > 235) {
          vita.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 80)}`)
        }
      }
    }
    // Text med för låg kontrast (under 3:1 mot sin bakgrund), i båda lägena.
    const walker = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT)
    let n
    const sedda = new Set()
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim()
      if (t.length < 2) continue
      const el = n.parentElement
      if (!el || sedda.has(el) || !iBild(el)) continue
      if (el.closest('.dokument') || el.closest('[aria-hidden="true"]') || el.closest('.sr-only')) continue
      sedda.add(el)
      const s = getComputedStyle(el)
      if (parseFloat(s.opacity) < 0.6) continue
      const fg = rgb(s.color)
      if (!fg) continue
      const bg = bakgrund(el).c
      const k = kontrast(fg, bg)
      if (k < 3) lagKontrast.push(`${k.toFixed(2)} "${t.slice(0, 40)}" ${s.color} på rgb(${bg.r},${bg.g},${bg.b})`)
    }

    return {
      topprad: iBild(topprad),
      nav: form === 'desktop' ? null : iBild(nav),
      sidomeny: form === 'desktop' ? iBild(sidomeny) : null,
      flodeHuvud: iBild(flodeHuvud),
      h1: iBild(h1),
      h1Text: h1?.textContent?.trim().slice(0, 80) ?? null,
      horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      dataTheme: document.documentElement.dataset.theme ?? null,
      dataRum: skal?.getAttribute('data-rum') ?? null,
      themeColor: meta?.getAttribute('content')?.toLowerCase() ?? null,
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      kopparknappar: koppar.length,
      kopparTexter: koppar.map((k) => k.textContent.trim().slice(0, 40)),
      kopparIBild: kr ? kr.top >= 0 && kr.bottom <= innerHeight : null,
      vitaYtor: vita.slice(0, 8),
      antalVitaYtor: vita.length,
      lagKontrast: lagKontrast.slice(0, 8),
      antalLagKontrast: lagKontrast.length,
    }
  }, form)
}

// ------------------------------------------------------------------ delar
const resultat = { bas: BAS, tid: new Date().toISOString(), vyer: [], ssr: [], dorrar: [], sidomeny: [], fokus: [], floden: [], natfel: [], tema: [], landning: [], spara: [] }

function routeUrl(r, konto) {
  if (!r.dyn) return r.path
  const id = konto.dyn?.[r.dyn]
  return id ? r.path.replace('ID', id) : null
}

async function delVyer(browser, konton) {
  const mapp = path.join(UT, 'vyer')
  fs.mkdirSync(mapp, { recursive: true })
  for (const kontoNamn of ['mycket', 'gratis', 'hela'].filter((k) => !KONTOFILTER || KONTOFILTER.includes(k))) {
    const konto = konton[kontoNamn]
    const routes = (kontoNamn === 'mycket' ? ROUTES : ROUTES.filter((r) => KORTLISTA.includes(r.namn))).filter((r) => !ROUTEFILTER || ROUTEFILTER.includes(r.namn))
    for (const form of ['pixel7', 'desktop'].filter((f) => !FORMFILTER || FORMFILTER.includes(f))) {
      for (const system of ['light', 'dark']) {
        for (const r of routes) {
          const url = routeUrl(r, konto)
          if (!url) continue
          const { page, logg } = await nySida(browser, { form, system, email: konto.email })
          try {
            await besok(page, BAS + url)
            const k = await kontroll(page, form)
            const fil = `${kontoNamn}-${form}-${system === 'light' ? 'ljust' : 'morkt'}-${r.namn}.png`
            await page.screenshot({ path: path.join(mapp, fil) })
            let bodyRullar = null
            if (form === 'pixel7') {
              // Adressfältet: rulla body som mobil Chrome gör när fältet döljs.
              bodyRullar = await page.evaluate(async () => {
                window.scrollTo(0, 120)
                document.body.scrollTo?.(0, 120)
                await new Promise((r) => setTimeout(r, 250))
                return Math.round(window.scrollY) > 0
              })
            }
            const vantatRum = rumForPath(url)
            const arFlode = r.flode || (r.flodeOmTillgang && kontoNamn !== 'gratis')
            const fel = []
            if (!arFlode && !k.topprad) fel.push('topprad ur bild')
            if (arFlode && !k.flodeHuvud) fel.push('flödets huvud ur bild')
            if (form === 'pixel7' && !arFlode && !k.nav) fel.push('dörrnav ur bild')
            if (form === 'pixel7' && arFlode && k.nav) fel.push('dörrnav syns i flöde')
            if (form === 'desktop' && !k.sidomeny) fel.push('sidomeny saknas')
            if (!k.h1) fel.push('h1 ur bild')
            if (k.dataRum !== vantatRum) fel.push(`data-rum ${k.dataRum}, väntat ${vantatRum}`)
            if (k.themeColor !== VAGG[vantatRum]) fel.push(`theme-color ${k.themeColor}, väntat ${VAGG[vantatRum]}`)
            if (k.horisontellScroll) fel.push('horisontell scroll')
            if (bodyRullar) fel.push('body rullar')
            if (k.kopparknappar > 1) fel.push(`${k.kopparknappar} kopparknappar`)
            if (k.antalVitaYtor) fel.push(`${k.antalVitaYtor} vita ytor`)
            if (k.antalLagKontrast) fel.push(`${k.antalLagKontrast} text under 3:1`)
            if (logg.konsol.length) fel.push(`${logg.konsol.length} konsolfel`)
            if (logg.http.length) fel.push(`${logg.http.length} 4xx/5xx`)
            resultat.vyer.push({ konto: kontoNamn, form, system, route: r.namn, url, fil: 'vyer/' + fil, ...k, bodyRullar, konsol: logg.konsol, http: logg.http, anm: fel })
            console.log(`${fil.padEnd(52)} ${fel.length ? 'ANM: ' + fel.join(', ') : 'ok'}`)
          } catch (e) {
            console.log(`${kontoNamn} ${form} ${system} ${r.namn}: FEL ${e.message}`)
            resultat.vyer.push({ konto: kontoNamn, form, system, route: r.namn, url, fel: e.message })
          } finally {
            await page.close()
          }
        }
      }
    }
  }
}

/** Serverns HTML utan JavaScript: rummet och statusfältet stämmer från första byten. */
async function delSsr(browser, konton) {
  const prover = ['/dashboard', '/dashboard/tester', '/dashboard/profil/cv', '/dashboard/mina-brev', '/dashboard/profil', '/dashboard/sokta-tjanster', '/dashboard/tester/matrislogik-grund']
  for (const url of prover) {
    const { page } = await nySida(browser, { form: 'pixel7', system: 'light', email: konton.mycket.email, js: false })
    try {
      await page.goto(BAS + url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      const svar = await page.evaluate(() => ({
        dataRum: document.querySelector('[data-rum]')?.getAttribute('data-rum') ?? null,
        themeColor: [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => `${m.getAttribute('content')}${m.getAttribute('media') ? ' ' + m.getAttribute('media') : ''}`),
        topprad: Boolean(document.querySelector('[data-topprad]')),
        dorrnav: Boolean(document.querySelector('nav[aria-label="Huvudmeny"]')),
      }))
      const vantat = rumForPath(url)
      const ok = svar.dataRum === vantat && svar.themeColor.length === 1 && svar.themeColor[0].toLowerCase() === VAGG[vantat]
      resultat.ssr.push({ url, vantat, ...svar, ok })
      console.log(`ssr ${url.padEnd(40)} data-rum=${svar.dataRum} theme=${svar.themeColor.join('|')} ${ok ? 'ok' : 'ANM'}`)
    } finally {
      await page.close()
    }
  }
}

async function delDorrar(browser, konton) {
  const mapp = path.join(UT, 'dorrar')
  fs.mkdirSync(mapp, { recursive: true })
  const rum = [
    { namn: 'tran', url: '/dashboard/tester' },
    { namn: 'cv', url: '/dashboard/profil/cv' },
    { namn: 'brev', url: '/dashboard/mina-brev' },
    { namn: 'jobb', url: '/dashboard' },
  ]
  for (const form of ['pixel7', 'smal']) {
    for (const system of ['light', 'dark']) {
      for (const r of rum) {
        const { page, logg } = await nySida(browser, { form, system, email: konton.mycket.email })
        try {
          await besok(page, BAS + r.url)
          const nav = await page.$('nav[aria-label="Huvudmeny"]')
          const fil = `N-${form}-${system === 'light' ? 'ljust' : 'morkt'}-${r.namn}.png`
          await nav.screenshot({ path: path.join(mapp, fil) })
          const matt = await page.evaluate(() => {
            const nav = document.querySelector('nav[aria-label="Huvudmeny"]')
            const lankar = [...nav.querySelectorAll('a')]
            const aktiv = lankar.find((a) => a.getAttribute('aria-current') === 'page')
            return {
              hojd: Math.round(nav.getBoundingClientRect().height),
              aktiv: aktiv?.textContent?.trim() ?? null,
              etiketter: lankar.map((a) => {
                const r = a.getBoundingClientRect()
                // Etikettens radantal: antal radrutor i etikettens textnod
                // (etiketten är text direkt i länken, efter dörren).
                const text = a.textContent.trim()
                const omr = document.createRange()
                omr.selectNodeContents(a.lastChild)
                const rader = new Set([...omr.getClientRects()].map((x) => Math.round(x.top))).size
                return { text, rader, klippt: a.scrollWidth > a.clientWidth + 1 || a.scrollHeight > r.height + 1 }
              }),
            }
          })
          resultat.dorrar.push({ form, system, rum: r.namn, fil: 'dorrar/' + fil, ...matt, konsol: logg.konsol })
          console.log(`${fil.padEnd(30)} höjd ${matt.hojd} aktiv ${matt.aktiv} ${matt.etiketter.map((e) => `${e.text}:${e.rader}${e.klippt ? ' KLIPPT' : ''}`).join(', ')}`)
        } finally {
          await page.close()
        }
      }
    }
  }
  // Byte av rum via dörren: väggen tonar, inget glider, data-rum följer med.
  const { page } = await nySida(browser, { form: 'pixel7', system: 'light', email: konton.mycket.email })
  try {
    await besok(page, BAS + '/dashboard')
    const steg = []
    for (const dorr of ['Tester', 'CV', 'Personliga brev', 'Jobbsöket']) {
      const fore = await page.evaluate(() => document.querySelector('[data-rum]').getAttribute('data-rum'))
      const lank = await page.evaluateHandle((t) => [...document.querySelectorAll('nav[aria-label="Huvudmeny"] a')].find((a) => a.textContent.trim() === t), dorr)
      await lank.asElement().click()
      await page.waitForNetworkIdle({ idleTime: 600, timeout: 30000 }).catch(() => {})
      await vanta(400)
      const efter = await page.evaluate(() => ({
        rum: document.querySelector('[data-rum]').getAttribute('data-rum'),
        transition: getComputedStyle(document.querySelector('[data-rum]')).transition,
        theme: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
        url: location.pathname,
      }))
      steg.push({ dorr, fore, ...efter })
      await page.screenshot({ path: path.join(mapp, `byte-${dorr.replace(/\s/g, '-').toLowerCase()}.png`) })
    }
    resultat.dorrar.push({ byte: steg })
    console.log('rumsbyte', JSON.stringify(steg))
  } finally {
    await page.close()
  }
}

async function delSidomeny(browser, konton) {
  const mapp = path.join(UT, 'sidomeny')
  fs.mkdirSync(mapp, { recursive: true })
  const prover = [
    { namn: 'tran', url: '/dashboard/tester' },
    { namn: 'cv', url: '/dashboard/profil/cv' },
    { namn: 'brev', url: '/dashboard/mina-brev' },
    { namn: 'jobb', url: '/dashboard/sokta-tjanster' },
    { namn: 'neutral', url: '/dashboard/profil/prenumeration' },
  ]
  for (const system of ['light', 'dark']) {
    for (const p of prover) {
      const { page, logg } = await nySida(browser, { form: 'desktop', system, email: konton.gratis.email })
      try {
        await besok(page, BAS + p.url)
        const info = await page.evaluate(() => {
          const nav = document.querySelector('nav[aria-label="Sidomeny"]')
          const aktivaRum = [...nav.querySelectorAll('a.h-12')].filter((a) => a.className.includes('bg-ton')).map((a) => a.textContent.trim())
          const grupp = nav.querySelector('p.text-ey')?.textContent?.trim()
          const aktiv = [...nav.querySelectorAll('a[aria-current="page"]')].map((a) => ({ text: a.textContent.trim(), skugga: getComputedStyle(a).boxShadow }))
          const las = [...nav.querySelectorAll('button')].map((b) => b.textContent.trim())
          const konto = nav.parentElement.querySelector('a[href="/dashboard/profil"].mt-auto')?.textContent?.trim()
          return { aktivaRum, grupp, aktiv, las, konto }
        })
        const fil = `sidomeny-${system === 'light' ? 'ljust' : 'morkt'}-${p.namn}.png`
        const aside = await page.$('nav[aria-label="Sidomeny"]')
        const box = await (await aside.evaluateHandle((n) => n.parentElement)).asElement().boundingBox()
        await page.screenshot({ path: path.join(mapp, fil), clip: { x: 0, y: 0, width: Math.ceil(box.width) + 1, height: 900 } })
        resultat.sidomeny.push({ system, rum: p.namn, fil: 'sidomeny/' + fil, ...info, konsol: logg.konsol })
        console.log(`${fil.padEnd(36)} rum ${info.aktivaRum.join('/')} grupp "${info.grupp}" aktiv ${info.aktiv.map((a) => a.text).join('/')} lås ${info.las.join('/')} konto "${info.konto}"`)
      } finally {
        await page.close()
      }
    }
  }
  // Lås öppnar betalväggen (gratiskontot, CV-rummet: LinkedIn-profilen).
  const { page } = await nySida(browser, { form: 'desktop', system: 'light', email: konton.gratis.email })
  try {
    await besok(page, BAS + '/dashboard/profil/cv')
    const knapp = await page.$('nav[aria-label="Sidomeny"] button')
    let dialog = false
    if (knapp) {
      await knapp.click()
      await vanta(1200)
      dialog = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')))
      await page.screenshot({ path: path.join(mapp, 'las-oppnar-betalvaggen.png') })
    }
    resultat.sidomeny.push({ las: { knapp: Boolean(knapp), dialog } })
    console.log('lås öppnar arket:', dialog)
  } finally {
    await page.close()
  }
}

/** Fokusringen på golv, papper, ton och vägg (13.2). */
async function delFokus(browser, konton) {
  const mapp = path.join(UT, 'fokus')
  fs.mkdirSync(mapp, { recursive: true })
  const mal = [
    { namn: 'vagg', url: '/dashboard/mina-brev', sel: '[data-topprad] button[aria-haspopup="menu"]', form: 'pixel7' },
    { namn: 'golv', url: '/dashboard/mina-brev', sel: 'main input[type="search"]', form: 'pixel7' },
    { namn: 'papper', url: '/dashboard/profil', sel: 'main section#cv input:not([type="file"])', form: 'pixel7' },
    { namn: 'ton', url: '/dashboard/tester', sel: 'nav[aria-label="Sidomeny"] a.bg-ton', form: 'desktop' },
  ]
  for (const system of ['light', 'dark']) {
    for (const m of mal) {
      const { page } = await nySida(browser, { form: m.form, system, email: konton.mycket.email })
      try {
        await besok(page, BAS + m.url)
        await page.keyboard.press('Tab')
        const finns = await page.evaluate((sel) => {
          const el = document.querySelector(sel)
          if (!el) return null
          el.scrollIntoView({ block: 'center' })
          el.focus()
          const s = getComputedStyle(el)
          return { outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`, offset: s.outlineOffset, fokus: getComputedStyle(el).getPropertyValue('--fokus').trim() }
        }, m.sel)
        await vanta(200)
        const el = await page.$(m.sel)
        const fil = `fokus-${m.namn}-${system === 'light' ? 'ljust' : 'morkt'}.png`
        if (el) {
          const b = await el.boundingBox()
          if (b)
          await page.screenshot({ path: path.join(mapp, fil), clip: { x: Math.max(0, b.x - 16), y: Math.max(0, b.y - 16), width: Math.min(b.width + 32, 600), height: b.height + 32 } })
        }
        resultat.fokus.push({ underlag: m.namn, system, fil: 'fokus/' + fil, ...finns })
        console.log(`${fil.padEnd(30)} ${JSON.stringify(finns)}`)
      } finally {
        await page.close()
      }
    }
  }
}

/** Kopparknappen i bild och en utgång på varje steg (Pixel 7 med adressfält). */
async function delFloden(browser, konton) {
  const mapp = path.join(UT, 'floden')
  fs.mkdirSync(mapp, { recursive: true })
  for (const flode of [
    { namn: 'brev', url: '/dashboard/skapa-brev', steg: 6 },
    { namn: 'cv', url: '/dashboard/skapa-cv', steg: 7 },
  ]) {
    for (const system of ['light', 'dark']) {
      const { page, logg } = await nySida(browser, { form: 'pixel7', system, email: konton.mycket.email })
      try {
        await besok(page, BAS + flode.url)
        for (let s = 1; s <= Math.min(flode.steg, 4); s++) {
          if (s > 1) {
            await page.goto(`${BAS}${flode.url}?steg=${s}`, { waitUntil: 'networkidle0', timeout: 60000 })
            await vanta(1000)
          }
          // Adressfältet: synlig höjd minskar med 56 px.
          const matt = await page.evaluate(() => {
            const fot = document.querySelector('.fixed.inset-0.z-50 footer')
            const knapp = fot?.querySelector('button')
            const r = knapp?.getBoundingClientRect()
            const stang = document.querySelector('.fixed.inset-0.z-50 header button[aria-label="Stäng"]')
            return {
              knapp: knapp ? knapp.textContent.trim() : null,
              koppar: knapp ? knapp.className.includes('knapp-primar') : false,
              iBildMedAdressfalt: r ? r.bottom <= innerHeight - 56 && r.top >= 0 : false,
              utgang: Boolean(stang),
            }
          })
          const fil = `${flode.namn}-${system === 'light' ? 'ljust' : 'morkt'}-steg${s}.png`
          await page.screenshot({ path: path.join(mapp, fil) })
          resultat.floden.push({ flode: flode.namn, system, steg: s, fil: 'floden/' + fil, ...matt })
          console.log(`${fil.padEnd(28)} ${JSON.stringify(matt)}`)
        }
        resultat.floden.push({ flode: flode.namn, system, konsol: logg.konsol, http: logg.http })
      } finally {
        await page.close()
      }
    }
  }
}

/** Nätverksfel på POST: UI:t får aldrig säga sparat. */
async function delNatfel(browser, konton) {
  const mapp = path.join(UT, 'natfel')
  fs.mkdirSync(mapp, { recursive: true })
  // 1. Profilens autospara.
  {
    const { page } = await nySida(browser, { form: 'pixel7', system: 'light', email: konton.gratis.email })
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
      const falt = await page.$('main section#cv input[type="text"], main section#cv input:not([type])')
      let sparatSyns = null
      let felSyns = null
      if (falt) {
        await falt.click({ clickCount: 3 })
        await falt.type('Malmö')
        await page.evaluate(() => document.activeElement?.blur())
        await vanta(2500)
        const text = await page.evaluate(() => document.querySelector('main')?.innerText ?? '')
        sparatSyns = /\bSparat\b/.test(text)
        felSyns = /sparades inte|Försök igen/i.test(text)
      }
      await page.screenshot({ path: path.join(mapp, 'natfel-profil-autospara.png') })
      resultat.natfel.push({ var: 'profilens autospara', avbrutna, sparatSyns, felSyns })
      console.log('nätverksfel profil:', { avbrutna, sparatSyns, felSyns })
    } finally {
      await page.close()
    }
  }
  // 2. Brevflödet: logga en sökt tjänst ur brevet sparas inte (POST /api/applications avbryts),
  //    och skapa-brev steg 5 (POST /api/letters/...) avbryts.
  {
    const { page } = await nySida(browser, { form: 'pixel7', system: 'light', email: konton.mycket.email })
    try {
      await besok(page, BAS + '/dashboard/skapa-brev')
      // Steg 1: första CV:t.
      const steg = []
      const klickaFortsatt = async () => {
        const b = await page.$('.fixed.inset-0.z-50 footer button')
        if (!b) return false
        const dis = await b.evaluate((x) => x.disabled)
        if (dis) return false
        await b.click()
        await vanta(1500)
        return true
      }
      const forstaVal = await page.$('.fixed.inset-0.z-50 main [role="radio"], .fixed.inset-0.z-50 main button[aria-pressed], .fixed.inset-0.z-50 main label')
      if (forstaVal) await forstaVal.click()
      await vanta(500)
      steg.push({ steg: 1, vidare: await klickaFortsatt() })
      // Steg 2: annonsen.
      const ta = await page.$('.fixed.inset-0.z-50 main textarea')
      if (ta) {
        await ta.click()
        await ta.type('Vi söker en projektledare till vårt IT-team i Göteborg. Du har erfarenhet av agila team, upphandling och budgetansvar. Tjänsten är en tillsvidareanställning med start enligt överenskommelse.')
      }
      steg.push({ steg: 2, vidare: await klickaFortsatt() })
      steg.push({ steg: 3, vidare: await klickaFortsatt() })
      steg.push({ steg: 4, vidare: await klickaFortsatt() })
      // Steg 5: skapa brevet med avbrutet nätverk.
      await page.setRequestInterception(true)
      let avbrutna = 0
      page.on('request', (req) => {
        if (req.method() === 'POST' && (req.url().includes('/api/') || req.url().includes('/functions/v1/'))) {
          avbrutna++
          req.abort('internetdisconnected')
        } else req.continue()
      })
      const skapa = await page.$('.fixed.inset-0.z-50 footer button')
      const skapaText = skapa ? await skapa.evaluate((b) => b.textContent.trim()) : null
      if (skapa) await skapa.click()
      await vanta(4000)
      const text = await page.evaluate(() => document.body.innerText)
      const sparatSyns = /\b(Sparat|Brevet är sparat|sparat i Mina brev)\b/i.test(text)
      const felSyns = /gick inte|kunde inte|Försök igen|nätverk|anslutning/i.test(text)
      await page.screenshot({ path: path.join(mapp, 'natfel-brevflodet.png') })
      resultat.natfel.push({ var: 'brevflödet, skapa brevet', steg, skapaText, avbrutna, sparatSyns, felSyns })
      console.log('nätverksfel brevflödet:', { steg, skapaText, avbrutna, sparatSyns, felSyns })
    } finally {
      await page.close()
    }
  }
}

/** Utseende på profilen. */
async function delTema(browser, konton) {
  const mapp = path.join(UT, 'tema')
  fs.mkdirSync(mapp, { recursive: true })
  const { page } = await nySida(browser, { form: 'pixel7', system: 'light', email: konton.gratis.email })
  try {
    await besok(page, BAS + '/dashboard/profil#utseende')
    const steg = []
    for (const val of ['Mörkt', 'Ljust', 'Följer systemet']) {
      const knapp = await page.evaluateHandle((t) => [...document.querySelectorAll('#utseende [role="radio"]')].find((b) => b.textContent.trim() === t), val)
      await knapp.asElement().click()
      await vanta(500)
      const info = await page.evaluate(() => ({
        dataTheme: document.documentElement.dataset.theme ?? null,
        lagrat: localStorage.getItem('tema'),
        golv: getComputedStyle(document.querySelector('main')).backgroundColor,
      }))
      await page.evaluate(() => document.querySelector('#utseende')?.scrollIntoView({ block: 'center' }))
      await page.screenshot({ path: path.join(mapp, `utseende-${val.replace(/\s/g, '-').toLowerCase()}.png`) })
      steg.push({ val, ...info })
    }
    // Valet överlever en omladdning (skriptet i <head> läser localStorage).
    const knapp = await page.evaluateHandle(() => [...document.querySelectorAll('#utseende [role="radio"]')].find((b) => b.textContent.trim() === 'Mörkt'))
    await knapp.asElement().click()
    await page.reload({ waitUntil: 'networkidle0' })
    const efterOmladdning = await page.evaluate(() => document.documentElement.dataset.theme ?? null)
    resultat.tema.push({ steg, efterOmladdning })
    console.log('utseende:', JSON.stringify(steg), 'efter omladdning:', efterOmladdning)
  } finally {
    await page.close()
  }
}

/** Kom igång-raden flyter över dörrnavet: sista raden i listan syns vid scrollbotten. */
async function delKomigang(browser, konton) {
  const mapp = path.join(UT, 'komigang')
  fs.mkdirSync(mapp, { recursive: true })
  resultat.komigang = []
  for (const kontoNamn of ['mycket', 'hela']) {
    for (const system of ['light', 'dark']) {
      const { page, logg } = await nySida(browser, { form: 'pixel7', system, email: konton[kontoNamn].email })
      try {
        await besok(page, BAS + '/dashboard')
        const info = await page.evaluate(async () => {
          const rad = document.querySelector('[data-komigang-rad="flytande"]')
          const main = document.querySelector('.dashboard-main-content') || document.querySelector('main')
          const rullare = [main, main?.parentElement, document.scrollingElement].find((e) => e && e.scrollHeight > e.clientHeight + 4)
          if (rullare) rullare.scrollTop = rullare.scrollHeight
          await new Promise((r) => setTimeout(r, 400))
          const golv = [...document.querySelectorAll('main section, main li, main article')].filter((e) => e.getBoundingClientRect().height > 0)
          const sista = golv.sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0]
          const rr = rad?.getBoundingClientRect()
          const sr = sista?.getBoundingClientRect()
          return {
            rad: Boolean(rad),
            radTopp: rr ? Math.round(rr.top) : null,
            sistaBotten: sr ? Math.round(sr.bottom) : null,
            sistaText: sista?.textContent?.trim().slice(0, 60) ?? null,
            paddingBottom: main ? getComputedStyle(main).paddingBottom : null,
          }
        })
        const ok = !info.rad || (info.sistaBotten !== null && info.sistaBotten <= info.radTopp)
        const fil = `komigang-${kontoNamn}-${system === 'light' ? 'ljust' : 'morkt'}-botten.png`
        await page.screenshot({ path: path.join(mapp, fil) })
        resultat.komigang.push({ konto: kontoNamn, system, fil: 'komigang/' + fil, ...info, ok, konsol: logg.konsol })
        console.log(`${fil.padEnd(40)} rad ${info.rad} topp ${info.radTopp} sista ${info.sistaBotten} pb ${info.paddingBottom} ${ok ? 'ok' : 'ANM: sista raden bakom Kom igång'}`)
      } finally {
        await page.close()
      }
    }
  }
}

// ------------------------------------------------------------------ våg 4
/** Landningen i senaste rummet (spec avsnitt 5). Gratiskontot valde CV. */
async function delLandning(browser, konton) {
  const mapp = path.join(UT, 'landning')
  fs.mkdirSync(mapp, { recursive: true })
  const fall = [
    { namn: 'utan-referens', referer: undefined, vantat: '/dashboard/profil/cv' },
    { namn: 'fran-inloggningen', referer: BAS + '/login', vantat: '/dashboard/profil/cv' },
    { namn: 'inifran-appen', referer: BAS + '/dashboard/tester', vantat: '/dashboard' },
  ]
  for (const f of fall) {
    const { page, logg } = await nySida(browser, { form: 'pixel7', system: 'light', email: konton.gratis.email })
    try {
      await page.goto(BAS + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000, referer: f.referer })
      await vanta(800)
      const url = new URL(page.url()).pathname
      const fil = `gratis-pixel7-ljust-${f.namn}.png`
      await page.screenshot({ path: path.join(mapp, fil) })
      const ok = url === f.vantat
      resultat.landning.push({ fall: f.namn, url, vantat: f.vantat, ok, fil: 'landning/' + fil, konsol: logg.konsol, http: logg.http })
      console.log(`landning ${f.namn.padEnd(20)} ${url} ${ok ? 'ok' : 'ANM väntat ' + f.vantat}`)
    } finally {
      await page.close()
    }
  }
  // Dörren till Jobbsöket från CV-rummet öppnar alltid Jobbsöket.
  const { page } = await nySida(browser, { form: 'pixel7', system: 'light', email: konton.gratis.email })
  try {
    await besok(page, BAS + '/dashboard/profil/cv')
    await page.click('nav[aria-label="Huvudmeny"] a[href="/dashboard"]')
    await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 15000 }).catch(() => {})
    await vanta(1000)
    const url = new URL(page.url()).pathname
    const ok = url === '/dashboard'
    await page.screenshot({ path: path.join(mapp, 'gratis-pixel7-ljust-dorren-till-jobbsoket.png') })
    resultat.landning.push({ fall: 'dorren-till-jobbsoket', url, vantat: '/dashboard', ok, fil: 'landning/gratis-pixel7-ljust-dorren-till-jobbsoket.png' })
    console.log(`landning dörren till Jobbsöket   ${url} ${ok ? 'ok' : 'ANM'}`)
  } finally {
    await page.close()
  }
}

/** "Spara som sökt tjänst" i brevvyn (B1): fel först, sedan lyckat. */
async function delSpara(browser, konton) {
  const mapp = path.join(UT, 'spara')
  fs.mkdirSync(mapp, { recursive: true })
  const konto = konton.mycket
  const brevId = konto.dyn?.letter
  if (!brevId) return console.log('spara: inget brev')
  for (const form of ['pixel7', 'desktop']) {
    // 1. Nätverksfel på POST: raden får aldrig säga sparad.
    {
      const { page } = await nySida(browser, { form, system: 'light', email: konto.email })
      try {
        await besok(page, BAS + '/dashboard/mina-brev/' + brevId)
        await page.setRequestInterception(true)
        page.on('request', (r) => {
          if (r.url().includes('/api/applications') && r.method() === 'POST') r.abort('internetdisconnected')
          else r.continue()
        })
        const knapp = await page.evaluateHandle(() => [...document.querySelectorAll('main button')].find((b) => b.textContent.trim() === 'Spara'))
        await knapp.asElement()?.click()
        await vanta(1500)
        const text = await page.evaluate(() => document.querySelector('main')?.innerText ?? '')
        const ok = text.includes('Det gick inte att spara') && !text.includes('ligger redan i Sökta tjänster')
        await page.screenshot({ path: path.join(mapp, `mycket-${form}-natfel.png`) })
        resultat.spara.push({ form, fall: 'natfel', ok })
        console.log(`spara ${form} nätfel ${ok ? 'ok' : 'ANM'}`)
      } finally {
        await page.close()
      }
    }
  }
  // 2. Lyckat, en gång (idempotent i API:t).
  const { page, logg } = await nySida(browser, { form: 'pixel7', system: 'light', email: konto.email })
  try {
    await besok(page, BAS + '/dashboard/mina-brev/' + brevId)
    const knapp = await page.evaluateHandle(() => [...document.querySelectorAll('main button')].find((b) => b.textContent.trim() === 'Spara'))
    await knapp.asElement()?.click()
    await page.waitForFunction(() => document.querySelector('main')?.innerText.includes('ligger redan i Sökta tjänster'), { timeout: 15000 }).catch(() => {})
    const text = await page.evaluate(() => document.querySelector('main')?.innerText ?? '')
    const { count } = await sb.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', konto.id).eq('letter_id', brevId)
    const ok = text.includes('ligger redan i Sökta tjänster') && count === 1
    await page.screenshot({ path: path.join(mapp, 'mycket-pixel7-sparad.png') })
    resultat.spara.push({ form: 'pixel7', fall: 'sparad', ok, rader: count, konsol: logg.konsol, http: logg.http })
    console.log(`spara lyckat: rader ${count} ${ok ? 'ok' : 'ANM'}`)
  } finally {
    await page.close()
  }
}

// ------------------------------------------------------------------ körning
async function main() {
  if (flagga('radera')) {
    await raderaKonton()
    return
  }
  const konton = await skapaKonton()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  try {
    if (kor('ssr')) await delSsr(browser, konton)
    if (kor('dorrar')) await delDorrar(browser, konton)
    if (kor('sidomeny')) await delSidomeny(browser, konton)
    if (kor('fokus')) await delFokus(browser, konton)
    if (kor('tema')) await delTema(browser, konton)
    if (kor('floden')) await delFloden(browser, konton)
    if (kor('natfel')) await delNatfel(browser, konton)
    if (kor('komigang')) await delKomigang(browser, konton)
    if (kor('landning')) await delLandning(browser, konton)
    if (kor('vyer')) await delVyer(browser, konton)
    if (kor('spara')) await delSpara(browser, konton)
  } finally {
    await browser.close()
    fs.writeFileSync(RESULTATFIL, JSON.stringify(resultat, null, 2))
    if (!BEHALL) await raderaKonton()
  }
}

main().catch(async (e) => {
  console.error(e)
  if (!BEHALL) await raderaKonton().catch(() => {})
  process.exit(1)
})
