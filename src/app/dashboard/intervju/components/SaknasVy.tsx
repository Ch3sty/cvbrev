/**
 * 404 i Trådens skal för /dashboard/intervju: ett prov eller en tolkning som
 * inte finns eller tillhör någon annan. Proxyn skriver om dokumentet till
 * /dashboard/intervju/saknas med status 404, och not-found.tsx ritar samma vy
 * när notFound() kastas vid klientnavigering.
 */

import Link from 'next/link'
import PageHeader from '@/components/shell/PageHeader'
import { INFOR_INTERVJUN_HREF } from '@/lib/intervju/lankar'
import { SAKNAS } from '../infor-intervjun-copy'
import { TEXTLANK } from './ProvRad'

const PRIMAR =
  'inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover'

export default function SaknasVy() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={SAKNAS.eyebrow}
        title={SAKNAS.titel}
        description={SAKNAS.text}
        action={
          <Link href={INFOR_INTERVJUN_HREF} className={PRIMAR}>
            {SAKNAS.lankHubb}
          </Link>
        }
      />
      <Link href="/dashboard" className={TEXTLANK}>
        {SAKNAS.lankHem}
      </Link>
    </div>
  )
}
