import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Belöningsaktiveringen är stängd sedan 2026-10-10.
 *
 * XP- och belöningssystemet ströks i omdesignen (docs/plan-inloggat-omdesign.md,
 * våg 2 punkt 21) och inget i gränssnittet anropar rutten längre. Den skrev
 * premium_until, premium_source och subscription_tier med användarens egen
 * session, och user_reward_claims tillåter insert med with_check true, så vem
 * som helst kunde skapa ett eget anspråk med egen aktiveringskod och ge sig
 * själv premium. Premiumkolumnerna i profiles är nu spärrade för användarens
 * session (migrationen profiles_skyddade_kolumner), och rutten svarar 410
 * i stället för att flyttas till admin-klienten, eftersom den då skulle bli
 * en öppen väg till premium.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Belöningar går inte längre att aktivera.' },
    { status: 410 }
  );
}
