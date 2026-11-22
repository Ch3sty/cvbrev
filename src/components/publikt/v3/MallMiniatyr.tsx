/**
 * Mallminiatyren: den riktiga bilden av en CV- eller brevmall ur public/
 * (aldrig grå streck när bilden finns), med klack, formatmärke, namn och
 * chip Gratis eller Premium ur katalogen. Fasta mått i HTML, så CLS är 0.
 */

import Link from 'next/link'
import { getMallKort, mallBild } from '@/lib/cv/mallar/katalog'
import { MINIATYR_BREDD, MINIATYR_HOJD, brevMiniatyrSrc, formatMarke } from '../brevmallar'
import { Chip } from './Bitar'

export function MallMiniatyr({
  id,
  typ = 'cv',
  storlek = 'liten',
  namn = true,
  chip = true,
  format = false,
  href,
  prioritet,
  className = '',
}: {
  /** Mallens id i katalogen (linne, bjork, koppar ...). */
  id: string
  /** cv: /mallar/v2/<id>-liten|stor.webp. brev: /mallar/brev/<id>.webp. */
  typ?: 'cv' | 'brev'
  storlek?: 'liten' | 'stor'
  /** Namnet under bilden. */
  namn?: boolean
  /** Gratis eller Premium ur katalogen. */
  chip?: boolean
  /** Formatmärket "PDF · Word" eller "PDF" på bilden. */
  format?: boolean
  href?: string
  /** För en miniatyr som är sidans LCP: laddas direkt. */
  prioritet?: boolean
  className?: string
}) {
  const kort = getMallKort(id)
  const src = typ === 'brev' ? brevMiniatyrSrc(id) : storlek === 'stor' ? mallBild(id).stor : mallBild(id).liten
  const [w, h] = typ === 'brev' ? [MINIATYR_BREDD, MINIATYR_HOJD] : storlek === 'stor' ? [300, 424] : [112, 158]
  const innehall = (
    <>
      <span className={`p3-mall-bild ${typ === 'brev' ? 'p3-brevmall' : ''}`.trim()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={kort ? `Mallen ${kort.namn}` : ''} width={w} height={h} loading={prioritet ? 'eager' : 'lazy'} decoding="async" />
        {format && kort ? <span className="p3-mall-format">{formatMarke(kort.word)}</span> : null}
      </span>
      {(namn || chip) && kort ? (
        <span className="p3-mall-rad">
          {namn ? <b>{kort.namn}</b> : null}
          {chip ? <Chip typ={kort.niva === 'gratis' ? 'gratis' : 'premium'}>{kort.niva === 'gratis' ? 'Gratis' : 'Premium'}</Chip> : null}
        </span>
      ) : null}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={`p3-mall ${className}`.trim()}>
        {innehall}
      </Link>
    )
  }
  return <div className={`p3-mall ${className}`.trim()}>{innehall}</div>
}
