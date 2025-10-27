// src/lib/openai/pricing-sync.ts
// Service for syncing LLM model pricing from external sources

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * LiteLLM pricing data structure
 */
interface LiteLLMPricingEntry {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  input_cost_per_second?: number;
  output_cost_per_second?: number;
  max_tokens?: number;
  litellm_provider?: string;
  mode?: string;
  supports_function_calling?: boolean;
  supports_vision?: boolean;
  supports_prompt_caching?: boolean;
  cached_input_cost_per_token?: number;
  [key: string]: any;
}

interface LiteLLMPricingData {
  [modelName: string]: LiteLLMPricingEntry;
}

/**
 * Our database model pricing structure
 */
interface ModelPricing {
  model_name: string;
  provider: string;
  input_cost_per_million: number;
  output_cost_per_million: number;
  cached_input_cost_per_million?: number | null;
  source: string;
  metadata: Record<string, any>;
  last_updated?: string;
}

/**
 * Result of a pricing sync operation
 */
export interface PricingSyncResult {
  success: boolean;
  modelsUpdated: number;
  modelsAdded: number;
  errors: string[];
  lastSyncedAt: string;
}

/**
 * Fetches pricing data from LiteLLM's public JSON
 */
export async function fetchLiteLLMPricing(): Promise<LiteLLMPricingData> {
  const LITELLM_PRICING_URL = 'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';

  try {
    const response = await fetch(LITELLM_PRICING_URL, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LiteLLM pricing: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching LiteLLM pricing:', error);
    throw new Error(`Failed to fetch pricing data: ${error.message}`);
  }
}

/**
 * Normalizes model name to extract base model
 * Examples: "gpt-4o-2024-08-06" -> "gpt-4o", "azure/gpt-4o" -> "gpt-4o"
 */
function normalizeModelName(modelName: string): { baseName: string; provider: string } {
  // Remove provider prefix (e.g., "azure/", "openai/")
  let cleanName = modelName;
  let provider = 'openai'; // Default provider

  if (modelName.includes('/')) {
    const parts = modelName.split('/');
    provider = parts[0];
    cleanName = parts.slice(1).join('/');
  }

  // Remove date suffixes (e.g., "-2024-08-06")
  cleanName = cleanName.replace(/-\d{4}-\d{2}-\d{2}$/, '');

  return { baseName: cleanName, provider };
}

/**
 * Filters and transforms LiteLLM data to our format
 * Only includes OpenAI models (can extend to other providers later)
 */
export function transformLiteLLMToOurFormat(litellmData: LiteLLMPricingData): ModelPricing[] {
  const results: ModelPricing[] = [];
  const processedModels = new Set<string>(); // Prevent duplicates

  for (const [modelName, pricing] of Object.entries(litellmData)) {
    // Skip if no pricing data
    if (!pricing.input_cost_per_token || !pricing.output_cost_per_token) {
      continue;
    }

    const { baseName, provider } = normalizeModelName(modelName);

    // Only process OpenAI models for now
    if (provider !== 'openai' && !modelName.startsWith('gpt-')) {
      continue;
    }

    // Skip if we already processed this base model
    if (processedModels.has(baseName)) {
      continue;
    }

    processedModels.add(baseName);

    // Convert from cost per token to cost per million tokens
    const inputCostPerMillion = pricing.input_cost_per_token * 1_000_000;
    const outputCostPerMillion = pricing.output_cost_per_token * 1_000_000;
    const cachedInputCostPerMillion = pricing.cached_input_cost_per_token
      ? pricing.cached_input_cost_per_token * 1_000_000
      : null;

    // Build metadata
    const metadata: Record<string, any> = {
      max_tokens: pricing.max_tokens,
      mode: pricing.mode,
      supports_function_calling: pricing.supports_function_calling,
      supports_vision: pricing.supports_vision,
      supports_prompt_caching: pricing.supports_prompt_caching,
      original_model_name: modelName,
      synced_at: new Date().toISOString()
    };

    results.push({
      model_name: baseName,
      provider: 'openai',
      input_cost_per_million: inputCostPerMillion,
      output_cost_per_million: outputCostPerMillion,
      cached_input_cost_per_million: cachedInputCostPerMillion,
      source: 'litellm',
      metadata
    });
  }

  return results;
}

/**
 * Syncs pricing data from LiteLLM to our database
 */
export async function syncPricingToDatabase(
  supabase: SupabaseClient
): Promise<PricingSyncResult> {
  const errors: string[] = [];
  let modelsUpdated = 0;
  let modelsAdded = 0;

  try {
    // Fetch pricing from LiteLLM
    const litellmData = await fetchLiteLLMPricing();

    // Transform to our format
    const pricingData = transformLiteLLMToOurFormat(litellmData);

    if (pricingData.length === 0) {
      throw new Error('No valid pricing data found in LiteLLM source');
    }

    // Upsert each model to database
    for (const pricing of pricingData) {
      try {
        // Check if model exists
        const { data: existingModel } = await supabase
          .from('model_pricing')
          .select('id, input_cost_per_million, output_cost_per_million')
          .eq('model_name', pricing.model_name)
          .single();

        if (existingModel) {
          // Update existing model
          const { error: updateError } = await supabase
            .from('model_pricing')
            .update({
              input_cost_per_million: pricing.input_cost_per_million,
              output_cost_per_million: pricing.output_cost_per_million,
              cached_input_cost_per_million: pricing.cached_input_cost_per_million,
              source: pricing.source,
              metadata: pricing.metadata,
              last_updated: new Date().toISOString()
            })
            .eq('model_name', pricing.model_name);

          if (updateError) {
            errors.push(`Failed to update ${pricing.model_name}: ${updateError.message}`);
          } else {
            modelsUpdated++;
          }
        } else {
          // Insert new model
          const { error: insertError } = await supabase
            .from('model_pricing')
            .insert(pricing);

          if (insertError) {
            errors.push(`Failed to insert ${pricing.model_name}: ${insertError.message}`);
          } else {
            modelsAdded++;
          }
        }
      } catch (error: any) {
        errors.push(`Error processing ${pricing.model_name}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0 || (modelsUpdated + modelsAdded) > 0,
      modelsUpdated,
      modelsAdded,
      errors,
      lastSyncedAt: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Pricing sync failed:', error);
    return {
      success: false,
      modelsUpdated: 0,
      modelsAdded: 0,
      errors: [error.message],
      lastSyncedAt: new Date().toISOString()
    };
  }
}

/**
 * Gets pricing for a specific model from database
 * Returns null if not found
 */
export async function getModelPricing(
  supabase: SupabaseClient,
  modelName: string
): Promise<ModelPricing | null> {
  try {
    const { data, error } = await supabase
      .from('model_pricing')
      .select('*')
      .eq('model_name', modelName)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ModelPricing;
  } catch (error) {
    console.error(`Error fetching pricing for ${modelName}:`, error);
    return null;
  }
}

/**
 * Gets all pricing data from database
 */
export async function getAllModelPricing(
  supabase: SupabaseClient,
  provider?: string
): Promise<ModelPricing[]> {
  try {
    let query = supabase
      .from('model_pricing')
      .select('*')
      .order('model_name', { ascending: true });

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data as ModelPricing[];
  } catch (error) {
    console.error('Error fetching all pricing:', error);
    return [];
  }
}

/**
 * In-memory cache for pricing data (5 minute TTL)
 */
const pricingCache = new Map<string, { data: ModelPricing; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Gets cached pricing or fetches from database
 */
export async function getCachedModelPricing(
  supabase: SupabaseClient,
  modelName: string
): Promise<ModelPricing | null> {
  const cached = pricingCache.get(modelName);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const pricing = await getModelPricing(supabase, modelName);

  if (pricing) {
    pricingCache.set(modelName, { data: pricing, timestamp: Date.now() });
  }

  return pricing;
}

/**
 * Clears the pricing cache
 */
export function clearPricingCache(): void {
  pricingCache.clear();
}

/**
 * Calculates cost for a specific API call using database pricing
 * Falls back to baseline prices if model not found in database
 */
export async function calculateCostFromDatabase(
  supabase: SupabaseClient,
  model: string,
  promptTokens: number,
  completionTokens: number
): Promise<number> {
  try {
    // Try to get pricing from database (with cache)
    const pricing = await getCachedModelPricing(supabase, model);

    if (pricing) {
      // Calculate cost using database prices
      const inputCost = (promptTokens / 1_000_000) * pricing.input_cost_per_million;
      const outputCost = (completionTokens / 1_000_000) * pricing.output_cost_per_million;
      const totalCost = inputCost + outputCost;

      console.log(`[Cost Calculation] Model: ${model}, Database pricing used`, {
        inputCost: inputCost.toFixed(6),
        outputCost: outputCost.toFixed(6),
        totalCost: totalCost.toFixed(6),
        promptTokens,
        completionTokens
      });

      return parseFloat(totalCost.toFixed(6));
    }

    // Fallback to baseline prices
    console.warn(`[Cost Calculation] Model ${model} not found in database, using baseline pricing`);

    // Import baseline calculation from api.ts
    const { calculateOpenAICost } = await import('./api');
    const baselineCost = calculateOpenAICost(model, promptTokens, completionTokens);

    if (baselineCost !== null) {
      return baselineCost;
    }

    // Ultimate fallback - return 0 if model completely unknown
    console.error(`[Cost Calculation] Model ${model} not found in database OR baseline - returning 0`);
    return 0;

  } catch (error: any) {
    console.error(`[Cost Calculation] Error calculating cost for ${model}:`, error);

    // Fallback on error
    try {
      const { calculateOpenAICost } = await import('./api');
      const baselineCost = calculateOpenAICost(model, promptTokens, completionTokens);
      return baselineCost !== null ? baselineCost : 0;
    } catch {
      return 0;
    }
  }
}
