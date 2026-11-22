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
  alt,
  className = '',
}: {
  /** Mallens id i katalogen (linne, bjork, koppar ...). */
  id: string
  /** cv: /mallar/v2/<id>-liten|stor.webp. brev: /mallar/brev/<id>.webp. */
  typ?: 'cv' | 'brev'
  storlek?: 'liten' | 'stor'
  /** Namnet under bilden. */
  namn?: boolean
  /** Gratis eller Premium ur katalogen. 'gratis' visar chipet bara på gratismallarna. */
  chip?: boolean | 'gratis'
  /** Formatmärket "PDF · Word" eller "PDF" på bilden. */
  format?: boolean
  href?: string
  /** För en miniatyr som är sidans LCP: laddas direkt. */
  prioritet?: boolean
  /** Bildens alt. Standard "CV-mallen X" eller "Brevmallen X"; tom sträng för dekor. */
  alt?: string
  className?: string
}) {
  const kort = getMallKort(id)
  const bildAlt = alt ?? (kort ? `${typ === 'brev' ? 'Brevmallen' : 'CV-mallen'} ${kort.namn}` : '')
  const visaChip = chip === 'gratis' ? kort?.niva === 'gratis' : chip
  const src = typ === 'brev' ? brevMiniatyrSrc(id) : storlek === 'stor' ? mallBild(id).stor : mallBild(id).liten
  const [w, h] = typ === 'brev' ? [MINIATYR_BREDD, MINIATYR_HOJD] : storlek === 'stor' ? [300, 424] : [112, 158]
  const innehall = (
    <>
      <span className={`p3-mall-bild ${typ === 'brev' ? 'p3-brevmall' : ''}`.trim()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={bildAlt} width={w} height={h} loading={prioritet ? 'eager' : 'lazy'} decoding="async" />
        {format && kort ? <span className="p3-mall-format">{formatMarke(kort.word)}</span> : null}
      </span>
      {(namn || visaChip) && kort ? (
        <span className="p3-mall-rad">
          {namn ? <b>{kort.namn}</b> : null}
          {visaChip ? <Chip typ={kort.niva === 'gratis' ? 'gratis' : 'premium'}>{kort.niva === 'gratis' ? 'Gratis' : 'Premium'}</Chip> : null}
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
