/**
 * CV-byggaren "Direkt på arket": avsnittet Erfarenhet öppet i förvalsmallen,
 * med Jobbcoachens förslag på punkter. Inga steg (saas-leads P6,
 * 2026-11-17): byggaren har avsnitt, inte ett flöde i sju steg. Mallnamnet
 * läses ur katalogen, första gratismallen.
 */

import { FORVALD_MALL_ID, getMallKort } from '@/lib/cv/mallar/katalog'
import Telefon from '../Telefon'
import { SkarmBock, SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

export default function SkarmSkapaCv({ glid, className }: { glid?: boolean; className?: string }) {
  const mall = getMallKort(FORVALD_MALL_ID)?.namn ?? 'Linne'
  return (
    <Telefon rum="cv" glid={glid} className={className}>
      <SkarmVagg kick="Skapa CV" rubrik="Erfarenhet" sub={`Mall: ${mall}. Tryck på ett avsnitt för att fylla i.`} />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">Senaste jobbet</div>
          <b style={{ fontSize: 13 }}>Projektledare, NCC</b>
          <p className="s-dim">Göteborg, 2021 till nu</p>
          <p style={{ marginTop: 6 }}>Ledde ombyggnaden av Lindholmen Science Park inom budget på 42 miljoner, två veckor före plan.</p>
        </div>
        <div className="s-kort">
          <div className="s-kick2">Förslag på punkter</div>
          {['Drev fyra upphandlingar enligt LOU', 'Ansvarade för budget och tidplan', 'Ledde ett team på tolv personer'].map((t) => (
            <div className="s-rad" key={t} style={{ justifyContent: 'flex-start', marginTop: 4 }}>
              <span className="s-pill s-gron" style={{ padding: '2px 4px' }}>
                <SkarmBock farg="currentColor" storlek={10} />
              </span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Spara" />
    </Telefon>
  )
}
