// Tillfälligt smoke-test för Gemini-migreringen. Körs: npx tsx scripts/smoke-gemini.ts
import { generateText, generateJSON, embedTexts, GEMINI_MODELS } from '../src/lib/gemini';

async function main() {
  console.log('1/3 generateText (fast)...');
  const text = await generateText({
    model: GEMINI_MODELS.fast,
    prompt: 'Svara med exakt ett ord: huvudstaden i Sverige.',
    maxOutputTokens: 100,
    thinkingBudget: 0,
  });
  console.log('   text:', JSON.stringify(text.text.trim()), '| usage:', text.usage, '| cost:', text.cost);

  console.log('2/3 generateJSON (extractJobInfo-mönster)...');
  const json = await generateJSON<{ company?: string; position?: string }>({
    model: GEMINI_MODELS.fast,
    systemInstruction: 'Extrahera företagsnamn och tjänstetitel. Svara i JSON: {"company": "...", "position": "..."}',
    prompt: 'Vi på Spotify söker en Senior Backend Developer till vårt team i Stockholm.',
    temperature: 0.3,
    maxOutputTokens: 500,
    thinkingBudget: 0,
  });
  console.log('   data:', json.data, '| cost:', json.cost);

  console.log('3/3 embedTexts (1536 dim + normalisering)...');
  const [vec] = await embedTexts(['Hur fungerar a-kassan i Sverige?'], 'RETRIEVAL_QUERY');
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  console.log(`   dimensions: ${vec.length}, |v| = ${norm.toFixed(6)}`);

  if (vec.length !== 1536) throw new Error('Fel dimension!');
  if (Math.abs(norm - 1) > 0.001) throw new Error('Vektorn är inte normaliserad!');
  if (!json.data.company?.toLowerCase().includes('spotify')) throw new Error('JSON-extraktion gav fel företag');

  console.log('\n✅ Alla smoke-tester passerade');
}

main().catch((e) => {
  console.error('❌ Smoke-test misslyckades:', e.message);
  process.exit(1);
});
