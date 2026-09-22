// src/lib/email/lifecycle/templates/campaign-gratisniva.ts
// Engångskampanj före deploy av spärrarna A1-A3 (plan D4, sista punkten).
//
// Schemaläggs ALDRIG automatiskt. Den enda vägen in är admin-routen
// /api/admin/email/campaign-gratisniva, som lägger in raderna i
// email_schedule så runnern skickar dem i sin vanliga takt.

import type { LifecycleEmail } from '../types';
import { renderLayout, heading, paragraph, list, firstName } from './layout';
import { hasPremiumNow, swedishDate } from './helpers';

export const GRATISNIVA_EMAIL_TYPE = 'campaign_gratisniva_andras';

export const gratisnivaAndras: LifecycleEmail = {
  type: GRATISNIVA_EMAIL_TYPE,
  // Den som hunnit bli premium mellan schemaläggning och utskick ska inte få
  // ett mail om gratisnivåns gränser.
  shouldSend: async (ctx) => !hasPremiumNow(ctx.profile),
  render: (ctx) => {
    // Datumet sätts av admin-routen när kampanjen schemaläggs.
    const changeDate = swedishDate(
      typeof ctx.metadata.changeDate === 'string' ? ctx.metadata.changeDate : null
    );
    const when = changeDate ? `den ${changeDate}` : 'inom kort';
    const name = firstName(ctx.profile.full_name);

    const subject = `Vi ändrar gratisnivån ${when}`;
    const preheader = 'Det här ändras, och det här ligger kvar som det är.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: GRATISNIVA_EMAIL_TYPE,
        userId: ctx.userId,
        preheader,
        body:
          heading('Vi ändrar gratisnivån') +
          paragraph(`${name ? `Hej ${name},` : 'Hej,'} du har ett konto hos oss, så du ska höra det här från oss först.`) +
          paragraph(
            `${when.charAt(0).toUpperCase()}${when.slice(1)} ändrar vi vad som ingår gratis. Kort sagt: du kan fortfarande prova varje verktyg, men uttaget, alltså den färdiga filen och djupet, ligger i paketen.`
          ) +
          paragraph('Det här ändras:'),
        note:
          list([
            'CV-mallar: tre fria mallar, resten förhandsvisas i full storlek',
            'CV-analys: en analys per konto, med poängen, antalet fynd och det tyngsta fyndet i klartext',
            'Personliga brev: ett brev per konto, sedan ett i veckan. Nedladdningen ingår i CV-veckan',
            'Rekryteringstester: grundnivån i varje testtyp, en gång per dygn',
            'Jobbcoachen: tio meddelanden per konto',
          ]) +
          '<p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#9A3412;">Allt du redan skapat ligger kvar och går att läsa och kopiera som vanligt.</p>',
        ctaLabel: 'Se vad som gäller',
        ctaUrl: '/priser',
        footNote:
          'Söker du jobb intensivt just nu väljer du spåret du söker på: CV-veckan eller Testveckan för 79 kr i veckan, Allt-veckan för 99. Du säger upp i ditt konto.',
      }),
    };
  },
};
