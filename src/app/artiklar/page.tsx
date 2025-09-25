'use client'

import Link from 'next/link';
import { getAllPostsMeta, PostMeta } from '@/lib/blog';
import { BookOpen, Filter, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import PremiumNavbar from '@/components/PremiumNavbar';
import ModernArticleCard from '@/components/artiklar/ModernArticleCard';
import ModernCategoriesServer from '@/components/artiklar/ModernCategoriesServer';
import ModernPaginationControls from '@/components/artiklar/ModernPaginationControls';
import ConversionCard from '@/components/artiklar/ConversionCard';
import OrganicTrafficBanner from '@/components/artiklar/OrganicTrafficBanner';
import FloatingCTA from '@/components/artiklar/FloatingCTA';

// Metadata moved to layout since this is now a client component

// Typen för de *resolverade* searchParams, inkludera 'page'
type ResolvedSearchParams = {
    tag?: string | string[] | undefined;
    page?: string | string[] | undefined; // Lägg till page
};

const ITEMS_PER_PAGE = 6; // Antal artiklar per sida

// Loading fallback component
function ArticlesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PremiumNavbar />
      <OrganicTrafficBanner />
      <div className="container max-w-7xl px-4 py-16 mx-auto lg:py-20">
        <header className="mb-12 text-center md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-2xl mb-6 animate-pulse">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse max-w-md mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse max-w-2xl mx-auto"></div>
        </header>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main content component that uses searchParams
function ArticlesContent() {
  const searchParams = useSearchParams();
  const [allPosts, setAllPosts] = useState<PostMeta[]>([]);

  // Hämta filter och sidnummer från URL
  const tagFilter = searchParams.get('tag') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Validera sidnummer
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  // Hämta alla poster med felhantering
  useEffect(() => {
    try {
      const posts = getAllPostsMeta();
      setAllPosts(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setAllPosts([]);
    }
  }, []);

  // 1. Filtrera först baserat på tagg med säker filtrering
  const filteredPosts = tagFilter
    ? allPosts.filter(post => {
        try {
          return post.tags &&
            Array.isArray(post.tags) &&
            post.tags.some(tag => typeof tag === 'string' && tag.toLowerCase() === tagFilter.toLowerCase());
        } catch (error) {
          console.warn('Error filtering post:', post?.slug, error);
          return false;
        }
      })
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

        {/* Filter Info - now full width */}
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

        {/* Categories Section - moved to top as horizontal filter */}
        <div className="mb-12">
          <ModernCategoriesServer />
        </div>

        {/* Meddelande om inga poster */}
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
          // Container för grid och paginering - now full width
          <div className="flex flex-col gap-16">
            {/* Featured Article (first article gets special treatment) */}
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

            {/* Regular Articles Grid - Calendly-inspired 3-column layout */}
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
                  // Calculate global index for conversion card placement
                  const globalIndex = (currentPage === 1 && !tagFilter) ? index + 1 : (validCurrentPage - 1) * ITEMS_PER_PAGE + index;

                  // Add the article card
                  elements.push(
                    <ModernArticleCard
                      key={post.slug}
                      post={post}
                      tagFilter={tagFilter}
                    />
                  );

                  // Strategic conversion card placement - show every 5th article position (5, 10, 15, 20, etc.)
                  if (!tagFilter && (globalIndex + 1) % 5 === 0) {
                    // Distribution pattern: ~70% free-trial, ~30% premium
                    // Every 3rd conversion card is premium
                    const conversionPosition = Math.floor((globalIndex + 1) / 5); // Which conversion card number this is
                    const selectedVariant = (conversionPosition % 3 === 0) ? 'premium' : 'free-trial';


                    elements.push(
                      <ConversionCard
                        key={`conversion-${globalIndex}`}
                        variant={selectedVariant}
                        position={globalIndex + 1}
                      />
                    );
                  }

                  return elements;
                }).flat()}

                {/* Final conversion CTA for users who scroll to the end - show on all pages */}
                {!tagFilter && paginatedPosts.length > 3 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <ConversionCard
                      key={`conversion-final-cta-${validCurrentPage}`}
                      variant="free-trial"
                      position={999}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Pagineringkontroller */}
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

        {/* Floating CTA for engaged users */}
        <FloatingCTA />
      </div>
    </div>
  );
}

// Main export component that wraps ArticlesContent in Suspense
export default function ArticlesIndexPage() {
  return (
    <Suspense fallback={<ArticlesLoading />}>
      <ArticlesContent />
    </Suspense>
  );
}