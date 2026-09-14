/**
 * Matchgraden ska sprida sig (runda 2).
 *
 * Det gamla talet platåade: 393 av 600 annonser fick 95 %, eftersom
 * ScoringEngineV3 summerar trösklar (45 + 25 + 15 + 10) och alla annonser i
 * rätt yrke och rätt stad passerar samma trösklar. Testet här skyddar mot att
 * det händer igen: en realistisk blandning annonser ska ge en topp 25 som
 * spänner över minst 25 procentenheter, och ingen träff ska sakna skäl.
 */

import { describe, it, expect } from 'vitest';
import { scoreJob } from '../match-score';
import { rankMatches, readCountLabel } from '../match-ranking';
import { buildMatchReasons, relativDatum } from '../match-reasons';
import type { ActiveCVData } from '../../getJobbmatchningData';

const cv: ActiveCVData = {
  cv_id: 'cv-1',
  extracted_occupations: [
    {
      original: 'Projektledare',
      normalized: 'projektledare',
      concept_id: 'p1',
      alternative_labels: ['project manager'],
      confidence: 'high',
    },
    {
      original: 'Verksamhetsutvecklare',
      normalized: 'verksamhetsutvecklare',
      concept_id: 'p2',
      alternative_labels: [],
      confidence: 'medium',
    },
    {
      original: 'Affärsutvecklare',
      normalized: 'affärsutvecklare',
      concept_id: 'p3',
      alternative_labels: [],
      confidence: 'low',
    },
  ],
  extracted_skills: [
    'projektledning',
    'agil metodik',
    'scrum',
    'budgetansvar',
    'kravhantering',
    'intressenthantering',
    'jira',
    'förändringsledning',
  ],
  extracted_educations: [],
  extracted_location: 'Stockholm',
  parsed_at: '2026-09-01T00:00:00Z',
};

const iDag = new Date().toISOString();
const iGar = new Date(Date.now() - 86_400_000).toISOString();
const treVeckor = new Date(Date.now() - 21 * 86_400_000).toISOString();
const halvtAr = new Date(Date.now() - 180 * 86_400_000).toISOString();

function skills(...labels: string[]) {
  return { skills: labels.map((label) => ({ label })) };
}

/**
 * En blandning som liknar den riktiga träfflistan: samma yrke i samma stad,
 * men med olika kravprofiler, olika färskhet och olika ort. Det är precis den
 * blandningen som gamla poängen mosade ihop till 95.
 */
const annonser: Array<Record<string, any>> = [
  // Perfekt: alla tre rollerna i rubriken går inte, men exakt titel + full
  // kravprofil + rätt ort + färsk.
  {
    id: 'a',
    headline: 'Projektledare till digitala flöden',
    publication_date: iDag,
    workplace_address: { municipality: 'Stockholm' },
    must_have: skills('projektledning', 'agil metodik', 'scrum'),
  },
  // Samma titel och ort, men bara ett krav av fem uppfyllt.
  {
    id: 'b',
    headline: 'Projektledare bygg',
    publication_date: iGar,
    workplace_address: { municipality: 'Stockholm' },
    must_have: skills('projektledning', 'entreprenadjuridik', 'AMA', 'BAS-P', 'CAD'),
  },
  // Rätt titel, rätt ort, gammal annons.
  {
    id: 'c',
    headline: 'Senior projektledare',
    publication_date: halvtAr,
    workplace_address: { municipality: 'Stockholm' },
    must_have: skills('projektledning', 'budgetansvar'),
  },
  // Rätt titel, fel ort.
  {
    id: 'd',
    headline: 'Projektledare IT',
    publication_date: iDag,
    workplace_address: { municipality: 'Göteborg' },
    must_have: skills('projektledning', 'jira'),
  },
  // Samma yrkesgrupp, inte samma titel.
  {
    id: 'e',
    headline: 'Teamledare inom logistik',
    publication_date: treVeckor,
    workplace_address: { municipality: 'Stockholm' },
    must_have: skills('ledarskap', 'logistik', 'SAP'),
  },
  // Helt annat yrke, rätt ort, färsk.
  {
    id: 'f',
    headline: 'Undersköterska till äldreboende',
    publication_date: iDag,
    workplace_address: { municipality: 'Stockholm' },
    must_have: skills('omvårdnad', 'dokumentation'),
  },
  // Annonsen utan kravprofil alls.
  {
    id: 'g',
    headline: 'Projektledare sökes',
    publication_date: treVeckor,
    workplace_address: { municipality: 'Stockholm' },
  },
  // Distansannons, fel kommun.
  {
    id: 'h',
    headline: 'Projektledare, arbete på distans',
    publication_date: iGar,
    workplace_address: { municipality: 'Malmö' },
    must_have: skills('projektledning', 'scrum', 'kravhantering', 'jira'),
  },
  // Annat yrke, fel ort, gammalt: golvet.
  {
    id: 'i',
    headline: 'Lastbilschaufför',
    publication_date: halvtAr,
    workplace_address: { municipality: 'Kiruna' },
    must_have: skills('C-körkort', 'ADR'),
  },
  // En till i mitten.
  {
    id: 'j',
    headline: 'Verksamhetsutvecklare',
    publication_date: treVeckor,
    workplace_address: { municipality: 'Solna' },
    must_have: skills('förändringsledning', 'processkartläggning', 'excel'),
  },
];

describe('matchgraden', () => {
  it('ger inte alla annonser samma tal', () => {
    const tal = annonser.map((j) => scoreJob(j, cv, ['Stockholm']).score);
    const unika = new Set(tal);
    // Tio annonser som skiljer sig i roll, krav, ort och ålder ska inte
    // hamna på en handfull värden. Gamla poängen gav ett enda: 95.
    expect(unika.size).toBeGreaterThanOrEqual(7);
  });

  it('sprider topp-listan över minst 25 procentenheter', () => {
    const { ranked } = rankMatches(annonser, cv, ['Stockholm'], 25);
    const tal = ranked.map((r) => r.score.score);
    const spann = tal[0] - tal[tal.length - 1];
    expect(spann).toBeGreaterThanOrEqual(25);
  });

  it('sätter den bästa annonsen överst och den sämsta sist', () => {
    const { ranked } = rankMatches(annonser, cv, ['Stockholm'], 25);
    expect(ranked[0].job.id).toBe('a');
    expect(ranked[ranked.length - 1].job.id).toBe('i');
  });

  it('skiljer på två annonser med samma titel och ort', () => {
    // Gamla poängen gav båda 95. Skillnaden är kravprofilen och åldern.
    const a = scoreJob(annonser[0], cv, ['Stockholm']).score;
    const b = scoreJob(annonser[1], cv, ['Stockholm']).score;
    expect(a).toBeGreaterThan(b + 5);
  });

  it('använder färskhet som skiljedomare vid lika matchgrad', () => {
    const bas = {
      headline: 'Projektledare',
      workplace_address: { municipality: 'Stockholm' },
      must_have: skills('projektledning'),
    };
    const { ranked } = rankMatches(
      [
        { ...bas, id: 'gammal', publication_date: treVeckor },
        { ...bas, id: 'ny', publication_date: iDag },
      ],
      cv,
      ['Stockholm'],
      25
    );
    // Samma poäng i allt utom färskhet: den färska ska ligga först.
    expect(ranked[0].job.id).toBe('ny');
  });

  it('avrundar inte till jämna tal', () => {
    const tal = annonser.map((j) => scoreJob(j, cv, ['Stockholm']).score);
    // Ett tal som inte är delbart med fem bevisar att skalan är fin.
    expect(tal.some((t) => t % 5 !== 0)).toBe(true);
  });

  it('straffar inte annonser som saknar kravprofil', () => {
    const utan = scoreJob(annonser[6], cv, ['Stockholm']);
    expect(utan.hasStatedSkills).toBe(false);
    // Rätt titel och rätt ort ska fortfarande ge en respektabel poäng.
    expect(utan.score).toBeGreaterThan(40);
  });
});

describe('taxonomins efterställda yrkesnamn', () => {
  /**
   * Det här felet syntes bara mot riktig data. Taxonomin skriver yrken
   * efterställt, "Projektledare, IT", men ingen annonsrubrik gör det. En
   * jämförelse på hela strängen hittade därför noll rollträffar i 300 riktiga
   * annonser för en IT-projektledare, och hela poängen föll ihop.
   */
  const itCv: ActiveCVData = {
    cv_id: 'cv-2',
    extracted_occupations: [
      {
        original: 'Senior Projektledare',
        normalized: 'Projektledare, IT',
        concept_id: 'z5AM_ayf_WcL',
        alternative_labels: [],
        confidence: 'high',
      },
    ],
    extracted_skills: ['projektledning', 'scrum'],
    extracted_educations: [],
    extracted_location: 'Stockholm',
    parsed_at: '2026-09-01T00:00:00Z',
  };

  it('matchar "Projektledare, IT" mot rubriken "Teknisk Projektledare"', () => {
    const s = scoreJob(
      {
        id: 'x',
        headline: 'Teknisk Projektledare',
        publication_date: iDag,
        workplace_address: { municipality: 'Stockholm' },
      },
      itCv,
      ['Stockholm']
    );
    expect(s.roleHits).toBe(1);
    // Rolldelen ska vara nära full. Poängen i övrigt hålls nere av att
    // annonsen i testet saknar text, och det är rätt: en annons utan innehåll
    // ska inte kunna toppa listan bara för att rubriken stämmer.
    expect(s.parts.roles).toBeGreaterThanOrEqual(0.8);
  });

  it('matchar på concept_id när annonsen bär samma yrke', () => {
    const s = scoreJob(
      {
        id: 'y',
        headline: 'Något helt annat',
        occupation: { label: 'Projektledare, IT', concept_id: 'z5AM_ayf_WcL' },
        publication_date: iDag,
        workplace_address: { municipality: 'Stockholm' },
      },
      itCv,
      ['Stockholm']
    );
    expect(s.roleHits).toBe(1);
  });
});

describe('annonser utan strukturerad kravprofil', () => {
  /**
   * Av 600 riktiga annonser hade tjugo `must_have.skills` ifyllt. Resten
   * måste få sin kompetensdel ur annonstexten, annars mäter delen ingenting
   * för 97 procent av marknaden.
   */
  it('räknar CV-kompetenser i annonstexten', () => {
    const utan = scoreJob(
      {
        id: 'z',
        headline: 'Projektledare',
        publication_date: iDag,
        workplace_address: { municipality: 'Stockholm' },
        description: {
          text: 'Vi söker dig med erfarenhet av projektledning, scrum och budgetansvar.',
        },
      },
      cv,
      ['Stockholm']
    );
    expect(utan.hasStatedSkills).toBe(false);
    expect(utan.skillHits).toBeGreaterThanOrEqual(3);
  });

  it('ger lägre poäng åt annons vars text inte nämner något ur CV:t', () => {
    const bas = {
      headline: 'Projektledare',
      publication_date: iDag,
      workplace_address: { municipality: 'Stockholm' },
    };
    const med = scoreJob(
      {
        ...bas,
        id: 'm',
        description: { text: 'projektledning, scrum, budgetansvar, jira, kravhantering' },
      },
      cv,
      ['Stockholm']
    );
    const utan = scoreJob(
      { ...bas, id: 'u', description: { text: 'Du är social och gillar att resa.' } },
      cv,
      ['Stockholm']
    );
    expect(med.score).toBeGreaterThan(utan.score + 15);
  });
});

describe('skälen', () => {
  it('ger alltid minst två skäl, aldrig en tom rad', () => {
    for (const job of annonser) {
      const { reasons } = buildMatchReasons(job, cv, ['Stockholm']);
      expect(reasons.length).toBeGreaterThanOrEqual(2);
      expect(reasons.every((r) => r.trim() !== '')).toBe(true);
    }
  });

  it('skriver roller med nämnare', () => {
    const { reasons } = buildMatchReasons(annonser[0], cv, ['Stockholm']);
    expect(reasons[0]).toMatch(/av dina 3 roller/);
  });

  it('skriver kompetenser som andel av kravprofilen', () => {
    const { reasons } = buildMatchReasons(annonser[0], cv, ['Stockholm']);
    expect(reasons.some((r) => /av 3 kompetenser i kravprofilen/.test(r))).toBe(true);
  });

  it('håller ordningen roller, kompetenser, ort', () => {
    const { reasons } = buildMatchReasons(annonser[0], cv, ['Stockholm']);
    expect(reasons[0]).toMatch(/roller/);
    expect(reasons[1]).toMatch(/kravprofilen/);
    expect(reasons[2]).toBe('Stockholm');
  });

  it('lämnar färskheten åt metaraden och upprepar den inte i skälen', () => {
    for (const job of annonser) {
      const { reasons } = buildMatchReasons(job, cv, ['Stockholm']);
      expect(reasons.some((r) => /publicerad/.test(r))).toBe(false);
    }
  });

  it('lägger "inga uttalade krav" bara i detaljarket', () => {
    const { reasons, detailReasons } = buildMatchReasons(annonser[6], cv, ['Stockholm']);
    expect(detailReasons).toContain('Kompetenser: inga uttalade krav i annonsen');
    expect(reasons.some((r) => /uttalade krav/.test(r))).toBe(false);
  });

  it('säger Distans i stället för kommunen när annonsen går på distans', () => {
    const { reasons } = buildMatchReasons(annonser[7], cv, ['Stockholm']);
    expect(reasons).toContain('Distans');
    expect(reasons).not.toContain('Malmö');
  });
});

describe('raden ovanför listan', () => {
  it('säger "passar dig bäst" när fler än urvalet klarar tröskeln', () => {
    expect(readCountLabel(600, 120, 25)).toBe('600 annonser lästa, 25 passar dig bäst');
  });

  it('säger det faktiska antalet när färre klarar tröskeln', () => {
    expect(readCountLabel(600, 11, 25)).toBe('600 annonser lästa, 11 passar dig');
  });

  it('ljuger inte när ingenting passar', () => {
    expect(readCountLabel(600, 0, 25)).toBe('600 annonser lästa, inga starka träffar');
  });
});

describe('färskheten i ord', () => {
  const nu = new Date('2026-09-14T12:00:00Z').getTime();
  const dagarSedan = (n: number) => new Date(nu - n * 86_400_000).toISOString();

  it('säger i dag och i går för de färskaste annonserna', () => {
    expect(relativDatum(dagarSedan(0), nu)).toBe('i dag');
    expect(relativDatum(dagarSedan(1), nu)).toBe('i går');
  });

  it('räknar i dagar upp till 13 och i veckor därefter', () => {
    expect(relativDatum(dagarSedan(5), nu)).toBe('för 5 dagar sedan');
    expect(relativDatum(dagarSedan(13), nu)).toBe('för 13 dagar sedan');
    expect(relativDatum(dagarSedan(14), nu)).toBe('för 2 veckor sedan');
    expect(relativDatum(dagarSedan(49), nu)).toBe('för 7 veckor sedan');
  });

  it('skriver aldrig ut ett datum, ens för gamla annonser', () => {
    expect(relativDatum(dagarSedan(61), nu)).toBe('för 2 månader sedan');
    expect(relativDatum(dagarSedan(200), nu)).toBe('för 7 månader sedan');
    expect(relativDatum(dagarSedan(400), nu)).not.toMatch(/d{4}-d{2}-d{2}/);
  });
});
