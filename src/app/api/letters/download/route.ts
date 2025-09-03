// src/app/api/letters/download/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateLetterPDF } from '@/lib/pdf/puppeteer-pdf';
import { LetterMetadata, TemplateType } from '@/lib/pdf/letter-templates';


/**
 * Genererar PDF med Puppeteer - Force deployment trigger
 */
async function createProfessionalPDF(content: string, metadata: LetterMetadata, templateType: TemplateType = 'formal'): Promise<Buffer> {
  try {
    console.log('Generating PDF with Puppeteer');
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
    console.error('Puppeteer PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Genererar DOCX med HTML
 */
function createDocxFromHtml(content: string, metadata: LetterMetadata): Buffer {
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
  return Buffer.from(encoder.encode(htmlContent));
}


// Debug GET endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Download route är aktiv',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
    deployment: 'latest'
  });
}

export async function POST(request: Request) {
  try {
    // Verifiera autentisering och hantera PDF/DOCX generering
    const cookieStore = await cookies();
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
    console.log(`Starting file generation: format=${format}, template=${templateType}, contentLength=${content.length}`);
    
    if (format === 'docx') {
      console.log('Generating DOCX');
      fileData = createDocxFromHtml(content, enhancedMetadata);
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName += '.docx';
      console.log(`DOCX generated successfully, size: ${fileData.byteLength} bytes`);
    } else if (format === 'pdf') {
      console.log('Generating PDF with Puppeteer, metadata:', JSON.stringify(enhancedMetadata, null, 2));
      fileData = await createProfessionalPDF(content, enhancedMetadata, templateType);
      fileType = 'application/pdf';
      fileName += '.pdf';
      console.log(`PDF generated successfully, size: ${fileData.byteLength} bytes`);
    } else {
      return NextResponse.json({ error: 'Ogiltigt filformat' }, { status: 400 });
    }
    
    // Returnera filen som en nedladdningsbar blob
    const response = new NextResponse(fileData);
    response.headers.set('Content-Type', fileType);
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return response;
  } catch (error: any) {
    console.error('Error generating document:', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    // Mer specifika felmeddelanden för debugging
    let errorMessage = 'Serverfel vid generering av dokument';
    if (error.message.includes('Puppeteer')) {
      errorMessage = 'PDF-generering misslyckades: ' + error.message;
    } else if (error.message.includes('PDF generation failed')) {
      errorMessage = error.message;
    } else if (error.message.includes('JSON')) {
      errorMessage = 'Ogiltigt JSON-format i begäran';
    } else {
      errorMessage = 'Serverfel vid generering av dokument: ' + error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}