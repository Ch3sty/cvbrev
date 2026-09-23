'use client'

/**
 * Nästa handling: hemskärmens enda bläckyta (regel 3 i
 * docs/design/analys-visuell-linje-2026-09-22.html). InkPanel med scen,
 * etikett, rubrik, en mening, knappen och "Senare" som textlänk.
 *
 * Rankningen kommer från useNextBestAction och rörs inte: uppföljning först,
 * sedan AF-fönstret, sedan exakt en oprövad funktion i taget.
 */

import Link from 'next/link'
import type { NextBestAction } from '@/hooks/useNextBestAction'
import InkPanel, { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'
import { IlluScenBrev, IlluScenCv, IlluScenUppfoljning } from '@/components/illustrations/PriserScener'

interface NastaHandlingProps {
  action: NextBestAction
  onDismiss: () => void
}

function copyFor(action: NonNullable<NextBestAction>) {
  switch (action.kind) {
    case 'follow-up':
      return {
        title: action.count === 1 ? 'Följ upp en ansökan' : `Följ upp ${action.count} ansökningar`,
        text:
          action.count === 1
            ? 'Den har varit tyst i över två veckor. Ett kort mejl brukar räcka, och vi skriver utkastet från din ansökan.'
            : 'De har varit tysta i över två veckor. Ett kort mejl brukar räcka, och vi skriver utkastet från din ansökan.',
        href: '/dashboard/sokta-tjanster?filter=uppfoljning',
        cta: 'Följ upp',
        Scen: IlluScenUppfoljning,
      }
    case 'af-report':
      return {
        title: `Rapporten för ${action.monthLabel}`,
        text: `${action.count} sökta jobb att rapportera till Arbetsförmedlingen. Vi har redan fyllt i dem åt dig.`,
        href: '/dashboard/sokta-tjanster?rapport=1',
        cta: 'Öppna rapporten',
        Scen: IlluScenBrev,
      }
    case 'feature':
      return {
        title: action.feature.cta,
        text: action.feature.description,
        href: action.feature.href,
        cta: action.feature.cta,
        Scen: IlluScenCv,
      }
  }
}

export default function NastaHandling({ action, onDismiss }: NastaHandlingProps) {
  if (!action) return null
  const copy = copyFor(action)
  return (
    <InkPanel
      eyebrow="Nästa handling"
      title={copy.title}
      text={copy.text}
      scene={<copy.Scen className="h-auto w-full" />}
      action={
        <Link href={copy.href} className={INK_KNAPP}>
          {copy.cta}
        </Link>
      }
      secondary={
        <button type="button" onClick={onDismiss} className={`${INK_LANK} inline-flex min-h-11 items-center`}>
          Senare
        </button>
      }
    />
  )
}
