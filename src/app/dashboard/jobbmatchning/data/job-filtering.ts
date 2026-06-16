// Klientsidig filtrering & sortering av redan hämtade jobb.
//
// En jobbsökning hämtar upp till 600 jobb där varje jobb bär all data som
// behövs för att filtrera/sortera lokalt. Genom att göra det i webbläsaren
// slipper vi söka om mot servern vid varje filterändring (vilket annars brände
// gratisanvändarnas sökkvot och gav onödig latens).
//
// OBS: `remote` (distansjobb) och `noExperience` hanteras INTE här — de finns
// inte som tillförlitliga fält på jobben utan kommer från den globala cachen.
import type { JobFilters } from '../components/JobFilterPanel';

// Jobb-formen är löst typad (any från edge-svaret); vi plockar bara fälten vi behöver.
type Job = Record<string, any>;

// Concept_id är källan till sanning för heltid/deltid; label som fallback.
function matchesWorktime(job: Job, conceptId: string): boolean {
  const wht = job.working_hours_type;
  if (!wht) return false;
  if (wht.concept_id) return wht.concept_id === conceptId;
  return false;
}

function publishedWithin(job: Job, minutes: number): boolean {
  const ts = Date.parse(job.publication_date);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= minutes * 60_000;
}

// Ortsfiltret matchar på kommunkod (municipality_code, t.ex. "0184").
function matchesMunicipality(job: Job, codes: string[]): boolean {
  const code = job.workplace_address?.municipality_code;
  if (!code) return false;
  return codes.includes(code);
}

/**
 * Filtrera + sortera jobb klientsidigt enligt valda filter.
 * `showDistantJobs` styr om jobb >100 km bort tas med (separat toggle i UI:t).
 * Filter som hanteras: worktimeExtent, publishedAfterMinutes, municipality[],
 * sort, samt distans. remote/noExperience hanteras utanför denna funktion.
 */
export function applyClientFilters(
  jobs: Job[],
  filters: JobFilters,
  showDistantJobs: boolean
): Job[] {
  let result = jobs;

  // Distans: dölj jobb >100 km om inte användaren bett om att se dem.
  if (!showDistantJobs) {
    result = result.filter((j) => !j.distance || j.distance <= 100);
  }

  if (filters.worktimeExtent) {
    result = result.filter((j) => matchesWorktime(j, filters.worktimeExtent));
  }

  if (filters.publishedAfterMinutes > 0) {
    result = result.filter((j) => publishedWithin(j, filters.publishedAfterMinutes));
  }

  if (filters.municipality.length > 0) {
    result = result.filter((j) => matchesMunicipality(j, filters.municipality));
  }

  // Sortering. Tom sträng = relevans (behåll serverns ordning).
  if (filters.sort === 'pubdate-desc') {
    result = [...result].sort(
      (a, b) => (Date.parse(b.publication_date) || 0) - (Date.parse(a.publication_date) || 0)
    );
  } else if (filters.sort === 'applydate-asc') {
    // Tidigast deadline först; jobb utan deadline hamnar sist.
    result = [...result].sort((a, b) => {
      const da = Date.parse(a.application_deadline) || Infinity;
      const db = Date.parse(b.application_deadline) || Infinity;
      return da - db;
    });
  }

  return result;
}

// ── Ortgruppering: region → kommun, med antal ur faktisk jobbdata ──────────
export interface MunicipalityCount {
  code: string;   // municipality_code, t.ex. "0184"
  name: string;   // "Solna"
  count: number;
}
export interface RegionGroup {
  code: string;   // region_code, t.ex. "01" (eller "__unknown")
  name: string;   // "Stockholms län" (eller "Okänd ort")
  count: number;  // totalt antal jobb i regionen
  municipalities: MunicipalityCount[]; // kommuner med jobb, sorterade efter flest
}

const UNKNOWN_REGION = '__unknown';

/**
 * Gruppera jobb på region → kommun med antal. Regioner sorteras efter flest
 * jobb; kommuner inom varje region likadant. Jobb utan ort hamnar i en
 * "Okänd ort"-grupp sist. Antalen speglar EXAKT de hämtade jobben (inte hela
 * Sverige) så användaren ser var jobben faktiskt finns.
 */
export function groupJobsByRegion(jobs: Job[]): RegionGroup[] {
  const regions = new Map<string, { name: string; munis: Map<string, MunicipalityCount> }>();

  for (const job of jobs) {
    const addr = job.workplace_address || {};
    const regionCode = addr.region_code || UNKNOWN_REGION;
    const regionName = addr.region || 'Okänd ort';
    const muniCode = addr.municipality_code || UNKNOWN_REGION;
    const muniName = addr.municipality || 'Okänd ort';

    if (!regions.has(regionCode)) {
      regions.set(regionCode, { name: regionName, munis: new Map() });
    }
    const region = regions.get(regionCode)!;
    const existing = region.munis.get(muniCode);
    if (existing) {
      existing.count++;
    } else {
      region.munis.set(muniCode, { code: muniCode, name: muniName, count: 1 });
    }
  }

  const groups: RegionGroup[] = Array.from(regions.entries()).map(([code, r]) => {
    const municipalities = Array.from(r.munis.values()).sort((a, b) => b.count - a.count);
    const count = municipalities.reduce((sum, m) => sum + m.count, 0);
    return { code, name: r.name, count, municipalities };
  });

  // Sortera efter flest jobb, men tryck ner "Okänd ort"-gruppen sist.
  groups.sort((a, b) => {
    if (a.code === UNKNOWN_REGION) return 1;
    if (b.code === UNKNOWN_REGION) return -1;
    return b.count - a.count;
  });

  return groups;
}

// ── Globala pooler (remote / erfarenhet-fria): konvertera + ranka mot CV ───
// De globala jobben är RÅA JobSearch-hits. Vi mappar dem till samma form som
// CV-jobben (så JobCard funkar) och ger en lätt relevanspoäng mot användarens
// ort + skills — utan att anropa servern. Detta ersätter den tidigare
// server-omsökningen för "Distansjobb" och "Utan erfarenhet".

// Haversine i km (samma formel som edge-scoring).
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface CvContext {
  skills?: string[];
  lat?: number | null;
  lon?: number | null;
}

/**
 * Mappa råa JobSearch-hits (från global_job_cache) till samma jobbform som
 * match-jobs returnerar, och ranka lätt mot CV-kontexten. Returnerar jobb
 * sorterade efter relevans (bäst först).
 */
export function rankGlobalJobs(rawJobs: any[], cv: CvContext): Job[] {
  const cvSkills = (cv.skills || []).map((s) => s.toLowerCase());

  const mapped = rawJobs.map((job) => {
    const coords = job.workplace_address?.coordinates; // [lon, lat] i JobSearch
    let distance: number | undefined;
    if (
      coords && coords.length === 2 &&
      Number.isFinite(cv.lat) && Number.isFinite(cv.lon)
    ) {
      // JobSearch ger [lon, lat]; vår distanceKm tar (lat, lon).
      distance = distanceKm(cv.lat as number, cv.lon as number, coords[1], coords[0]);
    }

    // Lätt skills-överlapp mot jobbtext + must_have (0–15).
    const haystack = `${job.headline || ''} ${job.description?.text || ''}`.toLowerCase();
    const mustHave = (job.must_have?.skills || []).map((s: any) => (s.label || '').toLowerCase());
    let skillHits = 0;
    for (const s of cvSkills) {
      if (!s) continue;
      if (mustHave.some((m: string) => m.includes(s)) || haystack.includes(s)) skillHits++;
    }
    const skillScore = Math.min(15, skillHits * 3);

    // Geografipoäng (0–10) — närmare = bättre; okänt avstånd ger neutral poäng.
    let geoScore = 5;
    if (distance !== undefined) {
      geoScore = distance <= 10 ? 10 : distance <= 30 ? 8 : distance <= 50 ? 6 : distance <= 100 ? 3 : 1;
    }

    return {
      ...job,
      distance,
      relevance: skillScore + geoScore, // 0–25; bara för ordning i denna vy
    };
  });

  mapped.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  return mapped;
}
