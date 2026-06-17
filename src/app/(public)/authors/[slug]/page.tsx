import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AUTHORS, getAuthorById, getAllAuthorIds, getAuthorForArticle, generateAuthorSchema } from '@/lib/authors';
import { getAllPostsMeta } from '@/lib/blog';
import ArticleCard from '@/components/artiklar/ArticleCard';

const SITE_URL = 'https://www.jobbcoach.ai';

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllAuthorIds().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorById(slug);
  if (!author) return { title: 'Författare hittades inte | jobbcoach.ai' };

  const title = `${author.name} – ${author.title} | jobbcoach.ai`;
  const url = `${SITE_URL}/authors/${author.id}`;
  return {
    title,
    description: author.bio,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      title,
      description: author.bio,
      siteName: 'jobbcoach.ai',
      locale: 'sv_SE',
      images: [{ url: `${SITE_URL}${author.image}`, width: 200, height: 200, alt: author.name }],
    },
    twitter: { card: 'summary', title, description: author.bio },
  };
}

// Artiklar som tilldelats denna författare (samma deterministiska mappning som
// används på artikelsidorna), nyast först.
function articlesByAuthor(authorId: string) {
  return getAllPostsMeta()
    .filter((post) => getAuthorForArticle(post.slug, post.tags || [], post.title).id === authorId)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = getAuthorById(slug);
  if (!author) notFound();

  const posts = articlesByAuthor(author.id);
  const personSchema = {
    '@context': 'https://schema.org',
    ...generateAuthorSchema(author, `${SITE_URL}/authors/${author.id}`),
  };

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* Subtil orange radial-glow uppe — matchar övriga publika sidor */}
      <div
        className="absolute inset-x-0 top-0 h-[40vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/artiklar"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-orange-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Alla artiklar
        </Link>

        {/* Profil-hero */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7 mb-10">
          <div className="flex-shrink-0">
            <Image
              src={author.image}
              alt={author.name}
              width={112}
              height={112}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-orange-100 shadow-sm"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1">
              Skribent
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {author.name}
            </h1>
            <p className="text-base font-medium text-slate-600 mt-0.5">{author.title}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {author.expertise.map((e) => (
                <span
                  key={e}
                  className="inline-block px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 sm:p-7 mb-12"
             style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}>
          <p className="text-slate-700 leading-relaxed">{author.bio}</p>
        </div>

        {/* Artiklar av författaren */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">
            Artiklar av {author.name.split(' ')[0]}
            {posts.length > 0 && (
              <span className="ml-2 text-base font-medium text-slate-400 tabular-nums">
                ({posts.length})
              </span>
            )}
          </h2>

          {posts.length === 0 ? (
            <p className="text-slate-500">Inga publicerade artiklar än.</p>
          ) : (
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
