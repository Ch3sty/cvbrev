'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Search, Send, Unlock } from 'lucide-react'

/**
 * Tre steg: sök i poolen → visa intresse → kandidaten svarar och profilen
 * låses upp. Samma stegkortsstil som verktygssidornas "Så funkar det".
 */
const STEPS = [
  {
    num: 1,
    Icon: Search,
    title: 'Sök i kandidatpoolen',
    body: 'Filtrera på roll, region, villkor och percentilgolv. Träffkorten visar verifierade testresultat, styrkor och kompetenser, men aldrig identiteten.',
  },
  {
    num: 2,
    Icon: Send,
    title: 'Visa intresse',
    body: 'Hittar du en match skickar du en intresseförfrågan direkt från kortet. Kandidaten får en notis om att ett företag vill komma i kontakt.',
  },
  {
    num: 3,
    Icon: Unlock,
    title: 'Kandidaten svarar, profilen låses upp',
    body: 'Tackar kandidaten ja ser ni varandras namn och kontaktväg och tar dialogen direkt. Tackar hen nej förblir profilen anonym.',
  },
]

export default function RekryterareSaFunkar() {
  return (
    <section id="sa-funkar-det" className="relative py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sektion-header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Så funkar det
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Tre steg från sökning
            <br className="hidden sm:block" />
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              till dialog
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Inga mellanhänder och inga köpta kontaktlistor. Kandidaten
            bestämmer, du får svar som betyder något.
          </p>
        </motion.div>

        {/* Steg-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {STEPS.map(({ num, Icon, title, body }, idx) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative bg-white rounded-3xl border border-orange-100 p-6 sm:p-7 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
              }}
            >
              {/* Stegnummer */}
              <div className="absolute top-5 right-5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                0{num}
              </div>

              {/* Ikon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  boxShadow: '0 8px 18px -6px rgba(220, 38, 38, 0.35)',
                }}
              >
                <Icon className="w-6 h-6" strokeWidth={2.2} />
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                {body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA-rad */}
        <div className="text-center mt-12 sm:mt-14">
          <Link
            href="/rekryterare/registrera"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base min-h-[52px]"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.42)',
            }}
          >
            Ansök om tidig åtkomst
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
