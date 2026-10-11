/**
 * Dagsringen (spec-rummen 4.4, konceptets .ring), SVG 56 på väggen.
 *
 *   kvar         streckad kopparring och en liten ring i mitten
 *   gjord        fylld kopparring och en bock
 *   general      streckad ring och en kvadrat i mitten (generalrepetitionen,
 *                bara de två dagarna före provet)
 *
 * Provdagen har ingen dagsring och ingen dagsrad alls (spec 16.2 fråga 4,
 * testansvarigs villkor): väggen bär datumet och nivåskalan, uppvärmningen
 * är det lyfta kortet. Rendera inte Dagsring eller Dagsrad den dagen.
 *
 * fyllAnimering sätter klassen .fyll på den fyllda ringen, så att
 * .motion .dagsring .fyll i globals.css ritar den en gång (bara när en ny punkt
 * kommit, nyPunkt).
 *
 * Server component.
 */

export type DagsringStatus = 'kvar' | 'gjord' | 'general'

export interface DagsringProps {
  status: DagsringStatus
  /** Tillgängligt namn, till exempel "Dagens pass inte gjort än". */
  label: string
  /** Ringens fyllning ritas (klassen .fyll). */
  fyllAnimering?: boolean
  /** Renderad storlek, 56 (dagsraden) eller 64 (resultatet). */
  storlek?: 56 | 64
  className?: string
}

export default function Dagsring({ status, label, fyllAnimering, storlek = 56, className }: DagsringProps) {
  return (
    <svg
      viewBox="0 0 56 56"
      width={storlek}
      height={storlek}
      role="img"
      aria-label={label}
      className={`dagsring shrink-0 ${className ?? ''}`}
    >
      <circle cx="28" cy="28" r="24" fill="none" stroke="var(--vagg-kant)" strokeWidth="5" />
      {status === 'gjord' ? (
        <>
          <circle
            className={fyllAnimering ? 'fyll' : undefined}
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="var(--koppar)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="151"
            strokeDashoffset="0"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
          <path
            d="M19 28.5l6 6 12-13"
            fill="none"
            stroke="var(--vagg-ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="var(--koppar)"
            strokeWidth="2"
            strokeDasharray="3 4"
            opacity=".8"
          />
          {status === 'kvar' ? (
            <circle cx="28" cy="28" r="4" fill="none" stroke="var(--koppar)" strokeWidth="2" />
          ) : (
            <rect x="24" y="24" width="8" height="8" rx="1.5" fill="none" stroke="var(--koppar)" strokeWidth="2" />
          )}
        </>
      )}
    </svg>
  )
}
