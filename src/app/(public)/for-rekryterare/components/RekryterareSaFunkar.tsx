'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Search, FolderKanban, Send, Share2 } from 'lucide-react'

/**
 * Fyra steg = arbetsflödet, inte en engångssökning: sök → projekt/jämför →
 * intresse → dela med hiring manager. Samma stegkortsstil som verktygssidorna.
 */
const STEPS = [
  {
    num: 1,
    Icon: Search,
    title: 'Sök på kravprofilen',
    body: 'Skriv roll och nyckelkompetens, så rankar vi poolen efter relevans och visar varför varje kandidat matchar. Filtrera på senioritet, testresultat, budget och villkor.',
  },
  {
    num: 2,
    Icon: FolderKanban,
    title: 'Samla i projekt och jämför',
    body: 'Spara de intressanta till ett projekt, sätt status och lägg egna anteckningar. Ställ två till fyra kandidater sida vid sida när du ska välja vilka du kontaktar först.',
  },
  {
    num: 3,
    Icon: Send,
    title: 'Visa intresse, kandidaten svarar',
    body: 'Skicka en intresseförfrågan direkt från kortet. Tackar kandidaten ja låses namn, kontaktväg, onboardingtips och en skräddarsydd intervjuguide upp. Tackar hen nej förblir profilen anonym.',
  },
  {
    num: 4,
    Icon: Share2,
    title: 'Dela med din hiring manager',
    body: 'Skicka en maskerad, läsbar profil via en länk som håller i fjorton dagar. Din chef ser samma underlag som du, utan skärmdumpar i en Slack-tråd.',
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
            Från sökning
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
              till anställning
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Inga mellanhänder och inga köpta kontaktlistor. Kandidaten
            bestämmer, du får svar som betyder något.
          </p>
        </motion.div>

        {/* Steg-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
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
