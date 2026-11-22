'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Mail } from 'lucide-react'
import { ExempelHeroIcon } from './illustrations/ExempelIcons'
import { FREE_TEMPLATE_COUNT, talSomOrd } from '@/lib/cv/template-antal'

/** Antalet gratismallar ur katalogen, som ord med versal. */
const GRATIS_MALLAR = talSomOrd(FREE_TEMPLATE_COUNT).replace(/^./, (c) => c.toUpperCase())

export default function ExempelCTABand() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 lg:p-16 text-white"
          style={{
            background:
              'var(--vagg)',
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-4">
                Klar för att skriva
                <br className="hidden sm:block" />{' '}
                ditt eget?
              </h2>
              <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Använd exemplen som inspiration och bygg ditt eget med våra
                verktyg. {GRATIS_MALLAR} CV-mallar, CV-analysens läsbarhetspoäng och ett
                personligt brev var sjunde dag, utan att betala.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start lg:justify-start justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[var(--koppar)] font-black text-base sm:text-lg w-full sm:w-auto min-h-[56px] hover:bg-[var(--koppar-topp)] active:scale-[0.98] transition-all"
                  style={{
                    color: 'var(--koppar-text)',
                    boxShadow: '0 4px 0 var(--koppar-klack)',
                  }}
                >
                  <FileText className="w-5 h-5" strokeWidth={2.8} />
                  Skapa CV gratis
                  <ArrowRight
                    className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.8}
                  />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border-2 border-white/40 text-white font-bold text-base sm:text-lg w-full sm:w-auto min-h-[56px] hover:border-white/70 transition-colors"
                >
                  <Mail className="w-5 h-5" strokeWidth={2.5} />
                  Skapa personligt brev gratis
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-sm text-white/85">
                <span>Ingen kortuppgift.</span>
                <span>Ingen bindningstid.</span>
                <span>Lagring i EU.</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 border border-white/25">
                <ExempelHeroIcon className="w-44 h-44" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
