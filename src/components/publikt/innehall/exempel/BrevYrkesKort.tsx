/**
 * Yrkeskorten för brevexemplen i publikt omgång 3 (skissen brev-exempelnav,
 * delar/brev-exempelnav-yrken.html): en brevminiatyr, branschen, yrket som
 * h3 och kortets rad. Används i navet, på kategorisidorna och under "Fler
 * personliga brev-exempel". Hela kortet är länken. Serverkomponent.
 *
 * SEO:s besked 14: en gemensam Linne-miniatyr med tomt alt (dekor) på alla
 * kort, inte en bild per yrke. Yrket som h3 och raden står kvar.
 */

import Link from 'next/link'
import { MINIATYR_BREDD, MINIATYR_HOJD, brevMiniatyrSrc } from '@/components/publikt/brevmallar'

export interface BrevYrkesKortData {
  yrke: string
  slug: string
  kategori?: string
  kategoriNamn?: string
  text?: string
}

const MINIATYR = brevMiniatyrSrc('linne')

export default function BrevYrkesKort({
  yrken,
  id,
  className = '',
}: {
  yrken: readonly BrevYrkesKortData[]
  id?: string
  className?: string
}) {
  return (
    <ul className={`bx-yk ${className}`.trim()} id={id}>
      {yrken.map((y) => (
        <li key={y.slug} data-yrke={`${y.yrke} ${y.slug}`.toLowerCase()}>
          <Link href={`/personligt-brev-exempel/${y.slug}`}>
            <span className="bx-yk-bild">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MINIATYR} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} loading="lazy" decoding="async" />
            </span>
            <span className="bx-yk-text">
              {y.kategoriNamn ? <small>{y.kategoriNamn}</small> : null}
              <h3>{y.yrke}</h3>
              <span>{y.text ?? 'Se brevexempel'}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
