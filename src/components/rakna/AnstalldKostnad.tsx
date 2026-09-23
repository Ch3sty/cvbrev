'use client'

/**
 * Vad kostar en anställd 2026. Logiken ligger i src/lib/rakna/anstalldKostnad.ts.
 */
import { useEffect, useState } from 'react'
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FaltPanel, Kryss, PostRader, TalFalt } from './ui'
import {
  ANSTALLD_KALLA,
  ANSTALLD_STANDARD,
  anstalldParametrar,
  beraknaAnstalld,
  lasAnstalld,
  type AnstalldIndata,
} from '@/lib/rakna/anstalldKostnad'
import { decimal, kr } from '@/lib/rakna/format'

function siffror(s: string): number {
  return Math.max(0, parseInt(s.replace(/\s/g, ''), 10) || 0)
}

export default function AnstalldKostnad({ start = ANSTALLD_STANDARD }: { start?: AnstalldIndata }) {
  const [d, setD] = useIndata(start, lasAnstalld)
  const [lonText, setLonText] = useState(String(start.lon))
  const [dagarText, setDagarText] = useState(String(start.dagar))

  useEffect(() => {
    setLonText((t) => (siffror(t) === d.lon ? t : String(d.lon)))
    setDagarText((t) => (siffror(t) === d.dagar ? t : String(d.dagar)))
  }, [d.lon, d.dagar])

  const r = beraknaAnstalld(d)
  const satt = (del: Partial<AnstalldIndata>) => setD((x) => ({ ...x, ...del }))
  const avtalskostnad = r.pension + r.slp + r.forsakringar

  const falt = (
    <FaltPanel>
      <div className="grid gap-4 sm:grid-cols-2">
        <TalFalt
          id="akLon"
          etikett="Månadslön före skatt"
          enhet="kr"
          value={lonText}
          onChange={(v) => {
            setLonText(v)
            satt({ lon: siffror(v) })
          }}
        />
        <TalFalt
          id="akDagar"
          etikett="Semesterdagar"
          value={dagarText}
          onChange={(v) => {
            setDagarText(v)
            satt({ dagar: siffror(v) })
          }}
        />
      </div>
      <div>
        <Kryss checked={d.avtal} onChange={(v) => satt({ avtal: v })}>
          Kollektivavtal med tjänstepension (ITP1)
        </Kryss>
        <Kryss checked={d.ung} onChange={(v) => satt({ ung: v })}>
          Den anställda är 18 till 22 år
        </Kryss>
      </div>
    </FaltPanel>
  )

  const rader: [string, string][] = [
    ['Bruttolön', kr(d.lon)],
    ['Semestertillägg, utslaget per månad', kr(r.semestertillagg)],
    [d.ung ? 'Arbetsgivaravgift, nedsatt för unga' : 'Arbetsgivaravgift 31,42 %', kr(r.aga)],
    ...(d.avtal
      ? ([
          ['Tjänstepension ITP1', kr(r.pension)],
          ['Särskild löneskatt på pensionen 24,26 %', kr(r.slp)],
          ['Avtalsförsäkringar (TGL, TFA, TRR med flera)', kr(r.forsakringar)],
        ] as [string, string][])
      : []),
  ]

  return (
    <KalkylatorSkal
      slug="vad-kostar-en-anstalld"
      titel="Vad kostar en anställd?"
      falt={falt}
      etikett="Vad kostar en anställd?"
      premiss={`${kr(d.lon)} i månadslön${d.avtal ? ' med kollektivavtal' : ''}`}
      tal={kr(r.total)}
      enhet="i månaden för arbetsgivaren"
      mening={
        d.lon > 0
          ? `Det är ${decimal(r.faktor, 2)} gånger bruttolönen och ${kr(r.total * 12)} om året, före utrustning, lokal och rekrytering.`
          : 'Skriv in månadslönen före skatt.'
      }
      segment={[
        { label: 'lön och semestertillägg', value: d.lon + r.semestertillagg, visa: kr(d.lon + r.semestertillagg), tone: 'ink' },
        { label: 'arbetsgivaravgift', value: r.aga, visa: kr(r.aga), tone: 'stark' },
        { label: 'pension, löneskatt och försäkringar', value: avtalskostnad, visa: kr(avtalskostnad), tone: 'mjuk' },
      ]}
      detaljer={<PostRader rader={rader} />}
      kalla={ANSTALLD_KALLA}
      parametrar={anstalldParametrar(d)}
      delText={`En anställd med ${kr(d.lon)} i månaden kostar ${kr(r.total)} i månaden (${kr(r.total * 12)} om året) 2026, med arbetsgivaravgift${d.avtal ? ', ITP1 och särskild löneskatt' : ''}.`}
    />
  )
}
