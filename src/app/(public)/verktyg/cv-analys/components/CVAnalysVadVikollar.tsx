'use client'

import { motion } from 'framer-motion'
import {
  IconATS,
  IconStruktur,
  IconSprak,
  IconNyckelord,
  IconKvantifiering,
  IconProfil,
} from './illustrations/CVAnalysIcons'

const KATEGORIER = [
  {
    Icon: IconATS,
    title: 'ATS-kompatibilitet',
    body:
      'Vi kontrollerar att rubriker, formatering och filstruktur fungerar med svenska arbetsgivares filter-system. Inga konstiga kolumner som förvirrar maskinen.',
    exempel: 'Kollar att rubriker som Erfarenhet, Utbildning, Kompetenser finns och syns rätt.',
  },
  {
    Icon: IconStruktur,
    title: 'Struktur',
    body:
      'Vi mäter avsnittslängd, ordningsföljd, datumformat och om viktiga rubriker finns på rätt plats.',
    exempel: 'Flagger för långa stycken över fyra rader och inkonsekventa datum.',
  },
  {
    Icon: IconSprak,
    title: 'Språk och grammatik',
    body:
      'Vi kontrollerar om du använder aktiva verb, undviker svammelord och håller en konsekvent ton genom hela CV:t.',
    exempel: '"Ansvarig för" byts mot "Ledde", "Jobbade med" mot "Drev" eller "Genomförde".',
  },
  {
    Icon: IconNyckelord,
    title: 'Nyckelord',
    body:
      'Vi jämför ditt CV mot vanliga söktermer i din bransch och flaggar de viktigaste som saknas eller är underrepresenterade.',
    exempel: 'För en projektledare: "Scrum", "stakeholder management", "budget".',
  },
  {
    Icon: IconKvantifiering,
    title: 'Kvantifiering',
    body:
      'Vi räknar hur många mätbara resultat du visar och pekar ut platser där siffror skulle göra dig 3 gånger mer övertygande.',
    exempel: '"Ökade försäljningen" blir "Ökade försäljningen 40 procent på 8 månader".',
  },
  {
    Icon: IconProfil,
    title: 'Profil och styrkor',
    body:
      'Vi analyserar din öppningsbeskrivning och föreslår en starkare formulering som lyfter dina specifika styrkor.',
    exempel: 'Generisk profil omformuleras till en distinkt 3-radig pitch som rekryterare minns.',
  },
]

export default function CVAnalysVadVikollar() {
  return (
    <section className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Vad vi kontrollerar
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Sex kategorier.{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Inget undgår oss.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Varje analys täcker hela CV:t. Du får poäng per kategori och
            konkreta förslag du kan klicka dig igenom.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {KATEGORIER.map(({ Icon, title, body, exempel }, idx) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
              }}
            >
              <Icon className="w-14 h-14 mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {body}
              </p>
              <div className="text-xs text-slate-500 leading-relaxed border-t border-orange-50 pt-3 italic">
                {exempel}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
