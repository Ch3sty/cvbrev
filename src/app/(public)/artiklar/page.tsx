import { getAllPostsMeta } from '@/lib/blog';
import { Metadata } from 'next';
import { generateTagsData } from '@/components/artiklar/ModernCategoriesServer';
import ArticlesHero from '@/components/artiklar/ArticlesHero';
import StickyCategoryBar from '@/components/artiklar/StickyCategoryBar';
import ArticleCard from '@/components/artiklar/ArticleCard';
import InlineFeedCTA from '@/components/artiklar/InlineFeedCTA';
import ArticlesPagination from '@/components/artiklar/ArticlesPagination';
import ArticlesFinalCTA from '@/components/artiklar/ArticlesFinalCTA';
import EmptyState from '@/components/artiklar/EmptyState';

const ITEMS_PER_PAGE = 9;
const SITE_URL = 'https://www.jobbcoach.ai';

type ResolvedSearchParams = {
  tag?: string | string[] | undefined;
  page?: string | string[] | undefined;
};

// === METADATA ===
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ResolvedSearchParams>;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const tag = typeof resolved?.tag === 'string' ? resolved.tag : undefined;
  const page = typeof resolved?.page === 'string' ? resolved.page : undefined;

  const baseTitle = tag
    ? `Artiklar om ${tag} | jobbcoach.ai`
    : 'Artiklar och karriärtips | jobbcoach.ai';
  const description = tag
    ? `Läs våra senaste artiklar om ${tag}. Tips, guider och insikter för att lyckas med din jobbsökning.`
    : 'Lär dig skriva bättre CV, personliga brev och ansökningar. Vi guidar dig genom moderna jobbsökningsprocesser.';

  // Canonical: alltid till bas-URL utan page-parameter (page=1 är default).
  // Om en tag finns, behåll tag i canonical så Google indexerar filter-vyer.
  const canonicalParams = new URLSearchParams();
  if (tag) canonicalParams.set('tag', tag);
  if (page && page !== '1') canonicalParams.set('page', page);
  const canonicalQs = canonicalParams.toString();
  const canonicalUrl = canonicalQs
    ? `${SITE_URL}/artiklar?${canonicalQs}`
    : `${SITE_URL}/artiklar`;

  // Filtrerade vyer (tag eller sida >1) noindexas — de är tunna dubbletter som
  // Google annars flaggar som "duplicate without user-selected canonical" och
  // som kannibaliserar artiklarna. follow:true behålls så länkkraft flödar vidare.
  const isFiltered = Boolean(tag) || (Boolean(page) && page !== '1');

  return {
    title: baseTitle,
    description,
    robots: isFiltered
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: baseTitle,
      description,
      siteName: 'jobbcoach.ai',
      locale: 'sv_SE',
    },
    twitter: {
      card: 'summary_large_image',
      title: baseTitle,
      description,
    },
    keywords: tag
      ? `${tag}, jobbsökning, CV-tips, karriärtips, jobbcoach`
      : 'CV-tips, personligt brev, jobbsökning, karriär, ansökan',
  };
}

export default async function ArticlesIndexPage({
  searchParams,
}: {
  searchParams: Promise<ResolvedSearchParams>;
}) {
  const resolvedParams = await searchParams;

  // === DATA-FETCHING ===
  const allPosts = getAllPostsMeta();
  const tagsData = generateTagsData();

  // === FILTER ===
  const tagFilter =
    typeof resolvedParams?.tag === 'string' ? resolvedParams.tag : undefined;
  const pageParam =
    typeof resolvedParams?.page === 'string' ? resolvedParams.page : '1';
  const page = parseInt(pageParam, 10);
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  const filteredPosts = tagFilter
    ? allPosts.filter(
        (post) =>
          post.tags &&
          Array.isArray(post.tags) &&
          post.tags.some(
            (t) => typeof t === 'string' && t.toLowerCase() === tagFilter.toLowerCase()
          )
      )
    : allPosts;

  // === PAGINATION ===
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // === FEATURED + REGULAR-DELNING ===
  const showFeatured = !tagFilter && validCurrentPage === 1 && paginatedPosts.length > 0;
  const featuredPost = showFeatured ? paginatedPosts[0] : null;
  const regularPosts = showFeatured ? paginatedPosts.slice(1) : paginatedPosts;

  // Inline-CTA i feed:en EN gång (efter pos 5 om >= 6 regular posts, ingen filter)
  const showInlineCTA = !tagFilter && regularPosts.length >= 6;
  const inlineCTAIndex = 5; // injekteras EFTER index 4 (dvs efter 5:e kortet)

  // === SEO: SCHEMA MARKUP ===
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Hem',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Artiklar',
        item: `${SITE_URL}/artiklar`,
      },
      ...(tagFilter
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: tagFilter,
              item: `${SITE_URL}/artiklar?tag=${encodeURIComponent(tagFilter)}`,
            },
          ]
        : []),
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: tagFilter
      ? `Artiklar om ${tagFilter}`
      : 'Karriärbiblioteket — alla artiklar',
    description: tagFilter
      ? `Samling av artiklar om ${tagFilter}.`
      : 'Vår samling av karriärguider, CV-tips och artiklar för att lyckas med jobbsökningen.',
    url: `${SITE_URL}/artiklar${tagFilter ? `?tag=${encodeURIComponent(tagFilter)}` : ''}`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: 'jobbcoach.ai', url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: paginatedPosts.slice(0, 10).map((post, idx) => ({
        '@type': 'ListItem',
        position: startIndex + idx + 1,
        url: `${SITE_URL}/artiklar/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/20">

      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Hero */}
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 pb-4 sm:pb-6">
        <ArticlesHero totalPosts={allPosts.length} />
      </div>

      {/* Sticky kategori-bar */}
      <StickyCategoryBar
        categories={tagsData}
        activeTag={tagFilter}
        totalCount={allPosts.length}
      />

      {/* Innehåll */}
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-10">
        {filteredPosts.length === 0 ? (
          <EmptyState
            tagFilter={tagFilter}
            popularTags={tagsData.slice(0, 4).map((t) => t.tag)}
          />
        ) : (
          <div className="space-y-10 sm:space-y-14">
            {/* Featured */}
            {featuredPost && (
              <section>
                <ArticleCard
                  key={featuredPost.slug}
                  post={featuredPost}
                  tagFilter={tagFilter}
                  featured
                />
              </section>
            )}

            {/* Grid med inline-CTA */}
            <section>
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularPosts.map((post, idx) => {
                  // Injekta InlineFeedCTA efter pos 5 (om visas)
                  const elements: React.ReactNode[] = [];

                  if (showInlineCTA && idx === inlineCTAIndex) {
                    elements.push(<InlineFeedCTA key="inline-cta" />);
                  }

                  elements.push(
                    <ArticleCard
                      key={post.slug}
                      post={post}
                      tagFilter={tagFilter}
                    />
                  );

                  return elements;
                })}
              </div>
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
              <section className="pt-2">
                <ArticlesPagination
                  currentPage={validCurrentPage}
                  totalPages={totalPages}
                  totalPosts={totalPosts}
                  itemsPerPage={ITEMS_PER_PAGE}
                  tag={tagFilter}
                />
              </section>
            )}

            {/* Final CTA */}
            <section>
              <ArticlesFinalCTA />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
