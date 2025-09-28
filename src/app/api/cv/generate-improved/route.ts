import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import {
  generateImprovementPrompt,
  generateSystemPrompt,
  validateImprovedCV,
  type ImprovementContext
} from '@/lib/cv/improvement-prompts';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
  try {
    // Initialize Supabase with proper server client
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('API generate-improved: Authentication failed.', authError);
      return NextResponse.json({ error: 'Autentisering krävs.' }, { status: 401 });
    }

    // Get request body (userId no longer needed as we get it from auth)
    const { cvId, originalContent, selectedSuggestions, analysisDetails } = await request.json();

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

    // Call OpenAI API with improved prompts
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4, // Slightly higher for more creative improvements
      max_tokens: 3000, // Increased to handle longer, more detailed CVs
    });

    const improvedContent = completion.choices[0]?.message?.content || '';

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
    const baseKeywords = ['resultat', 'ansvarig', 'ledde', 'utvecklade', 'implementerade',
                          'förbättrade', 'ökade', 'minskade', 'optimerade', 'skapade', 'byggde'];
    const analysisKeywords = analysisDetails?.atsFriendliness?.missingKeywords || [];
    const allKeywords = [...new Set([...baseKeywords, ...analysisKeywords])];

    const keywordCount = allKeywords.filter(kw =>
      improvedContent.toLowerCase().includes(kw.toLowerCase())
    ).length;

    // More accurate metrics calculation
    const hasATSImprovements = selectedSuggestions.some(s => s.category === 'ats' || s.category === 'keywords');
    const hasQuantification = selectedSuggestions.some(s =>
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

    // Save improved version to existing cv_texts table with meaningful filename
    const originalFilename = await getOriginalFilename(supabase, user.id, cvId);
    const improvedFilename = `Förbättrat CV - ${originalFilename || 'CV'}.txt`;

    const { data: savedCV, error: saveError } = await supabase
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
    }

    // Try to log AI usage for cost tracking (non-critical)
    try {
      if (completion.usage?.total_tokens && completion.usage?.prompt_tokens && completion.usage?.completion_tokens) {
        const estimatedCost = (completion.usage.prompt_tokens * 0.01 + completion.usage.completion_tokens * 0.03) / 1000; // GPT-4 pricing estimate

        const { error: usageLogError } = await supabase.from('usage_log').insert({
          user_id: user.id,
          feature_type: 'cv_improvement',
          model: 'gpt-4-turbo-preview',
          tokens: completion.usage.total_tokens,
          cost: estimatedCost,
          related_id: cvId,
          metadata: {
            cv_id: cvId,
            suggestions_count: selectedSuggestions.length,
            cost_sek: estimatedCost * 10.5,
            prompt_tokens: completion.usage.prompt_tokens,
            completion_tokens: completion.usage.completion_tokens
          }
        });

        if (usageLogError) {
          console.error('Non-critical: Failed to log usage to usage_log:', usageLogError);
        } else {
          console.log(`Logged AI usage: $${estimatedCost} for CV improvement`);
        }
      }
    } catch (usageLogError) {
      console.error('Non-critical: Usage logging failed:', usageLogError);
    }

    // Return the improved CV and metrics
    return NextResponse.json({
      success: true,
      improvedContent,
      metrics,
      savedId: savedCV?.id,
    });
  } catch (error) {
    console.error('Error generating improved CV:', error);
    return NextResponse.json(
      { error: 'Failed to generate improved CV' },
      { status: 500 }
    );
  }
}