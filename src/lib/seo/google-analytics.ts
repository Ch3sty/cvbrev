// src/lib/seo/google-analytics.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Type definitions för Google Analytics data
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

export class GoogleAnalytics {
  private analyticsDataClient: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor() {
    // Konfigurera Google Analytics Data API client
    this.propertyId = process.env.GA4_PROPERTY_ID || '';
    
    // Initiera client med service account credentials
    this.analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      // Alternativt med JSON key direkt:
      // credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}')
    });
  }

  // Hämta organisk trafik för en specifik dag
  async getOrganicTrafficData(date: string): Promise<AnalyticsData> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: date,
            endDate: date,
          },
        ],
        dimensions: [
          { name: 'sessionDefaultChannelGrouping' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'screenPageViewsPerSession' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGrouping',
            stringFilter: {
              value: 'Organic Search',
            },
          },
        },
      });

      // Parsa responsen och returnera data
      const row = response.rows?.[0];
      if (!row || !row.metricValues) {
        return this.getEmptyAnalyticsData();
      }

      return {
        sessions: parseInt(row.metricValues[0]?.value || '0'),
        users: parseInt(row.metricValues[1]?.value || '0'),
        pageviews: parseInt(row.metricValues[2]?.value || '0'),
        uniquePageviews: parseInt(row.metricValues[2]?.value || '0'), // Approximation
        bounceRate: parseFloat(row.metricValues[3]?.value || '0') * 100,
        avgSessionDuration: parseInt(row.metricValues[4]?.value || '0'),
        pagesPerSession: parseFloat(row.metricValues[5]?.value || '0'),
        avgTimeOnPage: 0,
        scrollDepthAvg: 0,
      };
    } catch (error) {
      console.error('Error fetching organic traffic data:', error);
      return this.getEmptyAnalyticsData();
    }
  }

  // Hämta analytics för en specifik sida
  async getPageAnalytics(pagePath: string, dateRange: {start: string, end: string}): Promise<PageAnalyticsData> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        ],
        dimensions: [
          { name: 'pagePath' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'averageTimeOnPage' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              value: pagePath,
              matchType: 'EXACT',
            },
          },
        },
      });

      const row = response.rows?.[0];
      if (!row || !row.metricValues) {
        return { ...this.getEmptyAnalyticsData(), pagePath };
      }

      return {
        pagePath,
        sessions: parseInt(row.metricValues[0]?.value || '0'),
        users: parseInt(row.metricValues[1]?.value || '0'),
        pageviews: parseInt(row.metricValues[2]?.value || '0'),
        uniquePageviews: parseInt(row.metricValues[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues[3]?.value || '0') * 100,
        avgSessionDuration: parseInt(row.metricValues[4]?.value || '0'),
        avgTimeOnPage: parseInt(row.metricValues[5]?.value || '0'),
        pagesPerSession: 0,
        scrollDepthAvg: 0,
      };
    } catch (error) {
      console.error('Error fetching page analytics:', error);
      return { ...this.getEmptyAnalyticsData(), pagePath };
    }
  }

  // Hämta data om trafikkällor
  async getTrafficSources(dateRange: {start: string, end: string}): Promise<TrafficSourceData[]> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        ],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'conversions' },
        ],
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true,
          },
        ],
      });

      return response.rows?.map(row => ({
        source: row.dimensionValues?.[0]?.value || 'Unknown',
        medium: row.dimensionValues?.[1]?.value || 'Unknown',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        conversions: parseInt(row.metricValues?.[2]?.value || '0'),
        conversionRate: this.calculateConversionRate(
          parseInt(row.metricValues?.[2]?.value || '0'),
          parseInt(row.metricValues?.[0]?.value || '0')
        ),
      })) || [];
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
      return [];
    }
  }

  // Hämta topp-sidor baserat på organisk trafik
  async getTopOrganicPages(dateRange: {start: string, end: string}, limit: number = 10): Promise<Array<{
    pagePath: string;
    pageTitle: string;
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    avgTimeOnPage: number;
  }>> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        ],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
          { name: 'sessionDefaultChannelGrouping' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageTimeOnPage' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGrouping',
            stringFilter: {
              value: 'Organic Search',
            },
          },
        },
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true,
          },
        ],
        limit,
      });

      return response.rows?.map(row => ({
        pagePath: row.dimensionValues?.[0]?.value || '',
        pageTitle: row.dimensionValues?.[1]?.value || '',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0') * 100,
        avgTimeOnPage: parseInt(row.metricValues?.[4]?.value || '0'),
      })) || [];
    } catch (error) {
      console.error('Error fetching top organic pages:', error);
      return [];
    }
  }

  // Hämta konverteringsdata för organisk trafik
  async getOrganicConversions(dateRange: {start: string, end: string}): Promise<{
    conversions: number;
    conversionRate: number;
    conversionValue: number;
  }> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        ],
        dimensions: [
          { name: 'sessionDefaultChannelGrouping' },
        ],
        metrics: [
          { name: 'conversions' },
          { name: 'sessions' },
          { name: 'totalRevenue' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGrouping',
            stringFilter: {
              value: 'Organic Search',
            },
          },
        },
      });

      const row = response.rows?.[0];
      if (!row || !row.metricValues) {
        return { conversions: 0, conversionRate: 0, conversionValue: 0 };
      }

      const conversions = parseInt(row.metricValues[0]?.value || '0');
      const sessions = parseInt(row.metricValues[1]?.value || '0');
      const revenue = parseFloat(row.metricValues[2]?.value || '0');

      return {
        conversions,
        conversionRate: this.calculateConversionRate(conversions, sessions),
        conversionValue: revenue,
      };
    } catch (error) {
      console.error('Error fetching organic conversions:', error);
      return { conversions: 0, conversionRate: 0, conversionValue: 0 };
    }
  }

  // Hämta real-time data för aktuell trafik
  async getRealTimeData(): Promise<{
    activeUsers: number;
    activeUsersLastMinute: number;
    topPages: Array<{pagePath: string; activeUsers: number}>;
  }> {
    try {
      const [response] = await this.analyticsDataClient.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [
          { name: 'unifiedPagePathScreen' },
        ],
        metrics: [
          { name: 'activeUsers' },
        ],
        orderBys: [
          {
            metric: { metricName: 'activeUsers' },
            desc: true,
          },
        ],
        limit: 10,
      });

      const totalActiveUsers = response.rows?.reduce((sum, row) => 
        sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 0;

      const topPages = response.rows?.map(row => ({
        pagePath: row.dimensionValues?.[0]?.value || '',
        activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
      })) || [];

      return {
        activeUsers: totalActiveUsers,
        activeUsersLastMinute: totalActiveUsers, // Approximation
        topPages,
      };
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      return {
        activeUsers: 0,
        activeUsersLastMinute: 0,
        topPages: [],
      };
    }
  }

  // Helper methods
  private getEmptyAnalyticsData(): AnalyticsData {
    return {
      sessions: 0,
      users: 0,
      pageviews: 0,
      uniquePageviews: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      pagesPerSession: 0,
      avgTimeOnPage: 0,
      scrollDepthAvg: 0,
    };
  }

  private calculateConversionRate(conversions: number, sessions: number): number {
    return sessions > 0 ? (conversions / sessions) * 100 : 0;
  }

  // Konfigurera custom dimensions för svenska marknaden
  async setupCustomDimensions(): Promise<void> {
    // Detta skulle implementeras för att sätta upp custom tracking
    // för svenska specifika händelser som:
    // - CV-generering
    // - Personligt brev skapande
    // - Premium uppgraderingar
    // - Artikel läsning
    console.log('Setting up custom dimensions for Swedish market tracking...');
  }
}

// Export singleton instance
export const googleAnalytics = new GoogleAnalytics();