/**
 * Logiktestprovet, alla svar (docs/qa/qa-slutflode-2026-09-24.md, K1).
 *
 * Landningen efter claim: provet på /verktyg/rekryteringstester/prova lovar
 * "Skapa konto och se alla svar med förklaring", och här står de. Fem frågor
 * med rätt eller fel, ditt svar, rätt svar och regeln bakom mönstret, samma
 * genomgång och samma förklaringstexter som logiktestet i dashboarden.
 *
 * Serverrenderad som intervjuprovets [token]-sida: raden läses med
 * admin-klienten efter egen kontroll av claimed_by, och en ohämtad rad kopplas
 * till kontot här. Annan användares prov, utgånget eller okänt ger 404
 * (proxyn svarar med rätt status innan renderingen börjar).
 */

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ArrowRight } from 'lucide-react'
import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import MatrixQuestionReview from '@/components/tests/shared/reviews/MatrixQuestionReview'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaEllerGorAnsprakProv, provGenomgang } from '@/lib/tests/prov-rad'
import { arBlandad } from '@/lib/logicTestV7/blanda'
import { bankVersion } from '@/lib/logicTestV7/selectQuestions.v7'
import { HEM } from '@/lib/traning/hem-copy'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { PROVSIDA } from '../prov-copy'
import { arNyProvTyp } from '@/lib/tests/prov-typer'
import { genomgaProv, lasRefs, lasSvar, nivakollKindFor, underlagFor } from '@/lib/tests/prov-typer.server'
import { NIVAKOLL_TEST_TYPE as NIVAKOLL_PER_TYP } from '@/lib/nivakoll/niva'
import ProvTypSida from './ProvTypSida'
import { provSeed } from '@/lib/tests/anon-session'

export const metadata = { title: 'Ditt logiktestprov', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const TESTER_HREF = '/dashboard/tester'
/** Nivåkollens sessioner, samma test_type som hubben läser (getHubData). */
const NIVAKOLL_TEST_TYPE = 'matrislogik-matning'
const PANEL = 'rounded-xl border border-kant bg-panel p-4 sm:p-6'
const TEXTLANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

function svensktDatum(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(
    new Date(iso)
  )
}

export default async function LogiktestProvPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const [rad, scope, harNivakoll] = await Promise.all([
    hamtaEllerGorAnsprakProv(admin, token, user.id),
    getUserScope(createServerClient({ cookies: await cookies() }), user.id).catch(() => null),
    Promise.resolve(
      admin
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('test_type', NIVAKOLL_TEST_TYPE)
        .not('completed_at', 'is', null)
    ).then(
      (r) => (r.count ?? 0) > 0,
      () => false
    ),
  ])
  if (!rad) notFound()

  // Typerna utöver matrisen (spec-prov-fler-typer-2026-11-09).
  const testKind = (rad as { test_kind?: unknown }).test_kind
  if (arNyProvTyp(testKind)) {
    const refs = lasRefs((rad as { questions?: unknown }).questions)
    if (!refs) notFound()
    const nk = nivakollKindFor(testKind)
    const harTypensNivakoll = nk
      ? await Promise.resolve(
          admin
            .from('logic_test_v4_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('test_type', NIVAKOLL_PER_TYP[nk])
            .not('completed_at', 'is', null)
        ).then(
          (r) => (r.count ?? 0) > 0,
          () => false
        )
      : false
    return (
      <ProvTypSida
        typ={testKind}
        token={rad.token}
        skapad={rad.created_at}
        uppgifter={genomgaProv(refs, lasSvar(rad.answers))}
        underlag={underlagFor(refs)}
        harNivakoll={harTypensNivakoll}
      />
    )
  }

  const { fragor, svar, ratt, totalt } = provGenomgang(provSeed(rad), (rad.answers as number[] | null) ?? [], arBlandad(rad.meta), bankVersion(rad.meta))
  const gratis = scope === null

  // Vidare till träningen (analysen 2026-11-08, punkt 1). Nivåkollen räknar in
  // provets svar, så den som inte gjort den fortsätter dit. Har hon gjort den
  // väntar dagens pass. Det gamla grundtestet är aldrig nästa steg härifrån.
  const vidare = harNivakoll
    ? {
        href: TRANING_RUTT.pass,
        knapp: PASS_COPY.knapp.startaPass,
        cta: 'logiktestprov-pass',
        rubrik: PROVSIDA.vidare.passRubrik,
        text: PROVSIDA.vidare.passText,
      }
    : {
        href: TRANING_RUTT.matning,
        knapp: HEM.matning.smakprovKnapp(HEM.matning.smakprovMinuter(totalt)),
        cta: 'logiktestprov-nivakollen',
        rubrik: PROVSIDA.vidare.nivakollRubrik,
        text: PROVSIDA.vidare.nivakollText(totalt),
      }

  return (
    <>
    <RumHuvud title={PROVSIDA.titel} description={PROVSIDA.beskrivning} />
    <Golv>
    <div className="w-full max-w-3xl space-y-4 sm:space-y-6">

      <section className={PANEL} aria-labelledby="prov-resultat">
        <h2 id="prov-resultat" className="text-steg uppercase text-ink-3">
          {PROVSIDA.resultatEtikett}
        </h2>
        <p className="mt-1 text-meta text-ink-3">{PROVSIDA.meta(svensktDatum(rad.created_at))}</p>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="text-tal-display text-ink-1">{ratt}</span>
          <span className="text-sm text-ink-3">{PROVSIDA.av(totalt)}</span>
        </div>
        <div className="mt-2.5 grid gap-1" style={{ gridTemplateColumns: `repeat(${totalt}, minmax(0, 1fr))` }} aria-hidden="true">
          {fragor.map((q) => {
            const s = svar.find((a) => a.q_id === q.id)
            return <span key={q.id} className={`h-1.5 rounded-[3px] ${s?.correct ? 'bg-ink-1' : 'bg-insunken'}`} />
          })}
        </div>
        <p className="mt-2.5 text-varde text-ink-1">{PROVSIDA.omdome(ratt, totalt)}</p>
      </section>

      {/* Vidare direkt under resultatet, så att vägen syns utan att rulla
          förbi genomgången. Premium bara som länk för gratis. */}
      <section className={PANEL} aria-labelledby="prov-vidare">
        <h2 id="prov-vidare" className="text-kort-t text-ink-1">
          {vidare.rubrik}
        </h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{vidare.text}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Link href={vidare.href} data-cta={vidare.cta} className={`${KNAPP_PRIMAR} sm:w-auto`}>
            {vidare.knapp}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {gratis ? (
            <Link href="/priser" data-cta="logiktestprov-premium" className={TEXTLANK}>
              {PROVSIDA.traning}
            </Link>
          ) : (
            <Link href={TESTER_HREF} className={TEXTLANK}>
              {PROVSIDA.hubb}
            </Link>
          )}
        </div>
        {gratis ? <p className="mt-2 text-meta text-ink-3">{PROVSIDA.traningText}</p> : null}
      </section>

      <p className="text-sm leading-[22px] text-ink-2">{PROVSIDA.genomgang}</p>
      <MatrixQuestionReview
        slug="matrislogik-grund"
        answers={svar}
        fragor={fragor}
        utanTid
        allaOppna
      />

      {/* Foten: samma mål som kortet ovan, för den som läst hela genomgången. */}
      <div className="flex">
        <Link href={vidare.href} data-cta={`${vidare.cta}-fot`} className={TEXTLANK}>
          {vidare.knapp}
        </Link>
      </div>
    </div>
    </Golv>
    </>
  )
}
