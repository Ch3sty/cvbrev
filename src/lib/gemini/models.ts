// src/lib/gemini/models.ts - Enda sanningskällan för modellmappningen
//
// Mappning från tidigare OpenAI-modeller:
//   gpt-4o / gpt-4-turbo-preview  -> quality   (brev, premium CV-analys, förbättringsexempel)
//   gpt-4o-mini                   -> fast      (parsing, extraktion, grammatik, vision, chat)
//   gpt-5 / gpt-4o-search-preview -> reasoning (kompetensanalys + grounded kurssökning)
//   text-embedding-3-small        -> embedding (1536 dim via outputDimensionality)
//
// OBS: namnen är verifierade mot ListModels 2026-06-12. "gemini-3-flash" och
// "gemini-3.1-pro" finns ENDAST som -preview i API:t; 3.5-flash och 3.1-flash-lite är GA.
export const GEMINI_MODELS = {
  quality: 'gemini-3.5-flash',
  fast: 'gemini-3.1-flash-lite',
  reasoning: 'gemini-3.1-pro-preview',
  embedding: 'gemini-embedding-001',
} as const;

export type GeminiModelAlias = keyof typeof GEMINI_MODELS;
