// src/lib/gemini/grounded-search.ts - Webbsökning via google_search grounding
// Ersätter gpt-4o-search-preview och GPT-5 Responses API web_search-verktyget.
//
// OBS: googleSearch-verktyget kan INTE kombineras med responseSchema/JSON-läge i samma
// anrop. Använd därför tvåstegsmönstret: searchGrounded() -> structureGroundedResult().
import { gemini, DEFAULT_SAFETY_SETTINGS } from './client';
import { GEMINI_MODELS } from './models';
import { calculateGeminiCost } from './pricing';
import {
  assertNotBlocked,
  extractUsage,
  generateJSON,
  type GeminiUsage,
} from './generate';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundedSearchResult {
  text: string;
  sources: GroundingSource[];
  model: string;
  usage: GeminiUsage | null;
  cost: number | null;
}

/** Steg 1: grounded sökning. Returnerar fritext + källor ur groundingMetadata. */
export async function searchGrounded(opts: {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
}): Promise<GroundedSearchResult> {
  const model = opts.model ?? GEMINI_MODELS.reasoning;

  const response = await gemini.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
    config: {
      ...(opts.systemInstruction ? { systemInstruction: opts.systemInstruction } : {}),
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      tools: [{ googleSearch: {} }],
      safetySettings: DEFAULT_SAFETY_SETTINGS,
    },
  });
  assertNotBlocked(response);

  const groundingChunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources: GroundingSource[] = groundingChunks
    .map((chunk) => ({
      uri: chunk.web?.uri ?? '',
      title: chunk.web?.title ?? '',
    }))
    .filter((s) => s.uri);

  const usage = extractUsage(response);
  return {
    text: response.text ?? '',
    sources,
    model,
    usage,
    cost: usage ? calculateGeminiCost(model, usage.prompt, usage.completion) : null,
  };
}

/**
 * Steg 2: strukturera det groundade svaret till JSON med ett billigt flash-lite-anrop.
 * Källorna ur groundingMetadata skickas med så modellen föredrar verifierade URL:er
 * framför URL:er som skrevs i prosan.
 */
export async function structureGroundedResult<T = any>(opts: {
  groundedText: string;
  sources: GroundingSource[];
  instruction: string;
  schema?: Record<string, any>;
}): Promise<{ data: T; usage: GeminiUsage | null; cost: number | null }> {
  const sourceList = opts.sources
    .map((s, i) => `${i + 1}. ${s.title}: ${s.uri}`)
    .join('\n');

  const result = await generateJSON<T>({
    model: GEMINI_MODELS.fast,
    systemInstruction: opts.instruction,
    prompt: `## Sökresultat (text):\n${opts.groundedText}\n\n## Verifierade källor (föredra dessa URL:er):\n${sourceList || '(inga)'}`,
    temperature: 0.1,
    thinkingBudget: 0,
    schema: opts.schema,
  });

  return { data: result.data, usage: result.usage, cost: result.cost };
}
