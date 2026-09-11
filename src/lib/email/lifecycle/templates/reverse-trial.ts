// src/lib/email/lifecycle/templates/reverse-trial.ts
// Reverse trial-sekvensen rt_day0 till rt_day10 (plan D4).

import type { LifecycleEmail, LifecycleContext } from '../types';
import { renderLayout, heading, paragraph, list, firstName } from './layout';
import { withUtm } from '../schedule';
import {
  hasActivity,
  isPayingNow,
  hasPremiumNow,
  isTestSegment,
  weekdayAfter,
} from './helpers';

function greeting(ctx: LifecycleContext): string {
  const name = firstName(ctx.profile.full_name);
  return name ? `Hej ${name},` : 'Hej,';
}

export const rtDay0: LifecycleEmail = {
  type: 'rt_day0',
  shouldSend: async () => true,
  render: (ctx) => {
    const subject = 'Du har premium i fem dagar. Börja här.';
    const preheader = 'Alla 42 mallar och obegränsad analys, från och med nu.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'rt_day0',
        userId: ctx.userId,
        preheader,
        body:
          heading('Fem dagar med allt upplåst') +
          paragraph(
            `${greeting(ctx)} ditt konto är igång och Premium är påslaget i fem dagar. Inget kort, inget som förnyas.`
          ) +
          paragraph(
            'Börja med CV:t. Vi läser det och visar vad en rekryterare ser innan de hunnit till dina meriter. Det tar ungefär trettio sekunder.'
          ),
        ctaLabel: 'Ladda upp mitt CV',
        ctaUrl: '/dashboard/profil/cv',
        note:
          '<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#9A3412;">Det här ingår de fem dagarna</p>' +
          list([
            'Alla 42 CV-mallar',
            'Obegränsad CV-analys',
            'Obegränsat med personliga brev',
            'Nedladdning som PDF och Word',
          ]),
      }),
    };
  },
};

export const rtDay1: LifecycleEmail = {
  type: 'rt_day1',
  // Avbryt om analysen redan är igång: mailet vore en påminnelse om något
  // användaren nyss gjort.
  shouldSend: async (ctx) =>
    !(await hasActivity(ctx, ['cv_analysis_started', 'cv_analysis_completed'])),
  render: async (ctx) => {
    const testUser = await isTestSegment(ctx);

    if (testUser) {
      const subject = 'Så tolkar rekryteraren ditt testresultat';
      const preheader = 'Poängen säger en sak. Ditt CV avgör om du kommer till testet.';
      return {
        subject,
        preheader,
        html: renderLayout({
          type: 'rt_day1',
          userId: ctx.userId,
          preheader,
          body:
            heading('Testet är sällan det som stoppar dig') +
            paragraph(
              `${greeting(ctx)} du har kört våra tester, och det säger något om hur seriöst du tar det här.`
            ) +
            paragraph(
              'Men testerna kommer sent i processen. Först ska CV:t ta dig förbi granskningen, och det är där de flesta faller. Ladda upp ditt CV så visar vi vad en rekryterare faktiskt ser.'
            ),
          ctaLabel: 'Analysera mitt CV',
          ctaUrl: '/dashboard/cv-analys',
        }),
      };
    }

    const subject = 'Vad ser rekryteraren i ditt CV?';
    const preheader = 'Analysen tar två minuter och är öppen hela veckan.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'rt_day1',
        userId: ctx.userId,
        preheader,
        body:
          heading('Vad ser rekryteraren i ditt CV?') +
          paragraph(
            `${greeting(ctx)} de flesta CV:n sorteras bort av ett system innan en människa läst dem.`
          ) +
          paragraph(
            'Analysen går igenom formatering, nyckelord och struktur, ger dig en poäng och en lista på vad som drar ner den. Den är öppen hela din premiumvecka.'
          ),
        ctaLabel: 'Analysera mitt CV',
        ctaUrl: '/dashboard/cv-analys',
      }),
    };
  },
};

export const rtDay3: LifecycleEmail = {
  type: 'rt_day3',
  shouldSend: async (ctx) => !(await hasActivity(ctx, ['letter_created'])),
  render: (ctx) => {
    const subject = 'Ett personligt brev på fyra minuter';
    const preheader = 'Klistra in annonsen, vi skriver utkastet.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'rt_day3',
        userId: ctx.userId,
        preheader,
        body:
          heading('Ett personligt brev på fyra minuter') +
          paragraph(`${greeting(ctx)} det svåraste med ansökan är oftast första meningen.`) +
          paragraph(
            'Klistra in annonsen så skriver vi ett utkast utifrån ditt CV och tjänsten. Du behåller det som är ditt och stryker resten. De flesta är klara på under fem minuter.'
          ),
        ctaLabel: 'Skriv mitt brev',
        ctaUrl: '/dashboard/skapa-brev',
      }),
    };
  },
};

export const rtDay4: LifecycleEmail = {
  type: 'rt_day4',
  shouldSend: async (ctx) => !isPayingNow(ctx.profile),
  render: (ctx) => {
    // Veckodagen räknas från premium_until, inte utskicksdagen, så raden
    // stämmer även om cronen halkar en körning.
    const day = weekdayAfter(ctx.profile.premium_until);
    const subject = 'Två dagar kvar med allt upplåst';
    const preheader = `Efter ${day} går du ner till gratisnivån.`;
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'rt_day4',
        userId: ctx.userId,
        preheader,
        body:
          heading('Två dagar kvar med allt upplåst') +
          paragraph(
            `${greeting(ctx)} din premiumperiod tar slut på ${day}. Inget dras, kontot går över till gratisnivån av sig självt.`
          ) +
          paragraph('Så här ändras det:'),
        note: list([
          '42 mallar blir 12',
          'Obegränsad analys blir en per 72 timmar',
          'Obegränsade brev blir ett brev om dagen',
          'Nedladdning som PDF och Word kräver Premium',
        ]),
        ctaLabel: 'Behåll Premium',
        ctaUrl: '/dashboard/profil/prenumeration',
        footNote:
          'Söker du bara den här veckan finns Jobbsökarveckan för 99 kr. Sju dagar, inget som förnyas.',
      }),
    };
  },
};

export const rtDay6: LifecycleEmail = {
  type: 'rt_day6',
  shouldSend: async (ctx) => !isPayingNow(ctx.profile),
  render: (ctx) => {
    const subject = 'Du är nu på gratisnivån';
    const preheader = 'Allt du skapat finns kvar. Så här ser gränserna ut.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'rt_day6',
        userId: ctx.userId,
        preheader,
        body:
          heading('Du är nu på gratisnivån') +
          paragraph(
            `${greeting(ctx)} dina fem dagar är slut. Allt du skapat ligger kvar, inget har försvunnit.`
          ) +
          paragraph('På gratisnivån har du:'),
        note: list([
          'Ett brev om dagen',
          'En CV-analys var tredje dag',
          '12 CV-mallar',
          'Alla rekryteringstester, ett per nivå och dag',
        ]),
        ctaLabel: 'Till min översikt',
        ctaUrl: '/dashboard',
        footNote:
          'Behöver du full tillgång en intensiv vecka kostar Jobbsökarveckan 99 kr och förnyas inte.',
      }),
    };
  },
};

export const rtDay10: LifecycleEmail = {
  type: 'rt_day10',
  shouldSend: async (ctx) => !hasPremiumNow(ctx.profile),
  render: (ctx) => {
    const subject = 'Hur går ansökandet?';
    const preheader = 'Tre saker som brukar fastna efter första veckan.';
    const link = (href: string, text: string) =>
      `<a href="${withUtm(href, 'rt_day10')}" target="_blank" style="color:#EA580C;font-weight:600;text-decoration:none;">${text}</a>`;
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'rt_day10',
        userId: ctx.userId,
        preheader,
        body:
          heading('Hur går ansökandet?') +
          paragraph(`${greeting(ctx)} en vecka in brukar tre saker fastna. Vi har skrivit om alla tre.`) +
          list([
            `${link('/artiklar/kompetensbaserad-intervju-star-metoden', 'STAR-metoden')}, för när du ska berätta hur du löste något`,
            `${link('/artiklar/styrkor-svagheter-intervju', 'Styrkor och svagheter')}, frågan alla vet kommer och få har svarat på`,
            `${link('/artiklar/hur-ofta-byta-jobb', 'Hur ofta man byter jobb')}, om du undrar hur ditt CV läses`,
          ]),
        ctaLabel: 'Fortsätt där du slutade',
        ctaUrl: '/dashboard',
      }),
    };
  },
};
