'use client'

/**
 * Semesterersättning och semesterlön enligt semesterlagen. Logiken ligger i
 * src/lib/rakna/semester.ts.
 */
import { useEffect, useState } from 'react'
import Segment from '@/components/shell/Segment'
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FaltPanel, TalFalt } from './ui'
import {
  SEMESTER_STANDARD,
  beraknaSemester,
  lasSemester,
  semesterKalla,
  semesterParametrar,
  type SemesterIndata,
  type SemesterLage,
} from '@/lib/rakna/semester'
import { kr, tal } from '@/lib/rakna/format'

function siffror(s: string): number {
  return Math.max(0, parseInt(s.replace(/\s/g, ''), 10) || 0)
}

export default function SemesterersattningRaknare({ start = SEMESTER_STANDARD }: { start?: SemesterIndata }) {
  const [d, setD] = useIndata(start, lasSemester)
  const [manadText, setManadText] = useState(String(start.manadslon))
  const [dagarText, setDagarText] = useState(String(start.dagar))
  const [arText, setArText] = useState(String(start.arslon))

  useEffect(() => {
    setManadText((t) => (siffror(t) === d.manadslon ? t : String(d.manadslon)))
    setDagarText((t) => (siffror(t) === d.dagar ? t : String(d.dagar)))
    setArText((t) => (siffror(t) === d.arslon ? t : String(d.arslon)))
  }, [d.manadslon, d.dagar, d.arslon])

  const r = beraknaSemester(d)
  const satt = (del: Partial<SemesterIndata>) => setD((x) => ({ ...x, ...del }))

  const falt = (
    <FaltPanel>
      <Segment<SemesterLage>
        label="Hur du får lön"
        value={d.lage}
        onChange={(v) => satt({ lage: v })}
        options={[
          { value: 'manadslon', label: 'Månadslön' },
          { value: 'procent', label: 'Timlön eller rörlig' },
        ]}
      />
      {d.lage === 'manadslon' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TalFalt
            id="semManadslon"
            etikett="Månadslön"
            enhet="kr"
            value={manadText}
            onChange={(v) => {
              setManadText(v)
              satt({ manadslon: siffror(v) })
            }}
          />
          <TalFalt
            id="semDagar"
            etikett="Sparade semesterdagar"
            value={dagarText}
            onChange={(v) => {
              setDagarText(v)
              satt({ dagar: siffror(v) })
            }}
          />
        </div>
      ) : (
        <TalFalt
          id="semArslon"
          etikett="Sammanlagd lön under intjänandeåret"
          enhet="kr"
          value={arText}
          onChange={(v) => {
            setArText(v)
            satt({ arslon: siffror(v) })
          }}
          hjalp="Procentregeln gäller den som har timlön eller stora rörliga delar."
        />
      )}
    </FaltPanel>
  )

  const manad = d.lage === 'manadslon'
  const dagarTotal = r.dagslonPerDag * d.dagar
  const tillaggTotal = r.tillaggPerDag * d.dagar

  return (
    <KalkylatorSkal
      slug="semesterersattning"
      titel="Räkna ut semesterersättning"
      falt={falt}
      etikett={manad ? 'Semesterersättning, sammalöneregeln' : 'Semesterlön, procentregeln'}
      premiss={manad ? `${kr(d.manadslon)} i månadslön, ${tal(d.dagar)} sparade dagar` : `${kr(d.arslon)} i lön under intjänandeåret`}
      tal={kr(manad ? r.totaltManadslon : r.totaltProcent)}
      enhet={manad ? 'i semesterersättning' : 'i semesterlön'}
      mening={
        manad
          ? `Varje sparad dag ersätts med ${kr(r.ersattningPerDag)}: dagslön, 4,6 procent av månadslönen, plus semestertillägg på 0,43 procent. Tillsammans 5,03 procent per dag.`
          : 'Tolv procent av den förfallna lönen under intjänandeåret (16 b § semesterlagen). Betalas ofta ut per uttagen dag, eller som semesterersättning när anställningen tar slut.'
      }
      segment={
        manad
          ? [
              { label: 'dagslön', value: dagarTotal, visa: kr(dagarTotal), tone: 'ink' },
              { label: 'semestertillägg', value: tillaggTotal, visa: kr(tillaggTotal), tone: 'stark' },
            ]
          : undefined
      }
      kalla={semesterKalla(d.lage)}
      parametrar={semesterParametrar(d)}
      delText={
        manad
          ? `${tal(d.dagar)} sparade semesterdagar på ${kr(d.manadslon)} i månadslön ger ${kr(r.totaltManadslon)} i semesterersättning enligt semesterlagen.`
          : `Tolv procent av ${kr(d.arslon)} ger ${kr(r.totaltProcent)} i semesterlön enligt procentregeln.`
      }
    />
  )
}
