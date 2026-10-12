// scripts/qa-omgang3-e.mjs
// =============================================================================
// Klicktest för omgång 3, spår E (bryter mönstret, figurpasset och
// figurseriernas övningsprov) i riktig Chrome, en skärmdump per steg i
// docs/qa/omgang3-e/klicktest/.
//
//   SCRATCH=<tmp> node scripts/qa-omgang3-e.mjs skapa
//   SCRATCH=<tmp> BAS=http://localhost:5231 node scripts/qa-omgang3-e.mjs kor <konto> <bredd> <tema>
//       konto  gratis | aon | shl     bredd 360 | 1280     tema ljust | morkt
//   SCRATCH=<tmp> node scripts/qa-omgang3-e.mjs radera
//
// Konton: qa-e-<ts>-<namn>@jobbcoach-qa.test. aon och shl får Premium via
// premium_grants och en plan med leverantören; gratis får Aon i planen.
// radera: bara de egna kontonas rader via deras user_id, räknat före delete
// (feedback_testdata_stadning).
//
// Flödet per konto:
//   hemvyn: figurpassraden (låst för gratis), kopparknappens nederkant på 360
//   Alla tester: provraden på Figurserier i planens format
//   aon: dag 1 läggs in som ett slutfört figurpass i går (eget konto); i dag
//        görs figurpasset i appen, bryter-uppgiften kontrolleras (koppar på
//        brytaren, ingen nedtoning), resultatet, hemvyn med bock och "2 dagar
//        i rad"; övningsprovet i Aons format startas, två svar, klockan körs ut
//        (sessionens start flyttas bakåt på det egna kontot) och provet lämnas
//        in av klockan med obesvarade som fel; genomgången
//   shl:  övningsprovets startark i vårt format med SHL:s anmärkning; ett
//        figurpass startas och lämnas pågående (perf-inloggat mäter frågesidan)
//   gratis: låst rad, figurpass-POST 403, övningsprov-POST 402
//   alla: matrisnivån (test_nivapunkter) oförändrad före och efter
// =============================================================================

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#')).map((r) => {
    const i = r.indexOf('=')
    return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
  })
)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const FIL = `${SCRATCH}/qa-omgang3-e-konton.json`
const LOSEN = 'QaOmgang3E!2026-10-12x'
const BAS = process.env.BAS || 'http://localhost:5231'
const UT = 'docs/qa/omgang3-e/klicktest'
const spara = (d) => fs.writeFileSync(FIL, JSON.stringify(d, null, 2))
const las = () => (fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {})
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const KONTON = { gratis: { premium: false, lev: 'aon' }, aon: { premium: true, lev: 'aon' }, aon2: { premium: true, lev: 'aon' }, aon3: { premium: true, lev: 'aon' }, shl: { premium: true, lev: 'shl' } }

async function skapa() {
  const ut = las()
  const ts = ut.ts ?? Date.now()
  ut.ts = ts
  for (const [namn, k] of Object.entries(KONTON)) {
    if (ut[namn]) continue
    const email = `qa-e-${ts}-${namn}@jobbcoach-qa.test`
    const { data, error } = await admin.auth.admin.createUser({ email, password: LOSEN, email_confirm: true, user_metadata: { full_name: `QA E ${namn}` } })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    ut[namn] = { email, password: LOSEN, userId }
    spara(ut)
    await vanta(800)
    const nu = new Date().toISOString()
    const { error: pErr } = await admin.from('profiles').upsert({ id: userId, email, full_name: `QA E ${namn}`, email_verified_at: nu, onboarding_track: 'allt', onboarding_track_asked_at: nu })
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)
    const { error: plErr } = await admin.from('test_planer').upsert({ user_id: userId, testtyper: ['matris'], leverantor: k.lev })
    if (plErr) throw new Error(`plan ${namn}: ${plErr.message}`)
    if (k.premium) {
      const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
      const { data: g, error: gErr } = await admin.from('premium_grants').insert({ user_id: userId, days: 7, source: 'qa-omgang3-e', scope: 'allt', premium_until_after: om7 }).select('id').single()
      if (gErr) throw new Error(`grant: ${gErr.message}`)
      ut[namn].grantId = g.id
      spara(ut)
    }
    console.log('skapad', namn, email, userId)
  }
}

const TABELLER = ['logic_test_v4_sessions', 'fraga_rapporter', 'test_nivapunkter', 'test_milstolpar', 'user_activities', 'user_activity', 'user_activity_log', 'test_planer', 'premium_grants', 'profiles']
async function radera() {
  const ut = las()
  for (const namn of Object.keys(KONTON)) {
    const k = ut[namn]
    if (!k) continue
    for (const t of TABELLER) {
      const kol = t === 'profiles' ? 'id' : 'user_id'
      const { count, error } = await admin.from(t).select('*', { count: 'exact', head: true }).eq(kol, k.userId)
      if (error) { console.log(`${t}: ${error.message} (hoppas över)`); continue }
      if (!count) continue
      const { error: dErr } = await admin.from(t).delete().eq(kol, k.userId)
      console.log(`${namn}: ${t} ${count} rader ${dErr ? 'FEL ' + dErr.message : 'raderade'}`)
    }
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log(`${namn}: kontot ${error ? 'FEL ' + error.message : 'raderat'}`)
    delete ut[namn]
    spara(ut)
  }
}

/* ------------------------------------------------------------------ körningen */

async function kor(kontoNamn, bredd, tema) {
  const konto = las()[kontoNamn]
  if (!konto) throw new Error(`okänt konto ${kontoNamn}`)
  fs.mkdirSync(UT, { recursive: true })
  const prefix = `${kontoNamn}-${bredd}-${tema}`
  const RES = `${UT}/resultat.jsonl`
  let nr = 0
  const fel = []
  const logg = (steg, ok, data = {}) => {
    fs.appendFileSync(RES, JSON.stringify({ tid: new Date().toISOString(), floede: prefix, steg, ok, ...data }) + '\n')
    console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 300)}`)
    if (ok === false) fel.push(steg)
  }
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const p = await browser.newPage()
  const mobil = bredd === '360'
  await p.setViewport(mobil ? { width: 360, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1280, height: 860, deviceScaleFactor: 1 })
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema === 'morkt' ? 'dark' : 'light' }])
  p.on('pageerror', (e) => logg('sidfel', false, { fel: String(e).slice(0, 300) }))
  const bild = async (namn, hel = false) => {
    nr += 1
    await p.screenshot({ path: path.join(UT, `${prefix}-${String(nr).padStart(2, '0')}-${namn}.png`), fullPage: hel }).catch(() => {})
  }
  const ga = async (u) => {
    await p.goto(BAS + u, { waitUntil: 'networkidle2', timeout: 180000 })
    await vanta(700)
  }
  const klickaText = async (re, sel = 'button, a, [role="button"]') => {
    const ok = await p.evaluate((src, flags, sel) => {
      const r = new RegExp(src, flags)
      const el = [...document.querySelectorAll(sel)].find((e) => r.test((e.innerText || e.getAttribute('aria-label') || '').trim()) && e.offsetParent !== null && !e.disabled)
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    }, re.source, re.flags, sel)
    if (!ok) throw new Error(`hittade inte ${re}`)
    await vanta(600)
  }
  const vantaText = (re, timeout = 90000) => p.waitForFunction((src, flags) => new RegExp(src, flags).test(document.body.innerText), { timeout }, re.source, re.flags)
  const api = (url, metod = 'POST', kropp = {}) =>
    p.evaluate(async (url, metod, kropp) => {
      const r = await fetch(url, { method: metod, headers: { 'Content-Type': 'application/json' }, body: metod === 'GET' ? undefined : JSON.stringify(kropp) })
      return { status: r.status, data: await r.json().catch(() => null) }
    }, url, metod, kropp)

  const nivapunkter = async () => {
    const { count } = await admin.from('test_nivapunkter').select('*', { count: 'exact', head: true }).eq('user_id', konto.userId)
    return count ?? 0
  }
  const punkterFore = await nivapunkter()

  // Inloggning
  await ga('/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {}), p.click('button[type="submit"]')])
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 90000 })
  await vanta(1200)
  await klickaText(/^Avvisa$/).catch(() => {})

  // Dag 1 i går (aon): ett slutfört figurpass på det egna kontot, så att dag 2 kan göras i appen.
  if (kontoNamn.startsWith('aon')) {
    const { count } = await admin.from('logic_test_v4_sessions').select('*', { count: 'exact', head: true }).eq('user_id', konto.userId).eq('test_type', 'figurserie-pass')
    if (!count) {
      const igar = new Date(Date.now() - 86400000)
      const dag = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(igar)
      const { error } = await admin.from('logic_test_v4_sessions').insert({
        user_id: konto.userId,
        test_type: 'figurserie-pass',
        answers: [],
        created_at: igar.toISOString(),
        started_at: igar.toISOString(),
        completed_at: new Date(igar.getTime() + 180000).toISOString(),
        score: 3,
        meta: { figurpass: 1, alternativ_blandade: true, test_kind: 'figurserie', niva: 'grund', fragor: ['fs-g-vrid-01', 'fs-g-vrid-02', 'fs-g-vand-01', 'fsb-g-antal-01'], serie_version: 2, upprepad: false, dag, antal: 4, budget_s: 180, expert_rad: false, ratt: 3, tid_s: 160, resultat: { ratt: 3, antal: 4, tid_s: 160, budget_s: 180, tappade: [] } },
      })
      logg('dag 1 i går inlagd på det egna kontot', !error, { fel: error?.message })
    }
  }

  // Hemvyn
  await ga('/dashboard/tester')
  await bild('hemvy', true)
  const hem = await p.evaluate(() => {
    const rader = [...document.querySelectorAll('section, div')].filter((e) => /^Figurpass/.test((e.innerText || '').trim()) && e.children.length > 1)
    const rad = rader[rader.length - 1] ?? null
    const knapp = [...document.querySelectorAll('.knapp-primar')].find((e) => e.offsetParent !== null)
    return {
      text: document.body.innerText,
      rad: rad ? rad.innerText : null,
      knappBotten: knapp ? Math.round(knapp.getBoundingClientRect().bottom + window.scrollY) : null,
      knappText: knapp ? knapp.innerText : null,
    }
  })
  // Passraderna i bild (hela sidan skärs av den fasta foten på mobil).
  await p.evaluate(() => {
    const el = [...document.querySelectorAll('p, h2, span')].find((e) => (e.innerText || '').trim() === 'Fler pass i dag' && e.offsetParent !== null)
    el?.scrollIntoView({ block: 'start' })
  })
  await vanta(400)
  await bild('hemvy-passrader')
  logg('figurpassraden syns på hemvyn', /Figurpass/.test(hem.text), { rad: hem.rad?.slice(0, 160) })
  if (mobil) logg('kopparknappens nederkant under 620 px på 360', hem.knappBotten != null && hem.knappBotten <= 620, { botten: hem.knappBotten, knapp: hem.knappText })
  if (kontoNamn === 'gratis') logg('raden är låst för gratis', /Figurpass[\s\S]{0,140}Ingår i Premium/.test(hem.text), {})

  // Alla tester: provraden på Figurserier
  await ga('/dashboard/tester/alla')
  const kort = await p.$('[data-testkort="figurer"]')
  if (kort) {
    await kort.evaluate((e) => e.scrollIntoView({ block: 'start' }))
    await vanta(400)
    await kort.screenshot({ path: path.join(UT, `${prefix}-${String(++nr).padStart(2, '0')}-kortet.png`) })
    const t = await kort.evaluate((e) => e.innerText)
    const vantat = kontoNamn === 'shl' ? /Vårt format: 20 uppgifter på 15 minuter/ : /Samma format som Aon scales ix: cirka 20 uppgifter på 5 minuter/
    logg('provraden i planens format', vantat.test(t), { text: t.slice(-260) })
    if (kontoNamn === 'gratis') logg('provraden låst för gratis', /Ingår i Premium/.test(t), {})
  } else logg('figurseriekortet finns', false)

  if (kontoNamn === 'gratis') {
    const a = await api('/api/traning/figurpass/session')
    logg('gratis: figurpass-POST 403', a.status === 403, { status: a.status })
    const b = await api('/api/traning/ovningsprov/session', 'POST', { typ: 'figurer' })
    logg('gratis: övningsprov-POST 402', b.status === 402, { status: b.status })
    await ga('/dashboard/tester/pass?typ=figurpass')
    await vantaText(/Figurpasset ingår i Premium/)
    await bild('figurpass-betalvagg')
    await ga('/dashboard/tester/ovningsprov/figurer')
    await bild('ovningsprov-startark-last')
  }

  if (kontoNamn === 'shl') {
    await ga('/dashboard/tester/ovningsprov/figurer')
    await bild('ovningsprov-startark')
    const t = await p.evaluate(() => document.body.innerText)
    logg('SHL: vårt format med anmärkningen', /Vårt format/.test(t) && /20 uppgifter på 15 minuter/.test(t) && /SHL Verify G\+ blandar siffror, slutledning och figurer/.test(t), {})
    logg('startarket nämner de två sorterna', /Två sorters uppgifter/.test(t), {})
    // Ett pågående figurpass för perf-inloggat.
    const s = await api('/api/traning/figurpass/session')
    logg('SHL: figurpass startat och lämnat pågående', s.status === 200, { status: s.status })
  }

  if (kontoNamn.startsWith('aon')) {
    // Figurpasset dag 2
    await ga('/dashboard/tester/pass?typ=figurpass')
    await p.waitForSelector('[data-figurpass-uppgift]', { timeout: 90000 })
    await bild('figurpass-uppgift-1')
    for (let i = 0; i < 4; i++) {
      await p.waitForSelector('[data-figurpass-uppgift]', { timeout: 60000 })
      const form = await p.$eval('[data-figurpass-uppgift]', (e) => e.getAttribute('data-figurpass-uppgift'))
      if (form === 'bryter') {
        const fore = await p.$$eval('.serie > .ruta', (r) => r.map((x) => x.getBoundingClientRect().toJSON()))
        await bild(`bryter-fore`)
        await p.click('.serie > .ruta.val:nth-child(2)')
        await p.waitForSelector('[data-regelpanel]', { timeout: 60000 })
        await vanta(500)
        const efter = await p.$$eval('.serie > .ruta', (r) => r.map((x) => ({ ...x.getBoundingClientRect().toJSON(), op: getComputedStyle(x).opacity, ratt: x.classList.contains('ratt'), skugga: getComputedStyle(x).boxShadow })))
        const flytt = fore.some((f, k) => Math.abs(f.x - efter[k].x) > 0.5 || Math.abs(f.width - efter[k].width) > 0.5)
        logg('bryter: koppar på brytaren', efter.filter((x) => x.ratt).length === 1, { skugga: efter.find((x) => x.ratt)?.skugga })
        logg('bryter: ingen nedtoning efter svar', efter.every((x) => x.op === '1'), {})
        logg('bryter: ingen ruta flyttar sig vid val', !flytt, {})
        await bild('bryter-efter')
      } else {
        await p.click('[data-serie-alt] button:nth-child(1)')
        await p.waitForSelector('[data-regelpanel]', { timeout: 60000 })
        await vanta(400)
        if (i === 0) await bild('harnast-efter')
      }
      await p.click('[data-figurpass-nasta]')
      await vanta(900)
    }
    await vantaText(/Figurpasset klart/i)
    await bild('figurpass-resultat', true)
    const r = await p.evaluate(() => document.body.innerText)
    logg('resultatet: "av 4 rätt" och I morgon', /av 4 rätt/.test(r) && /I morgon: ett nytt figurpass/.test(r), {})
    await ga('/dashboard/tester')
    await bild('hemvy-efter', true)
    const h = await p.evaluate(() => document.body.innerText)
    logg('hemvyn: figurpasset gjort', /Figurpass[\s\S]{0,120}Gjort/.test(h), {})
    // Utan Nivåkoll visar hemvyn (läge 1a) ingen serierad; serien läses ur statusen som hemvyn byggs av.
    const st = await api('/api/traning/status', 'GET')
    const serie = st.data?.status?.serie ?? st.data?.serie ?? null
    logg('serien: 2 dagar i rad, dagsringen gjord i dag', serie?.dagar === 2 && serie?.gjordIdag === true, { serie })
    const { data: pass } = await admin.from('logic_test_v4_sessions').select('id').eq('user_id', konto.userId).eq('test_type', 'figurserie-pass').not('completed_at', 'is', null)
    logg('två slutförda figurpass', (pass ?? []).length === 2, { antal: (pass ?? []).length })

    // Övningsprovet i Aons format, inlämnat av klockan
    await ga('/dashboard/tester/ovningsprov/figurer')
    await bild('ovningsprov-startark')
    const t = await p.evaluate(() => document.body.innerText)
    logg('Aon: samma format, cirka 20 på 5 minuter', /Samma format som Aon scales ix/.test(t) && /cirka 20 uppgifter på 5 minuter/i.test(t), {})
    await klickaText(/^(Starta övningsprovet|Fortsätt provet)$/)
    await p.waitForFunction(() => /\/ovningsprov\/figurer\/[0-9a-f-]{36}/.test(location.pathname), { timeout: 90000 })
    await p.waitForSelector('[data-figurprov]', { timeout: 90000 })
    await bild('prov-uppgift-1')
    const sessionId = await p.evaluate(() => location.pathname.split('/').pop())
    for (let i = 0; i < 2; i++) {
      const form = await p.$eval('[data-figurprov]', (e) => e.getAttribute('data-figurprov'))
      if (form === 'bryter') await p.click('.serie > .ruta.val:nth-child(1)')
      else await p.click('[data-serie-alt] button:nth-child(1)')
      await vanta(700)
      await p.click('[data-nasta]')
      await vanta(700)
    }
    // Hoppa till en bryter-uppgift för skärmdumpen.
    const harBryter = await p.evaluate(() => !!document.querySelector('[data-figurprov="bryter"]'))
    await bild(harBryter ? 'prov-bryter' : 'prov-uppgift-3')
    // Klockan körs ut: sessionens start flyttas bakåt på det egna kontot.
    const { data: rad } = await admin.from('logic_test_v4_sessions').select('id, user_id, started_at, created_at').eq('id', sessionId).eq('user_id', konto.userId).single()
    const bak = new Date(Date.now() - 5 * 60000 + 3000).toISOString()
    await admin.from('logic_test_v4_sessions').update({ started_at: bak }).eq('id', rad.id).eq('user_id', konto.userId)
    await ga(`/dashboard/tester/ovningsprov/figurer/${sessionId}`)
    await vantaText(/Övningsprovet klart|av 20 rätt/i, 60000)
    await vanta(800)
    await bild('prov-resultat', true)
    const res = await p.evaluate(() => document.body.innerText)
    const { data: klar } = await admin.from('logic_test_v4_sessions').select('completed_at, meta').eq('id', sessionId).single()
    logg('provet lämnat in av klockan, obesvarade räknade', !!klar?.completed_at && (klar?.meta?.obesvarade ?? 0) >= 18 && klar?.meta?.av_tiden === true, { obesvarade: klar?.meta?.obesvarade, av_tiden: klar?.meta?.av_tiden })
    logg('resultatet visar 20 uppgifter', /av 20 rätt/.test(res), {})
    await klickaText(/^Gå igenom/).catch(() => {})
    await vanta(800)
    await bild('prov-genomgang', true)
    const mini = await p.$$eval('[data-minifig]', (m) => m.length)
    logg('genomgången har miniatyrerna', mini > 0, { antal: mini })
  }

  logg('matrisnivån oförändrad', (await nivapunkter()) === punkterFore, { fore: punkterFore })
  await browser.close()
  console.log(fel.length ? `\n${fel.length} FEL: ${fel.join(', ')}` : '\nInga fel.')
}

const [steg, ...rest] = process.argv.slice(2)
if (steg === 'skapa') await skapa()
else if (steg === 'radera') await radera()
else if (steg === 'kor') await kor(...rest)
else throw new Error('skapa, kor eller radera')
