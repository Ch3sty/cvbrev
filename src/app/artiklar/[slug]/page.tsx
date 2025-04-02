// src/app/artiklar/[slug]/page.tsx
// KORRIGERAD: Borttaget 'async' och 'use(params)' från sidkomponenten.
// Använder standardhantering av params för Server Components.

import { notFound } from 'next/navigation';
import { getAllPostsMeta, getPostBySlug, Post, FaqItemData } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata, ResolvingMetadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import Link from 'next/link';
import React from 'react'; // Import av 'use' borttagen härifrån

// Importera dina MDX-komponenter
import CustomImage from '@/components/mdx/Image';
import FAQContainer from '@/components/mdx/FAQContainer';
import FAQItem from '@/components/mdx/FAQItem';

// generateMetadata (förblir async, hanterar params korrekt)
export async function generateMetadata(
    { params }: { params: { slug: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = params.slug;
    console.log(`Generating metadata for slug: ${slug}`);
    const post = getPostBySlug(slug);

    if (!post) {
        console.warn(`Metadata generation: Post not found for slug ${slug}`);
        return { title: 'Artikeln Hittades Inte' };
    }

    console.log(`Metadata generation: Found post "${post.frontmatter.title}"`);
    const pageTitle = post.frontmatter.title;
    const publishedDate = post.frontmatter.date ? new Date(post.frontmatter.date).toISOString() : undefined;

    return {
        title: `${pageTitle} | cvbrev.se`,
        description: post.frontmatter.description,
        alternates: { canonical: `/artiklar/${slug}` },
        openGraph: {
            title: pageTitle,
            description: post.frontmatter.description,
            url: `/artiklar/${slug}`,
            images: post.frontmatter.image ? [{ url: post.frontmatter.image }] : undefined,
            type: 'article',
            publishedTime: publishedDate,
            authors: post.frontmatter.author ? [post.frontmatter.author] : undefined,
            tags: post.frontmatter.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: post.frontmatter.description,
            images: post.frontmatter.image ? [post.frontmatter.image] : undefined,
        },
    };
}

// generateStaticParams (förblir async, korrekt)
export async function generateStaticParams() {
    console.log("Generating static params for articles...");
    const posts = await getAllPostsMeta();
    const params = posts.map((post) => ({ slug: post.slug }));
    console.log(`Generated ${params.length} static params.`);
    return params;
}


// Helper function to generate JSON-LD script (Oförändrad)
function generateFaqSchema(data: FaqItemData[]) {
    if (!Array.isArray(data) || data.length === 0) {
        console.warn("generateFaqSchema called with invalid or empty data.");
        return null;
    }

    const cleanTextForSchema = (text: string): string => {
        return text
           .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Tar bort markdown-länkar
           .replace(/<\/?[^>]+(>|$)/g, "")       // Tar bort HTML-taggar
           .replace(/\*/g, '')                   // Tar bort asterisker
           .replace(/•\s*/g, '')                 // Tar bort listpunkter •
           .replace(/\n\s*[*|-]\s*/g, ' ')       // Ersätter markdown list-items med mellanslag
           .replace(/\n/g, ' ')                 // Ersätter övriga nyarader med mellanslag
           .replace(/\s+/g, ' ')                 // Ersätter multipla whitespace med en
           .trim();
    };

    try {
        const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.map(item => {
                if (!item || typeof item.question !== 'string' || typeof item.answer !== 'string') {
                    console.warn("Invalid item found in FAQ data:", item);
                    return null;
                }
                 return {
                    "@type": "Question",
                    "name": item.question.trim(),
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": cleanTextForSchema(item.answer)
                    }
                 };
            }).filter(item => item !== null)
        };

        if (schema.mainEntity.length === 0) {
             console.warn("No valid FAQ entities found after filtering.");
             return null;
        }

        return (
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
            />
        );
    } catch (error) {
        console.error("Error generating FAQ schema:", error);
        return null;
    }
}


// The page component itself - NU UTAN async och use()
export default function ArticlePage( // <-- 'async' borttaget
    { params }: { params: { slug: string } } // <-- Standard prop-typ för params
) {
    // Få slug direkt från params-objektet
    const slug = params.slug; // <-- Direkt åtkomst, ingen 'use()'

    console.log(`Rendering ArticlePage for slug: ${slug}`);
    const post = getPostBySlug(slug); // Använd direkt slug

    if (!post) {
        console.warn(`ArticlePage: Post not found for slug ${slug}, calling notFound().`);
        notFound();
    }
    console.log(`ArticlePage: Rendering post "${post.frontmatter.title}"`);

    const articleFaqData: FaqItemData[] | undefined = post.frontmatter.faq;

    const components = {
        FAQContainer: FAQContainer,
        FAQItem: FAQItem,
        CustomImage: CustomImage,
        Link: Link,
        img: CustomImage,
        a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
            const href = props.href || '';
            if (href.startsWith('/') || href.startsWith('#')) {
                return <Link href={href} {...props}>{props.children}</Link>;
            }
            return <a target="_blank" rel="noopener noreferrer" {...props} />;
        },
    };

    const renderTags = () => {
        if (post.frontmatter.tags && post.frontmatter.tags.length > 0) {
            return (
                <div className="flex flex-wrap gap-2 mt-4">
                    {post.frontmatter.tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-700 text-gray-300 border border-navy-600">
                            {tag}
                        </span>
                    ))}
                </div>
            );
        }
        return null;
    };

    const faqSchemaScript = (Array.isArray(articleFaqData) && articleFaqData.length > 0)
        ? generateFaqSchema(articleFaqData)
        : null;

    return (
        <div className="container max-w-3xl px-4 py-12 mx-auto">
            <article className="prose prose-invert prose-quoteless prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-a:text-pink-400 hover:prose-a:text-pink-300 prose-strong:text-white prose-code:before:content-none prose-code:after:content-none prose-code:text-pink-300 prose-code:bg-navy-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-pink-500 prose-blockquote:text-gray-300">
                <header className="mb-8 border-b border-gray-700 pb-6">
                    <h1>{post.frontmatter.title}</h1>
                    <p className="text-sm text-gray-400">
                        Publicerad den {format(parseISO(post.frontmatter.date), 'd MMMM yyyy', { locale: sv })}
                        {post.frontmatter.author && ` av ${post.frontmatter.author}`}
                    </p>
                    {renderTags()}
                </header>

                <MDXRemote source={post.content} components={components} />

                <footer className="mt-12 pt-6 border-t border-gray-700">
                     <Link href="/artiklar" className="text-pink-500 hover:text-pink-400 no-underline">
                        ← Tillbaka till alla artiklar
                    </Link>
                </footer>
            </article>

            {faqSchemaScript}
        </div>
    );
}