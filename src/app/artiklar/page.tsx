import Link from 'next/link';
import { getAllPostsMeta, PostMeta } from '@/lib/blog';
import { Metadata } from 'next';
import { BookOpen, Filter, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';
import PremiumNavbar from '@/components/PremiumNavbar';
import ModernArticleCard from '@/components/artiklar/ModernArticleCard';
import ModernCategoriesServer from '@/components/artiklar/ModernCategoriesServer';
import ModernPaginationControls from '@/components/artiklar/ModernPaginationControls';
import ConversionCard from '@/components/artiklar/ConversionCard';
import OrganicTrafficBanner from '@/components/artiklar/OrganicTrafficBanner';
import FloatingCTA from '@/components/artiklar/FloatingCTA';
import ArticlesClientWrapper from '@/components/artiklar/ArticlesClientWrapper';

export const metadata: Metadata = {
  title: 'Artiklar och karriärtips | jobbcoach.ai',
  description: 'Lär dig skriva bättre CV, personliga brev och ansökningar. Vi guidar dig genom moderna jobbsökningsprocesser.',
  alternates: {
    canonical: '/artiklar',
  },
};

const ITEMS_PER_PAGE = 6;

type ResolvedSearchParams = {
  tag?: string | string[] | undefined;
  page?: string | string[] | undefined;
};

export default async function ArticlesIndexPage({
  searchParams,
}: {
  searchParams: Promise<ResolvedSearchParams>;
}) {
  const resolvedParams = await searchParams;

  // Get all posts server-side
  const allPosts = getAllPostsMeta();

  // Extract params
  const tagFilter = typeof resolvedParams?.tag === 'string' ? resolvedParams.tag : undefined;
  const pageParam = typeof resolvedParams?.page === 'string' ? resolvedParams.page : '1';
  const page = parseInt(pageParam, 10);
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  // Filter posts based on tag
  const filteredPosts = tagFilter
    ? allPosts.filter(post =>
        post.tags &&
        Array.isArray(post.tags) &&
        post.tags.some(tag => typeof tag === 'string' && tag.toLowerCase() === tagFilter.toLowerCase())
      )
    : allPosts;

  // Calculate pagination
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));

  // Get posts for current page
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Navigation Bar */}
      <PremiumNavbar />

      {/* Organic Traffic Conversion Banner - positioned below navbar */}
      <div className="pt-16">
        <OrganicTrafficBanner />
      </div>

      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mx-auto lg:py-20">
        <header className="mb-8 sm:mb-12 text-center md:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl mb-4 leading-tight">
            <span className="hidden sm:inline">Artiklar som förbättrar din jobbsökning</span>
            <span className="sm:hidden">Karriärtips & artiklar</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 md:text-xl max-w-3xl mx-auto leading-relaxed">
            <span className="hidden sm:block">
              Lär dig skriva starkare ansökningar och CV:n som går igenom. Våra artiklar guidar dig genom moderna rekryteringsprocesser.
            </span>
            <span className="sm:hidden">
              Tips och guider för att lyckas med din jobbsökning.
            </span>
          </p>
        </header>

        {/* Filter Info */}
        {tagFilter && (
          <div className="mb-8 sm:mb-12 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                <p className="text-blue-800 text-base sm:text-lg">
                  Du ser artiklar om: <span className="font-semibold">"{tagFilter}"</span>
                </p>
              </div>
              <Link
                href="/artiklar"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Visa alla artiklar</span>
                <span className="sm:hidden">Visa alla</span>
              </Link>
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="mb-12">
          <ModernCategoriesServer />
        </div>

        {/* Articles Content */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20 bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
            <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2 sm:mb-3">Här var det tomt</h3>
            <p className="text-slate-600 text-base sm:text-lg mb-4 sm:mb-6 px-4">
              {tagFilter ? `Vi har inga artiklar om "${tagFilter}" än.` : 'Just nu finns inga artiklar här.'}
            </p>
            <Link
              href="/artiklar"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 touch-manipulation"
            >
              Tillbaka till alla artiklar
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {/* Featured Article */}
            {paginatedPosts.length > 0 && currentPage === 1 && !tagFilter && (
              <section className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    <span className="hidden sm:inline">Utvalda artiklar</span>
                    <span className="sm:hidden">Utvalda</span>
                  </h2>
                </div>
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <ModernArticleCard
                    key={paginatedPosts[0].slug}
                    post={paginatedPosts[0]}
                    tagFilter={tagFilter}
                    featured={true}
                  />
                </div>
              </section>
            )}

            {/* Regular Articles Grid */}
            <section>
              {((currentPage === 1 && !tagFilter) ? paginatedPosts.length > 1 : paginatedPosts.length > 0) && (
                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    <span className="hidden sm:inline">
                      {(currentPage === 1 && !tagFilter) ? 'Senaste artiklar' : 'Artiklar'}
                    </span>
                    <span className="sm:hidden">Senaste</span>
                  </h2>
                </div>
              )}
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-12">
                {((currentPage === 1 && !tagFilter) ? paginatedPosts.slice(1) : paginatedPosts).map((post, index) => {
                  const elements = [];
                  const globalIndex = (currentPage === 1 && !tagFilter) ? index + 1 : (validCurrentPage - 1) * ITEMS_PER_PAGE + index;

                  elements.push(
                    <ModernArticleCard
                      key={post.slug}
                      post={post}
                      tagFilter={tagFilter}
                    />
                  );

                  // Conversion card placement - every 5th position
                  if (!tagFilter && (globalIndex + 1) % 5 === 0) {
                    const conversionPosition = Math.floor((globalIndex + 1) / 5);
                    const selectedVariant = (conversionPosition % 3 === 0) ? 'premium' : 'free-trial';

                    elements.push(
                      <ArticlesClientWrapper key={`wrapper-${globalIndex}`}>
                        <ConversionCard
                          variant={selectedVariant}
                          position={globalIndex + 1}
                        />
                      </ArticlesClientWrapper>
                    );
                  }

                  return elements;
                }).flat()}

                {/* Final conversion CTA */}
                {!tagFilter && paginatedPosts.length > 3 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <ArticlesClientWrapper>
                      <ConversionCard
                        variant="free-trial"
                        position={999}
                      />
                    </ArticlesClientWrapper>
                  </div>
                )}
              </div>
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
              <section className="flex justify-center">
                <ModernPaginationControls
                  currentPage={validCurrentPage}
                  totalPages={totalPages}
                  tag={tagFilter}
                />
              </section>
            )}
          </div>
        )}

        {/* Floating CTA */}
        <ArticlesClientWrapper>
          <FloatingCTA />
        </ArticlesClientWrapper>
      </div>
    </div>
  );
}