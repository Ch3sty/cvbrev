/**
 * Bilden för Inför intervjun: en sökt tjänst med bokad intervju och
 * intervjuprovets frågor med betyg, som kontot visar dem (Sökta tjänster,
 * Intervjuer på gång, och Inför intervjun med intervjuprovet). Byggd ur
 * /verktyg/sokta-tjanster (P4) så att fler sidor kan visa samma bild
 * (onskemal.md, P1 /priser).
 *
 * Frågornas namn läses ur intervjuprovets bank (FRAGOR), antalet ur
 * FRAGA_ORDNING. Arbetsgivaren är påhittad (SEO:s slutbesked, avsnitt 5).
 * Betygen är exempel i produktens egen form, märkta "Exempel".
 */

import type { ReactNode } from 'react'
import { FRAGOR, FRAGA_ORDNING, type FragaId } from '@/components/artiklar/intervjuprov/fragor'

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']
const talOrd = (n: number) => ORD[n] ?? String(n)

export interface IntervjuFraga {
  id: FragaId
  /** Betyg 1 till 5, utelämnat för "Inte övad". */
  betyg?: number
  /** Frågan att öva först (kopparram) med en rad under. */
  nu?: ReactNode
}

export const SARA_INTERVJU_FRAGOR: readonly IntervjuFraga[] = [
  { id: 'star', betyg: 3, nu: 'Lägst betyg hittills. Öva på den här först.' },
  { id: 'beratta', betyg: 4 },
  { id: 'varfor_jobbet' },
]

function Betyg({ av }: { av: number }) {
  return (
    <span className="p3-ivbetyg" role="img" aria-label={`Betyg ${av} av 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className={i < av ? 'p3-p' : undefined} />
      ))}
    </span>
  )
}

export function IntervjuKort({
  veckodag = 'tis',
  datum = '24',
  rubrik = 'Intervju tisdag 10.00',
  tjanst = 'Projektledare, Polhem Ombyggnad, Göteborg',
  ingress,
  fragor = SARA_INTERVJU_FRAGOR,
  ariaLabel = 'Exempel: en sökt tjänst med bokad intervju',
  className = '',
}: {
  veckodag?: string
  datum?: string
  rubrik?: ReactNode
  tjanst?: ReactNode
  /** Raden över frågorna. Standard: hur många av intervjuprovets frågor som är övade. */
  ingress?: ReactNode
  fragor?: readonly IntervjuFraga[]
  ariaLabel?: string
  className?: string
}) {
  const ovade = fragor.filter((f) => f.betyg !== undefined).length
  const text =
    ingress ?? (
      <>
        <b>Förbered intervjun på tisdag.</b>{' '}
        {`${talOrd(ovade).charAt(0).toUpperCase()}${talOrd(ovade).slice(1)} av de ${talOrd(FRAGA_ORDNING.length)} vanligaste frågorna är övade.`} Börja med den du fick lägst betyg på.
      </>
    )
  return (
    <div className={`p3-ivkort ${className}`.trim()} role="group" aria-label={ariaLabel}>
      <div className="p3-ivtopp">
        <span className="p3-ivdag">
          <small>{veckodag}</small>
          {datum}
        </span>
        <div>
          <b>{rubrik}</b>
          <span>{tjanst}</span>
        </div>
      </div>
      <div className="p3-ivkropp">
        <p>{text}</p>
        {fragor.map((f) => (
          <div key={f.id} className={`p3-ivfraga ${f.nu ? 'p3-nu' : ''}`.trim()}>
            <span>{FRAGOR[f.id].kort}</span>
            {f.betyg !== undefined ? <Betyg av={f.betyg} /> : <span className="p3-ej">Inte övad</span>}
            {f.nu ? <small>{f.nu}</small> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
