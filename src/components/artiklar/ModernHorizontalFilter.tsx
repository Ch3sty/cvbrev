'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tag, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryProps {
  tag: string;
  count: number;
}

interface ModernHorizontalFilterProps {
  categories: CategoryProps[];
}

const ModernHorizontalFilter: React.FC<ModernHorizontalFilterProps> = ({ categories = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Show first 8 categories by default, expand on click
  const displayedCategories = showAll ? categories : categories.slice(0, 8);
  const hasMore = categories.length > 8;

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

  if (categories.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 lg:p-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-pink-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Filtrera efter kategori
          </h2>
          {selectedTag && (
            <span className="text-sm text-gray-500">
              ({categories.find(c => c.tag === selectedTag)?.count || 0} artiklar)
            </span>
          )}
        </div>

        {selectedTag && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilter}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600
                     px-3 py-2 rounded-lg hover:bg-pink-50 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            aria-label="Rensa filter"
          >
            <X className="w-4 h-4" />
            Rensa filter
          </motion.button>
        )}
      </div>

      {/* Category Tags - Horizontal Layout */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <AnimatePresence mode="popLayout">
            {displayedCategories.map(({ tag, count }, index) => (
              <motion.button
                key={tag}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: showAll ? 0 : index * 0.05,
                  layout: { duration: 0.3 }
                }}
                onClick={() => handleTagClick(tag)}
                className={`
                  inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group border hover:scale-105 hover:-translate-y-0.5
                  focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                  ${ selectedTag === tag
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-transparent shadow-lg'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700 shadow-sm hover:shadow-md'
                  }
                `}
              >
                <Tag className={`w-4 h-4 ${selectedTag === tag ? 'text-white' : 'text-gray-400 group-hover:text-pink-500'}`} />
                <span>{tag}</span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full font-semibold transition-colors
                  ${ selectedTag === tag
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-pink-100 group-hover:text-pink-700'
                   }
                `}>
                  {count}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Show More/Less Button */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600
                       px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              {showAll ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  Visa färre kategorier
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  Visa alla kategorier ({categories.length - 8} till)
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default ModernHorizontalFilter;