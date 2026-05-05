'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { RelateradeThumb } from './illustrations/ExempelIcons';

interface RelateradItem {
  yrke: string;
  slug: string;
}

interface RelateradeYrkenGridProps {
  variant: 'letter' | 'cv';
  items: RelateradItem[];
}

export default function RelateradeYrkenGrid({
  variant,
  items,
}: RelateradeYrkenGridProps) {
  if (!items || items.length === 0) return null;

  const basePath =
    variant === 'letter' ? '/personligt-brev-exempel' : '/cv-exempel';
  const what =
    variant === 'letter' ? 'personliga brev-exempel' : 'CV-exempel';
  const shortWhat = variant === 'letter' ? 'brev' : 'CV';

  return (
    <section>
      <div className="mb-5 sm:mb-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          Andra yrken
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Fler {what}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
          Hitta inspiration från liknande yrken — alla exempel följer samma
          ATS-optimerade upplägg.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={`${basePath}/${item.slug}`}
            className="group block"
            aria-label={`Se ${shortWhat}-exempel för ${item.yrke}`}
          >
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-2xl border border-orange-200/60 bg-white p-4 sm:p-5 hover:border-orange-400/60 transition-colors h-full flex flex-col"
              style={{
                boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{
                  background:
                    'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
                }}
              />

              <div className="flex justify-center mb-3 mt-1">
                <RelateradeThumb
                  variant={variant}
                  className="group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="text-center mb-3 flex-1">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  {item.yrke}
                </h3>
              </div>

              <div className="flex items-center justify-center gap-1 text-orange-700 text-xs sm:text-sm font-bold group-hover:gap-2 transition-all">
                <span>Se {shortWhat}-exempel</span>
                <ArrowRight
                  className="w-3.5 h-3.5"
                  strokeWidth={2.5}
                />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
