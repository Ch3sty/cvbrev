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

    const { improvements, cvText, detailedAnalysis } = await request.json();

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
      detailedAnalysis
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
    const enhancedGroups = await enhanceGroupsWithAI(sanitizedGroups, cvText);

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
 * Calculate similarity between two texts (simple approach)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Simple similarity check - if text1 is a large portion of text2, they're too similar
  const ratio = text1.length / text2.length;

  if (ratio > 0.7) {
    // If text1 is more than 70% of text2's length, likely the whole CV
    return 1;
  }

  // Check if text1 contains too much of text2's content
  const text1Lower = text1.toLowerCase();
  const text2Lower = text2.toLowerCase();

  if (text2Lower.includes(text1Lower) && ratio > 0.3) {
    return ratio;
  }

  return 0;
}

/**
 * Enhances grouped improvements with AI-generated combined suggestions
 */
async function enhanceGroupsWithAI(
  groups: GroupedImprovement[],
  cvText: string
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
        const newExample = await generateGroupAIExample(group, cvText);
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
 * Generate AI example for a specific group
 */
async function generateGroupAIExample(
  group: GroupedImprovement,
  cvText: string
): Promise<string> {
  try {
    const roleContext = group.roleContext || 'Yrkesroll';
    const area = group.area || 'arbetslivserfarenhet';

    // Get improvement details for the prompt
    const hasQuantification = !!group.improvements.quantification;
    const hasKeywords = !!(group.improvements.keywords && group.improvements.keywords.length > 0);
    const keywords = hasKeywords ? group.improvements.keywords : [];

    const prompt = `Generera ett konkret förbättringsförslag för följande roll:

Roll: ${roleContext}
Område: ${area}
Originaltext: ${group.originalText.substring(0, 250)}

${hasQuantification ? 'Lägg till kvantifiering: siffror, teamstorlek, budget, procentuella förbättringar' : ''}
${hasKeywords && keywords ? `Inkludera dessa nyckelord naturligt: ${keywords.join(', ')}` : ''}

Förslaget MÅSTE:
- Vara minst 20 ord långt men max 50 ord
- Vara konkret och specifikt för ${roleContext}
- Innehålla minst 2-3 konkreta siffror eller mätbara resultat
- Vara på professionell svenska
- INTE bara vara bokstaven "t" eller annan nonsens

Returnera ENDAST det förbättrade textförslaget, ingenting annat.

Exempel på BRA förbättring:
"Ledde team på 12 personer med budgetansvar på 5 MSEK, implementerade strategisk projektledning som ökade effektiviteten med 25% och minskade kostnaderna med 15% under 18 månader."`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en erfaren svensk CV-expert. Generera alltid konkreta, mätbara förbättringar med siffror och resultat. ALDRIG returnera bara "t" eller kort nonsens-text.',
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const aiResponse = response.choices[0].message.content;

    // Validate the AI response
    if (!aiResponse || !validateAIResponse(aiResponse)) {
      console.warn(`⚠️ Invalid AI response for group ${group.id}, using fallback`);
      return generateFallbackExample(group);
    }

    return aiResponse.trim();

  } catch (error) {
    console.error('Error generating AI example:', error);
    // Return fallback example if AI generation fails
    return generateFallbackExample(group);
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