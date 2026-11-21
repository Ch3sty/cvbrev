// src/app/api/applications/report/route.ts
// Sökta tjänster: månadsrapport strukturerad som Arbetsförmedlingens
// aktivitetsrapport (blankett Af 00331):
//   1. Sökta annonserade jobb   2. Spontanansökningar/intresseanmälningar
//   3. Intervjuer               (per kalendermånad)
//
// Frågorna och betalväggen bor i src/lib/applications/afRapportData.ts, så
// att Sökta tjänsters serverladdare (Jobbsöket omgång 1) ger samma svar.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess';
import { logPremiumUsage } from '@/lib/premium/logPremiumUsage';
import { hamtaAfRapport, rapportManad } from '@/lib/applications/afRapportData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const url = new URL(request.url);
    const manad = rapportManad(url.searchParams.get('month'));

    // Betalväggen ligger på uttaget, aldrig på loggningen. Antalen är alltid
    // fria: de driver påminnelsen om deadline, och den som loggat sina jobb
    // ska alltid få veta att hon gjort det. Det är den sammanställda listan
    // som är arbetet vi tar betalt för, och därför utelämnas den serverside.
    const isPremium = await userHasPremiumAccess(supabase, user.id);

    let rapport;
    try {
      rapport = await hamtaAfRapport(supabase, user.id, manad, isPremium);
    } catch (appsError) {
      console.error('Rapport: kunde inte hämta ansökningar', appsError);
      return NextResponse.json({ error: 'Kunde inte hämta rapporten' }, { status: 500 });
    }

    if (!rapport.locked) {
      logPremiumUsage(user.id, 'af_report', { month: rapport.data.month });
    }

    return NextResponse.json({ success: true, locked: rapport.locked, data: rapport.data });
  } catch (error) {
    console.error('Rapporthämtning error:', error);
    return NextResponse.json({ error: 'Serverfel vid hämtning av rapport' }, { status: 500 });
  }
}
