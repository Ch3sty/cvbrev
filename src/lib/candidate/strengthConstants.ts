// src/lib/candidate/strengthConstants.ts
//
// Percentilgränsen och styrkekartan, brutna ur getCandidateSummary.ts till en
// egen modul utan beroenden.
//
// Tre filer behövde samma regler: kandidatens egen vy, rekryterarens vy och
// API-routen. Att låta rekryterarfilen importera från getCandidateSummary.ts
// gav en cirkulär import, eftersom getCandidateSummary i sin tur importerar
// deriveSeniority därifrån. Konstanterna har inga beroenden, så de bor här
// och alla tre importerar härifrån.
//
// Ändras reglerna ändras de på ett ställe. Två kopior glider isär, och då
// säger kandidatsidan och rekryterarsidan olika saker om samma person.

/**
 * Minsta antal sessioner i underlaget innan en percentil får visas. Under
 * gränsen blir percentilen null: ett jämförelsetal på tio personer är inte
 * en jämförelse, det är en gissning.
 */
export const MIN_PERCENTILE_SAMPLE = 25;

/**
 * Big Five-kolumn till styrkeetikett. Högre värde betyder mer av draget,
 * utom neuroticism som inverteras: låg neuroticism är styrkan "Stresstålig".
 * Bara etiketterna lämnar servern, aldrig råpoängen.
 */
export const STRENGTH_MAP: Array<{ column: string; label: string; invert: boolean }> = [
  { column: 'conscientiousness', label: 'Strukturerad', invert: false },
  { column: 'agreeableness', label: 'Samarbetsvillig', invert: false },
  { column: 'extraversion', label: 'Utåtriktad', invert: false },
  { column: 'openness', label: 'Nyfiken', invert: false },
  { column: 'neuroticism', label: 'Stresstålig', invert: true },
];
