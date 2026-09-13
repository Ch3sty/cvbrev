'use client'

/**
 * Puffen mot nästa nivå. En rad, inte ett kort, enligt sidmallen.
 *
 * Tonen följer resultatet: ett starkt resultat får en inbjudan uppåt, ett
 * svagare får veta att nästa nivå finns kvar när hon vill. Vi säger aldrig
 * att hon borde gå vidare när siffrorna inte backar det.
 */

import Link from 'next/link'
import StatusRow from '@/components/shell/StatusRow'
import { LEVEL_LABEL, testPaths, type TestConfig } from '@/app/dashboard/tester/testConfig'

interface Props {
  percentage: number
  next: TestConfig
}

export default function TestNextLevelRow({ percentage, next }: Props) {
  const strong = percentage >= 70
  const levelName = LEVEL_LABEL[next.level].toLowerCase()

  return (
    <StatusRow
      tone={strong ? 'positive' : 'neutral'}
      showDot={strong}
      action={
        <Link
          href={testPaths.hub(next.slug)}
          className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
        >
          Till {levelName}
        </Link>
      }
    >
      {strong
        ? `Starkt resultat. ${next.title} ger svårare mönster och visar var taket ligger.`
        : `${next.title} finns när du vill utmana dig. Träna gärna den här nivån först.`}
    </StatusRow>
  )
}
