/**
 * Datalagret för /admin/fragor (beställningen omgång 3, B3).
 *
 * Tre källor, alla med service role:
 *   fraga_kalibrering_vy  svar, konton, p och mediantid per fråga, ur råsvaren.
 *                         Undantagna konton är redan borta i vyn.
 *   logic_test_v4_sessions  svaren senaste 7 och 30 dagarna per testtyp
 *                         (blandade, avslutade, undantagna borta med uteslut).
 *   fraga_rapporter       rapporterna, undantagna borta med uteslut.
 * Registret (src/lib/fragor/register.server.ts) säger vilka frågor som finns.
 * De verbala och numeriska testen finns inte i vyn (annat svarsformat). Deras
 * tal räknas här ur de avslutade sessionerna med vyns regler (aggregeraUnderlag).
 *
 * Saknas vyn eller tabellen (migreringen inte körd) blir listan tom och
 * sidan säger det, aldrig ett fel. Ingen fråga skriver något.
 */

import 'server-only';
import { cache } from 'react';
import { UNDERLAG_TESTTYPER, underlagStatistik } from '@/lib/tests/klassiskStatistik';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { hamtaUndantagCachad } from '@/lib/admin/metrics';
import { uteslut } from '@/lib/admin/undantag';
import { register, kindForId, TEST_KINDS, type Niva, type RegisterRad, type TestKind } from '@/lib/fragor/register.server';
import { kalibreringStatus, sorteraKalibrering, type KalibreringStatus } from '@/lib/kalibrering/flaggor';

export const SIDSTORLEK = 25;

export const FLIKAR = [
  { nyckel: 'kalibrering', etikett: 'Kalibrering' },
  { nyckel: 'testtyp', etikett: 'Per testtyp' },
  { nyckel: 'rapporter', etikett: 'Rapporter' },
] as const;
export type FlikNyckel = (typeof FLIKAR)[number]['nyckel'];
export const arFlik = (v: unknown): v is FlikNyckel => FLIKAR.some((f) => f.nyckel === v);

export const NIVAER: readonly Niva[] = ['grund', 'avancerad', 'expert'];

export interface VyRad {
  svar: number;
  konton: number;
  ratt: number;
  p: number | null;
  tid_median_s: number | null;
}

export interface KalibreringRad extends RegisterRad, VyRad {
  status: KalibreringStatus;
}

const tal = (v: unknown): number | null => (v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null);

/** Hela vyn, sidvis om 1 000. Null när vyn inte går att läsa. */
export async function hamtaVy(): Promise<Map<string, VyRad> | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const ut = new Map<string, VyRad>();
  for (let fran = 0; fran < 50_000; fran += 1000) {
    const { data, error } = await admin
      .from('fraga_kalibrering_vy')
      .select('fraga_id, svar, konton, ratt, p, tid_median_s')
      .range(fran, fran + 999);
    if (error) {
      console.error('[admin/fragor] vyn gick inte att läsa:', error.message);
      return null;
    }
    for (const r of (data ?? []) as Record<string, unknown>[]) {
      ut.set(String(r.fraga_id), { svar: tal(r.svar) ?? 0, konton: tal(r.konton) ?? 0, ratt: tal(r.ratt) ?? 0, p: tal(r.p), tid_median_s: tal(r.tid_median_s) });
    }
    if (!data || data.length < 1000) break;
  }
  // De verbala och numeriska testen finns inte i vyn (annat svarsformat, inga
  // blandade alternativ). De räknas ur råsvaren med vyns regler.
  const underlag = await underlagSessioner();
  for (const [id, v] of aggregeraUnderlag(underlag)) if (!ut.has(id)) ut.set(id, v);
  return ut;
}

/* ------------------------- Verbalt och numeriskt ------------------------- */

export interface UnderlagSession {
  user_id: string;
  test_type: string;
  completed_at: string;
  answers: unknown;
}

/**
 * Avslutade verbala och numeriska sessioner, undantagna borta. En gång per
 * förfrågan (cache), så att Kalibrering och Per testtyp läser dem en gång.
 */
const underlagSessioner = cache(async (): Promise<UnderlagSession[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const u = await hamtaUndantagCachad();
  const ut: UnderlagSession[] = [];
  for (let fran = 0; fran < 50_000; fran += 1000) {
    const { data, error } = await uteslut(
      admin
        .from('logic_test_v4_sessions')
        .select('user_id, test_type, completed_at, answers')
        .not('completed_at', 'is', null)
        .in('test_type', Object.keys(UNDERLAG_TESTTYPER)),
      'user_id',
      u,
    )
      .order('completed_at', { ascending: true })
      .range(fran, fran + 999);
    if (error) {
      console.error('[admin/fragor] de verbala och numeriska sessionerna gick inte att läsa:', error.message);
      break;
    }
    ut.push(...((data ?? []) as UnderlagSession[]));
    if (!data || data.length < 1000) break;
  }
  return ut;
});

/**
 * Samma tal som fraga_kalibrering_vy ger matrisfrågorna, för de verbala och
 * numeriska: svar utan "Vet inte", olika konton, rätt, p och mediantid.
 * Fråge-id:t är registrets (underlagStatistik).
 */
export function aggregeraUnderlag(sessioner: readonly UnderlagSession[]): Map<string, VyRad> {
  const per = new Map<string, { konton: Set<string>; ratt: number; tider: number[] }>();
  for (const s of sessioner) {
    const kind = UNDERLAG_TESTTYPER[s.test_type];
    if (!kind || !Array.isArray(s.answers)) continue;
    for (const r of underlagStatistik(s.answers, kind)) {
      if (r.selected < 0) continue;
      const f = per.get(r.fraga_id) ?? { konton: new Set<string>(), ratt: 0, tider: [] };
      f.konton.add(s.user_id);
      if (r.correct) f.ratt++;
      f.tider.push(r.tid_s);
      per.set(r.fraga_id, f);
    }
  }
  const ut = new Map<string, VyRad>();
  for (const [id, f] of per) {
    const svar = f.tider.length;
    ut.set(id, { svar, konton: f.konton.size, ratt: f.ratt, p: Math.round((f.ratt / svar) * 1000) / 1000, tid_median_s: median(f.tider) });
  }
  return ut;
}

const TOMT: VyRad = { svar: 0, konton: 0, ratt: 0, p: null, tid_median_s: null };

/** Registret med vyns tal och statusen, utan pensionerade frågor. */
export function slaIhop(reg: readonly RegisterRad[], vy: ReadonlyMap<string, VyRad> | null): KalibreringRad[] {
  return reg
    .filter((r) => !r.pensionerad)
    .map((r) => {
      const v = vy?.get(r.id) ?? TOMT;
      return { ...r, ...v, status: kalibreringStatus({ svar: v.svar, konton: v.konton, p: v.p, p_prior: r.p_prior, band: r.band }) };
    });
}

export interface KalibreringFilter {
  kind: TestKind | null;
  niva: Niva | null;
  status: KalibreringStatus | null;
}

export function filtrera(rader: readonly KalibreringRad[], f: KalibreringFilter): KalibreringRad[] {
  return sorteraKalibrering(
    rader.filter((r) => (!f.kind || r.test_kind === f.kind) && (!f.niva || r.niva === f.niva) && (!f.status || r.status === f.status)),
  );
}

export async function hamtaKalibrering(f: KalibreringFilter, sida: number) {
  const vy = await hamtaVy();
  const alla = filtrera(slaIhop(register(), vy), f);
  const sidor = Math.max(1, Math.ceil(alla.length / SIDSTORLEK));
  const s = Math.min(Math.max(1, sida), sidor);
  return { rader: alla.slice((s - 1) * SIDSTORLEK, s * SIDSTORLEK), totalt: alla.length, sida: s, sidor, vyFinns: vy != null };
}

/* ---------------------------------- Per testtyp ---------------------------------- */

export interface TestTypRad {
  kind: TestKind;
  iBank: number;
  kalibrerade: number;
  svar7: number;
  svar30: number;
  medianP: Record<Niva, { p: number | null; fragor: number }>;
}

export function median(xs: readonly number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Svar per testtyp senaste 7 och 30 dagarna, ur de blandade sessionernas svar. */
async function svarPerTyp(): Promise<Record<TestKind, { d7: number; d30: number }>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const u = await hamtaUndantagCachad();
  const ut = Object.fromEntries(TEST_KINDS.map((k) => [k, { d7: 0, d30: 0 }])) as Record<TestKind, { d7: number; d30: number }>;
  const nu = Date.now();
  const fran30 = new Date(nu - 30 * 86_400_000).toISOString();
  const fran7 = nu - 7 * 86_400_000;
  const perId = new Map(register().map((r) => [r.id, r.test_kind]));
  for (let fran = 0; fran < 20_000; fran += 1000) {
    const { data, error } = await uteslut(
      admin
        .from('logic_test_v4_sessions')
        .select('completed_at, answers')
        .not('completed_at', 'is', null)
        .gte('completed_at', fran30)
        .eq('meta->>alternativ_blandade', 'true'),
      'user_id',
      u,
    ).range(fran, fran + 999);
    if (error) {
      console.error('[admin/fragor] sessionerna gick inte att läsa:', error.message);
      break;
    }
    for (const s of (data ?? []) as { completed_at: string; answers: unknown }[]) {
      const nyss = new Date(s.completed_at).getTime() >= fran7;
      for (const a of Array.isArray(s.answers) ? s.answers : []) {
        const id = (a as { q_id?: unknown })?.q_id;
        if (typeof id !== 'string' || !id) continue;
        const kind = perId.get(id) ?? kindForId(id);
        ut[kind].d30++;
        if (nyss) ut[kind].d7++;
      }
    }
    if (!data || data.length < 1000) break;
  }
  for (const s of await underlagSessioner()) {
    const kind = UNDERLAG_TESTTYPER[s.test_type];
    const t = new Date(s.completed_at).getTime();
    if (!kind || !Array.isArray(s.answers) || t < nu - 30 * 86_400_000) continue;
    const n = underlagStatistik(s.answers, kind).length;
    ut[kind].d30 += n;
    if (t >= fran7) ut[kind].d7 += n;
  }
  return ut;
}

export async function hamtaPerTestTyp(): Promise<{ rader: TestTypRad[]; vyFinns: boolean }> {
  const [vy, svar] = await Promise.all([hamtaVy(), svarPerTyp()]);
  const alla = slaIhop(register(), vy);
  const rader = TEST_KINDS.map((kind) => {
    const egna = alla.filter((r) => r.test_kind === kind);
    const medianP = Object.fromEntries(
      NIVAER.map((n) => {
        const ps = egna.filter((r) => r.niva === n && r.p != null && r.svar > 0).map((r) => r.p as number);
        return [n, { p: median(ps), fragor: ps.length }];
      }),
    ) as TestTypRad['medianP'];
    return {
      kind,
      iBank: egna.length,
      kalibrerade: egna.filter((r) => r.status !== 'okalibrerad').length,
      svar7: svar[kind].d7,
      svar30: svar[kind].d30,
      medianP,
    };
  });
  return { rader, vyFinns: vy != null };
}

/* ----------------------------------- Rapporter ----------------------------------- */

export interface RapportRad {
  id: string;
  q_id: string;
  test_kind: TestKind;
  orsak: string;
  kommentar: string | null;
  created_at: string;
  paFragan: number;
}

/** Testtypen ur rapporten; rapporter sparade som matris före migreringen känns igen på id:t. */
function rapportKind(testKind: unknown, qId: string): TestKind {
  const fran = kindForId(qId);
  if (fran !== 'matris') return fran;
  return (TEST_KINDS as readonly string[]).includes(String(testKind)) ? (testKind as TestKind) : 'matris';
}

export async function hamtaRapporter(sida: number, qId: string | null = null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const u = await hamtaUndantagCachad();
  let lista = uteslut(admin.from('fraga_rapporter').select('id, q_id, test_kind, orsak, kommentar, created_at', { count: 'exact' }), 'user_id', u).order(
    'created_at',
    { ascending: false },
  );
  if (qId) lista = lista.eq('q_id', qId);
  const s = Math.max(1, sida);
  const { data, error, count } = await lista.range((s - 1) * SIDSTORLEK, s * SIDSTORLEK - 1);
  if (error) {
    console.error('[admin/fragor] rapporterna gick inte att läsa:', error.message);
    return { rader: [] as RapportRad[], totalt: 0, sida: 1, sidor: 1, tabellFinns: false };
  }
  const ids = [...new Set(((data ?? []) as { q_id: string }[]).map((r) => r.q_id))];
  const perFraga = new Map<string, number>();
  if (ids.length) {
    const { data: alla } = await uteslut(admin.from('fraga_rapporter').select('q_id').in('q_id', ids), 'user_id', u);
    for (const r of (alla ?? []) as { q_id: string }[]) perFraga.set(r.q_id, (perFraga.get(r.q_id) ?? 0) + 1);
  }
  const rader: RapportRad[] = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    q_id: String(r.q_id),
    test_kind: rapportKind(r.test_kind, String(r.q_id)),
    orsak: String(r.orsak),
    kommentar: typeof r.kommentar === 'string' ? r.kommentar : null,
    created_at: String(r.created_at),
    paFragan: perFraga.get(String(r.q_id)) ?? 1,
  }));
  const totalt = count ?? rader.length;
  return { rader, totalt, sida: s, sidor: Math.max(1, Math.ceil(totalt / SIDSTORLEK)), tabellFinns: true };
}

/** En fråga ur vyn, för frågesidan. */
export async function hamtaVyRad(id: string): Promise<VyRad | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const { data, error } = await admin.from('fraga_kalibrering_vy').select('fraga_id, svar, konton, ratt, p, tid_median_s').eq('fraga_id', id).maybeSingle();
  if (error) return null;
  if (!data) return aggregeraUnderlag(await underlagSessioner()).get(id) ?? null;
  const r = data as Record<string, unknown>;
  return { svar: tal(r.svar) ?? 0, konton: tal(r.konton) ?? 0, ratt: tal(r.ratt) ?? 0, p: tal(r.p), tid_median_s: tal(r.tid_median_s) };
}
