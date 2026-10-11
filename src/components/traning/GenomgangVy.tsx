'use client'

/**
 * Genomgången efter passet: en fråga i taget med samma matris och samma
 * alternativ i samma ordning som under passet, det valda i bläck, det rätta
 * i koppar, och regeln och misstaget under (spec-rummen 4.4, P4:s "Gå
 * igenom de två missarna"). Resultat och genomgång är alltid öppna, med
 * eller utan paket (briefen avsnitt 7).
 *
 * Används också när en redan avslutad session öppnas igen: då finns inget
 * resultat att gå tillbaka till, bara rummet.
 */

import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import type { Sessionsvy } from '@/lib/traning/klient'
import { familjNamn } from '@/lib/logicTestV7/familjer'
import PassFraga from './PassFraga'
import PassShell from './PassShell'
import Regelpanel from './Regelpanel'

export interface GenomgangVyProps {
  vy: Sessionsvy
  /** Index i vy.fragor som gås igenom, i ordning. */
  lista: number[]
  pos: number
  onPos: (pos: number) => void
  onTillbakaResultat: (() => void) | null
  onTillbaka: () => void
}

const G = PASS_COPY.genomgangVy

export default function GenomgangVy({ vy, lista, pos, onPos, onTillbakaResultat, onTillbaka }: GenomgangVyProps) {
  const i = lista[Math.min(pos, lista.length - 1)] ?? 0
  const q = vy.fragor[i]
  const g = vy.genomgang?.[i] ?? null
  const b = vy.besvarade.find((x) => x.q_id === q?.id) ?? null
  const at = q ? vy.aterkoppling?.[q.id] ?? null : null
  const rattVisat = at?.rattVisat ?? g?.rattVisat ?? null
  const vald = b?.valdVisat ?? null
  const correct = at ? at.correct : b && rattVisat != null ? !b.vetInte && !b.tidenUte && vald === rattVisat : false
  const tid = b?.tid_s ?? 0
  const rad = !b
    ? PASS_COPY.resultat.genomgang.rubrik
    : b.vetInte
      ? PASS_COPY.regel.vetInte(tid)
      : b.tidenUte
        ? PASS_COPY.regel.tidenUte(tid)
        : correct
          ? PASS_COPY.regel.ratt(tid)
          : PASS_COPY.regel.fel(tid)
  const misstag = !correct ? (at?.misstag ?? g?.misstag ?? null) : null
  const sista = pos >= lista.length - 1
  const familj = familjNamn(g?.family ?? null)

  return (
    <PassShell
      titel={G.titel}
      undertitel={familj ? `${G.rad(i + 1, vy.fragor.length)} · ${familj}` : G.rad(i + 1, vy.fragor.length)}
      fraga={pos + 1}
      antal={lista.length}
      tid={null}
      onAvsluta={onTillbakaResultat ?? onTillbaka}
      avslutaEtikett={onTillbakaResultat ? G.tillResultatet : PASS_COPY.knapp.tillbaka}
      nyckel={q?.id}
      fot={
        <>
          {sista ? (
            <button type="button" onClick={onTillbakaResultat ?? onTillbaka} className={KNAPP_PRIMAR}>
              {onTillbakaResultat ? G.tillResultatet : PASS_COPY.knapp.tillbaka}
            </button>
          ) : (
            <button type="button" onClick={() => onPos(pos + 1)} className={KNAPP_PRIMAR}>
              {G.nasta}
            </button>
          )}
          {pos > 0 ? (
            <button type="button" onClick={() => onPos(pos - 1)} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
              {G.foregaende}
            </button>
          ) : null}
        </>
      }
    >
      {q ? <PassFraga key={q.id} fraga={q} vald={vald} ratt={rattVisat} last visaText={false} /> : null}
      {q ? <Regelpanel rad={rad} regel={at?.regel ?? g?.rule ?? q.rule} misstag={misstag} /> : null}
    </PassShell>
  )
}
