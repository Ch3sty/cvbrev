// POST /api/notifications/read
// Markerar notiser som lästa. Body: { id?: string } — utan id markeras alla
// den inloggades olästa notiser som lästa ("markera alla som lästa").
// RLS begränsar uppdateringen till användarens egna rader.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { id?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      // Tom body = markera alla, tillåtet.
    }
    const id = typeof body.id === 'string' ? body.id : null;

    const nowISO = new Date().toISOString();
    // Tabellen saknas i genererade DB-typer, därav as any.
    let query = (supabase as any)
      .from('notifications')
      .update({ read: true, read_at: nowISO })
      .eq('user_id', user.id)
      .eq('read', false);
    if (id) query = query.eq('id', id);

    const { error } = await query;
    if (error) {
      console.error('Error marking notifications read:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Notifications read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
