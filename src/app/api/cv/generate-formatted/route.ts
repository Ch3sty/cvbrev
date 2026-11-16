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

import { parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser';
import { createSwedishCVPDF } from '@/lib/cv/mallar/pdf-kedja';
import { parseCVWithAIServerSide } from '../parse/route';

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
    const { template, cvText, structuredData, format = 'pdf', templateOptions = {}, fontFamily, fontId, val: valIndata, cvId, entry: entryIndata } = await request.json();
    // Ytan nedladdningen startade på, för cv_nedladdad (affärsgranskningen L2).
    const entry = typeof entryIndata === 'string' && /^[a-z_]{1,30}$/.test(entryIndata) ? entryIndata : null;
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
    // Varje fil kräver konto (affärsgranskningen R3): annars gick en gratismall
    // att ladda ner utan räknare och utan mätning. Inget publikt flöde laddar
    // ner anonymt; provsidan skapar kontot först.
    if (!authedUserId) {
      return NextResponse.json({ error: 'Logga in för att ladda ner.' }, { status: 401 });
    }
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
          entry,
          foto_pa: Boolean(val.foto && userProfile?.profile_photo_url),
          // Sidorna i den färdiga PDF:en (sidobjekten i filen), null för Word.
          sidor: somWord ? null : (Buffer.from(filData).toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? null),
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