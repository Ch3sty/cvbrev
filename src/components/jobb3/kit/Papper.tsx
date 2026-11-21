/**
 * Papperet: mejlutkastet i en tonad brunn (Följ upp), det linjerade svaret
 * med hakparenteser (Inför intervjun) och rapportbladet (Rapport till
 * Arbetsförmedlingen, alltid vitt eftersom det skrivs ut).
 *
 * Serverkomponenter; texten i mejlet och svaret skickas in som children
 * (en textarea när den går att ändra direkt).
 */

import type { ReactNode } from 'react'

export interface MejlUtkastProps {
  /** "Mottagarens adress, står oftast under Kontakt i annonsen". */
  till: ReactNode
  amne: ReactNode
  /** Mejlets text: stycken, eller en <textarea> för att ändra direkt. */
  children: ReactNode
  /** Raden under papperet: antal ord till vänster, länkar till höger. */
  fotVanster?: ReactNode
  fotHoger?: ReactNode
}

/** Mejlutkastet: Till och Ämne som rader, sedan texten, i en tonad brunn. */
export function MejlUtkast({ till, amne, children, fotVanster, fotHoger }: MejlUtkastProps) {
  return (
    <div className="j3-brunn">
      <div className="j3-mejl">
        <div className="j3-mejl-rad">
          <span>Till</span>
          <span>{till}</span>
        </div>
        <div className="j3-mejl-rad">
          <span>Ämne</span>
          <b>{amne}</b>
        </div>
        <div className="j3-mejl-text">{children}</div>
      </div>
      {fotVanster || fotHoger ? (
        <div className="j3-brunn-fot">
          <span>{fotVanster}</span>
          <span>{fotHoger}</span>
        </div>
      ) : null}
    </div>
  )
}

/** Det linjerade svaret. children: text med <Hak> eller en <textarea>. */
export function LinjeratSvar({ children }: { children: ReactNode }) {
  return <div className="j3-linjerat">{children}</div>
}

/** En hakparentes att fylla i själv ("[belopp]"). Vi hittar aldrig på siffror. */
export function Hak({ children }: { children: ReactNode }) {
  return <span className="j3-hak">{children}</span>
}

/** Markören i det linjerade svaret (blinkar inte under prefers-reduced-motion). */
export function Markor() {
  return <span className="j3-markor" aria-hidden="true" />
}

export interface RapportRad {
  datum: string
  arbetsgivare: string
  tjanst: string
}

export interface RapportBladProps {
  titel?: string
  namn: string
  period: string
  periodRad?: string
  sektioner: { rubrik: string; rader: RapportRad[]; antal?: number; las?: boolean }[]
  siffror?: { tal: number | string; text: string }[]
  siffrorRubrik?: string
  fot?: string
  /** Raden under bladet i brunnen. */
  under?: ReactNode
}

/**
 * Rapportbladet (Aktivitetsöversikt). En sektion med `las` ritar raderna
 * som grå streck (gratisnivån: antalen syns, raderna är Premium).
 */
export function RapportBlad({ titel = 'Aktivitetsöversikt', namn, period, periodRad, sektioner, siffror, siffrorRubrik = 'Hela din sökning i siffror', fot = 'Genererad via jobbcoach.ai', under }: RapportBladProps) {
  return (
    <div className="j3-rbrunn">
      <div className="j3-rark">
        <div className="j3-rark-huvud">
          <div>
            <h3>{titel}</h3>
            <p>{namn}</p>
          </div>
          <div className="j3-rark-period">
            <b>{period}</b>
            {periodRad}
          </div>
        </div>
        {sektioner.map((s) => (
          <section key={s.rubrik}>
            <h4>
              {s.rubrik}
              <span>{s.antal ?? s.rader.length}</span>
            </h4>
            {s.rader.map((r, i) =>
              s.las ? (
                <div key={i} className="j3-arad las" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <div key={i} className="j3-arad">
                  <span>{r.datum}</span>
                  <b>{r.arbetsgivare}</b>
                  <span>{r.tjanst}</span>
                </div>
              ),
            )}
          </section>
        ))}
        {siffror?.length ? (
          <>
            <h4 className="utan-linje">{siffrorRubrik}</h4>
            <div className="j3-siffror">
              {siffror.map((s) => (
                <div key={s.text} className="j3-siff">
                  <b>{s.tal}</b>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
        {fot ? <p className="j3-rark-fot">{fot}</p> : null}
      </div>
      {under ? <p>{under}</p> : null}
    </div>
  )
}
