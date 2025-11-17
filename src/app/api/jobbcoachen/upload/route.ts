// src/app/api/jobbcoachen/upload/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCV } from '@/lib/cv-parser';
import { sanitizeStorageKey } from '@/utils/helpers';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversationId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Ingen fil hittades' }, { status: 400 });
    }

    // Validate user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'Filen är för stor. Max 5MB tillåten.',
        code: 'FILE_TOO_LARGE'
      }, { status: 400 });
    }

    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json({
        error: 'Ogiltigt filformat. Endast PDF, DOCX och TXT tillåtna.',
        code: 'INVALID_FILE_TYPE'
      }, { status: 400 });
    }

    // Extract text from file
    let extractedText = '';
    try {
      console.log(`📄 Extracting text from ${file.name}...`);
      extractedText = await parseCV(file);

      // Check for parsing errors
      const errorPrefixes = ['Kunde inte läsa', 'Misslyckades', 'PDF-filen innehåller endast'];
      if (errorPrefixes.some(prefix => extractedText.startsWith(prefix))) {
        return NextResponse.json({
          error: extractedText,
          code: 'PARSING_ERROR'
        }, { status: 400 });
      }

      // Check minimum length
      if (extractedText.length < 50) {
        return NextResponse.json({
          error: 'Filen innehåller för lite text. Kontrollera att det är en textbaserad PDF (inte bild).',
          code: 'INSUFFICIENT_TEXT'
        }, { status: 400 });
      }
    } catch (error: any) {
      console.error('Text extraction error:', error);
      return NextResponse.json({
        error: 'Kunde inte läsa filen. Kontrollera att filen inte är skadad.',
        code: 'EXTRACTION_ERROR'
      }, { status: 500 });
    }

    // Upload to Storage
    const sanitizedFileName = sanitizeStorageKey(file.name);
    const timestamp = Date.now();
    const storagePath = conversationId
      ? `users/${user.id}/chat_attachments/${conversationId}/${timestamp}_${sanitizedFileName}`
      : `users/${user.id}/chat_attachments/temp/${timestamp}_${sanitizedFileName}`;

    console.log(`📤 Uploading to storage: ${storagePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({
        error: 'Kunde inte ladda upp filen',
        code: 'UPLOAD_ERROR'
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cvs')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      data: {
        file_name: file.name,
        file_type: fileExt,
        file_size: file.size,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        extracted_text: extractedText,
        uploaded_at: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Serverfel vid uppladdning',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}
