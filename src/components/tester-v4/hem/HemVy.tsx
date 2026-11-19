/**
 * Hem i Rekryteringstester (skissen Hem A, godkänd 2026-11-19; utkast v4
 * avsnitt 2): var du står och vad som är rimligt härnäst, räknat ur dina
 * resultat.
 *
 *   Väggen        PlanHuvud: provet, den stora nedräkningen och banan, eller
 *                 datumet och "Hem" utan plan
 *   Lyft kort     Nästa steg: första hinten med typens nivåband, vyns enda
 *                 kopparknapp
 *   Navigeringen  tre kort, Hem, Tester och Din utveckling (sticky på dator)
 *   Ingångarna    Tester (minikatalogen) och Din utveckling (minigrafen, Så
 *                 ligger du till, senaste övningsprovet)
 *   Gratisraden   när dagens grundnivåtest är gjort
 *   Nedersta      Fler steg, Dagar i rad (eller plankortet utan plan) och
 *                 Fortsätt där du slutade
 *
 * Hintarna kommer färdiga i prioritetsordning ur datan (hintar.ts). Ordet
 * "pass" används inte. Server component; öarna (NastaSteg, FlerSteg,
 * GratisRad, PlanKort, HintVisad och mätningen i HemMatning) är klient.
 */

import Golv from '@/components/rum/Golv'
import type { TesterV4Data } from '@/lib/tester/v4/typer'
import PlanHuvud from './PlanHuvud'
import NastaSteg from './NastaSteg'
import FlerSteg from './FlerSteg'
import Dagsmal from './Dagsmal'
import GratisRad from './GratisRad'
import FortsattDarDuSlutade from './FortsattDarDuSlutade'
import PlanKort from './PlanKort'
import Navigering from './Navigering'
import TesterIngang from './TesterIngang'
import UtvecklingIngang from './UtvecklingIngang'
import { navTexter, nivaKalla } from './hemData'
import { HintVisad, type HintKontext } from './HintSparning'
import { HemVisad, IngangarMedMatning } from './HemMatning'

export default function HemVy({ data }: { data: TesterV4Data }) {
  const { plan, hintar } = data
  const kontext: HintKontext = { planTest: plan?.mittTest ?? null, planTyper: plan?.typer ?? [] }
  const forsta = hintar[0] ?? null
  const fler = hintar.slice(1, 4)
  const hintTyp = forsta?.testtyp ? (data.typer.find((t) => t.id === forsta.testtyp) ?? null) : null
  // Nedersta raden: tre spalter på bred skärm, färre när en del saknas.
  const antalNederst = (fler.length ? 1 : 0) + 1 + (data.fortsatt ? 1 : 0)
  const nederstKolumner = antalNederst === 3 ? 'xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]' : antalNederst === 2 ? 'lg:grid-cols-2' : ''
  return (
    <div className="flex flex-1 flex-col" data-hem-v4 data-lage={plan ? (plan.franArtikel && !plan.provdatum ? 'artikel' : 'plan') : 'fritt'}>
      <HintVisad hintar={hintar.slice(0, 4)} idag={data.idag} kontext={kontext} />
      <HemVisad plan={!!plan} premium={data.gratis.premium} matta={data.typer.filter((t) => t.synlig && t.niva.status === 'matt').length} />
      <PlanHuvud plan={plan} idag={data.idag} typer={data.typer} bana={data.bana} />
      <Golv lyft className="pb-10">
        <NastaSteg hint={forsta} kontext={kontext} typ={hintTyp} planNamn={plan?.namn ?? null} nivaKalla={hintTyp ? nivaKalla(data.kurva, hintTyp.id) : null} />
        <Navigering aktiv="hem" texter={navTexter(data)} />
        <IngangarMedMatning className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
          <TesterIngang data={data} />
          <UtvecklingIngang data={data} />
        </IngangarMedMatning>
        <GratisRad gratis={data.gratis} planTest={plan?.mittTest ?? null} />
        <div className={`grid grid-cols-1 items-stretch gap-4 ${nederstKolumner}`}>
          {fler.length ? <FlerSteg hintar={fler} kontext={kontext} plan={plan} menyer={data.menyer} idag={data.idag} /> : null}
          {plan ? <Dagsmal lage={data.dagsmal} idag={data.idag} aktivaDagar={data.aktivaDagar} /> : <PlanKort />}
          <FortsattDarDuSlutade fortsatt={data.fortsatt} idag={data.idag} />
        </div>
      </Golv>
    </div>
  )
}
