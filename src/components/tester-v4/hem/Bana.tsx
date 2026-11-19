/**
 * Banan på Hems vägg (utkast v4 avsnitt 2 och 8, skissens bana()): planens
 * start till provdagen. Gjorda dagar fyllda i koppar, i dag som ring med
 * prick, föreslagen nivåkoll som streckad ring med prick, föreslaget
 * övningsprov som streckad fyrkant, provdagen som fyrkant med kors. Utan
 * provdatum (artikelingången) har banan öppet slut: en streckad ring och
 * "tills det sitter".
 *
 * Förslag lovar inget: allt kan göras när som helst (ägarens beslut).
 *
 * Ritas i två viewBoxar (mobil 372, dator 840) och visas per brytpunkt, så
 * att axeltexten aldrig skalas (designsystemet avsnitt 6, instrumenten).
 * Server component, bara tokens: väggens färger följer rummet.
 */

import type { BanaDag, Dag } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'

export interface BanaProps {
  bana: BanaDag[]
  /** Planens provdatum; null ger öppet slut. */
  provdatum: Dag | null
  dagarKvar: number | null
}

interface Geo {
  W: number
  H: number
  y: number
  L: number
  R: number
}

const GEO: Record<'mobil' | 'dator', Geo> = {
  mobil: { W: 372, H: 64, y: 30, L: 14, R: 26 },
  dator: { W: 840, H: 64, y: 30, L: 14, R: 30 },
}

/** Etiketter som står närmare än så här (i viewBox-enheter) krockar. */
const KROCK = 92

function BanaSvg({ bana, provdatum, bredd }: BanaProps & { bredd: 'mobil' | 'dator' }) {
  const { W, H, y, L, R } = GEO[bredd]
  const sista = bana.length - 1
  const X = (i: number) => (sista <= 0 ? L : L + (i / sista) * (W - L - R))
  const steg = sista > 0 ? (W - L - R) / sista : W
  // Punkterna krymper när banan är lång, så att de aldrig flyter ihop.
  const r = Math.max(1.6, Math.min(4, steg / 2.6))
  const rGjord = Math.max(2, Math.min(5.5, steg / 2.2))

  const idagIdx = Math.max(0, bana.findIndex((d) => d.status === 'idag'))
  const gjorda = bana.filter((d) => d.status === 'gjord').length
  const slutProv = bana[sista]?.status === 'prov'
  const nivakollIdx = bana.findIndex((d, i) => i > idagIdx && d.forslag === 'nivakoll')
  const ovnIdx = bana.findIndex((d, i) => i > idagIdx && d.forslag === 'ovningsprov')

  const ink = 'var(--vagg-mjuk)'
  const spar = 'var(--vagg-svag)'
  const kop = 'var(--koppar)'
  const bg = 'var(--vagg)'

  const punkter = bana.map((d, i) => {
    const x = X(i)
    if (i === sista && slutProv) {
      return (
        <g key={d.dag}>
          <rect x={x - 7} y={y - 9} width={14} height={18} rx={3} fill={bg} stroke={ink} strokeWidth={1.8} />
          <path d={`M${x - 3} ${y}h6M${x} ${y - 3}v6`} stroke={ink} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      )
    }
    if (i === sista && !slutProv && d.status !== 'idag') {
      return <circle key={d.dag} cx={x} cy={y} r={6} fill="none" stroke={ink} strokeWidth={1.6} strokeDasharray="2 3" />
    }
    if (d.status === 'idag') {
      return (
        <g key={d.dag}>
          <circle cx={x} cy={y} r={8} fill={bg} stroke={kop} strokeWidth={3} />
          <circle cx={x} cy={y} r={3} fill={kop} />
        </g>
      )
    }
    if (d.status === 'gjord') return <circle key={d.dag} cx={x} cy={y} r={rGjord} fill={kop} />
    if (d.forslag === 'ovningsprov') {
      return <rect key={d.dag} x={x - 7} y={y - 7} width={14} height={14} rx={3} fill={bg} stroke={ink} strokeWidth={1.8} strokeDasharray="3 2.5" />
    }
    if (d.forslag === 'nivakoll') {
      return (
        <g key={d.dag}>
          <circle cx={x} cy={y} r={7} fill={bg} stroke={ink} strokeWidth={1.8} strokeDasharray="3 2.5" />
          <circle cx={x} cy={y} r={2} fill={ink} />
        </g>
      )
    }
    return <circle key={d.dag} cx={x} cy={y} r={r} fill={bg} stroke={ink} strokeWidth={1.4} opacity={0.8} />
  })

  const visaNivakollEtikett = nivakollIdx > 0 && Math.abs(X(nivakollIdx) - X(idagIdx)) > KROCK && X(sista) - X(nivakollIdx) > KROCK / 2
  const visaOvnEtikett =
    !visaNivakollEtikett && ovnIdx > 0 && Math.abs(X(ovnIdx) - X(idagIdx)) > KROCK && X(sista) - X(ovnIdx) > KROCK / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
      <line x1={X(0)} y1={y} x2={X(sista)} y2={y} stroke={spar} strokeWidth={2} />
      {idagIdx > 0 ? <line x1={X(0)} y1={y} x2={X(idagIdx)} y2={y} stroke={kop} strokeWidth={3} strokeLinecap="round" /> : null}
      {punkter}
      <text x={X(idagIdx)} y={12} textAnchor={idagIdx === 0 ? 'start' : 'middle'} className="text-ax" style={{ fill: 'var(--vagg-ink)', fontWeight: 700 }}>
        {HEM_V4.bana.idag}
      </text>
      {visaNivakollEtikett ? (
        <text x={X(nivakollIdx)} y={12} textAnchor="middle" className="text-ax" style={{ fill: ink }}>
          {HEM_V4.bana.nivakollForslag}
        </text>
      ) : null}
      {visaOvnEtikett ? (
        <text x={X(ovnIdx)} y={12} textAnchor="middle" className="text-ax" style={{ fill: ink }}>
          {HEM_V4.bana.ovningsprovForslag}
        </text>
      ) : null}
      <text x={X(sista)} y={56} textAnchor="end" className="text-ax" style={{ fill: ink }}>
        {slutProv && provdatum ? HEM_V4.bana.provet(provdatum) : HEM_V4.bana.oppetSlut}
      </text>
      {gjorda > 0 && X(sista) - X(0) > KROCK * 1.6 ? (
        <text x={X(0)} y={56} textAnchor="start" className="text-ax" style={{ fill: ink }}>
          {HEM_V4.bana.gjorda(gjorda)}
        </text>
      ) : null}
    </svg>
  )
}

export default function Bana(p: BanaProps) {
  if (p.bana.length < 2) return null
  const gjorda = p.bana.filter((d) => d.status === 'gjord').length
  return (
    <div role="img" aria-label={HEM_V4.bana.aria(gjorda, p.provdatum ? p.dagarKvar : null)} data-bana className="mt-[22px]">
      <div className="lg:hidden">
        <BanaSvg {...p} bredd="mobil" />
      </div>
      <div className="hidden max-w-[840px] lg:block">
        <BanaSvg {...p} bredd="dator" />
      </div>
    </div>
  )
}
