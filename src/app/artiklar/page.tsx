import Link from 'next/link';
import { getAllPostsMeta, PostMeta } from '@/lib/blog'; // Importera PostMeta typen
import { Metadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CalendarDays, UserCircle, Tag, FileText, ArrowLeft, ArrowRight } from 'lucide-react'; // Importera pilar
import ArticleImage from '@/components/ArticleImage';
import ArticleCategoriesServer from '@/components/artiklar/ArticleCategoriesServer';
import PaginationControls from '@/components/artiklar/PaginationControls'; // Importera den nya komponenten

export const metadata: Metadata = {
  title: 'Artiklar | jobbcoach.ai - Tips och Råd för Jobbsökande',
  description: 'Läs de senaste artiklarna om personliga brev, CV-skrivning, AI i jobbsökandet och karriärtips från jobbcoach.ai.',
  alternates: {
    canonical: '/artiklar',
  },
};

// Typen för de *resolverade* searchParams, inkludera 'page'
type ResolvedSearchParams = {
    tag?: string | string[] | undefined;
    page?: string | string[] | undefined; // Lägg till page
};

const ITEMS_PER_PAGE = 6; // Antal artiklar per sida

export default async function ArticlesIndexPage({
  searchParams,
}: {
  searchParams: Promise<ResolvedSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  // Hämta filter och sidnummer från URL
  const tagFilter = typeof resolvedSearchParams?.tag === 'string' ? resolvedSearchParams.tag : undefined;
  const page = typeof resolvedSearchParams?.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;

  // Validera sidnummer
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  const allPosts = getAllPostsMeta(); // Hämtar alla poster (sorterade efter datum som default?)

  // 1. Filtrera först baserat på tagg
  const filteredPosts = tagFilter
    ? allPosts.filter(post =>
        post.tags &&
        Array.isArray(post.tags) &&
        post.tags.some(tag => typeof tag === 'string' && tag.toLowerCase() === tagFilter.toLowerCase())
      )
    : allPosts;

  // 2. Beräkna pagineringsvariabler baserat på filtrerade poster
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);

  // Justera currentPage om den är större än totalt antal sidor
  const validCurrentPage = Math.min(currentPage, Math.max(totalPages, 1)); // Säkerställ minst 1

  // 3. Hämta posterna för den aktuella sidan
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex); // Ta ut rätt segment

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

      <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-1 lg:gap-10">
        {/* Kolumn 1 och 2: Artiklar & Paginering */}
        <div className="lg:col-span-2">
          {/* Meddelande om inga poster */}
          {filteredPosts.length === 0 ? ( // Ändrat från posts.length till filteredPosts.length
            <div className="text-center py-12 bg-navy-900 rounded-lg border border-navy-700 p-6">
              <p className="text-gray-400 mb-2">Inga artiklar hittades {tagFilter ? `för kategorin "${tagFilter}"` : ''}.</p>
              <Link
                href="/artiklar"
                className="text-pink-500 hover:text-pink-400 inline-flex items-center"
              >
                <span aria-hidden="true" className="mr-1">←</span>
                Visa alla artiklar
              </Link>
            </div>
          ) : (
            // Container för grid och paginering
            <div className="flex flex-col gap-10">
                {/* Grid med artiklar för aktuell sida */}
                <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
                  {paginatedPosts.map((post) => { // Ändrat från posts.map till paginatedPosts.map
                    const hasValidImage =
                      typeof post.image === 'string' &&
                      post.image.trim() !== '' &&
                      post.image.startsWith('/');

                    // --- Artikel-rendering (behåll din befintliga kod här) ---
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
                                {post.date && (
                                    <time dateTime={post.date}>
                                      {format(parseISO(post.date), 'd MMM yyyy', { locale: sv })}
                                    </time>
                                )}
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
                                  <Link
                                    key={tag}
                                    // Länka till första sidan när man klickar på en tagg från kortet
                                    href={`/artiklar?tag=${encodeURIComponent(tag)}`}
                                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                      tagFilter === tag
                                        ? 'bg-pink-900/30 text-pink-300 border border-pink-500'
                                        : 'bg-navy-700 text-gray-300 border border-navy-600 hover:border-pink-500/50 hover:text-pink-400'
                                    }`}
                                  >
                                    {tag}
                                  </Link>
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
                    // --- Slut på Artikel-rendering ---
                  })}
                </div>

                {/* Pagineringkontroller */}
                {totalPages > 1 && ( // Visa endast om det finns mer än en sida
                    <PaginationControls
                        currentPage={validCurrentPage}
                        totalPages={totalPages}
                        tag={tagFilter} // Skicka med aktuell tagg
                    />
                )}
            </div>
          )}
        </div>

        {/* Kolumn 3: Kategorisektion (Oförändrad) */}
        <div className="lg:col-span-1">
          <ArticleCategoriesServer />
        </div>
      </div>
    </div>
  );
}