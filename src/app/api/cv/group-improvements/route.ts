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

    // Step 2: Group related improvements
    const groupedImprovements = groupRelatedImprovements(
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

    // Step 3: Enhance groups with AI-generated combined suggestions
    const enhancedGroups = await enhanceGroupsWithAI(groupedImprovements, cvText);

    // Step 4: Validate groups
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
 * Enhances grouped improvements with AI-generated combined suggestions
 */
async function enhanceGroupsWithAI(
  groups: GroupedImprovement[],
  cvText: string
): Promise<GroupedImprovement[]> {
  try {
    const prompt = `Du är en expert på CV-optimering. Analysera följande grupperade förbättringar och generera kombinerade förslag som inkluderar BÅDE kvantifiering OCH relevanta nyckelord.

CV-innehåll:
${cvText}

Grupperade förbättringar:
${JSON.stringify(groups.map(g => ({
  originalText: g.originalText,
  roleContext: g.roleContext,
  improvements: g.improvements
})), null, 2)}

För varje grupp, generera:
1. En kombinerad förbättring som inkluderar både kvantifiering och nyckelord
2. Ett konkret exempel som visar hur texten kan skrivas om

VIKTIGT:
- Kombinera kvantifiering och nyckelord i SAMMA mening
- Exempel: "Ledde ett team på 12 personer med budgetansvar på 2 MSEK och implementerade projektledning som ökade effektiviteten med 25%"
- Inkludera ALLA relevanta nyckelord naturligt i texten
- Behåll svensk kontext och branschtermer

Returnera som JSON-array:
[
  {
    "groupId": "group_1",
    "combinedSuggestion": "Kombinerat förslag här",
    "aiExample": "Konkret exempel här"
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Du är en svensk CV-expert som hjälper till att kombinera kvantifiering och nyckelord i effektiva CV-förbättringar.',
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const aiResponse = response.choices[0].message.content;
    if (!aiResponse) {
      console.error('No AI response received');
      return groups;
    }

    const aiEnhancements = JSON.parse(aiResponse);
    const enhancementsArray = aiEnhancements.groups || aiEnhancements.enhancements ||
                              (Array.isArray(aiEnhancements) ? aiEnhancements : []);

    // Merge AI enhancements with groups
    return groups.map((group, index) => {
      const enhancement = enhancementsArray.find((e: any) =>
        e.groupId === group.id || e.index === index
      ) || enhancementsArray[index];

      if (enhancement) {
        return {
          ...group,
          combinedSuggestion: enhancement.combinedSuggestion || group.combinedSuggestion,
          aiExample: enhancement.aiExample || group.aiExample
        };
      }

      return group;
    });

  } catch (error) {
    console.error('Error enhancing groups with AI:', error);
    // Return original groups if AI enhancement fails
    return groups;
  }
}