import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import {
  groupRelatedImprovements,
  filterStructuralImprovements,
  validateGroupedImprovements,
  type GroupedImprovement,
  type ImprovementToGroup
} from '@/lib/cv/improvement-grouping';
import { validateAIResponse } from '@/lib/cv/role-based-improvements';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { improvements, cvText, detailedAnalysis, parsedRoles, isInitialLoad } = await request.json();
    const detailedImprovements = detailedAnalysis?.detailedImprovements || [];

    if (!improvements || !Array.isArray(improvements) || improvements.length === 0) {
      return NextResponse.json(
        { error: 'No improvements provided' },
        { status: 400 }
      );
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Invalid CV text provided' },
        { status: 400 }
      );
    }

    // KRITISK FIX: Vid initial laddning, behandla ALLA förbättringar som "selected"
    const improvementsToProcess = isInitialLoad
      ? improvements.map((imp: any) => ({ ...imp, selected: true }))
      : improvements;

    console.log('📊 Grouping improvements:', {
      totalImprovements: improvementsToProcess.length,
      selectedImprovements: improvementsToProcess.filter((i: any) => i.selected).length,
      isInitialLoad: !!isInitialLoad
    });

    // Säkerställ att vi har förbättringar att bearbeta
    if (improvementsToProcess.filter((i: any) => i.selected).length === 0) {
      console.warn('⚠️ Inga valda förbättringar att bearbeta!');
      return NextResponse.json({
        success: true,
        roleBasedImprovements: [],
        generalImprovements: [],
        groups: [],
        stats: {
          originalCount: improvementsToProcess.length,
          filteredCount: 0,
          groupedCount: 0,
          roleBasedCount: 0,
          generalCount: 0,
          reductionPercentage: 0
        }
      });
    }

    // Step 1: Filter out structural improvements (handled by templates)
    const contentImprovements = filterStructuralImprovements(improvementsToProcess);

    console.log('📝 After filtering structural:', {
      originalCount: improvementsToProcess.length,
      filteredCount: contentImprovements.length,
      processingMode: isInitialLoad ? 'INITIAL_LOAD' : 'SELECTED_ONLY'
    });

    // Step 2: Group related improvements with AI-powered text extraction
    const groupedImprovements = await groupRelatedImprovements(
      contentImprovements,
      cvText,
      detailedAnalysis,
      parsedRoles // Skicka med parsedRoles
    );

    console.log('🔗 Grouped into:', {
      groupCount: groupedImprovements.length,
      groups: groupedImprovements.map(g => ({
        id: g.id,
        sourceCount: g.sourceImprovements.length,
        hasQuantification: !!g.improvements.quantification,
        hasKeywords: !!(g.improvements.keywords && g.improvements.keywords.length > 0)
      }))
    });

    // Step 3: Validate and sanitize grouped improvements to prevent whole CV text
    const sanitizedGroups = sanitizeGroupedImprovements(groupedImprovements, cvText);

    // Step 4: Enhance groups with AI-generated combined suggestions
    const enhancedGroups = await enhanceGroupsWithAI(sanitizedGroups, cvText, detailedImprovements);

    // Step 5: Final validation
    const isValid = validateGroupedImprovements(enhancedGroups);
    if (!isValid) {
      console.warn('⚠️ Validation failed for grouped improvements');
    }

    // Step 6: Extract general improvements (role-based are now handled by /api/cv/analyze)
    const generalImprovements = extractGeneralImprovements(enhancedGroups);

    console.log('🎯 General improvements extraction complete:', {
      generalCount: generalImprovements.length
    });

    return NextResponse.json({
      success: true,
      roleBasedImprovements: [], // Now handled by /api/cv/analyze
      generalImprovements,
      groups: enhancedGroups, // Keep for backward compatibility
      stats: {
        originalCount: improvementsToProcess.length,
        filteredCount: contentImprovements.length,
        groupedCount: enhancedGroups.length,
        roleBasedCount: 0, // Deprecated - use /api/cv/analyze instead
        generalCount: generalImprovements.length,
        reductionPercentage: Math.round(
          ((improvementsToProcess.length - generalImprovements.length) / improvementsToProcess.length) * 100
        )
      }
    });

  } catch (error) {
    console.error('Error grouping improvements:', error);
    return NextResponse.json(
      { error: 'Failed to group improvements' },
      { status: 500 }
    );
  }
}

/**
 * Sanitizes grouped improvements to ensure no whole CV text is included
 */
function sanitizeGroupedImprovements(
  groups: GroupedImprovement[],
  fullCvText: string
): GroupedImprovement[] {
  const cvLength = fullCvText.length;
  const maxAllowedLength = 300; // Maximum length for original text
  const similarityThreshold = 0.8; // If text is too similar to full CV, reject it

  return groups
    .map(group => {
      let originalText = group.originalText;

      // Check 1: Length validation
      if (originalText.length > maxAllowedLength) {
        console.warn(`🚫 Original text too long (${originalText.length} chars), truncating:`, originalText.substring(0, 50) + '...');

        // Try to extract first sentence
        const firstSentence = originalText.split(/[.!?]+/)[0]?.trim();
        if (firstSentence && firstSentence.length <= maxAllowedLength) {
          originalText = firstSentence;
        } else {
          // Fallback: truncate and add ellipsis
          originalText = originalText.substring(0, maxAllowedLength - 3) + '...';
        }
      }

      // Check 2: Similarity to full CV (prevent whole CV from being returned)
      const similarity = calculateTextSimilarity(originalText, fullCvText);
      if (similarity > similarityThreshold) {
        console.warn(`🚫 Original text too similar to full CV (${Math.round(similarity * 100)}%), replacing with placeholder`);
        originalText = `Text för ${group.area || 'förbättring'} (specifik textdel kunde inte extraheras automatiskt)`;
      }

      // Check 3: Ensure it's not just whitespace or too short
      if (originalText.trim().length < 10) {
        console.warn('🚫 Original text too short, replacing with placeholder');
        originalText = `Relevant text från ${group.area || 'CV'} för denna förbättring`;
      }

      return {
        ...group,
        originalText: originalText.trim()
      };
    })
    .filter(group => group.originalText.length >= 10); // Remove groups with invalid text
}

/**
 * Calculate similarity between two texts using Levenshtein distance
 * This replaces the simple approach with a more accurate fuzzy matching algorithm
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const a = text1.toLowerCase().trim();
  const b = text2.toLowerCase().trim();

  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // For very different lengths, likely not similar
  const lengthRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
  if (lengthRatio < 0.3) return 0;

  // Use simplified Levenshtein distance for better accuracy
  const matrix = [];
  const aLen = a.length;
  const bLen = b.length;

  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[bLen][aLen];
  const maxLength = Math.max(aLen, bLen);
  return 1 - (distance / maxLength);
}

/**
 * Enhances grouped improvements with AI-generated combined suggestions
 */
async function enhanceGroupsWithAI(
  groups: GroupedImprovement[],
  cvText: string,
  detailedImprovements: any[] = []
): Promise<GroupedImprovement[]> {
  try {
    // Enhance each group with role-specific AI examples
    const enhancedGroups = await Promise.all(groups.map(async (group) => {
      // Validate existing AI example
      if (group.aiExample && !validateAIResponse(group.aiExample)) {
        console.warn(`⚠️ Invalid AI example for group ${group.id}: "${group.aiExample}"`);
        group.aiExample = ''; // Clear invalid example
      }

      // Generate new AI example if needed
      if (!group.aiExample || group.aiExample.length < 20) {
        const newExample = await generateGroupAIExample(group, cvText, detailedImprovements);
        group.aiExample = newExample;
      }

      return group;
    }));

    return enhancedGroups;

  } catch (error) {
    console.error('Error enhancing groups with AI:', error);
    // Return original groups if AI enhancement fails
    return groups;
  }
}

/**
 * Korrigera stavfel och grammatik i svensk text
 */
async function correctSpellingAndGrammar(text: string): Promise<string> {
  try {
    const prompt = `Korrigera följande svenska text och gör den professionell. Fixa ALLA stavfel och grammatiska fel.

INPUT: "${text}"

VANLIGA FEL ATT KORRIGERA:
- "opch" → "och"
- "utfärde" → "utförde"
- "influenser" → "inflytande"
- "hr" → "HR"

INSTRUKTIONER:
1. Korrigera alla stavfel
2. Fixa grammatiska fel
3. Behåll exakt samma betydelse
4. Gör texten professionell
5. Returnera ENDAST den korrigerade texten, inga kommentarer

OUTPUT:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en svensk språkexpert. Korrigera stavfel och grammatik men behåll betydelsen exakt.',
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Låg temperatur för konsekvent korrigering
      max_tokens: 150
    });

    const corrected = response.choices[0].message.content?.trim();

    // Validera att vi fick ett svar
    if (!corrected || corrected.length < 5) {
      console.warn('⚠️ Stavkorrigering misslyckades, returnerar original');
      return text;
    }

    return corrected;
  } catch (error) {
    console.error('Error correcting spelling:', error);
    return text; // Returnera original om korrigering misslyckas
  }
}

/**
 * Find matching improvement from analysis
 */
function findMatchingImprovement(
  group: GroupedImprovement,
  detailedImprovements: any[]
): any | undefined {
  if (!detailedImprovements || detailedImprovements.length === 0) {
    return undefined;
  }

  // Först: Exakt områdesmatchning
  const match = detailedImprovements.find(imp =>
    imp.area && group.area &&
    imp.area.toLowerCase() === group.area.toLowerCase()
  );

  if (match) return match;

  // Sedan: Nyckelordsmatchning
  const groupKeywords = (group.originalText + ' ' + (group.area || '')).toLowerCase().split(/\s+/);

  let bestMatch: any = undefined;
  let bestScore = 0;

  for (const imp of detailedImprovements) {
    const impKeywords = ((imp.suggestion || '') + ' ' + (imp.area || '')).toLowerCase().split(/\s+/);
    const matchingWords = groupKeywords.filter(word =>
      word.length > 3 && impKeywords.includes(word)
    ).length;

    const score = matchingWords / Math.max(groupKeywords.length, 1);

    if (score > bestScore && score > 0.2) {
      bestScore = score;
      bestMatch = imp;
    }
  }

  return bestMatch;
}

/**
 * Generate AI example for a specific group
 */
async function generateGroupAIExample(
  group: GroupedImprovement,
  cvText: string,
  detailedImprovements: any[] = []
): Promise<string> {
  try {
    const roleContext = group.roleContext || 'Yrkesroll';
    const area = group.area || 'arbetslivserfarenhet';

    // STEG 1: Hitta matchande analysförslag
    const matchingImprovement = findMatchingImprovement(group, detailedImprovements);

    // STEG 2: Korrigera stavfel i originaltexten
    const correctedOriginal = await correctSpellingAndGrammar(group.originalText);
    console.log(`📝 Korrigerad text: "${correctedOriginal}" (från: "${group.originalText}")`);

    if (matchingImprovement) {
      console.log(`✅ Hittade matchande analysförslag för ${area}:`, matchingImprovement.suggestion);
    }

    // Get improvement details for the prompt
    const hasQuantification = !!group.improvements.quantification;
    const hasKeywords = !!(group.improvements.keywords && group.improvements.keywords.length > 0);
    const keywords = hasKeywords ? group.improvements.keywords : [];

    // Infer senioritet och bransch för bättre copy
    const seniority = inferSeniorityFromRole(roleContext);
    const industry = inferIndustryFromRole(roleContext, area);

    // Bygg prompt med variation och kontextmedvetenhet
    let prompt = '';

    if (matchingImprovement) {
      // Vi har ett analysförslag - använd det som grund!
      prompt = `UTGÅ FRÅN DETTA ANALYSFÖRSLAG och skriv professionell CV-text:

ANALYSFÖRSLAG:
Förslag: "${matchingImprovement.suggestion || ''}"
Exempel från analys: "${matchingImprovement.example || ''}"

KONTEXT:
Roll: ${roleContext}
Senioritet: ${seniority}
Bransch: ${industry}
Område: ${area}
Originaltext: "${correctedOriginal}"

VIKTIGT - VARIERA MENINGSSTRUKTUREN baserat på senioritet:

A. RESULTATFOKUS (bäst för Senior/Lead):
   "Ökade/Minskade/Förbättrade [metrik] med [X]% genom [konkret handling]"

B. PROJEKT/LEVERANS (bäst för projektroller):
   "Levererade [projekt] värt [belopp] [före tid/under budget] med [resultat]"

C. LEDARSKAP (bäst för chefsroller):
   "Ledde team på [X] personer som [uppnådde resultat]"

D. UTVECKLING (bäst för tech/skapande):
   "Utvecklade/Skapade [produkt] som resulterade i [mätbart resultat]"

E. ANSVAR/SCOPE (fallback):
   "Ansvarade för [område] med [omfattning], uppnådde [resultat]"

${hasQuantification ? 'SIFFROR (OBLIGATORISKT): Minst 2-3 konkreta siffror (team, budget, resultat, procent)' : ''}
${hasKeywords && keywords ? `NYCKELORD: Inkludera naturligt: ${keywords.join(', ')}` : ''}

TONSTIL efter senioritet:
- Junior: "Bidrog till", "Assisterade", "Utvecklade"
- Mid: "Ansvarade för", "Levererade", "Ökade"
- Senior: "Ledde", "Transformerade", "Etablerade"
- Lead: "Drev strategisk", "Byggde", "Skalade"

KRAV:
1. ANVÄND EN strukturmall ovan (välj lämpligast för ${seniority} ${roleContext})
2. Minst 25 ord med 2-3 specifika siffror
3. Grammatiskt perfekt svenska
4. Professionell men inte stel ton
5. Realistiska siffror för rollen
6. VARIERA - använd INTE samma struktur som tidigare anrop

RETURNERA: Endast den förbättrade CV-texten (ingen förklaring):`;
    } else {
      // Fallback: Inget matchande analysförslag, generera från scratch
      console.warn(`⚠️ Inget matchande analysförslag hittades för ${area}, använder förbättrad fallback`);

      prompt = `Skriv professionell CV-text för denna roll:

ORIGINALTEXT: "${correctedOriginal}"
ROLL: ${roleContext}
SENIORITET: ${seniority}
BRANSCH: ${industry}
OMRÅDE: ${area}

STRUKTURMALLAR - välj EN lämplig för ${seniority} i ${industry}:

A. RESULTATFOKUS: "Ökade/Förbättrade [metrik] med [X]% genom [handling]"
B. PROJEKT/LEVERANS: "Levererade [projekt] värt [belopp] med [resultat]"
C. LEDARSKAP: "Ledde team på [X] personer som [resultat]"
D. UTVECKLING: "Utvecklade [produkt] som resulterade i [resultat]"
E. ANSVAR: "Ansvarade för [område] med [omfattning], uppnådde [resultat]"

${hasQuantification ? 'SIFFROR: Minst 2-3 konkreta siffror relevanta för rollen' : ''}
${hasKeywords && keywords ? `NYCKELORD: ${keywords.join(', ')}` : ''}

TONSTIL (${seniority}):
- Junior: Bidrog, Assisterade, Utvecklade
- Mid: Ansvarade, Levererade, Ökade
- Senior/Lead: Ledde, Transformerade, Drev

KRAV:
1. Använd EN strukturmall (variera!)
2. Minst 25 ord med konkreta siffror
3. Professionell svensk grammatik
4. Realistiska siffror för ${industry}
5. Passa ${seniority}-nivå

RETURNERA: Endast CV-texten:`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // UPPGRADERAD: Använd GPT-4 för högre kvalitet
      messages: [
        {
          role: 'system',
          content: `Du är en svensk CV-expert specialiserad på professionell, varierad copy.

KÄRNPRINCIPER:
1. VARIATION - Använd olika meningsstrukturer (resultatfokus, projekt, ledarskap, utveckling, ansvar)
2. KVALITET - Professionell men inte stel ton, övertygande för rekryterare
3. SIFFROR - Alltid 2-3 konkreta, realistiska siffror
4. KONTEXT - Anpassa efter senioritet, bransch och roll
5. VARIATION - Använd ALDRIG samma meningsbyggnad två gånger i rad

Du skapar text som är värd att ha i ett riktigt CV. Texten ska vara övertygande, konkret och resultatfokuserad.`,
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7, // Högre temperatur för mer variation mellan anrop
      max_tokens: 300 // Ökad gräns för fullständiga svar
    });

    const aiResponse = response.choices[0].message.content;

    // Validate the AI response with enhanced validation
    if (!aiResponse || !validateAIResponse(aiResponse)) {
      console.warn(`⚠️ Invalid AI response for group ${group.id}, using fallback`);

      // Om vi har ett analysförslag men AI misslyckades, använd analysexemplet direkt
      if (matchingImprovement?.example && matchingImprovement.example.length > 50) {
        console.log(`✅ Använder analysexempel direkt: "${matchingImprovement.example}"`);
        return matchingImprovement.example;
      }

      return generateFallbackExample(group);
    }

    // Extra kontroll: Kontrollera att AI-svaret faktiskt är annorlunda än originalet
    const cleanedAI = aiResponse.trim().toLowerCase();
    const cleanedOriginal = correctedOriginal.toLowerCase();

    if (cleanedAI === cleanedOriginal || cleanedAI.includes(cleanedOriginal)) {
      console.warn(`⚠️ AI response too similar to original, using analysis example or fallback`);

      // Försök använda analysexemplet först
      if (matchingImprovement?.example && matchingImprovement.example.length > 50) {
        return matchingImprovement.example;
      }

      return generateContextualFallback(group, correctedOriginal);
    }

    return aiResponse.trim();

  } catch (error) {
    console.error('Error generating AI example:', error);
    // Return fallback example if AI generation fails
    return generateFallbackExample(group);
  }
}

/**
 * Infer seniority from role context
 */
function inferSeniorityFromRole(roleContext: string): 'junior' | 'mid' | 'senior' | 'lead' {
  const lower = roleContext.toLowerCase();

  if (lower.includes('chef') || lower.includes('manager') || lower.includes('vd') || lower.includes('lead')) {
    return 'lead';
  }
  if (lower.includes('senior') || lower.includes('specialist')) {
    return 'senior';
  }
  if (lower.includes('junior') || lower.includes('trainee')) {
    return 'junior';
  }

  return 'mid'; // Default
}

/**
 * Infer industry from role context and area
 */
function inferIndustryFromRole(roleContext: string, area: string): string {
  const combined = (roleContext + ' ' + area).toLowerCase();

  if (combined.includes('bygg') || combined.includes('snickare') || combined.includes('renovering')) {
    return 'construction';
  }
  if (combined.includes('träning') || combined.includes('fitness') || combined.includes('gym')) {
    return 'fitness';
  }
  if (combined.includes('webb') || combined.includes('design') || combined.includes('utveckl')) {
    return 'tech';
  }
  if (combined.includes('sälj') || combined.includes('försälj')) {
    return 'sales';
  }

  return 'general';
}

/**
 * Generate contextual fallback with improved text
 */
function generateContextualFallback(group: GroupedImprovement, correctedOriginal?: string): string {
  const roleContext = group.roleContext || 'Yrkesroll';
  const baseText = correctedOriginal || group.originalText;
  const seniority = inferSeniorityFromRole(roleContext);
  const industry = inferIndustryFromRole(roleContext, group.area || '');

  // Kontextmedvetna fallbacks baserat på bransch och senioritet
  const fallbackExamples: Record<string, Record<string, string>> = {
    fitness: {
      lead: 'Ledde träningsanläggning med 3500 medlemmar och team på 15 personer, ökade årsomsättningen med 2,8 MSEK genom förbättrad medlemsretention och nya tjänster',
      senior: 'Ansvarade för drift av fitnesscenter med 2000+ medlemmar, implementerade förbättringar som ökade kundnöjdheten från 7,2 till 9,1 på 12 månader',
      mid: 'Koordinerade personalschema och medlemsservice för 1500+ medlemmar, ökade retention med 25% på ett år',
      junior: 'Bidrog till daglig drift av träningsanläggning, assisterade i utveckling av kundservicerutiner för 800+ medlemmar'
    },
    construction: {
      lead: 'Ledde 15+ byggprojekt värda totalt 8 MSEK med team på 12 hantverkare, slutförde samtliga inom tid och budget',
      senior: 'Ansvarade för renoveringsprojekt värt 3,5 MSEK, slutförde två veckor före deadline och 10% under budget med team på 8 personer',
      mid: 'Genomförde 25+ renoveringsprojekt av lägenheter i Stockholmsområdet med 98% kundnöjdhet och 75% återkommande kunder',
      junior: 'Bidrog till 10+ byggprojekt med fokus på kvalitetsarbete och säkerhet, utvecklade kompetens inom byggstandarder'
    },
    tech: {
      lead: 'Utvecklade 50+ företagswebbplatser med fokus på UX och konvertering, ökade kunders online-försäljning med genomsnitt 50%',
      senior: 'Drev webbdesignbyrå med 30+ projekt årligen, specialiserad på responsiv design och CMS-lösningar med 95% kundnöjdhet',
      mid: 'Designade och implementerade 25+ webbprojekt i WordPress/HTML/CSS, levererade samtliga i tid med 90% kundnöjdhet',
      junior: 'Bidrog till utveckling av 15 webbprojekt med fokus på front-end och användarupplevelse'
    },
    general: {
      lead: 'Ledde verksamhetsområde med team på 12 personer och budget på 4 MSEK, implementerade förbättringar som ökade effektiviteten med 35%',
      senior: 'Ansvarade för affärsområde med årlig omsättning på 3 MSEK, uppnådde 120% av uppsatta mål genom strategiska initiativ',
      mid: 'Koordinerade verksamhet med 5 medarbetare, genomförde förbättringar som ökade produktiviteten med 25%',
      junior: 'Bidrog till verksamhet genom 5+ projekt med dokumenterade resultat, utvecklade kompetens inom operativ drift'
    }
  };

  const industryFallbacks = fallbackExamples[industry] || fallbackExamples.general;
  return industryFallbacks[seniority] || industryFallbacks.mid;
}

/**
 * Generate a fallback example if AI fails or returns invalid response
 */
function generateFallbackExample(group: GroupedImprovement): string {
  const roleContext = group.roleContext || 'Yrkesroll';
  const seniority = inferSeniorityFromRole(roleContext);
  const industry = inferIndustryFromRole(roleContext, group.area || '');

  // Använd samma logik som generateContextualFallback för konsekvens
  return generateContextualFallback(group);
}

/**
 * Transform grouped improvements to role-based structure
 */
function transformToRoleBasedStructure(
  groups: GroupedImprovement[],
  parsedRoles: any[] = []
): any[] {
  const roleMap = new Map<string, any>();

  // Initialize roles from parsed CV data
  parsedRoles.forEach(role => {
    const roleKey = `${role.title} - ${role.company}`;
    roleMap.set(roleKey, {
      role: roleKey,
      period: role.period || 'Ej specificerad',
      originalText: role.description || 'Beskrivning saknas',
      improvements: {
        quantification: false,
        keywords: [],
        atsOptimization: false
      },
      suggestedText: '',
      selected: false,
      confidence: 0.8,
      impact: 'medium' as const,
      sourceImprovementIds: []
    });
  });

  // Map improvements to roles
  groups.forEach(group => {
    const roleContext = group.roleContext || group.area;

    // Try to match with existing roles
    let matchedRole: string | null = null;

    for (const [roleKey, roleData] of roleMap.entries()) {
      if (roleContext && (
        roleKey.toLowerCase().includes(roleContext.toLowerCase()) ||
        roleContext.toLowerCase().includes(roleKey.toLowerCase()) ||
        roleData.originalText.toLowerCase().includes(roleContext.toLowerCase())
      )) {
        matchedRole = roleKey;
        break;
      }
    }

    // If no match found, create a new role entry
    if (!matchedRole) {
      matchedRole = roleContext || `Allmän förbättring - ${group.area || 'Okänt område'}`;
      roleMap.set(matchedRole, {
        role: matchedRole,
        period: 'Se CV för detaljer',
        originalText: group.originalText,
        improvements: {
          quantification: false,
          keywords: [],
          atsOptimization: false
        },
        suggestedText: '',
        selected: false,
        confidence: group.confidence || 0.7,
        impact: 'medium' as const,
        sourceImprovementIds: []
      });
    }

    // Update the matched role with improvements
    const roleData = roleMap.get(matchedRole)!;

    // Merge improvements
    if (group.improvements.quantification) {
      roleData.improvements.quantification = true;
    }

    if (group.improvements.keywords) {
      roleData.improvements.keywords = [
        ...new Set([...roleData.improvements.keywords, ...group.improvements.keywords])
      ];
    }

    // Note: atsOptimization may not exist in all improvement types
    if ((group.improvements as any).atsOptimization) {
      roleData.improvements.atsOptimization = true;
    }

    // Use the best AI example as suggested text
    if (group.aiExample && (!roleData.suggestedText || group.aiExample.length > roleData.suggestedText.length)) {
      roleData.suggestedText = group.aiExample;
    }

    // Track source improvements
    roleData.sourceImprovementIds.push(...(group.sourceImprovements || [group.id]));

    // Update confidence and impact
    if (group.confidence && group.confidence > roleData.confidence) {
      roleData.confidence = group.confidence;
    }

    // Impact priority: high > medium > low
    const impactPriority: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const newImpact = group.confidence > 0.8 ? 'high' : 'medium';
    if (impactPriority[newImpact] > impactPriority[roleData.impact]) {
      roleData.impact = newImpact as 'high' | 'medium' | 'low';
    }
  });

  // Convert map to array - VISA ALLA ROLLER (även utan perfekt text)
  return Array.from(roleMap.values());
}

/**
 * Extract general improvements that don't belong to specific roles
 */
function extractGeneralImprovements(groups: GroupedImprovement[]): any[] {
  const generalImprovements: any[] = [];

  groups.forEach(group => {
    // Check if this is a general improvement (not role-specific)
    const isGeneral = !group.roleContext ||
      group.area?.toLowerCase().includes('allmän') ||
      group.area?.toLowerCase().includes('general') ||
      group.area?.toLowerCase().includes('färdighet') ||
      group.area?.toLowerCase().includes('certifiering') ||
      group.area?.toLowerCase().includes('språk');

    if (isGeneral) {
      let category: 'skills' | 'certifications' | 'languages' = 'skills';

      if (group.area?.toLowerCase().includes('certifiering')) {
        category = 'certifications';
      } else if (group.area?.toLowerCase().includes('språk')) {
        category = 'languages';
      }

      generalImprovements.push({
        id: group.id,
        title: group.area || 'Allmän förbättring',
        description: group.aiExample || group.combinedSuggestion || 'Förbättring identifierad',
        category,
        selected: false,
        impact: group.confidence > 0.8 ? 'high' : 'medium' as const
      });
    }
  });

  return generalImprovements;
}