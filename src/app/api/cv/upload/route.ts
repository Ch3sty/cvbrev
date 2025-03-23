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
    
    // Upload file to Supabase Storage first
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, file);
      
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
      .getPublicUrl(uploadData.path);
    
    // Save metadata and extracted text in the database
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: user.id,
        file_name: title || file.name,
        original_file_path: uploadData.path,
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