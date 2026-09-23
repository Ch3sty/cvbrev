'use client'

/**
 * Uppsägningstid enligt LAS. Logiken ligger i src/lib/rakna/uppsagningstid.ts.
 *
 * Dagens datum kommer från servern vid första renderingen, så att HTML och
 * webbläsare visar samma sak, och byts mot webbläsarens datum direkt efter.
 */
import { useEffect, useState } from 'react'
import Segment from '@/components/shell/Segment'
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FALT_ETIKETT, FALT_INPUT, FaltPanel, Kryss } from './ui'
import {
  UPPSAGNING_KALLA,
  UPPSAGNING_STANDARD,
  beraknaUppsagning,
  idagIso,
  lasUppsagning,
  manaderText,
  uppsagningParametrar,
  type Uppsagare,
  type UppsagningIndata,
} from '@/lib/rakna/uppsagningstid'

export default function UppsagningstidRaknare({
  start = UPPSAGNING_STANDARD,
  idag: serverIdag,
}: {
  start?: UppsagningIndata
  idag: string
}) {
  const [d, setD] = useIndata(start, lasUppsagning)
  const [idag, setIdag] = useState(serverIdag)
  useEffect(() => setIdag(idagIso()), [])

  const r = beraknaUppsagning(d, idag)
  const satt = (del: Partial<UppsagningIndata>) => setD((x) => ({ ...x, ...del }))
  const ag = d.vem === 'arbetsgivare'

  const falt = (
    <FaltPanel>
      <Segment<Uppsagare>
        label="Vem säger upp"
        value={d.vem}
        onChange={(v) => satt({ vem: v })}
        options={[
          { value: 'sjalv', label: 'Jag säger upp mig' },
          { value: 'arbetsgivare', label: 'Arbetsgivaren' },
        ]}
      />
      <Kryss checked={d.prov} onChange={(v) => satt({ prov: v })}>
        Anställningen är en provanställning
      </Kryss>
      {!d.prov ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startdatum" className={FALT_ETIKETT}>
              Anställningen började
            </label>
            <input
              id="startdatum"
              type="date"
              value={d.start}
              onChange={(e) => satt({ start: e.target.value })}
              className={FALT_INPUT}
            />
          </div>
          <div>
            <label htmlFor="uppsagningsdatum" className={FALT_ETIKETT}>
              Uppsägningen lämnas
            </label>
            <input
              id="uppsagningsdatum"
              type="date"
              value={d.datum || idag}
              onChange={(e) => satt({ datum: e.target.value })}
              className={FALT_INPUT}
            />
          </div>
        </div>
      ) : null}
    </FaltPanel>
  )

  let tal: string
  let enhet: string
  let mening: string
  let premiss: string
  if (d.prov) {
    tal = 'Ingen'
    enhet = 'uppsägningstid enligt LAS'
    premiss = 'Provanställning'
    mening =
      'En provanställning får avbrytas i förtid av båda parter om inget annat avtalats (6 § LAS). Arbetsgivaren ska underrätta dig minst två veckor i förväg (31 § LAS). Kollektivavtal kan ha längre tider, till exempel en månads ömsesidig uppsägningstid.'
  } else if (!r.giltiga) {
    tal = '?'
    enhet = 'ange giltiga datum'
    premiss = ag ? 'Arbetsgivaren säger upp' : 'Du säger upp dig'
    mening = 'Uppsägningsdatumet måste vara efter startdatumet.'
  } else {
    tal = manaderText(r.manader)
    enhet = 'uppsägningstid'
    premiss = r.sistaDag ? `Sista anställningsdag ${r.sistaDag}` : ag ? 'Arbetsgivaren säger upp' : 'Du säger upp dig'
    mening = ag
      ? `Sammanlagd anställningstid ${Math.floor(r.anstallningsAr)} år ger ${r.manader} ${r.manader === 1 ? 'månads' : 'månaders'} uppsägningstid enligt 11 § LAS.`
      : 'Vid egen uppsägning gäller en månads uppsägningstid enligt 11 § LAS, oavsett anställningstid, om inte anställningsavtalet eller kollektivavtalet anger längre tid.'
  }

  return (
    <KalkylatorSkal
      slug="uppsagningstid"
      titel="Räkna ut din uppsägningstid"
      falt={falt}
      etikett={ag ? 'Uppsägning från arbetsgivaren' : 'Egen uppsägning'}
      premiss={premiss}
      tal={tal}
      enhet={enhet}
      mening={mening}
      kalla={d.prov ? 'Lagen om anställningsskydd (1982:80), 6 och 31 §§' : UPPSAGNING_KALLA}
      parametrar={uppsagningParametrar(d, idag)}
      delText={
        d.prov
          ? 'En provanställning har ingen uppsägningstid enligt LAS, men arbetsgivaren ska underrätta två veckor i förväg.'
          : `${ag ? 'När arbetsgivaren säger upp' : 'När jag säger upp mig'} blir uppsägningstiden ${manaderText(r.manader)} enligt LAS${r.sistaDag ? `, sista anställningsdag ${r.sistaDag}` : ''}.`
      }
    />
  )
}
