/**
 * Cache Manager
 *
 * Centraliserad cache-hantering för alla API-anrop med olika cache-strategier.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  ttlMs: number; // Time to live i millisekunder
  maxSize?: number; // Max antal entries
}

export class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private hits = 0;
  private misses = 0;

  constructor(config: CacheConfig) {
    this.config = {
      maxSize: 1000, // Default max 1000 entries
      ...config
    };
  }

  /**
   * Hämta från cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Kolla om expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data;
  }

  /**
   * Sätt i cache
   */
  set(key: string, data: T): void {
    const now = Date.now();

    // Om cache är full, ta bort äldsta entry
    if (this.cache.size >= (this.config.maxSize || 1000)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.config.ttlMs
    });
  }

  /**
   * Hämta eller sätt (get-or-fetch pattern)
   */
  async getOrFetch(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data);
    return data;
  }

  /**
   * Ta bort äldsta entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Rensa expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Rensa all cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Hämta cache-statistik
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(1) + '%',
      maxSize: this.config.maxSize
    };
  }
}

/**
 * Skapa standard caches för olika API:er
 */
export function createStandardCaches() {
  return {
    // Taxonomy: 7 dagar (ändras sällan)
    taxonomy: new CacheManager({
      ttlMs: 7 * 24 * 60 * 60 * 1000,
      maxSize: 500
    }),

    // Jobs: 1 dag (uppdateras ofta)
    jobs: new CacheManager({
      ttlMs: 24 * 60 * 60 * 1000,
      maxSize: 2000
    }),

    // Enrichments: 1 dag
    enrichments: new CacheManager({
      ttlMs: 24 * 60 * 60 * 1000,
      maxSize: 2000
    }),

    // JobEd Connect: 7 dagar
    jobEdConnect: new CacheManager({
      ttlMs: 7 * 24 * 60 * 60 * 1000,
      maxSize: 300
    }),

    // Historical: 30 dagar (historisk data ändras inte)
    historical: new CacheManager({
      ttlMs: 30 * 24 * 60 * 60 * 1000,
      maxSize: 200
    }),

    // User CV Analysis: 1 timme (för snabbare återbesök)
    cvAnalysis: new CacheManager({
      ttlMs: 60 * 60 * 1000,
      maxSize: 100
    })
  };
}

/**
 * Global singleton för caches
 */
let globalCaches: ReturnType<typeof createStandardCaches> | null = null;

export function getCaches(): ReturnType<typeof createStandardCaches> {
  if (!globalCaches) {
    globalCaches = createStandardCaches();
  }
  return globalCaches;
}

/**
 * Periodisk cleanup (kör var 5:e minut)
 */
export function startPeriodicCleanup(intervalMs = 5 * 60 * 1000): void {
  setInterval(() => {
    const caches = getCaches();

    const taxonomyCleaned = caches.taxonomy.cleanup();
    const jobsCleaned = caches.jobs.cleanup();
    const enrichmentsCleaned = caches.enrichments.cleanup();
    const jobEdCleaned = caches.jobEdConnect.cleanup();
    const historicalCleaned = caches.historical.cleanup();
    const cvCleaned = caches.cvAnalysis.cleanup();

    const total = taxonomyCleaned + jobsCleaned + enrichmentsCleaned +
                  jobEdCleaned + historicalCleaned + cvCleaned;

    if (total > 0) {
      console.log(`[Cache] Cleaned ${total} expired entries`);
    }
  }, intervalMs);
}

/**
 * Logga cache-statistik
 */
export function logCacheStats(): void {
  const caches = getCaches();

  console.log('[Cache Stats]');
  console.log('  Taxonomy:', caches.taxonomy.getStats());
  console.log('  Jobs:', caches.jobs.getStats());
  console.log('  Enrichments:', caches.enrichments.getStats());
  console.log('  JobEd Connect:', caches.jobEdConnect.getStats());
  console.log('  Historical:', caches.historical.getStats());
  console.log('  CV Analysis:', caches.cvAnalysis.getStats());
}
