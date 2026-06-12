// src/lib/gemini/embeddings.ts - Embeddings med 1536 dim (ersätter text-embedding-3-small)
//
// VIKTIGT: Gemini förnormaliserar endast 3072-dim-output. MRL-trunkerade 1536-vektorer
// är INTE enhetslängd och normaliseras därför manuellt här, så att vec_score-semantiken
// i search_ai_chunks_hybrid (1 - cosinusavstånd) förblir korrekt.
import { gemini } from './client';
import { GEMINI_MODELS } from './models';

export const EMBEDDING_DIMENSIONS = 1536;

export type EmbeddingTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

function l2Normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vector;
  return vector.map((v) => v / norm);
}

/**
 * Embeddar en eller flera texter. Använd RETRIEVAL_DOCUMENT vid ingest
 * och RETRIEVAL_QUERY för sökfrågor (asymmetrisk retrieval ger bättre träffar).
 */
export async function embedTexts(
  texts: string[],
  taskType: EmbeddingTaskType
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await gemini.models.embedContent({
    model: GEMINI_MODELS.embedding,
    contents: texts,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
      taskType,
    },
  });

  const embeddings = response.embeddings;
  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error(
      `Gemini embeddings: förväntade ${texts.length} vektorer, fick ${embeddings?.length ?? 0}`
    );
  }

  return embeddings.map((e) => {
    const values = e.values;
    if (!values || values.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Gemini embeddings: förväntade ${EMBEDDING_DIMENSIONS} dimensioner, fick ${values?.length ?? 0}`
      );
    }
    return l2Normalize(values);
  });
}

/** Bekvämlighetsfunktion för en enskild sökfråga. */
export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text], 'RETRIEVAL_QUERY');
  return vector;
}
