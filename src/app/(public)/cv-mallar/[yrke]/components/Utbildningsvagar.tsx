/**
 * Hur du blir ... på yrkesmallsidan, i publikt omgång 3. Rubrikerna (h3)
 * och texten som förut. Serverkomponent.
 */
import { Kort, Rutnat } from '@/components/publikt/v3'

interface Vag {
  rubrik: string
  beskrivning: string
}

export default function Utbildningsvagar({ vagar }: { vagar: Vag[] }) {
  return (
    <Rutnat kolumner={2}>
      {vagar.map((v, idx) => (
        <Kort key={idx}>
          <h3 className="p3-h3">{v.rubrik}</h3>
          <p>{v.beskrivning}</p>
        </Kort>
      ))}
    </Rutnat>
  )
}
