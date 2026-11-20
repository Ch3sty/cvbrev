'use client'

/**
 * Kurvan i Din utveckling, omgång 3 (skissens Utveckling, Utveckling-fa,
 * Utveckling-ny och Mobil-utveckling). Ren SVG i fasta mått, serverritad
 * första bild (CLS 0). Geometrin räknas i kurva3.ts.
 *
 * Varje punkt är en knapp (tabIndex 0) med en osynlig träffyta på 44 px;
 * ett tryck väljer punkten, visar etiketten i grafen och detaljen med
 * Öppna under grafen. Hover bär aldrig data ensam.
 */

import { nivakollOmfang } from '@/lib/nivakoll/omfang'
import type { NivaLage, TestTypId, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { veckodagNamn } from '@/lib/traning/datum'
import { kortDatumV } from '@/lib/tester/v4/vagen'
import { bandD, linjeD, type Kurva3 } from './kurva3'
import { PROVETS_NIVA, tal1 } from './matt'

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']

function slagOrd(p: UtvecklingsPunkt): string {
  if (p.slag === 'ovningsprov') return 'Övningsprov'
  if (p.kalla === 'nivatest') return 'Nivåtest'
  return p.slag === 'nivakoll' ? 'Nivåkoll' : 'Träning'
}

export function punktAria(p: UtvecklingsPunkt, namn: string): string {
  const v = p.slag === 'ovningsprov' ? (p.resultat ? `${p.resultat.ratt} av ${p.resultat.antal} rätt` : '') : p.niva != null ? `nivå ${tal1(p.niva)}` : ''
  return [namn, slagOrd(p).toLowerCase(), kortDatumV(p.dag), v].filter(Boolean).join(', ')
}

function Etikett({ x, y, rad1, rad2, mobil }: { x: number; y: number; rad1: string; rad2: string; mobil: boolean }) {
  const w = Math.max(rad1.length, rad2.length) * (mobil ? 6.8 : 7) + 28
  const h = mobil ? 40 : 48
  const left = Math.max(4, Math.min(x - w / 2, (mobil ? 340 : 1064) - w - 4))
  const top = y - h - 16
  return (
    <g aria-hidden="true" className="t3-graf-etikett">
      <rect x={left} y={top} width={w} height={h} rx="12" style={{ fill: 'var(--t3-mork)' }} />
      <path d={`M${x - 8} ${top + h}h16l-8 9z`} style={{ fill: 'var(--t3-mork)' }} />
      <text x={left + 14} y={top + (mobil ? 17 : 20)} fontSize={mobil ? 11 : 12} fontWeight="600" style={{ fill: 'var(--vagg-ink)' }}>
        {rad1}
      </text>
      <text x={left + 14} y={top + (mobil ? 32 : 38)} fontSize={mobil ? 11 : 12} fontWeight="700" style={{ fill: 'var(--koppar-ljus)' }}>
        {rad2}
      </text>
    </g>
  )
}

export default function KurvGraf3({
  k,
  typ,
  namn,
  niva,
  valdId,
  onValj,
  idPrefix,
  detaljId,
}: {
  k: Kurva3
  typ: TestTypId
  namn: string
  niva: NivaLage
  valdId: string | null
  onValj: (id: string) => void
  idPrefix: string
  detaljId: string
}) {
  const { matt, Y, X } = k
  const mobil = matt.W < 600
  const fs = mobil ? 11 : 13
  const omfang = nivakollOmfang(typ)
  const vald = [...k.linje, ...k.prov].find((q) => q.p.id === valdId) ?? null
  const sista = k.linje.at(-1) ?? null
  const forsta = k.linje[0] ?? null
  const kvar = sista ? Math.round((PROVETS_NIVA - (sista.p.niva as number)) * 10) / 10 : null
  const senasteProv = k.prov.at(-1) ?? null
  const monsterId = `${idPrefix}-sen`

  const aria =
    k.lage === 'ingen'
      ? `Nivån i ${namn} är inte mätt än. Kurvan börjar med Nivåkollen.`
      : `Nivån i ${namn}: ${k.linje.map((q) => `${slagOrd(q.p).toLowerCase()} ${kortDatumV(q.p.dag)} ${tal1(q.p.niva as number)}`).join(', ')}.${
          k.prov.length ? ` Övningsprov: ${k.prov.map((q) => `${kortDatumV(q.p.dag)} ${q.p.resultat ? `${q.p.resultat.ratt} av ${q.p.resultat.antal}` : ''}`).join(', ')}.` : ''
        } Provets nivå börjar på ${tal1(PROVETS_NIVA)}.`

  return (
    <svg viewBox={`0 0 ${matt.W} ${matt.H}`} className="t3-graf" role="group" aria-label={aria} data-graf={idPrefix}>
      <defs>
        <pattern id={monsterId} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V10" style={{ stroke: 'var(--t3-spar)' }} strokeWidth="3" />
        </pattern>
      </defs>

      {/* Zonerna och provets nivå */}
      <g aria-hidden="true">
        {k.lage === 'ingen' ? (
          <>
            <rect x={matt.L} y={Y(10)} width={matt.R - matt.L} height={Y(7) - Y(10)} style={{ fill: 'var(--sess-indigo-mjuk)' }} />
            <rect x={matt.L} y={Y(7)} width={matt.R - matt.L} height={Y(4) - Y(7)} style={{ fill: 'var(--sess-indigo-mjuk)' }} opacity=".55" />
            {[7, 4].map((v) => (
              <path key={v} d={`M${matt.L} ${Y(v)}H${matt.R}`} style={{ stroke: 'var(--t3-linje)' }} strokeWidth="1.5" />
            ))}
            {!mobil ? (
              <g fontSize="12" fontWeight="600" style={{ fill: 'var(--ink-2)' }}>
                <text x={matt.L + 12} y={Y(10) + 18}>Expert</text>
                <text x={matt.L + 12} y={Y(7) + 18}>Avancerad</text>
                <text x={matt.L + 12} y={Y(4) + 18}>Grund</text>
              </g>
            ) : (
              <g fontSize="11" fontWeight="600" style={{ fill: 'var(--ink-2)' }} textAnchor="end">
                <text x={matt.R - 8} y={Y(10) + 16}>Expert</text>
                <text x={matt.R - 8} y={Y(7) + 16}>Avancerad</text>
                <text x={matt.R - 8} y={Y(4) + 16}>Grund</text>
              </g>
            )}
          </>
        ) : (
          <>
            <rect
              x={matt.L}
              y={Y(Math.min(k.hi, 7))}
              width={matt.R - matt.L}
              height={Y(PROVETS_NIVA) - Y(Math.min(k.hi, 7))}
              style={{ fill: k.iPlan ? 'var(--t3-spar-prov)' : 'var(--sess-indigo-mjuk)' }}
              opacity={k.iPlan ? 0.6 : 0.8}
            />
            {k.ticks
              .filter((v) => v !== 1 && v !== PROVETS_NIVA)
              .map((v) => (
                <path key={v} d={`M${matt.L} ${Y(v)}H${matt.R}`} style={{ stroke: 'var(--t3-linje)' }} strokeWidth="1.5" />
              ))}
            <path d={`M${matt.L} ${Y(PROVETS_NIVA)}H${matt.R}`} style={{ stroke: k.iPlan ? 'var(--koppar)' : 'var(--sess-indigo)' }} strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
            {k.iPlan ? (
              <text x={matt.L + 12} y={Y(Math.min(k.hi, 7)) + 22} fontSize={mobil ? 11 : 12} fontWeight="700" style={{ fill: 'var(--sess-rad3-ink)' }}>
                {mobil ? 'Provets nivå' : 'Avancerad, provets nivå'}
              </text>
            ) : (
              <text x={matt.R - 10} y={Y(Math.min(k.hi, 7)) + 20} textAnchor="end" fontSize={mobil ? 11 : 12} fontWeight="700" style={{ fill: 'var(--sess-indigo)' }}>
                {`Avancerad, från ${tal1(PROVETS_NIVA)}`}
              </text>
            )}
            {!mobil ? (
              <text x={matt.L + 12} y={matt.B - 10} fontSize="12" fontWeight="600" style={{ fill: 'var(--ink-3)' }}>
                Grund
              </text>
            ) : null}
          </>
        )}
        {/* Framtiden från i dag, streckad */}
        <rect x={k.idagX} y={matt.T} width={Math.max(0, (k.provX ?? matt.R) - k.idagX)} height={matt.B - matt.T} fill={`url(#${monsterId})`} />
        <path d={`M${matt.L} ${matt.B}H${matt.R}`} style={{ stroke: 'var(--t3-streck)' }} strokeWidth="2.5" strokeLinecap="round" />
        <g fontSize={fs} fontWeight="500" style={{ fill: 'var(--ink-3)' }} textAnchor="end">
          {k.ticks.map((v) => (
            <text key={v} x={matt.L - (mobil ? 8 : 14)} y={Y(v) + 5} style={v === PROVETS_NIVA && k.iPlan ? { fill: 'var(--sess-rad3-ink)', fontWeight: 700 } : undefined}>
              {v}
            </text>
          ))}
        </g>
        <g fontSize={fs} fontWeight="500" style={{ fill: 'var(--ink-3)' }}>
          {k.datum.map((d) => (
            <text key={`${d.x}-${d.text}`} x={d.x} y={matt.yDatum} textAnchor={d.anchor} style={d.text === 'i dag' ? { fill: 'var(--ink-1)', fontWeight: 700 } : undefined}>
              {d.text}
            </text>
          ))}
        </g>
      </g>

      {/* Linjen, bandet och punkterna */}
      {k.lage === 'fylld' ? (
        <g aria-hidden="true">
          <path d={bandD(k, niva.osakerhet)} style={{ fill: 'var(--koppar)' }} opacity=".13" />
          <path className="t3-kurva" d={linjeD(k)} fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {k.lage === 'en' && sista ? (
        <g aria-hidden="true">
          <rect x={sista.x - 11} y={Y((sista.p.niva as number) + niva.osakerhet)} width="22" height={Y((sista.p.niva as number) - niva.osakerhet) - Y((sista.p.niva as number) + niva.osakerhet)} rx="11" style={{ fill: 'var(--koppar)' }} opacity=".18" />
          {k.nastaX != null ? (
            <>
              <path d={`M${sista.x + 10} ${sista.y}H${k.nastaX - 12}`} style={{ stroke: 'var(--koppar)' }} strokeWidth="2.5" strokeDasharray="2 6" strokeLinecap="round" />
              <circle cx={k.nastaX} cy={sista.y} r="10" style={{ fill: 'var(--papper)', stroke: 'var(--sess-indigo)' }} strokeWidth="2.5" strokeDasharray="4 3.5" />
              {!mobil ? (
                <g>
                  <rect x={k.nastaX + 18} y={sista.y - 13} width="176" height="26" rx="13" style={{ fill: 'var(--t3-mork)' }} />
                  <text x={k.nastaX + 106} y={sista.y + 5} textAnchor="middle" className="t3-disp" fontSize="13" fontWeight="800" style={{ fill: 'var(--vagg-ink)' }}>
                    punkt två ger en riktning
                  </text>
                </g>
              ) : null}
            </>
          ) : null}
        </g>
      ) : null}
      {k.lage === 'en' && !mobil && k.nastaDag ? (
        <g aria-hidden="true">
          <rect x={matt.R - 372} y={matt.T + 66} width="320" height="80" rx="16" style={{ fill: 'var(--papper)', stroke: 'var(--sess-kant)' }} strokeWidth="2" />
          <text x={matt.R - 352} y={matt.T + 94} className="t3-disp" fontSize="15" fontWeight="800" style={{ fill: 'var(--ink-1)' }}>
            En punkt är ett läge, inte en kurva
          </text>
          <text x={matt.R - 352} y={matt.T + 116} fontSize="12.5" style={{ fill: 'var(--ink-2)' }}>
            {`Träna några gånger eller gör Nivåkollen igen på ${veckodagNamn(k.nastaDag)}.`}
          </text>
          <text x={matt.R - 352} y={matt.T + 134} fontSize="12.5" style={{ fill: 'var(--ink-2)' }}>
            Då ser du vilket håll nivån rör sig.
          </text>
        </g>
      ) : null}
      {k.lage === 'ingen' ? (
        <g aria-hidden="true">
          {[7, 14, 21, 28].map((n, i) => {
            const x0 = k.idagX + (i === 0 ? 22 : 0)
            const x = X(addDag(k, n))
            return (
              <g key={n}>
                <path d={`M${i === 0 ? x0 : X(addDag(k, n - 7)) + 10} ${Y(5.5)}H${x - 10}`} style={{ stroke: 'var(--ljus)' }} strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" />
                <circle cx={x} cy={Y(5.5)} r="9" style={{ fill: 'var(--papper)', stroke: 'var(--ljus)' }} strokeWidth="3" />
              </g>
            )
          })}
          {!mobil ? (
            <text x={X(addDag(k, 7))} y={Y(5.5) + 28} textAnchor="middle" fontSize="12" fontWeight="600" style={{ fill: 'var(--ink-2)' }}>
              Nivåkoll igen efter en vecka
            </text>
          ) : null}
          <circle cx={k.idagX} cy={Y(5.5)} r="21" style={{ fill: 'var(--koppar)' }} opacity=".18" />
          <circle cx={k.idagX} cy={Y(5.5)} r="15" style={{ fill: 'var(--papper)', stroke: 'var(--koppar)' }} strokeWidth="2.5" strokeDasharray="4 3" />
          <text x={k.idagX} y={Y(5.5) + 6} textAnchor="middle" className="t3-disp" fontSize="17" fontWeight="800" style={{ fill: 'var(--koppar-ink)' }}>
            ?
          </text>
          <Etikett x={k.idagX + (mobil ? 40 : 90)} y={Y(5.5) - 4} rad1="Din första punkt" rad2={`Nivåkollen, cirka ${omfang ? ORD[omfang.minuter] ?? omfang.minuter : 'åtta'} minuter`} mobil={mobil} />
        </g>
      ) : null}

      {/* I dag */}
      <g aria-hidden="true">
        <path d={`M${k.idagX} ${matt.T}V${matt.B}`} style={{ stroke: 'var(--t3-streck)' }} strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
        {k.lage !== 'ingen' || !mobil ? (
          <>
            <rect x={k.idagX - 24} y={matt.T - 24} width="48" height="24" rx="12" style={{ fill: 'var(--t3-mork)' }} />
            <text x={k.idagX} y={matt.T - 8} textAnchor="middle" fontSize="12" fontWeight="700" style={{ fill: 'var(--vagg-ink)' }}>
              i dag
            </text>
          </>
        ) : null}
      </g>

      {/* Kvar till provets nivå */}
      {k.lage === 'fylld' && sista && kvar != null && kvar > 0 && k.iPlan && k.provX != null ? (
        <g aria-hidden="true" className="t3-visa">
          <path d={`M${k.idagX + (mobil ? 16 : 31)} ${sista.y - 6}V${Y(PROVETS_NIVA) + 6}`} style={{ stroke: 'var(--t3-streck)' }} strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M${k.idagX + (mobil ? 9 : 24)} ${Y(PROVETS_NIVA) + 14}l7-9 7 9`} fill="none" style={{ stroke: 'var(--t3-streck)' }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x={k.idagX + (mobil ? -42 : 43)} y={(sista.y + Y(PROVETS_NIVA)) / 2 - 14} width="78" height="28" rx="14" style={{ fill: 'var(--t3-mork)' }} />
          <text x={k.idagX + (mobil ? -3 : 82)} y={(sista.y + Y(PROVETS_NIVA)) / 2 + 5} textAnchor="middle" className="t3-disp" fontSize="14" fontWeight="800" style={{ fill: 'var(--vagg-ink)' }}>
            {`${tal1(kvar)} kvar`}
          </text>
        </g>
      ) : null}

      {/* Provdagen och förslaget */}
      {k.provX != null ? (
        <g aria-hidden="true">
          <path d={`M${k.provX} ${matt.B}V${matt.T - 16}`} style={{ stroke: 'var(--t3-streck)' }} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${k.provX + 1.5} ${matt.T - 14}h${mobil ? 20 : 30}l-${mobil ? 6 : 8} ${mobil ? 8 : 10} ${mobil ? 6 : 8} ${mobil ? 8 : 10}h-${mobil ? 20 : 30}z`} style={{ fill: 'var(--koppar)' }} />
          <text x={k.provX} y={matt.yDatum + (mobil ? 0 : 16)} textAnchor="end" fontSize={fs} fontWeight="700" style={{ fill: 'var(--ink-1)' }}>
            {mobil ? 'provet' : `provet ${kortDatumV(k.till)}`}
          </text>
        </g>
      ) : null}
      {k.forslagX != null && !mobil ? (
        <g aria-hidden="true">
          <circle cx={k.forslagX} cy={matt.B} r="10" style={{ fill: 'var(--papper)', stroke: 'var(--sess-indigo)' }} strokeWidth="2.5" strokeDasharray="4 3.5" />
          <text x={k.forslagX} y={matt.yDatum} textAnchor="middle" fontSize="13" fontWeight="500" style={{ fill: 'var(--ink-3)' }}>
            övningsprov, förslag
          </text>
        </g>
      ) : null}
      {k.lage === 'en' && k.nastaX != null && !mobil && k.nastaDag ? (
        <g aria-hidden="true" textAnchor="middle">
          <text x={k.nastaX} y={matt.yDatum + 16} fontSize="13" fontWeight="600" style={{ fill: 'var(--sess-indigo)' }}>
            Nivåkoll igen, förslag
          </text>
        </g>
      ) : null}

      {/* Ändetiketterna */}
      {k.lage !== 'ingen' && sista ? (
        <g aria-hidden="true" className="t3-disp" fontWeight="800" style={{ fill: 'var(--ink-1)' }} textAnchor="middle">
          <text x={sista.x} y={sista.y - 19} fontSize={mobil ? 14 : 17}>
            {tal1(sista.p.niva as number)}
          </text>
          {forsta && forsta !== sista && !mobil ? (
            <text x={forsta.x} y={forsta.y + 40} fontSize="15">
              {tal1(forsta.p.niva as number)}
            </text>
          ) : null}
        </g>
      ) : null}
      {senasteProv && !mobil && senasteProv.p.resultat && k.lage !== 'ingen' ? (
        <text x={senasteProv.x} y={matt.B - 22} textAnchor="middle" fontSize="12" fontWeight="600" style={{ fill: 'var(--ink-1)' }} aria-hidden="true">
          {`övningsprov, ${senasteProv.p.resultat.ratt} av ${senasteProv.p.resultat.antal}`}
        </text>
      ) : null}

      {/* Punkterna: knappar */}
      <g role="list" aria-label={`Punkterna i ${namn}`}>
        {k.linje.map((q, i) => {
          const ar = q.p.id === valdId
          const senaste = i === k.linje.length - 1
          const ring = q.p.slag === 'nivakoll' && q.p.kalla !== 'nivatest'
          return (
            <g key={q.p.id} role="listitem">
              <g
                role="button"
                tabIndex={0}
                aria-label={punktAria(q.p, namn)}
                aria-pressed={ar}
                aria-controls={detaljId}
                className="t3-punkt"
                data-punkt={q.p.id}
                onClick={() => onValj(q.p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onValj(q.p.id)
                  }
                }}
              >
                <circle cx={q.x} cy={q.y} r="22" fill="transparent" />
                {senaste ? (
                  <circle cx={q.x} cy={q.y} r={mobil ? 7 : 9} style={{ fill: 'var(--koppar)', stroke: 'var(--papper)' }} strokeWidth="3.5" />
                ) : ring ? (
                  <circle cx={q.x} cy={q.y} r={mobil ? 7 : 9} style={{ fill: 'var(--papper)', stroke: 'var(--koppar)' }} strokeWidth={mobil ? 3 : 4} />
                ) : (
                  <circle cx={q.x} cy={q.y} r={mobil ? 4.5 : 6} style={{ fill: 'var(--koppar)' }} />
                )}
                {ar ? <circle cx={q.x} cy={q.y} r={mobil ? 12 : 14} fill="none" style={{ stroke: 'var(--t3-streck)' }} strokeWidth="2" /> : null}
              </g>
            </g>
          )
        })}
        {k.prov.map((q) => (
          <g key={q.p.id} role="listitem">
            <g
              role="button"
              tabIndex={0}
              aria-label={punktAria(q.p, namn)}
              aria-pressed={q.p.id === valdId}
              aria-controls={detaljId}
              className="t3-punkt"
              data-punkt={q.p.id}
              onClick={() => onValj(q.p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onValj(q.p.id)
                }
              }}
            >
              <circle cx={q.x} cy={q.y - 7} r="22" fill="transparent" />
              <rect x={q.x - 7} y={q.y - 14} width="14" height="14" rx="3" style={{ fill: 'var(--t3-streck)' }} />
            </g>
          </g>
        ))}
      </g>

      {vald && vald.p.slag !== 'ovningsprov' && vald.p.niva != null && !(k.lage === 'en' && mobil) ? (
        <Etikett x={vald.x} y={vald.y} rad1={`${slagOrd(vald.p)} ${kortDatumV(vald.p.dag)}`} rad2={`${tal1(vald.p.niva)} · Se uppgifterna`} mobil={mobil} />
      ) : null}
    </svg>
  )
}

function addDag(k: Pick<Kurva3, 'fran'>, n: number) {
  const [y, m, d] = k.fran.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10) as typeof k.fran
}
