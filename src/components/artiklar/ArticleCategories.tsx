// src/components/artiklar/ArticleCategories.tsx
// Uppdaterad med färre taggar (via server), infoboxar för CTA och registreringsknapp.

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Importera alla nödvändiga ikoner
import { Tag, X, TrendingUp, Filter, Sparkles, ScanSearch, ArrowRight } from 'lucide-react';
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
      params.delete('page'); // Nollställ sida vid filterändring/rensning
      setSelectedTag(null);
    } else {
      params.set('tag', tag);
      params.delete('page'); // Nollställ sida vid nytt filter
      setSelectedTag(tag);
    }
    router.push(`/artiklar?${params.toString()}`);
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tag');
    params.delete('page'); // Nollställ sida vid rensning
    setSelectedTag(null);
    router.push(`/artiklar?${params.toString()}`);
  };

  return (
    // Behåller sticky, justerar padding lite
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

      {/* Taggar/Kategorier (visar nu färre) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.length > 0 ? (
          categories.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ease-in-out group focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900 ${
                selectedTag === tag
                  ? 'bg-pink-600/20 text-pink-300 border border-pink-500 shadow-sm shadow-pink-900/30'
                  : 'bg-navy-800 text-gray-300 border border-navy-600/80 hover:bg-navy-700/70 hover:border-pink-500/50 hover:text-pink-400'
              }`}
            >
              {tag}
              <span className={`ml-1.5 text-[10px] md:text-xs px-1.5 py-0.5 rounded-full transition-colors duration-200 ${
                selectedTag === tag
                  ? 'bg-pink-500/30 text-pink-300'
                  : 'bg-navy-700 text-gray-400 group-hover:bg-navy-600 group-hover:text-gray-300'
              }`}>
                {count}
              </span>
            </button>
          ))
        ) : (
          // Behåll fallback om inga kategorier finns
          <div className="text-center py-6 w-full">
            <Tag className="w-10 h-10 text-navy-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Inga ämnen att visa.</p>
          </div>
        )}
      </div>

       {/* --- CTA Infobox Sektion (ERSÄTTER KNAPPARNA) --- */}
      <div className="mt-auto pt-5 border-t border-navy-700/50 flex flex-col gap-4">
         {/* Box 1: Skapa Personligt Brev (Liknar ArticleSidebar) */}
         <Link
            href="/skapa-brev"
            className={
              `group relative block overflow-hidden p-4 rounded-lg border
               bg-gradient-to-br from-navy-800/80 to-navy-800/50 border-navy-600/80
               transition-all duration-300 ease-in-out
               shadow-lg hover:shadow-xl hover:shadow-pink-900/40
               hover:border-pink-500/90
               hover:bg-gradient-to-br hover:from-navy-700/80 hover:to-navy-700/50
               hover:-translate-y-1
               focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900
               before:content-[''] before:absolute before:top-0 before:left-0 before:h-1 before:w-full
               before:bg-pink-600 before:scale-x-0 group-hover:before:scale-x-100
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
                  Matcha ditt CV mot jobbannonsen och låt vår AI skriva ett vinnande brev på sekunder.
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
            </div>
          </Link>

          {/* Box 2: Analysera CV (Liknar ArticleSidebar) */}
          <Link
             href="/analysera-cv"
            className={
              `group relative block overflow-hidden p-4 rounded-lg border
               bg-gradient-to-br from-navy-800/80 to-navy-800/50 border-navy-600/80
               transition-all duration-300 ease-in-out
               shadow-lg hover:shadow-xl hover:shadow-pink-900/40
               hover:border-pink-500/90
               hover:bg-gradient-to-br hover:from-navy-700/80 hover:to-navy-700/50
               hover:-translate-y-1
               focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-900
               before:content-[''] before:absolute before:top-0 before:left-0 before:h-1 before:w-full
               before:bg-pink-600 before:scale-x-0 group-hover:before:scale-x-100
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
                  Få AI-feedback på styrkor och förbättringsområden (struktur, verb, tydlighet).
                </p>
              </div>
               <ArrowRight className="w-5 h-5 text-gray-500 ml-auto opacity-70 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
            </div>
          </Link>

          {/* --- NY KNAPP TILLAGD --- */}
          <div className="mt-2"> {/* Lite mindre marginal här än i ArticleSidebar */}
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

    </div>
  );
};

export default ArticleCategories;