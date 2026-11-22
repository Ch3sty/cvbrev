// POST /api/recruiter/ansokan
// Registreringen anropar rutten när ansökan är sparad (raden skrivs från
// webbläsaren under RLS). Rutten läser den inloggades egen ansökan på servern
// och skickar mailet "Ny rekryteraransökan: {företag}" till oss, en gång per
// konto. Inget i anropets kropp används: uppgifterna kommer ur databasen.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { skickaAnsokanMejl } from '@/lib/email/rekryterarMejl';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rad } = await (admin as any)
      .from('recruiter_profiles')
      .select('company_name, org_number, contact_name, contact_email, status')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!rad || rad.status !== 'pending') return NextResponse.json({ ok: true, skickat: false });

    const skickat = await skickaAnsokanMejl(admin, {
      userId: user.id,
      foretag: rad.company_name ?? 'Okänt företag',
      orgnummer: rad.org_number ?? '',
      namn: rad.contact_name ?? null,
      epost: rad.contact_email ?? user.email ?? null,
    });
    return NextResponse.json({ ok: true, skickat });
  } catch (error) {
    console.error('Recruiter ansokan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
