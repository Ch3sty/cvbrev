/**
 * InkPanel: vyns enda bläckyta (docs/designsystem.md avsnitt 6, regel 3 i
 * docs/design/analys-visuell-linje-2026-09-22.html).
 *
 * Exakt en fylld ink-1-yta per vy, och den bär vyns viktigaste handling
 * eller erbjudande: Nästa handling på hemskärmen, rekommendationen i en
 * hubb, mediebevisen på startsidan, paketet i en artikel. Två bläckytor på
 * samma skärm är ett fel.
 *
 * Tonerna är Allt-kortets: vit text, dämpad text i ink-1-mjuk, hårlinje i
 * ink-1-kant, etiketten i ink-1-accent. Knappen är vit på bläck
 * (INK_KNAPP), det sekundära en textlänk (INK_LANK).
 *
 * Scenen ritas med vita konturer och papper i ink-hover: panelen pekar om
 * --illu-fill, så samma scen fungerar på papper och på bläck. Den står i
 * egen kolumn till höger från sm och ovanför texten på mobil, aldrig ovanpå
 * text.
 *
 * Inga hooks och ingen 'use client': panelen renderas på servern och kan
 * användas i både server- och klientkomponenter.
 */

import type { CSSProperties, ReactNode } from 'react'

/** Primärknappen på bläck: vit yta, ink-text. */
export const INK_KNAPP =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-mark sm:w-auto'

/** Sekundär handling på bläck: textlänk i ink-1-mjuk. */
export const INK_LANK =
  'text-sm font-medium text-ink-1-mjuk underline decoration-ink-1-kant underline-offset-4 hover:text-white hover:decoration-white'

export interface InkPanelProps {
  /** Liten etikett överst, versaler: "Nästa handling", "Börja här". */
  eyebrow?: string
  title: ReactNode
  /**
   * Rubrikens element. h2 i en vy, p i reklamkort som inte får hamna i
   * rubrikträdet (SEO-spärrlistan punkt 3).
   */
  titleAs?: 'h2' | 'h3' | 'p'
  text?: ReactNode
  /** Vyns primära handling, normalt en länk eller knapp med INK_KNAPP. */
  action?: ReactNode
  /** En sekundär handling som textlänk, eller en rad med villkor. */
  secondary?: ReactNode
  /** Scen i 240 × 200 ur PriserScener-familjen. */
  scene?: ReactNode
  /** Extra innehåll under texten, till exempel rader eller en lista. */
  children?: ReactNode
  id?: string
  className?: string
  /** Tillgängligt namn för sektionen när rubriken inte är ett rubrikelement. */
  label?: string
}

/** Scenens tokens på bläck: papper i ink-hover, konturer vita. */
const SCEN_PA_BLACK = {
  '--illu-fill': 'var(--ink-hover)',
  '--illu-soft': 'var(--ink-1-kant)',
  '--illu-muted': 'var(--ink-1-mjuk)',
  '--insunken': 'var(--ink-hover)',
  '--ink-3': 'var(--ink-1-mjuk)',
  '--ink-2': 'var(--ink-1-mjuk)',
  '--accent-ink': 'var(--ink-1-accent)',
} as CSSProperties

export default function InkPanel({
  eyebrow,
  title,
  titleAs = 'h2',
  text,
  action,
  secondary,
  scene,
  children,
  id,
  className,
  label,
}: InkPanelProps) {
  const Rubrik = titleAs
  return (
    <section
      id={id}
      aria-label={label}
      className={`rounded-xl border border-ink-1 bg-ink-1 p-4 text-white sm:p-6 ${className ?? ''}`}
    >
      <div
        className={`flex flex-col gap-4 ${scene ? 'sm:flex-row-reverse sm:items-center sm:gap-6' : ''}`}
      >
        {scene ? (
          <div
            className="w-[120px] shrink-0 text-white sm:w-[200px] lg:w-[240px]"
            style={SCEN_PA_BLACK}
            aria-hidden="true"
          >
            {scene}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-steg font-semibold uppercase text-ink-1-accent">{eyebrow}</p>
          ) : null}
          <Rubrik className="mt-2 font-display text-[24px] font-bold leading-7 tracking-[-0.025em] text-white [text-wrap:balance] lg:text-[28px] lg:leading-8">
            {title}
          </Rubrik>
          {text ? (
            <div className="mt-2 max-w-[56ch] text-sm leading-[22px] text-ink-1-mjuk sm:text-base sm:leading-6">
              {text}
            </div>
          ) : null}
          {children ? <div className="mt-4">{children}</div> : null}
          {action || secondary ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              {action}
              {secondary}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
