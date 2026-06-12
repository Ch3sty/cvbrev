// Smoke-test av brevgenereringen (produktens kärna) mot riktiga Gemini-API:t.
import { generateCoverLetter, extractJobInfo } from '../src/lib/openai/api';

const JOB_AD = `Säljare till Elgiganten Kungens Kurva

Vi söker en driven säljare till vårt varuhus i Kungens Kurva. Du kommer att arbeta med
försäljning av hemelektronik, ge kunderna service i världsklass och bidra till butikens
försäljningsmål. Vi söker dig som har erfarenhet av försäljning eller kundservice,
gillar att jobba i högt tempo och är en lagspelare. Meriterande med kunskap om
hemelektronik och kassasystem. Vi erbjuder fast lön + provision, friskvårdsbidrag
och goda utvecklingsmöjligheter inom Elgiganten.`;

const SKILLS = `Erfarenheter och kompetenser (anonymiserade):
- 4 års erfarenhet av detaljhandel och kundservice i elektronikbutik
- Försäljning av mobiltelefoner och abonnemang, överträffade säljmål 8 av 12 månader
- Van vid kassasystem, lagerhantering och reklamationshantering
- Utbildade nya medarbetare i säljteknik och produktkunskap
- Gymnasieexamen, försäljningsprogram`;

async function main() {
  console.log('1/2 extractJobInfo...');
  const info = await extractJobInfo(JOB_AD, 'sv');
  console.log('   ', info);

  console.log('2/2 generateCoverLetter...');
  const start = Date.now();
  const result = await generateCoverLetter(SKILLS, JOB_AD, 'auto', 'sv');
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const wordCount = result.content.trim().split(/\s+/).length;

  console.log(`   model: ${result.model} | ${elapsed}s | ${wordCount} ord | tokens:`, result.tokens, '| cost: $' + result.cost);
  console.log('\n--- BREV ---\n');
  console.log(result.content);

  if (wordCount < 150 || wordCount > 550) throw new Error(`Ovanlig brevlängd: ${wordCount} ord`);
  console.log('\n✅ Brevgenerering OK');
}

main().catch((e) => {
  console.error('❌ Misslyckades:', e.message);
  process.exit(1);
});
