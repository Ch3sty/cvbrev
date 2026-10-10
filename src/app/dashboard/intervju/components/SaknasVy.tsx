/**
 * 404 i rummets skal för /dashboard/intervju: ett prov eller en tolkning som
 * inte finns eller tillhör någon annan. Proxyn skriver om dokumentet till
 * /dashboard/intervju/saknas med status 404, och not-found.tsx ritar samma vy
 * när notFound() kastas vid klientnavigering.
 */

import Link from 'next/link'
import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import LyftKort from '@/components/rum/LyftKort'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { INFOR_INTERVJUN_HREF } from '@/lib/intervju/lankar'
import { SAKNAS } from '../infor-intervjun-copy'
import { TEXTLANK } from './ProvRad'

export default function SaknasVy() {
  return (
    <>
      <RumHuvud title={SAKNAS.titel} tat={false} />
      <Golv lyft>
        <LyftKort
          label={SAKNAS.kortTitel}
          titel={SAKNAS.kortTitel}
          text={SAKNAS.text}
          handling={
            <Link href={INFOR_INTERVJUN_HREF} className={KNAPP_PRIMAR}>
              {SAKNAS.lankHubb}
            </Link>
          }
        />
        <Link href="/dashboard" className={TEXTLANK}>
          {SAKNAS.lankHem}
        </Link>
      </Golv>
    </>
  )
}
