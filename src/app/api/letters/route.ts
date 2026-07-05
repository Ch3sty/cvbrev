import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getActiveLetterIds, FREE_ACTIVE_LETTER_LIMIT } from '@/lib/letters/letter-quota';

// Hämta alla brev för inloggad användare
export async function GET(request: Request) {
  try {
    // Hämta cookies korrekt med Next.js 15.2 pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const url = new URL(request.url);
    const isSaved = url.searchParams.get('saved') === 'true';

    // Filtrera efter sparade brev om parametern finns
    let query = supabase
      .from('letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (isSaved !== null) {
      query = query.eq('is_saved', isSaved);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fel vid hämtning av brev:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Lås-flagga per brev: gratisanvändare har bara de 2 senast sparade
    // breven AKTIVA (updated_at DESC, fallback created_at). Resten är låsta.
    // Premium: allt är aktivt.
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const letters = Array.isArray(data) ? data : [];
    let payload = letters.map((letter) => ({ ...letter, isLocked: false }));

    if (profile?.subscription_tier !== 'premium') {
      const savedLetters = letters.filter((l) => l.is_saved === true);
      const activeIds = getActiveLetterIds(savedLetters, FREE_ACTIVE_LETTER_LIMIT);
      payload = letters.map((letter) => ({
        ...letter,
        isLocked: letter.is_saved === true && !activeIds.has(letter.id),
      }));
    }

    return NextResponse.json({ success: true, data: payload });
  } catch (error: any) {
    console.error('Brevhämtning error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid hämtning av brev' }, 
      { status: 500 }
    );
  }
}

// Skapa ett nytt brev manuellt med kontroll för maxantalet brev
export async function POST(request: Request) {
  try {
    // Hämta cookies korrekt med Next.js 15.2 pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta användarens prenumerationsnivå
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, email_verified_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      return NextResponse.json(
        { error: 'Kunde inte hämta användarprofil' },
        { status: 500 }
      );
    }

    // Hämta begäransdata
    const letterData = await request.json();

    // Validera nödvändiga fält
    if (!letterData.content) {
      return NextResponse.json(
        { error: 'Brevinnehåll krävs' },
        { status: 400 }
      );
    }

    // Check email verification for free users FIRST (before saved letter limit)
    // Raknar bara SPARADE brev (is_saved = true) - inte rader som auto-skapas
    // vid generering. Annars blockeras anvandaren redan vid sitt forsta sparforsok.
    if (profile.subscription_tier === 'free' && !profile.email_verified_at) {
      const { count: savedLetterCount, error: totalCountError } = await supabase
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_saved', true);

      if (totalCountError) {
        console.error('Fel vid räkning av sparade brev:', totalCountError);
        return NextResponse.json(
          { error: 'Kunde inte verifiera antal brev' },
          { status: 500 }
        );
      }

      if (savedLetterCount !== null && savedLetterCount >= 1) {
        return NextResponse.json(
          {
            error: 'Du måste verifiera din e-post för att spara fler brev. Kontrollera din inkorg eller begär ett nytt verifieringsmejl.',
            code: 'EMAIL_NOT_VERIFIED',
            verification_required: true
          },
          { status: 403 }
        );
      }
    }

    // Sparande är alltid tillåtet (ingen hård spargräns längre). För
    // gratisanvändare är i stället bara de 2 senast sparade breven AKTIVA —
    // äldre brev låses via isLocked i GET och spärras för redigering i PUT.

    // Extrahera AI-metadata från letterData eller ai_metadata objekt
    const aiModel = letterData.ai_model ||
                  (letterData.ai_metadata && letterData.ai_metadata.model);
    const aiTokens = letterData.ai_tokens ||
                   (letterData.ai_metadata && letterData.ai_metadata.tokens?.total) ||
                   (letterData.ai_metadata && letterData.ai_metadata.tokens);
    const aiCost = letterData.ai_cost ||
                 (letterData.ai_metadata && letterData.ai_metadata.cost);
    const generationTimeMs = letterData.generation_time_ms;

    // Försök hitta befintlig preview (is_saved = false) om preview_id finns
    let existingPreview = null;
    if (letterData.id) {
      // Exakt matchning via ID (bästa metoden)
      const { data: previewById } = await supabase
        .from('letters')
        .select('*')
        .eq('id', letterData.id)
        .eq('user_id', user.id)
        .eq('is_saved', false)
        .single();

      existingPreview = previewById;
    }

    let data, error;

    if (existingPreview) {
      // Uppdatera befintlig preview till sparad
      console.log(`Uppdaterar befintlig preview ${existingPreview.id} till is_saved=true`);

      const { data: updatedData, error: updateError } = await supabase
        .from('letters')
        .update({
          is_saved: true,
          // Uppdatera content om det har ändrats (t.ex. användare redigerade)
          content: letterData.content,
          // Uppdatera övriga fält om de finns
          title: letterData.title || existingPreview.title,
          company: letterData.company || existingPreview.company,
          job_title: letterData.job_title || existingPreview.job_title,
          tonality: letterData.tonality || existingPreview.tonality,
          template_id: letterData.template_id || existingPreview.template_id || 'classic'
        })
        .eq('id', existingPreview.id)
        .select();

      data = updatedData;
      error = updateError;
    } else {
      // Ingen befintlig preview - skapa nytt brev (fallback för manuella brev)
      console.log('Ingen befintlig preview hittades, skapar nytt brev');

      const { data: insertedData, error: insertError } = await supabase
        .from('letters')
        .insert({
          user_id: user.id,
          title: letterData.title || 'Ansökningsbrev',
          company: letterData.company,
          job_title: letterData.job_title,
          content: letterData.content,
          tonality: letterData.tonality || 'professional',
          template_id: letterData.template_id || 'classic', // ✅ Spara mall-ID
          job_description: letterData.job_description,
          cv_text: letterData.cv_text,
          is_saved: letterData.is_saved !== undefined ? letterData.is_saved : true,
          cv_path: letterData.cv_path,
          language: letterData.language || 'sv',
          // Lägg till AI-metadata
          ai_model: aiModel,
          ai_tokens: aiTokens,
          ai_cost: aiCost,
          generation_time_ms: generationTimeMs
        })
        .select();

      data = insertedData;
      error = insertError;
    }

    if (error || !data || data.length === 0) {
      console.error('Fel vid skapande av brev:', error);
      return NextResponse.json({ error: error?.message || 'Kunde inte skapa brev' }, { status: 500 });
    }

    // Update onboarding progress - mark create_letter step as completed
    const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
      user_id: user.id,
      step_name: 'create_letter'
    });
    if (onboardingError) {
      console.error('Failed to update onboarding progress:', onboardingError.message);
    }

    // Award XP for creating a letter
    try {
      const xpResponse = await fetch(`${request.headers.get('origin')}/api/gamification/award-xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          amount: 25,
          source: 'letter_created',
          sourceId: data[0].id,
          description: 'Skapade ett personligt brev'
        })
      });

      if (!xpResponse.ok) {
        console.error('Failed to award XP for letter creation');
      }
    } catch (xpError) {
      console.error('Error awarding XP:', xpError);
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    });
  } catch (error: any) {
    console.error('Brevskapande error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid skapande av brev' }, 
      { status: 500 }
    );
  }
}