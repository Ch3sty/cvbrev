// src/app/api/cv/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET endpoint for fetching CV (Korrigerad)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta CV-metadata från databasen (oförändrat)
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cvError) {
      if (cvError.code === 'PGRST116') { // Ingen CV hittad
        return NextResponse.json({ success: true, data: null });
      }
      console.error('Fel vid hämtning av CV (GET DB):', cvError);
      return NextResponse.json({ error: `Databasfel: ${cvError.message}` }, { status: 500 });
    }

    // Hämta publik URL för filen (KORRIGERAD HANTERING)
    let publicUrl = null;
    if (cvData.original_file_path) {
      try {
        // Hämta endast data-objektet
        const { data: urlData } = supabase.storage
          .from('cvs')
          .getPublicUrl(cvData.original_file_path); // Använder korrekt rensad sökväg från DB

        // Kontrollera om publicUrl finns inuti data
        if (urlData && urlData.publicUrl) {
          publicUrl = urlData.publicUrl;
        } else {
          // Logga om URL inte kunde hämtas, men fortsätt utan att krascha
          console.warn(`Kunde inte hämta publicUrl för storage path: ${cvData.original_file_path}`);
        }
      } catch (storageError: any) {
          // Fånga eventuella oväntade fel från getPublicUrl-anropet
          console.error(`Oväntat fel vid getPublicUrl för ${cvData.original_file_path}:`, storageError.message || storageError);
          // Fortsätt utan publicUrl
      }
    } else {
        console.warn(`CV record ID ${cvData.id} har ingen original_file_path.`);
    }

    // Returnera databasdata och den eventuellt hämtade URL:en
    return NextResponse.json({
      success: true,
      data: {
        ...cvData,
        publicUrl // Kan vara null om hämtning misslyckades eller sökväg saknades
      }
    });
  } catch (error: any) {
    console.error('Toppnivåfel vid hämtning av CV (GET):', error);
    return NextResponse.json({ error: 'Serverfel vid hämtning av CV: ' + (error.message || 'Okänt fel') }, { status: 500 });
  }
}

// DELETE endpoint (Oförändrad från förra korrigeringen - bör vara korrekt nu)
export async function DELETE() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
        }

        // 1. Hämta ALLA CV-poster för användaren
        const { data: allCvData, error: cvFetchError } = await supabase
            .from('cv_texts')
            .select('id, original_file_path')
            .eq('user_id', user.id);

        if (cvFetchError && cvFetchError.code !== 'PGRST116') {
            console.error('Fel vid hämtning av CV-lista för borttagning:', cvFetchError);
            return NextResponse.json({ error: `Databasfel: ${cvFetchError.message}` }, { status: 500 });
        }

        // Om inga CV:n finns, returnera success
        if (!allCvData || allCvData.length === 0) {
             console.log(`Inga CV-poster hittades för användare ${user.id} att ta bort.`);
             return NextResponse.json({ success: true, message: 'Inga CV fanns att ta bort' });
        }

        // 2. Försök ta bort varje fil från storage
        const storageRemovalErrors: { path: string, error: any }[] = [];
        const filePathsToRemove = allCvData
            .map(cv => cv.original_file_path)
            .filter((path): path is string => !!path);

        if (filePathsToRemove.length > 0) {
            console.log(`🗑️ Attempting to remove ${filePathsToRemove.length} storage object(s) for user ${user.id}:`, filePathsToRemove);
            const { data: removedFiles, error: storageError } = await supabase.storage
                .from('cvs')
                .remove(filePathsToRemove); // Korrekt: använder fullständiga sökvägar

            if (storageError) {
                console.error(`❌ Error during bulk storage removal for user ${user.id}:`, storageError);
                storageRemovalErrors.push({ path: 'bulk_remove', error: storageError });
            } else {
                 console.log(`✅ Successfully initiated bulk removal for ${filePathsToRemove.length} files.`);
            }
        } else {
             console.log(`Inga CV-poster med sökvägar hittades för användare ${user.id}.`);
        }

        // 3. Ta bort ALLA användarens poster från databasen
        const { error: deleteError } = await supabase
            .from('cv_texts')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error(`❌ Error deleting DB records for user ${user.id}:`, deleteError);
            return NextResponse.json({ error: `Databasfel vid borttagning: ${deleteError.message}` }, { status: 500 });
        }
        console.log(`✅ Successfully deleted DB records for user ${user.id}.`);

        return NextResponse.json({
            success: true,
            message: storageRemovalErrors.length > 0
                ? 'Alla CV-poster borttagna från databasen, men problem uppstod vid borttagning av en eller flera filer från lagring.'
                : 'Alla CV och tillhörande filer borttagna.',
            storageErrors: storageRemovalErrors.length > 0 ? storageRemovalErrors : undefined
        });

    } catch (error: any) {
        console.error('💥 Top-level CV delete error:', error);
        return NextResponse.json({ error: 'Serverfel vid borttagning av CV: ' + (error.message || 'Okänt fel') }, { status: 500 });
    }
}