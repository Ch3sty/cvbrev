'use client'

/**
 * Vad en löneförhandling är värd över tid. Logiken ligger i
 * src/lib/rakna/loneforhandling.ts.
 */
import { useEffect, useState } from 'react'
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FaltPanel, PostRader, TalFalt } from './ui'
import {
  FORHANDLING_KALLA,
  FORHANDLING_STANDARD,
  beraknaForhandling,
  forhandlingParametrar,
  lasForhandling,
  type ForhandlingIndata,
} from '@/lib/rakna/loneforhandling'
import { kr, krTecken } from '@/lib/rakna/format'

function siffror(s: string): number {
  return Math.max(0, parseInt(s.replace(/\s/g, ''), 10) || 0)
}

export default function LoneforhandlingsKalkylator({ start = FORHANDLING_STANDARD }: { start?: ForhandlingIndata }) {
  const [d, setD] = useIndata(start, lasForhandling)
  const [lonText, setLonText] = useState(String(start.lon))
  const [hojText, setHojText] = useState(String(start.hojning))

  useEffect(() => {
    setLonText((t) => (siffror(t) === d.lon ? t : String(d.lon)))
    setHojText((t) => (siffror(t) === d.hojning ? t : String(d.hojning)))
  }, [d.lon, d.hojning])

  const r = beraknaForhandling(d)
  const satt = (del: Partial<ForhandlingIndata>) => setD((x) => ({ ...x, ...del }))

  const falt = (
    <FaltPanel>
      <TalFalt
        id="lfLon"
        etikett="Nuvarande månadslön"
        enhet="kr"
        value={lonText}
        onChange={(v) => {
          setLonText(v)
          satt({ lon: siffror(v) })
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TalFalt
          id="lfHojning"
          etikett="Förhandlad höjning per månad"
          enhet="kr"
          value={hojText}
          onChange={(v) => {
            setHojText(v)
            satt({ hojning: siffror(v) })
          }}
        />
        <TalFalt
          id="lfRevision"
          etikett="Årlig revision"
          enhet="%"
          decimal
          value={d.rev}
          onChange={(v) => satt({ rev: v })}
          hjalp="Samma takt med och utan höjningen."
        />
      </div>
    </FaltPanel>
  )

  return (
    <KalkylatorSkal
      slug="loneforhandling"
      titel="Vad är en löneförhandling värd?"
      falt={falt}
      etikett="Löneförhandlingens värde"
      premiss={`${kr(d.hojning)} mer i månaden på ${kr(d.lon)}`}
      tal={krTecken(r.ar10)}
      enhet="mer i lön över tio år"
      mening="Höjningen räknas upp med samma revision som resten av lönen, därför växer skillnaden varje år. Beloppen är före skatt, och ovanpå dem kommer tjänstepensionen, som för de flesta är 4,5 procent av lönen."
      detaljer={
        <PostRader
          rader={[
            ['Efter 5 år', krTecken(r.ar5)],
            ['Efter 10 år', krTecken(r.ar10)],
            ['Efter 20 år', krTecken(r.ar20)],
          ]}
        />
      }
      kalla={FORHANDLING_KALLA}
      parametrar={forhandlingParametrar(d)}
      delText={`${kr(d.hojning)} mer i månaden i löneförhandlingen är värt ${krTecken(r.ar10)} över tio år, när varje revision räknas på den högre lönen.`}
    />
  )
}
