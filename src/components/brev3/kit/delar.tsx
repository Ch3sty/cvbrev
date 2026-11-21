/**
 * Brevrummets små delar: knapparna, brickorna, taggarna, formatmärkena,
 * plupparna och kravbitarna (skissens .stor, .vit, .bricka, .liten, .chip,
 * .tg, .fm, .pips, .bit). Inga hooks: går att använda från både server- och
 * klientkomponenter. En knapp med href blir en länk, annars en button.
 */

import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { IkonBock, IkonLas } from './ikoner'

type KnappBas = {
  children: ReactNode
  /** Med href blir det en länk (Link), annars en riktig button. */
  href?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  'aria-label'?: string
}

function Knapp({ klass, children, href, onClick, className, disabled, type = 'button', ...rest }: KnappBas & { klass: string }) {
  const cls = className ? `${klass} ${className}` : klass
  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick} aria-label={rest['aria-label']}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={rest['aria-label']}>
      {children}
    </button>
  )
}

/**
 * Den stora orange knappen: väggens enda handling ("Öppna brevet", "Skriv
 * brevet") och spärrens köpknapp. Full bredd på telefonen, egen bredd på
 * dator. bred: full bredd även på dator (spärren). platt: utan den mjuka
 * skuggan under kanten (på papper). lag: 52 px, bladets fot ("Ladda ner PDF").
 */
export function StorKnapp({ bred, platt, lag, ...p }: KnappBas & { bred?: boolean; platt?: boolean; lag?: boolean }) {
  const klass = ['b3-stor', bred && 'bred', platt && 'platt', lag && 'lag'].filter(Boolean).join(' ')
  return <Knapp klass={klass} {...p} />
}

/** Vit knapp i väggen, den andra handlingen bredvid den stora (Skickat: "Öppna Sökta tjänster"). */
export function VitKnapp(p: KnappBas) {
  return <Knapp klass="b3-vit" {...p} />
}

/** Vit bricka i väggen, för val som inte är huvudhandlingen (Mallar: "Ändra texten", "Typsnitt: Inter"). */
export function Bricka(p: KnappBas) {
  return <Knapp klass="b3-bricka" {...p} />
}

/**
 * Liten knapp på papper ("Skriv brev", "Öppna CV:t", "Kopiera text").
 * kop: orange köpvariant. saknas: med kravkortets orange kant ("Lägg till i brevet").
 */
export function LitenKnapp({ kop, saknas, bred, ...p }: KnappBas & { kop?: boolean; saknas?: boolean; bred?: boolean }) {
  const klass = ['b3-liten', kop && 'kop', saknas && 'saknas', bred && 'bred'].filter(Boolean).join(' ')
  return <Knapp klass={klass} {...p} />
}

/**
 * Bricka i väggen ("Mallen Linne", "Inte skickat än"). ljus: vit bricka med
 * kant, som länken "Se det i fler mallar". glas: den tunnare etiketten ("Ditt CV").
 */
export function Chip({ children, ljus, glas, href, className }: { children: ReactNode; ljus?: boolean; glas?: boolean; href?: string; className?: string }) {
  const cls = ['b3-chip', ljus && 'ljus', glas && 'glas', className].filter(Boolean).join(' ')
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }
  return <span className={cls}>{children}</span>
}

/**
 * Tagg på papper. p: Premium och orange status ("Inte skickat", "Låst"),
 * g: grön ("Sökt 14 nov", "Gratis"), n: plommon ("Ny i natt").
 * las: låsikonen först, bock: bocken först. liten: 20 px (inne i en rad).
 */
export function Tagg({ ton, children, las, bock, liten, className }: { ton: 'p' | 'g' | 'n'; children: ReactNode; las?: boolean; bock?: boolean; liten?: boolean; className?: string }) {
  const cls = ['b3-tg', ton, liten && 'liten', className].filter(Boolean).join(' ')
  return (
    <span className={cls}>
      {las ? <IkonLas size={11} /> : null}
      {bock ? <IkonBock size={11} strokeWidth={3.6} /> : null}
      {children}
    </span>
  )
}

/** Mätarens bricka: väntar (orange, "1 krav saknas") eller klar (grön med bock, "En sida"). */
export function MatarBricka({ klar, children }: { klar?: boolean; children: ReactNode }) {
  if (klar) {
    return (
      <span className="b3-plus">
        <IkonBock size={12} strokeWidth={3.6} />
        {children}
      </span>
    )
  }
  return <span className="b3-vantar">{children}</span>
}

/** Formatmärkena PDF och Word: vita på väggen (spärren), tonade på papper (mallkorten). */
export function Formatmarken({ format = ['PDF', 'Word'], yta = 'vagg' }: { format?: readonly string[]; yta?: 'vagg' | 'papper' }) {
  const papper = yta === 'papper'
  return (
    <span className={papper ? 'b3-fmrad papper' : 'b3-fmrad'}>
      {format.map((f) => (
        <span key={f} className={papper ? 'b3-fm papper' : 'b3-fm'}>
          {f}
        </span>
      ))}
    </span>
  )
}

/**
 * Pluppar. liten: veckokvoten på papper (fylld = använd). stor: skickade
 * brev i väggen (Skickat). Etiketten är det skärmläsaren hör.
 */
export function Pips({ fyllda, totalt, etikett, storlek = 'liten' }: { fyllda: number; totalt: number; etikett: string; storlek?: 'liten' | 'stor' }) {
  return (
    <span className={storlek === 'stor' ? 'b3-pips stor' : 'b3-pips'} role="img" aria-label={etikett}>
      {Array.from({ length: Math.max(0, totalt) }, (_, i) => (
        <i key={i} data-fylld={i < fyllda ? '' : undefined} />
      ))}
    </span>
  )
}

/**
 * Kravbitarna: en grön bit med bock per besvarat krav, en streckad lucka med
 * plus per krav som saknas. Etiketten säger vilka som saknas, i ord.
 */
export function KravBitar({ besvarade, totalt, etikett }: { besvarade: number; totalt: number; etikett: string }) {
  const n = Math.max(0, Math.min(totalt, 12))
  return (
    <span className="b3-bitar" role="img" aria-label={etikett}>
      {Array.from({ length: n }, (_, i) =>
        i < besvarade ? (
          <span key={i} className="b3-bit">
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4.5 12.5l5 5L20 6.5" />
            </svg>
          </span>
        ) : (
          <span key={i} className="b3-bit lucka">
            +
          </span>
        ),
      )}
    </span>
  )
}
