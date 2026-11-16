'use client'

/**
 * "Alla"-arket (skissen, "Håller för 50 mallar"): sök, filter (Alla,
 * Gratis, Word, Foto, Två spalter, En sida) och rutnät i tre kolumner
 * grupperat per formfamilj med fasta grupprubriker. Föreslagna och Gratis
 * först. Tryck stänger arket och byter dokument. Ingen virtualisering: 50
 * bilder i tre kolumner, lata.
 *
 * AllaInnehall är samma innehåll utan blad, som mallkolumnen på datorn.
 */
import { useMemo, useState } from 'react'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { IkonFoto, IkonSok, IkonWord } from '@/components/illustrations/MallIkoner'
import Ark from './Ark'
import Miniatyr from './Miniatyr'
import { grupperaMallar } from './grupper'
import { ALLA_ARK } from './texter'

export type Filter = 'alla' | 'gratis' | 'word' | 'foto' | 'tva' | 'enSida'


export function passarFilter(m: MallKort, f: Filter): boolean {
  switch (f) {
    case 'gratis':
      return m.niva === 'gratis'
    case 'word':
      return m.word
    case 'foto':
      return m.foto
    case 'tva':
      return m.familj === 'sidospalt'
    case 'enSida':
      return /en sida|kompakt|tät/i.test(`${m.kort} ${m.stil}`)
    default:
      return true
  }
}

function passarSok(m: MallKort, q: string): boolean {
  if (!q) return true
  const t = `${m.namn} ${m.stil} ${m.kort} ${ALLA_ARK.familj[m.familj]}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((ord) => t.includes(ord))
}

interface InnehallProps {
  katalog: readonly MallKort[]
  vald: string
  foreslagna: readonly string[]
  onValj: (id: string) => void
  /** Sökfältet syns bara i arket; kolumnen på datorn har bara filtret. */
  medSok?: boolean
  /** Föreslagna visas redan ovanför (datorns kolumn). */
  utanForeslagna?: boolean
  last?: boolean
  /**
   * Ytan bakom listan, för de klistrade grupprubrikernas band: papper i
   * arket, golv i datorns kolumn (ägaren 2026-11-16: inget vitt band).
   */
  yta?: 'papper' | 'golv'
}

export function FilterRad({ filter, setFilter, antal }: { filter: Filter; setFilter: (f: Filter) => void; antal: number }) {
  const val: { id: Filter; text: string; ikon?: React.ReactNode }[] = [
    { id: 'alla', text: `${ALLA_ARK.filter.alla} ${antal}` },
    { id: 'gratis', text: ALLA_ARK.filter.gratis },
    { id: 'word', text: ALLA_ARK.filter.word, ikon: <IkonWord size={14} /> },
    { id: 'foto', text: ALLA_ARK.filter.foto, ikon: <IkonFoto size={14} /> },
    { id: 'tva', text: ALLA_ARK.filter.tva },
    { id: 'enSida', text: ALLA_ARK.filter.enSida },
  ]
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={ALLA_ARK.visaRubrik}>
      {val.map((v) => (
        <button
          key={v.id}
          type="button"
          aria-pressed={filter === v.id}
          onClick={() => setFilter(v.id)}
          className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-[13px] ${
            filter === v.id ? 'border-ink-1 bg-ink-1 text-papper' : 'border-kant-stark bg-papper text-ink-2 hover:border-ink-1'
          }`}
        >
          {v.ikon}
          {v.text}
        </button>
      ))}
    </div>
  )
}

export function AllaInnehall({ katalog, vald, foreslagna, onValj, medSok, utanForeslagna, last, yta = 'papper' }: InnehallProps) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('alla')

  const traffar = useMemo(() => katalog.filter((m) => passarFilter(m, filter) && passarSok(m, q.trim())), [katalog, filter, q])
  const grupper = useMemo(
    () => grupperaMallar({ katalog, foreslagna, traffar, utanSok: !q && filter === 'alla', utanForeslagna }),
    [katalog, foreslagna, traffar, q, filter, utanForeslagna]
  )
  const band =
    yta === 'golv'
      ? 'bg-golv after:from-golv'
      : 'bg-papper after:from-papper'

  return (
    <div>
      {medSok ? (
        <label className="flex h-12 items-center gap-2 rounded-xl border border-kant-stark bg-papper px-3 text-ink-3 focus-within:border-ink-1">
          <IkonSok size={18} />
          <span className="sr-only">{ALLA_ARK.sok}</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ALLA_ARK.sok}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink-1 outline-none placeholder:text-ink-3 focus-visible:outline-none"
          />
        </label>
      ) : null}
      <div className={medSok ? 'mt-2.5' : ''}>
        <FilterRad filter={filter} setFilter={setFilter} antal={katalog.length} />
      </div>
      {grupper.length === 0 ? (
        <p className="mt-6 text-sm text-ink-2">
          {ALLA_ARK.tom}{' '}
          <button
            type="button"
            onClick={() => {
              setQ('')
              setFilter('alla')
            }}
            className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
          >
            {ALLA_ARK.tomLank}
          </button>
          .
        </p>
      ) : (
        grupper.map((g) => (
          <section key={g.namn} aria-label={g.namn} className="mt-2">
            {/* Klistrad rubrik i ytans egen färg, med en mjuk kant under så
                att miniatyrerna som rullar in under inte ser avhuggna ut. */}
            <h3
              className={`sticky top-0 z-[1] pb-1.5 pt-2 text-ey uppercase text-ink-3 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-2 after:bg-gradient-to-b after:to-transparent ${band}`}
            >
              {g.namn}
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {g.mallar.map((m) => (
                <Miniatyr key={m.id} mall={m} vald={m.id === vald} onValj={onValj} storlek="rutnat" disabled={last} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

export default function AllaArk({
  open,
  onClose,
  ...p
}: InnehallProps & { open: boolean; onClose: () => void }) {
  return (
    <Ark
      open={open}
      onClose={onClose}
      bred
      rubrik={ALLA_ARK.rubrik}
      tillagg={<span className="mt-1 text-sm font-semibold text-ink-3">{p.katalog.length}</span>}
    >
      <AllaInnehall
        {...p}
        medSok
        onValj={(id) => {
          p.onValj(id)
          onClose()
        }}
      />
    </Ark>
  )
}
