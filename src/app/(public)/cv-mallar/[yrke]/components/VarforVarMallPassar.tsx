/**
 * Så har vi byggt mallarna för ... på yrkesmallsidan, i publikt omgång 3.
 * Numret, rubriken (h3) och texten som förut. Serverkomponent.
 */
import { Kort, Rutnat } from '@/components/publikt/v3'

interface Punkt {
  title: string
  description: string
}

export default function VarforVarMallPassar({ punkter, yrkesNamn }: { punkter: Punkt[]; yrkesNamn: string }) {
  void yrkesNamn
  return (
    <Rutnat kolumner={3}>
      {punkter.map((p, idx) => (
        <Kort key={idx}>
          <p className="p3-ey">{String(idx + 1).padStart(2, '0')}</p>
          <h3 className="p3-h3">{p.title}</h3>
          <p>{p.description}</p>
        </Kort>
      ))}
    </Rutnat>
  )
}
