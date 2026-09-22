/**
 * Nakna ikoner i 24 för den publika navigationen, ur Ikoner.tsx. Inga rutor,
 * ingen orange: ikonen står i ink-2 bredvid etiketten (designsystem §7).
 */

import {
  IkonAnalys,
  IkonBalanserad,
  IkonBrev,
  IkonCv,
  IkonEntusiastisk,
  IkonKrona,
  IkonLank,
  IkonMallar,
  IkonMatchning,
  IkonSynlig,
  type IkonProps,
} from '@/components/illustrations/Ikoner'
import type { NavIkon as NavIkonNamn } from './nav-data'

const KARTA: Record<NavIkonNamn, (p: IkonProps) => React.ReactElement> = {
  brev: IkonBrev,
  analys: IkonAnalys,
  cv: IkonCv,
  mallar: IkonMallar,
  lank: IkonLank,
  matchning: IkonMatchning,
  synlig: IkonSynlig,
  tester: IkonBalanserad,
  coach: IkonEntusiastisk,
  krona: IkonKrona,
}

export default function NavIkon({ namn, className }: { namn: NavIkonNamn; className?: string }) {
  const Ikon = KARTA[namn]
  return <Ikon size={24} className={className} />
}
