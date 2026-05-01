'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Type, Calculator, Trophy } from 'lucide-react';

const TEST_CATEGORIES = [
  {
    icon: Brain,
    title: 'Matrislogik',
    description:
      'Mönsterigenkänning och logiskt tänkande. Testet de flesta större bolag använder vid första gallringen.',
    levels: ['Grund · Gratis', 'Avancerad · Premium'],
  },
  {
    icon: Type,
    title: 'Verbal förmåga',
    description:
      'Läsförståelse och slutledning från text. Tränar dig att svara snabbt och rätt på tid pressade frågor.',
    levels: ['Grund · Gratis', 'Avancerad · Premium'],
  },
  {
    icon: Calculator,
    title: 'Numerisk förmåga',
    description:
      'Tabeller, diagram, räkneuppgifter. Vi simulerar exakt den typ av frågor som dyker upp i SHL- och Assessio-tester.',
    levels: ['Grund · Gratis', 'Avancerad · Premium'],
  },
];

export default function TestsShowcase() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} />
            Rekryteringstester
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Träna på samma tester som rekryterarna använder
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            De flesta större arbetsgivare kör ett begåvningstest innan de
            träffar dig. Att gå in oförberedd är ett onödigt handikapp.
            Sex testpaket. Träna i din takt och följ din egen utveckling.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {TEST_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl bg-white border border-orange-100 p-6 hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300"
              style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{
                  background:
                    'linear-gradient(180deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
                aria-hidden="true"
              />

              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                style={{
                  background:
                    'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                }}
              >
                <cat.icon
                  className="w-6 h-6 text-orange-600"
                  strokeWidth={2.2}
                />
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                {cat.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                {cat.description}
              </p>

              <ul className="space-y-1.5 pt-4 border-t border-orange-100">
                {cat.levels.map((level) => (
                  <li
                    key={level}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700"
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500"
                      aria-hidden="true"
                    />
                    {level}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center"
        >
          <Link
            href="/login?signup=true"
            data-cta="tests"
            className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
            }}
          >
            Börja träna gratis
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
          <p className="text-xs text-slate-500">
            Tre grund-tester ingår i gratiskontot · 15 frågor per pass
          </p>
        </motion.div>
      </div>
    </section>
  );
}
