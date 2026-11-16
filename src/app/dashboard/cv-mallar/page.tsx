/**
 * CV-mallar inloggat (plan-mallar 3.2, skissen yta 4): samma dokument som
 * mallsidan, inte tre steg. Serverkomponent: sessionen, CV-listan,
 * behörigheten, priset och valet ur adressen (?cv=&mall=&format=&kop=)
 * läses här i en parallell omgång och skickas som props, så att första HTML
 * har det valda CV:t, mallen och knappen på plats (LCP under 1,5 s, CLS 0,
 * feedback_prestandabudget_inloggat).
 *
 * Spärrarna ligger kvar på servern bakom /api/cv/generate-formatted; här
 * avgörs bara vad knappen säger och vilken vägg som öppnas.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import CvMallarClient, { type InitialCv } from './CvMallarClient'
import { getUserScope, getCvGrans } from '@/lib/supabase/premiumAccess'
import { scopeHasFeature, type Scope } from '@/lib/access/features'
import { harPaket } from '@/lib/plans/harPaket'
import { SALD_PLAN, prisPeriod, type PlanKey } from '@/lib/plans/plans'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { FREE_CV_EXPORTS } from '@/lib/cv/template-antal'
import { getActiveCvIds } from '@/lib/cv/cv-quota'
import { MALL_KATALOG, losMallId } from '@/lib/cv/mallval/katalog'
import { kampanjForVisning } from '@/lib/kampanj/kampanj.server'
import { kampanjNu } from '@/lib/kampanj/kampanj'

type Sok = { cv?: string | string[]; mall?: string | string[]; format?: string | string[]; kop?: string | string[] }
const forsta = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null

export default async function CVMallarPage({ searchParams }: { searchParams: Promise<Sok> }) {
  const params = await searchParams
  const cvIdFromUrl = forsta(params.cv)

  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  let cvRows: InitialCv[] = []
  let isPremium = false
  let harWord = false
  let gratisAnvand = false
  let scope: Scope | null = null
  let track: Scope | null = null
  let planKey: PlanKey | null = null
  let fotoUrl: string | null = null
  let aktiva: string[] = []
  let pris = prisPeriod(SALD_PLAN)
  let kampanj: { pris: string; ordinarie: string } | null = null

  try {
    const [cvRes, profileRes, scopeRes, grans, kamp] = await Promise.all([
      supabase.from('cv_texts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('premium_until, onboarding_track, price_id, subscription_status, free_cv_exports_used, profile_photo_url')
        .eq('id', user.id)
        .maybeSingle(),
      getUserScope(supabase, user.id),
      getCvGrans(supabase, user.id),
      kampanjForVisning(user.id, kampanjNu()),
    ])
    if (cvRes.error) console.error('Fel vid server-hämtning av CV-listan:', cvRes.error)
    cvRows = (cvRes.data ?? []) as InitialCv[]
    aktiva = [...getActiveCvIds(cvRows, grans.maxCvs)]
    const profile = profileRes.data as {
      premium_until?: string | null
      onboarding_track?: string | null
      price_id?: string | null
      subscription_status?: string | null
      free_cv_exports_used?: number | null
      profile_photo_url?: string | null
    } | null
    scope = scopeRes
    isPremium = scopeHasFeature(scope, 'cv_templates_all')
    harWord = scopeHasFeature(scope, 'cv_export_word')
    gratisAnvand = !scopeHasFeature(scope, 'cv_export') && (profile?.free_cv_exports_used ?? 0) >= FREE_CV_EXPORTS
    fotoUrl = profile?.profile_photo_url ?? null
    const t = profile?.onboarding_track
    track = t === 'cv' || t === 'tester' || t === 'allt' ? t : null
    planKey = harPaket(scope, profile?.premium_until ? new Date(profile.premium_until) : null, new Date(), {
      priceId: profile?.price_id,
      status: profile?.subscription_status,
    })
    if (kamp.kampanj && kamp.behorig) {
      kampanj = { pris: `${kamp.kampanj.pris} kr första månaden`, ordinarie: pris }
      pris = kampanj.pris
    }
  } catch (error) {
    console.error('Fel vid server-hämtning av CV-mallar:', error)
  }

  const initialSelectedCvId =
    (cvIdFromUrl && cvRows.some((cv) => cv.id === cvIdFromUrl) ? cvIdFromUrl : null) ?? cvRows[0]?.id ?? null
  const mall = losMallId(forsta(params.mall)) ?? MALL_KATALOG[0].id

  return (
    <CvMallarClient
      initialCvs={cvRows}
      aktivaCvIds={aktiva}
      initialIsPremium={isPremium}
      initialSelectedCvId={initialSelectedCvId}
      initialMall={mall}
      initialFormat={forsta(params.format) === 'docx' ? 'docx' : 'pdf'}
      kop={forsta(params.kop) === '1'}
      katalog={MALL_KATALOG}
      harWord={harWord}
      gratisAnvand={gratisAnvand}
      scope={scope}
      track={track}
      planKey={planKey}
      fotoUrl={fotoUrl}
      pris={pris}
      kampanj={kampanj}
    />
  )
}
