'use client'

/**
 * Köpet på Nivåkollens resultat, i resultatets statusrad (plan-testflode-2026-11-20
 * avsnitt 9.2, etapp 7). Före ramen bar resultatet en köpknapp till
 * köpsteget med plats matning (MatningResultatVy och NivakollResultatVy), och
 * ett köp kom därifrån 2026-11-15. Ramen hade bara prisraden kvar, så platsen
 * mättes som visad utan något att trycka på. Här står köpet i resultatets
 * statusrad, samma form som nivåtestets (TestResultsPage, plats testresultat):
 * raden med prisraden och en sekundär köpknapp, under Nästa steg med Träna som
 * vyns enda kopparknapp. Kampanjpriset när kontot kan få det.
 *
 * Mätning: betalvagg_visad (plats matning) en gång per montering och
 * paywall_cta_clicked vid tryck, med testtypen och lage nivakoll. Matrisen
 * skickar dagar_kvar som förut.
 */

import { useEffect, useRef } from 'react'
import { capture } from '@/lib/analytics/events'
import { KNAPP_SEKUNDAR } from '@/components/shell/knappar'
import { PremiumKnappText, PremiumPrisradText, useKampanjPris } from '@/components/kampanj/KampanjPrisKontext'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'

export default function NivakollKop({
  testKind,
  dagarKvar = null,
  rad = 'Träningen på din nivå ingår i Premium.',
}: {
  testKind: string
  dagarKvar?: number | null
  rad?: string
}) {
  const kampanj = useKampanjPris()
  const visad = useRef(false)
  useEffect(() => {
    if (visad.current) return
    visad.current = true
    capture('betalvagg_visad', { plats: 'matning', dagar_kvar: dagarKvar, test_kind: testKind, lage: 'nivakoll' })
  }, [dagarKvar, testKind])
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1" data-nivakoll-kop>
      <span className="flex min-w-0 items-center gap-2.5" data-nivakoll-prisrad>
        <span className="h-2 w-2 shrink-0 rounded-full bg-koppar" aria-hidden="true" />
        <span>
          {rad} <PremiumPrisradText />
        </span>
      </span>
      <a
        href={kopstegHref(SALD_PLAN, 'matning')}
        className={`${KNAPP_SEKUNDAR} sm:w-auto`}
        data-cta="nivakoll-kop"
        onClick={() =>
          capture('paywall_cta_clicked', {
            variant: 'testniva',
            surface: typeof window === 'undefined' ? '' : window.location.pathname,
            cta: 'primary',
            plan: SALD_PLAN,
            plats: 'matning',
            kampanj: kampanj?.nyckel ?? null,
            test_kind: testKind,
            lage: 'nivakoll',
          })
        }
      >
        <PremiumKnappText />
      </a>
    </div>
  )
}
