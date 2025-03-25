// src/app/api/cv/upload/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCV, createPlaceholderText } from '@/lib/cv-parser';
// Importera pdf-parse direkt här för serverside-användning
import pdfParse from 'pdf-parse';

export async function POST(request: Request) {
  try {
    // Get cookies correctly for Next.js
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Ingen fil hittades' }, { status: 400 });
    }
    
    // Verify user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta användarens prenumerationsnivå
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 });
    }

    // För gratisanvändare: kontrollera om de redan har ett CV
    if (profile.subscription_tier === 'free') {
      const { count, error: countError } = await supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) {
        console.error('Fel vid räkning av CV:n:', countError);
        return NextResponse.json(
          { error: 'Kunde inte verifiera antal CV:n' }, 
          { status: 500 }
        );
      }
      
      if (count !== null && count >= 1) {
        return NextResponse.json(
          { 
            error: 'Som gratisanvändare kan du bara ha 1 CV. Uppgradera till premium för att hantera flera CV:n.', 
            code: 'CV_LIMIT_REACHED'
          }, 
          { status: 403 }
        );
      }
    }
    
    // Förbättra filstrukturen - skapa användarspecifik mapp
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    // Skapa en användarmapp med användar-ID
    const userFolder = `users/${user.id}`;
    // Behåll användarens valda filnamn
    const fileName = file.name;
    const filePath = `${userFolder}/${fileName}`;
    
    // Säkerställ att användarmappen finns
    try {
      const { data: folderExists } = await supabase
        .storage
        .from('cvs')
        .list(userFolder);
        
      if (!folderExists) {
        // Om mappen inte finns, kan vi skapa en tom .folder-fil
        await supabase
          .storage
          .from('cvs')
          .upload(`${userFolder}/.folder`, new Blob([''], { type: 'text/plain' }));
      }
    } catch (folderError) {
      // Ignorera fel - försöker ladda upp filen ändå
      console.log('Mapperror (kan ignoreras):', folderError);
    }
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, file);
      
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    
    // Extract text with error handling and fallbacks
    let extractedText = '';
    let textExtractionFailed = false;
    
    try {
      console.log(`📄 Starting text extraction for ${file.name}...`);
      
      // För PDF-filer, använd direkt pdf-parse här eftersom vi vet att detta är serversidan
      if (fileExt === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfData = Buffer.from(arrayBuffer);
        
        try {
          const result = await pdfParse(pdfData);
          extractedText = result.text;
          console.log(`📄 PDF text extracted, length: ${extractedText.length}`);
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          textExtractionFailed = true;
          extractedText = createPlaceholderText(file);
        }
      } else {
        // För andra filtyper, använd parseCV från lib
        extractedText = await parseCV(file);
      }
      
      // Check if we got meaningful text
      if (!extractedText || extractedText.length < 50) {
        console.warn('Extracted text is too short or empty, using placeholder');
        extractedText = createPlaceholderText(file);
        textExtractionFailed = true;
      }
    } catch (error) {
      console.error('CV parsing failed:', error);
      // Use placeholder text as fallback
      extractedText = createPlaceholderText(file);
      textExtractionFailed = true;
    }
    
    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(filePath);
    
    // Save metadata and extracted text in the database
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: user.id,
        file_name: title || file.name,
        original_file_path: filePath,
        cv_text: extractedText // Store the extracted or placeholder text
      })
      .select();
      
    if (cvError) {
      return NextResponse.json({ error: cvError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...cvData[0],
        publicUrl,
        textExtractionFailed // Let the client know if we're using a placeholder
      }
    });
  } catch (error: any) {
    console.error('CV upload error:', error);
    return NextResponse.json({ 
      error: 'Serverfel vid uppladdning: ' + (error.message || 'Okänt fel') 
    }, { status: 500 });
  }
}