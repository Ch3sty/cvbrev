/**
 * Matchgraden, räknad om från grunden (runda 2, docs/qa/qa-jobbmatchning-2026-09-14.md).
 *
 * Varför det behövdes: edge-funktionens ScoringEngineV3 summerar fem hinkar
 * till max 100 (yrkesnivå 45, titel 25, kompetenser 15, geografi 10,
 * must-have-bonus 5). För en projektledare i Stockholm som söker
 * projektledarjobb i Stockholm faller nästan varje annons i exakt samma
 * hinkar: 45 + 25 + 15 + 10 = 95. Must-have-bonusen kräver strukturerade
 * kravlistor som få annonser har, så 95 blir ett tak i praktiken. 393 av 600
 * annonser landade där. Det är inte avrundning och inte ett enrich-artefakt:
 * det är en platå. Poängen slutade skilja på annonser långt innan den nådde
 * sitt tak.
 *
 * Vad som är annorlunda här: fyra andelar i stället för fem hinkar. En andel
 * kan inte platåa på samma sätt, eftersom den mäter hur stor del av något
 * som träffar, inte om en tröskel passerades. Två projektledarannonser i
 * Stockholm skiljer sig i hur många av CV:ts roller de träffar, hur stor del
 * av kravprofilen användaren fyller och hur färska de är. Det syns nu.
 *
 * Vikterna: kompetenser 0,45, roller 0,30, ort 0,15, färskhet 0,10.
 *
 * Utgångspunkten var 0,40 roller och 0,35 kompetenser, och den ändrades efter
 * mätning mot 600 riktiga annonser från en färsk sökning. Utfallet var
 * entydigt: i topp 25 låg rolldelen på exakt 0,90 för alla tjugofem. Det är
 * logiskt när man ser det, för topp 25 ÄR de annonser vars yrke träffar. Den
 * tyngsta vikten låg alltså på den enda del som inte skilde någonting i
 * toppen, medan kompetensdelen varierade mellan 0,33 och 1,00 och gjorde hela
 * arbetet. Spannet i topp 25 blev 20 procentenheter.
 *
 * Med vikten flyttad till kompetenserna blir spannet 27. Rollen avgör
 * fortfarande vilka annonser som når toppen alls, eftersom fel yrke drar ned
 * hela poängen; den avgör bara inte ordningen inom toppen, och ska därför
 * inte väga tyngst där. Orten är ett ja eller nej mer än en skala, och
 * färskheten är en knuff, inte ett argument.
 *
 * Räknas i klienten, inte i edge-funktionen. All data finns redan i svaret
 * (roller och kompetenser i active_cv_for_matching, must_have/nice_to_have,
 * workplace_address och publication_date på annonsen), så en ny deploy hade
 * inte gett något som inte går att räkna här. Serverns `relevance` rörs inte:
 * suddningen och cachen fortsätter fungera precis som förut.
 */

import type { ActiveCVData } from '../getJobbmatchningData';

type Job = Record<string, any>;

/**
 * Normalisering så "React.js" och "react js" räknas som samma sak.
 *
 * Kommatecknet är med av ett skäl som bara riktig data avslöjade. Taxonomins
 * yrkesnamn är skrivna efterställt: "Projektledare, IT", "Driftledare, IT",
 * "Teknisk chef, kommun". Annonsrubriker är det aldrig; de säger "IT-projektledare"
 * eller "Senior projektledare". Utan att dela på kommatecknet letar vi efter
 * strängen "projektledare, it" i rubriker där den aldrig kan stå, och varje
 * rolljämförelse missar. I en cache med 300 riktiga annonser för en
 * IT-projektledare gav det noll rollträffar.
 */
export function norm(s: string): string {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[.,\-_/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Rollens namn uppdelat i jämförbara delar.
 *
 * "Projektledare, IT" blir både hela strängen och delarna "projektledare" och
 * "it". Hela strängen först, eftersom en fullträff är starkare, men delarna
 * måste finnas: det är dem annonsrubriken faktiskt innehåller.
 */
function roleTerms(raw: string): string[] {
  const hel = norm(raw);
  if (hel === '') return [];
  const delar = hel.split(' ').filter((d) => d.length > 3);
  return Array.from(new Set([hel, ...delar]));
}

/**
 * Kompetenserna annonsen faktiskt ber om.
 *
 * `must_have` är kravprofilen, `nice_to_have` önskemålen. Båda räknas, men
 * kravlistan är den som gör en annons svår: den som saknar ett krav är
 * osannolik, den som saknar ett önskemål är bara inte perfekt. Därför
 * returneras de var för sig.
 */
export function jobSkillBuckets(job: Job): { must: string[]; nice: string[] } {
  const from = (bucket: unknown): string[] =>
    Array.isArray(bucket)
      ? bucket
          .map((s: any) => (typeof s === 'string' ? s : (s?.label ?? s?.name ?? '')))
          .filter((s: string) => String(s).trim() !== '')
      : [];

  const dedup = (list: string[], sedda: Set<string>): string[] =>
    list.filter((s) => {
      const n = norm(s);
      if (n === '' || sedda.has(n)) return false;
      sedda.add(n);
      return true;
    });

  const sedda = new Set<string>();
  const must = dedup(
    [...from(job.must_have?.skills), ...from(job.must_have?.work_experiences)],
    sedda
  );
  const nice = dedup(
    [
      ...from(job.nice_to_have?.skills),
      ...from(job.nice_to_have?.work_experiences),
      ...from(job.enrichedSkills),
    ],
    sedda
  );

  return { must, nice };
}

/**
 * Kravprofilen när annonsen inte har någon strukturerad.
 *
 * Mätningen mot riktig data avgjorde det här. Av 600 annonser i en verklig
 * cache hade åtta stycken `must_have.skills` ifyllt. Åtta. En kompetensdel
 * som bara fungerar för 1,3 procent av annonserna är ingen kompetensdel, och
 * att fördela om vikten för resten gör poängen trubbigare precis där den ska
 * vara vassast.
 *
 * Annonstexten finns däremot alltid. Vi vänder därför på frågan: i stället
 * för att leta upp annonsens krav och se om CV:t fyller dem, letar vi upp
 * CV:ts kompetenser i annonstexten. Det ger samma andel räknad åt andra
 * hållet, och nämnaren blir CV:ts kompetenser i stället för annonsens krav.
 *
 * Skälet skrivs då om därefter, se match-reasons.ts: "6 av 9 kompetenser i
 * kravprofilen" när kravprofilen finns, annars "6 av dina kompetenser nämns
 * i annonsen". Vi påstår aldrig att annonsen krävt något den inte skrivit.
 */
export function skillsInJobText(job: Job, cvSkills: string[]): string[] {
  const text = norm(
    `${job.headline ?? ''} ${job.description?.text ?? ''} ${job.description?.needs ?? ''}`
  );
  if (text === '') return [];
  return cvSkills.filter((s) => {
    const n = norm(s);
    // Korta ord är för lätta att träffa av misstag i en lång annonstext.
    return n.length > 3 && text.includes(n);
  });
}

/**
 * Matchar en av annonsens kompetenser något i CV:t?
 *
 * Delsträngsjämförelse åt båda håll, så att "projektledning" i CV:t räknas
 * mot "erfarenhet av projektledning" i annonsen. Korta ord (tre tecken eller
 * mindre) jämförs bara exakt: annars matchar "it" halva svenska språket.
 */
function skillHit(annonsSkill: string, cvNormaliserade: string[]): boolean {
  const a = norm(annonsSkill);
  if (a === '') return false;
  return cvNormaliserade.some((c) => {
    if (c === '') return false;
    if (c === a) return true;
    if (c.length <= 3 || a.length <= 3) return false;
    return a.includes(c) || c.includes(a);
  });
}

/**
 * Hur väl en av CV:ts roller träffar annonsen, på en skala 0 till 1.
 *
 * Exakt titel 1,0: rollens namn står i annonsens rubrik eller yrkestitel.
 * Yrkesgrupp 0,7: taxonomins occupation_group är densamma, alltså samma sorts
 * jobb men annan titel. Yrkesområde 0,4: samma bransch, annat jobb.
 */
function roleHitStrength(
  occ: ActiveCVData['extracted_occupations'][number],
  job: Job
): number {
  const rubrik = norm(job.headline);
  const yrkestitel = norm(job.occupation?.label);

  // Taxonomins concept_id är starkast när det finns: det är samma yrke, inte
  // bara samma ord.
  if (occ.concept_id && job.occupation?.concept_id === occ.concept_id) return 1;

  const kallor = [occ.normalized, occ.original, ...(occ.alternative_labels ?? [])];
  const hela = kallor.map(norm).filter((n) => n.length > 3);
  const termer = kallor.flatMap(roleTerms);

  // Exakt titel: hela rollnamnet står i rubriken eller yrkestiteln.
  if (hela.some((n) => rubrik.includes(n) || yrkestitel.includes(n))) return 1;

  // Titeldelen: "projektledare" ur "Projektledare, IT" står i rubriken.
  // Det är fortfarande samma yrke, bara skrivet som människor skriver det.
  if (termer.some((t) => rubrik.includes(t) || yrkestitel.includes(t))) return 0.85;

  // Yrkesgrupp: taxonomin säger samma grupp.
  const grupp = norm(job.occupation_group?.label);
  if (grupp && termer.some((t) => grupp.includes(t))) return 0.7;

  // Yrkesområde: samma bransch, annat jobb.
  const omrade = norm(job.occupation_field?.label);
  if (omrade && termer.some((t) => omrade.includes(t))) return 0.4;

  return 0;
}

/** Ortens del, 0 till 1: samma kommun 1,0, distans ok 0,8, annars 0,3. */
function locationStrength(job: Job, cvOrt: string | null, onskadeOrter: string[]): number {
  const addr = job.workplace_address || {};
  const kommun = norm(addr.municipality);
  const region = norm(addr.region);

  // Önskade orter från preferenserna går före CV:ts ort: har användaren sagt
  // var hon vill jobba är det den jämförelsen som gäller.
  const mal = (onskadeOrter.length > 0 ? onskadeOrter : [cvOrt ?? ''])
    .map(norm)
    .filter((o) => o !== '');

  if (mal.length > 0 && kommun !== '') {
    if (mal.some((o) => kommun === o || kommun.includes(o) || o.includes(kommun))) return 1;
  }

  if (looksRemote(job)) return 0.8;

  // Samma län men annan kommun är inte samma ort, men inte heller fel land.
  if (mal.length > 0 && region !== '') {
    if (mal.some((o) => region.includes(o) || o.includes(region))) return 0.5;
  }

  return 0.3;
}

/**
 * Går annonsen att göra på distans?
 *
 * Bara flaggan och rubriken räknas, av samma skäl som i job-filtering.ts:
 * brödtexten nämner ordet distans i nästan varje annons, också de som säger
 * att distans inte går.
 */
function looksRemote(job: Job): boolean {
  if (job.remote_work === true) return true;
  return /\bdistans\b|\bremote\b|hemifr[åa]n/.test(norm(job.headline));
}

/** Färskhetens del: 7 dagar 1,0, 30 dagar 0,7, äldre 0,4. */
export function freshnessStrength(iso: string | null | undefined): number {
  if (!iso) return 0.4;
  const t = Date.parse(String(iso));
  if (Number.isNaN(t)) return 0.4;
  const dagar = (Date.now() - t) / 86_400_000;
  if (dagar <= 7) return 1;
  if (dagar <= 30) return 0.7;
  return 0.4;
}

export interface ScoreWeights {
  roles: number;
  skills: number;
  location: number;
  freshness: number;
}

export const WEIGHTS: ScoreWeights = {
  roles: 0.3,
  skills: 0.45,
  location: 0.15,
  freshness: 0.1,
};

export interface MatchScore {
  /** Matchgraden som heltal 0 till 100, oavrundad till jämna tal. */
  score: number;
  /** Hur många av CV:ts roller som träffar, och hur många roller CV har. */
  roleHits: number;
  roleTotal: number;
  /** Matchade kravkompetenser av annonsens kravprofil. */
  skillHits: number;
  skillTotal: number;
  /** Har annonsen en utskriven kravprofil alls? */
  hasStatedSkills: boolean;
  /** Ortens namn så skälen slipper räkna ut den en gång till. */
  locationLabel: string | null;
  isRemote: boolean;
  /** Delarna, för detaljarket och för felsökning. */
  parts: { roles: number; skills: number; location: number; freshness: number };
}

/**
 * Räknar matchgraden för en annons.
 *
 * Andelarna, inte trösklarna, är poängen med det här. Roller: hur stor del av
 * CV:ts roller annonsen träffar, viktat med hur nära träffen är. Kompetenser:
 * hur stor del av annonsens kravprofil användaren fyller.
 *
 * Saknar annonsen kravprofil helt kan vi inte räkna en andel av ingenting.
 * Då fördelas kompetensvikten om på de tre andra delarna i stället för att
 * sättas till noll: annonsen ska inte straffas för att arbetsgivaren
 * utelämnat en uppgift.
 */
export function scoreJob(
  job: Job,
  cv: ActiveCVData | null,
  onskadeOrter: string[] = []
): MatchScore {
  const roller = cv?.extracted_occupations ?? [];
  const roleTotal = roller.length;

  const styrkor = roller.map((occ) => roleHitStrength(occ, job));
  const roleHits = styrkor.filter((s) => s > 0).length;

  /**
   * Rolldelen: hur väl CV:ts yrkesbakgrund träffar annonsen.
   *
   * Första försöket var en rak andel, summan av styrkorna delad på antalet
   * roller. Det såg rätt ut men var fel, och mätningen visade varför: en
   * annons har EN titel, så ett CV med tre roller kan i praktiken bara få en
   * av dem att träffa. Andelen fastnade på 0,33 för nästan varje bra träff,
   * taket blev 73 och topp 25 klämdes ihop till sex procentenheter. Samma
   * platåfel som det gamla talet hade, bara på en lägre siffra.
   *
   * Rätt fråga är inte hur många av rollerna som träffar utan hur nära den
   * bästa träffen ligger. Den bästa styrkan bär därför delen, och de övriga
   * rollerna lägger till en mindre bredd ovanpå: den som har tre roller som
   * alla pekar mot annonsen är en säkrare kandidat än den som har en.
   */
  const basta = styrkor.length > 0 ? Math.max(...styrkor) : 0;
  const ovriga = styrkor.filter((s) => s > 0).length - (basta > 0 ? 1 : 0);
  // Ett CV med en enda roll har ingen bredd att visa upp, och ska inte
  // straffas för det. Då bär den bästa träffen hela delen.
  const rolePart =
    roleTotal > 1
      ? Math.min(1, basta * 0.8 + (ovriga / (roleTotal - 1)) * 0.2)
      : basta;

  const cvSkills = (cv?.extracted_skills ?? []).map(norm).filter((s) => s !== '');
  const { must, nice } = jobSkillBuckets(job);

  // Kravlistan är det som räknas i skälen. Finns ingen kravlista faller vi
  // tillbaka på önskemålen, så att en annons med bara nice_to_have ändå får
  // en kompetensandel.
  const kravlista = must.length > 0 ? must : nice;
  const hasStatedSkills = kravlista.length > 0;

  let skillTotal: number;
  let skillHits: number;
  let skillPart: number;

  if (hasStatedSkills) {
    skillTotal = kravlista.length;
    skillHits = kravlista.filter((s) => skillHit(s, cvSkills)).length;
    skillPart = skillHits / skillTotal;
  } else {
    // Ingen utskriven kravprofil: räkna CV:ts kompetenser i annonstexten i
    // stället. Nämnaren blir CV:ts kompetenser, och andelen mäter hur mycket
    // av användarens bakgrund annonsen faktiskt efterfrågar.
    const traffade = skillsInJobText(job, cv?.extracted_skills ?? []);
    skillTotal = cvSkills.length;
    skillHits = traffade.length;
    // Ett CV med arton kompetenser får sällan alla nämnda i en annons. Sex
    // träffar är redan ett starkt utslag, så skalan mättas där i stället för
    // att kräva en fullträff som ingen annons ger.
    skillPart = skillTotal > 0 ? Math.min(1, skillHits / 6) : 0;
  }

  const locationPart = locationStrength(job, cv?.extracted_location ?? null, onskadeOrter);
  const freshnessPart = freshnessStrength(job.publication_date);

  // Kompetensdelen finns alltid, antingen som andel av kravprofilen eller
  // som CV-kompetenser funna i annonstexten. Ingen omfördelning behövs.
  const w: ScoreWeights = WEIGHTS;

  const raw =
    rolePart * w.roles +
    skillPart * w.skills +
    locationPart * w.location +
    freshnessPart * w.freshness;

  // Heltal, ingen avrundning till jämna tal. 73 och 74 ska gå att skilja åt.
  const score = Math.max(0, Math.min(100, Math.round(raw * 100)));

  const addr = job.workplace_address || {};

  return {
    score,
    roleHits,
    roleTotal,
    skillHits,
    skillTotal,
    hasStatedSkills,
    locationLabel: addr.municipality || addr.region || null,
    isRemote: looksRemote(job),
    parts: {
      roles: rolePart,
      skills: skillPart,
      location: locationPart,
      freshness: freshnessPart,
    },
  };
}
