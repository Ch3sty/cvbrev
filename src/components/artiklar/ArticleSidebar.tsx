// src/components/artiklar/ArticleSidebar.tsx
// Uppdaterad med mer framträdande initial styling för infoboxar och en ny registreringsknapp.

import React from 'react';
import Link from 'next/link';
import { PostMeta } from '@/lib/blog';
import { Sparkles, ScanSearch, ArrowRight, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ArticleSidebarProps {
  allPosts: PostMeta[];
  currentPostSlug: string;
  currentPostTags?: string[];
}

const ArticleSidebar: React.FC<ArticleSidebarProps> = ({
  allPosts,
  currentPostSlug,
  currentPostTags = [],
}) => {
  // --- Logik för Relaterade Artiklar (Oförändrad) ---
  const otherPosts = allPosts.filter(post => post.slug !== currentPostSlug);
  let relatedPosts: PostMeta[] = [];
  if (currentPostTags && currentPostTags.length > 0 && otherPosts.length > 0) {
    relatedPosts = otherPosts
      .map(post => {
        const commonTags = post.tags?.filter(tag => currentPostTags.includes(tag)).length || 0;
        return { ...post, commonTags };
      })
      .filter(post => post.commonTags > 0)
      .sort((a, b) => b.commonTags - a.commonTags || parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }
  const numberOfRelatedToShow = 4;
  if (relatedPosts.length < numberOfRelatedToShow) {
    const latestPosts = otherPosts
      .filter(post => !relatedPosts.some(rp => rp.slug === post.slug))
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    relatedPosts = [...relatedPosts, ...latestPosts].slice(0, numberOfRelatedToShow);
  } else {
     relatedPosts = relatedPosts.slice(0, numberOfRelatedToShow);
  }
  // --- Slut på Logik för Relaterade Artiklar ---


  return (
    <aside className="sticky top-24 space-y-8">

      {/* --- CTA Infobox Sektion (UPPDATERAD INITIAL STYLING & KNAPP TILLAGD) --- */}
      <div className="bg-navy-900 p-5 rounded-lg border border-navy-700/70 shadow-lg shadow-navy-950/30">
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-navy-700/50 pb-3">
          Testa våra AI-verktyg
        </h3>
        <div className="flex flex-col gap-4">

          {/* Box 1: Skapa Personligt Brev (Justerad initial styling) */}
          <Link
            href="/create-letter"
            className={
              `group relative block overflow-hidden p-4 rounded-lg border
               bg-gradient-to-br from-navy-800/80 to-navy-800/50 border-navy-600/80  // Ljusare start
               transition-all duration-300 ease-in-out
               shadow-lg hover:shadow-xl hover:shadow-pink-900/40                   // Tydligare startskugga
               hover:border-pink-500/90                                            // Tydligare hover-border
               hover:bg-gradient-to-br hover:from-navy-700/80 hover:to-navy-700/50 // Tydligare hover-bakgrund
               hover:-translate-y-1                                                // Behåll lyft
               focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900
               before:content-[''] before:absolute before:top-0 before:left-0 before:h-1 before:w-full
               before:bg-pink-600 before:scale-x-0 group-hover:before:scale-x-100 // Behåll animerad topp-border
               before:transition-transform before:duration-300 before:origin-left`
            }
          >
            <div className="flex items-start space-x-3">
              <Sparkles className="flex-shrink-0 w-6 h-6 text-pink-500 mt-0.5 group-hover:text-pink-400 transition-colors duration-200 group-hover:scale-110" />
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Skapa personligt brev
                </h4>
                <p className="text-sm text-gray-300 leading-snug">
                  Skapa ett vinnande brev på sekunder. Vår AI matchar ditt CV mot jobbannonsen och lyfter fram dina mest relevanta erfarenheter och kompetenser.
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" /> {/* Lite mer synlig pil */}
            </div>
          </Link>

          {/* Box 2: Analysera CV (Justerad initial styling) */}
          <Link
             href="/analysera-cv"
            className={
              `group relative block overflow-hidden p-4 rounded-lg border
               bg-gradient-to-br from-navy-800/80 to-navy-800/50 border-navy-600/80  // Ljusare start
               transition-all duration-300 ease-in-out
               shadow-lg hover:shadow-xl hover:shadow-pink-900/40                   // Tydligare startskugga
               hover:border-pink-500/90                                            // Tydligare hover-border
               hover:bg-gradient-to-br hover:from-navy-700/80 hover:to-navy-700/50 // Tydligare hover-bakgrund
               hover:-translate-y-1                                                // Behåll lyft
               focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900
               before:content-[''] before:absolute before:top-0 before:left-0 before:h-1 before:w-full
               before:bg-pink-600 before:scale-x-0 group-hover:before:scale-x-100 // Behåll animerad topp-border
               before:transition-transform before:duration-300 before:origin-left`
            }
          >
            <div className="flex items-start space-x-3">
              <ScanSearch className="flex-shrink-0 w-6 h-6 text-pink-500 mt-0.5 group-hover:text-pink-400 transition-colors duration-200 group-hover:scale-110" />
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Analysera ditt CV
                </h4>
                <p className="text-sm text-gray-300 leading-snug">
                  Få djupgående AI-feedback. Identifiera styrkor, se konkreta förbättringsområden (struktur, tydlighet, starka verb) och finslipa ditt viktigaste karriärdokument.
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" /> {/* Lite mer synlig pil */}
            </div>
          </Link>
        </div>

        {/* --- NY KNAPP TILLAGD --- */}
        <div className="mt-6 pt-5 border-t border-navy-700/50">
          <Link
            href="/register"
            className="block w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-md text-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-pink-900/40 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900"
          >
            Prova gratis nu
          </Link>
        </div>
         {/* --- SLUT PÅ NY KNAPP --- */}

      </div>
      {/* --- Slut på CTA Infobox Sektion --- */}


      {/* --- Relaterade Artiklar Sektion (Oförändrad) --- */}
      {relatedPosts.length > 0 && (
        <div className="bg-navy-900 p-5 rounded-lg border border-navy-700/70 shadow-lg shadow-navy-950/30">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-navy-700/50 pb-3">
            Läs även
          </h3>
          <ul className="space-y-4">
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/artiklar/${post.slug}`}
                  className="group flex items-start space-x-3 text-gray-300 hover:text-pink-400 transition-colors duration-200"
                >
                  <FileText className="w-5 h-5 mt-0.5 text-navy-500 group-hover:text-pink-500 flex-shrink-0 transition-colors duration-200" />
                  <div>
                    <span className="block text-sm font-medium leading-snug group-hover:underline">
                      {post.title}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {format(parseISO(post.date), 'd MMM yyyy', { locale: sv })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
           <div className="mt-5 pt-4 border-t border-navy-700/40">
                <Link
                    href="/artiklar"
                    className="text-sm text-pink-500 hover:text-pink-400 flex items-center group"
                >
                    Visa alla artiklar
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
      )}
      {/* --- Slut på Relaterade Artiklar Sektion --- */}

    </aside>
  );
};

export default ArticleSidebar;