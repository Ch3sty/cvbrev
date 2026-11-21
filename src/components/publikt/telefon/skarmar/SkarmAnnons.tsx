/**
 * Skriv brev medan brevet skrivs (en skärm, inga steg): kraven vi läste ut
 * ur annonsen, mall, ton och språk. Samma persona som SkarmBrev. Mallnamnet
 * är brevets förvalda mall ur katalogen (Linne).
 */

import { BREV_FORVALD_NAMN } from '@/components/publikt/brevmallar'
import Telefon from '../Telefon'
import { SkarmBock, SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

const KRAV = ['Projektledning, bygg', 'Offentlig upphandling, LOU', 'Budgetansvar', 'AMA', 'Tidplan', 'Entreprenadjuridik']

export default function SkarmAnnons({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="brev" glid={glid} className={className}>
      <SkarmVagg
        kick="Nytt brev"
        rubrik="Det annonsen kräver"
        sub="Projektledare, Sweco Göteborg. Vi läste ut sju krav och skriver brevet mot dem."
      />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-rad" style={{ marginBottom: 6 }}>
            <div className="s-kick2" style={{ marginBottom: 0 }}>
              Kraven
            </div>
            <span className="s-dim" style={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
              6 av 7 har fått svar
            </span>
          </div>
          <div className="s-chips">
            {KRAV.map((k) => (
              <span className="s-chip" key={k}>
                <SkarmBock farg="currentColor" storlek={11} />
                {k}
              </span>
            ))}
            <span className="s-chip s-saknas">PMP-certifiering, saknas i brevet</span>
          </div>
          <p className="s-dim" style={{ marginTop: 8 }}>
            Saknas ett krav lägger du till en mening om det när brevet är klart.
          </p>
        </div>
        <div className="s-kort">
          <div className="s-kick2">Mall, ton och språk</div>
          <div className="s-rad">
            <span>Mall</span>
            <b>{BREV_FORVALD_NAMN}</b>
          </div>
          <div className="s-rad" style={{ marginTop: 6 }}>
            <span>Ton</span>
            <b>Professionell</b>
          </div>
          <div className="s-rad" style={{ marginTop: 6 }}>
            <span>Språk</span>
            <b>Svenska</b>
          </div>
        </div>
      </SkarmGolv>
      <SkarmFot>
        {/* Ingen knapp: skärmen visar att brevet skrivs, inget steg att trycka sig vidare till. */}
        <div className="s-dim" style={{ height: 40, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600 }}>
          <span>
            Skriver stycke 3 av 4
            <span className="s-markor" style={{ marginLeft: 4 }} />
          </span>
        </div>
      </SkarmFot>
    </Telefon>
  )
}
