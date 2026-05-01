'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkle } from 'lucide-react';
import { ArticlesEmptyIllustration } from './illustrations/ArticlesListIcons';

interface EmptyStateProps {
  tagFilter?: string;
  popularTags?: string[];
}

export default function EmptyState({ tagFilter, popularTags = [] }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-8 sm:p-10 md:p-12 text-center"
      style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Gradient-strip topp */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
        aria-hidden="true"
      />

      <div className="flex justify-center mb-4">
        <ArticlesEmptyIllustration className="w-32 h-32 sm:w-40 sm:h-40" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
        Här var det tomt
      </h3>
      <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-md mx-auto">
        {tagFilter
          ? `Vi har inga artiklar om "${tagFilter}" än. Prova en annan kategori eller utforska alla artiklar.`
          : 'Just nu finns inga artiklar här.'}
      </p>

      {popularTags.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2 inline-flex items-center gap-1.5">
            <Sparkle className="w-3 h-3" strokeWidth={2.5} />
            Populära ämnen
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {popularTags.slice(0, 4).map((tag) => (
              <Link
                key={tag}
                href={`/artiklar?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors text-sm font-semibold touch-manipulation"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/artiklar"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:scale-[1.03] transition-all touch-manipulation"
        style={{
          background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
        }}
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        Tillbaka till alla artiklar
      </Link>
    </motion.div>
  );
}
