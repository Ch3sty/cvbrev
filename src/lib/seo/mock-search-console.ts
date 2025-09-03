// Mock version för build-kompatibilitet

export interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface KeywordData extends SearchConsoleData {
  query: string;
}

export interface PagePerformanceData extends SearchConsoleData {
  page: string;
}

export class SearchConsoleMock {
  constructor() {
    // Mock constructor
  }

  async getSearchAnalytics(dateRange: {start: string, end: string}) {
    return {
      clicks: Math.floor(Math.random() * 5000) + 1000,
      impressions: Math.floor(Math.random() * 50000) + 10000,
      ctr: Math.floor(Math.random() * 10) + 2,
      position: Math.floor(Math.random() * 20) + 5,
    };
  }

  async getTopKeywords(dateRange: {start: string, end: string}, limit: number = 20): Promise<KeywordData[]> {
    return Array.from({length: Math.min(limit, 20)}, (_, i) => ({
      query: `keyword ${i + 1}`,
      clicks: Math.floor(Math.random() * 100) + 10,
      impressions: Math.floor(Math.random() * 1000) + 100,
      ctr: Math.floor(Math.random() * 15) + 2,
      position: Math.floor(Math.random() * 30) + 1,
    }));
  }

  async getPagePerformance(pageOrDateRange: string | {start: string, end: string}, limitOrDateRange?: number | {start: string, end: string}): Promise<PagePerformanceData | PagePerformanceData[]> {
    // Handle both call signatures: getPagePerformance(page, dateRange) and getPagePerformance(dateRange, limit)
    if (typeof pageOrDateRange === 'string') {
      // Called with specific page
      const page = pageOrDateRange;
      return {
        page,
        clicks: Math.floor(Math.random() * 50) + 5,
        impressions: Math.floor(Math.random() * 500) + 50,
        ctr: Math.floor(Math.random() * 12) + 3,
        position: Math.floor(Math.random() * 25) + 1,
      };
    } else {
      // Called with dateRange and optional limit
      const limit = typeof limitOrDateRange === 'number' ? limitOrDateRange : 20;
      return Array.from({length: Math.min(limit, 20)}, (_, i) => ({
        page: `/page-${i + 1}`,
        clicks: Math.floor(Math.random() * 50) + 5,
        impressions: Math.floor(Math.random() * 500) + 50,
        ctr: Math.floor(Math.random() * 12) + 3,
        position: Math.floor(Math.random() * 25) + 1,
      }));
    }
  }

  async getIndexingStatus(pages: string[]) {
    return pages.map(page => ({
      page,
      indexed: Math.random() > 0.2,
      lastCrawled: new Date().toISOString(),
      crawlErrors: Math.random() > 0.9 ? ['No mobile version detected'] : [],
    }));
  }

  async getKeywordRanking(keyword: string) {
    return {
      keyword,
      position: Math.floor(Math.random() * 50) + 1,
      clicks: Math.floor(Math.random() * 100) + 10,
      impressions: Math.floor(Math.random() * 1000) + 100,
      ctr: Math.floor(Math.random() * 15) + 2,
      searchVolume: Math.floor(Math.random() * 5000) + 100,
      difficulty: Math.floor(Math.random() * 100) + 1,
      url: `https://example.com/${keyword.replace(/\s+/g, '-')}`,
      serpFeatures: {
        featured_snippet: Math.random() > 0.8,
        local_pack: Math.random() > 0.9,
        knowledge_panel: Math.random() > 0.7,
        image_pack: Math.random() > 0.6,
      },
    };
  }
}

export const searchConsole = new SearchConsoleMock();