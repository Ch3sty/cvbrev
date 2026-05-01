'use client';

import { motion } from 'framer-motion';
import { Upload, BrainCircuit, Send, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Upload,
    title: 'Ladda upp ditt CV',
    description:
      'Dra och släpp eller klistra in din nuvarande text. Vi läser PDF, Word och alla vanliga format.',
    detail: '15 sekunder',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'AI matchar mot tjänsten',
    description:
      'Vår modell analyserar jobbannonsen, identifierar nyckelorden som faktiskt räknas och skräddarsyr ditt brev.',
    detail: 'AI gör jobbet',
  },
  {
    number: '03',
    icon: Send,
    title: 'Skicka in och få svar',
    description:
      'Färdig ATS-anpassad ansökan att ladda ner. Träffsäker, professionell, klar att skickas direkt.',
    detail: 'Klar på under 1 min',
  },
];

export default function ThreeStepFlow() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white">
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Från jobbannons till färdig ansökan i tre steg
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Inga mallar att fylla i. Inga generiska brev. Bara en ansökan som
            faktiskt motsvarar vad rekryteraren letar efter.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 relative">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl bg-white border border-orange-100 p-6 sm:p-7 hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300"
              style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
            >
              {/* Vänster gradient-strip */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{
                  background:
                    'linear-gradient(180deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
                aria-hidden="true"
              />

              {/* Stort nummer i bakgrunden */}
              <div
                className="absolute top-3 right-4 text-[80px] sm:text-[96px] font-black leading-none select-none pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
                aria-hidden="true"
              >
                {step.number}
              </div>

              <div className="relative">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                  }}
                >
                  <step.icon
                    className="w-6 h-6 text-orange-600"
                    strokeWidth={2.2}
                  />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                  {step.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                  {step.description}
                </p>

                <div className="pt-3 border-t border-orange-100 inline-flex items-center gap-1.5 text-xs font-bold text-orange-700">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  {step.detail}
                </div>
              </div>

              {/* Pil mellan stegen — bara desktop */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-orange-200 items-center justify-center z-10"
                  style={{ display: 'none' }}
                  aria-hidden="true"
                >
                  <ArrowRight className="w-3 h-3 text-orange-500" strokeWidth={3} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
