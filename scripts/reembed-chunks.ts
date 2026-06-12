// Engångsskript: re-embedda alla ai_document_chunks med Gemini (1536 dim, normaliserade).
// Gamla OpenAI-vektorer (text-embedding-3-small) är inkompatibla med Gemini-frågevektorer.
// Körs: npx tsx scripts/reembed-chunks.ts  (kräver GOOGLE_AI_API_KEY + SUPABASE_SERVICE_ROLE_KEY)
import { createClient } from '@supabase/supabase-js';
import { embedTexts } from '../src/lib/gemini';

const BATCH_SIZE = 50;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Saknar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(url, serviceKey);

  const { data: chunks, error } = await supabase
    .from('ai_document_chunks')
    .select('id, content')
    .order('id');

  if (error) throw error;
  if (!chunks || chunks.length === 0) {
    console.log('Inga chunks att re-embedda.');
    return;
  }

  console.log(`Re-embeddar ${chunks.length} chunks i batchar om ${BATCH_SIZE}...`);
  let done = 0;
  let failed = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embeddings = await embedTexts(batch.map((c) => c.content), 'RETRIEVAL_DOCUMENT');

    for (let j = 0; j < batch.length; j++) {
      const { error: updateError } = await supabase
        .from('ai_document_chunks')
        .update({ embedding: embeddings[j] })
        .eq('id', batch[j].id);

      if (updateError) {
        console.error(`  Fel vid uppdatering av chunk ${batch[j].id}:`, updateError.message);
        failed++;
      } else {
        done++;
      }
    }
    console.log(`  ${done}/${chunks.length} klara`);
  }

  console.log(`\n✅ Re-embedding klar: ${done} uppdaterade, ${failed} fel`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error('❌ Re-embedding misslyckades:', e.message);
  process.exit(1);
});
