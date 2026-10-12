/**
 * Ett huvudtal med en kort text och, om det behövs, en stapel med två
 * etiketter (spec-publikt-v2 del B 2.2). Talet skrivs av anroparen ur en
 * konstant eller en uträkning, aldrig som fast sträng. Används på bläck och
 * vägg.
 */

export default function Huvudtal({
  tal,
  text,
  stapel,
}: {
  tal: string
  text: string
  stapel?: { andel: number; etiketter: [string, string] }
}) {
  const andel = stapel ? Math.max(0, Math.min(1, stapel.andel)) : 0
  return (
    <div className="ib-huvudtal">
      <b>{tal}</b>
      <span>{text}</span>
      {stapel ? (
        <div className="ib-stapel" aria-hidden="true">
          <div className="ib-stapel-rad">
            <i style={{ width: `${(andel * 100).toFixed(1)}%` }} />
          </div>
          <div className="ib-stapel-etiketter">
            <span>{stapel.etiketter[0]}</span>
            <span>{stapel.etiketter[1]}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
