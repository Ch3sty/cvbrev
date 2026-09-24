// scripts/qa-slutflode-sist.mjs
//
// De fyra sista punkterna efter slutflödestestet 2026-09-24
// (docs/qa/qa-slutflode-2026-09-24.md, avsnittet "Sista punkterna"), i
// riktig Chrome på Pixel 7 mot ett lokalt produktionsbygge i Stripes
// testläge. Hjälparna kommer från scripts/qa-slutflode.mjs.
//
//   SCRATCH=<tmp> BAS=http://localhost:3481 node scripts/qa-slutflode-sist.mjs <logik|kop|hoppa|mall|alla>
//
// Konton: qa-slut-sist-<del>-2026-09-24@jobbcoach.ai, id till
// $SCRATCH/qa-slut-konton.json direkt när de skapas. Skärmdumpar
// docs/qa/slutflode/sist-*.png, kontrollerna i docs/qa/slutflode/sist-resultat.jsonl.
// Städningen: scripts/qa-slutflode-stada.mjs med samma SCRATCH. Nycklar skrivs aldrig ut.

import fs from 'node:fs'
import path from 'node:path'
import {
  BAS,
  nySida,
  text,
  rader,
  url,
  ga,
  klicka,
  vantaPa,
  vantaText,
  fyllKonto,
  skickaKonto,
  headerSkapaKonto,
  loggaIn,
  vantaPaProfil,
  kopstegTillBetalt,
  vantaRetur,
  registreraId,
  sparaKonto,
  sparaToken,
  lasKonton,
  epost,
  vanta,
  starta,
} from './qa-slutflode.mjs'

const UT = 'docs/qa/slutflode'
const LOGG = `${UT}/sist-resultat.jsonl`

function logg(del, steg, ok, data = {}) {
  const rad = { tid: new Date().toISOString(), del, steg, ok: ok === null ? null : !!ok, ...data }
  fs.appendFileSync(LOGG, JSON.stringify(rad) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} [${del}] ${steg}  ${JSON.stringify(data).slice(0, 600)}`)
}
async function dump(p, namn, fullPage = false) {
  const fil = path.join(UT, `sist-${namn}.png`)
  await p.screenshot({ path: fil, fullPage }).catch(async () => p.screenshot({ path: fil }).catch(() => {}))
}

/* ---------------------------------------------- 1. logiktestprovet (K1) */

async function logik(browser) {
  const D = 'logik'
  const { p, ctx, fel } = await nySida(browser, 'pixel7')
  await ga(p, '/verktyg/rekryteringstester/prova')
  await p.evaluate(() => document.querySelector('[data-cta="prova-start"]')?.click())
  await vanta(2500)
  for (let i = 0; i < 40; i++) {
    if (await p.$('a[data-cta="prova-gate"]')) break
    await p.evaluate((i) => {
      const b = [...document.querySelectorAll('button[aria-label^="Svarsalternativ"]')].filter((e) => !e.disabled)
      if (b.length) b[i % b.length].click()
    }, i)
    await vanta(1500)
  }
  await p.waitForSelector('a[data-cta="prova-gate"]', { timeout: 30000 }).catch(() => {})
  await p.evaluate(() => document.querySelector('a[data-cta="prova-gate"]')?.scrollIntoView({ block: 'center' }))
  await dump(p, 'logik-1-sparr')
  const href = await p.evaluate(() => document.querySelector('a[data-cta="prova-gate"]')?.getAttribute('href') ?? null)
  const token = href ? decodeURIComponent(href.split('=').pop()) : null
  if (token) sparaToken('test', token)
  logg(D, 'spärren: Skapa konto och se svaren', Boolean(token), { href })
  if (!token) return
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.evaluate(() => document.querySelector('a[data-cta="prova-gate"]')?.click())])
  await vantaPa(p, () => location.pathname === '/register', null, 30000).catch(() => {})
  await vanta(1000)
  const reg = await text(p)
  await dump(p, 'logik-2-register')
  logg(D, 'registreringen lovar svaren med förklaring', /se alla svar med förklaring/i.test(reg), { rad: rader(reg, /förklaring/i)[0] })
  const email = epost('sist-logik')
  await fyllKonto(p, { namn: 'Lisa Logik', email })
  await skickaKonto(p)
  const id = await registreraId('sist-logik', email)
  for (let i = 0; i < 30 && !url(p).startsWith('/dashboard/tester/prov/'); i++) await vanta(500)
  await vantaText(p, /rätt av 5/, 20000)
  await vanta(1200)
  const t = await text(p)
  await dump(p, 'logik-3-resultat', true)
  const regler = await p.evaluate(() => [...document.querySelectorAll('section[aria-label="Fråga för fråga"] li p.rounded-lg')].map((e) => e.innerText.trim()))
  const markeringar = rader(t, /^(Rätt|Fel|Hoppad)$/)
  logg(D, 'landar på resultatsidan under /dashboard/tester', url(p) === `/dashboard/tester/prov/${token}`, { id, url: url(p) })
  logg(D, 'fem frågor med rätt eller fel', markeringar.length === 5, { markeringar })
  logg(D, 'förklaring per fråga (regeln), öppen från start', regler.length === 5 && regler.every((r) => r.length > 20), { forsta: regler[0]?.slice(0, 120) })
  logg(D, 'vägen vidare: Gör grundnivån och Se Träningspaketet, 79 kr i veckan', /Gör grundnivån/.test(t) && /Se Träningspaketet, 79 kr i veckan/.test(t), {
    rader: rader(t, /Gör grundnivån|Träningspaketet|rätt av/),
  })
  const traning = await p.evaluate(() => document.querySelector('a[data-cta="logiktestprov-traningspaketet"]')?.getAttribute('href'))
  logg(D, 'Träningspaketet-länken går till köpsteget', traning === '/dashboard/valj-spar?paket=test_week&steg=kop', { traning })
  logg(D, 'inga talstreck eller Premium på sidan', !/—|Premium/.test(t), {})
  // Omladdning: samma sida, ingen ny aktivitet.
  await ga(p, `/dashboard/tester/prov/${token}`)
  logg(D, 'omladdning visar samma resultat', /rätt av 5/.test(await text(p)), {})
  logg(D, 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 6) })
  await ctx.close()
}

/* --------------------------------- 3. hoppa över, och 404 för annans prov */

async function hoppa(browser) {
  const D = 'hoppa'
  const { p, ctx, fel } = await nySida(browser, 'pixel7')
  await headerSkapaKonto(p)
  await klicka(p, /^Hoppa över/, 'button')
  await vanta(500)
  await dump(p, 'hoppa-1-steg2')
  const email = epost('sist-hoppa')
  await fyllKonto(p, { namn: 'Hanna Hoppa', email })
  await skickaKonto(p)
  const id = await registreraId('sist-hoppa', email)
  await vanta(1000)
  let t = await text(p)
  await dump(p, 'hoppa-2-sparval', true)
  logg(D, 'spårvalet efter Hoppa över', url(p).startsWith('/dashboard/valj-spar') && url(p).includes('hoppat=1'), { id, url: url(p) })
  await klicka(p, /^Börja gratis/, 'button, a')
  await vantaPa(p, () => location.pathname === '/dashboard', null, 30000).catch(() => {})
  await vanta(2000)
  t = await text(p)
  await dump(p, 'hoppa-3-hem', true)
  logg(D, 'Börja gratis landar på hemskärmen utan frågan en gång till', url(p) === '/dashboard' && !/Vad vill du börja med\?/.test(t), { url: url(p), rader: rader(t).slice(4, 10) })

  // Annans prov: 404 med rätt status i dashboardens skal.
  const token = (lasKonton().tokens.test ?? []).at(-1)
  if (token) {
    const svar = await p.goto(`${BAS}/dashboard/tester/prov/${token}`, { waitUntil: 'networkidle2' })
    await vanta(800)
    const s = await text(p)
    await dump(p, 'logik-4-annans-prov-404')
    logg(D, 'annan användares token ger 404', svar?.status() === 404 && /Det här provet finns inte/.test(s), { status: svar?.status() })
  }

  await mallSteg7(p)
  logg(D, 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 6) })
  await ctx.close()
}

/* ------------------------------ 4. CV-byggarens steg 7 med låst mall (K2) */

async function mallSteg7(p) {
  await ga(p, '/dashboard/skapa-cv?steg=7&mall=disk-plus')
  await vanta(2500)
  await p.evaluate(() => {
    const rad = [...document.querySelectorAll('[role="status"], section')].find((e) => /Ingår när du har ett paket/.test(e.innerText))
    rad?.scrollIntoView({ block: 'center' })
  })
  await vanta(600)
  const m = await text(p)
  await dump(p, 'mall-1-steg7-last')
  logg('mall', 'steg 7: låst mall utan Premium', /Ingår när du har ett paket/.test(m) && /Köp CV-paketet, 79 kr i veckan/.test(m) && !/Premium/.test(m), {
    rader: rader(m, /Ingår|CV-paketet|Premium|Mallen/).slice(0, 8),
  })
  await dump(p, 'mall-2-steg7-helsida', true)
  const kopLank = await p.evaluate(() => [...document.querySelectorAll('a')].find((a) => /^Köp CV-paketet/.test(a.innerText.trim()))?.getAttribute('href'))
  logg('mall', 'Köp-länken går till köpsteget', kopLank === '/dashboard/valj-spar?paket=cv_week&steg=kop', { kopLank })
}

/** Bara steg 7, med gratiskontot från hoppa-delen. */
async function mall(browser) {
  const { p, ctx, fel } = await nySida(browser, 'pixel7')
  await loggaIn(p, epost('sist-hoppa'))
  await mallSteg7(p)
  logg('mall', 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 6) })
  await ctx.close()
}

/* ---------------------------------------- 2. köpet i ett steg (iakttagelse 1) */

async function kop(browser) {
  const D = 'kop'
  const { p, ctx, fel } = await nySida(browser, 'pixel7')
  await headerSkapaKonto(p)
  await p.click('[role="radio"][data-intent="cv"]')
  await vanta(250)
  await klicka(p, /^Fortsätt$/, 'footer button')
  await vanta(600)
  const email = epost('sist-kop')
  await fyllKonto(p, { namn: 'Klara Kop', email })
  await skickaKonto(p)
  const id = await registreraId('sist-kop', email)
  for (let i = 0; i < 30 && !/steg 3 av 3/i.test(await text(p)); i++) await vanta(500)
  await klicka(p, /^Börja gratis$/, 'footer button')
  await vantaPa(p, () => location.pathname.startsWith('/dashboard/skapa-cv'), null, 30000).catch(() => {})
  const vPr = await vantaPaProfil(id, (pr) => pr.onboarding_track === 'cv', 20000)
  logg(D, 'kontot har ett sparat spår (cv)', vPr.ok, { id, track: vPr.profil?.onboarding_track })

  await ga(p, '/dashboard/cv-mallar')
  await vanta(2000)
  const last = await p.evaluate(() => {
    const el = [...document.querySelectorAll('[role="radio"]')].find((e) => /ingår i CV-paketet/.test(e.getAttribute('aria-label') || ''))
    if (!el) return null
    el.scrollIntoView({ block: 'center' })
    el.click()
    return el.getAttribute('aria-label')
  })
  await vanta(1200)
  await klicka(p, /^Ladda ned med CV-paketet/, 'button').catch(async () => {
    await klicka(p, /CV-paketet, 79 kr i veckan/, 'button')
  })
  await vanta(1200)
  const vagg = await p.evaluate(() => (document.querySelector('[role="dialog"]') ?? document.body).innerText)
  await dump(p, 'kop-1-betalvagg')
  logg(D, 'betalväggen på låst mall', /Köp CV-paketet, 79 kr i veckan/.test(vagg), { mall: last })
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), klicka(p, /^Köp CV-paketet, 79 kr i veckan/, 'button, a')])
  await vanta(1500)
  const t = await text(p)
  await dump(p, 'kop-2-kopsteg-direkt')
  const produktval = await p.$('[aria-labelledby="upgrade-sheet-title"]')
  logg(D, 'Köp-knappen går direkt till köpsteget, inget produktval, inget spårval', url(p) === '/dashboard/valj-spar?paket=cv_week&steg=kop' && /Steg 2 av 2/i.test(t) && !produktval, {
    url: url(p),
    steg: rader(t, /Steg \d av 2/i)[0],
  })
  const k = await kopstegTillBetalt(p, 'sist', 'kop-3')
  logg(D, 'köpsteget och kassan med 4242', /CV-paketet/.test(k.kopsteg.join(' ')) && /79/.test(k.kassa.join(' ')), { kassa: k.kassa, samtycke: k.samtycke })
  await vantaRetur(p)
  await dump(p, 'kop-4-retur')
  const w = await vantaPaProfil(id, (pr) => pr.subscription_status === 'active' && pr.premium_scope === 'cv')
  sparaKonto('sist-kop', { customer: w.profil?.stripe_customer_id, subscription: w.profil?.subscription_id })
  logg(D, 'webhook: profilen har CV-paketet', w.ok, { scope: w.profil?.premium_scope, status: w.profil?.subscription_status })
  logg(D, 'returskärmen', null, { url: url(p), rader: rader(await text(p)).slice(0, 6) })
  logg(D, 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 6) })
  await ctx.close()
}

const del = process.argv[2] || 'alla'
const browser = await starta()
try {
  if (del === 'logik' || del === 'alla') await logik(browser)
  if (del === 'hoppa' || del === 'alla') await hoppa(browser)
  if (del === 'mall') await mall(browser)
  if (del === 'kop' || del === 'alla') await kop(browser)
} catch (e) {
  console.error('FEL', e?.stack ?? e)
  logg(del, 'oväntat fel', false, { fel: String(e?.message ?? e).slice(0, 300) })
  process.exitCode = 1
} finally {
  await browser.close()
}
