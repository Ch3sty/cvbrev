/**
 * Artikelramen (docs/design/analys-artiklar-2026-09-23.html, avsnitt 5).
 *
 * Serverrenderad rakt igenom. Ersätter ArticleClientWrapper, som skickade
 * MDX-källan och 137 artiklars metadata som props till klienten.
 *
 * Huvudet på mark: brödsmulor, kategori som eyebrow, h1 i display,
 * ingressen (description), författaren som en rad med bild i 40. Sedan
 * brödtexten och slutkortet, ämnena (taggpillren) sist. Sidokolumnen till
 * höger från lg: innehållsförteckning med tråden, paketkortet, relaterade
 * artiklar, verktygen och de mest lästa guiderna. På mobil står
 * sidokolumnen efter artikeln utan innehållsförteckning och paketkort (där
 * bär slutkortet paketet).
 *
 * SEO-spärren: h1, rubrikernas text och id, alla interna länkar,
 * författarens namn som h3 och författarbilden som första bild är
 * oförändrade. Reklamkortens rubriker är inte rubrikelement.
 */

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { Author } from '@/lib/authors'
import type { Heading } from '@/lib/extractHeadings'
import type { ArtikelPaket, CtaCluster } from '@/lib/cta/clusters'
import { SidoPaketKort } from './reklam/ArtikelReklam'
import ArtikelKlient from './ArtikelKlient'

export interface RelateradArtikel {
  slug: string
  title: string
  date: string
  lasminuter: number
}

/** De mest lästa guiderna. Stod förut som kort i footern (analysen 22 september, avsnitt 5). */
export const MEST_LASTA: readonly { title: string; href: string }[] = [
  { title: 'Styrkor och svagheter på intervjun', href: '/artiklar/styrkor-svagheter-intervju' },
  { title: 'Bild i CV:t, ja eller nej?', href: '/artiklar/bild-i-cv-ja-eller-nej' },
  { title: 'STAR-metoden på intervjun', href: '/artiklar/kompetensbaserad-intervju-star-metoden' },
  { title: 'Personligt brev på engelska', href: '/artiklar/personligt-brev-pa-engelska' },
  { title: 'Hur ska ett CV se ut?', href: '/artiklar/hur-ska-ett-cv-se-ut' },
  { title: 'Skriva personligt brev, hela guiden', href: '/artiklar/skriva-personligt-brev-guide' },
  { title: 'Cover letter i Sverige', href: '/artiklar/cover-letter-sverige' },
  { title: 'Så avslutar du ett personligt brev', href: '/artiklar/hur-avslutar-man-personligt-brev' },
]

/** Verktygslänkarna i sidokolumnen. Intern länkkraft till landningssidorna; rörs inte. */
const VERKTYG = [
  { label: 'Rekryteringstester', href: '/verktyg/rekryteringstester' },
  { label: 'CV-analys', href: '/verktyg/cv-analys' },
  { label: 'CV-mallar', href: '/verktyg/cv-mallar' },
  { label: 'Personligt brev', href: '/skapa-brev/start' },
  { label: 'Jobbmatchning', href: '/verktyg/jobbmatchning' },
] as const

const LANK = 'text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

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
  /** Brödtexten (MDX) och slutkortet. */
  children: ReactNode
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
  children,
  sticky,
}: ArtikelRamProps) {
  const kategori = tags?.[0]
  const datum = format(parseISO(date), 'd MMMM yyyy', { locale: sv })
  const guider = MEST_LASTA.filter((g) => g.href !== `/artiklar/${slug}`).slice(0, 6)

  return (
    <div className="bg-mark">
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-10">
        {/* Huvudet på mark. */}
        <header className="max-w-[760px]">
          <nav aria-label="Brödsmulor">
            <ol className="flex min-w-0 items-center gap-2 whitespace-nowrap text-meta text-ink-3">
              <li className="shrink-0">
                <Link href="/" className="hover:text-ink-1">
                  Hem
                </Link>
              </li>
              <li aria-hidden="true">·</li>
              <li className="shrink-0">
                <Link href="/artiklar" className="hover:text-ink-1">
                  Artiklar
                </Link>
              </li>
              <li aria-hidden="true">·</li>
              <li className="min-w-0 truncate text-ink-2" aria-current="page">
                {title}
              </li>
            </ol>
          </nav>

          {kategori ? (
            <p className="mt-6 text-steg font-semibold uppercase text-ink-3">{kategori}</p>
          ) : null}
          <h1 className="mt-2 text-h1 text-ink-1 [overflow-wrap:anywhere]">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-[62ch] text-base leading-[27px] text-ink-2 lg:text-lg lg:leading-[29px]">
              {description}
            </p>
          ) : null}

          {/* Författaren som en rad (E-E-A-T): namn, titel, granskning,
              specialistområden, datum och lästid står kvar som text. */}
          <div className="mt-6 flex items-start gap-3 border-t border-kant pt-4">
            <Image
              src={author.image}
              alt={`${author.name} - ${author.title}`}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              priority
            />
            <div className="min-w-0 text-meta text-ink-3">
              <h3 className="text-sm font-semibold text-ink-1">{author.name}</h3>
              <p>
                {author.title} · Granskad av HR-experter · <time dateTime={date}>{datum}</time> ·{' '}
                {readingTime} min läsning
              </p>
              {author.expertise?.length ? (
                <p className="mt-0.5 hidden sm:block">Specialistområden: {author.expertise.join(', ')}</p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <article className="min-w-0 max-w-[720px]">
            <div className="article-content prose artikel-prose max-w-none">{children}</div>

            {/* Ämnena: interna länkar till filtervyerna, flyttade från huvudet
                så att huvudet inte blir tre skärmhöjder på mobil. */}
            {tags && tags.length > 0 ? (
              <div className="not-prose mt-12 border-t border-kant pt-6">
                <p className="text-steg uppercase text-ink-3">Ämnen</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`/artiklar?tag=${tag}`}
                        className="inline-flex min-h-11 items-center rounded-md border border-kant bg-panel px-3 text-sm text-ink-2 transition-colors hover:border-kant-stark hover:text-ink-1"
                      >
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="not-prose mt-12 grid gap-8 border-t border-kant pt-6 sm:grid-cols-2 lg:grid-cols-3">
            {relaterade.length > 0 ? (
              <section aria-label="Relaterade artiklar">
                <p className="text-steg uppercase text-ink-3">Relaterade artiklar</p>
                <ul className="mt-3 divide-y divide-kant border-y border-kant">
                  {relaterade.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/artiklar/${r.slug}`} className="group block py-3">
                        <span className="block text-sm font-semibold leading-5 text-ink-1 group-hover:underline group-hover:decoration-kant-stark group-hover:underline-offset-4">
                          {r.title}
                        </span>
                        <span className="mt-0.5 block text-meta text-ink-3">{r.lasminuter} min</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/artiklar" className={`mt-3 inline-flex min-h-11 items-center text-sm font-medium ${LANK}`}>
                  Visa alla artiklar
                </Link>
              </section>
            ) : null}

            <section aria-label="Verktyg">
              <p className="text-steg uppercase text-ink-3">Verktyg</p>
              <ul className="mt-2">
                {VERKTYG.map((v) => (
                  <li key={v.href}>
                    <Link href={v.href} className="inline-flex min-h-10 items-center text-sm text-ink-2 hover:text-ink-1">
                      {v.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {guider.length > 0 ? (
              <section aria-label="Mest lästa guider">
                <p className="text-steg uppercase text-ink-3">Mest lästa</p>
                <ul className="mt-2">
                  {guider.map((g) => (
                    <li key={g.href}>
                      <Link href={g.href} className="inline-flex min-h-10 items-center text-sm text-ink-2 hover:text-ink-1">
                        {g.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            </div>
          </article>

          <aside className="hidden min-w-0 space-y-8 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-112px)] lg:self-start lg:overflow-y-auto" aria-label="Innehåll och paketet">
            {headings.length > 0 ? (
              <nav data-toc aria-label="Innehåll">
                <p className="text-steg uppercase text-ink-3">Innehåll</p>
                <ol className="mt-3 border-l border-kant">
                  {headings.map((h, i) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        aria-current={i === 0 ? 'location' : undefined}
                        className={`block py-1.5 pl-4 text-sm leading-5 text-ink-2 transition-colors hover:text-ink-1 ${
                          i === 0 ? 'toc-aktiv' : ''
                        }`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            {paket ? (
              <div>
                <SidoPaketKort paket={paket} cluster={cluster} slug={slug} />
              </div>
            ) : null}

          </aside>
        </div>
      </div>

      {sticky}
      <ArtikelKlient slug={slug} cluster={cluster} />
    </div>
  )
}
