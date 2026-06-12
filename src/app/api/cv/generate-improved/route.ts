import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { generateText, GEMINI_MODELS } from '@/lib/gemini';
import {
  generateImprovementPrompt,
  generateSystemPrompt,
  validateImprovedCV,
  type ImprovementContext
} from '@/lib/cv/improvement-prompts';
import type { Suggestion } from '@/components/cv/SuggestionSelector';
import { calculateCostFromDatabase } from '@/lib/openai/pricing-sync';
import { trackAIUsage, AI_FEATURES } from '@/lib/ai-cost-tracker';
import { logUserActivity } from '@/lib/activity-logger';

// Helper function to get original CV filename
async function getOriginalFilename(supabase: any, userId: string, cvId: string): Promise<string | null> {
  try {
    const { data: cvData, error } = await supabase
      .from('cv_texts')
      .select('file_name')
      .eq('id', cvId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching original CV filename:', error);
      return null;
    }

    return cvData?.file_name || null;
  } catch (error) {
    console.error('Error in getOriginalFilename:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Initialize Supabase with proper server client
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('API generate-improved: Authentication failed.', authError);
      return NextResponse.json({ error: 'Autentisering krävs.' }, { status: 401 });
    }

    // Log activity: CV improvement started
    await logUserActivity(
      user.id,
      'cv_improvement_started',
      'Användare startade CV-förbättring',
      {}
    );

    // Get request body (userId no longer needed as we get it from auth)
    const { cvId, originalContent, selectedSuggestions, analysisDetails, skipSave }: {
      cvId: string;
      originalContent: string;
      selectedSuggestions: Suggestion[];
      analysisDetails?: any;
      skipSave?: boolean;
    } = await request.json();

    // Validate required fields
    if (!cvId || !originalContent || !selectedSuggestions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create improvement context with all available information
    const improvementContext: ImprovementContext = {
      originalContent,
      selectedSuggestions,
      analysisDetails: analysisDetails || {}
    };

    // Generate sophisticated prompt using the new system
    const prompt = generateImprovementPrompt(improvementContext);
    const systemPrompt = generateSystemPrompt();

    // Call Gemini with improved prompts
    const modelToUse = GEMINI_MODELS.quality;
    const completion = await generateText({
      model: modelToUse,
      systemInstruction: systemPrompt,
      prompt,
      temperature: 0.4, // Slightly higher for more creative improvements
      maxOutputTokens: 6000, // Inkluderar thinking-tokens; rymmer långa CV:n
      thinkingBudget: 1024,
    });

    const improvedContent = completion.text;

    // Validate the improved CV
    const validation = validateImprovedCV(originalContent, improvedContent);
    if (!validation.isValid) {
      console.error('CV improvement validation failed:', validation.issues);
      // Log but don't fail - let user see the result
    }

    // Calculate improvement metrics (more sophisticated)
    const originalWords = originalContent.split(/\s+/).length;
    const improvedWords = improvedContent.split(/\s+/).length;

    // Enhanced keyword detection including any ATS keywords from analysis
    const baseKeywords: string[] = ['resultat', 'ansvarig', 'ledde', 'utvecklade', 'implementerade',
                          'förbättrade', 'ökade', 'minskade', 'optimerade', 'skapade', 'byggde'];
    const analysisKeywords: string[] = analysisDetails?.atsFriendliness?.missingKeywords || [];
    const allKeywords = Array.from(new Set([...baseKeywords, ...analysisKeywords]));

    const keywordCount = allKeywords.filter(kw =>
      improvedContent.toLowerCase().includes(kw.toLowerCase())
    ).length;

    // More accurate metrics calculation
    const hasATSImprovements = selectedSuggestions.some((s: Suggestion) => s.category === 'ats' || s.category === 'keywords');
    const hasQuantification = selectedSuggestions.some((s: Suggestion) =>
      s.title.toLowerCase().includes('kvantifi') ||
      s.description.toLowerCase().includes('siffror')
    );

    const metrics = {
      keywordOptimization: Math.round((keywordCount / Math.max(allKeywords.length, 1)) * 100),
      atsScore: Math.min(95, 70 + (hasATSImprovements ? 15 : 0) + (keywordCount * 2)),
      overallImprovement: Math.round(
        15 + // Base improvement
        (hasQuantification ? 10 : 0) + // Quantification bonus
        (selectedSuggestions.length * 5) + // Per suggestion bonus
        ((improvedWords - originalWords) / Math.max(originalWords, 1)) * 10 // Length change factor
      ),
    };

    // Save improved version to existing cv_texts table with meaningful filename (unless skipSave is true)
    let savedCV = null;
    if (!skipSave) {
      const originalFilename = await getOriginalFilename(supabase, user.id, cvId);
      const improvedFilename = `Förbättrat CV - ${originalFilename || 'CV'}.txt`;

      const { data: savedData, error: saveError } = await supabase
        .from('cv_texts')
        .insert({
          user_id: user.id,
          file_name: improvedFilename,
          original_file_path: `improved/${user.id}/${Date.now()}.txt`, // Placeholder path for improved CVs
          cv_text: improvedContent,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving improved CV:', saveError);
        // Continue even if save fails - user can still see the result
      } else {
        savedCV = savedData;
      }
    }

    // Track AI usage and costs with new unified system
    try {
      if (completion.usage) {
        const promptTokens = completion.usage.prompt || 0;
        const completionTokens = completion.usage.completion || 0;
        const generationTimeMs = Date.now() - startTime;

        // Calculate cost using model pricing database
        const costUsd = await calculateCostFromDatabase(
          supabase,
          modelToUse,
          promptTokens,
          completionTokens
        );

        // Track usage in unified ai_usage_costs table
        await trackAIUsage({
          supabase,
          userId: user.id,
          featureName: AI_FEATURES.CV_IMPROVEMENT,
          endpoint: '/api/cv/generate-improved',
          model: modelToUse,
          promptTokens,
          completionTokens,
          costUsd,
          generationTimeMs,
          metadata: {
            cv_id: cvId,
            suggestions_count: selectedSuggestions.length,
            improved_words: improvedWords,
            original_words: originalWords
          }
        });

        console.log('[CV Improvement] AI usage tracked:', {
          totalTokens: promptTokens + completionTokens,
          costUsd: costUsd.toFixed(6),
          generationTimeMs
        });
      }
    } catch (trackingError) {
      console.error('[CV Improvement] Failed to track AI usage:', trackingError);
    }

    // Log activity: CV improvement completed
    await logUserActivity(
      user.id,
      'cv_improvement_completed',
      'CV-förbättring slutfördes framgångsrikt',
      {
        cv_id: cvId,
        suggestions_applied: selectedSuggestions.length,
        metrics
      }
    );

    // Return the improved CV and metrics
    return NextResponse.json({
      success: true,
      improvedContent,
      metrics,
      savedId: savedCV?.id,
    });
  } catch (error) {
    console.error('Error generating improved CV:', error);

    // Try to log failed activity
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient({ cookies: cookieStore });
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await logUserActivity(
          user.id,
          'cv_improvement_failed',
          'CV-förbättring misslyckades',
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    } catch (logError) {
      console.error('Failed to log error activity:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to generate improved CV' },
      { status: 500 }
    );
  }
}