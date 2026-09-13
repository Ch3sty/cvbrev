'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

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
      <div className="mb-2">
        <h2 className="text-sm font-medium text-ink-3">Innan du bestämmer dig</h2>
      </div>

      <div className="divide-y divide-kant overflow-hidden rounded-xl border border-kant bg-panel">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex min-h-11 w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-insunken"
                aria-expanded={isOpen}
              >
                <span className="text-kort text-ink-1">{faq.q}</span>
                <span className="shrink-0 text-ink-2" aria-hidden="true">
                  {isOpen ? (
                    <Minus className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Plus className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </span>
              </button>

              {isOpen ? (
                <div className="px-4 pb-4 text-sm leading-[22px] text-ink-2">{faq.a}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
