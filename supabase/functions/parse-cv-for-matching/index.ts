import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

const TAXONOMY_API = 'https://taxonomy.api.jobtechdev.se/v1/taxonomy';
const FREE_TIER_WEEKLY_LIMIT = 1;

interface OccupationMatch {
  original: string;
  normalized: string;
  concept_id: string | null;
  alternative_labels: string[];
  confidence: 'high' | 'medium' | 'low';
}

// Helper: Create SHA-256 hash of CV text for cache validation
async function createHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Normalize occupation via Taxonomy API
async function normalizeOccupation(occupation: string): Promise<OccupationMatch> {
  try {
    const searchUrl = `${TAXONOMY_API}/specific/concepts/occupation-name?preferred-label=${encodeURIComponent(occupation)}&limit=3`;

    const response = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.warn(`[Taxonomy] API error ${response.status} for "${occupation}"`);
      return {
        original: occupation,
        normalized: occupation,
        concept_id: null,
        alternative_labels: [],
        confidence: 'low'
      };
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const bestMatch = data[0];
      const preferredLabel = bestMatch['taxonomy/preferred-label'] || bestMatch.preferred_label;
      const alternativeLabels = bestMatch['taxonomy/alternative-labels'] || bestMatch.alternative_labels || [];
      const conceptId = bestMatch.id;

      console.log(`[Taxonomy] ✅ "${occupation}" → "${preferredLabel}" (${conceptId})`);

      return {
        original: occupation,
        normalized: preferredLabel,
        concept_id: conceptId,
        alternative_labels: Array.isArray(alternativeLabels) ? alternativeLabels : [],
        confidence: 'high'
      };
    }

    // No match found
    console.warn(`[Taxonomy] ⚠️ No match for "${occupation}"`);
    return {
      original: occupation,
      normalized: occupation,
      concept_id: null,
      alternative_labels: [],
      confidence: 'low'
    };

  } catch (error) {
    console.error(`[Taxonomy] Error normalizing "${occupation}":`, error);
    return {
      original: occupation,
      normalized: occupation,
      concept_id: null,
      alternative_labels: [],
      confidence: 'low'
    };
  }
}

// Helper: Check and enforce quota limits
async function checkQuota(supabase: any, userId: string): Promise<{ allowed: boolean; remaining: number; nextReset: Date }> {
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const isPremium = profile?.subscription_tier === 'premium';

  if (isPremium) {
    return { allowed: true, remaining: 999, nextReset: new Date() };
  }

  // Check existing active CV
  const { data: activeCV } = await supabase
    .from('active_cv_for_matching')
    .select('activation_count, last_activation_reset')
    .eq('user_id', userId)
    .single();

  if (!activeCV) {
    // First activation
    return { allowed: true, remaining: FREE_TIER_WEEKLY_LIMIT - 1, nextReset: getNextMonday() };
  }

  const now = new Date();
  const lastReset = new Date(activeCV.last_activation_reset);
  const nextReset = getNextMonday(lastReset);

  // Reset if week has passed
  if (now >= nextReset) {
    return { allowed: true, remaining: FREE_TIER_WEEKLY_LIMIT - 1, nextReset: getNextMonday() };
  }

  // Check if limit reached
  if (activeCV.activation_count >= FREE_TIER_WEEKLY_LIMIT) {
    return { allowed: false, remaining: 0, nextReset };
  }

  return {
    allowed: true,
    remaining: FREE_TIER_WEEKLY_LIMIT - activeCV.activation_count - 1,
    nextReset
  };
}

function getNextMonday(from: Date = new Date()): Date {
  const next = new Date(from);
  next.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = next.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
  next.setUTCDate(next.getUTCDate() + daysUntilMonday);
  return next;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { cvId, userId } = await req.json();

    if (!cvId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing cvId or userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Parse CV] Starting for user ${userId}, CV ${cvId}`);

    // Check quota limits
    const quota = await checkQuota(supabase, userId);
    if (!quota.allowed) {
      return new Response(JSON.stringify({
        error: 'Du har nått din veckogräns för CV-aktiveringar. Uppgradera till Premium för obegränsade aktiveringar.',
        limitReached: true,
        nextReset: quota.nextReset.toISOString()
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch CV text
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .select('cv_text, file_name')
      .eq('id', cvId)
      .eq('user_id', userId)
      .single();

    if (cvError || !cvData) {
      console.error('[Parse CV] CV not found:', cvError);
      return new Response(JSON.stringify({ error: 'CV not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const cvText = cvData.cv_text;
    const cvHash = await createHash(cvText);
    console.log(`[Parse CV] CV text fetched (${cvText.length} chars, hash: ${cvHash.substring(0, 12)}...)`);

    // Check if we have valid cache
    const { data: existingData } = await supabase
      .from('active_cv_for_matching')
      .select('*')
      .eq('user_id', userId)
      .single();

    const now = new Date();
    const isCacheValid = existingData &&
                        existingData.cv_text_hash === cvHash &&
                        existingData.cv_id === cvId &&
                        new Date(existingData.cache_expires_at) > now;

    if (isCacheValid) {
      console.log(`[Parse CV] ✅ Using cached data (expires: ${existingData.cache_expires_at})`);

      // Update activation count but return cached data
      const shouldReset = existingData.last_activation_reset &&
                         now >= getNextMonday(new Date(existingData.last_activation_reset));

      await supabase
        .from('active_cv_for_matching')
        .update({
          activation_count: shouldReset ? 1 : existingData.activation_count + 1,
          last_activation_reset: shouldReset ? now.toISOString() : existingData.last_activation_reset,
          updated_at: now.toISOString()
        })
        .eq('user_id', userId);

      return new Response(JSON.stringify({
        success: true,
        cached: true,
        data: {
          occupations: existingData.extracted_occupations,
          skills: existingData.extracted_skills,
          educations: existingData.extracted_educations,
          location: existingData.extracted_location
        },
        quota: {
          remaining: quota.remaining,
          nextReset: quota.nextReset.toISOString()
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Parse CV] Cache miss or expired, running AI parsing...`);

    // AI Parsing with GPT-4o-mini
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Du är en CV-parser för jobbmatchning på den svenska arbetsmarknaden.

UPPGIFT: Extrahera ALLA yrkesroller, kompetenser, utbildningar och plats.

KRITISKA REGLER:
1. Rättstavning: Korrigera alla stavfel till korrekt svenska
2. Svenska termer: Använd svenska yrkesbenämningar (inte engelska om svensk motsvarighet finns)
3. Komplett: Inkludera ALLA roller och kompetenser, även äldre erfarenheter
4. Normalisering: "VVS montör" → "VVS-montör", "ST läkare" → "ST-läkare"
5. Separera: Lista varje yrkesroll separat (inte kombinerade titlar)

EXEMPEL occupations (bra):
✅ ["Butikschef", "Försäljningschef", "Butiksansvarig"]
❌ ["butiks chef", "Försäljning chef"]  (felstavat)
❌ ["Butikschef och försäljningsansvarig"]  (kombinerat - ska vara två separata)

EXEMPEL skills (specifika, svenska):
✅ ["Ledarskap", "Försäljning", "Excel", "Kassasystem", "Personalansvar", "Budgetansvar", "Visual Merchandising"]
❌ ["God kommunikationsförmåga", "Teamwork"]  (för vaga)
❌ ["Leadership", "Sales"]  (engelska när svenska finns)

Returnera ENDAST JSON, ingen annan text.`
          },
          {
            role: 'user',
            content: `Parsa detta CV för jobbmatchning:

${cvText}

Returnera JSON:
{
  "occupations": string[],     // ALLA yrkesroller (rättstavade, svenska, separerade)
  "skills": string[],          // ALLA kompetenser (specifika, svenska)
  "educations": [{
    "degree": string,          // T.ex. "Kandidatexamen", "Gymnasieexamen"
    "field": string,           // T.ex. "Ekonomi", "Teknik"
    "institution": string,     // T.ex. "Stockholms Universitet"
    "year": string             // T.ex. "2015"
  }],
  "location": string           // Huvudsaklig plats (stad)
}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.json();
      throw new Error(`OpenAI API error: ${error.error?.message}`);
    }

    const aiData = await aiResponse.json();
    const parsed = JSON.parse(aiData.choices[0].message.content);

    console.log(`[Parse CV] AI extracted:`, {
      occupations: parsed.occupations?.length || 0,
      skills: parsed.skills?.length || 0,
      educations: parsed.educations?.length || 0,
      location: parsed.location
    });

    // Normalize occupations via Taxonomy API
    console.log(`[Parse CV] Normalizing ${parsed.occupations?.length || 0} occupations via Taxonomy API...`);
    const normalizedOccupations: OccupationMatch[] = [];

    if (parsed.occupations && Array.isArray(parsed.occupations)) {
      for (const occupation of parsed.occupations) {
        const normalized = await normalizeOccupation(occupation);
        normalizedOccupations.push(normalized);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const highConfidenceCount = normalizedOccupations.filter(o => o.confidence === 'high').length;
    console.log(`[Parse CV] Normalization complete: ${highConfidenceCount}/${normalizedOccupations.length} high-confidence matches`);

    // Save to database
    const shouldReset = existingData?.last_activation_reset &&
                       now >= getNextMonday(new Date(existingData.last_activation_reset));

    const { error: saveError } = await supabase
      .from('active_cv_for_matching')
      .upsert({
        user_id: userId,
        cv_id: cvId,
        extracted_occupations: normalizedOccupations,
        extracted_skills: parsed.skills || [],
        extracted_educations: parsed.educations || [],
        extracted_location: parsed.location || null,
        parsing_model: 'gpt-4o-mini',
        taxonomy_version: 'v1',
        cv_text_hash: cvHash,
        cache_expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        parsed_at: now.toISOString(),
        activation_count: shouldReset ? 1 : (existingData?.activation_count || 0) + 1,
        last_activation_reset: shouldReset ? now.toISOString() : (existingData?.last_activation_reset || now.toISOString()),
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (saveError) {
      console.error('[Parse CV] Save error:', saveError);
      throw saveError;
    }

    console.log(`[Parse CV] ✅ CV activated successfully (cache valid for 30 days)`);

    return new Response(JSON.stringify({
      success: true,
      cached: false,
      data: {
        occupations: normalizedOccupations,
        skills: parsed.skills || [],
        educations: parsed.educations || [],
        location: parsed.location || null
      },
      quota: {
        remaining: quota.remaining,
        nextReset: quota.nextReset.toISOString()
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Parse CV] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
