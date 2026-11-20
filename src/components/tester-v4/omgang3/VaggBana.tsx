/**
 * Väggens bana (omgång 3, skissens Hem och Mobil-hem): en kurva genom åtta
 * platser på dator och en rak rad på telefonen. Noderna kommer färdiga ur
 * datan (vagen.ts, byggVaggBana): gjorda dagar i koppar med bock, i dag som
 * den stora kopparpunkten med spela, kommande dagar som ringar, banans
 * förslag (nivåkoll, övningsprov) som större ringar med ikon och etikett, och
 * flaggan sist: provdagen, eller en streckad flagga när provdagen inte är
 * känd. Ren SVG i fasta mått, serverritad (CLS 0). Färgerna är väggens
 * tokens; väggen är mörk i båda lägena.
 */

import type { Dag, VaggNod } from '@/lib/tester/v4/typer'
import { kortDatumV, kortVeckodag } from '@/lib/tester/v4/vagen'
import { veckodagNamn } from '@/lib/traning/datum'

const DATOR: readonly [number, number][] = [
  [44, 236],
  [122, 228],
  [204, 206],
  [286, 182],
  [362, 164],
  [438, 138],
  [510, 112],
  [566, 84],
]
/** Kurvans segment mellan plats i och i + 1: två kontrollpunkter (skissens S-kurva utskriven). */
const SEG: readonly [number, number, number, number][] = [
  [74, 236, 96, 232],
  [148, 224, 176, 216],
  [232, 196, 258, 190],
  [314, 174, 336, 170],
  [388, 158, 412, 148],
  [464, 128, 488, 120],
  [532, 104, 552, 100],
]
const MOBIL_X: readonly number[] = [14, 62, 112, 162, 208, 256, 304, 352]
const MOBIL_Y = 26

function sokvag(fran: number, till: number): string {
  if (till <= fran) return ''
  let d = `M${DATOR[fran][0]} ${DATOR[fran][1]}`
  for (let i = fran; i < till; i++) {
    const [a, b, c, e] = SEG[i]
    d += `C${a} ${b} ${c} ${e} ${DATOR[i + 1][0]} ${DATOR[i + 1][1]}`
  }
  return d
}

const BOCK_D = (x: number, y: number, s = 1) =>
  `M${x - 5.5 * s} ${y + 0.5 * s}l${3.6 * s} ${3.6 * s} ${7.4 * s} ${-8 * s}`

function KlockIkon({ x, y, r }: { x: number; y: number; r: number }) {
  const k = r / 15
  return <path d={`M${x} ${y - 8 * k}v${8.5 * k}l${5 * k} ${3 * k}`} fill="none" style={{ stroke: 'var(--ljus)' }} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
}
function KurvIkon({ x, y, r }: { x: number; y: number; r: number }) {
  const k = r / 15
  return <path d={`M${x - 7 * k} ${y + 4 * k}l${4 * k} ${-4 * k} ${3 * k} ${2.5 * k} ${6 * k} ${-6.5 * k}`} fill="none" style={{ stroke: 'var(--ljus)' }} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
}

/** Skärmläsarens mening om banan. */
export function banaAria(noder: readonly VaggNod[]): string {
  const gjorda = noder.filter((n) => n.status === 'gjord').map((n) => veckodagNamn(n.dag))
  const idag = noder.find((n) => n.status === 'idag')
  const delar: string[] = []
  if (gjorda.length) delar.push(`tränat ${gjorda.join(' och ')}`)
  if (idag) delar.push(`i dag ${veckodagNamn(idag.dag)}`)
  for (const n of noder) {
    if (n.forslag === 'ovningsprov') delar.push(`övningsprov föreslås ${veckodagNamn(n.dag)}`)
    if (n.forslag === 'nivakoll') delar.push(`nivåkoll föreslås ${veckodagNamn(n.dag)}`)
  }
  const prov = noder.find((n) => n.status === 'prov')
  if (prov) delar.push(`provet är ${veckodagNamn(prov.dag)} ${kortDatumV(prov.dag)}`)
  else delar.push('provdagen läggs in när du vet den')
  return `Banan: ${delar.join(', ')}.`
}

const ar = (n: VaggNod | undefined, ...s: VaggNod['status'][]) => !!n && s.includes(n.status)

export function VaggBanaDator({ noder, pill }: { noder: readonly VaggNod[]; pill?: string | null }) {
  const start = Math.max(0, DATOR.length - noder.length)
  const plats = (i: number) => DATOR[start + i]
  const idagI = noder.findIndex((n) => n.status === 'idag')
  // Kopparlinjen: de gjorda dagarna i följd fram till i dag.
  let kopparFran = idagI
  while (kopparFran > 0 && noder[kopparFran - 1].status === 'gjord') kopparFran--
  const sista = noder.length - 1
  return (
    <svg viewBox="0 0 600 300" className="t3-bana-dator" role="img" aria-label={banaAria(noder)}>
      <path d="M-900 560V262C-560 262 -220 252 0 214C150 180 300 250 600 150C700 117 800 108 900 100V560Z" style={{ fill: 'var(--t3-kulle-1)' }} />
      <path
        d="M-900 560V300C-560 300 -200 264 0 258C60 258 92 254 122 250S176 238 204 228S258 212 286 204S336 192 362 186S412 170 438 160S488 142 510 134S560 118 600 92S760 36 900 16V560Z"
        style={{ fill: 'var(--t3-kulle-2)' }}
      />
      <g style={{ fill: 'var(--vagg-svag)' }}>
        <circle cx="330" cy="60" r="2" />
        <circle cx="392" cy="36" r="1.5" />
        <circle cx="486" cy="48" r="2" />
        <circle cx="268" cy="118" r="1.5" />
      </g>
      <path d={sokvag(start, start + sista)} fill="none" style={{ stroke: 'var(--vagg-svag)' }} strokeWidth={4} strokeLinecap="round" strokeDasharray="1 11" />
      {idagI > kopparFran ? (
        <path d={sokvag(start + kopparFran, start + idagI)} fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth={6} strokeLinecap="round" />
      ) : null}
      {pill && idagI >= 0 && noder[idagI + 3] ? (
        <g>
          <rect x={plats(idagI + 3)[0] - 116} y={plats(idagI + 3)[1] - 42} width="150" height="24" rx="12" style={{ fill: 'var(--vagg-2)' }} />
          <text x={plats(idagI + 3)[0] - 41} y={plats(idagI + 3)[1] - 26} textAnchor="middle" fontSize="11" fontWeight="600" style={{ fill: 'var(--vagg-ink)' }}>
            {pill}
          </text>
        </g>
      ) : null}
      {noder.map((n, i) => {
        const [x, y] = plats(i)
        const key = `${n.dag}-${i}`
        if (n.status === 'prov' || n.status === 'prov_okand') {
          const okand = n.status === 'prov_okand'
          return (
            <g key={key}>
              {okand ? (
                <>
                  <path d={`M${x} ${y}V30`} style={{ stroke: 'var(--vagg-svag)' }} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 7" />
                  <path d={`M${x + 3} 30h33l-9 13 9 13h-33z`} style={{ fill: 'var(--t3-flagga-okand)', stroke: 'var(--koppar)' }} strokeWidth={2.5} strokeDasharray="6 4" strokeLinejoin="round" />
                  <circle cx={x} cy={y} r={7} style={{ fill: 'var(--vagg)', stroke: 'var(--vagg-svag)' }} strokeWidth={2.5} />
                </>
              ) : (
                <>
                  <path d={`M${x} ${y}V30`} style={{ stroke: 'var(--vagg-ink)' }} strokeWidth={3} strokeLinecap="round" />
                  <path d={`M${x + 1.5} 32h31l-8 11 8 11h-31z`} style={{ fill: 'var(--koppar)' }} />
                  <circle cx={x} cy={y} r={8} style={{ fill: 'var(--vagg-ink)' }} />
                </>
              )}
              <text x={x - 14} y={46} textAnchor="end" fontSize="13" fontWeight="700" style={{ fill: okand ? 'var(--koppar-ljus)' : 'var(--vagg-ink)' }}>
                {okand ? 'provdagen, när du vet den' : `provet ${kortDatumV(n.dag)}`}
              </text>
            </g>
          )
        }
        if (n.status === 'idag') {
          return (
            <g key={key}>
              <circle className="t3-halo" cx={x} cy={y} r={21} style={{ fill: 'var(--koppar)' }} />
              <circle cx={x} cy={y} r={21} style={{ fill: 'var(--koppar)', stroke: 'var(--vagg-ink)' }} strokeWidth={3} />
              <path d={`M${x - 6} ${y - 9}v18l15-9z`} style={{ fill: 'var(--koppar-text)' }} />
              <text x={x} y={y + 48} textAnchor="middle" fontSize="13" fontWeight="700" style={{ fill: 'var(--vagg-ink)' }}>
                i dag
              </text>
            </g>
          )
        }
        if (n.status === 'gjord') {
          return (
            <g key={key}>
              <circle cx={x} cy={y} r={13} style={{ fill: 'var(--koppar)' }} />
              <path d={BOCK_D(x, y)} fill="none" style={{ stroke: 'var(--koppar-text)' }} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              <text x={x} y={y + 36} textAnchor="middle" fontSize="12" fontWeight="600" style={{ fill: 'var(--vagg-mjuk)' }}>
                {kortVeckodag(n.dag)}
              </text>
            </g>
          )
        }
        const forslag = n.forslag
        const r = forslag ? 15 : 10
        const visaDag = !pill
        return (
          <g key={key} opacity={n.status === 'missad' ? 0.55 : 1}>
            <circle cx={x} cy={y} r={r} style={{ fill: 'var(--vagg)', stroke: forslag ? 'var(--ljus)' : 'var(--vagg-svag)' }} strokeWidth={2.5} />
            {forslag === 'ovningsprov' ? <KlockIkon x={x} y={y} r={r} /> : forslag === 'nivakoll' ? <KurvIkon x={x} y={y} r={r} /> : null}
            {forslag ? (
              <g>
                <rect x={x - 52} y={y - 50} width="104" height="24" rx="12" style={{ fill: 'var(--vagg-2)' }} />
                <text x={x} y={y - 34} textAnchor="middle" fontSize="11" fontWeight="600" style={{ fill: 'var(--vagg-ink)' }}>
                  {forslag === 'ovningsprov' ? 'övningsprov' : 'nivåkoll'}
                </text>
              </g>
            ) : null}
            {visaDag ? (
              <text x={x} y={y + r + 26} textAnchor="middle" fontSize="12" fontWeight="600" style={{ fill: 'var(--vagg-mjuk)' }}>
                {kortVeckodag(n.dag)}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

export function VaggBanaMobil({ noder, mitt }: { noder: readonly VaggNod[]; mitt?: string | null }) {
  const start = Math.max(0, MOBIL_X.length - noder.length)
  const X = (i: number) => MOBIL_X[start + i]
  const idagI = noder.findIndex((n) => n.status === 'idag')
  let kopparFran = idagI
  while (kopparFran > 0 && noder[kopparFran - 1].status === 'gjord') kopparFran--
  const sistaX = X(noder.length - 1)
  return (
    <svg viewBox="0 0 380 70" width="380" height="70" className="t3-bana-mobil" role="img" aria-label={banaAria(noder)}>
      <path d={`M${X(0)} ${MOBIL_Y}H${sistaX}`} style={{ stroke: 'var(--vagg-svag)' }} strokeWidth={3.5} strokeLinecap="round" strokeDasharray="1 9" />
      {idagI > kopparFran ? <path d={`M${X(kopparFran)} ${MOBIL_Y}H${X(idagI)}`} style={{ stroke: 'var(--koppar)' }} strokeWidth={5} strokeLinecap="round" /> : null}
      {noder.map((n, i) => {
        const x = X(i)
        const y = MOBIL_Y
        const key = `${n.dag}-${i}`
        if (n.status === 'prov' || n.status === 'prov_okand') {
          const okand = n.status === 'prov_okand'
          return (
            <g key={key}>
              {okand ? (
                <>
                  <path d={`M${x} ${y}V6`} style={{ stroke: 'var(--vagg-svag)' }} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 5" />
                  <path d={`M${x + 2} 3h20l-6 7.5 6 7.5h-20z`} style={{ fill: 'var(--t3-flagga-okand)', stroke: 'var(--koppar)' }} strokeWidth={2} strokeDasharray="4 3" strokeLinejoin="round" />
                  <circle cx={x} cy={y} r={6} style={{ fill: 'var(--vagg)', stroke: 'var(--vagg-svag)' }} strokeWidth={2.5} />
                </>
              ) : (
                <>
                  <path d={`M${x} ${y + 4}V4`} style={{ stroke: 'var(--vagg-ink)' }} strokeWidth={3} strokeLinecap="round" />
                  <path d={`M${x + 1.5} 5h22l-6 8 6 8h-22z`} style={{ fill: 'var(--koppar)' }} />
                  <circle cx={x} cy={y + 4} r={6} style={{ fill: 'var(--vagg-ink)' }} />
                </>
              )}
              <text x={x} y={58} textAnchor="middle" fontSize="11" fontWeight="700" style={{ fill: okand ? 'var(--koppar-ljus)' : 'var(--vagg-ink)' }}>
                {okand ? 'ditt prov' : 'provet'}
              </text>
            </g>
          )
        }
        if (n.status === 'idag') {
          return (
            <g key={key}>
              <circle className="t3-halo" cx={x} cy={y} r={15} style={{ fill: 'var(--koppar)' }} />
              <circle cx={x} cy={y} r={15} style={{ fill: 'var(--koppar)', stroke: 'var(--vagg-ink)' }} strokeWidth={3} />
              <path d={`M${x - 4} ${y - 6.5}v13l10.5-6.5z`} style={{ fill: 'var(--koppar-text)' }} />
              <text x={x} y={60} textAnchor="middle" fontSize="12" fontWeight="700" style={{ fill: 'var(--vagg-ink)' }}>
                i dag
              </text>
            </g>
          )
        }
        if (n.status === 'gjord') {
          return (
            <g key={key}>
              <circle cx={x} cy={y} r={10} style={{ fill: 'var(--koppar)' }} />
              <path d={BOCK_D(x, y, 0.78)} fill="none" style={{ stroke: 'var(--koppar-text)' }} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              <text x={x} y={58} textAnchor="middle" fontSize="11" fontWeight="600" style={{ fill: 'var(--vagg-mjuk)' }}>
                {kortVeckodag(n.dag)}
              </text>
            </g>
          )
        }
        const forslag = n.forslag
        const r = forslag ? 11 : 7
        return (
          <g key={key} opacity={n.status === 'missad' ? 0.55 : 1}>
            <circle cx={x} cy={y} r={r} style={{ fill: 'var(--vagg)', stroke: forslag ? 'var(--ljus)' : 'var(--vagg-svag)' }} strokeWidth={2.5} />
            {forslag === 'ovningsprov' ? <KlockIkon x={x} y={y} r={r} /> : forslag === 'nivakoll' ? <KurvIkon x={x} y={y} r={r} /> : null}
            {mitt ? null : (
              <text x={x} y={58} textAnchor="middle" fontSize="11" fontWeight="600" style={{ fill: 'var(--vagg-mjuk)' }}>
                {kortVeckodag(n.dag)}
              </text>
            )}
          </g>
        )
      })}
      {mitt ? (
        <text x={(X(idagI >= 0 ? idagI : 0) + sistaX) / 2} y={58} textAnchor="middle" fontSize="11" fontWeight="600" style={{ fill: 'var(--vagg-mjuk)' }}>
          {mitt}
        </text>
      ) : null}
    </svg>
  )
}

export type { Dag }
