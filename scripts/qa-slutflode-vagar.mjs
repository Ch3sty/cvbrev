// scripts/qa-slutflode-vagar.mjs
// Vägarna i slutflödestestet.
//   SCRATCH=<tmp> node scripts/qa-slutflode-kor.mjs <väg> [vy]

import {
  BAS,
  admin,
  nySida,
  dump,
  text,
  rader,
  url,
  ga,
  klicka,
  vantaPa,
  vantaText,
  fyllKonto,
  skickaKonto,
  loggaIn,
  headerSkapaKonto,
  menyText,
  stangMeny,
  komIgangArk,
  profil,
  vantaPaProfil,
  kopstegTillBetalt,
  vantaRetur,
  kvitto,
  registreraId,
  sparaKonto,
  sparaToken,
  sparaLagring,
  lasKonton,
  epost,
  logg,
  vanta,
  starta,
  SCRATCH,
} from './qa-slutflode.mjs'

/** Tratten från headern till steg 3 för ett val. Returnerar id och steg 3:s text. */
async function trattTillSteg3(p, vag, intent, nyckel, namn) {
  await headerSkapaKonto(p)
  let t = await text(p)
  logg(vag, 'steg 1 från headern', t.includes('Vad vill du börja med?'), { url: url(p) })
  await dump(p, vag, '01-steg1')
  await p.click(`[role="radio"][data-intent="${intent}"]`)
  await vanta(250)
  await klicka(p, /^Fortsätt$/, 'footer button')
  await vanta(600)
  t = await text(p)
  logg(vag, 'steg 2 med valraden', t.includes('Skapa ditt konto') && t.includes('Du börjar med'), { rad: rader(t, /Du börjar med/)[0] })
  await dump(p, vag, '02-steg2')
  const email = epost(nyckel)
  await fyllKonto(p, { namn, email })
  await skickaKonto(p)
  const id = await registreraId(nyckel, email)
  logg(vag, 'kontot skapat', Boolean(id), { id, email })
  for (let i = 0; i < 30 && !/steg 3 av 3/i.test(await text(p)); i++) await vanta(500)
  t = await text(p)
  await dump(p, vag, '03-steg3')
  return { id, email, steg3: t }
}

/** Fotens knappar i steg 3. */
async function fotKnappar(p) {
  return p.evaluate(() => [...document.querySelectorAll('footer button')].map((b) => b.innerText.replace(/\s+/g, ' ').trim()))
}

/** Kom igång-arket på hemskärmen: titlarna i ordning. */
async function komIgang(p, vag, namn) {
  await ga(p, '/dashboard')
  await vanta(1500)
  const ark = await komIgangArk(p)
  await dump(p, vag, `${namn}-komigang`)
  await p.keyboard.press('Escape')
  await vanta(400)
  return ark
}

function ordning(t, lista) {
  const idx = lista.map((s) => t.indexOf(s))
  return { ok: idx.every((x, i) => x >= 0 && (i === 0 || x > idx[i - 1])), idx }
}

/* ============================================================ väg 1 */

export async function vag1(browser, vy = 'pixel7') {
  const V = '1'
  const { p, ctx, fel } = await nySida(browser, vy)
  let id = lasKonton().konton['1']?.id
  if (process.env.FRAN === 'kop') {
    await loggaIn(p, epost('1'))
  } else {
  const r = await trattTillSteg3(p, V, 'cv', '1', 'Anna Slutflöde')
  id = r.id
  const steg3 = r.steg3
  const knappar = await fotKnappar(p)
  logg(V, 'steg 3 visar CV-paketet', /steg 3 av 3/i.test(steg3) && steg3.includes('CV-paketet'), { knappar })
  await klicka(p, /^Börja gratis$/, 'footer button')
  await vantaPa(p, () => location.pathname.startsWith('/dashboard/skapa-cv'), null, 30000).catch(() => {})
  await vanta(2000)
  logg(V, 'Börja gratis landar i CV-byggaren', url(p).startsWith('/dashboard/skapa-cv'), { url: url(p) })
  await dump(p, V, '04-cv-byggaren')

  // Kom igång: CV-listan (analys, mall, brev, matchning, logiktest, intervjuprov).
  const ark = await komIgang(p, V, '05')
  const o = ordning(ark, ['Analysera ditt CV', 'Välj en CV-mall', 'Skriv ett personligt brev', 'Se tre matchade jobb'])
  logg(V, 'Kom igång har CV-listan i ordning', o.ok && /Det du valde/i.test(ark), { idx: o.idx, rader: rader(ark).slice(0, 30) })

  await ga(p, '/dashboard')
  await vanta(1500)
  await dump(p, V, '06-hem', true)
  const hem = await text(p)
  logg(V, 'hemskärmen', null, { rader: rader(hem).slice(0, 25) })
  }

  // Betalväggen på en låst mall.
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
  await dump(p, V, '07-last-mall')
  logg(V, 'låst mall vald', Boolean(last), { mall: last })
  // Knappen under förhandsvisningen öppnar betalväggen.
  await klicka(p, /^Ladda ned med CV-paketet/, 'button').catch(async () => {
    await klicka(p, /CV-paketet, 79 kr i veckan/, 'button')
  })
  await vanta(1200)
  const vagg = await p.evaluate(() => (document.querySelector('[role="dialog"]') ?? document.body).innerText)
  await dump(p, V, '08-betalvagg')
  const harKnapp = /Köp CV-paketet, 79 kr i veckan/.test(vagg)
  logg(V, 'betalväggen: Köp CV-paketet, 79 kr i veckan', harKnapp, { rader: rader(vagg).slice(0, 14) })
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), klicka(p, /^Köp CV-paketet, 79 kr i veckan/, 'button, a')])
  await vanta(1500)
  let t = await text(p)
  await dump(p, V, '09-efter-kop-knapp')
  const direktKopsteg = /Steg 2 av 2/i.test(t)
  // Med ett sparat spår öppnar knappen produktvalet (UpgradeSheet) i stället för spårvalet.
  if (!url(p).includes('/dashboard/valj-spar')) {
    const ark = await p.evaluate(() => document.querySelector('[aria-labelledby="upgrade-sheet-title"]')?.innerText ?? '')
    logg(V, 'Köp-knappen öppnar produktvalet (andra arket)', null, { rader: rader(ark).slice(0, 12) })
    await Promise.all([
      p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
      p.evaluate(() => [...document.querySelectorAll('[aria-labelledby="upgrade-sheet-title"] button')].find((b) => /^CV-paketet/.test(b.innerText.trim()))?.click()),
    ])
    await vanta(1500)
    t = await text(p)
    await dump(p, V, '09b-sparval')
  }
  logg(V, 'Köp-knappen leder till köpet', url(p).includes('/dashboard/valj-spar'), { url: url(p), steg: rader(t, /Steg d av/i)[0] })
  if (!/Steg 2 av 2/i.test(t)) {
    await klicka(p, /^Fortsätt med CV-paketet/, 'button')
  }
  const kop = await kopstegTillBetalt(p, V, '10')
  logg(V, 'köpsteget och kassan', /CV-paketet/.test(kop.kopsteg.join(' ')) && /79/.test(kop.kassa.join(' ')), kop)
  await vantaRetur(p)
  await dump(p, V, '11-retur')
  logg(V, 'retur från Stripe', null, { url: url(p), rader: rader(await text(p)).slice(0, 12) })

  const w = await vantaPaProfil(id, (pr) => pr.subscription_status === 'active' && pr.premium_scope === 'cv')
  sparaKonto('1', { customer: w.profil?.stripe_customer_id, subscription: w.profil?.subscription_id })
  logg(V, 'webhook: profilen har CV-paketet', w.ok, { scope: w.profil?.premium_scope, status: w.profil?.subscription_status, paket_started_at: w.profil?.paket_started_at })

  await ga(p, '/dashboard')
  await vanta(2000)
  const meny = await menyText(p, vy)
  await dump(p, V, '12-meny')
  await stangMeny(p)
  logg(V, 'sidomenyn: Du har CV-paketet. Förnyas', /Du har CV-paketet/.test(meny) && /Förnyas/.test(meny), { rader: rader(meny).slice(0, 4) })

  const k = await kvitto(id)
  sparaKonto('1', { emailSchedule: k.map((x) => x.id) })
  logg(V, 'kvittomejlet loggat med ämnet Kvitto: CV-paketet, 79 kr', k.some((x) => /Kvitto: CV-paketet, 79 kr/.test(x.last_error ?? '')), {
    kvitto: k.map((x) => ({ typ: x.email_type, fel: (x.last_error ?? '').slice(0, 120) })),
  })
  logg(V, 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 8) })
  await ctx.close()
}

/** Köpet från steg 3: primärknappen i foten, köpsteget och kassan. */
async function kopFranSteg3(p, V, id, knappRe, scope) {
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), klicka(p, knappRe, 'footer button')])
  await vanta(1500)
  logg(V, 'Köp landar på köpsteget', url(p).includes('steg=kop') && /Steg 2 av 2/i.test(await text(p)), { url: url(p) })
  const kop = await kopstegTillBetalt(p, V, '04')
  logg(V, 'köpsteget och kassan', null, { kopsteg: kop.kopsteg.slice(3, 12), samtycke: kop.samtycke, kassa: kop.kassa })
  await vantaRetur(p)
  await dump(p, V, '05-retur')
  logg(V, 'retur från Stripe', null, { url: url(p), rader: rader(await text(p)).slice(0, 6) })
  const w = await vantaPaProfil(id, (pr) => pr.subscription_status === 'active' && pr.premium_scope === scope)
  logg(V, `webhook: scope ${scope}`, w.ok, { scope: w.profil?.premium_scope, status: w.profil?.subscription_status, price: w.profil?.price_id })
  return w.profil
}

/* ============================================================ väg 2 */

export async function vag2(browser, vy = 'desktop') {
  const V = '2'
  const { p, ctx, fel } = await nySida(browser, vy)
  let id = lasKonton().konton['2']?.id
  if (process.env.FRAN === 'efter') {
    await loggaIn(p, epost('2'))
  } else {
    await ga(p, '/verktyg/rekryteringstester')
    const href = await p.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.innerText.trim() === 'Starta gratis test')?.getAttribute('href'))
    logg(V, 'testsidans Starta gratis test till ?borja=tester', href === '/register?borja=tester', { href })
    await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), klicka(p, /^Starta gratis test$/, 'a')])
    await vanta(1200)
    let t = await text(p)
    logg(V, 'steg 1 hoppas över, steg 2 med "Du börjar med rekryteringstesterna"', /steg 2 av 3/i.test(t) && t.includes('Du börjar med rekryteringstesterna') && !t.includes('Vad vill du börja med?'), { url: url(p) })
    await dump(p, V, '01-steg2')
    const email = epost('2')
    await fyllKonto(p, { namn: 'Bo Slutflöde', email })
    await skickaKonto(p)
    id = await registreraId('2', email)
    logg(V, 'kontot skapat', Boolean(id), { id, email })
    for (let i = 0; i < 30 && !/steg 3 av 3/i.test(await text(p)); i++) await vanta(500)
    t = await text(p)
    await dump(p, V, '02-steg3')
    const knappar = await p.evaluate(() => [...document.querySelectorAll('footer button')].map((b) => b.innerText.trim()))
    logg(V, 'steg 3 Träningspaketet', t.includes('Träningspaketet') && knappar.includes('Köp Träningspaketet, 79 kr i veckan'), { knappar })
    const pr = await kopFranSteg3(p, V, id, /^Köp Träningspaketet, 79 kr i veckan$/, 'tester')
    sparaKonto('2', { customer: pr?.stripe_customer_id, subscription: pr?.subscription_id })
  }

  // Testhubben öppen.
  await ga(p, '/dashboard/tester')
  await vanta(1500)
  let t = await text(p)
  await dump(p, V, '06-testhubben', true)
  logg(V, 'testhubben öppen (ingen betalvägg för tester)', !/Köp Träningspaketet|Skaffa Träningspaketet|Lås upp/.test(t), { rader: rader(t, /paket|Ingår|nivå|låst/i).slice(0, 10) })

  // Inför intervjun utan kvot.
  await ga(p, '/dashboard/intervju')
  await vanta(1500)
  t = await text(p)
  await dump(p, V, '07-infor-intervjun', true)
  logg(V, 'Inför intervjun utan kvot', /Utan tak i Träningspaketet/.test(t) && !/Ett prov om dagen ingår/.test(t), { rader: rader(t, /tak|prov om dagen|kvot|Träningspaketet/i).slice(0, 8) })

  // Kom igång med brickan Intervjuprovet, och hemskärmen med träningsfokus.
  await ga(p, '/dashboard')
  await vanta(2000)
  const hem = await text(p)
  await dump(p, V, '08-hem', true)
  logg(V, 'hemskärmen med träningsfokus', /rekryteringstest|logiktest|Träna|träningen/i.test(hem) && !/Börja med ditt CV/.test(hem), { rader: rader(hem).slice(0, 14) })
  const ark = await komIgangArk(p)
  await dump(p, V, '09-komigang')
  logg(V, 'Kom igång med brickan Intervjuprovet', /Intervjuprovet/.test(ark) && /Kom igång med Träningspaketet/.test(ark), { rader: rader(ark).slice(0, 24) })
  await p.keyboard.press('Escape')
  const meny = await menyText(p, vy)
  await dump(p, V, '10-meny')
  logg(V, 'sidomenyn Du har Träningspaketet', /Du har Träningspaketet/.test(meny), { rader: rader(meny).slice(0, 3) })
  logg(V, 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 8) })
  await ctx.close()
}

/* ============================================================ väg 3 */

const SVAR_STYRKOR =
  'Min största styrka är att jag strukturerar kaos. På mitt förra jobb som samordnare på ett lager tog jag över en rörig plockrutin och byggde en enkel tavla för dagens order. Felplockningarna minskade med en tredjedel på två månader. En svaghet är att jag gärna gör saker själv i stället för att delegera. Jag har börjat boka en kort avstämning varje måndag där jag fördelar uppgifterna i teamet.'
const SVAR_VARFOR =
  'Jag söker det här jobbet för att ni bygger lösningar som faktiskt används av vanliga människor varje dag, och för att rollen kombinerar kundkontakt med förbättringsarbete. I min nuvarande roll har jag drivit tre förbättringar av vårt ärendeflöde, och den senaste kortade svarstiden från två dagar till en. Jag vill ta det vidare i en organisation som mäter kvalitet på riktigt.'

async function intervjuprovInloggad(p, V, namn, fraga, svar) {
  await ga(p, `/dashboard/intervju/ny?steg=svar&fraga=${fraga}`)
  await vanta(1200)
  const ta = await p.$('textarea')
  if (!ta) return { status: 'ingen textarea', url: url(p), text: await text(p) }
  let status = null
  const lyss = (r) => {
    if (/\/api\/.*(intervju|interview)/i.test(r.url()) && r.request().method() === 'POST') status = r.status()
  }
  p.on('response', lyss)
  await ta.click()
  await p.keyboard.sendCharacter(svar)
  await vanta(400)
  await dump(p, V, `${namn}-svar`)
  await klicka(p, /^Bedöm mitt svar$/, 'footer button, button')
  for (let i = 0; i < 90 && status === null; i++) await vanta(500)
  await vanta(3000)
  p.off('response', lyss)
  return { status, url: url(p), text: await text(p) }
}

export async function vag3(browser, vy = 'pixel7') {
  const V = '3'
  const { p, ctx, fel } = await nySida(browser, vy)
  let id = lasKonton().konton['3']?.id
  if (process.env.FRAN === 'prov') {
    await loggaIn(p, epost('3'))
  } else {
    const r = await trattTillSteg3(p, V, 'intervju', '3', 'Cia Slutflöde')
    id = r.id
    const knappar = await fotKnappar(p)
    logg(V, 'steg 3 för intervjun', /steg 3 av 3/i.test(r.steg3), { knappar, rubrik: rader(r.steg3).slice(2, 5) })
    await klicka(p, /^Börja gratis$/, 'footer button')
    await vantaPa(p, () => location.pathname.startsWith('/dashboard/intervju'), null, 30000).catch(() => {})
    await vanta(2000)
    logg(V, 'Börja gratis landar på /dashboard/intervju', url(p).startsWith('/dashboard/intervju'), { url: url(p) })
    await dump(p, V, '04-landning', true)

    const ark = await komIgang(p, V, '05')
    const o = ordning(ark, ['Intervjuprovet', 'Personlighetstestet', 'Matrislogik, grundnivå', 'Analysera ditt CV', 'Skriv ett personligt brev', 'Se tre matchade jobb'])
    logg(V, 'Kom igång intervju-listan i ordning', o.ok && /Det du valde/i.test(ark), { idx: o.idx, rader: rader(ark).slice(0, 26) })

    await ga(p, '/dashboard')
    await vanta(1500)
    const hem = await text(p)
    await dump(p, V, '06-hem', true)
    logg(V, 'hemskärmen med träningsfokus för gratis', /Du valde intervjun/.test(hem), { rader: rader(hem).slice(0, 12) })
  }

  // Första provet (gratis, ett per dygn).
  const prov1 = await intervjuprovInloggad(p, V, '07', 'styrkor', SVAR_STYRKOR)
  await dump(p, V, '08-resultat1', true)
  logg(V, 'första intervjuprovet bedömt', prov1.status === 200 && /\/dashboard\/intervju\/[0-9a-f-]{36}/.test(prov1.url), { status: prov1.status, url: prov1.url, rader: rader(prov1.text).slice(0, 8) })

  // Andra provet: kvotraden.
  const prov2 = await intervjuprovInloggad(p, V, '09', 'varfor_jobbet', SVAR_VARFOR)
  await dump(p, V, '10-kvotrad', true)
  const kvotLank = await p.evaluate(() => [...document.querySelectorAll('a')].find((a) => /Se Träningspaketet, 79 kr i veckan/.test(a.innerText))?.getAttribute('href') ?? null)
  logg(V, 'andra provet ger kvotraden "Se Träningspaketet, 79 kr i veckan"', prov2.status === 429 && Boolean(kvotLank), { status: prov2.status, kvotLank, rader: rader(prov2.text, /prov|Träningspaketet|morgon|dygn/i).slice(0, 6) })

  // Köp från kvotraden.
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), klicka(p, /^Se Träningspaketet, 79 kr i veckan/, 'a')])
  await vanta(1500)
  let t = await text(p)
  await dump(p, V, '11-fran-kvotraden')
  logg(V, 'kvotradens länk', null, { url: url(p), steg: rader(t, /Steg \d av/i)[0] })
  if (!/Steg 2 av 2/i.test(t)) await klicka(p, /^Fortsätt med Träningspaketet/, 'button')
  const kop = await kopstegTillBetalt(p, V, '12')
  logg(V, 'köpsteget och kassan', /Träningspaketet/.test(kop.kopsteg.join(' ')), { kassa: kop.kassa })
  await vantaRetur(p)
  const w = await vantaPaProfil(id, (pr) => pr.subscription_status === 'active' && pr.premium_scope === 'tester')
  sparaKonto('3', { customer: w.profil?.stripe_customer_id, subscription: w.profil?.subscription_id })
  logg(V, 'webhook: Träningspaketet', w.ok, { scope: w.profil?.premium_scope })

  await ga(p, '/dashboard/intervju')
  await vanta(1500)
  t = await text(p)
  await dump(p, V, '13-hubben-efter-kop', true)
  logg(V, 'kvotraden borta på hubben', !/Se Träningspaketet, 79 kr i veckan/.test(t) && /Utan tak/.test(t), { rader: rader(t, /tak|prov|Träningspaketet/i).slice(0, 6) })
  await ga(p, '/dashboard/intervju/ny?steg=svar&fraga=varfor_jobbet')
  await vanta(1200)
  t = await text(p)
  await dump(p, V, '14-nytt-prov-efter-kop')
  logg(V, 'nytt prov efter köpet utan kvotrad', !/Se Träningspaketet/.test(t) && Boolean(await p.$('textarea')), {})
  logg(V, 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 8) })
  await ctx.close()
}

/* ============================================================ väg 4 */

const YTOR = [
  ['mallar', '/dashboard/cv-mallar'],
  ['analys', '/dashboard/cv-analys'],
  ['tester', '/dashboard/tester'],
  ['intervju', '/dashboard/intervju'],
  ['coach', '/dashboard/jobbcoachen'],
  ['matchning', '/dashboard/jobbmatchning'],
]

async function alltOppet(p, V, prefix) {
  const ut = {}
  for (const [namn, u] of YTOR) {
    await ga(p, u)
    await vanta(1500)
    const t = await text(p)
    await dump(p, V, `${prefix}-${namn}`)
    ut[namn] = rader(t, /Köp |Skaffa |Byt till|ingår i CV-paketet|ingår i Träningspaketet|Lås upp|per dygn|gratisnivån/i).slice(0, 4)
  }
  return ut
}

export async function vag4(browser, vy = 'desktop') {
  const V = '4'
  const { p, ctx, fel } = await nySida(browser, vy)
  let id = lasKonton().konton['4']?.id
  if (process.env.FRAN === 'uppsagning') {
    await loggaIn(p, epost('4'))
  } else {
    const r = await trattTillSteg3(p, V, 'jobb', '4', 'Dan Slutflöde')
    id = r.id
    const kort = await p.evaluate(() => {
      const k = document.querySelector('main [class*="bg-ink"], main .bg-ink-1')
      return { ink: Boolean(k), text: (k?.innerText ?? '').replace(/\s+/g, ' ').slice(0, 300) }
    })
    const knappar = await fotKnappar(p)
    logg(V, 'steg 3 Hela paketet (ink-kort, längder i prisraden)', /Hela paketet/.test(r.steg3) && kort.ink && knappar.includes('Köp Hela paketet, 99 kr i veckan'), {
      knappar,
      kort,
      prisrad: rader(r.steg3, /kr/).slice(0, 4),
    })
    const pr = await kopFranSteg3(p, V, id, /^Köp Hela paketet, 99 kr i veckan$/, 'allt')
    sparaKonto('4', { customer: pr?.stripe_customer_id, subscription: pr?.subscription_id })
    const oppet = await alltOppet(p, V, '06')
    const spar = Object.entries(oppet).filter(([, v]) => v.length)
    logg(V, 'allt öppet (inga köp- eller låsrader)', spar.length === 0, { oppet })
    await ga(p, '/dashboard')
    await vanta(1500)
    const meny = await menyText(p, vy)
    await dump(p, V, '07-meny')
    await stangMeny(p)
    logg(V, 'sidomenyn Du har Hela paketet', /Du har Hela paketet/.test(meny), { rader: rader(meny).slice(0, 3) })
  }

  // Uppsägning: vår enkät, erbjudandet, kundportalen.
  await ga(p, '/dashboard/profil/prenumeration')
  await vanta(2000)
  await dump(p, V, '08-prenumeration', true)
  await klicka(p, /^Säg upp/, 'button, a')
  await vanta(1200)
  await dump(p, V, '09-enkat')
  await klicka(p, /Jag använder det inte/, '[role="radio"], button, label')
  await vanta(300)
  await vantaPa(p, () => [...document.querySelectorAll('[role="dialog"] button')].some((b) => b.innerText.trim() === 'Fortsätt' && !b.disabled))
  await klicka(p, /^Fortsätt$/, '[role="dialog"] button')
  await vanta(2000)
  const erbj = await p.evaluate(() => document.querySelector('[role="dialog"]')?.innerText ?? '')
  await dump(p, V, '10-erbjudande')
  logg(V, 'uppsägningen: enkät och erbjudande', null, { rader: rader(erbj).slice(0, 10) })
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}), klicka(p, /^Avsluta ändå$/, 'button')])
  await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000).catch(() => {})
  await vanta(2500)
  await dump(p, V, '11-portal')
  await klicka(p, /Säg upp abonnemang|Avbryt prenumeration|Cancel subscription/i, 'a, button')
  await vanta(2500)
  await klicka(p, /^(Säg upp abonnemang|Säg upp|Avbryt prenumeration|Cancel subscription)$/i, 'button')
  await vanta(3000)
  await klicka(p, /använder det inte|Används inte|I don.t use|Oanvänd/i, 'label, button, [role="radio"]').catch(() => {})
  await klicka(p, /^(Skicka|Skicka in|Submit|Hoppa över|Skip)$/i, 'button').catch(() => {})
  await vanta(2500)
  await dump(p, V, '12-portal-uppsagd')
  const u = await vantaPaProfil(id, (pr) => pr.cancel_at_period_end === true, 60000)
  logg(V, 'profilen cancel_at_period_end', u.ok, { cancel: u.profil?.cancel_at_period_end })
  await ga(p, '/dashboard/profil/prenumeration')
  await vanta(2000)
  let t = await text(p)
  await dump(p, V, '13-prenumeration-uppsagd', true)
  const meny2 = await menyText(p, vy)
  logg(V, 'uppsagt: "Gäller till ..., förnyas inte"', /Gäller till .+, förnyas inte/.test(meny2) && /uppsagt|förnyas inte/i.test(t), {
    meny: rader(meny2).slice(0, 2),
    sida: rader(t, /uppsagt|förnyas|Ångra/i).slice(0, 4),
  })

  // Ångra.
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}), klicka(p, /^Ångra uppsägningen$/, 'a, button')])
  await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000).catch(() => {})
  await vanta(2500)
  await klicka(p, /Säg inte upp abonnemang|Förnya|Renew/i, 'a, button')
  await vanta(2500)
  await klicka(p, /^(Säg inte upp abonnemang|Förnya abonnemang|Förnya|Renew subscription|Renew)$/i, 'button').catch(() => {})
  await vanta(3000)
  await dump(p, V, '14-portal-angrad')
  const a = await vantaPaProfil(id, (pr) => pr.cancel_at_period_end === false, 60000)
  await ga(p, '/dashboard/profil/prenumeration')
  await vanta(2000)
  t = await text(p)
  await dump(p, V, '15-prenumeration-angrad', true)
  const meny3 = await menyText(p, vy)
  logg(V, 'ångrat: förnyas igen', a.ok && /Förnyas/.test(meny3), { meny: rader(meny3).slice(0, 2), sida: rader(t, /förnyas|uppsagt/i).slice(0, 3) })
  logg(V, 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 8) })
  await ctx.close()
}

/* ============================================================ väg 5 */

export async function vag5(browser, vy = 'pixel7') {
  const V = '5'
  if (process.env.FRAN !== 'dagspass' && process.env.FRAN !== 'utgang') {
    const { p, ctx, fel } = await nySida(browser, vy)
    await headerSkapaKonto(p)
    await dump(p, V, '01-steg1')
    await klicka(p, /^Hoppa över/, 'button')
    await vanta(500)
    let t = await text(p)
    logg(V, 'Hoppa över: steg 2 utan valrad', t.includes('Skapa ditt konto') && !t.includes('Du börjar med'), {})
    await dump(p, V, '02-steg2')
    const email = epost('5')
    await fyllKonto(p, { namn: 'Eva Slutflöde', email })
    await skickaKonto(p)
    const id = await registreraId('5', email)
    logg(V, 'kontot skapat', Boolean(id), { id, email })
    await vanta(1000)
    const valda = await p.evaluate(() => document.querySelectorAll('[role="radio"][aria-checked="true"]').length)
    t = await text(p)
    await dump(p, V, '03-sparval', true)
    logg(V, 'spårvalet utan förval', url(p).startsWith('/dashboard/valj-spar') && valda === 0, { url: url(p), valda, knappar: rader(t, /Börja gratis|Fortsätt/).slice(0, 3) })
    await klicka(p, /^Börja gratis/, 'button, a')
    await vantaPa(p, () => location.pathname === '/dashboard', null, 30000).catch(() => {})
    await vanta(2000)
    t = await text(p)
    await dump(p, V, '04-hem', true)
    logg(V, 'Börja gratis landar på hemskärmen i allmänt läge', url(p).startsWith('/dashboard') && !/Du valde/.test(t), { url: url(p), rader: rader(t).slice(4, 14) })
    const pr = await profil(id)
    logg(V, 'profilen utan val och spår', !pr?.onboarding_intent, { intent: pr?.onboarding_intent, track: pr?.onboarding_track })
    logg(V, 'konsolfel', fel.length === 0, { fel: [...new Set(fel)].slice(0, 8) })
    await ctx.close()
  }

  // Dagspasset från prissidan, nytt inkognito.
  const vyD = process.env.VY_DAG || 'desktop'
  const { p, ctx, fel } = await nySida(browser, vyD)
  let id = lasKonton().konton['5-dag']?.id
  if (process.env.FRAN !== 'utgang') {
    await ga(p, '/priser')
    await p.evaluate(() => {
      const kort = document.querySelector('#paket-allt')
      const r = [...(kort ?? document).querySelectorAll('[role="radio"]')].find((e) => (e.innerText || '').trim().startsWith('49'))
      r?.scrollIntoView({ block: 'center' })
      r?.click()
    })
    await vanta(600)
    const knapp = await p.evaluate(() => [...document.querySelectorAll('#paket-allt button, #paket-allt a')].map((b) => b.innerText.replace(/\s+/g, ' ').trim()).find((t) => /Dagspasset/.test(t)))
    await p.evaluate(() => document.querySelector('#paket-allt')?.scrollIntoView({ block: 'start' }))
    await dump(p, V, '05-priser-dagspasset')
    logg(V, 'prissidans knapp för Dagspasset', /Dagspasset/.test(knapp ?? ''), { knapp })
    await p.evaluate(() => [...document.querySelectorAll('#paket-allt button, #paket-allt a')].find((b) => /Dagspasset/.test(b.innerText))?.click())
    await vantaPa(p, () => location.pathname === '/register', null, 30000)
    await vanta(1200)
    let t = await text(p)
    await dump(p, V, '06-register-paket')
    logg(V, '/register?paket=all_day utan tratt', url(p).includes('paket=all_day') && !t.includes('Vad vill du börja med?') && !/steg \d av 3/i.test(t), { url: url(p), rader: rader(t).slice(0, 8) })
    const email = epost('5-dag')
    await fyllKonto(p, { namn: 'Frida Slutflöde', email })
    await skickaKonto(p)
    id = await registreraId('5-dag', email)
    logg(V, 'dagspasskontot skapat', Boolean(id), { id, email })
    for (let i = 0; i < 20 && !/Steg 2 av 2/i.test(await text(p)); i++) await vanta(500)
    logg(V, 'köpsteget direkt', url(p).includes('paket=all_day') && url(p).includes('steg=kop') && /Steg 2 av 2/i.test(await text(p)), { url: url(p) })
    const kop = await kopstegTillBetalt(p, V, '07')
    logg(V, 'köpsteg och kassa för Dagspasset', /49/.test(kop.kassa.join(' ')), { samtycke: kop.samtycke, kassa: kop.kassa, kopsteg: kop.kopsteg.slice(3, 14) })
    await vantaRetur(p)
    await dump(p, V, '08-retur')
    logg(V, 'returskärmen', /Du har Dagspasset/.test(await text(p)), { url: url(p), rader: rader(await text(p), /Dagspass|Hela paketet|Du har/).slice(0, 4) })
    const w = await vantaPaProfil(id, (pr) => pr.subscription_tier === 'premium' && pr.premium_until && new Date(pr.premium_until) > new Date())
    const { data: grants } = await admin.from('premium_grants').select('id, days, scope, premium_until_after').eq('user_id', id)
    sparaKonto('5-dag', { customer: w.profil?.stripe_customer_id, grantIds: (grants ?? []).map((g) => g.id) })
    logg(V, 'webhook: Dagspasset', w.ok, { until: w.profil?.premium_until, scope: w.profil?.premium_scope, grants })
    await ga(p, '/dashboard')
    await vanta(2000)
    const meny = await menyText(p, vyD)
    await dump(p, V, '09-meny')
    await stangMeny(p)
    logg(V, 'menyn "Du har Dagspasset. Gäller till ..."', /Du har Dagspasset/.test(meny) && /Gäller till/.test(meny), { rader: rader(meny).slice(0, 3) })
    const ark = await komIgangArk(p)
    await dump(p, V, '10-komigang')
    await p.keyboard.press('Escape')
    logg(V, 'Kom igång med Dagspasset', /Kom igång med Dagspasset/.test(ark), { rader: rader(ark).slice(0, 4) })
    const k = await kvitto(id)
    sparaKonto('5-dag', { emailSchedule: k.map((x) => x.id) })
    logg(V, 'kvittot för Dagspasset loggat', k.some((x) => /Kvitto: Dagspasset, 49 kr/.test(x.last_error ?? '')), { kvitto: k.map((x) => (x.last_error ?? '').slice(0, 100)) })
  } else {
    await loggaIn(p, epost('5-dag'))
  }

  // Utgången: premium_until bakåt per id, sedan expire-cronen lokalt.
  const bak = new Date(Date.now() - 3600_000).toISOString()
  await admin.from('profiles').update({ premium_until: bak }).eq('id', id)
  const gIds = lasKonton().konton['5-dag']?.grantIds ?? []
  if (gIds.length) await admin.from('premium_grants').update({ premium_until_after: bak }).in('id', gIds)
  const { data: traffar } = await admin.from('profiles').select('id').eq('subscription_tier', 'premium').lt('premium_until', new Date().toISOString())
  const bara = (traffar ?? []).map((r) => r.id)
  logg(V, 'cron-frågan träffar bara QA-kontot', bara.length === 1 && bara[0] === id, { antal: bara.length })
  if (bara.length === 1 && bara[0] === id) {
    const { env } = await import('./qa-slutflode.mjs')
    const r = await fetch(`${BAS}/api/cron/expire-premiums`, { headers: { authorization: `Bearer ${env.PREMIUM_EXPIRY_CRON_SECRET}` } })
    const j = await r.json().catch(() => ({}))
    logg(V, 'expire-premiums lokalt', r.status === 200, { status: r.status, svar: JSON.stringify(j).slice(0, 200) })
    const efter = await profil(id)
    await ga(p, '/dashboard')
    await vanta(2000)
    const meny = await menyText(p, vyD)
    await dump(p, V, '11-efter-utgang')
    logg(V, 'gratisnivån efter utgången', efter?.subscription_tier === 'free' && /gratisnivån/i.test(meny), { tier: efter?.subscription_tier, meny: rader(meny).slice(0, 2) })
  }
  logg(V, 'konsolfel (dagspass)', fel.length === 0, { fel: [...new Set(fel)].slice(0, 8) })
  await ctx.close()
}

/** Väg 5, fortsättningen efter "Börja gratis i stället": gratisfrågan, "Jag vet inte än". */
export async function vag5b(browser, vy = 'pixel7') {
  const V = '5'
  const { p, ctx, fel } = await nySida(browser, vy)
  await loggaIn(p, epost('5'))
  await ga(p, '/dashboard/valj-spar')
  await klicka(p, /^Börja gratis i stället/, 'button, a')
  await vanta(800)
  let t = await text(p)
  await dump(p, V, '03b-gratisfragan', true)
  logg(V, 'Börja gratis i stället ger gratisfrågan (1.1b)', /Vad vill du börja med\?/.test(t) && /Jag vet inte än/.test(t), { rader: rader(t, /SISTA|Vad vill|Jag vet|Välj/).slice(0, 5) })
  await klicka(p, /^Jag vet inte än/, '[role="radio"], button')
  await vanta(300)
  const primar = await p.evaluate(() => [...document.querySelectorAll('footer button')].map((b) => b.innerText.trim()))
  await p.evaluate(() => [...document.querySelectorAll('footer button')].find((b) => !b.disabled)?.click())
  await vantaPa(p, () => location.pathname === '/dashboard', null, 30000).catch(() => {})
  await vanta(2000)
  t = await text(p)
  await dump(p, V, '04-hem', true)
  logg(V, 'hemskärmen i allmänt läge', url(p) === '/dashboard' && !/Du valde/.test(t), { primar, url: url(p), rader: rader(t).slice(4, 12) })
  logg(V, 'konsolfel (5b)', fel.length === 0, { fel })
  await ctx.close()
}

/* ============================================================ väg 6 */

/** Spärrens Skapa konto till kontot och landningen. Ett steg, ingen tratt. */
async function smakprovKonto(p, V, namn, nyckel, gateSel, tokenTyp, landningRe) {
  const href = await p.evaluate((s) => document.querySelector(s)?.getAttribute('href') ?? null, gateSel)
  const token = href ? decodeURIComponent(href.split('=').pop()) : null
  if (token) sparaToken(tokenTyp, token)
  logg(V, `${namn}: spärren med Skapa konto`, Boolean(href), { href })
  if (!href) return null
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.evaluate((s) => document.querySelector(s)?.click(), gateSel)])
  await vantaPa(p, () => location.pathname === '/register', null, 30000).catch(() => {})
  await vanta(1200)
  const t = await text(p)
  await dump(p, V, `${namn}-register`)
  logg(V, `${namn}: ingen tratt, ett steg`, !t.includes('Vad vill du börja med?') && !/steg \d av 3/i.test(t) && url(p).includes(token), {
    url: url(p),
    rader: rader(t).slice(3, 7),
  })
  const email = epost(nyckel)
  await fyllKonto(p, { namn: 'Gun Smakprov', email })
  await skickaKonto(p)
  const id = await registreraId(nyckel, email)
  await vanta(2000)
  const land = await text(p)
  await dump(p, V, `${namn}-landning`, true)
  logg(V, `${namn}: landar på resultatet`, landningRe.test(url(p)), { id, url: url(p), rader: rader(land).slice(4, 14) })
  return { id, token, text: land }
}

export async function vag6(browser, del = 'alla') {
  const V = '6'
  const delar = del === 'alla' ? ['intervju', 'personlighet', 'logik', 'brev'] : del.split(',')

  if (delar.includes('intervju')) {
    const { p, ctx, fel } = await nySida(browser, 'pixel7')
    await ga(p, '/artiklar/styrkor-svagheter-intervju')
    const ta = await p.$('textarea')
    await ta.evaluate((e) => e.scrollIntoView({ block: 'center' }))
    await ta.click()
    await p.keyboard.sendCharacter(SVAR_STYRKOR)
    await dump(p, V, 'intervju-1-svar')
    await p.click('button[data-cta="intervjuprov-bedom"]')
    await p.waitForSelector('a[data-cta="intervjuprov-gate"]', { timeout: 90000 }).catch(() => {})
    await vanta(1000)
    await p.evaluate(() => document.querySelector('a[data-cta="intervjuprov-gate"]')?.scrollIntoView({ block: 'center' }))
    await dump(p, V, 'intervju-2-sparr')
    const r = await smakprovKonto(p, V, 'intervju', '6-intervju', 'a[data-cta="intervjuprov-gate"]', 'intervju', /^\/dashboard\/intervju\/[0-9a-f-]{36}/)
    if (r) logg(V, 'intervju: hela återkopplingen', /omskrivet|Omskrivet|återkoppling/i.test(r.text) && !/Skapa konto/.test(r.text), { rader: rader(r.text, /nivå|av 5|omskriv|Stark|återkoppling/i).slice(0, 6) })
    logg(V, 'intervju: konsolfel', fel.length === 0, { fel })
    await ctx.close()
  }

  if (delar.includes('personlighet')) {
    const { p, ctx, fel } = await nySida(browser, 'desktop')
    await ga(p, '/verktyg/personlighetstest')
    await dump(p, V, 'personlighet-1-inbjudan')
    const varden = [5, 4, 2, 1, 3, 5, 1, 4, 2, 5, 3, 1, 4, 5, 2, 1, 5, 4, 3, 2, 4, 1]
    for (let i = 0; i < 30; i++) {
      if (await p.$('a[data-cta="personlighetsprov-gate"][href*="personlighet="]')) break
      const n = await p.evaluate((v) => {
        const r = [...document.querySelectorAll('[role="radiogroup"] [role="radio"]')]
        if (!r.length) return 0
        const el = r[Math.min(r.length - 1, v - 1)]
        el.scrollIntoView({ block: 'center' })
        el.click()
        return r.length
      }, varden[i % varden.length])
      await vanta(n ? 900 : 1500)
    }
    await p.waitForSelector('a[data-cta="personlighetsprov-gate"][href*="personlighet="]', { timeout: 30000 }).catch(() => {})
    await vanta(800)
    await p.evaluate(() => document.querySelector('a[data-cta="personlighetsprov-gate"][href*="personlighet="]')?.scrollIntoView({ block: 'center' }))
    await dump(p, V, 'personlighet-2-sparr')
    const r = await smakprovKonto(p, V, 'personlighet', '6-personlighet', 'a[data-cta="personlighetsprov-gate"][href*="personlighet="]', 'personlighet', /^\/dashboard\/intervju\/profil\//)
    if (r) logg(V, 'personlighet: tolkningen i kontot', !/Skapa konto/.test(r.text), { rader: rader(r.text).slice(4, 10) })
    logg(V, 'personlighet: konsolfel', fel.length === 0, { fel })
    await ctx.close()
  }

  if (delar.includes('logik')) {
    const { p, ctx, fel } = await nySida(browser, 'pixel7')
    await ga(p, '/verktyg/rekryteringstester/prova')
    await dump(p, V, 'logik-1-start')
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
    await dump(p, V, 'logik-2-sparr', true)
    const r = await smakprovKonto(p, V, 'logik', '6-logik', 'a[data-cta="prova-gate"]', 'test', /^\/dashboard\/tester/)
    if (r) logg(V, 'logik: resultatet i kontot', !/Skapa konto/.test(r.text), { rader: rader(r.text).slice(4, 12) })
    logg(V, 'logik: konsolfel', fel.length === 0, { fel })
    await ctx.close()
  }

  if (delar.includes('brev')) {
    const { p, ctx, fel } = await nySida(browser, 'desktop')
    await ga(p, '/skapa-brev/start')
    await p.type('[id="tjänsten-du-söker"]', 'Lagerlogistiker')
    await p.type('#arbetsgivare', 'Nordlager AB')
    await p.type('#experience', SVAR_STYRKOR)
    await dump(p, V, 'brev-1-formular')
    let status = null
    p.on('response', (res) => {
      if (res.url().includes('/api/public/letter-draft')) status = res.status()
    })
    await p.click('button[data-cta="start-flow-generate"]')
    await p.waitForSelector('a[data-cta="start-flow-gate"]', { timeout: 120000 }).catch(() => {})
    await vanta(1000)
    await dump(p, V, 'brev-2-sparr', true)
    logg(V, 'brev: utkastet genererat (riktigt Gemini-anrop)', status === 200, { status })
    const r = await smakprovKonto(p, V, 'brev', process.env.BREV_NYCKEL || '6-brev', 'a[data-cta="start-flow-gate"]', 'draft', /^\/dashboard\/(skapa-brev|brev|mina-brev|personliga-brev|profil)/)
    if (r) logg(V, 'brev: brevet i kontot', /Nordlager/.test(r.text), { rader: rader(r.text).slice(4, 12) })
    logg(V, 'brev: konsolfel', fel.length === 0, { fel })
    await ctx.close()
  }
}

/* ============================================================ väg 7 */

/**
 * Google-vägen, simulerad. Det riktiga Google-hoppet går inte att klicka
 * headless, så:
 *   1. Knappen "Fortsätt med Google" trycks på riktigt. Anropet till
 *      Supabase authorize stoppas, och cookien jc_signup som sidan skrev
 *      före hoppet läses ur webbläsaren.
 *   2. Kontot skapas som callbacken ser det (admin, bekräftad e-post,
 *      full_name i metadata), och post-signup anropas som i callbacken.
 *   3. Callbackens mål räknas med samma funktion som /auth/callback
 *      (googleCallbackMal, scripts/qa-slutflode-callback-mal.ts).
 *   4. Sessionen sätts via /login (lösenordet finns bara för testet),
 *      cookien läggs tillbaka om inloggningen rensat den, och webbläsaren
 *      går till målet. Valkommen-sidan läser cookien och hämtar hem.
 */
async function googleSimulerad(browser, V, vy, nyckel, forbered, forvantat) {
  const { execFileSync } = await import('node:child_process')
  const { LOSEN } = await import('./qa-slutflode.mjs')
  const { p, ctx, fel } = await nySida(browser, vy)
  await forbered(p)
  const stoppade = []
  await p.setRequestInterception(true)
  p.on('request', (r) => {
    const u = r.url()
    if (/\/auth\/v1\/authorize|accounts\.google\.com/.test(u)) {
      stoppade.push(u.split('?')[0])
      r.abort().catch(() => {})
    } else r.continue().catch(() => {})
  })
  await klicka(p, /^Fortsätt med Google/, 'button')
  for (let i = 0; i < 20 && !stoppade.length; i++) await vanta(300)
  await vanta(800)
  const kakor = await p.cookies(BAS)
  const rå = kakor.find((c) => c.name === 'jc_signup')?.value ?? null
  const ut = JSON.parse(execFileSync('npx', ['tsx', 'scripts/qa-slutflode-callback-mal.ts', rå ?? ''], { encoding: 'utf8', shell: true }).trim().split('\n').pop())
  logg(V, `${nyckel}: Google-knappen skriver jc_signup före hoppet`, Boolean(rå) && stoppade.length > 0, { stoppade: stoppade.slice(0, 1), cookie: ut.cookie })
  logg(V, `${nyckel}: callbackens mål`, ut.mal === '/dashboard/valkommen', { mal: ut.mal, gren: ut.gren })
  await p.setRequestInterception(false)

  const email = epost(nyckel)
  const { data: skapad, error } = await admin.auth.admin.createUser({
    email,
    password: LOSEN,
    email_confirm: true,
    user_metadata: { full_name: 'Hanna Google', name: 'Hanna Google' },
  })
  if (error) throw error
  const id = skapad.user.id
  sparaKonto(nyckel, { id, email, skapad: new Date().toISOString(), google: 'simulerad' })
  for (let i = 0; i < 10 && !(await profil(id)); i++) await vanta(500)
  const ps = await fetch(`${BAS}/api/auth/post-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id, source: 'google', acquisition: null }),
  })
  logg(V, `${nyckel}: kontot skapat som i callbacken, post-signup`, ps.status === 200, { id, postSignup: ps.status })

  await loggaIn(p, email)
  const efterLogin = (await p.cookies(BAS)).find((c) => c.name === 'jc_signup')?.value ?? null
  if (!efterLogin && rå) await p.setCookie({ name: 'jc_signup', value: rå, url: BAS, sameSite: 'Lax' })
  await ga(p, ut.mal)
  for (let i = 0; i < 40 && url(p).startsWith('/dashboard/valkommen') && !/steg 3 av 3/i.test(await text(p)); i++) await vanta(500)
  await vanta(1500)
  const t = await text(p)
  await dump(p, V, `${nyckel}-landning`, true)
  const kvar = (await p.cookies(BAS)).find((c) => c.name === 'jc_signup')?.value ?? null
  logg(V, `${nyckel}: landningen efter valkommen`, forvantat(url(p), t), { cookieEfterLogin: Boolean(efterLogin), url: url(p), cookieKvar: Boolean(kvar), rader: rader(t, /steg 3|Köp|Börja gratis|återkoppling|bedömt|Klart/i).slice(0, 6) })
  return { p, ctx, fel, id }
}

export async function vag7(browser, del = 'alla') {
  const V = '7'
  // Ingång 1: headern, val CV (Pixel 7).
  if (del === 'alla' || del === 'cv') {
    const r = await googleSimulerad(
      browser,
      V,
      'pixel7',
      '7-cv',
      async (p) => {
        await headerSkapaKonto(p)
        await p.click('[role="radio"][data-intent="cv"]')
        await klicka(p, /^Fortsätt$/, 'footer button')
        await vanta(600)
      },
      (u, t) => u.startsWith('/dashboard/valkommen') && /steg 3 av 3/i.test(t) && /CV-paketet/.test(t)
    )
    const { p, ctx, fel, id } = r
    await klicka(p, /^Börja gratis$/, 'footer button')
    await vantaPa(p, () => location.pathname.startsWith('/dashboard/skapa-cv'), null, 30000).catch(() => {})
    await vanta(1500)
    logg(V, '7-cv: Börja gratis till CV-byggaren', url(p).startsWith('/dashboard/skapa-cv'), { url: url(p) })
    const pr = await profil(id)
    logg(V, '7-cv: valet och spåret sparade', pr?.onboarding_intent === 'cv' && pr?.onboarding_track === 'cv', { intent: pr?.onboarding_intent, track: pr?.onboarding_track })
    // Gratislistan för CV (hör till väg 1, konto 1 hann köpa innan).
    const ark = await komIgang(p, V, '7-cv')
    const o = ordning(ark, ['Analysera ditt CV', 'Välj en CV-mall', 'Skriv ett personligt brev', 'Se tre matchade jobb', 'Matrislogik, grundnivå', 'Intervjuprovet'])
    logg(V, '7-cv: Kom igång, gratislistan för CV i ordning', o.ok && /Det du valde/i.test(ark) && !/CV uppladdat|Ladda upp CV:t/.test(ark), { idx: o.idx, rader: rader(ark).slice(0, 24) })
    logg(V, '7-cv: konsolfel', fel.length === 0, { fel })
    await ctx.close()
  }

  // Ingång 6: intervjuprovet i artikeln, spärren, Google (desktop).
  // Anonyma intervjuprov har ett per IP och dygn: nyckeln för localhost
  // (skapad av väg 6) raderas före körningen, se städningen.
  if (del === 'alla' || del === 'intervju') {
    let token = null
    const r = await googleSimulerad(
      browser,
      V,
      'desktop',
      '7-intervju',
      async (p) => {
        await ga(p, '/artiklar/styrkor-svagheter-intervju')
        const ta = await p.$('textarea')
        await ta.evaluate((e) => e.scrollIntoView({ block: 'center' }))
        await ta.click()
        await p.keyboard.sendCharacter(SVAR_STYRKOR)
        await p.click('button[data-cta="intervjuprov-bedom"]')
        await p.waitForSelector('a[data-cta="intervjuprov-gate"]', { timeout: 90000 })
        const href = await p.evaluate(() => document.querySelector('a[data-cta="intervjuprov-gate"]').getAttribute('href'))
        token = decodeURIComponent(href.split('=').pop())
        sparaToken('intervju', token)
        await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.evaluate(() => document.querySelector('a[data-cta="intervjuprov-gate"]').click())])
        await vanta(1200)
      },
      (u) => u.startsWith('/dashboard/intervju/') && Boolean(token) && u.includes(token)
    )
    const { data: rad } = await admin.from('anon_interview_samples').select('token, user_id').eq('token', token).maybeSingle()
    logg(V, '7-intervju: provet hämtat till kontot', rad?.user_id === r.id, { claimad: rad?.user_id === r.id })
    logg(V, '7-intervju: konsolfel', r.fel.length === 0, { fel: r.fel })
    await r.ctx.close()
  }
}

/* ============================================================ väg 8 */

async function ettCvPa(nyckel) {
  const k = lasKonton().konton[nyckel]
  const { data: finns } = await admin.from('cv_texts').select('id').eq('user_id', k.id).limit(1)
  if (finns?.length) return finns[0].id
  const { data, error } = await admin
    .from('cv_texts')
    .insert({
      user_id: k.id,
      file_name: 'Anna_CV.pdf',
      original_file_path: `qa/${k.id}/Anna_CV.pdf`,
      cv_text: 'Anna Slutflöde. Lagerlogistiker med sju års erfarenhet av plock, inleverans och förbättringsarbete. Samordnare på Nordlager 2021 till 2026.',
    })
    .select('id')
    .single()
  if (error) throw error
  sparaKonto(nyckel, { cvTexts: [data.id] })
  return data.id
}

/** Brevflödet fram till tonsteget. */
async function tillTonsteget(p) {
  await ga(p, '/dashboard/skapa-brev')
  await vanta(2000)
  // Steg 1: välj CV:t om det inte redan är valt.
  await p.evaluate(() => {
    const r = [...document.querySelectorAll('[role="radio"], button')].find((e) => /Anna_CV/.test(e.innerText || ''))
    r?.click()
  })
  await vanta(600)
  await klicka(p, /^Fortsätt$/, 'footer button')
  await vanta(1200)
  const ta = await p.$('textarea')
  if (ta) {
    await ta.click()
    await p.keyboard.sendCharacter('Nordlager AB söker en lagerlogistiker som vill driva förbättringar i plock och inleverans. Du har erfarenhet av lager och trivs i ett högt tempo.')
  }
  await vanta(500)
  await klicka(p, /^Fortsätt$/, 'footer button')
  await vanta(1500)
  for (let i = 0; i < 3 && !(await p.$('[data-flow-section="tone"]')); i++) {
    await klicka(p, /^Fortsätt$/, 'footer button').catch(() => {})
    await vanta(1500)
  }
  return Boolean(await p.$('[data-flow-section="tone"]'))
}

export async function vag8(browser, vy = 'pixel7') {
  const V = '8'
  const k = lasKonton().konton['1']
  const { SCRATCH } = await import('./qa-slutflode.mjs')
  const foto = `${SCRATCH}/foto-4mb.jpg`
  await admin.from('profiles').update({ location: null, profile_photo_url: null, avatar_source: null, preferred_tonality: 'balanced' }).eq('id', k.id)

  const { p, ctx, fel } = await nySida(browser, vy)
  const uppladdat = []
  p.on('request', (r) => {
    if (r.url().includes('/api/profile/photo/upload')) uppladdat.push(Number(r.headers()['content-length'] ?? 0))
  })
  await loggaIn(p, k.email)

  // Menyn: Profil och Prenumeration som två rader under Konto.
  const meny = await menyText(p, vy)
  await dump(p, V, `${vy}-01-meny`)
  const menyRader = rader(meny)
  const iKonto = menyRader.slice(menyRader.findIndex((r) => /^KONTO$/i.test(r)))
  logg(V, `${vy}: Profil och Prenumeration två rader under Konto`, iKonto.includes('Profil') && iKonto.includes('Prenumeration'), { konto: iKonto.slice(0, 4) })
  await stangMeny(p)

  await ga(p, '/dashboard/profil')
  await vanta(1200)
  let t = await text(p)
  await dump(p, V, `${vy}-02-profil`)
  const hopp = await p.evaluate(() => [...document.querySelectorAll('nav[aria-label="Hoppa till"] a')].map((a) => a.getAttribute('href')))
  logg(V, `${vy}: Hoppa till`, hopp.length === 4, { hopp })
  logg(V, `${vy}: statusraden "Ort saknas i ditt CV"`, t.includes('Ort saknas i ditt CV'), {})

  // Ort.
  const ort = await p.$('input[autocomplete="address-level2"]')
  await ort.click()
  await ort.type('Örebro')
  await p.keyboard.press('Tab')
  await vanta(2500)
  t = await text(p)
  logg(V, `${vy}: raden borta när orten fyllts i`, !t.includes('Ort saknas i ditt CV'), {})

  // Foto 4 MB: förminskas, visas i ramen (och i CV-huvudets förhandsvisning på desktop).
  const input = await p.$('input[data-foto-input]')
  await input.uploadFile(foto)
  for (let i = 0; i < 40; i++) {
    if (await p.evaluate(() => [...document.querySelectorAll('#cv button')].some((b) => b.innerText.includes('Byt foto')))) break
    await vanta(500)
  }
  await vanta(2000)
  const ram = await p.evaluate(() => {
    const img = document.querySelector('[data-foto-falt] img')
    const fig = document.querySelector('#cv figure img')
    return { ram: Boolean(img && img.naturalWidth > 0), ramSrc: img?.src?.slice(0, 80) ?? null, forhands: Boolean(fig && fig.naturalWidth > 0) }
  })
  const { data: filer } = await admin.storage.from('profile-photos').list(`users/${k.id}`)
  for (const f of filer ?? []) sparaLagring(`profile-photos/users/${k.id}/${f.name}`)
  const storlek = (filer ?? []).map((f) => f.metadata?.size ?? 0)
  await p.evaluate(() => document.querySelector('[data-foto-falt]')?.scrollIntoView({ block: 'center' }))
  await dump(p, V, `${vy}-03-foto`)
  logg(V, `${vy}: 4 MB-fotot förminskat och i ramen`, ram.ram && storlek.length >= 1 && Math.max(...storlek) < 2 * 1024 * 1024 && uppladdat.length > 0 && uppladdat[0] < 2 * 1024 * 1024, {
    fore: 3960373,
    anrop: uppladdat,
    lagrat: storlek,
    ...ram,
  })
  if (vy === 'desktop') logg(V, 'desktop: fotot i CV-huvudets förhandsvisning', ram.forhands, {})

  // Ta bort, ladda upp igen.
  await p.evaluate(() => [...document.querySelectorAll('#cv button')].find((b) => b.innerText.trim() === 'Ta bort')?.click())
  await vanta(2500)
  const r1 = await profil(k.id)
  logg(V, `${vy}: Ta bort`, !r1?.profile_photo_url, {})
  await dump(p, V, `${vy}-04-foto-borttaget`)
  const input2 = await p.$('input[data-foto-input]')
  await input2.uploadFile(foto)
  for (let i = 0; i < 40; i++) {
    if (await p.evaluate(() => [...document.querySelectorAll('#cv button')].some((b) => b.innerText.includes('Byt foto')))) break
    await vanta(500)
  }
  await vanta(2000)
  const r2 = await profil(k.id)
  const { data: filer2 } = await admin.storage.from('profile-photos').list(`users/${k.id}`)
  for (const f of filer2 ?? []) sparaLagring(`profile-photos/users/${k.id}/${f.name}`)
  logg(V, `${vy}: uppladdat igen`, Boolean(r2?.profile_photo_url), { filer: (filer2 ?? []).length })

  // Förvald ton: Kreativ.
  await p.click('nav[aria-label="Hoppa till"] a[href="#personliga-brev"]')
  await vanta(900)
  await p.click('#personliga-brev [data-ton="creative"]')
  await vanta(2000)
  const vaxlar = await p.evaluate(() => ({ brev: document.querySelectorAll('#personliga-brev [role="switch"]').length, cv: document.querySelectorAll('#cv [role="switch"]').length }))
  await dump(p, V, `${vy}-05-ton-kreativ`)
  const r3 = await profil(k.id)
  logg(V, `${vy}: Kreativ sparad, brevhuvudets två växlar bara i Personliga brev`, r3?.preferred_tonality === 'creative' && vaxlar.brev === 2 && vaxlar.cv === 0, { ton: r3?.preferred_tonality, vaxlar })

  // Konto-raderna öppnar ark (Radera bekräftas aldrig).
  const ark = {}
  for (const rad of ['Mejl från oss', 'Radera mitt konto']) {
    await p.evaluate((rad) => [...document.querySelectorAll('#konto button')].find((b) => b.innerText.startsWith(rad))?.click(), rad)
    await vanta(800)
    ark[rad] = await p.evaluate(() => (document.querySelector('[role="dialog"]')?.innerText ?? '').split('\n').filter(Boolean).slice(0, 3))
    await dump(p, V, `${vy}-06-ark-${rad.split(' ')[0].toLowerCase()}`)
    await p.keyboard.press('Escape')
    await vanta(500)
  }
  logg(V, `${vy}: Konto-raderna öppnar ark`, Object.values(ark).every((a) => a.length > 0), { ark })

  // Skriv nytt brev: tonen förvald, länken till #personliga-brev.
  await ettCvPa('1')
  const nadd = await tillTonsteget(p)
  const ton = await p.evaluate(() => {
    const valt = [...document.querySelectorAll('[data-flow-section="tone"] [role="radio"][aria-checked="true"]')].map((e) => e.innerText.split('\n')[0])
    const l = [...document.querySelectorAll('[data-flow-section="tone"] a')].find((a) => /Ändra förvald ton/.test(a.innerText))
    return { valt, lank: l?.getAttribute('href') ?? null }
  })
  await dump(p, V, `${vy}-07-tonsteget`)
  logg(V, `${vy}: tonsteget har Kreativ förvald och länken Ändra förvald ton`, nadd && ton.valt.includes('Kreativ') && ton.lank === '/dashboard/profil#personliga-brev', { nadd, ...ton })
  if (ton.lank) {
    await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), klicka(p, /^Ändra förvald ton$/, 'a')])
    await vanta(1500)
    const rubrik = await p.evaluate(() => Math.round(document.querySelector('#personliga-brev h2')?.getBoundingClientRect().top ?? -1))
    await dump(p, V, `${vy}-08-andra-forvald-ton`)
    logg(V, `${vy}: länken landar på #personliga-brev`, url(p).endsWith('/dashboard/profil#personliga-brev') && rubrik >= 56 && rubrik < 320, { url: url(p), rubrik })
  }

  // Prenumerationssidan: rätt paket, knappar utan klippt text.
  await ga(p, '/dashboard/profil/prenumeration')
  await vanta(1500)
  t = await text(p)
  const klippt = await p.evaluate(() =>
    [...document.querySelectorAll('main button, main a')]
      .filter((b) => b.offsetParent !== null && (b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1))
      .map((b) => b.innerText.replace(/\s+/g, ' ').trim().slice(0, 60))
  )
  await dump(p, V, `${vy}-09-prenumeration`, true)
  logg(V, `${vy}: prenumerationssidan visar CV-paketet, inga klippta knappar`, /CV-paketet, förnyas/.test(t) && klippt.length === 0, { status: rader(t, /förnyas|Du har/i).slice(0, 3), klippt })
  logg(V, `${vy}: konsolfel`, fel.length === 0, { fel: [...new Set(fel)].slice(0, 6) })
  await ctx.close()
}

/** Tonsteget för ett gratiskonto: rättelsen "Ingår när du har ett paket" och paketnamnet med pris. */
export async function vag8ton(browser, vy = 'desktop') {
  const V = '8'
  const k = lasKonton().konton['7-cv']
  const { p, ctx } = await nySida(browser, vy)
  await ettCvPa('7-cv')
  await loggaIn(p, k.email)
  const nadd = await tillTonsteget(p)
  const t = await text(p, '[data-flow-section="tone"]')
  await p.evaluate(() => document.querySelector('[data-flow-section="tone"]')?.scrollIntoView({ block: 'start' }))
  await dump(p, V, `${vy}-10-tonsteget-gratis`)
  logg(V, 'tonsteget gratis: paketnamn och pris i stället för Premium', nadd && !/Premium/.test(t) && /Ingår när du har ett paket/.test(t) && /Se CV-paketet, 79 kr i veckan/.test(t), { rader: rader(t).slice(0, 8) })
  await ctx.close()
}

/** Felsökning: länken Ändra förvald ton på desktop, scroll över tid. */
export async function vag8ankare(browser, vy = 'desktop') {
  const V = '8'
  const k = lasKonton().konton['1']
  const { p, ctx } = await nySida(browser, vy)
  await loggaIn(p, k.email)
  await tillTonsteget(p)
  await klicka(p, /^Ändra förvald ton$/, 'a')
  const matt = []
  for (const ms of [300, 700, 1500, 3000]) {
    await vanta(ms - (matt.at(-1)?.ms ?? 0))
    matt.push({ ms, url: url(p), y: await p.evaluate(() => Math.round(document.querySelector('#personliga-brev h2')?.getBoundingClientRect().top ?? -1)), scroll: await p.evaluate(() => Math.round(scrollY)) })
  }
  logg(V, 'felsökning: Ändra förvald ton via klient-navigering', null, { matt })
  await ga(p, '/dashboard/profil#personliga-brev')
  await vanta(1500)
  const direkt = await p.evaluate(() => Math.round(document.querySelector('#personliga-brev h2')?.getBoundingClientRect().top ?? -1))
  logg(V, 'felsökning: direktladdning av #personliga-brev', direkt >= 56 && direkt < 320, { direkt })
  await ctx.close()
}

/* ============================================================ väg 9 */

export async function vag9(browser, del = 'alla') {
  const V = '9'
  const delar = del === 'alla' ? ['kort', 'finns', 'losen', 'byte', 'nedgradering'] : del.split(',')

  if (delar.includes('kort')) {
    const { p, ctx } = await nySida(browser, 'desktop')
    await ga(p, '/register?paket=cv_week')
    const email = epost('9-kort')
    await fyllKonto(p, { namn: 'Ivar Kortfel', email })
    await skickaKonto(p)
    const id = await registreraId('9-kort', email)
    for (let i = 0; i < 20 && !/Steg 2 av 2/i.test(await text(p)); i++) await vanta(500)
    await vantaText(p, /Steg 2 av 2/i, 20000)
    await p.click('label input[type="checkbox"]')
    await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}), klicka(p, /^Till betalning/, 'button')])
    await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000)
    const { fyllKort, betala } = await import('./qa-slutflode.mjs')
    await fyllKort(p, '4000000000000002')
    await betala(p)
    await vanta(9000)
    const t = await text(p)
    await dump(p, V, 'kort-nekat')
    await vanta(6000)
    const pr = await profil(id)
    sparaKonto('9-kort', { customer: pr?.stripe_customer_id })
    logg(V, 'nekat kort: fel i kassan, inget paket', p.url().includes('stripe.com') && /nek|declin/i.test(t) && pr?.subscription_tier !== 'premium' && !pr?.premium_scope, {
      fel: rader(t, /nek|declin/i).slice(0, 2),
      tier: pr?.subscription_tier,
      scope: pr?.premium_scope,
      status: pr?.subscription_status,
    })
    await ctx.close()
  }

  if (delar.includes('finns')) {
    const { p, ctx } = await nySida(browser, 'pixel7')
    await headerSkapaKonto(p)
    await p.click('[role="radio"][data-intent="cv"]')
    await klicka(p, /^Fortsätt$/, 'footer button')
    await vanta(500)
    await fyllKonto(p, { namn: 'Anna Finns', email: epost('1') })
    await p.click('footer button[type="submit"]')
    await vanta(3500)
    const t = await text(p)
    const lank = await p.evaluate(() => [...document.querySelectorAll('[role="alert"] a')].map((a) => ({ text: a.innerText.trim(), href: a.getAttribute('href') })))
    await dump(p, V, 'finns-redan')
    logg(V, 'befintlig e-post: felraden med Logga in', /Det finns redan ett konto med den adressen/.test(t) && lank.some((l) => /Logga in/.test(l.text)), { lank, url: url(p) })
    await ctx.close()
  }

  if (delar.includes('losen')) {
    const { p, ctx } = await nySida(browser, 'pixel7')
    await ga(p, '/register?borja=cv')
    await fyllKonto(p, { namn: 'Anna Kort', email: epost('9-losen'), losen: 'kort1' })
    await p.click('footer button[type="submit"]')
    await vanta(2500)
    const t = await text(p)
    await dump(p, V, 'kort-losenord')
    const { data: finns } = await admin.from('profiles').select('id').eq('email', epost('9-losen')).maybeSingle()
    if (finns?.id) sparaKonto('9-losen', { id: finns.id, email: epost('9-losen') })
    logg(V, 'för kort lösenord: felrad, inget konto', url(p).startsWith('/register') && !finns && /lösenord|tecken/i.test(rader(t, /lösenord|tecken/i).join(' ')), {
      rader: rader(t, /lösenord|tecken|minst/i).slice(0, 4),
      kontoSkapat: Boolean(finns),
    })
    await ctx.close()
  }

  if (delar.includes('byte')) {
    const k = lasKonton().konton['1']
    const { p, ctx, fel } = await nySida(browser, 'desktop')
    const svar = []
    p.on('response', async (r) => {
      if (r.url().includes('/api/stripe/create-upgrade-session')) svar.push({ status: r.status(), body: (await r.text().catch(() => '')).slice(0, 160) })
    })
    await loggaIn(p, k.email)
    await ga(p, '/dashboard/profil/prenumeration')
    await vanta(1500)
    await dump(p, V, 'byte-1-prenumeration', true)
    await klicka(p, /^Byt till Träningspaketet/, 'button, a')
    await vantaText(p, /Du har nu Träningspaketet|Det gick inte|redan/, 30000)
    await vanta(1200)
    await dump(p, V, 'byte-2-till-traning', true)
    const v1 = await vantaPaProfil(k.id, (pr) => pr.premium_scope === 'tester', 60000)
    logg(V, 'byte CV-paketet till Träningspaketet', v1.ok && /Du har nu Träningspaketet/.test(await text(p)), { svar: svar.splice(0), scope: v1.profil?.premium_scope })
    await vanta(6000)
    await ga(p, '/dashboard/profil/prenumeration')
    await vanta(1500)
    await klicka(p, /^Byt till CV-paketet/, 'button, a')
    await vantaText(p, /Du har nu CV-paketet|Det gick inte|redan/, 30000)
    await vanta(1200)
    await dump(p, V, 'byte-3-tillbaka-cv', true)
    const v2 = await vantaPaProfil(k.id, (pr) => pr.premium_scope === 'cv', 60000)
    logg(V, 'byte Träningspaketet till CV-paketet', v2.ok && /Du har nu CV-paketet/.test(await text(p)), { svar: svar.splice(0), scope: v2.profil?.premium_scope })
    logg(V, 'byte: konsolfel', fel.length === 0, { fel })
    await ctx.close()
  }

  if (delar.includes('nedgradering')) {
    const k = lasKonton().konton['4']
    const { p, ctx } = await nySida(browser, 'pixel7')
    await loggaIn(p, k.email)
    await ga(p, '/dashboard/profil/prenumeration')
    await vanta(1500)
    await klicka(p, /^Byt till CV-paketet.*vid nästa förnyelse/, 'a, button')
    await vantaText(p, /Nedgradering sker vid nästa förnyelse|Det gick inte/, 30000)
    await vanta(800)
    const t = await text(p)
    await p.evaluate(() => [...document.querySelectorAll('main *')].find((e) => /Nedgradering sker/.test(e.innerText || '') && e.children.length < 4)?.scrollIntoView({ block: 'center' }))
    await dump(p, V, 'nedgradering-besked')
    const pr = await profil(k.id)
    logg(V, 'nedgradering från Hela paketet ger beskedet', /Nedgradering sker vid nästa förnyelse/.test(t) && pr?.premium_scope === 'allt', { besked: rader(t, /Nedgradering|kundportalen/i).slice(0, 3), scope: pr?.premium_scope })
    await ctx.close()
  }
}

/* ============================================================ väg 10 */

/** Menyraderna utan statusetiketter (paketraden överst, Aktiv, Nyhet, Ingår, lås). */
function menyRaderUtanStatus(t) {
  const r = rader(t)
  const start = r.findIndex((x) => x === 'Mitt jobbsök')
  return r.slice(start).filter((x) => !/^(Aktiv|Nyhet|Ny|Ingår|Låst|Gratis|\d+\/\d+|\d+ av \d+.*|Kom igång)$/i.test(x))
}

export async function vag10(browser) {
  const V = '10'
  const menyer = {}
  for (const nyckel of ['1', '2', '4']) {
    const k = lasKonton().konton[nyckel]
    const { p, ctx } = await nySida(browser, 'desktop')
    await loggaIn(p, k.email)
    await ga(p, '/dashboard')
    await vanta(1500)
    const t = await menyText(p, 'desktop')
    await dump(p, V, `meny-konto-${nyckel}`)
    const mob = await (async () => {
      const q = await nySida(browser, 'pixel7')
      await loggaIn(q.p, k.email)
      await ga(q.p, '/dashboard')
      const nav = await q.p.evaluate(() => [...document.querySelectorAll('nav')].filter((n) => n.offsetParent !== null && getComputedStyle(n).position === 'fixed').map((n) => n.innerText).join(' | '))
      const m = await menyText(q.p, 'pixel7')
      await dump(q.p, V, `meny-pixel7-konto-${nyckel}`)
      await q.ctx.close()
      return { nav, m }
    })()
    menyer[nyckel] = { hel: rader(t).slice(0, 3), rader: menyRaderUtanStatus(t), mobilMeny: menyRaderUtanStatus(mob.m), mobilNav: mob.nav }
    await ctx.close()
  }
  const a = JSON.stringify(menyer['1'].rader)
  const lika = ['2', '4'].every((n) => JSON.stringify(menyer[n].rader) === a)
  const likaMobil = ['2', '4'].every((n) => JSON.stringify(menyer[n].mobilMeny) === JSON.stringify(menyer['1'].mobilMeny) && menyer[n].mobilNav === menyer['1'].mobilNav)
  logg(V, 'menyn identisk för konto 1, 2 och 4 (utan statusetiketter)', lika && likaMobil, {
    status: Object.fromEntries(Object.entries(menyer).map(([n, m]) => [n, m.hel])),
    rader1: menyer['1'].rader,
    skillnad: ['2', '4'].map((n) => ({ n, bara: menyer[n].rader.filter((x) => !menyer['1'].rader.includes(x)), saknas: menyer['1'].rader.filter((x) => !menyer[n].rader.includes(x)) })),
    mobilNav: menyer['1'].mobilNav,
  })

  // Talstreck: renderad text och HTML-svaren.
  const publika = ['/', '/priser', '/register', '/register?borja=tester', '/register?intervju=0b4f7a53-8b8e-4a44-9d2d-2f1f7b3c1e11', '/register?paket=all_day', '/login', '/verktyg/rekryteringstester', '/verktyg/rekryteringstester/prova', '/verktyg/personlighetstest', '/skapa-brev/start', '/artiklar/styrkor-svagheter-intervju']
  const inloggade = ['/dashboard', '/dashboard/valj-spar', '/dashboard/valj-spar?paket=cv_week&steg=kop', '/dashboard/valj-spar?paket=all_month&steg=kop', '/dashboard/profil', '/dashboard/profil/prenumeration', '/dashboard/intervju', '/dashboard/intervju/ny', '/dashboard/tester', '/dashboard/cv-mallar', '/dashboard/skapa-cv', '/dashboard/skapa-brev', '/dashboard/vecka/start?premium_activated=true&plan=cv_week', '/dashboard/vecka/start?premium_activated=true&plan=all_day']
  const traffar = []
  const kolla = async (p, u, vem) => {
    const res = await p.goto(BAS + u, { waitUntil: 'networkidle2' })
    await vanta(800)
    const html = (await res?.text().catch(() => '')) ?? ''
    const synlig = await p.evaluate(() => document.body.innerText)
    const iText = rader(synlig, /—/)
    const iHtml = (html.match(/—/g) ?? []).length
    const htmlUtdrag = [...html.matchAll(/.{0,50}—.{0,50}/g)].slice(0, 3).map((m) => m[0])
    if (iText.length || iHtml) traffar.push({ vem, u, iText: iText.slice(0, 3), iHtml, htmlUtdrag })
  }
  {
    const { p, ctx } = await nySida(browser, 'desktop')
    for (const u of publika) await kolla(p, u, 'utloggad')
    await ctx.close()
  }
  for (const nyckel of ['1', '5']) {
    const { p, ctx } = await nySida(browser, 'desktop')
    await loggaIn(p, lasKonton().konton[nyckel].email)
    for (const u of inloggade) await kolla(p, u, `konto ${nyckel}`)
    // Kom igång-arket och profilmenyn.
    await ga(p, '/dashboard')
    const ark = await komIgangArk(p)
    if (/—/.test(ark)) traffar.push({ vem: `konto ${nyckel}`, u: 'Kom igång-arket', iText: rader(ark, /—/).slice(0, 3) })
    await ctx.close()
  }
  const iSynligText = traffar.filter((x) => x.iText?.length)
  logg(V, 'inga talstreck i renderad text', iSynligText.length === 0, { sidor: publika.length + inloggade.length * 2, traffarText: iSynligText })
  logg(V, 'talstreck i HTML-svaren (källkod, JSON, metadata)', null, { traffarHtml: traffar.filter((x) => x.iHtml).map((x) => ({ u: x.u, vem: x.vem, n: x.iHtml, utdrag: x.htmlUtdrag })) })
}

/** Portalraderna på prenumerationssidan är vanliga länkar: inget RSC-fel, rakt till Stripe. */
export async function vag4portal(browser, vy = 'desktop') {
  const V = '4'
  const { p, ctx, fel } = await nySida(browser, vy)
  await loggaIn(p, lasKonton().konton['4'].email)
  await ga(p, '/dashboard/profil/prenumeration')
  await vanta(1200)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}), klicka(p, /^Kvitton/, 'a')])
  await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000).catch(() => {})
  await vanta(1500)
  await dump(p, V, '16-portal-via-lank')
  logg(V, 'Kvitton öppnar kundportalen utan konsolfel', p.url().includes('stripe.com') && fel.length === 0, { url: p.url().split('?')[0].slice(0, 50), fel })
  await ctx.close()
}
