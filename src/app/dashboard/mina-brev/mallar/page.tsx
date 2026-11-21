/**
 * Mallar i brevrummet (/dashboard/mina-brev/mallar?brev=<id>), skissen
 * Mallar och BYGGSPEC avsnitt 7.
 *
 * Serverkomponent: brevlistan (låset och behörigheten), brevets data,
 * kontots paket och spår, och brevet ritat i de åtta första mallarna plus
 * den som visas läses och ritas här, så att första HTML:en har arket och
 * rutnätet på plats. Resten av mallarna hämtas när användaren ber om dem.
 *
 * Adressen: brev (annars det senast uppdaterade), mall (mallen som provas,
 * köpreturen sätter den), format och ladda=1 (tillbaka från kassan: filen
 * laddas ner av sig själv).
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { scopeHasFeature, type Scope } from '@/lib/access/features'
import { hamtaBrevlista } from '@/lib/letters/server'
import { brevMallId } from '@/lib/letters/brevRegler'
import { brevSomText } from '@/lib/letters/brevmall/text'
import { mallarKatalog } from '@/components/brev3/mallar/filter'
import { mallarKalla, ritaIMallar } from '@/components/brev3/mallar/rita.server'
import MallarKlient, { type MallarBrev } from '@/components/brev3/mallar/MallarKlient'

export const metadata = { title: 'Mallar för ditt brev' }

/** Så många mallar ritas på servern (två rader på dator). */
const FORSTA = 8

type Sok = Record<string, string | string[] | undefined>
const forsta = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null

export default async function MallarPage({ searchParams }: { searchParams: Promise<Sok> }) {
  const params = await searchParams
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })

  const [lista, scope, profilRes] = await Promise.all([
    hamtaBrevlista(supabase, user.id),
    getUserScope(supabase, user.id),
    supabase.from('profiles').select('onboarding_track').eq('id', user.id).maybeSingle(),
  ])
  const t = (profilRes.data as { onboarding_track?: string | null } | null)?.onboarding_track
  const track: Scope | null = t === 'cv' || t === 'tester' || t === 'allt' ? t : null
  const kanLaddaNer = scopeHasFeature(scope, 'letter_download')

  const valtId = forsta(params.brev)
  const rad = lista.brev.find((b) => b.id === valtId) ?? lista.brev[0] ?? null
  const kalla = await mallarKalla(supabase, user, rad, lista.harBetalt)

  const katalog = mallarKatalog()
  const sparadMall = rad?.mall_id ? brevMallId(rad.mall_id) : null
  const visad = brevMallId(forsta(params.mall)) ?? sparadMall ?? (rad ? kalla.startmall : (kalla.cvMall ?? kalla.startmall))
  const fontId = rad?.font_id ?? null
  const forstaIds = katalog.slice(0, FORSTA).map((k) => k.id)
  const html = ritaIMallar(kalla.data, forstaIds.includes(visad) ? forstaIds : [...forstaIds, visad], fontId)

  const brev: MallarBrev | null = rad
    ? {
        id: rad.id,
        foretag: rad.company?.trim() || null,
        tjanst: rad.job_title?.trim() || rad.title?.trim() || null,
        isLocked: rad.isLocked,
        sparadMall,
        filnamn: rad.title || rad.job_title || 'Ansökningsbrev',
      }
    : null

  return (
    <MallarKlient
      key={brev?.id ?? 'exempel'}
      brev={brev}
      breven={lista.brev.slice(0, 30).map((b) => ({ id: b.id, foretag: b.company?.trim() || null, tjanst: b.job_title?.trim() || b.title?.trim() || null }))}
      katalog={katalog}
      forstaAntal={FORSTA}
      initialHtml={html}
      initialMall={visad}
      initialFont={fontId}
      startmall={kalla.startmall}
      cvMall={kalla.cvMall}
      harBetalt={lista.harBetalt}
      kanLaddaNer={kanLaddaNer}
      scope={scope}
      track={track}
      harAldreBrev={lista.brev.some((b) => !b.mall_id)}
      kopieraText={rad ? brevSomText(kalla.data) : null}
      ladda={forsta(params.ladda) === '1'}
      laddaFormat={forsta(params.format) === 'docx' ? 'docx' : 'pdf'}
    />
  )
}
