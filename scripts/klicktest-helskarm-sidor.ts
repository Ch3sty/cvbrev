/**
 * Helskärmens sidindelning (skissen V4b, 2026-11-16): sidorna som egna A4-ark
 * ur den riktiga PDF:en. Två delar:
 *
 *   jamfor  Mot den nedladdade filen. För varje mall och CV-längd laddas PDF:en
 *           ner genom /api/cv/generate-formatted (Premium-kontot, samma väg som
 *           knappen) och helskärmens sidor hämtas genom /api/cv/sidor med samma
 *           CV. Kraven: lika många sidor, och varje sida lika filens sida pixel
 *           för pixel (under 1 procent avvikande pixlar; helskärmen visar filen,
 *           utan arkets initial). Rapporten skriver ut var sida 1 slutar (sista
 *           raden i huvudspalten och i spalten) med pdf.js.
 *   klicka  I riktig Chrome, Pixel 7 och 1280, ljust och mörkt: helskärmen på
 *           mallsidan (exempel och uppladdat långt CV, utloggad), provsidan,
 *           Mina mallar och byggarens steg 7 (inloggad). Arken staplade med
 *           12 px glipa, "Sida i av n" under varje ark, ingen sidled.
 *
 *   npx tsx scripts/klicktest-helskarm-sidor.ts skapa  --ut <mapp>
 *   npx tsx scripts/klicktest-helskarm-sidor.ts jamfor --ut <mapp> [--bas URL]
 *   npx tsx scripts/klicktest-helskarm-sidor.ts klicka --ut <mapp> [--bas URL]
 *   npx tsx scripts/klicktest-helskarm-sidor.ts radera --ut <mapp>
 *
 * Kontot: qa-helskarm-premium-<tid>@jobbcoach-qa.test med ett långt CV.
 * Raderingen går bara på id:t i konton.json (räknas före delete). Bilder och
 * filer hamnar i --ut, aldrig i git.
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import { CV_LANGDER } from '../src/lib/cv/word/__tests__/fixtures'
import { CHROME, lasPdfGeometri, norm } from './lib/pdf-verktyg'

function laddaEnv() {
  for (const fil of ['.env.local', '../../../.env.local']) {
    if (!fs.existsSync(fil)) continue
    for (const rad of fs.readFileSync(fil, 'utf8').split(/\r?\n/)) {
      const i = rad.indexOf('=')
      if (i < 0 || rad.trim().startsWith('#')) continue
      const k = rad.slice(0, i).trim()
      if (!process.env[k]) process.env[k] = rad.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    }
  }
}
laddaEnv()

const arg = (n: string, f?: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const UT = path.resolve(arg('ut', 'qa-helskarm')!)
const BAS = arg('bas', 'http://localhost:8300')!
fs.mkdirSync(UT, { recursive: true })
const KONTOFIL = path.join(UT, 'konton.json')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface Konto { epost: string; id: string; cvId?: string }
const lasKonton = (): Konto[] => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : [])
const sparaKonton = (k: Konto[]) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))

const resultat: string[] = []
const kontroll = (ok: boolean, text: string) => {
  resultat.push(`${ok ? 'OK  ' : 'FEL '} ${text}`)
  console.log(`${ok ? 'OK  ' : 'FEL '} ${text}`)
}
const vila = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function skapa() {
  const tid = Date.now()
  const konton = lasKonton()
  const epost = `qa-helskarm-premium-${tid}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({ email: epost, password: `QaHelskarm!${tid}`, email_confirm: true, user_metadata: { full_name: 'Märta Söderström-Ångström' } })
  if (error || !data.user) throw new Error(`createUser: ${error?.message}`)
  konton.push({ epost, id: data.user.id })
  sparaKonton(konton)
  const { error: pe } = await sb
    .from('profiles')
    .update({
      full_name: 'Märta Söderström-Ångström',
      onboarding_track: 'cv',
      subscription_tier: 'premium',
      premium_scope: 'allt',
      premium_until: new Date(Date.now() + 2 * 86400000).toISOString(),
    })
    .eq('id', data.user.id)
  if (pe) throw new Error(`profiles: ${pe.message}`)
  const cv = CV_LANGDER.langt
  const { data: rad, error: ce } = await sb
    .from('cv_texts')
    .insert({ user_id: data.user.id, file_name: 'Marta.pdf', original_file_path: '', cv_text: `${cv.personalInfo.fullName}\n${cv.summary}`, structured_data: cv })
    .select('id')
    .single()
  if (ce || !rad) throw new Error(`cv_texts: ${ce?.message}`)
  konton[konton.length - 1].cvId = rad.id
  sparaKonton(konton)
  console.log('SKAPAD', epost, data.user.id)
}

async function radera() {
  const konton = lasKonton()
  const ids = konton.map((k) => k.id).filter(Boolean)
  if (ids.length === 0) return console.log('inga konton')
  for (const tabell of ['cv_texts', 'formatted_cv_downloads', 'user_activities']) {
    const { count } = await sb.from(tabell).select('*', { count: 'exact', head: true }).in('user_id', ids)
    const { error } = await sb.from(tabell).delete().in('user_id', ids)
    console.log(`${tabell}: ${count ?? 0} rader${error ? ' FEL ' + error.message : ' raderade'}`)
  }
  for (const k of konton) {
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

/* ------------------------------------------------------------------ jamfor */

/** Mallarna i jämförelsen: en spalt, foto, sidospalt med foto, tvåspalt, marginal, konstnärlig. */
const MALLAR = ['linne', 'bjork', 'kalksten', 'granit', 'stal', 'kolumn', 'arsring', 'horisont']

async function pixlar(bild: Buffer) {
  const { loadImage, createCanvas } = await import('@napi-rs/canvas')
  const img = await loadImage(bild)
  const c = createCanvas(img.width, img.height)
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  return { b: img.width, h: img.height, d: ctx.getImageData(0, 0, img.width, img.height).data }
}

/** Andelen pixlar där någon kanal skiljer mer än 48. */
async function avvikelse(a: Buffer, b: Buffer): Promise<number> {
  const [x, y] = await Promise.all([pixlar(a), pixlar(b)])
  if (x.b !== y.b || x.h !== y.h) return 1
  let fel = 0
  for (let i = 0; i < x.d.length; i += 4) {
    if (Math.abs(x.d[i] - y.d[i]) > 48 || Math.abs(x.d[i + 1] - y.d[i + 1]) > 48 || Math.abs(x.d[i + 2] - y.d[i + 2]) > 48) fel++
  }
  return fel / (x.d.length / 4)
}

async function jamfor() {
  const [k] = lasKonton()
  if (!k) throw new Error('kör skapa först')
  const cookie = (await sessionsCookie(k.epost)).map((c) => `${c.name}=${c.value}`).join('; ')
  const { ritaSidor } = await import('../src/lib/cv/mallar/sidbilder')
  const rapport: string[] = ['| Mall | Längd | Sidor i filen | Sidor i helskärmen | Största avvikelse per sida | Sida 1 slutar i filen med |', '|---|---|---|---|---|---|']
  for (const mall of MALLAR) {
    // Tre längder, plus det normala CV:t med Få plats på en sida (stegen i mallar/pdf.ts).
    const fall: [string, (typeof CV_LANGDER)[keyof typeof CV_LANGDER], Record<string, boolean>][] = [
      ...Object.entries(CV_LANGDER).map(([l, c]) => [l, c, { foto: true }] as [string, (typeof CV_LANGDER)[keyof typeof CV_LANGDER], Record<string, boolean>]),
      ['ensida', CV_LANGDER.normalt, { foto: true, enSida: true }],
    ]
    for (const [langd, cv, val] of fall) {
      const kropp = { template: mall, structuredData: cv, val }
      const pdfSvar = await fetch(`${BAS}/api/cv/generate-formatted`, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ ...kropp, format: 'pdf' }) })
      const sidSvar = await fetch(`${BAS}/api/cv/sidor`, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(kropp) })
      if (!pdfSvar.ok || !sidSvar.ok) {
        kontroll(false, `${mall} ${langd}: svar ${pdfSvar.status} / ${sidSvar.status}`)
        continue
      }
      const pdf = Buffer.from(await pdfSvar.arrayBuffer())
      fs.writeFileSync(path.join(UT, `${mall}-${langd}.pdf`), pdf)
      const sidor = (await sidSvar.json()) as { sidor: number; bilder: string[] }
      const filensBilder = (await ritaSidor(pdf)).bilder
      const g = await lasPdfGeometri(pdf)
      const avv: number[] = []
      for (let i = 0; i < Math.max(filensBilder.length, sidor.bilder.length); i++) {
        const a = filensBilder[i]
        const b = sidor.bilder[i]
        if (!a || !b) {
          avv.push(1)
          continue
        }
        const ba = Buffer.from(a.split(',')[1], 'base64')
        const bb = Buffer.from(b.split(',')[1], 'base64')
        fs.writeFileSync(path.join(UT, `${mall}-${langd}-fil-${i + 1}.webp`), ba)
        fs.writeFileSync(path.join(UT, `${mall}-${langd}-helskarm-${i + 1}.webp`), bb)
        avv.push(await avvikelse(ba, bb))
      }
      // Sida 1:s sista rad i varje spalt (x över eller under sidans mitt).
      const s1 = g.rader.filter((r) => r.sida === 1)
      const sist = (f: (x: number) => boolean) => {
        const r = s1.filter((x) => f(x.x)).sort((a, b) => b.y - a.y)[0]
        return r ? norm(r.text).slice(0, 38) : '-'
      }
      const slut = g.sidor > 1 ? `"${sist((x) => x < 200)}" / "${sist((x) => x >= 200)}"` : 'en sida'
      const maxAvv = Math.max(...avv)
      kontroll(g.sidor === sidor.sidor && sidor.bilder.length === g.sidor && maxAvv < 0.01, `${mall} ${langd}: filen ${g.sidor} sidor, helskärmen ${sidor.sidor} (${sidor.bilder.length} ark), avvikelse ${avv.map((a) => (a * 100).toFixed(2) + ' %').join(', ')}`)
      rapport.push(`| ${mall} | ${langd} | ${g.sidor} | ${sidor.bilder.length} | ${(maxAvv * 100).toFixed(2)} % | ${slut} |`)
    }
  }
  fs.writeFileSync(path.join(UT, 'jamforelse.md'), rapport.join('\n') + '\n')
  console.log(rapport.join('\n'))
}

/* ------------------------------------------------------------------ klicka */

const VYER = {
  pixel7: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  dator: { width: 1280, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
} as const
type Vy = keyof typeof VYER

async function nySida(browser: Browser, vy: Vy, tema: 'ljus' | 'mork') {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const fel: string[] = []
  page.on('pageerror', (e) => fel.push('js: ' + String(e).slice(0, 200)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && ![402, 404].includes(r.status()) && u.startsWith(BAS)) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  await page.setViewport(VYER[vy])
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema === 'mork' ? 'dark' : 'light' }])
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  return { page, ctx, fel }
}

let ipNr = 10
const nyIp = () => `10.78.${Math.floor(Date.now() / 1000) % 250}.${ipNr++ % 250}`

/** Öppnar helskärmen och kontrollerar arken. Returnerar antalet ark. */
async function helskarm(page: Page, steg: string, forvantat?: number): Promise<number> {
  // Zoomknappen i arkets hörn (samma helskärm som trycket på arket, utan risk att träffa en rubrik).
  await page.waitForSelector('.dok-ark-yta button.top-2[aria-label="Läs i helskärm"]', { timeout: 60000, visible: true })
  await page.evaluate(() => {
    const b = document.querySelector<HTMLButtonElement>('.dok-ark-yta button.top-2[aria-label="Läs i helskärm"]')!
    b.scrollIntoView({ block: 'center' })
    b.click()
  })
  await page.waitForSelector('[role=dialog] [role=status], [role=dialog] ol[data-sidor] img', { timeout: 20000 })
  await bild(page, `${steg}-a-oppnad`)
  const fore = await page.evaluate(() => {
    const el = document.querySelector('[role=dialog] [data-stycke], [role=dialog] ol[data-sidor] li > div')
    return el ? Math.round(el.getBoundingClientRect().top) : null
  })
  await page.waitForSelector('[role=dialog] ol[data-sidor] img', { timeout: 120000 })
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('[role=dialog] ol[data-sidor] img')].every((i) => i.complete && i.naturalWidth > 0), { timeout: 30000 })
  await vila(400)
  const efter = await page.evaluate(() => Math.round(document.querySelector('[role=dialog] ol[data-sidor] li > div')!.getBoundingClientRect().top))
  kontroll(fore === efter, `${steg}: arket står stilla när sidorna kommer (överkant ${fore} och ${efter} px)`)
  const m = await page.evaluate(() => {
    const ol = document.querySelector('[role=dialog] ol[data-sidor]')!
    const ark = [...ol.querySelectorAll<HTMLElement>('li > div')].map((d) => d.getBoundingClientRect())
    const etiketter = [...ol.querySelectorAll<HTMLElement>('li > p')].map((p) => p.innerText.trim())
    const yta = document.querySelector<HTMLElement>('[role=dialog] .overflow-auto')!
    const glipor = ark.slice(1).map((r, i) => Math.round(r.top - ark[i].bottom))
    return {
      sidor: Number(ol.getAttribute('data-sidor')),
      ark: ark.length,
      bredd: Math.round(ark[0]?.width ?? 0),
      kvot: ark[0] ? ark[0].height / ark[0].width : 0,
      glipor,
      etiketter,
      sidled: yta.scrollWidth - yta.clientWidth,
      vy: window.innerWidth,
    }
  })
  await bild(page, `${steg}-b-sidor`)
  // Rulla till sista arket.
  await page.evaluate(() => {
    const y = document.querySelector<HTMLElement>('[role=dialog] .overflow-auto')!
    y.scrollTop = y.scrollHeight
  })
  await vila(300)
  await bild(page, `${steg}-c-sista`)
  kontroll(m.ark === m.sidor && (forvantat === undefined || m.sidor === forvantat), `${steg}: ${m.ark} ark för ${m.sidor} sidor${forvantat !== undefined ? ` (filen ${forvantat})` : ''}`)
  kontroll(Math.abs(m.kvot - 297 / 210) < 0.01, `${steg}: arken i A4 (höjd/bredd ${m.kvot.toFixed(3)})`)
  // Glipan är ark, etikett, ark: 12 px gap plus etikettraden; etiketten ligger 6 px under arket.
  kontroll(m.etiketter.every((t, i) => t === `Sida ${i + 1} av ${m.sidor}`), `${steg}: sidnummer under varje ark (${m.etiketter.join(', ')})`)
  kontroll(m.glipor.every((g) => g >= 30 && g <= 44), `${steg}: arken åtskilda (avstånd ark till ark ${m.glipor.join(', ') || 'ett ark'} px: 6 px, etiketten, 12 px glipa)`)
  kontroll(m.sidled <= 0, `${steg}: ingen sidled i helskärmen (${m.sidled})`)
  // Mobil: högst 794 med 12 px marginal. Dator (2026-11-16): så hög att sidan ryms i höjd, 540 till 1200.
  kontroll(m.vy < 900 ? m.bredd <= Math.min(794, m.vy - 24) + 1 : m.bredd >= 539 && m.bredd <= 1201, `${steg}: arket ${m.bredd} px brett`)
  // Zoomen och tillbaka.
  await page.click('[role=dialog] button[aria-label="Zooma"]')
  await vila(500)
  const zoomad = await page.evaluate(() => Math.round(document.querySelector('[role=dialog] ol[data-sidor] li > div')!.getBoundingClientRect().width))
  kontroll(zoomad > m.bredd * 1.7, `${steg}: zoomen gör arket ${zoomad} px brett`)
  await page.click('[role=dialog] button[aria-label="Zooma"]')
  await page.keyboard.press('Escape')
  await vila(400)
  kontroll(!(await page.$('[role=dialog]')), `${steg}: Escape stänger helskärmen`)
  return m.ark
}

async function bild(page: Page, namn: string) {
  await page.screenshot({ path: path.join(UT, `${namn}.png`) as `${string}.png` })
}

/** Ett långt CV som PDF att ladda upp, skrivet av Chrome ur mallens HTML. */
async function langPdf(browser: Browser): Promise<string> {
  const fil = path.join(UT, 'Marta-langt-CV.pdf')
  if (fs.existsSync(fil)) return fil
  const { renderaMallHtml } = await import('../src/lib/cv/rendera-mall-html')
  const p = await browser.newPage()
  await p.setContent(renderaMallHtml(CV_LANGDER.langt, 'linne')!.replace(/url\(\/fonts/g, `url(${BAS}/fonts`), { waitUntil: 'networkidle0' })
  await p.pdf({ path: fil, format: 'A4', printBackground: true })
  await p.close()
  return fil
}

async function utloggad(browser: Browser, vy: Vy, tema: 'ljus' | 'mork') {
  const steg = `utloggad-${vy}-${tema}`
  const { page, ctx, fel } = await nySida(browser, vy, tema)
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': nyIp() })
  await page.goto(`${BAS}/cv-mallar`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(1500)
  await helskarm(page, `${steg}-1-mallsida-exempel`)
  // Uppladdat långt CV: besökarens eget, flera sidor.
  const input = await page.$('#ladda-upp input[type=file]')
  await input!.uploadFile(await langPdf(browser))
  await page.waitForFunction(() => document.body.innerText.includes('Vi hittade'), { timeout: 120000 }).catch(() => undefined)
  await vila(3000)
  const n = await helskarm(page, `${steg}-2-mallsida-eget`)
  kontroll(n >= 2, `${steg}: det uppladdade långa CV:t ger ${n} ark`)
  // Provsidan i en tvåspaltig mall.
  await page.goto(`${BAS}/cv-mallar/prova?mall=stal`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(1500)
  await helskarm(page, `${steg}-3-provsida-stal`)
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function inloggad(browser: Browser, k: Konto, vy: Vy, tema: 'ljus' | 'mork') {
  const steg = `inloggad-${vy}-${tema}`
  const { page, ctx, fel } = await nySida(browser, vy, tema)
  for (const c of await sessionsCookie(k.epost)) await page.setCookie({ ...c, url: BAS, path: '/' })
  // Fotomall med sidospalt: arken mot filen ur samma konto.
  await page.goto(`${BAS}/dashboard/cv-mallar?mall=kalksten`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(2500)
  const cookie = (await page.cookies()).map((c) => `${c.name}=${c.value}`).join('; ')
  const pdf = await fetch(`${BAS}/api/cv/generate-formatted`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ template: 'kalksten', cvId: k.cvId, structuredData: CV_LANGDER.langt, format: 'pdf', val: {} }),
  })
  const filSidor = pdf.ok ? (await lasPdfGeometri(Buffer.from(await pdf.arrayBuffer()))).sidor : undefined
  await helskarm(page, `${steg}-1-mina-mallar-kalksten`, filSidor)
  // Byggarens steg 7 med det långa CV:t som utkast.
  const utkast = { data: CV_LANGDER.langt, timestamp: Date.now(), expiresAt: Date.now() + 86400000 }
  await page.evaluate((u) => localStorage.setItem('jobbcoach_cv_draft', JSON.stringify(u)), utkast)
  await page.goto(`${BAS}/dashboard/skapa-cv?steg=7`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(1500)
  await page.evaluate(() => (document.querySelector('section[aria-label="Påbörjat utkast"] button') as HTMLButtonElement | null)?.click())
  await vila(4000)
  const n = await helskarm(page, `${steg}-2-byggaren`)
  kontroll(n >= 2, `${steg}: byggarens långa CV ger ${n} ark`)
  await page.evaluate(() => localStorage.removeItem('jobbcoach_cv_draft'))
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function klicka() {
  const [k] = lasKonton()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] })
  try {
    for (const vy of ['pixel7', 'dator'] as Vy[]) {
      for (const tema of ['ljus', 'mork'] as const) {
        await utloggad(browser, vy, tema).catch((e) => kontroll(false, `utloggad-${vy}-${tema}: ${(e as Error).message}`))
        if (k) await inloggad(browser, k, vy, tema).catch((e) => kontroll(false, `inloggad-${vy}-${tema}: ${(e as Error).message}`))
      }
    }
  } finally {
    await browser.close()
  }
}

async function main() {
  const lage = process.argv[2]
  if (lage === 'skapa') await skapa()
  else if (lage === 'radera') await radera()
  else if (lage === 'jamfor') await jamfor()
  else if (lage === 'klicka') await klicka()
  else return console.log('skapa | jamfor | klicka | radera --ut <mapp>')
  if (resultat.length) {
    const fel = resultat.filter((r) => r.startsWith('FEL')).length
    fs.writeFileSync(path.join(UT, `resultat-${lage}.txt`), resultat.join('\n') + `\n\n${resultat.length - fel} av ${resultat.length} OK\n`)
    console.log(`\n${resultat.length - fel} av ${resultat.length} OK`)
    process.exitCode = fel ? 1 : 0
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
