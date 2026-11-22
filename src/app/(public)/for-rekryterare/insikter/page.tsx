/**
 * /for-rekryterare/insikter, publikt omgång 3: grundens skal (BYGGBRIEF
 * beslut 10). Hjälten på väggen med den gamla brödsmulan (som bär
 * BreadcrumbList-schemat), insikterna som papperskort på golvet och
 * rekryterarrutan sist. Rubrikerna (h1, en h2 per insikt, InsiktCTA:s h3),
 * texterna, länkarna och ItemList-schemat är desamma som förut.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'
import { getAllInsikterMeta } from '@/lib/blog'
import Breadcrumb from '@/components/Breadcrumb'
import InsiktCTA from '@/components/mdx/InsiktCTA'
import { Sida, Sektion, Rutnat } from '@/components/publikt/v3'
import './insikter.css'

export const metadata: Metadata = {
  title: 'Insikter för rekryterare: urval, kostnader och regelverk | Jobbcoach.ai',
  description:
    'Insikter för dig som rekryterar: vad felrekryteringar kostar, vad urvalsforskningen visar, anonymiserad screening och regelverken som styr. Med namngivna källor.',
  alternates: { canonical: 'https://www.jobbcoach.ai/for-rekryterare/insikter' },
  robots: { index: true, follow: true },
}

export default function InsikterHub() {
  const insikter = getAllInsikterMeta()

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Insikter för rekryterare',
    itemListElement: insikter.map((i, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: i.title,
      url: `https://www.jobbcoach.ai/for-rekryterare/insikter/${i.slug}`,
    })),
  }

  return (
    <Sida farg="jobb">
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
        <section className="p3-vagg p3-hjalte p3-utan-lyft">
          <div className="p3-bredd">
            <div className="ins-smula">
              <Breadcrumb
                items={[
                  { name: 'Hem', href: '/' },
                  { name: 'För rekryterare', href: '/for-rekryterare' },
                  { name: 'Insikter', href: '/for-rekryterare/insikter' },
                ]}
              />
            </div>
            <header className="ins-huvud">
              <p className="p3-ey">För rekryterare</p>
              <h1 className="p3-h1">Insikter</h1>
              <p className="p3-varde">
                Urvalsforskning, kostnadskalkyler och regelverk för dig som rekryterar. Varje insikt bygger på namngivna källor, inga
                tyckanden utan täckning.
              </p>
            </header>
          </div>
        </section>

        <Sektion>
          <Rutnat kolumner={2}>
            {insikter.map((insikt) => (
              <Link key={insikt.slug} href={`/for-rekryterare/insikter/${insikt.slug}`} className="p3-kort ins-kort">
                {insikt.image && (
                  <div className="ins-kort-bild">
                    <Image src={insikt.image} alt={insikt.title} fill sizes="(max-width: 700px) 100vw, 50vw" className="object-cover" />
                  </div>
                )}
                <div className="ins-kort-text">
                  <p className="ins-datum">
                    {format(parseISO(insikt.date), 'd MMMM yyyy', { locale: sv })}
                    {insikt.wordCount ? ` · ${Math.max(2, Math.round(insikt.wordCount / 200))} min läsning` : ''}
                  </p>
                  <h2 className="p3-h3">{insikt.title}</h2>
                  <p>{insikt.description}</p>
                </div>
              </Link>
            ))}
          </Rutnat>
          <InsiktCTA />
        </Sektion>
      </main>
    </Sida>
  )
}
