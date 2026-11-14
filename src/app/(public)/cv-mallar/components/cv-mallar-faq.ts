/**
 * FAQ pa /cv-mallar-hubben.
 *
 * Riktade mot "cv mall"-keywords:
 *  - "cv mall gratis", "cv mall ladda ner", "cv mall pdf",
 *  - "professionell cv-mall", "modern cv mall", "ats-säker cv-mall"
 */
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, PREMIUM_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { paketKort } from '@/lib/plans/plans'

export const CV_MALLAR_FAQ = [
  {
    q: 'Är CV-mallarna gratis att ladda ner?',
    a: `Ja, ${FREE_TEMPLATE_COUNT} av våra ${TEMPLATE_COUNT} CV-mallar är gratis att ladda ner. De övriga ${PREMIUM_TEMPLATE_COUNT} ingår i ${paketKort()}. Alla gratismallar är ATS-säkra och fungerar i de flesta svenska rekryteringssystem. De mallar som ingår i ${paketKort()} har mer designfrihet: stöd för foto, färgade paneler och specialiserade yrkesvarianter.`,
  },
  {
    q: 'Vilken CV-mall är bäst för svenska arbetsgivare 2026?',
    a: 'Det beror på branschen. För traditionella tjänsteyrken passar Norrsken, Atlas eller Tidlös. För tech används Stack-mallen. För vård och pedagogik finns specialiserade mallar (Vården, Klinik, Pedagog) som lyfter rätt meriter: legitimationer, behörigheter och kompetensområden.',
  },
  {
    q: 'Vad är skillnaden mellan en CV-mall och ett CV-exempel?',
    a: 'En CV-mall är en designstruktur du fyller med ditt eget innehåll. Ett CV-exempel är någon annans färdiga CV som du kan låta dig inspireras av. Vi har båda: använd en mall för designen och titta på exempel för formuleringarna.',
  },
  {
    q: 'Är mallarna ATS-säkra?',
    a: 'Alla våra ATS-märkta mallar är. Det betyder ingen clip-path, inga absolutpositionerade textelement, standardrubriker (Arbetslivserfarenhet, Utbildning, Kompetenser) och vanlig HTML-struktur som rekryteringssystem som Heroma, Visma och Workday kan läsa korrekt.',
  },
  {
    q: 'Kan jag ladda ner CV-mallen som PDF eller Word?',
    a: 'Du laddar ner som PDF direkt från vår mallväljare. Word-export finns inte. Vi rekommenderar PDF eftersom det säkerställer att layouten ser exakt likadan ut hos rekryteraren. Word-filer förändras ofta beroende på mottagarens version.',
  },
  {
    q: 'Hur väljer jag rätt CV-mall för mitt yrke?',
    a: 'Tre frågor: Vilken bransch? Hur konservativ är arbetsgivaren? Hur mycket erfarenhet har du? Vård, juridik och offentlig sektor: en traditionell mall (Tidlös, Klinik, Atlas). Tech, marknadsföring och kreativa yrken: en modern eller kreativ mall (Stack, Aurora, Galleri). Stor erfarenhet: en kompakt mall (Konsulten). Begränsad erfarenhet: en enkel mall (Student, Norrsken).',
  },
  // Situationerna (SEO-förslaget K6, 2026-11-14).
  {
    q: 'Vilken CV-mall passar en chef?',
    a: 'Det beror på nivån. Atlas är gjord för vd, ledningsgrupp och styrelseuppdrag. Tidlös Plus passar seniora chefer i traditionella branscher, Norrsken Plus chefer på mellannivå och Myndighet Plus enhetschefer i offentlig sektor. Har du många uppdrag att redovisa rymmer Konsulten mer på samma yta. Alla fem ingår i Premium.',
  },
  {
    q: 'Vilken CV-mall passar vid karriärbyte?',
    a: 'En mall i en kolumn med plats för en profiltext högst upp, till exempel gratismallen Norrsken. Profilen förklarar bytet innan rekryteraren läser din erfarenhet, och de kompetenser du tar med dig till det nya yrket hamnar högt. Undvik mallar där tidigare titlar tar mest plats.',
  },
  {
    q: 'Kan jag byta CV-mall efter att jag fyllt i mitt CV?',
    a: 'Ja. Du fyller i dina uppgifter en gång och kan sedan byta mall och typsnitt utan att något av innehållet försvinner. Då är det lätt att pröva en traditionell och en modern mall mot varandra innan du laddar ner.',
  },
  {
    q: 'Behöver jag foto på CV:t?',
    a: 'Inte obligatoriskt i Sverige men vanligt. Foto är framträdande i serviceyrken, sälj och pedagogik. Mindre vanligt i juridik, akademi och executive search. Våra mallar har stöd för foto där det passar, och du kan slå av eller på fotot efter vad du föredrar.',
  },
  {
    q: 'Kan jag använda samma mall för olika ansökningar?',
    a: 'Ja, men anpassa innehållet per ansökan. Mallen är formen, och innehållet ska spegla tjänsten du söker. Använd vår CV-byggare som låter dig skapa flera versioner med samma mall men olika sammanfattning, kompetenser och fokus.',
  },
  {
    q: 'Vilken mall ska jag välja som student utan jobberfarenhet?',
    a: 'Student-mallen lyfter utbildning först och ger plats för projekt och praktik. Den passar sommarjobb och första jobbet.',
  },
  {
    q: 'Hur lång ska mitt CV vara?',
    a: 'Som regel 1 sida för 0-5 års erfarenhet, 1.5-2 sidor för 5-10 år, max 2 sidor för seniora positioner. Undantag: läkare, akademiker och konsulter med många meritlistor kan motivera 2-3 sidor. Mallarna är designade för att hålla typografisk balans oavsett längd.',
  },
]
