/**
 * Matchade jobb i Jobbsöket, efter en sökning: träffarna ligger kvar tills
 * man söker igen. Antalet träffar läses ur JOB_MATCHES_PER_RUN, så skärmen
 * och löptexten säger samma tal. Ingen rad om vad som saknas: den visas bara
 * för annonser med kravprofil (textbeslut publikt omgång 3, B-4).
 */

import { JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

const FLIKAR = ['Översikt', 'Jobb', 'Sökta', 'Intervju'] as const

export default function SkarmMatchning({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="jobb" glid={glid} className={className}>
      <SkarmVagg
        kick="Matchade jobb"
        rubrik={`${JOB_MATCHES_PER_RUN} jobb passar dig`}
        sub="Vi läser ditt CV och letar bland Arbetsförmedlingens annonser. Varje träff säger varför den passar."
      >
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10 }}>
          {FLIKAR.map((f) => (
            <span key={f} style={f === 'Jobb' ? { fontWeight: 700, textDecoration: 'underline' } : { opacity: 0.7 }}>
              {f}
            </span>
          ))}
        </div>
      </SkarmVagg>
      <SkarmGolv>
        <div className="s-rad">
          <div className="s-kick2">{`${JOB_MATCHES_PER_RUN} bästa träffarna`}</div>
          <span className="s-dim" style={{ fontSize: 10 }}>
            Senast sökt i dag. <u>Sök igen</u>
          </span>
        </div>
        <div className="s-kort">
          <div className="s-rad">
            <b style={{ fontSize: 13 }}>Projektledare, bygg</b>
            <span className="s-pill s-gron">92 %</span>
          </div>
          <div className="s-rad">
            <p className="s-dim">Sweco, Göteborg</p>
            <span className="s-dim" style={{ whiteSpace: 'nowrap' }}>
              Sista dag 28 nov
            </span>
          </div>
          <p style={{ marginTop: 6 }}>
            <b style={{ color: 'var(--positiv)' }}>Din roll matchar</b>
          </p>
          <div className="s-chips" style={{ marginTop: 4 }}>
            {['projektledning', 'LOU', 'budgetansvar', 'AMA'].map((k) => (
              <span className="s-chip" key={k}>
                {k}
              </span>
            ))}
          </div>
          <div className="s-chips" style={{ marginTop: 8 }}>
            {['Skriv brev', 'Spara till Ska sökas', 'Markera som sökt'].map((k) => (
              <span className="s-chip s-saknas" key={k}>
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="s-kort">
          <div className="s-rad">
            <b style={{ fontSize: 13 }}>Uppdragsledare, infrastruktur</b>
            <span className="s-pill s-gron">88 %</span>
          </div>
          <div className="s-rad">
            <p className="s-dim">Trafikverket, Mölndal</p>
            <span className="s-dim" style={{ whiteSpace: 'nowrap' }}>
              Sista dag 3 dec
            </span>
          </div>
          <div className="s-chips" style={{ marginTop: 6 }}>
            {['tidplan', 'entreprenadjuridik', 'BAS-P'].map((k) => (
              <span className="s-chip" key={k}>
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="s-kort" style={{ opacity: 0.75 }}>
          <div className="s-rad">
            <b style={{ fontSize: 13 }}>Byggledare</b>
            <span className="s-pill s-gron">81 %</span>
          </div>
          <p className="s-dim">Peab, Borås</p>
        </div>
      </SkarmGolv>
      <SkarmFot />
    </Telefon>
  )
}
