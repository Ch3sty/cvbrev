/**
 * Samtalet med Jobbcoachen (delar/chatt.html): dina meddelanden till höger
 * i delens ton, Jobbcoachens på papper, och föreslagna frågor under.
 *
 * Förvalet är skissens exempel om uppföljning, utan källhänvisning till
 * någon namngiven regel och utan belopp (byggbriefen, Exempel och påhittat).
 * Jobbcoachen känner till målroll, ort och bransch ur profilen och det
 * användaren delar i samtalet, inte matchningar eller testresultat.
 */

import type { ReactNode } from 'react'

export interface Meddelande {
  fran: 'du' | 'coach'
  text: ReactNode
  /** Liten rad under Jobbcoachens svar ("Vill du att vi skriver utkastet?"). */
  under?: ReactNode
}

export const SAMTAL_EXEMPEL: readonly Meddelande[] = [
  { fran: 'du', text: 'Jag sökte en tjänst för tolv dagar sedan och har inte hört något. Ska jag höra av mig?' },
  {
    fran: 'coach',
    text: 'Ja. Efter en till två veckor är det rimligt att fråga. Skriv kort: vilken tjänst det gäller, att du fortfarande är intresserad och en fråga om tidsplanen.',
    under: 'Vill du att vi skriver utkastet?',
  },
]

export const SAMTAL_FORSLAG: readonly string[] = ['Vad skriver jag i ett uppföljningsmejl?', 'Hur länge är det rimligt att vänta på besked?']

export function Samtal({
  meddelanden = SAMTAL_EXEMPEL,
  forslag = SAMTAL_FORSLAG,
  yta,
  ariaLabel = 'Exempel: ett samtal med Jobbcoachen',
}: {
  meddelanden?: readonly Meddelande[]
  forslag?: readonly string[]
  /** Lägger samtalet på en ljus platta (när det står på papper). */
  yta?: boolean
  ariaLabel?: string
}) {
  const samtal = (
    <div className="p3-chatt" role="group" aria-label={ariaLabel}>
      {meddelanden.map((m, i) => (
        <p key={i} className={m.fran === 'du' ? 'p3-du' : 'p3-jc'}>
          {m.text}
          {m.under && m.fran === 'coach' ? <small>{m.under}</small> : null}
        </p>
      ))}
      {forslag.length ? (
        <div className="p3-chatt-forslag" aria-hidden="true">
          {forslag.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      ) : null}
    </div>
  )
  return yta ? <div className="p3-chatt-yta">{samtal}</div> : samtal
}
