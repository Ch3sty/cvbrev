import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AUTHORS, getAuthorById, getAllAuthorIds, getAuthorForArticle, generateAuthorSchema } from '@/lib/authors';
import { getAllPostsMeta } from '@/lib/blog';
import { ArtikelKort } from '@/components/artiklar/lista/ArtikelLista';
import { Sida, Sektion, Chip } from '@/components/publikt/v3';
import './authors.css';

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

  // Publikt omgång 3: grundens skal (BYGGBRIEF beslut 10). Profilen och
  // bion på väggen, artiklarna på golvet. Text, rubriker, länkar och
  // Person-schemat som förut.
  return (
    <Sida className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <section className="p3-vagg p3-hjalte p3-utan-lyft">
      <div className="p3-bredd">
        <Link
          href="/artiklar"
          className="au-tillbaka"
        >
          <ArrowLeft className="w-4 h-4" />
          Alla artiklar
        </Link>

        {/* Profil-hero */}
        <header className="au-profil">
          <div className="flex-shrink-0">
            <Image
              src={author.image}
              alt={author.name}
              width={112}
              height={112}
              className="au-bild"
            />
          </div>
          <div className="min-w-0">
            <p className="p3-ey">
              Skribent
            </p>
            <h1 className="p3-h1 p3-h1-mindre">
              {author.name}
            </h1>
            <p className="p3-varde">{author.title}</p>
            <div className="au-chips">
              {author.expertise.map((e) => (
                <Chip key={e} typ="vagg">
                  {e}
                </Chip>
              ))}
            </div>
          </div>
        </header>

        {/* Bio */}
        <div className="au-bio">
          <p className="p3-text">{author.bio}</p>
        </div>
      </div>
      </section>

        {/* Artiklar av författaren */}
        <Sektion>
          <h2 className="p3-h2 au-h2">
            Artiklar av {author.name.split(' ')[0]}
            {posts.length > 0 && (
              <span className="au-antal">
                ({posts.length})
              </span>
            )}
          </h2>

          {posts.length === 0 ? (
            <p className="p3-text">Inga publicerade artiklar än.</p>
          ) : (
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <ArtikelKort key={post.slug} post={post} />
              ))}
            </div>
          )}
        </Sektion>
    </Sida>
  );
}
