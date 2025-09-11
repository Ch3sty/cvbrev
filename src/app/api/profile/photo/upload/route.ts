import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies();
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Ingen fil skickad' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Filtyp stöds inte. Endast JPG, PNG och WebP tillåts.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Filen är för stor. Max 2MB tillåts.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `profile-photo-${timestamp}.${fileExtension}`;
    const filePath = `users/${user.id}/${fileName}`;

    // Convert File to ArrayBuffer for Supabase upload
    const fileBuffer = await file.arrayBuffer();

    // Remove old profile photo if exists
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('profile_photo_path')
      .eq('id', user.id)
      .single();

    if (currentProfile?.profile_photo_path) {
      // Delete old photo from storage (don't block on this)
      await supabase.storage
        .from('profile-photos')
        .remove([currentProfile.profile_photo_path]);
    }

    // Upload new photo to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Uppladdning till lagringsservice misslyckades' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded photo
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update user profile with new photo URLs
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        profile_photo_url: publicUrl,
        profile_photo_path: filePath,
        profile_photo_uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      
      // Cleanup: remove uploaded file if profile update fails
      await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      return NextResponse.json(
        { error: 'Kunde inte uppdatera profil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photoUrl: publicUrl,
      message: 'Profilbild uppladdad framgångsrikt'
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    );
  }
}