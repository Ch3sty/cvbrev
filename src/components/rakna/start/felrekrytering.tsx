/**
 * Serverdelen av kalkylatorn felrekrytering: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { FELREK_STANDARD, lasFelrek } from '@/lib/rakna/felrekrytering'
import FelrekryteringRaknare from '../FelrekryteringRaknare'

export default function FelrekryteringStart({ sok }: { sok?: Sok }) {
  return <FelrekryteringRaknare start={sok ? lasFelrek(sok) : FELREK_STANDARD} />
}
