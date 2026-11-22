/**
 * Lyftets svar på /verktyg/jobbcoachen, publikt omgång 3 (skissen
 * jobbcoachen, "ett svar som står stilla"). Tidigare en rullande demo med
 * tre exempel; nu står LAS-svaret (demo 2) stilla och går att läsa, med
 * källmärkena i texten och källorna under. Textbeslut B-31: demo 2 står,
 * den stämmer med 11 § LAS. Inga lönebelopp, inga tal utan källa.
 *
 * Serverkomponent, ingen JavaScript. Klasserna jc- står i jobbcoachen.css.
 */

interface Source {
  label: string
  org: string
}

const FRAGA = 'Min chef sa upp mig idag, vad har jag för rättigheter?'
const SVAR =
  'Tråkigt att höra. Enligt LAS måste arbetsgivaren ha saklig grund och uppsägningen gäller skriftligt (Källa 1). Uppsägningstiden är minst 1 månad om du jobbat under 2 år, och upp till 6 månader om du varit där 10+ år (Källa 2). Vill du att vi går igenom vad du bör begära innan du skriver under något?'
const KALLOR: Source[] = [
  { label: 'LAS § 7 och § 11', org: 'Arbetsförmedlingen' },
  { label: 'Unionen Uppsägning', org: 'Fackförbund' },
]

/** Svar med (Källa N) som märke i texten. */
function FormattedAnswer({ text }: { text: string }) {
  const parts = text.split(/(\(Källa \d+\))/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\(Källa (\d+)\)$/)
        if (match) {
          return (
            <span key={i} className="jc-kref">
              (Källa {match[1]})
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export default function JobbcoachenLiveDemo() {
  return (
    <div className="jc-svarbild" role="group" aria-label="Exempel: ett svar från Jobbcoachen med två källor">
      <div className="p3-chatt">
        <p className="p3-du">{FRAGA}</p>
        <p className="p3-jc">
          <FormattedAnswer text={SVAR} />
          <span className="jc-kallor">
            <b>Källor</b>
            {KALLOR.map((k, i) => (
              <span key={k.label} className="jc-kalla">
                <i>{i + 1}</i>
                {k.label}
              </span>
            ))}
          </span>
        </p>
      </div>
    </div>
  )
}
