// src/app/api/subscription/cancel-intent/route.ts
// Registrerar varför någon säger upp (docs/plan-konvertering.md, D6).
//
// POST  { reason, freeText? }                 → skapar raden, returnerar id
// PATCH { id, offerShown?, offerAccepted?, completedCancel? } → uppdaterar den
//
// user_id tas ALLTID från sessionen, aldrig ur body.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const VALID_REASONS = ['fick_jobb', 'for_dyrt', 'anvander_inte', 'saknar_funktion'] as const;
type Reason = (typeof VALID_REASONS)[number];

async function requireUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const reason = body?.reason as Reason | undefined;

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Ogiltig orsak' }, { status: 400 });
    }

    const freeText =
      typeof body?.freeText === 'string' ? body.freeText.trim().slice(0, 300) : null;

    const { data, error } = await (getSupabaseAdmin() as any)
      .from('cancel_intents')
      .insert({
        user_id: user.id,
        reason,
        free_text: freeText || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[cancel-intent] insert error:', error.message);
      return NextResponse.json({ error: 'Kunde inte spara' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('[cancel-intent] POST error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const id = typeof body?.id === 'string' ? body.id : null;
    if (!id) return NextResponse.json({ error: 'id krävs' }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (typeof body.offerShown === 'string') patch.offer_shown = body.offerShown.slice(0, 64);
    if (typeof body.offerAccepted === 'boolean') patch.offer_accepted = body.offerAccepted;
    if (typeof body.completedCancel === 'boolean') patch.completed_cancel = body.completedCancel;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Inget att uppdatera' }, { status: 400 });
    }

    // eq på user_id gör att ingen kan uppdatera någon annans rad.
    const { error } = await (getSupabaseAdmin() as any)
      .from('cancel_intents')
      .update(patch)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[cancel-intent] update error:', error.message);
      return NextResponse.json({ error: 'Kunde inte uppdatera' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[cancel-intent] PATCH error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}
