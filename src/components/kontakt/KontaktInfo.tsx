/**
 * Fil: src/components/kontakt/KontaktInfo.tsx
 *
 * Beskrivning:
 * Kontaktvägarna (två e-postadresser och FAQ-länken) för den publika sidan
 * och dashboarden.
 *
 * Inloggat: en panel med tre rader, naken ikon 24 i ink-2, adressen som
 * textlänk. Den publika sidan har sin egen fil, KontaktInfoPublik.
 */
'use client'

import Link from 'next/link'
import { paketKort } from '@/lib/plans/plans'
import { IkonMeddelanden, IkonHjalp, IkonSkold } from '@/components/illustrations/Ikoner'

interface KontaktInfoProps {
  /** Kvar för anroparna; inloggat har bara en variant. */
  variant?: 'dashboard'
}

const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:text-ink-2 break-all'

function DashboardInfo() {
  return (
    <section aria-label="Kontaktvägar">
      <h2 className="mb-2 text-sm font-medium text-ink-3">Andra vägar</h2>
      <div className="divide-y divide-kant rounded-xl border border-kant bg-papper">
        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
            <IkonMeddelanden size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-1">Allmänna frågor</p>
            <p className="mt-0.5 text-meta text-ink-3">Funktioner, samarbeten eller feedback.</p>
            <a href="mailto:info@jobbcoach.ai" className={LINK}>
              info@jobbcoach.ai
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
            <IkonSkold size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-1">Konto och support</p>
            <p className="mt-0.5 text-meta text-ink-3">
              Inloggning, betalning eller din prenumeration. Har du {paketKort()} får du svar först.
            </p>
            <a href="mailto:support@jobbcoach.ai" className={LINK}>
              support@jobbcoach.ai
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
            <IkonHjalp size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-1">Vanliga frågor</p>
            <p className="mt-0.5 text-meta text-ink-3">
              Svar om funktioner, priser och användning.
            </p>
            <Link href="/#faq" className={LINK}>
              Gå till FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function KontaktInfo(_props: KontaktInfoProps) {
  return <DashboardInfo />
}
