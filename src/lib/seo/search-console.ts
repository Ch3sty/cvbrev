// src/lib/seo/search-console.ts
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

export interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface KeywordData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  changeFromPrevious: number;
}

export interface PagePerformanceData extends SearchConsoleData {
  page: string;
}

export interface SearchAnalyticsFilter {
  dimension: 'query' | 'page' | 'country' | 'device';
  operator: 'equals' | 'contains' | 'notEquals' | 'notContains';
  expression: string;
}

export class GoogleSearchConsole {
  private webmasters: any;
  private siteUrl: string;

  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://www.jobbcoach.ai';
    
    // Konfigurera Google Auth
    const auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    // Initiera Search Console API
    this.webmasters = google.webmasters({
      version: 'v3',
      auth
    });
  }

  // HÃ¤mta keyword ranking fÃ¶r ett specifikt keyword
  async getKeywordRanking(keyword: string): Promise<{
    position: number;
    clicks: number;
    impressions: number;
    ctr: number;
    searchVolume?: number;
    difficulty?: number;
    url?: string;
    serpFeatures?: any;
  } | null> {
    try {
      const response = await this.webmasters.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          dimensions: ['query', 'page'],
          filters: [{
            dimension: 'query',
            operator: 'equals',
            expression: keyword
          }],
          rowLimit: 1
        }
      });

      const row = response.data.rows?.[0];
      if (!row) return null;

      return {
        position: row.position,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr * 100,
        url: row.keys?.[1] || '',
        // Dessa vÃ¤rden skulle hÃ¤mtas frÃ¥n andra kÃ¤llor som Semrush
        searchVolume: undefined,
        difficulty: undefined,
        serpFeatures: undefined
      };
    } catch (error) {
      console.error('Error fetching keyword ranking:', error);
      return null;
    }
  }

  // HÃ¤mta prestanda fÃ¶r en specifik sida
  async getPagePerformance(pagePath: string, dateRange: {start: string, end: string}): Promise<SearchConsoleData> {
    try {
      const response = await this.webmasters.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          dimensions: ['page'],
          filters: [{
            dimension: 'page',
            operator: 'equals',
            expression: `${this.siteUrl}${pagePath}`
          }],
          rowLimit: 1
        }
      });

      const row = response.data.rows?.[0];
      if (!row) {
        return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
      }

      return {
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0
      };
    } catch (error) {
      console.error('Error fetching page performance:', error);
      return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    }
  }

  // HÃ¤mta de bÃ¤sta keywords fÃ¶r webbplatsen
  async getTopKeywords(dateRange: {start: string, end: string}, limit: number = 50): Promise<KeywordData[]> {
    try {
      const response = await this.webmasters.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          dimensions: ['query'],
          rowLimit: limit
        }
      });

      const keywords = response.data.rows?.map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
        changeFromPrevious: 0 // Detta skulle berÃ¤knas genom att jÃ¤mfÃ¶ra med tidigare period
      })) || [];

      // BerÃ¤kna fÃ¶rÃ¤ndringar frÃ¥n fÃ¶regÃ¥ende period
      for (const keyword of keywords) {
        keyword.changeFromPrevious = await this.calculatePositionChange(
          keyword.query, 
          keyword.position, 
          dateRange
        );
      }

      return keywords;
    } catch (error) {
      console.error('Error fetching top keywords:', error);
      return [];
    }
  }

  // HÃ¤mta de bÃ¤sta sidorna baserat pÃ¥ organisk trafik
  async getTopPages(dateRange: {start: string, end: string}, limit: number = 20): Promise<PagePerformanceData[]> {
    try {
      const response = await this.webmasters.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          dimensions: ['page'],
          rowLimit: limit
        }
      });

      return response.data.rows?.map((row: any) => ({
        page: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching top pages:', error);
      return [];
    }
  }

  // HÃ¤mta svenska specifika keywords och deras prestanda
  async getSwedishKeywords(dateRange: {start: string, end: string}): Promise<KeywordData[]> {
    try {
      const response = await this.webmasters.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          dimensions: ['query', 'country'],
          filters: [{
            dimension: 'country',
            operator: 'equals',
            expression: 'swe' // Sverige
          }],
          rowLimit: 100
        }
      });

      return response.data.rows?.map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
        changeFromPrevious: 0
      })) || [];
    } catch (error) {
      console.error('Error fetching Swedish keywords:', error);
      return [];
    }
  }

  // HÃ¤mta mobile vs desktop prestanda
  async getDevicePerformance(dateRange: {start: string, end: string}): Promise<{
    mobile: SearchConsoleData;
    desktop: SearchConsoleData;
    tablet: SearchConsoleData;
  }> {
    try {
      const devices = ['mobile', 'desktop', 'tablet'];
      const results: any = {};

      for (const device of devices) {
        const response = await this.webmasters.searchanalytics.query({
          siteUrl: this.siteUrl,
          requestBody: {
            startDate: dateRange.start,
            endDate: dateRange.end,
            dimensions: ['device'],
            filters: [{
              dimension: 'device',
              operator: 'equals',
              expression: device
            }]
          }
        });

        const row = response.data.rows?.[0];
        results[device] = {
          clicks: row?.clicks || 0,
          impressions: row?.impressions || 0,
          ctr: (row?.ctr || 0) * 100,
          position: row?.position || 0
        };
      }

      return results;
    } catch (error) {
      console.error('Error fetching device performance:', error);
      return {
        mobile: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        desktop: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        tablet: { clicks: 0, impressions: 0, ctr: 0, position: 0 }
      };
    }
  }

  // Identifiera trending keywords (stigande keywords)
  async getTrendingKeywords(dateRange: {start: string, end: string}): Promise<KeywordData[]> {
    try {
      // HÃ¤mta keywords fÃ¶r den aktuella perioden
      const currentKeywords = await this.getTopKeywords(dateRange, 100);
      
      // BerÃ¤kna tidigare period
      const daysDiff = Math.floor(
        (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const previousStart = new Date(new Date(dateRange.start).getTime() - daysDiff * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      const previousEnd = new Date(new Date(dateRange.end).getTime() - daysDiff * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      // HÃ¤mta keywords fÃ¶r fÃ¶regÃ¥ende period
      const previousKeywords = await this.getTopKeywords(
        { start: previousStart, end: previousEnd }, 
        100
      );

      // BerÃ¤kna fÃ¶rÃ¤ndringar och identifiera trending keywords
      const trendingKeywords: KeywordData[] = [];

      for (const currentKw of currentKeywords) {
        const previousKw = previousKeywords.find(pk => pk.query === currentKw.query);
        
        if (previousKw) {
          const clickChange = ((currentKw.clicks - previousKw.clicks) / previousKw.clicks) * 100;
          const positionChange = previousKw.position - currentKw.position; // Positiv = fÃ¶rbÃ¤ttring

          // Keyword Ã¤r trending om klick Ã¶kar med mer Ã¤n 20% eller position fÃ¶rbÃ¤ttras med mer Ã¤n 5
          if (clickChange > 20 || positionChange > 5) {
            trendingKeywords.push({
              ...currentKw,
              changeFromPrevious: Math.round(clickChange)
            });
          }
        }
      }

      return trendingKeywords.sort((a, b) => b.changeFromPrevious - a.changeFromPrevious);
    } catch (error) {
      console.error('Error fetching trending keywords:', error);
      return [];
    }
  }

  // HÃ¤mta SERP features fÃ¶r svenska keywords
  async getSERPFeatures(keyword: string): Promise<{
    featuredSnippet: boolean;
    peopleAlsoAsk: boolean;
    localPack: boolean;
    imageCarousel: boolean;
    videoCarousel: boolean;
    knowledgePanel: boolean;
  }> {
    // Detta skulle krÃ¤va integration med tredjepartsverktyg som Semrush eller Ahrefs
    // eftersom Search Console API inte tillhandahÃ¥ller SERP features data
    
    try {
      // Placeholder implementation - i verkligheten skulle detta anropa Semrush API
      return {
        featuredSnippet: false,
        peopleAlsoAsk: false,
        localPack: false,
        imageCarousel: false,
        videoCarousel: false,
        knowledgePanel: false
      };
    } catch (error) {
      console.error('Error fetching SERP features:', error);
      return {
        featuredSnippet: false,
        peopleAlsoAsk: false,
        localPack: false,
        imageCarousel: false,
        videoCarousel: false,
        knowledgePanel: false
      };
    }
  }

  // Ã–vervaka konkurrenternas prestanda fÃ¶r specifika keywords
  async getCompetitorAnalysis(keywords: string[]): Promise<Array<{
    keyword: string;
    ourPosition: number;
    competitors: Array<{
      domain: string;
      position: number;
      title: string;
      description: string;
    }>;
  }>> {
    // Detta skulle implementeras med hjÃ¤lp av tredjepartsverktyg
    // eftersom Search Console inte ger konkurrentdata
    
    console.log('Competitor analysis would be implemented with third-party tools');
    return [];
  }

  // Privata hjÃ¤lpmetoder
  private async calculatePositionChange(
    keyword: string, 
    currentPosition: number, 
    dateRange: {start: string, end: string}
  ): Promise<number> {
    try {
      // BerÃ¤kna fÃ¶regÃ¥ende period
      const daysDiff = Math.floor(
        (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const previousStart = new Date(new Date(dateRange.start).getTime() - daysDiff * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      const previousEnd = new Date(new Date(dateRange.end).getTime() - daysDiff * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const response = await this.webmasters.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: previousStart,
          endDate: previousEnd,
          dimensions: ['query'],
          filters: [{
            dimension: 'query',
            operator: 'equals',
            expression: keyword
          }],
          rowLimit: 1
        }
      });

      const previousRow = response.data.rows?.[0];
      if (!previousRow) return 0;

      // Returnera skillnaden (positiv = fÃ¶rbÃ¤ttring)
      return previousRow.position - currentPosition;
    } catch (error) {
      console.error('Error calculating position change:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const googleSearchConsole = new GoogleSearchConsole();