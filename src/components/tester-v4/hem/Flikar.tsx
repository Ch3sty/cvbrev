/**
 * Flikarna på golvet (skissens wflikar): Hem, Tester, Din utveckling. På
 * dator står samma tre i sidomenyn; på mobil är det här vägen mellan vyerna,
 * eftersom dörrnavet bara har rummen. Aktiv flik med kopparlinje och
 * aria-current. Server component.
 */

import Link from 'next/link'
import { HEM_HREF, TESTER_HREF, UTVECKLING_HREF } from '@/lib/tester/v4/rutter'
import { HEM_V4 } from './copy'

export type Flik = 'hem' | 'tester' | 'utveckling'

const FLIKAR: { id: Flik; href: string; text: string }[] = [
  { id: 'hem', href: HEM_HREF, text: HEM_V4.flikar.hem },
  { id: 'tester', href: TESTER_HREF, text: HEM_V4.flikar.tester },
  { id: 'utveckling', href: UTVECKLING_HREF, text: HEM_V4.flikar.utveckling },
]

export default function Flikar({ aktiv }: { aktiv: Flik }) {
  return (
    <nav aria-label={HEM_V4.flikar.etikett} className="-mt-1 flex gap-1.5 border-b border-kant" data-flikar>
      {FLIKAR.map((f) => (
        <Link
          key={f.id}
          href={f.href}
          aria-current={f.id === aktiv ? 'page' : undefined}
          className={`-mb-px inline-flex h-11 items-center border-b-2 px-3.5 text-sm font-semibold ${
            f.id === aktiv ? 'border-koppar text-ink-1' : 'border-transparent text-ink-3'
          }`}
        >
          {f.text}
        </Link>
      ))}
    </nav>
  )
}
