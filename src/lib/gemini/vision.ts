// src/lib/gemini/vision.ts - Bildinput (ersätter OpenAI image_url data-URLs)
import { gemini, DEFAULT_SAFETY_SETTINGS } from './client';
import { GEMINI_MODELS } from './models';
import { calculateGeminiCost } from './pricing';
import { assertNotBlocked, extractUsage, type GenerateTextResult } from './generate';

export interface VisionOptions {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  /** PNG-bilder som Buffers (t.ex. renderade PDF-sidor). */
  pngBuffers: Buffer[];
  temperature?: number;
  maxOutputTokens?: number;
  thinkingBudget?: number;
}

/** Textextraktion/analys från bilder via inlineData-parts. */
export async function generateFromImages(opts: VisionOptions): Promise<GenerateTextResult> {
  const model = opts.model ?? GEMINI_MODELS.fast;

  const parts = [
    { text: opts.prompt },
    ...opts.pngBuffers.map((buffer) => ({
      inlineData: {
        mimeType: 'image/png',
        data: buffer.toString('base64'),
      },
    })),
  ];

  const response = await gemini.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: {
      ...(opts.systemInstruction ? { systemInstruction: opts.systemInstruction } : {}),
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      ...(opts.maxOutputTokens !== undefined ? { maxOutputTokens: opts.maxOutputTokens } : {}),
      ...(opts.thinkingBudget !== undefined
        ? { thinkingConfig: { thinkingBudget: opts.thinkingBudget } }
        : {}),
      safetySettings: DEFAULT_SAFETY_SETTINGS,
    },
  });
  assertNotBlocked(response);

  const usage = extractUsage(response);
  return {
    text: response.text ?? '',
    model,
    usage,
    cost: usage ? calculateGeminiCost(model, usage.prompt, usage.completion) : null,
  };
}
