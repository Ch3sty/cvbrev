// Server Component - No 'use client' directive
import { notFound } from 'next/navigation';
import { getAllPostsMeta, getPostBySlug, Post, FaqItemData, PostMeta } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata, ResolvingMetadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import Link from 'next/link';
import React from 'react';
import { extractHeadingsFromContent, filterH2Headings } from '@/lib/extractHeadings';

// Importera MDX-komponenter
import CustomImage from '@/components/mdx/Image';
import FAQContainer from '@/components/mdx/FAQContainer';
import FAQItem from '@/components/mdx/FAQItem';
import PersonligtBrevExample from '@/components/mdx/PersonligtBrevExample';
import PersonligtBrevExampleLarare from '@/components/mdx/PersonligtBrevExampleLarare';
import PersonligtBrevExampleBarnskotare from '@/components/mdx/PersonligtBrevExampleBarnskotare';
import PersonligtBrevExampleLakare from '@/components/mdx/PersonligtBrevExampleLakare';
import PersonligtBrevExampleSommarjobb from '@/components/mdx/PersonligtBrevExampleSommarjobb';
import PersonligtBrevExampleSjukskoterska from '@/components/mdx/PersonligtBrevExampleSjukskoterska';
import PersonligtBrevExamplePersonligAssistent from '@/components/mdx/PersonligtBrevExamplePersonligAssistent';
import PersonligtBrevExampleAdministrator from '@/components/mdx/PersonligtBrevExampleAdministrator';
import PersonligtBrevExampleSaljare from '@/components/mdx/PersonligtBrevExampleSaljare';
import PersonligtBrevExampleForskollarare from '@/components/mdx/PersonligtBrevExampleForskollarare';
import PersonligtBrevExampleButikssaljare from '@/components/mdx/PersonligtBrevExampleButikssaljare';
import PersonligtBrevExampleEngelska from '@/components/mdx/PersonligtBrevExampleEngelska';
import PersonligtBrevExampleLagerarbetare from '@/components/mdx/PersonligtBrevExampleLagerarbetare';
import PersonligtBrevExampleVardOmsorg from '@/components/mdx/PersonligtBrevExampleVardOmsorg';
import PersonligtBrevExampleEkonomiassistent from '@/components/mdx/PersonligtBrevExampleEkonomiassistent';
import PersonligtBrevExampleReceptionist from '@/components/mdx/PersonligtBrevExampleReceptionist';
import PersonligtBrevExampleUtanErfarenhet from '@/components/mdx/PersonligtBrevExampleUtanErfarenhet';
import PersonligtBrevExampleIngenjor from '@/components/mdx/PersonligtBrevExampleIngenjor';
import PersonligtBrevExampleIT from '@/components/mdx/PersonligtBrevExampleIT';
import PersonligtBrevExampleKurator from '@/components/mdx/PersonligtBrevExampleKurator';
import PersonligtBrevExampleStadare from '@/components/mdx/PersonligtBrevExampleStadare';
import PersonligtBrevExampleHandlaggare from '@/components/mdx/PersonligtBrevExampleHandlaggare';
import PersonligtBrevExampleUtbildning from '@/components/mdx/PersonligtBrevExampleUtbildning';
import PersonligtBrevPreview from '@/components/mdx/PersonligtBrevPreview';
import LayoutFormatExample from '@/components/mdx/LayoutFormatExample';
import CoverLetterHeaderExample from '@/components/mdx/CoverLetterHeaderExample';
import CVExample from '@/components/mdx/CVExample';

// Importera artikelkomponenter
import ArticleClientWrapper from '@/components/artiklar/ArticleClientWrapper';
import BroadConversionBanner from '@/components/artiklar/BroadConversionBanner';
import CVTemplateShowcase from '@/components/artiklar/CVTemplateShowcase';
import ComprehensiveServiceCard from '@/components/artiklar/ComprehensiveServiceCard';

// Importera författarsystem
import { getAuthorForArticle, generateAuthorSchema } from '@/lib/authors';

// Korrekt typdefinition för props med Promise
interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// --- METADATA GENERERING ---
export async function generateMetadata(
    { params }: ArticlePageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
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

// --- STATIC PARAMS GENERERING ---
export async function generateStaticParams() {
    console.log("Generating static params for articles...");
    const posts = await getAllPostsMeta();
    const params = posts.map((post) => ({ slug: post.slug }));
    console.log(`Generated ${params.length} static params.`);
    return params;
}

// --- HJÄLPFUNKTIONER FÖR SCHEMA MARKUP ---
function generateEnhancedArticleSchema(post: Post, slug: string, headings: any[]): React.ReactNode | null {
    if (!post || !post.frontmatter || !post.frontmatter.title || !post.frontmatter.date || !slug) {
        console.warn("generateArticleSchema: Saknar nödvändig data (post, titel, datum eller slug).");
        return null;
    }
    const siteBaseUrl = "https://www.jobbcoach.ai";
    const publisherName = "jobbcoach.ai";
    const publisherLogoUrl = `${siteBaseUrl}/images/logo-cvbrev-600x60.png`;
    const canonicalUrl = `${siteBaseUrl}/artiklar/${slug}`;

    // Hämta författare från vårt nya system
    const articleAuthor = getAuthorForArticle(slug, post.frontmatter.tags || [], post.frontmatter.title);
    const authorSchema = generateAuthorSchema(articleAuthor, canonicalUrl);

    const publisher = {
        "@type": "Organization",
        "name": publisherName,
        "logo": { "@type": "ImageObject", "url": publisherLogoUrl },
        "sameAs": [
            "https://www.linkedin.com/company/jobbcoach-ai",
            "https://twitter.com/jobbcoach_ai"
        ]
    };
    const imageUrl = post.frontmatter.image ? (post.frontmatter.image.startsWith('http') ? post.frontmatter.image : `${siteBaseUrl}${post.frontmatter.image}`) : undefined;
    try {
        const schema: Record<string, any> = {
            "@context": "https://schema.org", "@type": "BlogPosting",
            "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
            "headline": post.frontmatter.title,
            "description": post.frontmatter.description || undefined,
            "image": imageUrl ? { "@type": "ImageObject", "url": imageUrl, "width": 1200, "height": 630 } : undefined,
            "datePublished": new Date(post.frontmatter.date).toISOString(),
            "dateModified": new Date().toISOString(),
            "author": authorSchema,
            "publisher": publisher,
            "url": canonicalUrl,
            "inLanguage": "sv-SE",
            "articleSection": "Career Advice",
            "wordCount": post.content.split(/\s+/).length,
            "keywords": post.frontmatter.tags?.join(', ')
        };

        // Add Table of Contents structured data for SEO
        if (headings && headings.length > 0) {
            schema.hasPart = headings.map(heading => ({
                "@type": "WebPageElement",
                "name": heading.text,
                "url": `${canonicalUrl}#${heading.id}`,
                "isPartOf": { "@type": "Article", "url": canonicalUrl }
            }));

            // Add speakable schema for voice assistants
            schema.speakable = {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", "h2", ".article-content"]
            };
        }

        Object.keys(schema).forEach(key => { if (typeof schema[key] === 'object' && schema[key] !== null && Object.keys(schema[key]).length === 0) { delete schema[key]; } else if (schema[key] === undefined) { delete schema[key]; } });
        if (schema.image && !schema.image.url) { delete schema.image; }
        return (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }} key="article-schema" />);
    } catch (error) { console.error("Error generating Article schema:", error); return null; }
}

function generateFaqSchema(data: FaqItemData[] | undefined): React.ReactNode | null {
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

// Funktion för att injicera CVTemplateShowcase i mitten av MDX-innehåll
function injectCVTemplateShowcase(content: string): string {
    // Redan innehåller CV showcase? Hoppa över injection
    if (content.includes('<CVTemplateShowcase') || content.includes('CVTemplateShowcase')) {
        return content;
    }

    // Dela upp innehållet i stycken
    const paragraphs = content.split('\n\n');

    // Om innehållet är för kort, lägg inte in showcase
    if (paragraphs.length < 4) {
        return content;
    }

    // Beräkna mitten av innehållet (runt 50-60% av vägen genom artikeln)
    const totalParagraphs = paragraphs.length;
    const middleIndex = Math.floor(totalParagraphs * 0.55); // 55% genom artikeln

    // Säkerställ att vi inte går utanför gränserna
    const insertIndex = Math.max(3, Math.min(middleIndex, totalParagraphs - 2));

    // Lägg in CV Template Showcase
    paragraphs.splice(insertIndex, 0, '\n<CVTemplateShowcase />\n');

    return paragraphs.join('\n\n');
}

// --- SIDKOMPONENTEN (ArticlePage) ---
export default async function ArticlePage({ params }: ArticlePageProps) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const post = getPostBySlug(slug);
    const allPostsMeta = await getAllPostsMeta();

    if (!post) {
        notFound();
    }

    // Extract headings for SEO-optimized TOC
    const headings = filterH2Headings(extractHeadingsFromContent(post.content));

    // Injicera båda komponenter i innehållet - UTAN att modifiera headings
    const contentWithBanner = injectBannerIntoContent(post.content);
    const contentWithBannerAndCV = injectCVTemplateShowcase(contentWithBanner);
    const articleFaqData: FaqItemData[] | undefined = post.frontmatter.faq;

    // Calculate reading time
    const wordCount = post.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Definiera komponenter för MDX
    const components = {
        FAQContainer: FAQContainer,
        FAQItem: FAQItem,
        CustomImage: CustomImage,
        Link: Link,
        // Lägg till konverteringskomponenter som kan användas i MDX
        BroadConversionBanner: BroadConversionBanner,
        CVTemplateShowcase: CVTemplateShowcase,
        PersonligtBrevExample: PersonligtBrevExample,
        PersonligtBrevExampleLarare: PersonligtBrevExampleLarare,
        PersonligtBrevExampleBarnskotare: PersonligtBrevExampleBarnskotare,
        PersonligtBrevExampleLakare: PersonligtBrevExampleLakare,
        PersonligtBrevExampleSommarjobb: PersonligtBrevExampleSommarjobb,
        PersonligtBrevExampleSjukskoterska: PersonligtBrevExampleSjukskoterska,
        PersonligtBrevExamplePersonligAssistent: PersonligtBrevExamplePersonligAssistent,
        PersonligtBrevExampleAdministrator: PersonligtBrevExampleAdministrator,
        PersonligtBrevExampleSaljare: PersonligtBrevExampleSaljare,
        PersonligtBrevExampleForskollarare: PersonligtBrevExampleForskollarare,
        PersonligtBrevExampleButikssaljare: PersonligtBrevExampleButikssaljare,
        PersonligtBrevExampleEngelska: PersonligtBrevExampleEngelska,
        PersonligtBrevExampleLagerarbetare: PersonligtBrevExampleLagerarbetare,
        PersonligtBrevExampleVardOmsorg: PersonligtBrevExampleVardOmsorg,
        PersonligtBrevExampleEkonomiassistent: PersonligtBrevExampleEkonomiassistent,
        PersonligtBrevExampleReceptionist: PersonligtBrevExampleReceptionist,
        PersonligtBrevExampleUtanErfarenhet: PersonligtBrevExampleUtanErfarenhet,
        PersonligtBrevExampleIngenjor: PersonligtBrevExampleIngenjor,
        PersonligtBrevExampleIT: PersonligtBrevExampleIT,
        PersonligtBrevExampleKurator: PersonligtBrevExampleKurator,
        PersonligtBrevExampleStadare: PersonligtBrevExampleStadare,
        PersonligtBrevExampleHandlaggare: PersonligtBrevExampleHandlaggare,
        PersonligtBrevExampleUtbildning: PersonligtBrevExampleUtbildning,
        PersonligtBrevPreview: PersonligtBrevPreview,
        LayoutFormatExample: LayoutFormatExample,
        CoverLetterHeaderExample: CoverLetterHeaderExample,
        CVExample: CVExample,
        // Automatisk ID-generering för h2 headings - SEO-optimerad
        h2: (props: any) => {
            const text = typeof props.children === 'string' ? props.children : '';
            const id = text
                .toLowerCase()
                .replace(/[åä]/g, 'a')
                .replace(/ö/g, 'o')
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                || 'section';
            return <h2 id={id} {...props} />;
        },
        // Automatisk ID-generering för h3 headings
        h3: (props: any) => {
            const text = typeof props.children === 'string' ? props.children : '';
            const id = text
                .toLowerCase()
                .replace(/[åä]/g, 'a')
                .replace(/ö/g, 'o')
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                || 'subsection';
            return <h3 id={id} {...props} />;
        },
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

    // Generera båda schema-skripten med TOC-data för SEO
    const articleSchemaScript = generateEnhancedArticleSchema(post, slug, headings);
    const faqSchemaScript = generateFaqSchema(articleFaqData);

    return (
        <>
            <ArticleClientWrapper
                post={post}
                slug={slug}
                allPostsMeta={allPostsMeta}
                readingTime={readingTime}
                headings={headings}
            >
                <MDXRemote source={contentWithBannerAndCV} components={components} />


                {/* Comprehensive Service Card - Final CTA */}
                <div className="mt-12">
                    <ComprehensiveServiceCard />
                </div>
            </ArticleClientWrapper>

            {/* Schema markup */}
            {articleSchemaScript}
            {faqSchemaScript}
        </>
    );
}