/**
 * Frågorna rekryteraren lär ställa utifrån profilen. Svaren läses ur
 * INTERVJU i smakprov-tolkning.ts för exempelprofilens två utslag; den
 * tredje frågan är STAR-frågan om självdisciplin ur intervjuguiden i det
 * fördjupade testet (src/lib/recruiter/workStyle.ts), här i kortform.
 */

import { INTERVJU } from '@/lib/personlighet/smakprov-tolkning'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

function gemenForst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

const FRAGOR = [
  {
    kick: 'Fråga 1, hög samvetsgrannhet',
    fraga: 'När kostade strukturen dig flexibilitet?',
    svar: gemenForst(INTERVJU.conscientiousness.high),
  },
  {
    kick: 'Fråga 2, låg utåtriktning',
    fraga: 'Hur gör du dig hörd i en grupp?',
    svar: gemenForst(INTERVJU.extraversion.low),
  },
]

export default function SkarmIntervjufragor({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="brev" glid={glid} className={className}>
      <SkarmVagg kick="Inför intervjun" rubrik="Frågor rekryteraren lär ställa" sub="Utifrån din profil." />
      <SkarmGolv>
        {FRAGOR.map((f) => (
          <div className="s-kort s-fraga" key={f.kick}>
            <div className="s-kick2">{f.kick}</div>
            <b>{f.fraga}</b>
            <p>
              <strong>Så svarar du:</strong> {f.svar}
            </p>
          </div>
        ))}
        <div className="s-kort s-fraga">
          <div className="s-rad">
            <div className="s-kick2" style={{ margin: 0 }}>
              Fråga 3, STAR
            </div>
            <span className="s-pill">Fördjupade testet</span>
          </div>
          <b style={{ marginTop: 6 }}>Ett långt projekt utan yttre press, hur höll du igång?</b>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Öva på svaret" />
    </Telefon>
  )
}
