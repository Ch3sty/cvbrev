/**
 * Taxonomy Enrichment Module
 *
 * Integrerar med Arbetsförmedlingens Taxonomy API för att:
 * - Hämta officiella yrkesbeteckningar (SSYK-koder)
 * - Expandera med synonymer och alternativa titlar
 * - Hitta relaterade yrken för bredare matchning
 */

export interface TaxonomyEnrichment {
  primaryTerm: string;
  ssykCode: string | null;
  preferredLabel: string | null;
  alternativeLabels: string[];
  relatedOccupations: string[];
  competencies: string[];
}

/**
 * Hämta taxonomy-berikad data för ett yrke
 */
export async function enrichOccupationWithTaxonomy(
  occupation: string
): Promise<TaxonomyEnrichment> {
  const baseUrl = 'https://taxonomy.api.jobtechdev.se/v1/taxonomy';

  try {
    // Sök efter yrket i taxonomy
    const searchUrl = `${baseUrl}/specific-concepts/search?q=${encodeURIComponent(occupation)}&type=occupation-name&limit=5`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`Taxonomy API error (${response.status}) for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn(`No taxonomy results for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    // Ta första (bästa) matchningen
    const bestMatch = data[0];

    // Extrahera data
    const ssykCode = bestMatch.ssyk_code_2012 || bestMatch.ssyk || null;
    const preferredLabel = bestMatch.preferred_label || null;
    const alternativeLabels = bestMatch.alternative_labels || [];

    // Hämta relaterade koncept (om tillgängliga)
    let relatedOccupations: string[] = [];
    let competencies: string[] = [];

    if (bestMatch.broader || bestMatch.narrower || bestMatch.related) {
      relatedOccupations = [
        ...(bestMatch.broader || []),
        ...(bestMatch.narrower || []),
        ...(bestMatch.related || [])
      ].slice(0, 10); // Max 10 relaterade
    }

    if (bestMatch.skills || bestMatch.competencies) {
      competencies = (bestMatch.skills || bestMatch.competencies || []).slice(0, 10);
    }

    console.log(`Taxonomy enrichment for "${occupation}": ${alternativeLabels.length} synonyms, SSYK: ${ssykCode}`);

    return {
      primaryTerm: occupation,
      ssykCode,
      preferredLabel,
      alternativeLabels,
      relatedOccupations,
      competencies
    };

  } catch (error) {
    console.error(`Taxonomy API error for "${occupation}":`, error);
    return createFallbackEnrichment(occupation);
  }
}

/**
 * Skapa fallback enrichment om API failar
 */
function createFallbackEnrichment(occupation: string): TaxonomyEnrichment {
  // Manuell synonym-lista för vanliga yrken
  const manualSynonyms: Record<string, string[]> = {
    'rörmokare': ['vvs-montör', 'vs-montör', 'rörläggare', 'vvs-installatör'],
    'elektriker': ['elmontör', 'elinstallatör', 'eltekniker'],
    'snickare': ['byggsnickare', 'möbelsnickare', 'inredningssnickare'],
    'sjuksköterska': ['legitimerad sjuksköterska', 'spec.sjuksköterska'],
    'lärare': ['grundskollärare', 'gymnasielärare', 'undervisande lärare'],
    'säljare': ['butikssäljare', 'försäljare', 'säljassistent'],
    'utvecklare': ['systemutvecklare', 'mjukvaruutvecklare', 'programmerare']
  };

  const lowerOccupation = occupation.toLowerCase();
  const synonyms = manualSynonyms[lowerOccupation] || [];

  return {
    primaryTerm: occupation,
    ssykCode: null,
    preferredLabel: null,
    alternativeLabels: synonyms,
    relatedOccupations: [],
    competencies: []
  };
}

/**
 * Expandera yrkestitel med alla synonymer för sökning
 */
export function expandOccupationForSearch(enrichment: TaxonomyEnrichment): string[] {
  const terms = new Set<string>();

  // Lägg till primär term
  terms.add(enrichment.primaryTerm.toLowerCase());

  // Lägg till preferred label (om skillnad)
  if (enrichment.preferredLabel && enrichment.preferredLabel.toLowerCase() !== enrichment.primaryTerm.toLowerCase()) {
    terms.add(enrichment.preferredLabel.toLowerCase());
  }

  // Lägg till alla alternativa labels
  enrichment.alternativeLabels.forEach(label => {
    terms.add(label.toLowerCase());
  });

  // Lägg till relaterade yrken (max 5 för att inte späda ut)
  enrichment.relatedOccupations.slice(0, 5).forEach(related => {
    terms.add(related.toLowerCase());
  });

  return Array.from(terms);
}

/**
 * Cache för taxonomy-data (7 dagar)
 */
const taxonomyCache = new Map<string, { data: TaxonomyEnrichment; timestamp: number }>();
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dagar

export async function getCachedTaxonomy(occupation: string): Promise<TaxonomyEnrichment> {
  const cacheKey = `taxonomy:${occupation.toLowerCase()}`;

  // Kolla cache
  if (taxonomyCache.has(cacheKey)) {
    const cached = taxonomyCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`Taxonomy cache HIT for "${occupation}"`);
      return cached.data;
    } else {
      taxonomyCache.delete(cacheKey); // Rensa utgången cache
    }
  }

  // Hämta från API
  console.log(`Taxonomy cache MISS for "${occupation}" - fetching from API`);
  const data = await enrichOccupationWithTaxonomy(occupation);

  // Spara i cache
  taxonomyCache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}
