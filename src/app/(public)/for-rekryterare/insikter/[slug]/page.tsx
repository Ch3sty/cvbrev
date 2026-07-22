import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { format, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'
import Link from 'next/link'
import { getAllInsikterMeta, getInsiktBySlug } from '@/lib/blog'
import Breadcrumb from '@/components/Breadcrumb'
import CustomImage from '@/components/mdx/Image'
import FAQContainer from '@/components/mdx/FAQContainer'
import FAQItem from '@/components/mdx/FAQItem'
import InsiktCTA from '@/components/mdx/InsiktCTA'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllInsikterMeta().map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getInsiktBySlug(slug)
  if (!post) return {}
  const fm = post.frontmatter
  return {
    title: fm.seoTitle || `${fm.title} | Jobbcoach.ai`,
    description: fm.description,
    alternates: {
      canonical: `https://www.jobbcoach.ai/for-rekryterare/insikter/${slug}`,
    },
    openGraph: {
      title: fm.seoTitle || fm.title,
      description: fm.description,
      type: 'article',
      locale: 'sv_SE',
      url: `https://www.jobbcoach.ai/for-rekryterare/insikter/${slug}`,
      siteName: 'Jobbcoach.ai',
      images: fm.image ? [{ url: `https://www.jobbcoach.ai${fm.image}` }] : undefined,
    },
    robots: { index: true, follow: true },
  }
}

const components = { CustomImage, FAQContainer, FAQItem, InsiktCTA }

export default async function InsiktPage({ params }: Props) {
  const { slug } = await params
  const post = getInsiktBySlug(slug)
  if (!post) notFound()

  const fm = post.frontmatter
  const readingTime = Math.max(
    2,
    Math.round(post.content.split(/\s+/).filter((w) => w.length > 0).length / 200)
  )

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fm.title,
    description: fm.description,
    datePublished: fm.date,
    dateModified: fm.date,
    inLanguage: 'sv-SE',
    image: fm.image ? `https://www.jobbcoach.ai${fm.image}` : undefined,
    author: { '@type': 'Organization', name: 'Jobbcoach.ai' },
    publisher: { '@type': 'Organization', name: 'Jobbcoach.ai', url: 'https://www.jobbcoach.ai' },
    mainEntityOfPage: `https://www.jobbcoach.ai/for-rekryterare/insikter/${slug}`,
  }

  const faqSchema =
    fm.faq && fm.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: fm.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }
      : null

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'För rekryterare', href: '/for-rekryterare' },
            { name: 'Insikter', href: '/for-rekryterare/insikter' },
            { name: fm.title, href: `/for-rekryterare/insikter/${slug}` },
          ]}
        />

        <header className="mt-6 mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-3">
            Insikter för rekryterare
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
            {fm.title}
          </h1>
          <p className="text-sm text-slate-500">
            {format(parseISO(fm.date), 'd MMMM yyyy', { locale: sv })} · {readingTime} min
            läsning · {fm.author || 'Teamet på jobbcoach.ai'}
          </p>
        </header>

        <div
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-slate-900 prose-headings:scroll-mt-20
            prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:leading-relaxed prose-a:text-orange-700 prose-a:font-semibold
            prose-strong:text-slate-900 prose-li:leading-relaxed"
        >
          <MDXRemote source={post.content} components={components} />
        </div>

        <InsiktCTA />

        <div className="mt-8 pt-6 border-t border-orange-100">
          <Link
            href="/for-rekryterare/insikter"
            className="text-sm font-bold text-orange-700 hover:text-orange-800"
          >
            ← Alla insikter för rekryterare
          </Link>
        </div>
      </article>
    </main>
  )
}
