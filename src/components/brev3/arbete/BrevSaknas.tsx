/**
 * Brevet finns inte (borttaget, eller en annan användares id). Ett låst
 * brev hamnar aldrig här: det öppnas som låst i Brevet.
 */
import Link from 'next/link'
import { IkonTillbaka } from '@/components/brev3/kit'
import ArbetsRam from './ArbetsRam'

export default function BrevSaknas() {
  return (
    <ArbetsRam>
      <div className="b3-yta">
        <div className="b3-yta-inre">
          <header className="b3-huvud">
            <Link href="/dashboard/mina-brev" className="b3-kryss" aria-label="Tillbaka till dina brev">
              <IkonTillbaka />
            </Link>
          </header>
          <div className="mx-auto mt-16 w-full max-w-[480px] px-4 text-center">
            <h1 className="b3-h1">Brevet finns inte</h1>
            <p className="b3-ingress mx-auto">Det kan ha tagits bort. Alla dina brev ligger under Dina brev.</p>
            <Link href="/dashboard/mina-brev" className="b3-vit mt-6">
              Till dina brev
            </Link>
          </div>
        </div>
      </div>
    </ArbetsRam>
  )
}
