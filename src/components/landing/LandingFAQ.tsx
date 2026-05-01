'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Vad är ATS, och varför ska mitt CV vara anpassat?',
    a: 'ATS (Applicant Tracking System) är de program som de flesta större svenska arbetsgivare använder för att sortera ansökningar automatiskt. Är inte ditt CV läsbart för systemet kan du sorteras bort innan en människa ens öppnar det. Vi bygger alla CV-mallar för att vara ATS-säkra.',
  },
  {
    q: 'Hur mycket av jobbet gör ni åt mig?',
    a: 'Vi skriver utkastet baserat på ditt CV och jobbannonsen. Du läser igenom, justerar tonen där det känns bra och skickar in. Resultatet låter som du, bara mer slipat än om du hade skrivit varje brev från noll.',
  },
  {
    q: 'Hur snabbt kan jag skapa ett personligt brev?',
    a: 'Med våra verktyg tar det runt 60 sekunder från det att du klistrar in jobbannonsen tills du har ett färdigt brev att skicka. Du sparar en kvart eller mer per ansökan jämfört med att skriva från grunden.',
  },
  {
    q: 'Är mina uppgifter säkra?',
    a: 'Ja. Vi följer GDPR och all data lagras i EU. Vi säljer aldrig din information vidare och du kan när som helst radera ditt konto med ett klick. Då försvinner allt, även våra kopior.',
  },
  {
    q: 'Vad händer efter de 7 gratisdagarna med Premium?',
    a: 'Inget oväntat. Du behöver inte ange kreditkort innan trial-perioden, så du blir inte debiterad automatiskt. Vill du fortsätta uppgraderar du med ett klick. Vill du inte fortsätta gör du absolut ingenting, så rullar ditt gratiskonto vidare.',
  },
];

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
            Vanliga frågor
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-3">
            Svaren på det du undrar
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Hittar du inte det du söker?{' '}
            <a
              href="mailto:hej@jobbcoach.ai"
              className="text-orange-700 hover:text-orange-800 font-bold"
            >
              Hör av dig
            </a>
            .
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
                  isOpen ? 'border-orange-300' : 'border-orange-100'
                }`}
                style={
                  isOpen
                    ? { boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.18)' }
                    : { boxShadow: '0 2px 8px -4px rgba(249, 115, 22, 0.08)' }
                }
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full min-h-[56px] flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left hover:bg-orange-50/40 transition-colors touch-manipulation"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 text-orange-600 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2.5}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-orange-100 pt-4">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
