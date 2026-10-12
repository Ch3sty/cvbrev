/**
 * Jobbcoachen inför intervjun. Ett fast exempel: lönespannet står bara i
 * telefonen, aldrig i löptexten (ingen lön utan källa i löptext).
 */

import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

export default function SkarmCoach({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="neu" glid={glid} className={className}>
      <SkarmVagg
        kick="Jobbcoachen"
        rubrik="Inför intervjun på torsdag"
        sub="Svaren utgår från svensk arbetsmarknad och ditt CV."
      />
      <SkarmGolv>
        <div className="s-bubbla s-jag">Vad är rimlig lön för en projektledare i Göteborg med sex års erfarenhet?</div>
        <div className="s-bubbla">
          Med din bakgrund från NCC och LOU-upphandlingarna ligger spannet i Göteborg runt <b>48 000 till 56 000 kr</b> i
          månaden. Begär 54 000 och motivera med budgetansvaret på 42 miljoner.
        </div>
        <div className="s-bubbla">Vill du att vi övar på frågan om varför du lämnade NCC?</div>
        <div className="s-bubbla s-jag">Ja, ta den.</div>
      </SkarmGolv>
      <SkarmFot>
        <div className="s-input">
          <span>Skriv en fråga</span>
          <i />
        </div>
      </SkarmFot>
    </Telefon>
  )
}
