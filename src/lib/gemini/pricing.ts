// src/lib/gemini/pricing.ts - Kostnadsberäkning för Gemini-anrop
// Ersätter calculateOpenAICost (src/lib/openai/api.ts) och calculateGPT5Cost (gpt5-client.ts)

/**
 * Baseline-priser i USD per 1M tokens (fallback om databasen saknar modellen).
 * Uppdaterad 2026-06-12 från https://ai.google.dev/gemini-api/docs/pricing
 * Thinking-tokens debiteras som output.
 */
const BASELINE_PRICES: { [key: string]: { input: number; output: number } } = {
  'gemini-3.1-pro':        { input: 2.0,  output: 12.0 },
  'gemini-3.5-flash':      { input: 1.5,  output: 9.0 },
  'gemini-3-flash':        { input: 0.5,  output: 3.0 },
  'gemini-3.1-flash-lite': { input: 0.25, output: 1.5 },
  'gemini-2.5-flash':      { input: 0.3,  output: 2.5 },
  'gemini-2.5-flash-lite': { input: 0.1,  output: 0.4 },
  'gemini-embedding-001':  { input: 0.15, output: 0 },
};

/**
 * Beräknar kostnaden för ett Gemini-anrop i USD.
 * Thinking-tokens ska redan vara inräknade i completionTokens av anroparen
 * (generate.ts gör detta: candidatesTokenCount + thoughtsTokenCount).
 */
export function calculateGeminiCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number | null {
  let modelPrice = BASELINE_PRICES[model];

  // Ta bort versionssuffix (t.ex. "gemini-3-flash-001" -> "gemini-3-flash")
  if (!modelPrice) {
    const baseModel = model.replace(/-(\d{3}|preview.*|latest)$/, '');
    modelPrice = BASELINE_PRICES[baseModel];
  }

  if (!modelPrice) {
    console.warn(`[calculateGeminiCost] No pricing found for model: ${model}`);
    return null;
  }

  const inputCost = (promptTokens / 1_000_000) * modelPrice.input;
  const outputCost = (completionTokens / 1_000_000) * modelPrice.output;

  return parseFloat((inputCost + outputCost).toFixed(6));
}
