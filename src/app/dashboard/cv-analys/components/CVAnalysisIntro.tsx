'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Target, FileSearch, Zap } from 'lucide-react';
import { HeroAnalysisIcon } from './illustrations/AnalysisIcons';

interface CVAnalysisIntroProps {
  onStartAnalysis: () => void;
  remainingAnalyses?: number | null;
  isPremium?: boolean;
}

export default function CVAnalysisIntro({
  onStartAnalysis,
  remainingAnalyses,
  isPremium = false,
}: CVAnalysisIntroProps) {
  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)',
      }}
    >
      {/* Subtila orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[5%] left-[10%] w-[400px] h-[400px]"
          style={{
            background:
              'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
            willChange: 'transform',
          }}
          animate={{
            x: [0, 80, 0],
            y: [0, -60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] w-[450px] h-[450px]"
          style={{
            background:
              'radial-gradient(circle, rgba(190, 24, 93, 0.06) 0%, transparent 70%)',
            filter: 'blur(70px)',
            willChange: 'transform',
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, 70, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 mb-8 sm:mb-10"
        >
          <div className="flex-shrink-0">
            <HeroAnalysisIcon className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>
          <div className="text-center sm:text-left min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-2">
              Djupgående CV-analys
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
              Sluta gissa{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F97316, #DC2626, #BE185D)',
                }}
              >
                vad som är fel
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              30 ansökningar och 0 svar känns bekant. Vi hittar exakt vad som håller dig
              tillbaka och visar hur du fixar det.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 sm:mb-12"
        >
          <button
            type="button"
            onClick={onStartAnalysis}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-white font-bold text-base min-h-[56px]"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 12px 28px -8px rgba(220, 38, 38, 0.45)',
            }}
          >
            Analysera mitt CV nu
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>

          {remainingAnalyses !== null && remainingAnalyses !== undefined && (
            <p className="mt-3 text-sm text-slate-600 text-center sm:text-left">
              {isPremium ? (
                <span className="font-semibold text-orange-700">
                  Obegränsade analyser med Premium
                </span>
              ) : (
                <>
                  Du har{' '}
                  <span className="font-bold text-orange-700">{remainingAnalyses}</span>{' '}
                  {remainingAnalyses === 1 ? 'analys' : 'analyser'} kvar denna vecka
                </>
              )}
            </p>
          )}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12"
        >
          {[
            {
              icon: Target,
              title: 'ATS-optimering',
              description:
                'Vi analyserar om ditt CV passerar de automatiska urvalssystem som de flesta arbetsgivare använder.',
            },
            {
              icon: FileSearch,
              title: 'Detaljerad feedback',
              description: 'Konkreta förslag på förbättringar för varje sektion av ditt CV.',
            },
            {
              icon: Zap,
              title: 'Snabbt resultat',
              description: 'Fullständig analys på under en minut. Inga onödiga väntetider.',
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.06 }}
              className="bg-white rounded-2xl border border-orange-200/50 p-5"
              style={{ boxShadow: '0 4px 14px -6px rgba(249, 115, 22, 0.15)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-3"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.35)',
                }}
              >
                <benefit.icon className="w-5 h-5" strokeWidth={2.25} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">{benefit.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Det här får du */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background:
              'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.18)',
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-2">
            Det här får du
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            En komplett bild av ditt CV
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Poäng för hur ATS-vänligt ditt CV är',
              'Analys av dina kompetenser och nyckelord',
              'Granskning av personlig beskrivning',
              'Konkreta förbättringar för varje sektion',
              'Jämförelse av före och efter',
              'Möjlighet att exportera till PDF',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.04 }}
                className="flex items-start gap-2.5"
              >
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white mt-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                  }}
                >
                  <CheckCircle className="w-3 h-3" strokeWidth={3} fill="white" />
                </div>
                <span className="text-sm text-slate-700">{item}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-7 text-center sm:text-left">
            <button
              type="button"
              onClick={onStartAnalysis}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm min-h-[48px]"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
              }}
            >
              Kom igång
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
