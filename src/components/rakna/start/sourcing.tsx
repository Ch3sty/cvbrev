/**
 * Serverdelen av kalkylatorn sourcing: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { SOURCING_STANDARD, lasSourcing } from '@/lib/rakna/sourcing'
import SourcingRaknare from '../SourcingRaknare'

export default function SourcingStart({ sok }: { sok?: Sok }) {
  return <SourcingRaknare start={sok ? lasSourcing(sok) : SOURCING_STANDARD} />
}
