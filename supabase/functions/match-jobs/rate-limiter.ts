/**
 * Rate Limiter
 *
 * Begränsar antal API-anrop per tidsenhet för att undvika att överbelasta
 * Arbetsförmedlingens API:er.
 */

export interface RateLimiterConfig {
  maxRequests: number; // Max antal requests
  timeWindowMs: number; // Tidsfönster i millisekunder
  retryDelayMs?: number; // Fördröjning vid retry
}

export class RateLimiter {
  private requests: number[] = []; // Timestamps för requests
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = {
      retryDelayMs: 1000, // Default 1s retry
      ...config
    };
  }

  /**
   * Vänta tills det är OK att göra en request
   */
  async waitForSlot(): Promise<void> {
    const now = Date.now();

    // Ta bort gamla requests utanför tidsfönstret
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.config.timeWindowMs
    );

    // Om vi är under gränsen, kör direkt
    if (this.requests.length < this.config.maxRequests) {
      this.requests.push(now);
      return;
    }

    // Annars vänta tills nästa slot blir tillgänglig
    const oldestRequest = this.requests[0];
    const waitTime = this.config.timeWindowMs - (now - oldestRequest);

    if (waitTime > 0) {
      console.log(`[RateLimiter] Waiting ${waitTime}ms for available slot...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForSlot(); // Försök igen
    }
  }

  /**
   * Kör en funktion med rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();
    return fn();
  }

  /**
   * Batch-exekvering med rate limiting
   */
  async executeBatch<T>(
    items: any[],
    fn: (item: any) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];

    for (const item of items) {
      const result = await this.execute(() => fn(item));
      results.push(result);
    }

    return results;
  }

  /**
   * Återställ rate limiter (för testing)
   */
  reset(): void {
    this.requests = [];
  }
}

/**
 * Skapa standard rate limiters för olika API:er
 */
export function createStandardRateLimiters() {
  return {
    taxonomy: new RateLimiter({
      maxRequests: 10,
      timeWindowMs: 1000 // 10 requests per sekund
    }),

    jobAdLinks: new RateLimiter({
      maxRequests: 10,
      timeWindowMs: 1000
    }),

    enrichments: new RateLimiter({
      maxRequests: 10,
      timeWindowMs: 1000
    }),

    jobEdConnect: new RateLimiter({
      maxRequests: 10,
      timeWindowMs: 1000
    }),

    historical: new RateLimiter({
      maxRequests: 5, // Lägre för historical (mindre kritisk)
      timeWindowMs: 1000
    })
  };
}

/**
 * Global singleton för rate limiters
 */
let globalRateLimiters: ReturnType<typeof createStandardRateLimiters> | null = null;

export function getRateLimiters(): ReturnType<typeof createStandardRateLimiters> {
  if (!globalRateLimiters) {
    globalRateLimiters = createStandardRateLimiters();
  }
  return globalRateLimiters;
}
