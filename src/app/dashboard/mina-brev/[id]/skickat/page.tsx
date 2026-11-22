/**
 * Målgången: brevet är markerat som sökt. Serverkomponent.
 * Ett brev som inte är sökt skickas tillbaka till brevet.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { hamtaBrevProfil, hamtaSokta } from '@/lib/letters/server'
import { brevDataFranBrev } from '@/lib/letters/brevData'
import { brevKvot, formatGratisbrevDag } from '@/lib/letters/brevKvot'
import { renderBrevHtml } from '@/lib/letters/brevmall'
import { harAnnons } from '@/lib/letters/lage'
import { hamtaOppnaTraffar } from '@/lib/jobmatching/oppna.server'
import { dagFor, kortDag } from '@/lib/jobbsok/datum'
import type { Letter } from '@/store/letter-store'
import Malgang from '@/components/brev3/arbete/Malgang'

const TZ = 'Europe/Stockholm'
const JOBB_ATT_LASA = 10

/** Första dagen i innevarande månad, svensk tid, som ISO. */
function manadensBorjan(nu: Date): string {
  const [ar, man] = new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: '2-digit', timeZone: TZ }).format(nu).split('-')
  // Midnatt svensk tid är 22 eller 23 UTC dagen före; en timmes marginal åt rätt håll räcker för månadstalet.
  return new Date(`${ar}-${man}-01T00:00:00+01:00`).toISOString()
}

function rensa(t: unknown): string {
  return typeof t === 'string' ? t.trim().toLocaleLowerCase('sv-SE') : ''
}

interface Jobb {
  id?: string
  headline?: string
  employer?: { name?: string }
  workplace_address?: { municipality?: string | null }
  application_deadline?: string | null
  description?: { text?: string }
  webpage_url?: string | null
  application_details?: { url?: string | null }
}

export default async function SkickatSida({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  const supabase = createServerClient({ cookies: await cookies() })
  const nu = new Date()

  const [radRes, sokta, manadRes, brevRes, harBetalt, matchRes] = await Promise.all([
    supabase.from('letters').select('*').eq('id', id).eq('user_id', user.id).maybeSingle(),
    hamtaSokta(supabase, user.id),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('applied_at', manadensBorjan(nu)),
    supabase.from('letters').select('id, company, job_title').eq('user_id', user.id),
    userHasAccess(supabase, user.id, 'any'),
    // Sammanfattningen (högst 25 annonser), inte körningen: jobs->i i
    // job_matchings_cache packar upp hela kolumnen (upp till 3,7 MB) för att
    // ta ut tio annonser (rättningen efter slutkontrollen 2026-11-21).
    // Gratiskonton får bara de öppna träffarna, som i Matchade jobb.
    hamtaOppnaTraffar(supabase, user.id),
  ])
  const rad = (radRes.data ?? null) as Letter | null
  if (!rad) redirect('/dashboard/mina-brev')
  const sokt = sokta.get(id)
  if (!sokt) redirect(`/dashboard/mina-brev/${id}`)

  const { profil } = await hamtaBrevProfil(supabase, user.id, rad.cv_id ?? null)
  const data = brevDataFranBrev(rad, profil, { email: user.email ?? null })
  const html = rad.mall_id ? renderBrevHtml(rad.mall_id, data, { typsnitt: rad.font_id ?? null }) : rad.content || ''

  const soktDatum = new Date(sokt.applied_at ?? nu.toISOString())
  const soktDag = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'short', timeZone: TZ }).format(soktDatum).replace('.', '')
  const soktDagKort = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: TZ }).format(soktDatum).replace('.', '')
  const manad = new Intl.DateTimeFormat('sv-SE', { month: 'long', timeZone: TZ }).format(nu)

  const allaBrev = (brevRes.data ?? []) as Array<{ id: string; company: string | null; job_title: string | null }>
  const totalt = Math.min(7, Math.max(1, allaBrev.length))
  const skickade = Math.min(totalt, allaBrev.filter((b) => sokta.has(b.id)).length)

  // Kvoten: för gratis står dagen då nästa gratisbrev öppnar på kortet.
  const kvot = harBetalt ? null : brevKvot(profil, false, nu)
  const nastaGratis = kvot?.nastaGratisbrev ? formatGratisbrevDag(kvot.nastaGratisbrev) : null

  // Det bästa matchade jobbet som inget brev är skrivet till, bland dem
  // kontot får se (gratis: de tre öppna). Inget sådant: inget förslag.
  const match = matchRes
  const skrivna = new Set(allaBrev.map((b) => `${rensa(b.company)}|${rensa(b.job_title)}`))
  let jobb: React.ComponentProps<typeof Malgang>['jobb'] = null
  if (match) {
    const annonser = match.traffar
    for (let i = 0; i < JOBB_ATT_LASA && i < annonser.length; i++) {
      const j = (annonser[i]?.job ?? null) as Jobb | null
      if (!j?.headline) continue
      if (skrivna.has(`${rensa(j.employer?.name)}|${rensa(j.headline)}`)) continue
      // Arbetsförmedlingens tid saknar zon och är svensk lokal tid (dagFor).
      const sistaDag = dagFor(j.application_deadline ?? null)
      const sista = sistaDag ? kortDag(sistaDag) : null
      jobb = {
        cvId: match.cvId ?? rad.cv_id ?? '',
        titel: j.headline,
        foretag: j.employer?.name ?? '',
        ort: j.workplace_address?.municipality ?? null,
        annons: [j.headline, j.employer?.name, j.description?.text].filter(Boolean).join('\n\n'),
        url: j.application_details?.url ?? j.webpage_url ?? null,
        sistaDag: sista,
        nastaGratis,
      }
      break
    }
  }

  return (
    <Malgang
      html={html}
      soktDag={soktDag}
      soktDagKort={soktDagKort}
      foretag={rad.company}
      antalManad={manadRes.count ?? 1}
      manad={manad}
      pips={{ fyllda: skickade, totalt }}
      intervjuHref="/dashboard/intervju"
      jobb={jobb}
      nastaGratis={nastaGratis}
      utanAnnons={!harAnnons(rad)}
    />
  )
}
