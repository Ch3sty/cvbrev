/**
 * Dokumentets väg på väggen (skissen Main, Hem-oanalyserat, Hem-ny och
 * Mobil-hem): fyra platser på testernas kulle, uppladdat (eller utkast),
 * analyserat, åtgärdat och flaggan för nedladdat. Gjort i koppar med bock,
 * nästa steg som den stora kopparpunkten med en ikon för handlingen,
 * kommande som ringar. På telefonen en rak rad.
 *
 * Stegen kommer ur dokumentVag (src/lib/rum/cvRum.ts); etiketterna sätts
 * av anroparen (gjort som particip, nästa och kommande som verb).
 * Ren SVG i fasta mått, serverritad, väggens tokens.
 */

export type BanaIkon = 'upp' | 'spela' | 'penna' | 'ner'

export interface BanaSteg {
  etikett: string
  status: 'gjord' | 'nu' | 'kvar'
  /** Ikonen i nästa stegs punkt. */
  ikon?: BanaIkon
}

const P: readonly [number, number][] = [
  [42, 236],
  [116, 229],
  [192, 208],
  [266, 184],
]
const SEG: readonly string[] = ['C70 236 92 233 116 229', 'C140 225 166 218 192 208', 'C214 202 238 194 266 184']

function sokvag(fran: number, till: number): string {
  if (till <= fran) return ''
  let d = `M${P[fran][0]} ${P[fran][1]}`
  for (let i = fran; i < till; i++) d += SEG[i]
  return d
}

const bock = (x: number, y: number, s = 1) => `M${x - 5.5 * s} ${y + 0.5 * s}l${3.6 * s} ${3.6 * s} ${7.4 * s} ${-8 * s}`

function Ikon({ ikon, x, y, s = 1 }: { ikon: BanaIkon; x: number; y: number; s?: number }) {
  const f = { fill: 'var(--koppar-text)' }
  const st = { stroke: 'var(--koppar-text)' }
  switch (ikon) {
    case 'upp':
      return <path d={`M${x} ${y + 9 * s}v${-17 * s}M${x - 7 * s} ${y - 2 * s}l${7 * s} ${-7 * s} ${7 * s} ${7 * s}`} fill="none" style={st} strokeWidth={3 * s} strokeLinecap="round" strokeLinejoin="round" />
    case 'spela':
      return <path d={`M${x - 5 * s} ${y - 9 * s}v${18 * s}l${15 * s} ${-9 * s}z`} style={f} />
    case 'penna':
      return <path d={`M${x - 8 * s} ${y + 5.5 * s}l${2 * s} ${-6.5 * s} ${9 * s} ${-9 * s} ${4.5 * s} ${4.5 * s} ${-9 * s} ${9 * s}z`} style={f} />
    case 'ner':
      return <path d={`M${x} ${y - 9 * s}v${17 * s}M${x - 7 * s} ${y + 2 * s}l${7 * s} ${7 * s} ${7 * s} ${-7 * s}`} fill="none" style={st} strokeWidth={3 * s} strokeLinecap="round" strokeLinejoin="round" />
  }
}

/** Skärmläsarens mening om vägen. */
export function banaAria(steg: readonly BanaSteg[]): string {
  const gjorda = steg.filter((s) => s.status === 'gjord').map((s) => s.etikett)
  const nu = steg.find((s) => s.status === 'nu')
  const kvar = steg.filter((s) => s.status === 'kvar').map((s) => s.etikett)
  const delar: string[] = []
  if (gjorda.length) delar.push(`${gjorda.join(' och ')} är klart`)
  if (nu) delar.push(`nästa steg: ${nu.etikett}`)
  if (kvar.length) delar.push(`sedan ${kvar.join(' och ')}`)
  return `Dokumentets väg: ${delar.join('. ') || 'allt är klart'}.`
}

export function DokumentBanaDator({ steg }: { steg: readonly BanaSteg[] }) {
  const nuI = steg.findIndex((s) => s.status === 'nu')
  const klar = nuI < 0
  const sluta = klar ? 3 : nuI
  return (
    <svg viewBox="0 0 600 300" className="cv3-bana-dator" role="img" aria-label={banaAria(steg)}>
      <path d="M-900 560V262C-560 262 -220 252 0 214C150 180 300 250 600 150C700 117 800 108 900 100V560Z" style={{ fill: 'var(--t3-kulle-1)' }} />
      <path
        d="M-900 560V300C-560 300 -200 264 0 258C60 258 92 254 122 250S176 238 204 228S258 212 286 204S336 192 362 186S412 170 438 160S488 142 510 134S560 118 600 92S760 36 900 16V560Z"
        style={{ fill: 'var(--t3-kulle-2)' }}
      />
      <g style={{ fill: 'var(--vagg-svag)' }}>
        <circle cx="250" cy="52" r="2" />
        <circle cx="292" cy="96" r="1.5" />
        <circle cx="196" cy="118" r="1.5" />
      </g>
      {!klar && nuI < 3 ? <path d={sokvag(nuI, 3)} fill="none" style={{ stroke: 'var(--vagg-svag)' }} strokeWidth={4} strokeLinecap="round" strokeDasharray="1 11" /> : null}
      {sluta > 0 ? <path d={sokvag(0, sluta)} fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth={6} strokeLinecap="round" /> : null}
      {steg.slice(0, 4).map((s, i) => {
        const [x, y] = P[i]
        const flagga = i === 3
        const etikettY = s.status === 'nu' ? y + 47 : flagga ? y + 28 : s.status === 'gjord' ? y + 36 : y + 33
        const text = (
          <text
            x={x}
            y={etikettY}
            textAnchor="middle"
            fontSize={s.status === 'nu' ? 13 : 12}
            fontWeight={s.status === 'nu' ? 700 : 600}
            style={{ fill: s.status === 'nu' ? 'var(--vagg-ink)' : 'var(--vagg-mjuk)' }}
          >
            {s.etikett}
          </text>
        )
        const pinne = flagga ? (
          <>
            <path d={`M${x} ${y}V132`} style={{ stroke: 'var(--vagg-ink)' }} strokeWidth={3} strokeLinecap="round" />
            <path d={`M${x + 1.5} 134h29l-7.5 10.5 7.5 10.5h-29z`} style={{ fill: 'var(--koppar)' }} />
          </>
        ) : null
        if (s.status === 'nu') {
          return (
            <g key={i}>
              {pinne}
              <circle className="t3-halo" cx={x} cy={y} r={21} style={{ fill: 'var(--koppar)' }} />
              <circle cx={x} cy={y} r={21} style={{ fill: 'var(--koppar)', stroke: 'var(--vagg-ink)' }} strokeWidth={3} />
              {s.ikon ? <Ikon ikon={s.ikon} x={x} y={y} /> : null}
              {flagga ? <text x={x} y={y + 47} textAnchor="middle" fontSize={13} fontWeight={700} style={{ fill: 'var(--vagg-ink)' }}>{s.etikett}</text> : text}
            </g>
          )
        }
        if (s.status === 'gjord') {
          return (
            <g key={i}>
              {pinne}
              <circle cx={x} cy={y} r={13} style={{ fill: 'var(--koppar)' }} />
              <path d={bock(x, y)} fill="none" style={{ stroke: 'var(--koppar-text)' }} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              {flagga ? <text x={x} y={y + 36} textAnchor="middle" fontSize={12} fontWeight={600} style={{ fill: 'var(--vagg-mjuk)' }}>{s.etikett}</text> : text}
            </g>
          )
        }
        return (
          <g key={i}>
            {pinne}
            {flagga ? (
              <circle cx={x} cy={y} r={8} style={{ fill: 'var(--vagg-ink)' }} />
            ) : (
              <circle cx={x} cy={y} r={10} style={{ fill: 'var(--vagg)', stroke: 'var(--vagg-svag)' }} strokeWidth={2.5} />
            )}
            {text}
          </g>
        )
      })}
    </svg>
  )
}

const MX: readonly number[] = [28, 136, 246, 352]
const MY = 26

export function DokumentBanaMobil({ steg }: { steg: readonly BanaSteg[] }) {
  const nuI = steg.findIndex((s) => s.status === 'nu')
  const klar = nuI < 0
  const sluta = klar ? 3 : nuI
  return (
    <svg viewBox="0 0 380 70" width="380" height="70" className="cv3-bana-mobil" role="img" aria-label={banaAria(steg)}>
      {!klar && nuI < 3 ? (
        <path d={`M${MX[nuI]} ${MY}H${MX[3]}`} style={{ stroke: 'var(--vagg-svag)' }} strokeWidth={3.5} strokeLinecap="round" strokeDasharray="1 9" />
      ) : null}
      {sluta > 0 ? <path d={`M${MX[0]} ${MY}H${MX[sluta]}`} style={{ stroke: 'var(--koppar)' }} strokeWidth={5} strokeLinecap="round" /> : null}
      {steg.slice(0, 4).map((s, i) => {
        const x = MX[i]
        const y = MY
        const flagga = i === 3
        const text = (
          <text
            x={flagga ? x - 6 : x}
            y={s.status === 'nu' ? 60 : 58}
            textAnchor="middle"
            fontSize={s.status === 'nu' ? 12 : 11}
            fontWeight={s.status === 'nu' ? 700 : 600}
            style={{ fill: s.status === 'nu' ? 'var(--vagg-ink)' : 'var(--vagg-mjuk)' }}
          >
            {s.etikett}
          </text>
        )
        const pinne = flagga ? (
          <>
            <path d={`M${x} ${y + 4}V4`} style={{ stroke: 'var(--vagg-ink)' }} strokeWidth={3} strokeLinecap="round" />
            <path d={`M${x + 1.5} 5h22l-6 8 6 8h-22z`} style={{ fill: 'var(--koppar)' }} />
          </>
        ) : null
        if (s.status === 'nu') {
          return (
            <g key={i}>
              {pinne}
              <circle className="t3-halo" cx={x} cy={y} r={15} style={{ fill: 'var(--koppar)' }} />
              <circle cx={x} cy={y} r={15} style={{ fill: 'var(--koppar)', stroke: 'var(--vagg-ink)' }} strokeWidth={3} />
              {s.ikon ? <Ikon ikon={s.ikon} x={x} y={y} s={0.72} /> : null}
              {text}
            </g>
          )
        }
        if (s.status === 'gjord') {
          return (
            <g key={i}>
              {pinne}
              <circle cx={x} cy={y} r={10} style={{ fill: 'var(--koppar)' }} />
              <path d={bock(x, y, 0.78)} fill="none" style={{ stroke: 'var(--koppar-text)' }} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              {text}
            </g>
          )
        }
        return (
          <g key={i}>
            {pinne}
            {flagga ? (
              <circle cx={x} cy={y + 4} r={6} style={{ fill: 'var(--vagg-ink)' }} />
            ) : (
              <circle cx={x} cy={y} r={7} style={{ fill: 'var(--vagg)', stroke: 'var(--vagg-svag)' }} strokeWidth={2.5} />
            )}
            {text}
          </g>
        )
      })}
    </svg>
  )
}
