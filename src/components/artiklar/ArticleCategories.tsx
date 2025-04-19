// src/components/artiklar/ArticleCategories.tsx
// Uppdaterad med FÖRNYAD stil för CTA-boxar för mer djup och liv.

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Importera alla nödvändiga ikoner
import { Tag, X, TrendingUp, Filter, Sparkles, ScanSearch, ArrowRight, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

interface CategoryProps {
  tag: string;
  count: number;
}

interface ArticleCategoriesProps {
  categories: CategoryProps[];
}

const ArticleCategories: React.FC<ArticleCategoriesProps> = ({ categories = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // useEffect och handlers (oförändrade)
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam && tagParam !== selectedTag) {
      setSelectedTag(tagParam);
    } else if (!tagParam && selectedTag !== null) {
      setSelectedTag(null);
    }
    const timer = setTimeout(() => setIsAnimated(true), 50);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedTag === tag) {
      params.delete('tag');
      params.delete('page');
      setSelectedTag(null);
    } else {
      params.set('tag', tag);
      params.delete('page');
      setSelectedTag(tag);
    }
    router.push(`/artiklar?${params.toString()}`);
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tag');
    params.delete('page');
    setSelectedTag(null);
    router.push(`/artiklar?${params.toString()}`);
  };

  // --- Styling för CTA-länkarna (NY STIL) ---
  const ctaLinkClasses = `
    group relative block overflow-hidden p-4 rounded-lg border
    bg-navy-800      /* Solid bakgrund, lite ljusare än sidbaren */
    border-navy-700  /* Tydligare default border */
    transition-all duration-300 ease-in-out
    shadow-md         /* Subtil default skugga */
    hover:shadow-xl hover:shadow-pink-900/30 /* Tydligare hover-skugga med färg */
    hover:border-pink-500                  /* Tydlig rosa border på hover */
    hover:bg-navy-700/50                   /* Lite ljusare/genomskinlig bakgrund på hover */
    hover:-translate-y-1                   /* Behåll lyft-effekt */
    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900
  `;

  return (
    // Sidebar container (oförändrad)
    <div className={`sticky top-24 bg-navy-900 p-5 md:p-6 rounded-lg border border-navy-700/70 shadow-xl shadow-navy-950/30 transform transition-all duration-500 ease-out ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>

      {/* Rubrik och Rensa-knapp (oförändrat) */}
       <div className="flex justify-between items-center mb-5 pb-4 border-b border-navy-700/50">
         <h2 className="text-lg md:text-xl font-semibold text-white flex items-center">
           <TrendingUp className="w-5 h-5 mr-2 text-pink-500 flex-shrink-0" />
           Populära ämnen
         </h2>
         {selectedTag && (
           <button
             onClick={clearFilter}
             className="text-xs text-gray-400 hover:text-pink-400 flex items-center transition-colors duration-200 px-2 py-1 rounded hover:bg-navy-800/60 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900"
             aria-label="Rensa filter"
           >
             <X className="w-3.5 h-3.5 mr-1" />
             Rensa
           </button>
         )}
       </div>

      {/* Info om valt filter (oförändrat) */}
      {selectedTag && (
        <div className="bg-navy-800/50 border border-pink-600/40 rounded-md p-3 mb-5 transform transition-all duration-300 animate-fadeIn shadow-sm shadow-pink-950/20">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              Filtrerar på: <span className="font-medium text-pink-300">{selectedTag}</span>
            </p>
          </div>
        </div>
      )}

      {/* Taggar/Kategorier (oförändrat från förra uppdateringen) */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.length > 0 ? (
          categories.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`
                inline-flex items-center px-4 py-2 rounded-lg text-xs md:text-sm font-medium
                transition-all duration-300 ease-in-out group shadow-md border
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900
                ${ selectedTag === tag
                    ? 'bg-gradient-to-r from-pink-600/80 to-purple-600/70 text-white border-pink-500 shadow-lg shadow-pink-900/30 hover:shadow-xl hover:shadow-pink-800/40'
                    : 'bg-navy-800 border-navy-600 text-gray-300 shadow-sm shadow-navy-950/20 hover:bg-navy-700 hover:border-pink-500/50 hover:text-pink-300 hover:shadow-lg hover:-translate-y-0.5'
                }
              `}
            >
              {tag}
              <span className={`
                ml-2 text-[10px] md:text-xs px-1.5 py-0.5 rounded-full transition-colors duration-300
                ${ selectedTag === tag
                    ? 'bg-white/10 text-pink-100'
                    : 'bg-navy-600/80 text-gray-400 group-hover:bg-pink-700/50 group-hover:text-pink-200'
                 }
              `}>
                {count}
              </span>
            </button>
          ))
        ) : (
          <div className="text-center py-6 w-full">
            <Tag className="w-10 h-10 text-navy-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Inga ämnen att visa.</p>
          </div>
        )}
      </div>

       {/* --- CTA Infobox Sektion (ANVÄNDER NYA ctaLinkClasses) --- */}
      <div className="mt-auto pt-5 border-t border-navy-700/50 flex flex-col gap-4">
         {/* Box 1: Skapa Personligt Brev */}
         <Link href="/skapa-brev" className={ctaLinkClasses} >
            <div className="flex items-start space-x-3">
              {/* Ikon: Lite subtil glow på hover */}
              <Sparkles className="flex-shrink-0 w-6 h-6 text-pink-500 mt-0.5 transition-all duration-300 group-hover:text-pink-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_3px_rgba(236,72,153,0.6)]" />
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Skapa personligt brev
                </h4>
                <p className="text-sm text-gray-300 leading-snug">
                  Matcha ditt CV mot jobbannonsen och låt vår AI skriva ett vinnande brev på sekunder.
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
            </div>
          </Link>

          {/* Box 2: Analysera CV */}
          <Link href="/analysera-cv" className={ctaLinkClasses} >
            <div className="flex items-start space-x-3">
              {/* Ikon: Lite subtil glow på hover */}
              <ScanSearch className="flex-shrink-0 w-6 h-6 text-pink-500 mt-0.5 transition-all duration-300 group-hover:text-pink-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_3px_rgba(236,72,153,0.6)]" />
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Analysera ditt CV
                </h4>
                <p className="text-sm text-gray-300 leading-snug">
                  Få AI-feedback på styrkor och förbättringsområden (struktur, verb, tydlighet).
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
            </div>
          </Link>

          {/* Box 3: Kompetensutveckling */}
           <Link href="/kompetensutveckling" className={ctaLinkClasses} >
             <div className="flex items-start space-x-3">
               {/* Ikon: Lite subtil glow på hover */}
               <BrainCircuit className="flex-shrink-0 w-6 h-6 text-pink-500 mt-0.5 transition-all duration-300 group-hover:text-pink-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_3px_rgba(236,72,153,0.6)]" />
               <div>
                 <h4 className="font-semibold text-white mb-1">
                   Kompetensutveckling
                 </h4>
                 <p className="text-sm text-gray-300 leading-snug">
                   Se vilka kompetenser som krävs och få förslag på hur du kan utvecklas vidare.
                 </p>
               </div>
                <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
             </div>
           </Link>

          {/* Knapp för Registrering (oförändrad) */}
          <div className="mt-2">
              <Link
                href="/register"
                className="block w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-md text-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-pink-900/40 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900"
              >
                Prova gratis nu
              </Link>
          </div>

      </div>

    </div>
  );
};

export default ArticleCategories;