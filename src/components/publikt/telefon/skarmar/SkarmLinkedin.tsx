/**
 * LinkedIn-profilen före och efter omskrivningen. Samma exempel som
 * /funktioner visar i löptext.
 */

import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

export default function SkarmLinkedin({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="cv" glid={glid} className={className}>
      <SkarmVagg kick="LinkedIn-profilen" rubrik="Rubriken, före och efter" sub="Fem sektioner skrivs om på samma sätt." />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">I dag</div>
          <b style={{ fontSize: 13 }}>Projektledare på NCC</b>
          <p className="s-dim" style={{ marginTop: 3 }}>
            Hittas när någon söker på: NCC
          </p>
        </div>
        <div className="s-kort" style={{ borderColor: 'var(--koppar)' }}>
          <div className="s-kick2">Efter</div>
          <b style={{ fontSize: 13 }}>Projektledare bygg, offentlig upphandling enligt LOU, budgetansvar 40 miljoner</b>
          <p className="s-dim" style={{ marginTop: 3 }}>
            Hittas på: projektledare, LOU, upphandling, bygg
          </p>
        </div>
        <div className="s-kort">
          <div className="s-kick2">Saknas i profilen</div>
          <div className="s-chips">
            <span className="s-chip s-saknas">BAS-P</span>
            <span className="s-chip s-saknas">AMA</span>
          </div>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Kopiera till LinkedIn" />
    </Telefon>
  )
}
