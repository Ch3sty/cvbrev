/**
 * Skriv brev (/dashboard/skapa-brev), en server component.
 *
 * Sessionen, CV-listan med låsen, behörigheten, profilen som avsändare och
 * kvoten läses här, i samma omgång som sidan renderas. Arket före
 * skrivandet (brevhuvudet i den mall brevet kommer att få) ritas också här,
 * så att första HTML:en redan visar det. Utan CV skickas man till
 * CV-sidan direkt, innan något ritas (förut gjordes det i klienten).
 *
 * ?cv=<id> från CV-rummet väljer CV:t brevet bygger på.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getActiveCvIds } from '@/lib/cv/cv-quota'
import { getCvGrans } from '@/lib/supabase/premiumAccess'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { BREVPROFIL_KOLUMNER } from '@/lib/letters/server'
import { brevDataFranBrev, titelUrStrukturerad, type BrevProfil } from '@/lib/letters/brevData'
import { brevKvot, brevKvotEfterSkrivning } from '@/lib/letters/brevKvot'
import { startmallForBrev } from '@/lib/letters/brevRegler'
import { renderBrevHtml } from '@/lib/letters/brevmall'
import SkrivBrev, { type SkrivCv } from '@/components/brev3/arbete/SkrivBrev'
import { tomtArk } from '@/components/brev3/arbete/arkHjalp'
import { SKRIV, TONER, type TonId } from '@/components/brev3/arbete/texter'

interface CvRad {
  id: string
  file_name: string | null
  created_at: string
  mall: string | null
  titel: string | null
}

export default async function SkrivBrevSida({ searchParams }: { searchParams: Promise<{ cv?: string }> }) {
  const { cv: cvParam } = await searchParams
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const supabase = createServerClient({ cookies: await cookies() })

  // Tre frågor parallellt. Inte select('*') på CV:na: cv_text är hela CV:ts
  // brödtext; mallen och titeln läses ur structured_data med JSON-sökväg.
  const [cvRes, grans, profilRes] = await Promise.all([
    supabase
      .from('cv_texts')
      .select('id, file_name, created_at, mall:structured_data->bygge->>mall, titel:structured_data->personalInfo->>title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    getCvGrans(supabase, user.id),
    supabase.from('profiles').select(`${BREVPROFIL_KOLUMNER}, preferred_tonality`).eq('id', user.id).maybeSingle(),
  ])

  const rader = ((cvRes.data ?? []) as unknown as CvRad[]).filter((r) => r && r.id)
  if (rader.length === 0) redirect('/dashboard/profil/cv?reason=cv-required')

  const harBetalt = grans.harBetalt
  // Gratis: de två senaste CV:na är aktiva, resten låsta (samma regel som förut).
  const aktiva = getActiveCvIds(
    rader.map((r) => ({ id: r.id, created_at: r.created_at })),
    grans.maxCvs
  )
  const cvs: SkrivCv[] = rader.map((r) => ({
    id: r.id,
    namn: (r.file_name ?? 'CV').replace(/\.[^.]+$/, ''),
    datum: r.created_at,
    mall: typeof r.mall === 'string' && r.mall ? r.mall : null,
    titel: titelUrStrukturerad({ personalInfo: { title: r.titel } }),
    last: !aktiva.has(r.id),
  }))
  const startCv = cvs.find((c) => c.id === cvParam && !c.last) ?? cvs.find((c) => !c.last) ?? cvs[0]

  const profilRad = (profilRes.data ?? null) as (BrevProfil & {
    weekly_letter_count?: number | null
    weekly_letter_first_used_at?: string | null
    preferred_tonality?: string | null
  }) | null
  const nu = new Date()
  const kvotNu = brevKvot(profilRad, harBetalt, nu)
  const kvotEfter = harBetalt ? null : brevKvotEfterSkrivning(profilRad, nu)

  // Förvald ton ur profilen, som förut. Auto bara för betalande.
  const tonIds: string[] = TONER.map((t) => t.id)
  const pref = profilRad?.preferred_tonality ?? null
  const startTon: TonId = pref && (tonIds.includes(pref) || (pref === 'auto' && harBetalt)) ? (pref as TonId) : 'balanced'

  const profil: BrevProfil | null = profilRad
    ? {
        full_name: profilRad.full_name,
        email: profilRad.email,
        contact_email: profilRad.contact_email,
        phone: profilRad.phone,
        location: profilRad.location,
        include_phone_in_letters: profilRad.include_phone_in_letters,
        include_location_in_letters: profilRad.include_location_in_letters,
        titel: startCv.titel,
      }
    : null

  const idag = nu.toISOString()
  const mallId = startmallForBrev(startCv.mall, harBetalt)
  const data = brevDataFranBrev(
    { company: SKRIV.arbetsgivaren, job_title: SKRIV.tjanstenDuSoker, language: 'sv', body_stycken: [], created_at: idag },
    profil,
    { email: user.email ?? null }
  )
  const tomtArkHtml = tomtArk(renderBrevHtml(mallId, data), true)

  return (
    <SkrivBrev
      cvs={cvs}
      startCvId={startCv.id}
      harBetalt={harBetalt}
      kvot={{
        kvar: kvotNu.kvar,
        nastaOmSkrivet: kvotEfter?.nastaGratisbrev ?? null,
        nastaNu: kvotNu.nastaGratisbrev,
      }}
      startTon={startTon}
      profil={profil}
      epost={user.email ?? null}
      tomtArkHtml={tomtArkHtml}
      idag={idag}
    />
  )
}
