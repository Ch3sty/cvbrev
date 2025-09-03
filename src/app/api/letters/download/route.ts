// src/app/api/letters/download/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateLetterPDF } from '@/lib/pdf/puppeteer-pdf';
import { LetterMetadata, TemplateType } from '@/lib/pdf/letter-templates';

/**
 * Hjälpfunktion för att skapa ett DOCX-dokument (egentligen HTML som fungerar i Word)
 */
async function createDocxFromHtml(content: string, metadata: LetterMetadata): Promise<Uint8Array> {
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
 * Skapar en professionell PDF med Puppeteer, med fallback
 */
async function createProfessionalPDF(content: string, metadata: LetterMetadata, templateType: TemplateType = 'formal'): Promise<Buffer> {
  try {
    const pdfBuffer = await generateLetterPDF(content, metadata, {
      template: templateType,
      format: 'A4',
      margins: {
        top: '2.5cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      }
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error('Professional PDF generation error:', error);
    console.log('Falling back to basic HTML PDF generation');
    
    // Fallback till grundläggande HTML-baserad PDF
    return await createBasicPDF(content, metadata, templateType);
  }
}

/**
 * Fallback PDF-generering med HTML (för deployment-miljöer där Puppeteer inte fungerar)
 */
async function createBasicPDF(content: string, metadata: LetterMetadata, templateType: TemplateType = 'formal'): Promise<Buffer> {
  // Importera template och generera HTML
  const { getLetterTemplate } = await import('@/lib/pdf/letter-templates');
  const template = getLetterTemplate(templateType);
  const htmlContent = template.generateHTML(content, metadata);
  
  // Returnera HTML som PDF-liknande format
  const encoder = new TextEncoder();
  return Buffer.from(encoder.encode(htmlContent));
}

export async function POST(request: Request) {
  try {
    // Verifiera autentisering och hantera PDF/DOCX generering
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
    
    const { content, format, metadata, template } = parsedBody;
    
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
    const enhancedMetadata: LetterMetadata = {
      title: metadata?.title || 'Ansökningsbrev',
      company: metadata?.company || '',
      position: metadata?.position || metadata?.job_title || '',
      author: profileData?.full_name || user.email?.split('@')[0] || 'Användare',
      email: user.email || '',
      phone: profileData?.phone || '',
      address: profileData?.address || '',
      date: new Date().toLocaleDateString('sv-SE')
    };
    
    let fileData: Buffer | Uint8Array;
    let fileType: string;
    let fileName: string = (enhancedMetadata.title || 'Ansökningsbrev')
      .replace(/[^a-zA-Z0-9åäöÅÄÖ\s]/g, '')
      .replace(/\s+/g, '_');
    
    const templateType = (template as TemplateType) || 'formal';
    
    // Generera fil baserat på önskat format
    if (format === 'docx') {
      fileData = await createDocxFromHtml(content, enhancedMetadata);
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName += '.docx';
    } else if (format === 'pdf') {
      fileData = await createProfessionalPDF(content, enhancedMetadata, templateType);
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