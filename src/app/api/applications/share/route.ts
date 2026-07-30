// src/app/api/applications/share/route.ts
// Sökta tjänster: skapa, hämta och återkalla delningslänken.
//
// En användare har högst EN aktiv länk: POST återkallar tidigare aktiva
// länkar innan en ny skapas (enklare mental modell än flera parallella).
// Tabellen skrivs alltid via admin-klienten, samma modell som recruiter-delningen.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  generateApplicationShareToken,
  applicationShareExpiry,
} from '@/lib/applications/shareLinks';

export const dynamic = 'force-dynamic';

const TOKEN_INSERT_ATTEMPTS = 3;

async function getAuthedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  try {
    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: link, error } = await (admin as any)
      .from('job_application_share_links')
      .select('token, show_company_names, show_channel_breakdown, show_monthly_trend, show_notes, expires_at')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Fel vid hämtning av delningslänk:', error);
      return NextResponse.json({ error: 'Kunde inte hämta delningslänk' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: link ?? null });
  } catch (error) {
    console.error('Delningslänkshämtning error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Tom body är ok: standardflaggor används.
    }

    const flags = {
      show_company_names: body.show_company_names !== false,
      show_channel_breakdown: body.show_channel_breakdown !== false,
      show_monthly_trend: body.show_monthly_trend !== false,
      // Anteckningar kan innehålla känsligt innehåll: kräver aktivt val.
      show_notes: body.show_notes === true,
    };

    const admin = getSupabaseAdmin();

    // En aktiv länk åt gången: återkalla tidigare innan den nya skapas.
    await (admin as any)
      .from('job_application_share_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('revoked_at', null);

    const expiresAt = applicationShareExpiry().toISOString();

    let token: string | null = null;
    for (let attempt = 0; attempt < TOKEN_INSERT_ATTEMPTS && !token; attempt++) {
      const candidateToken = generateApplicationShareToken();
      const { error: insertError } = await (admin as any)
        .from('job_application_share_links')
        .insert({ token: candidateToken, user_id: user.id, expires_at: expiresAt, ...flags });

      if (!insertError) {
        token = candidateToken;
      } else if (insertError.code !== '23505') {
        console.error('Delningslänk: insert misslyckades', insertError);
        return NextResponse.json({ error: 'Kunde inte skapa delningslänk' }, { status: 500 });
      }
    }

    if (!token) {
      console.error('Delningslänk: kunde inte skapa unik token');
      return NextResponse.json({ error: 'Kunde inte skapa delningslänk' }, { status: 500 });
    }

    const origin = request.nextUrl.origin;
    return NextResponse.json({
      success: true,
      url: `${origin}/dela/sokta-tjanster/${token}`,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error('Delningslänksskapande error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await (admin as any)
      .from('job_application_share_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .select('token');

    if (error) {
      console.error('Fel vid återkallning av delningslänk:', error);
      return NextResponse.json({ error: 'Kunde inte återkalla delningslänk' }, { status: 500 });
    }

    return NextResponse.json({ success: true, revoked: (data ?? []).length });
  } catch (error) {
    console.error('Delningslänksåterkallning error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}
