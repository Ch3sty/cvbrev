/**
 * Sektionsrubrik på golvet (spec-rummen 4.4, konceptets .sekt):
 * "Var du tappar  [Alla familjer]", 13/600 i ink-3 med valfri länk.
 *
 * Server component.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'

export interface SektRubrikProps {
  children: ReactNode
  lank?: { href: string; text: string }
  as?: 'h2' | 'p'
  /** Extra klasser på länken, till exempel lg:hidden. */
  lankKlass?: string
}

export default function SektRubrik({ children, lank, as = 'h2', lankKlass }: SektRubrikProps) {
  const Tag = as
  return (
    <div className="mx-1 -mb-2 mt-1 flex items-baseline justify-between gap-3">
      <Tag className="text-[13px] font-semibold leading-[18px] text-ink-3">{children}</Tag>
      {lank ? (
        <Link
          href={lank.href}
          className={`text-[13px] font-medium leading-[18px] text-ink-1 underline decoration-kant-stark underline-offset-4 ${lankKlass ?? ''}`}
        >
          {lank.text}
        </Link>
      ) : null}
    </div>
  )
}
