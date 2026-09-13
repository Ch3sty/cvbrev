'use client'

/**
 * Nivåmärke: testtypens ikon plus nivåindikatorn, i en rad.
 *
 * Ikonen säger vilken sorts test det är, stegen säger hur svårt. Båda är
 * custom SVG enligt primitives.tsx. Ikonen är naken, 24 i ink-2, som på alla
 * listrader i Tråden. Med iconOnly visas bara ikonen, för hubbens rader där
 * nivån redan står i titeln.
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
  /** Bara ikonen, utan nivåsteg och etikett. */
  iconOnly?: boolean
  className?: string
}

export default function TestLevelBadge({ kind, level, iconOnly, className }: Props) {
  const isProv = level === 'prov'
  const Kind = isProv ? IlluProv : TEST_KIND_ILLU[kind]

  return (
    <span className={`inline-flex items-center gap-2 text-ink-2 ${className ?? ''}`}>
      <span aria-hidden="true" className="shrink-0">
        <Kind size={24} />
      </span>
      {!iconOnly && !isProv ? (
        <span aria-hidden="true" className="shrink-0">
          <IlluNiva size={16} level={level} />
        </span>
      ) : null}
      {!iconOnly ? (
        <span className="text-meta font-medium text-ink-3">{LEVEL_LABEL[level]}</span>
      ) : null}
    </span>
  )
}
