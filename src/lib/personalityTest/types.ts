// Personlighetstest – typer för Big Five (IPIP-NEO)

export type Dimension =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'neuroticism';

// 30 facetter (6 per dimension) enligt NEO-PI-R-modellen
export type Facet =
  // Neuroticism
  | 'n1_anxiety'
  | 'n2_anger'
  | 'n3_depression'
  | 'n4_self_consciousness'
  | 'n5_immoderation'
  | 'n6_vulnerability'
  // Extraversion
  | 'e1_friendliness'
  | 'e2_gregariousness'
  | 'e3_assertiveness'
  | 'e4_activity_level'
  | 'e5_excitement_seeking'
  | 'e6_cheerfulness'
  // Openness
  | 'o1_imagination'
  | 'o2_artistic_interests'
  | 'o3_emotionality'
  | 'o4_adventurousness'
  | 'o5_intellect'
  | 'o6_liberalism'
  // Agreeableness
  | 'a1_trust'
  | 'a2_morality'
  | 'a3_altruism'
  | 'a4_cooperation'
  | 'a5_modesty'
  | 'a6_sympathy'
  // Conscientiousness
  | 'c1_self_efficacy'
  | 'c2_orderliness'
  | 'c3_dutifulness'
  | 'c4_achievement_striving'
  | 'c5_self_discipline'
  | 'c6_cautiousness';

export interface PersonalityItem {
  id: string;            // unikt id, t.ex. "g-01" (grund) eller "a-01" (avancerad)
  text: string;          // påståendet på svenska
  dimension: Dimension;  // vilken Big Five-dimension det mäter
  facet?: Facet;         // vilken facett (för avancerad)
  reverse: boolean;      // omvänt poängsatt? (1↔5, 2↔4)
}

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface PersonalityAnswer {
  questionId: string;
  value: LikertValue;
}

export interface BigFiveScores {
  openness: number;          // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export type FacetScores = Partial<Record<Facet, number>>; // 0-100

export interface PersonalityProfile {
  scores: BigFiveScores;
  facetScores?: FacetScores;
}

export type PersonalityTestType = 'personlighet-grund' | 'personlighet-avancerad';
