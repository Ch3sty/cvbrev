// Snabbtest: verifiera att hybrid-RAG fungerar med Gemini-frågevektorer efter re-embedding.
import { createClient } from '@supabase/supabase-js';
import { embedQuery } from '../src/lib/gemini';

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const question = 'Vad gäller för a-kassa och arbetslöshetsersättning?';
  const queryEmbedding = await embedQuery(question);

  const { data, error } = await supabase.rpc('search_ai_chunks_hybrid', {
    query_embedding: queryEmbedding,
    query_text: question,
    match_count: 3,
    for_user: null,
    for_topic: null,
  });

  if (error) throw error;
  console.log(`Fråga: "${question}"`);
  console.log(`Träffar: ${data?.length ?? 0}`);
  for (const chunk of data ?? []) {
    console.log(`  - ${chunk.title || chunk.heading || 'Utan rubrik'} (score: ${chunk.score?.toFixed?.(4) ?? JSON.stringify(chunk.score ?? chunk.vec_score ?? '?')})`);
  }
}

main().catch((e) => {
  console.error('❌ RAG-test misslyckades:', e.message);
  process.exit(1);
});
