'use client'

import { motion } from 'framer-motion'
import {
  IconStart,
  IconInsikt,
  IconNamnbyte,
  IconLansering,
} from './illustrations/OmOssIcons'

const MILSTOLPAR = [
  {
    Icon: IconStart,
    period: '2023',
    title: 'Det började som cvbrev.se',
    body:
      'Vi startade med en enkel idé: göra det lättare att skriva personliga brev som faktiskt funkar för svenska arbetsgivare. Tusentals användare hittade snabbare till sin första utkast.',
  },
  {
    Icon: IconInsikt,
    period: 'Hösten 2024',
    title: 'Användarna ville ha mer',
    body:
      'Personligt brev var bara ena halvan. Användarna efterfrågade hjälp med CV, jobbsökning, intervjuförberedelse och lönesnack. Problemet var större än vi först trott.',
  },
  {
    Icon: IconNamnbyte,
    period: 'Vintern 2024',
    title: 'cvbrev.se blev Jobbcoach.ai',
    body:
      'Det nya namnet speglar det större uppdraget. Vi är inte bara en brev-tjänst längre, vi är en partner genom hela jobbsökningen från första utkast till första anställningsdagen.',
  },
  {
    Icon: IconLansering,
    period: '2025 och framåt',
    title: 'Plattform med fler verktyg',
    body:
      'Vi lanserar fler verktyg löpande, alla med svenska källor och svensk arbetsmarknadston. Karriärguide, jobbmatchning, rekryteringstester, LinkedIn-optimering och mer på väg.',
  },
]

export default function OmOssBerattelse() {
  return (
    <section className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Vår berättelse
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Från cvbrev.se{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              till Jobbcoach.ai
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Det vi byggde på vägen, varför vi byggde det och vart vi är på
            väg.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertikal linje pa desktop */}
          <div
            aria-hidden="true"
            className="hidden sm:block absolute left-[31px] top-2 bottom-2 w-px"
            style={{
              background:
                'linear-gradient(to bottom, #FED7AA 0%, #DC2626 50%, #BE185D 100%)',
            }}
          />

          <div className="space-y-6 sm:space-y-8">
            {MILSTOLPAR.map(({ Icon, period, title, body }, idx) => (
              <motion.div
                key={period}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="relative flex gap-4 sm:gap-6"
              >
                <div className="flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white border border-orange-100"
                    style={{
                      boxShadow: '0 6px 20px -10px rgba(249, 115, 22, 0.25)',
                    }}
                  >
                    <Icon className="w-12 h-12" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-1 sm:pt-2">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 mb-1.5">
                    {period}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mb-2">
                    {title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-2xl">
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
