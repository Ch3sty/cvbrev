import { getAllPostsMeta } from '@/lib/blog';
import { Metadata } from 'next';
import { Fragment } from 'react';
import { generateTagsData } from '@/components/artiklar/ModernCategoriesServer';
// Listan i linjen (docs/design/analys-artiklar-2026-09-23.html, avsnitt 4):
// serverkomponenter, gallerilayouten kvar med gratiskortet inblandat bland
// artikelkorten och de tre paketen i bläck efter pagineringen.
import { ArtikelKort, FilterRad, ListHuvud, Paginering, TomLista } from '@/components/artiklar/lista/ArtikelLista';
import { GratisKort, ListaSlutKort } from '@/components/artiklar/reklam/ArtikelReklam';
import ArtikelKlient from '@/components/artiklar/ArtikelKlient';

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

  // Filtrerade vyer (tag eller sida >1) noindexas: de är tunna dubbletter som
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

// Sidan läser searchParams (tag, page) och blir därför dynamisk, men all
// data kommer från MDX i repot. Med revalidate får varje kombination av
// parametrar en egen CDN-post i stället för no-store och origin varje gång.
export const revalidate = 86400;

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

  // Gratiskortet en gång i rutnätet, på plats 7 räknat med det stora kortet
  // (efter det femte vanliga kortet), bara i den ofiltrerade listan.
  const showInlineCTA = !tagFilter && regularPosts.length >= 6;
  const inlineCTAIndex = 5;

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
    <div className="min-h-screen bg-mark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-12">
        <ListHuvud antal={allPosts.length} />
        <FilterRad kategorier={tagsData} aktiv={tagFilter} totalt={allPosts.length} />

        <div className="mt-8 space-y-10 sm:space-y-12">
          {filteredPosts.length === 0 ? (
            <TomLista tag={tagFilter} populara={tagsData.slice(0, 4).map((t) => t.tag)} />
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featuredPost ? <ArtikelKort post={featuredPost} stor prioritet /> : null}
                {regularPosts.map((post, idx) => (
                  <Fragment key={post.slug}>
                    {showInlineCTA && idx === inlineCTAIndex ? (
                      <GratisKort cluster="lista" position="inline" />
                    ) : null}
                    <ArtikelKort post={post} prioritet={!featuredPost && idx === 0} />
                  </Fragment>
                ))}
              </div>

              {totalPages > 1 ? (
                <Paginering
                  sida={validCurrentPage}
                  sidor={totalPages}
                  totalt={totalPosts}
                  perSida={ITEMS_PER_PAGE}
                  tag={tagFilter}
                />
              ) : null}

              <ListaSlutKort />
            </>
          )}
        </div>
      </div>
      <ArtikelKlient />
    </div>
  );
}
