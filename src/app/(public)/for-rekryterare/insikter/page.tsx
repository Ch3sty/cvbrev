import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'
import { getAllInsikterMeta } from '@/lib/blog'
import Breadcrumb from '@/components/Breadcrumb'
import InsiktCTA from '@/components/mdx/InsiktCTA'

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
    <main className="bg-orange-50/30 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'För rekryterare', href: '/for-rekryterare' },
            { name: 'Insikter', href: '/for-rekryterare/insikter' },
          ]}
        />

        <header className="mt-6 mb-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-3">
            För rekryterare
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.08] mb-4">
            Insikter
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Urvalsforskning, kostnadskalkyler och regelverk för dig som rekryterar. Varje
            insikt bygger på namngivna källor, inga tyckanden utan täckning.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {insikter.map((insikt) => (
            <Link
              key={insikt.slug}
              href={`/for-rekryterare/insikter/${insikt.slug}`}
              className="group bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {insikt.image && (
                <div className="relative aspect-[3/2] bg-orange-50">
                  <Image
                    src={insikt.image}
                    alt={insikt.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <p className="text-xs text-slate-400 mb-2">
                  {format(parseISO(insikt.date), 'd MMMM yyyy', { locale: sv })}
                  {insikt.wordCount ? ` · ${Math.max(2, Math.round(insikt.wordCount / 200))} min läsning` : ''}
                </p>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug mb-2 group-hover:text-orange-700 transition-colors">
                  {insikt.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {insikt.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <InsiktCTA />
        </div>
      </div>
    </main>
  )
}
