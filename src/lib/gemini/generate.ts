// src/lib/gemini/generate.ts - Kärnhelpers för textgenerering, JSON-läge och streaming
import type { Content, GenerateContentResponse, Schema } from '@google/genai';
import { gemini, DEFAULT_SAFETY_SETTINGS } from './client';
import { GEMINI_MODELS } from './models';
import { calculateGeminiCost } from './pricing';

export interface GeminiUsage {
  prompt: number;
  completion: number; // candidates + thinking (debiteras som output)
  thinking: number;
  total: number;
}

export interface GenerateOptions {
  model?: string;
  systemInstruction?: string;
  prompt?: string;
  /** Fullständig konversationshistorik. Används i stället för prompt om satt. */
  contents?: Content[];
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  /** 0 stänger av thinking helt (rekommenderas för parsing/extraktion/chat-latens). */
  thinkingBudget?: number;
}

export interface GenerateTextResult {
  text: string;
  model: string;
  usage: GeminiUsage | null;
  cost: number | null;
}

export interface GenerateJSONResult<T> extends GenerateTextResult {
  data: T;
}

const MAX_RETRIES = 3;

/** Mappar usageMetadata till vår interna form. Thinking räknas in i completion. */
export function extractUsage(response: GenerateContentResponse): GeminiUsage | null {
  const meta = response.usageMetadata;
  if (!meta) return null;
  const prompt = meta.promptTokenCount ?? 0;
  const thinking = meta.thoughtsTokenCount ?? 0;
  const completion = (meta.candidatesTokenCount ?? 0) + thinking;
  return {
    prompt,
    completion,
    thinking,
    total: meta.totalTokenCount ?? prompt + completion,
  };
}

/** Konverterar OpenAI-stil-historik ({role: 'assistant'|'user', content}) till Gemini Content[]. */
export function chatContents(
  messages: Array<{ role: string; content: string }>
): Content[] {
  return messages
    .filter((m) => m.role !== 'system' && m.content)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

function buildConfig(opts: GenerateOptions, extra?: Record<string, unknown>) {
  return {
    ...(opts.systemInstruction ? { systemInstruction: opts.systemInstruction } : {}),
    ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    ...(opts.maxOutputTokens !== undefined ? { maxOutputTokens: opts.maxOutputTokens } : {}),
    ...(opts.topP !== undefined ? { topP: opts.topP } : {}),
    ...(opts.thinkingBudget !== undefined
      ? { thinkingConfig: { thinkingBudget: opts.thinkingBudget } }
      : {}),
    safetySettings: DEFAULT_SAFETY_SETTINGS,
    ...extra,
  };
}

function buildContents(opts: GenerateOptions): Content[] {
  if (opts.contents && opts.contents.length > 0) return opts.contents;
  return [{ role: 'user', parts: [{ text: opts.prompt ?? '' }] }];
}

/** Kastar tydligt fel om svaret blockerats av safety-filter eller är tomt. */
export function assertNotBlocked(response: GenerateContentResponse): void {
  const blockReason = response.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Gemini blockerade förfrågan (blockReason: ${blockReason})`);
  }
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Gemini returnerade inga candidates (möjligen safety-blockerat svar)');
  }
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status ?? error?.code;
      const retryable = status === 429 || status === 503 || status === 500;
      if (!retryable || attempt === MAX_RETRIES - 1) throw error;
      const delayMs = Math.min(2000 * 2 ** attempt, 10000);
      console.warn(`[gemini] ${status} - retry ${attempt + 1}/${MAX_RETRIES} om ${delayMs}ms`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

/** Vanlig textgenerering. Motsvarar openai.chat.completions.create utan response_format. */
export async function generateText(opts: GenerateOptions): Promise<GenerateTextResult> {
  const model = opts.model ?? GEMINI_MODELS.quality;
  const response = await withRetry(() =>
    gemini.models.generateContent({
      model,
      contents: buildContents(opts),
      config: buildConfig(opts),
    })
  );
  assertNotBlocked(response);

  const text = response.text ?? '';
  const usage = extractUsage(response);
  return {
    text,
    model,
    usage,
    cost: usage ? calculateGeminiCost(model, usage.prompt, usage.completion) : null,
  };
}

/** Tar bort ev. markdown-staket runt JSON-svar. */
export function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

/**
 * Sanerar ett JSON Schema till Geminis OpenAPI-subset:
 * tar bort additionalProperties, minLength/maxLength och $schema rekursivt.
 */
export function toGeminiSchema(schema: Record<string, any>): Schema {
  const clean = (node: any): any => {
    if (Array.isArray(node)) return node.map(clean);
    if (node === null || typeof node !== 'object') return node;
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(node)) {
      if (['additionalProperties', 'minLength', 'maxLength', '$schema'].includes(key)) continue;
      out[key] = clean(value);
    }
    return out;
  };
  return clean(schema) as Schema;
}

/**
 * JSON-generering. Motsvarar response_format json_object (utan schema)
 * respektive json_schema strict (med schema).
 */
export async function generateJSON<T = any>(
  opts: GenerateOptions & { schema?: Record<string, any> }
): Promise<GenerateJSONResult<T>> {
  const model = opts.model ?? GEMINI_MODELS.quality;
  const response = await withRetry(() =>
    gemini.models.generateContent({
      model,
      contents: buildContents(opts),
      config: buildConfig(opts, {
        responseMimeType: 'application/json',
        ...(opts.schema ? { responseSchema: toGeminiSchema(opts.schema) } : {}),
      }),
    })
  );
  assertNotBlocked(response);

  const text = response.text ?? '';
  if (!text.trim()) {
    throw new Error('Gemini returnerade tomt JSON-svar (kontrollera maxOutputTokens/thinkingBudget)');
  }

  let data: T;
  try {
    data = JSON.parse(stripJsonFences(text)) as T;
  } catch {
    throw new Error(`Gemini returnerade ogiltig JSON: ${text.substring(0, 200)}`);
  }

  const usage = extractUsage(response);
  return {
    data,
    text,
    model,
    usage,
    cost: usage ? calculateGeminiCost(model, usage.prompt, usage.completion) : null,
  };
}

/**
 * Streaming-generering. Returnerar async-iterabeln direkt (chunk.text för ny text)
 * plus getUsage() som läser usageMetadata från sista chunken efter att strömmen konsumerats.
 */
export async function generateStream(opts: GenerateOptions): Promise<{
  stream: AsyncGenerator<GenerateContentResponse>;
  model: string;
  getUsage: () => GeminiUsage | null;
}> {
  const model = opts.model ?? GEMINI_MODELS.quality;
  const rawStream = await withRetry(() =>
    gemini.models.generateContentStream({
      model,
      contents: buildContents(opts),
      config: buildConfig(opts),
    })
  );

  let lastUsage: GeminiUsage | null = null;
  async function* wrapped(): AsyncGenerator<GenerateContentResponse> {
    for await (const chunk of rawStream) {
      const usage = extractUsage(chunk);
      if (usage) lastUsage = usage;
      yield chunk;
    }
  }

  return { stream: wrapped(), model, getUsage: () => lastUsage };
}
