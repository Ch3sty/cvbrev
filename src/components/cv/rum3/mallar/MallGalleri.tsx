'use client'

/**
 * Panelen på Mallars golv (skissen Mallar och Mobil-mallar): "Alla 40
 * mallar", filtret och sökningen som i dagens Alla-ark, och alla grupper
 * synliga på sidan i dagens ordning (grupperaMallar). Varje ruta ritar
 * hennes eget CV (EgenMiniatyr: katalogbilden tills hennes är hämtad, en
 * fråga per rad när raden kommer nära bild). Pekaren över en ruta hämtar
 * den mallen direkt, så att klicket visar arket ur minnet.
 */
import { useMemo, useState } from 'react'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { IkonSok } from '@/components/illustrations/MallIkoner'
import EgenMiniatyr from '@/components/cv/Dokument/EgenMiniatyr'
import type { EgetCv } from '@/components/cv/Dokument/egnaMallar'
import { passarFilter, type Filter } from '@/components/cv/Dokument/AllaArk'
import { grupperaMallar } from '@/components/cv/Dokument/grupper'
import { ALLA_ARK, REMSA } from '@/components/cv/Dokument/texter'
import { MALLAR } from '../texter'

const FILTER: readonly { id: Filter; text: string; antal: boolean }[] = [
  { id: 'alla', text: ALLA_ARK.filter.alla, antal: true },
  { id: 'gratis', text: ALLA_ARK.filter.gratis, antal: true },
  { id: 'word', text: ALLA_ARK.filter.word, antal: true },
  { id: 'foto', text: ALLA_ARK.filter.foto, antal: true },
  { id: 'tva', text: ALLA_ARK.filter.tva, antal: false },
  { id: 'enSida', text: ALLA_ARK.filter.enSida, antal: false },
]

function passarSok(m: MallKort, q: string): boolean {
  if (!q) return true
  const t = `${m.namn} ${m.stil} ${m.kort} ${ALLA_ARK.familj[m.familj]}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((ord) => t.includes(ord))
}

function Bock() {
  return (
    <span className="cv3m-bock" aria-hidden="true">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 12.5l5 5L20 6.5" />
      </svg>
    </span>
  )
}

export interface MallGalleriProps {
  katalog: readonly MallKort[]
  vald: string
  foreslagna: readonly string[]
  skal?: string
  cv: EgetCv | null
  onValj: (id: string) => void
  /** Pekaren eller fokus över en ruta: hämta mallen i förväg. */
  onPeka?: (id: string) => void
  last?: boolean
  /** Rad överst i panelen (gratisvägen på telefonen). */
  topp?: React.ReactNode
}

export default function MallGalleri({ katalog, vald, foreslagna, skal, cv, onValj, onPeka, last, topp }: MallGalleriProps) {
  const [filter, setFilter] = useState<Filter>('alla')
  const [q, setQ] = useState('')

  const antal = useMemo(() => {
    const r: Record<Filter, number> = { alla: 0, gratis: 0, word: 0, foto: 0, tva: 0, enSida: 0 }
    for (const f of FILTER) r[f.id] = katalog.filter((m) => passarFilter(m, f.id)).length
    return r
  }, [katalog])
  const traffar = useMemo(() => katalog.filter((m) => passarFilter(m, filter) && passarSok(m, q.trim())), [katalog, filter, q])
  const grupper = useMemo(
    () => grupperaMallar({ katalog, foreslagna, traffar, utanSok: !q.trim() && filter === 'alla' }),
    [katalog, foreslagna, traffar, q, filter]
  )

  return (
    <div className="t3-panel cv3m-panel" data-mallar-panel>
      {topp}
      <div className="cv3m-panel-huvud">
        <div className="min-w-0">
          <p className="t3-ogon-golv">{MALLAR.panelOgon(katalog.length)}</p>
          <h2 className="t3-h2">{cv ? MALLAR.panelRubrik : MALLAR.panelRubrikExempel}</h2>
          <p className="t3-sektion-rad cv3m-panel-rad">
            <span className="hidden md:inline">{MALLAR.panelRad}</span>
            <span className="md:hidden">{MALLAR.panelRadKort}</span>
          </p>
        </div>
        <label className="cv3m-sok">
          <IkonSok size={18} />
          <span className="sr-only">{ALLA_ARK.sok}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={ALLA_ARK.sok} />
        </label>
      </div>

      <div className="cv3m-filter" role="group" aria-label={MALLAR.filter}>
        {FILTER.map((f) => (
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.text}
            {f.antal ? <i>{antal[f.id]}</i> : null}
          </button>
        ))}
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
            className="cv3-textlank"
          >
            {ALLA_ARK.tomLank}
          </button>
          .
        </p>
      ) : (
        grupper.map((g) => {
          const baraPdf = g.mallar.every((m) => !m.word)
          return (
            <section key={g.namn} aria-label={g.namn}>
              <h3 className="cv3m-grupp">
                <b>{g.namn}</b>
                {g.namn === REMSA.foreslagna && skal ? <span className="hidden md:inline">{skal}</span> : baraPdf ? <span>{MALLAR.baraPdf}</span> : null}
              </h3>
              <div className="cv3m-rutnat">
                {g.mallar.map((m) => {
                  const ar = m.id === vald
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className="cv3m-ruta"
                      data-mall-ruta={m.id}
                      data-vald={ar ? '' : undefined}
                      aria-pressed={ar}
                      aria-label={`${cv ? 'Ditt CV' : 'Exempel-CV'} i mallen ${m.namn}, ${REMSA.niva[m.niva]}${m.word ? ', även Word' : ''}`}
                      disabled={last}
                      onClick={() => onValj(m.id)}
                      onPointerEnter={() => onPeka?.(m.id)}
                      onFocus={() => onPeka?.(m.id)}
                    >
                      <span className="cv3m-ruta-bild">
                        <EgenMiniatyr mall={m} cv={cv} />
                      </span>
                      {ar ? <Bock /> : null}
                      <span className="cv3m-ruta-namn">
                        <b>{m.namn}</b>
                        <span className="cv3-tagg" data-ton={m.niva === 'gratis' ? 'gratis' : undefined}>
                          {REMSA.niva[m.niva]}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
