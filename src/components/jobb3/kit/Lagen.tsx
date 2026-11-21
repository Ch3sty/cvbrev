/**
 * Lägena runt innehållet (BYGGSPEC avsnitt 5): tomt läge med en mening och
 * en handling, skelett i väggens och panelens form (samma mått som det
 * färdiga, så att inget skiftar), felrutan med "Försök igen", och ramen
 * runt betalväggen (dagens PaywallCard inuti, oförändrad).
 *
 * Serverkomponenter; onForsok fungerar i en klientvy.
 */

import type { CSSProperties, MouseEventHandler, ReactNode } from 'react'
import { LitenKnapp } from './delar'
import { IkonUtrop } from './ikoner'

/** Tomt läge: aldrig streck, aldrig nollor som ser ut som fel. */
export function TomtLage({ ikon, rubrik, text, handling, inbaddad }: { ikon?: ReactNode; rubrik?: string; text: ReactNode; handling?: ReactNode; inbaddad?: boolean }) {
  return (
    <div className={inbaddad ? 'j3-tomt inbaddad' : 'j3-tomt'}>
      {ikon ? (
        <span className="j3-tomt-ik" aria-hidden="true">
          {ikon}
        </span>
      ) : null}
      <div>
        {rubrik ? <b>{rubrik}</b> : null}
        <p>{text}</p>
      </div>
      {handling ? <div className="j3-tomt-handling">{handling}</div> : null}
    </div>
  )
}

/** Felrutan: en mening om vad som hände och "Försök igen". Aldrig röd. */
export function Felruta({ text, onForsok, forsokHref }: { text: ReactNode; onForsok?: MouseEventHandler<HTMLElement>; forsokHref?: string }) {
  return (
    <div className="j3-fel" role="alert">
      <div className="j3-fel-rad">
        <IkonUtrop size={20} />
        <p>{text}</p>
      </div>
      {onForsok || forsokHref ? (
        <LitenKnapp onClick={onForsok} href={forsokHref}>
          Försök igen
        </LitenKnapp>
      ) : null}
    </div>
  )
}

/** Ramen runt betalväggen: kopparkant, varm yta. Lägg dagens PaywallCard (bare) inuti. */
export function SparrRam({ children, etikett }: { children: ReactNode; etikett?: string }) {
  return (
    <section className="j3-sparr" aria-label={etikett}>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------ skelett */

/** En grå platta med fasta mått. `vagg` på väggen. */
export function Skel({ b, h, vagg, rund, stil }: { b?: number | string; h: number; vagg?: boolean; rund?: boolean; stil?: CSSProperties }) {
  const k = ['j3-skel', vagg ? 'vagg' : '', rund ? 'rund' : ''].filter(Boolean).join(' ')
  return <span className={k} style={{ width: b ?? '100%', height: h, ...stil }} aria-hidden="true" />
}

/**
 * Väggens innehåll medan sidan laddar: flikarna och hjältens rader i samma
 * höjd som det färdiga. Läggs inuti JobbVagg (som ger samma minsta höjd).
 */
export function VaggSkelett() {
  return (
    <div aria-hidden="true">
      <div className="j3-skel-flikar">
        <span className="j3-skel vagg" />
        <span className="j3-skel vagg" />
        <span className="j3-skel vagg" />
        <span className="j3-skel vagg" />
      </div>
      <div className="j3-hero">
        <div className="j3-hero-text">
          <Skel vagg b={180} h={16} />
          <Skel vagg b="88%" h={46} stil={{ marginTop: 14 }} />
          <Skel vagg b="60%" h={46} stil={{ marginTop: 6 }} />
          <Skel vagg b="80%" h={20} stil={{ marginTop: 16 }} />
          <div className="j3-knapprad">
            <Skel vagg b={240} h={60} stil={{ borderRadius: 16 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Panelens innehåll medan det laddar: rubrikrad och tre kort. */
export function PanelSkelett({ kort = 3 }: { kort?: number }) {
  return (
    <div aria-hidden="true">
      <Skel b={120} h={14} />
      <Skel b="50%" h={26} stil={{ marginTop: 8 }} />
      <div className="j3-goralista">
        {Array.from({ length: kort }, (_, i) => (
          <Skel key={i} h={96} stil={{ borderRadius: 18, minHeight: 76 }} />
        ))}
      </div>
    </div>
  )
}

/** Rader i ett kort medan de laddar (samma höjd som TjanstRad). */
export function RadSkelett({ rader = 4 }: { rader?: number }) {
  return (
    <div className="j3-kort lista" aria-hidden="true">
      {Array.from({ length: rader }, (_, i) => (
        <div key={i} className="j3-rad">
          <Skel b={44} h={44} stil={{ borderRadius: 13 }} />
          <span className="j3-rad-text">
            <Skel b="55%" h={16} />
            <Skel b="80%" h={13} stil={{ marginTop: 8 }} />
          </span>
        </div>
      ))}
    </div>
  )
}
