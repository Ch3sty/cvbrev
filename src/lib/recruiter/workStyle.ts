// src/lib/recruiter/workStyle.ts
// =============================================================================
// Arbetsstilsprofil: regelbaserad härledning ur det avancerade
// personlighetstestets 30 IPIP-NEO-facetter (0-100). Deterministisk och
// förklarbar — kandidatens förhandsvisning är alltid identisk med det
// rekryteraren ser. ALLT regelverk (trösklar, band, banker,
// kombinationstabeller) ligger som DATA i den här filen så kandidatens
// förhandsvisning och rekryterarens vy garanterat renderar ur samma härledning.
//
// SKYDDSRÄCKEN (ändra aldrig utan nytt beslut):
// 1. Endast arbetsrelevanta facetter i WHITELIST används. Känsliga facetter
//    (n3_depression, a2_morality, o6_liberalism, n5_immoderation,
//    n4_self_consciousness, o3_emotionality, a5_modesty, n2_anger,
//    e5_excitement_seeking, e6_cheerfulness, o2_artistic_interests) rörs
//    ALDRIG — härledning ur depression, moral eller åsikter i
//    rekryteringssammanhang är etiskt och juridiskt otänkbar.
// 2. Endast positiv/neutral inramning: påståenden beskriver styrkor, aldrig
//    brister. Lågt facettvärde ger inget påstående alls. Lågt band renderas
//    endast som neutral pol i godkända bipolära spektra, aldrig som text.
// 3. Visning, aldrig filtrering: rekryterare kan läsa arbetsstilen men det
//    finns medvetet inget sökfilter på den. Aldrig matchprocent, prediktion
//    eller ranking på personlighetsdata.
// 4. Spektra exponeras ENDAST som band 1-5 + polettiketter — råvärden lämnar
//    aldrig motorn i typer som går till klienten. Band 3 = neutral
//    ("Flexibel mellan lägena") och genererar ingen copy.
// =============================================================================

export interface WorkStyle {
  archetype: { title: string; description: string };
  /** 3-4 beteendepåståenden i arbetskontext, härledda ur toppfacetterna. */
  statements: string[];
}

/**
 * Kompakt arbetsstil för kandidatKORTET (inte detaljprofilen). Alltid exakt två
 * spektra (de mest avvikande) + den starkaste "trivs när"-frasen. Härleds ur
 * samma motor som fullrapporten, så kandidatens preview och rekryterarens kort
 * aldrig divergerar.
 */
export interface CardWorkStyle {
  archetype: { title: string; description: string };
  /** Exakt två spektra, mest avvikande först. Aldrig neutralt band när det går. */
  spectra: SpectrumView[];
  /** Kortaste, starkaste miljöpassningen ("processer är tydliga och ..."), eller null. */
  thrivesWhen: string | null;
}

export interface DomainScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// ---------------------------------------------------------------------------
// Påståendebanken (kompakta panelen, fallback): whitelistade facetter →
// arbetsplatsspråk. Ett påstående kvalificerar när facetten är bland
// kandidatens starkaste OCH över SCORE_FLOOR (annars säger "starkast" inget).
// ---------------------------------------------------------------------------

const SCORE_FLOOR = 55;
const MAX_STATEMENTS = 4;

const STATEMENT_BANK: Array<{ facet: string; text: string }> = [
  { facet: 'c5_self_discipline', text: 'Håller deadlines utan påminnelser' },
  { facet: 'c2_orderliness', text: 'Bygger struktur där den saknas' },
  { facet: 'c4_achievement_striving', text: 'Sätter höga mål och driver mot dem' },
  { facet: 'c1_self_efficacy', text: 'Tar sig an nya uppgifter med tillförsikt' },
  { facet: 'c3_dutifulness', text: 'Levererar det som utlovats, varje gång' },
  { facet: 'c6_cautiousness', text: 'Tänker igenom beslut innan de fattas' },
  { facet: 'e3_assertiveness', text: 'Tar naturligt plats i diskussioner' },
  { facet: 'e1_friendliness', text: 'Bygger snabbt förtroende med nya kontakter' },
  { facet: 'e2_gregariousness', text: 'Trivs och presterar i team' },
  { facet: 'e4_activity_level', text: 'Håller högt tempo utan att tappa kvalitet' },
  { facet: 'o1_imagination', text: 'Ser lösningar där andra ser hinder' },
  { facet: 'o4_adventurousness', text: 'Tar sig gärna an det oprövade' },
  { facet: 'o5_intellect', text: 'Gräver i komplexa problem tills de är lösta' },
  { facet: 'a1_trust', text: 'Delegerar och samarbetar prestigelöst' },
  { facet: 'a3_altruism', text: 'Ställer upp för kollegor utan att bli tillfrågad' },
  { facet: 'a4_cooperation', text: 'Löser konflikter i stället för att skapa dem' },
  { facet: 'a6_sympathy', text: 'Fångar upp hur teamet mår' },
  // composure är ett härlett mått: 100 - medel(n1_anxiety, n6_vulnerability).
  { facet: 'composure', text: 'Behåller lugnet när det stormar' },
];

/** De whitelistade måtten som saliens-motorn räknar profilmedel över. */
const WHITELIST: string[] = STATEMENT_BANK.map((s) => s.facet);

/** Läsbara styrkenamn för intervjuguidens "Utgår från kandidatens styrka". */
const FACET_LABELS: Record<string, string> = {
  c1_self_efficacy: 'Tilltro till egen förmåga',
  c2_orderliness: 'Struktur',
  c3_dutifulness: 'Pålitlighet',
  c4_achievement_striving: 'Målmedvetenhet',
  c5_self_discipline: 'Självdisciplin',
  c6_cautiousness: 'Eftertänksamhet',
  e1_friendliness: 'Relationsbyggande',
  e2_gregariousness: 'Lagorientering',
  e3_assertiveness: 'Att ta ledningen',
  e4_activity_level: 'Tempo',
  o1_imagination: 'Idérikedom',
  o4_adventurousness: 'Nyfikenhet på det oprövade',
  o5_intellect: 'Analytiskt djup',
  a1_trust: 'Prestigelöshet',
  a3_altruism: 'Hjälpsamhet',
  a4_cooperation: 'Samarbetsförmåga',
  a6_sympathy: 'Lyhördhet',
  composure: 'Lugn under press',
};

// ---------------------------------------------------------------------------
// Arketyper: de två starkaste av fem domäner (stabilitet = 100 - neuroticism)
// ger en namngiven arbetsstil. Ordningsoberoende par.
// ---------------------------------------------------------------------------

type DomainKey = 'O' | 'C' | 'E' | 'A' | 'S';

const ARCHETYPES: Record<string, { title: string; description: string }> = {
  'C+E': { title: 'Drivande genomförare', description: 'Kombinerar struktur med energi. Sätter planen och ser till att den händer.' },
  'C+O': { title: 'Strukturerad analytiker', description: 'Metodisk problemlösare som gärna tänker nytt, men aldrig slarvigt.' },
  'A+C': { title: 'Pålitlig lagspelare', description: 'Levererar noggrant och lyfter samtidigt människorna runt omkring.' },
  'C+S': { title: 'Stabil genomförare', description: 'Orubblig under press. Håller kursen när andra tappar fokus.' },
  'A+E': { title: 'Relationsbyggare', description: 'Skapar förtroende snabbt och får grupper att dra åt samma håll.' },
  'E+O': { title: 'Idédriven kommunikatör', description: 'Ser möjligheter och får med sig andra på resan.' },
  'A+O': { title: 'Lyhörd utforskare', description: 'Nyfiken på både idéer och människor. Hittar lösningar som fler kan stå bakom.' },
  'E+S': { title: 'Trygg drivkraft', description: 'Energisk utan att bli stressad. En stabiliserande motor i teamet.' },
  'O+S': { title: 'Lugn nytänkare', description: 'Prövar nya vägar med is i magen. Innovativ utan drama.' },
  'A+S': { title: 'Stöttande klippa', description: 'Den kollegan alla vänder sig till när det är tufft.' },
};

/** Alla arketyp-titlar, för sökfiltrets flerval (filtrerar på visad etikett, aldrig på råvärden). */
export const ARCHETYPE_TITLES: string[] = Object.values(ARCHETYPES).map((a) => a.title);

function archetypeFor(domains: DomainScores): { title: string; description: string } {
  const domainsScored: Array<{ key: DomainKey; value: number }> = [
    { key: 'O', value: domains.openness },
    { key: 'C', value: domains.conscientiousness },
    { key: 'E', value: domains.extraversion },
    { key: 'A', value: domains.agreeableness },
    { key: 'S', value: 100 - domains.neuroticism },
  ];
  const scored = [...domainsScored].sort((a, b) => b.value - a.value);

  const pairKey = [scored[0].key, scored[1].key].sort().join('+');
  // Fallback ska aldrig behövas (alla 10 par finns), men var defensiv.
  return ARCHETYPES[pairKey] ?? ARCHETYPES['C+S'];
}

// ---------------------------------------------------------------------------
// Kompakta intervjuguiden (fallback, låses upp först vid accepterad kontakt).
// Frågorna utgår från kandidatens starkaste facetter — aldrig från svagheter.
// ---------------------------------------------------------------------------

const INTERVIEW_BANK: Record<string, string> = {
  c5_self_discipline: 'Kandidaten skattar högt på självdisciplin. Be om ett exempel på ett långt projekt utan yttre press, vad höll motivationen uppe?',
  c2_orderliness: 'Struktur är en toppstyrka. Fråga hur kandidaten byggt upp ordning i en roll där den saknades från början.',
  c4_achievement_striving: 'Målmedvetenheten är hög. Utforska hur kandidaten hanterar mål som flyttas eller stryks halvvägs.',
  c1_self_efficacy: 'Stark tilltro till egen förmåga. Be om ett exempel där kandidaten tog sig an något helt nytt, och hur det gick.',
  c3_dutifulness: 'Plikttrogenhet i topp. Fråga hur kandidaten prioriterar när två åtaganden krockar.',
  c6_cautiousness: 'Eftertänksam beslutsfattare. Utforska ett beslut som behövde fattas snabbt, hur balanserades tempo mot analys?',
  e3_assertiveness: 'Tar gärna ledningen i samtal. Fråga om ett tillfälle där kandidaten medvetet klev tillbaka och lät någon annan driva.',
  e1_friendliness: 'Bygger relationer snabbt. Be om ett exempel där en tidig relation blev avgörande för ett resultat.',
  e2_gregariousness: 'Trivs i grupp. Utforska hur kandidaten arbetar under längre perioder av självständigt arbete.',
  e4_activity_level: 'Högt arbetstempo. Fråga hur kandidaten skyddar kvaliteten när mycket händer samtidigt.',
  o1_imagination: 'Idérik problemlösare. Be om den mest okonventionella lösning kandidaten genomfört i praktiken.',
  o4_adventurousness: 'Söker gärna det oprövade. Utforska hur kandidaten avgör när det beprövade faktiskt är rätt val.',
  o5_intellect: 'Djupdyker i komplexa problem. Fråga hur kandidaten förklarar något snårigt för en icke-expert.',
  a1_trust: 'Delegerar prestigelöst. Be om ett exempel där tilliten prövades, och vad kandidaten lärde sig.',
  a3_altruism: 'Ställer upp för andra. Utforska hur kandidaten balanserar att hjälpa kollegor mot egna deadlines.',
  a4_cooperation: 'Konfliktlösare. Be om ett konkret exempel på en låst situation kandidaten löste upp.',
  a6_sympathy: 'Läser av teamet. Fråga om ett tillfälle där kandidaten fångade upp något innan det blev ett problem.',
  composure: 'Stresstålig profil. Be om det mest pressade läget kandidaten hanterat, och vad som gjorde att lugnet höll.',
};

// =============================================================================
// SALIENS-MOTORN (v2): ipsativ härledning relativt kandidatens eget
// profilmedel. Verkliga värden klustrar 25-69, så absoluta golv missar
// profilens FORM.
//
//   m = medel över de whitelistade måtten
//   d = score - m
//   SALIENT_HIGH: d >= 7 och score >= 55   (driver påståenden och rubriker)
//   SECONDARY:    d >= 4 och score >= 52   (fyller sektioner)
//   BAND: < 40 → 1, 40-47 → 2, 48-54 → 3, 55-61 → 4, >= 62 → 5
//   (kalibrera om till percentilband p20/p40/p60/p80 när N >= 150)
// =============================================================================

const SALIENT_HIGH = { minDelta: 7, minScore: 55 };
const SECONDARY = { minDelta: 4, minScore: 52 };

export type SpectrumBand = 1 | 2 | 3 | 4 | 5;

function bandFor(score: number): SpectrumBand {
  if (score < 40) return 1;
  if (score <= 47) return 2;
  if (score <= 54) return 3;
  if (score <= 61) return 4;
  return 5;
}

interface Salience {
  /** Whitelistade mått som fanns i underlaget, inkl. härledd composure. */
  scores: Record<string, number>;
  mean: number;
  /** SALIENT_HIGH-facetter, sorterade på d fallande. */
  salient: string[];
  /** SECONDARY eller starkare (inkluderar salient), sorterade på d fallande. */
  secondary: string[];
  band(facet: string): SpectrumBand | null;
  isSalient(facet: string): boolean;
  isSecondary(facet: string): boolean;
}

function buildSalience(facets: Record<string, number>): Salience | null {
  const scores: Record<string, number> = {};
  const n1 = facets['n1_anxiety'];
  const n6 = facets['n6_vulnerability'];
  const withComposure: Record<string, number> = { ...facets };
  if (typeof n1 === 'number' && typeof n6 === 'number') {
    withComposure['composure'] = Math.round(100 - (n1 + n6) / 2);
  }
  for (const key of WHITELIST) {
    const v = withComposure[key];
    if (typeof v === 'number' && Number.isFinite(v)) scores[key] = v;
  }
  const keys = Object.keys(scores);
  if (keys.length === 0) return null;

  const mean = keys.reduce((sum, k) => sum + scores[k], 0) / keys.length;
  const withDelta = keys
    .map((k) => ({ facet: k, score: scores[k], d: scores[k] - mean }))
    .sort((a, b) => b.d - a.d);

  const salient = withDelta
    .filter((f) => f.d >= SALIENT_HIGH.minDelta && f.score >= SALIENT_HIGH.minScore)
    .map((f) => f.facet);
  const secondary = withDelta
    .filter((f) => f.d >= SECONDARY.minDelta && f.score >= SECONDARY.minScore)
    .map((f) => f.facet);

  return {
    scores,
    mean,
    salient,
    secondary,
    band: (facet) => (typeof scores[facet] === 'number' ? bandFor(scores[facet]) : null),
    isSalient: (facet) => salient.includes(facet),
    isSecondary: (facet) => secondary.includes(facet),
  };
}

/** Fullrapporten kräver minst 3 SALIENT_HIGH eller 5 SECONDARY. */
function qualifiesForReport(s: Salience): boolean {
  return s.salient.length >= 3 || s.secondary.length >= 5;
}

// ---------------------------------------------------------------------------
// Bipolära spektra: BÅDA polerna är likvärdigt positiva arbetsstilar, aldrig
// brist mot styrka. Endast band + etiketter lämnar motorn — aldrig råvärden.
// ---------------------------------------------------------------------------

export interface SpectrumView {
  /** Facettnyckel, t.ex. 'c2_orderliness'. */
  key: string;
  leftLabel: string;
  rightLabel: string;
  /** 1-5 där 3 = "Flexibel mellan lägena" (neutral, genererar ingen copy). */
  band: SpectrumBand;
}

const SPECTRA: Record<string, { left: string; right: string }> = {
  c2_orderliness: { left: 'Improviserar och anpassar', right: 'Planerar och strukturerar' },
  c6_cautiousness: { left: 'Snabb till beslut', right: 'Grundlig före beslut' },
  e4_activity_level: { left: 'Jämnt, uthålligt tempo', right: 'Högt tempo, många bollar' },
  e2_gregariousness: { left: 'Får energi av eget fokusarbete', right: 'Får energi av samarbete i grupp' },
  e3_assertiveness: { left: 'Påverkar genom lyssnande och underlag', right: 'Tar naturligt kommandot i rummet' },
};

function spectrumView(s: Salience, facet: string): SpectrumView | null {
  const band = s.band(facet);
  const def = SPECTRA[facet];
  if (band === null || !def) return null;
  return { key: facet, leftLabel: def.left, rightLabel: def.right, band };
}

/**
 * Prioordning när flera spektra avviker lika mycket. Tempo och energikälla är
 * mest beslutsrelevanta för en rekryterare (matchar roll och teamupplägg), så
 * de vinner vid oavgjort. Sist: kommunikationsstil, känsligast att reducera.
 */
const SPECTRUM_CARD_PRIORITY: string[] = [
  'e4_activity_level',
  'e2_gregariousness',
  'c2_orderliness',
  'c6_cautiousness',
  'e3_assertiveness',
];

// ---------------------------------------------------------------------------
// Copybanker. Alla villkor och texter som data. `own` är samma innehåll i
// du-form för kandidatens egen rapport — copyn får aldrig divergera i sak.
// Hög = band 4-5, låg = band 1-2, mitten = band 3.
// ---------------------------------------------------------------------------

type BandTest = (s: Salience) => boolean;

const high = (facet: string): BandTest => (s) => (s.band(facet) ?? 0) >= 4;
const lowOrMid = (facet: string): BandTest => (s) => {
  const b = s.band(facet);
  return b !== null && b <= 3;
};
const mid = (facet: string): BandTest => (s) => s.band(facet) === 3;
const sec = (facet: string): BandTest => (s) => s.isSecondary(facet);
const sal = (facet: string): BandTest => (s) => s.isSalient(facet);
const all = (...tests: BandTest[]): BandTest => (s) => tests.every((t) => t(s));
const not = (test: BandTest): BandTest => (s) => !test(s);

// Sektion A: sammanfattande mening ur bandkombination. Första träff vinner.
const WORK_SUMMARY_BANK: Array<{ when: BandTest; text: string; own: string }> = [
  {
    when: all(high('c2_orderliness'), high('c6_cautiousness')),
    text: 'En metodisk genomförare. Bygger plan innan arbetet startar och fattar beslut med underlag på bordet. Räkna med hög leveranssäkerhet snarare än snabba kast.',
    own: 'Du är en metodisk genomförare. Du bygger plan innan arbetet startar och fattar beslut med underlag på bordet. Din styrka är hög leveranssäkerhet snarare än snabba kast.',
  },
  {
    when: all(high('e4_activity_level'), lowOrMid('c6_cautiousness')),
    text: 'Arbetar med fart och korta beslutsvägar. Kommer snabbt till handling och justerar längs vägen.',
    own: 'Du arbetar med fart och korta beslutsvägar. Du kommer snabbt till handling och justerar längs vägen.',
  },
  {
    when: all(high('c5_self_discipline'), mid('c2_orderliness'), mid('c6_cautiousness'), mid('e4_activity_level')),
    text: 'Självgående i vardagen. Behöver sällan påminnelser eller uppföljning för att saker ska bli klara.',
    own: 'Du är självgående i vardagen. Du behöver sällan påminnelser eller uppföljning för att saker ska bli klara.',
  },
];

// Sektion B: punktpåståenden (unipolära, endast SALIENT/SECONDARY-facetter).
const COLLABORATION_BANK: Array<{ when: BandTest; text: string; own: string }> = [
  {
    when: all(sec('a4_cooperation'), sec('a1_trust')),
    text: 'Prestigelös i samarbetet. Söker lösningen som fler kan stå bakom och litar på att kollegor levererar sin del.',
    own: 'Du är prestigelös i samarbetet. Du söker lösningen som fler kan stå bakom och litar på att kollegor levererar sin del.',
  },
  {
    when: all(sec('a6_sympathy'), sec('e1_friendliness')),
    text: 'Läser av rummet snabbt och bygger förtroende tidigt. Ofta den som märker när något skaver i teamet innan det sägs högt.',
    own: 'Du läser av rummet snabbt och bygger förtroende tidigt. Du är ofta den som märker när något skaver i teamet innan det sägs högt.',
  },
  {
    when: sec('a3_altruism'),
    text: 'Ställer upp utan att bli tillfrågad. Kollegors framgång väger tungt i hens egen motivation.',
    own: 'Du ställer upp utan att bli tillfrågad. Kollegors framgång väger tungt i din egen motivation.',
  },
];

// Sektion C: sammanfattning. Första träff vinner.
const DRIVE_SUMMARY_BANK: Array<{ when: BandTest; text: string; own: string }> = [
  {
    when: all(sec('e3_assertiveness'), sec('c1_self_efficacy')),
    text: 'Kliver fram när riktning saknas. Trivs med mandat och blir begränsad av detaljstyrning.',
    own: 'Du kliver fram när riktning saknas. Du trivs med mandat och blir begränsad av detaljstyrning.',
  },
  {
    when: all(sec('c4_achievement_striving'), sec('c6_cautiousness')),
    text: 'Målmedveten på lång sikt. Motiveras mer av att nå svåra mål än av snabba vinster, och vill att målen är tydligt definierade.',
    own: 'Du är målmedveten på lång sikt. Du motiveras mer av att nå svåra mål än av snabba vinster, och du vill att målen är tydligt definierade.',
  },
  {
    when: all(sec('c1_self_efficacy'), not(high('e3_assertiveness'))),
    text: 'Stark tilltro till egen förmåga utan behov av rampljus. Leder gärna genom expertis snarare än position.',
    own: 'Du har stark tilltro till din egen förmåga utan behov av rampljus. Du leder gärna genom expertis snarare än position.',
  },
];

// Sektion C: "Motiveras av"-banken (facett → punkt). Samma text i båda vyerna.
const MOTIVATION_BANK: Array<{ facet: string; text: string }> = [
  { facet: 'c4_achievement_striving', text: 'Tydliga, mätbara mål' },
  { facet: 'o5_intellect', text: 'Komplexa problem att lösa på djupet' },
  { facet: 'a3_altruism', text: 'Att arbetet gör skillnad för andra' },
  { facet: 'e1_friendliness', text: 'Nära relationer med kunder och kollegor' },
  { facet: 'o4_adventurousness', text: 'Nya områden och oprövade uppgifter' },
  { facet: 'c2_orderliness', text: 'Ordning, kvalitet och rätt gjort från början' },
];

// Sektion D: "Kommer till sin rätt när". Y är ALLTID en miljöegenskap, aldrig
// en personegenskap — kandidaten har inga brister, miljöer har olika passform.
const THRIVES_BANK: Array<{
  when: BandTest;
  thrivesWhen: string;
  ownThrivesWhen?: string;
  challengedWhen: string | null;
}> = [
  {
    when: all(sal('c2_orderliness'), sal('c5_self_discipline')),
    thrivesWhen: 'processer är tydliga och kvalitet hinner göras rätt',
    challengedWhen: 'planer rivs upp dagligen utan förklaring',
  },
  {
    when: all(sal('o4_adventurousness'), sal('o1_imagination')),
    thrivesWhen: 'förutsättningar förändras och nya vägar behöver prövas',
    challengedWhen: 'arbetet är identiskt vecka efter vecka',
  },
  {
    when: sal('composure'),
    thrivesWhen: 'trycket är högt och andra behöver ett lugn att luta sig mot',
    challengedWhen: null, // composure saknar rimligt Y — visa bara Trivs-delen.
  },
  {
    when: all(sal('e2_gregariousness'), sal('e1_friendliness')),
    thrivesWhen: 'arbetet sker nära kollegor och kunder',
    challengedWhen: 'veckorna domineras av ensamarbete',
  },
  {
    when: (s) => {
      const b = s.band('e2_gregariousness');
      return b !== null && b <= 2 && s.isSalient('c5_self_discipline');
    },
    thrivesWhen: 'hen får sammanhängande fokustid och äger sin egen planering',
    ownThrivesWhen: 'du får sammanhängande fokustid och äger din egen planering',
    challengedWhen: 'dagen splittras av ständiga avbrott',
  },
  {
    when: all(sal('c4_achievement_striving'), sal('e4_activity_level')),
    thrivesWhen: 'målen är höga och tempot märks',
    challengedWhen: 'ambitionsnivån i omgivningen är låg',
  },
  {
    when: all(sal('o5_intellect'), sal('c6_cautiousness')),
    thrivesWhen: 'problemen är svåra och analysen får ta plats',
    challengedWhen: 'beslut fattas på magkänsla trots att underlag finns',
  },
];

// Sektion E: "Behöver för att prestera". Endast SALIENT_HIGH-facetter,
// speglade till miljöbehov — härleds ur styrkor, aldrig ur låga värden.
const NEEDS_BANK: Array<{ facets: string[]; text: string; own?: string }> = [
  {
    facets: ['c2_orderliness'],
    text: 'Tydliga ramar och en chef som inte ändrar prioriteringar från dag till dag',
  },
  {
    facets: ['c4_achievement_striving'],
    text: 'Mål med riktig höjd och återkoppling på framsteg',
  },
  {
    facets: ['e1_friendliness', 'e2_gregariousness'],
    text: 'Ett sammanhang med regelbunden mänsklig kontakt. Distansarbete fungerar men helt isolerat arbete kostar energi',
    own: 'Ett sammanhang med regelbunden mänsklig kontakt. Distansarbete fungerar men helt isolerat arbete kostar dig energi',
  },
  {
    facets: ['o4_adventurousness'],
    text: 'Variation i uppdragen över tid',
  },
  {
    facets: ['o5_intellect'],
    text: 'Utrymme att gå på djupet i stället för att bara släcka bränder',
  },
  {
    facets: ['a4_cooperation'],
    text: 'En kultur där konflikter tas i rummet, inte i korridoren',
  },
  {
    facets: ['composure'],
    text: 'Rimlig krisberedskap att axla: hen kommer att bli lugnet i stormen, se till att det inte utnyttjas till utbrändhet',
    own: 'Rimlig krisberedskap att axla: du blir ofta lugnet i stormen, bevaka att det inte glider över i utbrändhet',
  },
];

// Sektion F: "Onboarda så här" (låses upp vid accepterad kontakt).
// Topp-3 SALIENT-facetter → "Första 90 dagarna", 3 punkter.
const ONBOARDING_BANK: Record<string, string> = {
  c6_cautiousness: 'Ge tid att lära systemen innan hen förväntas fatta snabba beslut, det betalar sig i beslutskvalitet',
  e1_friendliness: 'Boka in intressent-introduktioner vecka ett, relationer är hens snabbaste väg till produktivitet',
  c2_orderliness: 'Ha dokumentation och processer redo, luddiga överlämningar kostar mer för denna profil än för andra',
  c1_self_efficacy: 'Ge ett eget avgränsat ansvar tidigt, väntan på mandat dödar momentum',
  o1_imagination: 'Bjud in till förbättringsdiskussioner direkt, be om hens utifrånblick innan den hinner slipas bort',
};

// Sektion G: fördjupad intervjuguide. Styrkefrågor i STAR-format med
// lyssna-efter-punkter, per whitelistad facett.
const STAR_INTERVIEW_BANK: Record<string, { question: string; listenFor: string[] }> = {
  c4_achievement_striving: {
    question: 'Berätta om ett mål du satte som andra tyckte var för högt. Vad var situationen, vad gjorde du konkret, och hur slutade det?',
    listenFor: [
      'Skiljer på eget driv och yttre press (S och T i STAR)',
      'Konkreta egna handlingar, inte "vi"-flykt (A)',
      'Nämner självmant vad hen skulle gjort annorlunda (R + lärande)',
    ],
  },
  c5_self_discipline: {
    question: 'Berätta om ett långt projekt utan yttre press eller deadlines. Vad var uppgiften, hur höll du arbetet igång och vad blev resultatet?',
    listenFor: [
      'Egen struktur och rutiner snarare än sista minuten-ryck (A)',
      'Konkret om vad som höll motivationen uppe över tid',
      'Leverans som ingen behövde jaga fram (R)',
    ],
  },
  c2_orderliness: {
    question: 'Beskriv en roll eller ett läge där struktur saknades när du kom in. Vad gjorde du konkret och vad blev skillnaden?',
    listenFor: [
      'Byggde system som fungerar även utan hen (A)',
      'Prioriterade vad som skulle struktureras först, inte allt på en gång',
      'Kan visa konkret skillnad före och efter (R)',
    ],
  },
  c1_self_efficacy: {
    question: 'Berätta om en gång du tog dig an något du aldrig gjort förut. Vad var uppgiften, hur angrep du den och hur gick det?',
    listenFor: [
      'Realistisk självbild, inte bara självförtroende (T)',
      'Konkret inlärningsstrategi, inte bara "jag körde på" (A)',
      'Ärlig om vad som inte fungerade (R + lärande)',
    ],
  },
  c3_dutifulness: {
    question: 'Ge ett exempel på när två åtaganden krockade. Vad stod på spel, hur prioriterade du och vad blev utfallet?',
    listenFor: [
      'Tydlig prioriteringslogik, inte bara "jobbade mer" (A)',
      'Kommunicerade tidigt med den som fick vänta',
      'Tar ansvar för konsekvensen av valet (R)',
    ],
  },
  c6_cautiousness: {
    question: 'Berätta om ett beslut som behövde fattas snabbare än du ville. Vad var läget, hur balanserade du tempo mot analys och hur föll det ut?',
    listenFor: [
      'Vet vilken analys som kan kortas och vilken som aldrig får hoppas över',
      'Fattade faktiskt beslutet i tid (A)',
      'Följde upp beslutet i efterhand (R + lärande)',
    ],
  },
  e3_assertiveness: {
    question: 'Beskriv ett tillfälle där du medvetet klev tillbaka och lät någon annan driva. Vad var situationen och varför valde du det?',
    listenFor: [
      'Ett medvetet val, inte tillbakadragenhet (T)',
      'Läser när eget ledarskap hjälper respektive står i vägen',
      'Resultatet för gruppen, inte bara för hen själv (R)',
    ],
  },
  e1_friendliness: {
    question: 'Berätta om en arbetsrelation du byggde tidigt som senare blev avgörande för ett resultat. Hur gick det till?',
    listenFor: [
      'Bygger relationer med avsikt, inte bara trevlighet (A)',
      'Konkret koppling mellan relationen och resultatet (R)',
      'Underhåller relationer över tid, inte bara vid behov',
    ],
  },
  e2_gregariousness: {
    question: 'Beskriv en längre period av självständigt arbete. Hur lade du upp den, vad gjorde du för att hålla energin och hur gick leveransen?',
    listenFor: [
      'Självkännedom om var energin kommer ifrån (T)',
      'Konkreta strategier, inte bara "det gick bra" (A)',
      'Höll leveransen även utan gruppens energi (R)',
    ],
  },
  e4_activity_level: {
    question: 'Berätta om en period när väldigt mycket hände samtidigt. Vad var läget, hur skyddade du kvaliteten och vad blev resultatet?',
    listenFor: [
      'Aktiv prioritering, inte bara högre växel (A)',
      'Vet var kvalitetsriskerna satt',
      'Ärlig om vad som medvetet fick stryka på foten (R)',
    ],
  },
  o1_imagination: {
    question: 'Berätta om den mest okonventionella lösning du genomfört i praktiken. Vad var problemet, hur föddes idén och hur fick du med dig andra?',
    listenFor: [
      'Förstod varför det konventionella inte räckte (S och T)',
      'Lösningen genomfördes på riktigt, stannade inte vid idé (A)',
      'Fick med sig andra utan att köra över dem (R)',
    ],
  },
  o4_adventurousness: {
    question: 'Ge ett exempel där du valde det beprövade fast det oprövade lockade. Hur resonerade du och vad blev utfallet?',
    listenFor: [
      'Nyfikenheten har ett omdöme, inte bara aptit (T)',
      'Konkret riskavvägning i resonemanget (A)',
      'Står för valet även i efterhand (R)',
    ],
  },
  o5_intellect: {
    question: 'Berätta om något riktigt snårigt du behövde förklara för en icke-expert. Vad stod på spel, hur gjorde du och landade budskapet?',
    listenFor: [
      'Anpassar djupet efter mottagaren utan att förenkla fel saker (A)',
      'Kontrollerade att budskapet faktiskt landade',
      'Resultatet av att förklaringen fungerade (R)',
    ],
  },
  a1_trust: {
    question: 'Berätta om en gång din tillit till en kollega prövades. Vad hände, vad gjorde du och vad lärde du dig?',
    listenFor: [
      'Nyanserad bild, varken naiv eller cynisk (T)',
      'Agerade på situationen i stället för att dra sig undan (A)',
      'Delegerar fortfarande efter erfarenheten (R + lärande)',
    ],
  },
  a3_altruism: {
    question: 'Ge ett exempel på när du hjälpte en kollega samtidigt som dina egna deadlines pressade. Hur löste du det?',
    listenFor: [
      'Hjälpen var konkret och efterfrågad (A)',
      'De egna åtagandena höll ändå (R)',
      'Kan sätta gränser när det verkligen inte går',
    ],
  },
  a4_cooperation: {
    question: 'Berätta om en låst konflikt du löste upp. Vad var situationen, vad gjorde du konkret och hur slutade det?',
    listenFor: [
      'Sökte intresset bakom positionerna (A)',
      'Beskriver sin egen roll, inte bara en medlarroll i ord',
      'Relationen efteråt, inte bara sakfrågan (R)',
    ],
  },
  a6_sympathy: {
    question: 'Beskriv ett tillfälle där du fångade upp att något skavde i teamet innan det sades högt. Vad gjorde du med det?',
    listenFor: [
      'Avläsningen ledde till konkret handling (A)',
      'Respekterade integriteten hos den det gällde',
      'Effekten för teamet (R)',
    ],
  },
  composure: {
    question: 'Berätta om det mest pressade läget du hanterat i arbetet. Vad hände, vad gjorde du och hur föll det ut?',
    listenFor: [
      'Lugnet bestod av något konkret: prioritering, kommunikation, struktur (A)',
      'Skiljer på att verka lugn och att skapa lugn för andra',
      'Vad hen gjorde efteråt för att hämta kraft (R + lärande)',
    ],
  },
};

// Kombinationsfrågor: triggas av facettpar där BÅDA är SALIENT_HIGH.
const COMBINATION_INTERVIEW_BANK: Array<{
  facets: [string, string];
  question: string;
  listenFor: string[];
}> = [
  {
    facets: ['c4_achievement_striving', 'a4_cooperation'],
    question: 'Du verkar både tävlingsinriktad och mån om samförstånd. Berätta om en gång de två krockade.',
    listenFor: [
      'Erkänner spänningen i stället för att förneka den',
      'Konkret avvägning mellan målet och relationen',
      'Resultat för relationen, inte bara sakfrågan',
    ],
  },
  {
    facets: ['o4_adventurousness', 'c6_cautiousness'],
    question: 'Beskriv ett läge där du valde det oprövade trots att det säkra fanns. Hur resonerade du?',
    listenFor: [
      'Strukturerad riskbedömning, inte impulsivitet',
      'Hade en plan B om det oprövade inte höll',
    ],
  },
  {
    facets: ['e3_assertiveness', 'a6_sympathy'],
    question: 'Ge ett exempel där du drev igenom något och märkte att någon i rummet inte var med. Vad gjorde du?',
    listenFor: [
      'Avläsningen ledde till handling',
      'Skiljer på att vinna beslutet och att vinna genomförandet',
    ],
  },
  {
    facets: ['composure', 'e4_activity_level'],
    question: 'Vilket är det mest pressade leverans-läget du hanterat? Ta oss igenom det steg för steg.',
    listenFor: [
      'Vad lugnet konkret bestod i: prioritering, kommunikation',
      'Vad hen offrade medvetet, och varför',
    ],
  },
];

// Kandidatens privata energibudget: byggs på spektra-banden. Delas ALDRIG med
// rekryterare. Låga band FÅR generera copy här — sektionen är privat.
const ENERGY_BUDGET_BANK: Array<{ when: BandTest; text: string }> = [
  {
    when: (s) => {
      const b = s.band('e2_gregariousness');
      return b !== null && b <= 2;
    },
    text: 'Du laddar batterierna i fokusarbete. Blockera tid för det, annars gör kalendern det åt dig.',
  },
  {
    when: high('e2_gregariousness'),
    text: 'Du laddar batterierna tillsammans med andra. Långa perioder av ensamarbete tar mer energi än de ger, så planera in samarbete varje vecka.',
  },
  {
    when: high('e4_activity_level'),
    text: 'Ditt tempo är en tillgång, men det behöver hämtas hem. Planera in återhämtning efter intensiva perioder i stället för att hoppas att den uppstår av sig själv.',
  },
  {
    when: (s) => {
      const b = s.band('e4_activity_level');
      return b !== null && b <= 2;
    },
    text: 'Du presterar bäst i jämnt tempo. Skydda det genom att säga nej till onödiga toppar, sprintkultur kostar dig mer än den ger.',
  },
  {
    when: high('c6_cautiousness'),
    text: 'Du fattar bäst beslut med underlag. Be om betänketid i stället för att pressas till svar i rummet, det höjer kvaliteten på det du säger ja till.',
  },
  {
    when: high('c2_orderliness'),
    text: 'Oordning kostar dig energi. Ta tio minuter att strukturera innan du börjar, det betalar sig samma dag.',
  },
  {
    when: high('composure'),
    text: 'Ditt lugn gör att andra gärna lämnar sina kriser hos dig. Det är en styrka, men håll koll på vad den kostar och ta ut det i återhämtning.',
  },
];

// Kontextbanken ("Söker mig till"): kandidaten väljer själv upp till 2 taggar
// ur sina kvalificerade förslag. Visas som kandidatens EGEN självpresentation,
// sökbar som pitch — ALDRIG rekryterarfilter på testdata.
// Kvalificering: ALLA listade mått SECONDARY+ och minst ett SALIENT.
const CONTEXT_TAG_BANK: Array<{ tag: string; facets: string[] }> = [
  { tag: 'Noggrannhet och självständigt ansvar', facets: ['c2_orderliness', 'c5_self_discipline', 'c3_dutifulness'] },
  { tag: 'Kundnära och relationsbärande arbete', facets: ['e1_friendliness', 'a6_sympathy', 'e2_gregariousness'] },
  { tag: 'Förändringsintensiva miljöer', facets: ['o4_adventurousness', 'o1_imagination', 'composure'] },
  { tag: 'Tydliga mål och högt tempo', facets: ['c4_achievement_striving', 'e4_activity_level', 'c1_self_efficacy'] },
  { tag: 'Analytiskt djuparbete', facets: ['o5_intellect', 'c6_cautiousness', 'c5_self_discipline'] },
  { tag: 'Stödjande och samordnande funktioner', facets: ['a3_altruism', 'a4_cooperation', 'a6_sympathy'] },
  { tag: 'Lugn i kritiska lägen', facets: ['composure', 'c6_cautiousness', 'c3_dutifulness'] },
];

// ---------------------------------------------------------------------------
// Publika konstanter (copy som UI:t ska visa ordagrant)
// ---------------------------------------------------------------------------

/** Rapporthuvudets disclaimer, skriven som styrkedeklaration. */
export const WORKSTYLE_DISCLAIMER =
  'Den här profilen bygger på kandidatens egen skattning i ett fördjupat personlighetstest (120 frågor, femfaktormodellen). Den beskriver arbetssätt och trivsel, inte kompetens eller förväntad prestation. Använd den för att ställa bättre frågor, inte för att sortera. Kandidaten ser exakt samma rapport som du.';

/** Obligatorisk mikrocopy när kontexttaggar visas för rekryterare. */
export const CONTEXT_TAG_MICROCOPY =
  'Beskriver trivsel och arbetssätt utifrån självskattning, inte lämplighet eller förväntad prestation.';

// ---------------------------------------------------------------------------
// Rapporttyper (inga råvärden — endast band, etiketter och färdig copy)
// ---------------------------------------------------------------------------

export interface InterviewQuestion {
  question: string;
  listenFor: string[];
  /** Härledningsetikett, t.ex. "Utgår från kandidatens styrka: Målmedvetenhet". */
  basedOn: string;
}

export interface ThrivesCard {
  thrivesWhen: string;
  /** null = visa bara Trivs-delen (t.ex. composure som saknar rimligt Y). */
  challengedWhen: string | null;
}

export interface WorkStyleReport {
  archetype: { title: string; description: string };
  /** Visas alltid i rapporthuvudet, ordagrant. */
  disclaimer: string;
  /** A. Så arbetar hen. */
  work: { spectra: SpectrumView[]; summary: string | null };
  /** B. Så samarbetar hen. */
  collaboration: { spectrum: SpectrumView | null; statements: string[] };
  /** C. Så leds och drivs hen. */
  drive: { spectrum: SpectrumView | null; summary: string | null; motivatedBy: string[] };
  /** D. Kommer till sin rätt när (max 3 kort). */
  thrives: ThrivesCard[];
  /** E. Behöver för att prestera (max 3 punkter). */
  needs: string[];
  /**
   * F. Onboarda så här ("Första 90 dagarna", 3 punkter).
   * null = låst (kontakt ej upplåst) — UI visar låst rad.
   */
  onboarding: string[] | null;
  /**
   * G. Fördjupad intervjuguide (5-7 STAR-frågor).
   * null = låst (kontakt ej upplåst) — UI visar låst rad.
   */
  interviewGuide: InterviewQuestion[] | null;
}

/** Kandidatens egen rapport i du-form. Delas ALDRIG med rekryterare. */
export interface CandidateOwnReport {
  archetype: { title: string; description: string };
  work: { spectra: SpectrumView[]; summary: string | null };
  collaboration: { spectrum: SpectrumView | null; statements: string[] };
  drive: { spectrum: SpectrumView | null; summary: string | null; motivatedBy: string[] };
  thrives: ThrivesCard[];
  needs: string[];
  /** Privat sektion: 2-3 punkter ur spektra-banden. Delas aldrig. */
  energyBudget: string[];
  /** Samma frågor rekryteraren får, så kandidaten kan öva med STAR-mall. */
  interviewPrep: InterviewQuestion[];
}

// ---------------------------------------------------------------------------
// Sektionsbyggare (delade mellan rekryterarens och kandidatens rapport)
// ---------------------------------------------------------------------------

function buildWorkSection(s: Salience, ownForm: boolean) {
  const spectra = (['c2_orderliness', 'c6_cautiousness', 'e4_activity_level'] as const)
    .map((f) => spectrumView(s, f))
    .filter((v): v is SpectrumView => v !== null);
  const hit = WORK_SUMMARY_BANK.find((v) => v.when(s));
  return { spectra, summary: hit ? (ownForm ? hit.own : hit.text) : null };
}

function buildCollaborationSection(s: Salience, ownForm: boolean) {
  const statements = COLLABORATION_BANK.filter((v) => v.when(s))
    .slice(0, 3)
    .map((v) => (ownForm ? v.own : v.text));
  return { spectrum: spectrumView(s, 'e2_gregariousness'), statements };
}

function buildDriveSection(s: Salience, ownForm: boolean) {
  const hit = DRIVE_SUMMARY_BANK.find((v) => v.when(s));
  const motivatedBy = MOTIVATION_BANK
    .filter((v) => s.isSecondary(v.facet))
    .sort((a, b) => (s.scores[b.facet] ?? 0) - (s.scores[a.facet] ?? 0))
    .slice(0, 3)
    .map((v) => v.text);
  return {
    spectrum: spectrumView(s, 'e3_assertiveness'),
    summary: hit ? (ownForm ? hit.own : hit.text) : null,
    motivatedBy,
  };
}

function buildThrivesSection(s: Salience, ownForm: boolean): ThrivesCard[] {
  return THRIVES_BANK.filter((v) => v.when(s))
    .slice(0, 3)
    .map((v) => ({
      thrivesWhen: ownForm && v.ownThrivesWhen ? v.ownThrivesWhen : v.thrivesWhen,
      challengedWhen: v.challengedWhen,
    }));
}

function buildNeedsSection(s: Salience, ownForm: boolean): string[] {
  return NEEDS_BANK
    .filter((v) => v.facets.some((f) => s.isSalient(f)))
    .sort((a, b) => {
      const dOf = (facets: string[]) =>
        Math.max(...facets.map((f) => (s.scores[f] ?? 0) - s.mean));
      return dOf(b.facets) - dOf(a.facets);
    })
    .slice(0, 3)
    .map((v) => (ownForm && v.own ? v.own : v.text));
}

function buildOnboardingSection(s: Salience): string[] {
  return s.salient
    .filter((f) => ONBOARDING_BANK[f])
    .slice(0, 3)
    .map((f) => ONBOARDING_BANK[f]);
}

function buildInterviewGuideV2(s: Salience): InterviewQuestion[] {
  // Kombinationsfrågor först (max 2): båda facetterna SALIENT_HIGH.
  const combos = COMBINATION_INTERVIEW_BANK
    .filter((c) => c.facets.every((f) => s.isSalient(f)))
    .slice(0, 2)
    .map((c) => ({
      question: c.question,
      listenFor: c.listenFor,
      basedOn: `Utgår från kandidatens styrkor: ${FACET_LABELS[c.facets[0]]} och ${FACET_LABELS[c.facets[1]]}`,
    }));
  const comboFacets = new Set(
    COMBINATION_INTERVIEW_BANK
      .filter((c) => c.facets.every((f) => s.isSalient(f)))
      .slice(0, 2)
      .flatMap((c) => c.facets)
  );

  // Styrkefrågor (4-5 st): SALIENT_HIGH först, fyll på med SECONDARY vid
  // behov. Facetter som redan täcks av en kombinationsfråga hoppas över.
  const maxStrength = 5;
  const pool = [...s.salient, ...s.secondary.filter((f) => !s.salient.includes(f))];
  const strengthQuestions: InterviewQuestion[] = [];
  for (const facet of pool) {
    if (strengthQuestions.length >= maxStrength) break;
    if (comboFacets.has(facet)) continue;
    const entry = STAR_INTERVIEW_BANK[facet];
    if (!entry) continue;
    strengthQuestions.push({
      question: entry.question,
      listenFor: entry.listenFor,
      basedOn: `Utgår från kandidatens styrka: ${FACET_LABELS[facet] ?? facet}`,
    });
  }

  // 5-7 frågor totalt: styrkefrågorna först, kombinationsfrågorna sist.
  return [...strengthQuestions, ...combos].slice(0, 7);
}

// ---------------------------------------------------------------------------
// Publika API:t (v2)
// ---------------------------------------------------------------------------

/**
 * Fullständig arbetsstilsrapport (rekryterarform). Returnerar null när
 * profilen inte kvalificerar (< 3 SALIENT_HIGH och < 5 SECONDARY) — då
 * används den kompakta panelen (deriveWorkStyle) som fallback.
 *
 * Sektionerna onboarding och interviewGuide fylls alltid i här; anroparen
 * ansvarar för att nolla dem när kontakten inte är upplåst.
 */
export function deriveWorkStyleReport(
  domains: DomainScores,
  facets: Record<string, number> | null
): WorkStyleReport | null {
  if (!facets || Object.keys(facets).length === 0) return null;
  const s = buildSalience(facets);
  if (!s || !qualifiesForReport(s)) return null;

  return {
    archetype: archetypeFor(domains),
    disclaimer: WORKSTYLE_DISCLAIMER,
    work: buildWorkSection(s, false),
    collaboration: buildCollaborationSection(s, false),
    drive: buildDriveSection(s, false),
    thrives: buildThrivesSection(s, false),
    needs: buildNeedsSection(s, false),
    onboarding: buildOnboardingSection(s),
    interviewGuide: buildInterviewGuideV2(s),
  };
}

/**
 * Kortets arbetsstil: exakt två spektra (mest avvikande från neutralt läge) och
 * den starkaste "trivs när"-frasen. Kräver facetter (avancerat test). Neutralt
 * band (3) väljs bara i sista hand om färre än två spektra avviker, så kortet
 * alltid har två linjer att rita. Returnerar null utan facetter.
 */
export function deriveCardWorkStyle(
  domains: DomainScores,
  facets: Record<string, number> | null
): CardWorkStyle | null {
  if (!facets || Object.keys(facets).length === 0) return null;
  const s = buildSalience(facets);
  if (!s) return null;

  // Alla fem spektra med sitt band, avvikelse = avstånd från neutralt band 3.
  const ranked = Object.keys(SPECTRA)
    .map((facet) => spectrumView(s, facet))
    .filter((v): v is SpectrumView => v !== null)
    .map((v) => ({
      view: v,
      deviation: Math.abs(v.band - 3),
      priority: SPECTRUM_CARD_PRIORITY.indexOf(v.key),
    }))
    .sort((a, b) => {
      // Avvikande före neutralt, sedan störst avvikelse, sedan prioordning.
      if (b.deviation !== a.deviation) return b.deviation - a.deviation;
      return a.priority - b.priority;
    });

  // Alltid två linjer på kortet (fyll med minst neutrala om det behövs).
  const spectra = ranked.slice(0, 2).map((r) => r.view);
  if (spectra.length < 2) return null;

  // Starkaste miljöpassningen: första THRIVES-träffen (banken är redan
  // ordnad efter relevans, samma härledning som fullrapporten).
  const thrives = THRIVES_BANK.find((v) => v.when(s));

  return {
    archetype: archetypeFor(domains),
    spectra,
    thrivesWhen: thrives ? thrives.thrivesWhen : null,
  };
}

/**
 * Kandidatens egen rapport i du-form: samma motor och samma härledning som
 * rekryterarens rapport, plus den privata energibudgeten och intervjufrågorna
 * att öva på. Delas ALDRIG med rekryterare.
 */
export function deriveCandidateOwnReport(
  domains: DomainScores,
  facets: Record<string, number> | null
): CandidateOwnReport | null {
  if (!facets || Object.keys(facets).length === 0) return null;
  const s = buildSalience(facets);
  if (!s || !qualifiesForReport(s)) return null;

  const energyBudget = ENERGY_BUDGET_BANK.filter((v) => v.when(s))
    .slice(0, 3)
    .map((v) => v.text);

  return {
    archetype: archetypeFor(domains),
    work: buildWorkSection(s, true),
    collaboration: buildCollaborationSection(s, true),
    drive: buildDriveSection(s, true),
    thrives: buildThrivesSection(s, true),
    needs: buildNeedsSection(s, true),
    energyBudget,
    interviewPrep: buildInterviewGuideV2(s),
  };
}

/**
 * Kontexttaggar kandidaten är kvalificerad att välja bland ("Söker mig till").
 * Kvalificering per tagg: ALLA listade mått SECONDARY+ och minst ett SALIENT.
 */
export function deriveContextTagOptions(facets: Record<string, number> | null): string[] {
  if (!facets || Object.keys(facets).length === 0) return [];
  const s = buildSalience(facets);
  if (!s) return [];
  return CONTEXT_TAG_BANK
    .filter(
      (entry) =>
        entry.facets.every((f) => s.isSecondary(f)) &&
        entry.facets.some((f) => s.isSalient(f))
    )
    .map((entry) => entry.tag);
}

// ---------------------------------------------------------------------------
// Publika API:t (v1, fallback — oförändrat beteende för tunna profiler)
// ---------------------------------------------------------------------------

function rankedFacets(facets: Record<string, number>): Array<{ facet: string; score: number }> {
  const values: Record<string, number> = { ...facets };
  const n1 = facets['n1_anxiety'];
  const n6 = facets['n6_vulnerability'];
  if (typeof n1 === 'number' && typeof n6 === 'number') {
    values['composure'] = Math.round(100 - (n1 + n6) / 2);
  }
  return STATEMENT_BANK
    .map(({ facet }) => ({ facet, score: values[facet] }))
    .filter((f): f is { facet: string; score: number } => typeof f.score === 'number')
    .sort((a, b) => b.score - a.score);
}

/**
 * Härleder arbetsstilsprofilen (kompakta panelen). Returnerar null när
 * facetter saknas (= grundtestet), då visas bara topp 2-styrkorna som tidigare.
 */
export function deriveWorkStyle(
  domains: DomainScores,
  facets: Record<string, number> | null
): WorkStyle | null {
  if (!facets || Object.keys(facets).length === 0) return null;

  const ranked = rankedFacets(facets);
  const statements = ranked
    .filter((f) => f.score >= SCORE_FLOOR)
    .slice(0, MAX_STATEMENTS)
    .map((f) => STATEMENT_BANK.find((s) => s.facet === f.facet)!.text);

  // Minst två påståenden krävs för att panelen ska vara meningsfull;
  // annars fyll på med de två starkaste oavsett golv (dock ≥ 50 = över mitten).
  if (statements.length < 2) {
    const fallback = ranked
      .filter((f) => f.score >= 50)
      .slice(0, 2)
      .map((f) => STATEMENT_BANK.find((s) => s.facet === f.facet)!.text);
    if (fallback.length < 2) return null;
    return { archetype: archetypeFor(domains), statements: fallback };
  }

  return { archetype: archetypeFor(domains), statements };
}

/**
 * Kompakta intervjuguiden: 3 frågor utifrån de starkaste facetterna. Ska
 * endast exponeras när kontakten är upplåst (accepterat intresse). Används
 * som fallback när fullrapporten inte kvalificerar.
 */
export function deriveInterviewGuide(
  facets: Record<string, number> | null
): string[] {
  if (!facets) return [];
  return rankedFacets(facets)
    .filter((f) => f.score >= 50 && INTERVIEW_BANK[f.facet])
    .slice(0, 3)
    .map((f) => INTERVIEW_BANK[f.facet]);
}
