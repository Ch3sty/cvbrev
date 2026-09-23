/**
 * Serverdelen av kalkylatorn uppsagningstid: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { UPPSAGNING_STANDARD, idagIso, lasUppsagning } from '@/lib/rakna/uppsagningstid'
import UppsagningstidRaknare from '../UppsagningstidRaknare'

export default function UppsagningStart({ sok }: { sok?: Sok }) {
  return <UppsagningstidRaknare start={sok ? lasUppsagning(sok) : UPPSAGNING_STANDARD} idag={idagIso()} />
}
