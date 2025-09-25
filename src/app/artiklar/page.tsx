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
  title: 'Artiklar | jobbcoach.ai - Tips och Råd för Jobbsökande',
  description: 'Läs de senaste artiklarna om personliga brev, CV-skrivning, AI i jobbsökandet och karriärtips från jobbcoach.ai.',
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
  searchParams: Promise<ResolvedSearchParams> | ResolvedSearchParams;
}) {
  const resolvedParams = await Promise.resolve(searchParams);

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

      {/* Organic Traffic Conversion Banner */}
      <OrganicTrafficBanner />

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

        {/* Filter Info */}
        {tagFilter && (
          <div className="mb-12 bg-pink-50 border border-pink-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-3 text-pink-600" />
                <p className="text-pink-800 text-lg">
                  Visar artiklar för kategorin <span className="font-semibold">"{tagFilter}"</span>
                </p>
              </div>
              <Link
                href="/artiklar"
                className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
              >
                Visa alla artiklar
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
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Inga artiklar hittades</h3>
            <p className="text-gray-600 text-lg mb-6">
              {tagFilter ? `Inga artiklar för kategorin "${tagFilter}".` : 'Inga artiklar finns tillgängliga just nu.'}
            </p>
            <Link
              href="/artiklar"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Visa alla artiklar
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {/* Featured Article */}
            {paginatedPosts.length > 0 && currentPage === 1 && !tagFilter && (
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Utvalda artiklar</h2>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex items-center gap-3 mb-8">
                  <BookOpen className="w-6 h-6 text-gray-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {(currentPage === 1 && !tagFilter) ? 'Senaste artiklar' : 'Artiklar'}
                  </h2>
                </div>
              )}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-12">
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