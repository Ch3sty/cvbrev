/**
 * Mönstren i figurer och mönster (skissens monsterRuta): matrisens familjer
 * i fyra tillstånd (inte mött, mött, säker, snabb). Ett tryck startar Träna
 * på mönstret (hrefen kommer ur datan). Gratis: rutorna är bara bild och en
 * låst rad står under, eftersom Träna är Premium.
 */

import Link from 'next/link'
import type { MonsterLage, UtvecklingV4Data } from '@/lib/tester/v4/typer'
import { LAS_CHIP } from '@/lib/tester/v4/copy'
import { LasChip } from '@/components/traning/HemKlient'
import { UTV } from './copy'

type Monster = NonNullable<UtvecklingV4Data['matrisMonster']>[number]

function Ruta({ lage, ratt, antal, size = 36 }: { lage: MonsterLage; ratt?: number; antal?: number; size?: number }) {
  let inre: React.ReactNode
  if (lage === 'omott') {
    inre = <rect x="4" y="4" width="32" height="32" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity=".6" />
  } else if (lage === 'mott') {
    const h = antal ? 32 * Math.min(1, (ratt ?? 0) / antal) : 0
    inre = (
      <>
        <rect x="4" y="4" width="32" height="32" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
        <rect x="4" y={36 - h} width="32" height={h} fill="currentColor" opacity=".25" />
      </>
    )
  } else if (lage === 'saker') {
    inre = (
      <>
        <rect x="4" y="4" width="32" height="32" rx="8" style={{ fill: 'var(--koppar)' }} />
        <path d="M13 20.5l5 5 9-10" fill="none" style={{ stroke: 'var(--papper)' }} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )
  } else {
    inre = (
      <>
        <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth="2" />
        <rect x="6" y="6" width="28" height="28" rx="7" style={{ fill: 'var(--koppar)' }} />
        <path d="M14 20.5l4.5 4.5 8-9" fill="none" style={{ stroke: 'var(--papper)' }} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )
  }
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className="shrink-0 text-ink-1">
      {inre}
    </svg>
  )
}

function under(m: Monster): string {
  if (m.lage === 'mott' && m.antal) return UTV.monster.svar(m.ratt ?? 0, m.antal)
  return UTV.monster.lage[m.lage]
}

export default function Monsterrutor({ monster, premium }: { monster: Monster[]; premium: boolean }) {
  const s = monster.filter((m) => m.lage === 'saker' || m.lage === 'snabb').length
  const mott = monster.filter((m) => m.lage === 'mott').length
  const o = monster.filter((m) => m.lage === 'omott').length
  return (
    <section aria-label={UTV.monster.eyebrow} className="rounded-2xl border border-kant bg-papper p-4" data-sektion="monster">
      <h2 className="flex flex-wrap items-baseline justify-between gap-x-3 text-ey text-ink-3">
        {UTV.monster.eyebrow}
        <span className="text-meta normal-case tracking-normal">{UTV.monster.summa(s, mott, o)}</span>
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 lg:grid-cols-3">
        {monster.map((m) => {
          const inne = (
            <>
              <Ruta lage={m.lage} ratt={m.ratt} antal={m.antal} />
              <span className="min-w-0 text-xs leading-[15px] text-ink-1">
                {m.namn}
                <small className="mt-0.5 block text-xs text-ink-3">{under(m)}</small>
              </span>
            </>
          )
          return (
            <li key={m.family}>
              {premium ? (
                <Link
                  href={m.href}
                  aria-label={`${UTV.monster.tranaAria(m.namn)}, ${under(m)}`}
                  className="-mx-1 flex min-h-11 items-center gap-2 rounded-lg px-1 py-1 hover:bg-papper-2"
                >
                  {inne}
                </Link>
              ) : (
                <div className="flex min-h-11 items-center gap-2 py-1">{inne}</div>
              )}
            </li>
          )
        })}
      </ul>
      <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-ink-3" aria-hidden="true">
        {(['omott', 'mott', 'saker', 'snabb'] as const).map((l) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <Ruta lage={l} ratt={1} antal={2} size={16} />
            {UTV.monster.legend[l]}
          </span>
        ))}
      </div>
      <p className="mt-2 text-meta text-ink-3">{UTV.monster.forklaring}</p>
      {!premium ? (
        <div className="mt-3 flex min-h-11 items-center justify-between gap-3 border-t border-kant pt-3 text-sm text-ink-2">
          <span>{UTV.monster.las}</span>
          <LasChip feature="tests_above_base" plats="riktat" text={LAS_CHIP.premium} label={`${UTV.monster.las}. ${LAS_CHIP.premium}`} />
        </div>
      ) : null}
    </section>
  )
}
