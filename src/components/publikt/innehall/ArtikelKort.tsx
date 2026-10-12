/**
 * Ett artikelkort med tumnagel (spec-publikt-v2 del B 2.2): i Läs vidare
 * och i arkivet. I arkivet behåller kortet sin h2 (rubrik="h2"); i Läs
 * vidare är rubriken fet text, så att artikelns rubrikträd är oförändrat.
 * Tumnageln är frontmatter.image, lazy med sizes, alt tom (titeln står
 * bredvid).
 */

import Image from 'next/image'
import Link from 'next/link'

export interface ArtikelKortData {
  slug: string
  titel: string
  ingress?: string
  kategori?: string
  datum?: string
  datumText?: string
  lasminuter?: number
  bild?: string
}

export default function ArtikelKort({
  artikel,
  rubrik = 'b',
  stor = false,
  forsta = false,
}: {
  artikel: ArtikelKortData
  rubrik?: 'h2' | 'b'
  stor?: boolean
  /** Första kortet i arkivet laddas direkt. */
  forsta?: boolean
}) {
  const Rubrik = rubrik === 'h2' ? 'h2' : 'b'
  return (
    <li className={stor ? 'stor' : undefined}>
      <Link href={`/artiklar/${artikel.slug}`}>
        <span className="ib-tumme">
          {artikel.bild ? (
            <Image
              src={artikel.bild}
              alt=""
              width={1536}
              height={1024}
              sizes={stor ? '(min-width: 1120px) 600px, (min-width: 760px) 55vw, 100vw' : '(min-width: 1120px) 360px, (min-width: 760px) 33vw, 100vw'}
              loading={forsta ? undefined : 'lazy'}
              priority={forsta}
            />
          ) : null}
        </span>
        <div>
          {artikel.kategori ? <small>{artikel.kategori}</small> : null}
          <Rubrik className="ib-kort-h2">{artikel.titel}</Rubrik>
          {stor && artikel.ingress ? <p className="ib-kort-ingress">{artikel.ingress}</p> : null}
          <span>
            {artikel.datum && artikel.datumText ? (
              <>
                <time dateTime={artikel.datum}>{artikel.datumText}</time>
                {artikel.lasminuter ? `, ${artikel.lasminuter} min` : ''}
              </>
            ) : artikel.lasminuter ? (
              `${artikel.lasminuter} min`
            ) : null}
          </span>
        </div>
      </Link>
    </li>
  )
}
