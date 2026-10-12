/**
 * Yrkeskorten (spec-publikt-v2 del B 2.2): miniatyrpapper, branschen i
 * rummets färg, yrket som h3 och en rad. Används i Fler yrken och för alla
 * 89 kort i hubbarna. Hela kortet är länken.
 */

import Link from 'next/link'
import { kategoriRum } from './exempel-data'

export interface YrkesKortData {
  yrke: string
  slug: string
  kategori?: string
  kategoriNamn?: string
  text?: string
}

export function MiniPapper() {
  return (
    <span className="ib-minipapper" aria-hidden="true">
      <i className="n" />
      <i />
      <i className="k" />
      <i />
      <i />
      <i className="k" />
      <i />
    </span>
  )
}

export default function YrkesKort({
  yrken,
  typ,
  id,
}: {
  yrken: YrkesKortData[]
  typ: 'cv' | 'brev'
  id?: string
}) {
  const bas = typ === 'cv' ? '/cv-exempel' : '/personligt-brev-exempel'
  const se = typ === 'cv' ? 'Se CV-exempel' : 'Se brevexempel'
  return (
    <ul className="ib-yrke" id={id}>
      {yrken.map((y) => (
        <li key={y.slug} className={`pub-rum-${kategoriRum(y.kategori)}`} data-yrke={`${y.yrke} ${y.slug}`.toLowerCase()}>
          <Link href={`${bas}/${y.slug}`}>
            <MiniPapper />
            <div>
              {y.kategoriNamn ? <small>{y.kategoriNamn}</small> : null}
              <h3>{y.yrke}</h3>
              <span>{y.text ?? se}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
