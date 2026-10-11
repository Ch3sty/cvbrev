// src/lib/email/lifecycle/templates/traning.ts
// =============================================================================
// Träningsmejlen (riktlinjer tester v2, "Ägarbeslut 2026-10-11 kväll").
// Högst två per användare, alla med avregistrering. Urvalet görs av
// scheduleTraningsmejl i runner.ts; shouldSend räknar om läget vid sändning.
//
//   pass_dag2_<dag>          dagens pass, nivån som ett tal, på vald tidpunkt
//   dagen_fore_provet_<dag>  övningsprovet i leverantörens format, 08:00
//   vecka_utan_datum_<dag>   en vecka sedan Nivåkollen, kolla igen, datum?
//
// Tidpunkten på dagen går till Resend som scheduledAt via skickaVid. Passet
// kan göras mellan morgonkörningen och den valda tiden: då avbryter
// avbrytSchemalagtPassmejl (traningsmejl.ts) mejlet hos Resend.
// =============================================================================

import type { LifecycleContext, LifecycleEmail } from '../types';
import { renderLayout, heading, paragraph, firstName, escapeHtml } from './layout';
import { withUtm } from '../schedule';
import {
  DAGEN_FORE_KLOCKA,
  DAGEN_FORE_PROVET_TYPE,
  PASS_DAG2_TYPE,
  PASS_TID_KLOCKA,
  VECKA_UTAN_DATUM_TYPE,
  lasNivakollar,
  lasPlaner,
  lasSkickade,
  mejlDag,
  passGjortDag,
  rymsTill,
  stockholmKlockslag,
  type Traningsmejl,
  type Traningsplan,
} from '../traningsmejl';
import { dagensTemaFor } from '../traningsmejl-tema';
import { dagSthlm, laggTill } from '@/lib/traning/datum';
import { familjNamn } from '@/lib/logicTestV7/familjer';
import { antalTid, formatTitel, ovningsformat, type Ovningsformat, type Provtyp } from '@/lib/ovningsprov/format';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature, type Feature } from '@/lib/access/features';
import { SALD_PLAN, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans';
import { kopstegHref } from '@/lib/onboarding/steps';

export { PASS_DAG2_TYPE, DAGEN_FORE_PROVET_TYPE, VECKA_UTAN_DATUM_TYPE };

/** Temat när banken inte ger något (samma ord som passvyn). */
const BLANDAT = 'Blandade mönster';

/** Passets form, ordagrant ur riktlinjerna 4.2. */
export const PASS_FORM = 'Nio uppgifter, cirka tio minuter.';

export const LANK = {
  pass: '/dashboard/tester/pass?typ=pass',
  hem: '/dashboard/tester',
  nivakoll: '/dashboard/tester/pass?typ=matning',
  datum: '/dashboard/tester/installningar?steg=3',
} as const;

export function ovningsprovLank(typ: Provtyp): string {
  return `/dashboard/tester/ovningsprov/${typ}`;
}

function hej(ctx: LifecycleContext): string {
  const namn = firstName(ctx.profile.full_name);
  return namn ? `Hej ${namn}.` : 'Hej.';
}

/** Nivån med en decimal och komma: 5,4. */
export function nivaText(n: number): string {
  return n.toFixed(1).replace('.', ',');
}

async function har(ctx: LifecycleContext, feature: Feature): Promise<boolean> {
  try {
    return scopeHasFeature(await getUserScope(ctx.admin, ctx.userId), feature);
  } catch {
    return false;
  }
}

/** Ryms mejlet under taket (högst två, varje mall en gång)? */
async function ryms(ctx: LifecycleContext, typ: Traningsmejl): Promise<boolean> {
  const skickade = (await lasSkickade(ctx.admin, [ctx.userId])).get(ctx.userId) ?? [];
  return rymsTill(skickade, typ);
}

async function plan(ctx: LifecycleContext): Promise<Traningsplan | null> {
  return (await lasPlaner(ctx.admin, [ctx.userId])).get(ctx.userId) ?? null;
}

async function nivakollen(ctx: LifecycleContext) {
  return (await lasNivakollar(ctx.admin, [ctx.userId])).get(ctx.userId) ?? null;
}

/** En sekundär länk i brödtexten, i accentfärgen. */
function textLank(label: string, url: string, typ: string): string {
  return `<a href="${withUtm(url, typ)}" target="_blank" style="color:#EA580C;font-weight:600;text-decoration:underline;">${escapeHtml(label)}</a>`;
}

/* --------------------------------------------------------------- pass_dag2 */

export const passDag2Mejl: LifecycleEmail = {
  type: PASS_DAG2_TYPE,
  shouldSend: async (ctx) => {
    const dag = mejlDag(ctx.metadata);
    // En rad som misslyckades i går och försöks igen i dag gäller fel dag.
    if (dag !== dagSthlm()) return false;
    if (!(await ryms(ctx, PASS_DAG2_TYPE))) return false;
    const p = await plan(ctx);
    // Skiss 5: den som inte väljer tidpunkt får ingen påminnelse.
    if (!p?.passTid) return false;
    const koll = await nivakollen(ctx);
    if (koll?.forsta !== laggTill(dag, -1)) return false;
    // Tyst om dagens pass redan är gjort.
    return !(await passGjortDag(ctx.admin, ctx.userId, dag));
  },
  render: async (ctx) => {
    const dag = mejlDag(ctx.metadata);
    const [p, koll, premium, temaId] = await Promise.all([
      plan(ctx),
      nivakollen(ctx),
      har(ctx, 'tests_above_base'),
      dagensTemaFor(ctx.admin, ctx.userId, dag),
    ]);
    const tema = familjNamn(temaId) ?? BLANDAT;
    const passTid = p?.passTid ?? (ctx.metadata?.pass_tid as keyof typeof PASS_TID_KLOCKA | undefined) ?? 'morgon';
    const klocka = PASS_TID_KLOCKA[passTid] ?? PASS_TID_KLOCKA.morgon;

    const subject = `Dagens pass: ${tema}`;
    const preheader = PASS_FORM;

    const stycken = [paragraph(`${hej(ctx)} Dagens tema: ${escapeHtml(tema)}. ${PASS_FORM}`)];
    const niva = koll?.niva ?? null;
    if (premium) {
      stycken.push(paragraph(niva !== null ? `Din nivå är ${nivaText(niva)}. Passet utgår från den.` : 'Passet utgår från din nivå.'));
    } else {
      stycken.push(
        paragraph(`${niva !== null ? `Din nivå är ${nivaText(niva)}. ` : ''}Dagens pass ingår i ${paketKort()}.`)
      );
    }

    return {
      subject,
      preheader,
      skickaVid: stockholmKlockslag(dag, klocka).toISOString(),
      html: renderLayout({
        type: PASS_DAG2_TYPE,
        userId: ctx.userId,
        preheader,
        body: heading('Dagens pass') + stycken.join(''),
        ctaLabel: premium ? 'Starta passet' : 'Se dagens pass',
        ctaUrl: premium ? LANK.pass : LANK.hem,
      }),
    };
  },
};

/* ------------------------------------------------------- dagen_fore_provet */

/** Planens första kognitiva testtyp som övningsprovets testtyp; logik annars. */
export function provtypForPlan(testtyper: readonly string[] | null | undefined): Provtyp {
  for (const t of testtyper ?? []) {
    if (t === 'matris') return 'logik';
    if (t === 'verbal') return 'verbal';
    if (t === 'numerisk') return 'numerisk';
  }
  return 'logik';
}

/** Betalväggens budskap ur riktlinjerna 1.7, utan dagarna (provet är i morgon). */
export function betalvaggText(f: Ovningsformat): string {
  const format = f.namn ? `i samma format som ${f.namn}` : 'i vårt format';
  return `Övningsprovet ${format}, ${antalTid(f)}. Månaden täcker hela vägen.`;
}

export const dagenForeProvetMejl: LifecycleEmail = {
  type: DAGEN_FORE_PROVET_TYPE,
  shouldSend: async (ctx) => {
    const dag = mejlDag(ctx.metadata);
    // En rad som misslyckades i går och försöks igen i dag gäller fel dag.
    if (dag !== dagSthlm()) return false;
    if (!(await ryms(ctx, DAGEN_FORE_PROVET_TYPE))) return false;
    // Datumet ska fortfarande vara i morgon: flyttat eller borttaget, inget mejl.
    const p = await plan(ctx);
    return p?.provdatum === laggTill(dag, 1);
  },
  render: async (ctx) => {
    const dag = mejlDag(ctx.metadata);
    const [p, premium] = await Promise.all([plan(ctx), har(ctx, 'test_exam_mode')]);
    const typ = provtypForPlan(p?.testtyper);
    const f = ovningsformat(typ, p?.leverantor ?? null, p?.variant ?? null);

    const subject = 'Provet är i morgon. Gör övningsprovet i dag.';
    const preheader = `${formatTitel(f)}, ${antalTid(f)}.`;
    const forsta = paragraph(`${hej(ctx)} Gör övningsprovet i dag, så vet du hur klockan känns innan det gäller.`);

    const body = premium
      ? forsta + paragraph(escapeHtml(`${formatTitel(f)}: ${antalTid(f)}. Sitt ostört, provet lämnas in när tiden är ute.`))
      : forsta + paragraph(escapeHtml(betalvaggText(f)));

    return {
      subject,
      preheader,
      skickaVid: stockholmKlockslag(dag, DAGEN_FORE_KLOCKA).toISOString(),
      html: renderLayout({
        type: DAGEN_FORE_PROVET_TYPE,
        userId: ctx.userId,
        preheader,
        body: heading('Provet är i morgon') + body,
        ctaLabel: premium ? 'Starta övningsprovet' : `Köp ${paketNamn(SALD_PLAN)}, ${prisPeriod(SALD_PLAN)}`,
        ctaUrl: premium ? ovningsprovLank(typ) : kopstegHref(SALD_PLAN, 'mejl_dagen_fore_provet'),
      }),
    };
  },
};

/* -------------------------------------------------------- vecka_utan_datum */

/** Ägarbeslutets text, ordagrant. */
export const VECKA_KARNA = 'En vecka sedan din nivåkoll. Kolla igen och se om du har klättrat.';
export const VECKA_DATUMFRAGA = 'Har du fått ett datum för testet?';

export const veckaUtanDatumMejl: LifecycleEmail = {
  type: VECKA_UTAN_DATUM_TYPE,
  shouldSend: async (ctx) => {
    const dag = mejlDag(ctx.metadata);
    // En rad som misslyckades i går och försöks igen i dag gäller fel dag.
    if (dag !== dagSthlm()) return false;
    if (!(await ryms(ctx, VECKA_UTAN_DATUM_TYPE))) return false;
    const [p, koll] = await Promise.all([plan(ctx), nivakollen(ctx)]);
    // Datum inlagt: dagen_fore_provet tar över.
    if (p?.provdatum) return false;
    if (!koll || koll.forsta !== laggTill(dag, -7)) return false;
    // Tyst om en ny nivåkoll redan är gjord.
    return !koll.fler;
  },
  render: async (ctx) => {
    const [koll, premium] = await Promise.all([nivakollen(ctx), har(ctx, 'tests_above_base')]);
    const niva = koll?.niva ?? null;
    const subject = 'En vecka sedan din nivåkoll. Har du klättrat?';
    const preheader = 'Ny nivåkoll, åtta minuter. Och har du fått ett datum?';

    const forsta = `${hej(ctx)} ${VECKA_KARNA}${niva !== null ? ` Förra gången landade du på ${nivaText(niva)}.` : ''}${
      premium ? '' : ` Ny nivåkoll ingår i ${paketKort()}.`
    }`;
    const andra = `${VECKA_DATUMFRAGA} Lägg in det, så räknar vi ner till provdagen.`;

    return {
      subject,
      preheader,
      html: renderLayout({
        type: VECKA_UTAN_DATUM_TYPE,
        userId: ctx.userId,
        preheader,
        body: heading('Ny nivåkoll') + paragraph(forsta),
        ctaLabel: 'Kolla igen, 8 min',
        ctaUrl: LANK.nivakoll,
        // Den andra länken under knappen: datumet.
        note: paragraph(andra) + `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;">${textLank('Lägg in datumet', LANK.datum, VECKA_UTAN_DATUM_TYPE)}</p>`,
      }),
    };
  },
};
