'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import ArticleShare from './ArticleShare';
import { ArticleHeroPattern } from './illustrations/ArticleIcons';

interface ArticleHeroProps {
  title: string;
  date: string;
  readingTime: number;
  tags?: string[];
  slug: string;
}

export default function ArticleHero({
  title,
  date,
  readingTime,
  tags,
  slug,
}: ArticleHeroProps) {
  const shareUrl = `https://www.jobbcoach.ai/artiklar/${slug}`;
  const primaryTag = tags?.[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-white border border-orange-100 mb-6 sm:mb-8 max-w-full"
      style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Subtil bakgrund med dot-pattern */}
      <ArticleHeroPattern className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Vänster gradient-strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{
          background: 'linear-gradient(180deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative p-6 sm:p-8 md:p-10">
        {/* Breadcrumb */}
        <nav aria-label="Brödsmulor" className="mb-4 sm:mb-5">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap min-w-0">
            <li className="flex-shrink-0">
              <Link
                href="/"
                className="text-slate-600 hover:text-orange-700 font-medium transition-colors"
              >
                Hem
              </Link>
            </li>
            <li className="flex items-center gap-1.5 flex-shrink-0">
              <ChevronRight
                className="w-3.5 h-3.5 text-orange-300 flex-shrink-0"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <Link
                href="/artiklar"
                className="text-slate-600 hover:text-orange-700 font-medium transition-colors"
              >
                Artiklar
              </Link>
            </li>
            <li className="flex items-center gap-1.5 min-w-0 flex-1">
              <ChevronRight
                className="w-3.5 h-3.5 text-orange-300 flex-shrink-0"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span
                className="text-slate-900 font-bold truncate min-w-0"
                aria-current="page"
              >
                {title}
              </span>
            </li>
          </ol>
        </nav>

        {/* Eyebrow med kategori (första taggen) */}
        {primaryTag && (
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-3">
            {primaryTag}
          </div>
        )}

        {/* H1 */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4 sm:mb-5 break-words hyphens-auto"
          style={{ overflowWrap: 'anywhere' }}
        >
          {title}
        </h1>

        {/* Meta-rad: datum + läs-tid + share */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pb-5 sm:pb-6 border-b border-orange-100">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
            <time dateTime={date}>
              {format(parseISO(date), 'd MMM yyyy', { locale: sv })}
            </time>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
            <Clock className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
            <span>{readingTime} min läsning</span>
          </div>
          <div className="ml-auto">
            <ArticleShare title={title} url={shareUrl} size="sm" showLabel={true} />
          </div>
        </div>

        {/* Tag-pillar */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/artiklar?tag=${tag}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors touch-manipulation"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.header>
  );
}
