/**
 * Fälten i arken: text, datum, tid, val (select), längre text, sökfältet,
 * stora valknappar (Annons, Spontan, Via kontakt), radval (CV:t) och
 * kryssrutan. Etiketten är alltid en riktig <label>.
 *
 * Kontrollerade eller okontrollerade efter vad vyn skickar in; inga hooks.
 */

import type { ChangeEventHandler, InputHTMLAttributes, MouseEventHandler, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { IkonKalender, IkonKlocka, IkonNed, IkonSok } from './ikoner'

interface FaltBas {
  etikett: string
  /** Grå text efter etiketten ("valfritt"). */
  tillagg?: string
  hjalp?: ReactNode
  /** Felet i en mening. Sätter aria-invalid. */
  fel?: string
  id?: string
}

function Ram({ etikett, tillagg, hjalp, fel, children }: FaltBas & { children: ReactNode }) {
  return (
    <label className="j3-falt">
      <span className="j3-etikett">
        {etikett}
        {tillagg ? <span>{` (${tillagg})`}</span> : null}
      </span>
      {children}
      {fel ? <p className="j3-falt-fel">{fel}</p> : hjalp ? <p className="j3-falt-hjalp">{hjalp}</p> : null}
    </label>
  )
}

export type FaltProps = FaltBas & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> & { typ?: 'text' | 'datum' | 'tid' | 'url' | 'epost' | 'tal' }

/** Ett fält: text, datum (kalenderikon), tid (klockikon), länk, e-post eller tal. */
export function Falt({ etikett, tillagg, hjalp, fel, id, typ = 'text', ...rest }: FaltProps) {
  const type = typ === 'datum' ? 'date' : typ === 'tid' ? 'time' : typ === 'url' ? 'url' : typ === 'epost' ? 'email' : typ === 'tal' ? 'number' : 'text'
  const ikon = typ === 'datum' ? <IkonKalender size={20} bredd={2.2} /> : typ === 'tid' ? <IkonKlocka size={20} bredd={2.2} /> : null
  const inp = <input id={id} className="j3-inp" type={type} aria-invalid={fel ? true : undefined} {...rest} />
  return (
    <Ram etikett={etikett} tillagg={tillagg} hjalp={hjalp} fel={fel}>
      {ikon ? (
        <span className="j3-inp-ram">
          {inp}
          {ikon}
        </span>
      ) : (
        inp
      )}
    </Ram>
  )
}

/** Ett val ur en lista (select) med rummets pil. */
export function ValFalt({ etikett, tillagg, hjalp, fel, id, alternativ, ...rest }: FaltBas & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & { alternativ: { varde: string; text: string }[] }) {
  return (
    <Ram etikett={etikett} tillagg={tillagg} hjalp={hjalp} fel={fel}>
      <span className="j3-inp-ram">
        <select id={id} className="j3-inp" aria-invalid={fel ? true : undefined} {...rest}>
          {alternativ.map((a) => (
            <option key={a.varde} value={a.varde}>
              {a.text}
            </option>
          ))}
        </select>
        <IkonNed size={20} />
      </span>
    </Ram>
  )
}

/** Längre text (anteckning). */
export function TextFalt({ etikett, tillagg, hjalp, fel, id, ...rest }: FaltBas & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>) {
  return (
    <Ram etikett={etikett} tillagg={tillagg} hjalp={hjalp} fel={fel}>
      <textarea id={id} className="j3-inp" aria-invalid={fel ? true : undefined} {...rest} />
    </Ram>
  )
}

/** Sökfältet (Sökta tjänster): förstoringsglas till vänster, etiketten för skärmläsare. */
export function SokFalt({ etikett, value, onChange, placeholder }: { etikett: string; value?: string; onChange?: ChangeEventHandler<HTMLInputElement>; placeholder?: string }) {
  return (
    <label className="j3-inp-ram vanster">
      <span className="sr-only">{etikett}</span>
      <IkonSok />
      <input className="j3-inp sok" type="search" value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  )
}

/** En etikett över en grupp valknappar ("Hur sökte du?"). */
export function GruppEtikett({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p className="j3-etikett grupp" id={id}>
      {children}
    </p>
  )
}

export interface ValKnappProps {
  children: ReactNode
  ikon?: ReactNode
  vald: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** 'stor' 76 hög med ikon över (Annons, Spontan), 'rad' 52 (CV:t, Vet inte). */
  form?: 'stor' | 'rad'
  /** Radvalet tar bara sin egen bredd ("Vet inte"). */
  krymp?: boolean
}

/** En valknapp med aria-pressed. Ligger i en ValRad med role="group". */
export function ValKnapp({ children, ikon, vald, onClick, form = 'stor', krymp }: ValKnappProps) {
  const k = ['j3-val', form === 'rad' ? 'rad' : '', krymp ? 'krymp' : ''].filter(Boolean).join(' ')
  return (
    <button type="button" className={k} aria-pressed={vald} onClick={onClick}>
      {ikon}
      {form === 'rad' ? <span className="j3-val-text">{children}</span> : children}
    </button>
  )
}

/** Raden med valknappar. */
export function ValRad({ children, etikett }: { children: ReactNode; etikett: string }) {
  return (
    <div className="j3-valrad" role="group" aria-label={etikett}>
      {children}
    </div>
  )
}

/** Kryssrutan med text ("Visa lista med företag och tjänster"). */
export function Kryss({ children, checked, onChange, defaultChecked }: { children: ReactNode; checked?: boolean; defaultChecked?: boolean; onChange?: ChangeEventHandler<HTMLInputElement> }) {
  return (
    <label className="j3-kryss">
      <input type="checkbox" checked={checked} defaultChecked={defaultChecked} onChange={onChange} />
      <span>{children}</span>
    </label>
  )
}

/** "Fler detaljer (valfritt): ort, länk, anteckning" med pil. */
export function FlerDetaljer({ oppen, onClick, rubrik = 'Fler detaljer', tillagg }: { oppen: boolean; onClick?: MouseEventHandler<HTMLButtonElement>; rubrik?: string; tillagg?: string }) {
  return (
    <button type="button" className="j3-detaljer" aria-expanded={oppen} onClick={onClick}>
      <span>
        {rubrik}
        {tillagg ? <span>{` ${tillagg}`}</span> : null}
      </span>
      <IkonNed size={20} className={oppen ? 'rotate-180' : undefined} />
    </button>
  )
}
