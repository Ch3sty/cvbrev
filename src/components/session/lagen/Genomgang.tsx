'use client'

/**
 * Genomgången (plan-testflode-2026-11-20 avsnitt 4.2): samma vy som
 * sessionen, samma ram, räknaren, ‹ och Nästa i foten, Förklaringen under
 * svaren. Användaren lär sig en skärm till, inte två. X går tillbaka till
 * resultatet utan dialog.
 */

import { useState } from 'react'
import SessionsRam from '../SessionsRam'
import Forklaringen from '../Forklaringen'
import { SESSION } from '../copy'
import type { Lage } from '../lagesregler'
import type { RamFacit, RamUppgift, TypRitare } from '../typ'
import type { RapportTestKind } from '@/lib/traning/fragaRapport'

export interface GenomgangPost<U extends RamUppgift> {
  u: U
  valt: number | null
  facit: RamFacit
  tid_s?: number | null
}

export interface GenomgangProps<U extends RamUppgift> {
  ritare: TypRitare<U>
  lage: Lage
  titel: string
  poster: GenomgangPost<U>[]
  start?: number
  /** Provets tid per uppgift, för Förklaringens tidrad. */
  budgetPerUppgift?: number | null
  sessionId: string | null
  onStang: () => void
}

export default function Genomgang<U extends RamUppgift>({ ritare, lage, titel, poster, start = 0, budgetPerUppgift = null, sessionId, onStang }: GenomgangProps<U>) {
  const [pos, setPos] = useState(() => Math.max(0, Math.min(start, poster.length - 1)))
  const p = poster[pos]
  if (!p) return null
  const antal = poster.length
  const sista = pos >= antal - 1
  const Uppgift = ritare.Uppgift
  const utfall = p.valt === null ? (lage === 'trana' ? 'vet_inte' : 'obesvarad') : p.facit.correct ? 'ratt' : 'fel'
  return (
    <SessionsRam
      lage={lage}
      titel={titel}
      undertitel={SESSION.genomgangUndertitel(lage)}
      form={ritare.form}
      raknare={{ nr: pos + 1, antal }}
      framsteg={(pos + 1) / antal}
      nyckel={`g-${p.u.nyckel}`}
      bekraftaAvbryt={false}
      onAvbryt={onStang}
      fot={{
        vanster: { typ: 'tillbaka', onClick: () => setPos((x) => Math.max(0, x - 1)), disabled: pos === 0 },
        primar: {
          text: sista ? SESSION.knapp.tillResultatet : SESSION.knapp.nasta,
          onClick: sista ? onStang : () => setPos((x) => Math.min(antal - 1, x + 1)),
          data: 'genomgang-nasta',
        },
      }}
    >
      <div className="flex flex-col gap-4" data-genomgang-post={pos + 1}>
        <Uppgift u={p.u} nr={pos + 1} antal={antal} vald={p.valt} facit={p.facit.ratt} last />
        <Forklaringen
          utfall={utfall}
          tid={p.tid_s != null ? { sekunder: p.tid_s, budget: budgetPerUppgift } : null}
          regel={p.facit.regel}
          misstag={p.facit.misstag}
          rapport={{ qId: p.u.nyckel, sessionId, testKind: ritare.kind as RapportTestKind, bankVersion: null }}
        />
      </div>
    </SessionsRam>
  )
}
