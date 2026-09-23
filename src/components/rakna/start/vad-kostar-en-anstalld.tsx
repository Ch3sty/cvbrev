/**
 * Serverdelen av kalkylatorn vad-kostar-en-anstalld: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { ANSTALLD_STANDARD, lasAnstalld } from '@/lib/rakna/anstalldKostnad'
import AnstalldKostnad from '../AnstalldKostnad'

export default function AnstalldKostnadStart({ sok }: { sok?: Sok }) {
  return <AnstalldKostnad start={sok ? lasAnstalld(sok) : ANSTALLD_STANDARD} />
}
