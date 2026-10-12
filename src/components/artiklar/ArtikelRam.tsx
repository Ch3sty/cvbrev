/**
 * Artikelramen, publikt v2 (docs/design/spec-publikt-v2-del-b-2026-10-12.md,
 * avsnitt 3.1). Serverrenderad rakt igenom.
 *
 * Hjälten på klustrets vägg (ArtikelHjalte), läsningen på mark med
 * innehållsförteckningen (sida från 1024 px, dragspel på mobil) och
 * sidopaketet, brödtexten orörd i .artikel-prose, ämnena sist i spalten.
 * Efter läsningen slutkortet (PremiumBlock, kommer som prop) och Läs vidare
 * med relaterade, Verktyg och Mest lästa.
 *
 * SEO-spärren: h1, rubrikernas text och id, alla interna länkar,
 * författarens namn som h3 och författarbilden som första bild är
 * oförändrade. Reklamkortens rubriker är inte rubrikelement.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { Author } from '@/lib/authors'
import type { Heading } from '@/lib/extractHeadings'
import type { ArtikelPaket, CtaCluster } from '@/lib/cta/clusters'
import PubliktSida from '@/components/publikt/PubliktSida'
import Rum from '@/components/publikt/Rum'
import ArtikelHjalte from '@/components/publikt/innehall/ArtikelHjalte'
import Innehall from '@/components/publikt/innehall/Innehall'
import LasVidare from '@/components/publikt/innehall/LasVidare'
import type { ArtikelKortData } from '@/components/publikt/innehall/ArtikelKort'
import { KLUSTER_ETIKETT, KLUSTER_RUM } from '@/components/publikt/innehall/artikel-kluster'
import { SidoPaketKort } from './reklam/ArtikelReklam'
import ArtikelKlient from './ArtikelKlient'

export type RelateradArtikel = ArtikelKortData

/** De mest lästa guiderna. Stod förut som kort i footern (analysen 22 september, avsnitt 5). */
export const MEST_LASTA: readonly { title: string; href: string }[] = [
  { title: 'Styrkor och svagheter på intervjun', href: '/artiklar/styrkor-svagheter-intervju' },
  { title: 'Bild i CV:t, ja eller nej?', href: '/artiklar/bild-i-cv-ja-eller-nej' },
  { title: 'STAR-metoden på intervjun', href: '/artiklar/kompetensbaserad-intervju-star-metoden' },
  { title: 'Personligt brev på engelska', href: '/artiklar/personligt-brev-pa-engelska' },
  { title: 'Hur ska ett CV se ut?', href: '/artiklar/hur-ska-ett-cv-se-ut' },
  { title: 'Skriva personligt brev, hela guiden', href: '/artiklar/skriva-personligt-brev-guide' },
  { title: 'Cover letter i Sverige', href: '/artiklar/cover-letter-sverige' },
  { title: 'Så avslutar du ett personligt brev', href: '/artiklar/personligt-brev-avslutning-exempel' },
]

/** Verktygslänkarna. Intern länkkraft till landningssidorna; rekryteringstesterna först. */
const VERKTYG = [
  { label: 'Rekryteringstester', href: '/verktyg/rekryteringstester' },
  { label: 'CV-analys', href: '/verktyg/cv-analys' },
  { label: 'CV-mallar', href: '/verktyg/cv-mallar' },
  { label: 'Personligt brev', href: '/skapa-brev/start' },
  { label: 'Jobbmatchning', href: '/verktyg/jobbmatchning' },
] as const

export const datumText = (d: string) => format(parseISO(d), 'd MMMM yyyy', { locale: sv })

interface ArtikelRamProps {
  slug: string
  title: string
  description?: string
  date: string
  tags?: string[]
  readingTime: number
  author: Author
  headings: Heading[]
  cluster: CtaCluster
  paket: ArtikelPaket | null
  relaterade: RelateradArtikel[]
  /** Hjältens knapp, eller null (karriär utan produkt). */
  primar: { text: string; href: string } | null
  /** Artikelbilden i hjälten. */
  bild: { src: string; alt: string } | null
  /** Brödtexten (MDX), och gratiskortet sist för artiklar utan produkt. */
  children: ReactNode
  /** Slutkortet i bläck efter läsningen. */
  slut?: ReactNode
  /** Mobilens klistrade knapp, renderas utanför kolumnerna. */
  sticky?: ReactNode
}

export default function ArtikelRam({
  slug,
  title,
  description,
  date,
  tags,
  readingTime,
  author,
  headings,
  cluster,
  paket,
  relaterade,
  primar,
  bild,
  children,
  slut,
  sticky,
}: ArtikelRamProps) {
  const rum = KLUSTER_RUM[cluster]
  const guider = MEST_LASTA.filter((g) => g.href !== `/artiklar/${slug}`).slice(0, 6)

  return (
    <PubliktSida>
      <ArtikelHjalte
        rum={rum}
        kategori={KLUSTER_ETIKETT[cluster]}
        titel={title}
        ingress={description}
        primar={primar}
        lasGuiden={headings[0]?.id}
        forfattare={author}
        datum={date}
        datumText={datumText(date)}
        lasminuter={readingTime}
        bild={bild}
      />

      <Rum yta="mark" rum={rum} className="ib-lasning">
        <div className="pub-wrap ib-ram">
          <article className="ib-brod-kol">
            <Innehall headings={headings} variant="mobil" />
            <div className="article-content prose artikel-prose max-w-none">{children}</div>

            {/* Ämnena: interna länkar till filtervyerna. */}
            {tags && tags.length > 0 ? (
              <div className="ib-amnen">
                <p className="ib-sidorub">Ämnen</p>
                <ul className="ib-chips">
                  {tags.map((tag) => (
                    <li key={tag}>
                      <Link href={`/artiklar?tag=${tag}`}>{tag}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>

          <aside className="ib-sido" aria-label="Innehåll och paketet">
            <Innehall headings={headings} variant="sido" />
            {paket ? <SidoPaketKort paket={paket} cluster={cluster} slug={slug} /> : null}
          </aside>
        </div>
      </Rum>

      {slut}

      <LasVidare relaterade={relaterade} verktyg={VERKTYG} mestLasta={guider} />

      {sticky}
      <ArtikelKlient slug={slug} cluster={cluster} />
    </PubliktSida>
  )
}
