/**
 * Klicktest våg 4 (spec-publikt-v2 del A avsnitt 9): /verktyg/personligt-brev,
 * /verktyg/jobbmatchning och /funktioner, plus brevspärren (avsnitt 7) och
 * rättelserna på startsidan. Körs via scripts/klicktest-publikt-v2.ts --vag 4.
 *
 * Brevspärren prövas med ett eget testkonto vars brevfönster sätts till
 * ett skrivet brev för två dygn sedan: generate och generate-preview ska
 * svara 429 med datumet sju dygn efter fönstrets start, aldrig "dagens" eller
 * "i morgon". Kontot raderas efteråt med sitt id. Ingen AI anropas: spärren
 * ligger före all generering.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Page } from 'puppeteer-core'
import { laddaEnv } from './_env'
import type { KlickVerktyg } from './klicktest-publikt-v2'

laddaEnv()

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DYGN = 24 * 60 * 60 * 1000

async function skapaKonto(fonsterStart: Date) {
  const ts = Date.now()
  const email = `qa-publikt-v2-brev-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaPubliktV2!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'QA Brevspärr', password_set: true },
  })
  if (error || !data.user) throw new Error('skapa: ' + error?.message)
  const id = data.user.id
  await new Promise((r) => setTimeout(r, 800))
  const { error: pErr } = await sb.from('profiles').upsert({
    id,
    email,
    full_name: 'QA Brevspärr',
    email_verified_at: new Date().toISOString(),
    onboarding_track: 'allt',
    onboarding_track_asked_at: new Date().toISOString(),
    weekly_letter_count: 1,
    weekly_letter_first_used_at: fonsterStart.toISOString(),
  })
  if (pErr) throw new Error('profil: ' + pErr.message)
  console.log('skapade', email, id)
  return { email, id }
}

const TABELLER = ['user_activities', 'onboarding_progress', 'scheduled_emails', 'email_schedule', 'email_log', 'user_ui_flags', 'notifications', 'premium_grants', 'daily_usage', 'quota_walls', 'betalvagg_visad']

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
}

export async function kor(v: KlickVerktyg) {
  const { b, ENHETER, LAGEN, ny, steg, ga, klicka, BAS } = v
  const UT = 'docs/qa/publikt-v2/vag4'

  for (const e of ENHETER) {
    for (const lage of LAGEN) {
      const p = await ny(b, e, lage)

      // Brevsidan
      await steg(p, e, lage, 'brev-helsida', async () => ((await ga(p, '/verktyg/personligt-brev')) === 200 ? null : 'status'), true)
      await steg(p, e, lage, 'brev-hjalte-knapp', async () => {
        await ga(p, '/verktyg/personligt-brev')
        const ut = await klicka(p, 'main [data-primar]')
        return ut.startsWith('/register?borja=brev') ? null : `hamnade på ${ut}`
      })
      await steg(p, e, lage, 'brev-skriv-nu', async () => {
        await ga(p, '/verktyg/personligt-brev')
        const ut = await klicka(p, '#prova a.pub-knapp')
        return ut.startsWith('/skapa-brev/start') ? null : `hamnade på ${ut}`
      })
      await steg(p, e, lage, 'brev-mallar', async () => {
        await ga(p, '/verktyg/personligt-brev')
        await p.$eval('#mallar', (el) => el.scrollIntoView({ block: 'start' }))
        await new Promise((r) => setTimeout(r, 400))
        const n = await p.$$eval('#mallar .pub-mall h3', (l) => l.length)
        return n === 7 ? null : `${n} mallrubriker`
      })
      await steg(p, e, lage, 'brev-brodsmula', async () => {
        await ga(p, '/verktyg/personligt-brev')
        const t = await p.$eval('nav[aria-label="Breadcrumb"]', (el) => el.textContent ?? '')
        return t.includes('·') ? 'mittpunkt i brödsmulan' : null
      })

      // Matchningen
      await steg(p, e, lage, 'matchning-helsida', async () => ((await ga(p, '/verktyg/jobbmatchning')) === 200 ? null : 'status'), true)
      await steg(p, e, lage, 'matchning-hjalte-knapp', async () => {
        await ga(p, '/verktyg/jobbmatchning')
        const ut = await klicka(p, 'main [data-primar]')
        return ut.startsWith('/register?borja=jobb') ? null : `hamnade på ${ut}`
      })

      // /funktioner: ankarna och Så fungerar det
      await steg(p, e, lage, 'funktioner-helsida', async () => ((await ga(p, '/funktioner')) === 200 ? null : 'status'), true)
      await steg(p, e, lage, 'funktioner-ankare', async () => {
        await ga(p, '/funktioner')
        const fel: string[] = []
        for (const id of ['tester', 'brev', 'cv-analys', 'cv-skapa-mallar', 'jobbmatchning', 'jobbcoachen', 'linkedin']) {
          await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
          await p.click(`nav[aria-label="Funktionerna på sidan"] a[href="#${id}"]`)
          // Sidan scrollar mjukt: vänta tills läget stått still i 300 ms.
          let forra = -1
          for (let i = 0; i < 40; i++) {
            await new Promise((r) => setTimeout(r, 150))
            const y = await p.evaluate(() => window.scrollY)
            if (y === forra) break
            forra = y
          }
          const topp = await p.$eval(`#${id}`, (el) => el.getBoundingClientRect().top)
          if (Math.abs(topp) > 140) fel.push(`${id} ${Math.round(topp)}`)
        }
        return fel.length ? `ankare utanför: ${fel.join(', ')}` : null
      })
      for (const [id, mal] of [
        ['tester', '/verktyg/rekryteringstester'],
        ['brev', '/verktyg/personligt-brev'],
        ['cv-analys', '/verktyg/cv-analys'],
        ['linkedin', '/verktyg/linkedin-optimering'],
      ] as const) {
        await steg(p, e, lage, `funktioner-${id}`, async () => {
          await ga(p, '/funktioner')
          const ut = await klicka(p, `#${id} a.pub-knapp`)
          return ut.startsWith(mal) ? null : `hamnade på ${ut}`
        })
      }
      await steg(p, e, lage, 'funktioner-faq', async () => {
        await ga(p, '/funktioner')
        const sel = '#fragor details:nth-of-type(2) summary'
        await p.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }))
        await p.click(sel)
        return (await p.$eval('#fragor details:nth-of-type(2)', (d) => (d as HTMLDetailsElement).open)) ? null : 'öppnades inte'
      })

      // Startsidans rättelse: Sökta tjänster pekar på /funktioner
      await steg(p, e, lage, 'start-sokta-tjanster', async () => {
        await ga(p, '/')
        const ut = await klicka(p, 'main a[href="/funktioner#sokta-tjanster"]')
        return ut.startsWith('/funktioner') ? null : `hamnade på ${ut}`
      })

      await p.close()
    }
  }

  // 360 px: hjältens knapp inom 640 px
  const e360 = { namn: 'mobil360', bredd: 360, hojd: 800, dpr: 1, mobil: true }
  for (const lage of LAGEN) {
    for (const sida of ['/verktyg/personligt-brev', '/verktyg/jobbmatchning', '/funktioner']) {
      const p = await ny(b, e360, lage)
      await steg(p, e360, lage, `knapp-640-${sida.split('/').pop()}`, async () => {
        await ga(p, sida)
        const k = await p.$eval('main [data-primar]', (el) => el.getBoundingClientRect().bottom)
        return k <= 640 ? null : `knappen slutar på ${Math.round(k)} px`
      })
      await p.close()
    }
  }

  // Brevspärren: ett brev skrivet för två dygn sedan, nästa om fem dygn
  const fonster = new Date(Date.now() - 2 * DYGN)
  const vantat = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(
    new Date(fonster.getTime() + 7 * DYGN)
  )
  const konto = await skapaKonto(fonster)
  try {
    const e = ENHETER[1]
    const p = await ny(b, e, 'ljus')
    await loggaIn(p, BAS, konto.email)
    for (const rutt of ['/api/letters/generate', '/api/letters/generate-preview']) {
      await steg(p, e, 'ljus', `brevsparr-${rutt.split('/').pop()}`, async () => {
        await ga(p, '/dashboard')
        const svar = await p.evaluate(async (r) => {
          const res = await fetch(r, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cv_id: 'x', job_description: 'x' }) })
          return { status: res.status, body: await res.text() }
        }, rutt)
        await p.evaluate((t) => {
          document.body.innerHTML = `<pre style="white-space:pre-wrap;font:16px system-ui;padding:24px">${t.replace(/</g, '&lt;')}</pre>`
        }, `${rutt}\n${svar.status}\n${svar.body}`)
        if (svar.status !== 429) return `status ${svar.status}`
        if (/dagens|i morgon|midnatt/.test(svar.body)) return 'gammal text i spärren'
        return svar.body.includes(vantat) ? null : `datumet ${vantat} saknas: ${svar.body.slice(0, 200)}`
      })
    }
    await p.close()
  } finally {
    await raderaKonto(konto, UT)
  }
}
