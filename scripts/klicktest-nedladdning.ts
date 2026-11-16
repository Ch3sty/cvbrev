/**
 * Klicktestet för beslut 0 (docs/plan-mallar-2026-11-15.md avsnitt 0):
 * nedladdning utan profiles.email_verified_at, i riktig Chrome.
 *
 *   npx tsx scripts/klicktest-nedladdning.ts skapa  --ut <mapp>
 *   npx tsx scripts/klicktest-nedladdning.ts klicka --ut <mapp> [--bas URL]
 *   npx tsx scripts/klicktest-nedladdning.ts radera --ut <mapp>
 *
 * Tre konton, alla UTAN email_verified_at, som 133 av 155 nya konton:
 *   epost   gratis, skapat med e-post och lösenord
 *   google  gratis, skapat som Google-konto (app_metadata.provider google)
 *   premium betalande (premium_grants-liknande fält på profilen)
 * Varje konto har ett CV (Erik Lindberg). Adresserna är unika per körning och
 * raderingen går bara på id:n som skriptet själv skapat (konton.json).
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Page } from 'puppeteer-core'
import { NORMALT_CV } from '../src/lib/cv/word/__tests__/fixtures'

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
const UT = path.resolve(arg('ut', 'qa-nedladdning')!)
const BAS = arg('bas', 'http://localhost:8310')!
fs.mkdirSync(UT, { recursive: true })
const KONTOFIL = path.join(UT, 'konton.json')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type Roll = 'epost' | 'google' | 'premium'
interface Konto { roll: Roll; epost: string; id: string; cvId: string }

async function skapa() {
  const tid = Date.now()
  const konton: Konto[] = []
  for (const roll of ['epost', 'google', 'premium'] as Roll[]) {
    const epost = `qa-nedladdning-${roll}-${tid}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email: epost,
      password: `QaNedladdning!${tid}`,
      email_confirm: true,
      user_metadata: { full_name: 'Erik Lindberg' },
      app_metadata: roll === 'google' ? { provider: 'google', providers: ['google'] } : undefined,
    })
    if (error || !data.user) throw new Error(`createUser ${roll}: ${error?.message}`)
    const id = data.user.id
    const premium = roll === 'premium'
    const { error: pe } = await sb
      .from('profiles')
      .update({
        full_name: 'Erik Lindberg',
        email_verified_at: null,
        onboarding_track: 'cv',
        free_cv_exports_used: 0,
        subscription_tier: premium ? 'premium' : 'free',
        premium_scope: premium ? 'allt' : null,
        premium_until: premium ? new Date(Date.now() + 3 * 86400000).toISOString() : null,
      })
      .eq('id', id)
    if (pe) throw new Error(`profiles ${roll}: ${pe.message}`)
    const { data: cv, error: ce } = await sb
      .from('cv_texts')
      .insert({
        user_id: id,
        file_name: 'Erik Lindberg.pdf',
        original_file_path: '',
        cv_text: `${NORMALT_CV.personalInfo.fullName}\n${NORMALT_CV.summary}`,
        structured_data: NORMALT_CV,
      })
      .select('id')
      .single()
    if (ce || !cv) throw new Error(`cv_texts ${roll}: ${ce?.message}`)
    konton.push({ roll, epost, id, cvId: cv.id })
    console.log('SKAPAD', roll, epost, id)
  }
  fs.writeFileSync(KONTOFIL, JSON.stringify(konton, null, 2))
}

async function radera() {
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) as Konto[]
  const ids = konton.map((k) => k.id)
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
  // Magiclänken sätter inte profiles.email_verified_at, men kontrollera ändå.
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

const VYER = [
  { namn: 'pixel7', viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
  { namn: 'desktop', viewport: { width: 1280, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false } },
] as const

const resultat: string[] = []
const kontroll = (ok: boolean, text: string) => {
  resultat.push(`${ok ? 'OK  ' : 'FEL '} ${text}`)
  console.log(`${ok ? 'OK  ' : 'FEL '} ${text}`)
}
const vila = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function klickaKnapp(page: Page, borjar: string) {
  const ok = await page.evaluate((t) => {
    const el = [...document.querySelectorAll<HTMLButtonElement>('button')].find((e) => e.innerText.trim().startsWith(t) && !e.disabled)
    if (!el) return false
    el.scrollIntoView({ block: 'center' })
    el.click()
    return true
  }, borjar)
  if (!ok) throw new Error(`hittade ingen knapp "${borjar}"`)
}
async function vantaFil(mapp: string, slut: string, ms = 60000) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    const f = fs.readdirSync(mapp).find((x) => x.endsWith(slut))
    if (f) return path.join(mapp, f)
    await vila(500)
  }
  return null
}

async function klicka() {
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) as Konto[]
  // Kontrollera först att kontona verkligen saknar kolumnen.
  const { data: prof } = await sb.from('profiles').select('id, email_verified_at').in('id', konton.map((k) => k.id))
  kontroll((prof ?? []).every((p) => p.email_verified_at === null), `alla tre kontona saknar email_verified_at (${(prof ?? []).length})`)

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox'],
  })
  try {
    for (const k of konton) {
      // Gratiskontona: Pixel 7 laddar ner första PDF:en, desktop möter sedan
      // betalväggen. Premium: båda vyerna laddar ner.
      for (const v of VYER) {
        const steg = `${k.roll}-${v.namn}`
        const ctx = await browser.createBrowserContext()
        const page = await ctx.newPage()
        const fel: string[] = []
        page.on('console', (m) => {
          if (m.type() === 'error' && !/favicon|posthog|ERR_BLOCKED|402/i.test(m.text())) fel.push('konsol: ' + m.text().slice(0, 160))
        })
        page.on('response', (r) => {
          const u = r.url()
          if (r.status() >= 400 && r.status() !== 402 && u.startsWith(BAS) && !u.includes('/_vercel') && !u.includes('/monitoring')) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
        })
        await page.setViewport(v.viewport)
        const nedMapp = path.join(UT, `ned-${steg}`)
        fs.mkdirSync(nedMapp, { recursive: true })
        const bcdp = await browser.target().createCDPSession()
        await bcdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: nedMapp, browserContextId: (ctx as unknown as { id: string }).id })
        for (const c of await sessionsCookie(k.epost)) await page.setCookie({ ...c, url: BAS, path: '/' })
        await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
        await page.goto(`${BAS}/dashboard/cv-mallar`, { waitUntil: 'networkidle2', timeout: 90000 })
        await vila(1500)
        kontroll(page.url().includes('/dashboard/cv-mallar'), `${steg}: sidan öppnas`)

        const forsta = k.roll === 'premium' || v.namn === 'pixel7'
        if (forsta) {
          await klickaKnapp(page, 'Ladda ner som PDF')
          const pdf = await vantaFil(nedMapp, '.pdf', 90000)
          const ok = Boolean(pdf) && fs.readFileSync(pdf!).subarray(0, 4).toString() === '%PDF'
          kontroll(ok, `${steg}: PDF laddas ner utan bekräftad e-post (${pdf ? path.basename(pdf) : 'ingen fil'})`)
          const body = await page.evaluate(() => document.body.innerText)
          kontroll(!/email_not_verified|e-post för att ladda ner/i.test(body), `${steg}: ingen e-postspärr på nedladdningen (bannern om permanent lagring får stå)`)
          if (!ok) await page.screenshot({ path: path.join(UT, `${steg}-fel.png`) as `${string}.png` })
        } else {
          // Andra försöket för gratiskontot: betalväggen, aldrig ett fel.
          await vila(500)
          const body = await page.evaluate(() => document.body.innerText)
          kontroll(/Din gratisnedladdning är använd/.test(body), `${steg}: andra gången visas att gratisnedladdningen är använd`)
          kontroll(!/email_not_verified|Kunde inte generera/i.test(body), `${steg}: ingen rå felkod`)
          const { data: p } = await sb.from('profiles').select('free_cv_exports_used').eq('id', k.id).single()
          kontroll(p?.free_cv_exports_used === 1, `${steg}: gratisräknaren står på 1 efter första filen (${p?.free_cv_exports_used})`)
          const status = await page.evaluate(async (cv) => {
            const r = await fetch('/api/cv/generate-formatted', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ template: 'norrsken', structuredData: cv, format: 'pdf' }),
            })
            return r.status
          }, NORMALT_CV as unknown as Record<string, unknown>)
          kontroll(status === 402, `${steg}: andra PDF:en spärras med 402 (${status})`)
        }

        if (k.roll === 'premium') {
          // Word i en Word-mall och brevet, via samma rutter som knapparna.
          const svar = await page.evaluate(async (cv) => {
            const w = await fetch('/api/cv/generate-formatted', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ template: 'tidlos-formell', structuredData: cv, format: 'docx' }),
            })
            const b = await fetch('/api/letters/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: 'Hej!\n\nJag söker tjänsten som projektledare.\n\nVänliga hälsningar\nErik', format: 'pdf', title: 'Projektledare', company: 'Exempelbolaget' }),
            })
            const bw = await fetch('/api/letters/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: 'Hej!\n\nJag söker tjänsten.\n\nErik', format: 'docx', title: 'Projektledare' }),
            })
            return [w.status, w.headers.get('content-type'), b.status, b.headers.get('content-type'), bw.status]
          }, NORMALT_CV as unknown as Record<string, unknown>)
          kontroll(svar[0] === 200 && String(svar[1]).includes('wordprocessingml'), `${steg}: Word-CV 200 (${svar[0]})`)
          kontroll(svar[2] === 200 && String(svar[3]).includes('pdf'), `${steg}: brev som PDF 200 (${svar[2]})`)
          kontroll(svar[4] === 200, `${steg}: brev som Word 200 (${svar[4]})`)
        }

        kontroll(fel.length === 0, `${steg}: inga konsolfel eller 4xx/5xx${fel.length ? ': ' + fel.slice(0, 4).join(' | ') : ''}`)
        await ctx.close()
      }
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.txt'), resultat.join('\n'))
  }
}

const cmd = process.argv[2]
;(cmd === 'skapa' ? skapa() : cmd === 'radera' ? radera() : cmd === 'klicka' ? klicka() : Promise.reject(new Error('skapa | klicka | radera'))).catch((e) => {
  console.error(e)
  process.exit(1)
})
