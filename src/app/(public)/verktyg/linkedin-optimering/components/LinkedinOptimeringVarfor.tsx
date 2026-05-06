'use client'

import { motion } from 'framer-motion'
import {
  IconKeywords,
  IconHeadline,
  IconFullstandighet,
} from './illustrations/LinkedinOptimeringIcons'

const ANLEDNINGAR = [
  {
    Icon: IconKeywords,
    title: 'Rekryterare söker på keywords',
    body:
      'Rekryterare hittar inte kandidater genom att scrolla igenom miljontals profiler. De söker. När din profil saknar de branschord rekryteraren skriver in i sökrutan dyker du helt enkelt aldrig upp i resultatet.',
  },
  {
    Icon: IconHeadline,
    title: 'Rubriken avgör om du visas',
    body:
      'Du har 220 tecken till din rubrik på LinkedIn. De flesta använder mindre än 30. En rubrik som bara säger "Marknadsförare" rankar lågt mot mer specifika sökningar som "B2B-marknadsförare SaaS Stockholm".',
  },
  {
    Icon: IconFullstandighet,
    title: 'Algoritmen belönar fullständighet',
    body:
      'LinkedIns algoritm prioriterar profiler som är fullständiga: rubrik, om-mig, erfarenhet, utbildning och kompetenser. En halvfärdig profil hamnar längre ner i sökresultatet, oavsett hur duktig du faktiskt är.',
  },
]

export default function LinkedinOptimeringVarfor() {
  return (
    <section className="relative py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Bakgrunden
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Varför syns du inte{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              idag
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Det handlar inte om att du är osynlig. Det handlar om att din
            profil inte talar samma språk som rekryterarens sökruta.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ANLEDNINGAR.map(({ Icon, title, body }, idx) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
              }}
            >
              <Icon className="w-14 h-14 mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
