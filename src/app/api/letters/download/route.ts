// src/app/api/letters/download/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { LetterMetadata } from '@/lib/pdf/letter-templates';
import { getDocxTemplate, type DocxTemplateId } from '@/lib/letters/docx-templates';
import { ProfileDataForLetter, JobInfo } from '@/lib/letters/template-merger';
import { Packer } from 'docx';
import { cleanLetterContent } from '@/lib/pdf/clean-letter-content';



/**
 * Genererar PDF med Puppeteer från redan genererad HTML
 */
async function createProfessionalPDF(htmlContent: string): Promise<Buffer> {
  try {
    console.log('Generating PDF with Puppeteer from template HTML');

    // Dynamisk import av Puppeteer
    const puppeteer = await import('puppeteer');

    // Starta browser
    const browser = await puppeteer.default.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();

      // Sätt viewport för A4
      await page.setViewport({ width: 794, height: 1123 });

      // Sätt HTML-innehållet (som redan är komplett HTML från template)
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Generera PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        },
        preferCSSPageSize: true
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Puppeteer PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Genererar riktig DOCX med docx-biblioteket och våra native templates
 */
async function createProfessionalDocx(
  content: string,
  metadata: LetterMetadata,
  templateId: DocxTemplateId = 'classic'
): Promise<Buffer> {
  try {
    console.log(`Generating DOCX with template: ${templateId}`);

    // Extrahera body-innehåll från komplett HTML-dokument
    let bodyContent = content;
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
    }

    // Ta bort style och script tags med deras innehåll
    bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Rensa dubblerat innehåll innan HTML-rensning
    const cleanedContent = cleanLetterContent(bodyContent, metadata);

    // Förbered text innehållet genom att ta bort HTML-taggar och formatera paragrafer
    const cleanContent = cleanedContent
      .replace(/<[^>]*>/g, '') // Ta bort HTML-taggar
      .replace(/&nbsp;/g, ' ') // Ersätt HTML-entiteter
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    // Skapa ProfileDataForLetter objekt från metadata
    const profileData: ProfileDataForLetter = {
      full_name: metadata.author || 'Användare',
      email: metadata.email || '',
      phone: metadata.phone || null,
      location: metadata.address || null,
      include_phone_in_letters: !!metadata.phone,
      include_location_in_letters: !!metadata.address
    };

    // Skapa JobInfo objekt från metadata
    const jobInfo: JobInfo = {
      title: metadata.title || 'Ansökningsbrev',
      company: metadata.company || '',
      position: metadata.position || '',
      recipient: undefined
    };

    // Hämta rätt template och generera dokumentet
    const template = getDocxTemplate(templateId);
    const doc = template.generateDocument(
      profileData,
      jobInfo,
      cleanContent,
      metadata.date
    );

    // Generera DOCX-buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;

  } catch (error) {
    console.error('DOCX generation error:', error);
    throw new Error(`DOCX generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
    
    // Accept flat primitive values instead of nested metadata object
    const { content, format, title, company, position, template } = parsedBody;

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
      title: title || 'Ansökningsbrev',
      company: company || '',
      position: position || '',
      author: profileData?.full_name || user.email?.split('@')[0] || 'Användare',
      email: user.email || '',
      phone: profileData?.phone || '',
      address: profileData?.address || '',
      date: new Date().toLocaleDateString('sv-SE')
    };
    
    let fileData: Buffer | Uint8Array;
    let fileType: string;
    let fileName: string = (enhancedMetadata.title || 'Ansokningsbrev')
      .replace(/å/g, 'a').replace(/Å/g, 'A')
      .replace(/ä/g, 'a').replace(/Ä/g, 'A')  
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    
    // Generera fil baserat på önskat format
    if (format === 'docx') {
      fileData = await createProfessionalDocx(content, enhancedMetadata, template as DocxTemplateId);
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName += '.docx';
    } else if (format === 'pdf') {
      // content är redan komplett HTML från template, skicka direkt
      fileData = await createProfessionalPDF(content);
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