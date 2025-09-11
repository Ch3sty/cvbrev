import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Ej auktoriserad' },
        { status: 401 }
      );
    }

    // Get current profile photo path
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('profile_photo_path, profile_photo_url')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Kunde inte hämta profilinformation' },
        { status: 500 }
      );
    }

    if (!currentProfile?.profile_photo_path) {
      return NextResponse.json(
        { error: 'Ingen profilbild att ta bort' },
        { status: 400 }
      );
    }

    // Delete photo from storage
    const { error: deleteError } = await supabase.storage
      .from('profile-photos')
      .remove([currentProfile.profile_photo_path]);

    if (deleteError) {
      console.error('Storage delete error:', deleteError);
      return NextResponse.json(
        { error: 'Kunde inte ta bort bild från lagringsservice' },
        { status: 500 }
      );
    }

    // Update profile to remove photo references
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        profile_photo_url: null,
        profile_photo_path: null,
        profile_photo_uploaded_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Kunde inte uppdatera profil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profilbild borttagen framgångsrikt'
    });

  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    );
  }
}