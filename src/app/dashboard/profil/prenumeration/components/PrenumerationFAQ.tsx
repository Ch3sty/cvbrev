'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: 'Vad hände med mina fem dagar Premium?',
    a: 'Alla nya konton får fem dagar med full Premium direkt vid registreringen, utan kort. När de fem dagarna passerat går kontot över till gratisnivån med ett brev om dagen. Vill du ha tillbaka Premium väljer du ett av alternativen ovan.',
  },
  {
    q: 'Måste jag binda upp mig på en månad?',
    a: 'Nej. Dagspasset kostar 49 kr och gäller ett dygn, Jobbsökarveckan kostar 99 kr och gäller sju dagar. Båda är engångsköp som aldrig dras om automatiskt. Månad och kvartal är prenumerationer du säger upp när du vill.',
  },
  {
    q: 'Kan jag avsluta när jag vill?',
    a: 'Ja. Du loggar in på Stripe-portalen från den här sidan och klickar avsluta. Premium löper till slutet av perioden du redan betalat för, sedan går kontot tillbaka till gratisnivån. Ingen uppsägningstid.',
  },
  {
    q: 'Vad ingår i gratisnivån?',
    a: 'Ett personligt brev om dagen, en CV-analys med de tre viktigaste fynden, tio meddelanden till jobbcoachen per dag och ett test per dag och nivå. Du kan alltid läsa och kopiera det du skapat. Nedladdning som PDF och Word kräver Premium.',
  },
  {
    q: 'Vad händer med mina CV och brev om jag avslutar?',
    a: 'Allt finns kvar. Du tappar bara åtkomst till premiumfunktionerna, själva innehållet är ditt och stannar i ditt konto.',
  },
  {
    q: 'Hur kontaktar jag support?',
    a: 'Maila support@jobbcoach.ai så svarar vi inom kort. Premium-medlemmar får prioriterad hjälp.',
  },
];

export default function PrenumerationFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section>
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
          Vanliga frågor
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
          Innan du bestämmer dig
        </h2>
      </div>

      <div className="bg-white rounded-xl border border-orange-100 overflow-hidden divide-y divide-orange-100">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.q}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-orange-50/50 transition-colors min-h-[56px] touch-manipulation"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-neutral-900 leading-snug">
                  {faq.q}
                </span>
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {isOpen ? (
                    <Minus className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </span>
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
                    <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-neutral-700 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
