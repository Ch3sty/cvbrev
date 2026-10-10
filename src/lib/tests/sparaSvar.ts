/**
 * Ett svar per fråga och session (2026-10-10).
 *
 * Svars-API:erna läste hela answers-listan, lade till svaret i Node och skrev
 * tillbaka listan. Två överlappande anrop läste samma lista och det senare
 * skrev över det förras svar. Nu sparas svaret med databasfunktionen
 * spara_testsvar (supabase/migrations/20261010180000_spara_testsvar.sql), som
 * gör läs, byt och skriv i en enda UPDATE och tar bort ett tidigare svar med
 * samma nyckel. Ordningen anropen landar i spelar ingen roll.
 *
 * unikaSvar() används när poängen räknas, så att en session som redan har
 * dubbletter (från före fixen) ändå räknas på ett svar per fråga.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type SvarsTabell = 'logic_test_v4_sessions' | 'personality_test_sessions';

/** Fälten som tillsammans pekar ut en fråga, per testfamilj. */
export const SVARSNYCKLAR = {
  /** Matrislogik (V4, V6, prov): frågans id. */
  matris: ['q_id'],
  /** Verbalt grund, avancerad och prov: passage och påstående. */
  verbalPastaende: ['passageId', 'statementIndex'],
  /** Verbalt expert och numeriska testen: passage och fråga. */
  passageFraga: ['passageId', 'questionId'],
  /** Personlighetstesten: påståendets id. */
  personlighet: ['questionId'],
} as const satisfies Record<string, readonly string[]>;

function nyckel(svar: unknown, nycklar: readonly string[]): string {
  const o = (svar ?? {}) as Record<string, unknown>;
  return nycklar.map((k) => (o[k] === undefined || o[k] === null ? '' : String(o[k]))).join('\u0000');
}

/**
 * Ett svar per nyckel. Det sist sparade vinner, och ordningen följer var
 * respektive svar senast stod i listan.
 */
export function unikaSvar<T>(answers: readonly T[] | null | undefined, nycklar: readonly string[]): T[] {
  if (!Array.isArray(answers)) return [];
  const sista = new Map<string, number>();
  answers.forEach((a, i) => sista.set(nyckel(a, nycklar), i));
  return answers.filter((a, i) => sista.get(nyckel(a, nycklar)) === i);
}

/**
 * Sparar ett svar atomärt. Returnerar antalet sparade svar i sessionen, null
 * när ingen rad matchade (fel session, annan användare, eller avslutad när
 * kravOavslutad är sant). Kastar vid databasfel.
 */
export async function sparaTestsvar(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  args: {
    tabell: SvarsTabell;
    sessionId: string;
    nycklar: readonly string[];
    svar: Record<string, unknown>;
    kravOavslutad?: boolean;
  }
): Promise<number | null> {
  const { data, error } = await supabase.rpc('spara_testsvar', {
    p_tabell: args.tabell,
    p_session: args.sessionId,
    p_nycklar: [...args.nycklar],
    p_svar: args.svar,
    p_krav_oavslutad: args.kravOavslutad ?? true,
  });
  if (error) throw error;
  return typeof data === 'number' ? data : null;
}
