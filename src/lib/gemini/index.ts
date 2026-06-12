// src/lib/gemini/index.ts - Samlad export för Gemini-modulen
export { gemini, DEFAULT_SAFETY_SETTINGS } from './client';
export { GEMINI_MODELS, type GeminiModelAlias } from './models';
export { calculateGeminiCost } from './pricing';
export {
  generateText,
  generateJSON,
  generateStream,
  chatContents,
  stripJsonFences,
  toGeminiSchema,
  extractUsage,
  assertNotBlocked,
  type GeminiUsage,
  type GenerateOptions,
  type GenerateTextResult,
  type GenerateJSONResult,
} from './generate';
export { generateFromImages, type VisionOptions } from './vision';
export {
  embedTexts,
  embedQuery,
  EMBEDDING_DIMENSIONS,
  type EmbeddingTaskType,
} from './embeddings';
export {
  searchGrounded,
  structureGroundedResult,
  type GroundedSearchResult,
  type GroundingSource,
} from './grounded-search';
export {
  analyzeCompetenceGapPro,
  generateLearningSuggestions,
} from './competence-analysis';
