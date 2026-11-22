/**
 * Jobbcoachen med frågeförslag utifrån läget i Sökta tjänster. Inget belopp
 * och inget påstående om att svaren bygger på CV:t. Frågan och de två
 * förslagen är sådana som vyn själv föreslår (src/lib/jobbsok/coach.ts).
 */

import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

export default function SkarmCoach({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="neu" glid={glid} className={className}>
      <SkarmVagg
        kick={null}
        rubrik="Jobbcoachen"
        sub="Fråga om lön, intervjuer, arbetsrätt eller ditt CV. Vi svarar med källor du kan kolla själv."
      />
      <SkarmGolv>
        <div className="s-bubbla s-jag">Vad skriver jag i ett uppföljningsmejl?</div>
        <div className="s-bubbla">
          Håll det kort. Säg vilken tjänst det gäller, att du fortfarande är intresserad och fråga när de räknar med att ge
          besked. Tre till fyra meningar räcker. <span className="s-dim">(Källa 1)</span>
        </div>
        <div className="s-kort">
          <div className="s-kick2">Frågor utifrån ditt läge</div>
          <p className="s-dim">Hämtade ur dina sökta tjänster.</p>
          <div className="s-chips" style={{ marginTop: 6 }}>
            {['Vad frågar jag arbetsgivaren på intervjun?', 'Hur länge är det rimligt att vänta på besked?'].map((k) => (
              <span className="s-chip s-saknas" key={k}>
                {k}
              </span>
            ))}
          </div>
        </div>
      </SkarmGolv>
      <SkarmFot>
        <div className="s-input">
          <span>Fråga vad du vill veta om jobb, lön, intervju eller arbetsrätt</span>
          {/* Skicka-knappen, som i vyn */}
          <i />
        </div>
      </SkarmFot>
    </Telefon>
  )
}
