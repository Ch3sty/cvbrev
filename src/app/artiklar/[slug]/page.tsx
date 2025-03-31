// src/app/artiklar/[slug]/page.tsx
// KORRIGERAD: Implementerar korrekt hantering av params som Promise enligt Next.js 15.

import { notFound } from 'next/navigation';
import { getAllPostsMeta, getPostBySlug } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata, ResolvingMetadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import Link from 'next/link';
import React from 'react';

// Typ för de upplösta parametrarna
type ResolvedParams = { slug: string };

// Generera Metadata dynamiskt för varje artikel
export async function generateMetadata(
    // Typa params som ett Promise som löser till ResolvedParams
    { params: paramsPromise }: { params: Promise<ResolvedParams> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    // *** Awaita Promise för att få det upplösta objektet ***
    const params = await paramsPromise;
    const slug = params.slug;

    console.log(`Generating metadata for slug: ${slug}`);
    const post = getPostBySlug(slug); // Denna är synkron

    if (!post) {
        console.warn(`Metadata generation: Post not found for slug ${slug}`);
        return { title: 'Artikeln Hittades Inte' };
    }

    console.log(`Metadata generation: Found post "${post.frontmatter.title}"`);
    const publishedDate = post.frontmatter.date ? new Date(post.frontmatter.date).toISOString() : undefined;

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

// Generera statiska sökvägar vid byggtid (oförändrad, behöver inte vara async)
export function generateStaticParams() {
    console.log("Generating static params for articles...");
    const posts = getAllPostsMeta();
    const params = posts.map((post) => ({ slug: post.slug }));
    console.log(`Generated ${params.length} static params.`);
    return params;
}


// Själva sidkomponenten
export default async function ArticlePage(
    // Typa params som ett Promise som löser till ResolvedParams
    { params: paramsPromise }: { params: Promise<ResolvedParams> }
) {
    // *** Awaita Promise för att få det upplösta objektet ***
    const params = await paramsPromise;
    const slug = params.slug;

    console.log(`Rendering ArticlePage for slug: ${slug}`);
    const post = getPostBySlug(slug); // Denna är synkron

    if (!post) {
        console.warn(`ArticlePage: Post not found for slug ${slug}, calling notFound().`);
        notFound();
    }
    console.log(`ArticlePage: Rendering post "${post.frontmatter.title}"`);

    return (
        <div className="container max-w-3xl px-4 py-12 mx-auto">
            <article className="prose prose-invert prose-quoteless prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-a:text-pink-400 hover:prose-a:text-pink-300 prose-strong:text-white prose-code:before:content-none prose-code:after:content-none prose-code:text-pink-300 prose-code:bg-navy-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-pink-500 prose-blockquote:text-gray-300">
                {/* Artikelns header */}
                <header className="mb-8 border-b border-gray-700 pb-6">
                    {/* ... header innehåll ... */}
                     <h1 className="mb-4">{post.frontmatter.title}</h1>
                     <p className="text-sm text-gray-400">
                        Publicerad den {format(parseISO(post.frontmatter.date), 'd MMMM yyyy', { locale: sv })}
                        {post.frontmatter.author && ` av ${post.frontmatter.author}`}
                     </p>
                     {post.frontmatter.tags && post.frontmatter.tags.length > 0 && ( /* ... tags ... */ )}
                </header>

                {/* Artikelns innehåll */}
                <MDXRemote source={post.content} />

                {/* Tillbaka-länk */}
                <footer className="mt-12 pt-6 border-t border-gray-700">
                    <Link href="/artiklar" className="text-pink-500 hover:text-pink-400 no-underline">
                        ← Tillbaka till alla artiklar
                    </Link>
                </footer>
            </article>
        </div>
    );
}