'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Calendar, Clock, ArrowRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ArticleImage from '@/components/ArticleImage';
import { PostMeta } from '@/lib/blog';

interface ArticleCardProps {
  post: PostMeta;
  tagFilter?: string;
  featured?: boolean;
}

export default function ArticleCard({ post, tagFilter, featured = false }: ArticleCardProps) {
  const hasValidImage =
    typeof post.image === 'string' &&
    post.image.trim() !== '' &&
    post.image.startsWith('/');

  const readingTime = Math.max(1, Math.ceil((post.wordCount || 0) / 200));

  const formattedDate = (() => {
    if (!post.date) return null;
    try {
      const parsed = parseISO(post.date);
      if (isNaN(parsed.getTime())) return post.date;
      return format(parsed, 'd MMM yyyy', { locale: sv });
    } catch {
      return post.date;
    }
  })();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-orange-100 hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300 ${
        featured ? 'md:col-span-2 lg:col-span-3' : ''
      }`}
      style={{
        boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)',
      }}
    >
      {/* Bild */}
      <Link
        href={`/artiklar/${post.slug}`}
        className="block relative overflow-hidden bg-orange-50/40"
        aria-label={`Läs ${post.title}`}
      >
        <div
          className={`relative ${featured ? 'aspect-[16/9] md:aspect-[2.4/1]' : 'aspect-[16/10]'}`}
        >
          {hasValidImage ? (
            <>
              <ArticleImage
                src={post.image as string}
                alt={post.title ?? 'Artikelbild'}
                slug={post.slug}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-hidden="true"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-rose-50">
              <FileText className="w-12 h-12 text-orange-300" strokeWidth={1.5} />
            </div>
          )}
        </div>
      </Link>

      {/* Innehåll */}
      <div className={`flex flex-col flex-1 ${featured ? 'p-5 sm:p-7 md:p-8' : 'p-5 sm:p-6'}`}>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, featured ? 3 : 2).map((tag) => (
              <Link
                key={tag}
                href={`/artiklar?tag=${encodeURIComponent(tag)}`}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-colors ${
                  tagFilter === tag
                    ? 'bg-orange-100 text-orange-900 border-orange-300'
                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                }`}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Titel */}
        <h2
          className={`font-bold text-slate-900 mb-2 leading-tight tracking-tight transition-colors group-hover:text-orange-700 line-clamp-2 ${
            featured ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-lg sm:text-xl'
          }`}
        >
          <Link href={`/artiklar/${post.slug}`}>{post.title}</Link>
        </h2>

        {/* Beskrivning */}
        {post.description && (
          <p
            className={`text-slate-600 leading-relaxed mb-4 ${
              featured ? 'text-base sm:text-lg line-clamp-2' : 'text-sm line-clamp-3'
            }`}
          >
            {post.description}
          </p>
        )}

        {/* Meta + CTA — alltid längst ner */}
        <div className="mt-auto pt-3 border-t border-orange-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {formattedDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-orange-500" strokeWidth={2.5} />
                <time dateTime={post.date}>{formattedDate}</time>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-orange-500" strokeWidth={2.5} />
              <span>{readingTime} min</span>
            </span>
          </div>

          <Link
            href={`/artiklar/${post.slug}`}
            className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-800 font-bold text-xs sm:text-sm group/link"
            aria-label={`Läs ${post.title}`}
          >
            <span className="hidden sm:inline">Läs artikeln</span>
            <span className="sm:hidden">Läs</span>
            <ArrowRight
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/link:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
