import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

// Hämtar användarens aktiva personlighetsprofil. Används av andra verktyg
// (CV-byggare, personligt brev, AI-coach) för att anpassa innehåll efter
// användarens profil.
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: fetchError } = await supabase
      .from('user_personality_profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching personality profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: profile ?? null });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
