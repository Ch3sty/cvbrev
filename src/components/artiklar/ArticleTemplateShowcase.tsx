'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Crown } from 'lucide-react';
import {
  MallThumbnailMinimal,
  MallThumbnailClassic,
  MallThumbnailNordic,
  MallThumbnailCreative,
} from './illustrations/ArticleIcons';

const TEMPLATES = [
  {
    name: 'Modern Minimal',
    Thumbnail: MallThumbnailMinimal,
    badge: 'Populärast',
  },
  {
    name: 'Classic Professional',
    Thumbnail: MallThumbnailClassic,
    badge: 'Rekommenderad',
  },
  {
    name: 'Nordic',
    Thumbnail: MallThumbnailNordic,
    badge: 'Heta just nu',
  },
  {
    name: 'Creative Edge',
    Thumbnail: MallThumbnailCreative,
    badge: 'Trendigt',
  },
];

/**
 * Mid-article CV-mall-showcase. Bara injekteras för CV-relaterade artiklar.
 *
 * Designad för att smälta in i läsflödet — kompakt, vit bakgrund med
 * orange-accenter, inte en stor gradient-banner.
 */
export default function ArticleTemplateShowcase() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-orange-200/60 bg-white my-7 sm:my-8 not-prose"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
      aria-label="Populära CV-mallar"
    >
      {/* Gradient-strip topp */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: 'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5 sm:mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
              <Crown className="w-3 h-3" strokeWidth={2.5} />
              Populära CV-mallar
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Mallar som ökar dina chanser att få jobbet
            </h3>
          </div>
        </div>

        {/* Thumbnail-grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {TEMPLATES.map((template) => {
            const Thumbnail = template.Thumbnail;
            return (
              <Link
                key={template.name}
                href="/dashboard/cv-mallar"
                className="group relative block touch-manipulation"
              >
                {/* Badge */}
                <div className="absolute -top-1.5 left-1 right-1 z-10 flex justify-center">
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white whitespace-nowrap leading-none"
                    style={{
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                      boxShadow: '0 3px 8px -2px rgba(220, 38, 38, 0.35)',
                    }}
                  >
                    {template.badge}
                  </span>
                </div>

                {/* Thumbnail-card */}
                <div className="rounded-lg overflow-hidden bg-orange-50/40 border border-orange-100 hover:border-orange-300 group-hover:-translate-y-0.5 group-hover:shadow-md transition-all">
                  <div className="aspect-[10/13] flex items-center justify-center bg-white">
                    <Thumbnail className="w-full h-full" />
                  </div>
                </div>

                {/* Namn */}
                <div className="mt-1.5 text-center">
                  <div className="font-semibold text-slate-800 text-[10px] sm:text-[11px] leading-tight group-hover:text-orange-800 transition-colors line-clamp-1">
                    {template.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer-rad */}
        <div className="flex items-center justify-between gap-3 mt-3.5 pt-3 border-t border-orange-100">
          <div className="text-[11px] sm:text-xs text-slate-600">
            <span className="font-semibold text-slate-900">8+ mallar</span>
            <span className="text-slate-400 mx-1.5">·</span>
            <span>Alla branscher</span>
          </div>
          <Link
            href="/dashboard/cv-mallar"
            className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-800 font-bold text-xs group"
          >
            Se alla mallar
            <ArrowRight
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}
