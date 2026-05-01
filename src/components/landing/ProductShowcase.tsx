'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Mail, CheckCircle2 } from 'lucide-react';

export default function ProductShowcase() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            CV och personliga brev
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Två verktyg, en sammanhängande ansökan
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Bygg ditt CV i en ATS-säker mall och låt oss skriva det
            matchande brevet utifrån din egen erfarenhet. Allt på samma
            ställe.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Vänster: CV-mallar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50/80 via-white to-rose-50/40 border border-orange-100 p-6 sm:p-8 lg:p-10"
            style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
          >
            <svg
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
              aria-hidden="true"
            >
              <pattern
                id="showcase-cv-dots"
                x="0"
                y="0"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="16" cy="16" r="1.2" fill="#FB923C" opacity="0.35" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#showcase-cv-dots)" />
            </svg>

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4 shadow-sm">
                <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                Professionella CV-mallar
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight mb-3">
                ATS-säkra mallar för svenska rekryterare
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Åtta mallar granskade av rekryterare och byggda för att
                passera ATS-systemen. Välj en, fyll i, klar på minuter.
              </p>

              {/* Stack av CV-mallar */}
              <div className="relative h-[280px] sm:h-[340px] mb-6">
                <motion.div
                  className="absolute left-0 top-4 w-[55%] aspect-[3/4] rounded-xl overflow-hidden bg-white border border-orange-100 shadow-lg"
                  initial={{ rotate: -6, opacity: 0 }}
                  whileInView={{ rotate: -6, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  whileHover={{ rotate: -8, y: -4 }}
                >
                  <Image
                    src="/mallar/classic-professional.svg"
                    alt="Klassisk professionell CV-mall"
                    fill
                    className="object-cover"
                  />
                </motion.div>

                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 top-0 w-[58%] aspect-[3/4] rounded-xl overflow-hidden bg-white border border-orange-200 shadow-2xl z-10"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  whileHover={{ y: -6 }}
                >
                  <Image
                    src="/mallar/executive-premium.svg"
                    alt="Executive Premium CV-mall"
                    fill
                    className="object-cover"
                  />
                </motion.div>

                <motion.div
                  className="absolute right-0 top-4 w-[55%] aspect-[3/4] rounded-xl overflow-hidden bg-white border border-orange-100 shadow-lg"
                  initial={{ rotate: 6, opacity: 0 }}
                  whileInView={{ rotate: 6, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  whileHover={{ rotate: 8, y: -4 }}
                >
                  <Image
                    src="/mallar/nordic-professional.svg"
                    alt="Nordic Professional CV-mall"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>

              <Link
                href="/cv-exempel"
                className="inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-800 font-bold text-sm group"
              >
                Bläddra 75+ CV-exempel
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
            </div>
          </motion.div>

          {/* Höger: Brev-mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/40 via-white to-orange-50/80 border border-orange-100 p-6 sm:p-8 lg:p-10"
            style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
          >
            <svg
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
              aria-hidden="true"
            >
              <pattern
                id="showcase-letter-dots"
                x="0"
                y="0"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="16" cy="16" r="1.2" fill="#FB923C" opacity="0.35" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#showcase-letter-dots)" />
            </svg>

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4 shadow-sm">
                <Mail className="w-3.5 h-3.5" strokeWidth={2.5} />
                Personligt brev från ditt CV
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight mb-3">
                Skräddarsytt för varje jobbannons
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Klistra in jobbannonsen. Vi läser ditt CV, identifierar
                tjänstens krav och bygger brevet med din egen erfarenhet
                som bevisar matchningen, på under en minut.
              </p>

              {/* Brev-mockup */}
              <div className="relative bg-white rounded-2xl border border-orange-100 p-5 sm:p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Personligt brev
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-200" />
                    <div className="w-2 h-2 rounded-full bg-orange-300" />
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  <div className="h-2 bg-slate-100 rounded w-full" />
                  <div className="h-2 bg-slate-100 rounded w-[92%]" />
                  <div className="h-2 rounded w-[85%]" style={{ background: 'linear-gradient(90deg, #FED7AA 0%, #FECACA 100%)' }} />
                  <div className="h-2 bg-slate-100 rounded w-full" />
                  <div className="h-2 rounded w-[78%]" style={{ background: 'linear-gradient(90deg, #FED7AA 0%, #FBCFE8 100%)' }} />
                  <div className="h-2 bg-slate-100 rounded w-[88%]" />
                  <div className="h-2 bg-slate-100 rounded w-[70%]" />
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                  <span className="text-slate-600 font-medium">
                    8 av 8 nyckelord matchade
                  </span>
                </div>
              </div>

              <Link
                href="/personligt-brev-exempel"
                className="inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-800 font-bold text-sm group"
              >
                Bläddra 77+ brev-exempel
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
