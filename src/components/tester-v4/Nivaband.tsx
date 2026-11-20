/**
 * Nivåbandet (utkast v4 avsnitt 5, skissens nivaband()): nivån ritas alltid
 * som ett band, aldrig som löptext. Samma komponent i tre storlekar: liten i
 * listor och på Hem, mellan i typens meny, stor i Din utveckling.
 *
 *   - skala 1 till 10 i tre zoner (Grund 1 till 4, Avancerad 4 till 7,
 *     Expert 7 till 10)
 *   - fyllning till nivån och en knopp med talet
 *   - ljusare band för mätningens osäkerhet (±0,6): 5,3 och 5,6 är samma sak
 *   - taket (7,5 tills banken är kalibrerad) bara i stor storlek
 *   - omätt: streckad skala med typens start, "Nivåkoll, 7 min" eller
 *     "Nivåtest, 15 uppgifter" där Nivåkollen saknas (rutter.omattMeta)
 *   - påbörjad nivåkoll: "8 av 12 svar", inget tal
 *
 * Koppar för provets delar (och alla utan plan), grått för övriga när en plan
 * finns. Knoppens tal står i koppar-text på koppar (ren koppar bär aldrig
 * text, designsystemet avsnitt 1). Nivåtestens procent visas aldrig här.
 *
 * Server component, ingen klientkod. Färger bara ur tokens, så mörkt läge
 * följer med.
 */

import type { NivabandProps } from '@/lib/tester/v4/typer'
import { ZON_GRANSER } from '@/lib/tester/v4/typer'
import { omattMeta } from '@/lib/tester/v4/rutter'

/** Bandets ord, ordagrant ur skissen. */
export const NIVABAND = {
  zon: { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' },
  /** Utan typ: bara att nivån inte är mätt. Med typ: omattMeta(typ). */
  omatt: 'Inte mätt än',
  paborjad: (b: number, a: number) => `${b} av ${a} svar`,
  paborjadUtanSvar: 'Nivåkoll påbörjad',
  tak: (t: string) => `tak i dag ${t}`,
  ariaOmatt: (namn: string) => `${namn}: inte mätt än`,
  ariaPaborjad: (namn: string, b: number, a: number) => `${namn}: nivåkoll påbörjad, ${b} av ${a} svar`,
  ariaMatt: (namn: string, niva: string, zon: string) => `${namn}: nivå ${niva} av 10, ${zon.toLowerCase()} zon`,
} as const

const L = 12
const R = 12

/**
 * Liten är smalare i viewBox än skissens 344, eftersom den står i kort runt
 * 220 px breda: knoppens tal skalas då inte ner under läsbar storlek.
 */
const MATT: Record<NivabandProps['storlek'], { w: number; h: number; y: number; tjock: number; knopp: number; tal: number }> = {
  liten: { w: 240, h: 24, y: 12, tjock: 6, knopp: 10, tal: 9.5 },
  mellan: { w: 344, h: 54, y: 16, tjock: 8, knopp: 12, tal: 11 },
  stor: { w: 344, h: 62, y: 16, tjock: 8, knopp: 12, tal: 11 },
}

/** Skalan 1 till 10 på bredden w. */
const skala = (w: number) => (v: number) => L + ((v - 1) / 9) * (w - L - R)
const klamp = (v: number) => Math.min(10, Math.max(1, v))
/** Ett tal med decimalkomma, en decimal. */
export const talText = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',')

/** Zonen som nivån står i, i ord. */
export function zonFor(v: number): 'grund' | 'avancerad' | 'expert' {
  if (v < ZON_GRANSER.grund[1]) return 'grund'
  if (v < ZON_GRANSER.avancerad[1]) return 'avancerad'
  return 'expert'
}

/** Det tillgängliga namnet: nivån i ord, aldrig bara en bild. */
export function nivabandEtikett({ namn, lage }: Pick<NivabandProps, 'namn' | 'lage'>): string {
  if (lage.status === 'paborjad' && lage.svar) {
    return NIVABAND.ariaPaborjad(namn, lage.svar.besvarade, lage.svar.antal)
  }
  if (lage.status !== 'matt' || lage.niva == null) return NIVABAND.ariaOmatt(namn)
  return NIVABAND.ariaMatt(namn, talText(lage.niva), NIVABAND.zon[zonFor(lage.niva)])
}

export default function Nivaband({ namn, typ, lage, storlek, ton }: NivabandProps) {
  const m = MATT[storlek]
  const x = skala(m.w)
  const liten = storlek === 'liten'
  const stor = storlek === 'stor'
  const { y, tjock } = m
  const matt = lage.status === 'matt' && lage.niva != null
  const paborjad = lage.status === 'paborjad'
  const omatt = !matt && !paborjad
  const farg = ton === 'koppar' ? 'var(--koppar)' : 'var(--ink-3)'
  const mjuk =
    ton === 'koppar' ? 'var(--koppar-mjuk)' : 'color-mix(in srgb, var(--ink-3) 18%, transparent)'
  const talFarg = ton === 'koppar' ? 'var(--koppar-text)' : 'var(--papper)'

  const zoner = [ZON_GRANSER.grund, ZON_GRANSER.avancerad, ZON_GRANSER.expert]

  return (
    <svg
      viewBox={`0 0 ${m.w} ${m.h}`}
      role="img"
      aria-label={nivabandEtikett({ namn, lage })}
      data-nivaband={storlek}
      data-status={lage.status}
      data-ton={ton}
      className="block h-auto w-full overflow-visible"
    >
      {zoner.map(([fran, till], i) => (
        <line
          key={fran}
          x1={x(fran) + (i ? 2 : 0)}
          y1={y}
          x2={x(till) - (i < 2 ? 2 : 0)}
          y2={y}
          style={{ stroke: 'var(--kant)' }}
          strokeWidth={tjock}
          strokeLinecap="round"
          strokeDasharray={omatt ? '3 5' : undefined}
        />
      ))}

      {matt ? (
        <MattDel
          niva={klamp(lage.niva as number)}
          osakerhet={lage.osakerhet}
          y={y}
          tjock={tjock}
          knopp={m.knopp}
          tal={m.tal}
          farg={farg}
          mjuk={mjuk}
          talFarg={talFarg}
          x={x}
        />
      ) : paborjad ? (
        <>
          <rect
            x={x(3.5)}
            y={y - tjock / 2 - 3}
            width={x(6.5) - x(3.5)}
            height={tjock + 6}
            rx={5}
            style={{ fill: mjuk }}
          />
          <text
            x={x(5)}
            y={y + 3.5}
            textAnchor="middle"
            style={{ fontSize: m.tal, fontWeight: 600, fill: 'var(--ink-2)' }}
          >
            {lage.svar ? NIVABAND.paborjad(lage.svar.besvarade, lage.svar.antal) : NIVABAND.paborjadUtanSvar}
          </text>
        </>
      ) : (
        <text
          x={x(5.5)}
          y={y + 3.5}
          textAnchor="middle"
          style={{ fontSize: liten ? 10 : 11, fontWeight: 600, fill: 'var(--ink-3)' }}
        >
          {typ ? omattMeta(typ) : NIVABAND.omatt}
        </text>
      )}

      {!liten ? (
        <g style={{ fontSize: 10.5, fontWeight: 500, fill: 'var(--ink-3)' }} aria-hidden="true">
          <text x={x(2.5)} y={y + 24} textAnchor="middle">
            {NIVABAND.zon.grund}
          </text>
          <text x={x(5.5)} y={y + 24} textAnchor="middle">
            {NIVABAND.zon.avancerad}
          </text>
          <text x={x(8.5)} y={y + 24} textAnchor="middle">
            {NIVABAND.zon.expert}
          </text>
          <text x={x(1)} y={y + 38} textAnchor="start">
            1
          </text>
          <text x={x(10)} y={y + 38} textAnchor="end">
            10
          </text>
          {stor ? (
            <>
              <line
                x1={x(lage.tak)}
                y1={y - 10}
                x2={x(lage.tak)}
                y2={y - 6}
                style={{ stroke: 'var(--ink-3)' }}
                strokeWidth={1.5}
                data-tak
              />
              <text x={x(lage.tak)} y={y + 38} textAnchor="middle">
                {NIVABAND.tak(talText(lage.tak))}
              </text>
            </>
          ) : null}
        </g>
      ) : null}
    </svg>
  )
}

function MattDel({
  niva,
  osakerhet,
  y,
  tjock,
  knopp,
  tal,
  farg,
  mjuk,
  talFarg,
  x,
}: {
  niva: number
  osakerhet: number
  y: number
  tjock: number
  knopp: number
  tal: number
  farg: string
  mjuk: string
  talFarg: string
  x: (v: number) => number
}) {
  const fran = Math.max(1, niva - osakerhet)
  const till = Math.min(10, niva + osakerhet)
  return (
    <g data-niva={talText(niva)}>
      <rect
        x={x(fran)}
        y={y - tjock / 2 - 3}
        width={x(till) - x(fran)}
        height={tjock + 6}
        rx={5}
        style={{ fill: mjuk }}
        data-osakerhet
      />
      <line x1={x(1)} y1={y} x2={x(niva)} y2={y} style={{ stroke: farg }} strokeWidth={tjock} strokeLinecap="round" />
      <circle cx={x(niva)} cy={y} r={knopp} style={{ fill: farg, stroke: 'var(--papper)' }} strokeWidth={2.5} />
      <text
        x={x(niva)}
        y={y + (knopp === 10 ? 3.5 : 4)}
        textAnchor="middle"
        aria-hidden="true"
        style={{ fontSize: tal, fontWeight: 700, fill: talFarg, fontVariantNumeric: 'tabular-nums' }}
      >
        {talText(niva)}
      </text>
    </g>
  )
}
