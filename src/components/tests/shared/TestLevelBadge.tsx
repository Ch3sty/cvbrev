'use client'

/**
 * Nivåmärke: testtypens ikon plus nivåindikatorn, i en rad.
 *
 * Ikonen säger vilken sorts test det är, stegen säger hur svårt. Båda är
 * custom SVG enligt primitives.tsx, aldrig lucide i en gradientruta.
 */

import {
  IlluProv,
  IlluNiva,
  TEST_KIND_ILLU,
} from '@/components/illustrations/TestIllustrations'
import { LEVEL_LABEL, type TestKind, type TestLevel } from '@/app/dashboard/tester/testConfig'

interface Props {
  kind: TestKind
  level: TestLevel
  className?: string
}

export default function TestLevelBadge({ kind, level, className }: Props) {
  const isProv = level === 'prov'
  const Kind = isProv ? IlluProv : TEST_KIND_ILLU[kind]

  return (
    <span
      className={`inline-flex items-center gap-2 text-neutral-900 ${className ?? ''}`}
    >
      <span aria-hidden="true" className="shrink-0">
        <Kind size={24} />
      </span>
      {!isProv ? (
        <span aria-hidden="true" className="shrink-0">
          <IlluNiva size={16} level={level} />
        </span>
      ) : null}
      <span className="text-xs font-medium text-neutral-600">
        {LEVEL_LABEL[level]}
      </span>
    </span>
  )
}
