import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { markFirstMilestone } from '@/lib/activation-tracking';
import { createServerClient } from '@/lib/supabase/server';
import { userHasAccess } from '@/lib/supabase/premiumAccess';
import { hamtaBrevlista } from '@/lib/letters/server';
import { styckenFranContent } from '@/lib/letters/stycken';

/**
 * Hämta användarens brev: listan Dina brev (BYGGSPEC avsnitt 4).
 *
 * Alla brev, senast uppdaterade först, avdubblade (bland osparade rader med
 * samma annons visas bara den senaste), med isLocked (gratis: de två senast
 * uppdaterade är öppna), soktDatum, ansokanId och kravTraffar per brev, och
 * kvoten. Filtret på is_saved är borttaget: ?saved=true tas emot men
 * ignoreras, så äldre klienter fungerar.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const { brev, harBetalt, kvot } = await hamtaBrevlista(supabase, user.id);
    return NextResponse.json({ success: true, data: brev, harBetalt, kvot });
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
    // Behörigheten via premiumAccess, så att engångsköp och admin räknas.
    if (!profile.email_verified_at && !(await userHasAccess(supabase, user.id, 'any'))) {
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

    // Försök hitta befintlig rad om id skickas med.
    //
    // Filtret .eq('is_saved', false) låg här förut, och det gjorde anropet
    // icke-idempotent: gick svaret förlorat på vägen tillbaka (mobilt nät) var
    // raden redan sparad, så nästa försök hittade ingen preview och la in en
    // dubblett i stället. Vi matchar på id + user_id och uppdaterar raden
    // oavsett dess nuvarande is_saved.
    let existingPreview = null;
    if (letterData.id) {
      // Exakt matchning via ID (bästa metoden)
      const { data: previewById } = await supabase
        .from('letters')
        .select('*')
        .eq('id', letterData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      existingPreview = previewById;
    }

    let data, error;

    if (existingPreview) {
      // Uppdatera befintlig preview till sparad
      console.log(`Uppdaterar befintlig preview ${existingPreview.id} till is_saved=true`);

      // Brev i nya formatet: content som ändrats i den äldre förhandsvisningen
      // läses tillbaka till styckena, så att källan och content håller ihop.
      const nyaStycken =
        existingPreview.mall_id && letterData.content && letterData.content !== existingPreview.content
          ? { body_stycken: styckenFranContent(letterData.content) }
          : {};

      const { data: updatedData, error: updateError } = await supabase
        .from('letters')
        .update({
          is_saved: true,
          // Uppdatera content om det har ändrats (t.ex. användare redigerade)
          content: letterData.content,
          ...nyaStycken,
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

    // B7: första brevet. Coalesce via service role, tyst vid fel.
    await markFirstMilestone(user.id, 'first_letter_created_at');

    // Update onboarding progress - mark create_letter step as completed
    const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
      user_id: user.id,
      step_name: 'create_letter'
    });
    if (onboardingError) {
      console.error('Failed to update onboarding progress:', onboardingError.message);
    }

    // XP och nivåer togs bort i omdesignen (docs/plan-inloggat-omdesign.md,
    // våg 2 punkt 21). Brevet är belöningen, inte poängen för att ha skrivit
    // det. Onboarding-flaggan ovan står kvar, den styr fortfarande flödet.

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