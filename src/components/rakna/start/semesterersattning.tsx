/**
 * Serverdelen av kalkylatorn semesterersattning: räknar startläget (förvalen eller en
 * delad länks parametrar) och renderar klientkalkylatorn med det. En fil per
 * kalkylator, så att varje sida bara laddar sin egen klientkod.
 */
import type { Sok } from '@/lib/rakna/sok'
import { SEMESTER_STANDARD, lasSemester } from '@/lib/rakna/semester'
import SemesterersattningRaknare from '../SemesterersattningRaknare'

export default function SemesterStart({ sok }: { sok?: Sok }) {
  return <SemesterersattningRaknare start={sok ? lasSemester(sok) : SEMESTER_STANDARD} />
}
