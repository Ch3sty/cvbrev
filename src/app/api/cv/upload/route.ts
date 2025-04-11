// src/app/api/cv/upload/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCV, createPlaceholderText } from '@/lib/cv-parser';
import pdfParse from 'pdf-parse';
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
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 });
    }

    if (profile.subscription_tier === 'free') {
      const { count, error: countError } = await supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Fel vid räkning av CV:n:', countError);
        return NextResponse.json({ error: 'Kunde inte verifiera antal CV:n' }, { status: 500 });
      }

      if (count !== null && count >= 1) {
        return NextResponse.json(
          { error: 'Som gratisanvändare kan du bara ha 1 CV. Uppgradera till premium för att hantera flera CV:n.', code: 'CV_LIMIT_REACHED' },
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

    let extractedText = '';
    let textExtractionFailed = false;
    let placeholderUsed = false; // Flagga för att veta om placeholder användes

    try {
      console.log(`📄 Starting text extraction for ${originalFileName}...`);
      if (fileExt === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfData = Buffer.from(arrayBuffer);
        try {
          const result = await pdfParse(pdfData);
          extractedText = result.text;
          console.log(`📄 PDF text extracted, length: ${extractedText.length}`);
        } catch (pdfError: any) {
          console.error(`❌ PDF parsing failed for ${originalFileName}:`, pdfError.message || pdfError);
          textExtractionFailed = true;
          extractedText = createPlaceholderText(file);
          placeholderUsed = true; // Markera att placeholder skapades här
        }
      } else {
        extractedText = await parseCV(file);
        const knownErrorMessages = [
            "Kunde inte läsa", "Misslyckades med att läsa", "PDF-texten kunde inte",
            "Filformatet stöds inte", 'Kunde inte ladda DOCX-parsningsbiblioteket',
            'Kunde inte extrahera text från DOCX-filen (tom fil)'
         ];
         if (knownErrorMessages.some(msg => extractedText.startsWith(msg))) {
            console.warn(`⚠️ Parsing function returned an error for ${originalFileName}: ${extractedText}`);
            textExtractionFailed = true;
            extractedText = createPlaceholderText(file); // Skapa placeholder
            placeholderUsed = true; // Markera att placeholder skapades här
         }
      }

      // Längdkontroll som fallback
      if (!textExtractionFailed && (!extractedText || extractedText.length < 50)) {
        console.warn(`⚠️ Extracted text for ${originalFileName} is too short or empty (< 50 chars), using placeholder.`);
        extractedText = createPlaceholderText(file); // Skapa placeholder
        textExtractionFailed = true;
        placeholderUsed = true; // Markera att placeholder skapades här
      }
    } catch (error: any) {
      console.error(`❌ Unexpected CV parsing error for ${originalFileName}:`, error.message || error);
      extractedText = createPlaceholderText(file); // Skapa placeholder
      textExtractionFailed = true;
      placeholderUsed = true; // Markera att placeholder skapades här
    }

    // --- SANERING AV TEXTEN SOM SKA SPARAS ---
    // Om placeholder användes (pga fel eller kort text), sanera den.
    // Annars kan du överväga att sanera den vanliga extraherade texten också,
    // men det kan potentiellt ta bort legitima tecken från ett CV.
    // Här väljer vi att *endast* sanera om vi vet att det är placeholder-texten.
    let textToSave = extractedText;
    if (placeholderUsed) {
        console.log("Sanitizing placeholder text before DB insert.");
        textToSave = escapeDatabasePlaceholder(extractedText);
    }
    // --- ---

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
        cv_text: textToSave // Använd den (potentiellt) sanerade texten
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