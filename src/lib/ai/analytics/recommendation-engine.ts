/**
 * AI-Powered Recommendation Engine
 * Provides intelligent recommendations for users and business optimization
 */

import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Types for recommendations
export interface UserRecommendation {
  user_id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expected_impact: Impact;
  action_items: ActionItem[];
  personalization_score: number;
  expires_at?: Date;
}

export type RecommendationType = 
  | 'feature_discovery'
  | 'upgrade_prompt'
  | 'engagement'
  | 'content_improvement'
  | 'learning_path'
  | 'networking'
  | 'career_advancement';

export interface Impact {
  user_value: number; // 0-100 scale
  business_value: number; // 0-100 scale
  implementation_effort: number; // 0-100 scale
}

export interface ActionItem {
  id: string;
  description: string;
  cta_text: string;
  url?: string;
  tracking_event?: string;
}

export interface PricingRecommendation {
  current_price: number;
  recommended_price: number;
  reasoning: string;
  expected_conversion_change: number;
  expected_revenue_change: number;
  competitor_comparison: CompetitorPrice[];
  test_groups?: TestGroup[];
}

export interface CompetitorPrice {
  competitor: string;
  price: number;
  features: string[];
}

export interface TestGroup {
  name: string;
  price: number;
  size_percentage: number;
  expected_conversion: number;
}

export interface FeatureRecommendation {
  feature_name: string;
  description: string;
  user_demand_score: number;
  implementation_complexity: 'low' | 'medium' | 'high';
  expected_adoption_rate: number;
  revenue_impact: number;
  development_time_estimate: string;
  dependencies: string[];
}

export interface EngagementStrategy {
  user_segment: string;
  strategy_name: string;
  tactics: Tactic[];
  expected_retention_improvement: number;
  expected_activity_increase: number;
  cost_estimate: number;
}

export interface Tactic {
  name: string;
  description: string;
  channel: 'email' | 'in_app' | 'push' | 'sms';
  timing: string;
  content_template?: string;
}

/**
 * User Recommendation Engine
 * Generates personalized recommendations for users
 */
export class UserRecommender {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async generateRecommendations(userId: string): Promise<UserRecommendation[]> {
    // Get user profile and activity
    const { data: user } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) return [];

    const { data: activities } = await this.supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: letters } = await this.supabase
      .from('letters')
      .select('*')
      .eq('user_id', userId)
      .limit(10);

    const recommendations: UserRecommendation[] = [];

    // Feature discovery recommendations
    const featureRecs = this.recommendFeatures(user, activities || []);
    recommendations.push(...featureRecs);

    // Upgrade recommendations
    if (user.subscription_tier === 'free') {
      const upgradeRec = this.recommendUpgrade(user, letters || []);
      if (upgradeRec) recommendations.push(upgradeRec);
    }

    // Content improvement recommendations
    const contentRecs = await this.recommendContentImprovements(userId, letters || []);
    recommendations.push(...contentRecs);

    // Learning recommendations
    const learningRecs = this.recommendLearning(user, activities || []);
    recommendations.push(...learningRecs);

    return this.prioritizeRecommendations(recommendations);
  }

  private recommendFeatures(user: any, activities: any[]): UserRecommendation[] {
    const recommendations: UserRecommendation[] = [];
    const activityTypes = new Set(activities.map(a => a.activity_type));

    // Check for unused features
    if (!activityTypes.has('cv_analyzed')) {
      recommendations.push({
        user_id: user.id,
        type: 'feature_discovery',
        title: 'Prova CV-analys',
        description: 'Få professionell feedback på ditt CV med vår AI-drivna analysverktyg',
        priority: 'high',
        expected_impact: {
          user_value: 85,
          business_value: 70,
          implementation_effort: 10
        },
        action_items: [{
          id: 'try_cv_analysis',
          description: 'Ladda upp ditt CV för gratis analys',
          cta_text: 'Analysera CV',
          url: '/cv-analys',
          tracking_event: 'recommendation_cv_analysis_clicked'
        }],
        personalization_score: 0.9
      });
    }

    if (!activityTypes.has('competence_analysis')) {
      recommendations.push({
        user_id: user.id,
        type: 'feature_discovery',
        title: 'Upptäck kompetensanalys',
        description: 'Identifiera kompetensgap och få personliga utvecklingsförslag',
        priority: 'medium',
        expected_impact: {
          user_value: 75,
          business_value: 60,
          implementation_effort: 10
        },
        action_items: [{
          id: 'try_competence',
          description: 'Gör en kompetensanalys',
          cta_text: 'Starta analys',
          url: '/kompetensanalys',
          tracking_event: 'recommendation_competence_clicked'
        }],
        personalization_score: 0.8
      });
    }

    return recommendations;
  }

  private recommendUpgrade(user: any, letters: any[]): UserRecommendation | null {
    // Check if user is hitting limits
    const isHittingLimits = user.weekly_letter_count >= 4;
    const hasMultipleLetters = letters.length > 3;

    if (isHittingLimits || hasMultipleLetters) {
      return {
        user_id: user.id,
        type: 'upgrade_prompt',
        title: 'Uppgradera till Premium',
        description: isHittingLimits
          ? 'Du närmar dig dagsgränsen. Få obegränsade brev med Premium!'
          : 'Lås upp alla funktioner och maximera dina jobbchanser',
        priority: 'high',
        expected_impact: {
          user_value: 90,
          business_value: 95,
          implementation_effort: 5
        },
        action_items: [{
          id: 'upgrade_premium',
          description: 'Uppgradera för endast 149 kr/månad',
          cta_text: 'Uppgradera nu',
          url: '/prenumeration',
          tracking_event: 'recommendation_upgrade_clicked'
        }],
        personalization_score: isHittingLimits ? 1.0 : 0.7,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };
    }

    return null;
  }

  private async recommendContentImprovements(userId: string, letters: any[]): Promise<UserRecommendation[]> {
    const recommendations: UserRecommendation[] = [];

    if (letters.length > 0) {
      // Analyze saved vs unsaved ratio
      const savedRatio = letters.filter(l => l.is_saved).length / letters.length;

      if (savedRatio < 0.5) {
        recommendations.push({
          user_id: userId,
          type: 'content_improvement',
          title: 'Förbättra dina brev',
          description: 'Tips för att skapa mer effektiva personliga brev',
          priority: 'medium',
          expected_impact: {
            user_value: 70,
            business_value: 50,
            implementation_effort: 20
          },
          action_items: [
            {
              id: 'read_guide',
              description: 'Läs vår guide för bättre brev',
              cta_text: 'Läs guide',
              url: '/guider/personligt-brev'
            },
            {
              id: 'use_templates',
              description: 'Använd våra professionella mallar',
              cta_text: 'Se mallar',
              url: '/mallar'
            }
          ],
          personalization_score: 0.6
        });
      }
    }

    return recommendations;
  }

  private recommendLearning(user: any, activities: any[]): UserRecommendation[] {
    const recommendations: UserRecommendation[] = [];

    // Check user's industry/role from their content
    // This is simplified - in production would analyze actual content
    
    recommendations.push({
      user_id: user.id,
      type: 'learning_path',
      title: 'Utveckla dina färdigheter',
      description: 'Rekommenderade kurser baserat på din profil',
      priority: 'low',
      expected_impact: {
        user_value: 60,
        business_value: 40,
        implementation_effort: 30
      },
      action_items: [
        {
          id: 'linkedin_learning',
          description: 'LinkedIn Learning kurser',
          cta_text: 'Utforska kurser',
          url: 'https://www.linkedin.com/learning'
        },
        {
          id: 'skill_assessment',
          description: 'Gör en färdighetsanalys',
          cta_text: 'Starta analys',
          url: '/kompetensanalys'
        }
      ],
      personalization_score: 0.5
    });

    return recommendations;
  }

  private prioritizeRecommendations(recommendations: UserRecommendation[]): UserRecommendation[] {
    return recommendations.sort((a, b) => {
      // Sort by combined score
      const scoreA = (a.expected_impact.user_value + a.expected_impact.business_value) * a.personalization_score;
      const scoreB = (b.expected_impact.user_value + b.expected_impact.business_value) * b.personalization_score;
      return scoreB - scoreA;
    });
  }
}

/**
 * Pricing Optimization Engine
 * Recommends optimal pricing strategies
 */
export class PricingOptimizer {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async optimizePricing(): Promise<PricingRecommendation> {
    // Get current conversion metrics
    const conversionRate = await this.calculateConversionRate();
    const avgCustomerValue = await this.calculateCustomerLifetimeValue();
    const priceElasticity = await this.estimatePriceElasticity();

    // Get competitor pricing
    const competitors = this.getCompetitorPricing();

    // Calculate optimal price
    const currentPrice = 149;
    const optimalPrice = this.calculateOptimalPrice(
      currentPrice,
      conversionRate,
      priceElasticity,
      competitors
    );

    // Generate test groups for A/B testing
    const testGroups = this.generateTestGroups(currentPrice, optimalPrice);

    return {
      current_price: currentPrice,
      recommended_price: optimalPrice,
      reasoning: this.generatePricingReasoning(currentPrice, optimalPrice, conversionRate, competitors),
      expected_conversion_change: this.estimateConversionChange(currentPrice, optimalPrice, priceElasticity),
      expected_revenue_change: this.estimateRevenueChange(currentPrice, optimalPrice, conversionRate, priceElasticity),
      competitor_comparison: competitors,
      test_groups: testGroups
    };
  }

  private async calculateConversionRate(): Promise<number> {
    const { data: users } = await this.supabase
      .from('profiles')
      .select('subscription_tier, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!users || users.length === 0) return 0.1;

    const premiumCount = users.filter(u => u.subscription_tier === 'premium').length;
    return premiumCount / users.length;
  }

  private async calculateCustomerLifetimeValue(): Promise<number> {
    // Simplified CLV calculation
    const monthlyRevenue = 149;
    const avgRetentionMonths = 8; // Estimated
    return monthlyRevenue * avgRetentionMonths;
  }

  private async estimatePriceElasticity(): Promise<number> {
    // Simplified price elasticity estimation
    // In production, would use historical pricing data
    return -1.2; // Typical SaaS elasticity
  }

  private getCompetitorPricing(): CompetitorPrice[] {
    return [
      {
        competitor: 'CV24',
        price: 99,
        features: ['CV-mallar', 'Brev-mallar', 'Grundläggande tips']
      },
      {
        competitor: 'The Hub',
        price: 199,
        features: ['CV-granskning', 'Karriärcoaching', 'Jobbmatchning']
      },
      {
        competitor: 'Manpower',
        price: 299,
        features: ['Personlig coach', 'CV-skrivning', 'Intervjuträning']
      }
    ];
  }

  private calculateOptimalPrice(
    currentPrice: number,
    conversionRate: number,
    elasticity: number,
    competitors: CompetitorPrice[]
  ): number {
    // Calculate average competitor price
    const avgCompetitorPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
    
    // Factor in price elasticity
    const elasticityAdjustment = 1 + (elasticity * 0.1);
    
    // Calculate optimal price
    let optimal = currentPrice;
    
    if (conversionRate < 0.1) {
      // Low conversion - consider lowering price
      optimal = Math.max(currentPrice * 0.8, 99);
    } else if (conversionRate > 0.2) {
      // High conversion - room to increase
      optimal = Math.min(currentPrice * 1.2, avgCompetitorPrice);
    }
    
    // Round to nearest 10
    return Math.round(optimal / 10) * 10;
  }

  private generateTestGroups(currentPrice: number, optimalPrice: number): TestGroup[] {
    return [
      {
        name: 'Control',
        price: currentPrice,
        size_percentage: 50,
        expected_conversion: 0.15
      },
      {
        name: 'Test A',
        price: optimalPrice,
        size_percentage: 25,
        expected_conversion: 0.18
      },
      {
        name: 'Test B',
        price: Math.round((currentPrice + optimalPrice) / 2 / 10) * 10,
        size_percentage: 25,
        expected_conversion: 0.16
      }
    ];
  }

  private generatePricingReasoning(
    currentPrice: number,
    optimalPrice: number,
    conversionRate: number,
    competitors: CompetitorPrice[]
  ): string {
    const avgCompetitorPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
    
    if (optimalPrice < currentPrice) {
      return `Rekommenderar prissänkning till ${optimalPrice} kr baserat på låg konvertering (${(conversionRate * 100).toFixed(1)}%) och konkurrentpriser (snitt: ${avgCompetitorPrice} kr).`;
    } else if (optimalPrice > currentPrice) {
      return `Rekommenderar prishöjning till ${optimalPrice} kr baserat på hög konvertering (${(conversionRate * 100).toFixed(1)}%) och värdepositionering.`;
    } else {
      return `Nuvarande pris ${currentPrice} kr är optimalt baserat på marknadsposition och konverteringsdata.`;
    }
  }

  private estimateConversionChange(currentPrice: number, newPrice: number, elasticity: number): number {
    const priceChange = (newPrice - currentPrice) / currentPrice;
    return priceChange * elasticity;
  }

  private estimateRevenueChange(
    currentPrice: number,
    newPrice: number,
    conversionRate: number,
    elasticity: number
  ): number {
    const conversionChange = this.estimateConversionChange(currentPrice, newPrice, elasticity);
    const newConversionRate = conversionRate * (1 + conversionChange);
    
    const currentRevenue = currentPrice * conversionRate * 100; // Assuming 100 users
    const newRevenue = newPrice * newConversionRate * 100;
    
    return (newRevenue - currentRevenue) / currentRevenue;
  }
}

/**
 * Feature Recommendation Engine
 * Suggests new features based on user demand and business value
 */
export class FeatureRecommender {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async recommendFeatures(): Promise<FeatureRecommendation[]> {
    // Analyze user behavior and feedback
    const userDemand = await this.analyzeUserDemand();
    const competitorFeatures = this.analyzeCompetitorFeatures();
    const technicalFeasibility = this.assessTechnicalFeasibility();

    const features: FeatureRecommendation[] = [
      {
        feature_name: 'AI Interview Coach',
        description: 'AI-driven intervjuträning med branschspecifika frågor',
        user_demand_score: userDemand.interview_prep || 0.8,
        implementation_complexity: 'medium',
        expected_adoption_rate: 0.6,
        revenue_impact: 0.25,
        development_time_estimate: '2-3 veckor',
        dependencies: ['OpenAI API', 'Frågedatabas', 'Video/Audio inspelning']
      },
      {
        feature_name: 'Salary Negotiation Tool',
        description: 'Löneförhandlingsguide med marknadsdata',
        user_demand_score: userDemand.salary_info || 0.7,
        implementation_complexity: 'low',
        expected_adoption_rate: 0.5,
        revenue_impact: 0.15,
        development_time_estimate: '1 vecka',
        dependencies: ['Lönestatistik API', 'Branschdata']
      },
      {
        feature_name: 'LinkedIn Profile Optimizer',
        description: 'Automatisk optimering av LinkedIn-profil',
        user_demand_score: userDemand.linkedin || 0.75,
        implementation_complexity: 'high',
        expected_adoption_rate: 0.7,
        revenue_impact: 0.3,
        development_time_estimate: '4-6 veckor',
        dependencies: ['LinkedIn API', 'Web scraping', 'Chrome extension']
      },
      {
        feature_name: 'Job Application Tracker',
        description: 'Håll koll på alla jobbansökningar',
        user_demand_score: userDemand.tracking || 0.65,
        implementation_complexity: 'low',
        expected_adoption_rate: 0.4,
        revenue_impact: 0.1,
        development_time_estimate: '3-5 dagar',
        dependencies: ['Database schema update', 'UI components']
      },
      {
        feature_name: 'Video CV Creator',
        description: 'Skapa professionella video-CV:n',
        user_demand_score: userDemand.video_cv || 0.5,
        implementation_complexity: 'high',
        expected_adoption_rate: 0.3,
        revenue_impact: 0.2,
        development_time_estimate: '6-8 veckor',
        dependencies: ['Video processing', 'Storage', 'Recording interface']
      }
    ];

    return features.sort((a, b) => {
      // Sort by value/effort ratio
      const valueA = (a.user_demand_score * a.revenue_impact) / this.getComplexityScore(a.implementation_complexity);
      const valueB = (b.user_demand_score * b.revenue_impact) / this.getComplexityScore(b.implementation_complexity);
      return valueB - valueA;
    });
  }

  private async analyzeUserDemand(): Promise<Record<string, number>> {
    // In production, would analyze user feedback, support tickets, etc.
    return {
      interview_prep: 0.8,
      salary_info: 0.7,
      linkedin: 0.75,
      tracking: 0.65,
      video_cv: 0.5
    };
  }

  private analyzeCompetitorFeatures(): string[] {
    return [
      'Interview preparation',
      'Salary benchmarking',
      'Application tracking',
      'Skills assessment',
      'Career coaching'
    ];
  }

  private assessTechnicalFeasibility(): Record<string, boolean> {
    return {
      'AI Interview Coach': true,
      'Salary Negotiation Tool': true,
      'LinkedIn Profile Optimizer': false, // API restrictions
      'Job Application Tracker': true,
      'Video CV Creator': true
    };
  }

  private getComplexityScore(complexity: 'low' | 'medium' | 'high'): number {
    const scores = { low: 1, medium: 2, high: 3 };
    return scores[complexity];
  }
}

/**
 * Engagement Strategy Recommender
 * Recommends strategies to improve user engagement
 */
export class EngagementStrategyRecommender {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async recommendStrategies(): Promise<EngagementStrategy[]> {
    const strategies: EngagementStrategy[] = [];

    // Strategy for new users
    strategies.push({
      user_segment: 'New Users (0-7 days)',
      strategy_name: 'Onboarding Excellence',
      tactics: [
        {
          name: 'Welcome Email Series',
          description: 'Serie av 3 välkomstmail med tips och guider',
          channel: 'email',
          timing: 'Day 0, 2, 5',
          content_template: 'Välkommen! Här är 3 sätt att maximera dina jobbchanser...'
        },
        {
          name: 'First Success Push',
          description: 'Uppmuntra första brevet/CV-uppladdning',
          channel: 'in_app',
          timing: 'Day 1',
          content_template: 'Skapa ditt första personliga brev på 5 minuter!'
        }
      ],
      expected_retention_improvement: 0.25,
      expected_activity_increase: 0.4,
      cost_estimate: 50
    });

    // Strategy for at-risk users
    strategies.push({
      user_segment: 'At-Risk Users (14+ days inactive)',
      strategy_name: 'Win-Back Campaign',
      tactics: [
        {
          name: 'Re-engagement Email',
          description: 'Personligt mail med nya funktioner',
          channel: 'email',
          timing: 'Day 14 of inactivity',
          content_template: 'Vi saknar dig! Här är vad som är nytt...'
        },
        {
          name: 'Special Offer',
          description: 'Tidsbegränsat erbjudande',
          channel: 'email',
          timing: 'Day 21 of inactivity',
          content_template: '50% rabatt denna vecka endast!'
        }
      ],
      expected_retention_improvement: 0.15,
      expected_activity_increase: 0.2,
      cost_estimate: 100
    });

    // Strategy for power users
    strategies.push({
      user_segment: 'Power Users (10+ activities/week)',
      strategy_name: 'VIP Treatment',
      tactics: [
        {
          name: 'Exclusive Features',
          description: 'Tidig tillgång till nya funktioner',
          channel: 'in_app',
          timing: 'Monthly',
          content_template: 'Som VIP-användare får du exklusiv tillgång till...'
        },
        {
          name: 'Personal Success Manager',
          description: 'Dedikerad support och tips',
          channel: 'email',
          timing: 'Bi-weekly',
          content_template: 'Din personliga karriärcoach har tips för dig!'
        }
      ],
      expected_retention_improvement: 0.35,
      expected_activity_increase: 0.1,
      cost_estimate: 200
    });

    return strategies;
  }
}

/**
 * Main Recommendation Orchestrator
 */
export class RecommendationEngine {
  private userRecommender: UserRecommender;
  private pricingOptimizer: PricingOptimizer;
  private featureRecommender: FeatureRecommender;
  private engagementRecommender: EngagementStrategyRecommender;

  constructor() {
    this.userRecommender = new UserRecommender();
    this.pricingOptimizer = new PricingOptimizer();
    this.featureRecommender = new FeatureRecommender();
    this.engagementRecommender = new EngagementStrategyRecommender();
  }

  async generateAllRecommendations() {
    const [pricing, features, engagement] = await Promise.all([
      this.pricingOptimizer.optimizePricing(),
      this.featureRecommender.recommendFeatures(),
      this.engagementRecommender.recommendStrategies()
    ]);

    return {
      pricing_optimization: pricing,
      feature_recommendations: features,
      engagement_strategies: engagement,
      generated_at: new Date().toISOString(),
      executive_summary: this.generateExecutiveSummary(pricing, features, engagement)
    };
  }

  private generateExecutiveSummary(
    pricing: PricingRecommendation,
    features: FeatureRecommendation[],
    engagement: EngagementStrategy[]
  ): string {
    let summary = 'Executive Recommendations:\n\n';

    // Pricing recommendation
    if (pricing.recommended_price !== pricing.current_price) {
      summary += `💰 Pricing: ${pricing.reasoning}\n`;
      summary += `   Expected revenue impact: ${(pricing.expected_revenue_change * 100).toFixed(1)}%\n\n`;
    }

    // Top feature recommendation
    const topFeature = features[0];
    if (topFeature) {
      summary += `🚀 Priority Feature: ${topFeature.feature_name}\n`;
      summary += `   User demand: ${(topFeature.user_demand_score * 100).toFixed(0)}%\n`;
      summary += `   Revenue impact: ${(topFeature.revenue_impact * 100).toFixed(0)}%\n`;
      summary += `   Time to market: ${topFeature.development_time_estimate}\n\n`;
    }

    // Top engagement strategy
    const topStrategy = engagement.sort((a, b) => 
      b.expected_retention_improvement - a.expected_retention_improvement
    )[0];
    if (topStrategy) {
      summary += `📈 Engagement Focus: ${topStrategy.strategy_name}\n`;
      summary += `   Target: ${topStrategy.user_segment}\n`;
      summary += `   Expected retention lift: ${(topStrategy.expected_retention_improvement * 100).toFixed(0)}%\n`;
    }

    return summary;
  }

  async getUserRecommendations(userId: string): Promise<UserRecommendation[]> {
    return this.userRecommender.generateRecommendations(userId);
  }

  async getBusinessRecommendations() {
    const [pricing, features] = await Promise.all([
      this.pricingOptimizer.optimizePricing(),
      this.featureRecommender.recommendFeatures()
    ]);

    return {
      immediate_actions: [
        {
          action: 'A/B test pricing',
          description: `Test ${pricing.recommended_price} kr vs current ${pricing.current_price} kr`,
          priority: 'high',
          expected_impact: `${(pricing.expected_revenue_change * 100).toFixed(0)}% revenue change`
        },
        {
          action: 'Develop priority feature',
          description: `Build ${features[0].feature_name}`,
          priority: 'medium',
          expected_impact: `${(features[0].expected_adoption_rate * 100).toFixed(0)}% adoption rate`
        }
      ],
      metrics_to_watch: [
        'Conversion rate',
        'Customer lifetime value',
        'Feature adoption rates',
        'User engagement scores'
      ]
    };
  }
}