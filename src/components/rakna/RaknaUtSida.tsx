import type { ReactNode } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'

/**
 * Delad sidlayout för verktygssidorna under /rakna-ut: breadcrumb, rubrik,
 * verktyget, metodsektion, synlig FAQ + FAQPage/WebApplication-schema,
 * källor och relaterade länkar.
 */

type FaqPost = { q: string; a: string }
type LankPost = { text: string; href: string }

type Props = {
  slug: string
  titel: string
  intro: string
  children: ReactNode
  metod: ReactNode
  faq: FaqPost[]
  kallor: LankPost[]
  relaterade: LankPost[]
}

export default function RaknaUtSida({ slug, titel, intro, children, metod, faq, kallor, relaterade }: Props) {
  const url = `https://www.jobbcoach.ai/rakna-ut/${slug}`

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: titel,
    description: intro,
    url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'SEK' },
    publisher: { '@type': 'Organization', name: 'Jobbcoach.ai', url: 'https://www.jobbcoach.ai' },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'Räkna ut', href: '/rakna-ut' },
            { name: titel, href: `/rakna-ut/${slug}` },
          ]}
        />

        <header className="mt-6 mb-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-3">Räkna ut</p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">{titel}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{intro}</p>
        </header>

        {children}

        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Så räknar vi</h2>
          <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-orange-700 prose-a:font-semibold prose-strong:text-slate-900 prose-li:leading-relaxed">
            {metod}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Vanliga frågor</h2>
          <div className="space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-900 list-none flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-orange-600 transition-transform group-open:rotate-45 text-lg leading-none">+</span>
                </summary>
                <p className="mt-2 mb-0 text-sm text-slate-700 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Läs mer</h2>
          <ul className="space-y-1.5">
            {relaterade.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm font-semibold text-orange-700 hover:text-orange-800">
                  {l.text}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 pt-6 border-t border-orange-100 text-xs text-slate-500">
          Källor:{' '}
          {kallor.map((k, i) => (
            <span key={k.href}>
              <a href={k.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">
                {k.text}
              </a>
              {i < kallor.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>

        <div className="mt-6">
          <Link href="/rakna-ut" className="text-sm font-bold text-orange-700 hover:text-orange-800">
            ← Alla verktyg
          </Link>
        </div>
      </article>
    </main>
  )
}
