'use client'

/**
 * Träffsäkerhetssimulatorn på /rakna-ut/traffsakerhet. Samma logik som
 * insiktens MDX-kalkylator, i src/lib/rakna/traffsakerhet.ts.
 */
import ChoiceCard from '@/components/shell/ChoiceCard'
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FaltPanel, Reglage } from './ui'
import {
  METODER,
  TRAFF_KALLA,
  TRAFF_SPANN,
  TRAFF_STANDARD,
  beraknaTraff,
  lasTraff,
  traffParametrar,
  type TraffIndata,
} from '@/lib/rakna/traffsakerhet'
import { decimal } from '@/lib/rakna/format'

export default function TraffsakerhetRaknare({ start = TRAFF_STANDARD }: { start?: TraffIndata }) {
  const [d, setD] = useIndata(start, lasTraff)
  const r = beraknaTraff(d)
  const satt = (del: Partial<TraffIndata>) => setD((x) => ({ ...x, ...del }))
  const procent = Math.round(r.vald.andel * 100)

  const falt = (
    <FaltPanel>
      <div role="radiogroup" aria-label="Urvalsmetod" className="grid gap-2 sm:grid-cols-2">
        <p className="text-sm font-medium text-ink-2 sm:col-span-2">Hur ni väljer</p>
        {METODER.map((m) => (
          <ChoiceCard
            key={m.id}
            selected={d.metod === m.id}
            onSelect={() => satt({ metod: m.id })}
            title={m.label}
            description={`Validitet ${decimal(m.r, 2)}`}
          />
        ))}
      </div>
      <Reglage
        id="sim-bas"
        etikett="Andel av kandidaterna som skulle klara rollen"
        value={d.basfrekvens}
        min={TRAFF_SPANN.basfrekvens.min}
        max={TRAFF_SPANN.basfrekvens.max}
        steg={TRAFF_SPANN.basfrekvens.steg}
        visa={`${d.basfrekvens} %`}
        onChange={(v) => satt({ basfrekvens: v })}
        minText="30 %"
        maxText="70 %"
      />
      <Reglage
        id="sim-kvot"
        etikett="Andel av kandidaterna ni anställer"
        value={d.selektionskvot}
        min={TRAFF_SPANN.selektionskvot.min}
        max={TRAFF_SPANN.selektionskvot.max}
        steg={TRAFF_SPANN.selektionskvot.steg}
        visa={`${d.selektionskvot} %`}
        onChange={(v) => satt({ selektionskvot: v })}
        minText="5 %"
        maxText="60 %"
      />
      <p className="text-meta text-ink-3">
        Modellen är en förenkling enligt Taylor-Russell. Den förutsätter att testresultaten är kandidatens verifierade
        egna; oövervakade omtag sänker siffrorna.
      </p>
    </FaltPanel>
  )

  return (
    <KalkylatorSkal
      slug="traffsakerhet"
      titel="Träffsäkerhetssimulatorn"
      falt={falt}
      etikett="Träffsäkerhet"
      premiss={r.vald.label}
      tal={`${r.avTio} av 10`}
      enhet="rekryteringar förväntas lyckas"
      mening={`${procent} procent när ni anställer ${d.selektionskvot} procent av kandidaterna och ${d.basfrekvens} procent skulle klara rollen.`}
      detaljer={
        <div>
          <div className="flex gap-2" role="img" aria-label={`${r.avTio} av 10 rekryteringar lyckas`}>
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className={`h-6 w-6 rounded-full sm:h-7 sm:w-7 ${i < r.avTio ? 'bg-ink-1' : 'border-2 border-kant-stark'}`}
              />
            ))}
          </div>
          <p className="mt-4 text-sm font-medium text-ink-2">Samma förutsättningar, andra metoder</p>
          <ul className="mt-2 space-y-2">
            {r.resultat.map((m) => (
              <li key={m.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={m.id === d.metod ? 'font-semibold text-ink-1' : 'text-ink-2'}>{m.label}</span>
                  <span className="font-semibold tabular-nums text-ink-1">{Math.round(m.andel * 100)} %</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-insunken" aria-hidden="true">
                  <div
                    className={`h-full rounded-full ${m.id === d.metod ? 'bg-ink-1' : 'bg-kant-stark'}`}
                    style={{ width: `${Math.round(m.andel * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      }
      kalla={TRAFF_KALLA}
      parametrar={traffParametrar(d)}
      delText={`Med ${r.vald.label.toLowerCase()} förväntas ${r.avTio} av 10 rekryteringar lyckas (${procent} procent), enligt urvalsforskningens validitetssiffror.`}
    />
  )
}
