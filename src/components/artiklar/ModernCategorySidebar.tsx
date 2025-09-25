'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tag, X, TrendingUp, Filter, Sparkles, ScanSearch, ArrowRight, BrainCircuit, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CategoryProps {
  tag: string;
  count: number;
}

interface ModernCategorySidebarProps {
  categories: CategoryProps[];
}

const ModernCategorySidebar: React.FC<ModernCategorySidebarProps> = ({ categories = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam && tagParam !== selectedTag) {
      setSelectedTag(tagParam);
    } else if (!tagParam && selectedTag !== null) {
      setSelectedTag(null);
    }
    setIsVisible(true);
  }, [searchParams, selectedTag]);

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

  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-24 bg-white rounded-xl border border-gray-200/60 shadow-lg p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-pink-600 flex-shrink-0" />
          Populära ämnen
        </h2>
        {selectedTag && (
          <button
            onClick={clearFilter}
            className="text-xs text-gray-500 hover:text-pink-600 flex items-center transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            aria-label="Rensa filter"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Rensa
          </button>
        )}
      </div>

      {/* Active Filter Info */}
      {selectedTag && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-pink-50 border border-pink-200 rounded-lg p-3"
        >
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-pink-600 flex-shrink-0" />
            <p className="text-sm text-pink-700">
              Filtrerar på: <span className="font-medium">{selectedTag}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Category Tags */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map(({ tag, count }, index) => (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleTagClick(tag)}
                className={`
                  inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 group border
                  focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                  ${ selectedTag === tag
                      ? 'bg-pink-600 text-white border-pink-600 shadow-md hover:bg-pink-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700'
                  }
                `}
              >
                {tag}
                <span className={`
                  ml-2 text-xs px-1.5 py-0.5 rounded-full transition-colors
                  ${ selectedTag === tag
                      ? 'bg-white/20 text-pink-100'
                      : 'bg-gray-200 text-gray-600 group-hover:bg-pink-200/50 group-hover:text-pink-700'
                   }
                `}>
                  {count}
                </span>
              </motion.button>
            ))
          ) : (
            <div className="text-center py-6 w-full">
              <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Inga ämnen att visa.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Cards Section */}
      <div className="pt-6 border-t border-gray-100 space-y-4">
        {/* CTA Card 1: Skapa Personligt Brev */}
        <Link
          href="/skapa-brev"
          className="group block p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100 hover:border-pink-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-start space-x-3">
            <Sparkles className="flex-shrink-0 w-5 h-5 text-pink-600 mt-0.5 transition-all duration-300 group-hover:scale-110" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Skapa personligt brev
              </h4>
              <p className="text-sm text-gray-600 leading-snug">
                Matcha ditt CV mot jobbannonsen och låt vår AI skriva ett vinnande brev på sekunder.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
          </div>
        </Link>

        {/* CTA Card 2: Analysera CV */}
        <Link
          href="/analysera-cv"
          className="group block p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-start space-x-3">
            <ScanSearch className="flex-shrink-0 w-5 h-5 text-blue-600 mt-0.5 transition-all duration-300 group-hover:scale-110" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Analysera ditt CV
              </h4>
              <p className="text-sm text-gray-600 leading-snug">
                Få AI-feedback på styrkor och förbättringsområden (struktur, verb, tydlighet).
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
          </div>
        </Link>

        {/* CTA Card 3: Kompetensutveckling */}
        <Link
          href="/kompetensutveckling"
          className="group block p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-start space-x-3">
            <BrainCircuit className="flex-shrink-0 w-5 h-5 text-purple-600 mt-0.5 transition-all duration-300 group-hover:scale-110" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Kompetensutveckling
              </h4>
              <p className="text-sm text-gray-600 leading-snug">
                Se vilka kompetenser som krävs och få förslag på hur du kan utvecklas vidare.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
          </div>
        </Link>

        {/* Main CTA Button */}
        <div className="pt-2">
          <Link
            href="/register"
            className="block w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            Prova gratis nu
          </Link>
        </div>
      </div>
    </motion.aside>
  );
};

export default ModernCategorySidebar;