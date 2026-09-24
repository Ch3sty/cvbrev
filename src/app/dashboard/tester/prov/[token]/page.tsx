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
import PageHeader from '@/components/shell/PageHeader'
import MatrixQuestionReview from '@/components/tests/shared/reviews/MatrixQuestionReview'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaEllerGorAnsprakProv, provGenomgang } from '@/lib/tests/prov-rad'
import { kopstegHref } from '@/lib/onboarding/steps'
import { PROVSIDA } from '../prov-copy'

export const metadata = { title: 'Ditt logiktestprov', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const GRUNDNIVA_HREF = '/dashboard/tester/matrislogik-grund'
const TESTER_HREF = '/dashboard/tester'
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
  const [rad, scope] = await Promise.all([
    hamtaEllerGorAnsprakProv(admin, token, user.id),
    getUserScope(createServerClient({ cookies: await cookies() }), user.id).catch(() => null),
  ])
  if (!rad) notFound()

  const { fragor, svar, ratt, totalt } = provGenomgang(rad.token, rad.answers ?? [])
  const gratis = scope === null

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader eyebrow={PROVSIDA.eyebrow} title={PROVSIDA.titel} description={PROVSIDA.beskrivning} />

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

      <p className="text-sm leading-[22px] text-ink-2">{PROVSIDA.genomgang}</p>
      <MatrixQuestionReview
        slug="matrislogik-grund"
        sessionId={rad.token}
        answers={svar}
        fragor={fragor}
        utanTid
        allaOppna
      />

      {/* Vidare: grundnivån först, Träningspaketet bara för gratis. */}
      <section className={PANEL} aria-label={PROVSIDA.knapp}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href={GRUNDNIVA_HREF}
            data-cta="logiktestprov-grundniva"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto"
          >
            {PROVSIDA.knapp}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {gratis ? (
            <Link href={kopstegHref('test_week')} data-cta="logiktestprov-traningspaketet" className={TEXTLANK}>
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
    </div>
  )
}
