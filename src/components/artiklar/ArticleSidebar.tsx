// src/components/artiklar/ArticleSidebar.tsx
// Uppdaterad med ljust premium tema för artikelsidor

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

  // Styling för CTA-länkarna - ljust premium tema
  const ctaLinkClasses = `
    group block p-4 rounded-xl border
    bg-white                                 /* Vit bakgrund */
    border-gray-200                          /* Ljusgrå border */
    transition-all duration-300 ease-in-out
    shadow-sm                                /* Subtil skugga */
    hover:shadow-lg hover:shadow-pink-500/10 /* Rosa skugga på hover */
    hover:border-pink-300                    /* Rosa border på hover */
    hover:bg-pink-50/50                      /* Mycket ljus rosa bakgrund */
    hover:-translate-y-1                     /* Behåll lyft */
    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-white
  `;

  return (
    <aside className="sticky top-24 space-y-8">

      {/* CTA Infobox Sektion - ljust tema */}
      <div className="bg-gradient-to-br from-white to-gray-50/30 p-5 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-3">
          Testa våra AI-verktyg
        </h3>
        <div className="flex flex-col gap-4"> {/* Behåll gap */}

          {/* Box 1: Skapa Personligt Brev */}
          <Link href="/skapa-brev" className={ctaLinkClasses}>
            <div className="flex items-start space-x-3">
              <Sparkles className="flex-shrink-0 w-6 h-6 text-pink-600 mt-0.5 transition-all duration-300 group-hover:text-pink-500 group-hover:scale-110" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Skapa personligt brev
                </h4>
                <p className="text-sm text-gray-600 leading-snug">
                  Skapa ett vinnande brev på sekunder. Vår AI matchar ditt CV mot jobbannonsen och lyfter fram dina mest relevanta erfarenheter och kompetenser.
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-400 ml-auto opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:text-pink-600 group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
            </div>
          </Link>

          {/* Box 2: Analysera CV */}
          <Link href="/analysera-cv" className={ctaLinkClasses}>
            <div className="flex items-start space-x-3">
              <ScanSearch className="flex-shrink-0 w-6 h-6 text-pink-600 mt-0.5 transition-all duration-300 group-hover:text-pink-500 group-hover:scale-110" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Analysera ditt CV
                </h4>
                <p className="text-sm text-gray-600 leading-snug">
                  Få djupgående AI-feedback. Identifiera styrkor, se konkreta förbättringsområden (struktur, tydlighet, starka verb) och finslipa ditt viktigaste karriärdokument.
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-400 ml-auto opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:text-pink-600 group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
            </div>
          </Link>

          {/* Box 3: CV-mallar (uppdaterat från kompetensutveckling) */}
          <Link href="/cv-mallar" className={ctaLinkClasses}>
             <div className="flex items-start space-x-3">
               <FileText className="flex-shrink-0 w-6 h-6 text-pink-600 mt-0.5 transition-all duration-300 group-hover:text-pink-500 group-hover:scale-110" />
               <div>
                 <h4 className="font-semibold text-gray-900 mb-1">
                   Populärast: CV-mallar
                 </h4>
                 <p className="text-sm text-gray-600 leading-snug">
                   8 professionella mallar för alla branscher
                 </p>
               </div>
                <ArrowRight className="w-5 h-5 text-gray-400 ml-auto opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:text-pink-600 group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
             </div>
           </Link>

        </div>

        {/* Knapp för Registrering - ljust tema */}
        <div className="mt-6 pt-5 border-t border-gray-200">
          <Link
            href="/register"
            className="block w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-2.5 px-4 rounded-lg text-center transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-pink-500/20 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            Prova gratis nu
          </Link>
        </div>

      </div>
      {/* --- Slut på CTA Infobox Sektion --- */}


      {/* Relaterade Artiklar Sektion - ljust tema */}
      {relatedPosts.length > 0 && (
        <div className="bg-gradient-to-br from-white to-gray-50/30 p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            Läs även
          </h3>
          <ul className="space-y-4">
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/artiklar/${post.slug}`}
                  className="group flex items-start space-x-3 text-gray-700 hover:text-pink-600 transition-colors duration-200"
                >
                  <FileText className="w-5 h-5 mt-0.5 text-gray-400 group-hover:text-pink-500 flex-shrink-0 transition-colors duration-200" />
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
           <div className="mt-5 pt-4 border-t border-gray-200">
                <Link
                    href="/artiklar"
                    className="text-sm text-pink-600 hover:text-pink-700 flex items-center group"
                >
                    Visa alla artiklar
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
      )}

    </aside>
  );
};

export default ArticleSidebar;