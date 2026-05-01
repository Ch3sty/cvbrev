'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: 'Vad händer efter 7 dagars provperiod?',
    a: 'Du faktureras automatiskt 149 kr/mån. Vi skickar en påminnelse innan första debiteringen så att du inte blir överraskad. Inga dolda avgifter — bara månadsbeloppet.',
  },
  {
    q: 'Kan jag avsluta när jag vill?',
    a: 'Ja. Du loggar in på Stripe-portalen från den här sidan och klickar avsluta. Klart. Inga frågor, inga uppsägningstider.',
  },
  {
    q: 'Behöver jag ange kortuppgifter för provperioden?',
    a: 'Ja, men inget dras under de första 7 dagarna. Avslutar du innan dag 7 betalar du 0 kr. Vi använder Stripe så betalningsuppgifterna lagras aldrig hos oss.',
  },
  {
    q: 'Vad händer med mina CV och brev om jag avslutar?',
    a: 'Allt finns kvar. Du tappar bara åtkomst till premium-funktionerna — själva innehållet är ditt och stannar i ditt konto.',
  },
  {
    q: 'Finns det årsabonnemang?',
    a: 'Inte just nu. Vi kör månads för att hålla det enkelt — du har full flexibilitet och betalar bara när du behöver Premium.',
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
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
          Vanliga frågor
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Innan du bestämmer dig
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-orange-100 overflow-hidden divide-y divide-orange-100" style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}>
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.q}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-orange-50/50 transition-colors min-h-[56px] touch-manipulation"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  {faq.q}
                </span>
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: isOpen ? 'linear-gradient(135deg, #F97316, #DC2626)' : '#FFF7ED',
                    color: isOpen ? 'white' : '#C2410C',
                  }}
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
                    <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-slate-700 leading-relaxed">
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
