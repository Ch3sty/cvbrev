// src/lib/ai-cost-tracker.ts
// Utility for tracking AI usage and costs across all features

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Parameters for tracking AI usage
 */
export interface TrackAIUsageParams {
  supabase: SupabaseClient;
  userId: string;
  featureName: string;        // 'letter_generation', 'cv_analysis', 'cv_parsing', etc.
  endpoint: string;            // '/api/letters/generate-preview', '/api/cv/analyze'
  model: string;               // 'gpt-4o', 'gpt-4o-mini', etc.
  promptTokens: number;
  completionTokens: number;
  costUsd: number;             // Cost in USD
  generationTimeMs?: number;   // Optional: time taken for generation
  metadata?: Record<string, any>; // Optional: extra info (tonality, language, job title, etc.)
}

/**
 * Feature name constants for consistency
 */
export const AI_FEATURES = {
  LETTER_GENERATION: 'letter_generation',
  CV_PARSING: 'cv_parsing',
  CV_ANALYSIS: 'cv_analysis',
  CV_IMPROVEMENT: 'cv_improvement',
  COMPETENCE_ANALYSIS: 'competence_analysis',
  LINKEDIN_OPTIMIZATION: 'linkedin_optimization',
  GROUP_IMPROVEMENTS: 'group_improvements',
  CV_FORMATTING: 'cv_formatting',
} as const;

/**
 * Tracks AI usage and cost in the database
 *
 * @param params - TrackAIUsageParams object with all required information
 * @returns Promise<boolean> - true if tracking succeeded, false otherwise
 *
 * @example
 * ```typescript
 * await trackAIUsage({
 *   supabase,
 *   userId: user.id,
 *   featureName: AI_FEATURES.LETTER_GENERATION,
 *   endpoint: '/api/letters/generate-preview',
 *   model: 'gpt-4o',
 *   promptTokens: 1500,
 *   completionTokens: 800,
 *   costUsd: 0.023,
 *   generationTimeMs: 3200,
 *   metadata: { tonality: 'professional', language: 'sv' }
 * });
 * ```
 */
export async function trackAIUsage(params: TrackAIUsageParams): Promise<boolean> {
  const {
    supabase,
    userId,
    featureName,
    endpoint,
    model,
    promptTokens,
    completionTokens,
    costUsd,
    generationTimeMs,
    metadata = {}
  } = params;

  try {
    // Calculate total tokens
    const totalTokens = promptTokens + completionTokens;

    // Convert USD to SEK (using exchange rate of 10.5)
    const costSek = parseFloat((costUsd * 10.5).toFixed(2));

    // Insert into database
    const { error } = await supabase
      .from('ai_usage_costs')
      .insert({
        user_id: userId,
        feature_name: featureName,
        endpoint,
        ai_model: model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost_usd: costUsd,
        cost_sek: costSek,
        generation_time_ms: generationTimeMs || null,
        metadata
      });

    if (error) {
      console.error('[AI Cost Tracker] Failed to track AI usage:', {
        featureName,
        userId,
        error: error.message
      });
      return false;
    }

    console.log('[AI Cost Tracker] Successfully tracked AI usage:', {
      featureName,
      model,
      tokens: totalTokens,
      costUsd: costUsd.toFixed(6),
      costSek: costSek.toFixed(2)
    });

    return true;
  } catch (error: any) {
    console.error('[AI Cost Tracker] Unexpected error tracking AI usage:', {
      featureName,
      userId,
      error: error.message
    });
    return false;
  }
}

/**
 * Gets total AI cost for a specific user
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param dateFrom - Optional: filter from this date
 * @returns Promise<number> - Total cost in SEK
 */
export async function getUserTotalAICost(
  supabase: SupabaseClient,
  userId: string,
  dateFrom?: Date
): Promise<number> {
  try {
    let query = supabase
      .from('ai_usage_costs')
      .select('cost_sek')
      .eq('user_id', userId);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AI Cost Tracker] Failed to get user total cost:', error.message);
      return 0;
    }

    return data?.reduce((sum, record) => sum + parseFloat(record.cost_sek.toString()), 0) || 0;
  } catch (error: any) {
    console.error('[AI Cost Tracker] Error getting user total cost:', error.message);
    return 0;
  }
}

/**
 * Gets AI usage breakdown by feature for a user
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param dateFrom - Optional: filter from this date
 * @returns Promise<Record<string, {calls: number, costSek: number}>>
 */
export async function getUserFeatureBreakdown(
  supabase: SupabaseClient,
  userId: string,
  dateFrom?: Date
): Promise<Record<string, { calls: number; costSek: number }>> {
  try {
    let query = supabase
      .from('ai_usage_costs')
      .select('feature_name, cost_sek')
      .eq('user_id', userId);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AI Cost Tracker] Failed to get feature breakdown:', error.message);
      return {};
    }

    const breakdown: Record<string, { calls: number; costSek: number }> = {};

    data?.forEach(record => {
      const feature = record.feature_name;
      if (!breakdown[feature]) {
        breakdown[feature] = { calls: 0, costSek: 0 };
      }
      breakdown[feature].calls++;
      breakdown[feature].costSek += parseFloat(record.cost_sek.toString());
    });

    return breakdown;
  } catch (error: any) {
    console.error('[AI Cost Tracker] Error getting feature breakdown:', error.message);
    return {};
  }
}

/**
 * Gets total AI cost for all users (admin function)
 *
 * @param supabase - Supabase client
 * @param dateFrom - Optional: filter from this date
 * @returns Promise<number> - Total cost in SEK
 */
export async function getTotalAICost(
  supabase: SupabaseClient,
  dateFrom?: Date
): Promise<number> {
  try {
    let query = supabase
      .from('ai_usage_costs')
      .select('cost_sek');

    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AI Cost Tracker] Failed to get total cost:', error.message);
      return 0;
    }

    return data?.reduce((sum, record) => sum + parseFloat(record.cost_sek.toString()), 0) || 0;
  } catch (error: any) {
    console.error('[AI Cost Tracker] Error getting total cost:', error.message);
    return 0;
  }
}
