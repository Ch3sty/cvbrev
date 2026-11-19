'use client'

/**
 * Gratisraden på Hem (ägarens regel, omgång 7, utkast v4 avsnitt 7): ett
 * grundnivåtest om dagen, valfri testtyp, och Nivåkollen en gång per
 * testtyp. När dagens grundnivå är gjord står raden ordagrant: "Det här var
 * grundnivån. Proven ligger på avancerad nivå. Öva där, så ofta du vill,
 * med Premium, 149 kr i månaden." Priset och namnet läses ur paketet och
 * kampanjen (Gratislage.pris), så Black Week syns utan kodändring.
 *
 * Betalväggens anatomi (designsystemet 6): papper, rubrik, text, prisrad i
 * texten, en knapp. Vyns enda kopparknapp står i Nästa steg, så knappen här
 * är sekundär. kvot_slut_visad en gång per montering när kvoten är slut,
 * paywall_cta_clicked från samma yta.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { SALD_PLAN } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import { KNAPP_SEKUNDAR } from '@/components/shell/knappar'
import type { Gratislage } from '@/lib/tester/v4/typer'
import { GRATISRAD } from '@/lib/tester/v4/copy'

export default function GratisRad({ gratis, planTest }: { gratis: Gratislage; planTest: string | null }) {
  const slut = gratis.grundKvarIdag <= 0
  const skickad = useRef(false)
  useEffect(() => {
    if (gratis.premium || !slut || skickad.current) return
    skickad.current = true
    capture('kvot_slut_visad', { surface: 'hem', plan_test: planTest, plattform: 'webb' })
  }, [gratis.premium, slut, planTest])

  // Raden står när dagens grundnivå är gjord (utkast v4 avsnitt 2 punkt 5).
  if (gratis.premium || !slut) return null
  return (
    <section aria-labelledby="gratis-rubrik" className="rounded-2xl border border-kant bg-papper p-4" data-gratis="gjord">
      <div>
        <h2 id="gratis-rubrik" className="font-display text-[17px] font-bold leading-[22px] tracking-[-.01em] text-ink-1">
          {GRATISRAD.rubrikSlut}
        </h2>
        <p className="mt-1 text-sm leading-[21px] text-ink-2" data-gratisrad>
          {GRATISRAD.text(false, gratis.pris.prisrad, gratis.pris.namn)}
        </p>
        <Link
          href={kopstegHref(SALD_PLAN, 'kvot')}
          className={`${KNAPP_SEKUNDAR} mt-3 sm:w-auto`}
          onClick={() =>
            capture('paywall_cta_clicked', { variant: 'testniva', surface: '/dashboard/tester', cta: 'primary', plan: SALD_PLAN, plats: 'kvot' })
          }
        >
          {gratis.pris.knapp}
        </Link>
      </div>
    </section>
  )
}
