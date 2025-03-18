import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Hämta cookies korrekt med Next.js 14 pattern
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: () => cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta CV-metadata från databasen
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cvError) {
      // Ingen CV hittad är inte nödvändigtvis ett fel
      if (cvError.code === 'PGRST116') {
        return NextResponse.json({ 
          success: true, 
          data: null 
        });
      }
      
      return NextResponse.json({ error: cvError.message }, { status: 500 });
    }

    // Hämta publik URL för filen
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(cvData.original_file_path);

    return NextResponse.json({ 
      success: true, 
      data: {
        ...cvData,
        publicUrl
      }
    });
  } catch (error) {
    console.error('CV hämtning error:', error);
    return NextResponse.json({ error: 'Serverfel vid hämtning av CV' }, { status: 500 });
  }
}