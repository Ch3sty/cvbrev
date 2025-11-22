// src/app/api/letters/download/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { LetterMetadata } from '@/lib/pdf/letter-templates';
import { getDocxTemplate, type DocxTemplateId } from '@/lib/letters/docx-templates';
import { ProfileDataForLetter, JobInfo } from '@/lib/letters/template-merger';
import { Packer } from 'docx';
import { type FontId } from '@/app/dashboard/skapa-brev/components/FontSelector';

/**
 * Konverterar FontId till CSS font-family string för HTML/PDF
 */
function getFontFamilyForHTML(fontId: FontId = 'calibri'): string {
  const fontMap: Record<FontId, string> = {
    'calibri': 'Calibri, Arial, sans-serif',
    'arial': 'Arial, Helvetica, sans-serif',
    'verdana': 'Verdana, Geneva, sans-serif',
    'lato': "'Lato', Arial, sans-serif",
    'open-sans': "'Open Sans', Arial, sans-serif",
    'roboto': "'Roboto', Arial, sans-serif",
    'poppins': "'Poppins', Arial, sans-serif",
    'georgia': 'Georgia, Times, serif',
    'garamond': 'Garamond, Georgia, serif',
    'times': "'Times New Roman', Times, serif",
    'helvetica': 'Helvetica, Arial, sans-serif'
  };
  return fontMap[fontId] || fontMap.calibri;
}

/**
 * Konverterar FontId till DOCX font name (primary font endast, utan fallbacks)
 */
function getFontNameForDocx(fontId: FontId = 'calibri'): string {
  const fontMap: Record<FontId, string> = {
    'calibri': 'Calibri',
    'arial': 'Arial',
    'verdana': 'Verdana',
    'lato': 'Lato',
    'open-sans': 'Open Sans',
    'roboto': 'Roboto',
    'poppins': 'Poppins',
    'georgia': 'Georgia',
    'garamond': 'Garamond',
    'times': 'Times New Roman',
    'helvetica': 'Helvetica'
  };
  return fontMap[fontId] || fontMap.calibri;
}

/**
 * Genererar PDF med Puppeteer från redan genererad HTML
 */
async function createProfessionalPDF(htmlContent: string, fontFamily?: string): Promise<Buffer> {
  try {
    console.log('Generating PDF with Puppeteer from template HTML');

    // Dynamisk import av Puppeteer
    const puppeteer = await import('puppeteer');

    // Check if we're in a serverless environment
    const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;

    const launchOptions: any = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-web-security',
        '--disable-features=site-per-process'
      ]
    };

    if (isServerless) {
      // Use Sparticuz Chromium for serverless environments
      try {
        const chromium = await import('@sparticuz/chromium');
        launchOptions.executablePath = await chromium.default.executablePath();
        launchOptions.args = [
          ...launchOptions.args,
          ...chromium.default.args,
          '--single-process'
        ];
        console.log('Using Sparticuz Chromium for serverless');
      } catch (error) {
        console.warn('Sparticuz Chromium not available, falling back to system chrome');
        launchOptions.executablePath = process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : '/usr/bin/google-chrome-stable';
      }
    }

    // Starta browser
    const browser = await puppeteer.default.launch(launchOptions);

    try {
      const page = await browser.newPage();

      // Sätt viewport för A4
      await page.setViewport({ width: 794, height: 1123 });

      // Om font specificerad, injicera Google Fonts och ersätt font-family
      let enhancedHTML = htmlContent;
      if (fontFamily) {
        // Injicera Google Fonts för moderna fonter
        const googleFontsNeeded = fontFamily.includes('Lato') ||
                                  fontFamily.includes('Open Sans') ||
                                  fontFamily.includes('Roboto') ||
                                  fontFamily.includes('Poppins');

        if (googleFontsNeeded) {
          const googleFontsLink = `<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;
          enhancedHTML = htmlContent.replace('</head>', `${googleFontsLink}\n</head>`);
        }

        // Ersätt font-family i CSS
        enhancedHTML = enhancedHTML.replace(
          /font-family:\s*['"]?[^;'"]+['"]?;/gi,
          `font-family: ${fontFamily};`
        );
      }

      // Sätt HTML-innehållet (som redan är komplett HTML från template)
      await page.setContent(enhancedHTML, {
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
 * Extraherar ENDAST brevkropp från HTML, tar bort all personinfo och headers
 */
function extractBodyContentFromHTML(html: string): string {
  // Leta efter body-content div som innehåller AI-genererad text
  const bodyMatch = html.match(/<div class="body-content">([\s\S]*?)<\/div>/);
  if (bodyMatch) {
    // Extrahera paragrafer och konvertera till ren text
    return bodyMatch[1]
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<[^>]*>/g, '') // Ta bort övriga HTML-taggar
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Fallback: Om body-content div inte hittas, använd hela innehållet
  console.warn('Could not find body-content div in HTML, using full content');
  return html;
}

/**
 * Genererar riktig DOCX med docx-biblioteket och våra native templates
 */
async function createProfessionalDocx(
  content: string,
  metadata: LetterMetadata,
  templateId: DocxTemplateId = 'classic',
  fontName?: string
): Promise<Buffer> {
  try {
    console.log(`Generating DOCX with template: ${templateId}`);

    // ✅ Extrahera ENDAST brevkropp, INGEN personinfo från HTML
    const cleanContent = extractBodyContentFromHTML(content);

    // Skapa ProfileDataForLetter objekt från metadata
    const profileData: ProfileDataForLetter = {
      full_name: metadata.author || 'Användare',
      email: metadata.email || '',
      phone: metadata.phone || null,
      location: metadata.location || null,
      include_phone_in_letters: !!metadata.phone,
      include_location_in_letters: !!metadata.location
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
      metadata.date,
      fontName
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
    const { content, format, title, company, position, template, font } = parsedBody;

    if (!content) {
      return NextResponse.json({ error: 'Inget innehåll angivet' }, { status: 400 });
    }

    // Konvertera font till rätt format för PDF och DOCX
    const fontFamily = font ? getFontFamilyForHTML(font as FontId) : undefined;
    const fontName = font ? getFontNameForDocx(font as FontId) : undefined;

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
      location: profileData?.location || '',
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
      fileData = await createProfessionalDocx(content, enhancedMetadata, template as DocxTemplateId, fontName);
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName += '.docx';
    } else if (format === 'pdf') {
      // content är redan komplett HTML från template, skicka med font
      fileData = await createProfessionalPDF(content, fontFamily);
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