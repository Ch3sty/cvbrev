/**
 * Klicktest våg 3 (spec-publikt-v2 del A avsnitt 9): /priser.
 * Körs via scripts/klicktest-publikt-v2.ts --vag 3.
 *
 * Utloggad: köpknappen till /register?paket=all_month. Inloggad (eget
 * testkonto utan paket): köpknappen till köpsteget, stannar före betalning.
 * Tabellen läsbar på mobil utan sidledsscroll, Kom igång-listan komplett.
 *
 * Testkontot skapas här och raderas efteråt med sitt id (räknar före
 * delete, aldrig tidsfönster). Bara konton med prefixet qa-publikt-v2-.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Page } from 'puppeteer-core'
import { laddaEnv } from './_env'
import type { KlickVerktyg } from './klicktest-publikt-v2'
import { GUIDE } from '../src/components/pricing/paket-copy'

laddaEnv()

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const KOP_STEG = '/dashboard/valj-spar?paket=all_month&steg=kop'

async function skapaKonto() {
  const ts = Date.now()
  const email = `qa-publikt-v2-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaPubliktV2!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'QA Publikt', password_set: true },
  })
  if (error || !data.user) throw new Error('skapa: ' + error?.message)
  const id = data.user.id
  await new Promise((r) => setTimeout(r, 800))
  const { error: pErr } = await sb.from('profiles').upsert({
    id,
    email,
    full_name: 'QA Publikt',
    email_verified_at: new Date().toISOString(),
    onboarding_track: 'allt',
    onboarding_track_asked_at: new Date().toISOString(),
  })
  if (pErr) throw new Error('profil: ' + pErr.message)
  console.log('skapade', email, id)
  return { email, id }
}

const TABELLER = ['user_activities', 'onboarding_progress', 'scheduled_emails', 'email_schedule', 'email_log', 'user_ui_flags', 'notifications', 'premium_grants', 'daily_usage']

async function raderaKonto(k: { email: string; id: string }, ut: string) {
  if (!k.email.startsWith('qa-publikt-v2-') || !k.email.endsWith('@jobbcoach-qa.test')) throw new Error('inte ett eget QA-konto')
  const rapport: Record<string, number> = {}
  for (const t of TABELLER) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
    if (error || !count) continue
    const { error: dErr } = await sb.from(t).delete().eq('user_id', k.id)
    rapport[t] = count
    console.log(`  ${t}: ${count} rader ${dErr ? 'FEL ' + dErr.message : 'raderade'}`)
  }
  const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
  if (pc) await sb.from('profiles').delete().eq('id', k.id)
  const { error } = await sb.auth.admin.deleteUser(k.id)
  console.log(`raderade ${k.email} (profiles: ${pc ?? 0}) ${error ? error.message : 'ok'}`)
  fs.writeFileSync(path.join(ut, 'radering.json'), JSON.stringify({ email: k.email, id: k.id, rader: rapport, profiler: pc ?? 0 }, null, 2))
}

async function loggaIn(p: Page, bas: string, email: string) {
  const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
  const COOKIE = `sb-${projektRef}-auth-token`
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties!.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
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
  const CHUNK = 3200
  for (let i = 0, n = 0; i < payload.length; i += CHUNK, n++) {
    await p.setCookie({ name: payload.length <= CHUNK ? COOKIE : `${COOKIE}.${n}`, value: payload.slice(i, i + CHUNK), url: bas, path: '/' })
  }
  await p.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      localStorage.setItem('pwa_install_dismissed_at', String(Date.now()))
    } catch {}
  })
}

/** Klicka på en knapp (inte länk) och vänta in klientnavigeringen. */
async function klickaKnapp(p: Page, selektor: string, forvantat: string): Promise<string> {
  await p.waitForSelector(selektor, { timeout: 10000 })
  await p.$eval(selektor, (el) => (el as HTMLElement).scrollIntoView({ block: 'center' }))
  await p.click(selektor)
  const start = Date.now()
  while (Date.now() - start < 30000) {
    const u = new URL(p.url())
    const s = u.pathname + u.search
    if (s.startsWith(forvantat)) break
    await new Promise((r) => setTimeout(r, 250))
  }
  await new Promise((r) => setTimeout(r, 1500))
  const u = new URL(p.url())
  return u.pathname + u.search
}

export async function kor(v: KlickVerktyg) {
  const { b, ENHETER, LAGEN, ny, steg, ga, BAS } = v
  const UT = 'docs/qa/publikt-v2/vag3'

  for (const e of ENHETER) {
    for (const lage of LAGEN) {
      const p = await ny(b, e, lage)

      await steg(p, e, lage, 'priser-helsida', async () => ((await ga(p, '/priser')) === 200 ? null : 'status'), true)

      // Utloggad: köpknappen i hjälten till registreringen med Premium
      await steg(p, e, lage, 'priser-kop-utloggad', async () => {
        await ga(p, '/priser')
        const ut = await klickaKnapp(p, 'main [data-primar]', '/register')
        return ut.startsWith('/register?paket=all_month') ? null : `hamnade på ${ut}`
      })

      // Tabellen läsbar utan sidledsscroll
      await steg(p, e, lage, 'priser-tabell', async () => {
        await ga(p, '/priser')
        await p.$eval('#tabell', (el) => el.scrollIntoView({ block: 'start' }))
        await new Promise((r) => setTimeout(r, 400))
        const m = await p.$eval('.pub-tabell-ram', (el) => ({ sw: el.scrollWidth, cw: el.clientWidth }))
        return m.sw <= m.cw ? null : `tabellen scrollar i sidled (${m.sw} > ${m.cw})`
      })

      // Kom igång-listan komplett
      await steg(p, e, lage, 'priser-kom-igang', async () => {
        await ga(p, '/priser')
        await p.$eval('#guide', (el) => el.scrollIntoView({ block: 'start' }))
        await new Promise((r) => setTimeout(r, 400))
        const rader = await p.$$eval('#guide .pub-ki li', (l) => l.map((x) => (x.textContent ?? '').trim()))
        const saknas = GUIDE.listor.allt.steg.filter((s) => !rader.includes(s))
        return rader.length === GUIDE.listor.allt.steg.length && !saknas.length ? null : `${rader.length} steg, saknas ${saknas.join(', ')}`
      })

      // FAQ öppnas
      await steg(p, e, lage, 'priser-faq', async () => {
        await ga(p, '/priser')
        const sel = '#fragor details:nth-of-type(3) summary'
        await p.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }))
        await p.click(sel)
        const oppen = await p.$eval('#fragor details:nth-of-type(3)', (d) => (d as HTMLDetailsElement).open)
        return oppen ? null : 'details öppnades inte'
      })

      await p.close()
    }
  }

  // Inloggat testkonto utan paket: köpknappen till köpsteget, stanna före betalning
  const konto = await skapaKonto()
  try {
    for (const e of ENHETER) {
      const p = await ny(b, e, 'ljus')
      await loggaIn(p, BAS, konto.email)
      await steg(p, e, 'ljus', 'priser-kop-inloggad', async () => {
        await ga(p, '/priser')
        // Vänta tills AuthContext läst sessionen innan klicket.
        await new Promise((r) => setTimeout(r, 2500))
        const ut = await klickaKnapp(p, 'main [data-primar]', '/dashboard/valj-spar')
        return ut.startsWith(KOP_STEG) ? null : `hamnade på ${ut}`
      })
      await p.close()
    }
  } finally {
    await raderaKonto(konto, UT)
  }
}
