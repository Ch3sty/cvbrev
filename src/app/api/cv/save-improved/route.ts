// src/app/api/cv/save-improved/route.ts
/**
 * API endpoint for saving improved CV text to cv_texts table
 * Includes CV quota validation based on subscription tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

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

    // Validate text length (Supabase text column typically has limits)
    if (improvedText.length > 100000) {
      return NextResponse.json(
        { error: 'Text too long', message: 'CV-texten är för lång (max 100 000 tecken)' },
        { status: 400 }
      );
    }

    // Get original file path if originalCvId is provided
    let originalFilePath = `ai-improved/${user.id}/${Date.now()}-${fileName}.txt`;

    if (originalCvId) {
      const { data: originalCv } = await supabase
        .from('cv_texts')
        .select('original_file_path')
        .eq('id', originalCvId)
        .single();

      if (originalCv?.original_file_path) {
        // Use original's path with "-improved" suffix
        const pathParts = originalCv.original_file_path.split('.');
        if (pathParts.length > 1) {
          pathParts[pathParts.length - 2] += '-improved';
          originalFilePath = pathParts.join('.');
        } else {
          originalFilePath = `${originalCv.original_file_path}-improved`;
        }
      }
    }

    // Save improved CV
    const { data: newCv, error: insertError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: user.id,
        file_name: fileName,
        original_file_path: originalFilePath,
        cv_text: improvedText
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting CV:', insertError);
      console.error('Insert error details:', JSON.stringify(insertError, null, 2));
      return NextResponse.json(
        {
          error: 'Database error',
          message: `Kunde inte spara CV: ${insertError.message || 'Okänt fel'}`,
          details: insertError.hint || insertError.details
        },
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
