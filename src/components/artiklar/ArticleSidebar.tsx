// src/components/artiklar/ArticleSidebar.tsx
// Uppdaterad med FÖRNYAD stil för CTA-boxar, inspirerad av funktionskorten.

import React from 'react';
import Link from 'next/link';
import { PostMeta } from '@/lib/blog';
// Importera ikoner
import { Sparkles, ScanSearch, ArrowRight, FileText, BrainCircuit } from 'lucide-react'; // Lade till BrainCircuit här också
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

  // --- Styling för CTA-länkarna (NY, inspirerad av funktionskort) ---
  const ctaLinkClasses = `
    group block p-4 rounded-xl border          /* Ökad rundning till xl */
    bg-navy-800                              /* Solid mörkblå bas, samma som funktionskort */
    border-navy-700                          /* Tydlig basborder */
    transition-all duration-300 ease-in-out
    shadow-lg                                /* Lite mer startskugga */
    hover:shadow-xl hover:shadow-pink-900/40 /* Starkare, färgad hover-skugga */
    hover:border-pink-500/80                 /* Tydlig rosa hover-border */
    hover:bg-navy-700/60                     /* Lätt uppljusad hover-bakgrund */
    hover:-translate-y-1                     /* Behåll lyft */
    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900
  `;

  return (
    <aside className="sticky top-24 space-y-8">

      {/* --- CTA Infobox Sektion (Använder NYA ctaLinkClasses) --- */}
      <div className="bg-navy-900 p-5 rounded-lg border border-navy-700/70 shadow-lg shadow-navy-950/30">
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-navy-700/50 pb-3">
          Testa våra AI-verktyg
        </h3>
        <div className="flex flex-col gap-4"> {/* Behåll gap */}

          {/* Box 1: Skapa Personligt Brev */}
          <Link href="/skapa-brev" className={ctaLinkClasses}>
            <div className="flex items-start space-x-3">
              {/* Uppdaterad ikon-styling */}
              <Sparkles className="flex-shrink-0 w-6 h-6 text-pink-500 mt-0.5 transition-all duration-300 group-hover:text-pink-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_4px_rgba(236,72,153,0.7)]" />
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Skapa personligt brev
                </h4>
                <p className="text-sm text-gray-300 leading-snug">
                  Skapa ett vinnande brev på sekunder. Vår AI matchar ditt CV mot jobbannonsen och lyfter fram dina mest relevanta erfarenheter och kompetenser.
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
            </div>
          </Link>

          {/* Box 2: Analysera CV */}
          <Link href="/analysera-cv" className={ctaLinkClasses}>
            <div className="flex items-start space-x-3">
               {/* Uppdaterad ikon-styling */}
              <ScanSearch className="flex-shrink-0 w-6 h-6 text-pink-500 mt-0.5 transition-all duration-300 group-hover:text-pink-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_4px_rgba(236,72,153,0.7)]" />
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Analysera ditt CV
                </h4>
                <p className="text-sm text-gray-300 leading-snug">
                  Få djupgående AI-feedback. Identifiera styrkor, se konkreta förbättringsområden (struktur, tydlighet, starka verb) och finslipa ditt viktigaste karriärdokument.
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
            </div>
          </Link>

          {/* Box 3: Kompetensutveckling (Lades till igen för säkerhets skull) */}
          <Link href="/kompetensutveckling" className={ctaLinkClasses}>
             <div className="flex items-start space-x-3">
               {/* Uppdaterad ikon-styling */}
               <BrainCircuit className="flex-shrink-0 w-6 h-6 text-pink-500 mt-0.5 transition-all duration-300 group-hover:text-pink-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_4px_rgba(236,72,153,0.7)]" />
               <div>
                 <h4 className="font-semibold text-white mb-1">
                   Kompetensutveckling
                 </h4>
                 <p className="text-sm text-gray-300 leading-snug">
                   Se vilka kompetenser som krävs och få förslag på hur du kan utvecklas vidare.
                 </p>
               </div>
                <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
             </div>
           </Link>

        </div>

        {/* Knapp för Registrering (Oförändrad) */}
        <div className="mt-6 pt-5 border-t border-navy-700/50">
          <Link
            href="/register"
            className="block w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-md text-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-pink-900/40 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900"
          >
            Prova gratis nu
          </Link>
        </div>

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