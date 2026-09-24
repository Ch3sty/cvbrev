// src/lib/email/lifecycle/templates/vecka.ts
//
// Uppsägningskvittot (M16) och kvittomejlet (K18 till K24). Dagsmejlen
// cv_day1 till test_day7 och förnyelsepåminnelsen föll med veckoprogrammet
// (docs/design/spec-onboarding-2026-09-22.html): hjälpredans mejl i
// komigang.ts tar över, ett om dagen om nästa bricka och ett dagen före
// förnyelsen.

import type { LifecycleEmail, LifecycleContext } from '../types';
import { renderLayout, heading, paragraph, firstName } from './layout';
import { PLAN_BY_KEY, isPlanKey, paketNamnUrMetadata } from '@/lib/plans/plans';

function greet(ctx: LifecycleContext): string {
  const name = firstName(ctx.profile.full_name);
  return name ? `Hej ${name},` : 'Hej,';
}

/**
 * M16, uppsagt. Ett kvitto, inget annat. Aldrig ett återköpserbjudande, en
 * rabatt eller en fråga om varför: ett försök att vinna tillbaka kunden i
 * just det här mejlet är det som gör uppsägningar till klagomål.
 */
export const uppsagtGallerUt: LifecycleEmail = {
  type: 'canceled_until_sunday',
  transactional: true,
  shouldSend: async () => true,
  render: (ctx) => {
    // Namnet ur planKey, eller ett gammalt planName översatt till det nya.
    const paket = paketNamnUrMetadata(ctx.metadata);
    const slut = (ctx.metadata?.periodEnd as string) || '';
    const slutText = slut
      ? new Intl.DateTimeFormat('sv-SE', {
          day: 'numeric',
          month: 'long',
          timeZone: 'Europe/Stockholm',
        }).format(new Date(slut))
      : 'söndag';
    const subject = 'Uppsagt. Veckan gäller till söndag.';
    const preheader = 'Inget mer dras. Allt du skapat finns kvar att läsa och kopiera.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'canceled_until_sunday',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading('Uppsagt, och veckan gäller ut') +
          paragraph(
            `${greet(ctx)} din uppsägning är registrerad och inget mer kommer att dras. ${paket} gäller till och med ${slutText}, så använd dagarna du betalat för. Därefter går kontot till gratisnivån. Allt du skapat finns kvar att läsa och kopiera, och du kan börja igen när du vill.`
          ),
        ctaLabel: 'Använd dagarna som är kvar',
        ctaUrl: '/dashboard',
      }),
    };
  },
};

/**
 * Kvittomejlet (K18 till K24). Ämnesraden ska gå att söka fram i inkorgen ett
 * halvår senare, därför paketnamnet plus beloppet.
 */
export const kvittoMejl: LifecycleEmail = {
  type: 'receipt',
  transactional: true,
  shouldSend: async () => true,
  render: (ctx) => {
    const paket = paketNamnUrMetadata(ctx.metadata);
    const belopp = Number(ctx.metadata?.amount ?? 79) || 79;
    const start = (ctx.metadata?.periodStart as string) || '';
    const slut = (ctx.metadata?.periodEnd as string) || '';
    const fmt = (iso: string) =>
      iso
        ? new Intl.DateTimeFormat('sv-SE', {
            day: 'numeric',
            month: 'long',
            timeZone: 'Europe/Stockholm',
          }).format(new Date(iso))
        : '';
    const subject = `Kvitto: ${paket}, ${belopp} kr`;
    const preheader = `Perioden ${fmt(start)} till ${fmt(slut)}.`;

    // Förnyelsen följer paketets längd. Dagspasset förnyas inte alls.
    const planKey = isPlanKey(ctx.metadata?.planKey) ? ctx.metadata.planKey : null;
    const langd = planKey ? PLAN_BY_KEY[planKey].length : 'vecka';
    const engangs = langd === 'dag';
    const fornyelse =
      langd === 'månad'
        ? 'varje månad på samma datum'
        : langd === 'kvartal'
          ? 'var tredje månad på samma datum'
          : 'var sjunde dag';
    const brodtext = engangs
      ? `Här är kvittot på ${belopp} kr för ${paket}. Det gäller ${fmt(start)} till ${fmt(slut)} och förnyas inte, inget mer dras.`
      : `Här är kvittot på ${belopp} kr för ${paket}. Perioden gäller ${fmt(start)} till ${fmt(slut)} och dras sedan ${fornyelse} med samma belopp tills du säger upp. Uppsägning görs i ditt konto under Prenumeration och tar ett klick.`;

    const rader = [
      `Belopp: ${belopp} kr inklusive moms`,
      `Paket: ${paket}`,
      `Period: ${fmt(start)} till ${fmt(slut)}`,
      ...(engangs ? [] : [`Nästa dragning: ${fmt(slut)}`]),
    ];

    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'receipt',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading(`Kvitto för ${paket}`) +
          paragraph(brodtext) +
          rader
            .map(
              (rad) =>
                `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#475569;">${rad}</p>`
            )
            .join(''),
        ctaLabel: engangs ? 'Till Mitt jobbsök' : 'Säg upp',
        ctaUrl: engangs ? '/dashboard' : '/dashboard/profil/prenumeration',
      }),
    };
  },
};
