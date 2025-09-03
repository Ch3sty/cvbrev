/**
 * Predictive Analytics Engine for Jobbcoach.ai Admin Dashboard
 * Advanced AI/ML analysis for user behavior and business metrics
 */

import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { createClient } from '@supabase/supabase-js';

// Types for predictive models
export interface ChurnPrediction {
  user_id: string;
  churn_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: string[];
  recommended_actions: string[];
  predicted_churn_date?: Date;
}

export interface ConversionPrediction {
  user_id: string;
  conversion_probability: number;
  predicted_conversion_date?: Date;
  optimal_offer?: string;
  engagement_score: number;
}

export interface RevenueForecast {
  period: string;
  predicted_revenue: number;
  confidence_interval: { low: number; high: number };
  growth_rate: number;
  factors: { factor: string; impact: number }[];
}

export interface UsagePattern {
  user_id: string;
  pattern_type: 'power_user' | 'regular' | 'sporadic' | 'inactive';
  features_used: string[];
  peak_usage_times: string[];
  predicted_next_usage?: Date;
}

/**
 * Churn Prediction Model
 * Analyzes user behavior to predict likelihood of cancellation
 */
export class ChurnPredictor {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async predictChurn(userId?: string): Promise<ChurnPrediction[]> {
    // Get user activity data
    const query = userId 
      ? this.supabase.from('profiles').select('*').eq('id', userId)
      : this.supabase.from('profiles').select('*').eq('subscription_tier', 'premium');

    const { data: users, error } = await query;
    if (error || !users) return [];

    const predictions: ChurnPrediction[] = [];

    for (const user of users) {
      // Calculate risk factors
      const riskFactors = await this.calculateRiskFactors(user);
      const churnScore = this.calculateChurnScore(riskFactors);
      
      predictions.push({
        user_id: user.id,
        churn_probability: churnScore,
        risk_level: this.getRiskLevel(churnScore),
        risk_factors: riskFactors.map(rf => rf.description),
        recommended_actions: this.getRecommendedActions(riskFactors),
        predicted_churn_date: this.predictChurnDate(user, churnScore)
      });
    }

    return predictions.sort((a, b) => b.churn_probability - a.churn_probability);
  }

  private async calculateRiskFactors(user: any): Promise<any[]> {
    const factors = [];
    const now = new Date();

    // Check last activity
    if (user.last_active) {
      const daysSinceActive = Math.floor((now.getTime() - new Date(user.last_active).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActive > 14) {
        factors.push({
          type: 'inactivity',
          weight: Math.min(daysSinceActive / 30, 1) * 0.3,
          description: `Inaktiv i ${daysSinceActive} dagar`
        });
      }
    }

    // Check usage frequency
    const { data: activities } = await this.supabase
      .from('user_activities')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (activities) {
      const activityCount = activities.length;
      if (activityCount < 5) {
        factors.push({
          type: 'low_usage',
          weight: (5 - activityCount) / 5 * 0.25,
          description: `Endast ${activityCount} aktiviteter senaste månaden`
        });
      }
    }

    // Check subscription age
    const subscriptionAge = Math.floor((now.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (subscriptionAge > 90 && subscriptionAge < 180) {
      factors.push({
        type: 'critical_period',
        weight: 0.15,
        description: 'I kritisk 3-6 månaders period'
      });
    }

    // Check feature adoption
    const { data: letters } = await this.supabase
      .from('letters')
      .select('count')
      .eq('user_id', user.id)
      .single();

    if (letters && letters.count < 3) {
      factors.push({
        type: 'low_feature_adoption',
        weight: 0.2,
        description: 'Låg användning av brevgenerering'
      });
    }

    // Check support interactions (if available)
    // This would require a support tickets table
    
    return factors;
  }

  private calculateChurnScore(factors: any[]): number {
    const baseScore = 0.1; // Base churn probability
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    return Math.min(baseScore + totalWeight, 1);
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.75) return 'critical';
    if (score >= 0.5) return 'high';
    if (score >= 0.25) return 'medium';
    return 'low';
  }

  private getRecommendedActions(factors: any[]): string[] {
    const actions = [];
    
    if (factors.some(f => f.type === 'inactivity')) {
      actions.push('Skicka återengagemang-email med nya funktioner');
      actions.push('Erbjud gratis coaching-session');
    }
    
    if (factors.some(f => f.type === 'low_usage')) {
      actions.push('Skicka utbildningsmaterial och tips');
      actions.push('Erbjud personlig demo av avancerade funktioner');
    }
    
    if (factors.some(f => f.type === 'critical_period')) {
      actions.push('Erbjud rabatt för årsprenumeration');
      actions.push('Kontakta för feedback och förbättringsförslag');
    }
    
    if (factors.some(f => f.type === 'low_feature_adoption')) {
      actions.push('Skicka onboarding-guide för oanvända funktioner');
      actions.push('Erbjud gratis CV-granskning av expert');
    }
    
    return actions;
  }

  private predictChurnDate(user: any, churnScore: number): Date | undefined {
    if (churnScore < 0.5) return undefined;
    
    // Simple prediction based on subscription end date and churn score
    if (user.current_period_end) {
      const endDate = new Date(user.current_period_end);
      const daysUntilEnd = Math.floor((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      // Adjust prediction based on churn score
      const adjustedDays = Math.floor(daysUntilEnd * (1 - churnScore + 0.5));
      
      return new Date(Date.now() + adjustedDays * 24 * 60 * 60 * 1000);
    }
    
    return undefined;
  }
}

/**
 * Conversion Predictor
 * Predicts likelihood of free users converting to premium
 */
export class ConversionPredictor {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async predictConversions(): Promise<ConversionPrediction[]> {
    // Get all free tier users
    const { data: freeUsers, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('subscription_tier', 'free');

    if (error || !freeUsers) return [];

    const predictions: ConversionPrediction[] = [];

    for (const user of freeUsers) {
      const engagementScore = await this.calculateEngagementScore(user);
      const conversionProb = await this.calculateConversionProbability(user, engagementScore);
      
      predictions.push({
        user_id: user.id,
        conversion_probability: conversionProb,
        predicted_conversion_date: this.predictConversionDate(user, conversionProb),
        optimal_offer: this.determineOptimalOffer(user, engagementScore),
        engagement_score: engagementScore
      });
    }

    return predictions.sort((a, b) => b.conversion_probability - a.conversion_probability);
  }

  private async calculateEngagementScore(user: any): Promise<number> {
    let score = 0;

    // Check activity frequency
    const { data: activities } = await this.supabase
      .from('user_activities')
      .select('activity_type, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (activities) {
      // Weight different activities
      const activityWeights: Record<string, number> = {
        'letter_created': 0.3,
        'letter_saved': 0.2,
        'cv_uploaded': 0.25,
        'login': 0.05,
        'cv_analyzed': 0.2
      };

      activities.forEach(activity => {
        score += activityWeights[activity.activity_type] || 0.1;
      });
    }

    // Check feature usage depth
    const { data: letters } = await this.supabase
      .from('letters')
      .select('count')
      .eq('user_id', user.id)
      .single();

    if (letters && letters.count > 0) {
      score += Math.min(letters.count * 0.1, 0.3);
    }

    // Check if hitting free tier limits
    if (user.weekly_letter_count >= 4) {
      score += 0.2; // High probability if hitting limits
    }

    return Math.min(score, 1);
  }

  private async calculateConversionProbability(user: any, engagementScore: number): Promise<number> {
    let probability = engagementScore * 0.5; // Base on engagement

    // Time-based factors
    const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (accountAge > 7 && accountAge < 30) {
      probability += 0.15; // Prime conversion window
    } else if (accountAge > 30 && accountAge < 60) {
      probability += 0.1;
    }

    // Check if they've hit weekly limits
    if (user.weekly_letter_count >= 5) {
      probability += 0.25;
    }

    return Math.min(probability, 1);
  }

  private predictConversionDate(user: any, probability: number): Date | undefined {
    if (probability < 0.3) return undefined;

    // Predict based on probability and current usage pattern
    const daysToConversion = Math.floor((1 - probability) * 30 + 7);
    return new Date(Date.now() + daysToConversion * 24 * 60 * 60 * 1000);
  }

  private determineOptimalOffer(user: any, engagementScore: number): string {
    if (engagementScore > 0.7) {
      return '20% rabatt första månaden';
    } else if (engagementScore > 0.5) {
      return 'Gratis provmånad med alla funktioner';
    } else if (engagementScore > 0.3) {
      return '50% rabatt i 3 månader';
    }
    return 'Gratis CV-granskning av expert vid uppgradering';
  }
}

/**
 * Revenue Forecaster
 * Predicts future revenue based on historical data and trends
 */
export class RevenueForecastEngine {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async generateForecast(months: number = 6): Promise<RevenueForecast[]> {
    const forecasts: RevenueForecast[] = [];
    
    // Get historical data
    const historicalData = await this.getHistoricalRevenue();
    const currentMetrics = await this.getCurrentMetrics();
    
    for (let i = 1; i <= months; i++) {
      const forecast = await this.forecastMonth(i, historicalData, currentMetrics);
      forecasts.push(forecast);
    }
    
    return forecasts;
  }

  private async getHistoricalRevenue(): Promise<any> {
    // This would require a revenue tracking table
    // For now, we'll estimate based on user counts
    const { data: premiumUsers } = await this.supabase
      .from('profiles')
      .select('created_at, subscription_tier')
      .eq('subscription_tier', 'premium')
      .order('created_at', { ascending: true });

    return premiumUsers || [];
  }

  private async getCurrentMetrics(): Promise<any> {
    const { data: stats } = await this.supabase
      .from('system_statistics')
      .select('*')
      .single();

    return stats || {};
  }

  private async forecastMonth(
    monthsAhead: number,
    historicalData: any,
    currentMetrics: any
  ): Promise<RevenueForecast> {
    const baseRevenue = (currentMetrics.premium_users || 0) * 149; // 149 SEK per user
    
    // Calculate growth rate based on historical data
    const growthRate = this.calculateGrowthRate(historicalData);
    
    // Apply compound growth
    const predictedRevenue = baseRevenue * Math.pow(1 + growthRate, monthsAhead);
    
    // Calculate confidence interval
    const uncertainty = 0.15 * monthsAhead; // 15% uncertainty per month
    const confidenceInterval = {
      low: predictedRevenue * (1 - uncertainty),
      high: predictedRevenue * (1 + uncertainty)
    };
    
    // Identify impact factors
    const factors = [
      { factor: 'Säsongsvariationer', impact: this.getSeasonalImpact(monthsAhead) },
      { factor: 'Marknadsföring', impact: 0.15 },
      { factor: 'Produktförbättringar', impact: 0.1 },
      { factor: 'Konkurrens', impact: -0.05 }
    ];
    
    const date = new Date();
    date.setMonth(date.getMonth() + monthsAhead);
    
    return {
      period: date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' }),
      predicted_revenue: Math.round(predictedRevenue),
      confidence_interval: {
        low: Math.round(confidenceInterval.low),
        high: Math.round(confidenceInterval.high)
      },
      growth_rate: growthRate,
      factors
    };
  }

  private calculateGrowthRate(historicalData: any[]): number {
    if (historicalData.length < 2) return 0.1; // Default 10% growth
    
    // Simple month-over-month growth calculation
    const monthlyGrowth: number[] = [];
    const monthCounts: Record<string, number> = {};
    
    historicalData.forEach(user => {
      const month = new Date(user.created_at).toISOString().slice(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    const months = Object.keys(monthCounts).sort();
    for (let i = 1; i < months.length; i++) {
      const prevCount = monthCounts[months[i - 1]];
      const currCount = monthCounts[months[i]];
      if (prevCount > 0) {
        monthlyGrowth.push((currCount - prevCount) / prevCount);
      }
    }
    
    // Average growth rate
    const avgGrowth = monthlyGrowth.length > 0
      ? monthlyGrowth.reduce((a, b) => a + b, 0) / monthlyGrowth.length
      : 0.1;
    
    return Math.max(Math.min(avgGrowth, 0.5), -0.2); // Cap between -20% and 50%
  }

  private getSeasonalImpact(monthsAhead: number): number {
    const currentMonth = new Date().getMonth();
    const targetMonth = (currentMonth + monthsAhead) % 12;
    
    // Swedish job market seasonality
    const seasonalFactors: Record<number, number> = {
      0: 0.2,   // January - New Year resolutions
      1: 0.15,  // February
      2: 0.1,   // March
      3: 0.05,  // April
      4: 0,     // May
      5: -0.1,  // June - Summer slowdown
      6: -0.2,  // July - Vacation
      7: 0.15,  // August - Back to work
      8: 0.25,  // September - Peak hiring
      9: 0.2,   // October
      10: 0.1,  // November
      11: -0.15 // December - Holiday slowdown
    };
    
    return seasonalFactors[targetMonth] || 0;
  }
}

/**
 * Usage Pattern Analyzer
 * Identifies and categorizes user behavior patterns
 */
export class UsagePatternAnalyzer {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async analyzePatterns(userId?: string): Promise<UsagePattern[]> {
    const query = userId
      ? this.supabase.from('profiles').select('*').eq('id', userId)
      : this.supabase.from('profiles').select('*');

    const { data: users, error } = await query;
    if (error || !users) return [];

    const patterns: UsagePattern[] = [];

    for (const user of users) {
      const pattern = await this.analyzeUserPattern(user);
      patterns.push(pattern);
    }

    return patterns;
  }

  private async analyzeUserPattern(user: any): Promise<UsagePattern> {
    // Get user's activity history
    const { data: activities } = await this.supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    const patternType = this.categorizeUsagePattern(activities || []);
    const featuresUsed = this.extractFeaturesUsed(activities || []);
    const peakTimes = this.identifyPeakUsageTimes(activities || []);
    const nextUsage = this.predictNextUsage(activities || [], patternType);

    return {
      user_id: user.id,
      pattern_type: patternType,
      features_used: featuresUsed,
      peak_usage_times: peakTimes,
      predicted_next_usage: nextUsage
    };
  }

  private categorizeUsagePattern(activities: any[]): 'power_user' | 'regular' | 'sporadic' | 'inactive' {
    if (activities.length === 0) return 'inactive';

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(a => new Date(a.created_at) > thirtyDaysAgo);

    if (recentActivities.length === 0) return 'inactive';
    if (recentActivities.length > 20) return 'power_user';
    if (recentActivities.length > 10) return 'regular';
    return 'sporadic';
  }

  private extractFeaturesUsed(activities: any[]): string[] {
    const features = new Set<string>();
    
    activities.forEach(activity => {
      switch (activity.activity_type) {
        case 'letter_created':
          features.add('Brevgenerering');
          break;
        case 'cv_uploaded':
          features.add('CV-uppladdning');
          break;
        case 'cv_analyzed':
          features.add('CV-analys');
          break;
        case 'competence_analysis':
          features.add('Kompetensanalys');
          break;
      }
    });

    return Array.from(features);
  }

  private identifyPeakUsageTimes(activities: any[]): string[] {
    const hourCounts: Record<number, number> = {};
    
    activities.forEach(activity => {
      const hour = new Date(activity.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find top 3 peak hours
    const sortedHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => {
        const h = parseInt(hour);
        return `${h.toString().padStart(2, '0')}:00-${(h + 1).toString().padStart(2, '0')}:00`;
      });

    return sortedHours;
  }

  private predictNextUsage(activities: any[], patternType: string): Date | undefined {
    if (activities.length < 2) return undefined;

    // Calculate average time between activities
    const intervals: number[] = [];
    for (let i = 1; i < Math.min(activities.length, 10); i++) {
      const interval = new Date(activities[i - 1].created_at).getTime() - 
                      new Date(activities[i].created_at).getTime();
      intervals.push(interval);
    }

    if (intervals.length === 0) return undefined;

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const lastActivity = new Date(activities[0].created_at);
    
    return new Date(lastActivity.getTime() + avgInterval);
  }
}

/**
 * Main Analytics Orchestrator
 * Coordinates all predictive analytics modules
 */
export class PredictiveAnalyticsOrchestrator {
  private churnPredictor: ChurnPredictor;
  private conversionPredictor: ConversionPredictor;
  private revenueForecaster: RevenueForecastEngine;
  private patternAnalyzer: UsagePatternAnalyzer;

  constructor() {
    this.churnPredictor = new ChurnPredictor();
    this.conversionPredictor = new ConversionPredictor();
    this.revenueForecaster = new RevenueForecastEngine();
    this.patternAnalyzer = new UsagePatternAnalyzer();
  }

  async generateFullAnalytics() {
    const [churn, conversions, revenue, patterns] = await Promise.all([
      this.churnPredictor.predictChurn(),
      this.conversionPredictor.predictConversions(),
      this.revenueForecaster.generateForecast(),
      this.patternAnalyzer.analyzePatterns()
    ]);

    return {
      churn_analysis: churn,
      conversion_opportunities: conversions,
      revenue_forecast: revenue,
      usage_patterns: patterns,
      generated_at: new Date().toISOString()
    };
  }

  async getActionableInsights() {
    const analytics = await this.generateFullAnalytics();
    
    return {
      immediate_actions: [
        ...analytics.churn_analysis
          .filter(c => c.risk_level === 'critical')
          .map(c => ({
            type: 'churn_prevention',
            user_id: c.user_id,
            action: c.recommended_actions[0],
            priority: 'high'
          })),
        ...analytics.conversion_opportunities
          .filter(c => c.conversion_probability > 0.7)
          .slice(0, 5)
          .map(c => ({
            type: 'conversion',
            user_id: c.user_id,
            action: `Erbjud: ${c.optimal_offer}`,
            priority: 'medium'
          }))
      ],
      metrics_summary: {
        at_risk_users: analytics.churn_analysis.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').length,
        hot_leads: analytics.conversion_opportunities.filter(c => c.conversion_probability > 0.7).length,
        predicted_mrr_growth: analytics.revenue_forecast[0]?.growth_rate || 0,
        power_users: analytics.usage_patterns.filter(p => p.pattern_type === 'power_user').length
      }
    };
  }
}