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
import FelrekryteringsKalkylator from '@/components/mdx/FelrekryteringsKalkylator'
import TraffsakerhetsSimulator from '@/components/mdx/TraffsakerhetsSimulator'
import PercentilUtforskare from '@/components/mdx/PercentilUtforskare'
import AnnonsGranskare from '@/components/mdx/AnnonsGranskare'
import Processkollen from '@/components/mdx/Processkollen'
import SourcingTratt from '@/components/mdx/SourcingTratt'
import MeddelandeGranskare from '@/components/mdx/MeddelandeGranskare'
import GallringsKollen from '@/components/mdx/GallringsKollen'
import BakgrundsKollen from '@/components/mdx/BakgrundsKollen'
import Transparenskollen from '@/components/mdx/Transparenskollen'
import { Sida, Sektion } from '@/components/publikt/v3'
import '../insikter.css'

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

const components = {
  CustomImage,
  FAQContainer,
  FAQItem,
  InsiktCTA,
  FelrekryteringsKalkylator,
  TraffsakerhetsSimulator,
  PercentilUtforskare,
  AnnonsGranskare,
  Processkollen,
  SourcingTratt,
  MeddelandeGranskare,
  GallringsKollen,
  BakgrundsKollen,
  Transparenskollen,
}

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

  // Publikt omgång 3: grundens skal. Brödsmulan, eyebrow, h1 och raden med
  // datum står på väggen; brödtexten på ett papperskort på golvet. Rubriker,
  // text, länkar och schema som förut.
  return (
    <Sida farg="jobb">
    <main>
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

      <article>
        <section className="p3-vagg p3-hjalte p3-utan-lyft">
        <div className="p3-bredd">
        <div className="ins-smula">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'För rekryterare', href: '/for-rekryterare' },
            { name: 'Insikter', href: '/for-rekryterare/insikter' },
            { name: fm.title, href: `/for-rekryterare/insikter/${slug}` },
          ]}
        />
        </div>

        <header className="ins-huvud">
          <p className="p3-ey">
            Insikter för rekryterare
          </p>
          <h1 className="p3-h1 p3-h1-mindre">
            {fm.title}
          </h1>
          <p className="ins-meta">
            {format(parseISO(fm.date), 'd MMMM yyyy', { locale: sv })} · {readingTime} min
            läsning · {fm.author || 'Teamet på jobbcoach.ai'}
          </p>
        </header>
        </div>
        </section>

        <Sektion luft="tat">
        <div className="ins-artikel">
        <div
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-[var(--ink-1)] prose-headings:scroll-mt-20
            prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:leading-relaxed prose-a:text-[var(--koppar-ink)] prose-a:font-semibold
            prose-strong:text-[var(--ink-1)] prose-li:leading-relaxed"
        >
          <MDXRemote source={post.content} components={components} />
        </div>

        <InsiktCTA />

        <div className="ins-tillbaka">
          <Link
            href="/for-rekryterare/insikter"
          >
            ← Alla insikter för rekryterare
          </Link>
        </div>
        </div>
        </Sektion>
      </article>
    </main>
    </Sida>
  )
}
