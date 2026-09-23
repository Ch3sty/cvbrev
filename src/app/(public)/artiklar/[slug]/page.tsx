// Server Component - No 'use client' directive
import { notFound } from 'next/navigation';
import { getAllPostsMeta, getPostBySlug, Post, FaqItemData, HowToData, PostMeta } from '@/lib/blog';
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
import UppsagningstidRaknare from '@/components/rakna/UppsagningstidRaknare';
import LoneforhandlingsKalkylator from '@/components/rakna/LoneforhandlingsKalkylator';
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

// Artikelramen i linjen (docs/design/analys-artiklar-2026-09-23.html).
// Serverrenderad; enda klientkoden är ArtikelKlient (mätning och
// innehållsförteckningens tråd), mallväljaren och mobilens klistrade knapp.
import ArtikelRam, { type RelateradArtikel } from '@/components/artiklar/ArtikelRam';
import { InlineKort, SlutKort } from '@/components/artiklar/reklam/ArtikelReklam';
import MallMiniatyrer from '@/components/cv/MallMiniatyrer';
import { BrevMallVisning, CvMallVisning } from '@/components/artiklar/MallVisningar';
import StickyMobileCTA from '@/components/shared/StickyMobileCTA';
import {
    getCtaVariantForTags,
    inlineVerktygForKluster,
    paketForKluster,
    type CtaCluster,
    type InlineVerktyg,
} from '@/lib/cta/clusters';

// MDX-aliasen behålls så att artiklarna inte ändras: CVTemplateShowcase är
// nu MallMiniatyrer (riktiga mallar ur registret), InteractiveCVShowcase och
// InteractiveLetterShowcase är mallvisningen med serverrenderat dokument.
// BroadConversionBanner binds per artikel i ArticlePage.
const CVTemplateShowcase = MallMiniatyrer;

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
    // seoTitle styr <title>-taggen (kort, ≤60 tecken inkl. varumärke). Annars fallback
    // till title + suffix. OpenGraph/Twitter använder den längre, beskrivande titeln.
    const metaTitle = post.frontmatter.seoTitle || `${pageTitle} | jobbcoach.ai`;
    const publishedDate = post.frontmatter.date ? new Date(post.frontmatter.date).toISOString() : undefined;

    const siteBaseUrl = "https://www.jobbcoach.ai";
    const imageUrl = post.frontmatter.image
        ? (post.frontmatter.image.startsWith('http') ? post.frontmatter.image : `${siteBaseUrl}${post.frontmatter.image}`)
        : undefined;

    return {
        title: metaTitle,
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

// Artiklarna kommer från MDX i repot och ändras bara när vi deployar. Ett
// dygn som revalidate gör att CDN:et får behålla dem i stället för att slå
// mot origin per besök. Varje artikel väger 650-680 kB, så en missad
// cache-träff kostade både en ISR-läsning och hela sidan i origin-trafik.
export const revalidate = 86400;

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
            "image": imageUrl ? { "@type": "ImageObject", "url": imageUrl, "width": 1536, "height": 1024 } : undefined,
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

function generateHowToSchema(data: HowToData | undefined, slug: string): React.ReactNode | null {
    if (!data || typeof data.name !== 'string' || !Array.isArray(data.steps) || data.steps.length === 0) { return null; }
    const canonicalUrl = `https://www.jobbcoach.ai/artiklar/${slug}`;
    const cleanTextForSchema = (text: string): string => text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/<\/?[^>]+(>|$)/g, "").replace(/\*/g, '').replace(/•\s*/g, '').replace(/\n\s*[*|-]\s*/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    try {
        const steps = data.steps
            .filter(step => step && typeof step.text === 'string' && step.text.trim().length > 0)
            .map((step, i) => {
                const text = cleanTextForSchema(step.text);
                // name faller tillbaka på en kort version av texten om det saknas
                const name = (step.name && step.name.trim()) || (text.length > 60 ? text.slice(0, 57).trimEnd() + '…' : text);
                return { "@type": "HowToStep", "position": i + 1, "name": name, "text": text };
            });
        if (steps.length === 0) { console.warn("No valid HowTo steps found after filtering."); return null; }
        const schema: Record<string, any> = {
            "@context": "https://schema.org", "@type": "HowTo",
            "name": data.name.trim(),
            "step": steps,
        };
        if (data.description && data.description.trim()) { schema.description = cleanTextForSchema(data.description); }
        schema.mainEntityOfPage = { "@type": "WebPage", "@id": canonicalUrl };
        return (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }} key="howto-schema" />);
    } catch (error) { console.error("Error generating HowTo schema:", error); return null; }
}

// Injicerar klustrets inline-kort i MDX-innehållet (docs/plan-konvertering.md, C4).
// Karriärartiklar utan lön, uppsägning eller jobbyte hoppas över: de har ingen
// produkt att föreslå mitt i texten (analys-artiklar-2026-09-23, klusterregeln).
function injectClusterCta(content: string, verktyg: InlineVerktyg): string {
    if (verktyg === 'lankrad') {
        return content;
    }

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

// CV-relaterade taggar som triggar template-showcase
const CV_RELATED_TAGS = ['cv', 'cv-mall', 'cv mall', 'cv mallar', 'cv-mallar', 'cv-bild', 'cv bild', 'cv-tips', 'cv-skapande'];

function isCvRelatedArticle(tags: string[] | undefined): boolean {
    if (!tags || tags.length === 0) return false;
    const lowered = tags.map(t => t.toLowerCase());
    return lowered.some(tag =>
        CV_RELATED_TAGS.some(cvTag => tag.includes(cvTag))
    );
}

// Funktion för att injicera CVTemplateShowcase i mitten av MDX-innehåll.
// Bara för CV-relaterade artiklar, meningslöst på t.ex. brev- eller
// intervju-artiklar.
function injectCVTemplateShowcase(content: string, tags: string[] | undefined): string {
    // Hoppa över för icke-CV-artiklar
    if (!isCvRelatedArticle(tags)) {
        return content;
    }

    // Redan innehåller CV showcase? Hoppa över injection
    if (content.includes('<CVTemplateShowcase') || content.includes('CVTemplateShowcase')) {
        return content;
    }

    // Dela upp innehållet i stycken
    const paragraphs = content.split('\n\n');

    // Om innehållet är för kort, lägg inte in showcase
    if (paragraphs.length < 6) {
        return content;
    }

    // Beräkna mitten av innehållet (runt 60% av vägen genom artikeln)
    const totalParagraphs = paragraphs.length;
    const middleIndex = Math.floor(totalParagraphs * 0.6);

    // Säkerställ att vi inte går utanför gränserna
    const insertIndex = Math.max(3, Math.min(middleIndex, totalParagraphs - 2));

    // Lägg in CV Template Showcase
    paragraphs.splice(insertIndex, 0, '\n<CVTemplateShowcase />\n');

    return paragraphs.join('\n\n');
}

/**
 * Tre relaterade artiklar: flest gemensamma taggar, sedan nyast, fyllt med
 * de senaste. Samma urval som ArticleSidebar gjorde i klienten, nu på
 * servern så att bara tre artiklar följer med sidan i stället för alla.
 */
function relateradeArtiklar(alla: PostMeta[], slug: string, taggar: string[]): RelateradArtikel[] {
    const andra = alla.filter((p) => p.slug !== slug);
    const tid = (p: PostMeta) => (p.date ? parseISO(p.date).getTime() : 0);
    let urval: PostMeta[] = [];
    if (taggar.length > 0) {
        urval = andra
            .map((p) => ({ p, gemensamma: p.tags?.filter((t) => taggar.includes(t)).length || 0 }))
            .filter((x) => x.gemensamma > 0)
            .sort((a, b) => b.gemensamma - a.gemensamma || tid(b.p) - tid(a.p))
            .slice(0, 3)
            .map((x) => x.p);
    }
    if (urval.length < 3) {
        const senaste = andra
            .filter((p) => !urval.some((u) => u.slug === p.slug))
            .sort((a, b) => tid(b) - tid(a));
        urval = [...urval, ...senaste].slice(0, 3);
    }
    return urval.map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        lasminuter: Math.max(1, Math.ceil((p.wordCount ?? 1000) / 200)),
    }));
}

// --- SIDKOMPONENTEN (ArticlePage) ---
export default async function ArticlePage({ params }: ArticlePageProps) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const post = getPostBySlug(slug);
    if (!post) {
        notFound();
    }
    const allPostsMeta = getAllPostsMeta();

    // Extract headings for SEO-optimized TOC
    const headings = filterH2Headings(extractHeadingsFromContent(post.content));

    // Klustret styr vilken CTA artikeln får (docs/plan-konvertering.md, C4).
    const cluster: CtaCluster = getCtaVariantForTags(post.frontmatter.tags);
    const verktyg = inlineVerktygForKluster(cluster, post.frontmatter.tags);
    const paket = paketForKluster(cluster, post.frontmatter.tags);
    const author = getAuthorForArticle(slug, post.frontmatter.tags || [], post.frontmatter.title);
    const relaterade = relateradeArtiklar(allPostsMeta, slug, post.frontmatter.tags || []);

    // Injicera båda komponenter i innehållet - UTAN att modifiera headings.
    // CV-showcasen bara för cv-klustret, inte för alla cv-taggade artiklar.
    const contentWithBanner = injectClusterCta(post.content, verktyg);
    const contentWithBannerAndCV =
        cluster === 'cv'
            ? injectCVTemplateShowcase(contentWithBanner, post.frontmatter.tags)
            : contentWithBanner;
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
        UppsagningstidRaknare: UppsagningstidRaknare,
        LoneforhandlingsKalkylator: LoneforhandlingsKalkylator,
        // Lägg till konverteringskomponenter som kan användas i MDX
        // Aliaset bevaras för äldre MDX som skriver ut komponenten själv.
        BroadConversionBanner: () => <InlineKort cluster={cluster} verktyg={verktyg} slug={slug} />,
        CVTemplateShowcase: CVTemplateShowcase,
        PersonligtBrevTemplateShowcase: BrevMallVisning,
        InteractiveCVShowcase: CvMallVisning,
        InteractiveLetterShowcase: BrevMallVisning,
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

    // Generera schema-skript med TOC-data för SEO
    const articleSchemaScript = generateEnhancedArticleSchema(post, slug, headings);
    const faqSchemaScript = generateFaqSchema(articleFaqData);
    const howToSchemaScript = generateHowToSchema(post.frontmatter.howto, slug);

    // BreadcrumbList JSON-LD för SEO
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Hem",
                "item": "https://www.jobbcoach.ai"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Artiklar",
                "item": "https://www.jobbcoach.ai/artiklar"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": post.frontmatter.title,
                "item": `https://www.jobbcoach.ai/artiklar/${slug}`
            }
        ]
    };
    const breadcrumbSchemaScript = (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            key="breadcrumb-schema"
        />
    );

    return (
        <>
            <ArtikelRam
                slug={slug}
                title={post.frontmatter.title}
                description={post.frontmatter.description}
                date={post.frontmatter.date}
                tags={post.frontmatter.tags}
                readingTime={readingTime}
                author={author}
                headings={headings}
                cluster={cluster}
                paket={paket}
                relaterade={relaterade}
                sticky={<StickyMobileCTA cluster={cluster} slug={slug} />}
            >
                <MDXRemote source={contentWithBannerAndCV} components={components} />

                {/* Slutkortet: paketet för klustret, i bläck. */}
                {paket ? <SlutKort paket={paket} cluster={cluster} slug={slug} /> : null}
            </ArtikelRam>

            {/* Schema markup */}
            {articleSchemaScript}
            {faqSchemaScript}
            {howToSchemaScript}
            {breadcrumbSchemaScript}
        </>
    );
}