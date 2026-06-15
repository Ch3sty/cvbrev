/**
 * Enhanced Taxonomy Service
 *
 * Förbättrad integration med Arbetsförmedlingens Taxonomy API:
 * - SSYK-koder med korrekt användning
 * - Related concepts (relaterade yrken)
 * - Kompetenser kopplade till yrken
 * - Cachning i databas (7 dagar)
 *
 * API Docs: https://taxonomy.api.jobtechdev.se/v1/taxonomy
 */ const TAXONOMY_API = 'https://taxonomy.api.jobtechdev.se/v1/taxonomy';
export class TaxonomyEnhanced {
  supabase;
  cache = new Map();
  CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
  constructor(supabase){
    this.supabase = supabase;
  }
  /**
   * Huvudfunktion: Berika ett yrke med fullständig taxonomy-data
   */ async enrichOccupation(occupation) {
    // 1. Kolla databas-cache
    const cachedData = await this.getCachedFromDB(occupation);
    // Validera cache - använd bara om ssykCode finns
    if (cachedData && cachedData.ssykCode) {
      console.log(`[Taxonomy Enhanced] Cache HIT for "${occupation}" with SSYK ${cachedData.ssykCode}`);
      return cachedData;
    }
    // Om cache finns men saknar SSYK, hämta ny data
    if (cachedData && !cachedData.ssykCode) {
      console.log(`[Taxonomy Enhanced] Cache invalid (no SSYK code) for "${occupation}" - fetching fresh data`);
    } else {
      console.log(`[Taxonomy Enhanced] Cache MISS for "${occupation}" - fetching from API`);
    }
    // 2. Hämta från API (eller fallback)
    const taxonomyData = await this.fetchFromAPI(occupation);
    // 3. Spara till databas-cache (skriver över felaktig cache om den finns)
    await this.saveToDB(occupation, taxonomyData);
    return taxonomyData;
  }
  /**
   * Hämta relaterade yrken för bredare sökning
   */ async getRelatedOccupations(occupation) {
    try {
      // Först hämta SSYK-kod för yrket
      const taxonomyData = await this.enrichOccupation(occupation);
      if (!taxonomyData.ssykCode) {
        console.warn(`[Taxonomy Enhanced] No SSYK code for "${occupation}", cannot get related occupations`);
        return [];
      }
      // Endpoint: /related/concepts/{concept_id}
      const conceptId = taxonomyData.ssykCode;
      const url = `${TAXONOMY_API}/related/concepts/${encodeURIComponent(conceptId)}?type=ssyk`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        console.warn(`[Taxonomy Enhanced] Related concepts API error: ${response.status}`);
        return this.getFallbackRelatedOccupations(occupation);
      }
      const data = await response.json();
      // Parsa relaterade yrken
      const relatedOccupations = [];
      if (Array.isArray(data.related)) {
        for (const related of data.related.slice(0, 10)){
          const label = related['taxonomy/preferred-label'] || related.label;
          if (label && label !== occupation) {
            relatedOccupations.push(label);
          }
        }
      }
      console.log(`[Taxonomy Enhanced] Found ${relatedOccupations.length} related occupations for "${occupation}"`);
      return relatedOccupations;
    } catch (error) {
      console.error(`[Taxonomy Enhanced] Error getting related occupations:`, error);
      return this.getFallbackRelatedOccupations(occupation);
    }
  }
  /**
   * Hämta från Taxonomy API
   * Använder occupation-name för JobAd Links filtering
   */ async fetchFromAPI(occupation) {
    try {
      // NYTT: Endpoint för occupation-name (inte ssyk)
      // Detta ger oss concept_id som JobAd Links API använder
      const searchUrl = `${TAXONOMY_API}/specific/concepts/occupation-name?preferred-label=${encodeURIComponent(occupation)}&limit=5`;
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        console.warn(`[Taxonomy Enhanced] API error (${response.status}) for "${occupation}"`);
        return this.createFallbackData(occupation);
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        console.warn(`[Taxonomy Enhanced] No occupation-name data found for "${occupation}"`);
        return this.createFallbackData(occupation);
      }
      const bestMatch = data[0];
      // Taxonomy API response format
      const conceptId = bestMatch['id'] || null; // HUVUDSAKLIG: concept_id för JobAd Links
      const preferredLabel = bestMatch['taxonomy/preferred-label'] || null;
      const alternativeLabels = bestMatch['taxonomy/alternative-labels'] || [];
      const description = bestMatch['taxonomy/description'] || undefined;
      // Hämta SSYK-kod via concept ID (för backward compatibility)
      let ssykCode = null;
      let occupationGroupId = null;
      if (conceptId) {
        // Hämta SSYK via /concepts/{conceptId}/related
        const ssykData = await this.getSSYKForOccupation(conceptId);
        ssykCode = ssykData.ssykCode;
        occupationGroupId = ssykData.occupationGroupId;
      }
      // Hämta kompetenser för detta yrke
      let competencies = [];
      if (conceptId) {
        competencies = await this.getCompetenciesForOccupation(conceptId);
      }
      console.log(`[Taxonomy Enhanced] "${occupation}" → concept_id: ${conceptId}, SSYK: ${ssykCode}, ${alternativeLabels.length} synonymer`);
      return {
        primaryTerm: occupation,
        ssykCode,
        preferredLabel,
        alternativeLabels,
        relatedOccupations: [],
        competencies,
        description,
        conceptId,
        occupationFieldId: conceptId,
        occupationGroupId
      };
    } catch (error) {
      console.error(`[Taxonomy Enhanced] API error for "${occupation}":`, error);
      return this.createFallbackData(occupation);
    }
  }
  /**
   * Hämta SSYK-kod och occupation-group för ett occupation-name concept
   */ async getSSYKForOccupation(conceptId) {
    try {
      // Hämta related concepts för occupation-name
      const url = `${TAXONOMY_API}/concepts/${encodeURIComponent(conceptId)}/related`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        return {
          ssykCode: null,
          occupationGroupId: null
        };
      }
      const data = await response.json();
      let ssykCode = null;
      let occupationGroupId = null;
      if (Array.isArray(data.related)) {
        for (const rel of data.related){
          const type = rel['taxonomy/type'];
          // Leta efter SSYK-relation
          if (type === 'ssyk-level-4' && rel['taxonomy/ssyk-code-2012']) {
            ssykCode = rel['taxonomy/ssyk-code-2012'];
          }
          // Leta efter occupation-group
          if (type === 'occupation-group' && rel['id']) {
            occupationGroupId = rel['id'];
          }
        }
      }
      return {
        ssykCode,
        occupationGroupId
      };
    } catch (error) {
      console.error('[Taxonomy Enhanced] Error fetching SSYK for occupation:', error);
      return {
        ssykCode: null,
        occupationGroupId: null
      };
    }
  }
  /**
   * Hämta kompetenser för ett yrke (via concept ID)
   */ async getCompetenciesForOccupation(conceptId) {
    try {
      // Endpoint kan variera - justera efter faktisk API-dokumentation
      const url = `${TAXONOMY_API}/concepts/${encodeURIComponent(conceptId)}/related?type=skill`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      const competencies = [];
      if (Array.isArray(data.related)) {
        for (const comp of data.related.slice(0, 20)){
          const label = comp['taxonomy/preferred-label'] || comp.label;
          if (label) {
            competencies.push(label);
          }
        }
      }
      return competencies;
    } catch (error) {
      console.error('[Taxonomy Enhanced] Error fetching competencies:', error);
      return [];
    }
  }
  /**
   * Fallback: Manuell data om API failar
   */ createFallbackData(occupation) {
    const manualData = {
      'rörmokare': {
        ssykCode: '7126',
        alternativeLabels: [
          'vvs-montör',
          'vs-montör',
          'rörläggare',
          'vvs-installatör'
        ],
        competencies: [
          'installation',
          'reparation',
          'service',
          'rörinstallation'
        ]
      },
      'butikschef': {
        ssykCode: '1420',
        alternativeLabels: [
          'store manager',
          'butiksansvarig',
          'butiksföreståndare'
        ],
        competencies: [
          'ledarskap',
          'försäljning',
          'personalansvar',
          'kundservice'
        ]
      },
      'elektriker': {
        ssykCode: '7411',
        alternativeLabels: [
          'elmontör',
          'elinstallatör',
          'eltekniker'
        ],
        competencies: [
          'elinstallation',
          'felsökning',
          'service'
        ]
      },
      'snickare': {
        ssykCode: '7115',
        alternativeLabels: [
          'byggsnickare',
          'möbelsnickare',
          'inredningssnickare'
        ],
        competencies: [
          'byggarbete',
          'renovering',
          'träbearbetning'
        ]
      },
      'systemutvecklare': {
        ssykCode: '2512',
        alternativeLabels: [
          'mjukvaruutvecklare',
          'utvecklare',
          'programmerare'
        ],
        competencies: [
          'programmering',
          'systemdesign',
          'databashantering'
        ]
      }
    };
    const fallback = manualData[occupation.toLowerCase()] || {};
    return {
      primaryTerm: occupation,
      ssykCode: fallback.ssykCode || null,
      preferredLabel: occupation,
      alternativeLabels: fallback.alternativeLabels || [],
      relatedOccupations: [],
      competencies: fallback.competencies || [],
      conceptId: null,
      occupationFieldId: null,
      occupationGroupId: null
    };
  }
  /**
   * Fallback för relaterade yrken
   */ getFallbackRelatedOccupations(occupation) {
    const relatedMap = {
      'butikschef': [
        'butikssäljare',
        'försäljningschef',
        'säljare',
        'butiksmedarbetare'
      ],
      'rörmokare': [
        'ventilationsmontör',
        'vvs-montör',
        'fastighetstekniker'
      ],
      'elektriker': [
        'elmontör',
        'servicetekniker',
        'drifttekniker'
      ],
      'systemutvecklare': [
        'mjukvaruutvecklare',
        'frontend-utvecklare',
        'backend-utvecklare',
        'fullstack-utvecklare'
      ],
      'sjuksköterska': [
        'undersköterska',
        'specialist sjuksköterska',
        'vårdpersonal'
      ]
    };
    return relatedMap[occupation.toLowerCase()] || [];
  }
  /**
   * Hämta från databas-cache
   */ async getCachedFromDB(occupation) {
    try {
      const { data, error } = await this.supabase.from('enriched_occupations').select('*').eq('occupation', occupation.toLowerCase()).gt('expires_at', new Date().toISOString()).single();
      if (error || !data) return null;
      return {
        primaryTerm: data.occupation,
        ssykCode: data.ssyk_code,
        preferredLabel: data.preferred_label,
        alternativeLabels: data.alternative_labels || [],
        relatedOccupations: data.related_occupations || [],
        competencies: data.competencies || [],
        conceptId: data.concept_id || null,
        occupationFieldId: data.concept_id || null,
        occupationGroupId: data.occupation_group_id || null
      };
    } catch  {
      return null;
    }
  }
  /**
   * Spara till databas-cache
   */ async saveToDB(occupation, taxonomyData) {
    try {
      const cacheData = {
        occupation: occupation.toLowerCase(),
        ssyk_code: taxonomyData.ssykCode,
        preferred_label: taxonomyData.preferredLabel,
        alternative_labels: taxonomyData.alternativeLabels,
        related_occupations: taxonomyData.relatedOccupations,
        competencies: taxonomyData.competencies,
        concept_id: taxonomyData.conceptId,
        occupation_group_id: taxonomyData.occupationGroupId,
        trending_skills: null,
        historical_data: null,
        education_matches: [],
        expires_at: new Date(Date.now() + this.CACHE_DURATION).toISOString()
      };
      await this.supabase.from('enriched_occupations').upsert(cacheData, {
        onConflict: 'occupation'
      });
      console.log(`[Taxonomy Enhanced] Saved "${occupation}" to cache (concept_id: ${taxonomyData.conceptId})`);
    } catch (error) {
      console.error('[Taxonomy Enhanced] Cache save error:', error);
    }
  }
}
