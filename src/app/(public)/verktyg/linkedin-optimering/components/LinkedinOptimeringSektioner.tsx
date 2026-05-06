'use client'

import { motion } from 'framer-motion'
import {
  IconRubrik,
  IconOmMig,
  IconErfarenhet,
  IconUtbildning,
  IconKompetenser,
} from './illustrations/LinkedinOptimeringIcons'

const SEKTIONER = [
  {
    Icon: IconRubrik,
    title: 'Rubrik',
    limit: 'Max 220 tecken',
    body:
      'Vi bygger en rubrik med yrkesroll, specialområden och målgrupp. Är fältet tomt skapar vi en från scratch baserat på din erfarenhet.',
  },
  {
    Icon: IconOmMig,
    title: 'Om mig',
    limit: '250 till 350 ord',
    body:
      'Röd tråd genom din karriär: varifrån du kommer, vad du gör nu, vart du är på väg. Anpassad ton beroende på om du är junior, mid eller senior.',
  },
  {
    Icon: IconErfarenhet,
    title: 'Erfarenhet',
    limit: 'STAR-format',
    body:
      'Varje roll skrivs om i Situation, Task, Action, Result. Vi lägger till action verbs och kvantifierar där det är möjligt. Ingenting hittas på.',
  },
  {
    Icon: IconUtbildning,
    title: 'Utbildning',
    limit: 'Valfritt',
    body:
      'Junior får utbyggd version med exjobb och relevanta kurser. Senior får koncis lista där vi inte tar uppmärksamhet från den professionella erfarenheten.',
  },
  {
    Icon: IconKompetenser,
    title: 'Kompetenser',
    limit: '3 till 4 kategorier',
    body:
      'Vi organiserar dina kompetenser i tematiska kluster och prioriterar de som matchar målrollen. Generiska buzzwords som "team player" rensas bort.',
  },
]

export default function LinkedinOptimeringSektioner() {
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
            Vad vi optimerar
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Fem sektioner,{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ett pass
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Vi optimerar alla fem sektioner samtidigt, med samma röda tråd
            tvärs igenom. Det är så rekryteraren ska uppfatta dig.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SEKTIONER.map(({ Icon, title, limit, body }, idx) => (
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
              <div className="flex items-start justify-between gap-3 mb-4">
                <Icon className="w-14 h-14" />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-700 whitespace-nowrap">
                  {limit}
                </span>
              </div>
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
