/**
 * Det personliga brevet, skrivet på annonsen. Personan är projektledaren
 * som söker hos Sweco i Göteborg (samma person i alla skärmar).
 */

import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

export default function SkarmBrev({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="brev" glid={glid} className={className}>
      <SkarmVagg
        kick="Personligt brev"
        rubrik="Projektledare, Sweco Göteborg"
        sub="Skrivet på annonsen, utifrån ditt CV. Ton: saklig."
      />
      <SkarmGolv>
        <div className="s-papper">
          <b>Hej Sweco,</b>
          När ni söker en projektledare som <mark>håller ihop upphandling och tidplan</mark> känner jag igen mina
          senaste tre år på NCC, där jag ledde ombyggnaden av Lindholmen Science Park inom{' '}
          <mark>budget på 42 miljoner</mark> och två veckor före plan.
          <br />
          <br />
          Ni skriver att rollen kräver vana vid <mark>offentlig upphandling enligt LOU</mark>. Jag har drivit fyra sådana
          från förfrågningsunderlag till tilldelning
          <span className="s-markor" />
        </div>
        <div className="s-rad s-dim" style={{ fontSize: 11, padding: '0 4px' }}>
          <span>Krav i annonsen: 6 av 7 täckta</span>
          <span className="s-pill s-gron">Redigerbart</span>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Ladda ner som PDF" />
    </Telefon>
  )
}
