'use client'

/**
 * Nästa handling: en rankad rad, aldrig sex jämnstora kort
 * (docs/plan-inloggat-omdesign.md, avsnitt 4 och enighetsprotokollet).
 *
 * Rankningen kommer från useNextBestAction: uppföljning först, sedan
 * AF-fönstret, sedan exakt en oprövad funktion i taget. Raden byts när
 * funktionen använts, annars blir den blind efter tredje besöket.
 *
 * Detta är en rad med textlänk, inte ett hopkrympt kort med ram. Vyns enda
 * fyllda orange yta ligger i JobbsokOversikt, så den här får inte konkurrera.
 */

import Link from 'next/link'
import type { NextBestAction } from '@/hooks/useNextBestAction'

interface NastaHandlingProps {
  action: NextBestAction
  onDismiss: () => void
}

interface RowCopy {
  text: string
  href: string
  cta: string
}

function copyFor(action: NonNullable<NextBestAction>): RowCopy {
  switch (action.kind) {
    case 'follow-up':
      return {
        text:
          action.count === 1
            ? 'En ansökan har varit tyst i över två veckor.'
            : `${action.count} ansökningar har varit tysta i över två veckor.`,
        href: '/dashboard/sokta-tjanster?filter=uppfoljning',
        cta: 'Följ upp',
      }
    case 'af-report':
      return {
        text: `${action.monthLabel}: ${action.count} sökta jobb att rapportera.`,
        href: '/dashboard/sokta-tjanster?rapport=1',
        cta: 'Öppna rapporten',
      }
    case 'feature':
      return {
        text: action.feature.description,
        href: action.feature.href,
        cta: action.feature.cta,
      }
  }
}

export default function NastaHandling({ action, onDismiss }: NastaHandlingProps) {
  if (!action) return null

  const copy = copyFor(action)
  const warm = action.kind === 'follow-up'

  return (
    <div
      className={`flex min-h-11 flex-col gap-2 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-0 ${
        warm
          ? 'border-orange-200 bg-orange-50 text-orange-900'
          : 'border-neutral-200 bg-white text-neutral-900'
      }`}
    >
      <span className="min-w-0 text-sm sm:truncate">{copy.text}</span>

      <span className="flex shrink-0 items-center gap-4">
        <Link
          href={copy.href}
          className={`text-sm font-medium underline-offset-4 hover:underline ${
            warm ? 'text-orange-700 hover:text-orange-900' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {copy.cta}
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dölj"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors sm:h-9 sm:w-9 ${
            warm
              ? 'text-orange-700 hover:bg-orange-100'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </span>
    </div>
  )
}
