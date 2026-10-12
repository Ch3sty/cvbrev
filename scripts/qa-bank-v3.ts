// scripts/qa-bank-v3.ts
// Klicktest i riktig Chrome av bank_version 3 (plan-facit-genvag 5.4) och
// underlagsversion 2 för verbalt och numeriskt.
//
//   npx tsx scripts/qa-bank-v3.ts --port 5231 [--korningar m360-light,desktop-light,m360-dark]
//   npx tsx scripts/qa-bank-v3.ts --radera
//
// Per körning ett nytt konto qa-v3-<ts>@jobbcoach-qa.test (premium via
// premium_grants, testplan): Nivåkollen, dagens pass med regelpanelen och
// "Något ser fel ut", logikens klassiska test på expert, verbalt och
// numeriskt test (grund och avancerad: testvyn och sessionens
// underlagsversion), och en gammal session med bank_version 2 vars
// genomgång ska visa sina frågor ur version 2. Efter webbläsaren läses
// sessionerna ur databasen och varje fråge-id kontrolleras: valbar i
// version 3, aldrig pensionerad_fran 3. Skärmdumpar i docs/qa/bank-v3/klicktest/.
// Kontona raderas med --radera: bara egna adresser, rad för rad via
// user_id, räknat före delete.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Browser, type ElementHandle, type Page } from 'puppeteer-core'
import {
  ALLA_MATRISFRAGOR,
  selectExpertQuestionsForSession,
  valbarI,
  type Versionsfalt,
} from '../src/lib/logicTestV7/selectQuestions.v7'
import { matrisInnehall } from '../src/lib/logicTestV7/fragor.server'
import { selectPassagesForSession as verbalGrund, POOL as VG } from '../src/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as numGrund } from '../src/lib/numericalTest/selectPassages'
import { getAllPassages as numGrundAlla } from '../src/lib/numericalTest/validator'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#')).map((r) => {
    const i = r.indexOf('=')
    return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
  })
) as Record<string, string>
const arg = (n: string, f?: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const PORT = arg('port', '5231')
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/bank-v3/klicktest')
const KONTOFIL = path.join(os.tmpdir(), 'qa-bank-v3-konton.json')
fs.mkdirSync(UT, { recursive: true })
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))!
const MOBIL_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
const FORMER = {
  m360: { viewport: { width: 360, height: 684, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: MOBIL_UA },
  desktop: { viewport: { width: 1280, height: 900, deviceScaleFactor: 1 }, userAgent: undefined as string | undefined },
}
type Form = keyof typeof FORMER
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /React DevTools/i, /Invalid source map/i]
const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms))
const ADRESS = /^qa-v3-\d+@jobbcoach-qa\.test$/
type Konto = { email: string; userId: string }
const lasKonton = (): Record<string, Konto> => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {})
const sparaKonton = (k: Record<string, Konto>) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
const dagSthlm = (d = 0) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(Date.now() + d * 86400000))

const resultat: { datum: string; bas: string; steg: unknown[]; fel: string[] } = { datum: new Date().toISOString(), bas: BAS, steg: [], fel: [] }
const fel = (x: string) => { resultat.fel.push(x); console.log('FEL', x) }

async function skapaKonto(nyckel: string): Promise<Konto> {
  const ts = Date.now()
  const email = `qa-v3-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({ email, password: `QaV3!${ts}`, email_confirm: true, user_metadata: { full_name: 'Sara Lind', password_set: true } })
  if (error) throw new Error(error.message)
  const k = { email, userId: data.user.id }
  const alla = lasKonton(); alla[`${nyckel}-${ts}`] = k; sparaKonton(alla)
  await vanta(600)
  const { error: pErr } = await sb.from('profiles').upsert({ id: k.userId, email, full_name: 'Sara Lind', email_verified_at: new Date().toISOString(), onboarding_track: 'tester', onboarding_intent: 'tester' })
  if (pErr) throw new Error('profil: ' + pErr.message)
  const { error: gErr } = await sb.from('premium_grants').insert({ user_id: k.userId, days: 7, source: 'qa-bank-v3', scope: 'allt', premium_until_after: new Date(Date.now() + 7 * 86400000).toISOString() })
  if (gErr) throw new Error('grant: ' + gErr.message)
  const { error: tErr } = await sb.from('test_planer').upsert({ user_id: k.userId, testtyper: ['matris'], leverantor: 'matrigma', variant: 'klassisk', provdatum: dagSthlm(14) })
  if (tErr) throw new Error('plan: ' + tErr.message)
  console.log('skapade', nyckel, email)
  return k
}

async function tabellerMedUserId(): Promise<string[]> {
  const r = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, Accept: 'application/openapi+json' } })
  const spec = (await r.json()) as { definitions?: Record<string, { properties?: Record<string, unknown> }> }
  return Object.entries(spec.definitions ?? {}).filter(([, d]) => d.properties && 'user_id' in d.properties).map(([n]) => n)
}

async function radera() {
  const alla = lasKonton()
  for (let sida = 1; sida < 50; sida++) {
    const { data, error } = await sb.auth.admin.listUsers({ page: sida, perPage: 1000 })
    if (error || !data.users.length) break
    for (const u of data.users) if (ADRESS.test(u.email ?? '') && !Object.values(alla).some((k) => k.userId === u.id)) alla[`hittad-${u.id}`] = { email: u.email!, userId: u.id }
  }
  const tabeller = await tabellerMedUserId()
  const rapport: unknown[] = []
  for (const [nyckel, k] of Object.entries(alla)) {
    if (!ADRESS.test(k.email)) throw new Error('inte ett eget QA-konto: ' + k.email)
    const rader: Record<string, unknown> = {}
    for (const t of tabeller) {
      const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error || !count) continue
      const { error: dErr } = await sb.from(t).delete().eq('user_id', k.userId)
      rader[t] = dErr ? (/view/i.test(dErr.message) ? `vy, ${count}` : `FEL ${dErr.message} (${count})`) : count
    }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.userId)
    if (pc) await sb.from('profiles').delete().eq('id', k.userId)
    const { error } = await sb.auth.admin.deleteUser(k.userId)
    rapport.push({ nyckel, email: k.email, rader, profiler: pc ?? 0, auth: error ? error.message : 'raderad' })
    console.log('raderade', nyckel, JSON.stringify(rader), 'profiles', pc ?? 0, error ? error.message : 'ok')
  }
  fs.writeFileSync(path.join(UT, 'radering.json'), JSON.stringify(rapport, null, 2))
  if (fs.existsSync(KONTOFIL)) fs.unlinkSync(KONTOFIL)
}

const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
async function payloadFor(email: string) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } }).auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties!.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const x = s.session
  return 'base64-' + Buffer.from(JSON.stringify({ access_token: x.access_token, refresh_token: x.refresh_token, expires_at: x.expires_at, expires_in: x.expires_in, token_type: 'bearer', user: x.user })).toString('base64')
}

async function nySida(browser: Browser, form: Form, system: 'light' | 'dark', email: string) {
  const page = await browser.newPage()
  const f = FORMER[form]
  if (f.userAgent) await page.setUserAgent(f.userAgent)
  await page.setViewport(f.viewport)
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('password_prompt_dismissed', 'true'); localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now())); localStorage.removeItem('tema') } catch {}
  })
  await page.setRequestInterception(true)
  const rapporter: unknown[] = []
  page.on('request', (req) => {
    if (req.url().includes('/api/traning/pass-tid') && req.method() === 'POST') return req.respond({ status: 200, contentType: 'application/json', body: req.postData() ?? '{}' })
    if (req.url().includes('/api/traning/fraga-rapport')) rapporter.push(JSON.parse(req.postData() ?? '{}'))
    req.continue()
  })
  const logg = { konsol: [] as string[], http: [] as string[] }
  page.on('console', (m) => { if (m.type() === 'error' && !BRUS.some((r) => r.test(m.text()))) logg.konsol.push(`${m.text().slice(0, 300)} (${page.url().replace(BAS, '')})`) })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String((e as Error).message).slice(0, 300)))
  page.on('response', (r) => { const u = r.url(); if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 160)}`) })
  return { page, logg, rapporter }
}

async function bild(page: Page, namn: string, fullPage = false) {
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(400)
  await page.screenshot({ path: path.join(UT, `${namn}.png`) as `${string}.png`, fullPage })
  const horisontell = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
  if (horisontell) fel(`${namn}: horisontell scroll`)
  resultat.steg.push({ namn, url: page.url().replace(BAS, '') })
  console.log('bild', namn, page.url().replace(BAS, ''))
}

async function hitta(page: Page, text: RegExp): Promise<ElementHandle | null> {
  const h = await page.evaluateHandle((t) => [...document.querySelectorAll('button, a')].find((b) => new RegExp(t.re, t.f).test((b.textContent ?? '').trim()) && b.getBoundingClientRect().width > 0) ?? null, { re: text.source, f: text.flags })
  return h.asElement() as ElementHandle | null
}
async function tryck(page: Page, el: ElementHandle, form: Form) {
  await el.evaluate((e) => (e as HTMLElement).scrollIntoView({ block: 'center' }))
  await vanta(150)
  const box = await el.boundingBox()
  if (!box) throw new Error('ingen ruta att trycka på')
  if (form === 'desktop') await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  else await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
}
async function trycktext(page: Page, text: RegExp, form: Form, ms = 30000) {
  const slut = Date.now() + ms
  for (;;) {
    const el = await hitta(page, text)
    if (el) return tryck(page, el, form)
    if (Date.now() > slut) throw new Error(`hittade inte ${text}`)
    await vanta(250)
  }
}

async function korning(browser: Browser, form: Form, system: 'light' | 'dark', full: boolean) {
  const pre = `${form}-${system === 'dark' ? 'morkt' : 'ljust'}`
  const k = await skapaKonto(pre)
  const { page, logg, rapporter } = await nySida(browser, form, system, k.email)
  try {
    // 1. Nivåkollen
    await page.goto(`${BAS}/dashboard/tester/pass?typ=matning`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-pass-shell] [role=radiogroup] button[role=radio]:not([disabled])', { timeout: 60000 })
    await bild(page, `${pre}-01-nivakollen`)
    for (let i = 0; i < 40; i++) {
      if (await page.$('[data-resultat]')) break
      const knappar = await page.$$('[data-pass-shell] [role=radiogroup] button[role=radio]:not([disabled])')
      if (!knappar.length) { await vanta(300); continue }
      await tryck(page, knappar[i % 3], form)
      await vanta(500)
    }
    await page.waitForSelector('[data-resultat]', { timeout: 60000 })
    await vanta(1200)
    await bild(page, `${pre}-02-nivakollen-resultat`)

    // 2. Dagens pass, regelpanelen och "Något ser fel ut"
    await page.goto(`${BAS}/dashboard/tester/pass?typ=pass`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-pass-shell] [role=radiogroup] button[role=radio]:not([disabled])', { timeout: 60000 })
    await bild(page, `${pre}-03-pass-fraga`)
    const alt = await page.$$('[data-pass-shell] [role=radiogroup] button[role=radio]')
    await tryck(page, alt[2], form)
    await page.waitForSelector('[data-regelpanel]', { timeout: 20000 }).catch(() => fel(`${pre}: ingen regelpanel efter svaret`))
    await vanta(700)
    await bild(page, `${pre}-04-pass-regelpanel`)
    const lank = await page.$('[data-fraga-rapport]')
    if (!lank) fel(`${pre}: länken Något ser fel ut saknas`)
    else {
      await tryck(page, lank, form)
      await page.waitForSelector('[data-fraga-rapport-ark]', { timeout: 10000 })
      await trycktext(page, /^Rätt svar verkar fel$/, form)
      await page.type('[data-fraga-rapport-ark] textarea', 'QA bank_version 3, kan strykas.')
      await bild(page, `${pre}-05-rapport-ark`)
      await trycktext(page, /^Skicka$/, form)
      await page.waitForFunction(() => /Tack, vi tittar på frågan\./.test(document.body.innerText), { timeout: 15000 }).catch(() => fel(`${pre}: kvittot efter rapporten syns inte`))
      await bild(page, `${pre}-06-rapport-kvitto`)
    }

    if (full) {
      // 3. Klassiskt logiktest på expert
      await page.goto(`${BAS}/dashboard/tester/matrislogik-expert`, { waitUntil: 'networkidle2', timeout: 120000 })
      await trycktext(page, /^(Starta testet|Gör om testet)$/, form, 45000)
      await page.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 120000 })
      await page.waitForSelector('[role=radiogroup] button[role=radio]:not([disabled])', { timeout: 60000 })
      await vanta(800)
      await bild(page, `${pre}-07-expert-fraga`)
      for (let i = 0; i < 30; i++) {
        const n = await page.$$eval('[role=radiogroup] button[role=radio]', (b) => b.filter((e) => e.getBoundingClientRect().width > 0 && !(e as HTMLButtonElement).disabled).length)
        if (!n) break
        const fore = await page.evaluate(() => (document.body.innerText.match(/Fråga (\d+)/) || [])[1])
        const svar = page.waitForResponse((r) => /\/answer$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST', { timeout: 30000 }).catch(() => null)
        const knappar = await page.$$('[role=radiogroup] button[role=radio]:not([disabled])')
        await tryck(page, knappar[(i * 2) % 6], form)
        await svar
        await vanta(800)
        const efter = await page.evaluate(() => (document.body.innerText.match(/Fråga (\d+)/) || [])[1])
        if (fore === efter) break
      }
      await trycktext(page, /^Lämna in$/, form)
      await vanta(600)
      await trycktext(page, /Avsluta och se resultat/, form)
      await page.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
      await page.waitForFunction(() => /genomgång/i.test(document.body.innerText), { timeout: 120000 })
      await vanta(1200)
      await bild(page, `${pre}-08-expert-resultat`)

      // 4. Verbalt och numeriskt: testvyn och underlagsversionen
      for (const slug of ['verbal-resonemang', 'numeriskt-test', ...(form === 'm360' && system === 'light' ? ['verbal-resonemang-v2', 'numeriskt-test-v2'] : [])]) {
        await page.goto(`${BAS}/dashboard/tester/${slug}`, { waitUntil: 'networkidle2', timeout: 120000 })
        await trycktext(page, /^(Starta testet|Gör om testet)$/, form, 45000)
        await page.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 120000 })
        await vanta(3500)
        await bild(page, `${pre}-09-${slug}`)
        const id = page.url().match(/([0-9a-f-]{36})$/)![1]
        const { data } = await sb.from('logic_test_v4_sessions').select('meta').eq('id', id).single()
        const v = (data?.meta as Record<string, unknown> | null)?.underlag_version
        if (v !== 2) fel(`${pre}: ${slug} har underlag_version ${v}`)
        const texten = await page.evaluate(() => document.body.innerText.slice(0, 4000))
        if (slug === 'verbal-resonemang') {
          const valda = verbalGrund(id, undefined, 2)
          const nya = valda.filter((p) => !VG.some((x) => x.id === p.id)).length
          if (!texten.includes(valda[0].title)) fel(`${pre}: verbal grund visar inte första texten i version 2 (${valda[0].title})`)
          resultat.steg.push({ namn: `${pre}-${slug}`, session: id, underlag_version: v, nyaTexter: nya, forsta: valda[0].id })
        }
        if (slug === 'numeriskt-test') {
          const valda = numGrund(id, undefined, 2)
          const frysta = new Set(numGrundAlla(1).map((p) => p.id))
          if (!texten.includes(valda[0].title)) fel(`${pre}: numeriskt grund visar inte första underlaget i version 2 (${valda[0].title})`)
          resultat.steg.push({ namn: `${pre}-${slug}`, session: id, underlag_version: v, nyaUnderlag: valda.filter((p) => !frysta.has(p.id)).length, forsta: valda[0].id })
        }
      }

      // 5. En gammal session med bank_version 2: genomgången visar sina frågor
      const v2 = selectExpertQuestionsForSession('00000000-0000-4000-8000-0000000000aa', 15, 2)
      const { data: rad, error } = await sb.from('logic_test_v4_sessions').insert({
        user_id: k.userId, test_type: 'matrislogik-expert', score: 3, time_spent: 600, completed_at: new Date(Date.now() - 86400000).toISOString(),
        answers: [], meta: { alternativ_blandade: true, bank_version: 2 },
      }).select('id, test_type, meta, completed_at').single()
      if (error || !rad) fel(`${pre}: gammal session skapades inte: ${error?.message}`)
      else {
        const urval = selectExpertQuestionsForSession(rad.id, 15, 2)
        const forvantat = urval.map((q) => q.id)
        // Svar som en riktig session (logicTestV4/answer): tre rätt, resten fel.
        const answers = urval.map((q, i) => { const sel = i < 3 ? q.correctAnswer : (q.correctAnswer + 1) % 6; return { q_id: q.id, selected: sel, visat: sel, correct: i < 3, time_spent: 40 } })
        const { error: uErr } = await sb.from('logic_test_v4_sessions').update({ answers }).eq('id', rad.id)
        if (uErr) fel(`${pre}: gammal sessions svar sparades inte: ${uErr.message}`)
        const genomgang = matrisInnehall(rad).genomgang?.map((g) => (g as { id: string }).id) ?? []
        if (genomgang.join() !== forvantat.join()) fel(`${pre}: gammal sessions genomgång är inte version 2-urvalet`)
        const pens = forvantat.filter((id) => (ALLA_MATRISFRAGOR.find((q) => q.id === id) as unknown as Versionsfalt)?.pensionerad_fran === 3).length
        resultat.steg.push({ namn: `${pre}-gammal-session`, session: rad.id, fragor: forvantat.length, varavPensioneradeIV3: pens, exempel: v2.length })
        await page.goto(`${BAS}/dashboard/tester/matrislogik-expert/test/${rad.id}/results`, { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {})
        await vanta(2500)
        const sidtext = await page.evaluate(() => document.body.innerText)
        if (/Genomgången saknas/.test(sidtext) || !/genomgång/i.test(sidtext)) fel(`${pre}: gammal session visar ingen genomgång (${page.url()})`)
        await bild(page, `${pre}-10-gammal-session-v2`)
      }
    }
  } catch (e) {
    fel(`${pre}: avbrott ${String((e as Error)?.message ?? e)}`)
    await page.screenshot({ path: path.join(UT, `${pre}-avbrott.png`) as `${string}.png` }).catch(() => {})
  }
  if (logg.konsol.length) fel(`${pre}: konsolfel ${JSON.stringify(logg.konsol)}`)
  if (logg.http.length) fel(`${pre}: http ${JSON.stringify(logg.http)}`)
  resultat.steg.push({ namn: `${pre}-rapporter`, rapporter })
  await page.close()
  await kontrolleraSessioner(pre, k)
}

/** Alla matrisfrågor kontot fått efter ändringen ska vara valbara i version 3. */
async function kontrolleraSessioner(pre: string, k: Konto) {
  const { data } = await sb.from('logic_test_v4_sessions').select('id, test_type, meta, answers, created_at').eq('user_id', k.userId)
  const perId = new Map(ALLA_MATRISFRAGOR.map((q) => [q.id, q as unknown as Versionsfalt & { id: string }]))
  let antal = 0
  for (const s of data ?? []) {
    const meta = (s.meta ?? {}) as Record<string, unknown>
    if (meta.bank_version === 2) continue // den gamla sessionen
    const ids = new Set<string>()
    for (const a of (Array.isArray(s.answers) ? s.answers : []) as { q_id?: string }[]) if (a?.q_id) ids.add(a.q_id)
    for (const id of (meta.fragor as string[] | undefined) ?? []) ids.add(id)
    const pooler = meta.pooler as Record<string, string[]> | undefined
    for (const l of Object.values(pooler ?? {})) for (const id of l) ids.add(id)
    if (s.test_type === 'matrislogik-expert') {
      if (meta.bank_version !== 3) fel(`${pre}: klassiskt expert har bank_version ${meta.bank_version}`)
      for (const q of selectExpertQuestionsForSession(s.id, 15, 3)) ids.add(q.id)
    }
    for (const id of ids) {
      const q = perId.get(id)
      if (!q) continue // verbala och numeriska svar
      antal++
      if (!valbarI(q, 3)) fel(`${pre}: ${s.test_type} visade ${id}, som inte är valbar i version 3`)
    }
  }
  resultat.steg.push({ namn: `${pre}-kontroll-v3`, matrisfragor: antal })
  console.log(pre, 'matrisfrågor kontrollerade mot version 3:', antal)
}

async function main() {
  if (process.argv.includes('--radera')) return radera()
  const korningar = (arg('korningar', 'm360-light,desktop-light,m360-dark') as string).split(',')
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  try {
    for (const kr of korningar) {
      const [form, system] = kr.split('-') as [Form, 'light' | 'dark']
      await korning(browser, form, system, system === 'light')
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  console.log(resultat.fel.length ? 'FEL:\n' + resultat.fel.join('\n') : 'inga fel')
}
main().catch((e) => { console.error(e); process.exit(1) })
