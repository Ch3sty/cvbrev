'use client'

import { notFound } from 'next/navigation';
import { getAllPostsMeta, getPostBySlug, Post, FaqItemData, PostMeta } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata, ResolvingMetadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronUp, Share2, Linkedin, Twitter, Facebook, BookOpen, Clock, Calendar, User } from 'lucide-react';

// Importera komponenter
import PremiumNavbar from '@/components/PremiumNavbar';
import FloatingAIAssistant from '@/components/FloatingAIAssistant';
import CustomImage from '@/components/mdx/Image';
import FAQContainer from '@/components/mdx/FAQContainer';
import FAQItem from '@/components/mdx/FAQItem';

// Importera artikelkomponenter
import PremiumArticleSidebar from '@/components/artiklar/PremiumArticleSidebar';
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
function ArticlePageContent({ post, slug, allPostsMeta, contentWithBanner, articleFaqData }: {
    post: Post;
    slug: string;
    allPostsMeta: PostMeta[];
    contentWithBanner: string;
    articleFaqData: FaqItemData[] | undefined;
}) {

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

    // Reading progress state
    const [showBackToTop, setShowBackToTop] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Back to top visibility
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Social sharing functions
    const shareUrl = `https://jobbcoach.ai/artiklar/${slug}`;
    const shareTitle = post.frontmatter.title;

    const handleShare = (platform: string) => {
        let url = '';
        switch (platform) {
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
        }
        if (url) window.open(url, '_blank', 'width=600,height=400');
    };

    // Calculate reading time
    const wordCount = post.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <div className="min-h-screen bg-white">
            {/* Premium Navbar */}
            <PremiumNavbar />

            {/* Floating AI Assistant */}
            <FloatingAIAssistant />

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-16 left-0 right-0 h-1 bg-gradient-to-r from-pink-600 to-purple-600 z-40 origin-left"
                style={{ scaleX }}
            />

            {/* Back to Top Button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-8 right-8 z-40 p-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                    >
                        <ChevronUp className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative pt-24">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-100 rounded-full opacity-20 blur-3xl" />
                    <div className="absolute top-60 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl" />
                </div>

                <div className="container max-w-7xl px-4 py-12 mx-auto">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* Main Content Column */}
                        <div className="lg:col-span-8">
                            <motion.article
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12"
                            >
                                {/* Article Header */}
                                <header className="mb-10">
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        {post.frontmatter.tags && post.frontmatter.tags.map((tag: string) => (
                                            <Link
                                                href={`/artiklar?tag=${tag}`}
                                                key={tag}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border border-purple-200/50 hover:from-pink-100 hover:to-purple-100 transition-all duration-200"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>

                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                        {post.frontmatter.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-pink-600" />
                                            <time dateTime={post.frontmatter.date}>
                                                {format(parseISO(post.frontmatter.date), 'd MMMM yyyy', { locale: sv })}
                                            </time>
                                        </div>

                                        {post.frontmatter.author && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-pink-600" />
                                                <span>{post.frontmatter.author}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-pink-600" />
                                            <span>{readingTime} min läsning</span>
                                        </div>

                                        {/* Social Share Buttons */}
                                        <div className="flex items-center gap-2 ml-auto">
                                            <span className="text-gray-500 mr-2">Dela:</span>
                                            <button
                                                onClick={() => handleShare('linkedin')}
                                                className="p-2 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                aria-label="Dela på LinkedIn"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleShare('twitter')}
                                                className="p-2 text-gray-600 hover:text-[#1DA1F2] hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                aria-label="Dela på Twitter"
                                            >
                                                <Twitter className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleShare('facebook')}
                                                className="p-2 text-gray-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                aria-label="Dela på Facebook"
                                            >
                                                <Facebook className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </header>

                                {/* Article Content */}
                                <div className="prose prose-lg prose-gray max-w-none
                                    prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:mb-6 prose-h1:mt-12
                                    prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-h2:text-gray-900 prose-h2:mt-10 prose-h2:mb-5
                                    prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-900 prose-h3:mt-8 prose-h3:mb-4
                                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6
                                    prose-a:text-transparent prose-a:bg-clip-text prose-a:bg-gradient-to-r prose-a:from-pink-600 prose-a:to-purple-600 prose-a:font-medium hover:prose-a:from-pink-500 hover:prose-a:to-purple-500 prose-a:no-underline hover:prose-a:underline
                                    prose-strong:text-gray-900 prose-strong:font-semibold
                                    prose-code:before:content-none prose-code:after:content-none
                                    prose-code:text-pink-600 prose-code:bg-gradient-to-r prose-code:from-pink-50 prose-code:to-purple-50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:border prose-code:border-pink-200/50
                                    prose-blockquote:border-l-4 prose-blockquote:border-pink-400 prose-blockquote:bg-gradient-to-r prose-blockquote:from-pink-50 prose-blockquote:to-purple-50 prose-blockquote:text-gray-700 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:italic
                                    prose-ul:text-gray-700 prose-ol:text-gray-700
                                    prose-li:text-gray-700 prose-li:mb-2
                                    prose-img:rounded-xl prose-img:shadow-lg
                                ">
                                    <MDXRemote source={contentWithBanner} components={components} />

                                    {/* CV Template Showcase */}
                                    {!contentWithBanner.includes('<CVTemplateShowcase') && !contentWithBanner.includes('CVTemplateShowcase') && (
                                        <CVTemplateShowcase />
                                    )}
                                </div>

                                {/* Comprehensive Service Card */}
                                <div className="mt-12">
                                    <ComprehensiveServiceCard />
                                </div>

                                {/* Article Footer */}
                                <footer className="mt-12 pt-8 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href="/artiklar"
                                            className="inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-medium hover:from-pink-500 hover:to-purple-500 transition-all duration-200"
                                        >
                                            ← Tillbaka till alla artiklar
                                        </Link>

                                        {/* Share prompt */}
                                        <div className="text-sm text-gray-600">
                                            Gillade du artikeln? Dela den med ditt nätverk!
                                        </div>
                                    </div>
                                </footer>
                            </motion.article>
                        </div>

                        {/* Premium Sidebar */}
                        <PremiumArticleSidebar
                            allPosts={allPostsMeta}
                            currentPostSlug={slug}
                            currentPostTags={post.frontmatter.tags}
                            content={post.content}
                        />
                    </div>
                </div>

            </div>

            {/* Schema markup */}
            {articleSchemaScript}
            {faqSchemaScript}
        </div>
    );
}

// Main async wrapper component
export default async function ArticlePage({ params }: ArticlePageProps) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const post = getPostBySlug(slug);
    const allPostsMeta = await getAllPostsMeta();

    if (!post) {
        notFound();
    }

    const contentWithBanner = injectBannerIntoContent(post.content);
    const articleFaqData: FaqItemData[] | undefined = post.frontmatter.faq;

    return (
        <ArticlePageContent
            post={post}
            slug={slug}
            allPostsMeta={allPostsMeta}
            contentWithBanner={contentWithBanner}
            articleFaqData={articleFaqData}
        />
    );
}