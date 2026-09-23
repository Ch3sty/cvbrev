/**
 * Delningsbilden för ett kalkylatorresultat, 1200 × 630, i Trådens toner:
 * papper (mark), bläck (ink-1) och en orange linje under talet. Talet och
 * kalkylatorns namn är resultatets, märket jobbcoach.ai står nere till
 * vänster och källan nere till höger.
 *
 * ImageResponse (Satori) läser inte CSS-variabler, så tokenvärdena skrivs
 * här med namnen från globals.css. Varje div med flera barn har display:
 * flex, som Satori kräver.
 */
import type { Sammanfattning } from '@/lib/rakna/typer'

/** Tokenvärdena ur src/app/globals.css (docs/designsystem.md avsnitt 2). */
export const TOKENS = {
  mark: '#EDE8DF',
  panel: '#FFFFFF',
  insunken: '#ECE6DC',
  kant: '#DBD2C4',
  ink1: '#1C1917',
  ink2: '#57534E',
  ink3: '#6B645E',
  accent: '#D9480F',
  accentInk: '#9A3412',
} as const

export const BREDD = 1200
export const HOJD = 630

/** Talets storlek: så stort som får plats bredvid räknaren. */
export function talStorlek(tal: string): number {
  const bredd = 700
  return Math.max(72, Math.min(150, Math.floor(bredd / (tal.length * 0.56))))
}

function Raknare() {
  const t = TOKENS
  const tangent = (x: number, y: number, fylld = false) => (
    <rect
      key={`${x}-${y}`}
      x={x}
      y={y}
      width={60}
      height={46}
      rx={10}
      fill={fylld ? t.ink1 : t.panel}
      stroke={t.ink1}
      strokeWidth={7}
    />
  )
  const tangenter = []
  for (const y of [150, 212, 274]) for (const x of [36, 110, 184]) tangenter.push(tangent(x, y, x === 184 && y === 274))
  return (
    <svg width="280" height="360" viewBox="0 0 280 360" fill="none">
      <rect x="4" y="4" width="272" height="352" rx="28" fill={t.panel} stroke={t.ink1} strokeWidth={8} />
      <rect x="36" y="36" width="208" height="84" rx="12" fill={t.insunken} stroke={t.ink1} strokeWidth={7} />
      <rect x="120" y="70" width="104" height="18" rx="6" fill={t.accent} />
      {tangenter}
      <path d="M200 293h28M200 305h28" stroke={t.panel} strokeWidth={6} strokeLinecap="round" />
    </svg>
  )
}

export function RaknaUtBild({ s }: { s: Sammanfattning }) {
  const t = TOKENS
  const storlek = talStorlek(s.tal)
  return (
    <div
      style={{
        width: BREDD,
        height: HOJD,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: t.mark,
        padding: '56px 64px',
        fontFamily: 'Schibsted',
        color: t.ink1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 500, letterSpacing: 2, color: t.ink3 }}>
            {`RÄKNA UT · ${s.namn.toUpperCase()}`}
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 30, fontWeight: 500, lineHeight: 1.3, color: t.ink2 }}>
            {s.rad}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: storlek,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -3,
              color: t.ink1,
            }}
          >
            {s.tal}
          </div>
          <div style={{ display: 'flex', marginTop: 20, width: 160, height: 8, borderRadius: 4, background: t.accent }} />
          <div style={{ display: 'flex', marginTop: 20, fontSize: 38, fontWeight: 500, color: t.ink2 }}>{s.enhet}</div>
        </div>
        <Raknare />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: `2px solid ${t.kant}`,
          paddingTop: 20,
        }}
      >
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, letterSpacing: -1, color: t.ink1 }}>jobbcoach.ai</div>
        <div style={{ display: 'flex', maxWidth: 820, fontSize: 19, fontWeight: 500, color: t.ink3, textAlign: 'right' }}>
          {`Källa: ${s.kalla}`}
        </div>
      </div>
    </div>
  )
}
