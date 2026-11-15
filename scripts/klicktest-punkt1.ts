/**
 * Klicktestet för punkt 1 i svepet 2026-11-15 (produkttexter som inte stämde
 * med koden), i riktig Chrome som nya användare: Pixel 7 och 1280 px, ljust
 * och mörkt.
 *
 *   npx tsx scripts/klicktest-punkt1.ts skapa  --ut <mapp>             # QA-konton, id i <mapp>/konton.json
 *   npx tsx scripts/klicktest-punkt1.ts klicka --ut <mapp> [--bas URL]  # skärmdumpar och kontroller
 *   npx tsx scripts/klicktest-punkt1.ts radera --ut <mapp>             # raderar exakt kontona i konton.json som finns kvar
 *
 * Kontona: "ny" (nytt gratiskonto), "slut" (gratiskonto med tio skickade
 * meddelanden till Jobbcoachen) och fyra "rad-*" (ett per vy och tema) som
 * raderas via Inställningar. Raderingskontona har en CV-fil, en bilaga i
 * chat_attachments, ett profilfoto, en rad i email_log och ett claimat
 * brevutkast; kontrollen räknar före och efter, bara på kontots egna id.
 * Adresserna är unika per körning (qa-punkt1-<roll>-<tid>@jobbcoach-qa.test).
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Page } from 'puppeteer-core'

function laddaEnv() {
  for (const rad of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const i = rad.indexOf('=')
    if (i < 0 || rad.trim().startsWith('#')) continue
    const k = rad.slice(0, i).trim()
    if (!process.env[k]) process.env[k] = rad.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
}
laddaEnv()

const arg = (n: string, f?: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const UT = path.resolve(arg('ut', 'qa-punkt1')!)
const BAS = arg('bas', 'http://localhost:8300')!
fs.mkdirSync(UT, { recursive: true })
const KONTOFIL = path.join(UT, 'konton.json')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const VYER = [
  { namn: 'pixel7', viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
  { namn: 'desktop', viewport: { width: 1280, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false } },
] as const
const TEMAN = ['light', 'dark'] as const

interface Konto { roll: string; epost: string; id: string }

async function nyttKonto(roll: string, tid: number): Promise<Konto> {
  const epost = `qa-punkt1-${roll}-${tid}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email: epost,
    password: `QaPunkt1!${tid}`,
    email_confirm: true,
    user_metadata: { full_name: 'Sara Ek' },
  })
  if (error || !data.user) throw new Error(`createUser ${roll}: ${error?.message}`)
  const id = data.user.id
  const { error: pe } = await sb
    .from('profiles')
    .update({ full_name: 'Sara Ek', email_verified_at: new Date().toISOString(), onboarding_track: 'allt', subscription_tier: 'free' })
    .eq('id', id)
  if (pe) throw new Error(`profiles ${roll}: ${pe.message}`)
  console.log('SKAPAD', roll, epost, id)
  return { roll, epost, id }
}

async function laggFiler(k: Konto) {
  const pdf = new Blob(['%PDF-1.4 qa punkt1'], { type: 'application/pdf' })
  for (const vag of [`users/${k.id}/Sara Ek CV.pdf`, `users/${k.id}/chat_attachments/temp/1_bilaga.pdf`]) {
    const { error } = await sb.storage.from('cvs').upload(vag, pdf, { upsert: true })
    if (error) throw new Error(`cvs ${vag}: ${error.message}`)
  }
  const jpg = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' })
  const { error: fe } = await sb.storage.from('profile-photos').upload(`users/${k.id}/profile-photo-1.jpg`, jpg, { upsert: true })
  if (fe) throw new Error(`foto: ${fe.message}`)
  const { error: me } = await sb.from('email_log').insert({ user_id: k.id, email_type: 'qa_punkt1', recipient: k.epost, subject: 'QA' })
  if (me) throw new Error(`email_log: ${me.message}`)
  const { error: de } = await sb.from('public_letter_drafts').insert({
    role: 'QA', employer: 'QA', letter_text: 'QA', preview_paragraph: 'QA', ip_hash: 'qa-punkt1', claimed_by: k.id, claimed_at: new Date().toISOString(),
  })
  if (de) throw new Error(`public_letter_drafts: ${de.message}`)
}

async function skapa() {
  const tid = Date.now()
  const konton: Konto[] = []
  const ny = await nyttKonto('ny', tid)
  // Ett CV, så att CV-analysen visar sin start i stället för att skicka till Mina CV.
  const { error: ce } = await sb.from('cv_texts').insert({
    user_id: ny.id,
    file_name: 'Sara Ek.pdf',
    original_file_path: '',
    cv_text: 'Sara Ek. Undersköterska med fem års erfarenhet från äldreomsorg och akutsjukvård. Undersköterska, Region Uppsala 2021-2026.',
  })
  if (ce) throw new Error(`cv_texts: ${ce.message}`)
  konton.push(ny)
  const slut = await nyttKonto('slut', tid)
  const { data: konv, error: ke } = await sb.from('ai_conversations').insert({ user_id: slut.id, title: 'QA' }).select('id').single()
  if (ke || !konv) throw new Error(`ai_conversations: ${ke?.message}`)
  const rader = Array.from({ length: 10 }, (_, i) => ({ conversation_id: konv.id, user_id: slut.id, role: 'user', content: `Fråga ${i + 1}` }))
  const { error: me } = await sb.from('ai_messages').insert(rader)
  if (me) throw new Error(`ai_messages: ${me.message}`)
  konton.push(slut)
  for (const v of VYER) for (const t of TEMAN) {
    const k = await nyttKonto(`rad-${v.namn}-${t}`, tid)
    await laggFiler(k)
    konton.push(k)
  }
  fs.writeFileSync(KONTOFIL, JSON.stringify(konton, null, 2))
}

/** Räknar kontots spår: auth, objekt i båda hinkarna, lösa rader. Bara på id. */
async function spar(id: string) {
  const { data: u } = await sb.auth.admin.getUserById(id)
  const { count: mejl } = await sb.from('email_log').select('*', { count: 'exact', head: true }).eq('user_id', id)
  const { count: utkast } = await sb.from('public_letter_drafts').select('*', { count: 'exact', head: true }).eq('claimed_by', id)
  return { auth: !!u?.user, email_log: mejl ?? -1, utkast: utkast ?? -1 }
}

/** Filer listade via lagrings-API:t (storage-schemat är inte alltid exponerat). */
async function filer(id: string) {
  const ut: string[] = []
  async function lista(hink: string, mapp: string) {
    const { data } = await sb.storage.from(hink).list(mapp, { limit: 1000 })
    for (const p of data ?? []) {
      if (p.id === null) await lista(hink, `${mapp}/${p.name}`)
      else ut.push(`${hink}/${mapp}/${p.name}`)
    }
  }
  await lista('cvs', `users/${id}`)
  await lista('profile-photos', `users/${id}`)
  return ut
}

async function radera() {
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) as Konto[]
  for (const k of konton) {
    const { data: u } = await sb.auth.admin.getUserById(k.id)
    if (!u?.user) {
      console.log(`REDAN BORTA ${k.epost}`)
      continue
    }
    const f = await filer(k.id)
    if (f.length) {
      const per: Record<string, string[]> = {}
      for (const v of f) {
        const [hink, ...rest] = v.split('/')
        ;(per[hink] ??= []).push(rest.join('/'))
      }
      for (const [hink, vagar] of Object.entries(per)) {
        const { error } = await sb.storage.from(hink).remove(vagar)
        console.log(`${hink}: ${vagar.length} filer${error ? ' FEL ' + error.message : ' raderade'}`)
      }
    }
    for (const [tabell, kol] of [['email_log', 'user_id'], ['public_letter_drafts', 'claimed_by']] as const) {
      const { count } = await sb.from(tabell).select('*', { count: 'exact', head: true }).eq(kol, k.id)
      if (count) {
        const { error } = await sb.from(tabell).delete().eq(kol, k.id)
        console.log(`${tabell}: ${count} rader${error ? ' FEL ' + error.message : ' raderade'}`)
      }
    }
    const { error } = await sb.auth.admin.deleteUser(k.id)
    console.log(error ? `FEL radera ${k.epost}: ${error.message}` : `RADERAD ${k.epost} (${k.id})`)
  }
}

async function sessionsCookie(epost: string) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost })
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: s, error } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
  const payload =
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
  const namn = `sb-${ref}-auth-token`
  const C = 3200
  if (payload.length <= C) return [{ name: namn, value: payload }]
  const ut: { name: string; value: string }[] = []
  for (let i = 0, n = 0; i < payload.length; i += C, n++) ut.push({ name: `${namn}.${n}`, value: payload.slice(i, i + C) })
  return ut
}

const resultat: string[] = []
const kontroll = (ok: boolean, text: string) => {
  resultat.push(`${ok ? 'OK  ' : 'FEL '} ${text}`)
  console.log(`${ok ? 'OK  ' : 'FEL '} ${text}`)
}
const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms))
const text = (page: Page) => page.evaluate(() => document.body.innerText)

/** Ord som inte får stå i vyerna efter rättningen. */
const FORBJUDET: Array<[RegExp, string]> = [
  [/varje natt|per natt|i natt|efter midnatt/i, 'natt/midnatt'],
  [/var tredje (dygn|dag)/i, 'var tredje dygn'],
  [/meddelanden? kvar idag/i, 'meddelanden kvar idag'],
  [/sex kategorier|kategori-betyg/i, 'sex kategorier'],
]

async function oppna(browser: puppeteer.Browser, k: Konto, v: (typeof VYER)[number], t: (typeof TEMAN)[number]) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const fel: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|posthog|Failed to load resource: net::ERR_BLOCKED|status of 402/i.test(m.text())) fel.push('konsol: ' + m.text().slice(0, 160))
  })
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 500 && u.startsWith(BAS)) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
    else if (r.status() >= 400) console.log(`  (svar ${r.status()} ${r.request().method()} ${u.split('?')[0]})`)
  })
  await page.setViewport(v.viewport)
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: t }])
  for (const c of await sessionsCookie(k.epost)) await page.setCookie({ ...c, url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  return { ctx, page, fel }
}

async function besok(page: Page, sida: string, steg: string, bildnamn: string) {
  await page.goto(`${BAS}${sida}`, { waitUntil: 'networkidle2', timeout: 90000 })
  await vanta(1500)
  const body = await text(page)
  kontroll(page.url().includes(sida), `${steg}: ${sida} öppnas (${page.url().replace(BAS, '')})`)
  for (const [re, namn] of FORBJUDET) kontroll(!re.test(body), `${steg}: ${sida} saknar "${namn}"`)
  await page.screenshot({ path: path.join(UT, `${bildnamn}.png`) as `${string}.png` })
  return body
}

async function klicka() {
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) as Konto[]
  const ny = konton.find((k) => k.roll === 'ny')!
  const slut = konton.find((k) => k.roll === 'slut')!
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox'],
  })
  try {
    for (const v of VYER) for (const t of TEMAN) {
      const steg = `${v.namn}-${t}`

      // Nytt gratiskonto: Jobbcoachen, CV-analysen, jobbmatchningen, Bli upptäckt.
      {
        const { ctx, page, fel } = await oppna(browser, ny, v, t)
        let body = await besok(page, '/dashboard/jobbcoachen', `ny-${steg}`, `ny-${steg}-1-jobbcoachen`)
        kontroll(!/öppnar igen/i.test(body), `ny-${steg}: Jobbcoachen lovar inte att chatten öppnar igen`)
        body = await besok(page, '/dashboard/cv-analys', `ny-${steg}`, `ny-${steg}-2-cv-analys`)
        kontroll(!/30 sekunder/.test(body), `ny-${steg}: CV-analysen säger inte "på 30 sekunder"`)
        body = await besok(page, '/dashboard/jobbmatchning', `ny-${steg}`, `ny-${steg}-3-jobbmatchning`)
        body = await besok(page, '/dashboard/bli-upptackt', `ny-${steg}`, `ny-${steg}-4-bli-upptackt`)
        kontroll(!/ingår i (Jobbcoach )?Premium/i.test(body), `ny-${steg}: Bli upptäckt utan Premium-spärr i vyn`)
        const last = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLAnchorElement>('a[href="/dashboard/bli-upptackt"]')].some(
            (a) => /ingår i|premium/i.test(a.getAttribute('aria-label') ?? '') || !!a.querySelector('[data-last], svg[aria-label*="Låst"]')
          )
        )
        kontroll(!last, `ny-${steg}: menyvalet Bli upptäckt är inte låst`)
        await page.goto(`${BAS}/dashboard/installningar`, { waitUntil: 'networkidle2', timeout: 90000 })
        await vanta(1200)
        await page.screenshot({ path: path.join(UT, `ny-${steg}-5-installningar.png`) as `${string}.png` })
        kontroll(fel.length === 0, `ny-${steg}: inga konsolfel eller 5xx (${fel.join(' | ')})`)
        await ctx.close()
      }

      // Konto med tio skickade meddelanden: låst chatt, inget löfte om midnatt.
      {
        const { ctx, page, fel } = await oppna(browser, slut, v, t)
        await besok(page, '/dashboard/jobbcoachen', `slut-${steg}`, `slut-${steg}-1-jobbcoachen`)
        // Ett elfte meddelande: servern säger nej utan att fråga modellen, och vyn låser chatten.
        await page.type('textarea', 'Hur förhandlar jag lön?')
        await page.keyboard.press('Enter')
        await vanta(5000)
        await page.screenshot({ path: path.join(UT, `slut-${steg}-2-last.png`) as `${string}.png` })
        const body = await text(page)
        for (const [re, namn] of FORBJUDET) kontroll(!re.test(body), `slut-${steg}: låst chatt saknar "${namn}"`)
        const platshallare = await page.evaluate(() => document.querySelector('textarea')?.getAttribute('placeholder') ?? '')
        kontroll(/använda/.test(platshallare) && !/midnatt|imorgon|igen/i.test(platshallare), `slut-${steg}: platshållaren lovar inget nytt ("${platshallare}")`)
        kontroll(/Premium/.test(body), `slut-${steg}: betalväggen syns`)
        kontroll(fel.length === 0, `slut-${steg}: inga konsolfel eller 5xx (${fel.join(' | ')})`)
        await ctx.close()
      }

      // Kontoradering via Inställningar, med filer och lösa rader.
      {
        const k = konton.find((x) => x.roll === `rad-${steg}`)!
        const fore = await spar(k.id)
        const foreFiler = await filer(k.id)
        kontroll(fore.auth && foreFiler.length === 3 && fore.email_log === 1 && fore.utkast === 1, `rad-${steg}: före ${JSON.stringify({ ...fore, filer: foreFiler.length })}`)
        const { ctx, page, fel } = await oppna(browser, k, v, t)
        await page.goto(`${BAS}/dashboard/installningar`, { waitUntil: 'networkidle2', timeout: 90000 })
        await vanta(1500)
        await page.evaluate(() => {
          const b = [...document.querySelectorAll<HTMLElement>('button')].find((e) => e.innerText.trim().startsWith('Radera mitt konto'))
          b?.scrollIntoView({ block: 'center' })
          b?.click()
        })
        await vanta(900)
        await page.screenshot({ path: path.join(UT, `rad-${steg}-1-ark.png`) as `${string}.png` })
        await page.type('input[placeholder="radera mitt konto"]', 'radera mitt konto')
        await vanta(300)
        await page.screenshot({ path: path.join(UT, `rad-${steg}-2-bekraftat.png`) as `${string}.png` })
        await page.evaluate(() => {
          const b = [...document.querySelectorAll<HTMLButtonElement>('button')].find((e) => e.innerText.trim().startsWith('Radera permanent'))
          b?.click()
        })
        // Vänta tills sidan lämnat Inställningar (raderingen klar och omladdningen gjord), högst 30 s.
        for (let i = 0; i < 60 && page.url().includes('/dashboard/installningar'); i++) await vanta(500)
        await vanta(1500)
        await page.screenshot({ path: path.join(UT, `rad-${steg}-3-efter.png`) as `${string}.png` })
        const efter = await spar(k.id)
        const efterFiler = await filer(k.id)
        kontroll(!efter.auth, `rad-${steg}: kontot är borta`)
        kontroll(efterFiler.length === 0, `rad-${steg}: filerna är borta (${efterFiler.length} kvar)`)
        kontroll(efter.email_log === 0 && efter.utkast === 0, `rad-${steg}: email_log och brevutkastet är borta (${efter.email_log}, ${efter.utkast})`)
        kontroll(!page.url().includes('/dashboard/installningar'), `rad-${steg}: lämnar Inställningar efter raderingen (${page.url().replace(BAS, '')})`)
        kontroll(fel.length === 0, `rad-${steg}: inga konsolfel eller 5xx (${fel.join(' | ')})`)
        await ctx.close()
      }
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.txt'), resultat.join('\n') + '\n')
    const fel = resultat.filter((r) => r.startsWith('FEL')).length
    console.log(`\n${resultat.length - fel} OK, ${fel} FEL`)
  }
}

const kommando = process.argv[2]
;(kommando === 'skapa' ? skapa() : kommando === 'klicka' ? klicka() : kommando === 'radera' ? radera() : Promise.reject(new Error('skapa | klicka | radera'))).catch((e) => {
  console.error(e)
  process.exit(1)
})
