import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { cvId, originalContent, selectedSuggestions, userId } = await request.json();

    // Validate required fields
    if (!cvId || !originalContent || !selectedSuggestions || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format suggestions for the prompt
    const formattedSuggestions = selectedSuggestions
      .map((s: any) => `- ${s.title}: ${s.description}`)
      .join('\n');

    // Create prompt for OpenAI
    const prompt = `Du är en expert på att förbättra CV:n. Baserat på följande originaltext och valda förbättringsförslag, skapa en förbättrad version av CV:t.

Original CV:
${originalContent}

Valda förbättringsförslag:
${formattedSuggestions}

Instruktioner:
1. Implementera ENDAST de valda förbättringsförslagen
2. Behåll originalets struktur och format så mycket som möjligt
3. Förbättra språket för att vara mer professionellt och impaktfullt
4. Lägg till relevanta nyckelord där det är lämpligt
5. Kvantifiera resultat där det är möjligt
6. Behåll all viktig information från originalet

Returnera endast det förbättrade CV:t utan några förklaringar eller kommentarer.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Du är en professionell CV-expert som hjälper till att optimera CV:n för att maximera kandidaternas chanser att få jobb.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent output
      max_tokens: 2000,
    });

    const improvedContent = completion.choices[0]?.message?.content || '';

    // Calculate improvement metrics (simplified version)
    const originalWords = originalContent.split(/\s+/).length;
    const improvedWords = improvedContent.split(/\s+/).length;

    // Simple keyword detection (would be more sophisticated in production)
    const keywords = ['resultat', 'ansvarig', 'ledde', 'utvecklade', 'implementerade', 'förbättrade', 'ökade', 'minskade'];
    const keywordCount = keywords.filter(kw =>
      improvedContent.toLowerCase().includes(kw)
    ).length;

    const metrics = {
      keywordOptimization: Math.round((keywordCount / keywords.length) * 100),
      atsScore: Math.min(95, 70 + selectedSuggestions.length * 3), // Simple formula
      overallImprovement: Math.round(((improvedWords - originalWords) / originalWords) * 100 + 15),
    };

    // Save improved version to database
    const { data: savedCV, error: saveError } = await supabase
      .from('improved_cvs')
      .insert({
        original_cv_id: cvId,
        user_id: userId,
        content: improvedContent,
        suggestions_applied: selectedSuggestions,
        metrics,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving improved CV:', saveError);
      // Continue even if save fails - user can still see the result
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