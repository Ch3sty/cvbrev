import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { extractOriginalTextWithAI, generateContextSpecificSuggestion, validateExtractionQuality, type ExtractionContext, type TextExtractionResult } from '@/lib/cv/cv-text-extraction';

export interface ExtractTextRequest {
  cvContent: string;
  improvements: Array<{
    id: string;
    area: string;
    suggestion: string;
    example?: string;
    category: string;
  }>;
}

export interface ExtractTextResponse {
  success: boolean;
  extractions: Array<{
    id: string;
    originalText: string;
    aiSuggestion: string;
    roleContext: string;
    confidence: number;
    sourceSection: string;
    category: string;
    isValid: boolean;
  }>;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verifiera autentisering
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Ej autentiserad' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ExtractTextRequest = await request.json();

    if (!body.cvContent || !body.improvements || !Array.isArray(body.improvements)) {
      return NextResponse.json(
        { success: false, error: 'Ogiltiga parametrar' },
        { status: 400 }
      );
    }

    // Processar varje förbättring för textextraktion
    const extractions: ExtractTextResponse['extractions'] = [];
    const processed = new Set<string>(); // Förhindra duplicering

    for (const improvement of body.improvements) {
      // Skip om redan processat eller om det är strukturella förbättringar
      if (processed.has(improvement.id) || isStructuralImprovement(improvement)) {
        continue;
      }

      try {
        // Skapa kontext för AI-extraktion
        const context: ExtractionContext = {
          cvContent: body.cvContent,
          improvementSuggestion: improvement.suggestion,
          improvementArea: improvement.area,
          improvementExample: improvement.example
        };

        // Extrahera originaltext med AI
        const extractionResult: TextExtractionResult = await extractOriginalTextWithAI(context);

        // Validera resultatet
        const isValid = validateExtractionQuality(extractionResult);

        if (!isValid) {
          console.log(`Skippar förbättring ${improvement.id} - låg kvalitet på extraktion`);
          continue;
        }

        // Generera kontext-specifikt AI-förslag
        const aiSuggestion = await generateContextSpecificSuggestion(
          extractionResult.originalText,
          extractionResult.roleContext,
          improvement.area,
          improvement.category
        );

        // Lägg till i resultat
        extractions.push({
          id: improvement.id,
          originalText: extractionResult.originalText,
          aiSuggestion: aiSuggestion,
          roleContext: extractionResult.roleContext,
          confidence: extractionResult.confidence,
          sourceSection: extractionResult.sourceSection,
          category: improvement.category,
          isValid: true
        });

        processed.add(improvement.id);

      } catch (error) {
        console.error(`Fel vid bearbetning av förbättring ${improvement.id}:`, error);

        // Lägg till fallback-version för att undvika att tappa förbättringen helt
        extractions.push({
          id: improvement.id,
          originalText: 'Automatisk textextraktion misslyckades',
          aiSuggestion: improvement.suggestion,
          roleContext: '',
          confidence: 0.1,
          sourceSection: improvement.area,
          category: improvement.category,
          isValid: false
        });
      }
    }

    // Returnera resultat
    return NextResponse.json({
      success: true,
      extractions: extractions
    });

  } catch (error) {
    console.error('Fel i extract-text API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internt serverfel vid textextraktion'
      },
      { status: 500 }
    );
  }
}

/**
 * Kontrollera om förbättringen är strukturell och ska hanteras av mallar
 */
function isStructuralImprovement(improvement: { area: string; suggestion: string }): boolean {
  const text = (improvement.suggestion + ' ' + improvement.area).toLowerCase();
  const structuralKeywords = [
    // Layout och struktur
    'layout', 'struktur', 'formatering', 'format', 'överskådlighet',
    // Headers och sektioner
    'rubrik', 'rubriker', 'sidhuvud', 'huvud', 'header',
    'sektion', 'sektioner', 'avsnitt', 'dela upp', 'organisera',
    // Listor och formatering
    'punktlista', 'punktlistor', 'bullets', 'bullet points',
    'indrag', 'marginal', 'spacing', 'avstånd',
    // Kontaktinfo placering
    'kontaktuppgifter', 'kontakt', 'placera', 'flytta',
    // Generella strukturkommandon
    'strukturera', 'ordna', 'gruppera', 'kategorisera',
    'använd tydliga', 'gör tydligare', 'förtydliga struktur'
  ];

  return structuralKeywords.some(keyword => text.includes(keyword));
}

/**
 * Kontrollera om förbättringen gäller profilsammanfattning
 */
function isProfileSummaryImprovement(improvement: { area: string; suggestion: string }): boolean {
  const text = (improvement.suggestion + ' ' + improvement.area).toLowerCase();
  const profileKeywords = [
    'profil', 'sammanfattning', 'profilsammanfattning', 'personlig beskrivning',
    'om mig', 'profilering', 'yrkesmässig', 'social och glad', 'beskrivs som'
  ];

  return profileKeywords.some(keyword => text.includes(keyword));
}

/**
 * Kontrollera om förbättringen är kvantifierbar
 */
function isQuantifiableImprovement(improvement: { suggestion: string }): boolean {
  const text = improvement.suggestion.toLowerCase();
  const quantifiableKeywords = [
    'kvantifi', 'siffror', 'resultat', 'antal', 'procent', '%', 'ökning',
    'minskning', 'budget', 'team', 'försäljning', 'kostnad', 'tid', 'projekt',
    'kunder', 'tillväxt', 'förbättring', 'mätbar', 'specifik'
  ];

  return quantifiableKeywords.some(keyword => text.includes(keyword));
}