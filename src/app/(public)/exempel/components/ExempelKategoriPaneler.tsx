'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Mail } from 'lucide-react'
import { TOTAL_CV_YRKEN, TOTAL_BREV_YRKEN } from './exempel-data'

export default function ExempelKategoriPaneler() {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Två exempel-bibliotek.{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ett exempel för varje yrke.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-3">
            Välj om du behöver ett CV-exempel eller ett exempel på personligt brev.
            Alla är ATS-säkra och anpassade för svenska arbetsgivare.
          </p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Letar du efter en{' '}
            <Link href="/cv-mallar" className="text-orange-700 font-bold underline underline-offset-2 hover:text-orange-800">
              CV-mall
            </Link>
            {' '}istället? Vi har 25+ designer att välja mellan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {/* CV-panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href="/cv-exempel"
              className="group block relative overflow-hidden rounded-3xl bg-white border border-orange-100 p-7 sm:p-9 h-full hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
              }}
            >
              {/* Decorative top stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              />

              <div className="flex items-start justify-between mb-6 pt-2">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
                  }}
                >
                  <FileText className="w-8 h-8" strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                  {TOTAL_CV_YRKEN} yrken
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
                CV-exempel
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
                Se färdiga CV-exempel för just ditt yrke. Rätt struktur,
                rätt nyckelord, rätt kvantifierade resultat. Allt för att
                passera ATS och fånga rekryterarens öga.
              </p>

              <span className="inline-flex items-center gap-1.5 text-orange-700 font-bold text-base group-hover:gap-2.5 transition-all">
                Se alla CV-exempel
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </Link>
          </motion.div>

          {/* Brev-panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href="/personligt-brev-exempel"
              className="group block relative overflow-hidden rounded-3xl p-7 sm:p-9 h-full text-white"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 24px 60px -20px rgba(220, 38, 38, 0.55)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none"
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
                    <Mail className="w-8 h-8 text-white" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] bg-white text-orange-700 px-2.5 py-1 rounded-full shadow-md">
                    {TOTAL_BREV_YRKEN} yrken
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black mb-2 leading-tight tracking-tight">
                  Mallar för personligt brev
                </h3>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-5">
                  Brev-mallar som faktiskt får svar. Vi visar tonalitet,
                  struktur och hur du knyter ihop ditt CV med jobbannonsens
                  krav. Olika mallar för olika branscher och erfarenhetsnivåer.
                </p>

                <span className="inline-flex items-center gap-1.5 font-bold text-base group-hover:gap-2.5 transition-all">
                  Se alla brev-mallar
                  <ArrowRight className="w-4 h-4" strokeWidth={2.8} />
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
