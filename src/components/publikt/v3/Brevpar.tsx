/**
 * Brevet med annonsens krav (delar/brevpar.html): annonsen som lapp med
 * kraven bockade, brevet på arket med de ställen som svarar markerade, och
 * brickan "3 av 4 krav har fått svar" räknad ur kraven. Så visar vyn
 * Brevet träffarna mot annonsens krav inloggat.
 *
 * Förvalet är Sara Lindströms exempel. Arbetsgivaren är påhittad.
 */

import type { ReactNode } from 'react'
import { SARA_KONTAKT, Svav } from './CvArk'

export interface Krav {
  text: string
  uppfyllt: boolean
}

export const SARA_KRAV: readonly Krav[] = [
  { text: 'Offentlig upphandling, LOU', uppfyllt: true },
  { text: 'Budgetansvar', uppfyllt: true },
  { text: 'Tidplan och uppföljning', uppfyllt: true },
  { text: 'PMP-certifiering', uppfyllt: false },
]

export const SARA_STYCKEN: readonly ReactNode[] = [
  'Hej,',
  <>
    När ni söker en projektledare som håller ihop upphandling och tidplan känner jag igen mina senaste tre år, där jag ledde en ombyggnad{' '}
    <mark>inom budget och två veckor före plan</mark>.
  </>,
  <>
    Ni skriver att rollen kräver vana vid <mark>offentlig upphandling enligt LOU</mark>. Jag har drivit fyra sådana, från förfrågningsunderlag till
    tilldelning.
  </>,
]

export function Brevpar({
  annonsTitel = 'Projektledare, Nordhaga Bygg',
  krav = SARA_KRAV,
  namn = 'Sara Lindström',
  kontakt = SARA_KONTAKT,
  rubrik = 'Ansökan: projektledare',
  stycken = SARA_STYCKEN,
  bricka = true,
  ariaLabel = 'Exempel: en annons och brevet som svarar på dess krav',
}: {
  annonsTitel?: string
  krav?: readonly Krav[]
  namn?: string
  kontakt?: string
  rubrik?: string
  /** Brevets stycken. Märk det som svarar på ett krav med <mark>. */
  stycken?: readonly ReactNode[]
  /** Brickan med hur många krav som fått svar. */
  bricka?: boolean
  ariaLabel?: string
}) {
  const svar = krav.filter((k) => k.uppfyllt).length
  return (
    <div className="p3-brevpar" role="img" aria-label={ariaLabel}>
      <div className="p3-annons p3-gungar">
        <b>{annonsTitel}</b>
        <ul>
          {krav.map((k) => (
            <li key={k.text} className={k.uppfyllt ? undefined : 'p3-ej'}>
              {k.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="p3-ark p3-brevark">
        <div className="p3-ark-namn">{namn}</div>
        <span className="p3-ark-kontakt">{kontakt}</span>
        <div className="p3-ark-rubrik">{rubrik}</div>
        {stycken.map((s, i) => (
          <p key={i} className="p3-ark-stycke">
            {s}
          </p>
        ))}
        <i className="p3-l" />
        <i className="p3-l p3-m" />
        <i className="p3-l p3-k" />
        <i className="p3-l" style={{ marginTop: 12 }} />
        <i className="p3-l p3-s" />
      </div>
      {bricka ? (
        <Svav mindre gungar sen stor={`${svar} av ${krav.length}`} under="krav har fått svar" />
      ) : null}
    </div>
  )
}
