/**
 * Startsidans hjälte: vägen till intervjun i Mitt jobbsök. Rekryteringstesterna
 * står först. Talen läses ur samma källor som resten av sidan.
 */

import { JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import Telefon from '../Telefon'
import { SkarmBock, SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

const STEG: { namn: string; text: string; lage: 'nu' | 'klar' | 'kvar' }[] = [
  {
    namn: 'Rekryteringstester',
    text: 'Nivåkollen klar, dagens pass väntar. Personlighetsprofilen sparad.',
    lage: 'nu',
  },
  { namn: 'CV-analysen', text: 'Poäng 74 av 100, två fynd åtgärdade', lage: 'klar' },
  { namn: 'Matchade jobb', text: `${JOB_MATCHES_PER_RUN} träffar i natt, bästa 92 procent`, lage: 'klar' },
  { namn: 'Personligt brev', text: 'Skrivet på annonsen, nedladdat som PDF', lage: 'klar' },
  { namn: 'Jobbcoachen', text: 'Lönefrågan inför intervjun', lage: 'kvar' },
]

export default function SkarmBana({ glid, className }: { glid?: boolean; className?: string }) {
  const klara = STEG.filter((s) => s.lage === 'klar').length
  return (
    <Telefon rum="jobb" glid={glid} className={className}>
      <SkarmVagg
        kick="Mitt jobbsök"
        rubrik="Vägen till intervjun"
        sub={`${klara === 3 ? 'Tre' : klara} av fem steg klara. Nu: Rekryteringstester.`}
      />
      <SkarmGolv>
        <div className="s-kort s-bana">
          {STEG.map((s) => (
            <div key={s.namn} className={`s-st ${s.lage === 'nu' ? 's-nu' : s.lage === 'klar' ? 's-klar' : ''}`}>
              <div className="s-st-n">{s.lage === 'klar' ? <SkarmBock /> : null}</div>
              <div>
                <b>{s.namn}</b>
                <span>{s.text}</span>
                {s.lage === 'nu' ? <span className="s-pill">Nu</span> : null}
              </div>
            </div>
          ))}
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Starta dagens pass" />
    </Telefon>
  )
}
