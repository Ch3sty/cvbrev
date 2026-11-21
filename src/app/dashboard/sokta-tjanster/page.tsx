/**
 * Sökta tjänster (Jobbsöket omgång 1, etapp 2B). Serverkomponent: sessionen,
 * tjänsterna, Ska sökas, veckans mål, statistiken och rapporten läses i ett
 * varv av hamtaSoktaTjanster och skickas ner färdiga. Vy och filter står i
 * adressen (F8) och läses av vyn.
 *
 * Förifyllt ark från en träff: ?logga=1 (eller ?logga=ska-soka) med
 * tjanst, arbetsgivare, ort, lank, sista (YYYY-MM-DD), af (annons-id) och
 * matchning (0 till 100). Se docs/bygg-noter-jobbsoket-b.md.
 */
import { redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaSoktaTjanster } from '@/lib/jobbsok/server'
import { tolkaSoktaAdress } from '@/lib/jobbsok'
import SoktaVy from '@/components/jobb3/sokta/SoktaVy'
import type { LoggaForifyllt } from '@/components/jobb3/sokta/LoggaArk'

type Sok = Record<string, string | string[] | undefined>

function text(v: string | string[] | undefined, max: number): string | undefined {
  const s = Array.isArray(v) ? v[0] : v
  const t = s?.trim()
  return t ? t.slice(0, max) : undefined
}

function forifylltUr(p: Sok): LoggaForifyllt | null {
  const job_title = text(p.tjanst, 200)
  const company = text(p.arbetsgivare, 200)
  if (!job_title && !company) return null
  const sista = text(p.sista, 10)
  const lank = text(p.lank, 2048)
  const match = Number(text(p.matchning, 3))
  return {
    job_title,
    company,
    location: text(p.ort, 200) ?? null,
    job_ad_url: lank && /^https?:\/\//.test(lank) ? lank : null,
    last_application_date: sista && /^\d{4}-\d{2}-\d{2}$/.test(sista) ? sista : null,
    af_ad_id: text(p.af, 100) ?? null,
    match_score: Number.isFinite(match) && match >= 0 && match <= 100 ? Math.round(match) : null,
  }
}

export default async function SoktaTjansterPage({ searchParams }: { searchParams: Promise<Sok> }) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const p = await searchParams
  const adress = tolkaSoktaAdress(p)
  const data = await hamtaSoktaTjanster(user.id, { manad: adress.manad })

  return <SoktaVy data={data} forifyllt={forifylltUr(p)} />
}
