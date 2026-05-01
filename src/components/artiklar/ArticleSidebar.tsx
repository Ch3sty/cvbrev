'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { PostMeta } from '@/lib/blog';
import { Heading } from '@/lib/extractHeadings';
import {
  CvMallarIcon,
  CvAnalysIcon,
  BrevIcon,
  JobbmatchningIcon,
  TrialCardIllustration,
} from './illustrations/ArticleIcons';

interface ArticleSidebarProps {
  allPosts: PostMeta[];
  currentPostSlug: string;
  currentPostTags?: string[];
  headings: Heading[];
}

const POPULAR_TOOLS = [
  { Icon: CvMallarIcon, label: 'CV-mallar', desc: '8+ professionella mallar', href: '/dashboard/cv-mallar' },
  { Icon: CvAnalysIcon, label: 'CV-analys', desc: 'Få konkret feedback', href: '/dashboard/cv-analys' },
  { Icon: BrevIcon, label: 'Personliga brev', desc: 'Matchande brev på 60 sek', href: '/dashboard/skapa-brev' },
  { Icon: JobbmatchningIcon, label: 'Jobbmatchning', desc: 'Hitta rätt jobb', href: '/dashboard/jobbmatchning' },
];

export default function ArticleSidebar({
  allPosts,
  currentPostSlug,
  currentPostTags = [],
  headings = [],
}: ArticleSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = headings.map((h) => document.getElementById(h.id));
      const scrollPosition = window.scrollY + 120;

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

  const otherPosts = allPosts.filter((p) => p.slug !== currentPostSlug);
  let relatedPosts: PostMeta[] = [];

  if (currentPostTags.length > 0 && otherPosts.length > 0) {
    relatedPosts = otherPosts
      .map((post) => ({
        ...post,
        commonTags: post.tags?.filter((tag) => currentPostTags.includes(tag)).length || 0,
      }))
      .filter((post) => post.commonTags > 0)
      .sort(
        (a, b) =>
          b.commonTags - a.commonTags ||
          parseISO(b.date).getTime() - parseISO(a.date).getTime()
      )
      .slice(0, 3);
  }

  if (relatedPosts.length < 3) {
    const latest = otherPosts
      .filter((p) => !relatedPosts.some((rp) => rp.slug === p.slug))
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    relatedPosts = [...relatedPosts, ...latest].slice(0, 3);
  }

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-24 space-y-5">
        {/* Innehållsförteckning */}
        {headings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-5"
            style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background:
                  'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
              }}
            />
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-orange-700" strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                Innehållsförteckning
              </span>
            </div>
            <nav>
              <ul className="space-y-0.5">
                {headings.map((heading) => {
                  const isActive = activeSection === heading.id;
                  return (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className={`relative block px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-900 font-semibold'
                            : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-700'
                        }`}
                      >
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                            style={{
                              background:
                                'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
                            }}
                          />
                        )}
                        {heading.text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}

        {/* Trial-CTA */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative overflow-hidden rounded-3xl text-white p-5"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 36px -10px rgba(220, 38, 38, 0.45)',
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            aria-hidden="true"
          >
            <pattern
              id="article-sidebar-dots"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="12" cy="12" r="0.9" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#article-sidebar-dots)" />
          </svg>

          <div className="relative">
            <TrialCardIllustration className="w-full h-auto mb-3 max-w-[140px]" />
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1 opacity-90 inline-flex items-center gap-1.5">
              <Sparkle className="w-3 h-3" strokeWidth={2.5} />
              Premium
            </div>
            <h3 className="text-lg font-black leading-tight mb-1.5">
              Testa alla verktyg gratis i 7 dagar
            </h3>
            <p className="text-xs opacity-95 mb-4 leading-relaxed">
              Avsluta kostnadsfritt innan provperioden går ut. Inga bindningstider.
            </p>
            <Link
              href="/login?signup=true"
              className="block w-full text-center px-4 py-2.5 rounded-xl bg-white text-orange-700 font-bold text-sm hover:bg-orange-50 hover:scale-[1.02] transition-all touch-manipulation"
            >
              Testa gratis nu
            </Link>
          </div>
        </motion.div>

        {/* Populära verktyg */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-5"
          style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.15)' }}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-3">
            Populära verktyg
          </div>
          <div className="space-y-1">
            {POPULAR_TOOLS.map((tool) => {
              const Icon = tool.Icon;
              return (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50/60 transition-colors touch-manipulation"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm leading-tight group-hover:text-orange-700 transition-colors">
                      {tool.label}
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      {tool.desc}
                    </div>
                  </div>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 group-hover:text-orange-700 group-hover:translate-x-0.5 transition-all"
                    strokeWidth={2.5}
                  />
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Relaterade artiklar */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-5"
            style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.15)' }}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-3 inline-flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" strokeWidth={2.5} />
              Relaterade artiklar
            </div>
            <div className="space-y-2">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/artiklar/${post.slug}`}
                  className="group block p-2.5 rounded-xl hover:bg-orange-50/60 transition-colors"
                >
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-orange-700 transition-colors mb-0.5 line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    {format(parseISO(post.date), 'd MMM yyyy', { locale: sv })}
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/artiklar"
              className="mt-3 inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-800 font-bold text-xs group"
            >
              Visa alla artiklar
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>
        )}
      </div>
    </aside>
  );
}
