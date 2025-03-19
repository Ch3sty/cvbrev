// src/app/api/letters/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Hjälpfunktion för att skapa ett simpelt DOCX-dokument från HTML
 */
async function createDocxFromHtml(content: string, metadata: any): Promise<Buffer> {
  // Skapa en HTML-struktur med korrekt formatering för brevmallar
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${metadata.title || 'Ansökningsbrev'}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; margin: 2cm; line-height: 1.5; }
        .header { margin-bottom: 1cm; }
        .date { margin-bottom: 1cm; }
        .title { font-weight: bold; margin-bottom: 0.5cm; }
        .content { text-align: justify; }
        .footer { margin-top: 1cm; }
      </style>
    </head>
    <body>
      <div class="header">
        ${metadata.company ? `<p>${metadata.company}</p>` : ''}
        ${metadata.position ? `<p>Ansökan: ${metadata.position}</p>` : ''}
      </div>
      
      <div class="date">
        <p>${metadata.date || new Date().toLocaleDateString('sv-SE')}</p>
      </div>
      
      <div class="title">
        <h2>${metadata.title || 'Ansökningsbrev'}</h2>
      </div>
      
      <div class="content">
        ${content.replace(/\n/g, '<br />')}
      </div>
      
      <div class="footer">
        <p>Med vänliga hälsningar,</p>
        <p>[Ditt namn]</p>
      </div>
    </body>
    </html>
  `;

  // Returnera HTML som en buffer
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}

/**
 * Skapar en enkel PDF-fil från HTML-innehåll
 */
async function createPdfFromHtml(content: string, metadata: any): Promise<Buffer> {
  // Denna funktion skulle idealt använda ett bibliotek som puppeteer för att generera
  // en riktig PDF från HTML. För enkelhetens skull använder vi samma HTML som
  // för DOCX-filen och låter klienten göra konverteringen.
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${metadata.title || 'Ansökningsbrev'}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; margin: 2cm; line-height: 1.5; }
        .header { margin-bottom: 1cm; }
        .date { margin-bottom: 1cm; }
        .title { font-weight: bold; margin-bottom: 0.5cm; }
        .content { text-align: justify; }
        .footer { margin-top: 1cm; }
        @page { size: A4; margin: 2cm; }
      </style>
    </head>
    <body>
      <div class="header">
        ${metadata.company ? `<p>${metadata.company}</p>` : ''}
        ${metadata.position ? `<p>Ansökan: ${metadata.position}</p>` : ''}
      </div>
      
      <div class="date">
        <p>${metadata.date || new Date().toLocaleDateString('sv-SE')}</p>
      </div>
      
      <div class="title">
        <h2>${metadata.title || 'Ansökningsbrev'}</h2>
      </div>
      
      <div class="content">
        ${content.replace(/\n/g, '<br />')}
      </div>
      
      <div class="footer">
        <p>Med vänliga hälsningar,</p>
        <p>[Ditt namn]</p>
      </div>
    </body>
    </html>
  `;
  
  // Returnera HTML som en buffer
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}

export async function POST(request: NextRequest) {
  try {
    // Verifiera autentisering
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }
    
    // Läs begäran
    const { content, format, metadata } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Inget innehåll angivet' }, { status: 400 });
    }
    
    let fileBuffer: Buffer;
    let fileType: string;
    let fileName: string = (metadata?.title || 'Ansökningsbrev').replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, '_');
    
    // Generera fil baserat på önskat format
    if (format === 'docx') {
      fileBuffer = await createDocxFromHtml(content, metadata);
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName += '.docx';
    } else if (format === 'pdf') {
      fileBuffer = await createPdfFromHtml(content, metadata);
      fileType = 'application/pdf';
      fileName += '.pdf';
    } else {
      return NextResponse.json({ error: 'Ogiltigt filformat' }, { status: 400 });
    }
    
    // Returnera filen som en nedladdningsbar blob
    const response = new NextResponse(fileBuffer);
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