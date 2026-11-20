// src/lib/tester/v4/hamta.server.ts
// Serverläsaren för v4 (planen A4): hamtaTesterV4 (Hem och Tester) och
// hamtaUtvecklingV4 (Din utveckling). En parallell omgång: motorns status
// (matrisen, planen, märken, mönster, behörighet), nivåpunkterna för alla
// test_kind, sessionerna för alla typer (smala kolumner; answers bara de
// 30 senaste dagarna), summeringen (paketet) och kampanjen. Varje del faller
// för sig till tomt läge, aldrig en trasig sida.

import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { hamtaSummering } from '@/lib/dashboard/summaryForRequest';
import { kampanjForVisning } from '@/lib/kampanj/kampanj.server';
import { kampanjNu } from '@/lib/kampanj/kampanj';
import { GRUND_KVOT_TEST_TYPER, startOfTodayStockholm } from '@/lib/quota/quotaService';
import { dagSthlm, dagarMellan, type Dag } from '@/lib/traning/datum';
import { hamtaTraningsstatus, type Traningsstatus } from '@/lib/traning/motor.server';
import { deltesterForPlan, deltypSynlig, mittTestNamn, mittTestUrPlan } from '@/lib/traning/mittTest';
import { formatForPlan } from '@/lib/traning/tempo';
import { NIVAKOLL_BUDGET_S } from '@/lib/nivakoll/motor.server';
import familjerJson from '@/lib/logicTestV7/familjer.json';
import { hamtaMotordata } from '@/components/traning/utveckling/data.server';
import type { Familjestatistik } from '@/lib/traning/familjer';
import { foreslagetOvningsprov } from './bana';
import { dagsmalLage } from './dagsmal';
import { byggGratislage } from './gratis';
import { planensOvningsprovHref } from './hintar';
import { byggTesterV4, byggUtvecklingV4, type ModellIn, type TypUnderlag } from './modell';
import { svagasteMonster, tempoForSessioner, MONSTER_DAGAR } from './monster';
import { byggPunkter, klassa, PUNKT_TEST_TYPER, type NivapunktRad, type SessionRad } from './punkter';
import { NIVAKOLL_FINNS } from './rutter';
import { nivakollOmfang } from '@/lib/nivakoll/omfang';
import { nivaUrNivatest, steg2NivatestTyp } from './steg2-niva.server';
import { TEST_TYP_ORDNING, arTestTypId, type MonsterLage, type PlanV4, type TestTypId, type TesterV4Data, type UtvecklingV4Data } from './typer';

const KLASSISKA: Readonly<Record<TestTypId, readonly string[]>> = {
  matris: ['matrislogik', 'matrislogik-avancerad', 'matrislogik-expert'],
  figurserie: ['figurserier-grund', 'figurserier-avancerad', 'figurserier-expert'],
  deduktiv: ['deduktiv-grund', 'deduktiv-avancerad', 'deduktiv-expert'],
  verbal: ['verbal-resonemang', 'verbal-resonemang-v2', 'verbal-resonemang-expert'],
  numerisk: ['numerical-reasoning', 'numerical-reasoning-v2', 'numerical-reasoning-expert'],
  talserie: ['talserier-grund', 'talserier-avancerad', 'talserier-expert'],
  spatial: ['spatial-grund', 'spatial-avancerad', 'spatial-expert'],
  ordforrad: ['ordforrad-grund', 'ordforrad-avancerad', 'ordforrad-expert'],
};
const ALLA_KLASSISKA = Object.values(KLASSISKA).flat();

const NIVAKOLL_TYPER: Readonly<Record<string, TestTypId>> = {
  'matrislogik-matning': 'matris',
  'figurserie-nivakoll': 'figurserie',
  'deduktiv-nivakoll': 'deduktiv',
  'verbal-nivakoll': 'verbal',
  'numerisk-nivakoll': 'numerisk',
  'talserie-nivakoll': 'talserie',
  'spatial-nivakoll': 'spatial',
  'ordforrad-nivakoll': 'ordforrad',
};

const FAMILJ_NAMN = new Map<string, string>(
  (Array.isArray(familjerJson) ? familjerJson : Object.entries(familjerJson as Record<string, unknown>).map(([id, v]) => ({ id, ...(v as object) }))).map(
    (f: { id?: string; titel?: string; namn?: string }) => [String(f.id), String(f.titel ?? f.namn ?? f.id)]
  )
);

function familjNamn(typ: TestTypId, family: string): string {
  if (typ === 'matris') return FAMILJ_NAMN.get(family) ?? family;
  const t = family.replace(/[-_]+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

type Klient = ReturnType<typeof testSkrivKlient>;

async function sakert<T>(p: PromiseLike<T>, tom: T, vad: string): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error(`[tester-v4] ${vad}:`, e);
    return tom;
  }
}

async function lasNivapunkter(admin: Klient, userId: string): Promise<NivapunktRad[]> {
  const { data, error } = await admin.from('test_nivapunkter').select('test_kind, dag, typ, niva, session_id').eq('user_id', userId).order('dag', { ascending: true });
  if (error) throw error;
  return (data ?? []) as NivapunktRad[];
}

async function lasSessioner(admin: Klient, userId: string): Promise<SessionRad[]> {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, score, created_at, completed_at')
    .eq('user_id', userId)
    .in('test_type', [...PUNKT_TEST_TYPER, ...ALLA_KLASSISKA, ...GRUND_KVOT_TEST_TYPER])
    .order('created_at', { ascending: false })
    .limit(800);
  if (error) throw error;
  return (data ?? []) as SessionRad[];
}

async function lasSvar(admin: Klient, userId: string): Promise<SessionRad[]> {
  const fran = new Date(Date.now() - MONSTER_DAGAR * 86_400_000).toISOString();
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, answers, created_at, completed_at')
    .eq('user_id', userId)
    .in('test_type', PUNKT_TEST_TYPER as string[])
    .gte('created_at', fran)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as SessionRad[];
}

const STEG2_NIVATEST = [...KLASSISKA.talserie, ...KLASSISKA.spatial, ...KLASSISKA.ordforrad];

/** Nivåtesten i talserier, spatial och ordförråd med svaren, för nivån ur nivåtestet (A7). */
async function lasSteg2Nivatest(admin: Klient, userId: string): Promise<SessionRad[]> {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, score, answers, created_at, completed_at')
    .eq('user_id', userId)
    .in('test_type', STEG2_NIVATEST)
    .not('completed_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as SessionRad[];
}

async function lasPersonlighet(admin: Klient, userId: string): Promise<boolean> {
  const { data, error } = await admin.from('personality_test_sessions').select('id').eq('user_id', userId).not('completed_at', 'is', null).limit(1);
  if (error) throw error;
  return (data ?? []).length > 0;
}

/** PlanV4 ur motorns plan. Null utan plan eller med bara personlighet. */
export function planV4(status: Traningsstatus | null, idag: Dag): PlanV4 | null {
  const p = status?.plan;
  if (!p) return null;
  const val = mittTestUrPlan(p);
  if (!val) return null;
  const typer = (deltesterForPlan(p) ?? []).filter(arTestTypId);
  if (typer.length === 0) return null;
  const namn = mittTestNamn(val, p.mitt_test_variant ?? p.variant);
  const f = formatForPlan(p.leverantor, p.variant);
  const format =
    val === 'iprov'
      ? 'Provet har tre delar i fast ordning med egen tid per del.'
      : f.namn
        ? `Provet har ${f.cirka ? 'cirka ' : ''}${f.antal} uppgifter på ${f.minuter} minuter.`
        : null;
  const provdatum = p.provdatum ?? null;
  const href = planensOvningsprovHref({ mittTest: val, typer });
  const dm = typeof p.dagsmal === 'number' && p.dagsmal >= 1 && p.dagsmal <= 3 ? (p.dagsmal as 1 | 2 | 3) : null;
  return {
    mittTest: val,
    namn,
    typer,
    provdatum,
    dagarKvar: provdatum ? dagarMellan(idag, provdatum) : null,
    planStart: status?.planStart ?? idag,
    dagsmal: dm,
    format,
    ovningsprov: href
      ? {
          namn: `Övningsprov ${val === 'iprov' ? 'I-provet' : namn}`,
          meta: val === 'iprov' ? 'I provets ordning, med provets tid' : `${f.antal} uppgifter på ${f.minuter} minuter`,
          href,
          foreslagenDag: foreslagetOvningsprov(provdatum, idag),
        }
      : null,
    // test_planer.kalla (20261120100000): skapad ur en artikel och ännu utan datum.
    franArtikel: p.kalla === 'artikel' && !provdatum,
  };
}

/** Antal uppgifter i en påbörjad Nivåkoll per typ (plan-testflode beslut 7): ur omfånget, matrisens tolv som reserv. */
const nivakollAntal = (typ: TestTypId): number => nivakollOmfang(typ)?.uppgifter ?? 12;

/** Underlaget för modellen ur databasen. Delas av Hem, Tester och Din utveckling inom en rendering. */
export const hamtaUnderlagV4 = cache(async (userId: string): Promise<{ modell: ModellIn; valdeTester: boolean; status: Traningsstatus | null }> => {
  const supabase = createServerClient({ cookies: await cookies() });
  const admin = testSkrivKlient();
  const idag = dagSthlm();

  const [status, nivapunkter, sessioner, svarsrader, summering, personlighet, kampanj, steg2Test] = await Promise.all([
    sakert(hamtaTraningsstatus({ supabase: supabase as never, admin, userId, idag }), null, 'status'),
    sakert(lasNivapunkter(admin, userId), [] as NivapunktRad[], 'nivåpunkter'),
    sakert(lasSessioner(admin, userId), [] as SessionRad[], 'sessioner'),
    sakert(lasSvar(admin, userId), [] as SessionRad[], 'svar'),
    sakert(hamtaSummering(userId), null, 'summering'),
    sakert(lasPersonlighet(admin, userId), false, 'personlighet'),
    sakert(kampanjForVisning(userId, kampanjNu()), { kampanj: null, behorig: null }, 'kampanj'),
    sakert(lasSteg2Nivatest(admin, userId), [] as SessionRad[], 'steg2-nivåtest'),
  ]);

  const beh = status?.behorighet ?? { harOvanGrund: false, harProvlage: false, harHistorik: false };
  const premium = beh.harOvanGrund;
  const plan = planV4(status, idag);
  const medSvar = new Map(steg2Test.map((r) => [r.id, r]));
  const punkter = byggPunkter({
    nivapunkter,
    sessioner,
    nivatest: (s) => {
      const k = steg2NivatestTyp(s.test_type);
      return k ? { typ: k.typ, niva: nivaUrNivatest(medSvar.get(s.id) ?? s), zon: k.niva } : null;
    },
  });
  const slutforda = sessioner.filter((s) => s.completed_at);

  const typer = {} as Record<TestTypId, TypUnderlag>;
  for (const typ of TEST_TYP_ORDNING) {
    const egna = punkter.filter((p) => p.typ === typ);
    const svar = svarsrader.filter((s) => klassa(s.test_type)?.typ === typ);
    const oppen = svarsrader.find((s) => !s.completed_at && NIVAKOLL_TYPER[s.test_type] === typ);
    const besvarade = oppen && Array.isArray(oppen.answers) ? oppen.answers.length : 0;
    const svag =
      typ === 'matris'
        ? (() => {
            const f = status?.varDuTappar.svagaste.find((x) => x.antal >= 6 && x.andel < 0.6);
            return f ? { family: f.family, namn: familjNamn('matris', f.family), ratt: f.ratt, antal: f.antal } : null;
          })()
        : svagasteMonster(svar.filter((s) => s.completed_at), (f) => familjNamn(typ, f));
    const budget =
      typ === 'matris' ? status?.format.budget_s ?? null : typ === 'figurserie' || typ === 'deduktiv' || typ === 'verbal' || typ === 'numerisk' ? NIVAKOLL_BUDGET_S[typ] : null;
    const antalKoll = nivakollAntal(typ);
    typer[typ] = {
      punkter: egna,
      paborjad: besvarade > 0 && besvarade < antalKoll ? { besvarade, antal: antalKoll } : null,
      svagaste: svag,
      monster: svag ? [svag] : [],
      tempo: budget ? tempoForSessioner(svar.filter((s) => s.completed_at), budget) : null,
      synlig: deltypSynlig(typ),
      provad: egna.length > 0 || slutforda.some((s) => KLASSISKA[typ].includes(s.test_type)),
      nivakollFinns: NIVAKOLL_FINNS[typ],
    };
  }

  const sedan = startOfTodayStockholm().toISOString();
  const grundIdag = slutforda.filter((s) => GRUND_KVOT_TEST_TYPER.includes(s.test_type) && s.completed_at! >= sedan).length;
  const nivakollGjord: Partial<Record<TestTypId, boolean>> = {};
  for (const s of slutforda) {
    const t = NIVAKOLL_TYPER[s.test_type];
    if (t) nivakollGjord[t] = true;
  }

  const behorig = kampanj.kampanj && kampanj.behorig ? kampanj.kampanj : null;
  const gratis = byggGratislage({ premium, harHistorik: premium || beh.harHistorik, grundIdag, nivakollGjord, kampanj: behorig });

  const paket = summering?.paket;
  const intent = summering?.komIgang?.intent ?? null;

  return {
    status,
    valdeTester: intent === 'tester' || intent === 'intervju',
    modell: {
      idag,
      plan,
      typer,
      gratis,
      dagsmal: dagsmalLage({ mal: plan?.dagsmal ?? null, slutforda: slutforda.map((s) => s.completed_at!), idag, provdatum: plan?.provdatum ?? null }),
      aktivaDagar: [...new Set(slutforda.map((s) => dagSthlm(s.completed_at!)))],
      personlighet: { gjord: personlighet },
      paket: { scope: (paket?.scope as string | null) ?? null, track: (paket?.track as string | null) ?? null, planKey: (paket?.planKey as string | null) ?? null },
      // Fylls av hamtaUtvecklingV4 ur motordatan; Hem och Tester behöver dem inte.
      matrisMonster: null,
    },
  };
});

/** Matrisens mönster i fyra lägen ur familjestatistiken (alla familjer med minst ett svar). */
export function matrisMonsterUr(familjer: readonly Familjestatistik[]): NonNullable<UtvecklingV4Data['matrisMonster']> {
  const per = new Map(familjer.map((f) => [f.family, f]));
  const ut: NonNullable<UtvecklingV4Data['matrisMonster']> = [];
  for (const [family, namn] of FAMILJ_NAMN) {
    const f = per.get(family);
    let lage: MonsterLage = 'omott';
    if (f) {
      const saker = f.antal >= 6 && f.ratt >= 5 && f.andel >= 0.6;
      lage = saker ? (f.ratt_men_langsamma <= 1 ? 'snabb' : 'saker') : 'mott';
    }
    ut.push({ namn, family, lage, ...(f ? { ratt: f.ratt, antal: f.antal } : {}), href: `/dashboard/tester/pass?typ=riktat&family=${encodeURIComponent(family)}` });
  }
  return ut;
}

/** Hem och Tester. */
export async function hamtaTesterV4(userId: string): Promise<TesterV4Data> {
  const { modell } = await hamtaUnderlagV4(userId);
  return byggTesterV4(modell);
}

/** Din utveckling. */
export async function hamtaUtvecklingV4(userId: string): Promise<UtvecklingV4Data> {
  const [{ modell }, motor] = await Promise.all([
    hamtaUnderlagV4(userId),
    sakert(hamtaMotordata(testSkrivKlient(), userId), null, 'motordata'),
  ]);
  const familjer = motor?.familjer ?? null;
  return byggUtvecklingV4({ ...modell, matrisMonster: familjer && familjer.length ? matrisMonsterUr(familjer) : null });
}

/**
 * Ska Hem skicka vidare till ingången (Plan inför provet, ?forsta=1)? Bara
 * utan plan och utan något resultat, även ett grundnivåtest, och bara för den
 * som valde tester eller intervju vid registreringen. Delas av Hems sida och
 * dashboard-layouten, som gör omdirigeringen innan svaret börjar strömma.
 */
export function ingangForst(underlag: Awaited<ReturnType<typeof hamtaUnderlagV4>>, data: TesterV4Data): boolean {
  const s = underlag.status;
  const harResultat = underlag.modell.aktivaDagar.length > 0 || data.typer.some((t) => t.niva.status === 'matt');
  return !!s && !s.plan && s.niva == null && s.aktivitet.matningar === 0 && !harResultat && underlag.valdeTester;
}

/** Samma beslut ur databasen, för dashboard-layouten. */
export async function skaTillIngangen(userId: string): Promise<boolean> {
  const underlag = await hamtaUnderlagV4(userId);
  return ingangForst(underlag, byggTesterV4(underlag.modell));
}

/** För Hems redirect till ingången: registreringens val tester eller intervju. */
export async function valdeTesterV4(userId: string): Promise<boolean> {
  return (await hamtaUnderlagV4(userId)).valdeTester;
}

