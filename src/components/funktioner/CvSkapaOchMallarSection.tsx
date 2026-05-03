'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  FilePlus,
  Camera,
  Linkedin,
  Columns2,
  ChevronRight,
} from 'lucide-react';

const SECTIONS = [
  { label: 'Personuppgifter', done: true },
  { label: 'Profil & sammanfattning', done: true },
  { label: 'Erfarenhet', active: true },
  { label: 'Utbildning', done: false },
  { label: 'Färdigheter', done: false },
  { label: 'Språk & övrigt', done: false },
];

const PREVIEW_TEMPLATES = [
  {
    slug: 'classic-professional',
    label: 'Klassisk Professionell',
    rotate: -6,
    offset: 'left-0',
    premium: false,
  },
  {
    slug: 'executive-premium',
    label: 'Executive Premium',
    rotate: 0,
    offset: 'left-1/2 -translate-x-1/2 z-10',
    premium: true,
  },
  {
    slug: 'nordic-professional',
    label: 'Nordic Professional',
    rotate: 6,
    offset: 'right-0',
    premium: true,
  },
];

const PREMIUM_FEATURES = [
  { icon: Camera, label: 'Foto-stöd' },
  { icon: Linkedin, label: 'LinkedIn-integration' },
  { icon: Columns2, label: '2-kolumns layout' },
];

export default function CvSkapaOchMallarSection() {
  return (
    <section
      id="cv-skapa-mallar"
      className="relative py-16 sm:py-20 lg:py-28 scroll-mt-20 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <FilePlus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Skapa CV och välj mall
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
            Bygg ditt CV.{' '}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            >
              Välj en mall.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Sektion för sektion guidar vi dig genom hela CV:t. Sedan klickar du
            på den mall som passar din bransch och får ett ATS-säkert dokument.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Vänster: skapa-CV-wizard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-3xl border border-orange-100 p-6 sm:p-7"
            style={{
              boxShadow: '0 12px 32px -16px rgba(249, 115, 22, 0.18)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                }}
              >
                <FilePlus className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  Skapa nytt CV
                </p>
                <p className="text-[11px] text-slate-500">
                  Sektion 3 av 6
                </p>
              </div>
            </div>

            <ul className="space-y-1.5">
              {SECTIONS.map((section, i) => (
                <motion.li
                  key={section.label}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    section.active
                      ? 'bg-orange-50 border border-orange-200'
                      : section.done
                      ? 'bg-emerald-50/40 border border-emerald-100'
                      : 'bg-slate-50/60 border border-slate-100'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      section.done
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                        : section.active
                        ? 'bg-gradient-to-br from-orange-500 to-red-600'
                        : 'bg-slate-200'
                    }`}
                    style={
                      section.active
                        ? {
                            boxShadow:
                              '0 4px 10px -3px rgba(220, 38, 38, 0.4)',
                          }
                        : undefined
                    }
                  >
                    {section.done && (
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={3}
                      />
                    )}
                    {section.active && (
                      <span className="block w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  <span
                    className={`text-sm font-bold flex-1 ${
                      section.active
                        ? 'text-orange-900'
                        : section.done
                        ? 'text-emerald-800'
                        : 'text-slate-500'
                    }`}
                  >
                    {section.label}
                  </span>

                  {section.active && (
                    <ChevronRight
                      className="w-4 h-4 text-orange-600"
                      strokeWidth={2.5}
                    />
                  )}
                </motion.li>
              ))}
            </ul>

            {/* Aktiv sektion expanderar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-4 p-4 rounded-xl bg-gradient-to-br from-orange-50/60 to-rose-50/40 border border-orange-100"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
                Erfarenhet · Pågående
              </p>
              <div className="space-y-2">
                <div className="h-2 rounded bg-white border border-orange-100 w-3/4" />
                <div className="h-2 rounded bg-white border border-orange-100 w-full" />
                <div className="h-2 rounded bg-white border border-orange-100 w-5/6" />
              </div>
            </motion.div>
          </motion.div>

          {/* Höger: mall-stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-gradient-to-br from-orange-50/60 via-white to-rose-50/30 rounded-3xl border border-orange-100 p-6 sm:p-8 overflow-hidden"
            style={{
              boxShadow: '0 12px 32px -16px rgba(249, 115, 22, 0.18)',
            }}
          >
            <svg
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
              aria-hidden="true"
            >
              <pattern
                id="cv-mallar-dots"
                x="0"
                y="0"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="1.2"
                  fill="#FB923C"
                  opacity="0.35"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#cv-mallar-dots)" />
            </svg>

            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Välj din mall
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Åtta att välja på
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-orange-700 border border-orange-200">
                  6 Premium
                </span>
              </div>

              {/* Stack av tre mallar */}
              <div className="relative h-[280px] sm:h-[320px] mb-5">
                {PREVIEW_TEMPLATES.map((tmpl, i) => (
                  <motion.div
                    key={tmpl.slug}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: tmpl.rotate }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`absolute top-2 ${tmpl.offset} w-[55%] aspect-[3/4] rounded-xl overflow-hidden bg-white border border-orange-100 shadow-lg`}
                  >
                    {tmpl.premium && (
                      <div
                        className="absolute top-0 left-0 right-0 h-1 z-10"
                        style={{
                          background:
                            'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                        }}
                        aria-hidden="true"
                      />
                    )}
                    {tmpl.premium && (
                      <span
                        className="absolute top-2 right-2 z-10 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
                        style={{
                          background:
                            'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                        }}
                      >
                        Premium
                      </span>
                    )}
                    <Image
                      src={`/mallar/${tmpl.slug}.svg`}
                      alt={`${tmpl.label} CV-mall`}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Premium-features */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-100 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
                  Tillgängligt på Premium-mallar
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PREMIUM_FEATURES.map((feat) => (
                    <span
                      key={feat.label}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200"
                    >
                      <feat.icon
                        className="w-3 h-3"
                        strokeWidth={2.5}
                      />
                      {feat.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/dashboard/cv-mallar"
            className="inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-800 font-bold text-sm group"
          >
            Se alla CV-mallar
            <ArrowRight
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
