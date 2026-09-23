/**
 * Serverdelen av kalkylatorn loneforhandling: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { FORHANDLING_STANDARD, lasForhandling } from '@/lib/rakna/loneforhandling'
import LoneforhandlingsKalkylator from '../LoneforhandlingsKalkylator'

export default function LoneforhandlingStart({ sok }: { sok?: Sok }) {
  return <LoneforhandlingsKalkylator start={sok ? lasForhandling(sok) : FORHANDLING_STANDARD} />
}
