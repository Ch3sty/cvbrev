// src/lib/email/lifecycle/templates/vecka.ts
//
// Uppsägningskvittot (M16) och kvittomejlet (K18 till K24). Dagsmejlen
// cv_day1 till test_day7 och förnyelsepåminnelsen föll med veckoprogrammet
// (docs/design/spec-onboarding-2026-09-22.html): hjälpredans mejl i
// komigang.ts tar över, ett om dagen om nästa bricka och ett dagen före
// förnyelsen.
//
// Texterna följer docs/design/copy-premium-2026-10-11.md avsnitt 3: fulla
// namnet "Jobbcoach Premium" i ämne och rubrik, kortformen i brödtexten.
// Belopp, datum och period läses ur planen och prenumerationen. Befintliga
// vecko- och kvartalskunder får samma texter med sin egen längd ("Jobbcoach
// Premium, en vecka") via paketMedLangd.

import type { LifecycleEmail, LifecycleContext } from '../types';
import { renderLayout, heading, paragraph, firstName } from './layout';
import {
  PLAN_BY_KEY,
  SALD_PLAN,
  isPlanKey,
  paketKort,
  paketMedLangd,
  paketNamn,
  planKeyFranGammaltNamn,
  type PlanKey,
} from '@/lib/plans/plans';

function greet(ctx: LifecycleContext): string {
  const name = firstName(ctx.profile.full_name);
  return name ? `Hej ${name},` : 'Hej,';
}

/** Datum som "11 november", i svensk tid. Tomt om datumet saknas. */
function datum(iso: string): string {
  return iso
    ? new Intl.DateTimeFormat('sv-SE', {
        day: 'numeric',
        month: 'long',
        timeZone: 'Europe/Stockholm',
      }).format(new Date(iso))
    : '';
}

/**
 * Planen ur mejlets metadata: planKey vinner, annars ett gammalt planName
 * ("Hela paketet", "Allt-veckan") översatt. Null om ingen av dem finns.
 */
function planUrMetadata(meta: Record<string, unknown> | null | undefined): PlanKey | null {
  if (isPlanKey(meta?.planKey)) return meta.planKey;
  return planKeyFranGammaltNamn(typeof meta?.planName === 'string' ? meta.planName : null);
}

/**
 * Namnet i ämne och rubrik: "Jobbcoach Premium" utan längd, eller ett osålt
 * pakets namn för den som fortfarande har det. Ett okänt planName står kvar
 * som det står hellre än att gissa.
 */
function namnUrMetadata(meta: Record<string, unknown> | null | undefined, plan: PlanKey | null): string {
  if (plan) return paketNamn(plan);
  const namn = typeof meta?.planName === 'string' ? meta.planName.trim() : '';
  return namn || paketNamn(SALD_PLAN);
}

/** Kortformen i brödtexten för Premium; ett osålt paket heter vid sitt namn. */
function brodNamn(plan: PlanKey | null, namn: string): string {
  if (!plan) return namn;
  return PLAN_BY_KEY[plan].scope === 'allt' ? paketKort() : namn;
}

/** Ångerrättsraden sist på kvittot (copy-premium avsnitt 3). */
export const ANGERRATT_RAD =
  'Du valde att starta direkt, så ångerrätten på fjorton dagar gäller inte. Säg upp när du vill, då dras inget mer.';

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
    const plan = planUrMetadata(ctx.metadata);
    const namn = namnUrMetadata(ctx.metadata, plan);
    const slutText = datum((ctx.metadata?.periodEnd as string) || '');
    const subject = slutText
      ? `Uppsagt. ${namn} gäller till ${slutText}.`
      : `Uppsagt. ${namn} gäller perioden ut.`;
    const preheader = 'Inget mer dras. Allt du skapat finns kvar att läsa och kopiera.';
    const tillOchMed = slutText ? `till och med ${slutText}` : 'perioden ut';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'canceled_until_sunday',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading('Uppsagt, och perioden gäller ut') +
          paragraph(
            `${greet(ctx)} din uppsägning är registrerad och inget mer kommer att dras. ${brodNamn(plan, namn)} gäller ${tillOchMed}, så använd dagarna du betalat för. Därefter går kontot till gratisnivån. Allt du skapat finns kvar att läsa och kopiera, och du kan börja igen när du vill.`
          ),
        ctaLabel: 'Använd dagarna som är kvar',
        ctaUrl: '/dashboard',
      }),
    };
  },
};

/**
 * Kvittomejlet (K18 till K24). Ämnesraden ska gå att söka fram i inkorgen ett
 * halvår senare, därför namnet plus beloppet: "Kvitto: Jobbcoach Premium,
 * 149 kr". Längden står på raden Prenumeration.
 */
export const kvittoMejl: LifecycleEmail = {
  type: 'receipt',
  transactional: true,
  shouldSend: async () => true,
  render: (ctx) => {
    const plan = planUrMetadata(ctx.metadata);
    const namn = namnUrMetadata(ctx.metadata, plan);
    const medLangd = plan ? paketMedLangd(plan) : namn;
    const reservBelopp = PLAN_BY_KEY[plan ?? SALD_PLAN].amount;
    const belopp = Number(ctx.metadata?.amount ?? reservBelopp) || reservBelopp;
    const start = datum((ctx.metadata?.periodStart as string) || '');
    const slut = datum((ctx.metadata?.periodEnd as string) || '');
    const subject = `Kvitto: ${namn}, ${belopp} kr`;
    const preheader = `Perioden ${start} till ${slut}.`;

    // Förnyelsen följer planens längd. Dagspasset förnyas inte alls.
    const langd = PLAN_BY_KEY[plan ?? SALD_PLAN].length;
    const engangs = langd === 'dag';
    const fornyelse =
      langd === 'månad'
        ? 'varje månad på samma datum'
        : langd === 'kvartal'
          ? 'var tredje månad på samma datum'
          : 'var sjunde dag';
    const brodtext = engangs
      ? `Här är kvittot på ${belopp} kr för ${namn}. Det gäller ${start} till ${slut} och förnyas inte, inget mer dras.`
      : `Här är kvittot på ${belopp} kr för ${namn}. Perioden gäller ${start} till ${slut} och dras sedan ${fornyelse}, tills du säger upp. Det gör du i ditt konto under Prenumeration.`;

    const rader = engangs
      ? [
          `Belopp: ${belopp} kr inklusive moms`,
          `Köp: ${medLangd}`,
          `Period: ${start} till ${slut}`,
          'Du valde att starta direkt, så ångerrätten på fjorton dagar gäller inte.',
        ]
      : [
          `Belopp: ${belopp} kr inklusive moms`,
          `Prenumeration: ${medLangd}`,
          `Period: ${start} till ${slut}`,
          `Nästa dragning: ${slut}`,
          ANGERRATT_RAD,
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
          heading(`Kvitto för ${namn}`) +
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
