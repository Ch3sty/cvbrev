// src/app/api/cv/save-improved/route.ts
/**
 * API endpoint for saving improved CV text to cv_texts table
 * Includes CV quota validation based on subscription tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Du måste vara inloggad' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { fileName, improvedText, originalCvId } = body;

    if (!fileName || !improvedText) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Filnamn och CV-text krävs' },
        { status: 400 }
      );
    }

    // Get subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Continue with free tier as fallback
    }

    const subscriptionTier = profile?.subscription_tier || 'free';
    const maxCvs = subscriptionTier === 'premium' ? 50 : 5;

    // Check current CV count
    const { count, error: countError } = await supabase
      .from('cv_texts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error counting CVs:', countError);
      return NextResponse.json(
        { error: 'Database error', message: 'Kunde inte kontrollera CV-kvot' },
        { status: 500 }
      );
    }

    // Check quota limit
    if ((count || 0) >= maxCvs) {
      return NextResponse.json(
        {
          error: 'CV limit reached',
          message: `Du har nått din gräns på ${maxCvs} CV:n. ${
            subscriptionTier === 'free'
              ? 'Uppgradera till Premium för att få upp till 50 CV:n.'
              : 'Ta bort några CV:n för att kunna spara nya.'
          }`,
          currentCount: count,
          maxCvs
        },
        { status: 403 }
      );
    }

    // Save improved CV
    const { data: newCv, error: insertError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: user.id,
        file_name: fileName,
        cv_text: improvedText
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting CV:', insertError);
      return NextResponse.json(
        { error: 'Database error', message: 'Kunde inte spara CV' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cvId: newCv.id,
      message: 'CV sparat framgångsrikt!',
      currentCount: (count || 0) + 1,
      maxCvs
    });

  } catch (error) {
    console.error('Unexpected error in save-improved endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Ett oväntat fel uppstod' },
      { status: 500 }
    );
  }
}
