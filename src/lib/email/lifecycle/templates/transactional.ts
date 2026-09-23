// src/lib/email/lifecycle/templates/transactional.ts
// Betalning och uppsägning (plan D4). Transaktionella: de rör pengar och
// kontostatus, och ignorerar därför opt-out. Undantaget är snävt, allt
// säljande ligger i de vanliga mailen.

import { paketMedPris } from '@/lib/plans/plans';
import type { LifecycleEmail } from '../types';
import { renderLayout, heading, paragraph, firstName } from './layout';

function greet(fullName: string | null): string {
  const name = firstName(fullName);
  return name ? `Hej ${name},` : 'Hej,';
}

export const paymentFailed: LifecycleEmail = {
  type: 'payment_failed',
  transactional: true,
  shouldSend: async () => true,
  render: (ctx) => {
    const subject = 'Betalningen gick inte igenom';
    const preheader = 'Uppdatera kortet så fortsätter allt som vanligt.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'payment_failed',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading('Betalningen gick inte igenom') +
          paragraph(`${greet(ctx.profile.full_name)} vi fick inte igenom den senaste betalningen.`) +
          paragraph(
            'Oftast är det ett kort som gått ut eller en spärr från banken. Uppdaterar du kortuppgifterna fortsätter allt som vanligt, och du behöver inte göra något mer.'
          ),
        ctaLabel: 'Uppdatera kortuppgifter',
        ctaUrl: '/dashboard/profil/prenumeration',
      }),
    };
  },
};

export const cancelImmediate: LifecycleEmail = {
  type: 'cancel_immediate',
  transactional: true,
  shouldSend: async () => true,
  render: (ctx) => {
    const subject = 'Din prenumeration är avslutad';
    const preheader = 'Allt du skapat ligger kvar på kontot.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'cancel_immediate',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading('Din prenumeration är avslutad') +
          paragraph(`${greet(ctx.profile.full_name)} det är klart. Inget mer dras.`) +
          paragraph(
            'Dina personliga brev, CV:n och testresultat ligger kvar och går att läsa och kopiera. Kontot fungerar på gratisnivån: tre CV-mallar, ett personligt brev i veckan och grundnivån i varje testtyp.'
          ) +
          paragraph(
            `Skulle du behöva oss igen under en intensiv period väljer du paketet som passar: ${paketMedPris('cv_week')}, ${paketMedPris('test_week')} eller ${paketMedPris('all_week')}. Du säger upp i ditt konto.`
          ),
        ctaLabel: 'Till min översikt',
        ctaUrl: '/dashboard',
      }),
    };
  },
};

export const cancelFollowup: LifecycleEmail = {
  type: 'cancel_followup',
  // Inte transaktionellt: det här är ett erbjudande. Avbryts om personen
  // redan kommit tillbaka.
  shouldSend: async (ctx) => !['active', 'trialing'].includes(ctx.profile.subscription_status ?? ''),
  render: (ctx) => {
    const subject = 'Om det var priset';
    const preheader = '49 kr i månaden i två månader, om du vill prova igen.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'cancel_followup',
        userId: ctx.userId,
        preheader,
        body:
          heading('Om det var priset som avgjorde') +
          paragraph(`${greet(ctx.profile.full_name)} du sa upp din prenumeration för några dagar sedan.`) +
          paragraph(
            'Var det priset kan vi möta dig halvvägs: 49 kr i månaden i två månader, sedan ordinarie 149 kr. Var det något annat som saknades får du gärna svara på det här mailet och berätta vad.'
          ),
        ctaLabel: 'Kom tillbaka för 49 kr',
        ctaUrl: '/dashboard/profil/prenumeration?erbjudande=retention',
        footNote: 'Erbjudandet gäller en gång per konto.',
      }),
    };
  },
};
