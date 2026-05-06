'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import {
  IconHamta,
  IconKlistraIn,
  IconOptimera,
  IconJamfor,
  IconKlistraTillbaka,
} from './illustrations/LinkedinOptimeringIcons'

const STEPS = [
  {
    num: 1,
    Icon: IconHamta,
    title: 'Hämta din profiltext',
    body:
      'Gå till LinkedIn, kopiera din nuvarande rubrik, om-mig-text och erfarenhet. Vi visar exakt hur, men det går snabbare om du har sparat ett CV hos oss då fyller vi i fälten åt dig.',
  },
  {
    num: 2,
    Icon: IconKlistraIn,
    title: 'Klistra in eller välj sparat CV',
    body:
      'Klistra in texten i fem fält (Rubrik, Om mig, Erfarenhet, Utbildning, Kompetenser) eller välj ditt sparade CV som källa. Inga obligatoriska fält som tvingar dig att börja om.',
  },
  {
    num: 3,
    Icon: IconOptimera,
    title: 'Vi optimerar fem sektioner samtidigt',
    body:
      'Karriärguidens AI bearbetar alla fem sektioner parallellt med svensk arbetsmarknadskontext, branschkeywords och ATS-anpassning. Tar 30 till 60 sekunder.',
  },
  {
    num: 4,
    Icon: IconJamfor,
    title: 'Du jämför före och efter',
    body:
      'Split-view visar din nuvarande text bredvid den optimerade. Per sektion ser du score-deltan och exakt vad som ändrats. Inget händer som du inte godkänt.',
  },
  {
    num: 5,
    Icon: IconKlistraTillbaka,
    title: 'Du kopierar tillbaka till LinkedIn',
    body:
      'En knapp kopierar hela paketet eller en sektion åt gången. Du klistrar in på LinkedIn manuellt och sparar. Vi rör aldrig din profil, du behåller full kontroll.',
  },
]

export default function LinkedinOptimeringHurFunkar() {
  return (
    <section id="sa-funkar-det" className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Så funkar det
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Fem steg från{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              copy till copy
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Inga LinkedIn-inloggningar, ingen automatisk publicering. Du
            kopierar in, vi optimerar, du kopierar tillbaka. Klart på fem
            minuter.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {STEPS.map(({ num, Icon, title, body }, idx) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="relative bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
              }}
            >
              <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                0{num}
              </div>
              <div className="mb-4">
                <Icon className="w-12 h-12" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed">
                {body}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-14">
          <Link
            href="/dashboard/linkedin-optimizer"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base min-h-[52px]"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.42)',
            }}
          >
            Optimera din LinkedIn gratis
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
