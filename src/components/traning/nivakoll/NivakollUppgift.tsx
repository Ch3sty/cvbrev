'use client'

/**
 * En uppgift i Nivåkollen för figurserier, deduktivt, verbalt och numeriskt
 * (testplanen steg 1). Varje typ ritas med sina egna komponenter från passen
 * och testerna; Nivåkollen lägger inget nytt utseende ovanpå. Under tiden
 * väljer hon och lämnar in med Svara; i genomgången står rätt svar och
 * förklaringen (regeln, lösningen eller förklaringen) under.
 */

import { FigurserieAlternativ, FigurserieRad } from '@/components/tests/serie/FigurserieRad'
import { BOKSTAV, DeduktivAlternativ, DeduktivLayout, Fragerad, Villkorskort } from '@/components/tests/deduktiv/DeduktivFraga'
import DeduktivLosning from '@/components/tests/deduktiv/DeduktivLosning'
import { Underlag, VnUppgift } from '../vnpass/VnUppgift'
import Regelpanel from '../Regelpanel'
import { NIVAKOLL_COPY } from '@/lib/nivakoll/copy'
import type { NivakollGenomgang, NivakollUppgift as Uppgift } from '@/lib/nivakoll/typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'

const C = NIVAKOLL_COPY

export interface NivakollUppgiftProps {
  u: Uppgift
  nr: number
  antal: number
  /** Hennes val: visat index som text eller svarsvärdet. */
  vald: string | null
  onValj?: (v: string) => void
  /** Genomgången: rätt svar och förklaring, alternativen låsta. */
  genomgang?: NivakollGenomgang | null
  tid_s?: number
  underlag: Record<string, VnUnderlag>
  sessionId: string
  last?: boolean
}

function utfall(g: NivakollGenomgang, tid: number): string {
  if (g.valt === null) return `${C.genomgang.vetInte}, ${tid} s`
  return g.correct ? `${C.genomgang.ratt}, ${tid} s` : `${C.genomgang.fel}, ${tid} s`
}

export default function NivakollUppgift({ u, nr, antal, vald, onValj, genomgang = null, tid_s = 0, underlag, sessionId, last = false }: NivakollUppgiftProps) {
  const lasta = last || genomgang != null
  if (u.kind === 'figurserie') {
    const ratt = genomgang ? Number(genomgang.ratt) : null
    return (
      <div className="space-y-3.5" data-nivakoll-uppgift="figurserie">
        <p className="flex items-baseline justify-between gap-3 text-[13px] leading-[18px] text-ink-3">
          <span className="whitespace-nowrap" aria-label={C.fraga.uppgift(nr, antal)}>
            Uppgift {nr}
          </span>
          <b className="text-right text-sm font-semibold text-ink-1">Vilken figur kommer härnäst?</b>
        </p>
        {nr === 1 && !genomgang ? <p className="text-[13px] leading-[18px] text-ink-3">{C.fraga.forsta}</p> : null}
        <FigurserieRad rad={u.rad} facit={ratt != null ? u.options[ratt] : null} />
        <FigurserieAlternativ options={u.options} valt={vald == null ? null : Number(vald)} ratt={ratt} onValj={(i) => onValj?.(String(i))} disabled={lasta} />
        {genomgang ? (
          <Regelpanel
            rad={utfall(genomgang, tid_s)}
            regel={genomgang.forklaring ?? ''}
            misstag={genomgang.misstag}
            rapport={{ qId: u.nyckel, sessionId, testKind: 'figurserie', bankVersion: null }}
          />
        ) : null}
      </div>
    )
  }
  if (u.kind === 'deduktiv') {
    const ratt = genomgang ? Number(genomgang.ratt) : null
    const valt = vald == null ? null : Number(vald)
    return (
      <DeduktivLayout
        fast={genomgang != null}
        villkor={<Villkorskort fast={genomgang != null} intro={u.intro} villkor={u.villkor} premisser={u.premisser} />}
        hoger={
          <>
            {nr === 1 && !genomgang ? <p className="text-[13px] leading-[18px] text-ink-3">{C.fraga.forsta}</p> : null}
            <Fragerad nr={nr} antal={antal} fraga={u.fraga} forsta={nr === 1 && !genomgang} />
            <DeduktivAlternativ options={u.options} valt={valt} ratt={ratt} onValj={(i) => onValj?.(String(i))} disabled={lasta} />
            {genomgang?.losning ? (
              <DeduktivLosning
                losning={genomgang.losning}
                utfall={utfall(genomgang, tid_s)}
                misstag={genomgang.misstag && valt !== null ? { bokstav: BOKSTAV[valt], text: genomgang.misstag } : null}
                rapport={{ qId: u.nyckel, sessionId, testKind: 'deduktiv', bankVersion: null }}
              />
            ) : null}
          </>
        }
      />
    )
  }
  const ul = underlag[u.underlag]
  return (
    <div className="flex flex-col gap-3.5" data-nivakoll-uppgift={u.kind}>
      {ul ? <Underlag kind={u.kind} underlag={ul} /> : null}
      {nr === 1 && !genomgang ? <p className="text-[13px] leading-[18px] text-ink-3">{C.fraga.forsta}</p> : null}
      <VnUppgift
        kind={u.kind}
        punkt={{ nyckel: u.nyckel, text: u.text, alternativ: u.alternativ }}
        nr={nr}
        antal={antal}
        vald={vald}
        aterkoppling={genomgang ? { correct: genomgang.correct, ratt: genomgang.ratt, forklaring: genomgang.forklaring } : null}
        last={lasta}
        onValj={(v) => onValj?.(v)}
      />
    </div>
  )
}
