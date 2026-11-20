'use client'

/**
 * Klockan, sessionens enda klocka (omgång 2 steg A, artboarden Klockan i
 * skissen): en kapsel med ringen och talet bredvid varandra, så att fem
 * tecken ("+1:23") får samma luft som fyra.
 *
 *   Kapseln  36 px hög på dator (ringen 26, talet 14 px), 30 på mobil
 *            (ringen 22, talet 12 px), papper-2, radie full. Talets bredd
 *            är fast per teckenantal (tabulära siffror), ringen har fast
 *            viewBox 48: inget flyttar när talet tickar (CLS 0).
 *   Ringen   spår 5 px i kant, bågen töms medurs från märket klockan tolv
 *            (ett kort streck i ink-1 på spåret, så att början syns också
 *            när ringen är full). Ingen text i ringen.
 *   Talet    alltid m:ss, tickar varje sekund.
 *
 * Lägena (lagesregler.tid):
 *   grans     Räknar ned i ink-2 med talet i ink-1. De sista två minuterna
 *             blir kapseln koppar-mjuk, bågen koppar och talet koppar-ink.
 *             Hård gräns (prov): står på 0:00 tills flödet lämnat in.
 *             Mjuk gräns (nivåtest): efter noll står bågen full i koppar och
 *             talet är tiden över, "+1:23".
 *   referens  Träna: sekunderna på uppgiften i ink-3, bågen fylls mot provets
 *             tid i ink-2. Aldrig koppar: ingen press, men läses som tid.
 *
 * role="timer" med aria-live av: en uppläsning per sekund vore en störning.
 * Tiden räknas från serverns started_at med klientens klocka, så talet kan
 * skilja en sekund mellan serverns HTML och första klientrenderingen:
 * suppressHydrationWarning på talet och etiketten (etapp 4).
 */

import { SESSION, tidText } from './copy'

const R = 20
const OMKRETS = 2 * Math.PI * R

export type KlockaProps =
  | { lage: 'grans'; kvar: number; total: number; mjuk?: boolean }
  | { lage: 'referens'; sekunder: number; budget: number }

type Ton = 'lugn' | 'sista' | 'over' | 'referens'

/** Talet och tonen för ett gränsläge (exporteras för testerna). */
export function klockText(kvar: number, mjuk = false): { text: string; ton: Ton } {
  if (kvar < 0 && mjuk) return { text: `+${tidText(-kvar)}`, ton: 'over' }
  const s = Math.max(0, Math.ceil(kvar))
  return { text: tidText(s), ton: s <= 120 ? 'sista' : 'lugn' }
}

export default function Klocka(p: KlockaProps) {
  let andel: number
  let text: string
  let ton: Ton
  let aria: string
  if (p.lage === 'grans') {
    const kvar = p.mjuk ? p.kvar : Math.max(0, p.kvar)
    const t = klockText(kvar, p.mjuk)
    text = t.text
    ton = t.ton
    andel = ton === 'over' ? 1 : p.total > 0 ? Math.max(0, Math.min(1, kvar / p.total)) : 0
    aria = ton === 'over' ? SESSION.klocka.over(-kvar) : SESSION.klocka.kvar(kvar)
  } else {
    text = tidText(p.sekunder)
    ton = 'referens'
    andel = p.budget > 0 ? Math.min(1, p.sekunder / p.budget) : 0
    aria = SESSION.klocka.referens(p.sekunder, p.budget)
  }
  const varm = ton === 'sista' || ton === 'over'
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={aria}
      suppressHydrationWarning
      className={`inline-flex h-[30px] flex-shrink-0 items-center gap-1.5 rounded-full pl-1 pr-2.5 transition-colors duration-300 lg:h-9 lg:gap-2 lg:pl-1.5 lg:pr-3 ${
        varm ? 'bg-koppar-mjuk' : 'bg-papper-2'
      }`}
      data-klocka={ton}
    >
      <svg viewBox="0 0 48 48" width="26" height="26" className="block h-[22px] w-[22px] flex-shrink-0 lg:h-[26px] lg:w-[26px]" aria-hidden="true">
        <circle cx="24" cy="24" r={R} fill="none" stroke={varm ? 'color-mix(in srgb, var(--koppar) 28%, transparent)' : 'var(--kant)'} strokeWidth="5" />
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke={varm ? 'var(--koppar)' : 'var(--ink-2)'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={OMKRETS.toFixed(2)}
          strokeDashoffset={(OMKRETS * (1 - andel)).toFixed(2)}
          transform="rotate(-90 24 24)"
          className="sess-ring"
        />
        <path d="M24 0v7" stroke="var(--ink-1)" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      </svg>
      <b
        aria-hidden="true"
        suppressHydrationWarning
        className={`block text-left font-sess-display text-[12px] leading-4 tabular-nums tracking-[-.01em] lg:text-[14px] ${
          ton === 'referens' ? 'font-semibold text-ink-3' : varm ? 'font-bold text-koppar-ink' : 'font-bold text-ink-1'
        }`}
        // Fast bredd per teckenantal: kolonet är smalare än en siffra.
        style={{ width: `${text.length - 0.45}ch` }}
      >
        {text}
      </b>
    </div>
  )
}
