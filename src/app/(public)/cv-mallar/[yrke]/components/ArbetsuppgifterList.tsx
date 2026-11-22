/**
 * Vanliga arbetsuppgifter på yrkesmallsidan, i publikt omgång 3. Numret,
 * rubriken (h3) och punkterna som förut. Serverkomponent.
 */
import { Kort, Rutnat } from '@/components/publikt/v3'

interface Grupp {
  rubrik: string
  punkter: string[]
}

export default function ArbetsuppgifterList({ grupper }: { grupper: Grupp[] }) {
  return (
    <Rutnat kolumner={2}>
      {grupper.map((g, idx) => (
        <Kort key={idx}>
          <p className="p3-ey">{String(idx + 1).padStart(2, '0')}</p>
          <h3 className="p3-h3">{g.rubrik}</h3>
          <ul className="cvy-punkter">
            {g.punkter.map((p, pIdx) => (
              <li key={pIdx}>{p}</li>
            ))}
          </ul>
        </Kort>
      ))}
    </Rutnat>
  )
}
