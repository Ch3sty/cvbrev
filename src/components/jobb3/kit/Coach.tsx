/**
 * Jobbcoachen: din fråga, Jobbcoachens svar med källrad, frågeförslagen
 * utifrån läget (F9), inmatningen och gratisnivåns kvot som prickar.
 * Samma bubblor används i Meddelanden (rekryterarens meddelande).
 *
 * Serverkomponenter; onClick och onSubmit fungerar i en klientvy.
 */

import type { FormEventHandler, MouseEventHandler, ReactNode } from 'react'
import { Bricka, type BrickTon } from './delar'
import { IkonLank, IkonPrat } from './ikoner'

/** Samtalets kolumn. */
export function Samtal({ children }: { children: ReactNode }) {
  return <div className="j3-samtal">{children}</div>
}

/** Din fråga: mörk bubbla till höger. */
export function JagBubbla({ children }: { children: ReactNode }) {
  return <div className="j3-jag">{children}</div>
}

/** Svaret: tonad bubbla med Jobbcoachens ikon. `skriver` visar tre prickar medan svaret kommer. */
export function SvarBubbla({ children, kallor, skriver, ikon = true }: { children?: ReactNode; kallor?: ReactNode; skriver?: boolean; ikon?: boolean }) {
  const bubbla = skriver ? (
    <div className="j3-svar skriver" role="status" aria-label="Jobbcoachen skriver">
      <i />
      <i />
      <i />
    </div>
  ) : (
    <div className="j3-svar">{children}</div>
  )
  if (!ikon) {
    return (
      <div>
        {bubbla}
        {kallor}
      </div>
    )
  }
  return (
    <div className="j3-coach">
      <span className="j3-coach-ik" aria-hidden="true">
        <IkonPrat size={20} />
      </span>
      <div>
        {bubbla}
        {kallor}
      </div>
    </div>
  )
}

/** Källorna under ett svar. */
export function Kallrad({ kallor, rubrik = 'Källor' }: { kallor: { text: string; href: string }[]; rubrik?: string }) {
  return (
    <div className="j3-kallor">
      <p className="j3-eyebrow">{rubrik}</p>
      <div>
        {kallor.map((k) => (
          <a key={k.href} className="j3-kalla" href={k.href} target="_blank" rel="noopener noreferrer">
            <IkonLank />
            {k.text}
          </a>
        ))}
      </div>
    </div>
  )
}

/** Ett frågeförslag utifrån läget (F9): tjänstens bricka och frågan. Skickas först vid tryck. */
export function FragaForslag({ kod, ton, children, onClick }: { kod?: string; ton?: BrickTon; children: ReactNode; onClick?: MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button type="button" className="j3-forslag" onClick={onClick}>
      {kod ? <Bricka kod={kod} ton={ton} mobil={44} dator={44} /> : null}
      <span>{children}</span>
    </button>
  )
}

/** Listan med frågeförslag (högst fyra). */
export function ForslagLista({ children }: { children: ReactNode }) {
  return <div className="j3-forslaglista">{children}</div>
}

/** Inmatningen: fältet och knappen (Skicka, primär). */
export function Inmatning({ etikett, placeholder, value, onChange, onSubmit, knapp }: { etikett: string; placeholder?: string; value?: string; onChange?: (v: string) => void; onSubmit?: FormEventHandler<HTMLFormElement>; knapp: ReactNode }) {
  return (
    <form className="j3-inmatning" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="j3-inmatning">
        {etikett}
      </label>
      <input id="j3-inmatning" className="j3-inp" type="text" placeholder={placeholder} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} />
      {knapp}
    </form>
  )
}

/** Gratisnivåns kvot som prickar: använda ihåliga, kvar gröna. */
export function KvotPrickar({ kvar, av }: { kvar: number; av: number }) {
  return (
    <span className="j3-kvotpips" role="img" aria-label={`${kvar} av ${av} kvar`}>
      {Array.from({ length: av }, (_, i) => (
        <i key={i} data-anv={i < av - kvar ? '' : undefined} />
      ))}
    </span>
  )
}
