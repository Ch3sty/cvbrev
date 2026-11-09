// scripts/qa-tester-steg2-vyer-2026-11-09.mjs
// Klicktest i riktig Chrome av vyerna i testplanen steg 2 (2026-11-09):
// "Mitt test är …" i ingången, Alla tester med Ingår i ditt test och Fler
// tester, hemvyns passrotation, och (när typerna syns) nivåtest och pass i
// talserier, spatial förmåga och ordförråd samt I-prov-provet.
//
//   QA_BAS=http://localhost:5200 QA_KONTON_FIL=<scratchpad>/qa-konton-steg2.json \
//   QA_BILDER=<scratchpad>/verifiering-2026-11-09/steg2-vyer QA_ETIKETT=del1 \
//   node scripts/qa-tester-steg2-vyer-2026-11-09.mjs
//
// Fyra genomgångar som ny användare: Pixel 7 ljust och mörkt, 1280 ljust och
// mörkt. Kontona skapas på /register och skrivs direkt till QA_KONTON_FIL
// med id; städningen sker per id med scripts/qa-registrering-stada.mjs
// (räknar först). Premiumgrantens id sparas i filen. Bilder utanför git,
// resultat till docs/qa/tester-steg2-vyer-2026-11-09/.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.QA_BAS || 'http://localhost:5200'
const KONTON_FIL = process.env.QA_KONTON_FIL
const BILDER = process.env.QA_BILDER
if (!KONTON_FIL || !BILDER) throw new Error('QA_KONTON_FIL och QA_BILDER krävs')
const UT = 'docs/qa/tester-steg2-vyer-2026-11-09'
const ETIKETT = process.env.QA_ETIKETT || 'lokal'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const LOSEN = 'QaSteg2!2026x'
const BARA = (process.env.QA_BARA || '').split(',').filter(Boolean)
/** Vilka delar som körs: mitt (ingången, Alla tester, hemvyn), typer (nya typerna), iprov (provet). */
const DELAR = (process.env.QA_DELAR || 'mitt').split(',')

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

fs.mkdirSync(UT, { recursive: true })
fs.mkdirSync(BILDER, { recursive: true })

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1 }
const MOBIL_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'

const resultat = []
const bilder = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

function logg(namn, ok, not = '') {
  resultat.push({ namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

function lasKonton() {
  try {
    return JSON.parse(fs.readFileSync(KONTON_FIL, 'utf8'))
  } catch {
    return { konton: [], anonTest: [], qaIp: [], grants: [] }
  }
}
function spara(nyckel, v) {
  const d = lasKonton()
  d[nyckel] = [...(d[nyckel] ?? []), v]
  fs.writeFileSync(KONTON_FIL, JSON.stringify(d, null, 2))
}

async function idFor(epost) {
  for (let i = 0; i < 30; i++) {
    const { data } = await admin.from('profiles').select('id').eq('email', epost).maybeSingle()
    if (data?.id) return data.id
    await vanta(500)
  }
  return null
}

async function bild(p, namn, beskrivning, helsida = false) {
  const fil = path.join(BILDER, `${ETIKETT}-${namn}.png`)
  await p.screenshot({ path: fil, fullPage: helsida })
  bilder.push({ fil: path.basename(fil), beskrivning })
}

async function sidled(p) {
  return p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
}

async function knappMedText(p, text, exakt = true) {
  const h = await p.evaluateHandle(
    (t, e) => [...document.querySelectorAll('button, a')].find((b) => (e ? b.textContent.trim() === t : b.textContent.includes(t)) && b.offsetParent) ?? null,
    text,
    exakt
  )
  return h.asElement()
}

/** Ligger elementet i viewporten och är det överst i sin mittpunkt (inget lager, som samtyckesraden, över)? */
async function synligOchFri(p, sel) {
  return p.evaluate((s) => {
    const b = [...document.querySelectorAll(s)].find((e) => e.offsetParent)
    if (!b) return { ok: false, varfor: 'saknas' }
    const r = b.getBoundingClientRect()
    if (r.bottom > window.innerHeight + 0.5 || r.top < 0) return { ok: false, varfor: `utanför viewport ${Math.round(r.top)}-${Math.round(r.bottom)} av ${window.innerHeight}` }
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const over = document.elementFromPoint(x, y)
    const fri = !!over && (b === over || b.contains(over))
    return { ok: fri, varfor: fri ? '' : `täckt av ${over?.tagName}.${over?.className?.toString().slice(0, 60)}` }
  }, sel)
}

async function avvisaSamtycke(p) {
  const a = await knappMedText(p, 'Avvisa')
  if (a) await a.click().catch(() => {})
  await vanta(300)
}

async function ny(browser, vp, morkt) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  await p.setViewport(vp)
  if (vp.isMobile) await p.setUserAgent(MOBIL_UA)
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: morkt ? 'dark' : 'light' }])
  p.setDefaultTimeout(30000)
  const fel = []
  p.on('pageerror', (e) => fel.push(`pageerror: ${e.message}`))
  p.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|posthog|Failed to load resource: net::ERR|status of 40[23]|turnstile|cloudflare|i\.posthog|vercel/i.test(m.text())) fel.push(`console: ${m.text().slice(0, 160)}`)
  })
  p.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(BAS) && r.status() >= 400 && !u.includes('_next/static') && r.status() !== 402 && r.status() !== 403) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  if (BAS.includes('localhost')) {
    const ip = `10.98.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
    await p.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
    spara('qaIp', ip)
  }
  return { ctx, p, fel }
}

async function skapaKonto(p, etikett) {
  const epost = `qa-steg2v-${etikett}-${Date.now()}@jobbcoach-qa.example.com`
  await p.goto(`${BAS}/register`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('form input[type="email"]')
  await avvisaSamtycke(p)
  await p.type('form input[type="email"]', epost)
  await p.type('form input[type="password"]', LOSEN)
  const skapa = (await p.$('button[type="submit"]')) ?? (await p.$('button[form]'))
  await skapa.click()
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 45000 }).catch(() => {})
  const uid = await idFor(epost)
  spara('konton', { epost, id: uid, etikett, skapad: new Date().toISOString() })
  return { epost, uid, landat: new URL(p.url()).pathname }
}

async function ge_premium(uid, kalla) {
  const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
  const { data: grant, error } = await admin
    .from('premium_grants')
    .insert({ user_id: uid, days: 7, source: kalla, scope: 'allt', premium_until_after: om7 })
    .select('id')
    .single()
  if (error) throw error
  spara('grants', { id: grant.id, uid })
}

async function las(p, url, namn, beskrivning, helsida = false) {
  await p.goto(`${BAS}${url}`, { waitUntil: 'networkidle2' })
  await vanta(1200)
  await bild(p, namn, beskrivning, helsida)
  return p.evaluate(() => document.body.innerText)
}

/* ------------------------------------------------------------ Mitt test */

async function valjMittTest(p, enhet, val, variant) {
  await p.goto(`${BAS}/dashboard/tester/installningar?forsta=1`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-mitt-test]')
  await vanta(600)
  // Samtyckesraden får aldrig täcka knappar: före Avvisa.
  const fri = await synligOchFri(p, 'footer button, [data-flowshell-primar]')
  logg(`${enhet}: Fortsätt syns och är fri med samtyckesraden uppe`, fri.ok, fri.varfor)
  await bild(p, `${enhet}-mitt-test-tom`, 'Mitt test, steg 1 av 2 innan något är valt')
  await avvisaSamtycke(p)
  const kort = await p.$$eval('[data-mitt-test] [data-val]', (k) => k.map((x) => x.getAttribute('data-val')))
  logg(`${enhet}: korten i ingången`, kort.length >= 7, kort.join(','))
  const text = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: varumärkesraden står med`, text.includes('Leverantörsnamnen är deras varumärken. Vi samarbetar inte med dem och tränar i samma format, inte med deras uppgifter.'))
  logg(`${enhet}: ingången utan talstreck och mittpunkt`, !/—|·/.test(text))

  // Lokförare: den ärliga anmärkningen.
  await p.click('[data-val="lokforare"]')
  await vanta(300)
  logg(`${enhet}: Lokförare visar anmärkningen`, !!(await p.$('[data-lokforare]')))
  await bild(p, `${enhet}-mitt-test-lokforare`, 'Lokförare valt: anmärkningen och Så lägger vi upp det')
  // Annat eller vet inte: kryssrutorna.
  await p.click('[data-val="annat"]')
  await vanta(300)
  const kryss = await p.$$eval('[data-kryss] [role="checkbox"]', (k) => k.map((x) => `${x.textContent.trim()}:${x.getAttribute('aria-checked')}`))
  logg(`${enhet}: Annat fäller ut kryssrutorna, figurer förvalt`, kryss.length >= 6 && kryss[0].endsWith('true'), kryss.join(' | '))
  await bild(p, `${enhet}-mitt-test-annat`, 'Annat eller vet inte: kryssrutorna', true)

  await p.click(`[data-val="${val}"]`)
  await vanta(300)
  if (variant) {
    const v = await knappMedText(p, variant)
    if (v) await v.click()
    await vanta(200)
  }
  const upplagg = await p.$eval('[data-upplagg]', (e) => e.innerText).catch(() => '')
  logg(`${enhet}: Så lägger vi upp det för ${val}`, /Passen/.test(upplagg) && /Alla tester/.test(upplagg), upplagg.replace(/\n/g, ' | ').slice(0, 220))
  await bild(p, `${enhet}-mitt-test-${val}`, `Mitt test: ${val} valt, Så lägger vi upp det`)
  await bild(p, `${enhet}-mitt-test-${val}-hel`, `Mitt test: ${val}, hela steget`, true)
  logg(`${enhet}: ingången utan sidledsscroll`, await sidled(p))

  const fortsatt = await knappMedText(p, 'Fortsätt')
  await fortsatt.click()
  await p.waitForSelector('#provdatum')
  await vanta(300)
  const chip = await knappMedText(p, 'Om två veckor')
  await chip.click()
  await vanta(300)
  await bild(p, `${enhet}-datum`, 'Steg 2 av 2: provdatumet med planen')
  const visa = await knappMedText(p, 'Visa min plan')
  await visa.click()
  await p.waitForFunction(() => location.pathname === '/dashboard/tester', { timeout: 30000 }).catch(() => {})
  await vanta(1500)
}

async function kontrolleraPlan(uid, val, enhet) {
  const { data } = await admin.from('test_planer').select('mitt_test, mitt_test_variant, extra_typer, testtyper, leverantor, provdatum').eq('user_id', uid).maybeSingle()
  logg(`${enhet}: planen sparad med valet`, data?.mitt_test === val && !!data?.provdatum, JSON.stringify(data))
  return data
}

async function allaTester(p, enhet, forvantat) {
  await p.goto(`${BAS}/dashboard/tester/alla`, { waitUntil: 'networkidle2' })
  await vanta(1200)
  await bild(p, `${enhet}-alla`, 'Alla tester med Mitt test och Ingår i ditt test')
  await bild(p, `${enhet}-alla-hel`, 'Alla tester, hela sidan', true)
  const rad = await p.$eval('[data-mitt-test-rad]', (e) => e.innerText).catch(() => '')
  logg(`${enhet}: raden Mitt test överst`, rad.length > 0, rad.replace(/\n/g, ' | '))
  const ingar = await p.$$eval('[data-ingar] [data-testkort]', (k) => k.map((x) => x.getAttribute('data-testkort')))
  logg(`${enhet}: Ingår i ditt test`, forvantat.every((g) => ingar.includes(g)), ingar.join(','))
  const fler = await p.$$eval('[data-fler-tester] [data-fler]', (k) => k.map((x) => x.getAttribute('data-fler')))
  logg(`${enhet}: Fler tester har resten`, fler.length > 0 && fler.every((g) => !ingar.includes(g)), fler.join(','))
  if (fler.length) {
    await p.click(`[data-fler="${fler[0]}"]`)
    await vanta(900)
    const ut = await p.$(`#fler-kort [data-testkort], #fler-kort section`)
    logg(`${enhet}: Fler tester fäller ut kortet`, !!ut)
    await bild(p, `${enhet}-alla-fler-utfalld`, 'Fler tester: ett kort utfällt')
  }
  logg(`${enhet}: Alla tester utan sidledsscroll`, await sidled(p))
  const text = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: Alla tester utan talstreck`, !/—/.test(text))
}

async function mitt(browser, enhet, vp, morkt, val, forvantat) {
  const { ctx, p, fel } = await ny(browser, vp, morkt)
  const k = await skapaKonto(p, enhet)
  logg(`${enhet}: kontot skapat och inloggat`, k.uid && k.landat.startsWith('/dashboard'), k.landat)
  await vanta(800)
  await valjMittTest(p, enhet, val)
  await kontrolleraPlan(k.uid, val, enhet)
  const hem = await las(p, '/dashboard/tester', `${enhet}-hem`, `Hemvyn med ${val} valt`)
  logg(`${enhet}: hemvyn ritas`, hem.length > 100)
  await bild(p, `${enhet}-hem-hel`, `Hemvyn med ${val}, hela sidan`, true)
  logg(`${enhet}: hemvyn utan sidledsscroll`, await sidled(p))
  await allaTester(p, enhet, forvantat)
  logg(`${enhet}: inga konsolfel eller 4xx/5xx`, fel.length === 0, fel.slice(0, 5).join(' ; '))
  await ctx.close()
  return k
}

/* ------------------------------------------------------------ nya typerna */

/** Ett nivåtest: starta på testsidan, svara på alla uppgifter, lämna in, öppna genomgången. */
async function nivatest(p, enhet, slug) {
  await p.goto(`${BAS}/dashboard/tester/${slug}`, { waitUntil: 'networkidle2' })
  await vanta(800)
  await avvisaSamtycke(p)
  await bild(p, `${enhet}-${slug}-start`, `Testsidan ${slug}`)
  const start = await knappMedText(p, 'Starta testet')
  if (!start) {
    logg(`${enhet}: ${slug} har Starta testet`, false)
    return false
  }
  await start.click()
  await p.waitForSelector('[data-steg2] [data-steg2-alternativ] [role="radio"]', { timeout: 30000 }).catch(() => {})
  // Vänta in hydreringen innan första trycket.
  await vanta(2000)
  await bild(p, `${enhet}-${slug}-uppgift-1`, `${slug}, första uppgiften`)
  logg(`${enhet}: ${slug} visar en uppgift`, !!(await p.$('[data-steg2-uppgift]')))
  logg(`${enhet}: ${slug} uppgiften utan sidledsscroll`, await sidled(p))
  const fri = await synligOchFri(p, '[data-steg2-alternativ] [role="radio"]:last-child')
  logg(`${enhet}: ${slug} sista alternativet syns utan att rulla`, fri.ok, fri.varfor)
  for (let i = 0; i < 15; i++) {
    await p.waitForFunction(() => document.querySelectorAll('[data-steg2-alternativ] [role="radio"]:not([disabled])').length > 0, { timeout: 15000 }).catch(() => {})
    const fore = await p.evaluate(() => document.querySelector('[data-steg2-uppgift]')?.innerHTML.length ?? 0)
    const alt = await p.$$('[data-steg2-alternativ] [role="radio"]:not([disabled])')
    if (!alt.length) break
    await alt[i % alt.length].click()
    if (i === 4) await bild(p, `${enhet}-${slug}-uppgift-5`, `${slug}, uppgift fem besvarad`)
    if (i < 14) await p.waitForFunction((f) => (document.querySelector('[data-steg2-uppgift]')?.innerHTML.length ?? 0) !== f, { timeout: 8000 }, fore).catch(() => {})
    await vanta(250)
  }
  await vanta(800)
  const lamna = await knappMedText(p, 'Lämna in')
  if (lamna) await lamna.click()
  await vanta(500)
  const bekrafta = await knappMedText(p, 'Lämna in och se resultatet')
  if (bekrafta) await bekrafta.click()
  await p.waitForFunction(() => location.pathname.includes('/results'), { timeout: 30000 }).catch(() => {})
  await vanta(2000)
  await bild(p, `${enhet}-${slug}-resultat`, `${slug}, resultatet`)
  const res = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: ${slug} resultatet visas`, /av 15|rätt/i.test(res), res.slice(0, 120).replace(/\n/g, ' | '))
  logg(`${enhet}: ${slug} resultatet utan talstreck och mittpunkt`, !/—|·/.test(res))
  const ga = await knappMedText(p, 'Gå igenom', false)
  if (ga) {
    await ga.click()
    await vanta(1500)
    await bild(p, `${enhet}-${slug}-genomgang`, `${slug}, genomgången`, true)
    logg(`${enhet}: ${slug} genomgången visar facit`, !!(await p.$('[data-steg2-facit]')))
  } else logg(`${enhet}: ${slug} har Gå igenom`, false)
  return true
}

/** Ett pass: svara på alla sex, genomgången efter varje svar, resultatet. */
async function steg2pass(p, enhet, kind) {
  await p.goto(`${BAS}/dashboard/tester/pass?typ=steg2pass&kind=${kind}`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-steg2-uppgift], [data-steg2pass-betalvagg]', { timeout: 30000 }).catch(() => {})
  await avvisaSamtycke(p)
  await vanta(500)
  if (await p.$('[data-steg2pass-betalvagg]')) {
    await bild(p, `${enhet}-${kind}pass-betalvagg`, `${kind}passet: betalväggen`)
    return 'betalvagg'
  }
  await bild(p, `${enhet}-${kind}pass-1`, `${kind}passet, uppgift 1`)
  logg(`${enhet}: ${kind}passet utan sidledsscroll`, await sidled(p))
  const vetInte = await synligOchFri(p, '[data-steg2pass-vetinte]')
  logg(`${enhet}: ${kind}passet Vet inte syns och är fri`, vetInte.ok, vetInte.varfor)
  for (let i = 0; i < 6; i++) {
    const alt = await p.$$('[data-steg2-alternativ] [role="radio"]:not([disabled])')
    if (!alt.length) break
    await alt[(i + 1) % alt.length].click()
    await p.waitForSelector('[data-steg2-facit]', { timeout: 15000 }).catch(() => {})
    await vanta(400)
    if (i === 0) {
      await bild(p, `${enhet}-${kind}pass-genomgang`, `${kind}passet, genomgången efter svaret`)
      logg(`${enhet}: ${kind}passet visar facit efter svaret`, !!(await p.$('[data-steg2-facit]')))
      const nasta = await synligOchFri(p, '[data-steg2pass-nasta]')
      logg(`${enhet}: ${kind}passet Nästa syns och är fri`, nasta.ok, nasta.varfor)
    }
    await p.click('[data-steg2pass-nasta]').catch(() => {})
    await vanta(700)
  }
  await p.waitForSelector('[data-steg2-resultat]', { timeout: 30000 }).catch(() => {})
  await vanta(600)
  await bild(p, `${enhet}-${kind}pass-resultat`, `${kind}passet klart: ringen, var du tappar, tempot`)
  logg(`${enhet}: ${kind}passets resultat`, !!(await p.$('[data-steg2-resultat]')))
  return 'klart'
}

async function typer(browser, enhet, vp, morkt, premium) {
  const { ctx, p, fel } = await ny(browser, vp, morkt)
  const k = await skapaKonto(p, enhet)
  logg(`${enhet}: kontot skapat`, !!k.uid)
  if (premium) await ge_premium(k.uid, 'qa-tester-steg2-vyer')
  await vanta(600)
  await valjMittTest(p, enhet, 'iprov', 'Polisen')
  const plan = await kontrolleraPlan(k.uid, 'iprov', enhet)
  logg(`${enhet}: varianten Polisen sparad`, plan?.mitt_test_variant === 'polis')
  const hem = await las(p, '/dashboard/tester', `${enhet}-hem-iprov`, 'Hemvyn med Polisen valt: dagens pass i rotationen')
  logg(`${enhet}: hemvyn visar dagens pass ur I-provet`, /Spatial förmåga, sex uppgifter|Talserier, sex uppgifter/.test(hem), hem.slice(0, 200).replace(/\n/g, ' | '))
  await allaTester(p, enhet, ['talserie', 'spatial'])
  await nivatest(p, enhet, 'talserier-grund')
  await nivatest(p, enhet, 'spatial-grund')
  if (premium) {
    await nivatest(p, enhet, 'spatial-avancerad')
    for (const kind of ['talserie', 'spatial']) await steg2pass(p, enhet, kind)
    const hem2 = await las(p, '/dashboard/tester', `${enhet}-hem-efter`, 'Hemvyn efter passen: bockarna')
    logg(`${enhet}: hemvyn bockar passen`, (hem2.match(/Gjort/g) ?? []).length >= 2)
    await p.goto(`${BAS}/dashboard/tester/alla?flik=utveckling`, { waitUntil: 'networkidle2' })
    await vanta(2500)
    await bild(p, `${enhet}-utveckling`, 'Din utveckling: Pass per testtyp med talserier och spatial förmåga', true)
    const utv = await p.evaluate(() => document.body.innerText)
    logg(`${enhet}: Pass per testtyp räknar passen`, /Talserier\s*\n?\s*1 pass/.test(utv) && /Spatial förmåga\s*\n?\s*1 pass/.test(utv))
  } else {
    const r = await steg2pass(p, enhet, 'spatial')
    logg(`${enhet}: spatialpasset spärrat för gratis`, r === 'betalvagg')
    await p.goto(`${BAS}/dashboard/tester/spatial-avancerad`, { waitUntil: 'networkidle2' })
    await vanta(800)
    await bild(p, `${enhet}-spatial-avancerad-last`, 'Spatial förmåga avancerad för gratis')
  }
  const alla = await las(p, '/dashboard/tester/alla', `${enhet}-alla-efter`, 'Alla tester efter nivåtesten: korten visar resultaten')
  logg(`${enhet}: korten visar gjorda nivåer`, /talserier/i.test(alla) && /spatial/i.test(alla) && /av 15/.test(alla))
  const { data: rader } = await admin.from('logic_test_v4_sessions').select('test_type, completed_at, score').eq('user_id', k.uid)
  logg(`${enhet}: sessionerna sparade`, ['talserier-grund', 'spatial-grund'].every((t) => rader?.some((r) => r.test_type === t && r.completed_at)), JSON.stringify(rader?.map((r) => `${r.test_type}:${r.score}`)))
  logg(`${enhet}: inga konsolfel eller 4xx/5xx`, fel.length === 0, fel.slice(0, 5).join(' ; '))
  await ctx.close()
}

/* ------------------------------------------------------------ I-prov-provet */

async function iprov(browser, enhet, vp, morkt, premium) {
  const { ctx, p, fel } = await ny(browser, vp, morkt)
  const k = await skapaKonto(p, enhet)
  if (premium) await ge_premium(k.uid, 'qa-tester-steg2-vyer')
  await vanta(600)
  await valjMittTest(p, enhet, 'iprov', 'Polisen')
  await p.goto(`${BAS}/dashboard/tester/iprov`, { waitUntil: 'networkidle2' })
  await vanta(1000)
  await avvisaSamtycke(p)
  await bild(p, `${enhet}-iprov-startark`, premium ? 'Startarket, halva provet förvalt' : 'Startarket låst: paketraden i foten')
  const text = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: startarket har halva provet förvalt`, (await p.$eval('[data-iprov-val="halvt"]', (e) => e.getAttribute('aria-checked')).catch(() => null)) === 'true')
  logg(`${enhet}: startarket säger att talen är våra`, text.includes('Pliktverket publicerar inte antal och tider'))
  logg(`${enhet}: startarket utan sidledsscroll`, await sidled(p))
  if (!premium) {
    logg(`${enhet}: startarket låst med pris ur planen`, !!(await p.$('[data-iprov-last]')) && /149 kr i månaden/.test(text))
    logg(`${enhet}: inga konsolfel eller 4xx/5xx`, fel.length === 0, fel.slice(0, 5).join(' ; '))
    await ctx.close()
    return
  }
  const fri = await synligOchFri(p, '[data-iprov-starta]')
  logg(`${enhet}: Starta övningsprovet syns och är fri`, fri.ok, fri.varfor)
  await p.click('[data-iprov-starta]')
  await p.waitForSelector('[data-iprov-mellanblad]', { timeout: 30000 }).catch(() => {})
  await vanta(800)
  let delnr = 0
  for (let varv = 0; varv < 8; varv++) {
    if (await p.$('[data-iprov-resultat]')) break
    if (!(await p.$('[data-iprov-mellanblad]'))) break
    delnr++
    await bild(p, `${enhet}-iprov-mellanblad-${delnr}`, `Mellanbladet före deltest ${delnr}`)
    if (delnr === 1) {
      const t = await p.evaluate(() => document.body.innerText)
      logg(`${enhet}: mellanbladet visar ingen klocka`, !(await p.$('[data-klocka]')), t.slice(0, 80).replace(/\n/g, ' | '))
    }
    await p.click('[data-iprov-starta-del]')
    await p.waitForSelector('[data-iprov-fraga] [data-steg2-alternativ] [role="radio"]', { timeout: 20000 }).catch(() => {})
    await vanta(800)
    if (delnr <= 2) await bild(p, `${enhet}-iprov-fraga-${delnr}`, `Deltest ${delnr}: frågan med klockan och segmentstapeln`)
    if (delnr === 1) {
      logg(`${enhet}: frågan har klockan`, !!(await p.$('[data-klocka]')))
      logg(`${enhet}: frågan har segmentstapeln`, !!(await p.$('[data-segmentstapel]')))
      logg(`${enhet}: frågan utan sidledsscroll`, await sidled(p))
    }
    // Svara på alla utom den sista, hoppa sedan dit och avsluta deltestet.
    const antal = await p.$$eval('[data-segmentstapel] button', (b) => b.length)
    for (let i = 0; i < antal - 1; i++) {
      const alt = await p.$$('[data-iprov-fraga] [data-steg2-alternativ] [role="radio"]')
      if (alt.length) await alt[i % alt.length].click()
      await vanta(450)
    }
    if (!(await p.$('[data-iprov-avsluta-del]'))) {
      const seg = await p.$$('[data-segmentstapel] button')
      if (seg.length) await seg[seg.length - 1].click()
      await vanta(300)
    }
    await p.click('[data-iprov-avsluta-del]').catch(() => {})
    await vanta(500)
    const bekrafta = await knappMedText(p, 'Avsluta deltestet')
    if (delnr === 1) await bild(p, `${enhet}-iprov-avsluta-fraga`, 'Bekräftelsen: deltestet går inte att öppna igen')
    // Två knappar heter Avsluta deltestet: den i dialogen är den sista.
    const knappar = await p.$$('button')
    const dialogKnapp = (await Promise.all(knappar.map(async (b) => [b, await b.evaluate((e) => e.textContent?.trim() === 'Avsluta deltestet' && !e.hasAttribute('data-iprov-avsluta-del'))]))).filter(([, ok]) => ok).map(([b]) => b).pop()
    if (dialogKnapp) await dialogKnapp.click()
    else if (bekrafta) await bekrafta.click()
    await p.waitForSelector('[data-iprov-mellanblad], [data-iprov-resultat]', { timeout: 20000 }).catch(() => {})
    await vanta(900)
  }
  logg(`${enhet}: alla deltest genomförda`, delnr >= 4, `${delnr} deltest`)
  await p.waitForSelector('[data-iprov-resultat]', { timeout: 30000 }).catch(() => {})
  await vanta(800)
  await bild(p, `${enhet}-iprov-resultat`, 'Resultatet: huvudtalet och liggande staplar per deltest')
  const res = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: resultatet har en stapel per deltest`, (await p.$$('[data-iprov-stapel]')).length === delnr)
  logg(`${enhet}: resultatet utan stanine-tal, med meningen om skalan`, /niogradiga skala/.test(res) && !/stanine/i.test(res))
  logg(`${enhet}: resultatet utan talstreck och mittpunkt`, !/—|·/.test(res))
  // Ingen väg tillbaka: deltest 1 kan inte startas igen.
  const id = new URL(p.url()).pathname.split('/').pop()
  const igen = await p.evaluate(async (sid) => (await fetch('/api/traning/iprov/del', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid, nr: 2, handling: 'starta' }) })).status, id)
  logg(`${enhet}: ett avslutat deltest går inte att öppna igen`, igen === 409, `status ${igen}`)
  await p.click('[data-iprov-ga-igenom]').catch(() => {})
  await vanta(800)
  await bild(p, `${enhet}-iprov-detalj`, 'Detaljvyn: tempo per deltest och genomgången')
  logg(`${enhet}: detaljvyn visar tempot`, !!(await p.$('[data-iprov-tempo]')))
  await p.click('[data-iprov-genomga]').catch(() => {})
  await vanta(800)
  await bild(p, `${enhet}-iprov-genomgang`, 'Genomgången av första deltestet')
  logg(`${enhet}: genomgången visar facit`, !!(await p.$('[data-steg2-facit]')))
  const { data: rad } = await admin.from('logic_test_v4_sessions').select('test_type, score, completed_at').eq('user_id', k.uid).eq('test_type', 'iprov-prov')
  logg(`${enhet}: provet sparat och rättat`, rad?.[0]?.completed_at && typeof rad[0].score === 'number', JSON.stringify(rad))
  logg(`${enhet}: inga konsolfel eller 4xx/5xx`, fel.filter((f) => !f.includes('/api/traning/iprov/del')).length === 0, fel.slice(0, 5).join(' ; '))
  await ctx.close()
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
try {
  const korningar = []
  if (DELAR.includes('mitt')) {
    korningar.push(
      ['p7-ljust-shl', () => mitt(browser, 'p7-ljust-shl', PIXEL7, false, 'shl', ['numerisk', 'deduktiv', 'figurer', 'verbal'])],
      ['p7-morkt-lokforare', () => mitt(browser, 'p7-morkt-lokforare', PIXEL7, true, 'lokforare', ['figurer', 'verbal', 'numerisk', 'deduktiv'])],
      ['d1280-ljust-matrigma', () => mitt(browser, 'd1280-ljust-matrigma', DESKTOP, false, 'matrigma', ['logik'])],
      ['d1280-morkt-aon', () => mitt(browser, 'd1280-morkt-aon', DESKTOP, true, 'aon', ['figurer', 'numerisk', 'verbal', 'deduktiv'])]
    )
  }
  if (DELAR.includes('typer')) {
    korningar.push(
      ['p7-ljust-polisen-premium', () => typer(browser, 'p7-ljust-polisen-premium', PIXEL7, false, true)],
      ['p7-morkt-polisen-gratis', () => typer(browser, 'p7-morkt-polisen-gratis', PIXEL7, true, false)],
      ['d1280-morkt-polisen-premium', () => typer(browser, 'd1280-morkt-polisen-premium', DESKTOP, true, true)],
      ['d1280-ljust-polisen-gratis', () => typer(browser, 'd1280-ljust-polisen-gratis', DESKTOP, false, false)]
    )
  }
  if (DELAR.includes('iprov')) {
    korningar.push(
      ['p7-ljust-iprov-premium', () => iprov(browser, 'p7-ljust-iprov-premium', PIXEL7, false, true)],
      ['p7-morkt-iprov-gratis', () => iprov(browser, 'p7-morkt-iprov-gratis', PIXEL7, true, false)],
      ['d1280-morkt-iprov-premium', () => iprov(browser, 'd1280-morkt-iprov-premium', DESKTOP, true, true)]
    )
  }
  for (const [namn, f] of korningar) {
    if (BARA.length && !BARA.includes(namn)) continue
    try {
      await f()
    } catch (e) {
      logg(`${namn}: genomgången avbröts`, false, String(e?.message ?? e).slice(0, 200))
    }
  }
} finally {
  await browser.close()
}

const ok = resultat.filter((r) => r.ok).length
fs.writeFileSync(path.join(UT, `klicktest-${ETIKETT}.json`), JSON.stringify({ bas: BAS, tid: new Date().toISOString(), ok, totalt: resultat.length, resultat, bilder }, null, 2))
fs.writeFileSync(path.join(BILDER, `bilder-${ETIKETT}.json`), JSON.stringify(bilder, null, 2))
console.log(`\n${ok} av ${resultat.length} kontroller gröna`)
