// src/app/api/letters/download/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Hjälpfunktion för att skapa ett DOCX-dokument (egentligen HTML som fungerar i Word)
 */
async function createDocxFromHtml(content: string, metadata: any): Promise<Uint8Array> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${metadata.title || 'Ansökningsbrev'}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 2cm; line-height: 1.5; }
        p { margin-bottom: 10px; }
      </style>
    </head>
    <body>
      ${metadata.author ? `<p>${metadata.author}</p>` : ''}
      ${metadata.email ? `<p>${metadata.email}</p>` : ''}
      ${metadata.phone ? `<p>${metadata.phone}</p>` : ''}
      <p>${new Date().toLocaleDateString('sv-SE')}</p>
      
      ${metadata.company ? `<p>${metadata.company}</p>` : ''}
      ${metadata.position ? `<p>Ansökan: ${metadata.position}</p>` : ''}
      
      <h2>${metadata.title || 'Ansökningsbrev'}</h2>
      
      <div>
        ${content.replace(/\n/g, '<br>')}
      </div>
      
      <p style="margin-top: 20px;">Med vänliga hälsningar,</p>
      <p>${metadata.author || '[Ditt namn]'}</p>
    </body>
    </html>
  `;

  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}

/**
 * Skapar en PDF med samma innehåll
 */
async function createPdfFromHtml(content: string, metadata: any): Promise<Uint8Array> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${metadata.title || 'Ansökningsbrev'}</title>
      <style>
        @page { margin: 2cm; }
        body { font-family: 'Arial', sans-serif; margin: 0; line-height: 1.5; }
        p { margin-bottom: 10px; }
        h2 { margin-top: 20px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      ${metadata.author ? `<p>${metadata.author}</p>` : ''}
      ${metadata.email ? `<p>${metadata.email}</p>` : ''}
      ${metadata.phone ? `<p>${metadata.phone}</p>` : ''}
      <p>${new Date().toLocaleDateString('sv-SE')}</p>
      
      ${metadata.company ? `<p>${metadata.company}</p>` : ''}
      ${metadata.position ? `<p>Ansökan: ${metadata.position}</p>` : ''}
      
      <h2>${metadata.title || 'Ansökningsbrev'}</h2>
      
      <div>
        ${content.replace(/\n/g, '<br>')}
      </div>
      
      <p style="margin-top: 20px;">Med vänliga hälsningar,</p>
      <p>${metadata.author || '[Ditt namn]'}</p>
    </body>
    </html>
  `;
  
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}

export async function POST(request: Request) {
  try {
    // Verifiera autentisering
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }
    
    // Läs begäransdata
    const body = await request.text();
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({ error: 'Ogiltig JSON i begäran' }, { status: 400 });
    }
    
    const { content, format, metadata } = parsedBody;
    
    if (!content) {
      return NextResponse.json({ error: 'Inget innehåll angivet' }, { status: 400 });
    }
    
    // Hämta användarens profil för att lägga till namn m.m.
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    // Förbered metadata med användarens information
    const enhancedMetadata = {
      ...metadata,
      author: profileData?.full_name || '',
      email: user.email || '',
      phone: profileData?.phone || '',
      date: new Date().toLocaleDateString('sv-SE')
    };
    
    let fileData: Uint8Array;
    let fileType: string;
    let fileName: string = (metadata?.title || 'Ansökningsbrev').replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, '_');
    
    // Generera fil baserat på önskat format
    if (format === 'docx') {
      fileData = await createDocxFromHtml(content, enhancedMetadata);
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName += '.docx';
    } else if (format === 'pdf') {
      fileData = await createPdfFromHtml(content, enhancedMetadata);
      fileType = 'application/pdf';
      fileName += '.pdf';
    } else {
      return NextResponse.json({ error: 'Ogiltigt filformat' }, { status: 400 });
    }
    
    // Returnera filen som en nedladdningsbar blob
    const response = new NextResponse(fileData);
    response.headers.set('Content-Type', fileType);
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return response;
  } catch (error: any) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Serverfel vid generering av dokument: ' + error.message }, 
      { status: 500 }
    );
  }
}