/**
 * Multi-Source Job Aggregator
 *
 * Aggregerar jobb från JobAd Links API för maximal täckning:
 * - 30% fler jobb än Platsbanken
 * - Inkluderar LinkedIn, Indeed, StepStone, Monster, etc.
 * - Strukturerad occupation data (occupation_field, occupation_group)
 * - Optimerad filtrering med occupation-field parameter
 */

export interface AggregationParams {
  primaryOccupation: string;
  taxonomyData: any;
  relatedOccupations: string[];
  cvEducations: any[];
  userLocation: string;
  customQuery?: string;
  maxJobsPerQuery: number;
  maxTotalJobs: number;
}

interface Job {
  id: string;
  headline: string;
  description: { text: string };
  employer: { name: string };
  workplace_address?: { municipality?: string };
  publication_date?: string;
  application_deadline?: string;
  application_url?: string;
  occupation?: { label?: string; concept_id?: string };
  occupation_group?: { label?: string; concept_id?: string };
  occupation_field?: { label?: string; concept_id?: string }; // NYTT: JobAd Links occupation_field
  source: string; // 'jobad-links', 'jobsearch', 'education-match'
}

const JOBLINKS_API = 'https://links.api.jobtechdev.se/joblinks';

export class MultiSourceAggregator {
  /**
   * Huvudfunktion: Aggregera jobb från alla källor
   */
  async aggregateJobs(params: AggregationParams): Promise<Job[]> {
    console.log('[Aggregator] Starting multi-source aggregation...');

    const allJobs: Job[] = [];
    const seenIds = new Set<string>();

    // ============================================================================
    // STRATEGI 1: Custom Query (Användaren har angett specifik sökning)
    // ============================================================================
    if (params.customQuery) {
      console.log(`[Aggregator] Using custom query: "${params.customQuery}"`);
      const customJobs = await this.fetchWithPagination({
        q: params.customQuery,
        limit: 100
      }, 10); // 10 pages = 1000 jobs max

      this.addUniqueJobs(allJobs, customJobs, seenIds, 'custom-query');
      console.log(`[Aggregator] Custom query: ${customJobs.length} jobs`);

      return allJobs.slice(0, params.maxTotalJobs);
    }

    // ============================================================================
    // STRATEGI 2: Primär yrkessökning med exakt yrkesnamn (från Taxonomy)
    // ============================================================================
    // KORREKT: JobAd Links API har INTE occupation-name parameter
    // Använder istället fritext-sökning (q) med exakt normaliserat yrkesnamn från Taxonomy
    // API:t använder ML för klassificering så fritext fungerar bra
    console.log(`[Aggregator] Primary occupation search: "${params.primaryOccupation}"`);

    const primaryJobs = await this.fetchWithPagination({
      q: `"${params.primaryOccupation}"`, // Exact phrase search med quotes
      limit: 100
    }, 15); // Max 1500 jobb

    this.addUniqueJobs(allJobs, primaryJobs, seenIds, 'primary-occupation');
    console.log(`[Aggregator] Primary occupation: ${primaryJobs.length} jobs (${allJobs.length} unique)`);

    // EARLY RETURN: Om vi har nog jobb, skippa bredare sökningar
    if (allJobs.length >= 500) {
      console.log(`[Aggregator] ✅ Found ${allJobs.length} jobs for primary occupation - skipping broader searches`);
      return allJobs.slice(0, params.maxTotalJobs);
    }

    // ============================================================================
    // STRATEGI 2B: occupation-group fallback (om för få occupation-field resultat)
    // ============================================================================
    // Om occupation-field gav <500 jobb, prova bredare occupation-group
    if (allJobs.length < 500 && params.taxonomyData?.occupationGroupId) {
      console.log(`[Aggregator] Only ${allJobs.length} occupation-field jobs - expanding with occupation-group: ${params.taxonomyData.occupationGroupId}`);

      const groupJobs = await this.fetchWithPagination({
        'occupation-group': params.taxonomyData.occupationGroupId,
        limit: 100
      }, 5); // Max 500 jobb från occupation-group

      this.addUniqueJobs(allJobs, groupJobs, seenIds, 'occupation-group');
      console.log(`[Aggregator] occupation-group: ${groupJobs.length} jobs (${allJobs.length} unique)`);
    }

    // ============================================================================
    // STRATEGI 3: Synonymer och alternativa titlar (CONDITIONAL)
    // ============================================================================
    // KÖR ENDAST om för få SSYK-jobb hittades (<300)
    if (allJobs.length < 300 && params.taxonomyData?.alternativeLabels?.length > 0) {
      console.log(`[Aggregator] Only ${allJobs.length} SSYK jobs - expanding with ${params.taxonomyData.alternativeLabels.length} synonyms...`);

      const synonymQuery = params.taxonomyData.alternativeLabels
        .slice(0, 5) // Max 5 synonymer
        .map((label: string) => `"${label}"`)
        .join(' OR ');

      const synonymJobs = await this.fetchWithPagination({
        q: synonymQuery,
        limit: 100
      }, 3); // Reducerat från 5 → 3 pages (300 jobb max)

      this.addUniqueJobs(allJobs, synonymJobs, seenIds, 'synonyms');
      console.log(`[Aggregator] Synonyms: ${synonymJobs.length} jobs (${allJobs.length} unique)`);
    }

    // ============================================================================
    // STRATEGI 4: Relaterade yrken (CONDITIONAL - lägre prioritet)
    // ============================================================================
    // KÖR ENDAST om fortfarande för få jobb (<500)
    if (allJobs.length < 500 && params.relatedOccupations.length > 0) {
      console.log(`[Aggregator] Only ${allJobs.length} jobs - adding ${params.relatedOccupations.length} related occupations...`);

      const relatedQuery = params.relatedOccupations
        .slice(0, 3) // Max 3 relaterade
        .map(occ => `"${occ}"`)
        .join(' OR ');

      const relatedJobs = await this.fetchWithPagination({
        q: relatedQuery,
        limit: 100
      }, 2); // Reducerat från 3 → 2 pages (200 jobb max)

      this.addUniqueJobs(allJobs, relatedJobs, seenIds, 'related-occupations');
      console.log(`[Aggregator] Related: ${relatedJobs.length} jobs (${allJobs.length} unique)`);
    }

    // ============================================================================
    // STRATEGI 5 & 6: REMOVED (Education & Fallback)
    // ============================================================================
    // Education-based och fallback searches har tagits bort för att:
    // 1. Utbildningssökning är för bred och ger låg relevans
    // 2. Fallback-sökning ger för många irrelevanta jobb
    // 3. Med bra SSYK-data + synonymer + related är dessa överflödiga
    // 4. Minskar processing tid och förbättrar relevans

    console.log(`[Aggregator] ✅ Total aggregated: ${allJobs.length} unique jobs from all sources`);
    return allJobs.slice(0, params.maxTotalJobs);
  }

  /**
   * Hämta jobb med pagination (upp till maxPages sidor)
   * NYTT: Använder JobAd Links API med occupation-field och occupation-group parametrar
   */
  private async fetchWithPagination(
    query: any,
    maxPages: number
  ): Promise<Job[]> {
    const LIMIT = 100;
    const allJobs: Job[] = [];

    for (let page = 0; page < maxPages; page++) {
      const offset = page * LIMIT;

      try {
        const queryParams = new URLSearchParams();

        // JobAd Links API parametrar (enligt dokumentation)
        // Stödda parametrar: occupation-field, occupation-group, municipality, region, country, q
        if (query['occupation-field']) queryParams.append('occupation-field', query['occupation-field']);
        if (query['occupation-group']) queryParams.append('occupation-group', query['occupation-group']);
        if (query.municipality) queryParams.append('municipality', query.municipality);
        if (query.region) queryParams.append('region', query.region);
        if (query.country) queryParams.append('country', query.country);
        if (query.q) queryParams.append('q', query.q);

        queryParams.append('limit', LIMIT.toString());
        queryParams.append('offset', offset.toString());

        const url = `${JOBLINKS_API}?${queryParams.toString()}`;
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          console.error(`[Aggregator] API error (${response.status}) at page ${page + 1}`);
          break;
        }

        const data = await response.json();
        const jobs = data.hits || [];

        if (jobs.length === 0) {
          console.log(`[Aggregator] No more results at page ${page + 1}`);
          break;
        }

        // Konvertera till internt format
        const convertedJobs = jobs.map((job: any) => this.convertToInternalFormat(job));
        allJobs.push(...convertedJobs);

        console.log(`[Aggregator] Page ${page + 1}/${maxPages}: ${jobs.length} jobs`);

        // Om vi fick färre än limit, vi har nått slutet
        if (jobs.length < LIMIT) {
          console.log(`[Aggregator] Reached end at page ${page + 1}`);
          break;
        }

        // Rate limiting: vänta lite mellan requests
        if (page < maxPages - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`[Aggregator] Error at page ${page + 1}:`, error);
        break;
      }
    }

    return allJobs;
  }

  /**
   * Lägg till unika jobb (undvik dubbletter)
   */
  private addUniqueJobs(
    allJobs: Job[],
    newJobs: Job[],
    seenIds: Set<string>,
    source: string
  ): void {
    let added = 0;
    for (const job of newJobs) {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push({ ...job, source });
        added++;
      }
    }
    console.log(`[Aggregator] Added ${added} unique jobs from ${source}`);
  }

  /**
   * Konvertera JobAd Links API-svar till internt format
   * JobAd Links response format skiljer sig från JobSearch API
   */
  private convertToInternalFormat(job: any): Job {
    // JobAd Links har både 'brief' (kort) och 'description.text' (full beskrivning)
    // Prioritera full beskrivning för bättre matchning och information
    const descriptionText = job.description?.text || job.brief || '';

    // workplace_addresses är en array i JobAd Links
    const workplaceAddress = Array.isArray(job.workplace_addresses) && job.workplace_addresses.length > 0
      ? job.workplace_addresses[0]
      : job.workplace_address;

    // source_links array innehåller ansökningslänkar från olika källor
    let applicationUrl = job.application_url || job.webpage_url;
    if (!applicationUrl && Array.isArray(job.source_links)) {
      const arbetsformedlingenLink = job.source_links.find((link: any) => link.source === 'arbetsformedlingen');
      applicationUrl = arbetsformedlingenLink?.url || job.source_links[0]?.url;
    }

    // JobAd Links har occupation_field (mer specifikt) och occupation_group (bredare)
    const occupationField = job.occupation_field || job.occupation;
    const occupationGroup = job.occupation_group;

    return {
      id: job.id,
      headline: job.headline || job.title || 'Okänd titel',
      description: { text: descriptionText },
      employer: { name: job.employer?.name || job.company || 'Okänd arbetsgivare' },
      workplace_address: workplaceAddress,
      publication_date: job.publication_date || job.published_at,
      application_deadline: job.application_deadline || job.deadline,
      application_url: applicationUrl,
      occupation: occupationField,
      occupation_group: occupationGroup,
      occupation_field: occupationField, // NYTT: Preserve occupation_field för scoring
      source: 'jobad-links'
    };
  }

  /**
   * Extrahera sökbart nyckelord från utbildning
   */
  private extractEducationKeyword(education: any): string | null {
    const degree = education.degree || '';
    const institution = education.institution || '';
    const description = education.description || '';

    const text = `${degree} ${institution} ${description}`.toLowerCase();

    // Vanliga utbildningskategorier
    const keywords = [
      'vvs', 'el', 'elektriker', 'bygg', 'snickare', 'data', 'it', 'systemvetenskap',
      'ekonomi', 'handel', 'företagsekonomi', 'redovisning', 'juridik', 'jur.kand',
      'sjuksköterska', 'vård', 'omvårdnad', 'läkare', 'medicin', 'lärare', 'pedagogik'
    ];

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return keyword;
      }
    }

    // Om inget nyckelord hittades, returnera degree om det finns
    return degree.length > 3 ? degree : null;
  }
}
