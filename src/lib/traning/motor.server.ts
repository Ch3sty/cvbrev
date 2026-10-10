// src/lib/traning/motor.server.ts
// =============================================================================
// Testmotorn på servern: skapar, dömer och avslutar träningssessioner
// (mätning, ommätning, pass, riktat pass, generalrepetition) och läser läget
// för hemvyn och kurvan. Rutterna under /api/traning är tunna lager ovanpå.
//
// Regler som gäller allt här:
// - Servern dömer. Klienten får frågorna i sessionens blandade ordning, utan
//   facit (visaFraga). Rätt svar visas först efter svaret i pass och riktade
//   pass, och i mätning och generalrepetition först i genomgången efter
//   avslutet.
// - Samma blandning som övriga tester: blanda.ts seedat på sessionId +
//   frågans id, svaren lagras som originalindex (selected) och visat index.
// - Alla skrivningar med service role (skrivspärren 20261010211000 och
//   20261011101000_testmotorn). Varje läsning och skrivning villkoras på
//   user_id.
// - Nivåpunkter och frågestatistik bara för blandade sessioner (12.5).
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { arBlandad, BLANDAD_META } from '@/lib/logicTestV7/blanda';
import { bedomSvar, rattaMatrisSvar } from '@/lib/logicTestV7/fragor.server';
import { genomgaFraga, visaFraga } from '@/lib/logicTestV7/visning';
import type { GenomgangsFraga, VisadFraga } from '@/lib/logicTestV7/layered.v7';
import { sparaTestsvar, unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { questionsForToken } from '@/lib/tests/anon-session';
import { bankVersion } from '@/lib/logicTestV7/selectQuestions.v7';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature, type Feature } from '@/lib/access/features';
import { captureServer } from '@/lib/analytics/server';
import {
  arValbarTraningsfraga,
  bankInfo,
  hittaTraningsfraga,
  misstagFor,
  familjFor,
  type TraningsFraga,
} from './bank.server';
import { arGiltigDag, dagarMellan, dagSthlm, type Dag } from './datum';
import { varDuTappar, type Familjestatistik, type FamiljSvar } from './familjer';
import { beraknaForm, type Form } from './form';
import { GRATISNIVA } from './gratisniva';
import {
  aktivaDagar,
  antalMatningar,
  forraPasset,
  lasSvar,
  lasTraningsmeta,
  passIdag,
  raknaAktivitet,
  seddaFragor,
  slutfordaSessioner,
  type SessionRad,
  type SlutfordRad,
  type Smakprov,
  type SparatSvar,
  type TraningsMeta,
} from './historik';
import { imorgonRad, nastaForPass, type Imorgon } from './imorgon';
import {
  forstaMatningen,
  forstaVeckanSammanfattning,
  nyaMilstolpar,
  type MilstolpeNyckel,
  type Nivapunkt,
} from './milstolpar';
import { foreslaSikte, matningsNiva, passUppdatering, STARTNIVA_UTAN_MATNING, STEG_UPP, type NivaSvar } from './niva';
import {
  nastaAdaptivaFraga,
  valjGeneral,
  valjPass,
  valjPooler,
  valjRiktat,
  valjTema,
  type BankFragaInfo,
  type NastaFraga,
} from './passgenerator';
import { byggPlan, type PlanDag } from './plan';
import { raknaSerie, type Serie } from './serie';
import { fragaEfterProvet } from './testplan';
import type { FragaStatistik } from './svarighet';
import { formatForPlan, PROVFORMAT, raknaTempo, type Provformat, type Tempo } from './tempo';
import { beslutaTillgang, TEST_TYPE, TRANINGS_TEST_TYPER, type Begard, type TillgangBeslut } from './tillgang';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

/** Matrissessionernas test_type, för "sedda frågor". */
const MATRIS_TYPER = [
  'matrislogik',
  'matrislogik-avancerad',
  'matrislogik-expert',
  'matrislogik-prov',
  ...TRANINGS_TEST_TYPER,
];

/** Antal frågor per pass och mätning. */
export const PASS_ANTAL = 9;
export const MATNING_FRAGOR = 12;
/** Marginal för generalrepetitionens tidsgräns, som provläget. */
const TIDSMARGINAL_MS = 10_000;

/* --------------------------------- Läget --------------------------------- */

export interface Testplan {
  user_id: string;
  testtyper: string[];
  leverantor: string | null;
  variant: string | null;
  provdatum: Dag | null;
  sikte: number | null;
  utfall: string | null;
  utfall_svarat_at: string | null;
  utfall_fraga_igen_at: Dag | null;
}

export interface Lage {
  idag: Dag;
  plan: Testplan | null;
  punkter: (Nivapunkt & { skapad_at?: string })[];
  rader: SessionRad[];
  slutforda: SlutfordRad[];
  milstolpar: { nyckel: string; nadd_at: string; visad_at: string | null }[];
  statistik: Map<string, FragaStatistik>;
  bank: BankFragaInfo[];
}

function numeriskt(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

/** Läser allt motorn behöver om ett konto, i en parallell rundtur. */
export async function lasLage(admin: Klient, userId: string, idag: Dag = dagSthlm()): Promise<Lage> {
  const [planRes, punktRes, sessRes, milRes, statRes] = await Promise.all([
    admin.from('test_planer').select('*').eq('user_id', userId).maybeSingle(),
    admin
      .from('test_nivapunkter')
      .select('dag, typ, niva, skapad_at')
      .eq('user_id', userId)
      .eq('test_kind', 'matris')
      .order('dag', { ascending: true })
      .order('skapad_at', { ascending: true }),
    admin
      .from('logic_test_v4_sessions')
      .select('id, test_type, meta, answers, created_at, completed_at')
      .eq('user_id', userId)
      .in('test_type', MATRIS_TYPER)
      .order('created_at', { ascending: false })
      .limit(400),
    admin.from('test_milstolpar').select('nyckel, nadd_at, visad_at').eq('user_id', userId),
    admin.from('fraga_statistik').select('fraga_id, antal, ratt').eq('test_kind', 'matris'),
  ]);
  for (const r of [planRes, punktRes, sessRes, milRes, statRes]) {
    if (r.error) throw r.error;
  }

  const planRad = planRes.data as Record<string, unknown> | null;
  const plan: Testplan | null = planRad
    ? {
        user_id: userId,
        testtyper: Array.isArray(planRad.testtyper) ? (planRad.testtyper as string[]) : [],
        leverantor: (planRad.leverantor as string | null) ?? null,
        variant: (planRad.variant as string | null) ?? null,
        provdatum: arGiltigDag(planRad.provdatum) ? planRad.provdatum : null,
        sikte: numeriskt(planRad.sikte),
        utfall: (planRad.utfall as string | null) ?? null,
        utfall_svarat_at: (planRad.utfall_svarat_at as string | null) ?? null,
        utfall_fraga_igen_at: arGiltigDag(planRad.utfall_fraga_igen_at) ? planRad.utfall_fraga_igen_at : null,
      }
    : null;

  const punkter = iTidsordning(((punktRes.data ?? []) as Record<string, unknown>[])
    .map((p) => ({
      dag: String(p.dag),
      typ: p.typ as Nivapunkt['typ'],
      niva: numeriskt(p.niva) ?? 0,
      skapad_at: p.skapad_at as string | undefined,
    }))
    .filter((p) => arGiltigDag(p.dag) && p.niva > 0));

  const statistik = new Map<string, FragaStatistik>();
  for (const s of (statRes.data ?? []) as { fraga_id: string; antal: number; ratt: number }[]) {
    statistik.set(s.fraga_id, { antal: s.antal, ratt: s.ratt });
  }

  const rader = (sessRes.data ?? []) as SessionRad[];
  return {
    idag,
    plan,
    punkter,
    rader,
    slutforda: slutfordaSessioner(rader),
    milstolpar: (milRes.data ?? []) as Lage['milstolpar'],
    statistik,
    bank: bankInfo(statistik),
  };
}

/** Punkterna i tidsordning: dag, sedan när de skrevs. */
export function iTidsordning<T extends Nivapunkt & { skapad_at?: string }>(punkter: readonly T[]): T[] {
  return [...punkter].sort(
    (a, b) =>
      (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0) ||
      (a.skapad_at && b.skapad_at ? new Date(a.skapad_at).getTime() - new Date(b.skapad_at).getTime() : 0)
  );
}

/** Senaste nivån (senaste punkten), eller null utan mätning. */
export function senasteNiva(punkter: readonly (Nivapunkt & { skapad_at?: string })[]): number | null {
  const sorterade = iTidsordning(punkter);
  return sorterade.length ? sorterade[sorterade.length - 1].niva : null;
}

export interface Behorighet {
  harOvanGrund: boolean;
  harProvlage: boolean;
  harHistorik: boolean;
}

/** En läsning av scopet ger alla tre featurerna. */
export async function lasBehorighet(supabase: Klient, userId: string): Promise<Behorighet> {
  const scope = await getUserScope(supabase, userId);
  const har = (f: Feature) => scopeHasFeature(scope, f);
  return {
    harOvanGrund: har('tests_above_base'),
    harProvlage: har('test_exam_mode'),
    harHistorik: har('test_history'),
  };
}

/* ------------------------------ Klientvyerna ------------------------------ */

export interface BesvaradFraga {
  q_id: string;
  /** Det hon valde, som visat index. Null för "Vet inte" och när tiden tog slut. */
  valdVisat: number | null;
  vetInte: boolean;
  /** Uppgiftens tid tog slut (generalrepetition med tid per uppgift). */
  tidenUte: boolean;
  tid_s: number;
}

/** Återkopplingen efter ett svar i pass och riktat pass (P2/P3). */
export interface Aterkoppling {
  correct: boolean;
  vetInte: boolean;
  /** Var rätt svar står, visat index. */
  rattVisat: number;
  /** Regeln ur banken. */
  regel: string;
  /** Vad det valda alternativet "stämde på" (misstag[] på originalindex). Null när fältet saknas. */
  misstag: string | null;
  tid_s: number;
}

export interface Sessionsvy {
  id: string;
  typ: TraningsMeta['typ'];
  variant: TraningsMeta['variant'];
  /** Antal frågor i sessionen, smakprovets inräknade (mätningen: 12). */
  antal: number;
  /**
   * Antal frågor ur smakprovet som räknas in (spec 14.5). Hon svarar på
   * antal − smakprov nya frågor: "fråga 1 av 7, fem räknas från smakprovet".
   */
  smakprov: number;
  adaptiv: boolean;
  tema: string | null;
  family: string | null;
  format: TraningsMeta['format'];
  budget_s: number;
  tidsgrans_s: number | null;
  niva_fore: number | null;
  startad: string;
  avslutad: boolean;
  /** Fasta sessioner: alla frågor. Adaptiva: de besvarade plus den aktuella. */
  fragor: VisadFraga[];
  /** Index i `fragor` för frågan som är på tur, null när alla är besvarade. */
  aktuell: number | null;
  besvarade: BesvaradFraga[];
  /** Pass och riktat pass: återkopplingen per besvarad fråga. */
  aterkoppling: Record<string, Aterkoppling> | null;
  /** Efter avslutet: genomgången med rätt svar. */
  genomgang: (Omit<GenomgangsFraga, 'family'> & { misstag: string | null; family: string | null })[] | null;
}

function visarAterkopplingUnderTiden(typ: TraningsMeta['typ']): boolean {
  return typ === 'pass' || typ === 'riktat';
}

function aterkopplingFor(q: TraningsFraga, sessionId: string, blandade: boolean, s: SparatSvar): Aterkoppling {
  const g = genomgaFraga(q, sessionId, blandade);
  return {
    correct: s.correct,
    vetInte: !!s.vet_inte,
    rattVisat: g.rattVisat,
    regel: q.rule,
    misstag: s.selected >= 0 && !s.correct ? misstagFor(q, s.selected) : null,
    tid_s: s.time_spent,
  };
}

/**
 * Svaren det adaptiva urvalet spelar upp: smakprovets först (bara den
 * första mätningen, spec 14.5), sedan sessionens egna.
 */
function adaptivaSvar(meta: TraningsMeta, svar: readonly SparatSvar[]): { q_id: string; correct: boolean }[] {
  return [...(meta.smakprov?.svar ?? []), ...svar.map((s) => ({ q_id: s.q_id, correct: s.correct }))];
}

/**
 * Frågorna i sessionens ordning: fasta ur meta, adaptiva ur svaren plus
 * nästa. Smakprovets frågor räknas in i urvalet men visas inte.
 */
function sessionensFragor(meta: TraningsMeta, svar: readonly SparatSvar[]): { ids: string[]; nasta: NastaFraga | null } {
  if (meta.adaptiv && meta.pooler) {
    const nasta = nastaAdaptivaFraga(meta.pooler, adaptivaSvar(meta, svar), meta.antal);
    return { ids: [...svar.map((s) => s.q_id), ...(nasta ? [nasta.id] : [])], nasta };
  }
  return { ids: meta.fragor ?? [], nasta: null };
}

export function sessionsvy(rad: SessionRad & { started_at?: string | null }): Sessionsvy | null {
  const meta = lasTraningsmeta(rad.meta);
  if (!meta) return null;
  const blandade = arBlandad(rad.meta);
  const svar = unikaSvar(lasSvar(rad.answers), SVARSNYCKLAR.matris);
  const besvarade = new Map(svar.map((s) => [s.q_id, s]));
  const { ids } = sessionensFragor(meta, svar);
  const fragor = ids.map((id) => hittaTraningsfraga(id)).filter((q): q is TraningsFraga => !!q);
  const avslutad = !!rad.completed_at;
  const forstaObesvarade = fragor.findIndex((q) => !besvarade.has(q.id));

  let aterkoppling: Record<string, Aterkoppling> | null = null;
  if (visarAterkopplingUnderTiden(meta.typ) || avslutad) {
    aterkoppling = {};
    for (const q of fragor) {
      const s = besvarade.get(q.id);
      if (s) aterkoppling[q.id] = aterkopplingFor(q, rad.id, blandade, s);
    }
  }

  return {
    id: rad.id,
    typ: meta.typ,
    variant: meta.variant,
    antal: meta.antal,
    smakprov: meta.smakprov?.svar.length ?? 0,
    adaptiv: meta.adaptiv,
    tema: meta.tema,
    family: meta.family,
    format: meta.format,
    budget_s: meta.budget_s,
    tidsgrans_s: meta.tidsgrans_s,
    niva_fore: meta.niva_fore,
    startad: rad.started_at ?? rad.created_at,
    avslutad,
    fragor: fragor.map((q) => visaFraga(q, rad.id, blandade)),
    aktuell: avslutad || forstaObesvarade < 0 ? null : forstaObesvarade,
    besvarade: svar.map((s) => ({
      q_id: s.q_id,
      valdVisat: s.vet_inte || s.tiden_ute ? null : s.visat,
      vetInte: !!s.vet_inte,
      tidenUte: !!s.tiden_ute,
      tid_s: s.time_spent,
    })),
    aterkoppling,
    genomgang: avslutad
      ? fragor.map((q) => {
          const s = besvarade.get(q.id);
          return {
            ...genomgaFraga(q, rad.id, blandade),
            family: familjFor(q),
            misstag: s && s.selected >= 0 && !s.correct ? misstagFor(q, s.selected) : null,
          };
        })
      : null,
  };
}

/* -------------------------------- Smakprovet ------------------------------- */

/** Smakprov äldre än så räknas inte in i mätningen. */
export const SMAKPROV_MAX_DAGAR = 30;
/** Färre giltiga svar än så: smakprovet ignoreras. */
export const SMAKPROV_MINST = 3;

/**
 * Smakprovets svar som räknas in i den första mätningen (spec 14.5), ur en
 * anon_test_sessions-rad. Bara blandade prov (svaren är originalindex) inom
 * 30 dagar; obesvarade (−1) och frågor som inte finns i träningsbanken
 * (pensionerade) hoppas över. Färre än tre giltiga svar ger null.
 */
export function tolkaSmakprov(
  rad: { token: string; answers: unknown; meta?: unknown; created_at?: string | null },
  idag: Dag
): Smakprov | null {
  if (!arBlandad(rad.meta) || !Array.isArray(rad.answers) || !rad.created_at) return null;
  const dag = dagSthlm(rad.created_at);
  if (dagarMellan(dag, idag) > SMAKPROV_MAX_DAGAR) return null;
  const fragor = questionsForToken(rad.token, bankVersion(rad.meta));
  const svar: Smakprov['svar'] = [];
  fragor.forEach((q, i) => {
    const orig = (rad.answers as unknown[])[i];
    if (typeof orig !== 'number' || !Number.isInteger(orig) || orig < 0) return;
    if (!arValbarTraningsfraga(q.id)) return;
    svar.push({ q_id: q.id, correct: orig === q.correctAnswer });
  });
  return svar.length >= SMAKPROV_MINST ? { token: rad.token, dag, svar } : null;
}

/** Senaste hämtade smakprovet med svar inom 30 dagar, tolkat. */
async function lasSmakprov(admin: Klient, userId: string, idag: Dag): Promise<Smakprov | null> {
  const fran = new Date(Date.now() - (SMAKPROV_MAX_DAGAR + 1) * 86_400_000).toISOString();
  const { data, error } = await admin
    .from('anon_test_sessions')
    .select('*')
    .eq('claimed_by', userId)
    .not('answers', 'is', null)
    .gte('created_at', fran)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) {
    // Smakprovet är en genväg, aldrig ett krav: utan det blir mätningen tolv nya frågor.
    console.error('[traning] smakprovet gick inte att läsa', error);
    return null;
  }
  // Den senaste blandade raden (meta.alternativ_blandade), filtrerad här
  // eftersom villkoret ligger i jsonb.
  const rader = (data ?? []) as { token: string; answers: unknown; meta?: unknown; created_at?: string }[];
  const rad = rader.find((r) => arBlandad(r.meta));
  return rad ? tolkaSmakprov(rad, idag) : null;
}

/* ------------------------------ Skapa session ------------------------------ */

export type SkapaResultat =
  | { ok: true; vy: Sessionsvy }
  | { ok: false; status: 402 | 429 | 422 | 409; beslut?: TillgangBeslut; fel: string };

export async function skapaTraningssession(args: {
  supabase: Klient;
  admin: Klient;
  userId: string;
  begard: Begard;
  family?: string | null;
  /** Bara generalrepetition: format i stället för planens. */
  format?: Provformat | null;
  idag?: Dag;
}): Promise<SkapaResultat> {
  const idag = args.idag ?? dagSthlm();
  const [lage, beh] = await Promise.all([lasLage(args.admin, args.userId, idag), lasBehorighet(args.supabase, args.userId)]);

  const beslut = beslutaTillgang({
    begard: args.begard,
    harOvanGrund: beh.harOvanGrund,
    harProvlage: beh.harProvlage,
    matningarSlutforda: antalMatningar(lage.slutforda),
    passSlutfordaIdag: passIdag(lage.slutforda, idag),
    forstaTraningsdag: lage.slutforda[0]?.dag ?? null,
    idag,
  });
  if (!beslut.tillatet) {
    return { ok: false, status: beslut.skal === 'kvot' ? 429 : 402, beslut, fel: beslut.skal };
  }

  const niva = senasteNiva(lage.punkter);
  // Den första mätningen räknar in smakprovets svar (spec 14.5).
  const smakprov = beslut.typ === 'matning' ? await lasSmakprov(args.admin, args.userId, idag) : null;
  const sedda = [...seddaFragor(lage.rader), ...(smakprov?.svar ?? []).map((s) => ({ id: s.q_id, dag: smakprov!.dag }))];
  const format = args.format ?? formatForPlan(lage.plan?.leverantor, lage.plan?.variant);
  // Seeden för urvalet: konto + dag + antal sessioner, så två pass samma dag
  // skiljer sig och samma anrop två gånger (dubbelklick) inte gör det.
  const seed = `${args.userId}:${idag}:${lage.rader.length}:${beslut.typ}`;

  const bas = {
    ...BLANDAD_META,
    traning: 1 as const,
    typ: beslut.typ,
    test_kind: 'matris' as const,
    variant: beslut.variant,
    dag: idag,
    format: format.nyckel,
    budget_s: format.budget_s,
    tidsgrans_s: null as number | null,
    niva_fore: niva,
    family: null as string | null,
    ateranvanda: 0,
    upprepade: [] as string[],
  };

  let meta: TraningsMeta;
  switch (beslut.typ) {
    case 'matning':
    case 'ommatning': {
      // Smakprovets frågor står aldrig i poolerna (de räknas redan in).
      const smakIds = new Set((smakprov?.svar ?? []).map((s) => s.q_id));
      const bank = smakIds.size ? lage.bank.filter((q) => !smakIds.has(q.id)) : lage.bank;
      const { pooler, upprepade } = valjPooler({ bank, sedda, idag, seed });
      meta = {
        ...bas,
        antal: MATNING_FRAGOR,
        adaptiv: true,
        pooler,
        upprepade,
        tema: null,
        sammansattning: null,
        malniva: null,
        ...(smakprov ? { smakprov } : {}),
      };
      break;
    }
    case 'pass': {
      const forra = forraPasset(lage.slutforda);
      const tema = valjTema({
        bank: lage.bank,
        sedda,
        idag,
        forra,
        svagaste: varDuTappar(familjeunderlag(lage)).svagaste.map((f) => f.family),
      });
      // "Samma familj, ett steg svårare": passet riktas STEG_UPP (0,5) upp när förra
      // passet lovade det och temat är detsamma.
      const upp = forra?.nasta === 'familj_upp' && tema && forra.tema === tema;
      const bas_niva = niva ?? STARTNIVA_UTAN_MATNING;
      const urval = valjPass({
        bank: lage.bank,
        niva: upp ? bas_niva + STEG_UPP : bas_niva,
        sedda,
        idag,
        seed,
        antal: PASS_ANTAL,
        tema,
        endastGrund: beslut.variant === 'grund',
      });
      if (urval.fragor.length === 0) return { ok: false, status: 422, fel: 'banken_tom' };
      meta = {
        ...bas,
        antal: urval.fragor.length,
        adaptiv: false,
        fragor: urval.fragor,
        tema: urval.tema,
        sammansattning: urval.sammansattning,
        malniva: urval.malniva,
        ateranvanda: urval.ateranvanda,
        upprepade: urval.upprepade,
      };
      break;
    }
    case 'riktat': {
      const family = (args.family ?? '').trim();
      if (!family) return { ok: false, status: 422, fel: 'familj_saknas' };
      const urval = valjRiktat({
        bank: lage.bank,
        family,
        niva: niva ?? STARTNIVA_UTAN_MATNING,
        sedda,
        idag,
        seed,
        antal: PASS_ANTAL,
      });
      if (urval.fragor.length === 0) return { ok: false, status: 422, fel: 'familj_for_liten' };
      meta = {
        ...bas,
        antal: urval.fragor.length,
        adaptiv: false,
        fragor: urval.fragor,
        tema: family,
        family,
        sammansattning: urval.sammansattning,
        malniva: urval.malniva,
        ateranvanda: urval.ateranvanda,
        upprepade: urval.upprepade,
      };
      break;
    }
    case 'general': {
      const tidsgrans_s = format.minuter * 60;
      if (format.adaptiv) {
        const { pooler, upprepade } = valjPooler({ bank: lage.bank, sedda, idag, seed, perBand: format.antal });
        const antal = Math.min(format.antal, pooler.latt.length + pooler.mellan.length + pooler.svar.length);
        meta = { ...bas, antal, adaptiv: true, pooler, upprepade, tidsgrans_s, tema: null, sammansattning: null, malniva: null };
      } else {
        const { fragor, upprepade } = valjGeneral({ bank: lage.bank, antal: format.antal, sedda, idag, seed });
        meta = { ...bas, antal: fragor.length, adaptiv: false, fragor, upprepade, tidsgrans_s, tema: null, sammansattning: null, malniva: null };
      }
      break;
    }
  }

  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: args.userId, test_type: TEST_TYPE[beslut.typ], answers: [], meta })
    .select('id, test_type, meta, answers, created_at, completed_at, started_at')
    .single();
  if (error || !data) throw error ?? new Error('session skapades inte');

  const vy = sessionsvy(data as SessionRad & { started_at?: string | null });
  if (!vy) throw new Error('sessionens meta gick inte att läsa');
  return { ok: true, vy };
}

/* --------------------------------- Svaret --------------------------------- */

export type SvarResultat =
  | {
      ok: true;
      /** Pass och riktat pass: rätt svar, regel och misstag. Mätning och generalrepetition: null. */
      aterkoppling: Aterkoppling | null;
      /** Adaptiva sessioner: nästa fråga, null när mätningen är klar. */
      nasta: VisadFraga | null;
      besvarade: number;
      antal: number;
      klar: boolean;
    }
  | { ok: false; status: 400 | 404 | 409 | 410; fel: string };

export async function hamtaSession(admin: Klient, userId: string, sessionId: string): Promise<(SessionRad & { started_at?: string | null }) | null> {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, answers, created_at, completed_at, started_at')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as (SessionRad & { started_at?: string | null }) | null) ?? null;
}

export async function svaraTraning(args: {
  admin: Klient;
  userId: string;
  sessionId: string;
  questionId: string;
  /** Visat index. Null tillsammans med vetInte eller tidenUte. */
  selectedIndex: unknown;
  vetInte?: boolean;
  /**
   * Uppgiftens tid tog slut (spec 14.4). Bara i generalrepetitioner vars
   * format har tid per uppgift (Alva). Räknas som fel.
   */
  tidenUte?: boolean;
  timeSpent: unknown;
}): Promise<SvarResultat> {
  const rad = await hamtaSession(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasTraningsmeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };

  if (meta.tidsgrans_s != null) {
    const start = new Date(rad.started_at ?? rad.created_at).getTime();
    if (Date.now() > start + meta.tidsgrans_s * 1000 + TIDSMARGINAL_MS) {
      return { ok: false, status: 410, fel: 'tiden_ute' };
    }
  }

  const svar = unikaSvar(lasSvar(rad.answers), SVARSNYCKLAR.matris);
  if (svar.some((s) => s.q_id === args.questionId)) return { ok: false, status: 409, fel: 'redan_besvarad' };

  const { ids, nasta } = sessionensFragor(meta, svar);
  if (meta.adaptiv) {
    if (!nasta || nasta.id !== args.questionId) return { ok: false, status: 400, fel: 'fel_fraga' };
  } else if (!ids.includes(args.questionId)) {
    return { ok: false, status: 400, fel: 'fel_fraga' };
  }

  const q = hittaTraningsfraga(args.questionId);
  if (!q) return { ok: false, status: 404, fel: 'fraga_saknas' };

  const blandade = arBlandad(rad.meta);
  const tid = typeof args.timeSpent === 'number' && Number.isFinite(args.timeSpent) && args.timeSpent > 0 ? Math.round(args.timeSpent) : 0;
  const vetInte = args.vetInte === true;

  let sparat: SparatSvar;
  if (args.tidenUte === true) {
    if (meta.typ !== 'general' || PROVFORMAT[meta.format]?.tidsform !== 'per_uppgift') {
      return { ok: false, status: 400, fel: 'tiden_ute_bara_per_uppgift' };
    }
    sparat = { q_id: q.id, selected: -1, visat: null, correct: false, tiden_ute: true, time_spent: tid };
  } else if (vetInte) {
    // "Vet inte, visa regeln": bara i pass, räknas som fel, tiden sparas.
    if (!visarAterkopplingUnderTiden(meta.typ)) return { ok: false, status: 400, fel: 'vet_inte_bara_i_pass' };
    sparat = { q_id: q.id, selected: -1, visat: null, correct: false, time_spent: tid, vet_inte: true };
  } else {
    const bedomt = bedomSvar(q, rad.id, blandade, args.selectedIndex);
    if (!bedomt) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
    sparat = { q_id: q.id, selected: bedomt.selected, visat: bedomt.visat, correct: bedomt.correct, time_spent: tid };
  }

  const antalSparade = await sparaTestsvar(args.admin, {
    userId: args.userId,
    tabell: 'logic_test_v4_sessions',
    sessionId: rad.id,
    nycklar: SVARSNYCKLAR.matris,
    svar: { ...sparat },
  });
  if (antalSparade === null) return { ok: false, status: 409, fel: 'avslutad' };

  const efter = [...svar, sparat];
  let nastaVisad: VisadFraga | null = null;
  if (meta.adaptiv && meta.pooler) {
    const n = nastaAdaptivaFraga(meta.pooler, adaptivaSvar(meta, efter), meta.antal);
    const nq = n ? hittaTraningsfraga(n.id) : null;
    nastaVisad = nq ? visaFraga(nq, rad.id, blandade) : null;
  }
  const besvarade = efter.length;
  const klar = meta.adaptiv ? nastaVisad === null : besvarade >= meta.antal;

  return {
    ok: true,
    aterkoppling: visarAterkopplingUnderTiden(meta.typ) ? aterkopplingFor(q, rad.id, blandade, sparat) : null,
    nasta: nastaVisad,
    besvarade,
    antal: meta.antal,
    klar,
  };
}

/* -------------------------------- Avslutet -------------------------------- */

export interface Avslut {
  typ: TraningsMeta['typ'];
  niva_fore: number | null;
  niva_efter: number | null;
  ratt: number;
  antal: number;
  over_tid: number;
  snitt_s: number | null;
  budget_s: number;
  tempo: Tempo;
  familjer: {
    /** Passets egna familjer. */
    passet: Familjestatistik[];
    /** De två svagaste, ackumulerat. */
    svagaste: Familjestatistik[];
    /** Rätt men långsamma, ackumulerat. */
    langsamma: Familjestatistik[];
  };
  imorgon: Pick<Imorgon, 'typ' | 'text' | 'dag'>;
  /** Det första nya märket, för kvittot. */
  milstolpe?: MilstolpeNyckel;
  milstolpar: MilstolpeNyckel[];
  /** Föreslaget sikte efter den första mätningen. */
  sikte: number | null;
  /** Tid på sessionen, sekunder (summan av svarens tid). */
  tid_s: number;
}

/** Svaren i alla slutförda träningssessioner, för "Var du tappar" ackumulerat. */
function familjeunderlag(lage: Lage, extra: FamiljSvar[] = []): FamiljSvar[] {
  const ut: FamiljSvar[] = [...extra];
  for (const s of lage.slutforda) {
    const rad = lage.rader.find((r) => r.id === s.id);
    if (!rad) continue;
    for (const a of unikaSvar(lasSvar(rad.answers), SVARSNYCKLAR.matris)) {
      const q = hittaTraningsfraga(a.q_id);
      if (!q) continue;
      ut.push({ family: familjFor(q), correct: a.correct, langsam: a.correct && a.time_spent > s.meta.budget_s });
    }
  }
  return ut;
}

export type AvslutResultat = { ok: true; avslut: Avslut } | { ok: false; status: 404 | 409 | 400; fel: string };

export async function slutforTraning(args: {
  admin: Klient;
  userId: string;
  sessionId: string;
  idag?: Dag;
}): Promise<AvslutResultat> {
  const idag = args.idag ?? dagSthlm();
  const rad = await hamtaSession(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasTraningsmeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'redan_avslutad' };

  const svar = unikaSvar(lasSvar(rad.answers), SVARSNYCKLAR.matris);
  if (svar.length === 0) return { ok: false, status: 400, fel: 'inga_svar' };

  const lage = await lasLage(args.admin, args.userId, idag);
  const blandad = arBlandad(rad.meta);
  const perId = new Map(lage.bank.map((q) => [q.id, q]));

  // Frågor hon sett inom ATERANVAND_EFTER_DAGAR (30) före sessionens dag räknas inte mot nivån,
  // tempot, familjerna eller frågestatistiken (14.1 punkt 3). De räknas i
  // "rätt av antal" och visas i genomgången.
  const upprepade = new Set(meta.upprepade ?? []);
  const raknas = new Set(svar.map((s) => s.q_id).filter((id) => !upprepade.has(id)));

  const nivaSvar: (NivaSvar & { tid_s: number; prior: BankFragaInfo['prior']; family: string | null })[] = [];
  for (const s of svar) {
    if (!raknas.has(s.q_id)) continue;
    const info = perId.get(s.q_id);
    if (!info) continue;
    nivaSvar.push({ p: info.p, correct: s.correct, tid_s: s.time_spent, prior: info.prior, family: info.family });
  }

  // Smakprovets svar (bara den första mätningen, 14.5): med bankens p och
  // tid 0, i nivån och i "rätt av antal", aldrig i tempot eller i
  // frågestatistiken (de kommer från en anonym session).
  const smakprov = meta.typ === 'matning' ? (meta.smakprov?.svar ?? []) : [];
  const smakprovNiva: typeof nivaSvar = [];
  for (const s of smakprov) {
    const info = perId.get(s.q_id);
    if (!info) continue;
    smakprovNiva.push({ p: info.p, correct: s.correct, tid_s: 0, prior: info.prior, family: info.family });
  }
  nivaSvar.unshift(...smakprovNiva);

  const ratt = rattaMatrisSvar(svar.filter((s) => s.selected >= 0)) + smakprov.filter((s) => s.correct).length;
  const antal = svar.length + smakprov.length;
  const tid_s = svar.reduce((sum, s) => sum + s.time_spent, 0);

  // Nivån: bara för blandade sessioner (12.5). Pass utan mätning ger ingen
  // punkt: kurvan börjar med mätningen. Riktade pass flyttar aldrig nivån
  // (14.1 punkt 2): frågorna är valda ur en familj hon är svag i. Ommätningen
  // och generalrepetitionen väger hälften (14.1 punkt 1, matningsNiva).
  // Räknas inget svar ger en mätning ingen punkt (kan bara ske när banken är
  // slut), ett pass ger nivån före så att kurvan visar dagen.
  const fore = senasteNiva(lage.punkter);
  let niva_efter: number | null = null;
  if (blandad && meta.typ !== 'riktat') {
    if (meta.typ === 'matning' || meta.typ === 'ommatning') {
      if (nivaSvar.length > 0) niva_efter = matningsNiva(nivaSvar, meta.typ === 'ommatning' ? fore : null).niva;
    } else if (fore != null) {
      if (meta.typ === 'general') {
        niva_efter = nivaSvar.length > 0 ? matningsNiva(nivaSvar, fore).niva : null;
      } else {
        niva_efter = passUppdatering(fore, nivaSvar).niva;
      }
    }
  }

  // Tempot bara på svar med tid (smakprovets har tid 0). Indexen i
  // tempo.langsamma räknas om till nivaSvar.
  const medTid = nivaSvar.map((s, i) => ({ s, i })).filter(({ s }) => s.tid_s > 0);
  const tempoMedTid = raknaTempo(medTid.map(({ s }) => s), fore ?? niva_efter, meta.budget_s);
  const tempo: Tempo = { ...tempoMedTid, langsamma: tempoMedTid.langsamma.map((j) => medTid[j].i) };
  const langsammaIdx = new Set(tempo.langsamma);
  const dennaFamiljer: FamiljSvar[] = nivaSvar.map((s, i) => ({
    family: s.family,
    correct: s.correct,
    langsam: s.correct && (langsammaIdx.has(i) || s.tid_s > meta.budget_s),
  }));
  const passet = varDuTappar(dennaFamiljer).alla;
  const ackumulerat = varDuTappar(familjeunderlag(lage, dennaFamiljer));

  const punkttyp: Nivapunkt['typ'] =
    meta.typ === 'matning' ? 'matning' : meta.typ === 'ommatning' ? 'ommatning' : meta.typ === 'general' ? 'general' : 'pass';
  const nyPunkt: Nivapunkt | null = niva_efter != null ? { dag: idag, typ: punkttyp, niva: niva_efter } : null;

  // Milstolparna räknas med den här sessionen och punkten inräknade.
  const punkterEfter = nyPunkt
    ? [...lage.punkter.filter((p) => !(p.dag === nyPunkt.dag && p.typ === nyPunkt.typ)), nyPunkt]
    : lage.punkter;
  const sessionerEfter = [...lage.slutforda, { dag: idag, typ: meta.typ }];
  const nya = nyaMilstolpar({
    sessioner: sessionerEfter,
    punkter: punkterEfter,
    provdatum: lage.plan?.provdatum ?? null,
    idag,
    redan: lage.milstolpar.map((m) => m.nyckel),
  });

  const start = forstaMatningen(punkterEfter)?.dag ?? null;
  const imorgon = imorgonRad({
    idag,
    start,
    prov: lage.plan?.provdatum ?? null,
    ratt,
    antal,
    grundpass: meta.variant === 'grund',
  });
  const nasta = meta.typ === 'pass' || meta.typ === 'riktat' ? nastaForPass(ratt, antal) : null;

  const statistik = blandad
    ? svar
        .filter((s) => raknas.has(s.q_id))
        .map((s) => ({ fraga_id: s.q_id, test_kind: 'matris', correct: s.correct, tid_s: s.time_spent, selected: s.selected }))
    : null;

  const { data, error } = await args.admin.rpc('slutfor_traningssession', {
    p_session: rad.id,
    p_user: args.userId,
    p_score: ratt,
    p_time_spent: tid_s,
    p_meta: {
      niva_efter,
      ratt,
      over_tid: tempo.over_tid,
      snitt_s: tempo.snitt_s,
      nasta,
    },
    p_nivapunkt: nyPunkt && blandad ? { test_kind: 'matris', ...nyPunkt } : null,
    p_statistik: statistik,
    p_milstolpar: nya,
  });
  if (error) throw error;
  const res = (data ?? {}) as { slutford?: boolean; nya_milstolpar?: string[] };
  if (!res.slutford) return { ok: false, status: 409, fel: 'redan_avslutad' };
  const nyaMil = (res.nya_milstolpar ?? []).filter((k): k is MilstolpeNyckel => nya.includes(k as MilstolpeNyckel));
  const milOrdnade = nya.filter((k) => nyaMil.includes(k));

  // Siktet efter den första mätningen, bara när planen finns och saknar sikte.
  // (Ingen plan = ingången är inte gjord; då skapas ingen rad här.)
  let sikte = lage.plan?.sikte ?? null;
  if (meta.typ === 'matning' && niva_efter != null) {
    const dagarKvar = lage.plan?.provdatum ? Math.max(0, dagarMellan(idag, lage.plan.provdatum)) : null;
    const forslag = foreslaSikte(niva_efter, dagarKvar);
    if (lage.plan && lage.plan.sikte == null) {
      const upd = await args.admin
        .from('test_planer')
        .update({ sikte: forslag, uppdaterad_at: new Date().toISOString() })
        .eq('user_id', args.userId)
        .is('sikte', null);
      if (!upd.error) sikte = forslag;
    } else if (!lage.plan) {
      sikte = forslag;
    }
  }

  // Händelser, aldrig väntade på.
  const familjNamn = ackumulerat.svagaste.map((f) => f.family);
  if (meta.typ === 'matning' && niva_efter != null) {
    void captureServer('nivamatning_klar', args.userId, {
      niva: niva_efter,
      over_tid: tempo.over_tid,
      familjer: familjNamn,
      tid_s,
      // 14.1 punkt 6 och 14.5: antal frågor ur smakprovet som räknades in.
      smakprov: smakprovNiva.length,
    });
  } else if (meta.typ === 'ommatning' && niva_efter != null) {
    void captureServer('ommatning_klar', args.userId, { niva: niva_efter, delta: fore != null ? Math.round((niva_efter - fore) * 10) / 10 : 0 });
  } else if (meta.typ === 'pass' || meta.typ === 'riktat') {
    void captureServer('pass_klart', args.userId, {
      typ: meta.typ,
      variant: meta.variant,
      niva_fore: fore,
      niva_efter,
      ratt,
      antal,
      over_tid: tempo.over_tid,
      tid_s,
      // 14.1 punkt 6: hur ofta trappan går ner och hur mycket som räknades.
      ateranvanda: meta.ateranvanda ?? 0,
      // Riktade pass räknas aldrig mot nivån (14.1 punkt 2).
      raknade: meta.typ === 'riktat' ? 0 : nivaSvar.length,
    });
  } else if (meta.typ === 'general') {
    void captureServer('generalrepetition_klar', args.userId, { format: meta.format, ratt, antal });
  }
  for (const nyckel of milOrdnade) void captureServer('milstolpe_nadd', args.userId, { nyckel });

  return {
    ok: true,
    avslut: {
      typ: meta.typ,
      niva_fore: fore,
      niva_efter,
      ratt,
      antal,
      over_tid: tempo.over_tid,
      snitt_s: tempo.snitt_s,
      budget_s: meta.budget_s,
      tempo,
      familjer: { passet, svagaste: ackumulerat.svagaste, langsamma: ackumulerat.langsamma },
      imorgon: { typ: imorgon.typ, text: imorgon.text, dag: imorgon.dag },
      ...(milOrdnade[0] ? { milstolpe: milOrdnade[0] } : {}),
      milstolpar: milOrdnade,
      sikte,
      tid_s,
    },
  };
}

/* --------------------------------- Status --------------------------------- */

export interface Traningsstatus {
  idag: Dag;
  plan: Testplan | null;
  format: Pick<
    Provformat,
    'nyckel' | 'namn' | 'antal' | 'minuter' | 'budget_s' | 'adaptiv' | 'cirka' | 'tidsform' | 'anmarkning'
  >;
  niva: number | null;
  /** Kurvans punkter. Utan historik (gratis): bara den senaste. */
  punkter: Nivapunkt[];
  historikLast: boolean;
  /** Senaste punkten är nyare än profiles.traning_sedd_at. */
  nyPunkt: boolean;
  plandagar: PlanDag[];
  serie: Serie;
  form: Form | null;
  aktivitet: ReturnType<typeof raknaAktivitet>;
  varDuTappar: { svagaste: Familjestatistik[]; langsamma: Familjestatistik[] };
  milstolpar: { nyckel: string; nadd_at: string; visad_at: string | null }[];
  /** Märken som nåtts men inte visats (kvitto K1). */
  ovisade: string[];
  dagensPassGjort: boolean;
  dagarKvar: number | null;
  /** Dag 1 till 7 efter mätningen, för kvittot K1. Satt när Första veckan nåtts (spec 14.3). */
  forstaVeckan: ReturnType<typeof forstaVeckanSammanfattning> | null;
  /**
   * Ska "Hur gick det?" stå på väggen i dag (spec 14.8)? Servern avgör med
   * samma regel som plan GET; UI:t håller inte reda på något.
   */
  fragaEfterProvet: boolean;
}

/**
 * Läget för hemvyn och kurvan. Registrerar märken som nås av datumet
 * (Första veckan efter en vilodag, Provdagen) och returnerar dem som ovisade.
 */
export async function hamtaTraningsstatus(args: {
  supabase: Klient;
  admin: Klient;
  userId: string;
  idag?: Dag;
  sedd_at?: string | null;
}): Promise<Traningsstatus> {
  const idag = args.idag ?? dagSthlm();
  const [lage, beh] = await Promise.all([lasLage(args.admin, args.userId, idag), lasBehorighet(args.supabase, args.userId)]);
  const betalande = beh.harOvanGrund;
  const format = formatForPlan(lage.plan?.leverantor, lage.plan?.variant);
  const aktiva = aktivaDagar(lage.slutforda);
  const prov = lage.plan?.provdatum ?? null;
  const start = forstaMatningen(lage.punkter)?.dag ?? null;

  const nya = nyaMilstolpar({
    sessioner: lage.slutforda,
    punkter: lage.punkter,
    provdatum: prov,
    idag,
    redan: lage.milstolpar.map((m) => m.nyckel),
  });
  let milstolpar = lage.milstolpar;
  if (nya.length > 0) {
    const { data, error } = await args.admin.rpc('registrera_milstolpar', { p_user: args.userId, p_nycklar: nya });
    if (!error) {
      const nu = new Date().toISOString();
      const registrerade = (data ?? []) as string[];
      milstolpar = [...milstolpar, ...registrerade.map((nyckel) => ({ nyckel, nadd_at: nu, visad_at: null }))];
      for (const nyckel of registrerade) void captureServer('milstolpe_nadd', args.userId, { nyckel });
    }
  }

  const historikLast = !betalande && !beh.harHistorik && !GRATISNIVA.kurvaHistorikGratis;
  const senaste = lage.punkter[lage.punkter.length - 1] as (Nivapunkt & { skapad_at?: string }) | undefined;
  const nyPunkt =
    !!senaste?.skapad_at && (!args.sedd_at || new Date(senaste.skapad_at).getTime() > new Date(args.sedd_at).getTime());

  const familjer = varDuTappar(familjeunderlag(lage));

  return {
    idag,
    plan: lage.plan,
    format: {
      nyckel: format.nyckel,
      namn: format.namn,
      antal: format.antal,
      minuter: format.minuter,
      budget_s: format.budget_s,
      adaptiv: format.adaptiv,
      cirka: format.cirka,
      tidsform: format.tidsform,
      anmarkning: format.anmarkning,
    },
    niva: senasteNiva(lage.punkter),
    punkter: (historikLast ? lage.punkter.slice(-1) : lage.punkter).map(({ dag, typ, niva }) => ({ dag, typ, niva })),
    historikLast,
    nyPunkt,
    plandagar: start ? byggPlan({ start, prov, idag, aktivaDagar: aktiva, betalande }) : [],
    serie: raknaSerie({ aktivaDagar: aktiva, idag, provdatum: prov }),
    form: lage.punkter.length ? beraknaForm({ punkter: lage.punkter, aktivaDagar: aktiva, idag }) : null,
    aktivitet: raknaAktivitet(lage.slutforda),
    varDuTappar: { svagaste: familjer.svagaste, langsamma: familjer.langsamma },
    milstolpar,
    ovisade: milstolpar.filter((m) => !m.visad_at).map((m) => m.nyckel),
    dagensPassGjort: lage.slutforda.some((s) => s.dag === idag && (s.typ === 'pass' || s.typ === 'riktat' || s.typ === 'general')),
    dagarKvar: prov ? dagarMellan(idag, prov) : null,
    forstaVeckan:
      start && milstolpar.some((m) => m.nyckel === 'forsta_veckan')
        ? forstaVeckanSammanfattning(start, lage.slutforda)
        : null,
    fragaEfterProvet: fragaEfterProvet(lage.plan, idag),
  };
}

/* ------------------------------ Uppvärmningen ------------------------------ */

/** Seeden för dagens uppvärmning: samma tre frågor hela dagen. */
export function uppvarmningsSeed(userId: string, idag: Dag): string {
  return `uppvarmning:${userId}:${idag}`;
}

