'use client'

/**
 * Ringen, sessionens enda klocka (plan-testflode-2026-11-20 beslut 1a och
 * avsnitt 7.2). Fast viewBox 48, spåret i kant 4 px, 36 px på mobil och 40
 * på dator; byter aldrig storlek, talet är tabular (CLS 0).
 *
 *   grans     Räknar ned. Töms medurs i ink-2 med hela minuter som tal;
 *             de sista två minuterna m:ss i 12 px och koppar. Mjuk gräns
 *             (nivåtest): efter noll står bågen full i koppar och talet är
 *             tiden över, "+1:23". Hård gräns (prov): står på 0:00, flödet
 *             lämnar in.
 *   referens  Träna: fylls medurs per uppgift mot provets tid, utan tal,
 *             står full i ink-2 när provets tid är nådd. Aldrig koppar.
 *
 * role="timer" med aria-live av: en uppläsning per sekund vore en störning.
 *
 * Tiden räknas från serverns started_at med klientens klocka, så talet kan
 * skilja en sekund mellan serverns HTML och första klientrenderingen (de sista
 * två minuterna och tiden över visas i sekunder). suppressHydrationWarning på
 * talet och etiketten: ringen tickar ändå om varje sekund (etapp 4).
 */

import { SESSION, tidText } from './copy'

const R = 20
const OMKRETS = 2 * Math.PI * R

export type KlockaProps =
  | { lage: 'grans'; kvar: number; total: number; mjuk?: boolean }
  | { lage: 'referens'; sekunder: number; budget: number }

function ringText(kvar: number): { text: string; sista: boolean; over: boolean } {
  if (kvar < 0) {
    const over = -kvar
    return { text: over < 600 ? `+${tidText(over)}` : `+${Math.floor(over / 60)}`, sista: true, over: true }
  }
  const s = Math.max(0, Math.ceil(kvar))
  if (s > 120) return { text: String(Math.ceil(s / 60)), sista: false, over: false }
  return { text: tidText(s), sista: true, over: false }
}

export default function Klocka(p: KlockaProps) {
  let andel: number
  let text: string | null = null
  let koppar = false
  let aria: string
  if (p.lage === 'grans') {
    const kvar = p.mjuk ? p.kvar : Math.max(0, p.kvar)
    const t = ringText(kvar)
    text = t.text
    koppar = t.sista
    andel = t.over ? 1 : p.total > 0 ? Math.max(0, Math.min(1, kvar / p.total)) : 0
    aria = t.over ? SESSION.klocka.over(-kvar) : SESSION.klocka.kvar(kvar)
  } else {
    andel = p.budget > 0 ? Math.min(1, p.sekunder / p.budget) : 0
    aria = SESSION.klocka.referens(p.sekunder, p.budget)
  }
  const storlek = text == null ? '' : text.length >= 5 ? 'text-[10px] lg:text-[11px]' : text.length === 4 ? 'text-[12px]' : 'text-[13px]'
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={aria}
      suppressHydrationWarning
      className="relative h-9 w-9 flex-shrink-0 lg:h-10 lg:w-10"
      data-klocka={p.lage === 'referens' ? 'referens' : koppar ? 'sista' : 'lugn'}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
        <circle cx="24" cy="24" r={R} fill="none" stroke="var(--kant)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke={koppar ? 'var(--koppar)' : 'var(--ink-2)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={OMKRETS.toFixed(2)}
          strokeDashoffset={(OMKRETS * (1 - andel)).toFixed(2)}
          transform="rotate(-90 24 24)"
          className="sess-ring"
        />
      </svg>
      {text != null ? (
        <b
          aria-hidden="true"
          suppressHydrationWarning
          className={`absolute inset-0 flex items-center justify-center font-sess-display font-bold tabular-nums tracking-[-.02em] transition-colors duration-300 ${
            koppar ? 'text-koppar-ink' : 'text-ink-1'
          } ${storlek}`}
        >
          {text}
        </b>
      ) : null}
    </div>
  )
}
