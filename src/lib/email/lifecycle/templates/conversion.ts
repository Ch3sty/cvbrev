// src/lib/email/lifecycle/templates/conversion.ts
// Kvotvägg, kortkrävande trial, engångsköp som gått ut (plan D4).

import { PLAN_BY_KEY, SALD_PLAN, paketKort, paketMedPris } from '@/lib/plans/plans';
import type { LifecycleEmail } from '../types';
import { renderLayout, heading, paragraph, list, firstName } from './layout';
import { hasPremiumNow, isPayingNow, swedishDate } from './helpers';

/** Det som ingår i Premium, utan raden om uppsägning. */
const PREMIUM_RADER = PLAN_BY_KEY[SALD_PLAN].highlights.filter((r) => r !== 'Säg upp när du vill');

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
    const preheader = `${paketMedPris(SALD_PLAN)}, utan tak och utan bindningstid.`;
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'quota_wall',
        userId: ctx.userId,
        preheader,
        body:
          heading('Du söker mer än gratisnivån räcker till') +
          paragraph(`${greet(ctx.profile.full_name)} du har slagit i taket tre gånger de senaste dagarna.`) +
          paragraph(
            'Det är inte ett problem, det betyder att du söker på allvar. Men då arbetar du emot en gräns som är byggd för den som skickar en ansökan i veckan. Med ' + paketKort() + ' tar vi bort taket på allt, och du säger upp när du vill.'
          ),
        note: list([...PREMIUM_RADER]),
        ctaLabel: 'Se vad som ingår',
        ctaUrl: '/priser',
        footNote: 'Gratisnivån ligger kvar som den är. Du behöver inte göra något.',
      }),
    };
  },
};

/** Ett engångsköp har löpt ut. Kort, inget tjat. */
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
            `Allt du skapat ligger kvar och går att läsa och kopiera. Söker du fortfarande ingår allt i ${paketMedPris(SALD_PLAN)}, och du säger upp när du vill.`
          ),
        ctaLabel: 'Förläng min tillgång',
        ctaUrl: '/dashboard/profil/prenumeration',
      }),
    };
  },
};
