// src/app/api/letters/[id]/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { userHasAccess } from '@/lib/supabase/premiumAccess';
import {
  LAST_SVAR,
  arBrevLastForAnvandare,
  hamtaBrevProfil,
  hamtaSokta,
  ritaRad,
  startmallForCv,
} from '@/lib/letters/server';
import { kravForBrev } from '@/lib/letters/lage';
import { premiumSparr } from '@/lib/letters/brevRegler';
import { slaIhopAndring, tolkaBrevAndring } from '@/lib/letters/brevAndring';

/**
 * Hämta ett brev. Ett låst brev hämtas som vilket brev som helst, med
 * isLocked: true, så att vyn kan visa det som låst och aldrig som "Brevet
 * kunde inte hittas" (fynd 5). Svaret bär även kravTraffar, soktDatum och
 * ansokanId.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('Fel vid hämtning av brev:', error);
      return NextResponse.json({ error: 'Kunde inte hitta brevet' }, { status: 404 });
    }

    const harBetalt = await userHasAccess(supabase, user.id, 'any');
    const [isLocked, sokta] = await Promise.all([
      arBrevLastForAnvandare(supabase, user.id, id, harBetalt),
      hamtaSokta(supabase, user.id, [id]),
    ]);
    const sokt = sokta.get(id);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        isLocked,
        kravTraffar: kravForBrev(data),
        soktDatum: sokt?.applied_at ?? null,
        ansokanId: sokt?.id ?? null,
      },
      harBetalt,
    });
  } catch (error: any) {
    console.error('Brevhämtning error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid hämtning av brev' }, 
      { status: 500 }
    );
  }
}

/**
 * Ändra ett brev utan AI och utan att dra kvot (BYGGSPEC avsnitt 4):
 * stycken (eller body_stycken), halsning, mall_id, font_id, title, company,
 * job_title och mottagare_person. Äldre klienter får fortfarande skicka
 * content och is_saved. Övriga fält ignoreras.
 *
 * - Låst brev (gratis, äldre än de två senast uppdaterade): 403 letter_locked.
 * - Premiummall eller Helvetica för gratis: 402 premium_required med sparr.
 * - Gammalt brev flyttas till nya formatet vid första ändringen.
 * - content räknas om när något som syns på arket ändras.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
    }
    const tolkat = tolkaBrevAndring(body);
    if (!tolkat.ok) {
      return NextResponse.json({ error: tolkat.fel, code: 'invalid_field', falt: tolkat.falt }, { status: 400 });
    }
    const andring = tolkat.andring;

    // Verifiera att användaren äger brevet
    const { data: existingLetter, error: fetchError } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingLetter) {
      return NextResponse.json({ error: 'Brevet hittades inte' }, { status: 404 });
    }

    if (existingLetter.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att uppdatera detta brev' },
        { status: 403 }
      );
    }

    // Behörigheten via premiumAccess, så att engångsköp och admin räknas.
    const harBetalt = await userHasAccess(supabase, user.id, 'any');

    // Låset: samma regel som listan (src/lib/letters/lista.ts).
    if (await arBrevLastForAnvandare(supabase, user.id, id, harBetalt)) {
      return NextResponse.json(LAST_SVAR, { status: 403 });
    }

    // Premium på servern: mallen och typsnittet (bara det som ändras).
    const sparr = premiumSparr({ mallId: andring.mall_id ?? null, fontId: andring.font_id ?? null }, harBetalt);
    if (sparr) {
      return NextResponse.json({ error: 'premium_required', code: 'premium_required', sparr }, { status: 402 });
    }

    const { profil, cvStrukturerad } = await hamtaBrevProfil(supabase, user.id, existingLetter.cv_id ?? null);
    const startmall = startmallForCv(cvStrukturerad, harBetalt);
    const { rad, ritaOm } = slaIhopAndring(existingLetter, andring, startmall);

    const uppdatering: Record<string, unknown> = { ...andring, updated_at: new Date().toISOString() };
    if (rad.body_stycken !== existingLetter.body_stycken) uppdatering.body_stycken = rad.body_stycken;
    if (rad.mall_id !== existingLetter.mall_id) uppdatering.mall_id = rad.mall_id;
    if (ritaOm) uppdatering.content = ritaRad(rad, profil, user);

    const { data, error } = await supabase
      .from('letters')
      .update(uppdatering)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error || !data?.[0]) {
      console.error('Fel vid uppdatering av brev:', error);
      return NextResponse.json({ error: error?.message ?? 'Kunde inte spara brevet' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { ...data[0], isLocked: false, kravTraffar: kravForBrev(data[0]) }
    });
  } catch (error: any) {
    console.error('Brevuppdatering error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid uppdatering av brev' }, 
      { status: 500 }
    );
  }
}

// Ta bort ett brev
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // I Next.js 15.2 måste params awaitadas innan man använder dess egenskaper
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Hämta cookies korrekt med Next.js 15.2 pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Verifiera att användaren äger brevet
    const { data: existingLetter, error: fetchError } = await supabase
      .from('letters')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (fetchError || !existingLetter) {
      return NextResponse.json(
        { error: 'Brevet hittades inte' }, 
        { status: 404 }
      );
    }
    
    if (existingLetter.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att ta bort detta brev' }, 
        { status: 403 }
      );
    }

    // Ta bort brevet från databasen
    const { error } = await supabase
      .from('letters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Fel vid borttagning av brev:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Brevet har tagits bort'
    });
  } catch (error: any) {
    console.error('Brevborttagning error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid borttagning av brev' }, 
      { status: 500 }
    );
  }
}