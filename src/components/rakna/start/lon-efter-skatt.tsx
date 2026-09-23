/**
 * Serverdelen av kalkylatorn lon-efter-skatt: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { LON_STANDARD, beraknaLon, lasLon } from '@/lib/rakna/lonEfterSkatt'
import { TABELLER } from '@/lib/rakna/sammanfattning'
import LonEfterSkatt from '../LonEfterSkatt'

export default function LonEfterSkattStart({ sok }: { sok?: Sok }) {
  const start = sok ? lasLon(sok) : LON_STANDARD
  return <LonEfterSkatt start={start} startResultat={beraknaLon(start, TABELLER)} />
}
