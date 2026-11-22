'use client'

import { motion } from 'framer-motion'
import { IconHitta, IconLas, IconSkapa } from './illustrations/ExempelIcons'

const STEPS = [
  {
    num: 1,
    Icon: IconHitta,
    title: 'Hitta ditt yrke',
    body:
      'Sök eller bläddra efter bransch. Hittar du inte din exakta titel, välj ett närliggande yrke i samma område. Strukturen och språket är ofta överförbart.',
  },
  {
    num: 2,
    Icon: IconLas,
    title: 'Lär av strukturen',
    body:
      'Varje exempel visar rätt rubriker, rätt nyckelord och hur du kvantifierar dina resultat. Läs också "Varför detta fungerar" för att förstå rekryterarens perspektiv.',
  },
  {
    num: 3,
    Icon: IconSkapa,
    title: 'Skapa ditt eget',
    body:
      'Använd exemplet som inspiration, inte mall. Bygg ditt eget innehåll med våra verktyg. Första brevet är gratis, sedan ett var sjunde dag, och en CV-analys ingår per konto.',
  },
]

export default function ExempelHurAnvanda() {
  return (
    <section className="relative py-16 sm:py-20 bg-[var(--ton)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-[var(--papper)] text-[var(--koppar-ink)] border border-[var(--kant)] mb-4">
            Så använder du exemplen
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--ink-1)] leading-[1.05] tracking-tight mb-3">
            Tre steg från{' '}
            <span
              style={{
                background:
                  'var(--vagg)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              inspiration till intervju
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--ink-2)] max-w-2xl mx-auto">
            Exempel hjälper dig snabbare än ChatGPT-prompts. Du ser direkt vad
            som faktiskt fungerar för svenska rekryterare.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {STEPS.map(({ num, Icon, title, body }, idx) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative bg-[var(--papper)] rounded-3xl border border-[var(--kant)] p-6 sm:p-7"
              style={{
                boxShadow: '0 4px 0 var(--kant)',
              }}
            >
              <div className="absolute top-5 right-5 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--koppar-ljus)]">
                0{num}
              </div>
              <div className="mb-4">
                <Icon className="w-14 h-14" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[var(--ink-1)] mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm sm:text-[15px] text-[var(--ink-2)] leading-relaxed">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
