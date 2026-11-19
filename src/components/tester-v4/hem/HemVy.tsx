/**
 * Hem i Rekryteringstester v4 (docs/plan-tester-v4-bygg.md 3.3, utkast v4
 * avsnitt 2, skissens webb-Hem): var du står och vad som är rimligt
 * härnäst, räknat ur dina resultat.
 *
 *   Väggen       PlanHuvud: provet, nedräkningen och banan, eller datumet
 *                och "Hem" utan plan
 *   Lyft kort    Nästa steg: första hinten, vyns enda kopparknapp
 *   Flikar       Hem, Tester, Din utveckling
 *   Golvet       två spalter på dator: Fler steg, Dagsmål och plankortet;
 *                Så ligger du till, Fortsätt där du slutade och gratisraden
 *
 * Hintarna kommer färdiga i prioritetsordning ur datan (hintar.ts, A). Saknas
 * data är första hinten ett tydligt första steg. Ordet "pass" används inte.
 *
 * Server component; öarna (NastaSteg, FlerSteg, GratisRad, PlanKort,
 * HintVisad) är klient.
 */

import Golv from '@/components/rum/Golv'
import type { TesterV4Data } from '@/lib/tester/v4/typer'
import PlanHuvud from './PlanHuvud'
import NastaSteg from './NastaSteg'
import FlerSteg from './FlerSteg'
import Dagsmal from './Dagsmal'
import GratisRad from './GratisRad'
import SaLiggerDuTill from './SaLiggerDuTill'
import FortsattDarDuSlutade from './FortsattDarDuSlutade'
import PlanKort from './PlanKort'
import Flikar from './Flikar'
import { HintVisad, type HintKontext } from './HintSparning'

export default function HemVy({ data }: { data: TesterV4Data }) {
  const { plan, hintar } = data
  const kontext: HintKontext = { planTest: plan?.mittTest ?? null, planTyper: plan?.typer ?? [] }
  const forsta = hintar[0] ?? null
  const fler = hintar.slice(1, 4)
  // Står inget i vänsterspalten (artikelingången utan data) flyttar högerspalten dit.
  const dagsmalSyns = !!plan && (data.dagsmal.mal != null || data.dagsmal.dagarIRad > 0)
  const vansterTom = fler.length === 0 && !dagsmalSyns && !!plan
  return (
    <div className="flex flex-1 flex-col" data-hem-v4 data-lage={plan ? (plan.franArtikel && !plan.provdatum ? 'artikel' : 'plan') : 'fritt'}>
      <HintVisad hintar={hintar.slice(0, 4)} idag={data.idag} kontext={kontext} />
      <PlanHuvud plan={plan} idag={data.idag} typer={data.typer} bana={data.bana} />
      <Golv lyft className="pb-10">
        <NastaSteg hint={forsta} kontext={kontext} />
        <Flikar aktiv="hem" />
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {vansterTom ? null : (
            <div className="flex min-w-0 flex-col gap-4">
              <FlerSteg hintar={fler} kontext={kontext} />
              {plan ? <Dagsmal lage={data.dagsmal} /> : null}
              {plan ? null : <PlanKort />}
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-4">
            <SaLiggerDuTill typer={data.typer} plan={plan} />
            <FortsattDarDuSlutade fortsatt={data.fortsatt} idag={data.idag} />
            <GratisRad gratis={data.gratis} planTest={plan?.mittTest ?? null} />
          </div>
        </div>
      </Golv>
    </div>
  )
}
