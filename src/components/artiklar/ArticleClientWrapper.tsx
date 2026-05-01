'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { PostMeta } from '@/lib/blog';

import PremiumNavbar from '@/components/PremiumNavbar';
import ArticleSidebar from '@/components/artiklar/ArticleSidebar';
import ArticleHero from '@/components/artiklar/ArticleHero';
import ArticleAuthorCard from '@/components/artiklar/ArticleAuthorCard';
import ArticleBackButton from '@/components/artiklar/ArticleBackButton';
import { Heading } from '@/lib/extractHeadings';
import { getAuthorForArticle } from '@/lib/authors';

interface ArticleClientWrapperProps {
  children: React.ReactNode;
  post: {
    frontmatter: {
      title: string;
      date: string;
      author?: string;
      tags?: string[];
    };
    content: string;
  };
  slug: string;
  allPostsMeta: PostMeta[];
  readingTime: number;
  headings: Heading[];
}

export default function ArticleClientWrapper({
  children,
  post,
  slug,
  allPostsMeta,
  readingTime,
  headings,
}: ArticleClientWrapperProps) {
  const author = getAuthorForArticle(slug, post.frontmatter.tags || [], post.frontmatter.title);
  const shareUrl = `https://www.jobbcoach.ai/artiklar/${slug}`;

  const [showBackToTop, setShowBackToTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/20">
      <PremiumNavbar />

      {/* Reading progress bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-1 z-40 origin-left"
        style={{
          scaleX,
          background:
            'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 p-3 sm:p-3.5 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 touch-manipulation"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              boxShadow: '0 12px 32px -8px rgba(220, 38, 38, 0.5)',
            }}
            aria-label="Tillbaka till toppen"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative pt-20 sm:pt-24">
        <div className="container max-w-7xl px-3 sm:px-4 lg:px-8 py-6 sm:py-10 mx-auto">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Main column */}
            <div className="lg:col-span-8">
              <ArticleHero
                title={post.frontmatter.title}
                date={post.frontmatter.date}
                readingTime={readingTime}
                tags={post.frontmatter.tags}
                slug={slug}
              />

              <motion.article
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 md:p-10"
                style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
              >
                <ArticleAuthorCard author={author} />

                <div
                  className="prose prose-slate max-w-none
                    prose-headings:font-bold prose-headings:text-slate-900 prose-headings:scroll-mt-20
                    prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:md:text-4xl prose-h1:mb-4 prose-h1:mt-10
                    prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:md:text-3xl prose-h2:font-bold prose-h2:mt-8 prose-h2:sm:mt-10 prose-h2:mb-4 prose-h2:tracking-tight
                    prose-h3:text-lg prose-h3:sm:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:sm:mt-8 prose-h3:mb-3
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base prose-p:sm:text-lg prose-p:mb-4 prose-p:sm:mb-5
                    prose-a:text-orange-700 prose-a:font-semibold hover:prose-a:text-orange-800 prose-a:underline prose-a:decoration-orange-300 hover:prose-a:decoration-orange-500
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-code:before:content-none prose-code:after:content-none
                    prose-code:text-orange-700 prose-code:bg-orange-50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:border prose-code:border-orange-200/70
                    prose-blockquote:border-l-4 prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50/50 prose-blockquote:text-slate-700 prose-blockquote:px-4 prose-blockquote:sm:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:my-6
                    prose-ul:text-slate-700 prose-ul:my-4 prose-ul:space-y-2
                    prose-ol:text-slate-700 prose-ol:my-4 prose-ol:space-y-2
                    prose-li:text-slate-700 prose-li:mb-2 prose-li:text-base prose-li:sm:text-lg
                    prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-6
                  "
                >
                  {children}
                </div>

                <ArticleBackButton shareTitle={post.frontmatter.title} shareUrl={shareUrl} />
              </motion.article>
            </div>

            {/* Sidebar (desktop) */}
            <div className="hidden lg:block lg:col-span-4">
              <ArticleSidebar
                allPosts={allPostsMeta}
                currentPostSlug={slug}
                currentPostTags={post.frontmatter.tags}
                headings={headings}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
