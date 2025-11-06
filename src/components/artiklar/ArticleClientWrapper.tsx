'use client'

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronUp, Share2, Linkedin, Twitter, Facebook, BookOpen, Clock, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { PostMeta } from '@/lib/blog';

// Import komponenter
import PremiumNavbar from '@/components/PremiumNavbar';
import PremiumArticleSidebar from '@/components/artiklar/PremiumArticleSidebar';
import { Heading } from '@/lib/extractHeadings';
import AuthorBox from '@/components/artiklar/AuthorBox';
import BreadcrumbNavigation from '@/components/artiklar/BreadcrumbNavigation';
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
  headings
}: ArticleClientWrapperProps) {
  // Get author for this article
  const author = getAuthorForArticle(slug, post.frontmatter.tags || [], post.frontmatter.title);

  // Reading progress state
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Social sharing functions
  const shareUrl = `https://jobbcoach.ai/artiklar/${slug}`;
  const shareTitle = post.frontmatter.title;

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
    }
    if (url) window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      {/* Premium Navbar */}
      <PremiumNavbar />

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 z-40 origin-left"
        style={{ scaleX }}
      />

      {/* Back to Top Button - mobilanpassad */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 p-3 sm:p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 touch-manipulation"
            aria-label="Tillbaka till toppen"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative pt-20 sm:pt-24">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl" />
        </div>

        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto">
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">

            {/* Main Content Column */}
            <div className="lg:col-span-8">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 lg:p-12"
              >
                {/* Breadcrumb Navigation */}
                <div className="mb-6 sm:mb-8">
                  <BreadcrumbNavigation
                    articleTitle={post.frontmatter.title}
                    articleSlug={slug}
                  />
                </div>

                {/* Article Header */}
                <header className="mb-8 sm:mb-10">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {post.frontmatter.tags && post.frontmatter.tags.map((tag: string) => (
                      <Link
                        href={`/artiklar?tag=${tag}`}
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200/50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 touch-manipulation"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                    {post.frontmatter.title}
                  </h1>

                  {/* Meta information - responsiv layout */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <time dateTime={post.frontmatter.date}>
                        {format(parseISO(post.frontmatter.date), 'd MMM yyyy', { locale: sv })}
                      </time>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>
                        <span className="hidden sm:inline">{readingTime} min läsning</span>
                        <span className="sm:hidden">{readingTime} min</span>
                      </span>
                    </div>

                    {/* Social Share Buttons - mobilanpassade */}
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-slate-500 mr-2 hidden sm:inline">Dela:</span>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="p-2 text-slate-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-all duration-200 touch-manipulation"
                        aria-label="Dela på LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="p-2 text-slate-600 hover:text-[#1DA1F2] hover:bg-blue-50 rounded-lg transition-all duration-200 touch-manipulation"
                        aria-label="Dela på Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-2 text-slate-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-lg transition-all duration-200 touch-manipulation"
                        aria-label="Dela på Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </header>

                {/* Author Box - SEO optimized */}
                <AuthorBox author={author} readingTime={readingTime} />

                {/* Article Content - Mobilanpassad typografi */}
                <div className="prose prose-slate max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 prose-headings:scroll-mt-20
                  prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:md:text-4xl prose-h1:mb-4 prose-h1:sm:mb-6 prose-h1:mt-10 prose-h1:sm:mt-12
                  prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:sm:mt-10 prose-h2:mb-4 prose-h2:sm:mb-5
                  prose-h3:text-lg prose-h3:sm:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:sm:mt-8 prose-h3:mb-3 prose-h3:sm:mb-4
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base prose-p:sm:text-lg prose-p:mb-4 prose-p:sm:mb-6
                  prose-a:text-transparent prose-a:bg-clip-text prose-a:bg-gradient-to-r prose-a:from-blue-600 prose-a:to-indigo-600 prose-a:font-medium hover:prose-a:from-blue-500 hover:prose-a:to-indigo-500 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slate-900 prose-strong:font-semibold
                  prose-code:before:content-none prose-code:after:content-none
                  prose-code:text-blue-600 prose-code:bg-gradient-to-r prose-code:from-blue-50 prose-code:to-indigo-50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:border prose-code:border-blue-200/50
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-gradient-to-r prose-blockquote:from-blue-50 prose-blockquote:to-indigo-50 prose-blockquote:text-slate-700 prose-blockquote:px-4 prose-blockquote:sm:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:my-6 prose-blockquote:sm:my-8
                  prose-ul:text-slate-600 prose-ul:my-4 prose-ul:sm:my-6 prose-ul:space-y-2
                  prose-ol:text-slate-600 prose-ol:my-4 prose-ol:sm:my-6 prose-ol:space-y-2
                  prose-li:text-slate-600 prose-li:mb-2 prose-li:text-base prose-li:sm:text-lg
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-6 prose-img:sm:my-8
                ">
                  {children}
                </div>

                {/* Article Footer - mobilanpassad */}
                <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Link
                      href="/artiklar"
                      className="inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 text-sm sm:text-base touch-manipulation"
                    >
                      ← Tillbaka till alla artiklar
                    </Link>

                    {/* Share prompt - dold på mobil */}
                    <div className="text-xs sm:text-sm text-slate-600 hidden sm:block">
                      Gillade du artikeln? Dela den med ditt nätverk!
                    </div>
                  </div>
                </footer>
              </motion.article>
            </div>

            {/* Premium Sidebar with SEO-optimized TOC - dold på mindre skärmar */}
            <div className="hidden lg:block lg:col-span-4">
              <PremiumArticleSidebar
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
