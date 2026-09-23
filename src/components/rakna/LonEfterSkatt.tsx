'use client'

/**
 * Lön efter skatt 2026. Logiken och tabelluppslaget ligger i
 * src/lib/rakna/lonEfterSkatt.ts. Skattetabellerna (122 kB) laddas efter
 * första renderingen: servern räknar startresultatet och skickar med det,
 * så sidan visar rätt tal direkt utan att tabellerna ligger i sidans
 * JavaScript.
 */
import { useEffect, useMemo, useState } from 'react'
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FALT_ETIKETT, FALT_INPUT, FaltPanel, Kryss, PostRader, TalFalt } from './ui'
import {
  KOMMUNER,
  LON_STANDARD,
  beraknaLon,
  lasLon,
  lonParametrar,
  sammanfattaLon,
  type LonIndata,
  type LonResultat,
  type Tabeller,
} from '@/lib/rakna/lonEfterSkatt'
import { decimal, kr, krTecken } from '@/lib/rakna/format'

let tabellLaddning: Promise<Tabeller> | null = null
function laddaTabeller(): Promise<Tabeller> {
  tabellLaddning ??= import('@/data/skattetabeller-2026.json').then((m) => m.default as unknown as Tabeller)
  return tabellLaddning
}

function KommunVal({ id, etikett, varde, onChange }: { id: string; etikett: string; varde: string; onChange: (n: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className={FALT_ETIKETT}>
        {etikett}
      </label>
      <select id={id} value={varde} onChange={(e) => onChange(e.target.value)} className={FALT_INPUT}>
        {KOMMUNER.map((k) => (
          <option key={k.namn} value={k.namn}>
            {k.namn}
          </option>
        ))}
      </select>
    </div>
  )
}

function siffror(s: string): number {
  return Math.max(0, parseInt(s.replace(/\s/g, ''), 10) || 0)
}

export default function LonEfterSkatt({
  start = LON_STANDARD,
  startResultat,
}: {
  start?: LonIndata
  startResultat: LonResultat
}) {
  const [d, setD] = useIndata(start, lasLon)
  const [lonText, setLonText] = useState(String(start.lon))
  const [jlonText, setJlonText] = useState(String(start.jlon))
  const [tabeller, setTabeller] = useState<Tabeller | null>(null)

  useEffect(() => {
    let levande = true
    laddaTabeller().then((t) => levande && setTabeller(t))
    return () => {
      levande = false
    }
  }, [])

  // En äldre länk kan ha satt indata efter första renderingen.
  useEffect(() => {
    setLonText((t) => (siffror(t) === d.lon ? t : String(d.lon)))
    setJlonText((t) => (siffror(t) === d.jlon ? t : String(d.jlon)))
  }, [d.lon, d.jlon])

  const r = useMemo(() => (tabeller ? beraknaLon(d, tabeller) : startResultat), [d, tabeller, startResultat])
  const s = sammanfattaLon(d, r)
  const satt = (del: Partial<LonIndata>) => setD((x) => ({ ...x, ...del }))

  const falt = (
    <FaltPanel>
      <div className="grid gap-4 sm:grid-cols-2">
        <TalFalt
          id="lon"
          etikett="Månadslön före skatt"
          enhet="kr"
          value={lonText}
          onChange={(v) => {
            setLonText(v)
            satt({ lon: siffror(v) })
          }}
        />
        <KommunVal id="kommun" etikett="Kommun" varde={d.kommun} onChange={(k) => satt({ kommun: k })} />
      </div>
      <div>
        <Kryss checked={d.kyrka} onChange={(v) => satt({ kyrka: v })}>
          Medlem i Svenska kyrkan
        </Kryss>
        <Kryss checked={d.a66} onChange={(v) => satt({ a66: v })}>
          Jag har fyllt 66 år
        </Kryss>
      </div>
      <div className="border-t border-kant pt-2">
        <Kryss checked={d.jamfor} onChange={(v) => satt({ jamfor: v })}>
          Jämför med en annan lön eller kommun
        </Kryss>
        {d.jamfor ? (
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <TalFalt
              id="lon2"
              etikett="Ny månadslön"
              enhet="kr"
              value={jlonText}
              onChange={(v) => {
                setJlonText(v)
                satt({ jlon: siffror(v) })
              }}
            />
            <KommunVal id="kommun2" etikett="Ny kommun" varde={d.jkommun} onChange={(k) => satt({ jkommun: k })} />
          </div>
        ) : null}
      </div>
    </FaltPanel>
  )

  const overTak = r.overTak ? ' Löner över 80 000 kr ligger över tabellens tak och beräknas med tabellens toppmarginal.' : ''

  return (
    <KalkylatorSkal
      slug="lon-efter-skatt"
      titel="Räkna ut lön efter skatt 2026"
      falt={falt}
      etikett="Lön efter skatt 2026"
      premiss={`${kr(d.lon)} i lön i ${d.kommun}`}
      tal={kr(r.netto)}
      enhet="kvar i handen per månad"
      mening={
        d.lon > 0
          ? `Skatteavdraget blir ${kr(r.skatt)} enligt skattetabell ${r.tab}, en effektiv skatt på ${decimal(r.effektiv * 100)} procent.${overTak}`
          : 'Skriv in din månadslön före skatt.'
      }
      segment={[
        { label: 'kvar i handen', value: Math.max(0, r.netto), visa: kr(r.netto), tone: 'ink' },
        { label: 'i skatt', value: Math.max(0, r.skatt), visa: kr(r.skatt), tone: 'stark' },
      ]}
      detaljer={
        d.jamfor ? (
          <PostRader
            rader={[
              [`Ny lön efter skatt i ${d.jkommun}`, kr(r.netto2)],
              ['Skillnad per månad', krTecken(r.diff)],
              ['Skillnad per år', krTecken(r.diff * 12)],
            ]}
          />
        ) : null
      }
      kalla={s.kalla}
      parametrar={lonParametrar(d)}
      delText={
        d.jamfor
          ? `${kr(d.lon)} i ${d.kommun} ger ${kr(r.netto)} efter skatt, ${kr(d.jlon)} i ${d.jkommun} ger ${kr(r.netto2)}. Skillnad ${krTecken(r.diff)} i månaden, räknat med Skatteverkets skattetabeller 2026.`
          : `${kr(d.lon)} i månaden i ${d.kommun} ger ${kr(r.netto)} efter skatt (skattetabell ${r.tab}, 2026).`
      }
    />
  )
}

