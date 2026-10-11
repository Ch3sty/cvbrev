'use client'

/**
 * Klockan i övningsprovet (Testerna v2, skiss 2, riktlinjerna 5.1): en lugn
 * ring uppe till höger som töms medurs, med minuter kvar som enda tal,
 * uppdaterad per minut. De sista två minuterna räknar den per tio sekunder
 * och blir koppar. Ingen blinkning, inget ljud, ingen varningstext.
 *
 * Med tid per uppgift (Alva) gäller ringen uppgiften och fylls om per
 * fråga; uppgiften är bara två minuter, så talet står i minuter och
 * sekunder hela tiden och kopparn kommer den sista minuten.
 *
 * Skärmläsaren får tiden i aria-label, och aria-live är av: en uppläsning
 * per tick vore en störning.
 */

import { FRAGA } from '@/lib/ovningsprov/copy'

const OMKRETS = 125.7 // 2π · 20

export interface KlockaProps {
  /** Sekunder kvar. */
  kvar: number
  /** Provets (eller uppgiftens) hela tid i sekunder. */
  total: number
  perUppgift?: boolean
  storlek?: number
}

/** Talet i ringen: minuter, eller m:ss per tio sekunder på slutet. */
export function klockText(kvar: number, total: number): { text: string; sista: boolean } {
  const s = Math.max(0, Math.ceil(kvar))
  const kort = total <= 120
  const grans = kort ? 60 : 120
  if (!kort && s > grans) return { text: String(Math.ceil(s / 60)), sista: false }
  // Per tio sekunder: avrundat uppåt till närmaste tiotal.
  const tio = Math.min(s, Math.ceil(s / 10) * 10)
  return { text: `${Math.floor(tio / 60)}:${String(tio % 60).padStart(2, '0')}`, sista: s <= grans }
}

export default function Klocka({ kvar, total, perUppgift = false, storlek = 48 }: KlockaProps) {
  const { text, sista } = klockText(kvar, total)
  const andel = total > 0 ? Math.max(0, Math.min(1, kvar / total)) : 0
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={FRAGA.klockaAria(Math.max(0, Math.ceil(kvar)), perUppgift)}
      className="relative flex-shrink-0"
      style={{ width: storlek, height: storlek }}
      data-klocka={sista ? 'sista' : 'lugn'}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="none" stroke="var(--kant)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={sista ? 'var(--koppar)' : 'var(--ink-2)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={OMKRETS}
          strokeDashoffset={(OMKRETS * (1 - andel)).toFixed(1)}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <b
        className={`absolute inset-0 flex items-center justify-center font-display font-bold tabular-nums tracking-[-.02em] ${
          sista ? 'text-koppar-ink' : 'text-ink-1'
        } ${text.length > 3 ? 'text-[12px]' : 'text-[14px]'}`}
        aria-hidden="true"
      >
        {text}
      </b>
    </div>
  )
}
