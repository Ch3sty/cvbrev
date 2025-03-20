// src/app/api/cv/delete/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(request: Request) {
  try {
    // Hämta cookies korrekt med Next.js pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta CV-ID från begäran
    const requestData = await request.json().catch(() => ({}));
    const cvId = requestData.id;

    if (!cvId) {
      return NextResponse.json({ 
        error: 'CV-ID saknas i begäran', 
        code: 'MISSING_CV_ID' 
      }, { status: 400 });
    }

    // Hämta CV-data för det specifika ID:t, kontrollera att användaren äger det
    const { data: cvData, error: cvFetchError } = await supabase
      .from('cv_texts')
      .select('original_file_path')
      .eq('id', cvId)
      .eq('user_id', user.id)
      .single();

    if (cvFetchError) {
      // Om det är ett "ingen data hittades"-fel, returnera ett anpassat svar
      if (cvFetchError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Inget CV hittades med detta ID eller du har inte behörighet', 
          code: 'NO_CV_FOUND' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ error: cvFetchError.message }, { status: 500 });
    }

    // Extrahera filsökvägen från URL för att få rätt path för storage-objektet
    const filePath = cvData.original_file_path.split('/').pop();
    
    // Ta bort filen från storage
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('cvs')
        .remove([filePath]);
      
      if (storageError) {
        console.error('Fel vid borttagning av fil från storage:', storageError);
        // Vi fortsätter ändå för att ta bort metadata från databasen
      }
    }

    // Ta bort CV-data från databasen - VIKTIGT: Nu använder vi ID för att ta bort ett specifikt CV
    const { error: deleteError } = await supabase
      .from('cv_texts')
      .delete()
      .eq('id', cvId)
      .eq('user_id', user.id); // Extra säkerhet: se till att användaren äger CV:t

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'CV borttaget',
      id: cvId // Returnera ID:t för det borttagna CV:t för klientens bekräftelse
    });
    
  } catch (error: any) {
    console.error('CV borttagning error:', error);
    return NextResponse.json({ 
      error: 'Serverfel vid borttagning av CV: ' + error.message 
    }, { status: 500 });
  }
}