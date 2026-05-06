'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import {
  IconValjMall,
  IconFyllI,
  IconViFlyttar,
  IconLaddaNer,
} from './illustrations/CVMallarIcons'

const STEPS = [
  {
    num: 1,
    Icon: IconValjMall,
    title: 'Välj en mall',
    body:
      'Bläddra bland modern, traditionell och kreativ stil. Klicka på den som passar din bransch och stil bäst.',
  },
  {
    num: 2,
    Icon: IconFyllI,
    title: 'Fyll i dina uppgifter',
    body:
      'Vårt formulär guidar dig genom varje sektion. Du kan importera från LinkedIn eller börja från ett befintligt CV.',
  },
  {
    num: 3,
    Icon: IconViFlyttar,
    title: 'Vi flyttar in datan',
    body:
      'Allt du fyller i landar automatiskt på rätt plats i mallen. Byter du mall efteråt följer din data med, utan att du behöver fylla i på nytt.',
  },
  {
    num: 4,
    Icon: IconLaddaNer,
    title: 'Ladda ner som PDF eller Word',
    body:
      'När du är nöjd exporterar du ditt CV. Sparas i ditt konto så du kan komma tillbaka och redigera när som helst.',
  },
]

export default function CVMallarHurFunkar() {
  return (
    <section className="relative py-16 sm:py-24 bg-white">
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
            Fyra steg från val
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
              till färdig PDF
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Hela processen är gjord för att vara enkel. Du fyller i dina
            uppgifter en gång och kan sedan byta mall när du vill.
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
            href="/dashboard/skapa-cv"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base min-h-[52px]"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.42)',
            }}
          >
            Bygg ditt CV nu
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
