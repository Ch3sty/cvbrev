'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CalendarDays, UserCircle, Tag, Clock, ArrowRight, FileText } from 'lucide-react';
import ArticleImage from '@/components/ArticleImage';
import { motion } from 'framer-motion';
import { PostMeta } from '@/lib/blog';

interface ModernArticleCardProps {
  post: PostMeta;
  tagFilter?: string;
  featured?: boolean;
}

const ModernArticleCard: React.FC<ModernArticleCardProps> = ({
  post,
  tagFilter,
  featured = false
}) => {
  const hasValidImage =
    typeof post.image === 'string' &&
    post.image.trim() !== '' &&
    post.image.startsWith('/');

  // Calculate reading time based on actual word count (~200 words per minute)
  const calculateReadingTime = (wordCount: number) => {
    if (wordCount === 0) return 1; // Minimum 1 minute
    return Math.ceil(wordCount / 200);
  };

  const readingTime = calculateReadingTime(post.wordCount || 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200/60 hover:border-gray-300/80 ${
        featured ? 'md:col-span-2 lg:col-span-3' : ''
      }`}
    >
      {/* Article Image */}
      <Link
        href={`/artiklar/${post.slug}`}
        className="block overflow-hidden"
        aria-label={`Läs mer om ${post.title}`}
      >
        <div className={`relative ${featured ? 'h-64 md:h-96' : 'h-48'}`}>
          {hasValidImage ? (
            <>
              <ArticleImage
                src={post.image as string}
                alt={post.title ?? 'Artikelbild'}
                slug={post.slug}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      {/* Article Content */}
      <div className="p-6">
        {/* Article Meta */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            {post.date && (() => {
              try {
                // Parse and validate the date
                const parsedDate = parseISO(post.date);
                // Check if the date is valid
                if (!isNaN(parsedDate.getTime())) {
                  return (
                    <time dateTime={post.date}>
                      {format(parsedDate, 'd MMM yyyy', { locale: sv })}
                    </time>
                  );
                }
                // Fallback for invalid dates
                return <span>{post.date}</span>;
              } catch (error) {
                // Fallback if date parsing fails
                console.warn('Date parsing failed for:', post.date, error);
                return <span>{post.date}</span>;
              }
            })()}
          </div>

          {post.author && (
            <div className="flex items-center gap-1">
              <UserCircle className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min läsning</span>
          </div>
        </div>

        {/* Article Title */}
        <h2 className={`font-bold text-gray-900 mb-3 transition-colors group-hover:text-pink-600 line-clamp-2 ${
          featured ? 'text-2xl lg:text-3xl leading-tight' : 'text-xl leading-tight'
        }`}>
          <Link href={`/artiklar/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        {/* Article Description */}
        <p className={`text-gray-600 leading-relaxed mb-4 ${
          featured ? 'text-lg line-clamp-2' : 'text-base line-clamp-3'
        }`}>
          {post.description}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {post.tags.slice(0, featured ? 4 : 3).map((tag) => (
              <Link
                key={tag}
                href={`/artiklar?tag=${encodeURIComponent(tag)}`}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  tagFilter === tag
                    ? 'bg-pink-100 text-pink-700 border border-pink-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {tag}
              </Link>
            ))}
            {post.tags.length > (featured ? 4 : 3) && (
              <span className="text-xs text-gray-400">+{post.tags.length - (featured ? 4 : 3)} fler</span>
            )}
          </div>
        )}

        {/* Read More Link */}
        <Link
          href={`/artiklar/${post.slug}`}
          className="inline-flex items-center text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors group/link"
        >
          Läs hela artikeln
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
};

export default ModernArticleCard;