'use client'

/**
 * Felrekryteringens kostnad på /rakna-ut/felrekrytering. Samma logik som
 * insiktens MDX-kalkylator, i src/lib/rakna/felrekrytering.ts.
 */
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FaltPanel, Reglage } from './ui'
import {
  FELREK_KALLA,
  FELREK_STANDARD,
  LON_MAX,
  LON_MIN,
  MAN_MAX,
  MAN_MIN,
  beraknaFelrek,
  felrekParametrar,
  krTusen,
  lasFelrek,
  type FelrekIndata,
} from '@/lib/rakna/felrekrytering'
import { kr, tal } from '@/lib/rakna/format'
import type { FordelningSegment } from '@/components/shell/Fordelning'

export default function FelrekryteringRaknare({ start = FELREK_STANDARD }: { start?: FelrekIndata }) {
  const [d, setD] = useIndata(start, lasFelrek)
  const r = beraknaFelrek(d)
  const satt = (del: Partial<FelrekIndata>) => setD((x) => ({ ...x, ...del }))
  const poster: FordelningSegment[] = [
    { label: 'improduktiv lönekostnad', value: r.improduktivLon, visa: krTusen(r.improduktivLon), tone: 'ink' },
    { label: 'omrekrytering och upplärning', value: r.omrekrytering, visa: krTusen(r.omrekrytering), tone: 'stark' },
    { label: 'produktionsbortfall och team', value: r.produktionsbortfall, visa: krTusen(r.produktionsbortfall), tone: 'mjuk' },
    { label: 'annons, tester och intern tid', value: r.direkta, visa: krTusen(r.direkta), tone: 'accent' },
  ]
  const storst = poster.reduce((a, b) => (b.value > a.value ? b : a))

  const falt = (
    <FaltPanel>
      <Reglage
        id="kalkyl-lon"
        etikett="Månadslön för rollen, brutto"
        value={d.manadslon}
        min={LON_MIN}
        max={LON_MAX}
        steg={1000}
        visa={kr(d.manadslon)}
        onChange={(v) => satt({ manadslon: v })}
        minText={tal(LON_MIN)}
        maxText={tal(LON_MAX)}
      />
      <Reglage
        id="kalkyl-manader"
        etikett="Månader innan anställningen avslutas"
        value={d.manader}
        min={MAN_MIN}
        max={MAN_MAX}
        steg={1}
        visa={`${d.manader} mån`}
        onChange={(v) => satt({ manader: v })}
        minText={String(MAN_MIN)}
        maxText={String(MAN_MAX)}
      />
      <p className="text-meta text-ink-3">
        Modellen är en förenkling: arbetsgivarkostnad ungefär 1,42 gånger bruttolönen, halv produktivitet fram till
        avslut, övriga poster skalade mot lönenivån. Verkliga utfall varierar med roll, bransch och hur snabbt beslutet
        fattas.
      </p>
    </FaltPanel>
  )

  return (
    <KalkylatorSkal
      slug="felrekrytering"
      titel="Räkna ut vad en felrekrytering kostar"
      falt={falt}
      etikett="Felrekryteringens kostnad"
      premiss={`${kr(d.manadslon)} i månadslön, avslut efter ${d.manader} månader`}
      tal={krTusen(r.total)}
      enhet="för en felrekrytering"
      mening={`Största posten är ${storst.label}, ${krTusen(storst.value)}. Lönekostnaden och bortfallet växer för varje månad beslutet dröjer.`}
      segment={poster}
      kalla={FELREK_KALLA}
      parametrar={felrekParametrar(d)}
      delText={`En felrekrytering på ${kr(d.manadslon)} i månadslön som avslutas efter ${d.manader} månader kostar uppskattningsvis ${krTusen(r.total)}.`}
    />
  )
}
