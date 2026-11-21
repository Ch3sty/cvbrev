// src/app/api/letters/download/route.ts
import { cookies } from 'next/headers';
import { bytKontaktIBrev, kontaktIBrev } from '@/lib/profile/dokumentKontakt';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { userHasAccess } from '@/lib/supabase/premiumAccess';
import { suggestPlan, type Scope } from '@/lib/access/features';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { captureServer } from '@/lib/analytics/server';
import { logPremiumUsage } from '@/lib/premium/logPremiumUsage';
import { LetterMetadata } from '@/lib/pdf/letter-templates';
import { getDocxTemplate, type DocxTemplateId } from '@/lib/letters/docx-templates';
import { ProfileDataForLetter, JobInfo } from '@/lib/letters/template-merger';
import { Packer } from 'docx';
import { getFontFamilyForHTML, getFontNameForDocx } from '@/lib/documents/typsnitt';
import { renderBrevHtml, byggBrevDocx, brevMallDef, BREV_DOCX_MIME } from '@/lib/letters/brevmall';
import { harWord } from '@/lib/cv/mallar/katalog';
import { baddaInTypsnitt } from '@/lib/cv/mallar/typsnitt-inbaddning';
// TODO(motorn): ersätts av motorns brevDataFranBrev(letter, profil) i src/lib/letters/ vid sammanslagningen.
import { brevDataFranBrev, type BrevRad } from './brev-data';

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
      // I serverless-miljö MÅSTE vi använda @sparticuz/chromium
      // Ingen fallback till system chrome - det finns inte på Vercel
      const chromium = await import('@sparticuz/chromium');
      const chromiumModule = chromium.default || chromium;

      // Använd korrekt API för @sparticuz/chromium
      launchOptions.executablePath = await chromiumModule.executablePath();
      launchOptions.args = chromiumModule.args;
      launchOptions.headless = 'shell'; // Krävs för @sparticuz/chromium

      console.log('Using Sparticuz Chromium for serverless');
      console.log('Chromium executable path:', launchOptions.executablePath);
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


/** Filnamnet ur titeln, utan å, ä, ö och specialtecken (som den gamla vägen). */
function filnamn(titel: string): string {
  return (titel || 'Ansokningsbrev')
    .replace(/å/g, 'a').replace(/Å/g, 'A')
    .replace(/ä/g, 'a').replace(/Ä/g, 'A')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_') || 'Ansokningsbrev';
}

/** PDF av brevmallens HTML: typsnitten inbäddade, krympsteget valt i sidan innan utskrift. */
async function brevmallPdf(html: string): Promise<Buffer> {
  const puppeteer = await import('puppeteer');
  const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
  const launchOptions: any = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote'] };
  if (isServerless) {
    const chromium = await import('@sparticuz/chromium');
    const chromiumModule = chromium.default || chromium;
    launchOptions.executablePath = await chromiumModule.executablePath();
    launchOptions.args = chromiumModule.args;
    launchOptions.headless = 'shell';
  }
  const browser = await puppeteer.default.launch(launchOptions);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });
    await page.setContent(baddaInTypsnitt(html), { waitUntil: 'load', timeout: 30000 });
    // Skriptet i dokumentet väljer krympsteget igen när typsnitten är laddade.
    await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 30))));
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' }, preferCSSPageSize: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Den nya vägen: brevet läses på servern med id och ägare. Returnerar null
 * för ett brev utan mall_id (den gamla vägen tar det). Behörigheten
 * (inloggning och letter_download) är redan kontrollerad av POST.
 */
async function nyttBrevSomFil(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null },
  brevId: string,
  format: unknown
): Promise<NextResponse | null> {
  // Motorns kolumner finns inte i database.types.ts än: raden läses otypad.
  const { data: rad, error } = await (supabase.from('letters') as any)
    .select('*')
    .eq('id', brevId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('Brevet kunde inte läsas för nedladdning:', error);
    return NextResponse.json({ error: 'Serverfel vid hämtning av brevet' }, { status: 500 });
  }
  if (!rad) return NextResponse.json({ error: 'Brevet kunde inte hittas' }, { status: 404 });
  const brev = rad as BrevRad;
  if (!brev.mall_id) return null;
  if (format !== 'pdf' && format !== 'docx') return NextResponse.json({ error: 'Ogiltigt filformat' }, { status: 400 });

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profileData?.full_name || !profileData.full_name.trim()) {
    return NextResponse.json({ error: 'name_required' }, { status: 422 });
  }
  const kontakt = kontaktIBrev(profileData, user as Parameters<typeof kontaktIBrev>[1]);
  // TODO(motorn): byt importen mot motorns brevDataFranBrev i src/lib/letters/ vid sammanslagningen.
  const data = brevDataFranBrev(brev, { namn: kontakt.namn, epost: kontakt.epost, telefon: kontakt.telefon, ort: kontakt.ort });
  const val = { typsnitt: brev.font_id ?? null };
  const namn = filnamn(brev.title || brev.job_title || 'Ansökningsbrev');

  let fil: Buffer;
  let typ: string;
  let ut: string;
  if (format === 'docx') {
    if (!harWord(brevMallDef(brev.mall_id).id)) {
      return NextResponse.json({ error: 'Mallen finns inte som Word-fil' }, { status: 400 });
    }
    fil = await byggBrevDocx(brev.mall_id, data, val);
    typ = BREV_DOCX_MIME;
    ut = `${namn}.docx`;
  } else {
    fil = await brevmallPdf(renderBrevHtml(brev.mall_id, data, val));
    typ = 'application/pdf';
    ut = `${namn}.pdf`;
  }

  logPremiumUsage(user.id, 'letter_download', { format });

  // Brevets väg: första nedladdningen sätter forberett_at (byggspecen avsnitt 3).
  // Kolumnen är motorns; ett fel här får aldrig stoppa filen.
  try {
    await (supabase.from('letters') as any)
      .update({ forberett_at: new Date().toISOString() })
      .eq('id', brevId)
      .eq('user_id', user.id)
      .is('forberett_at', null);
  } catch (e) {
    console.error('forberett_at kunde inte sättas:', e);
  }

  const svar = new NextResponse(new Uint8Array(fil));
  svar.headers.set('Content-Type', typ);
  svar.headers.set('Content-Disposition', `attachment; filename="${ut}"`);
  return svar;
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

    // Filen kräver featuren letter_download, som ligger i CV-spåret och i
    // Allt (docs/plan-paket-och-onboarding.md avsnitt 3). Visning och
    // kopiering av brevtexten är fortsatt gratis.
    const harNedladdning = await userHasAccess(supabase, user.id, 'letter_download');
    if (!harNedladdning) {
      void captureServer('export_blockerad', user.id, { reason: 'brev' });
      const { data: trackProfil } = await supabase
        .from('profiles')
        .select('onboarding_track')
        .eq('id', user.id)
        .maybeSingle();
      const varde = (trackProfil as { onboarding_track?: unknown } | null)?.onboarding_track;
      const track: Scope | null =
        varde === 'cv' || varde === 'tester' || varde === 'allt' ? varde : null;

      return NextResponse.json(
        featureRequiredBody('letter_download', suggestPlan('letter_download', track)),
        { status: 402 }
      );
    }

    // Ingen kontroll av bekräftad e-post vid nedladdning (beslut 0,
    // 2026-11-16). Spärren på sparade brev står kvar i letters/route.ts.

    // Läs begäransdata
    const body = await request.text();
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({ error: 'Ogiltig JSON i begäran' }, { status: 400 });
    }
    
    // Brevrummet (2026-11-21): ett brev i den nya brevmallen laddas ner med
    // sitt id. Servern läser raden och ritar filen ur brevets data, mall och
    // typsnitt. Brev utan mall_id går den gamla vägen nedan, oförändrad.
    if (typeof parsedBody?.id === 'string' && parsedBody.id) {
      const ny = await nyttBrevSomFil(supabase, user, parsedBody.id, parsedBody.format);
      if (ny) return ny;
      // Gammalt brev: den gamla vägen, med radens innehåll om anropet inte skickade något.
      if (!parsedBody.content) {
        const { data: rad } = await supabase.from('letters').select('content').eq('id', parsedBody.id).eq('user_id', user.id).maybeSingle();
        if (rad?.content) parsedBody.content = rad.content;
      }
    }

    // Accept flat primitive values instead of nested metadata object
    const { content, format, title, company, position, template, font } = parsedBody;

    if (!content) {
      return NextResponse.json({ error: 'Inget innehåll angivet' }, { status: 400 });
    }

    // Konvertera font till rätt format för PDF och DOCX
    const fontFamily = font ? getFontFamilyForHTML(String(font)) : undefined;
    const fontName = font ? getFontNameForDocx(String(font)) : undefined;

    // Hämta användarens profil för att lägga till namn m.m.
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Punkt 13: exportera aldrig med e-postens lokaldel som avsändarnamn.
    // Klienten visar ett inline-fält och gör om anropet, så det här är en
    // fråga och inte ett fel.
    if (!profileData?.full_name || !profileData.full_name.trim()) {
      return NextResponse.json({ error: 'name_required' }, { status: 422 });
    }

    // Förbered metadata med användarens information. Samma värden som
    // brevhuvudet: telefon och ort bara när de ska visas i brev
    // (src/lib/profile/dokumentKontakt.ts). Word-filen byggs om från dem.
    const kontakt = kontaktIBrev(profileData, user);
    const enhancedMetadata: LetterMetadata = {
      title: title || 'Ansökningsbrev',
      company: company || '',
      position: position || '',
      author: kontakt.namn,
      email: kontakt.epost,
      phone: kontakt.telefon,
      location: kontakt.ort,
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
      // Sparade brev har kontaktuppgifterna inbakade från när de skapades.
      // Byt namn, telefon och e-post i huvud och avslutning mot de aktuella,
      // aldrig i brödtexten. Orten går inte att känna igen säkert i ett
      // sparat brev och står kvar.
      fileData = await createProfessionalPDF(
        bytKontaktIBrev(content, { namn: kontakt.namn, epost: kontakt.epost, telefon: kontakt.telefon }),
        fontFamily
      );
      fileType = 'application/pdf';
      fileName += '.pdf';
    } else {
      return NextResponse.json({ error: 'Ogiltigt filformat' }, { status: 400 });
    }
    
    // Punkt 12: logga först när filen faktiskt finns, så att loggen bara
    // räknar nedladdningar som blev av.
    logPremiumUsage(user.id, 'letter_download', { format });

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