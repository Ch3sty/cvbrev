/**
 * Klicktest våg 5 (spec-publikt-v2 del A avsnitt 9): de sju verktygssidorna
 * på verktygsmallen. Per sida: helsida, primär knapp, handlingen där den
 * finns, FAQ och brödsmula. Personlighetstestets 20 påståenden besvaras
 * utan konto en gång (desktop ljust); provets rad i anon_personality_samples
 * raderas efteråt med sin token (egen rad, aldrig tidsfönster).
 * Körs via scripts/klicktest-publikt-v2.ts --vag 5.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { laddaEnv } from './_env'
import type { KlickVerktyg } from './klicktest-publikt-v2'

laddaEnv()

const SIDOR: { slug: string; primar: string }[] = [
  { slug: 'cv-analys', primar: '#mini-analys' },
  { slug: 'skapa-cv', primar: '/register?borja=cv' },
  { slug: 'cv-mallar', primar: '/cv-mallar/start' },
  { slug: 'linkedin-optimering', primar: '/register' },
  { slug: 'bli-upptackt', primar: '/register' },
  { slug: 'jobbcoachen', primar: '/register' },
  { slug: 'personlighetstest', primar: '#provet' },
]

export async function kor(v: KlickVerktyg) {
  const { b, ENHETER, LAGEN, ny, steg, ga, klicka } = v
  const UT = 'docs/qa/publikt-v2/vag5'

  for (const e of ENHETER) {
    for (const lage of LAGEN) {
      const p = await ny(b, e, lage)
      for (const s of SIDOR) {
        const url = `/verktyg/${s.slug}`
        await steg(p, e, lage, `${s.slug}-helsida`, async () => ((await ga(p, url)) === 200 ? null : 'status'), true)
        await steg(p, e, lage, `${s.slug}-primar`, async () => {
          await ga(p, url)
          if (s.primar.startsWith('#')) {
            await p.click('main [data-primar]')
            await new Promise((r) => setTimeout(r, 1500))
            const topp = await p.$eval(s.primar, (el) => el.getBoundingClientRect().top)
            return Math.abs(topp) < 200 ? null : `${s.primar} hamnade ${Math.round(topp)} px från toppen`
          }
          const ut = await klicka(p, 'main [data-primar]')
          return ut.startsWith(s.primar) ? null : `hamnade på ${ut}`
        })
        await steg(p, e, lage, `${s.slug}-faq-brodsmula`, async () => {
          await ga(p, url)
          const smula = await p.$eval('nav[aria-label="Breadcrumb"]', (el) => el.textContent ?? '')
          if (smula.includes('·')) return 'mittpunkt i brödsmulan'
          const sel = '#fragor details:nth-of-type(2) summary'
          await p.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }))
          await p.click(sel)
          return (await p.$eval('#fragor details:nth-of-type(2)', (d) => (d as HTMLDetailsElement).open)) ? null : 'FAQ öppnades inte'
        })
      }
      await p.close()
    }
  }

  // Personlighetstestet: 20 påståenden utan konto, sedan profilen.
  const e = ENHETER[1]
  const p = await ny(b, e, 'ljus')
  let token: string | null = null
  p.on('request', (req) => {
    if (req.url().includes('/api/public/personlighetsprov') && req.method() === 'POST') {
      try {
        token = JSON.parse(req.postData() ?? '{}').token ?? null
      } catch {
        /* ingen token */
      }
    }
  })
  await steg(p, e, 'ljus', 'personlighetstest-provet', async () => {
    await ga(p, '/verktyg/personlighetstest')
    await p.$eval('#provet', (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
    for (let i = 0; i < 20; i++) {
      await p.waitForSelector('#provet [role="radio"]', { timeout: 10000 })
      const knappar = await p.$$('#provet [role="radio"]')
      await knappar[(i % 5)].click()
      await new Promise((r) => setTimeout(r, 450))
    }
    await p
      .waitForFunction(() => /Rekryteraren ser|rekryteraren|för många prov|Du har gjort/i.test(document.querySelector('#provet')?.textContent ?? ''), { timeout: 20000 })
      .catch(() => null)
    await p.$eval('#provet', (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
    const text = await p.$eval('#provet', (el) => el.textContent ?? '')
    if (/Rekryteraren ser någon/.test(text)) return null
    return `ingen profil: ${text.slice(0, 160)}`
  })
  await p.close()

  // Provets rad bort, med sin token.
  if (token) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { count } = await sb.from('anon_personality_samples').select('*', { count: 'exact', head: true }).eq('token', token)
    let raderade = 0
    if (count === 1) {
      const { error } = await sb.from('anon_personality_samples').delete().eq('token', token)
      raderade = error ? 0 : 1
    }
    console.log(`anon_personality_samples med token ${token}: ${count ?? 0} rad, ${raderade} raderad`)
    fs.writeFileSync(path.join(UT, 'radering.json'), JSON.stringify({ tabell: 'anon_personality_samples', token, rader: count ?? 0, raderade }, null, 2))
  }
}
