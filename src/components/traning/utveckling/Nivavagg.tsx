/**
 * Nivåkurvan på väggen i Din utveckling (skiss Provbladet, avsnitt 2):
 * den befintliga Kurva i full höjd (sikteband, provlinje, planrad) med
 * märket "Nivån upp" på punkten där det nåddes, ett display-tal (nivån i
 * dag) till vänster om kurvan och en riktig legend under. Mätningen och
 * siktet läses i kurvan där de redan står; alla tre står i kurvans
 * aria-label (art-director 2026-10-11, avvikelse 10). Bara matris har nivå.
 *
 * Märket ritas som HTML över kurvan, placerat med kurvans egen geometri
 * (kurvansGeometri), så att Kurva.tsx lämnas orörd.
 */

import Kurva, { kurvansGeometri } from '@/components/traning/Kurva'
import MarkeNiva from './MarkeNivaLiten'
import { kurvansLabel } from '@/lib/traning/hemvy'
import { KURVAN } from '@/lib/traning/kurvan-copy'
import type { Dag } from '@/lib/traning/datum'
import { markePunkt } from './berakna'
import { UTV, decimal } from './copy'
import type { UtvecklingKurva } from './typer'

/** Decimalkommat med egen bredd i tabulära tal (.tal-komma i globals.css). */
function TalKomma({ varde }: { varde: string }) {
  const [hel, dec] = varde.split(',')
  if (dec == null) return <>{varde}</>
  return (
    <>
      {hel}
      <span className="tal-komma">,</span>
      {dec}
    </>
  )
}

function VaggTal({ varde, etikett, koppar }: { varde: string; etikett: string; koppar?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`font-display text-[28px] font-extrabold leading-[30px] tracking-[-0.025em] tabular-nums lg:text-[34px] lg:leading-9 ${koppar ? 'text-koppar-ljus' : 'text-vagg-ink'}`}>
        <TalKomma varde={varde} />
      </p>
      <p className="mt-0.5 text-meta text-vagg-mjuk">{etikett}</p>
    </div>
  )
}

function Markeoverlagg({ k, idag, bredd }: { k: UtvecklingKurva; idag: Dag; bredd: 'mobil' | 'dator' }) {
  const p = markePunkt(k.punkter, k.nivanUpp)
  if (!p) return null
  const g = kurvansGeometri({ punkter: k.punkter, plan: k.plan, idag, start: k.start.dag, prov: k.prov, sikte: k.sikte, bredd, hojd: 'full' })
  const { W, H } = g.matt
  const xp = (g.x(p.dag) / W) * 100
  const yp = (g.y(p.niva) / H) * 100
  const hoger = xp > 62
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-2" style={{ aspectRatio: `${W} / ${H}` }} data-marke="nivan_upp">
      <span
        className="absolute flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium leading-[14px] text-vagg-mjuk"
        style={{
          left: `${xp}%`,
          top: `calc(${yp}% - 30px)`,
          transform: hoger ? 'translate(calc(-100% + 10px), -100%)' : 'translate(-10px, -100%)',
          flexDirection: hoger ? 'row-reverse' : 'row',
        }}
      >
        <MarkeNiva size={20} />
        {UTV.nivanUpp}
      </span>
    </div>
  )
}

function KurvaBredd({ k, idag, bredd, label }: { k: UtvecklingKurva; idag: Dag; bredd: 'mobil' | 'dator'; label: string }) {
  return (
    <div className="relative">
      <Kurva
        punkter={k.punkter}
        plan={k.plan}
        idag={idag}
        start={k.start.dag}
        prov={k.prov}
        sikte={k.sikte}
        bredd={bredd}
        hojd="full"
        ariaLabel={label}
        idPrefix="utv"
      />
      <Markeoverlagg k={k} idag={idag} bredd={bredd} />
    </div>
  )
}

function LegendVagg({ marke, general }: { marke: boolean; general: boolean }) {
  const L = UTV.legend
  const post = (ruta: React.ReactNode, text: string, extra?: string) => (
    <span className={`inline-flex items-center gap-1.5 ${extra ?? ''}`}>
      <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" className="shrink-0">
        {ruta}
      </svg>
      {text}
    </span>
  )
  return (
    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs leading-4 text-vagg-mjuk">
      {post(<circle cx="7" cy="7" r="3.5" fill="var(--koppar)" />, L.pass)}
      {post(<circle cx="7" cy="7" r="4.5" fill="var(--koppar)" stroke="var(--koppar-ljus)" strokeWidth="2" />, L.matning)}
      {general ? post(<rect x="3" y="3" width="8" height="8" rx="1.5" fill="none" stroke="var(--vagg-mjuk)" strokeWidth="1.5" />, L.general, 'hidden lg:inline-flex') : null}
      {post(<line x1="1" x2="13" y1="7" y2="7" stroke="var(--ljus)" strokeWidth="1.5" strokeDasharray="3 2" />, L.sikte)}
      {marke ? (
        <span className="inline-flex items-center gap-1.5">
          <MarkeNiva size={14} />
          {L.marke}
        </span>
      ) : null}
    </div>
  )
}

export default function Nivavagg({ k, idag }: { k: UtvecklingKurva; idag: Dag }) {
  const senast = [...k.punkter].sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0)).pop()
  const tal = [
    senast ? `${UTV.stat.idag} ${decimal(senast.niva)}` : null,
    `${UTV.stat.matning} ${decimal(k.start.niva)}`,
    k.sikte != null && k.prov ? `${UTV.stat.sikte} ${decimal(k.sikte)}` : null,
  ].filter(Boolean)
  const label = `${kurvansLabel(
    { punkter: k.punkter, plan: k.plan, idag, start: k.start.dag, prov: k.prov, sikte: k.sikte, nyPunkt: false },
    k.passKvar
  )} ${tal.join(', ').replace(/^./, (c) => c.toUpperCase())}.`
  const marke = !!markePunkt(k.punkter, k.nivanUpp)
  const general = k.plan.some((d) => d.typ === 'general')
  return (
    <div data-utv="kurva">
      <div className="lg:mt-5 lg:flex lg:items-start lg:gap-8">
        {senast ? (
          <div className="mt-5 shrink-0 lg:mt-0 lg:w-[120px]">
            <VaggTal varde={decimal(senast.niva)} etikett={UTV.stat.idag} koppar />
          </div>
        ) : null}
        <div className="mt-4 lg:hidden">
          <KurvaBredd k={k} idag={idag} bredd="mobil" label={label} />
        </div>
        <div className="hidden min-w-0 max-w-[840px] flex-1 lg:block">
          <KurvaBredd k={k} idag={idag} bredd="dator" label={label} />
        </div>
      </div>
      <LegendVagg marke={marke} general={general} />
      {k.historikLast ? <p className="mt-2 text-meta text-vagg-mjuk">{KURVAN.historikLast}</p> : null}
    </div>
  )
}
