/**
 * Panelen till höger i kortet Vad kurvan säger (skissen 2026-11-19): nivån
 * i huvudtypen som nivåband på skalan 1 till 10, med zonerna Grund,
 * Avancerad och Expert. Med plan "Mot provets nivå" och en rad om provets
 * nivåband; utan plan nivån i den typ du mätt mest. Nivån står i bandet,
 * aldrig som löptext. Bara tokens, så mörkt läge följer med.
 *
 * Server component.
 */

import Nivaband from '@/components/tester-v4/Nivaband'
import TypSymbol from '@/components/tester-v4/tester/TypSymbol'
import { SidKortPanel } from '@/components/tester-v4/SidKort'
import { typNamn } from '@/lib/tester/v4/copy'
import type { KurvPanel as KurvPanelData } from '@/lib/tester/v4/sidkort'

const OMATT = { status: 'omatt' as const, niva: null, osakerhet: 0.6, tak: 7.5 }

export default function KurvPanel({ panel }: { panel: KurvPanelData }) {
  const namn = panel.typ ? typNamn(panel.typ) : ''
  return (
    <SidKortPanel namn="kurvan">
      <p className="text-ey text-ink-3">{panel.rubrik}</p>
      {panel.typ ? (
        <div className="flex items-center gap-3">
          <TypSymbol typ={panel.typ} size={32} />
          <b className="text-[15px] font-semibold leading-5 text-ink-1">{namn}</b>
        </div>
      ) : null}
      <Nivaband namn={namn || panel.rubrik} lage={panel.niva ?? OMATT} storlek="mellan" ton={panel.plan ? 'koppar' : 'neutral'} />
      <p className="text-[12.5px] leading-[17px] text-ink-3">{panel.text}</p>
    </SidKortPanel>
  )
}
