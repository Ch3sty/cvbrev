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

  async getPagePerformance(dateRange: {start: string, end: string}, limit: number = 20): Promise<PagePerformanceData[]> {
    return Array.from({length: Math.min(limit, 20)}, (_, i) => ({
      page: `/page-${i + 1}`,
      clicks: Math.floor(Math.random() * 50) + 5,
      impressions: Math.floor(Math.random() * 500) + 50,
      ctr: Math.floor(Math.random() * 12) + 3,
      position: Math.floor(Math.random() * 25) + 1,
    }));
  }

  async getIndexingStatus(pages: string[]) {
    return pages.map(page => ({
      page,
      indexed: Math.random() > 0.2,
      lastCrawled: new Date().toISOString(),
      crawlErrors: Math.random() > 0.9 ? ['No mobile version detected'] : [],
    }));
  }
}

export const searchConsole = new SearchConsoleMock();