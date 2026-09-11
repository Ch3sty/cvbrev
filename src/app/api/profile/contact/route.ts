import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

/**
 * PATCH /api/profile/contact
 *
 * Sparar namn, telefon och ort från kortet "Komplettera profilen"
 * (docs/plan-inloggat-saljflode.md, punkt 6). Ett fält i taget eller flera,
 * sparas vid blur i gränssnittet.
 *
 * RLS begränsar update till egen rad, så vi kör med användarens egen klient
 * och behöver ingen service role här.
 */

export const dynamic = 'force-dynamic';

const MAX_LENGTHS: Record<string, number> = {
  full_name: 120,
  phone: 32,
  location: 64,
};

type Field = keyof typeof MAX_LENGTHS;

const ALLOWED: Field[] = ['full_name', 'phone', 'location'];

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const updates: Record<string, string> = {};

    for (const field of ALLOWED) {
      const raw = (body as Record<string, unknown>)[field];
      if (raw === undefined) continue;
      if (typeof raw !== 'string') {
        return NextResponse.json(
          { error: `Fältet ${field} måste vara text.` },
          { status: 400 }
        );
      }
      const value = raw.trim();
      if (!value) continue;
      if (value.length > MAX_LENGTHS[field]) {
        return NextResponse.json(
          { error: `Fältet ${field} är för långt.` },
          { status: 400 }
        );
      }
      updates[field] = value;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Inget att spara.' }, { status: 400 });
    }

    // Punkt 4 i planen sätter togglarna till true som default. Den som fyller i
    // telefon eller ort här vill uppenbarligen ha dem i brevhuvudet.
    if (updates.phone) {
      (updates as Record<string, unknown>).include_phone_in_letters = true;
    }
    if (updates.location) {
      (updates as Record<string, unknown>).include_location_in_letters = true;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (updateError) {
      console.error('profile/contact update error:', updateError);
      return NextResponse.json({ error: 'Kunde inte spara.' }, { status: 500 });
    }

    return NextResponse.json({ saved: Object.keys(updates) });
  } catch (error) {
    console.error('profile/contact error:', error);
    return NextResponse.json({ error: 'Kunde inte spara.' }, { status: 500 });
  }
}
