// supabase/functions/_shared/gemini.ts
// Delad Gemini-helper för edge-funktioner (Deno). Raw REST mot
// generativelanguage.googleapis.com - speglar src/lib/gemini/ i Next.js-appen.

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Verifierade mot ListModels 2026-06-12 (3-flash/3.1-pro finns endast som -preview)
export const GEMINI_MODELS = {
  quality: 'gemini-3.5-flash',
  fast: 'gemini-3.1-flash-lite',
  reasoning: 'gemini-3.1-pro-preview',
  embedding: 'gemini-embedding-001',
} as const;

export const EMBEDDING_DIMENSIONS = 1536;

// CV/jobbannons-innehåll kan trippa default-trösklarna - blockera endast på hög sannolikhet
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

function getApiKey(): string {
  const key = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!key) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }
  return key;
}

export interface GeminiUsage {
  prompt: number;
  completion: number; // candidates + thinking
  total: number;
}

export interface GeminiGenerateOptions {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** 0 stänger av thinking (rekommenderas för parsing/extraktion). */
  thinkingBudget?: number;
  /** Sätt till true för JSON-läge (responseMimeType application/json). */
  json?: boolean;
  /** Valfritt responseSchema (OpenAPI-subset; ingen additionalProperties/minLength). */
  schema?: Record<string, unknown>;
}

async function geminiFetch(url: string, body: unknown, retries = 3): Promise<any> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': getApiKey(),
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return await response.json();
    }

    const errorText = await response.text();
    lastError = new Error(`Gemini API error ${response.status}: ${errorText.substring(0, 500)}`);

    // Retry på rate limit / serverfel
    if (response.status === 429 || response.status === 500 || response.status === 503) {
      const delayMs = Math.min(2000 * 2 ** attempt, 10000);
      console.warn(`[gemini] ${response.status} - retry ${attempt + 1}/${retries} in ${delayMs}ms`);
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }
    throw lastError;
  }
  throw lastError;
}

function extractUsage(data: any): GeminiUsage | null {
  const meta = data?.usageMetadata;
  if (!meta) return null;
  const prompt = meta.promptTokenCount ?? 0;
  const completion = (meta.candidatesTokenCount ?? 0) + (meta.thoughtsTokenCount ?? 0);
  return { prompt, completion, total: meta.totalTokenCount ?? prompt + completion };
}

function extractText(data: any): string {
  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Gemini blocked the request (blockReason: ${blockReason})`);
  }
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    throw new Error('Gemini returned no candidates (possibly safety-blocked)');
  }
  return parts
    .filter((p: any) => typeof p.text === 'string' && !p.thought)
    .map((p: any) => p.text)
    .join('');
}

/** true när svaret kapades av maxOutputTokens (då blir JSON:en ofullständig). */
function wasTruncated(data: any): boolean {
  return data?.candidates?.[0]?.finishReason === 'MAX_TOKENS';
}

/**
 * Bästa-möjliga-reparation av JSON som kapats mitt i (t.ex. av MAX_TOKENS):
 * stäng en öppen sträng, släng ett hängande objekt/komma efter sista kompletta
 * elementet, och balansera kvarvarande ] och }. Målet är att rädda de element
 * som HANN bli kompletta i stället för att kasta hela svaret.
 */
function repairTruncatedJson(text: string): string {
  let s = text.trim();
  // Klipp bort ett ev. sista, ofullständigt objekt: backa till sista "}".
  const lastClose = s.lastIndexOf('}');
  if (lastClose !== -1) s = s.slice(0, lastClose + 1);
  // Släng hängande komma ("...}, ").
  s = s.replace(/,\s*$/, '');
  // Balansera hakparenteser och klammer (fler öppningar än stängningar).
  const open = (ch: string) => (s.match(new RegExp('\\' + ch, 'g')) || []).length;
  const needBrackets = open('[') - open(']');
  const needBraces = open('{') - open('}');
  if (needBraces > 0) s += '}'.repeat(needBraces);
  if (needBrackets > 0) s += ']'.repeat(needBrackets);
  return s;
}

/** Textgenerering. Motsvarar tidigare chat/completions-anrop. */
export async function geminiGenerate(
  opts: GeminiGenerateOptions
): Promise<{ text: string; model: string; usage: GeminiUsage | null; truncated: boolean }> {
  const model = opts.model ?? GEMINI_MODELS.quality;

  const generationConfig: Record<string, unknown> = {};
  if (opts.temperature !== undefined) generationConfig.temperature = opts.temperature;
  if (opts.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = opts.maxOutputTokens;
  if (opts.thinkingBudget !== undefined) {
    generationConfig.thinkingConfig = { thinkingBudget: opts.thinkingBudget };
  }
  if (opts.json) {
    generationConfig.responseMimeType = 'application/json';
    if (opts.schema) generationConfig.responseSchema = opts.schema;
  }

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
    generationConfig,
    safetySettings: SAFETY_SETTINGS,
  };
  if (opts.systemInstruction) {
    body.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
  }

  const data = await geminiFetch(`${GEMINI_BASE_URL}/models/${model}:generateContent`, body);
  return { text: extractText(data), model, usage: extractUsage(data), truncated: wasTruncated(data) };
}

/** Tar bort ev. markdown-staket runt JSON-svar. */
function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

/** JSON-generering med parse. Motsvarar response_format json_object/json_schema. */
export async function geminiGenerateJSON<T = any>(
  opts: Omit<GeminiGenerateOptions, 'json'>
): Promise<{ data: T; text: string; model: string; usage: GeminiUsage | null }> {
  const result = await geminiGenerate({ ...opts, json: true });
  if (!result.text.trim()) {
    throw new Error('Gemini returned empty JSON response (check maxOutputTokens/thinkingBudget)');
  }
  const cleaned = stripJsonFences(result.text);
  let parsed: T;
  try {
    parsed = JSON.parse(cleaned) as T;
  } catch {
    // Kapat svar (oftast MAX_TOKENS): försök rädda de kompletta elementen i
    // stället för att kasta hela analysen. Ett trunkerat men reparerbart svar
    // ger ändå användbara förslag.
    try {
      parsed = JSON.parse(repairTruncatedJson(cleaned)) as T;
      console.warn(
        `[gemini] JSON var trunkerad${result.truncated ? ' (MAX_TOKENS)' : ''}, reparerad och tolkad. Höj maxOutputTokens för fullständigt svar.`
      );
    } catch {
      const hint = result.truncated
        ? ' (svaret kapades av maxOutputTokens, höj gränsen)'
        : '';
      throw new Error(`Gemini returned invalid JSON${hint}: ${cleaned.substring(0, 200)}`);
    }
  }
  return { data: parsed, text: result.text, model: result.model, usage: result.usage };
}

function l2Normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vector;
  return vector.map((v) => v / norm);
}

/**
 * Embeddar texter med 1536 dimensioner (ersätter text-embedding-3-small).
 * Batch-API:t (batchEmbedContents) tar flera texter per anrop.
 * VIKTIGT: 1536-trunkerade vektorer normaliseras manuellt (endast 3072-dim
 * är förnormaliserade av Gemini) så att cosinus-score i pgvector blir korrekt.
 */
export async function geminiEmbed(
  texts: string[],
  taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const model = GEMINI_MODELS.embedding;
  const body = {
    requests: texts.map((text) => ({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    })),
  };

  const data = await geminiFetch(`${GEMINI_BASE_URL}/models/${model}:batchEmbedContents`, body);
  const embeddings = data?.embeddings;
  if (!Array.isArray(embeddings) || embeddings.length !== texts.length) {
    throw new Error(
      `Gemini embeddings: expected ${texts.length} vectors, got ${embeddings?.length ?? 0}`
    );
  }

  return embeddings.map((e: any) => {
    const values = e?.values;
    if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Gemini embeddings: expected ${EMBEDDING_DIMENSIONS} dimensions, got ${values?.length ?? 0}`
      );
    }
    return l2Normalize(values);
  });
}
