import Link from 'next/link';
import { getAllPostsMeta } from '@/lib/blog';
import { Metadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CalendarDays, UserCircle, Tag, FileText } from 'lucide-react';

// Importera den nya klientkomponenten
import ArticleImage from '@/components/ArticleImage';

export const metadata: Metadata = {
  title: 'Artiklar | cvbrev.se - Tips och Råd för Jobbsökande',
  description: 'Läs de senaste artiklarna om personliga brev, CV-skrivning, AI i jobbsökandet och karriärtips från cvbrev.se.',
  alternates: {
    canonical: '/artiklar',
  },
};

export default function ArticlesIndexPage() {
  const posts = getAllPostsMeta();

  return (
    <div className="container max-w-6xl px-4 py-16 mx-auto lg:py-20">
      <header className="mb-12 text-center md:mb-16">
        <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          Artiklar & Insikter
        </h1>
        <p className="mt-4 text-lg text-gray-300 md:text-xl">
          Vässa ditt jobbsökande med våra senaste tips och analyser.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400">Inga artiklar hittades just nu.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
          {posts.map((post) => {
            const hasValidImage = 
              typeof post.image === 'string' && 
              post.image.trim() !== '' && 
              post.image.startsWith('/');

            return (
              <article
                key={post.slug}
                className="group flex flex-col overflow-hidden rounded-lg bg-navy-900 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-pink-900/30 border border-navy-700/70 hover:border-navy-600"
              >
                <Link 
                  href={`/artiklar/${post.slug}`}
                  className="block overflow-hidden bg-navy-800" 
                  aria-label={`Läs mer om ${post.title}`}
                >
                  <div className="relative aspect-w-16 aspect-h-9">
                    {hasValidImage ? (
                      <ArticleImage
                        src={post.image as string}
                        alt={post.title ?? 'Artikelbild'}
                        slug={post.slug}
                      />
                    ) : (
                      <div className="fallback-icon-container flex items-center justify-center w-full h-full bg-gradient-to-br from-navy-800 to-navy-700">
                        <FileText className="w-12 h-12 text-navy-600" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex flex-col flex-1 p-6">
                  <header className="mb-3">
                    <h2 className="text-xl font-semibold leading-snug text-white transition-colors lg:text-2xl group-hover:text-pink-400 line-clamp-2">
                      <Link href={`/artiklar/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <div className="flex items-center mt-3 space-x-4 text-xs text-gray-400">
                      <div className="flex items-center">
                        <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                        <time dateTime={post.date}>
                          {format(parseISO(post.date), 'd MMM yyyy', { locale: sv })}
                        </time>
                      </div>
                      {post.author && (
                        <div className="flex items-center">
                          <UserCircle className="w-3.5 h-3.5 mr-1.5" />
                          <span>{post.author}</span>
                        </div>
                      )}
                    </div>
                  </header>

                  <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  <footer className="mt-auto pt-4 border-t border-navy-700/50">
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-navy-700 text-gray-300 border border-navy-600"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-500">...</span>
                        )}
                      </div>
                    )}

                    <div>
                      <Link
                        href={`/artiklar/${post.slug}`}
                        className="inline-flex items-center text-sm font-medium text-pink-500 transition-colors hover:text-pink-400 group"
                      >
                        Läs hela artikeln
                        <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}