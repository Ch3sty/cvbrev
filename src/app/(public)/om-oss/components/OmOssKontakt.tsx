'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Clock } from 'lucide-react'

export default function OmOssKontakt() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 lg:p-14 text-white"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
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

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-4">
                Redo att börja{' '}
                <span className="text-white/90">eller har en fråga?</span>
              </h2>
              <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-7 max-w-xl mx-auto lg:mx-0">
                Skapa konto och börja gratis, eller kontakta oss direkt om
                du undrar något. Vi svarar samma dag på vardagar.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start lg:justify-start justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white font-black text-base sm:text-lg w-full sm:w-auto min-h-[56px] hover:bg-orange-50 active:scale-[0.98] transition-all"
                  style={{
                    color: '#DC2626',
                    boxShadow: '0 12px 32px -10px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  Kom igång gratis
                  <ArrowRight
                    className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.8}
                  />
                </Link>
                <Link
                  href="/funktioner"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border-2 border-white/40 text-white font-bold text-base sm:text-lg w-full sm:w-auto min-h-[56px] hover:border-white/70 transition-colors"
                >
                  Se alla funktioner
                </Link>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-white/25 space-y-5">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/85">
                Kontakt
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-white/70 mb-0.5">E-post</div>
                  <a
                    href="mailto:hej@jobbcoach.ai"
                    className="text-base sm:text-lg font-black text-white hover:underline break-all"
                  >
                    hej@jobbcoach.ai
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-white/70 mb-0.5">Svarstid</div>
                  <div className="text-sm font-bold text-white">
                    Inom 24 timmar på vardagar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
