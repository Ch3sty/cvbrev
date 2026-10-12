/**
 * Artikelns hjälte (spec-publikt-v2 del B 3.1, rad 1): brödsmula, klustrets
 * etikett, h1, ingress, en knapp och "Läs guiden", författarraden och
 * artikelbilden snett till höger (under texten på mobil). Väggen i
 * klustrets rum, vågen ner mot läsningen.
 *
 * SEO: h1 är frontmatter.title. Författarens namn står kvar som h3 och
 * författarbilden är fortfarande sidans första bild, som i dag
 * (ägarbeslut 5). Artikelbilden har samma src och alt som i MDX, mått
 * 1536 × 1024 och priority, så att den är LCP på dator som förut.
 */

import Image from 'next/image'
import Link from 'next/link'
import type { Author } from '@/lib/authors'
import Rum from '../Rum'
import type { RumNamn } from '../telefon/Telefon'
import Smula from './Smula'

export default function ArtikelHjalte({
  rum,
  kategori,
  titel,
  ingress,
  primar,
  lasGuiden,
  forfattare,
  datum,
  datumText,
  lasminuter,
  bild,
}: {
  rum: RumNamn
  kategori: string
  titel: string
  ingress?: string
  primar: { text: string; href: string } | null
  /** Id på första rubriken i texten. */
  lasGuiden?: string
  forfattare: Author
  datum: string
  datumText: string
  lasminuter: number
  bild: { src: string; alt: string } | null
}) {
  return (
    <Rum rum={rum} yta="vagg" id="artikel-hjalte" vag="mark" className="ib-hjalte">
      <div className="pub-wrap ib-hjalte-g">
        <div>
          <Smula
            steg={[
              { namn: 'Hem', href: '/' },
              { namn: 'Artiklar', href: '/artiklar' },
              { namn: titel },
            ]}
          />
          <p className="pub-kick">{kategori}</p>
          <h1 className="ib-h1">{titel}</h1>
          {ingress ? <p className="pub-ingress">{ingress}</p> : null}
          {primar || lasGuiden ? (
            <div className="pub-handling">
              {primar ? (
                <Link className="pub-knapp" href={primar.href} data-primar="" data-cta-klick={primar.href}>
                  {primar.text}
                </Link>
              ) : null}
              {lasGuiden ? (
                <a className="pub-lank" href={`#${lasGuiden}`}>
                  Läs guiden
                </a>
              ) : null}
            </div>
          ) : null}
          <div className="ib-forf">
            <Image
              src={forfattare.image}
              alt={`${forfattare.name} - ${forfattare.title}`}
              width={40}
              height={40}
              priority
            />
            <div>
              <h3>{forfattare.name}</h3>
              <p>{forfattare.title}. Granskad av HR-experter.</p>
              <ul className="ib-meta">
                <li>
                  <time dateTime={datum}>{datumText}</time>
                </li>
                <li>{lasminuter} min läsning</li>
              </ul>
            </div>
          </div>
        </div>
        {bild ? (
          <figure className="ib-bild-ram">
            <div className="ib-bild">
              <Image
                src={bild.src}
                alt={bild.alt}
                width={1536}
                height={1024}
                priority
                sizes="(min-width: 1120px) 470px, (min-width: 960px) 40vw, (min-width: 560px) 520px, 100vw"
              />
            </div>
          </figure>
        ) : null}
      </div>
    </Rum>
  )
}
