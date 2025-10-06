/**
 * JobAd Links API Integration
 *
 * Integrerar med Arbetsförmedlingens JobAd Links API för att få tillgång till
 * HELA den svenska arbetsmarknaden (LinkedIn, Indeed, StepStone, Blocket Jobb, etc.)
 *
 * API Docs: https://jobad-links.api.jobtechdev.se
 */

export interface JobAdLinksJob {
  id: string;
  headline: string;
  description: {
    text: string;
    text_formatted?: string;
  };
  employer: {
    name: string;
    workplace?: string;
  };
  workplace_address?: {
    municipality?: string;
    region?: string;
    country?: string;
    coordinates?: [number, number];
  };
  occupation?: {
    label: string;
    concept_id?: string;
  };
  occupation_group?: {
    label: string;
    concept_id?: string;
  };
  scope_of_work?: {
    min?: number;
    max?: number;
  };
  publication_date: string;
  application_deadline?: string;
  application_details?: {
    url?: string;
    email?: string;
  };
  source_type?: string; // "linkedin", "indeed", "stepstone", etc.
}

export interface JobAdLinksSearchParams {
  q?: string; // Free text search
  occupation?: string; // SSYK code or occupation name
  skill?: string; // Specific skill
  region?: string; // Region name or code
  municipality?: string; // Municipality name
  country?: string; // Country code (default: "se")
  published_after?: string; // ISO date
  published_before?: string; // ISO date
  limit?: number; // Max results (default: 10, max: 100)
  offset?: number; // Pagination offset
}

const BASE_URL = 'https://jobsearch.api.jobtechdev.se/search';

/**
 * Sök jobb via JobAd Links API
 */
export async function searchJobAdLinks(
  params: JobAdLinksSearchParams
): Promise<JobAdLinksJob[]> {
  try {
    // Bygg query params
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.occupation) queryParams.append('occupation', params.occupation);
    if (params.skill) queryParams.append('skill', params.skill);
    if (params.region) queryParams.append('region', params.region);
    if (params.municipality) queryParams.append('municipality', params.municipality);
    if (params.country) queryParams.append('country', params.country);
    if (params.published_after) queryParams.append('published-after', params.published_after);
    if (params.published_before) queryParams.append('published-before', params.published_before);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const url = `${BASE_URL}?${queryParams.toString()}`;
    console.log('[JobAd Links] Fetching:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[JobAd Links] API error (${response.status})`);
      return [];
    }

    const data = await response.json();
    const jobs = data.hits || [];

    console.log(`[JobAd Links] Found ${jobs.length} jobs`);
    return jobs;

  } catch (error) {
    console.error('[JobAd Links] Error:', error);
    return [];
  }
}

/**
 * Multi-query sökning med parallella requests
 */
export async function searchJobAdLinksMultiQuery(
  queries: JobAdLinksSearchParams[]
): Promise<JobAdLinksJob[]> {
  console.log(`[JobAd Links] Running ${queries.length} parallel queries...`);

  const results = await Promise.allSettled(
    queries.map(q => searchJobAdLinks(q))
  );

  const allJobs: JobAdLinksJob[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
      console.log(`[JobAd Links] Query ${index + 1}: ${result.value.length} jobs`);
    } else {
      console.error(`[JobAd Links] Query ${index + 1} failed:`, result.reason);
    }
  });

  // Deduplicera baserat på ID
  const uniqueJobs = deduplicateJobs(allJobs);
  console.log(`[JobAd Links] Total after dedup: ${uniqueJobs.length} jobs`);

  return uniqueJobs;
}

/**
 * Ta bort dubbletter (samma jobb från olika källor)
 */
function deduplicateJobs(jobs: JobAdLinksJob[]): JobAdLinksJob[] {
  const seen = new Map<string, JobAdLinksJob>();

  for (const job of jobs) {
    // Använd ID som primär nyckel
    if (!seen.has(job.id)) {
      seen.set(job.id, job);
    }
  }

  return Array.from(seen.values());
}

/**
 * Konvertera JobAdLinksJob till vårt interna format (kompatibelt med befintlig kod)
 */
export function convertToInternalFormat(job: JobAdLinksJob): any {
  return {
    id: job.id,
    headline: job.headline,
    description: {
      text: job.description.text,
      text_formatted: job.description.text_formatted
    },
    employer: {
      name: job.employer.name,
      workplace: job.employer.workplace
    },
    workplace_address: job.workplace_address,
    occupation: job.occupation,
    occupation_group: job.occupation_group,
    scope_of_work: job.scope_of_work,
    publication_date: job.publication_date,
    application_deadline: job.application_deadline,
    application_details: job.application_details,
    source_type: job.source_type || 'jobad-links',

    // Legacy fields för bakåtkompatibilitet
    location: job.workplace_address?.municipality || job.workplace_address?.region || '',
    company: job.employer.name,
    published: job.publication_date
  };
}
