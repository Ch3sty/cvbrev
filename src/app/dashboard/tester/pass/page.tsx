/**
 * Startar ett pass, en mätning, ett riktat pass eller en generalrepetition
 * (våg 3b). Länken byggs med passHref() i src/lib/traning/klient.ts:
 *
 *   /dashboard/tester/pass?typ=matning
 *   /dashboard/tester/pass?typ=pass
 *   /dashboard/tester/pass?typ=riktat&family=rotation-med-byte
 *   /dashboard/tester/pass?typ=general&format=matrigma_klassisk
 *
 * Sessionen skapas av klienten med POST (en GET-sida får aldrig skapa
 * sessioner: förhämtning och omladdning hade gjort nya). När den finns byts
 * adressen till /dashboard/tester/pass/<id> utan omladdning.
 */

import PassFlode from '@/components/traning/PassFlode'
import type { Begard } from '@/lib/traning/tillgang'
import { passSida } from './sida.server'

const TYPER: readonly Begard[] = ['matning', 'pass', 'riktat', 'general']

export default async function PassStartSida({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const forsta = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null
  const typ = forsta(sp.typ)
  const begard: Begard = TYPER.includes(typ as Begard) ? (typ as Begard) : 'pass'
  const { betalande } = await passSida()
  return (
    <PassFlode
      start={{ typ: begard, family: forsta(sp.family), format: forsta(sp.format) }}
      betalande={betalande}
    />
  )
}
