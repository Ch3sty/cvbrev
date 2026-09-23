'use client'

/**
 * Sourcingtratten på /rakna-ut/sourcing. Samma logik som insiktens
 * MDX-kalkylator, i src/lib/rakna/sourcing.ts.
 */
import ChoiceCard from '@/components/shell/ChoiceCard'
import KalkylatorSkal, { useIndata } from './KalkylatorSkal'
import { FaltPanel, Reglage } from './ui'
import {
  KANALER,
  SOURCING_KALLA,
  SOURCING_SPANN,
  SOURCING_STANDARD,
  beraknaSourcing,
  lasSourcing,
  sourcingParametrar,
  type SourcingIndata,
} from '@/lib/rakna/sourcing'

export default function SourcingRaknare({ start = SOURCING_STANDARD }: { start?: SourcingIndata }) {
  const [d, setD] = useIndata(start, lasSourcing)
  const r = beraknaSourcing(d)
  const satt = (del: Partial<SourcingIndata>) => setD((x) => ({ ...x, ...del }))
  const max = r.steg[0].varde

  const falt = (
    <FaltPanel>
      <div role="radiogroup" aria-label="Kanal" className="grid gap-2">
        <p className="text-sm font-medium text-ink-2">Hur ni når kandidaterna</p>
        {KANALER.map((k) => (
          <ChoiceCard
            key={k.id}
            selected={d.kanal === k.id}
            onSelect={() => satt({ kanal: k.id })}
            title={k.label}
            description={`${k.beskrivning}, ungefär ${Math.round(k.svarsfrekvens * 100)} procent svar`}
          />
        ))}
      </div>
      <Reglage
        id="tratt-anst"
        etikett="Anställningar att göra"
        value={d.anstallningar}
        min={SOURCING_SPANN.anstallningar.min}
        max={SOURCING_SPANN.anstallningar.max}
        steg={SOURCING_SPANN.anstallningar.steg}
        visa={String(d.anstallningar)}
        onChange={(v) => satt({ anstallningar: v })}
      />
      <Reglage
        id="tratt-intervju"
        etikett="Andel svar som blir intervju"
        value={d.svarTillIntervju}
        min={SOURCING_SPANN.svarTillIntervju.min}
        max={SOURCING_SPANN.svarTillIntervju.max}
        steg={SOURCING_SPANN.svarTillIntervju.steg}
        visa={`${d.svarTillIntervju} %`}
        onChange={(v) => satt({ svarTillIntervju: v })}
      />
      <Reglage
        id="tratt-hire"
        etikett="Andel intervjuer som blir anställning"
        value={d.intervjuTillAnstallning}
        min={SOURCING_SPANN.intervjuTillAnstallning.min}
        max={SOURCING_SPANN.intervjuTillAnstallning.max}
        steg={SOURCING_SPANN.intervjuTillAnstallning.steg}
        visa={`${d.intervjuTillAnstallning} %`}
        onChange={(v) => satt({ intervjuTillAnstallning: v })}
      />
      <p className="text-meta text-ink-3">
        Svarsfrekvenserna är schabloner i nivå med publicerade benchmarks: riktade, korta och individuellt skickade
        meddelanden svarar bäst. Trattens senare steg varierar med roll och marknad, justera mot era egna utfall.
      </p>
    </FaltPanel>
  )

  return (
    <KalkylatorSkal
      slug="sourcing"
      titel="Sourcingtratten"
      falt={falt}
      etikett="Sourcingtratten"
      premiss={`${d.anstallningar} ${d.anstallningar === 1 ? 'anställning' : 'anställningar'}, ${r.kanal.label.toLowerCase()}`}
      tal={`~${r.perAnstallning}`}
      enhet="riktade kontakter per anställning"
      mening={`Totalt ${r.kontakterKravs} kontakter ger ${r.steg[1].varde} svar och ${r.steg[2].varde} intervjuer på vägen.`}
      detaljer={
        <ol className="space-y-3">
          {r.steg.map((s, i) => (
            <li key={s.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink-2">{s.label}</span>
                <span className="font-semibold tabular-nums text-ink-1">{s.varde}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-insunken" aria-hidden="true">
                <div
                  className={`h-full rounded-full ${i === r.steg.length - 1 ? 'bg-positiv' : 'bg-ink-1'}`}
                  style={{ width: `${Math.max(3, Math.round((s.varde / max) * 100))}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      }
      kalla={SOURCING_KALLA}
      parametrar={sourcingParametrar(d)}
      delText={`${d.anstallningar} ${d.anstallningar === 1 ? 'anställning kräver' : 'anställningar kräver'} ungefär ${r.kontakterKravs} riktade kontakter (${r.kanal.label.toLowerCase()}), cirka ${r.perAnstallning} per anställning.`}
    />
  )
}
