/**
 * Resultatvyn efter nivåkollen i matrislogik: andel rätt, tid, var du tappar
 * och ett svar mot facit. Antalet frågor läses ur testConfig för grundnivån.
 */

import { getTestConfig } from '@/app/dashboard/tester/testConfig'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmMatare, SkarmVagg } from '../delar'

const GRUND = getTestConfig('matrislogik-grund')

export default function SkarmNivakoll({ glid, className }: { glid?: boolean; className?: string }) {
  const totalt = GRUND?.totalQuestions ?? 15
  return (
    <Telefon rum="tran" tid="14:31" glid={glid} className={className}>
      <SkarmVagg kick="Nivåkollen, matrislogik">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
          <span className="s-stor-tal">11</span>
          <span style={{ color: 'var(--vagg-mjuk)', fontWeight: 600 }}>av {totalt} rätt</span>
        </div>
        <div className="s-sub">Du klarar de flesta uppgifter med en regel i taget. Två regler samtidigt går oftare fel.</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
          <div>
            <div className="s-mini-tal">Grund</div>
            <div className="s-sub" style={{ margin: 0 }}>
              nivå klar
            </div>
          </div>
          <div>
            <div className="s-mini-tal">18:40</div>
            <div className="s-sub" style={{ margin: 0 }}>
              total tid
            </div>
          </div>
          <div>
            <div className="s-mini-tal">75 s</div>
            <div className="s-sub" style={{ margin: 0 }}>
              per fråga
            </div>
          </div>
        </div>
      </SkarmVagg>
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">Var du tappar</div>
          <SkarmMatare etikett={<b>Vandring runt en ram</b>} varde={<span className="s-dim">1 av 3</span>} andel={1 / 3} forsta />
          <SkarmMatare etikett={<b>Antal som ändras</b>} varde={<span className="s-dim">2 av 3</span>} andel={2 / 3} />
        </div>
        <div className="s-kort">
          <div className="s-kick2">Fråga 7, ditt svar mot facit</div>
          <p className="s-dim">
            Raden roterar figuren ett steg medurs. Du valde speglingen. Rätt: kvadrat med pricken nere till höger.
          </p>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Starta dagens pass" />
    </Telefon>
  )
}
