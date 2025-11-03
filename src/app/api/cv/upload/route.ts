// src/app/api/cv/upload/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCV, createPlaceholderText } from '@/lib/cv-parser';
import { sanitizeStorageKey } from '@/utils/helpers'; // Importera rensning för storage key

// --- HJÄLPFUNKTION FÖR ATT SANERA TEXT FÖR DATABAS (Enkel version) ---
// Tar bort vissa kontrolltecken som *kan* orsaka problem.
function escapeDatabasePlaceholder(text: string): string {
    // Tar bort de flesta kontrolltecken utom vanliga whitespace (tab, newline, etc.)
    // Anpassa vid behov om specifika tecken orsakar problem.
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}
// --- ---

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'Ingen fil hittades' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // --- (Kod för prenumerationskontroll - oförändrad) ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, email_verified_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 });
    }

    // Check email verification for free users FIRST (before saved CV limit)
    if (profile.subscription_tier === 'free' && !profile.email_verified_at) {
      const { count: cvCount, error: cvCountError } = await supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (cvCountError) {
        console.error('Fel vid räkning av CV:n:', cvCountError);
        return NextResponse.json({ error: 'Kunde inte verifiera antal CV:n' }, { status: 500 });
      }

      if (cvCount !== null && cvCount >= 1) {
        return NextResponse.json(
          {
            error: 'Du måste verifiera din e-post för att ladda upp fler CV:n. Kontrollera din inkorg eller begär ett nytt verifieringsmejl.',
            code: 'EMAIL_NOT_VERIFIED',
            verification_required: true
          },
          { status: 403 }
        );
      }
    }

    // Check saved CV limit for free users (existing check)
    if (profile.subscription_tier === 'free') {
      const { count, error: countError } = await supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Fel vid räkning av CV:n:', countError);
        return NextResponse.json({ error: 'Kunde inte verifiera antal CV:n' }, { status: 500 });
      }

      if (count !== null && count >= 2) {
        return NextResponse.json(
          { error: 'Som gratisanvändare kan du bara ha 2 CV. Uppgradera till premium för att hantera flera CV:n.', code: 'CV_LIMIT_REACHED' },
          { status: 403 }
        );
      }
    }
    // --- ---

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const userFolder = `users/${user.id}`;
    const originalFileName = file.name;
    const sanitizedFileName = sanitizeStorageKey(originalFileName);
    const storageFilePath = `${userFolder}/${sanitizedFileName}`;

    console.log(`ℹ️ Original filename: ${originalFileName}`);
    console.log(`🔒 Sanitized storage key: ${storageFilePath}`);

    // VALIDERA TEXT EXTRACTION FÖRST - innan vi laddar upp till storage
    let extractedText = '';
    let textExtractionFailed = false;
    let placeholderUsed = false;

    try {
      console.log(`📄 Starting text extraction for ${originalFileName} using parseCV...`);

      // Använd parseCV från lib för alla filtyper istället för egen logik
      extractedText = await parseCV(file);

      // Kontrollera om vi fick felmeddelande från parseCV
      const knownErrorMessages = [
        "Kunde inte läsa", "Misslyckades med att läsa", "PDF-texten kunde inte",
        "Filformatet stöds inte", 'Kunde inte ladda DOCX-parsningsbiblioteket',
        'Kunde inte extrahera text från DOCX-filen (tom fil)',
        'PDF-filen innehåller endast' // Bildbaserad PDF-varning
      ];

      if (knownErrorMessages.some(msg => extractedText.startsWith(msg))) {
        console.warn(`⚠️ parseCV returned an error for ${originalFileName}: ${extractedText}`);

        // BLOCKERA uppladdning om det är bildbaserad PDF
        if (extractedText.includes('PDF-filen innehåller endast')) {
          return NextResponse.json({
            error: 'IMAGE_BASED_PDF',
            message: extractedText,
            code: 'IMAGE_BASED_PDF'
          }, { status: 400 });
        }

        textExtractionFailed = true;
        extractedText = createPlaceholderText(file);
        placeholderUsed = true;
      }

      // Längdkontroll som fallback - BLOCKERA istället för placeholder
      if (!textExtractionFailed && (!extractedText || extractedText.length < 50)) {
        console.warn(`⚠️ Extracted text for ${originalFileName} is too short or empty (${extractedText?.length || 0} chars). Blocking upload.`);

        return NextResponse.json({
          error: 'INSUFFICIENT_TEXT',
          message: `PDF-filen innehåller endast ${extractedText?.length || 0} tecken text.

Detta beror troligen på att:
1. PDF:en innehåller text som bilder (inte selekterbar text)
2. PDF:en exporterades som "Utskrift" istället för "Redigering"

Lösning:
1. Öppna ditt CV i Word/Pages/Google Docs
2. Välj: Arkiv → Exportera → PDF
3. Kontrollera att texten ÄR selekterbar (testa att markera text med musen)
4. Ladda upp den nya PDF:en

Alternativt: Ladda upp som .DOCX istället.`,
          code: 'IMAGE_BASED_PDF',
          extractedLength: extractedText?.length || 0
        }, { status: 400 });
      }

    } catch (error: any) {
      console.error(`❌ Unexpected CV parsing error for ${originalFileName}:`, error.message || error);
      return NextResponse.json({
        error: 'PARSING_ERROR',
        message: 'Ett oväntat fel uppstod vid läsning av filen. Kontrollera att filen inte är skadad.',
        code: 'PARSING_ERROR'
      }, { status: 500 });
    }

    // --- SANERING AV TEXTEN SOM SKA SPARAS ---
    let textToSave = extractedText;
    if (placeholderUsed) {
        console.log("Sanitizing placeholder text before DB insert.");
        textToSave = escapeDatabasePlaceholder(extractedText);
    }
    // --- ---

    // NU LADDA UPP TILL STORAGE (efter text-validering)
    try {
      const { data: folderExists } = await supabase.storage.from('cvs').list(userFolder);
      if (!folderExists || folderExists.length === 0) {
        console.log(`Creating folder placeholder for ${userFolder}`);
        await supabase.storage.from('cvs').upload(`${userFolder}/.placeholder`, new Blob([''], { type: 'text/plain' }));
      }
    } catch (folderError) {
      console.log('Mappkontroll/-skapande fel (kan ignoreras om uppladdning lyckas):', folderError);
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(storageFilePath, file, { upsert: true });

    if (uploadError) {
      console.error(`❌ Storage upload error for key ${storageFilePath}:`, uploadError);
      if (uploadError.message.includes('Invalid Input') || uploadError.message.includes('invalid key')) {
         return NextResponse.json({ error: `Ogiltigt filnamn för lagring: ${originalFileName}` }, { status: 400 });
      }
      return NextResponse.json({ error: `Storagefel: ${uploadError.message}` }, { status: 500 });
    }

    let publicUrl = null;
    let urlError: any = null;
    if (storageFilePath) {
      try {
        const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(storageFilePath);
        if (urlData && urlData.publicUrl) {
          publicUrl = urlData.publicUrl;
          console.log(`✅ Successfully retrieved public URL: ${publicUrl}`);
        } else {
          console.warn(`⚠️ Kunde inte hämta publicUrl för storage path: ${storageFilePath}. urlData:`, urlData);
        }
      } catch (storageError: any) {
          console.error(`❌ Oväntat fel vid getPublicUrl för ${storageFilePath}:`, storageError.message || storageError);
          urlError = storageError;
      }
    } else {
        console.warn("⚠️ storageFilePath var tom, kan inte hämta public URL.");
    }

    // Spara metadata i databasen
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: user.id,
        file_name: title || originalFileName,
        original_file_path: storageFilePath,
        cv_text: textToSave, // Använd den (potentiellt) sanerade texten
        text_extraction_failed: textExtractionFailed // Flagga om parsning misslyckades
      })
      .select()
      .single();

    if (cvError) {
      console.error(`❌ DB insert error:`, cvError);
      // Här loggar vi den *osanerade* texten om DB-insert misslyckas,
      // för att se om saneringen tog bort något som orsakade problemet,
      // eller om felet ligger någon annanstans (t.ex. databasschema).
      console.error("Text that caused DB error (original extracted/placeholder):", extractedText);
      return NextResponse.json({ error: `Databasfel: ${cvError.message}` }, { status: 500 });
    }

    // Update onboarding progress - mark upload_cv step as completed
    try {
      await supabase.rpc('update_onboarding_progress', {
        user_id: user.id,
        step_name: 'upload_cv'
      });
    } catch (onboardingError) {
      // Don't fail the upload if onboarding update fails
      console.error('Failed to update onboarding progress:', onboardingError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...cvData,
        publicUrl: publicUrl,
        textExtractionFailed // Skicka med flaggan som den var
      }
    });
  } catch (error: any) {
    console.error('💥 Top-level CV upload error:', error);
    return NextResponse.json({
      error: 'Serverfel vid uppladdning: ' + (error.message || 'Okänt fel')
    }, { status: 500 });
  }
}