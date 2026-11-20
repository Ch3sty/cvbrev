/**
 * Omgång 3: de små byggstenarna på Hem, Tester och Din utveckling (skissens
 * .lucka, .vantar, .upp, .matt, ringen, rutorna, scenerna och ikonerna).
 * Ingen data räknas här; allt kommer in som props. Inga hooks, går att
 * använda från både server- och klientkomponenter.
 */

import type { ReactNode } from 'react'
import type { TestTypId, VagIkon } from '@/lib/tester/v4/typer'
import { PROVETS_NIVA, tal1 } from './matt'

/** "Inte mätt än": brädets lucka, streckad koppar med frågetecken. */
export function Lucka({ bredd = 86, hojd = 60, etikett = 'Inte mätt än' }: { bredd?: number; hojd?: number; etikett?: string }) {
  return (
    <span className="t3-lucka" style={{ width: bredd, height: hojd }} role="img" aria-label={etikett}>
      ?
    </span>
  )
}

export function VantarChip({ children = 'inte mätt än' }: { children?: ReactNode }) {
  return <span className="t3-vantar">{children}</span>
}

export function UppChip({ riktning, varde, svans = '' }: { riktning: 'upp' | 'ned' | 'oforandrad'; varde: number; svans?: string }) {
  if (riktning === 'oforandrad') return <span className="t3-upp" data-ton="lika">{`oförändrad${svans}`}</span>
  return (
    <span className="t3-upp" data-ton={riktning}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={riktning === 'ned' ? { transform: 'rotate(180deg)' } : undefined}>
        <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />
      </svg>
      {`${riktning} ${tal1(Math.abs(varde))}${svans}`}
    </span>
  )
}

/**
 * Mätaren: tre zoner (Grund 1 till 4, Avancerad 4 till 7, Expert 7 till 10),
 * provets zon tonad, nivån som fylld del och knopp. Utan nivå: tre tomma fält.
 */
export function Matare3({ niva, storlek = 'stor', provZon = true, etikett }: { niva: number | null; storlek?: 'stor' | 'liten'; provZon?: boolean; etikett: string }) {
  const pct = niva == null ? 0 : Math.max(2, Math.min(100, ((niva - 1) / 9) * 100))
  return (
    <span className="t3-matt" data-storlek={storlek} data-tom={niva == null ? '' : undefined} role="img" aria-label={etikett}>
      <i />
      <i data-prov={provZon ? '' : undefined} />
      <i />
      {niva != null ? (
        <>
          <b style={{ width: `${pct}%` }} />
          <u style={{ left: `${pct}%` }} />
        </>
      ) : null}
    </span>
  )
}

export function matareEtikett(niva: number | null): string {
  return niva == null ? 'Ingen nivå än' : `Nivå ${tal1(niva)} av 10. Provet ligger på avancerad nivå, ${tal1(PROVETS_NIVA)} till 7.`
}

/** Tempot som ring: indigo för svaren inom tiden, koppar för resten. */
export function TempoRing({ procent, storlek = 96 }: { procent: number | null; storlek?: number }) {
  if (procent == null) {
    return (
      <svg viewBox="0 0 100 100" width={storlek} height={storlek} role="img" aria-label="Tempot är inte mätt än" className="shrink-0">
        <circle cx="50" cy="50" r="42" style={{ fill: 'var(--papper)', stroke: 'var(--koppar)' }} strokeWidth="3" strokeDasharray="8 6.66" />
        <text x="50" y="61" textAnchor="middle" className="t3-disp" fontSize="32" fontWeight="800" style={{ fill: 'var(--koppar-ink)' }}>
          ?
        </text>
      </svg>
    )
  }
  const offset = 264 * (1 - procent / 100)
  return (
    <svg viewBox="0 0 100 100" width={storlek} height={storlek} role="img" aria-label={`${procent} procent av svaren inom provets tid`} className="shrink-0">
      <circle cx="50" cy="50" r="42" fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth="13" />
      <circle className="t3-ringen" cx="50" cy="50" r="42" fill="none" style={{ stroke: 'var(--sess-indigo)', ['--t3-ring' as string]: offset }} strokeWidth="13" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={offset} transform="rotate(-90 50 50)" />
      <text x="50" y={storlek < 90 ? 58 : 57} textAnchor="middle" className="t3-disp" fontSize={procent >= 100 ? 19 : storlek < 90 ? 24 : 22} fontWeight="800" style={{ fill: 'var(--ink-1)' }}>
        {`${procent} %`}
      </text>
    </svg>
  )
}

/** Rutorna: rätt i grönt, resten tomma. Antalet rutor är provets antal uppgifter. */
export function Rutor({ ratt, antal, per = 10, storlek = 'stor' }: { ratt: number; antal: number; per?: number; storlek?: 'stor' | 'liten' }) {
  const n = Math.min(antal, 40)
  return (
    <span className="t3-rutor" data-storlek={storlek} style={{ gridTemplateColumns: `repeat(${Math.min(per, n)}, var(--t3-ruta))` }} role="img" aria-label={`${ratt} av ${antal} rätt`}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="t3-ruta" data-r={i < ratt ? '' : undefined} />
      ))}
    </span>
  )
}

/**
 * Rätt och fel som små brickor. Ordningen per uppgift finns inte i datan, så
 * brickorna står grupperade: rätt först, sedan fel.
 */
export function Pips({ ratt, antal, storlek = 'liten', tomma = 0 }: { ratt: number; antal: number; storlek?: 'liten' | 'stor'; tomma?: number }) {
  return (
    <span className="t3-pips" data-storlek={storlek} role="img" aria-label={`${ratt} av ${antal} rätt`}>
      {Array.from({ length: antal }, (_, i) => (
        <span key={i} className="t3-pip" data-pip={i < ratt ? 'r' : 'f'} />
      ))}
      {Array.from({ length: tomma }, (_, i) => (
        <span key={`t${i}`} className="t3-pip" />
      ))}
    </span>
  )
}

/** Ikonerna i vägens kort och i sätten att öva. */
export function Ikon3({ ikon, size = 24 }: { ikon: VagIkon | 'nivatest'; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const }
  switch (ikon) {
    case 'spela':
      return (
        <svg {...p} fill="currentColor">
          <path d="M7 4.5v15l12.5-7.5z" />
        </svg>
      )
    case 'klocka':
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4.5l3 2M9.5 2.5h5" />
        </svg>
      )
    case 'kurva':
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16l5-5 4 3 7-8" />
          <path d="M15 6h5v5" />
        </svg>
      )
    case 'prov':
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="3" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </svg>
      )
    case 'monster':
      return (
        <svg {...p}>
          <rect x="2.5" y="7" width="19" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8.8 7v10M15.2 7v10" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="5.7" cy="12" r="1.3" fill="currentColor" />
          <circle cx="10.8" cy="12" r="1.3" fill="currentColor" />
          <circle cx="13.2" cy="12" r="1.3" fill="currentColor" />
          <rect x="16.8" y="9.5" width="3" height="5" rx="1" style={{ fill: 'var(--koppar)' }} />
        </svg>
      )
    case 'flagga':
      return (
        <svg {...p}>
          <path d="M6 21V3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M7.5 4h12l-3.5 4.5L19.5 13h-12z" fill="currentColor" />
        </svg>
      )
    case 'nivatest':
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 20h18" />
          <path d="M5 15c4 0 5-6 9-6 2 0 3 1 5-3" />
        </svg>
      )
    default:
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
        </svg>
      )
  }
}

/** Testtypens scen: ett litet bräde i väggens färg (skissens .typ .scen). */
export function TypScen({ typ, bredd = 240, hojd = 104 }: { typ: TestTypId | 'personlighet'; bredd?: number; hojd?: number }) {
  const vit = { fill: 'var(--sess-ruta)' }
  const fig = { stroke: 'var(--sess-figur)' }
  const lucka = (x: number, y: number, s: number) => (
    <rect x={x} y={y} width={s} height={s} rx={s * 0.22} style={{ fill: 'var(--vagg-2)', stroke: 'var(--koppar)' }} strokeWidth="2.8" strokeDasharray="6 5" />
  )
  let inne: ReactNode
  switch (typ) {
    case 'matris':
      inne = (
        <g transform="translate(70 4) scale(.73)">
          <g style={vit}>
            {[12, 50, 88].flatMap((y) => [12, 50, 88].map((x) => (x === 88 && y === 88 ? null : <rect key={`${x}-${y}`} x={x} y={y} width="32" height="32" rx="8" />)))}
          </g>
          <g fill="none" style={fig} strokeWidth="2.6" strokeLinejoin="round">
            <circle cx="28" cy="28" r="7.5" />
            <rect x="59" y="21" width="14" height="14" rx="2" />
            <path d="M104 20l8.5 15h-17z" />
            <path d="M28 96l8.5 15h-17z" />
            <circle cx="66" cy="104" r="7.5" />
          </g>
          <g style={{ fill: 'var(--sess-figur)' }}>
            <rect x="21" y="59" width="14" height="14" rx="2" />
            <path d="M66 58l8.5 15h-17z" />
            <circle cx="104" cy="66" r="7.5" />
          </g>
          {lucka(89.5, 89.5, 29)}
        </g>
      )
      break
    case 'figurserie':
      inne = (
        <>
          <g style={vit}>
            <rect x="26" y="30" width="44" height="44" rx="10" />
            <rect x="76" y="30" width="44" height="44" rx="10" />
            <rect x="126" y="30" width="44" height="44" rx="10" />
          </g>
          <g fill="none" style={fig} strokeWidth="2.8">
            <rect x="36" y="40" width="24" height="24" rx="4" />
            <rect x="86" y="40" width="24" height="24" rx="4" />
            <rect x="136" y="40" width="24" height="24" rx="4" />
          </g>
          <circle cx="40" cy="44" r="5" style={{ ...vit, ...fig }} strokeWidth="2.8" />
          <circle cx="106" cy="44" r="5" style={{ fill: 'var(--sess-figur)' }} />
          <circle cx="156" cy="60" r="5" style={{ ...vit, ...fig }} strokeWidth="2.8" />
          {lucka(177.5, 31.5, 41)}
        </>
      )
      break
    case 'deduktiv':
      inne = (
        <>
          <g fill="none" style={{ stroke: 'var(--vagg-svag)' }} strokeWidth="2" strokeDasharray="5 4">
            <rect x="46" y="20" width="30" height="52" rx="7" />
            <rect x="84" y="20" width="30" height="52" rx="7" />
          </g>
          <rect x="122" y="22" width="28" height="50" rx="7" style={{ fill: 'var(--t3-lila)' }} />
          <rect x="128" y="30" width="16" height="14" rx="3" style={vit} opacity=".9" />
          <rect x="160" y="22" width="28" height="50" rx="7" style={vit} />
          <rect x="166" y="30" width="16" height="14" rx="3" style={{ fill: 'var(--sess-kant)' }} />
          <rect x="38" y="76" width="164" height="8" rx="4" style={{ fill: 'var(--ljus)' }} />
        </>
      )
      break
    case 'verbal':
      inne = (
        <>
          <rect x="52" y="16" width="136" height="72" rx="10" style={vit} />
          <g style={{ stroke: 'var(--sess-kant)' }} strokeWidth="5" strokeLinecap="round">
            <path d="M66 32h78M66 46h108M66 74h62" />
          </g>
          <rect x="64" y="55" width="92" height="11" rx="5.5" style={{ fill: 'var(--koppar-ljus)' }} />
        </>
      )
      break
    case 'numerisk':
      inne = (
        <>
          <path d="M54 82h132" style={{ stroke: 'var(--ljus)' }} strokeWidth="3" strokeLinecap="round" />
          <g style={vit}>
            <path d="M66 82V58q0-6 6-6h8q6 0 6 6v24z" />
            <path d="M96 82V44q0-6 6-6h8q6 0 6 6v38z" />
            <path d="M156 82V52q0-6 6-6h8q6 0 6 6v30z" />
          </g>
          <path d="M126 82V28q0-6 6-6h8q6 0 6 6v54z" style={{ fill: 'var(--koppar)' }} />
        </>
      )
      break
    case 'talserie':
      inne = (
        <>
          <g style={vit}>
            <rect x="30" y="32" width="40" height="40" rx="10" />
            <rect x="76" y="32" width="40" height="40" rx="10" />
            <rect x="122" y="32" width="40" height="40" rx="10" />
          </g>
          <g className="t3-disp" fontSize="20" fontWeight="800" style={{ fill: 'var(--sess-figur)' }} textAnchor="middle">
            <text x="50" y="59">3</text>
            <text x="96" y="59">6</text>
            <text x="142" y="59">12</text>
          </g>
          {lucka(169.5, 33.5, 37)}
        </>
      )
      break
    case 'spatial':
      inne = (
        <>
          <path d="M120 14L156 34V72L120 92L84 72V34Z" style={{ fill: 'var(--sess-kant)' }} />
          <path d="M120 14L156 34L120 54L84 34Z" style={vit} />
          <path d="M120 54V92L156 72V34Z" style={vit} opacity=".72" />
          <path d="M120 14L156 34V72L120 92L84 72V34ZM84 34L120 54L156 34M120 54V92" fill="none" style={fig} strokeWidth="2.8" strokeLinejoin="round" />
          <ellipse cx="120" cy="34" rx="9" ry="5" style={{ fill: 'var(--koppar)' }} />
        </>
      )
      break
    case 'ordforrad':
      inne = (
        <>
          <rect x="66" y="26" width="118" height="60" rx="12" style={{ fill: 'var(--vagg-svag)' }} transform="rotate(-5 125 56)" />
          <rect x="58" y="20" width="124" height="62" rx="12" style={vit} />
          <text x="120" y="61" textAnchor="middle" className="t3-disp" fontSize="26" fontWeight="800" style={{ fill: 'var(--sess-figur)' }}>
            ord
          </text>
        </>
      )
      break
    default:
      inne = (
        <>
          <path d="M50 52h140" style={{ stroke: 'var(--vagg-svag)' }} strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="52" r="17" style={{ fill: 'var(--vagg)', stroke: 'var(--ljus)' }} strokeWidth="4" />
          <circle cx="88" cy="52" r="13" style={{ fill: 'var(--vagg)', stroke: 'var(--ljus)' }} strokeWidth="4" />
          <circle cx="120" cy="52" r="9" style={{ fill: 'var(--vagg)', stroke: 'var(--vagg-mjuk)' }} strokeWidth="4" />
          <circle cx="152" cy="52" r="13" style={{ fill: 'var(--koppar)' }} />
          <path d="M146 52.5l4 4 8-8.5" fill="none" style={{ stroke: 'var(--koppar-text)' }} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="190" cy="52" r="17" style={{ fill: 'var(--vagg)', stroke: 'var(--koppar)' }} strokeWidth="4" />
        </>
      )
  }
  return (
    <svg viewBox="0 0 240 104" width={bredd} height={hojd} aria-hidden="true" className="block max-w-full">
      {inne}
    </svg>
  )
}

/** Planpanelens stora matrisbräde (132 px). */
export function MatrisBrade({ storlek = 132 }: { storlek?: number }) {
  return (
    <svg viewBox="0 0 132 132" width={storlek} height={storlek} role="img" aria-label="En matris med nio rutor där den sista saknas" className="shrink-0">
      <rect width="132" height="132" rx="22" style={{ fill: 'var(--vagg)' }} />
      <g style={{ fill: 'var(--sess-ruta)' }}>
        {[12, 50, 88].flatMap((y) => [12, 50, 88].map((x) => (x === 88 && y === 88 ? null : <rect key={`${x}-${y}`} x={x} y={y} width="32" height="32" rx="8" />)))}
      </g>
      <g fill="none" style={{ stroke: 'var(--sess-figur)' }} strokeWidth="2.6" strokeLinejoin="round">
        <circle cx="28" cy="28" r="7.5" />
        <rect x="59" y="21" width="14" height="14" rx="2" />
        <path d="M104 20l8.5 15h-17z" />
        <path d="M28 96l8.5 15h-17z" />
        <circle cx="66" cy="104" r="7.5" />
      </g>
      <g style={{ fill: 'var(--sess-figur)' }}>
        <rect x="21" y="59" width="14" height="14" rx="2" />
        <path d="M66 58l8.5 15h-17z" />
        <circle cx="104" cy="66" r="7.5" />
      </g>
      <rect x="89.5" y="89.5" width="29" height="29" rx="7" style={{ fill: 'var(--vagg-2)', stroke: 'var(--koppar)' }} strokeWidth="2.6" strokeDasharray="5 4" />
    </svg>
  )
}

/** Den mörka rutan med typens scen (planpanelen för andra typer än matrisen). */
export function TypBrade({ typ, storlek = 132 }: { typ: TestTypId; storlek?: number }) {
  if (typ === 'matris') return <MatrisBrade storlek={storlek} />
  return (
    <span className="t3-typbrade" style={{ width: storlek, height: storlek }} aria-hidden="true">
      <TypScen typ={typ} bredd={storlek} hojd={(storlek * 104) / 240} />
    </span>
  )
}

export function Pil3({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function Las3({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  )
}
