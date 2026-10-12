/**
 * Jobbmatchningen efter att CV:t aktiverats: de sex datapunkterna lästa ur
 * CV:t. Namnen är desamma som rubrikerna i sidans "Sex datapunkter ur ditt
 * CV" (DATAPUNKTER), så skärmen och löptexten följs åt.
 */

import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

/** Datapunkternas namn, i samma ordning som sidans H3. */
export const DATAPUNKTER = ['Yrkesroller', 'Kompetenser', 'Utbildning', 'Plats', 'Språk', 'Erfarenhetsnivå'] as const

const VARDEN: Record<(typeof DATAPUNKTER)[number], string> = {
  Yrkesroller: 'Projektledare bygg, uppdragsledare',
  Kompetenser: 'LOU, AMA, budgetansvar, BAS-P',
  Utbildning: 'Civilingenjör, väg och vatten',
  Plats: 'Göteborg',
  Språk: 'Svenska, engelska',
  Erfarenhetsnivå: 'Sex år, senior',
}

/** Kortare etikett där sidans rubrik inte ryms i telefonens kolumn. */
const ETIKETT: Partial<Record<(typeof DATAPUNKTER)[number], string>> = { Erfarenhetsnivå: 'Erfarenhet' }

export default function SkarmAktivera({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="jobb" glid={glid} className={className}>
      <SkarmVagg
        kick="Jobbmatchning"
        rubrik="CV:t är aktiverat"
        sub="Sex datapunkter lästa ur projektledare-cv.pdf. Nu söker vi i Platsbanken."
      />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">Ur ditt CV</div>
          <dl className="s-data">
            {DATAPUNKTER.map((d) => (
              <div key={d} style={{ display: 'contents' }}>
                <dt>{ETIKETT[d] ?? d}</dt>
                <dd>{VARDEN[d]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="s-kort">
          <div className="s-rad">
            <b style={{ fontSize: 12 }}>Söker bland 1 843 lediga jobb</b>
            <span className="s-dim" style={{ whiteSpace: 'nowrap' }}>
              62 %
            </span>
          </div>
          <div className="s-matare" style={{ marginTop: 8 }}>
            <i style={{ width: '62%' }} />
          </div>
          <p className="s-dim" style={{ marginTop: 8 }}>
            Alla annonser i Platsbanken, även de med en annan titel än din.
          </p>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Visa träffarna" />
    </Telefon>
  )
}
