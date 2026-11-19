// src/lib/email/epostbyte.ts
// Mejlen vid byte av e-postadress (/api/konto/byt-epost). Supabase skickar
// inga mejl själv sedan flytten till Irland, så länkarna skapas med
// auth.admin.generateLink och går ut via Resend i samma mall som
// livscykelmejlen.
//
// Den nya adressen får alltid bekräftelselänken. Den nuvarande får antingen
// en egen länk (när båda måste bekräfta) eller ett besked utan länk, så att
// kontoägaren märker ett byte de inte bett om.

import { renderLayout, heading, paragraph, firstName, escapeHtml } from './lifecycle/templates/layout';
import { unsubscribeUrl } from './unsubscribe';

export type Mottagare = 'ny' | 'nuvarande';

export interface EpostbyteData {
  mottagare: Mottagare;
  userId: string;
  fullName: string | null;
  nuvarandeEpost: string;
  nyEpost: string;
  /** Bekräftelselänken. Null till den nuvarande adressen ger ett besked utan länk. */
  lank: string | null;
  /** Sant när båda adresserna måste bekräfta. */
  bada: boolean;
}

export interface EpostbyteMejl {
  subject: string;
  html: string;
  text: string;
}

const GILTIGHET = 'Länken gäller i 24 timmar.';
const AVSLUT = 'Jobbcoach.ai';

function halsning(fullName: string | null): string {
  const namn = firstName(fullName);
  return namn ? `Hej ${namn},` : 'Hej,';
}

function avregistrering(userId: string) {
  return {
    url: unsubscribeUrl(userId),
    label: 'Avregistrera dig från nyhetsmejl',
    consentLine: 'Det här mejlet rör inloggningen till ditt konto.',
  };
}

export function epostbyteMejl(d: EpostbyteData): EpostbyteMejl {
  const ny = escapeHtml(d.nyEpost);
  const nuvarande = escapeHtml(d.nuvarandeEpost);
  const hej = halsning(d.fullName);
  const hejText = hej.replace(/&amp;/g, '&');

  if (d.mottagare === 'ny') {
    const subject = 'Bekräfta din nya e-postadress';
    const preheader = 'Ett klick, så byter vi adress på ditt konto.';
    const andraHtml = d.bada
      ? `Vi har också skickat ett mejl till din nuvarande adress, ${nuvarande}. Bytet går igenom när du har bekräftat båda.`
      : 'Bytet går igenom så fort du har klickat.';
    const andraText = d.bada
      ? `Vi har också skickat ett mejl till din nuvarande adress, ${d.nuvarandeEpost}. Bytet går igenom när du har bekräftat båda.`
      : 'Bytet går igenom så fort du har öppnat länken.';
    const html = renderLayout({
      type: 'epostbyte_ny',
      userId: d.userId,
      preheader,
      transactional: true,
      body:
        heading('Bekräfta din nya e-postadress') +
        paragraph(`${hej} du har bett om att byta e-postadress på ditt konto hos Jobbcoach.ai till <strong>${ny}</strong>.`) +
        paragraph(`Klicka på knappen så blir det den här adressen du loggar in med. ${andraHtml}`),
      ctaLabel: 'Bekräfta adressen',
      ctaUrl: d.lank ?? undefined,
      footNote: `${GILTIGHET} Bad du inte om bytet kan du strunta i mejlet. Då ändras ingenting.`,
      unsubscribe: avregistrering(d.userId),
    });
    const text = [
      subject,
      '',
      hejText,
      '',
      `Du har bett om att byta e-postadress på ditt konto hos Jobbcoach.ai till ${d.nyEpost}.`,
      '',
      'Öppna länken så blir det den här adressen du loggar in med:',
      d.lank ?? '',
      '',
      andraText,
      '',
      `${GILTIGHET} Bad du inte om bytet kan du strunta i mejlet. Då ändras ingenting.`,
      '',
      AVSLUT,
    ].join('\n');
    return { subject, html, text };
  }

  if (d.lank) {
    const subject = 'Godkänn bytet av e-postadress';
    const preheader = `Kontot ska byta till ${d.nyEpost}. Var det du?`;
    const html = renderLayout({
      type: 'epostbyte_nuvarande',
      userId: d.userId,
      preheader,
      transactional: true,
      body:
        heading('Godkänn bytet av e-postadress') +
        paragraph(`${hej} någon har bett om att byta e-postadressen på ditt konto hos Jobbcoach.ai från ${nuvarande} till <strong>${ny}</strong>.`) +
        paragraph('Var det du, så godkänner du bytet med knappen nedan. Den nya adressen har fått ett eget mejl, och bytet går igenom först när båda är bekräftade.'),
      ctaLabel: 'Godkänn bytet',
      ctaUrl: d.lank,
      footNote: `${GILTIGHET} Var det inte du? Klicka inte på länken, så ligger kontot kvar på den här adressen. Byt gärna lösenord för säkerhets skull.`,
      unsubscribe: avregistrering(d.userId),
    });
    const text = [
      subject,
      '',
      hejText,
      '',
      `Någon har bett om att byta e-postadressen på ditt konto hos Jobbcoach.ai från ${d.nuvarandeEpost} till ${d.nyEpost}.`,
      '',
      'Var det du, så godkänner du bytet här:',
      d.lank,
      '',
      'Den nya adressen har fått ett eget mejl, och bytet går igenom först när båda är bekräftade.',
      '',
      `${GILTIGHET} Var det inte du? Öppna inte länken, så ligger kontot kvar på den här adressen. Byt gärna lösenord för säkerhets skull.`,
      '',
      AVSLUT,
    ].join('\n');
    return { subject, html, text };
  }

  // Besked utan länk: bytet bekräftas från den nya adressen.
  const subject = 'Någon vill byta e-postadress på ditt konto';
  const preheader = `Kontot kan snart byta till ${d.nyEpost}.`;
  const html = renderLayout({
    type: 'epostbyte_besked',
    userId: d.userId,
    preheader,
    transactional: true,
    body:
      heading('Din e-postadress är på väg att bytas') +
      paragraph(`${hej} någon har bett om att byta e-postadressen på ditt konto hos Jobbcoach.ai från ${nuvarande} till <strong>${ny}</strong>.`) +
      paragraph('Var det du behöver du inte göra något här. Bytet går igenom när den nya adressen är bekräftad, och sedan loggar du in med den.'),
    footNote: 'Var det inte du? Byt lösenord direkt och hör av dig till oss på support@jobbcoach.ai, så stoppar vi bytet.',
    unsubscribe: avregistrering(d.userId),
  });
  const text = [
    subject,
    '',
    hejText,
    '',
    `Någon har bett om att byta e-postadressen på ditt konto hos Jobbcoach.ai från ${d.nuvarandeEpost} till ${d.nyEpost}.`,
    '',
    'Var det du behöver du inte göra något här. Bytet går igenom när den nya adressen är bekräftad, och sedan loggar du in med den.',
    '',
    'Var det inte du? Byt lösenord direkt och hör av dig till oss på support@jobbcoach.ai, så stoppar vi bytet.',
    '',
    AVSLUT,
  ].join('\n');
  return { subject, html, text };
}
