'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import {
  IconUpload,
  IconAnalyze,
  IconScore,
  IconSaveCV,
} from './illustrations/CVAnalysIcons'

const STEPS = [
  {
    num: 1,
    Icon: IconUpload,
    title: 'Ladda upp ditt CV',
    body:
      'Ladda upp ett befintligt CV som PDF eller välj ett du redan sparat hos oss. Vi accepterar både svenska och engelska CV.',
  },
  {
    num: 2,
    Icon: IconAnalyze,
    title: 'Vi analyserar i bakgrunden',
    body:
      'Det tar 30 till 60 sekunder. Vi läser igenom hela CV:t, kontrollerar struktur, språk, nyckelord och kvantifierade resultat.',
  },
  {
    num: 3,
    Icon: IconScore,
    title: 'Få ATS-poäng och förslag',
    body:
      'Du får en ATS-poäng från 0 till 100 plus en grade från A till F. För varje förbättring ser du nuvarande text, en föreslagen ny och hur många poäng den ger.',
  },
  {
    num: 4,
    Icon: IconSaveCV,
    title: 'Spara den nya versionen',
    body:
      'Välj vilka förslag du vill använda, granska before/after och spara CV:t. Du kan ladda ner det som PDF eller Word direkt.',
  },
]

export default function CVAnalysHurFunkar() {
  return (
    <section id="sa-funkar-det" className="relative py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Fyra steg från upplagt CV
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
              till starkare ansökan
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Hela analysen är gjord för att vara snabb, konkret och något du
            faktiskt kan agera på direkt.
          </p>
        </motion.div>

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
              <div className="absolute top-5 right-5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                0{num}
              </div>
              <div className="mb-5">
                <Icon className="w-14 h-14" />
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

        <div className="text-center mt-12 sm:mt-14">
          <Link
            href="/dashboard/cv-analys"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base min-h-[52px]"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.42)',
            }}
          >
            Analysera mitt CV nu
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
