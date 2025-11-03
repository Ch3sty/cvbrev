// src/app/api/letters/download/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateLetterPDF } from '@/lib/pdf/puppeteer-pdf';
import { LetterMetadata, TemplateType } from '@/lib/pdf/letter-templates';
import { cleanLetterContent } from '@/lib/pdf/clean-letter-content';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';



/**
 * Genererar PDF med Puppeteer
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
 * Genererar riktig DOCX med docx-biblioteket
 */
async function createProfessionalDocx(content: string, metadata: LetterMetadata): Promise<Buffer> {
  try {
    console.log('Generating DOCX with docx library');
    
    // Rensa dubblerat innehåll innan HTML-rensning
    const cleanedContent = cleanLetterContent(content, metadata);
    
    // Förbered text innehållet genom att ta bort HTML-taggar och formatera paragrafer
    const cleanContent = cleanedContent
      .replace(/<[^>]*>/g, '') // Ta bort HTML-taggar
      .replace(/&nbsp;/g, ' ') // Ersätt HTML-entiteter
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    
    // Dela upp innehållet i paragrafer
    const paragraphs = cleanContent.split('\n').filter(para => para.trim().length > 0);
    
    // Skapa DOCX-dokumentet
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 2.5cm i twips (1440 twips = 1 inch)
                right: 1152, // 2cm
                bottom: 1152, // 2cm
                left: 1152, // 2cm
              },
            },
          },
          children: [
            // Personlig information - högerjusterad
            ...(metadata.author ? [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: metadata.author,
                    bold: true,
                    size: 22, // 11pt
                  }),
                ],
                spacing: { after: 120 },
              })
            ] : []),
            
            ...(metadata.email ? [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: metadata.email,
                    size: 22,
                  }),
                ],
                spacing: { after: 120 },
              })
            ] : []),
            
            ...(metadata.phone ? [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: metadata.phone,
                    size: 22,
                  }),
                ],
                spacing: { after: 120 },
              })
            ] : []),
            
            ...(metadata.address ? [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: metadata.address,
                    size: 22,
                  }),
                ],
                spacing: { after: 200 },
              })
            ] : []),
            
            // Datum - högerjusterat
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: metadata.date || new Date().toLocaleDateString('sv-SE'),
                  size: 22,
                }),
              ],
              spacing: { after: 400 },
            }),
            
            // Mottagare
            ...(metadata.company ? [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: metadata.company,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { after: 200 },
              })
            ] : []),
            
            // Ämnesrad
            ...(metadata.position ? [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `Ansökan: ${metadata.position}`,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { after: 480 }, // Mer luft mellan rubrik och brödtext
              })
            ] : []),
            
            // Brevtitel som rubrik
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: metadata.title || 'Ansökningsbrev',
                  bold: true,
                  size: 28, // 14pt
                }),
              ],
              spacing: { after: 600 }, // Mer luft mellan titel och brödtext
            }),
            
            // Brevinnehåll - varje paragraf blir en paragraph
            ...paragraphs.map(para => 
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: para,
                    size: 24, // 12pt
                  }),
                ],
                spacing: { 
                  after: 240, // Avstånd efter paragraf
                  line: 288, // Radavstånd 1.2 (240*1.2=288)
                  lineRule: "auto"
                },
              })
            ),
            
            // Avslutning
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "Med vänliga hälsningar,",
                  size: 24,
                }),
              ],
              spacing: { 
                before: 400, // Extra utrymme innan avslutning
                after: 600  // Utrymme för signatur
              },
            }),
            
            // Namn
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: metadata.author || '[Ditt namn]',
                  bold: true,
                  size: 24,
                }),
              ],
            }),
          ],
        },
      ],
    });
    
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
    
    const templateType = (template as TemplateType) || 'formal';
    
    // Generera fil baserat på önskat format
    if (format === 'docx') {
      fileData = await createProfessionalDocx(content, enhancedMetadata);
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