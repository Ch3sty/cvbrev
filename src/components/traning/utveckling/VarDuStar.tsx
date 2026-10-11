/**
 * "Var du står" (skiss Provbladet, avsnitt 2): fördelningen på en nivå med
 * din linje i, och 25-regeln. Under 25 slutförda test på en nivå står
 * räknaren "14 av 25" i stället för en jämförelse, aldrig ett påhittat tal.
 *
 * Huvudnivån är den jämförbara nivå hon gjort flest gånger. Övriga nivåer
 * står som rader: en stapel till percentilen, räknaren eller en uppmaning
 * när hon bara har gamla (oblandade) försök på nivån.
 */

import { klassiskt } from './katalog'
import { poangTillProcent, raknarAndel, staplar, tjugofemRegeln, type Fordelning } from './fordelning'
import type { VarDuStarNiva } from './typer'
import { UTV } from './copy'
import { Eyebrow, UKort } from './delar'

const S = UTV.star

interface Rad {
  niva: VarDuStarNiva
  namn: string
  j: ReturnType<typeof tjugofemRegeln>
}

export function varDuStarRader(nivaer: readonly VarDuStarNiva[]): { huvud: Rad | null; ovriga: Rad[] } {
  const rader: Rad[] = nivaer.map((n) => ({ niva: n, namn: klassiskt(n.slug).namn, j: tjugofemRegeln(n.fordelning, n.egenPoang) }))
  const visas = rader.filter((r) => r.j.lage === 'visas').sort((a, b) => b.niva.egnaForsok - a.niva.egnaForsok)
  const huvud = visas[0] ?? null
  return { huvud, ovriga: rader.filter((r) => r !== huvud) }
}

function Fordelningsbild({ f, egenPoang, namn, percentil }: { f: Fordelning; egenPoang: number; namn: string; percentil: number }) {
  const s = staplar(f)
  const W = 340
  const H = 64
  const bas = 56
  const du = (poangTillProcent(f, egenPoang) / 100) * W
  const duVanster = du > W * 0.82
  return (
    <div className="relative mt-3.5">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={S.fordelningAria(namn, percentil)} className="block h-auto w-full overflow-visible">
        <line x1="0" x2={W} y1={bas} y2={bas} stroke="var(--kant)" strokeWidth="1" />
        {s.map((st, i) => {
          const x = (st.fran / 100) * W
          const w = Math.max(1, ((st.till - st.fran) / 100) * W - 2)
          const h = Math.max(st.antal ? 3 : 0, st.hojd * (bas - 10))
          return <rect key={i} x={x + 1} y={bas - h} width={w} height={h} rx="2" fill="var(--ton)" stroke="var(--ton-ink)" strokeOpacity=".35" strokeWidth="1" />
        })}
        <line x1={du} x2={du} y1="2" y2={bas} stroke="var(--koppar)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span
          className="absolute top-0 whitespace-nowrap font-display text-[13px] font-bold leading-4 text-koppar-ink"
          style={{ left: `${((du / W) * 100).toFixed(2)}%`, transform: duVanster ? 'translateX(calc(-100% - 6px))' : 'translateX(6px)' }}
        >
          {S.du}
        </span>
      </div>
      <div aria-hidden="true" className="mt-1 flex justify-between text-ax font-medium text-ink-3">
        <span>{S.axel.noll}</span>
        <span>{S.axel.halften}</span>
        <span>{S.axel.hundra}</span>
      </div>
    </div>
  )
}

function OvrigRad({ r }: { r: Rad }) {
  const j = r.j
  if (j.lage === 'raknare') {
    return (
      <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1" aria-label={S.raknareAria(r.namn, j.antal, j.mal)} data-raknare={r.niva.slug}>
        <span className="text-[13px] font-medium leading-[18px] text-ink-2">{r.namn}</span>
        <span className="text-meta tabular-nums text-ink-3">{S.raknareMeta(j.antal, j.mal)}</span>
        <span className="col-span-2 block h-1.5 overflow-hidden rounded-full border border-kant bg-papper-2">
          <i className="block h-full rounded-full bg-kant-stark" style={{ width: `${Math.round(raknarAndel(j.antal, j.mal) * 100)}%` }} />
        </span>
      </li>
    )
  }
  if (j.lage === 'utanEget') {
    return (
      <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3">
        <span className="text-[13px] font-medium leading-[18px] text-ink-2">{r.namn}</span>
        <span className="text-meta text-ink-3">{S.utanEget}</span>
      </li>
    )
  }
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1" aria-label={`${r.namn}: ${S.battreAn.toLowerCase()} ${j.percentil} procent`}>
      <span className="text-[13px] font-medium leading-[18px] text-ink-2">{r.namn}</span>
      <span className="font-display text-[15px] font-bold tabular-nums text-ink-1">{j.percentil} %</span>
      <span className="col-span-2 block h-1.5 overflow-hidden rounded-full border border-kant bg-papper-2">
        <i className="block h-full rounded-full bg-ton-ink" style={{ width: `${j.percentil}%` }} />
      </span>
    </li>
  )
}

export default function VarDuStar({ nivaer, className }: { nivaer: readonly VarDuStarNiva[]; className?: string }) {
  const { huvud, ovriga } = varDuStarRader(nivaer)
  return (
    <UKort label={S.rubrik} lyft className={className} data="star">
      <Eyebrow hjalp="C4" hjalpEtikett={S.hjalp}>
        {S.rubrik}
      </Eyebrow>
      {huvud && huvud.j.lage === 'visas' && huvud.niva.fordelning && huvud.niva.egenPoang != null ? (
        <>
          <h2 className="mt-1 text-ink-1">
            <span className="block text-sm font-medium leading-5 text-ink-2">{S.battreAn}</span>
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-tal-display text-ink-1">
                {huvud.j.percentil}
                <span className="ml-0.5 text-[24px] font-bold">%</span>
              </span>
              <span className="font-display text-[18px] font-bold leading-[23px]">{S.pa(huvud.namn)}</span>
            </span>
          </h2>
          <p className="mt-2 text-sm leading-[21px] text-ink-2">{S.text}</p>
          <Fordelningsbild f={huvud.niva.fordelning} egenPoang={huvud.niva.egenPoang} namn={huvud.namn} percentil={huvud.j.percentil} />
          <p className="mt-2 text-meta text-ink-3">
            <b className="font-semibold tabular-nums text-ink-1">{huvud.j.antal}</b> {S.underlag}
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-1 text-kort-t text-ink-1">{S.vantar}</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{S.vantarText}</p>
        </>
      )}
      {ovriga.length ? (
        <div className="mt-4 border-t border-kant pt-3">
          {huvud ? <p className="mb-2 text-ey text-ink-3">{S.ovriga}</p> : null}
          <ul className="flex flex-col gap-3">
            {ovriga.map((r) => (
              <OvrigRad key={r.niva.slug} r={r} />
            ))}
          </ul>
        </div>
      ) : null}
    </UKort>
  )
}
