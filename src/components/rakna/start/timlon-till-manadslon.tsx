/**
 * Serverdelen av kalkylatorn timlon-till-manadslon: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { TIMLON_STANDARD, lasTimlon } from '@/lib/rakna/timlon'
import TimlonManadslon from '../TimlonManadslon'

export default function TimlonStart({ sok }: { sok?: Sok }) {
  return <TimlonManadslon start={sok ? lasTimlon(sok) : TIMLON_STANDARD} />
}
