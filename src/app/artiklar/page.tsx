import Link from 'next/link';
import { getAllPostsMeta, PostMeta } from '@/lib/blog';
import { Metadata } from 'next';
import { BookOpen, Filter, TrendingUp } from 'lucide-react';
import ModernArticleCard from '@/components/artiklar/ModernArticleCard';
import ModernCategoriesServer from '@/components/artiklar/ModernCategoriesServer';
import ModernPaginationControls from '@/components/artiklar/ModernPaginationControls';

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
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl px-4 py-16 mx-auto lg:py-20">
        <header className="mb-12 text-center md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl mb-4">
            Artiklar & Insikter
          </h1>
          <p className="text-lg text-gray-600 md:text-xl max-w-3xl mx-auto">
            Vässa ditt jobbsökande med våra senaste tips och analyser. Upptäck strategier som hjälper dig att sticka ut i konkurrensen.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-1 lg:gap-10">
          {/* Kolumn 1-3: Artiklar & Paginering */}
          <div className="lg:col-span-3">
            {/* Filter Info */}
            {tagFilter && (
              <div className="mb-8 bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-pink-600" />
                    <p className="text-pink-800">
                      Visar artiklar för kategorin <span className="font-semibold">"{tagFilter}"</span>
                    </p>
                  </div>
                  <Link
                    href="/artiklar"
                    className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
                  >
                    Visa alla
                  </Link>
                </div>
              </div>
            )}

            {/* Meddelande om inga poster */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Inga artiklar hittades</h3>
                <p className="text-gray-600 mb-4">
                  {tagFilter ? `Inga artiklar för kategorin "${tagFilter}".` : 'Inga artiklar finns tillgängliga just nu.'}
                </p>
                <Link
                  href="/artiklar"
                  className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Visa alla artiklar
                </Link>
              </div>
            ) : (
              // Container för grid och paginering
              <div className="flex flex-col gap-12">
                {/* Featured Article (first article gets special treatment) */}
                {paginatedPosts.length > 0 && currentPage === 1 && !tagFilter && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      <h2 className="text-xl font-bold text-gray-900">Utvalda artiklar</h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2">
                      <ModernArticleCard
                        key={paginatedPosts[0].slug}
                        post={paginatedPosts[0]}
                        tagFilter={tagFilter}
                        featured={true}
                      />
                    </div>
                  </div>
                )}

                {/* Regular Articles Grid */}
                <div>
                  {((currentPage === 1 && !tagFilter) ? paginatedPosts.length > 1 : paginatedPosts.length > 0) && (
                    <div className="flex items-center gap-2 mb-6">
                      <BookOpen className="w-5 h-5 text-gray-600" />
                      <h2 className="text-xl font-bold text-gray-900">
                        {(currentPage === 1 && !tagFilter) ? 'Senaste artiklar' : 'Artiklar'}
                      </h2>
                    </div>
                  )}
                  <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
                    {((currentPage === 1 && !tagFilter) ? paginatedPosts.slice(1) : paginatedPosts).map((post, index) => (
                      <ModernArticleCard
                        key={post.slug}
                        post={post}
                        tagFilter={tagFilter}
                      />
                    ))}
                  </div>
                </div>

                {/* Pagineringkontroller */}
                {totalPages > 1 && (
                  <ModernPaginationControls
                    currentPage={validCurrentPage}
                    totalPages={totalPages}
                    tag={tagFilter}
                  />
                )}
            </div>
          )}
        </div>

          {/* Kolumn 4: Kategorisektion */}
          <div className="lg:col-span-1">
            <ModernCategoriesServer />
          </div>
        </div>
      </div>
    </div>
  );
}