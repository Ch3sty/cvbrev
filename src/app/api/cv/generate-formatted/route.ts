import { NextRequest, NextResponse } from 'next/server';
import { markeraBricka } from '@/lib/onboarding/komigang-server';
import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { validateCVData } from '@/lib/openai/cv-parser-ai';
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { arPlatshallareNamn, arPlatshallareTitel, kontaktForCv } from '@/lib/profile/dokumentKontakt';
import { userHasAccess } from '@/lib/supabase/premiumAccess';
import { suggestPlan, type Scope } from '@/lib/access/features';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { FREE_CV_EXPORTS } from '@/lib/cv/template-antal';
import { getMallKort } from '@/lib/cv/mallar/katalog';
import { losMallId } from '@/lib/cv/mallar/alias';
import { tolkaVal, typsnittIdForFamilj } from '@/lib/cv/mallar/val';
import { lasSparadeRubriker } from '@/lib/cv/mallar/sparade-rubriker';
import { byggWordCv, DOCX_MIME } from '@/lib/cv/word';
import { logPremiumUsage } from '@/lib/premium/logPremiumUsage';
import { captureServer } from '@/lib/analytics/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { renderaMallPdf } from '@/lib/cv/mallar/pdf';
import { baddaInTypsnitt } from '@/lib/cv/mallar/typsnitt-inbaddning';

import { parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser';
import { generateSwedishCVPDF, SwedishCVPDFOptions } from '@/lib/cv/swedish-cv-pdf-generator';
import { parseCVWithAIServerSide } from '../parse/route';

// Svenska CV PDF-generering med premium kvalitet
async function createSwedishCVPDF(html: string, cvData: CVMetadata, templateId: string): Promise<Buffer> {
  console.log(`Generating Swedish CV PDF with template: ${templateId}`);
  
  const swedishPDFOptions: SwedishCVPDFOptions = {
    template: templateId,
    format: 'A4',
    // Noll marginal: mallarna är full-bleed helsideslayouter (210mm × 297mm)
    // som äger sin egen inre marginal. Se swedish-cv-pdf-generator.ts.
    margins: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    },
    colorScheme: 'navy', // Default till navy färgschema
    swedishSettings: {
      dateFormat: 'YYYY-MM',
      phoneFormat: 'international',
      pageLimit: 2, // Arbetsförmedlingens rekommendation
      includePhoto: false
    }
  };
  
  try {
    return await generateSwedishCVPDF(html, cvData, swedishPDFOptions);
  } catch (error) {
    console.error('Swedish CV PDF generation failed, using fallback:', error);
    
    // Fallback till enklare PDF-generering
    return await createBasicCVPDF(html);
  }
}

// Fallback PDF-generering (enklare version)
async function createBasicCVPDF(html: string): Promise<Buffer> {
  try {
    console.log('Using basic PDF generation fallback');
    
    const puppeteer = await import('puppeteer');
    const puppeteerModule = puppeteer.default || puppeteer;
    
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
        '--disable-gpu'
      ]
    };

    if (isServerless) {
      try {
        const chromium = await import('@sparticuz/chromium');
        launchOptions.executablePath = await chromium.default.executablePath();
        launchOptions.args = [
          ...launchOptions.args,
          ...chromium.default.args
        ];
      } catch (error) {
        console.warn('Sparticuz Chromium not available, falling back');
      }
    }
    
    const browser = await puppeteerModule.launch(launchOptions);
    const page = await browser.newPage();
    
    try {
      await page.setViewport({ width: 794, height: 1123 }); // A4
      await page.setContent(baddaInTypsnitt(html), { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluateHandle('document.fonts.ready').catch(() => {});

      // Mallsystemets HTML (data-mall) äger sina marginaler, brytningar och
      // spalter; reservvägen skriver ut den som den är.
      const mallsystemet = /<html[^>]*data-mall=/.test(html);
      let scale = 1;
      if (!mallsystemet) {
      // Samma fragmenteringssäkring som huvudgeneratorn, så även reservvägen
      // aldrig lämnar headern ensam på sida 1.
      await page.addStyleTag({
        content: `
          @page { margin: 0; size: A4; }
          @media print {
            .cv-container, .cv-wrapper, .resume, .page { min-height: 0 !important; height: auto !important; }
            .experience-item, .education-item, .cv-section, .section { break-inside: avoid; page-break-inside: avoid; }
            header, .header, .photo-banner, .cv-header { break-after: avoid; page-break-after: avoid; }
            * { -webkit-print-color-adjust: exact !important; }
          }
        `,
      });

      // Grid → table med varje malls faktiska geometri, så tvåkolumns-body:n
      // blir fragmenterbar utan att designen ändras (samma som huvudgeneratorn).
      await page.evaluate(() => {
        document.querySelectorAll<HTMLElement>('.body-grid').forEach((grid) => {
          const cs = getComputedStyle(grid);
          if (cs.display !== 'grid') return;
          const kids = Array.from(grid.children) as HTMLElement[];
          if (kids.length !== 2) return;
          const w = kids.map((c) => c.getBoundingClientRect().width);
          const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
          const pt = cs.paddingTop, pr = cs.paddingRight, pb = cs.paddingBottom, pl = cs.paddingLeft;
          grid.style.setProperty('display', 'table', 'important');
          grid.style.setProperty('table-layout', 'fixed', 'important');
          grid.style.setProperty('width', '100%', 'important');
          grid.style.setProperty('border-collapse', 'collapse', 'important');
          grid.style.setProperty('box-sizing', 'border-box', 'important');
          grid.style.setProperty('padding', '0', 'important');
          grid.style.setProperty('gap', '0', 'important');
          const total = w[0] + w[1] + gap;
          kids.forEach((cell, i) => {
            cell.style.setProperty('display', 'table-cell', 'important');
            cell.style.setProperty('vertical-align', 'top', 'important');
            cell.style.setProperty('box-sizing', 'border-box', 'important');
            cell.style.setProperty('min-width', '0', 'important');
            const pct = total > 0 ? (w[i] + gap / 2) / total * 100 : 50;
            cell.style.setProperty('width', pct + '%', 'important');
            const g = gap / 2 + 'px';
            cell.style.setProperty('padding', i === 0 ? `${pt} ${g} ${pb} ${pl}` : `${pt} ${pr} ${pb} ${g}`, 'important');
          });
        });
      }).catch(() => {});

      // Fit-to-page: skala ned om innehållet är marginellt för högt (samma
      // logik som huvudgeneratorn), annars flera sidor med brytning i botten.
      try {
        const contentPx: number = await page.evaluate(() => {
          let max = 0;
          for (const sel of ['.cv-container', '.cv-wrapper', '.resume', '.page']) {
            document.querySelectorAll(sel).forEach((el) => {
              max = Math.max(max, (el as HTMLElement).offsetHeight);
            });
          }
          return max || document.body.scrollHeight;
        });
        const ratio = contentPx / 1123;
        // Skala ned för att bevara tvåkolumns-designen (gridet kan inte delas),
        // golv 0.80. Samma logik som huvudgeneratorns computeFitToPageScale.
        if (ratio > 1 && ratio <= 1.25) scale = Math.max(0.80, (1 / ratio) * 0.99);
      } catch { /* behåll scale 1 */ }
      }

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        // Noll marginal, samma skäl som huvudgeneratorn: mallen är full-bleed.
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        // preferCSSPageSize inte true: den skulle få Chromium att ignorera scale.
        preferCSSPageSize: false,
        scale,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
      await browser.close();
    }
  } catch (error) {
    console.error('Basic CV PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


// Svenska CV-innehåll extraction med förbättrad parsing
async function extractSwedishCVContent(rawText: string): Promise<CVMetadata> {
  console.log('Använder förbättrad svensk CV-parsing...');
  
  try {
    // Försök med svenska AI-driven parsing först
    console.log('Försöker med AI-driven CV-parsing...');
    const aiResult = await parseCVWithAIServerSide(rawText);
    
    // Logga metadata för insikter
    console.log('AI CV Parsing SUCCESS - metadata:', {
      model: aiResult.metadata.model,
      cost: aiResult.metadata.cost,
      processingTime: aiResult.metadata.processingTime,
      detectedIndustry: aiResult.metadata.detectedIndustry,
      confidenceScore: aiResult.metadata.confidenceScore,
      tokensUsed: aiResult.metadata.tokens
    });
    
    // Validera och returnera strukturerad data
    return validateCVData(aiResult.cvData);
    
  } catch (error) {
    console.error('AI CV-parsing misslyckades, använder svenska fallback:', error);
    
    // Fallback till avancerad svensk regex-baserad parsing
    return await parseSwedishCVContent(rawText);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { template, cvText, structuredData, format = 'pdf', templateOptions = {}, fontFamily, fontId, val: valIndata, cvId } = await request.json();
    // Valen i alla mallar (src/lib/cv/mallar/kontrakt.ts, MallVal). Äldre
    // klienter skickar typsnittet som fontId (eller bara fontFamily) och
    // fotot som templateOptions.includePhoto; de tas med som reserv.
    const val = tolkaVal(valIndata, {
      includePhoto: templateOptions?.includePhoto,
      fontId: fontId ?? typsnittIdForFamilj(fontFamily),
    });
    // Word-filen (docs/plan-cv-word-2026-11-15.md, B4): samma rutt, samma
    // spärrar i samma ordning, ett annat format i svaret.
    const somWord = format === 'docx';

    // DEBUG: Log what the API receives
    console.log('🔍 DEBUG - generate-formatted API: Mottagen data:', {
      template,
      hasStructuredData: !!structuredData,
      cvTextLength: cvText?.length || 0,
      cvTextPreview: cvText?.substring(0, 200) + '...',
      format,
      hasTemplateOptions: Object.keys(templateOptions).length > 0
    });

    // DEFENSIV VALIDERING: Kontrollera att vi har giltiga data
    if (!template || (!cvText && !structuredData)) {
      console.error('❌ DEBUG - Missing required data:', {
        template: !!template,
        cvText: !!cvText,
        structuredData: !!structuredData,
        templateValue: template,
        cvTextLength: cvText?.length || 0
      });
      return NextResponse.json(
        { error: 'Template och antingen CV-text eller strukturerad data krävs' },
        { status: 400 }
      );
    }

    // Extra validering för CV-text kvalitet (om text används)
    if (cvText && cvText.trim().length < 50) {
      console.error('❌ DEBUG - CV-text för kort:', cvText.length, 'tecken');
      return NextResponse.json(
        { error: 'CV-text är för kort eller tom' },
        { status: 400 }
      );
    }
    
    // Get user profile data for photo and LinkedIn.
    // Användar-id hissas ut ur try-blocket så vi kan premium-validera mallen
    // serverside nedan (klientens egen kontroll går att kringgå).
    let userProfile = null;
    let authedUserId: string | null = null;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {
            /* service role-klient: inga cookies att skriva tillbaka */
          },
        },
      }
    );
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        authedUserId = user.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_photo_url, linkedin_url, full_name, email, contact_email, phone, location')
          .eq('id', user.id)
          .single();

        userProfile = profile;
      }
    } catch (error) {
      console.log('Could not fetch user profile data:', error);
      // Continue without profile data - not critical for CV generation
    }

    // Kontrollera att mallen finns. Gamla mall-id (sparade val, länkar)
    // löses till sin efterföljare (src/lib/cv/mallar/alias.ts).
    const mallId = losMallId(template);
    const mall = mallId ? getMallKort(mallId) : undefined;
    if (!mallId || !mall) {
      return NextResponse.json(
        { error: 'Mall hittades inte' },
        { status: 400 }
      );
    }
    const selectedTemplate = { id: mallId, tier: mall.niva === 'premium' ? 'premium' : 'free' } as const;

    // Spåret som betalväggen ska föreslå. Läses en gång och används av båda
    // spärrarna nedan (docs/plan-paket-och-onboarding.md avsnitt 5).
    let onboardingTrack: Scope | null = null;
    if (authedUserId) {
      const { data: trackProfil } = await supabase
        .from('profiles')
        .select('onboarding_track')
        .eq('id', authedUserId)
        .maybeSingle();
      const varde = (trackProfil as { onboarding_track?: unknown } | null)?.onboarding_track;
      onboardingTrack = varde === 'cv' || varde === 'tester' || varde === 'allt' ? varde : null;
    }

    // Word finns i mallarna med word: true. Ägarens besked 2026-11-16: de två
    // gratismallarna laddas ner gratis som PDF eller Word, och Word i en
    // gratismall är en vanlig gratisexport som räknas mot FREE_CV_EXPORTS
    // nedan. Word i en premiummall kräver cv_export_word som förut. Mallen
    // utan Word-version är ett fel i anropet, inte en betalvägg.
    if (somWord) {
      if (!mall.word) {
        return NextResponse.json(
          { error: 'Mallen finns inte som Word-fil' },
          { status: 400 }
        );
      }
      if (!authedUserId) {
        return NextResponse.json(
          { error: 'Logga in för att ladda ner Word-filen.' },
          { status: 401 }
        );
      }
      const harWord =
        selectedTemplate.tier !== 'premium' || (await userHasAccess(supabase, authedUserId, 'cv_export_word'));
      if (!harWord) {
        void captureServer('export_blockerad', authedUserId, { reason: 'word', template: selectedTemplate.id });
        return NextResponse.json(
          featureRequiredBody(
            'cv_export_word',
            suggestPlan('cv_export_word', onboardingTrack),
            { templateId: selectedTemplate.id }
          ),
          { status: 402 }
        );
      }
    }

    // Serverside-gating: premiummallar kräver featuren cv_templates_all.
    // Gratismallarna (katalogens niva 'gratis') laddas ner fritt, resten
    // förhandsvisas i full storlek men exporteras inte (avsnitt 4).
    if (selectedTemplate.tier === 'premium') {
      if (!authedUserId) {
        return NextResponse.json(
          { error: 'Logga in för att exportera den här mallen.' },
          { status: 401 }
        );
      }
      const harMallarna = await userHasAccess(supabase, authedUserId, 'cv_templates_all');
      if (!harMallarna) {
        void captureServer('export_blockerad', authedUserId, { reason: 'mall', template: selectedTemplate.id });
        return NextResponse.json(
          featureRequiredBody(
            'cv_templates_all',
            suggestPlan('cv_templates_all', onboardingTrack),
            { templateId: selectedTemplate.id }
          ),
          { status: 402 }
        );
      }
    }

    // En gratis nedladdning per konto (avsnitt 4, oförändrad gräns).
    // Featurekontrollen går först, så admin och paketkunder rör aldrig
    // räknaren.
    let shouldCountFreeExport = false;
    // Gäller PDF och Word lika: en gratisfil per konto, i vilket format som helst.
    if (authedUserId) {
      const harExport = await userHasAccess(supabase, authedUserId, 'cv_export');
      if (!harExport) {
        const { data: exportProfile } = await supabase
          .from('profiles')
          .select('free_cv_exports_used')
          .eq('id', authedUserId)
          .single();

        const used = (exportProfile as { free_cv_exports_used?: number } | null)?.free_cv_exports_used ?? 0;
        if (used >= FREE_CV_EXPORTS) {
          void captureServer('export_blockerad', authedUserId, { reason: 'kvot', template: selectedTemplate.id });
          return NextResponse.json(
            featureRequiredBody('cv_export', suggestPlan('cv_export', onboardingTrack)),
            { status: 402 }
          );
        }
        shouldCountFreeExport = true;
      }
    }

    // Ingen kontroll av bekräftad e-post vid nedladdning (beslut 0,
    // 2026-11-16). Spärren på permanent lagring står kvar i cv/upload.

    // Use structured data if available and valid, otherwise parse from text.
    // Aldre CV:n kan vara sparade i ParsedCV-format - normaliseraren
    // hanterar bada formaten och returnerar null om strukturen ar trasig.
    let extractedCVData: CVMetadata | null = null;
    // Var kontaktuppgifterna kommer ifrån styr vem som vinner (dokumentKontakt.ts).
    let kontaktKalla: 'strukturerad' | 'text' = 'strukturerad';
    if (structuredData) {
      extractedCVData = normalizeStructuredData(structuredData);
      if (extractedCVData) {
        console.log('✅ Använder strukturerad CV-data direkt (högsta kvalitet)');
      } else {
        console.log('⚠️ structured_data var ogiltig - faller tillbaka till text-parser');
      }
    }
    if (!extractedCVData) {
      console.log('⚠️ Fallback: Extraherar svenskt CV-innehåll från text...');
      extractedCVData = await extractSwedishCVContent(cvText);
      kontaktKalla = 'text';
    }

    // Enhance CV data with user profile information
    if (userProfile) {
      if (userProfile.profile_photo_url) {
        extractedCVData.personalInfo.profilePhotoUrl = userProfile.profile_photo_url;
      }
      if (userProfile.linkedin_url) {
        // Use profile LinkedIn URL if not already present in CV text
        if (!extractedCVData.personalInfo.linkedIn && !extractedCVData.personalInfo.linkedin) {
          extractedCVData.personalInfo.linkedin = userProfile.linkedin_url;
        }
      }
      // Namn, telefon, e-post och ort: det användaren skrivit i CV:t vinner.
      // Profilen fyller bara tomma fält och platshållare som [TELEFON] eller
      // "Ditt namn" (src/lib/profile/dokumentKontakt.ts). Ett CV som bara
      // finns som löptext får profilens värden som förut.
      const kontakt = kontaktForCv(extractedCVData.personalInfo, userProfile, null, kontaktKalla);
      extractedCVData.personalInfo.fullName = kontakt.fullName;
      extractedCVData.personalInfo.email = kontakt.email;
      extractedCVData.personalInfo.phone = kontakt.phone;
      extractedCVData.personalInfo.address = kontakt.address;
      // LinkedIn-importens "Professionell titel" i redan sparade CV:n.
      if (arPlatshallareTitel(extractedCVData.personalInfo.title)) extractedCVData.personalInfo.title = '';
    }

    // Rubrikerna CV:t valt (cv_texts.section_titles). Valet i anropet går
    // före; utan cvId eller inloggning gäller rubrikmodellens förval.
    if (authedUserId && cvId) {
      const sparade = await lasSparadeRubriker(supabase, authedUserId, cvId);
      if (sparade) extractedCVData.sectionTitles = sparade;
    }

    // Punkt 13: ett CV med e-postadressen som rubrik är värre än att fråga.
    // Klienten visar fältet inline och gör om anropet automatiskt. Namnet i
    // CV:t räcker sedan 2026-10-10, profilens behövs bara när CV:t saknar ett.
    if (authedUserId && arPlatshallareNamn(extractedCVData.personalInfo.fullName)) {
      return NextResponse.json({ error: 'name_required' }, { status: 422 });
    }
    
    // Sanitera filnamn (ta bort svenska tecken för att undvika header-fel)
    const sanitizedTemplate = mallId
      .replace(/ö/g, 'o')
      .replace(/ä/g, 'a')
      .replace(/å/g, 'a')
      .replace(/[^a-zA-Z0-9-]/g, '-');

    let filData: Buffer;
    let filTyp: string;
    let filename: string;
    if (somWord) {
      // Word-filen byggs ur samma definition och samma CV-data som PDF:en,
      // med Words egna medel (src/lib/cv/word). Typsnittet är användarens
      // val om det finns i Word, annars mallens eget.
      // "Få plats på en sida": samma steg som PDF:en landar på (mallar/pdf.ts).
      let wordVal = val;
      if (val.enSida) {
        const prov = await renderaMallPdf(extractedCVData, mallId, val, (html) => createSwedishCVPDF(html, extractedCVData!, mallId));
        wordVal = prov?.steg ? { ...val, enSidaSteg: prov.steg } : { ...val, enSida: false };
      }
      filData = await byggWordCv(extractedCVData, mallId, wordVal);
      filTyp = DOCX_MIME;
      filename = `cv-${sanitizedTemplate}.docx`;
    } else {
      // Samma HTML som förhandsvisningen (src/lib/cv/rendera-mall-html.ts),
      // med valen som CSS-variabler i mallen; "Få plats på en sida" provar
      // stegen tills CV:t ryms (src/lib/cv/mallar/pdf.ts).
      const resultat = await renderaMallPdf(extractedCVData, mallId, val, (html) => createSwedishCVPDF(html, extractedCVData!, mallId));
      if (!resultat) {
        return NextResponse.json({ error: 'Mall hittades inte' }, { status: 400 });
      }
      filData = resultat.pdf;
      filTyp = 'application/pdf';
      filename = `cv-${sanitizedTemplate}.pdf`;
    }

    console.log('CV genererat framgångsrikt:', filename);

    // Track onboarding progress for CV template download
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {
              /* service role-klient: inga cookies att skriva tillbaka */
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Record download in formatted_cv_downloads table. Kolumnen format
        // kom med Word-filen (migreringen 20261115170000_cv_downloads_format).
        // Finns den inte än loggas raden utan, så nedladdningen aldrig fälls.
        const rad = {
          user_id: user.id,
          template_id: mallId,
          downloaded_at: new Date().toISOString(),
        };
        const { error: loggFel } = await supabase
          .from('formatted_cv_downloads')
          .insert({ ...rad, format: somWord ? 'docx' : 'pdf' });
        if (loggFel) {
          console.error('formatted_cv_downloads med format:', loggFel.message);
          await supabase.from('formatted_cv_downloads').insert(rad);
        }
        void captureServer('cv_nedladdad', user.id, {
          template: selectedTemplate.id,
          format: somWord ? 'docx' : 'pdf',
          tier: selectedTemplate.tier === 'premium' ? 'premium' : 'free',
          gratisexport: shouldCountFreeExport,
        });
        // Hjälpredan Kom igång: mallen är nedladdad.
        void markeraBricka(user.id, 'mall');

        // Update onboarding progress
        const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
          user_id: user.id,
          step_name: 'download_cv_template'
        });
        if (onboardingError) {
          console.error('Failed to update onboarding progress:', onboardingError.message);
        }
      }
    } catch (trackingError) {
      console.error('Failed to track download/onboarding:', trackingError);
      // Don't fail the CV generation if tracking fails
    }

    // A2: räkna upp gratisexporten först när filen faktiskt finns. Villkoret
    // `.eq('free_cv_exports_used', 0)` gör uppräkningen atomisk, så två
    // parallella exporter aldrig ger två gratisfiler.
    // Punkt 12: premiumanvändning. `premiumTemplate` skiljer en export med en
    // låst mall från en vanlig export, så att loggen visar vem som faktiskt
    // använt mallåtkomsten.
    logPremiumUsage(authedUserId, 'cv_export', {
      template: mallId,
      format: somWord ? 'docx' : 'pdf',
      premiumTemplate: selectedTemplate.tier === 'premium',
    });

    // Kolumnen är skyddad mot klientskrivning (20261010191000_profiles_
    // skyddade_kolumner_steg2), så räknaren skrivs med adminklienten, som de
    // andra kvoträknarna. Med användarens klient blockerades uppräkningen tyst.
    if (shouldCountFreeExport && authedUserId) {
      try {
        const { error: raknarFel } = await (getSupabaseAdmin() as any)
          .from('profiles')
          .update({ free_cv_exports_used: 1 })
          .eq('id', authedUserId)
          .eq('free_cv_exports_used', 0);
        if (raknarFel) console.error('Kunde inte räkna upp free_cv_exports_used:', raknarFel.message);
      } catch (counterError) {
        console.error('Kunde inte räkna upp free_cv_exports_used:', counterError);
      }
    }

    return new NextResponse(new Uint8Array(filData), {
      headers: {
        'Content-Type': filTyp,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Fel vid CV-generering:', error);
    return NextResponse.json(
      { 
        error: 'Kunde inte generera CV',
        details: error instanceof Error ? error.message : 'Okänt fel'
      },
      { status: 500 }
    );
  }
}