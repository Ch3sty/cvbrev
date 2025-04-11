// src/app/api/cv/delete/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const requestData = await request.json().catch(() => ({}));
    const cvId = requestData.id;

    if (!cvId) {
      return NextResponse.json({ error: 'CV-ID saknas i begäran', code: 'MISSING_CV_ID' }, { status: 400 });
    }

    // Hämta CV-data för det specifika ID:t, kontrollera att användaren äger det
    const { data: cvData, error: cvFetchError } = await supabase
      .from('cv_texts')
      .select('original_file_path') // Hämta den sparade (rensade) sökvägen
      .eq('id', cvId)
      .eq('user_id', user.id)
      .single();

    if (cvFetchError) {
      if (cvFetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Inget CV hittades med detta ID eller du har inte behörighet', code: 'NO_CV_FOUND' }, { status: 404 });
      }
      console.error('Fel vid hämtning av CV för borttagning:', cvFetchError);
      return NextResponse.json({ error: `Databasfel: ${cvFetchError.message}` }, { status: 500 });
    }

    // *** KORRIGERING HÄR ***
    // Använd den fullständiga sökvägen från databasen
    const fullStoragePath = cvData.original_file_path;

    // Ta bort filen från storage med den *fullständiga* sökvägen
    if (fullStoragePath) {
      console.log(`🗑️ Attempting to remove storage object: ${fullStoragePath}`);
      const { error: storageError } = await supabase.storage
        .from('cvs')
        .remove([fullStoragePath]); // Använd fullStoragePath direkt

      if (storageError) {
        // Logga felet men fortsätt för att försöka ta bort DB-posten
        // (Filen kanske redan är borta eller så var sökvägen felaktig i DB av någon anledning)
        console.error(`❌ Error removing file from storage (${fullStoragePath}):`, storageError);
      } else {
        console.log(`✅ Successfully removed storage object: ${fullStoragePath}`);
      }
    } else {
      // Detta bör inte hända om posten finns, men som en säkerhetsåtgärd
      console.warn(`⚠️ CV record with ID ${cvId} found, but original_file_path was empty or null. Cannot remove from storage.`);
    }

    // Ta bort CV-data från databasen baserat på ID (Korrekt)
    const { error: deleteError } = await supabase
      .from('cv_texts')
      .delete()
      .eq('id', cvId)
      .eq('user_id', user.id); // Säkerställer att rätt användare tar bort

    if (deleteError) {
      console.error(`❌ Error deleting DB record for CV ID ${cvId}:`, deleteError);
      return NextResponse.json({ error: `Databasfel vid borttagning: ${deleteError.message}` }, { status: 500 });
    }

    console.log(`✅ Successfully deleted DB record for CV ID ${cvId}`);
    return NextResponse.json({
      success: true,
      message: 'CV borttaget',
      id: cvId
    });

  } catch (error: any) {
    console.error('💥 Top-level CV delete error:', error);
    return NextResponse.json({
      error: 'Serverfel vid borttagning av CV: ' + (error.message || 'Okänt fel')
    }, { status: 500 });
  }
}