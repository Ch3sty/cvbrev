'use client'

/**
 * Remsan under arket (skissen, "Så växer utbudet utan att gränssnittet
 * växer"): högst tolv. "Föreslagna för dig" (tre, gratismallen först) med
 * skälet, "Gratis" och sist brickan "Alla N" som öppnar Alla-arket. Samma
 * vid 18 som vid 50. Låst medan filen skapas (villkor d).
 */
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import Miniatyr from './Miniatyr'
import { REMSA } from './texter'

export interface RemsaProps {
  katalog: readonly MallKort[]
  vald: string
  foreslagna: readonly string[]
  skal?: string
  onValj: (id: string) => void
  onAlla: () => void
  last?: boolean
  /** Utan rubrik och skäl (helskärmens fot). */
  kompakt?: boolean
}

const MAX = 12

export function remsansMallar(katalog: readonly MallKort[], foreslagna: readonly string[]): { foreslagna: MallKort[]; gratis: MallKort[] } {
  const f = foreslagna.map((id) => katalog.find((m) => m.id === id)).filter((m): m is MallKort => Boolean(m))
  const gratis = katalog.filter((m) => m.niva === 'gratis' && !foreslagna.includes(m.id))
  return { foreslagna: f, gratis: gratis.slice(0, Math.max(0, MAX - f.length)) }
}

export default function Remsa({ katalog, vald, foreslagna, skal, onValj, onAlla, last, kompakt }: RemsaProps) {
  const grupper = remsansMallar(katalog, foreslagna)
  return (
    <div>
      {!kompakt ? (
        <div className="mb-1.5">
          <p className="text-ey uppercase text-ink-3">{REMSA.foreslagna}</p>
          {skal ? <p className="mt-0.5 text-meta text-ink-2">{skal}</p> : null}
        </div>
      ) : null}
      <div
        className="flex snap-x snap-mandatory items-start gap-2 overflow-x-auto px-0.5 pb-1.5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label={REMSA.foreslagna}
      >
        {grupper.foreslagna.map((m) => (
          <div role="listitem" key={m.id}>
            <Miniatyr mall={m} vald={m.id === vald} onValj={onValj} disabled={last} />
          </div>
        ))}
        {grupper.gratis.length > 0 ? (
          <div className="flex shrink-0 self-stretch items-center border-l border-kant px-1 text-[11px] font-semibold text-ink-3" aria-hidden>
            {REMSA.gratis}
          </div>
        ) : null}
        {grupper.gratis.map((m) => (
          <div role="listitem" key={m.id}>
            <Miniatyr mall={m} vald={m.id === vald} onValj={onValj} disabled={last} />
          </div>
        ))}
        <div role="listitem" className="w-16 shrink-0">
          <button
            type="button"
            onClick={onAlla}
            disabled={last}
            className="flex aspect-[210/297] w-full items-center justify-center rounded-md border border-dashed border-kant-stark bg-papper-2 font-display text-[15px] font-extrabold text-ink-1 disabled:opacity-60"
          >
            {REMSA.alla(katalog.length)}
          </button>
        </div>
      </div>
    </div>
  )
}
