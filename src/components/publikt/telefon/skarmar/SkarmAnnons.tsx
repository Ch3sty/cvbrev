/**
 * Brevets steg 2 av 4: kraven i annonsen mot CV:t, mall, ton och språk.
 * Samma persona som SkarmBrev. Mallnamnet läses ur brevmallarna.
 */

import { LETTER_TEMPLATES } from '@/lib/letters/letter-templates'
import Telefon from '../Telefon'
import { SkarmBock, SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

const KRAV = ['Projektledning, bygg', 'Offentlig upphandling, LOU', 'Budgetansvar', 'AMA', 'Tidplan', 'Entreprenadjuridik']

export default function SkarmAnnons({ glid, className }: { glid?: boolean; className?: string }) {
  const mall = Object.values(LETTER_TEMPLATES).find((t) => t.id === 'classic')?.name ?? 'Klassisk'
  return (
    <Telefon rum="brev" glid={glid} className={className}>
      <SkarmVagg
        kick="Personligt brev, steg 2 av 4"
        rubrik="Det annonsen kräver"
        sub="Projektledare, Sweco Göteborg. Sju krav i texten, sex av dem täcks av ditt CV."
      />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">Krav i annonsen</div>
          <div className="s-chips">
            {KRAV.map((k) => (
              <span className="s-chip" key={k}>
                <SkarmBock farg="currentColor" storlek={11} />
                {k}
              </span>
            ))}
            <span className="s-chip s-saknas">PMP-certifiering, saknas i CV:t</span>
          </div>
          <p className="s-dim" style={{ marginTop: 8 }}>
            Brevet bygger på det du täcker och nämner inte det som saknas.
          </p>
        </div>
        <div className="s-kort">
          <div className="s-kick2">Mall, ton och språk</div>
          <div className="s-rad">
            <span>Mall</span>
            <b>{mall}</b>
          </div>
          <div className="s-rad" style={{ marginTop: 6 }}>
            <span>Ton</span>
            <b>Saklig</b>
          </div>
          <div className="s-rad" style={{ marginTop: 6 }}>
            <span>Språk</span>
            <b>Svenska</b>
          </div>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Skriv brevet" />
    </Telefon>
  )
}
