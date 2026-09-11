// src/lib/email/lifecycle/templates/winback.ts
// Win-back efter 14 och 30 dagars inaktivitet (plan D4).

import type { LifecycleEmail } from '../types';
import { renderLayout, heading, paragraph, escapeHtml, firstName } from './layout';
import { withUtm } from '../schedule';
import { hasPremiumNow, latestDocumentName } from './helpers';

/** Inloggad efter att mailet schemalades? Då är win-backen inte längre sann. */
function activeSince(lastActive: string | null, days: number): boolean {
  if (!lastActive) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(lastActive).getTime() > cutoff;
}

export const winback14: LifecycleEmail = {
  type: 'winback_14',
  shouldSend: async (ctx) => !activeSince(ctx.profile.last_active, 14),
  render: async (ctx) => {
    const doc = await latestDocumentName(ctx);
    const name = firstName(ctx.profile.full_name);
    const subject = 'Ditt CV ligger kvar där du lämnade det';
    const preheader = 'Ett klick så är du tillbaka i det.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'winback_14',
        userId: ctx.userId,
        preheader,
        body:
          heading('Det ligger kvar där du lämnade det') +
          paragraph(`${name ? `Hej ${name},` : 'Hej,'} vi har inte sett dig på ett par veckor.`) +
          paragraph(
            doc
              ? `Ditt senaste dokument, ${escapeHtml(doc)}, ligger kvar tillsammans med allt annat du skapat. Du behöver inte börja om.`
              : 'Allt du skapat ligger kvar. Du behöver inte börja om.'
          ),
        ctaLabel: 'Fortsätt där du slutade',
        ctaUrl: '/dashboard',
      }),
    };
  },
};

export const winback30: LifecycleEmail = {
  type: 'winback_30',
  shouldSend: async (ctx) =>
    !activeSince(ctx.profile.last_active, 30) && !hasPremiumNow(ctx.profile),
  render: (ctx) => {
    const name = firstName(ctx.profile.full_name);
    const subject = 'Fick du jobbet?';
    const preheader = 'Svara med ett klick, så anpassar vi vad vi skickar.';
    const button = (href: string, label: string, primary: boolean) =>
      `<td style="padding-right:10px;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0">
           <tr>
             <td style="background-color:${primary ? '#EA580C' : '#FFFFFF'};border:1px solid ${primary ? '#EA580C' : '#E2E8F0'};border-radius:8px;">
               <a href="${withUtm(href, 'winback_30')}" target="_blank" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:${primary ? '#ffffff' : '#0F172A'};text-decoration:none;">${label}</a>
             </td>
           </tr>
         </table>
       </td>`;

    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'winback_30',
        userId: ctx.userId,
        preheader,
        body:
          heading('Fick du jobbet?') +
          paragraph(`${name ? `Hej ${name},` : 'Hej,'} det var ett tag sedan. Vi är nyfikna på hur det gick.`) +
          paragraph(
            'Svara med ett klick så vet vi vad vi ska skicka dig i fortsättningen. Fick du jobbet slutar vi tjata om ansökningar.'
          ) +
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
             <tr>
               ${button('/feedback/fick-jobbet?a=ja', 'Ja, jag fick jobb', true)}
               ${button('/feedback/fick-jobbet?a=nej', 'Nej, söker fortfarande', false)}
             </tr>
           </table>`,
      }),
    };
  },
};
