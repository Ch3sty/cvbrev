'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
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
    desc: 'Perfekt för tech och konsult',
  },
  {
    name: 'Classic Professional',
    Thumbnail: MallThumbnailClassic,
    badge: 'Rekommenderad',
    desc: 'Traditionell och pålitlig',
  },
  {
    name: 'Nordic Professional',
    Thumbnail: MallThumbnailNordic,
    badge: 'Heta just nu',
    desc: 'Skandinavisk elegans',
  },
  {
    name: 'Creative Edge',
    Thumbnail: MallThumbnailCreative,
    badge: 'Trendigt',
    desc: 'För kreativa yrken',
  },
];

export default function ArticleTemplateShowcase() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-5 sm:p-7 md:p-8 my-8 sm:my-10 not-prose"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Gradient-strip topp */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            Populära CV-mallar
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Mallar som ökar dina chanser
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Professionellt designade mallar — välj den som passar din bransch.
          </p>
        </div>
      </div>

      {/* Template-grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {TEMPLATES.map((template, idx) => {
          const Thumbnail = template.Thumbnail;
          return (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group relative"
            >
              {/* Badge */}
              <div className="absolute -top-2 left-2 z-10">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  {template.badge}
                </span>
              </div>

              {/* Thumbnail-card */}
              <div className="rounded-2xl bg-orange-50/40 border border-orange-100 p-2.5 sm:p-3 hover:border-orange-300 hover:shadow-md group-hover:-translate-y-0.5 transition-all">
                <div className="aspect-[10/13] rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <Thumbnail className="w-full h-full" />
                </div>
                <div className="pt-2 sm:pt-2.5 px-0.5">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight mb-0.5">
                    {template.name}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                    {template.desc}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer-rad */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-orange-100">
        <div className="text-xs sm:text-sm text-slate-600">
          <span className="font-semibold text-slate-900">8 professionella mallar</span> att välja mellan
        </div>
        <Link
          href="/dashboard/cv-mallar"
          className="inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-800 font-bold text-xs sm:text-sm group"
        >
          Visa alla mallar
          <ArrowRight
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        </Link>
      </div>
    </motion.aside>
  );
}
