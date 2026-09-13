'use client'

/**
 * Nästa handling: vyns framhävda element (docs/design/koncept-2026-09-13.md,
 * ram 1). Upphöjd panel (kant-stark) med vyns enda marginalplatta, etikett,
 * kortrubrik, en mening och två textlänkar. Aldrig en fylld knapp: den enda
 * primära handlingen ligger i JobbsokOversikt.
 *
 * Rankningen kommer från useNextBestAction: uppföljning först, sedan
 * AF-fönstret, sedan exakt en oprövad funktion i taget.
 */

import Link from 'next/link'
import type { ComponentType } from 'react'
import type { NextBestAction } from '@/hooks/useNextBestAction'
import MarginPlate from '@/components/shell/MarginPlate'
import {
  IlluPlattaUppfoljning,
  IlluPlattaAnsokan,
  IlluPlattaCvPoang,
} from '@/components/illustrations/TradenScener'

interface NastaHandlingProps {
  action: NextBestAction
  onDismiss: () => void
}

interface RowCopy {
  title: string
  text: string
  href: string
  cta: string
  Illu: ComponentType<{ size?: number; className?: string }>
}

function copyFor(action: NonNullable<NextBestAction>): RowCopy {
  switch (action.kind) {
    case 'follow-up':
      return {
        title: action.count === 1 ? 'Följ upp en ansökan' : `Följ upp ${action.count} ansökningar`,
        text:
          action.count === 1
            ? 'Den har varit tyst i över två veckor. Ett kort mail brukar räcka.'
            : 'De har varit tysta i över två veckor. Ett kort mail brukar räcka.',
        href: '/dashboard/sokta-tjanster?filter=uppfoljning',
        cta: 'Följ upp',
        Illu: IlluPlattaUppfoljning,
      }
    case 'af-report':
      return {
        title: `Rapporten för ${action.monthLabel}`,
        text: `${action.count} sökta jobb att rapportera till Arbetsförmedlingen.`,
        href: '/dashboard/sokta-tjanster?rapport=1',
        cta: 'Öppna rapporten',
        Illu: IlluPlattaAnsokan,
      }
    case 'feature':
      return {
        title: action.feature.cta,
        text: action.feature.description,
        href: action.feature.href,
        cta: action.feature.cta,
        Illu: IlluPlattaCvPoang,
      }
  }
}

const LINK = 'inline-flex min-h-11 items-center text-sm font-medium underline decoration-kant-stark underline-offset-4 transition-colors'

export default function NastaHandling({ action, onDismiss }: NastaHandlingProps) {
  if (!action) return null

  const copy = copyFor(action)

  return (
    <section className="rounded-xl border border-kant-stark bg-panel p-4" aria-label="Nästa handling">
      <div className="flex items-start gap-3">
        <MarginPlate>
          <copy.Illu size={48} />
        </MarginPlate>
        <div className="min-w-0 flex-1">
          <p className="text-steg uppercase text-ink-3">Nästa handling</p>
          <h2 className="mt-0.5 text-kort text-ink-1">{copy.title}</h2>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">{copy.text}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-5">
            <Link href={copy.href} className={`${LINK} text-ink-1 hover:decoration-ink-1`}>
              {copy.cta}
            </Link>
            <button type="button" onClick={onDismiss} className={`${LINK} text-ink-2 hover:text-ink-1`}>
              Senare
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
