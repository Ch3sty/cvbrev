// src/app/artiklar/[slug]/page.tsx
// KORRIGERAD: Mappar både 'img' och 'CustomImage' i components-propen för MDXRemote.

import { notFound } from 'next/navigation';
import { getAllPostsMeta, getPostBySlug } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata, ResolvingMetadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import Link from 'next/link';
import React from 'react';

// *** Importera din anpassade bildkomponent ***
import CustomImage from '@/components/mdx/Image'; // Säkerställ att denna sökväg är korrekt

// Typ för de upplösta parametrarna
type ResolvedParams = { slug: string };

// Generate metadata dynamically for each article
export async function generateMetadata(
    { params: paramsPromise }: { params: Promise<ResolvedParams> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const params = await paramsPromise;
    const slug = params.slug;
    console.log(`Generating metadata for slug: ${slug}`);
    const post = getPostBySlug(slug);

    if (!post) {
        console.warn(`Metadata generation: Post not found for slug ${slug}`);
        return { title: 'Artikeln Hittades Inte' };
    }

    console.log(`Metadata generation: Found post "${post.frontmatter.title}"`);
    const publishedDate = post.frontmatter.date ? new Date(post.frontmatter.date).toISOString() : undefined;

    // Fyll i Open Graph och Twitter metadata (förkortat för läsbarhet)
    return {
        title: `${post.frontmatter.title} | cvbrev.se`,
        description: post.frontmatter.description,
        alternates: { canonical: `/artiklar/${slug}` },
        openGraph: {
            title: post.frontmatter.title,
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
            title: post.frontmatter.title,
            description: post.frontmatter.description,
            images: post.frontmatter.image ? [post.frontmatter.image] : undefined,
        },
    };
}

// Generate static paths at build time
export function generateStaticParams() {
    console.log("Generating static params for articles...");
    const posts = getAllPostsMeta();
    const params = posts.map((post) => ({ slug: post.slug }));
    console.log(`Generated ${params.length} static params.`);
    return params;
}

// The page component itself
export default async function ArticlePage(
    { params: paramsPromise }: { params: Promise<ResolvedParams> }
) {
    const params = await paramsPromise;
    const slug = params.slug;

    console.log(`Rendering ArticlePage for slug: ${slug}`);
    const post = getPostBySlug(slug);

    if (!post) {
        console.warn(`ArticlePage: Post not found for slug ${slug}, calling notFound().`);
        notFound();
    }
    console.log(`ArticlePage: Rendering post "${post.frontmatter.title}"`);

    // *** KORRIGERAD DEFINITION AV components-objektet ***
    const components = {
        img: CustomImage, // Mappa standard <img>-taggen (t.ex. från Markdown ![]())
        CustomImage: CustomImage, // Mappa komponenten du använder explicit i MDX (<CustomImage />)
        // Lägg till fler anpassade komponenter här om du behöver
        // Exempel:
        // a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
        //     // Öppna externa länkar i ny flik
        //     const isExternal = props.href?.startsWith('http');
        //     if (isExternal) {
        //         return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline"/>;
        //     }
        //     // Använd Next Link för interna länkar
        //     return <Link href={props.href || '#'} className="text-pink-400 hover:text-pink-300 underline" {...props}>{props.children}</Link>;
        // },
    };

    // Render the tags if they exist
    const renderTags = () => {
        if (post.frontmatter.tags && post.frontmatter.tags.length > 0) {
            return (
                <div className="flex flex-wrap gap-2 mt-4"> {/* Ökad marginal */}
                    {post.frontmatter.tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-700 text-gray-300 border border-navy-600"> {/* Justerad styling */}
                            {tag}
                        </span>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container max-w-3xl px-4 py-12 mx-auto">
            <article className="prose prose-invert prose-quoteless prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-a:text-pink-400 hover:prose-a:text-pink-300 prose-strong:text-white prose-code:before:content-none prose-code:after:content-none prose-code:text-pink-300 prose-code:bg-navy-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-pink-500 prose-blockquote:text-gray-300">
                {/* Article header */}
                <header className="mb-8 border-b border-gray-700 pb-6">
                    <h1 className="mb-4">{post.frontmatter.title}</h1>
                    <p className="text-sm text-gray-400">
                        Publicerad den {format(parseISO(post.frontmatter.date), 'd MMMM yyyy', { locale: sv })}
                        {post.frontmatter.author && ` av ${post.frontmatter.author}`}
                    </p>
                    {renderTags()}
                </header>

                {/* Article content */}
                <MDXRemote source={post.content} components={components} />

                {/* Back link */}
                <footer className="mt-12 pt-6 border-t border-gray-700">
                     <Link href="/artiklar" className="text-pink-500 hover:text-pink-400 no-underline">
                        ← Tillbaka till alla artiklar
                    </Link>
                </footer>
            </article>
        </div>
    );
}