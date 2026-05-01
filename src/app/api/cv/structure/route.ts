// src/app/api/cv/structure/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCV as parseCVStructure } from '@/lib/cv/cv-parser';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/cv/structure
 * Body: { cvId: string }
 *
 * Parsar ett befintligt CV:s rå-text till strukturerad data och sparar
 * den i cv_texts.structured_data. Anvands for:
 * - retroaktiv strukturering av gamla CV:n (uppladdade innan strukturerad
 *   data sparades automatiskt)
 * - re-parsning efter att anvandaren redigerat raw-texten i /edit-vyn
 */
export async function POST(request: Request) {
  try {
    const { cvId } = (await request.json()) as { cvId?: string };
    if (!cvId) {
      return NextResponse.json({ error: 'Saknar cvId' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const { data: cvRow, error: fetchError } = await supabase
      .from('cv_texts')
      .select('id, user_id, cv_text')
      .eq('id', cvId)
      .single();

    if (fetchError || !cvRow) {
      return NextResponse.json({ error: 'CV:t hittades inte' }, { status: 404 });
    }

    if (cvRow.user_id !== user.id) {
      return NextResponse.json({ error: 'Ej behörig' }, { status: 403 });
    }

    if (!cvRow.cv_text || cvRow.cv_text.length < 50) {
      return NextResponse.json(
        { error: 'CV:t innehåller för lite text för att strukturera.' },
        { status: 400 }
      );
    }

    const structured = await parseCVStructure(cvRow.cv_text);

    const { error: updateError } = await supabase
      .from('cv_texts')
      .update({ structured_data: structured as any })
      .eq('id', cvId);

    if (updateError) {
      console.error('[cv/structure] DB update failed:', updateError);
      return NextResponse.json(
        { error: 'Kunde inte spara strukturerad data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: structured });
  } catch (error: any) {
    console.error('[cv/structure] unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Okänt fel vid strukturering' },
      { status: 500 }
    );
  }
}
