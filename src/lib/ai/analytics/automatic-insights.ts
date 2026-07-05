/**
 * Automatic Insights Engine
 * Real-time anomaly detection and trend analysis for admin dashboard
 */

import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Types for insights
export interface Anomaly {
  id: string;
  type: 'usage_spike' | 'usage_drop' | 'error_rate' | 'cost_spike' | 'conversion_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: Date;
  affected_metrics: string[];
  recommended_action: string;
  data_points?: any[];
}

export interface Trend {
  id: string;
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  change_percentage: number;
  period: string;
  significance: number;
  forecast: string;
}

export interface CohortAnalysis {
  cohort_id: string;
  cohort_name: string;
  size: number;
  retention_rate: number;
  ltv: number;
  conversion_rate: number;
  key_characteristics: string[];
}

export interface ContentPerformance {
  content_type: string;
  success_rate: number;
  user_satisfaction: number;
  common_patterns: string[];
  improvement_suggestions: string[];
}

/**
 * Anomaly Detector
 * Identifies unusual patterns in system metrics
 */
export class AnomalyDetector {
  private supabase;
  private thresholds = {
    usage_spike: 2.5,      // Standard deviations
    usage_drop: -2.0,
    error_rate: 0.05,      // 5% error rate
    cost_spike: 1.5,       // 50% increase
    conversion_drop: 0.3   // 30% drop
  };

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async detectAnomalies(timeWindow: number = 24): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Check for usage anomalies
    const usageAnomalies = await this.detectUsageAnomalies(timeWindow);
    anomalies.push(...usageAnomalies);

    // Check for cost anomalies
    const costAnomalies = await this.detectCostAnomalies(timeWindow);
    anomalies.push(...costAnomalies);

    // Check for error rate anomalies
    const errorAnomalies = await this.detectErrorAnomalies(timeWindow);
    anomalies.push(...errorAnomalies);

    // Check for conversion anomalies
    const conversionAnomalies = await this.detectConversionAnomalies(timeWindow);
    anomalies.push(...conversionAnomalies);

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private async detectUsageAnomalies(hours: number): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const now = new Date();
    const windowStart = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Get recent activity counts
    const { data: recentActivity } = await this.supabase
      .from('user_activities')
      .select('created_at')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: true });

    if (!recentActivity || recentActivity.length === 0) return anomalies;

    // Group by hour
    const hourlyCount: Record<string, number> = {};
    recentActivity.forEach(activity => {
      const hour = new Date(activity.created_at).toISOString().slice(0, 13);
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    });

    // Calculate statistics
    const counts = Object.values(hourlyCount);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    // Check for anomalies in the last hour
    const lastHour = Object.keys(hourlyCount).sort().pop();
    if (lastHour) {
      const lastHourCount = hourlyCount[lastHour];
      const zScore = (lastHourCount - mean) / stdDev;

      if (zScore > this.thresholds.usage_spike) {
        anomalies.push({
          id: `usage_spike_${Date.now()}`,
          type: 'usage_spike',
          severity: zScore > 3 ? 'high' : 'medium',
          description: `Ovanligt hög aktivitet: ${lastHourCount} händelser senaste timmen (${Math.round(zScore * 100) / 100} standardavvikelser över normalt)`,
          detected_at: new Date(),
          affected_metrics: ['user_activities', 'system_load'],
          recommended_action: 'Kontrollera systemkapacitet och övervaka prestanda',
          data_points: [{ hour: lastHour, count: lastHourCount, mean, stdDev }]
        });
      } else if (zScore < -this.thresholds.usage_drop) {
        anomalies.push({
          id: `usage_drop_${Date.now()}`,
          type: 'usage_drop',
          severity: zScore < -2.5 ? 'high' : 'medium',
          description: `Ovanligt låg aktivitet: ${lastHourCount} händelser senaste timmen`,
          detected_at: new Date(),
          affected_metrics: ['user_activities', 'engagement'],
          recommended_action: 'Kontrollera om det finns tekniska problem eller tjänsteavbrott',
          data_points: [{ hour: lastHour, count: lastHourCount, mean, stdDev }]
        });
      }
    }

    return anomalies;
  }

  private async detectCostAnomalies(hours: number): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const now = new Date();
    const windowStart = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Get recent AI costs
    const { data: recentCosts } = await this.supabase
      .from('letters')
      .select('ai_cost, created_at')
      .gte('created_at', windowStart.toISOString())
      .not('ai_cost', 'is', null);

    if (!recentCosts || recentCosts.length === 0) return anomalies;

    // Calculate hourly costs
    const hourlyCost: Record<string, number> = {};
    recentCosts.forEach(item => {
      const hour = new Date(item.created_at).toISOString().slice(0, 13);
      hourlyCost[hour] = (hourlyCost[hour] || 0) + parseFloat(item.ai_cost);
    });

    // Check for cost spikes
    const costs = Object.values(hourlyCost);
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    
    const lastHour = Object.keys(hourlyCost).sort().pop();
    if (lastHour) {
      const lastHourCost = hourlyCost[lastHour];
      const increase = (lastHourCost - avgCost) / avgCost;

      if (increase > this.thresholds.cost_spike) {
        anomalies.push({
          id: `cost_spike_${Date.now()}`,
          type: 'cost_spike',
          severity: increase > 2 ? 'critical' : 'high',
          description: `AI-kostnader ${Math.round(increase * 100)}% över genomsnitt: ${lastHourCost.toFixed(2)} SEK senaste timmen`,
          detected_at: new Date(),
          affected_metrics: ['ai_cost', 'operational_cost'],
          recommended_action: 'Granska API-användning och kontrollera för onormal aktivitet',
          data_points: [{ hour: lastHour, cost: lastHourCost, average: avgCost }]
        });
      }
    }

    return anomalies;
  }

  private async detectErrorAnomalies(hours: number): Promise<Anomaly[]> {
    // This would require error logging table
    // Placeholder implementation
    return [];
  }

  private async detectConversionAnomalies(hours: number): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Check recent conversion rate
    const { data: recentSignups } = await this.supabase
      .from('profiles')
      .select('subscription_tier, created_at')
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString());

    if (recentSignups && recentSignups.length > 10) {
      const conversionRate = recentSignups.filter(u => u.subscription_tier === 'premium').length / recentSignups.length;
      
      // Historical baseline (would need historical data)
      const baselineConversion = 0.15; // 15% baseline
      const drop = (baselineConversion - conversionRate) / baselineConversion;

      if (drop > this.thresholds.conversion_drop) {
        anomalies.push({
          id: `conversion_drop_${Date.now()}`,
          type: 'conversion_anomaly',
          severity: drop > 0.5 ? 'high' : 'medium',
          description: `Konverteringsgrad ${Math.round(drop * 100)}% under normal nivå`,
          detected_at: new Date(),
          affected_metrics: ['conversion_rate', 'revenue'],
          recommended_action: 'Granska onboarding-flöde och prissättning'
        });
      }
    }

    return anomalies;
  }
}

/**
 * Trend Analyzer
 * Identifies and analyzes trends in metrics
 */
export class TrendAnalyzer {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async analyzeTrends(metrics: string[] = ['users', 'revenue', 'usage']): Promise<Trend[]> {
    const trends: Trend[] = [];

    for (const metric of metrics) {
      const trend = await this.analyzeMetricTrend(metric);
      if (trend) trends.push(trend);
    }

    return trends;
  }

  private async analyzeMetricTrend(metric: string): Promise<Trend | null> {
    switch (metric) {
      case 'users':
        return this.analyzeUserGrowthTrend();
      case 'revenue':
        return this.analyzeRevenueTrend();
      case 'usage':
        return this.analyzeUsageTrend();
      default:
        return null;
    }
  }

  private async analyzeUserGrowthTrend(): Promise<Trend> {
    // Get user registrations over last 30 days
    const { data: users } = await this.supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (!users || users.length === 0) {
      return {
        id: 'user_growth',
        metric: 'Användartillväxt',
        direction: 'stable',
        change_percentage: 0,
        period: '30 dagar',
        significance: 0,
        forecast: 'Ingen data för prognos'
      };
    }

    // Calculate daily growth
    const dailyCount: Record<string, number> = {};
    users.forEach(user => {
      const day = new Date(user.created_at).toISOString().slice(0, 10);
      dailyCount[day] = (dailyCount[day] || 0) + 1;
    });

    const days = Object.keys(dailyCount).sort();
    const firstWeek = days.slice(0, 7);
    const lastWeek = days.slice(-7);

    const firstWeekAvg = firstWeek.reduce((sum, day) => sum + (dailyCount[day] || 0), 0) / 7;
    const lastWeekAvg = lastWeek.reduce((sum, day) => sum + (dailyCount[day] || 0), 0) / 7;

    const changePercent = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;

    return {
      id: 'user_growth',
      metric: 'Användartillväxt',
      direction: changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable',
      change_percentage: changePercent,
      period: '30 dagar',
      significance: Math.abs(changePercent) / 10,
      forecast: this.generateForecast('users', changePercent)
    };
  }

  private async analyzeRevenueTrend(): Promise<Trend> {
    // Get premium users over time
    const { data: premiumUsers } = await this.supabase
      .from('profiles')
      .select('created_at, subscription_tier')
      .eq('subscription_tier', 'premium')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const monthlyRevenue = (premiumUsers?.length || 0) * 149;
    const previousMonthEstimate = monthlyRevenue * 0.9; // Estimate
    const changePercent = ((monthlyRevenue - previousMonthEstimate) / previousMonthEstimate) * 100;

    return {
      id: 'revenue_trend',
      metric: 'Intäkter',
      direction: changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable',
      change_percentage: changePercent,
      period: '30 dagar',
      significance: Math.abs(changePercent) / 10,
      forecast: this.generateForecast('revenue', changePercent)
    };
  }

  private async analyzeUsageTrend(): Promise<Trend> {
    // Get activity over last 30 days
    const { data: activities } = await this.supabase
      .from('user_activities')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!activities || activities.length === 0) {
      return {
        id: 'usage_trend',
        metric: 'Plattformsanvändning',
        direction: 'stable',
        change_percentage: 0,
        period: '30 dagar',
        significance: 0,
        forecast: 'Ingen aktivitetsdata'
      };
    }

    // Similar calculation as user growth
    const dailyCount: Record<string, number> = {};
    activities.forEach(activity => {
      const day = new Date(activity.created_at).toISOString().slice(0, 10);
      dailyCount[day] = (dailyCount[day] || 0) + 1;
    });

    const days = Object.keys(dailyCount).sort();
    const firstWeek = days.slice(0, 7);
    const lastWeek = days.slice(-7);

    const firstWeekTotal = firstWeek.reduce((sum, day) => sum + (dailyCount[day] || 0), 0);
    const lastWeekTotal = lastWeek.reduce((sum, day) => sum + (dailyCount[day] || 0), 0);

    const changePercent = ((lastWeekTotal - firstWeekTotal) / firstWeekTotal) * 100;

    return {
      id: 'usage_trend',
      metric: 'Plattformsanvändning',
      direction: changePercent > 10 ? 'increasing' : changePercent < -10 ? 'decreasing' : 'stable',
      change_percentage: changePercent,
      period: '30 dagar',
      significance: Math.abs(changePercent) / 20,
      forecast: this.generateForecast('usage', changePercent)
    };
  }

  private generateForecast(metric: string, changePercent: number): string {
    if (Math.abs(changePercent) < 5) {
      return `${metric} förväntas förbli stabil kommande veckor`;
    }
    
    const direction = changePercent > 0 ? 'öka' : 'minska';
    const rate = Math.abs(changePercent);
    
    if (rate > 20) {
      return `${metric} förväntas ${direction} kraftigt (${rate.toFixed(1)}% takt)`;
    } else if (rate > 10) {
      return `${metric} förväntas ${direction} måttligt (${rate.toFixed(1)}% takt)`;
    } else {
      return `${metric} förväntas ${direction} något (${rate.toFixed(1)}% takt)`;
    }
  }
}

/**
 * Cohort Analyzer
 * Analyzes different user segments
 */
export class CohortAnalyzer {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async analyzeCohorts(): Promise<CohortAnalysis[]> {
    const cohorts: CohortAnalysis[] = [];

    // Analyze by subscription tier
    cohorts.push(...await this.analyzeBySubscriptionTier());

    // Analyze by signup period
    cohorts.push(...await this.analyzeBySignupPeriod());

    // Analyze by usage pattern
    cohorts.push(...await this.analyzeByUsagePattern());

    return cohorts;
  }

  private async analyzeBySubscriptionTier(): Promise<CohortAnalysis[]> {
    const cohorts: CohortAnalysis[] = [];

    // Premium users cohort
    const { data: premiumUsers } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('subscription_tier', 'premium');

    if (premiumUsers && premiumUsers.length > 0) {
      // Calculate metrics for premium users
      const retentionRate = await this.calculateRetentionRate(premiumUsers);
      const avgLTV = 149 * 12; // Assuming 12 month average lifetime

      cohorts.push({
        cohort_id: 'premium_users',
        cohort_name: 'Premium-användare',
        size: premiumUsers.length,
        retention_rate: retentionRate,
        ltv: avgLTV,
        conversion_rate: 1.0, // Already converted
        key_characteristics: [
          'Betalar 149 SEK/månad',
          'Tillgång till alla funktioner',
          'Obegränsade brev varje dag'
        ]
      });
    }

    // Free users cohort
    const { data: freeUsers } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('subscription_tier', 'free');

    if (freeUsers && freeUsers.length > 0) {
      cohorts.push({
        cohort_id: 'free_users',
        cohort_name: 'Gratisanvändare',
        size: freeUsers.length,
        retention_rate: await this.calculateRetentionRate(freeUsers),
        ltv: 0,
        conversion_rate: 0,
        key_characteristics: [
          'Max 2 brev per dag',
          'Begränsad funktionalitet',
          'Potentiella uppgraderingskandidater'
        ]
      });
    }

    return cohorts;
  }

  private async analyzeBySignupPeriod(): Promise<CohortAnalysis[]> {
    const cohorts: CohortAnalysis[] = [];
    const now = new Date();

    // Last 7 days cohort
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { data: recentUsers } = await this.supabase
      .from('profiles')
      .select('*')
      .gte('created_at', weekAgo.toISOString());

    if (recentUsers && recentUsers.length > 0) {
      const premiumCount = recentUsers.filter(u => u.subscription_tier === 'premium').length;
      
      cohorts.push({
        cohort_id: 'recent_signups',
        cohort_name: 'Nya användare (7 dagar)',
        size: recentUsers.length,
        retention_rate: 1.0, // Too early to measure
        ltv: (premiumCount / recentUsers.length) * 149 * 6, // 6 month estimate
        conversion_rate: premiumCount / recentUsers.length,
        key_characteristics: [
          'Nyregistrerade',
          'I onboarding-fas',
          'Hög engagemangspotential'
        ]
      });
    }

    // 30-90 days cohort
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    const { data: establishedUsers } = await this.supabase
      .from('profiles')
      .select('*')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .lte('created_at', thirtyDaysAgo.toISOString());

    if (establishedUsers && establishedUsers.length > 0) {
      const premiumCount = establishedUsers.filter(u => u.subscription_tier === 'premium').length;
      
      cohorts.push({
        cohort_id: 'established_users',
        cohort_name: 'Etablerade användare (30-90 dagar)',
        size: establishedUsers.length,
        retention_rate: await this.calculateRetentionRate(establishedUsers),
        ltv: (premiumCount / establishedUsers.length) * 149 * 9,
        conversion_rate: premiumCount / establishedUsers.length,
        key_characteristics: [
          'Har testat plattformen',
          'Känner till funktionerna',
          'Beslutsfas för uppgradering'
        ]
      });
    }

    return cohorts;
  }

  private async analyzeByUsagePattern(): Promise<CohortAnalysis[]> {
    const cohorts: CohortAnalysis[] = [];

    // Power users (>10 activities per week)
    const { data: allUsers } = await this.supabase
      .from('profiles')
      .select('*');

    if (allUsers) {
      for (const user of allUsers) {
        const { data: activities } = await this.supabase
          .from('user_activities')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (activities && activities.length > 10) {
          // This is a power user
          // Would aggregate these into a cohort in production
        }
      }
    }

    return cohorts;
  }

  private async calculateRetentionRate(users: any[]): Promise<number> {
    if (users.length === 0) return 0;

    const activeUsers = users.filter(user => {
      if (!user.last_active) return false;
      const daysSinceActive = (Date.now() - new Date(user.last_active).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive < 30;
    });

    return activeUsers.length / users.length;
  }
}

/**
 * Content Performance Analyzer
 * Analyzes which types of content perform best
 */
export class ContentPerformanceAnalyzer {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async analyzeContentPerformance(): Promise<ContentPerformance[]> {
    const performance: ContentPerformance[] = [];

    // Analyze letter performance
    const letterPerf = await this.analyzeLetterPerformance();
    if (letterPerf) performance.push(letterPerf);

    // Analyze CV analysis performance
    const cvPerf = await this.analyzeCVPerformance();
    if (cvPerf) performance.push(cvPerf);

    return performance;
  }

  private async analyzeLetterPerformance(): Promise<ContentPerformance | null> {
    const { data: letters } = await this.supabase
      .from('letters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!letters || letters.length === 0) return null;

    // Analyze saved vs unsaved letters
    const savedRate = letters.filter(l => l.is_saved).length / letters.length;

    // Analyze by tonality
    const tonalityStats: Record<string, number> = {};
    letters.forEach(letter => {
      if (letter.tonality) {
        tonalityStats[letter.tonality] = (tonalityStats[letter.tonality] || 0) + 1;
      }
    });

    const mostPopularTonality = Object.entries(tonalityStats)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'professionell';

    // Common patterns in successful letters
    const savedLetters = letters.filter(l => l.is_saved);
    const patterns: string[] = [];

    if (savedLetters.length > 0) {
      const avgLength = savedLetters.reduce((sum, l) => sum + l.content.length, 0) / savedLetters.length;
      patterns.push(`Genomsnittlig längd: ${Math.round(avgLength)} tecken`);
      patterns.push(`Populäraste ton: ${mostPopularTonality}`);
    }

    return {
      content_type: 'Personliga brev',
      success_rate: savedRate,
      user_satisfaction: savedRate * 100, // Simplified metric
      common_patterns: patterns,
      improvement_suggestions: this.generateLetterImprovements(savedRate, tonalityStats)
    };
  }

  private async analyzeCVPerformance(): Promise<ContentPerformance | null> {
    const { data: cvs } = await this.supabase
      .from('cv_texts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!cvs || cvs.length === 0) return null;

    // Analyze CV upload patterns
    const patterns: string[] = [];
    const avgCVLength = cvs.reduce((sum, cv) => sum + cv.cv_text.length, 0) / cvs.length;
    patterns.push(`Genomsnittlig CV-längd: ${Math.round(avgCVLength)} tecken`);

    return {
      content_type: 'CV-analyser',
      success_rate: 0.75, // Placeholder - would need user feedback
      user_satisfaction: 75,
      common_patterns: patterns,
      improvement_suggestions: [
        'Lägg till branschspecifika CV-mallar',
        'Implementera ATS-poängssystem',
        'Erbjud visuell CV-builder'
      ]
    };
  }

  private generateLetterImprovements(savedRate: number, tonalityStats: Record<string, number>): string[] {
    const suggestions: string[] = [];

    if (savedRate < 0.3) {
      suggestions.push('Förbättra brevkvaliteten med mer personalisering');
      suggestions.push('Lägg till fler branschspecifika exempel');
    }

    if (Object.keys(tonalityStats).length < 3) {
      suggestions.push('Användare använder få tonaliteter - överväg att marknadsföra variationen');
    }

    suggestions.push('Implementera A/B-testning för brevmallar');
    suggestions.push('Lägg till feedback-system för genererade brev');

    return suggestions;
  }
}

/**
 * Main Insights Orchestrator
 */
export class AutomaticInsightsEngine {
  private anomalyDetector: AnomalyDetector;
  private trendAnalyzer: TrendAnalyzer;
  private cohortAnalyzer: CohortAnalyzer;
  private contentAnalyzer: ContentPerformanceAnalyzer;

  constructor() {
    this.anomalyDetector = new AnomalyDetector();
    this.trendAnalyzer = new TrendAnalyzer();
    this.cohortAnalyzer = new CohortAnalyzer();
    this.contentAnalyzer = new ContentPerformanceAnalyzer();
  }

  async generateInsights() {
    const [anomalies, trends, cohorts, content] = await Promise.all([
      this.anomalyDetector.detectAnomalies(),
      this.trendAnalyzer.analyzeTrends(),
      this.cohortAnalyzer.analyzeCohorts(),
      this.contentAnalyzer.analyzeContentPerformance()
    ]);

    return {
      anomalies,
      trends,
      cohorts,
      content_performance: content,
      generated_at: new Date().toISOString(),
      summary: this.generateExecutiveSummary(anomalies, trends, cohorts, content)
    };
  }

  private generateExecutiveSummary(
    anomalies: Anomaly[],
    trends: Trend[],
    cohorts: CohortAnalysis[],
    content: ContentPerformance[]
  ): string {
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' || a.severity === 'high');
    const growthTrend = trends.find(t => t.metric === 'Användartillväxt');
    const premiumCohort = cohorts.find(c => c.cohort_id === 'premium_users');

    let summary = 'Executive Summary:\n\n';

    if (criticalAnomalies.length > 0) {
      summary += `⚠️ ${criticalAnomalies.length} kritiska avvikelser upptäckta som kräver omedelbar uppmärksamhet.\n`;
    }

    if (growthTrend) {
      summary += `📈 Användartillväxt: ${growthTrend.direction === 'increasing' ? '↑' : growthTrend.direction === 'decreasing' ? '↓' : '→'} ${Math.abs(growthTrend.change_percentage).toFixed(1)}%\n`;
    }

    if (premiumCohort) {
      summary += `💎 ${premiumCohort.size} premium-användare med ${(premiumCohort.retention_rate * 100).toFixed(0)}% retention\n`;
    }

    const letterPerf = content.find(c => c.content_type === 'Personliga brev');
    if (letterPerf) {
      summary += `📝 Brev-sparfrekvens: ${(letterPerf.success_rate * 100).toFixed(0)}%\n`;
    }

    return summary;
  }
}