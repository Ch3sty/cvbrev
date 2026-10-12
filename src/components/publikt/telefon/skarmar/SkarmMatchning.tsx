/**
 * Dina matchningar efter natten. Antalet träffar läses ur
 * JOB_MATCHES_PER_RUN, så skärmen och löptexten säger samma tal.
 */

import { JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

export default function SkarmMatchning({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="jobb" glid={glid} className={className}>
      <SkarmVagg
        kick="Dina matchningar"
        rubrik={`${JOB_MATCHES_PER_RUN} nya i natt`}
        sub="Kompetens mot alla annonser i Platsbanken. Skälen står under varje träff."
      />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-rad">
            <b style={{ fontSize: 13 }}>Projektledare, bygg</b>
            <span className="s-pill s-gron">92 %</span>
          </div>
          <p className="s-dim">Sweco, Göteborg</p>
          <p style={{ marginTop: 6 }}>
            <b style={{ color: 'var(--positiv)' }}>Du täcker:</b> projektledning, LOU, budgetansvar, AMA
          </p>
          <p>
            <b style={{ color: 'var(--varning)' }}>Saknas:</b> PMP-certifiering
          </p>
        </div>
        <div className="s-kort">
          <div className="s-rad">
            <b style={{ fontSize: 13 }}>Uppdragsledare, infrastruktur</b>
            <span className="s-pill s-gron">88 %</span>
          </div>
          <p className="s-dim">Trafikverket, Mölndal</p>
          <p style={{ marginTop: 6 }}>
            <b style={{ color: 'var(--positiv)' }}>Du täcker:</b> tidplan, entreprenadjuridik, BAS-P
          </p>
        </div>
        <div className="s-kort" style={{ opacity: 0.75 }}>
          <div className="s-rad">
            <b style={{ fontSize: 13 }}>Byggledare</b>
            <span className="s-pill s-gron">81 %</span>
          </div>
          <p className="s-dim">Peab, Borås</p>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Skriv brev från träffen" />
    </Telefon>
  )
}
