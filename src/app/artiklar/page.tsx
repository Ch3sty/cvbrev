// src/app/artiklar/page.tsx
import Link from 'next/link';
import { getAllPostsMeta } from '@/lib/blog'; // Behåll funktionens namn, eller byt om du vill vara superkonsekvent
import { Metadata } from 'next';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';

// SEO Metadata för artikelsidan
export const metadata: Metadata = {
  title: 'Artiklar | cvbrev.se - Tips och Råd för Jobbsökande', // Uppdaterad titel
  description: 'Läs de senaste artiklarna om personliga brev, CV-skrivning, AI i jobbsökandet och karriärtips från cvbrev.se.', // Behåll eller anpassa beskrivning
  alternates: {
    canonical: '/artiklar', // Uppdaterad canonical URL
  },
};

export default function ArticlesIndexPage() { // Bytte namn på komponenten
  // Hämta metadata för alla inlägg på servern
  const posts = getAllPostsMeta(); // Funktionen heter fortfarande samma i lib/blog.ts

  return (
    <div className="container max-w-3xl px-4 py-12 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-center text-white md:text-5xl">
        Artiklar {/* Uppdaterad rubrik */}
      </h1>
      <p className="mb-12 text-xl text-center text-gray-300">
        Tips, insikter och nyheter om jobbsökande, personliga brev och AI.
      </p>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400">Inga artiklar hittades.</p> // Uppdaterad text
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="p-6 transition-shadow bg-navy-800 rounded-lg hover:shadow-xl hover:shadow-pink-500/10 border border-gray-700/50">
              <header className="mb-3">
                <h2 className="text-2xl font-semibold text-white hover:text-pink-400 transition-colors">
                  {/* Uppdaterad länkstruktur */}
                  <Link href={`/artiklar/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Publicerad den {format(parseISO(post.date), 'd MMMM yyyy', { locale: sv })}
                  {post.author && ` av ${post.author}`}
                </p>
              </header>
              <p className="text-gray-300">
                {post.description}
              </p>
              <div className="mt-4">
                 {/* Uppdaterad länkstruktur */}
                <Link
                  href={`/artiklar/${post.slug}`}
                  className="text-pink-500 hover:text-pink-400 font-medium"
                >
                  Läs mer →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}