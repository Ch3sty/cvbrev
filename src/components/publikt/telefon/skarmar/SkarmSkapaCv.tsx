/**
 * CV-byggaren, steg 3 av 7: erfarenheten med förhandsvisning och vald mall.
 * Mallnamnet läses ur mallregistret (SIMPLE_TEMPLATES), första gratismallen.
 */

import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import Telefon from '../Telefon'
import { SkarmBock, SkarmFot, SkarmGolv, SkarmMatare, SkarmVagg } from '../delar'

export default function SkarmSkapaCv({ glid, className }: { glid?: boolean; className?: string }) {
  const mall = SIMPLE_TEMPLATES.find((t) => t.tier === 'free')?.name ?? 'Norrsken'
  return (
    <Telefon rum="cv" glid={glid} className={className}>
      <SkarmVagg kick="Skapa CV, steg 3 av 7" rubrik="Erfarenhet" sub={`Mall: ${mall}. Sparas medan du skriver.`} />
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
        <div className="s-kort">
          <SkarmMatare etikett="Ifyllt" varde={<b>3 av 7</b>} andel={3 / 7} forsta />
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Nästa steg: utbildning" />
    </Telefon>
  )
}
