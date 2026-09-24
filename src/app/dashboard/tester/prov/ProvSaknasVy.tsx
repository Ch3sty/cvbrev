/**
 * 404 i Trådens skal för logiktestprovets resultatsida: ett prov som inte
 * finns, har gått ut eller tillhör någon annan. Proxyn skriver om dokumentet
 * till /dashboard/tester/prov/saknas med status 404, och not-found.tsx ritar
 * samma vy när notFound() kastas vid klientnavigering. Samma mönster som
 * intervjuprovets SaknasVy.
 */

import Link from 'next/link'
import PageHeader from '@/components/shell/PageHeader'
import { PROV_SAKNAS } from './prov-copy'

const PRIMAR =
  'inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover'
const TEXTLANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

export default function ProvSaknasVy() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={PROV_SAKNAS.eyebrow}
        title={PROV_SAKNAS.titel}
        description={PROV_SAKNAS.text}
        action={
          <Link href="/dashboard/tester" className={PRIMAR}>
            {PROV_SAKNAS.lankHubb}
          </Link>
        }
      />
      <Link href="/dashboard" className={TEXTLANK}>
        {PROV_SAKNAS.lankHem}
      </Link>
    </div>
  )
}
