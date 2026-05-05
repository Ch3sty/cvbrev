'use client'

import { motion } from 'framer-motion'
import {
  IconNyckelord,
  IconSiffra,
  IconLangd,
  IconTon,
  IconStruktur,
} from './illustrations/BrevIcons'

const TIPS = [
  {
    Icon: IconNyckelord,
    title: 'Använd annonsens egna ord',
    body:
      'Om annonsen säger "stakeholder management" — använd den frasen, inte din egen variant. Rekryterare letar efter exakta termer när de skummar.',
  },
  {
    Icon: IconSiffra,
    title: 'Visa siffror, inte adjektiv',
    body:
      '"Drev försäljningen från 2 till 12 mkr på två år" säger mer än "duktig på försäljning". Konkreta resultat fastnar.',
  },
  {
    Icon: IconLangd,
    title: 'Håll det under en sida',
    body:
      '250–350 ord räcker. Rekryteraren lägger 30 sekunder per ansökan. Långa brev får alltid sämre läsutfall än korta.',
  },
  {
    Icon: IconTon,
    title: 'Matcha företagets ton',
    body:
      'Konsultbyrå behöver en annan ton än startup. Läs deras hemsida — speglar de formell engelska? Slang? Lägg dig nära det.',
  },
  {
    Icon: IconStruktur,
    title: 'Tre stycken räcker',
    body:
      'Öppning som visar att du läst annonsen. Mittparti om varför just du. Avslut med tydlig nästa steg. Fler stycken förvirrar.',
  },
]

export default function BrevSkrivtips() {
  return (
    <section className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
              höjer svarsfrekvensen
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Vår tjänst följer dem automatiskt. Om du skriver själv — nu vet du
            också vad rekryterare faktiskt reagerar på.
          </p>
        </motion.div>

        {/* Tips-grid */}
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
