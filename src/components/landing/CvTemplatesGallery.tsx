'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Linkedin, Columns2, Lock, Sparkles } from 'lucide-react';

type Template = {
  slug: string;
  name: string;
  tagline: string;
  premium: boolean;
  features?: ('photo' | 'linkedin' | 'two-col')[];
};

const TEMPLATES: Template[] = [
  {
    slug: 'modern-minimal',
    name: 'Modern Minimal',
    tagline: 'Ren och tydlig för alla branscher',
    premium: false,
  },
  {
    slug: 'classic-professional',
    name: 'Klassisk Professionell',
    tagline: 'Traditionell svensk struktur',
    premium: false,
  },
  {
    slug: 'clean-corporate',
    name: 'Clean Corporate',
    tagline: 'För företags- och affärsroller',
    premium: true,
  },
  {
    slug: 'creative-edge',
    name: 'Creative Edge',
    tagline: 'Subtil designtouch för kreativa yrken',
    premium: true,
  },
  {
    slug: 'executive-premium',
    name: 'Executive Premium',
    tagline: 'Exklusiv design för ledande roller',
    premium: true,
  },
  {
    slug: 'nordic-professional',
    name: 'Nordic Professional',
    tagline: 'Skandinavisk elegans med foto',
    premium: true,
    features: ['photo', 'linkedin', 'two-col'],
  },
  {
    slug: 'platinum-executive',
    name: 'Platinum Executive',
    tagline: 'Otroligt polerad design',
    premium: true,
    features: ['photo', 'linkedin', 'two-col'],
  },
  {
    slug: 'creative-minimal',
    name: 'Creative Minimal',
    tagline: 'Asymmetrisk layout med horisontell header',
    premium: true,
    features: ['photo', 'linkedin', 'two-col'],
  },
];

const FEATURE_META = {
  photo: { icon: Camera, label: 'Foto-stöd' },
  linkedin: { icon: Linkedin, label: 'LinkedIn' },
  'two-col': { icon: Columns2, label: '2-kolumn' },
} as const;

export default function CvTemplatesGallery() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-orange-50/30 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            CV-mallar
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Åtta mallar, alla ATS-säkra
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Två gratis att börja med. Sex Premium med foto-stöd, LinkedIn-integration
            och tvåkolumns-layout för dig som vill mer.
          </p>
        </motion.div>

        {/* Mobil: horisontell scroll. Desktop: 4-kolumns grid */}
        <div
          className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 mb-10"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 min-w-max sm:min-w-0">
            {TEMPLATES.map((template, i) => (
              <motion.div
                key={template.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.06 }}
                className="group relative w-[200px] sm:w-auto flex-shrink-0"
              >
                <Link
                  href="/cv-mallar"
                  className="block relative bg-white rounded-2xl overflow-hidden border border-orange-100 hover:border-orange-300 hover:-translate-y-1 transition-all duration-300"
                  style={{
                    boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)',
                  }}
                >
                  {/* Premium gradient-strip på toppen */}
                  {template.premium && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 z-10"
                      style={{
                        background:
                          'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Premium-badge */}
                  {template.premium && (
                    <span
                      className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                        boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.45)',
                      }}
                    >
                      <Sparkles className="w-2.5 h-2.5" strokeWidth={3} />
                      Premium
                    </span>
                  )}

                  {/* Mall-bild */}
                  <div className="relative aspect-[3/4] bg-orange-50/30 overflow-hidden">
                    <Image
                      src={`/mallar/${template.slug}.svg`}
                      alt={`${template.name} CV-mall`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Innehåll */}
                  <div className="p-4">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight mb-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-snug mb-3 line-clamp-2">
                      {template.tagline}
                    </p>

                    {/* Features (om premium med extras) */}
                    {template.features && template.features.length > 0 ? (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-orange-100">
                        {template.features.map((f) => {
                          const meta = FEATURE_META[f];
                          return (
                            <span
                              key={f}
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-700"
                            >
                              <meta.icon
                                className="w-2.5 h-2.5"
                                strokeWidth={2.5}
                              />
                              {meta.label}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-orange-100">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            template.premium
                              ? 'text-orange-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {template.premium ? (
                            <>
                              <Lock className="w-2.5 h-2.5" strokeWidth={2.5} />
                              Premium
                            </>
                          ) : (
                            <>
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                                aria-hidden="true"
                              />
                              Gratis
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Två CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/cv-mallar"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm border border-orange-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all touch-manipulation w-full sm:w-auto"
          >
            Se alla CV-mallar
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <Link
            href="/cv-exempel"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-orange-700 font-bold text-sm hover:bg-orange-50/40 transition-all touch-manipulation w-full sm:w-auto"
          >
            Bläddra 75+ CV-exempel
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
