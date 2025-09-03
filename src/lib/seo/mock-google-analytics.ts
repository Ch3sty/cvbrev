// Mock version för build-kompatibilitet
// Server-side funktioner ska endast köras via API routes

export interface AnalyticsData {
  sessions: number;
  users: number;
  pageviews: number;
  uniquePageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  avgTimeOnPage: number;
  scrollDepthAvg: number;
  conversions?: number;
}

export interface PageAnalyticsData extends AnalyticsData {
  pagePath: string;
}

export interface TrafficSourceData {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  conversions: number;
  conversionRate: number;
}

export class GoogleAnalyticsMock {
  constructor() {
    // Mock constructor - real implementation uses API routes
  }

  async getOrganicTrafficData(date: string): Promise<AnalyticsData> {
    // Return mock data - real implementation calls API route
    return {
      sessions: Math.floor(Math.random() * 1000),
      users: Math.floor(Math.random() * 800),
      pageviews: Math.floor(Math.random() * 2000),
      uniquePageviews: Math.floor(Math.random() * 1500),
      bounceRate: Math.floor(Math.random() * 50) + 20,
      avgSessionDuration: Math.floor(Math.random() * 300) + 60,
      pagesPerSession: Math.floor(Math.random() * 5) + 1,
      avgTimeOnPage: Math.floor(Math.random() * 180) + 30,
      scrollDepthAvg: Math.floor(Math.random() * 40) + 60,
    };
  }

  async getPageAnalytics(pagePath: string, dateRange: {start: string, end: string}): Promise<PageAnalyticsData> {
    const baseData = await this.getOrganicTrafficData(dateRange.start);
    return { ...baseData, pagePath };
  }

  async getTrafficSources(dateRange: {start: string, end: string}): Promise<TrafficSourceData[]> {
    return [
      { source: 'google', medium: 'organic', sessions: 500, users: 400, conversions: 25, conversionRate: 5.0 },
      { source: 'bing', medium: 'organic', sessions: 150, users: 120, conversions: 8, conversionRate: 5.3 },
      { source: 'direct', medium: '(none)', sessions: 200, users: 180, conversions: 15, conversionRate: 7.5 },
    ];
  }

  async getTopOrganicPages(dateRange: {start: string, end: string}, limit: number = 10) {
    return Array.from({length: Math.min(limit, 10)}, (_, i) => ({
      pagePath: `/artikel-${i + 1}`,
      pageTitle: `Artikel ${i + 1}`,
      sessions: Math.floor(Math.random() * 200) + 50,
      users: Math.floor(Math.random() * 150) + 30,
      pageviews: Math.floor(Math.random() * 300) + 100,
      bounceRate: Math.floor(Math.random() * 30) + 20,
      avgTimeOnPage: Math.floor(Math.random() * 120) + 60,
    }));
  }

  async getOrganicConversions(dateRange: {start: string, end: string}) {
    return {
      conversions: Math.floor(Math.random() * 50) + 10,
      conversionRate: Math.floor(Math.random() * 10) + 2,
      conversionValue: Math.floor(Math.random() * 10000) + 1000,
    };
  }

  async getRealTimeData() {
    return {
      activeUsers: Math.floor(Math.random() * 100) + 10,
      activeUsersLastMinute: Math.floor(Math.random() * 50) + 5,
      topPages: Array.from({length: 5}, (_, i) => ({
        pagePath: `/page-${i + 1}`,
        activeUsers: Math.floor(Math.random() * 20) + 1,
      })),
    };
  }
}

export const googleAnalytics = new GoogleAnalyticsMock();