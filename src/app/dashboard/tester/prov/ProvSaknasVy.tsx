/**
 * 404 i rummets skal för logiktestprovets resultatsida: ett prov som inte
 * finns, har gått ut eller tillhör någon annan. Proxyn skriver om dokumentet
 * till /dashboard/tester/prov/saknas med status 404, och not-found.tsx ritar
 * samma vy när notFound() kastas vid klientnavigering. Samma mönster som
 * intervjuprovets SaknasVy.
 */

import Link from 'next/link'
import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import LyftKort from '@/components/rum/LyftKort'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { PROV_SAKNAS } from './prov-copy'

const TEXTLANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

export default function ProvSaknasVy() {
  return (
    <>
      <RumHuvud title={PROV_SAKNAS.titel} tat={false} />
      <Golv lyft>
        <LyftKort
          label={PROV_SAKNAS.kortTitel}
          titel={PROV_SAKNAS.kortTitel}
          text={PROV_SAKNAS.text}
          handling={
            <Link href="/dashboard/tester" className={KNAPP_PRIMAR}>
              {PROV_SAKNAS.lankHubb}
            </Link>
          }
        />
        <Link href="/dashboard" className={TEXTLANK}>
          {PROV_SAKNAS.lankHem}
        </Link>
      </Golv>
    </>
  )
}
