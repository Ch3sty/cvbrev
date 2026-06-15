/**
 * Multi-Source Job Aggregator
 *
 * Aggregerar jobb från JobSearch API (Platsbanken):
 * - Fullständiga jobbannonser med description.text, requirements, conditions
 * - Strukturerad occupation data (occupation_field, occupation_group)
 * - Stöd för occupation-name parameter (exakt concept_id matching)
 * - must_have och nice_to_have krav
 */ const JOBSEARCH_API = 'https://jobsearch.api.jobtechdev.se/search';

// Timeout per JobSearch-anrop (ms) så ett hängande API inte fryser funktionen.
const JOBSEARCH_FETCH_TIMEOUT = 10000;

export class MultiSourceAggregator {
  hasLoggedDescription = false;
  // Absolut deadline (Date.now()-bas) då aggregering ska sluta paginera.
  aggregationDeadline = Infinity;
  // Användarvalda filter som appliceras på ALLA sök-strategier (sätts i
  // aggregateJobs, läses i fetchWithPagination). Tomt objekt = inga filter.
  searchFilters = {};
  /**
   * Huvudfunktion: Aggregera jobb från alla källor.
   * params.deadlineMs sätter en wall-clock-budget för aggregeringen så att
   * den aldrig drar iväg mot edge-funktionens 150s-timeout.
   * params.filters = { remote, worktimeExtent, noExperience,
   *   publishedAfterMinutes, sort, position, positionRadius, municipality }
   */ async aggregateJobs(params) {
    this.aggregationDeadline = params.deadlineMs ?? Infinity;
    this.searchFilters = params.filters || {};
    console.log('[Aggregator] Starting multi-source aggregation...');
    const allJobs = [];
    const seenIds = new Set();
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
    // STRATEGI 2: Primär yrkessökning med occupation-name (concept_id)
    // ============================================================================
    // JobSearch API stödjer occupation-name parameter med concept_id från Taxonomy
    console.log(`[Aggregator] Primary occupation search: "${params.primaryOccupation}" (concept_id: ${params.taxonomyData?.conceptId})`);
    let primaryJobs = [];
    // Prova först med occupation-name om vi har concept_id
    if (params.taxonomyData?.conceptId) {
      primaryJobs = await this.fetchWithPagination({
        'occupation-name': [
          params.taxonomyData.conceptId
        ],
        limit: 100
      }, 20); // Max 2000 jobb (20 pages × 100, JobSearch max offset 2000)
      console.log(`[Aggregator] occupation-name search: ${primaryJobs.length} jobs`);
    }
    // Fallback till fritext om occupation-name gav 0 resultat
    if (primaryJobs.length === 0) {
      console.log(`[Aggregator] No jobs from occupation-name, trying freetext search...`);
      primaryJobs = await this.fetchWithPagination({
        q: `"${params.primaryOccupation}"`,
        limit: 100
      }, 10); // Max 1000 jobb via fritext
    }
    this.addUniqueJobs(allJobs, primaryJobs, seenIds, 'primary-occupation');
    console.log(`[Aggregator] Primary occupation: ${primaryJobs.length} jobs (${allJobs.length} unique)`);
    // Extrahera occupation_field och occupation_group från första jobbet
    if (primaryJobs.length > 0 && !params.taxonomyData.occupationFieldId) {
      const firstJob = primaryJobs[0];
      if (firstJob.occupation_field?.concept_id) {
        params.taxonomyData.occupationFieldId = firstJob.occupation_field.concept_id;
        console.log(`[Aggregator] Extracted occupation-field: ${firstJob.occupation_field.label} (${firstJob.occupation_field.concept_id})`);
      }
      if (firstJob.occupation_group?.concept_id) {
        params.taxonomyData.occupationGroupId = firstJob.occupation_group.concept_id;
        console.log(`[Aggregator] Extracted occupation-group: ${firstJob.occupation_group.label} (${firstJob.occupation_group.concept_id})`);
      }
    }
    // EARLY RETURN: Om vi har nog jobb, skippa bredare sökningar
    if (allJobs.length >= 500) {
      console.log(`[Aggregator] ✅ Found ${allJobs.length} jobs for primary occupation - skipping broader searches`);
      return allJobs.slice(0, params.maxTotalJobs);
    }
    // ============================================================================
    // STRATEGI 2B: occupation-group expansion (mellan-nivå)
    // ============================================================================
    if (allJobs.length < 500 && params.taxonomyData?.occupationGroupId) {
      console.log(`[Aggregator] Only ${allJobs.length} jobs - expanding with occupation-group: ${params.taxonomyData.occupationGroupId}`);
      const groupJobs = await this.fetchWithPagination({
        'occupation-group': [
          params.taxonomyData.occupationGroupId
        ],
        limit: 100
      }, 10); // Max 1000 jobb
      this.addUniqueJobs(allJobs, groupJobs, seenIds, 'occupation-group');
      console.log(`[Aggregator] occupation-group: ${groupJobs.length} jobs (${allJobs.length} unique)`);
    }
    // ============================================================================
    // STRATEGI 2C: occupation-field expansion (bredast nivå)
    // ============================================================================
    if (allJobs.length < 1000 && params.taxonomyData?.occupationFieldId) {
      console.log(`[Aggregator] Only ${allJobs.length} jobs - expanding with occupation-field: ${params.taxonomyData.occupationFieldId}`);
      const fieldJobs = await this.fetchWithPagination({
        'occupation-field': [
          params.taxonomyData.occupationFieldId
        ],
        limit: 100
      }, 10); // Max 1000 jobb
      this.addUniqueJobs(allJobs, fieldJobs, seenIds, 'occupation-field');
      console.log(`[Aggregator] occupation-field: ${fieldJobs.length} jobs (${allJobs.length} unique)`);
    }
    // ============================================================================
    // STRATEGI 3: Synonymer och alternativa titlar (CONDITIONAL)
    // ============================================================================
    // KÖR ENDAST om för få SSYK-jobb hittades (<300)
    if (allJobs.length < 300 && params.taxonomyData?.alternativeLabels?.length > 0) {
      console.log(`[Aggregator] Only ${allJobs.length} SSYK jobs - expanding with ${params.taxonomyData.alternativeLabels.length} synonyms...`);
      const synonymQuery = params.taxonomyData.alternativeLabels.slice(0, 5) // Max 5 synonymer
      .map((label)=>`"${label}"`).join(' OR ');
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
      const relatedQuery = params.relatedOccupations.slice(0, 3) // Max 3 relaterade
      .map((occ)=>`"${occ}"`).join(' OR ');
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
   * Använder JobSearch API med occupation-name, occupation-field, occupation-group parametrar
   */ async fetchWithPagination(query, maxPages) {
    const LIMIT = 100;
    const MAX_OFFSET = 2000; // JobSearch API constraint
    const allJobs = [];
    for(let page = 0; page < maxPages; page++){
      const offset = page * LIMIT;
      // JobSearch API max offset är 2000
      if (offset >= MAX_OFFSET) {
        console.log(`[Aggregator] Reached max offset (2000) at page ${page + 1}`);
        break;
      }
      // Tidsbudget: sluta paginera om aggregeringen passerat sin deadline.
      if (Date.now() >= this.aggregationDeadline) {
        console.warn(`[Aggregator] ⏱️ Deadline nådd - stoppar pagination vid sida ${page + 1} (${allJobs.length} jobb hittills)`);
        break;
      }
      try {
        const queryParams = new URLSearchParams();
        // JobSearch API parametrar
        // occupation-name, occupation-field, occupation-group kan vara arrays
        if (query['occupation-name']) {
          const names = Array.isArray(query['occupation-name']) ? query['occupation-name'] : [
            query['occupation-name']
          ];
          names.forEach((n)=>queryParams.append('occupation-name', n));
        }
        if (query['occupation-field']) {
          const fields = Array.isArray(query['occupation-field']) ? query['occupation-field'] : [
            query['occupation-field']
          ];
          fields.forEach((f)=>queryParams.append('occupation-field', f));
        }
        if (query['occupation-group']) {
          const groups = Array.isArray(query['occupation-group']) ? query['occupation-group'] : [
            query['occupation-group']
          ];
          groups.forEach((g)=>queryParams.append('occupation-group', g));
        }
        // Geografiska parametrar
        if (query.municipality) {
          const munis = Array.isArray(query.municipality) ? query.municipality : [
            query.municipality
          ];
          munis.forEach((m)=>queryParams.append('municipality', m));
        }
        if (query.region) {
          const regions = Array.isArray(query.region) ? query.region : [
            query.region
          ];
          regions.forEach((r)=>queryParams.append('region', r));
        }
        if (query.country) queryParams.append('country', query.country);
        // Fritext
        if (query.q) queryParams.append('q', query.q);
        // ── Användarvalda filter (gäller alla sök-strategier) ──────────────
        // Sätts i aggregateJobs från request.filters. Tomt objekt = inga filter.
        const f = this.searchFilters || {};
        if (f.remote === true) queryParams.append('remote', 'true');
        if (f.noExperience === true) queryParams.append('experience', 'false');
        if (f.worktimeExtent) queryParams.append('worktime-extent', f.worktimeExtent);
        if (f.sort) queryParams.append('sort', f.sort);
        if (Number.isFinite(f.publishedAfterMinutes) && f.publishedAfterMinutes > 0) {
          queryParams.append('published-after', String(f.publishedAfterMinutes));
        }
        // Geo-radie: position "lat,lon" + radie i km. Endast om ingen explicit
        // ort/kommun valts via query (occupation-search skickar inte position).
        if (f.position && Number.isFinite(f.positionRadius) && f.positionRadius > 0) {
          queryParams.append('position', f.position);
          queryParams.append('position.radius', String(f.positionRadius));
        }
        // Användarvalda orter (concept_ids) – läggs till utöver query.municipality.
        if (f.municipality) {
          const fMunis = Array.isArray(f.municipality) ? f.municipality : [f.municipality];
          fMunis.forEach((m)=>queryParams.append('municipality', m));
        }
        queryParams.append('limit', LIMIT.toString());
        queryParams.append('offset', offset.toString());
        const url = `${JOBSEARCH_API}?${queryParams.toString()}`;
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(JOBSEARCH_FETCH_TIMEOUT)
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
        const convertedJobs = jobs.map((job)=>this.convertToInternalFormat(job));
        allJobs.push(...convertedJobs);
        console.log(`[Aggregator] Page ${page + 1}/${maxPages}: ${jobs.length} jobs (total: ${allJobs.length})`);
        // Fortsätt hämta nästa sida även om vi fick < 100 resultat
        // Stoppar endast när jobs.length === 0 (check ovan)
        // Rate limiting: vänta lite mellan requests
        if (page < maxPages - 1) {
          await new Promise((resolve)=>setTimeout(resolve, 100));
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
   */ addUniqueJobs(allJobs, newJobs, seenIds, source) {
    let added = 0;
    for (const job of newJobs){
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push({
          ...job,
          source
        });
        added++;
      }
    }
    console.log(`[Aggregator] Added ${added} unique jobs from ${source}`);
  }
  /**
   * Konvertera JobSearch API-svar till internt format
   * JobSearch returnerar redan strukturerad data - minimal transformation krävs
   */ convertToInternalFormat(job) {
    // JobSearch har redan rätt struktur!
    // Säkerställ att description finns (kan vara null för vissa jobb)
    const description = job.description || {
      text: '',
      text_formatted: '',
      company_information: '',
      needs: '',
      requirements: '',
      conditions: ''
    };
    // Debug log first job
    if (!this.hasLoggedDescription) {
      console.log('[Aggregator] JobSearch response structure:', {
        hasDescription: !!job.description,
        hasDescriptionText: !!job.description?.text,
        textLength: job.description?.text?.length || 0,
        hasMustHave: !!job.must_have,
        mustHaveSkills: job.must_have?.skills?.length || 0,
        hasNiceToHave: !!job.nice_to_have
      });
      this.hasLoggedDescription = true;
    }
    return {
      id: job.id,
      headline: job.headline || 'Okänd titel',
      description,
      employer: job.employer || {
        name: 'Okänd arbetsgivare'
      },
      workplace_address: job.workplace_address,
      publication_date: job.publication_date,
      application_deadline: job.application_deadline,
      application_details: job.application_details,
      application_contacts: job.application_contacts,
      logo_url: job.logo_url,
      webpage_url: job.webpage_url,
      number_of_vacancies: job.number_of_vacancies,
      employment_type: job.employment_type,
      duration: job.duration,
      working_hours_type: job.working_hours_type,
      scope_of_work: job.scope_of_work,
      salary_type: job.salary_type,
      salary_description: job.salary_description,
      access: job.access,
      occupation: job.occupation,
      occupation_group: job.occupation_group,
      occupation_field: job.occupation_field,
      must_have: job.must_have,
      nice_to_have: job.nice_to_have,
      experience_required: job.experience_required,
      driving_license_required: job.driving_license_required,
      driving_license: job.driving_license,
      access_to_own_car: job.access_to_own_car,
      source: 'jobsearch'
    };
  }
  /**
   * Extrahera sökbart nyckelord från utbildning
   */ extractEducationKeyword(education) {
    const degree = education.degree || '';
    const institution = education.institution || '';
    const description = education.description || '';
    const text = `${degree} ${institution} ${description}`.toLowerCase();
    // Vanliga utbildningskategorier
    const keywords = [
      'vvs',
      'el',
      'elektriker',
      'bygg',
      'snickare',
      'data',
      'it',
      'systemvetenskap',
      'ekonomi',
      'handel',
      'företagsekonomi',
      'redovisning',
      'juridik',
      'jur.kand',
      'sjuksköterska',
      'vård',
      'omvårdnad',
      'läkare',
      'medicin',
      'lärare',
      'pedagogik'
    ];
    for (const keyword of keywords){
      if (text.includes(keyword)) {
        return keyword;
      }
    }
    // Om inget nyckelord hittades, returnera degree om det finns
    return degree.length > 3 ? degree : null;
  }
}
