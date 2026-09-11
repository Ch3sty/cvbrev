// src/app/api/admin/email/campaign-gratisniva/route.ts
// Engångskampanjen "Vi ändrar gratisnivån" (docs/plan-konvertering.md, D4).
//
// GET  → hur många som är kvar att schemalägga.
// POST { confirm: true, changeDate: 'YYYY-MM-DD' }
//      → schemalägger mailet för aktiva gratiskonton, max 50 per körning.
//
// Routen SKICKAR INGENTING själv. Den lägger rader i email_schedule som
// runnern plockar upp i morgonslotten, med samma opt-out- och
// shouldSend-kontroller som alla andra livscykelmail.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { scheduleEmail, sendAfterStockholm } from '@/lib/email/lifecycle/schedule';
import { GRATISNIVA_EMAIL_TYPE } from '@/lib/email/lifecycle/registry';

export const dynamic = 'force-dynamic';

const DAILY_CAP = 50;
const ACTIVE_WINDOW_DAYS = 60;

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: 'Unauthorized' };

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();
  if (!adminUser) return { ok: false as const, status: 403, error: 'Forbidden' };

  return { ok: true as const, userId: user.id };
}

/**
 * Aktiva gratiskonton: e-post, inte opt-out, inte premium, last_active inom
 * 60 dagar. De som redan har en schemalagd rad filtreras bort efteråt.
 */
async function fetchCandidates(admin: any): Promise<string[]> {
  const activeSince = new Date(
    Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .not('email', 'is', null)
    .or('quota_emails_opt_out.is.null,quota_emails_opt_out.eq.false')
    .or('subscription_tier.is.null,subscription_tier.neq.premium')
    .gte('last_active', activeSince)
    .limit(500);

  if (error) throw error;
  const ids: string[] = (data ?? []).map((row: { id: string }) => row.id);
  if (ids.length === 0) return [];

  // Redan schemalagda (eller skickade) hoppas över.
  const { data: existing } = await admin
    .from('email_schedule')
    .select('user_id')
    .eq('email_type', GRATISNIVA_EMAIL_TYPE)
    .in('user_id', ids);

  const done = new Set((existing ?? []).map((row: { user_id: string }) => row.user_id));
  return ids.filter((id) => !done.has(id));
}

export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const admin = getSupabaseAdmin() as any;
    const pending = await fetchCandidates(admin);

    const { count: scheduled } = await admin
      .from('email_schedule')
      .select('id', { count: 'exact', head: true })
      .eq('email_type', GRATISNIVA_EMAIL_TYPE);

    return NextResponse.json({
      success: true,
      pendingCount: pending.length,
      scheduledCount: scheduled ?? 0,
      dailyCap: DAILY_CAP,
    });
  } catch (error: any) {
    console.error('[campaign-gratisniva] GET-fel:', error?.message);
    return NextResponse.json({ error: 'Kunde inte hämta status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const body = await request.json().catch(() => ({}));
    if (body?.confirm !== true) {
      return NextResponse.json({ error: 'Kräver confirm: true' }, { status: 400 });
    }

    // Datumet som står i mailet. Utan det blir formuleringen "inom kort".
    const changeDate = typeof body?.changeDate === 'string' ? body.changeDate : null;
    if (changeDate && isNaN(new Date(changeDate).getTime())) {
      return NextResponse.json({ error: 'Ogiltigt changeDate' }, { status: 400 });
    }

    const admin = getSupabaseAdmin() as any;
    const pending = (await fetchCandidates(admin)).slice(0, DAILY_CAP);

    // Skickas i morgonslotten imorgon, inte nu.
    const sendAfter = sendAfterStockholm(1);
    let scheduled = 0;
    for (const userId of pending) {
      await scheduleEmail(admin, userId, GRATISNIVA_EMAIL_TYPE, sendAfter, {
        changeDate: changeDate ?? null,
      });
      scheduled++;
    }

    console.log(`[campaign-gratisniva] schemalagda=${scheduled}`);
    return NextResponse.json({
      success: true,
      scheduled,
      sendAfter: sendAfter.toISOString(),
      note: 'Inget mail har skickats. Runnern skickar dem i morgonslotten.',
    });
  } catch (error: any) {
    console.error('[campaign-gratisniva] POST-fel:', error?.message);
    return NextResponse.json({ error: 'Kunde inte schemalägga' }, { status: 500 });
  }
}
