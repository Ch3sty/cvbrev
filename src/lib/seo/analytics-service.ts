// src/lib/seo/analytics-service.ts
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { googleAnalytics } from './mock-google-analytics';
import { searchConsole } from './mock-search-console';
import { CoreWebVitals } from './mock-core-web-vitals';

// Type definitions för SEO Analytics
export interface SEOPerformance {
  date: string;
  organic_traffic: number;
  organic_sessions: number;
  organic_users: number;
  organic_conversions: number;
  organic_conversion_rate: number;
  bounce_rate: number;
  avg_session_duration: number;
  pages_per_session: number;
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  search_volume: number;
  difficulty_score: number;
  url: string;
  change_from_previous: number;
  serp_features: any;
}

export interface ContentPerformance {
  content_slug: string;
  content_type: 'article' | 'page' | 'landing-page';
  title: string;
  pageviews: number;
  unique_pageviews: number;
  sessions: number;
  users: number;
  avg_time_on_page: number;
  bounce_rate: number;
  scroll_depth_avg: number;
  conversions: number;
  conversion_rate: number;
  organic_traffic: number;
  organic_clicks: number;
  organic_impressions: number;
  average_position: number;
  click_through_rate: number;
}

export interface CoreWebVitalsData {
  url: string;
  device_type: 'desktop' | 'mobile';
  lcp_score: number;
  fid_score: number;
  cls_score: number;
  fcp_score: number;
  ttfb_score: number;
  lcp_grade: 'good' | 'needs-improvement' | 'poor';
  fid_grade: 'good' | 'needs-improvement' | 'poor';
  cls_grade: 'good' | 'needs-improvement' | 'poor';
  overall_grade: 'good' | 'needs-improvement' | 'poor';
}

export interface UserJourney {
  session_id: string;
  user_id?: string;
  entry_page: string;
  entry_source: 'organic' | 'direct' | 'referral' | 'social' | 'email';
  entry_medium?: string;
  entry_campaign?: string;
  pages_visited: Array<{page: string, timestamp: string, time_spent: number}>;
  total_pages: number;
  session_duration: number;
  converted: boolean;
  conversion_type?: 'premium' | 'signup' | 'email' | 'download';
  conversion_value: number;
  exit_page: string;
  exit_reason: 'conversion' | 'bounce' | 'timeout';
}

export interface TechnicalSEOIssue {
  url: string;
  issue_type: '404' | 'redirect-chain' | 'missing-meta' | 'duplicate-content' | 'slow-loading' | 'missing-schema';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  recommendation: string;
  status: 'open' | 'fixed' | 'ignored';
}

class SEOAnalyticsService {
  private supabase = getSupabaseClient();
  private ga = googleAnalytics;
  private gsc = searchConsole;
  private cwv = new CoreWebVitals();

  // 1. SEO Performance Tracking
  async updateSEOPerformance(date: string): Promise<SEOPerformance | null> {
    try {
      // Hämta data från Google Analytics
      const gaData = await this.ga.getOrganicTrafficData(date);
      
      // Hämta konverteringsdata från Supabase
      const { data: conversionData } = await this.supabase
        .from('user_journeys')
        .select('*')
        .eq('entry_source', 'organic')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      const seoPerformance: SEOPerformance = {
        date,
        organic_traffic: gaData.sessions || 0,
        organic_sessions: gaData.sessions || 0,
        organic_users: gaData.users || 0,
        organic_conversions: conversionData?.filter(j => j.converted).length || 0,
        organic_conversion_rate: this.calculateConversionRate(
          conversionData?.filter(j => j.converted).length || 0,
          gaData.sessions || 0
        ),
        bounce_rate: gaData.bounceRate || 0,
        avg_session_duration: gaData.avgSessionDuration || 0,
        pages_per_session: gaData.pagesPerSession || 0
      };

      // Spara till databas
      const { data, error } = await this.supabase
        .from('seo_performance')
        .upsert(seoPerformance, { 
          onConflict: 'date',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating SEO performance:', error);
      return null;
    }
  }

  // 2. Keyword Rankings Tracking
  async updateKeywordRankings(keywords: string[]): Promise<KeywordRanking[]> {
    const results: KeywordRanking[] = [];

    try {
      for (const keyword of keywords) {
        const rankingData = await this.gsc.getKeywordRanking(keyword);
        
        if (rankingData) {
          const ranking: KeywordRanking = {
            keyword,
            position: rankingData.position,
            search_volume: rankingData.searchVolume || 0,
            difficulty_score: rankingData.difficulty || 0,
            url: rankingData.url || '',
            change_from_previous: await this.calculateRankingChange(keyword, rankingData.position),
            serp_features: rankingData.serpFeatures || {}
          };

          const { data, error } = await this.supabase
            .from('keyword_rankings')
            .insert({
              ...ranking,
              date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

          if (!error) results.push(data);
        }
      }
    } catch (error) {
      console.error('Error updating keyword rankings:', error);
    }

    return results;
  }

  // 3. Content Performance Analysis
  async analyzeContentPerformance(slug: string, dateRange: {start: string, end: string}): Promise<ContentPerformance | null> {
    try {
      // Hämta Google Analytics data för specifik sida
      const gaData = await this.ga.getPageAnalytics(`/artiklar/${slug}`, dateRange);
      
      // Hämta Search Console data
      const gscData = await this.gsc.getPagePerformance(`/artiklar/${slug}`, dateRange);
      
      // Hämta conversion data från user journeys
      const { data: journeyData } = await this.supabase
        .from('user_journeys')
        .select('*')
        .contains('pages_visited', [{ page: `/artiklar/${slug}` }])
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      // Hämta artikel metadata
      const { data: articleMeta } = await this.supabase
        .from('content_performance')
        .select('title, content_type')
        .eq('content_slug', slug)
        .single();

      const performance: ContentPerformance = {
        content_slug: slug,
        content_type: articleMeta?.content_type || 'article',
        title: articleMeta?.title || slug,
        pageviews: gaData.pageviews || 0,
        unique_pageviews: gaData.uniquePageviews || 0,
        sessions: gaData.sessions || 0,
        users: gaData.users || 0,
        avg_time_on_page: gaData.avgTimeOnPage || 0,
        bounce_rate: gaData.bounceRate || 0,
        scroll_depth_avg: gaData.scrollDepthAvg || 0,
        conversions: journeyData?.filter(j => j.converted).length || 0,
        conversion_rate: this.calculateConversionRate(
          journeyData?.filter(j => j.converted).length || 0,
          gaData.sessions || 0
        ),
        organic_traffic: gscData.clicks || 0,
        organic_clicks: gscData.clicks || 0,
        organic_impressions: gscData.impressions || 0,
        average_position: gscData.position || 0,
        click_through_rate: gscData.ctr || 0
      };

      // Uppdatera databas
      const { data, error } = await this.supabase
        .from('content_performance')
        .upsert({
          ...performance,
          date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'date,content_slug',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing content performance:', error);
      return null;
    }
  }

  // 4. Core Web Vitals Monitoring
  async monitorCoreWebVitals(urls: string[]): Promise<CoreWebVitalsData[]> {
    const results: CoreWebVitalsData[] = [];

    try {
      for (const url of urls) {
        const vitals = await this.cwv.measureVitals(url);
        
        if (vitals) {
          const cwvData: CoreWebVitalsData = {
            url,
            device_type: 'desktop', // Kör för både desktop och mobile
            lcp_score: vitals.lcp,
            fid_score: vitals.fid,
            cls_score: vitals.cls,
            fcp_score: vitals.fcp,
            ttfb_score: vitals.ttfb,
            lcp_grade: this.gradeVital('lcp', vitals.lcp),
            fid_grade: this.gradeVital('fid', vitals.fid),
            cls_grade: this.gradeVital('cls', vitals.cls),
            overall_grade: this.calculateOverallGrade(vitals)
          };

          const { data, error } = await this.supabase
            .from('core_web_vitals')
            .insert({
              ...cwvData,
              date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

          if (!error) results.push(data);
        }
      }
    } catch (error) {
      console.error('Error monitoring Core Web Vitals:', error);
    }

    return results;
  }

  // 5. User Journey Tracking
  async trackUserJourney(journeyData: Partial<UserJourney>): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_journeys')
        .insert(journeyData)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error tracking user journey:', error);
      return null;
    }
  }

  async updateUserJourney(sessionId: string, updates: Partial<UserJourney>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_journeys')
        .update(updates)
        .eq('session_id', sessionId);

      return !error;
    } catch (error) {
      console.error('Error updating user journey:', error);
      return false;
    }
  }

  // 6. Technical SEO Issue Detection
  async detectTechnicalIssues(): Promise<TechnicalSEOIssue[]> {
    const issues: TechnicalSEOIssue[] = [];

    try {
      // Kontrollera 404-sidor
      const broken404s = await this.check404Pages();
      issues.push(...broken404s);

      // Kontrollera redirect chains
      const redirectChains = await this.checkRedirectChains();
      issues.push(...redirectChains);

      // Kontrollera saknad metadata
      const missingMeta = await this.checkMissingMetadata();
      issues.push(...missingMeta);

      // Kontrollera duplicerat innehåll
      const duplicateContent = await this.checkDuplicateContent();
      issues.push(...duplicateContent);

      // Spara alla issues till databas
      if (issues.length > 0) {
        const { error } = await this.supabase
          .from('technical_seo_issues')
          .upsert(issues.map(issue => ({
            ...issue,
            first_detected: new Date().toISOString().split('T')[0],
            last_checked: new Date().toISOString().split('T')[0]
          })), {
            onConflict: 'url,issue_type',
            ignoreDuplicates: false
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error detecting technical issues:', error);
    }

    return issues;
  }

  // 7. Dashboard Data Aggregation
  async getDashboardData(dateRange: {start: string, end: string}) {
    try {
      const [
        seoPerformance,
        topKeywords,
        contentPerformance,
        webVitals,
        technicalIssues,
        userJourneys
      ] = await Promise.all([
        this.getSEOPerformanceSummary(dateRange),
        this.getTopKeywords(dateRange),
        this.getTopContentPerformance(dateRange),
        this.getCoreWebVitalsSummary(dateRange),
        this.getTechnicalIssuesSummary(),
        this.getUserJourneysSummary(dateRange)
      ]);

      return {
        seoPerformance,
        topKeywords,
        contentPerformance,
        webVitals,
        technicalIssues,
        userJourneys,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }

  // Helper methods
  private calculateConversionRate(conversions: number, sessions: number): number {
    return sessions > 0 ? (conversions / sessions) * 100 : 0;
  }

  private async calculateRankingChange(keyword: string, currentPosition: number): Promise<number> {
    const { data } = await this.supabase
      .from('keyword_rankings')
      .select('position')
      .eq('keyword', keyword)
      .order('date', { ascending: false })
      .limit(2);

    if (data && data.length >= 2) {
      return data[1].position - currentPosition; // Positiv = förbättring
    }
    return 0;
  }

  private gradeVital(type: 'lcp' | 'fid' | 'cls', value: number): 'good' | 'needs-improvement' | 'poor' {
    switch (type) {
      case 'lcp':
        return value <= 2.5 ? 'good' : value <= 4.0 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      default:
        return 'poor';
    }
  }

  private calculateOverallGrade(vitals: any): 'good' | 'needs-improvement' | 'poor' {
    const grades = [
      this.gradeVital('lcp', vitals.lcp),
      this.gradeVital('fid', vitals.fid),
      this.gradeVital('cls', vitals.cls)
    ];

    if (grades.every(g => g === 'good')) return 'good';
    if (grades.some(g => g === 'poor')) return 'poor';
    return 'needs-improvement';
  }

  // Placeholder methods för technical issue detection
  private async check404Pages(): Promise<TechnicalSEOIssue[]> { return []; }
  private async checkRedirectChains(): Promise<TechnicalSEOIssue[]> { return []; }
  private async checkMissingMetadata(): Promise<TechnicalSEOIssue[]> { return []; }
  private async checkDuplicateContent(): Promise<TechnicalSEOIssue[]> { return []; }

  // Placeholder methods för dashboard data
  private async getSEOPerformanceSummary(dateRange: any) { return {}; }
  private async getTopKeywords(dateRange: any) { return []; }
  private async getTopContentPerformance(dateRange: any) { return []; }
  private async getCoreWebVitalsSummary(dateRange: any) { return {}; }
  private async getTechnicalIssuesSummary() { return []; }
  private async getUserJourneysSummary(dateRange: any) { return {}; }
}

export const seoAnalyticsService = new SEOAnalyticsService();