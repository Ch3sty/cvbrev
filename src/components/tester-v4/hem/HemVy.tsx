/**
 * Hem i Rekryteringstester, omgång 3 (skissens Hem, Hem-ny, Mobil-hem och
 * Mobil-hem-ny): väggen med Dagens träning och banan mot provdagen, samma
 * vägg som Tester och Din utveckling, och golvet med Så ligger du till,
 * Vägen till provet och det som är påbörjat.
 *
 *   Väggen   omgang3/Vaggen: flikarna, planraden, dagens träning, banan
 *   Golvet   omgang3/HemGolv: tre mått, vägen, gratisraden, nederst
 *
 * Allt kommer ur den serverrenderade datan (hamtaTesterV4); dagens träning
 * och vägen räknas där (lib/tester/v4/vagen.ts). Mätningen är oförändrad:
 * hem_visad en gång per besök, hint_visad för hintarna som syns (dagens
 * knapp och vägens kort), hint_klickad och tester_nav_klickad.
 * Server component; öarna är klient.
 */

import type { Hint, TesterV4Data } from '@/lib/tester/v4/typer'
import Vaggen from '@/components/tester-v4/omgang3/Vaggen'
import HemGolv from '@/components/tester-v4/omgang3/HemGolv'
import { HintVisad, type HintKontext } from './HintSparning'
import { HemVisad } from './HemMatning'

/** Hintarna som syns på Hem: dagens knapp och vägens kort, i ordning, en gång var. */
export function synligaHintar(data: Pick<TesterV4Data, 'dagens' | 'vagen'>): Pick<Hint, 'id' | 'typ' | 'testtyp'>[] {
  const ut: Pick<Hint, 'id' | 'typ' | 'testtyp'>[] = []
  const sedda = new Set<string>()
  for (const h of [data.dagens.hint, ...data.vagen.map((v) => v.hint)]) {
    if (h && !sedda.has(h.id)) {
      sedda.add(h.id)
      ut.push(h)
    }
  }
  return ut
}

export default function HemVy({ data }: { data: TesterV4Data }) {
  const { plan } = data
  const kontext: HintKontext = { planTest: plan?.mittTest ?? null, planTyper: plan?.typer ?? [] }
  return (
    <div className="flex flex-1 flex-col" data-hem-v4 data-lage={plan ? (plan.franArtikel && !plan.provdatum ? 'artikel' : 'plan') : 'fritt'}>
      <HintVisad hintar={synligaHintar(data)} idag={data.idag} kontext={kontext} />
      <HemVisad plan={!!plan} premium={data.gratis.premium} matta={data.typer.filter((t) => t.synlig && t.niva.status === 'matt').length} />
      <Vaggen data={data} sida="hem" />
      <HemGolv data={data} />
    </div>
  )
}
