'use client'

/**
 * Timlön till månadslön och tillbaka. Logiken ligger i src/lib/rakna/timlon.ts.
 */
import Segment from '@/components/shell/Segment'
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FaltPanel, TalFalt } from './ui'
import {
  TIMLON_FORVAL,
  TIMLON_KALLA,
  TIMLON_STANDARD,
  beraknaTimlon,
  lasTimlon,
  sammanfattaTimlon,
  timlonParametrar,
  type TimlonIndata,
  type TimlonRiktning,
} from '@/lib/rakna/timlon'
import { kr } from '@/lib/rakna/format'

export default function TimlonManadslon({ start = TIMLON_STANDARD }: { start?: TimlonIndata }) {
  const [d, setD] = useIndata(start, lasTimlon)
  const r = beraknaTimlon(d)
  const s = sammanfattaTimlon(d, r)
  const satt = (del: Partial<TimlonIndata>) => setD((x) => ({ ...x, ...del }))
  const tillManad = d.riktning === 'tillManad'

  const falt = (
    <FaltPanel>
      <Segment<TimlonRiktning>
        label="Vad du vill räkna om"
        value={d.riktning}
        onChange={(v) => satt({ riktning: v, belopp: TIMLON_FORVAL[v] })}
        options={[
          { value: 'tillManad', label: 'Timlön till månadslön' },
          { value: 'tillTim', label: 'Månadslön till timlön' },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TalFalt
          id="belopp"
          etikett={tillManad ? 'Timlön' : 'Månadslön'}
          enhet="kr"
          decimal
          value={d.belopp}
          onChange={(v) => satt({ belopp: v })}
        />
        <TalFalt
          id="timmar"
          etikett="Arbetstimmar per månad"
          decimal
          value={d.timmar}
          onChange={(v) => satt({ timmar: v })}
          hjalp="174 timmar är heltid med 40-timmarsvecka."
        />
      </div>
    </FaltPanel>
  )

  return (
    <KalkylatorSkal
      slug="timlon-till-manadslon"
      titel="Räkna om timlön till månadslön"
      falt={falt}
      etikett={s.namn}
      premiss={tillManad ? `${d.belopp} kr i timmen` : `${kr(r.beloppNum)} i månaden`}
      tal={s.tal}
      enhet={s.enhet}
      mening={`Räknat på ${d.timmar} timmar i månaden blir årslönen ${kr(r.arslon)} före skatt. Semesterlön och ob-tillägg ingår inte.`}
      kalla={TIMLON_KALLA}
      parametrar={timlonParametrar(d)}
      delText={
        tillManad
          ? `${d.belopp} kr i timmen är ${kr(r.resultat)} i månaden och ${kr(r.arslon)} om året, räknat på ${d.timmar} timmar.`
          : `${kr(r.beloppNum)} i månaden är ${s.tal} i timmen, räknat på ${d.timmar} timmar.`
      }
    />
  )
}
