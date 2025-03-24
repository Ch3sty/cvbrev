// src/app/api/cv/update/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    // Hämta cookies korrekt med Next.js pattern
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta begäransdata (CV-ID och uppdaterad text)
    const { id, cv_text } = await request.json();
    
    if (!id || cv_text === undefined) {
      return NextResponse.json(
        { error: 'CV-ID och text krävs' }, 
        { status: 400 }
      );
    }

    // Uppdatera CV-text i databasen
    const { data, error } = await supabase
      .from('cv_texts')
      .update({
        cv_text: cv_text,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Fel vid uppdatering av CV:', error);
      return NextResponse.json(
        { error: 'Kunde inte uppdatera CV-texten' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });
  } catch (error: any) {
    console.error('CV-uppdatering error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid uppdatering av CV: ' + error.message }, 
      { status: 500 }
    );
  }
}