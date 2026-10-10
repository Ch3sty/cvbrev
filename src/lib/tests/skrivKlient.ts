/**
 * Klienten test-rutterna skriver till testsessionstabellerna med
 * (logic_test_v4_sessions, personality_test_sessions).
 *
 * Sedan skrivspärren 2026-10-10 får användarens session bara läsa sina rader
 * (supabase/migrations/20261010211000_testsessioner_skrivsparr.sql). Att
 * skapa, besvara och avsluta en session sker därför med service role, efter
 * att rutten har kontrollerat inloggningen och att sessionen är hennes.
 * Varje uppdatering villkoras dessutom på user_id.
 *
 * Tabellerna saknas i de genererade databastyperna, därav den otypade
 * klienten. Importeras bara från serverkod.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function testSkrivKlient(): SupabaseClient<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin() as unknown as SupabaseClient<any>;
}
