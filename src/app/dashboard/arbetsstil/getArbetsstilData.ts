/**
 * Serverhämtningen bakom Din arbetsstil.
 *
 * Förut var hela sidan 'use client'. Efter hydrering fetchade den
 * /api/candidate/summary, som först gjorde sitt eget auth.getUser() och sedan
 * byggde hela kandidatunderlaget: testsessioner, personlighetsprofil,
 * CV-extraktion, structured_data som fallback, och därefter två
 * admin-räkningar per testfamilj för percentilerna. Tolv frågor och ett
 * getUser för ett svar där sidan bara läser en enda gren av det. Mätningen
 * landade på 15 rundturer och 3268 ms LCP på Pixel 7 över LTE.
 *
 * Sidan visar bara arbetsstilen: arketypen, spektrana, energibudgeten och
 * intervjuträningen. Allt det härleds ur user_personality_profile och
 * ingenting annat. Percentiler, CV-kompetenser och testresultat renderas
 * aldrig här. Kvar blir därför en enda fråga.
 *
 * Härledningen är oförändrad och samma som både API-routen och Bli upptäckt
 * använder: deriveCandidateOwnReport och deriveWorkStyle ur
 * src/lib/recruiter/workStyle. Råpoängen från Big Five lämnar aldrig
 * funktionen, bara de färdiga formuleringarna.
 *
 * Energibudgeten och intervjuträningen är privata och delas aldrig. Den
 * regeln ligger kvar där den låg: det här är kandidatens egen vy, och
 * ownReport går bara hit.
 */
import {
  deriveWorkStyle,
  deriveCandidateOwnReport,
  type CandidateOwnReport,
} from '@/lib/recruiter/workStyle';

export interface ArbetsstilData {
  /** true när användaren har en personlighetsprofil alls. */
  done: boolean;
  /** true när profilen bygger på det fördjupade testets facetter. */
  hasAdvancedTest: boolean;
  /** Fullrapporten i du-form. null för grundtestare och för jämna profiler. */
  ownReport: CandidateOwnReport | null;
  /** Kompakt arbetsstil, fallback när ownReport inte kan byggas. */
  workStyle: {
    archetype: { title: string; description: string };
    statements: string[];
  } | null;
}

export const EMPTY_ARBETSSTIL: ArbetsstilData = {
  done: false,
  hasAdvancedTest: false,
  ownReport: null,
  workStyle: null,
};

/**
 * supabase: en klient från createServerClient, redan bunden till användarens
 * cookies. Anroparen har autentiserat och skickar in userId. RLS gör att bara
 * användarens egen rad kan läsas.
 */
export async function getArbetsstilData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<ArbetsstilData> {
  const { data, error } = await supabase
    .from('user_personality_profile')
    .select(
      'openness, conscientiousness, extraversion, agreeableness, neuroticism, facet_scores'
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Arbetsstil: kunde inte läsa personlighetsprofilen', error);
    return EMPTY_ARBETSSTIL;
  }

  const row = data as
    | (Record<string, number> & { facet_scores: Record<string, number> | null })
    | null;

  if (!row) return EMPTY_ARBETSSTIL;

  const domains = {
    openness: row.openness ?? 50,
    conscientiousness: row.conscientiousness ?? 50,
    extraversion: row.extraversion ?? 50,
    agreeableness: row.agreeableness ?? 50,
    neuroticism: row.neuroticism ?? 50,
  };
  const facets = row.facet_scores ?? null;

  return {
    done: true,
    hasAdvancedTest: facets !== null && Object.keys(facets).length > 0,
    ownReport: deriveCandidateOwnReport(domains, facets),
    workStyle: deriveWorkStyle(domains, facets),
  };
}
