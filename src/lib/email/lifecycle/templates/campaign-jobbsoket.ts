// src/lib/email/lifecycle/templates/campaign-jobbsoket.ts
// Mejlet om Jobbsöket (docs/beslut-mejl-och-radering-2026-11-22.md, 1e).
// Lydelserna J1 till J10 är copywriterns, ordagrant. "tolv" läses ur
// NO_RESPONSE_NUDGE_DAYS, aldrig för hand. Avregistreringen i foten stänger
// erbjudanden och tips, samma val som urvalet läser (erbjudanden_mejl).
//
// Utskicket styrs av src/lib/email/jobbsoketUtskick.ts och är avstängt tills
// ägaren satt dagen.

import { renderLayout, heading, paragraph, firstName } from './layout';
import { soktaHref } from '@/lib/jobbsok/adress';
import { avregistreraErbjudandenUrl } from '@/lib/email/campaign-kampanj';
import { NO_RESPONSE_NUDGE_DAYS } from '@/lib/applications/status';
import { talOrdTill20 } from '@/components/publikt/talord';

export const JOBBSOKET_MEJL_TYP = 'campaign:jobbsoket-2026-12';

/** Lydelserna (beslut-mejl-och-radering 1e). */
export const JOBBSOKET_TEXT = {
  J1: 'Fick du svar på jobbet du sökte senast?',
  J2: 'Logga det i Sökta tjänster, så säger vi till när det är dags att följa upp.',
  J3: 'Logga jobbet du sökte senast',
  J4_1: 'en ansökan är lätt att tappa bort när den väl är skickad. Vilken dag gick den iväg, vad hette tjänsten, och har arbetsgivaren hört av sig sedan dess?',
  J4_2: 'Logga jobbet du sökte senast i Sökta tjänster. Du fyller i tjänst, arbetsgivare och datum. Datumet väljer du själv, så en ansökan du skickade för ett tag sedan går lika bra. Det är gratis för alla med konto.',
  J5: 'Jobb som du har skrivit personligt brev till hos oss behöver du inte fylla i för hand. I Sökta tjänster föreslår vi att lägga in dem, med ett tryck.',
  J4_3: (dagar: string) =>
    `Sedan håller vi räkningen åt dig. Har det varit tyst i ${dagar} dagar föreslår vi ett uppföljningsmejl och skriver ett utkast. Du ändrar det du vill och skickar själv, från din egen adress.`,
  J6: 'Logga sökt tjänst',
  J7: 'Logga mina sökta tjänster',
  J8: 'Ingen annan användare, rekryterare eller arbetsgivare ser dina sökta tjänster, och vi skickar aldrig något till en arbetsgivare.',
  J9: 'Du får det här mejlet för att du har ett konto på jobbcoach.ai och inte har stängt av erbjudanden och tips på mejl.',
  J10: 'Stäng av erbjudanden och tips på mejl',
} as const;

export interface JobbsoketMejlIn {
  userId: string;
  fullName: string | null;
  harBrev: boolean;
}

export function genereraJobbsoketMejl({ userId, fullName, harBrev }: JobbsoketMejlIn): {
  subject: string;
  preheader: string;
  html: string;
} {
  const t = JOBBSOKET_TEXT;
  const namn = firstName(fullName);
  const halsning = namn ? `Hej ${namn},` : 'Hej,';
  const stycke2 = harBrev ? `${t.J4_2} ${t.J5}` : t.J4_2;

  const html = renderLayout({
    type: JOBBSOKET_MEJL_TYP,
    userId,
    preheader: t.J2,
    body:
      heading(t.J3) +
      paragraph(`${halsning} ${t.J4_1}`) +
      paragraph(stycke2) +
      paragraph(t.J4_3(talOrdTill20(NO_RESPONSE_NUDGE_DAYS))),
    ctaLabel: harBrev ? t.J7 : t.J6,
    // Med brev visas kortet med breven i Sökta tjänster, så arket ska inte
    // öppnas ovanpå det.
    ctaUrl: harBrev
      ? soktaHref({ fran: 'mejl-jobbsoket' })
      : soktaHref({ logga: 'sokt', fran: 'mejl-jobbsoket' }),
    footNote: t.J8,
    unsubscribe: { url: avregistreraErbjudandenUrl(userId), label: t.J10, consentLine: t.J9 },
  });

  return { subject: t.J1, preheader: t.J2, html };
}
