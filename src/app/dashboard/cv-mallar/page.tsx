/**
 * Mallar i CV-rummet (omgång 1, steg 2): samma CV i alla mallar, i
 * testernas formspråk (CvMallarClient, MallarVy). Tidigare: plan-mallar 3.2. Serverkomponent: sessionen, CV-listan,
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
import { getSupabaseAdmin } from '@/lib/supabase/admin'
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
import { kampanjNu, kampanjPrisPeriod } from '@/lib/kampanj/kampanj'
import { valtCvId } from '@/components/cv/rum3/cvLista'
import { arbetslageHref } from '@/components/cv/rum3/flikar'
import { CV_GRANS_GRATIS } from '@/lib/supabase/premiumAccess'
import { valUrAdress } from '@/lib/cv/mallar/val'
import { valFor } from '@/lib/cv/bygg/kalla'
import type { ByggCv } from '@/lib/cv/bygg/modell'
import { poangUrAnalys, medForslagUrAnalys } from '@/lib/rum/cvRum'
import { analysPerCv, atgardadAtFor, underlagForCv, type AnalysRad, type CvRadMedFil } from '@/lib/cv/analys/cvAnalys'
import { poangForRad, type CvRad } from '@/lib/cv/poang'

type Sok = Record<string, string | string[] | undefined> & {
  cv?: string | string[]
  mall?: string | string[]
  format?: string | string[]
  kop?: string | string[]
  ladda?: string | string[]
  foto?: string | string[]
  /** Reserv: äldre länkar "Lägg till språken" med ?andra=sprak går vidare till arbetsläget. */
  andra?: string | string[]
}
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
  let maxCvs = CV_GRANS_GRATIS
  let pris = prisPeriod(SALD_PLAN)
  let prisLang = pris
  let kampanj: { pris: string; ordinarie: string } | null = null
  let nedladdadMall: string | null = null

  try {
    const [cvRes, profileRes, scopeRes, grans, kamp, nedRes] = await Promise.all([
      supabase.from('cv_texts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('premium_until, onboarding_track, price_id, subscription_status, free_cv_exports_used, profile_photo_url')
        .eq('id', user.id)
        .maybeSingle(),
      getUserScope(supabase, user.id),
      getCvGrans(supabase, user.id),
      kampanjForVisning(user.id, kampanjNu()),
      // Mallen utan ?mall=: senast nedladdade, som Ditt CV och Analys.
      supabase
        .from('formatted_cv_downloads')
        .select('template_id')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])
    nedladdadMall = (nedRes.data as { template_id?: string | null } | null)?.template_id ?? null
    if (cvRes.error) console.error('Fel vid server-hämtning av CV-listan:', cvRes.error)
    cvRows = (cvRes.data ?? []) as InitialCv[]
    maxCvs = grans.maxCvs
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
      prisLang = kampanjPrisPeriod(kamp.kampanj)
    }
  } catch (error) {
    console.error('Fel vid server-hämtning av CV-mallar:', error)
  }

  // Samma CV på alla tre flikarna: ?cv= om det inte är låst, annars senaste aktiva.
  const aktivaSet = new Set(aktiva)
  const lastaIds = cvRows.filter((c) => !aktivaSet.has(c.id)).map((c) => c.id)
  const initialSelectedCvId = valtCvId(cvRows, new Set(lastaIds), cvIdFromUrl)
  // Mallen: adressen, annars som Ditt CV och Analys (senast nedladdade, mallen
  // sparad på CV:t, katalogens första), så att fliken visar samma ark.
  const valtBygge = (cvRows.find((c) => c.id === initialSelectedCvId)?.structured_data as { bygge?: { mall?: string } } | null)?.bygge
  const mall =
    losMallId(forsta(params.mall)) ?? losMallId(nedladdadMall) ?? losMallId(valtBygge?.mall ?? null) ?? MALL_KATALOG[0].id
  const fullt = maxCvs === CV_GRANS_GRATIS && cvRows.length >= CV_GRANS_GRATIS

  // Reserv för äldre länkar med ?andra=sprak (Ditt CV pekar nu direkt på arbetsläget).
  if (forsta(params.andra) === 'sprak' && initialSelectedCvId) {
    redirect(arbetslageHref(initialSelectedCvId, 'ditt-cv', { avsnitt: 'sprak', mall }))
  }

  // Analysen av valt CV: plus i spärrens talruta och dokumentets väg i målgången.
  // Samma funktioner som Ditt CV och Analys (src/lib/cv/analys/cvAnalys.ts):
  // poängen räknas ur CV-raden med poängmodellen, plus = med våra förslag
  // minus poängen i dag, aldrig AI:ns sparade tal.
  const plusPerCv: Record<string, number> = {}
  // Poängen per CV för Byt CV-arket (som Ditt CV och Analys).
  const poangPerCv: Record<string, number> = {}
  let jobbPerCv: Record<string, string> = {}
  let analysRader: AnalysRad[] = []
  try {
    // Fält ur result: service role, bara hennes egna rader (2026-11-21).
    const { data } = await getSupabaseAdmin()
      .from('cv_analysis_jobs')
      .select('id, cv_id, completed_at, forbattrad:result->forbattradSparad, valda:result->selectedImprovements')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(100)
    analysRader = (data ?? []) as AnalysRad[]
    jobbPerCv = analysPerCv(analysRader)
    for (const cv of cvRows) {
      if (!jobbPerCv[cv.id]) continue
      const p = poangForRad(cv as unknown as CvRad)
      if (p !== null) poangPerCv[cv.id] = p
    }
  } catch (error) {
    console.error('Fel vid hämtning av analyserna för Mallar:', error)
  }
  const vagPerCv: Record<string, { uppladdat: 'uppladdat' | 'utkast'; analyserat: boolean; atgardat: boolean }> = {}
  const valt = cvRows.find((c) => c.id === initialSelectedCvId)
  if (valt) {
    const valtRad = valt as unknown as CvRadMedFil
    const alla = cvRows as unknown as CvRadMedFil[]
    const atgardat = atgardadAtFor(valtRad, alla, analysRader) !== null
    let analyserat = false
    try {
      const underlag = await underlagForCv(getSupabaseAdmin(), user.id, valtRad, alla, jobbPerCv, null, {
        harFull: scopeHasFeature(scope, 'cv_analysis_full'),
      })
      const poang = poangUrAnalys(underlag)
      if (underlag && poang !== null) {
        analyserat = true
        const plus = (medForslagUrAnalys(underlag) ?? poang) - poang
        if (plus > 0) plusPerCv[valt.id] = plus
      }
    } catch (error) {
      console.error('Fel vid hämtning av analysen för Mallar:', error)
    }
    const bygge = (valt.structured_data as { bygge?: unknown } | null)?.bygge
    vagPerCv[valt.id] = { uppladdat: bygge ? 'utkast' : 'uppladdat', analyserat, atgardat }
  }

  // Valen (typsnitt, färg, ordning): adressen (också tillbaka från arbetsläget),
  // annars de sparade på ett byggt CV.
  const sok = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    const f = forsta(v)
    if (f !== null) sok.set(k, f)
  }
  const initialVal = valUrAdress(sok) ?? (valt ? valFor((valt.structured_data ?? {}) as ByggCv) : {})

  return (
    <CvMallarClient
      key={initialSelectedCvId ?? 'exempel'}
      initialCvs={cvRows}
      lastaIds={lastaIds}
      initialIsPremium={isPremium}
      initialSelectedCvId={initialSelectedCvId}
      initialMall={mall}
      initialVal={initialVal}
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
      prisLang={prisLang}
      kampanj={kampanj}
      ladda={forsta(params.ladda) === '1'}
      foto={forsta(params.foto) === '1'}
      fullt={fullt}
      plusPerCv={plusPerCv}
      vagPerCv={vagPerCv}
      poangPerCv={poangPerCv}
    />
  )
}
