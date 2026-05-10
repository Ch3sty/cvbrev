'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Mail, LayoutGrid } from 'lucide-react'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import { TOTAL_CV_YRKEN, TOTAL_BREV_YRKEN } from './exempel-data'

const TOTAL_MALLAR = SIMPLE_TEMPLATES.length

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
            Tre vägar till en{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              starkare ansökan.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Behöver du inspiration från ett färdigt CV? Vill du börja med en
            mall-design? Ska personligt brev skickas med? Vi har en sida för
            varje fråga.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* CV-exempel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href="/cv-exempel"
              className="group block relative overflow-hidden rounded-3xl bg-white border border-orange-100 p-6 sm:p-7 h-full hover:border-orange-300 transition-colors"
              style={{
                boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              />

              <div className="flex items-start justify-between mb-5 pt-2">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
                  }}
                >
                  <FileText className="w-7 h-7" strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                  {TOTAL_CV_YRKEN} yrken
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
                CV-exempel
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Se hur ett färdigt CV ser ut för ditt yrke. Konkret innehåll,
                rätt nyckelord och kvantifierade resultat. Bra utgångspunkt
                när du vet vad du ska skriva men behöver inspiration på hur.
              </p>

              <span className="inline-flex items-center gap-1.5 text-orange-700 font-bold text-sm group-hover:gap-2.5 transition-all">
                Se alla CV-exempel
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </Link>
          </motion.div>

          {/* CV-mallar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: 0.08 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href="/cv-mallar"
              className="group block relative overflow-hidden rounded-3xl bg-white border-2 border-orange-200 p-6 sm:p-7 h-full hover:border-orange-400 transition-colors"
              style={{
                boxShadow: '0 16px 48px -16px rgba(249, 115, 22, 0.32)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              />

              <div className="flex items-start justify-between mb-5 pt-2">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #BE185D)',
                    boxShadow: '0 12px 32px -10px rgba(190, 24, 93, 0.5)',
                  }}
                >
                  <LayoutGrid className="w-7 h-7" strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-full">
                  {TOTAL_MALLAR} designer
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
                CV-mallar
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Färdiga design-mallar att fylla med ditt eget innehåll.
                Modern, traditionell, kreativ. Yrkesspecifika varianter för
                vård, lärare, säljare och fler. Alla ATS-säkra och gratis.
              </p>

              <span className="inline-flex items-center gap-1.5 text-pink-700 font-bold text-sm group-hover:gap-2.5 transition-all">
                Bläddra alla mallar
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </Link>
          </motion.div>

          {/* Brev-exempel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: 0.16 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href="/personligt-brev-exempel"
              className="group block relative overflow-hidden rounded-3xl p-6 sm:p-7 h-full text-white"
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
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
                    <Mail className="w-7 h-7 text-white" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] bg-white text-orange-700 px-2.5 py-1 rounded-full shadow-md">
                    {TOTAL_BREV_YRKEN} yrken
                  </span>
                </div>

                <h3 className="text-2xl font-black mb-2 leading-tight tracking-tight">
                  Personligt brev
                </h3>
                <p className="text-sm text-white/90 leading-relaxed mb-5">
                  Exempel på personligt brev som faktiskt får svar. Tonalitet,
                  struktur och hur du knyter ihop CV:t med jobbannonsens krav.
                  Olika exempel för olika branscher och erfarenhetsnivåer.
                </p>

                <span className="inline-flex items-center gap-1.5 font-bold text-sm group-hover:gap-2.5 transition-all">
                  Se brev-exempel
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
