// src/lib/recruiter/workStyle.ts
// =============================================================================
// Arbetsstilsprofil: regelbaserad härledning ur det avancerade
// personlighetstestets 30 IPIP-NEO-facetter (0-100). Deterministisk och
// förklarbar — kandidatens förhandsvisning är alltid identisk med det
// rekryteraren ser.
//
// SKYDDSRÄCKEN (ändra aldrig utan nytt beslut):
// 1. Endast arbetsrelevanta facetter i WHITELIST används. Känsliga facetter
//    (n3_depression, a2_morality, o6_liberalism, n5_immoderation,
//    n4_self_consciousness, o3_emotionality, a5_modesty, n2_anger,
//    e5_excitement_seeking, e6_cheerfulness, o2_artistic_interests) rörs
//    ALDRIG — härledning ur depression, moral eller åsikter i
//    rekryteringssammanhang är etiskt och juridiskt otänkbar.
// 2. Endast positiv/neutral inramning: påståenden beskriver styrkor, aldrig
//    brister. Lågt facettvärde ger inget påstående alls.
// 3. Visning, aldrig filtrering: rekryterare kan läsa arbetsstilen men det
//    finns medvetet inget sökfilter på den.
// =============================================================================

export interface WorkStyle {
  archetype: { title: string; description: string };
  /** 3-4 beteendepåståenden i arbetskontext, härledda ur toppfacetterna. */
  statements: string[];
}

export interface DomainScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// ---------------------------------------------------------------------------
// Påståendebanken: whitelistade facetter → arbetsplatsspråk.
// Ett påstående kvalificerar när facetten är bland kandidatens starkaste OCH
// över SCORE_FLOOR (annars säger "starkast" inget).
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
// Intervjuguiden: låses upp först vid accepterad kontakt. Frågorna utgår från
// kandidatens starkaste facetter (utforska styrkan) — aldrig från svagheter.
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

// ---------------------------------------------------------------------------
// Publika API:t
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
 * Härleder arbetsstilsprofilen. Returnerar null när facetter saknas
 * (= grundtestet), då visas bara topp 2-styrkorna som tidigare.
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
 * Intervjuguiden: 3 frågor utifrån de starkaste facetterna. Ska endast
 * exponeras när kontakten är upplåst (accepterat intresse).
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
