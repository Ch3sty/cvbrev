// src/lib/email/lifecycle/templates/campaign-gratisniva.ts
// Engångskampanj före deploy av spärrarna A1-A3 (plan D4, sista punkten).
//
// Schemaläggs ALDRIG automatiskt. Den enda vägen in är admin-routen
// /api/admin/email/campaign-gratisniva, som lägger in raderna i
// email_schedule så runnern skickar dem i sin vanliga takt.

import { SALD_PLAN, paketKort, paketMedPris } from '@/lib/plans/plans';
import type { LifecycleEmail } from '../types';
import { GRATIS_BREVFONSTER, GRATIS_TESTRAD } from '@/lib/plans/gratis-copy';
import { FREE_TEMPLATE_COUNT, talSomOrd } from '@/lib/cv/template-antal';
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
            `${when.charAt(0).toUpperCase()}${when.slice(1)} ändrar vi vad som ingår gratis. Kort sagt: du kan fortfarande prova varje verktyg. Det personliga brevet som fil, alla mallar och de högre testnivåerna ingår i ${paketKort()}.`
          ) +
          paragraph('Det här ändras:'),
        note:
          list([
            `CV-mallar: ${talSomOrd(FREE_TEMPLATE_COUNT)} fria mallar och en nedladdning, resten förhandsvisas i full storlek`,
            'CV-analys: läsbarhetspoängen och genomgången i sju delar, för varje CV',
            `Personliga brev: ett personligt brev ${GRATIS_BREVFONSTER}, och de två senaste går att ändra. Nedladdningen ingår i ${paketKort()}`,
            `Rekryteringstester: ${GRATIS_TESTRAD.charAt(0).toLowerCase()}${GRATIS_TESTRAD.slice(1)}`,
            'Jobbcoachen: tio meddelanden per konto',
          ]) +
          '<p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#9A3412;">Allt du redan skapat ligger kvar och går att läsa och kopiera som vanligt.</p>',
        ctaLabel: 'Se vad som gäller',
        ctaUrl: '/priser',
        footNote:
          `Söker du jobb intensivt just nu ingår allt i ${paketMedPris(SALD_PLAN)}. Du säger upp i ditt konto.`,
      }),
    };
  },
};
