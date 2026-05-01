'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

interface CategoryItem {
  tag: string;
  count: number;
}

interface StickyCategoryBarProps {
  categories: CategoryItem[];
  activeTag?: string;
  totalCount: number;
}

export default function StickyCategoryBar({
  categories,
  activeTag,
  totalCount,
}: StickyCategoryBarProps) {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detektera när bar:en är "stuck" (sticky aktivt)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // När sentinel går ut ur viewport (uppåt) är bar:en stuck
        setIsStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: '0px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Scrolla aktiv-knappen till syn vid mount (mobil)
  useEffect(() => {
    if (!scrollContainerRef.current || !activeTag) return;
    const activeButton = scrollContainerRef.current.querySelector<HTMLAnchorElement>(
      `[data-tag="${activeTag.toLowerCase()}"]`
    );
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTag]);

  return (
    <>
      {/* Sentinel för IntersectionObserver — placeras direkt ovanför sticky bar:en */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      {/* Sticky bar */}
      <div
        className={`sticky top-16 z-30 transition-all duration-300 ${
          isStuck
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-orange-100'
            : 'bg-transparent'
        }`}
      >
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="py-3 sm:py-4">
            {/* Header-rad (bara när inte stuck) */}
            {!isStuck && (
              <div className="flex items-center gap-2 mb-2.5 sm:mb-3 px-1">
                <Filter className="w-3.5 h-3.5 text-orange-700" strokeWidth={2.5} />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                  Filtrera efter ämne
                </span>
              </div>
            )}

            {/* Scrollbar pillar */}
            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* "Alla artiklar" först */}
              <CategoryPill
                href="/artiklar"
                label="Alla artiklar"
                count={totalCount}
                active={!activeTag}
                tag=""
              />

              {categories.map((cat) => (
                <CategoryPill
                  key={cat.tag}
                  href={`/artiklar?tag=${encodeURIComponent(cat.tag)}`}
                  label={cat.tag}
                  count={cat.count}
                  active={activeTag?.toLowerCase() === cat.tag.toLowerCase()}
                  tag={cat.tag}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

interface CategoryPillProps {
  href: string;
  label: string;
  count: number;
  active: boolean;
  tag: string;
}

function CategoryPill({ href, label, count, active, tag }: CategoryPillProps) {
  return (
    <Link
      href={href}
      data-tag={tag.toLowerCase()}
      style={{
        scrollSnapAlign: 'start',
        ...(active
          ? {
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.4)',
            }
          : undefined),
      }}
      className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 touch-manipulation ${
        active
          ? 'text-white'
          : 'bg-white text-slate-700 border border-orange-200 hover:border-orange-400 hover:bg-orange-50'
      }`}
      aria-pressed={active}
    >
      {active && (
        <motion.span
          layoutId="active-pill-glow"
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10">{label}</span>
      <span
        className={`relative z-10 text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
          active
            ? 'bg-white/25 text-white'
            : 'bg-orange-100 text-orange-800'
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
