/**
 * Matrislogik på expertnivå, expertfrågan (v7e-plus-p2-17), med
 * sessionsramens ord: "uppgift", knappen Svara och klockan utan inledande
 * nolla (textbeslut TEL-6). Antalet uppgifter i passet läses ur testConfig,
 * så skärmen följer banken.
 */

import { getTestConfig } from '@/app/dashboard/tester/testConfig'
import { MatrisExpertSkarm } from '../../MatrisExpert'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

const EXPERT = getTestConfig('matrislogik-expert')

export default function SkarmMatris({ glid, className }: { glid?: boolean; className?: string }) {
  const totalt = EXPERT?.totalQuestions ?? 15
  return (
    <Telefon rum="tran" glid={glid} className={className}>
      <SkarmVagg kick="Matrislogik" hoger="4:12">
        <div className="s-sub">Expertnivå</div>
        <div className="s-rub">{`uppgift ${Math.min(9, totalt)} av ${totalt}`}</div>
        <div className="s-sub">Vilken figur passar i den tomma rutan?</div>
      </SkarmVagg>
      <SkarmGolv>
        <MatrisExpertSkarm />
      </SkarmGolv>
      <SkarmFot knapp="Svara" />
    </Telefon>
  )
}
