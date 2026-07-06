// Statisk exempeldata för produktturen på /for-rekryterare. Allt är fiktivt
// och hårdkodat: sidan gör inga API-anrop och förblir statisk (SSG). Utseendet
// på de scener som byggs av datan speglar portalens riktiga komponenter, men
// importerar dem aldrig (public-delen får inte dra in klientdata).

export interface TourRow {
  initial: string;
  role: string;
  seniority: string;
  region: string;
  /** Percentilprickar: null = ej testad, annars percentil 1-99 i familjeordning. */
  dots: [number | null, number | null, number | null];
  archetype: string;
  skills: string[];
  matchReason: string;
}

/**
 * Tre dataset för scen 1: byter sökfras byter vilken rad som ligger överst och
 * hur matchförklaringen formuleras. Ingen riktig sökmotor, bara förberäknade
 * resultat så mekaniken känns äkta utan att sidan behöver data.
 */
export interface TourSearch {
  query: string;
  label: string;
  rows: TourRow[];
}

const ANNA: TourRow = {
  initial: 'R',
  role: 'Redovisningsekonom',
  seniority: '8 år · Senast: Redovisningsansvarig',
  region: 'Stockholm',
  dots: [92, null, 85],
  archetype: 'Strukturerad analytiker',
  skills: ['Koncernredovisning', 'Bokslut', 'Fortnox'],
  matchReason: 'Matchar "koncernredovisning" i kompetenser · Topp 10 % i Matrislogik · 8 års erfarenhet',
};

const ERIK: TourRow = {
  initial: 'F',
  role: 'Frontendutvecklare',
  seniority: '6 år · Senast: Frontendutvecklare',
  region: 'Göteborg',
  dots: [95, 80, null],
  archetype: 'Nyfiken utforskare',
  skills: ['React', 'TypeScript', 'Tillgänglighet'],
  matchReason: 'Matchar "react" i kompetenser · Topp 5 % i Matrislogik · 6 års erfarenhet',
};

const SARA: TourRow = {
  initial: 'K',
  role: 'Kundtjänstchef',
  seniority: '11 år · Senast: Kundtjänstchef',
  region: 'Malmö',
  dots: [null, 90, 75],
  archetype: 'Stöttande klippa',
  skills: ['Teamledning', 'Zendesk', 'NPS-arbete'],
  matchReason: 'Matchar "kundtjänstchef" i roll · Topp 10 % i Verbalt · 11 års erfarenhet',
};

// En variant av matchförklaringen per sökning så den känns levande.
export const TOUR_SEARCHES: TourSearch[] = [
  {
    query: 'redovisningsekonom koncernredovisning',
    label: 'redovisningsekonom koncernredovisning',
    rows: [ANNA, SARA, ERIK],
  },
  {
    query: 'frontendutvecklare react',
    label: 'frontendutvecklare react',
    rows: [ERIK, ANNA, SARA],
  },
  {
    query: 'kundtjänstchef',
    label: 'kundtjänstchef',
    rows: [SARA, ERIK, ANNA],
  },
];

/** Spektrumrad för arbetsstilsmocken: band 1-5 styr punktens position. */
export interface TourSpectrum {
  left: string;
  right: string;
  band: 1 | 2 | 3 | 4 | 5;
}

export const TOUR_SPECTRA: TourSpectrum[] = [
  { left: 'Improviserar och anpassar', right: 'Planerar och strukturerar', band: 5 },
  { left: 'Snabb till beslut', right: 'Grundlig före beslut', band: 4 },
];

export const TOUR_THRIVES = {
  thrivesWhen: 'processer är tydliga och kvalitet hinner göras rätt',
  challengedWhen: 'planer rivs upp dagligen utan förklaring',
};

/** Rapporthuvudets disclaimer, ordagrant ur src/lib/recruiter/workStyle.ts. */
export const TOUR_DISCLAIMER =
  'Den här profilen bygger på kandidatens egen skattning i ett fördjupat personlighetstest (120 frågor, femfaktormodellen). Den beskriver arbetssätt och trivsel, inte kompetens eller förväntad prestation. Använd den för att ställa bättre frågor, inte för att sortera. Kandidaten ser exakt samma rapport som du.';

export const TOUR_INTERVIEW = {
  basedOn: 'Utgår från kandidatens styrka: Målmedvetenhet',
  question:
    'Berätta om ett mål du satte som andra tyckte var för högt. Vad var situationen, vad gjorde du konkret, och hur slutade det?',
  listenFor: [
    'Skiljer på eget driv och yttre press',
    'Konkreta egna handlingar, inte "vi"-flykt',
    'Nämner självmant vad hen skulle gjort annorlunda',
  ],
  onboarding:
    'Ge ett eget avgränsat ansvar tidigt, väntan på mandat dödar momentum.',
};

/** Stegdefinitioner: titel + en menings beskrivning under fönstret. */
export const TOUR_STEPS: Array<{ title: string; blurb: string }> = [
  {
    title: 'Sök på kravprofilen',
    blurb: 'Varje ord måste träffa. Titelmatch väger tyngre än kompetens, och du ser alltid varför en kandidat rankas högst.',
  },
  {
    title: 'Förhandsgranska utan att öppna',
    blurb: 'Peka på en rad så glider en sammanfattning in. Du bestämmer innan du lägger tid på hela profilen.',
  },
  {
    title: 'Profilen som beslutsunderlag',
    blurb: 'Verifierade resultat med nivå och normgrupp, plus en arbetsstilsrapport som beskriver hur personen jobbar.',
  },
  {
    title: 'Kandidaten tackade ja',
    blurb: 'Namn, kontaktväg, onboardingtips och en intervjuguide byggd på kandidatens styrkor låses upp.',
  },
  {
    title: 'Ett arbetsflöde, inte en sökning',
    blurb: 'Jämför kandidater, bevaka kravprofilen och dela en maskerad profil med din hiring manager.',
  },
];
