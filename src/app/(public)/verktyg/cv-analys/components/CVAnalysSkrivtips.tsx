'use client'

import { motion } from 'framer-motion'
import {
  IconKvantifiera,
  IconVerb,
  IconKeywords,
  IconLength,
  IconNoBild,
} from './illustrations/CVAnalysIcons'

const TIPS = [
  {
    Icon: IconKvantifiera,
    title: 'Kvantifiera dina resultat',
    body:
      'Siffror gör dig 3 gånger mer övertygande än adjektiv. "Ökade omsättningen 40 procent på 8 månader" säger mer än "duktig på försäljning".',
  },
  {
    Icon: IconVerb,
    title: 'Börja varje punkt med ett verb',
    body:
      '"Drev", "Byggde", "Ledde", "Implementerade". Aktiva verb visar handlingskraft. Passiva formuleringar gör att du försvinner i mängden.',
  },
  {
    Icon: IconKeywords,
    title: 'Använd annonsens egna ord',
    body:
      'Står det "stakeholder management" i annonsen, skriv det exakt så i CV:t. ATS-systemen letar efter exakta termer, inte synonymer.',
  },
  {
    Icon: IconLength,
    title: 'En sida räcker ofta',
    body:
      'Under fem års erfarenhet: en A4. Mer erfarenhet: max två. Akademiska CV med publikationer kan vara längre, men det ska finnas en anledning.',
  },
  {
    Icon: IconNoBild,
    title: 'Hoppa över bilden',
    body:
      'Bilder kan trigga ATS-system att kasta CV:t. Och i Sverige värderas innehållet mer än utseendet. Spara plats för det som faktiskt säljer dig.',
  },
]

export default function CVAnalysSkrivtips() {
  return (
    <section className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Skrivtips
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Fem regler som
            <br className="hidden sm:block" />{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              höjer din ATS-poäng
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Vår analys flaggar dem automatiskt. Men det är värdefullt att förstå
            varför rekryterare faktiskt reagerar på dem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TIPS.map(({ Icon, title, body }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className={`bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 ${
                idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
              style={{
                boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon className="w-10 h-10 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight pt-1">
                  {title}
                </h3>
              </div>
              <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
