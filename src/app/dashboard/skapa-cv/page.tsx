/**
 * CV-byggaren "Direkt på arket" (docs/design/skiss-cv-byggare-2026-11-16.html).
 *
 * Serverkomponent: sessionen, profilens kontakt, CV-listan (spärren för
 * antal CV visas i starten, inte efter ifyllandet), CV:t ur ?cv= vid
 * återkomst, behörigheten, priset och arkets första HTML läses här i en
 * parallell omgång. Första HTML har därför arket i mallen med spöktexten på
 * plats, utan en rundtur efter hydreringen (LCP under 2,0 s, CLS 0,
 * feedback_prestandabudget_inloggat).
 *
 * Spärrarna ligger kvar på servern: antal CV i /api/cv/save-improved (403),
 * mall, Word och gratisnedladdningen i /api/cv/generate-formatted.
 *
 * Gamla adresser med ?steg= (sju steg fram till 2026-11-16) ignoreras;
 * klienten tar bort parametern ur adressen.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { getUserScope, getCvGrans } from '@/lib/supabase/premiumAccess'
import { scopeHasFeature, type Scope } from '@/lib/access/features'
import { harPaket } from '@/lib/plans/harPaket'
import { SALD_PLAN, prisPeriod, type PlanKey } from '@/lib/plans/plans'
import { FREE_CV_EXPORTS } from '@/lib/cv/template-antal'
import { MALL_KATALOG, losMallId } from '@/lib/cv/mallval/katalog'
import { kampanjForVisning } from '@/lib/kampanj/kampanj.server'
import { kampanjNu, kampanjPrisPeriod } from '@/lib/kampanj/kampanj'
import { dokumentEpost } from '@/lib/profile/dokumentEpost'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { forberedInloggatCv } from '@/lib/cv/forbered-inloggat-cv'
import { medSpok } from '@/lib/cv/bygg/spok'
import { renderaMallHtml } from '@/lib/cv/rendera-mall-html'
import { tolkaVal } from '@/lib/cv/mallar/val'
import { nyttCv, type ByggCv } from '@/lib/cv/bygg/modell'
import { byggKalla, rubrikerFor, valFor, type Entry } from '@/lib/cv/bygg/kalla'
import type { Sektion } from '@/lib/cv/mallar/kontrakt'
import ByggareClient from './ByggareClient'

type Rad = { id: string; structured_data: unknown; cv_text: string | null; section_titles: Partial<Record<Sektion, string>> | null }
type Sok = Record<string, string | string[] | undefined>
const forsta = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null

const ENTRY: Record<string, Entry> = {
  mina_cv: 'mina_cv',
  hemskarm: 'hemskarm',
  sidomeny: 'sidomeny',
  registrering: 'registrering',
}

export default async function SkapaCVPage({ searchParams }: { searchParams: Promise<Sok> }) {
  const params = await searchParams
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login?redirect=/dashboard/skapa-cv')

  const supabase = createServerClient({ cookies: await cookies() })
  const cvIdUrl = forsta(params.cv)
  const cvIdGiltigt = cvIdUrl && /^[0-9a-f-]{36}$/i.test(cvIdUrl) ? cvIdUrl : null

  let isAdmin = false
  let antal = 0
  let maxCvs = 2
  let senasteTitel = ''
  let rad: Rad | null = null
  let profil: Record<string, string | null> | null = null
  let scope: Scope | null = null
  let track: Scope | null = null
  let planKey: PlanKey | null = null
  let isPremium = false
  let harWord = false
  let gratisAnvand = false
  let pris = prisPeriod(SALD_PLAN)
  let prisLang = pris
  let kampanj: { pris: string; ordinarie: string } | null = null

  try {
    const [adminRes, listaRes, radRes, profilRes, scopeRes, grans, kamp] = await Promise.all([
      supabase.from('admin_users').select('role').eq('id', user.id).eq('role', 'super_admin').maybeSingle(),
      supabase
        .from('cv_texts')
        .select('id, created_at, titel:structured_data->personalInfo->>title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      cvIdGiltigt
        ? supabase
            .from('cv_texts')
            .select('id, structured_data, cv_text, section_titles')
            .eq('id', cvIdGiltigt)
            .eq('user_id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from('profiles')
        .select(
          'full_name, email, contact_email, phone, location, linkedin_url, premium_until, onboarding_track, price_id, subscription_status, free_cv_exports_used, profile_photo_url'
        )
        .eq('id', user.id)
        .maybeSingle(),
      getUserScope(supabase, user.id),
      getCvGrans(supabase, user.id),
      kampanjForVisning(user.id, kampanjNu()),
    ])
    isAdmin = Boolean(adminRes.data)
    const lista = (listaRes.data ?? []) as { id: string; titel?: string | null }[]
    antal = lista.length
    maxCvs = grans.maxCvs
    senasteTitel = (lista.find((c) => (c.titel ?? '').trim())?.titel ?? '').trim()
    rad = (radRes.data as Rad | null) ?? null
    profil = (profilRes.data as Record<string, string | null> | null) ?? null
    scope = scopeRes
    isPremium = scopeHasFeature(scope, 'cv_templates_all')
    harWord = scopeHasFeature(scope, 'cv_export_word')
    gratisAnvand =
      !scopeHasFeature(scope, 'cv_export') && Number((profil as { free_cv_exports_used?: number } | null)?.free_cv_exports_used ?? 0) >= FREE_CV_EXPORTS
    const t = profil?.onboarding_track
    track = t === 'cv' || t === 'tester' || t === 'allt' ? t : null
    planKey = harPaket(scope, profil?.premium_until ? new Date(profil.premium_until) : null, new Date(), {
      priceId: profil?.price_id,
      status: profil?.subscription_status,
    })
    if (kamp.kampanj && kamp.behorig) {
      kampanj = { pris: `${kamp.kampanj.pris} kr första månaden`, ordinarie: pris }
      pris = kampanj.pris
      prisLang = kampanjPrisPeriod(kamp.kampanj)
    }
  } catch (error) {
    // Går hämtningen fel ska byggaren ändå gå att öppna; spärrarna står kvar på servern.
    console.error('Fel vid server-hämtning av CV-byggaren:', error)
  }

  // CV:t: återkomst via ?cv=, annars ett nytt ur profilen.
  const sparat = rad ? (normalizeStructuredData(rad.structured_data) as ByggCv | null) : null
  const kontakt = {
    namn: profil?.full_name ?? '',
    epost: profil ? dokumentEpost(profil as Parameters<typeof dokumentEpost>[0], user) : user.email ?? '',
    telefon: profil?.phone ?? '',
    ort: profil?.location ?? '',
    linkedin: profil?.linkedin_url ?? '',
  }
  // Från Ditt CV med titeln ifylld (?borja=1&titel=): startbladet hoppas över.
  const borjaTitel = !cvIdGiltigt && forsta(params.borja) === '1' ? (forsta(params.titel) ?? '').trim().slice(0, 80) : ''
  let cv: ByggCv = sparat ?? nyttCv(kontakt, borjaTitel || senasteTitel)
  // Ett uppladdat CV har sitt eget format; kontakten fylls ur profilen där den saknas.
  if (sparat) {
    const pi = cv.personalInfo
    cv = {
      ...cv,
      personalInfo: {
        ...pi,
        fullName: pi.fullName?.trim() || kontakt.namn,
        email: pi.email?.trim() || kontakt.epost,
        phone: pi.phone?.trim() || kontakt.telefon || undefined,
        address: pi.address?.trim() || pi.location?.trim() || kontakt.ort || undefined,
      },
    }
  }
  const cvId = sparat && rad ? rad.id : null
  const mallUrl = losMallId(forsta(params.mall))
  const mall = mallUrl ?? losMallId(cv.bygge?.mall ?? null) ?? MALL_KATALOG[0].id
  const val = valFor(cv)
  const rubriker = rubrikerFor(rad?.section_titles ?? null)

  // Arkets första HTML, samma väg som /api/cv/preview-html med spok.
  let initialHtml: string | null = null
  try {
    const forberett = await forberedInloggatCv(supabase, user, {
      structuredData: byggKalla({ cv, cvId, mall, val, rubriker }).structuredData,
      cvId: cvId ?? undefined,
    })
    if (forberett.ok) {
      const s = medSpok(forberett.cv)
      initialHtml = renderaMallHtml(s.cv, mall, tolkaVal({ ...val, rubriker }), { forhandsvisning: true, spok: s.markering })
    }
  } catch (error) {
    console.error('Fel vid server-rendering av arket:', error)
  }

  const fran = forsta(params.fran)
  const entry: Entry = cvId ? 'ateruppta' : fran && ENTRY[fran] ? ENTRY[fran] : mallUrl ? 'mall' : 'annan'

  return (
    <ByggareClient
      key={cvId ?? 'nytt'}
      initialCv={cv}
      initialCvId={cvId}
      initialMall={mall}
      initialRubriker={rubriker}
      initialHtml={initialHtml}
      uppladdad={forsta(params.upp) === '1'}
      uppTitel={(forsta(params.titel) ?? '').slice(0, 80)}
      sparr={!cvId && antal >= maxCvs}
      borja={Boolean(borjaTitel) && !(antal >= maxCvs)}
      entry={entry}
      isAdmin={isAdmin}
      katalog={MALL_KATALOG}
      isPremium={isPremium}
      harWord={harWord}
      gratisAnvand={gratisAnvand}
      scope={scope}
      track={track}
      planKey={planKey}
      fotoUrl={profil?.profile_photo_url ?? null}
      pris={pris}
      prisLang={prisLang}
      kampanj={kampanj}
    />
  )
}
