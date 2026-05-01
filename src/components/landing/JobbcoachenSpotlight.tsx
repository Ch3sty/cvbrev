'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  MessageCircle,
  FileText,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const SUGGESTED = [
  'Hur förhandlar jag lön på första intervjun?',
  'Räcker mina meriter för rollen?',
  'Vad ska jag fråga rekryteraren?',
];

const COACH_ANSWER = `Du behöver inte ge en exakt siffra direkt. Säg att du vill förstå hela paketet (grundlön, bonus, pension, semester) innan du landar på en summa. Det visar att du är beläst och seriös.

När du väl ger spannet, lägg dig 10-15% över vad du faktiskt hoppas på. Då har du marginal när de förhandlar ner.`;

const SOURCES = ['Trygghetsrådet TRR', 'Akademikerförbundet SSR', 'Saco lönestatistik'];

export default function JobbcoachenSpotlight() {
  const [typed, setTyped] = useState('');
  const [showSources, setShowSources] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let index = 0;
    const interval = setInterval(() => {
      index += 2;
      if (index >= COACH_ANSWER.length) {
        setTyped(COACH_ANSWER);
        setShowSources(true);
        clearInterval(interval);
      } else {
        setTyped(COACH_ANSWER.slice(0, index));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [hasStarted]);

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(190, 24, 93, 0.06) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16 items-center">
          {/* Vänster: text */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
              Jobbcoachen
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
              En coach som{' '}
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              >
                har läst ditt CV
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              Lön, intervju, arbetsrätt, karriärval. Ställ dina frågor och få
              raka svar baserade på riktiga svenska källor. Coachen kan se ditt
              CV och sparade brev så du slipper förklara allt från början.
            </p>

            <ul className="space-y-2.5 mb-7">
              {[
                'Streamade svar som kommer direkt',
                'Källhänvisningar du kan klicka på',
                'Läser ditt CV och dina sparade brev som kontext',
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0"
                    strokeWidth={2.5}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/login?signup=true"
              data-cta="jobbcoachen"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
              }}
            >
              Börja chatta gratis
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>

          {/* Höger: chat-mockup */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px', amount: 0.3 }}
            onViewportEnter={() => setHasStarted(true)}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div
              className="absolute -inset-3 rounded-3xl opacity-30 blur-2xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
              aria-hidden="true"
            />

            <div
              className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden flex flex-col"
              style={{ boxShadow: '0 20px 40px -16px rgba(249, 115, 22, 0.22)' }}
            >
              {/* Header */}
              <div
                className="relative px-5 py-4 border-b border-orange-100 flex items-center gap-3"
                style={{
                  background:
                    'linear-gradient(90deg, #FFF7ED 0%, #FFFFFF 100%)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  }}
                >
                  <Sparkles className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900">Jobbcoachen</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                      aria-hidden="true"
                    />
                    Aktiv just nu
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <FileText className="w-3 h-3 text-orange-500" strokeWidth={2.5} />
                  Ser ditt CV
                </div>
              </div>

              {/* Konversation */}
              <div className="p-5 sm:p-6 space-y-4 min-h-[340px]">
                {/* Användarens fråga */}
                <div className="flex justify-end">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="max-w-[80%] bg-orange-50 border border-orange-100 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-slate-800"
                  >
                    Hur förhandlar jag lön på första intervjun?
                  </motion.div>
                </div>

                {/* Coachens svar */}
                <div className="flex justify-start">
                  <div className="max-w-[88%]">
                    <div
                      className="rounded-2xl rounded-tl-sm px-4 py-3 text-white"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
                        boxShadow: '0 8px 20px -10px rgba(220, 38, 38, 0.4)',
                      }}
                    >
                      <p
                        className="text-sm leading-relaxed whitespace-pre-line"
                        aria-live="polite"
                      >
                        {typed || (hasStarted ? '' : '...')}
                        {hasStarted &&
                          typed.length < COACH_ANSWER.length && (
                            <span
                              className="inline-block w-0.5 h-3.5 ml-0.5 bg-white align-middle animate-pulse"
                              aria-hidden="true"
                            />
                          )}
                      </p>
                    </div>

                    {/* Källor */}
                    <AnimatePresence>
                      {showSources && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2.5 flex flex-wrap gap-1.5"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 mt-1">
                            Källor:
                          </span>
                          {SOURCES.map((source) => (
                            <span
                              key={source}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200"
                            >
                              {source}
                            </span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Förslagna frågor */}
              <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-orange-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Andra frågor du kan ställa
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED.map((q, i) => (
                    <span
                      key={q}
                      className={`inline-flex items-center text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                        i === 0
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
