// src/app/artiklar/[slug]/page.tsx
// Uppdaterad med ljust premium tema och nya konverteringskomponenter

import { notFound } from 'next/navigation';
import { getAllPostsMeta, getPostBySlug, Post, FaqItemData, PostMeta } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata, ResolvingMetadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import Link from 'next/link';
import React from 'react';

// Importera MDX-komponenter
import CustomImage from '@/components/mdx/Image';
import FAQContainer from '@/components/mdx/FAQContainer';
import FAQItem from '@/components/mdx/FAQItem';

// Importera artikelkomponenter
import ArticleSidebar from '@/components/artiklar/ArticleSidebar';
import BroadConversionBanner from '@/components/artiklar/BroadConversionBanner';
import CVTemplateShowcase from '@/components/artiklar/CVTemplateShowcase';
import ComprehensiveServiceCard from '@/components/artiklar/ComprehensiveServiceCard';

// Korrekt typdefinition för props med Promise (OFÖRÄNDRAT)
interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// --- METADATA GENERERING (OFÖRÄNDRAT) ---
export async function generateMetadata(
    { params }: ArticlePageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // ... (exakt samma kod som tidigare) ...
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const post = getPostBySlug(slug);

    if (!post) {
        return { title: 'Artikeln Hittades Inte' };
    }

    const pageTitle = post.frontmatter.title;
    const publishedDate = post.frontmatter.date ? new Date(post.frontmatter.date).toISOString() : undefined;

    const siteBaseUrl = "https://www.jobbcoach.ai";
    const imageUrl = post.frontmatter.image
        ? (post.frontmatter.image.startsWith('http') ? post.frontmatter.image : `${siteBaseUrl}${post.frontmatter.image}`)
        : undefined;

    return {
        title: `${pageTitle} | jobbcoach.ai`,
        description: post.frontmatter.description,
        alternates: { canonical: `${siteBaseUrl}/artiklar/${slug}` },
        openGraph: {
            title: pageTitle,
            description: post.frontmatter.description,
            url: `${siteBaseUrl}/artiklar/${slug}`,
            images: imageUrl ? [{ url: imageUrl }] : undefined,
            type: 'article',
            publishedTime: publishedDate,
            authors: post.frontmatter.author ? [post.frontmatter.author] : undefined,
            tags: post.frontmatter.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: post.frontmatter.description,
            images: imageUrl ? [imageUrl] : undefined,
        },
    };
}

// --- STATIC PARAMS GENERERING (OFÖRÄNDRAT) ---
export async function generateStaticParams() {
    // ... (exakt samma kod som tidigare) ...
    console.log("Generating static params for articles...");
    const posts = await getAllPostsMeta();
    const params = posts.map((post) => ({ slug: post.slug }));
    console.log(`Generated ${params.length} static params.`);
    return params;
}


// --- HJÄLPFUNKTIONER FÖR SCHEMA MARKUP (OFÖRÄNDRADE) ---

function generateArticleSchema(post: Post, slug: string): React.ReactNode | null {
    // ... (exakt samma kod som tidigare) ...
    if (!post || !post.frontmatter || !post.frontmatter.title || !post.frontmatter.date || !slug) {
        console.warn("generateArticleSchema: Saknar nödvändig data (post, titel, datum eller slug).");
        return null;
    }
    const siteBaseUrl = "https://www.jobbcoach.ai";
    const publisherName = "jobbcoach.ai";
    const publisherLogoUrl = `${siteBaseUrl}/images/logo-cvbrev-600x60.png`;
    const defaultAuthorName = "Teamet på jobbcoach.ai";
    const canonicalUrl = `${siteBaseUrl}/artiklar/${slug}`;
    const publisher = { "@type": "Organization", "name": publisherName, "logo": { "@type": "ImageObject", "url": publisherLogoUrl } };
    const authorName = post.frontmatter.author || defaultAuthorName;
    const isOrganizationAuthor = !post.frontmatter.author || authorName === defaultAuthorName;
    const author: { "@type": string; name: string; url?: string } = { "@type": isOrganizationAuthor ? "Organization" : "Person", "name": authorName };
    if (isOrganizationAuthor) { author.url = siteBaseUrl; }
    const imageUrl = post.frontmatter.image ? (post.frontmatter.image.startsWith('http') ? post.frontmatter.image : `${siteBaseUrl}${post.frontmatter.image}`) : undefined;
    try {
        const schema: Record<string, any> = {
            "@context": "https://schema.org", "@type": "BlogPosting",
            "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
            "headline": post.frontmatter.title,
            "description": post.frontmatter.description || undefined,
            "image": imageUrl ? { "@type": "ImageObject", "url": imageUrl } : undefined,
            "datePublished": new Date(post.frontmatter.date).toISOString(),
            "author": author, "publisher": publisher, "url": canonicalUrl
        };
        Object.keys(schema).forEach(key => { if (typeof schema[key] === 'object' && schema[key] !== null && Object.keys(schema[key]).length === 0) { delete schema[key]; } else if (schema[key] === undefined) { delete schema[key]; } });
        if (schema.image && !schema.image.url) { delete schema.image; }
        return (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }} key="article-schema" />);
    } catch (error) { console.error("Error generating Article schema:", error); return null; }
}

function generateFaqSchema(data: FaqItemData[] | undefined): React.ReactNode | null {
    // ... (exakt samma kod som tidigare) ...
    if (!Array.isArray(data) || data.length === 0) { return null; }
    const cleanTextForSchema = (text: string): string => text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/<\/?[^>]+(>|$)/g, "").replace(/\*/g, '').replace(/•\s*/g, '').replace(/\n\s*[*|-]\s*/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    try {
        const schema = {
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": data.map(item => {
                if (!item || typeof item.question !== 'string' || typeof item.answer !== 'string') { console.warn("Invalid item found in FAQ data:", item); return null; }
                return { "@type": "Question", "name": item.question.trim(), "acceptedAnswer": { "@type": "Answer", "text": cleanTextForSchema(item.answer) } };
            }).filter(item => item !== null)
        };
        if (schema.mainEntity.length === 0) { console.warn("No valid FAQ entities found after filtering."); return null; }
        return (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }} key="faq-schema" />);
    } catch (error) { console.error("Error generating FAQ schema:", error); return null; }
}

// Funktion för att injicera BroadConversionBanner i MDX-innehåll
function injectBannerIntoContent(content: string): string {
    // Redan innehåller bannern? Hoppa över injection
    if (content.includes('<BroadConversionBanner') || content.includes('BroadConversionBanner')) {
        return content;
    }

    // Dela upp innehållet i stycken
    const paragraphs = content.split('\n\n');

    // Om det finns minst 3 stycken, lägg in bannern efter det andra stycket
    // Om bara 1-2 stycken, lägg in den efter första stycket
    let insertIndex = 1;
    if (paragraphs.length >= 3) {
        insertIndex = 2;
    }

    // Lägg in banner-komponenten
    paragraphs.splice(insertIndex, 0, '\n<BroadConversionBanner />\n');

    return paragraphs.join('\n\n');
}

// --- SIDKOMPONENTEN (ArticlePage) ---
export default async function ArticlePage({ params }: ArticlePageProps) {
    // Lös params-promiset (OFÖRÄNDRAT)
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Hämta aktuell post (OFÖRÄNDRAT)
    const post = getPostBySlug(slug);

    // --- NYTT: Hämta all post-metadata för sidebaren ---
    const allPostsMeta = await getAllPostsMeta();

    if (!post) { // (OFÖRÄNDRAT)
        notFound();
    }

    // Injicera BroadConversionBanner automatiskt i innehållet
    const contentWithBanner = injectBannerIntoContent(post.content);

    // Hämta FAQ-data från frontmatter (OFÖRÄNDRAT)
    const articleFaqData: FaqItemData[] | undefined = post.frontmatter.faq;

    // Definiera komponenter för MDX
    const components = {
        FAQContainer: FAQContainer,
        FAQItem: FAQItem,
        CustomImage: CustomImage,
        Link: Link,
        // Lägg till konverteringskomponenter som kan användas i MDX
        BroadConversionBanner: BroadConversionBanner,
        CVTemplateShowcase: CVTemplateShowcase,
        img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
            if (!props.src) {
                console.warn(`MDX img tag in article "${slug}" is missing src attribute.`);
                return null;
            }
            const customImageProps = {
                src: props.src,
                alt: props.alt || `Bild i artikeln ${post.frontmatter.title}`,
                slug: slug
            };
            return <CustomImage {...customImageProps} />;
        },
        a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
             const href = props.href || '';
            if (href.startsWith('/') || href.startsWith('#')) {
                return <Link href={href} {...props}>{props.children}</Link>;
            }
            return <a target="_blank" rel="noopener noreferrer" {...props} />;
        },
    };

    // Funktion för att rendera taggar - ljust tema
    const renderTags = () => {
         if (post.frontmatter.tags && post.frontmatter.tags.length > 0) {
            return (
                <div className="flex flex-wrap gap-2 mt-4">
                    {post.frontmatter.tags.map((tag: string) => (
                        <Link
                            href={`/artiklar?tag=${tag}`}
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 transition-all duration-150"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Generera båda schema-skripten (OFÖRÄNDRAT)
    const articleSchemaScript = generateArticleSchema(post, slug);
    const faqSchemaScript = generateFaqSchema(articleFaqData);

    // *** LJUST PREMIUM TEMA LAYOUT MED KONVERTERINGSKOMPONENTER ***
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
            <div className="container max-w-6xl px-4 py-16 mx-auto lg:py-20">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Huvudinnehåll - Kolumn 1 & 2 */}
                    <div className="lg:col-span-2">
                        <article className="prose prose-lg prose-gray prose-quoteless max-w-none
                            prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:mb-4
                            prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-h2:text-gray-900 prose-h2:mt-8 prose-h2:mb-4
                            prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-900
                            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6
                            prose-a:text-pink-600 hover:prose-a:text-pink-700 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-gray-900 prose-strong:font-semibold
                            prose-code:before:content-none prose-code:after:content-none
                            prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm
                            prose-blockquote:border-pink-300 prose-blockquote:bg-pink-50/50 prose-blockquote:text-gray-700 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
                            prose-ul:text-gray-700 prose-ol:text-gray-700
                            prose-li:text-gray-700 prose-li:mb-2
                        ">
                            {/* Artikelns header */}
                            <header className="mb-8 pb-6 border-b border-gray-200">
                                <h1 className="mb-4">{post.frontmatter.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <time dateTime={post.frontmatter.date}>
                                        {format(parseISO(post.frontmatter.date), 'd MMMM yyyy', { locale: sv })}
                                    </time>
                                    {post.frontmatter.author && (
                                        <>
                                            <span>•</span>
                                            <span>{post.frontmatter.author}</span>
                                        </>
                                    )}
                                </div>
                                {renderTags()}
                            </header>

                            {/* MDX-innehåll med automatisk konverteringskomponent-injektion */}
                            <div className="article-content">
                                <MDXRemote source={contentWithBanner} components={components} />

                                {/* Lägg till showcase efter innehåll om det inte redan finns i MDX */}
                                {!contentWithBanner.includes('<CVTemplateShowcase') && !contentWithBanner.includes('CVTemplateShowcase') && (
                                    <CVTemplateShowcase />
                                )}
                            </div>

                            {/* ComprehensiveServiceCard alltid efter innehåll */}
                            <ComprehensiveServiceCard />

                            {/* Artikelns footer */}
                            <footer className="mt-12 pt-6 border-t border-gray-200">
                                <Link
                                    href="/artiklar"
                                    className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
                                >
                                    ← Tillbaka till alla artiklar
                                </Link>
                            </footer>
                        </article>
                    </div>

                    {/* Sidebar - Kolumn 3 */}
                    <div className="lg:col-span-1">
                        <ArticleSidebar
                            allPosts={allPostsMeta}
                            currentPostSlug={slug}
                            currentPostTags={post.frontmatter.tags}
                        />
                    </div>

                </div>

                {/* Schema markup */}
                {articleSchemaScript}
                {faqSchemaScript}
            </div>
        </div>
    );
}