/**
 * FAQ pa /cv-mallar-hubben.
 *
 * Riktade mot "cv mall"-keywords:
 *  - "cv mall gratis", "cv mall ladda ner", "cv mall pdf",
 *  - "professionell cv-mall", "modern cv mall", "ats-säker cv-mall"
 *
 * Svaren skrivna om for mallutbudet 2026-11-16 (svensk-ux-copywriter,
 * SEO-strategen); fragorna ordagrant som tidigare. Tal ur katalogen,
 * mallnamn som text.
 */
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, PREMIUM_TEMPLATE_COUNT, WORD_TEMPLATE_COUNT_ORD, talSomOrd, wordMallarSomText } from '@/lib/cv/template-antal'
import { MALL_ANTAL, MALL_KATALOG, WORD_ANTAL } from '@/lib/cv/mallar/katalog'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'

const versal = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
const FOTO_ANTAL = MALL_KATALOG.filter((m) => m.foto).length
const FOTO_GRATIS = MALL_KATALOG.filter((m) => m.foto && m.niva === 'gratis').length
const uppraknat = (n: string[]) => (n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} och ${n[n.length - 1]}`)
const GRATIS_NAMN = uppraknat(MALL_KATALOG.filter((m) => m.niva === 'gratis').map((m) => m.namn))

export const CV_MALLAR_FAQ = [
  {
    q: 'Är CV-mallarna gratis att ladda ner?',
    a: `Ja, ${FREE_TEMPLATE_COUNT} av våra ${TEMPLATE_COUNT} CV-mallar är gratis att ladda ner, som PDF eller Word, en nedladdning per konto utan kortuppgift. De övriga ${PREMIUM_TEMPLATE_COUNT} ingår i ${paketKort()}. Alla ${TEMPLATE_COUNT} är testade mot rekryteringssystem, också gratismallarna, och alla har fyra färger, rubriker för din bransch och plats för LinkedIn. Mallarna i ${paketKort()} ger mer form att välja på: sidospalter, rubriker i marginalen, konstnärliga layouter och fler fotoplatser. ${versal(WORD_TEMPLATE_COUNT_ORD)} av mallarna finns dessutom som Word-fil, gratismallarna inräknade.`,
  },
  {
    q: 'Vilken CV-mall är bäst för svenska arbetsgivare 2026?',
    a: 'Den som läses rätt av rekryteringssystemet och känns rätt hos arbetsgivaren. För offentlig sektor, vård, bank och juridik väljer många en lugn mall i en spalt, som Linne, Antikva eller Kolumn. För tech, konsult och försäljning fungerar en mall med sidospalt, som Kalksten eller Stål, som rymmer mer på en sida. Yrket lägger du i rubrikerna, inte i mallen: välj rubrikuppsättningen för din bransch så blir "Arbetslivserfarenhet" till "Klinisk erfarenhet" eller "Pedagogisk erfarenhet", och legitimationer och behörigheter får ett eget avsnitt.',
  },
  {
    q: 'Vad är skillnaden mellan en CV-mall och ett CV-exempel?',
    a: 'En CV-mall är en designstruktur du fyller med ditt eget innehåll. Ett CV-exempel är någon annans färdiga CV som du kan låta dig inspireras av. Vi har båda: använd en mall för designen och titta på exempel för formuleringarna.',
  },
  {
    q: 'Är mallarna ATS-säkra?',
    a: 'Ja, alla. Varje mall i utbudet har gått genom vår egen CV-läsare med korta, normala och långa CV, och med intyg först och utbildning först. Namnet läses alltid först, och kontaktuppgifter, rubriker och ordning kommer ut rätt. En mall som inte klarar det testet tar vi inte med. Grundrubrikerna är standardrubrikerna (Arbetslivserfarenhet, Utbildning, Kompetenser) och texten är vanlig text utan textrutor eller absolutpositionerade element, samma slags text som rekryteringssystem som Heroma, Visma och Workday hämtar sina uppgifter ur.',
  },
  {
    q: 'Kan jag ladda ner CV-mallen som PDF eller Word?',
    a: `Alla mallar laddas ner som PDF direkt från vår mallväljare, och ${WORD_TEMPLATE_COUNT_ORD} av dem finns också som Word-fil. Gratismallarna hämtar du som Word utan att betala, Word i de övriga Word-mallarna ingår i ${paketKort()}. Vi rekommenderar PDF när du skickar, eftersom layouten då ser likadan ut hos rekryteraren. Word passar när du vill ändra i filen själv, eller när annonsen ber om ett redigerbart format.`,
  },
  {
    q: 'Hur väljer jag rätt CV-mall för mitt yrke?',
    a: 'Tre frågor: Hur konservativ är arbetsgivaren? Hur mycket ska få plats? Vill du ha foto? Vård, juridik och offentlig sektor: en lugn mall i en spalt, som Linne, Antikva eller Folio. Tech, marknadsföring och kreativa yrken: en mall med mer form, som Stål, Raster eller någon av de konstnärliga, till exempel Terrakotta eller Horisont. Mycket erfarenhet: en sidospalt som Kalksten eller Granit, som rymmer mer på en sida. Begränsad erfarenhet: Björk eller Linne, med utbildningen först i ordningen. Yrket lägger du i rubrikerna med rubrikuppsättningen för din bransch. Alla mallar passar alla yrken.',
  },
  // Situationerna (SEO-förslaget K6, 2026-11-14).
  {
    q: 'Vilken CV-mall passar en chef?',
    a: 'Det beror på nivån och på hur mycket du har att redovisa. För vd, ledningsgrupp och styrelseuppdrag passar en formell mall i en spalt, som Antikva med centrerat huvud och dubbel linje, eller Folio i Garamond. Chefer på mellannivå och enhetschefer i offentlig sektor väljer ofta Linne, eller Kolumn där rubrikerna står i marginalen och texten får luft. Har du många uppdrag att få med rymmer Stål eller Kalksten mer på samma yta. Välj rubrikuppsättningen Chef och ledning, så är avsnittsrubrikerna skrivna för ledarroller, och sätt ordningen så att det viktigaste kommer först. Linne är gratis, de övriga ingår i Premium.',
  },
  {
    q: 'Vilken CV-mall passar vid karriärbyte?',
    a: 'En mall i en spalt med profiltexten högst upp, till exempel gratismallen Linne eller Björk. Profilen förklarar bytet innan rekryteraren läser din erfarenhet. Välj sedan ordningen kompetenser först, så hamnar det du tar med dig till det nya yrket direkt under profilen, före titlarna från det gamla. Undvik mallar där årtalen är själva poängen, som Årsring, Tusch eller Horisont, eftersom de drar blicken till hur länge du gjorde det förra.',
  },
  {
    q: 'Kan jag byta CV-mall efter att jag fyllt i mitt CV?',
    a: 'Ja. Du fyller i dina uppgifter en gång och kan sedan byta mall, färg och typsnitt utan att något av innehållet försvinner. Då är det lätt att pröva en mall i en spalt mot en med sidospalt innan du laddar ner, och att se om ditt CV får plats på en sida i båda.',
  },
  {
    q: 'Behöver jag foto på CV:t?',
    a: `Inte obligatoriskt i Sverige men vanligt. Foto är framträdande i serviceyrken, sälj och pedagogik. Mindre vanligt i juridik, akademi och executive search. ${versal(talSomOrd(FOTO_ANTAL))} av våra mallar har en fotoplats, bland dem gratismallen Björk, och du slår fotot på eller av efter vad arbetsgivaren väntar sig. Rekryteringssystemet läser texten lika bra med som utan.`,
  },
  {
    q: 'Kan jag använda samma mall för olika ansökningar?',
    a: 'Ja, men anpassa innehållet per ansökan. Mallen är formen, och innehållet ska spegla tjänsten du söker. Använd vår CV-byggare som låter dig skapa flera versioner med samma mall men olika sammanfattning, kompetenser och fokus.',
  },
  {
    q: 'Vilken mall ska jag välja som student utan jobberfarenhet?',
    a: 'Välj Björk eller Linne och sätt ordningen utbildning först, så kommer examen, kurser och projekt före jobberfarenheten. Rubrikuppsättningen Student ger avsnitten rubriker som passar när praktik, extrajobb och projekt är det du har. Båda mallarna är gratis att ladda ner som PDF, och de håller lika bra för första jobbet som för sommarjobbet.',
  },
  {
    q: 'Hur lång ska mitt CV vara?',
    a: 'Som regel 1 sida för 0-5 års erfarenhet, 1.5-2 sidor för 5-10 år, max 2 sidor för seniora positioner. Undantag: läkare, akademiker och konsulter med många meritlistor kan motivera 2-3 sidor. Mallarna håller typografin oavsett längd, och ligger du strax över en sida finns valet Få plats på en sida i mallväljaren, som drar ihop CV:t utan att du behöver stryka något.',
  },
  // Frågorna som flyttade med från /verktyg/cv-mallar när den sidan blev en
  // omdirigering hit (SEO-strategen 2026-11-16), ordagrant.
  {
    q: 'Vilka mallar finns som Word?',
    a: `${wordMallarSomText()}. De är märkta Word i mallväljaren. Bland dem finns mallar i en spalt, mallar med sidospalt och mallar med rubrikerna eller årtalen i marginalen, och alla ${WORD_TEMPLATE_COUNT_ORD} har gått genom vår läsning av själva Word-filen innan de kom med. ${GRATIS_NAMN} hämtar du som Word gratis, de andra Word-mallarna ingår i ${paketKort()}. Övriga mallar laddas ner som PDF.`,
  },
  {
    q: 'Vad är skillnaden mellan gratismallarna och mallarna i Premium?',
    a: `Gratismallarna ${GRATIS_NAMN} laddar du ner som PDF eller Word, en fil per konto, utan kortuppgift. De är fullständiga mallar med samma färger, typsnitt och rubrikuppsättningar som de övriga${FOTO_GRATIS ? `, och ${talSomOrd(FOTO_GRATIS)} av dem har plats för foto` : ''}. I ${paketKort()} får du alla ${MALL_ANTAL} mallar, bland dem sidospalterna och de konstnärliga, nedladdning utan tak och Word-filen i alla ${WORD_TEMPLATE_COUNT_ORD} Word-mallar. Priset är ${prisPeriod(SALD_PLAN)}.`,
  },
  {
    q: 'Kan jag redigera CV:t senare?',
    a: 'Ja. Allt du fyller i sparas i ditt konto och du kan när som helst gå tillbaka, redigera och ladda ner en ny version. Du kan också byta mall utan att förlora din data.',
  },
  {
    q: 'Kan jag använda mallen för internationella ansökningar?',
    a: 'Ja. Mallarna är språkneutrala, så du kan fylla i dem på engelska och få en professionell layout som fungerar både i Sverige och utomlands. Tänk på att vissa länder har egna konventioner: i USA är ett CV oftast en sida, i Tyskland väntas oftast ett "Lebenslauf" med foto.',
  },
  // Från de sammanslagna artiklarna cv-mall-gratis-guide, cv-mall-pdf-gratis
  // och cv-mall-word-gratis (SEO-svepet 2026-11-17, B4 punkt 5), skrivna mot
  // produktfacit. Befintliga frågor ovan och nedan ordagrant.
  {
    q: 'Var hittar jag en gratis CV-mall?',
    a: `Hos oss är ${GRATIS_NAMN} gratis: du fyller i mallen direkt på sidan och laddar ner en fil som PDF eller Word, utan kortuppgift och utan vattenstämpel. Word har egna CV-mallar under Arkiv och Nytt, Google Docs har ett mallgalleri och Pages har en egen kategori för CV. Vilken du än väljer, kontrollera att mallen inte bygger på textrutor, tabeller för layout eller text i sidhuvudet, eftersom rekryteringssystemen ofta läser dem fel.`,
  },
  {
    q: 'Ska jag skicka CV:t som PDF eller Word?',
    a: `PDF, om annonsen inte ber om något annat. En PDF ser likadan ut hos rekryteraren som hos dig, medan ett Word-dokument kan byta typsnitt och brytas om när mottagaren saknar ditt. Ber annonsen eller bemanningsföretaget om Word skickar du Word, ofta för att CV:t ska läsas in i deras eget system. ${WORD_ANTAL} av våra mallar finns som Word-fil.`,
  },
  {
    q: 'Kan jag använda Words egna CV-mallar?',
    a: `Ja, men kontrollera dem först. Words mallar ligger under Arkiv och Nytt och är gratis. Många av de designade bygger på textrutor, tabeller eller kolumner som rekryteringssystemen läser i fel ordning eller hoppar över, medan de mest avskalade, i en spalt med standardrubriker, fungerar bättre. Vill du slippa kontrollera själv är alla våra ${MALL_ANTAL} mallar testade mot rekryteringssystem, och ${WORD_ANTAL} av dem laddar du ner som Word-fil.`,
  },
  {
    q: 'Är mallarna mobilanpassade när jag bygger CV:t?',
    a: 'Ja. Hela byggprocessen fungerar lika bra på mobil som på dator. Du kan börja på telefonen i bussen och fortsätta hemma framför datorn. Den färdiga PDF:en är formaterad för utskrift och digital läsning oavsett enhet.',
  },
]
