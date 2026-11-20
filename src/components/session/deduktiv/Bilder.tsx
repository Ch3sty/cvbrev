'use client'

/**
 * Villkorens bilder i deduktiv slutledning (omgång 3 steg 2b, skissens
 * Test-deduktiv, -premisser, -turordning, -antagande): en liten bild till
 * höger om varje villkor som visar relationen, ritad ur villkorens form
 * (struktur, aldrig facit). Personer är färgade brickor med initialen,
 * pärmar är små pärmar i sin färg.
 *
 *   plats          platserna streckade, personen på sin plats
 *   inte på plats  platserna streckade, kryss på platsen
 *   bredvid        de två med pilar utåt
 *   inte bredvid   de två med ett rött kryss emellan
 *   direkt vänster de två ihop med pil
 *   före, någonstans till vänster   de två med prickad pil
 *   samma dag      de två i en ram
 *
 * Kvantorerna ritas som mängder: alla (prick i cirkel), ingen (två skilda
 * cirklar), några (två som överlappar).
 */

import type { KvantorLed, PlatsVillkor } from '@/lib/deduktivV1/struktur'

/** Personernas färger i ordning, som tokens. */
const PERSON = ['var(--sess-serie-1)', 'var(--sess-serie-3)', 'var(--sess-serie-4)', 'var(--sess-serie-5)', 'var(--sess-serie-6)', 'var(--sess-serie-2)']

/** Pärmarnas färger efter namnet i banken. */
const PARM: Record<string, { yta: string; kant: string }> = {
  grön: { yta: '#3E9E74', kant: '#2A7A57' },
  lila: { yta: '#8E5BC9', kant: '#6E3FA6' },
  röd: { yta: '#D0533F', kant: '#A83A2A' },
  svart: { yta: '#26262C', kant: '#0F0F12' },
  blå: { yta: '#3B6FD1', kant: '#2A55A8' },
  vit: { yta: '#FFFFFF', kant: '#9AA1C8' },
  gul: { yta: '#E8B93A', kant: '#B98F1E' },
}

export function personFarg(i: number): string {
  return PERSON[i % PERSON.length]
}

export function parmFarg(namn: string): { yta: string; kant: string } {
  return PARM[namn.trim().toLowerCase()] ?? { yta: '#9AA1C8', kant: '#7A82AE' }
}

/** Initialerna: första bokstaven, två när flera namn börjar likadant. */
export function initialer(namn: string[]): string[] {
  return namn.map((n) => {
    const forsta = n.charAt(0).toUpperCase()
    const krock = namn.filter((m) => m.charAt(0).toUpperCase() === forsta).length > 1
    return krock ? n.slice(0, 2).replace(/^./, (c) => c.toUpperCase()) : forsta
  })
}

/** Liten pärm (saker) eller färgad bricka med initialen (personer). */
export function Plupp({ namn, i, saker, init, stor = false }: { namn: string; i: number; saker: boolean; init: string; stor?: boolean }) {
  if (saker) {
    const f = parmFarg(namn)
    const w = stor ? 16 : 13
    const h = stor ? 26 : 22
    return (
      <svg width={w} height={h} viewBox="0 0 13 22" aria-hidden="true" className="flex-shrink-0">
        <rect x=".75" y=".75" width="11.5" height="20.5" rx="3" fill={f.yta} stroke={f.kant} strokeWidth="1.5" />
        <rect x="3.5" y="3" width="6" height="7" rx="1.5" fill="#FFFFFF" opacity={f.yta === '#FFFFFF' ? 0.6 : 0.9} stroke={f.yta === '#FFFFFF' ? '#C8CEEC' : 'none'} />
      </svg>
    )
  }
  return (
    <span className="sess-plupp" style={{ background: personFarg(i) }} aria-hidden="true">
      {init}
    </span>
  )
}

function Pil({ prickad = false }: { prickad?: boolean }) {
  return (
    <svg width={prickad ? 28 : 18} height="12" viewBox={prickad ? '0 0 28 12' : '0 0 18 12'} fill="none" stroke="var(--sess-brade)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 text-ink-1">
      {prickad ? (
        <>
          <path d="M2 6h14" strokeDasharray="1.5 4" />
          <path d="M18 6h8M22 2l4 4-4 4" />
        </>
      ) : (
        <path d="M2 6h13M11 2l4 4-4 4" />
      )}
    </svg>
  )
}

function Kryss() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sess-fel)" strokeWidth="3.4" strokeLinecap="round" aria-hidden="true" className="flex-shrink-0">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function Utat({ hoger = false }: { hoger?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--sess-brade)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <path d={hoger ? 'M4 12h15M14 7l5 5-5 5' : 'M20 12H5M10 7l-5 5 5 5'} />
    </svg>
  )
}

function Platser({ n, k, inte, plupp }: { n: number; k: number; inte: boolean; plupp: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {Array.from({ length: n }, (_, i) =>
        i + 1 === k ? (
          inte ? (
            <span key={i} className="inline-flex h-[22px] w-[15px] items-center justify-center rounded-[4px] border-[1.5px] border-dashed border-[color:var(--sess-fel)]">
              <Kryss />
            </span>
          ) : (
            <span key={i} className="inline-flex">
              {plupp}
            </span>
          )
        ) : (
          <span key={i} className="inline-block h-[22px] w-[13px] rounded-[4px] border-[1.5px] border-dashed border-[color:var(--sess-streck)]" />
        )
      )}
    </span>
  )
}

/** Bilden för ett platsvillkor. */
export function PlatsBild({ v, namn, saker, init }: { v: PlatsVillkor; namn: string[]; saker: boolean; init: string[] }) {
  const p = (i: number | undefined) => (i == null || !namn[i] ? null : <Plupp namn={namn[i]} i={i} saker={saker} init={init[i]} />)
  const a = p(v.a)
  const b = p(v.b)
  switch (v.typ) {
    case 'plats':
      return <Platser n={namn.length} k={v.k ?? 0} inte={false} plupp={a} />
    case 'inte_plats':
      return (
        <span className="inline-flex items-center gap-1.5">
          {a}
          <Platser n={namn.length} k={v.k ?? 0} inte plupp={null} />
        </span>
      )
    case 'granne':
      return (
        <span className="inline-flex items-center gap-1">
          <Utat />
          {a}
          {b}
          <Utat hoger />
        </span>
      )
    case 'inte_granne':
      return (
        <span className="inline-flex items-center gap-1.5">
          {a}
          <Kryss />
          {b}
        </span>
      )
    case 'direkt_vanster_om':
      return (
        <span className="inline-flex items-center gap-0.5">
          {a}
          <Pil />
          {b}
        </span>
      )
    case 'vanster_om':
    case 'ordning':
      return (
        <span className="inline-flex items-center gap-1">
          {a}
          <Pil prickad />
          {b}
        </span>
      )
    case 'samma_grupp':
      return (
        <span className="inline-flex items-center gap-1 rounded-[9px] px-1.5 py-1" style={{ boxShadow: 'inset 0 0 0 2px var(--sess-indigo)' }}>
          {a}
          {b}
        </span>
      )
    default:
      return null
  }
}

/** Mängdbilden för en kvantor: alla, ingen, några. */
export function KvantorBild({ led }: { led: KvantorLed }) {
  const ring = 'var(--sess-brade)'
  const fyll = 'var(--sess-serie-1)'
  const w = 52
  if (led.typ === 'alla' || led.typ === 'ar') {
    return (
      <svg width={w} height="36" viewBox="0 0 52 36" aria-hidden="true">
        <circle cx="26" cy="18" r="15" fill="var(--papper)" stroke={ring} strokeWidth="2.5" />
        <circle cx="26" cy="18" r={led.typ === 'ar' ? 4 : 7} fill={fyll} />
      </svg>
    )
  }
  if (led.typ === 'ar_inte') {
    return (
      <svg width={w} height="36" viewBox="0 0 52 36" aria-hidden="true">
        <circle cx="20" cy="18" r="14" fill="var(--papper)" stroke={ring} strokeWidth="2.5" />
        <circle cx="44" cy="18" r="4" fill={fyll} />
      </svg>
    )
  }
  if (led.typ === 'inga') {
    return (
      <svg width={w + 8} height="36" viewBox="0 0 60 36" aria-hidden="true">
        <circle cx="15" cy="18" r="12" fill="var(--papper)" stroke={ring} strokeWidth="2.5" />
        <path d="M30 4v28" stroke="var(--sess-fel)" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="45" cy="18" r="12" fill={fyll} />
      </svg>
    )
  }
  // Några (och några inte): två mängder som överlappar.
  return (
    <svg width={w + 8} height="36" viewBox="0 0 60 36" aria-hidden="true">
      <circle cx="22" cy="18" r="14" fill="var(--papper)" stroke={ring} strokeWidth="2.5" strokeDasharray={led.typ === 'nagra_inte' ? '4 3' : undefined} />
      <circle cx="38" cy="18" r="14" fill={fyll} fillOpacity=".55" stroke={ring} strokeWidth="2.5" />
    </svg>
  )
}
