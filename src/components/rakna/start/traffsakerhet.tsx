/**
 * Serverdelen av kalkylatorn traffsakerhet: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { TRAFF_STANDARD, lasTraff } from '@/lib/rakna/traffsakerhet'
import TraffsakerhetRaknare from '../TraffsakerhetRaknare'

export default function TraffsakerhetStart({ sok }: { sok?: Sok }) {
  return <TraffsakerhetRaknare start={sok ? lasTraff(sok) : TRAFF_STANDARD} />
}
