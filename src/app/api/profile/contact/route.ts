import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { arGiltigEpost, EPOST_MAX } from '@/lib/profile/dokumentEpost';
import { captureServer, vantaMedTak } from '@/lib/analytics/server';

/**
 * PATCH /api/profile/contact
 *
 * Sparar namn, telefon och ort från kortet "Komplettera profilen"
 * (docs/plan-inloggat-saljflode.md, punkt 6). Ett fält i taget eller flera,
 * sparas vid blur i gränssnittet.
 *
 * contact_email (2026-10-10) är adressen i CV-mallar och personliga brev.
 * Tom sträng eller null betyder kontoadressen och sparas som null. Ingen
 * verifiering skickas: adressen används bara i användarens egna dokument.
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

    const updates: Record<string, string | boolean | null> = {};

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

    // E-post i CV och brev. Tom betyder kontoadressen.
    let nyDokumentEpost: string | null | undefined;
    if ('contact_email' in (body as Record<string, unknown>)) {
      const raw = (body as Record<string, unknown>).contact_email;
      if (raw !== null && typeof raw !== 'string') {
        return NextResponse.json({ error: 'Adressen måste vara text.' }, { status: 400 });
      }
      const value = (raw ?? '').trim();
      if (value && (value.length > EPOST_MAX || !arGiltigEpost(value))) {
        return NextResponse.json(
          { error: 'Det ser inte ut som en e-postadress.', field: 'contact_email' },
          { status: 400 }
        );
      }
      const konto = (user.email ?? '').trim().toLowerCase();
      // Samma som kontoadressen betyder samma sak som tomt: följ kontot.
      nyDokumentEpost = value && value.toLowerCase() !== konto ? value : null;
      updates.contact_email = nyDokumentEpost;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Inget att spara.' }, { status: 400 });
    }

    // Punkt 4 i planen sätter togglarna till true som default. Den som fyller i
    // telefon eller ort här vill uppenbarligen ha dem i brevhuvudet.
    if (updates.phone) {
      updates.include_phone_in_letters = true;
    }
    if (updates.location) {
      updates.include_location_in_letters = true;
    }

    // Föregående värde behövs bara för mätningen.
    let hadeEgenForut = false;
    if (nyDokumentEpost) {
      const { data: fore } = await supabase
        .from('profiles')
        .select('contact_email')
        .eq('id', user.id)
        .maybeSingle();
      const tidigare = (fore as { contact_email?: string | null } | null)?.contact_email ?? null;
      hadeEgenForut = Boolean(tidigare);
      if (tidigare && tidigare.toLowerCase() === nyDokumentEpost.toLowerCase()) {
        // Oförändrad: spara ändå, men mät inte en ändring som inte skett.
        nyDokumentEpost = undefined;
      }
    }

    const { data: sparad, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('contact_email')
      .single();

    if (updateError) {
      console.error('profile/contact update error:', updateError.code);
      return NextResponse.json({ error: 'Kunde inte spara.' }, { status: 500 });
    }

    if (nyDokumentEpost) {
      await vantaMedTak(
        captureServer('document_email_changed', user.id, {
          differs_from_account: true,
          had_custom_before: hadeEgenForut,
        })
      );
    }

    return NextResponse.json({
      saved: Object.keys(updates),
      contact_email: (sparad as { contact_email?: string | null } | null)?.contact_email ?? null,
    });
  } catch (error) {
    console.error('profile/contact error:', error);
    return NextResponse.json({ error: 'Kunde inte spara.' }, { status: 500 });
  }
}
