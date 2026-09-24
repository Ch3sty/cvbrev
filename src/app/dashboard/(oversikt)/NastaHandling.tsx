'use client'

/**
 * Nästa handling: hemskärmens enda bläckyta (regel 3 i
 * docs/design/analys-visuell-linje-2026-09-22.html). InkPanel med scen,
 * etikett, rubrik, en mening, knappen och "Senare" som textlänk.
 *
 * Rankningen kommer från useNextBestAction och rörs inte: uppföljning först,
 * sedan AF-fönstret, sedan exakt en oprövad funktion i taget.
 */

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { GRUNDTEST_HREF, nyttProvHref } from '@/lib/intervju/lankar'
import { getTestConfig, testPaths } from '@/app/dashboard/tester/testConfig'
import { nar } from '@/lib/intervju/nasta'
import { HEM } from '@/app/dashboard/intervju/infor-intervjun-copy'
import type { NextBestAction } from '@/hooks/useNextBestAction'
import InkPanel, { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'
import { IlluScenBrev, IlluScenCv, IlluScenIntervju, IlluScenMatris, IlluScenUppfoljning } from '@/components/illustrations/PriserScener'

interface NastaHandlingProps {
  action: NextBestAction
  onDismiss: () => void
  /** Ersätter "Senare", till exempel CV-länken i träningsfokus. */
  secondary?: ReactNode
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
    case 'interview-rewrite':
      return {
        title: HEM.omskrivning.rubrik(action.prov.question),
        text: HEM.omskrivning.text(action.prov.level, nar(action.prov.createdAt), action.prov.missingKind, action.prov.question),
        href: nyttProvHref(action.prov.question),
        cta: HEM.omskrivning.knapp,
        Scen: IlluScenIntervju,
      }
    case 'personality-full':
      return {
        title: HEM.helaTestet.rubrik,
        text: HEM.helaTestet.text,
        href: GRUNDTEST_HREF,
        cta: HEM.helaTestet.knapp,
        Scen: IlluScenIntervju,
      }
    case 'interview-new':
      return {
        title: HEM.traning.nyFraga.rubrik(action.fraga),
        text: HEM.traning.nyFraga.text(action.fraga),
        href: nyttProvHref(action.fraga),
        cta: HEM.traning.nyFraga.knapp,
        Scen: IlluScenIntervju,
      }
    case 'test-next': {
      const titel = getTestConfig(action.slug)?.title ?? ''
      return {
        title: action.forsta ? HEM.traning.test.forstaRubrik : HEM.traning.test.rubrik(titel),
        text: action.forsta ? HEM.traning.test.forstaText : HEM.traning.test.text,
        href: testPaths.hub(action.slug),
        cta: HEM.traning.test.knapp,
        Scen: IlluScenMatris,
      }
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

export default function NastaHandling({ action, onDismiss, secondary }: NastaHandlingProps) {
  const kind = action?.kind ?? null
  // Mätningen av de nya stegen (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 4).
  useEffect(() => {
    if (kind) capture('next_action_shown', { kind, surface: 'hem' })
  }, [kind])
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
        secondary ?? (
          <button type="button" onClick={onDismiss} className={`${INK_LANK} inline-flex min-h-11 items-center`}>
            Senare
          </button>
        )
      }
    />
  )
}
