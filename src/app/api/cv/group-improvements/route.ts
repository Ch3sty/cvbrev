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

    const { improvements, cvText, detailedAnalysis, parsedRoles } = await request.json();
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

    console.log('📊 Grouping improvements:', {
      totalImprovements: improvements.length,
      selectedImprovements: improvements.filter((i: any) => i.selected).length
    });

    // Step 1: Filter out structural improvements (handled by templates)
    const contentImprovements = filterStructuralImprovements(improvements);

    console.log('📝 After filtering structural:', {
      originalCount: improvements.length,
      filteredCount: contentImprovements.length
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

    return NextResponse.json({
      success: true,
      groups: enhancedGroups,
      stats: {
        originalCount: improvements.length,
        filteredCount: contentImprovements.length,
        groupedCount: enhancedGroups.length,
        reductionPercentage: Math.round(
          ((improvements.length - enhancedGroups.length) / improvements.length) * 100
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

    // Bygg prompt med analysförslag som grund
    let prompt = '';

    if (matchingImprovement) {
      // Vi har ett analysförslag - använd det som grund!
      prompt = `UTGÅ FRÅN DETTA ANALYSFÖRSLAG och anpassa det till kontexten:

ANALYSFÖRSLAG:
Förslag: "${matchingImprovement.suggestion || ''}"
Exempel från analys: "${matchingImprovement.example || ''}"

DIN UPPGIFT: Anpassa ovanstående förslag till denna specifika kontext:

ROLL: ${roleContext}
OMRÅDE: ${area}
ORIGINALTEXT ATT FÖRBÄTTRA: "${correctedOriginal}"

${hasQuantification ? 'Lägg till konkreta siffror: teamstorlek, budget, procentuella förbättringar' : ''}
${hasKeywords && keywords ? `Inkludera dessa nyckelord naturligt: ${keywords.join(', ')}` : ''}

KRAV FÖR DITT SVAR:
1. UTGÅ från analysförslaget men ANPASSA det till denna specifika roll och företag
2. Minst 25 ord med konkreta siffror (team, budget, resultat, procent)
3. Grammatiskt perfekt svenska
4. Aldrig börja med "Ansvarade för"
5. Skapa en KOMPLETT, professionell mening
6. Anpassa exemplet så det passar naturligt för ${roleContext}

RETURNERA ENDAST det anpassade exemplet (ingen förklaring):`;
    } else {
      // Fallback: Inget matchande analysförslag, generera från scratch
      console.warn(`⚠️ Inget matchande analysförslag hittades för ${area}, använder fallback`);

      prompt = `Skapa en kvantifierad förbättring av denna CV-text:

ORIGINALTEXT: "${correctedOriginal}"
ROLL: ${roleContext}
OMRÅDE: ${area}

${hasQuantification ? 'Lägg till kvantifiering: siffror, teamstorlek, budget, procentuella förbättringar' : ''}
${hasKeywords && keywords ? `Inkludera dessa nyckelord naturligt: ${keywords.join(', ')}` : ''}

KRAV:
1. Minst 25 ord med konkreta siffror
2. Grammatiskt perfekt svenska
3. ALDRIG börja med "Ansvarade för"
4. Skapa en KOMPLETT, professionell mening
5. Passa rollen och kontexten

RETURNERA ENDAST den förbättrade texten:`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // UPPGRADERAD: Använd GPT-4 för högre kvalitet
      messages: [
        {
          role: 'system',
          content: 'Du är expert på svenska CV:n. När du får ett analysförslag, UTGÅ från det och anpassa intelligent till kontexten. Skapa ALLTID konkreta exempel med siffror. ALDRIG börja med "Ansvarade för".',
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6, // Balanserad temperatur för kreativitet och precision
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
 * Generate contextual fallback with improved text
 */
function generateContextualFallback(group: GroupedImprovement, correctedOriginal?: string): string {
  const roleContext = group.roleContext || 'Yrkesroll';
  const baseText = correctedOriginal || group.originalText;

  // Skapa förbättrad version baserat på kontext
  if (roleContext.toLowerCase().includes('platschef')) {
    return `Ledde träningsanläggning med 15 anställda och 3000+ aktiva medlemmar, implementerade nya rutiner som ökade medlemsretention med 25% och årlig omsättning med 2 MSEK`;
  } else if (roleContext.toLowerCase().includes('projektledare')) {
    return `Ansvarade för byggprojekt värt 3,5 MSEK med team på 8 personer, slutförde projektet 2 veckor före deadline och 10% under budget`;
  } else if (roleContext.toLowerCase().includes('webbdesign') || baseText.toLowerCase().includes('hemsidor')) {
    return `Utvecklade 30+ företagshemsidor med fokus på användarvänlighet och konvertering, ökade kundernas online-försäljning med genomsnittligt 40%`;
  } else if (baseText.toLowerCase().includes('snickare') || baseText.toLowerCase().includes('renovering')) {
    return `Genomförde 50+ renoveringsprojekt av lägenheter i Stockholmsområdet, med 98% kundnöjdhet och återkommande uppdrag från 75% av kunderna`;
  } else {
    // Generisk förbättring
    return `Ansvarade för verksamhetsområde med team på 10 personer och årlig budget på 2 MSEK, implementerade förbättringar som ökade effektiviteten med 30%`;
  }
}

/**
 * Generate a fallback example if AI fails or returns invalid response
 */
function generateFallbackExample(group: GroupedImprovement): string {
  const roleContext = group.roleContext || 'Yrkesroll';
  const hasQuantification = !!group.improvements.quantification;
  const hasKeywords = !!(group.improvements.keywords && group.improvements.keywords.length > 0);

  // Create a contextual fallback based on the role
  const roleExamples: Record<string, string> = {
    'Platschef': 'Ansvarade för anläggning med 15 anställda och årlig omsättning på 8 MSEK, implementerade nya rutiner som ökade kundnöjdheten med 30% och minskade personalomsättningen med 40%.',
    'Projektledare': 'Ledde projekt värt 3 MSEK med team på 8 personer, levererade inom budget och 2 veckor före deadline vilket resulterade i 20% kostnadsbesparingar.',
    'Säljare': 'Genererade 5 MSEK i ny försäljning under 12 månader, utvecklade 25 nya kundrelationer och ökade återköpsfrekvensen med 35%.',
    'default': 'Ansvarade för verksamhetsområde med 10 medarbetare, implementerade förbättringar som ökade effektiviteten med 25% och minskade kostnader med 15%.'
  };

  // Find matching example or use default
  const matchingKey = Object.keys(roleExamples).find(key =>
    roleContext.toLowerCase().includes(key.toLowerCase())
  );

  let example = roleExamples[matchingKey || 'default'];

  // Add keywords if available
  if (hasKeywords && group.improvements.keywords) {
    const keyword = group.improvements.keywords[0];
    example = example.replace('implementerade', `implementerade ${keyword} och`);
  }

  return example;
}