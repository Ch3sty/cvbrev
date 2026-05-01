'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, ShieldCheck } from 'lucide-react';

const PROPS = [
  {
    icon: TrendingUp,
    statValue: '3x',
    statLabel: 'högre svarsfrekvens',
    title: 'Bevisade resultat',
    description:
      'Användare som låter AI:n optimera sina ansökningar får i snitt tre gånger fler intervjuer.',
  },
  {
    icon: Clock,
    statValue: '60s',
    statLabel: 'per ansökan',
    title: 'Spara timmar varje vecka',
    description:
      'Det som tog en hel kväll tidigare gör du nu på en kafferast. Inget repetitivt skrivande.',
  },
  {
    icon: ShieldCheck,
    statValue: '100%',
    statLabel: 'ATS-säker',
    title: 'Förbi rekryterar-filtren',
    description:
      'Vi vet exakt hur de svenska rekryteringssystemen läser ditt CV. Du kommer förbi första gallringen.',
  },
];

export default function ValuePropsGrid() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white to-orange-50/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Varför Jobbcoach.ai
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Tre saker som gör skillnad i din nästa jobbsökning
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Vi har byggt det vi själva saknat. Inga mallar. Ingen text som
            låter som en robot. Bara verktyg som gör att du slipper det
            tunga skrivandet.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {PROPS.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl bg-white border border-orange-100 p-6 sm:p-8 hover:border-orange-300 transition-all duration-300"
              style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                  }}
                >
                  <prop.icon
                    className="w-6 h-6 text-orange-600"
                    strokeWidth={2.2}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div
                  className="text-5xl sm:text-6xl font-black tabular-nums leading-none mb-1"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {prop.statValue}
                </div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-orange-700">
                  {prop.statLabel}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                {prop.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
