import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCV } from '@/lib/cv-parser';

export async function POST(request: Request) {
  try {
    // Uppdaterad cookie-hantering för Next.js 14
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: () => cookieStore });
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Ingen fil hittades' }, { status: 400 });
    }
    
    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }
    
    // Ladda upp fil till Supabase Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, file);
      
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    
    // 🔥 Använd cv-parser för att extrahera text från filen
    let extractedText = 'Inget innehåll kunde extraheras';
    
    try {
      extractedText = await parseCV(file);
    } catch (error) {
      console.error('CV parsning misslyckades:', error);
      
      // Fallback - om parsningen misslyckas, försök med enkel textextrahering
      if (fileExt === 'txt') {
        extractedText = await file.text();
      }
    }
    
    // 🔥 Spara metadata och extraherad text i databasen 🔥
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: user.id,
        file_name: title || file.name,
        original_file_path: uploadData.path,
        cv_text: extractedText // 🔥 Sparar den extraherade texten
      })
      .select();
      
    if (cvError) {
      return NextResponse.json({ error: cvError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: cvData[0] });
  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json({ error: 'Serverfel vid uppladdning' }, { status: 500 });
  }
}