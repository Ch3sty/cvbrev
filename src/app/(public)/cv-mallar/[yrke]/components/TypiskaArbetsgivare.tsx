/**
 * Typiska arbetsgivare på yrkesmallsidan, i publikt omgång 3. Rubrikerna
 * (h3) och exemplen som förut. Serverkomponent.
 */
import { Kort, Rutnat } from '@/components/publikt/v3'

interface Grupp {
  kategori: string
  exempel: string[]
}

export default function TypiskaArbetsgivare({ grupper }: { grupper: Grupp[] }) {
  return (
    <Rutnat kolumner={3}>
      {grupper.map((g, idx) => (
        <Kort key={idx} ton>
          <h3 className="p3-h3">{g.kategori}</h3>
          <ul className="cvy-punkter">
            {g.exempel.map((e, eIdx) => (
              <li key={eIdx}>{e}</li>
            ))}
          </ul>
        </Kort>
      ))}
    </Rutnat>
  )
}
