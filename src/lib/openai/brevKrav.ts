// src/lib/openai/brevKrav.ts - Annonsens krav mot brevets stycken (brevrummet, BYGGSPEC avsnitt 4).
//
// Samma leverantör och mönster som generateCoverLetter (Gemini via
// @/lib/gemini). In går bara annonstexten och brevets stycken, aldrig CV:t
// eller profilens uppgifter: styckena är modellens egen brödtext, och
// avsändarens namn och kontakt sätts in först i mallen.
//
// Svaret valideras på servern (src/lib/letters/krav.ts): ett citat som inte
// står ordagrant i styckena blir null, färre än tre krav ger [].
import { generateJSON, GEMINI_MODELS } from '@/lib/gemini';
import type { BrevKrav } from '@/lib/letters/brevmall/typer';
import { valideraKrav, MAX_KRAV } from '@/lib/letters/krav';

export interface BrevKravResultat {
  /** Validerade krav, [] vid färre än tre, null när anropet gick fel. */
  krav: BrevKrav[] | null;
  model: string;
  tokens: { prompt: number; completion: number; total: number } | null;
  cost: number | null;
}

const SCHEMA = {
  type: 'object',
  properties: {
    krav: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          krav: { type: 'string' },
          citat: { type: 'string', nullable: true },
        },
        required: ['krav'],
      },
    },
  },
  required: ['krav'],
};

function systemPrompt(sprak: 'sv' | 'en'): string {
  const kravSprak = sprak === 'en' ? 'på annonsens språk' : 'på svenska om annonsen är svensk, annars på annonsens språk';
  return `Du granskar ett personligt brev mot en jobbannons, som en rekryterare gör.

Uppgift:
1. Läs ut de krav i annonsen som en rekryterare skulle bocka av: utbildning, erfarenhet, kunskaper, körkort, språk, egenskaper. Högst ${MAX_KRAV}, de viktigaste först. Gäller alla yrken, inte bara tekniska.
2. Skriv varje krav kort i annonsens egna ord, ${kravSprak}, högst 40 tecken, versal först, utan punkt. Exempel: "B-körkort", "Erfarenhet av projektledning", "Engelska i tal och skrift".
3. För varje krav: kopiera EN mening eller del av mening ur brevet som svarar på kravet, tecken för tecken exakt som den står i brevet. Ändra ingenting, korta inte inuti, lägg inte till ord. Svarar brevet inte på kravet: citat null.

Hitta aldrig på krav som inte står i annonsen. Gissa aldrig ett citat. Färre än tre tydliga krav är ett giltigt svar.

Svara bara med JSON: {"krav":[{"krav":"...","citat":"..." eller null}]}`;
}

/**
 * Läser annonsens krav och brevets svar. Kastar aldrig: går anropet fel blir
 * krav null och brevet levereras ändå.
 */
export async function lasKravIAnnonsen(
  annons: string,
  stycken: readonly string[],
  sprak: 'sv' | 'en' = 'sv'
): Promise<BrevKravResultat> {
  const model = GEMINI_MODELS.fast;
  const annonsText = (annons ?? '').trim();
  if (!annonsText || stycken.length === 0) {
    return { krav: null, model, tokens: null, cost: null };
  }

  const brevText = stycken.map((s, i) => `[${i + 1}] ${s}`).join('\n\n');
  const prompt = `## Jobbannons\n${annonsText.substring(0, 6000)}\n\n## Brevets stycken\n${brevText.substring(0, 6000)}`;

  try {
    const { data, usage, cost } = await generateJSON<unknown>({
      model,
      systemInstruction: systemPrompt(sprak),
      prompt,
      temperature: 0.1,
      maxOutputTokens: 1500,
      thinkingBudget: 0,
      schema: SCHEMA,
    });
    return {
      krav: valideraKrav(data, stycken),
      model,
      tokens: usage ? { prompt: usage.prompt, completion: usage.completion, total: usage.total } : null,
      cost,
    };
  } catch (error: any) {
    console.error('Kraven i annonsen kunde inte läsas:', error?.message ?? error);
    return { krav: null, model, tokens: null, cost: null };
  }
}
