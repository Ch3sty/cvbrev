// src/lib/email/lifecycle/templates/conversion.ts
// Kvotvägg, kortkrävande trial, engångsköp som gått ut (plan D4).

import type { LifecycleEmail } from '../types';
import { renderLayout, heading, paragraph, list, firstName } from './layout';
import { hasPremiumNow, isPayingNow, swedishDate } from './helpers';

function greet(fullName: string | null): string {
  const name = firstName(fullName);
  return name ? `Hej ${name},` : 'Hej,';
}

/**
 * quota_wall. email_type får veckosuffix (quota_wall_2026w37) så unique-
 * indexet på (user_id, email_type) släpper igenom en ny vecka men aldrig
 * två samma vecka. shouldSend faller på premium, för då finns ingen vägg.
 */
export const quotaWall: LifecycleEmail = {
  type: 'quota_wall',
  shouldSend: async (ctx) => !hasPremiumNow(ctx.profile),
  render: (ctx) => {
    const subject = 'Du har slagit i taket tre gånger den här veckan';
    const preheader = 'Jobbsökarveckan kostar 99 kr och tar bort taket i sju dagar.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'quota_wall',
        userId: ctx.userId,
        preheader,
        body:
          heading('Du söker mer än gratisnivån räcker till') +
          paragraph(`${greet(ctx.profile.full_name)} du har nått dagsgränsen tre gånger de senaste dagarna.`) +
          paragraph(
            'Det är inte ett problem, det betyder att du söker på allvar. Men då jobbar du emot en gräns som är byggd för den som skickar en ansökan i veckan.'
          ),
        note: list([
          'Jobbsökarveckan: 99 kr, sju dagar utan tak, förnyas inte',
          'Månad: 149 kr, avsluta när du vill',
        ]),
        ctaLabel: 'Se vad som ingår',
        ctaUrl: '/priser',
        footNote: 'Gratisnivån ligger kvar som den är. Du behöver inte göra något.',
      }),
    };
  },
};

export const trialDay3: LifecycleEmail = {
  type: 'trial_day3',
  shouldSend: async (ctx) => isPayingNow(ctx.profile),
  render: (ctx) => {
    const subject = 'Halva veckan kvar. Har du kört analysen?';
    const preheader = 'CV-analysen är det som brukar ge mest på kortast tid.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'trial_day3',
        userId: ctx.userId,
        preheader,
        body:
          heading('Halva provperioden kvar') +
          paragraph(`${greet(ctx.profile.full_name)} du är halvvägs in i din provperiod.`) +
          paragraph(
            'Har du kört CV-analysen än? Det är den som brukar ge mest på kortast tid, och just nu ser du hela resultatet.'
          ),
        ctaLabel: 'Analysera mitt CV',
        ctaUrl: '/dashboard/cv-analys',
      }),
    };
  },
};

/** Skickas från webhooken customer.subscription.trial_will_end. */
export const trialDay5: LifecycleEmail = {
  type: 'trial_day5',
  transactional: true,
  shouldSend: async (ctx) => isPayingNow(ctx.profile),
  render: (ctx) => {
    const date = swedishDate(ctx.profile.current_period_end) || 'om några dagar';
    const subject = `Det här händer den ${date}`;
    const preheader = 'Din provperiod går över i en betald prenumeration.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'trial_day5',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading('Provperioden går snart över i en prenumeration') +
          paragraph(`${greet(ctx.profile.full_name)} vi vill inte att det ska komma som en överraskning.`) +
          paragraph(
            `Den ${date} dras 149 kr och prenumerationen fortsätter månadsvis. Vill du inte det säger du upp den innan dess, och då händer ingenting.`
          ),
        ctaLabel: 'Hantera min prenumeration',
        ctaUrl: '/dashboard/profil/prenumeration',
      }),
    };
  },
};

export const trialDay7: LifecycleEmail = {
  type: 'trial_day7',
  transactional: true,
  shouldSend: async () => true,
  render: (ctx) => {
    const subject = 'Din period går ut idag';
    const preheader = 'Vill du avsluta gör du det här.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'trial_day7',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading('Din period går ut idag') +
          paragraph(`${greet(ctx.profile.full_name)} sista dagen på din provperiod är idag.`) +
          paragraph(
            'Gör du ingenting fortsätter Premium och du debiteras som vanligt. Vill du avsluta hinner du fortfarande, det tar under en minut.'
          ),
        ctaLabel: 'Hantera min prenumeration',
        ctaUrl: '/dashboard/profil/prenumeration',
      }),
    };
  },
};

/** Dagspass eller jobbsökarvecka har löpt ut. Kort, inget tjat. */
export const onetimeExpired: LifecycleEmail = {
  type: 'onetime_expired',
  shouldSend: async (ctx) => !hasPremiumNow(ctx.profile),
  render: (ctx) => {
    const subject = 'Din period är slut. Vill du förlänga?';
    const preheader = 'Allt du skapat ligger kvar på kontot.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'onetime_expired',
        userId: ctx.userId,
        preheader,
        body:
          heading('Din period är slut') +
          paragraph(`${greet(ctx.profile.full_name)} ditt köp har löpt ut och kontot är tillbaka på gratisnivån.`) +
          paragraph(
            'Allt du skapat ligger kvar. Söker du fortfarande kan du förlänga med ett dagspass för 49 kr eller en vecka för 99 kr.'
          ),
        ctaLabel: 'Förläng min tillgång',
        ctaUrl: '/dashboard/profil/prenumeration',
      }),
    };
  },
};
