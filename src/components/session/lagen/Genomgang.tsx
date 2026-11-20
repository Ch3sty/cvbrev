'use client'

/**
 * Genomgången (plan-testflode-2026-11-20 avsnitt 4.2): samma vy som
 * sessionen, samma ram, räknaren, ‹ och Nästa i foten, Förklaringen under
 * svaren. Användaren lär sig en skärm till, inte två. X går tillbaka till
 * resultatet utan dialog.
 */

import { useEffect, useRef, useState } from 'react'
import SessionsRam from '../SessionsRam'
import Forklaringen from '../Forklaringen'
import { SESSION } from '../copy'
import { basFor, sessionHandelser, type SessionHandelseBas } from '../handelser'
import type { Lage } from '../lagesregler'
import { forklaringInnehall, type GenomgangPost, type RamUppgift, type TypRitare } from '../typ'
import type { RapportTestKind } from '@/lib/traning/fragaRapport'
import { ramUnderlag } from './gemensamt'

export type { GenomgangPost }

/** Varifrån genomgången öppnades (genomgang_oppnad). */
export type GenomgangKalla = 'ga_igenom' | 'rad' | 'direkt'

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
  /** Sista uppgiftens knapp i stället för "Till resultatet" (I-provet: nästa deltest), etapp 4. */
  sista?: { text: string; onClick: () => void } | null
  /** Undertiteln i stället för "[läget], genomgång" (I-provet: deltestet). */
  undertitel?: string
  /** Mätningens bas. Utelämnad: typens id och läget. */
  bas?: SessionHandelseBas | null
  /** Varifrån den öppnades: "Gå igenom", en rads "Öppna i genomgången" eller direkt utan resultat. */
  kalla?: GenomgangKalla
}

export default function Genomgang<U extends RamUppgift>({
  ritare,
  lage,
  titel,
  poster,
  start = 0,
  budgetPerUppgift = null,
  sessionId,
  onStang,
  sista: sistaKnapp = null,
  undertitel,
  bas: basIn = null,
  kalla = 'ga_igenom',
}: GenomgangProps<U>) {
  const [pos, setPos] = useState(() => Math.max(0, Math.min(start, poster.length - 1)))
  const bas = basFor(ritare.kind, lage, basIn)
  const antal = poster.length

  // Mätningen (saas-leads prio 1): öppnad en gång, ett steg per byte med
  // tiden på den förra uppgiften, klar när sista uppgiftens knapp trycks.
  const oppnad = useRef(0)
  const steg = useRef({ pos, vid: 0 })
  const sett = useRef(new Set<number>())
  useEffect(() => {
    const nu = performance.now()
    oppnad.current = nu
    steg.current = { pos, vid: nu }
    sett.current.add(pos)
    const fel = poster.filter((x) => !x.facit.correct).length
    sessionHandelser.genomgangOppnad(bas, { session_id: sessionId, antal, fel, start_index: pos, kalla })
    // En gång när genomgången öppnas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const ga = (till: number) => {
    const ny = Math.max(0, Math.min(antal - 1, till))
    if (ny === pos) return
    const nu = performance.now()
    sessionHandelser.genomgangSteg(bas, { session_id: sessionId, index: ny, antal, riktning: ny > pos ? 'fram' : 'tillbaka', tid_ms: Math.round(nu - steg.current.vid) })
    steg.current = { pos: ny, vid: nu }
    sett.current.add(ny)
    setPos(ny)
  }
  const klar = (vidare: () => void) => {
    sessionHandelser.genomgangKlar(bas, { session_id: sessionId, antal, sett: sett.current.size, elapsed_ms: Math.round(performance.now() - oppnad.current) })
    vidare()
  }

  const p = poster[pos]
  if (!p) return null
  const sista = pos >= antal - 1
  const Uppgift = ritare.Uppgift
  const utfall = p.valt === null ? (lage === 'trana' ? 'vet_inte' : 'obesvarad') : p.facit.correct ? 'ratt' : 'fel'
  const forklaringen = (
    <Forklaringen
      utfall={utfall}
      tid={p.tid_s != null ? { sekunder: p.tid_s, budget: budgetPerUppgift } : null}
      regel={p.facit.regel}
      text={p.facit.text}
      misstag={p.facit.misstag}
      innehall={forklaringInnehall(ritare, p.u, p.facit, p.valt, 'genomgang')}
      rapport={{ qId: p.u.nyckel, sessionId, testKind: ritare.kind as RapportTestKind, bankVersion: null }}
      matning={{ bas, sessionId, index: pos, plats: 'genomgang' }}
    />
  )
  return (
    <SessionsRam
      lage={lage}
      titel={titel}
      undertitel={undertitel ?? SESSION.genomgangUndertitel(lage)}
      form={ritare.form}
      raknare={{ nr: pos + 1, antal }}
      framsteg={(pos + 1) / antal}
      nyckel={`g-${p.u.nyckel}`}
      underlag={ramUnderlag(ritare, p.u, true)}
      scen={ritare.kind}
      bekraftaAvbryt={false}
      onAvbryt={onStang}
      fot={{
        vanster: { typ: 'tillbaka', onClick: () => ga(pos - 1), disabled: pos === 0 },
        primar: {
          text: sista ? (sistaKnapp?.text ?? SESSION.knapp.tillResultatet) : SESSION.knapp.nasta,
          onClick: sista ? () => klar(sistaKnapp?.onClick ?? onStang) : () => ga(pos + 1),
          data: 'genomgang-nasta',
        },
      }}
    >
      <div className="flex flex-col gap-4" data-genomgang-post={pos + 1}>
        <Uppgift
          u={p.u}
          nr={pos + 1}
          antal={antal}
          vald={p.valt}
          facit={p.facit.ratt}
          facitData={p.facit.data}
          last
          forklaring={ritare.forklaringIUppgift ? forklaringen : undefined}
        />
        {ritare.forklaringIUppgift ? null : forklaringen}
      </div>
    </SessionsRam>
  )
}
