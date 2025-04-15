// src/app/artiklar/[slug]/page.tsx
// Uppdaterad för att använda grid-layout och ArticleSidebar,
// förutsätter att ArticleSidebar.tsx innehåller infoboxarna.
// Inga ändringar i SEO/Schema/MDX-rendering.

import { notFound } from 'next/navigation';
// Säkerställ att Post och PostMeta exporteras från lib/blog
import { getAllPostsMeta, getPostBySlug, Post, FaqItemData, PostMeta } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata, ResolvingMetadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import Link from 'next/link';
import React from 'react';

// Importera dina MDX-komponenter (OFÖRÄNDRAT)
import CustomImage from '@/components/mdx/Image';
import FAQContainer from '@/components/mdx/FAQContainer';
import FAQItem from '@/components/mdx/FAQItem';

// --- NYTT: Importera sidebar-komponenten ---
import ArticleSidebar from '@/components/artiklar/ArticleSidebar'; // Säkerställ att denna fil har infoboxarna

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

    // Hämta FAQ-data från frontmatter (OFÖRÄNDRAT)
    const articleFaqData: FaqItemData[] | undefined = post.frontmatter.faq;

    // Definiera komponenter för MDX (OFÖRÄNDRAT)
    const components = {
        FAQContainer: FAQContainer,
        FAQItem: FAQItem,
        CustomImage: CustomImage,
        Link: Link,
        img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
            // ... (exakt samma kod som tidigare) ...
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
            // ... (exakt samma kod som tidigare) ...
             const href = props.href || '';
            if (href.startsWith('/') || href.startsWith('#')) {
                return <Link href={href} {...props}>{props.children}</Link>;
            }
            return <a target="_blank" rel="noopener noreferrer" {...props} />;
        },
        // ... (eventuella andra MDX-komponenter) ...
    };

    // Funktion för att rendera taggar (ENDAST LÄNKAR TILLAGDA)
    const renderTags = () => {
         if (post.frontmatter.tags && post.frontmatter.tags.length > 0) {
            return (
                <div className="flex flex-wrap gap-2 mt-4">
                    {post.frontmatter.tags.map((tag: string) => (
                        <Link
                            href={`/artiklar?tag=${encodeURIComponent(tag)}`}
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-700 text-gray-300 border border-navy-600 hover:bg-navy-600 hover:border-pink-500/50 hover:text-pink-400 transition-all duration-150"
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

    // *** UPPDATERAD LAYOUT MED GRID OCH SIDEBAR ***
    return (
        <div className="container max-w-6xl px-4 py-16 mx-auto lg:py-20">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

                {/* Kolumn 1 & 2: Artikelinnehåll */}
                <div className="lg:col-span-2">
                    {/* Behåll exakt samma artikel-rendering och prose-styling */}
                    <article className="prose prose-invert prose-quoteless prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-a:text-pink-400 hover:prose-a:text-pink-300 prose-strong:text-white prose-code:before:content-none prose-code:after:content-none prose-code:text-pink-300 prose-code:bg-navy-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-pink-500 prose-blockquote:text-gray-300">
                        {/* Artikelns header (OFÖRÄNDRAT, förutom att renderTags nu gör länkar) */}
                        <header className="mb-8 border-b border-gray-700 pb-6">
                            <h1>{post.frontmatter.title}</h1>
                            <p className="text-sm text-gray-400">
                                Publicerad den {format(parseISO(post.frontmatter.date), 'd MMMM yyyy', { locale: sv })}
                                {post.frontmatter.author && ` av ${post.frontmatter.author}`}
                            </p>
                            {renderTags()}
                        </header>

                        {/* Rendera MDX-innehållet (OFÖRÄNDRAT) */}
                        <MDXRemote source={post.content} components={components} />

                        {/* Artikelns footer (OFÖRÄNDRAT) */}
                        <footer className="mt-12 pt-6 border-t border-gray-700">
                             <Link href="/artiklar" className="text-pink-500 hover:text-pink-400 no-underline">
                                ← Tillbaka till alla artiklar
                            </Link>
                        </footer>
                    </article>
                </div> {/* Slut på artikelkolumn */}

                {/* Kolumn 3: Sidebar */}
                <div className="lg:col-span-1">
                    {/* Rendera sidebar-komponenten (som ska innehålla infoboxarna) */}
                    <ArticleSidebar
                        allPosts={allPostsMeta} // Skicka med all post-metadata
                        currentPostSlug={slug} // Skicka med aktuell slug
                        currentPostTags={post.frontmatter.tags} // Skicka med aktuella taggar
                    />
                </div> {/* Slut på sidebarkolumn */}

            </div> {/* Slut på grid */}

            {/* Renderar schema-skripten (OFÖRÄNDRAT, utanför grid) */}
            {articleSchemaScript}
            {faqSchemaScript}
        </div> // Slut på container
    );
}