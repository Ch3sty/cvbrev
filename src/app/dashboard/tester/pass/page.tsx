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
import VnPassFlode from '@/components/traning/vnpass/VnPassFlode'
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
  // Textpasset och sifferpasset (beställning omgång 2, B3); med family ett riktat pass.
  if (typ === 'textpass' || typ === 'sifferpass') {
    await passSida()
    const kind = typ === 'textpass' ? 'verbal' : 'numerisk'
    const familj = forsta(sp.family)
    return <VnPassFlode key={`${kind}|${familj ?? ''}`} start={{ kind, familj }} />
  }
  const begard: Begard = TYPER.includes(typ as Begard) ? (typ as Begard) : 'pass'
  const { betalande } = await passSida()
  const family = forsta(sp.family)
  const format = forsta(sp.format)
  // Nyckeln monterar om flödet när en ny start begärs från samma sida. Utan
  // den återanvänder routern komponenten (mätningens resultat står kvar på
  // /pass?typ=matning), startad-spärren hindrar en ny start och "Starta
  // dagens pass" ser död ut (ägaren 2026-10-11).
  return (
    <PassFlode
      key={`${begard}|${family ?? ''}|${format ?? ''}`}
      start={{ typ: begard, family, format }}
      betalande={betalande}
    />
  )
}
