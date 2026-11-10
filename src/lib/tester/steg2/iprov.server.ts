// src/lib/tester/steg2/iprov.server.ts
// =============================================================================
// Motorn för övningsprovet i I-prov 2025 (brief-tester-steg2 avsnitt 5).
//
// - En session i logic_test_v4_sessions, test_type iprov-prov, kräver
//   test_exam_mode. meta.delar bär deltestens uppgifter, maxtid, start och
//   slut. Servern äger klockan: ett deltest startas av servern, svar tas bara
//   emot medan deltestet är öppet och inom maxtiden (med tio sekunders
//   marginal för nätet), och ett avslutat deltest öppnas aldrig igen.
// - Deltesterna drar ur nivåerna i ordningen lätt till svår (tredjedelar),
//   som matrisprovet. Pappersvikning (deltest 2) är form D, ihopvikt som i
//   I-provet. Pappersvikning med klipp (deltest 6) är form B med klipp,
//   uppvikt som i I-provet, och finns bara på expert.
// - Resultatet är antal rätt per deltest och tiden per deltest. Aldrig
//   stanine. Frågestatistiken får typ prov.
// - Alla skrivningar med service role, villkorade på user_id.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { scopeHasFeature } from '@/lib/access/features';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { captureServer } from '@/lib/analytics/server';
import { blandaSeedat } from '../pass-figur';
import { steg2Motor, type Niva, type Steg2Motor } from './motor.server';
import { IPROV_TEST_TYPE, iprovDelar, type IprovDelDef, type IprovDelResultat, type IprovVy } from './iprov';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

const GRACE_S = 10;
const KOLUMNER = 'id, test_type, meta, answers, score, created_at, started_at, completed_at';

interface DelMeta {
  nr: number;
  ids: string[];
  max_s: number;
  start: string | null;
  slut: string | null;
  /** Svaren: nyckel till visat index och originalets rätt/fel. */
  svar: Record<string, { visat: number; selected: number; correct: boolean; tid_s: number }>;
}

export interface IprovMeta {
  iprov: 1;
  halvt: boolean;
  variant: string | null;
  delar: DelMeta[];
  fragor: string[];
  resultat?: IprovVy['resultat'];
}

interface Rad {
  id: string;
  test_type: string | null;
  meta: unknown;
  created_at: string;
  completed_at: string | null;
}

function lasMeta(meta: unknown): IprovMeta | null {
  const m = meta as Partial<IprovMeta> | null;
  return m && m.iprov === 1 && Array.isArray(m.delar) ? (m as IprovMeta) : null;
}

/** Deltestets motor och vilka nivåer det drar ur, lätt till svår. */
function kalla(d: IprovDelDef): { motor: Steg2Motor | null; nivaer: Niva[]; filter: (m: Steg2Motor, id: string) => boolean } {
  const motor = steg2Motor(d.kind);
  if (d.kind === 'ordforrad') return { motor, nivaer: ['grund', 'avancerad', 'expert'], filter: (m, id) => m.gruppNyckel(id) === d.form };
  if (d.kind === 'talserie') return { motor, nivaer: ['avancerad', 'expert'], filter: () => true };
  if (d.form === 'Bklipp') return { motor, nivaer: ['expert'], filter: (m, id) => m.gruppNyckel(id) === 'B' };
  if (d.form === 'D') return { motor, nivaer: ['grund', 'avancerad', 'expert'], filter: (m, id) => m.gruppNyckel(id) === 'D' };
  return { motor, nivaer: ['grund', 'avancerad', 'expert'], filter: (m, id) => m.gruppNyckel(id) === 'C' };
}

/** Uppgifterna för ett deltest: jämnt ur nivåerna, lätt först. Tomt när motorn saknas. */
function valjDel(d: IprovDelDef, seed: string): string[] {
  const { motor, nivaer, filter } = kalla(d);
  if (!motor) return [];
  const ut: string[] = [];
  nivaer.forEach((niva, i) => {
    const kvar = d.antal - ut.length;
    const n = i === nivaer.length - 1 ? kvar : Math.round(d.antal / nivaer.length);
    const pool = motor.pool(niva).filter((q) => filter(motor, q.id) && !ut.includes(q.id));
    ut.push(...blandaSeedat(pool, `${seed}:${d.nr}:${niva}`).slice(0, n).map((q) => q.id));
  });
  return ut;
}

/** Deltesterna som går att köra nu: de vars motor finns. */
export function iprovKorbaraDelar(halvt: boolean): IprovDelDef[] {
  return iprovDelar(halvt).filter((d) => !!steg2Motor(d.kind));
}

export function iprovVy(rad: Rad): IprovVy | null {
  const m = lasMeta(rad.meta);
  if (!m) return null;
  const defs = new Map(iprovDelar(m.halvt).map((d) => [d.nr, d]));
  const avslutad = !!rad.completed_at;
  const delar = m.delar.map((dm) => {
    const d = defs.get(dm.nr)!;
    const motor = steg2Motor(d.kind)!;
    return {
      nr: dm.nr,
      namn: d.namn,
      kort: d.kort,
      kind: d.kind,
      max_s: dm.max_s,
      // Uppgifterna visas först när deltestet är startat (ingen förhandstitt).
      uppgifter: dm.start ? dm.ids.map((id) => ({ ...(motor.visa(id, rad.id) as Record<string, unknown>), nyckel: id })) : [],
      startad: dm.start,
      avslutad: dm.slut,
      svar: Object.fromEntries(Object.entries(dm.svar ?? {}).map(([k, v]) => [k, v.visat])),
    };
  });
  const genomgang = avslutad
    ? m.delar.map((dm) => {
        const motor = steg2Motor(defs.get(dm.nr)!.kind)!;
        return dm.ids.map((id) => ({ ...motor.genomga(id, rad.id), nyckel: id }));
      })
    : null;
  return { id: rad.id, halvt: m.halvt, variant: m.variant, skapad: rad.created_at, avslutad, delar, resultat: avslutad ? m.resultat ?? null : null, genomgang };
}

export async function hamtaIprov(admin: Klient, userId: string, id: string): Promise<Rad | null> {
  const { data, error } = await admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('id', id).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const rad = (data as Rad | null) ?? null;
  return rad && rad.test_type === IPROV_TEST_TYPE && lasMeta(rad.meta) ? rad : null;
}

export async function harProvlage(supabase: Klient, userId: string): Promise<boolean> {
  return scopeHasFeature(await getUserScope(supabase, userId), 'test_exam_mode');
}

async function spara(admin: Klient, userId: string, id: string, meta: IprovMeta, extra: Record<string, unknown> = {}) {
  const { error } = await admin.from('logic_test_v4_sessions').update({ meta, ...extra }).eq('id', id).eq('user_id', userId).is('completed_at', null);
  if (error) throw error;
}

export type IprovSvar<T> = { ok: true; vy: T } | { ok: false; status: 400 | 403 | 404 | 409 | 422; fel: string };

export async function skapaIprov(args: { supabase: Klient; admin: Klient; userId: string; halvt: boolean; variant: string | null }): Promise<IprovSvar<IprovVy>> {
  if (!(await harProvlage(args.supabase, args.userId))) return { ok: false, status: 403, fel: 'betalvagg' };
  // Ett påbörjat prov återupptas.
  const { data: pagaende } = await args.admin
    .from('logic_test_v4_sessions')
    .select(KOLUMNER)
    .eq('user_id', args.userId)
    .eq('test_type', IPROV_TEST_TYPE)
    .is('completed_at', null)
    .order('created_at', { ascending: false })
    .limit(1);
  const forra = (pagaende ?? [])[0] as Rad | undefined;
  if (forra) {
    const vy = iprovVy(forra);
    if (vy) return { ok: true, vy };
  }
  const defs = iprovKorbaraDelar(args.halvt);
  if (defs.length === 0) return { ok: false, status: 422, fel: 'banken_tom' };
  const seed = `${args.userId}:${Date.now()}`;
  const delar: DelMeta[] = defs.map((d) => ({ nr: d.nr, ids: valjDel(d, seed), max_s: d.minuter * 60, start: null, slut: null, svar: {} }));
  if (delar.some((d) => d.ids.length === 0)) return { ok: false, status: 422, fel: 'banken_tom' };
  const meta: IprovMeta = { iprov: 1, halvt: args.halvt, variant: args.variant, delar, fragor: delar.flatMap((d) => d.ids) };
  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: args.userId, test_type: IPROV_TEST_TYPE, answers: [], meta })
    .select(KOLUMNER)
    .single();
  if (error || !data) throw error ?? new Error('provet skapades inte');
  const vy = iprovVy(data as Rad);
  if (!vy) throw new Error('provets meta gick inte att läsa');
  return { ok: true, vy };
}

/** Pågående deltest: det första som inte är avslutat. */
function aktuellDel(m: IprovMeta): DelMeta | null {
  return m.delar.find((d) => !d.slut) ?? null;
}

function tidenUte(d: DelMeta, nu: number): boolean {
  return !!d.start && nu - new Date(d.start).getTime() > (d.max_s + GRACE_S) * 1000;
}

export async function startaDel(args: { admin: Klient; userId: string; id: string; nr: unknown }): Promise<IprovSvar<IprovVy>> {
  const rad = await hamtaIprov(args.admin, args.userId, args.id);
  const m = rad ? lasMeta(rad.meta) : null;
  if (!rad || !m) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };
  const d = aktuellDel(m);
  // Bara det deltest som står på tur går att starta: ingen väg tillbaka, ingen väg förbi.
  if (!d || d.nr !== args.nr) return { ok: false, status: 409, fel: 'fel_deltest' };
  if (!d.start) {
    d.start = new Date().toISOString();
    await spara(args.admin, args.userId, rad.id, m);
  }
  return { ok: true, vy: iprovVy({ ...rad, meta: m })! };
}

export async function svaraIprov(args: { admin: Klient; userId: string; id: string; nyckel: unknown; visat: unknown; tid: unknown }): Promise<IprovSvar<{ besvarade: number }>> {
  const rad = await hamtaIprov(args.admin, args.userId, args.id);
  const m = rad ? lasMeta(rad.meta) : null;
  if (!rad || !m) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };
  const d = aktuellDel(m);
  if (!d || !d.start) return { ok: false, status: 409, fel: 'inget_oppet_deltest' };
  if (tidenUte(d, Date.now())) return { ok: false, status: 409, fel: 'tiden_ute' };
  if (typeof args.nyckel !== 'string' || !d.ids.includes(args.nyckel)) return { ok: false, status: 400, fel: 'fel_uppgift' };
  const motor = steg2Motor(iprovDelar(m.halvt).find((x) => x.nr === d.nr)!.kind)!;
  const b = motor.bedom(args.nyckel, rad.id, true, args.visat);
  if (!b) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const tid = typeof args.tid === 'number' && Number.isFinite(args.tid) && args.tid > 0 ? Math.min(Math.round(args.tid), 3600) : 0;
  const forra = d.svar[args.nyckel];
  d.svar = { ...d.svar, [args.nyckel]: { visat: b.visat, selected: b.selected, correct: b.correct, tid_s: (forra?.tid_s ?? 0) + tid } };
  await spara(args.admin, args.userId, rad.id, m);
  return { ok: true, vy: { besvarade: Object.keys(d.svar).length } };
}

export async function avslutaDel(args: { admin: Klient; userId: string; id: string; nr: unknown }): Promise<IprovSvar<IprovVy>> {
  const rad = await hamtaIprov(args.admin, args.userId, args.id);
  const m = rad ? lasMeta(rad.meta) : null;
  if (!rad || !m) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: true, vy: iprovVy(rad)! };
  const d = aktuellDel(m);
  if (!d || d.nr !== args.nr) return { ok: true, vy: iprovVy(rad)! };
  const nu = new Date();
  if (!d.start) d.start = nu.toISOString();
  // Slutet räknas aldrig längre än maxtiden.
  const max = new Date(new Date(d.start).getTime() + d.max_s * 1000);
  d.slut = (nu < max ? nu : max).toISOString();
  if (m.delar.every((x) => x.slut)) return slutfor(args.admin, args.userId, rad, m);
  await spara(args.admin, args.userId, rad.id, m);
  return { ok: true, vy: iprovVy({ ...rad, meta: m })! };
}

async function slutfor(admin: Klient, userId: string, rad: Rad, m: IprovMeta): Promise<IprovSvar<IprovVy>> {
  const defs = new Map(iprovDelar(m.halvt).map((d) => [d.nr, d]));
  const delar: IprovDelResultat[] = m.delar.map((dm) => {
    const d = defs.get(dm.nr)!;
    const tid_s = dm.start && dm.slut ? Math.max(0, Math.round((new Date(dm.slut).getTime() - new Date(dm.start).getTime()) / 1000)) : 0;
    return {
      nr: dm.nr,
      namn: d.namn,
      kort: d.kort,
      ratt: Object.values(dm.svar ?? {}).filter((s) => s.correct).length,
      antal: dm.ids.length,
      tid_s: Math.min(tid_s, dm.max_s),
      max_s: dm.max_s,
      tidenSlut: tid_s >= dm.max_s,
    };
  });
  const ratt = delar.reduce((s, d) => s + d.ratt, 0);
  const antal = delar.reduce((s, d) => s + d.antal, 0);
  const tid = delar.reduce((s, d) => s + d.tid_s, 0);
  m.resultat = { ratt, antal, delar };
  const nu = new Date().toISOString();
  const { error } = await admin
    .from('logic_test_v4_sessions')
    .update({ meta: m, score: ratt, time_spent: tid, completed_at: nu })
    .eq('id', rad.id)
    .eq('user_id', userId)
    .is('completed_at', null);
  if (error) throw error;

  // Frågestatistiken per motor, typ prov. Får aldrig fälla avslutet.
  for (const dm of m.delar) {
    const motor = steg2Motor(defs.get(dm.nr)!.kind);
    const svar = Object.entries(dm.svar ?? {}).map(([q_id, s]) => ({ q_id, selected: s.selected, correct: s.correct, time_spent: s.tid_s }));
    if (!motor || !svar.length) continue;
    const rader = (motor.statistik(svar) as Record<string, unknown>[]).map((r) => ({ ...r, typ: 'prov' }));
    void Promise.resolve(admin.rpc('uppdatera_fraga_statistik', { p_svar: rader, p_user: userId }) as unknown as Promise<{ error: { message: string } | null }>)
      .then((r) => {
        if (r?.error) console.error('[iprov] frågestatistiken', r.error.message);
      })
      .catch(() => {});
  }
  void captureServer('provpaket_klart', userId, {
    paket: 'iprov',
    halvt: m.halvt,
    ratt_per_del: delar.map((d) => d.ratt),
    tid_per_del_s: delar.map((d) => d.tid_s),
    obesvarade: antal - m.delar.reduce((s, d) => s + Object.keys(d.svar ?? {}).length, 0),
  } as never);
  return { ok: true, vy: iprovVy({ ...rad, meta: m, completed_at: nu })! };
}
