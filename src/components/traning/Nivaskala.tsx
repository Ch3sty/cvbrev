/**
 * Nivåskalan 1 till 10 på väggen (spec-rummen 4.4, konceptets .skala i 1d,
 * W4, P4, S1, M1 och O1).
 *
 * OBS: komponenten ägs av våg 3b. Våg 2 behöver den för provdagen (1d och
 * W4) och har byggt den enligt specens gränssnitt (NivaskalaProps) så att
 * 3b:s version kan ersätta den här filen rakt av vid sammanslagningen.
 *
 * viewBox 380 x 56 (mobil) eller 840 x 56 (dator), aldrig skalad text.
 * x = 16 + (nivå - 1) x 38,667 mobil, x 89,78 dator. Spår i väggens kant,
 * fylld del i kopparns toning, tio streck (1, 5 och 10 större), du som
 * kopparpunkt med väggens färg runt, startpunkten ihålig i vagg-mjuk,
 * siktet som triangel i --ljus ovanför.
 *
 * Server component.
 */

export interface NivaskalaProps {
  nu: number
  /** Mätningens nivå, ihålig ring. */
  fran?: number | null
  sikte?: number | null
  /** "Du 6,4" | "Nu 5,6" | "Du" */
  etikettNu: string
  /** Axeltext under ringen: "5 · mätningen" | "från 5,4" */
  etikettFran?: string | null
  bredd: 'mobil' | 'dator'
  ariaLabel: string
  idPrefix?: string
  className?: string
}

function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1).replace('.', ',')
}

export default function Nivaskala({ nu, fran, sikte, etikettNu, etikettFran, bredd, ariaLabel, idPrefix, className }: NivaskalaProps) {
  const dator = bredd === 'dator'
  const W = dator ? 840 : 380
  const steg = dator ? 89.78 : 38.667
  const x = (n: number) => Math.round((16 + (Math.min(10, Math.max(1, n)) - 1) * steg) * 10) / 10
  const id = `${idPrefix ?? 'skala'}-${bredd}`
  const slut = x(10)
  return (
    <svg viewBox={`0 0 ${W} 56`} role="img" aria-label={ariaLabel} className={`skala block h-auto w-full overflow-visible ${className ?? ''}`}>
      <defs>
        <linearGradient id={`${id}-koppar-h`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C4621F" />
          <stop offset="1" stopColor="#F4B98A" />
        </linearGradient>
      </defs>
      <line x1="16" x2={slut} y1="28" y2="28" stroke="var(--vagg-kant)" strokeWidth="6" strokeLinecap="round" />
      <line x1="16" x2={x(nu)} y1="28" y2="28" stroke={`url(#${id}-koppar-h)`} strokeWidth="6" strokeLinecap="round" />
      {Array.from({ length: 10 }, (_, i) => {
        const stor = i === 0 || i === 4 || i === 9
        const tx = x(i + 1)
        return (
          <line
            key={i}
            x1={tx}
            x2={tx}
            y1={stor ? 22 : 24}
            y2={stor ? 34 : 32}
            stroke={stor ? 'var(--vagg-mjuk)' : 'var(--vagg-svag)'}
            strokeWidth={stor ? 1.5 : 1}
          />
        )
      })}
      {fran != null ? <circle cx={x(fran)} cy="28" r="5" fill="none" stroke="var(--vagg-mjuk)" strokeWidth="1.5" /> : null}
      {sikte != null ? <path d={`M${x(sikte)} 15l-5-8h10z`} fill="var(--ljus)" /> : null}
      <circle cx={x(nu)} cy="28" r="7" fill="var(--koppar)" stroke="var(--vagg)" strokeWidth="3" />
      <text className="lbl k" x={x(nu) - 4} y="12" textAnchor="end">
        {etikettNu}
      </text>
      {sikte != null ? (
        <text className="lbl soft sikte" x={Math.max(x(nu), x(sikte)) + 11} y="12" textAnchor="start">
          {`Sikte ${fmt(sikte)}`}
        </text>
      ) : null}
      <text className="ax" x="16" y="50" textAnchor="middle">
        1
      </text>
      {fran != null && etikettFran ? (
        <text className="ax" x={x(fran)} y="50" textAnchor="middle">
          {etikettFran}
        </text>
      ) : (
        <text className="ax" x={x(5)} y="50" textAnchor="middle">
          5
        </text>
      )}
      <text className="ax" x={slut} y="50" textAnchor="middle">
        10
      </text>
    </svg>
  )
}
