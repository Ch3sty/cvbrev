/**
 * Exempelsidans hjälte (spec-publikt-v2 del B 3.3, rad 1): brödsmula, kick,
 * h1 (yrket, oförändrat), intro, "Använd som mall", tre bevis och ett utdrag
 * ur papperet snett till höger med en eller två lappar. Väggen i CV- eller
 * brevrummet, vågen ner mot papperet.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import Rum from '../../Rum'
import Smula from '../Smula'
import type { Not } from './exempel-data'

export default function ExempelHjalte({
  typ,
  yrke,
  intro,
  primar,
  bevis,
  utdrag,
  lappar,
}: {
  typ: 'cv' | 'brev'
  yrke: string
  intro?: string
  primar: { text: string; href: string }
  bevis: string[]
  utdrag: ReactNode
  lappar: Not[]
}) {
  const hubb = typ === 'cv' ? { namn: 'CV-exempel', href: '/cv-exempel' } : { namn: 'Personligt brev-exempel', href: '/personligt-brev-exempel' }
  return (
    <Rum rum={typ} yta="vagg" id="hjalte" vag="mark" className="ib-hjalte ib-ex-hjalte">
      <div className="pub-wrap ib-hjalte-g">
        <div>
          <Smula steg={[{ namn: 'Hem', href: '/' }, { namn: 'Exempel', href: '/exempel' }, hubb, { namn: yrke }]} />
          <p className="pub-kick">{typ === 'cv' ? 'CV-exempel' : 'Personligt brev-exempel'}</p>
          <h1 className="ib-h1-stor">{yrke}</h1>
          {intro ? <p className="pub-ingress">{intro}</p> : null}
          <div className="pub-handling">
            <Link className="pub-knapp" href={primar.href} data-primar="">
              {primar.text}
            </Link>
            <a className="pub-lank" href="#exemplet">
              Se exemplet
            </a>
          </div>
          <ul className="ib-bevis">
            {bevis.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="ib-ex-bild" aria-hidden="true">
          {utdrag}
          {lappar.slice(0, 2).map((l, i) => (
            <div key={i} className={i === 0 ? 'ib-ex-lapp' : 'ib-ex-lapp ib-ex-lapp-2'}>
              <i>{l.nr ?? '✓'}</i>
              <b>{l.rubrik}</b>
              {l.text ? <span>{l.text}</span> : null}
            </div>
          ))}
        </div>
      </div>
    </Rum>
  )
}
