/**
 * "Så bygger du ett starkt ...-CV" på yrkesmallsidan, i publikt omgång 3:
 * grundens kort i ett rutnät. Rubrikerna (h3) och texten som förut.
 * Serverkomponent.
 */
import { Kort, Rutnat } from '@/components/publikt/v3'

interface Punkt {
  icon: string
  title: string
  description: string
}

export default function ViktigtPunkter({ punkter }: { punkter: Punkt[] }) {
  return (
    <Rutnat kolumner={3}>
      {punkter.map((p, idx) => (
        <Kort key={idx}>
          <h3 className="p3-h3">{p.title}</h3>
          <p>{p.description}</p>
        </Kort>
      ))}
    </Rutnat>
  )
}
