/**
 * Matrislogik på expertnivå, expertfrågan (v7e-plus-p2-17). Antalet frågor
 * i passet läses ur testConfig, så skärmen följer banken.
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
      <SkarmVagg
        kick="Matrislogik, expertnivå"
        hoger="04:12"
        rubrik={`Fråga ${Math.min(9, totalt)} av ${totalt}`}
        sub="Vilken figur hör hemma i den tomma rutan?"
      />
      <SkarmGolv>
        <MatrisExpertSkarm />
      </SkarmGolv>
      <SkarmFot knapp="Svara och gå vidare" />
    </Telefon>
  )
}
