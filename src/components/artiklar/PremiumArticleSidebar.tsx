'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PostMeta } from '@/lib/blog';
import { Heading } from '@/lib/extractHeadings';
import { motion } from 'framer-motion';
import {
  Sparkles, FileText, ArrowRight, ChevronDown, ChevronUp,
  BookOpen, Zap, Star, TrendingUp, Gift, Rocket
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';

interface PremiumArticleSidebarProps {
  allPosts: PostMeta[];
  currentPostSlug: string;
  currentPostTags?: string[];
  headings: Heading[]; // Pre-extracted headings from server for SEO
}

const PremiumArticleSidebar: React.FC<PremiumArticleSidebarProps> = ({
  allPosts,
  currentPostSlug,
  currentPostTags = [],
  headings = [] // Now receiving pre-extracted headings from server
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [expandedToc, setExpandedToc] = useState(true);

  // Track active section based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = headings.map(h => document.getElementById(h.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Get related posts
  const otherPosts = allPosts.filter(post => post.slug !== currentPostSlug);
  let relatedPosts: PostMeta[] = [];

  if (currentPostTags && currentPostTags.length > 0 && otherPosts.length > 0) {
    relatedPosts = otherPosts
      .map(post => {
        const commonTags = post.tags?.filter(tag => currentPostTags.includes(tag)).length || 0;
        return { ...post, commonTags };
      })
      .filter(post => post.commonTags > 0)
      .sort((a, b) => b.commonTags - a.commonTags || parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 3);
  }

  if (relatedPosts.length < 3) {
    const latestPosts = otherPosts
      .filter(post => !relatedPosts.some(rp => rp.slug === post.slug))
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    relatedPosts = [...relatedPosts, ...latestPosts].slice(0, 3);
  }

  return (
    <aside className="lg:col-span-4">
      {/* Entire Sidebar - Sticky as one unit */}
      <div className="sticky top-24 space-y-6">
        {/* Table of Contents */}
        {headings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 backdrop-blur-xl bg-white/90"
            role="navigation"
            aria-label="Innehållsförteckning"
          >
          <button
            onClick={() => setExpandedToc(!expandedToc)}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900" id="toc-heading">Innehållsförteckning</h3>
            </div>
            {expandedToc ? (
              <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-pink-600 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-pink-600 transition-colors" />
            )}
          </button>

          {expandedToc && (
            <nav
              className="mt-4"
              aria-labelledby="toc-heading"
            >
              <ol className="space-y-1">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(heading.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                          // Update URL hash for better SEO and sharing
                          window.history.pushState(null, '', `#${heading.id}`);
                        }
                      }}
                      className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        activeSection === heading.id
                          ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 font-medium border-l-2 border-pink-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      aria-current={activeSection === heading.id ? 'location' : undefined}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          </motion.div>
        )}

        {/* Premium CTA Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full">
              Premium
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2">Testa alla verktyg gratis i 7 dagar</h3>
          <p className="text-white/90 text-sm mb-6">
            Betala bara om du vill fortsätta. Avsluta kostnadsfritt innan provperioden går ut.
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Obegränsad tillgång till alla funktioner</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Skapa brev, CV och LinkedIn-profiler som sticker ut</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span>Personliga brev anpassade till varje jobb</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Avsluta när du vill – ingen bindningstid</span>
            </div>
          </div>

          <Link
            href="/trial-signup"
            className="block w-full py-3 px-4 bg-white text-purple-600 font-semibold rounded-lg text-center hover:bg-gray-50 transition-colors duration-200 shadow-lg"
          >
            Testa gratis nu
          </Link>
        </div>
        </motion.div>

        {/* AI Tools Showcase */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900">Populära AI-verktyg</h3>
        </div>

        <div className="space-y-3">
          <Link
            href="/skapa-brev"
            className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-pink-50 hover:to-purple-50 border border-gray-100 hover:border-purple-200 transition-all duration-200"
          >
            <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg group-hover:from-pink-200 group-hover:to-purple-200">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">Skapa personligt brev</h4>
              <p className="text-xs text-gray-600">AI-matchning mot jobbannonser</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-200" />
          </Link>

          <Link
            href="/analysera-cv"
            className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-pink-50 hover:to-purple-50 border border-gray-100 hover:border-purple-200 transition-all duration-200"
          >
            <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg group-hover:from-pink-200 group-hover:to-purple-200">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">CV-analys</h4>
              <p className="text-xs text-gray-600">Få AI-feedback direkt</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-200" />
          </Link>

          <Link
            href="/cv-mallar"
            className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-pink-50 hover:to-purple-50 border border-gray-100 hover:border-purple-200 transition-all duration-200"
          >
            <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg group-hover:from-pink-200 group-hover:to-purple-200">
              <Gift className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">CV-mallar</h4>
              <p className="text-xs text-gray-600">8 professionella mallar</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-200" />
          </Link>
        </div>
        </motion.div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-pink-600" />
            <h3 className="font-semibold text-gray-900">Relaterade artiklar</h3>
          </div>

          <div className="space-y-3">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/artiklar/${post.slug}`}
                className="group block p-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200"
              >
                <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {format(parseISO(post.date), 'd MMM yyyy', { locale: sv })}
                </p>
              </Link>
            ))}
          </div>

          <Link
            href="/artiklar"
            className="mt-4 flex items-center gap-2 text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-medium hover:from-pink-500 hover:to-purple-500"
          >
            Visa alla artiklar
            <ArrowRight className="w-4 h-4 text-pink-600" />
          </Link>
          </motion.div>
        )}
      </div>
    </aside>
  );
};

export default PremiumArticleSidebar;