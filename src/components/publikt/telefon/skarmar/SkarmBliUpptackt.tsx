/**
 * Den anonyma kandidatprofilen som en rekryterare ser: roll, region,
 * styrkor och verifierade tester som nivå och percentil. Aldrig namn,
 * nuvarande arbetsgivare, råpoäng eller lönespann (minnesregeln Bli upptäckt).
 */

import Telefon from '../Telefon'
import { SkarmBock, SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

const STYRKOR = ['Håller ihop upphandling och tidplan', 'Lugn under press', 'Leder genom expertis']

export default function SkarmBliUpptackt({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="jobb" glid={glid} className={className}>
      <SkarmVagg kick="Bli upptäckt" rubrik="Kandidat 4 812" sub="Projektledare bygg, Västra Götaland. Anonym tills du säger ja." />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">Styrkor</div>
          {STYRKOR.map((s) => (
            <div className="s-rad" key={s} style={{ justifyContent: 'flex-start', marginTop: 4 }}>
              <SkarmBock farg="var(--positiv)" storlek={12} />
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="s-kort">
          <div className="s-kick2">Verifierade tester</div>
          <div className="s-rad">
            <span>Matrislogik, avancerad</span>
            <span className="s-pill s-gron">Topp 15 %</span>
          </div>
          <div className="s-rad" style={{ marginTop: 6 }}>
            <span>Numeriskt, grund</span>
            <span className="s-pill s-gron">Topp 30 %</span>
          </div>
        </div>
        <div className="s-kort">
          <div className="s-kick2">Dolt för rekryteraren</div>
          <p className="s-dim">Namn, nuvarande arbetsgivare och löneanspråk.</p>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Synlig för rekryterare" />
    </Telefon>
  )
}
