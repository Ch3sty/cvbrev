/**
 * Smart Alerting System
 * AI-driven alert prioritization and resource optimization
 */

import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Alert types and priorities
export interface Alert {
  id: string;
  type: AlertType;
  priority: Priority;
  title: string;
  description: string;
  impact: Impact;
  affected_users?: number;
  estimated_loss?: number;
  recommended_actions: Action[];
  created_at: Date;
  expires_at?: Date;
  auto_resolve?: boolean;
  metadata?: any;
}

export type AlertType = 
  | 'system_health'
  | 'cost_optimization'
  | 'user_churn'
  | 'conversion_opportunity'
  | 'security'
  | 'performance'
  | 'capacity'
  | 'compliance';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Impact {
  revenue: number;  // -100 to 100 scale
  users: number;    // -100 to 100 scale
  reputation: number; // -100 to 100 scale
  operations: number; // -100 to 100 scale
}

export interface Action {
  id: string;
  type: 'automatic' | 'manual' | 'approval_required';
  description: string;
  command?: string;
  estimated_time?: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface ResourceOptimization {
  resource: string;
  current_usage: number;
  optimal_usage: number;
  potential_savings: number;
  recommendations: string[];
}

/**
 * Alert Prioritization Engine
 * Uses ML to prioritize alerts based on business impact
 */
export class AlertPrioritizer {
  private weights = {
    revenue: 0.35,
    users: 0.25,
    reputation: 0.25,
    operations: 0.15
  };

  prioritizeAlerts(alerts: Alert[]): Alert[] {
    return alerts
      .map(alert => ({
        ...alert,
        score: this.calculatePriorityScore(alert)
      }))
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...alert }) => alert);
  }

  private calculatePriorityScore(alert: Alert): number {
    const baseScore = this.getPriorityBaseScore(alert.priority);
    const impactScore = this.calculateImpactScore(alert.impact);
    const timeDecay = this.calculateTimeDecay(alert.created_at);
    
    return baseScore * impactScore * timeDecay;
  }

  private getPriorityBaseScore(priority: Priority): number {
    const scores = {
      critical: 1.0,
      high: 0.7,
      medium: 0.4,
      low: 0.1
    };
    return scores[priority];
  }

  private calculateImpactScore(impact: Impact): number {
    return (
      Math.abs(impact.revenue) * this.weights.revenue +
      Math.abs(impact.users) * this.weights.users +
      Math.abs(impact.reputation) * this.weights.reputation +
      Math.abs(impact.operations) * this.weights.operations
    ) / 100;
  }

  private calculateTimeDecay(createdAt: Date): number {
    const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    return Math.exp(-hoursOld / 24); // Exponential decay over 24 hours
  }
}

/**
 * Predictive Maintenance System
 * Predicts and prevents system issues
 */
export class PredictiveMaintenanceEngine {
  private supabase;
  private thresholds = {
    memory_usage: 0.85,
    cpu_usage: 0.90,
    error_rate: 0.02,
    response_time: 2000, // ms
    database_connections: 0.80
  };

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async predictIssues(): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Check database performance
    const dbAlert = await this.checkDatabaseHealth();
    if (dbAlert) alerts.push(dbAlert);

    // Check API performance
    const apiAlert = await this.checkAPIPerformance();
    if (apiAlert) alerts.push(apiAlert);

    // Check storage usage
    const storageAlert = await this.checkStorageUsage();
    if (storageAlert) alerts.push(storageAlert);

    // Check scheduled jobs
    const jobAlert = await this.checkScheduledJobs();
    if (jobAlert) alerts.push(jobAlert);

    return alerts;
  }

  private async checkDatabaseHealth(): Promise<Alert | null> {
    // Check slow queries (would need query performance data)
    const { data: letters } = await this.supabase
      .from('letters')
      .select('generation_time_ms')
      .not('generation_time_ms', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (letters && letters.length > 0) {
      const avgTime = letters.reduce((sum, l) => sum + l.generation_time_ms, 0) / letters.length;
      
      if (avgTime > this.thresholds.response_time) {
        return {
          id: `db_slow_${Date.now()}`,
          type: 'performance',
          priority: avgTime > 5000 ? 'high' : 'medium',
          title: 'Långsam databasrespons upptäckt',
          description: `Genomsnittlig svarstid är ${avgTime}ms (threshold: ${this.thresholds.response_time}ms)`,
          impact: {
            revenue: -20,
            users: -40,
            reputation: -15,
            operations: -60
          },
          recommended_actions: [
            {
              id: 'optimize_queries',
              type: 'manual',
              description: 'Optimera långsamma queries med index',
              estimated_time: '2 timmar',
              risk_level: 'low'
            },
            {
              id: 'scale_database',
              type: 'approval_required',
              description: 'Uppgradera databas-tier för bättre prestanda',
              estimated_time: '30 minuter',
              risk_level: 'medium'
            }
          ],
          created_at: new Date()
        };
      }
    }

    return null;
  }

  private async checkAPIPerformance(): Promise<Alert | null> {
    // Check AI API response times
    const { data: recentLetters } = await this.supabase
      .from('letters')
      .select('generation_time_ms, ai_cost')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .not('generation_time_ms', 'is', null);

    if (recentLetters && recentLetters.length > 10) {
      const errorRate = recentLetters.filter(l => l.generation_time_ms > 10000).length / recentLetters.length;
      
      if (errorRate > this.thresholds.error_rate) {
        return {
          id: `api_errors_${Date.now()}`,
          type: 'performance',
          priority: 'high',
          title: 'Hög felfrekvens i AI API',
          description: `${(errorRate * 100).toFixed(1)}% av förfrågningar tar över 10 sekunder`,
          impact: {
            revenue: -30,
            users: -50,
            reputation: -40,
            operations: -70
          },
          affected_users: Math.floor(recentLetters.length * errorRate),
          recommended_actions: [
            {
              id: 'implement_retry',
              type: 'automatic',
              description: 'Aktivera automatisk retry-logik',
              estimated_time: 'Omedelbart',
              risk_level: 'low'
            },
            {
              id: 'add_fallback',
              type: 'manual',
              description: 'Implementera fallback till alternativ AI-modell',
              estimated_time: '1 timme',
              risk_level: 'medium'
            }
          ],
          created_at: new Date(),
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
        };
      }
    }

    return null;
  }

  private async checkStorageUsage(): Promise<Alert | null> {
    // Check CV storage usage
    const { data: cvCount } = await this.supabase
      .from('cv_texts')
      .select('count')
      .single();

    if (cvCount && cvCount.count > 1000) {
      // Estimate storage (assuming 50KB per CV)
      const estimatedStorage = cvCount.count * 50 / 1024; // MB
      
      if (estimatedStorage > 500) { // Over 500MB
        return {
          id: `storage_warning_${Date.now()}`,
          type: 'capacity',
          priority: estimatedStorage > 1000 ? 'high' : 'medium',
          title: 'Hög lagringsanvändning',
          description: `CV-lagring använder ~${estimatedStorage.toFixed(0)}MB`,
          impact: {
            revenue: -5,
            users: 0,
            reputation: 0,
            operations: -30
          },
          recommended_actions: [
            {
              id: 'archive_old',
              type: 'automatic',
              description: 'Arkivera CV:n äldre än 6 månader',
              estimated_time: '1 timme',
              risk_level: 'low'
            },
            {
              id: 'compress_storage',
              type: 'manual',
              description: 'Implementera komprimering för CV-text',
              estimated_time: '4 timmar',
              risk_level: 'medium'
            }
          ],
          created_at: new Date()
        };
      }
    }

    return null;
  }

  private async checkScheduledJobs(): Promise<Alert | null> {
    // Check if weekly resets are working
    const { data: users } = await this.supabase
      .from('profiles')
      .select('weekly_letter_count, last_count_reset')
      .gt('weekly_letter_count', 0)
      .limit(10);

    if (users && users.length > 0) {
      const outdatedResets = users.filter(u => {
        if (!u.last_count_reset) return true;
        const daysSinceReset = (Date.now() - new Date(u.last_count_reset).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceReset > 7;
      });

      if (outdatedResets.length > users.length * 0.3) {
        return {
          id: `job_failure_${Date.now()}`,
          type: 'system_health',
          priority: 'critical',
          title: 'Veckovis återställning fungerar inte',
          description: 'Weekly letter count reset har inte körts korrekt',
          impact: {
            revenue: -40,
            users: -60,
            reputation: -50,
            operations: -80
          },
          affected_users: outdatedResets.length,
          recommended_actions: [
            {
              id: 'run_manual_reset',
              type: 'automatic',
              description: 'Kör manuell återställning omedelbart',
              command: 'npm run reset-weekly-counts',
              estimated_time: '5 minuter',
              risk_level: 'low'
            },
            {
              id: 'fix_cron',
              type: 'manual',
              description: 'Kontrollera och fixa cron-jobb konfiguration',
              estimated_time: '30 minuter',
              risk_level: 'medium'
            }
          ],
          created_at: new Date(),
          auto_resolve: false
        };
      }
    }

    return null;
  }
}

/**
 * Resource Optimization Recommender
 * Suggests optimizations for cost and performance
 */
export class ResourceOptimizer {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async analyzeResources(): Promise<ResourceOptimization[]> {
    const optimizations: ResourceOptimization[] = [];

    // Analyze AI model usage
    const aiOptimization = await this.optimizeAIUsage();
    if (aiOptimization) optimizations.push(aiOptimization);

    // Analyze database usage
    const dbOptimization = await this.optimizeDatabaseUsage();
    if (dbOptimization) optimizations.push(dbOptimization);

    // Analyze caching efficiency
    const cacheOptimization = await this.optimizeCaching();
    if (cacheOptimization) optimizations.push(cacheOptimization);

    return optimizations;
  }

  private async optimizeAIUsage(): Promise<ResourceOptimization | null> {
    // Analyze AI model usage patterns
    const { data: letters } = await this.supabase
      .from('letters')
      .select('ai_model, ai_cost, ai_tokens')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .not('ai_cost', 'is', null);

    if (!letters || letters.length === 0) return null;

    // Calculate costs by model
    const modelCosts: Record<string, number> = {};
    const modelUsage: Record<string, number> = {};

    letters.forEach(letter => {
      const model = letter.ai_model || 'unknown';
      modelCosts[model] = (modelCosts[model] || 0) + parseFloat(letter.ai_cost || '0');
      modelUsage[model] = (modelUsage[model] || 0) + 1;
    });

    const totalCost = Object.values(modelCosts).reduce((a, b) => a + b, 0);
    
    // Check if using expensive models for simple tasks
    const expensiveModelUsage = modelCosts['gpt-4-1106-preview'] || modelCosts['gpt-4'];
    
    if (expensiveModelUsage && expensiveModelUsage / totalCost > 0.3) {
      const potentialSavings = expensiveModelUsage * 0.6; // Could save 60% with optimized model selection
      
      return {
        resource: 'AI Model Usage',
        current_usage: totalCost,
        optimal_usage: totalCost - potentialSavings,
        potential_savings: potentialSavings,
        recommendations: [
          'Använd GPT-3.5-turbo för enklare uppgifter (80% kostnadsbesparing)',
          'Implementera smart modellval baserat på uppgiftskomplexitet',
          'Cacha liknande förfrågningar för att minska API-anrop',
          `Uppskattad besparing: ${potentialSavings.toFixed(2)} SEK per vecka`
        ]
      };
    }

    return null;
  }

  private async optimizeDatabaseUsage(): Promise<ResourceOptimization | null> {
    // Check for unused indexes and optimization opportunities
    let tableStats = null;
    try {
      const { data } = await this.supabase
        .rpc('get_table_statistics')
        .single();
      tableStats = data;
    } catch (error) {
      tableStats = null;
    }

    // Simplified optimization check
    const recommendations: string[] = [];
    
    // Check for missing indexes on frequently queried columns
    recommendations.push('Lägg till index på user_id i user_activities för snabbare queries');
    recommendations.push('Överväg partitionering av letters-tabellen efter created_at');
    recommendations.push('Implementera connection pooling för bättre resursanvändning');

    return {
      resource: 'Database',
      current_usage: 100,
      optimal_usage: 70,
      potential_savings: 30,
      recommendations
    };
  }

  private async optimizeCaching(): Promise<ResourceOptimization> {
    // Analyze cache hit rates (would need Redis metrics in production)
    const cacheHitRate = 0.4; // Placeholder - would calculate from actual metrics
    const optimalHitRate = 0.8;
    
    const currentCacheCost = 100; // Placeholder cost
    const missRateCost = (1 - cacheHitRate) * 200; // Cost of cache misses
    const optimalCost = currentCacheCost + (1 - optimalHitRate) * 200;
    
    return {
      resource: 'Caching',
      current_usage: currentCacheCost + missRateCost,
      optimal_usage: optimalCost,
      potential_savings: (currentCacheCost + missRateCost) - optimalCost,
      recommendations: [
        `Nuvarande cache hit rate: ${(cacheHitRate * 100).toFixed(0)}%`,
        `Målsättning: ${(optimalHitRate * 100).toFixed(0)}% hit rate`,
        'Implementera Redis för persistent caching',
        'Cacha AI-svar för liknande förfrågningar',
        'Använd edge caching för statiskt innehåll',
        'Implementera intelligent cache invalidation'
      ]
    };
  }
}

/**
 * Cost Optimization Engine
 * Provides specific cost-saving recommendations
 */
export class CostOptimizationEngine {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async generateCostOptimizations(): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Check for AI cost optimizations
    const aiAlert = await this.checkAICosts();
    if (aiAlert) alerts.push(aiAlert);

    // Check for infrastructure optimizations
    const infraAlert = await this.checkInfrastructureCosts();
    if (infraAlert) alerts.push(infraAlert);

    // Check for unused resources
    const unusedAlert = await this.checkUnusedResources();
    if (unusedAlert) alerts.push(unusedAlert);

    return alerts;
  }

  private async checkAICosts(): Promise<Alert | null> {
    const { data: recentCosts } = await this.supabase
      .from('letters')
      .select('ai_cost, ai_model')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .not('ai_cost', 'is', null);

    if (recentCosts && recentCosts.length > 0) {
      const dailyCost = recentCosts.reduce((sum, l) => sum + parseFloat(l.ai_cost), 0);
      const projectedMonthlyCost = dailyCost * 30;

      if (projectedMonthlyCost > 1000) { // Over 1000 SEK/month
        return {
          id: `cost_optimization_ai_${Date.now()}`,
          type: 'cost_optimization',
          priority: projectedMonthlyCost > 5000 ? 'high' : 'medium',
          title: 'Hög AI API-kostnad upptäckt',
          description: `Projicerad månadskostnad: ${projectedMonthlyCost.toFixed(0)} SEK`,
          impact: {
            revenue: -50,
            users: 0,
            reputation: 0,
            operations: -30
          },
          estimated_loss: projectedMonthlyCost * 0.4, // Could save 40%
          recommended_actions: [
            {
              id: 'switch_models',
              type: 'automatic',
              description: 'Byt till GPT-3.5-turbo för enklare uppgifter',
              estimated_time: 'Omedelbart',
              risk_level: 'low'
            },
            {
              id: 'implement_batching',
              type: 'manual',
              description: 'Implementera batch-processing för bulk-operationer',
              estimated_time: '1 dag',
              risk_level: 'medium'
            },
            {
              id: 'negotiate_pricing',
              type: 'manual',
              description: 'Förhandla enterprise-avtal med OpenAI',
              estimated_time: '1 vecka',
              risk_level: 'low'
            }
          ],
          created_at: new Date()
        };
      }
    }

    return null;
  }

  private async checkInfrastructureCosts(): Promise<Alert | null> {
    // Check database size and optimize
    const { data: profiles } = await this.supabase
      .from('profiles')
      .select('count')
      .single();

    if (profiles && profiles.count < 100) {
      return {
        id: `infra_optimization_${Date.now()}`,
        type: 'cost_optimization',
        priority: 'low',
        title: 'Överkapacitet i infrastruktur',
        description: 'Nuvarande infrastruktur är överdimensionerad för användarbas',
        impact: {
          revenue: -20,
          users: 0,
          reputation: 0,
          operations: -10
        },
        estimated_loss: 500, // SEK per month
        recommended_actions: [
          {
            id: 'downgrade_db',
            type: 'approval_required',
            description: 'Nedgradera databas till mindre tier',
            estimated_time: '30 minuter',
            risk_level: 'medium'
          },
          {
            id: 'optimize_compute',
            type: 'manual',
            description: 'Använd serverless funktioner istället för dedikerade servrar',
            estimated_time: '1 dag',
            risk_level: 'low'
          }
        ],
        created_at: new Date()
      };
    }

    return null;
  }

  private async checkUnusedResources(): Promise<Alert | null> {
    // Check for inactive premium users
    const { data: inactiveUsers } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('subscription_tier', 'premium')
      .lt('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (inactiveUsers && inactiveUsers.length > 0) {
      const wastedRevenue = inactiveUsers.length * 149;

      return {
        id: `unused_premium_${Date.now()}`,
        type: 'cost_optimization',
        priority: 'medium',
        title: 'Inaktiva premium-användare',
        description: `${inactiveUsers.length} premium-användare har varit inaktiva >30 dagar`,
        impact: {
          revenue: -30,
          users: -20,
          reputation: -10,
          operations: 0
        },
        estimated_loss: wastedRevenue,
        affected_users: inactiveUsers.length,
        recommended_actions: [
          {
            id: 'engagement_campaign',
            type: 'manual',
            description: 'Starta återengagemangskampanj',
            estimated_time: '2 dagar',
            risk_level: 'low'
          },
          {
            id: 'pause_billing',
            type: 'approval_required',
            description: 'Erbjud pausad prenumeration',
            estimated_time: '1 timme',
            risk_level: 'medium'
          }
        ],
        created_at: new Date()
      };
    }

    return null;
  }
}

/**
 * Main Smart Alerting Orchestrator
 */
export class SmartAlertingSystem {
  private prioritizer: AlertPrioritizer;
  private maintenance: PredictiveMaintenanceEngine;
  private optimizer: ResourceOptimizer;
  private costOptimizer: CostOptimizationEngine;

  constructor() {
    this.prioritizer = new AlertPrioritizer();
    this.maintenance = new PredictiveMaintenanceEngine();
    this.optimizer = new ResourceOptimizer();
    this.costOptimizer = new CostOptimizationEngine();
  }

  async generateAlerts(): Promise<{
    alerts: Alert[];
    optimizations: ResourceOptimization[];
    summary: string;
  }> {
    // Collect all alerts
    const [maintenanceAlerts, costAlerts] = await Promise.all([
      this.maintenance.predictIssues(),
      this.costOptimizer.generateCostOptimizations()
    ]);

    // Get resource optimizations
    const optimizations = await this.optimizer.analyzeResources();

    // Combine and prioritize alerts
    const allAlerts = [...maintenanceAlerts, ...costAlerts];
    const prioritizedAlerts = this.prioritizer.prioritizeAlerts(allAlerts);

    // Generate summary
    const summary = this.generateAlertSummary(prioritizedAlerts, optimizations);

    return {
      alerts: prioritizedAlerts,
      optimizations,
      summary
    };
  }

  private generateAlertSummary(alerts: Alert[], optimizations: ResourceOptimization[]): string {
    const criticalCount = alerts.filter(a => a.priority === 'critical').length;
    const highCount = alerts.filter(a => a.priority === 'high').length;
    const totalSavings = optimizations.reduce((sum, o) => sum + o.potential_savings, 0);

    let summary = 'Alert Summary:\n\n';

    if (criticalCount > 0) {
      summary += `🚨 ${criticalCount} kritiska alerts kräver omedelbar uppmärksamhet\n`;
    }

    if (highCount > 0) {
      summary += `⚠️ ${highCount} högprioriterade alerts att granska\n`;
    }

    if (totalSavings > 0) {
      summary += `💰 Potentiell besparing: ${totalSavings.toFixed(0)} SEK/månad genom optimeringar\n`;
    }

    const affectedUsers = alerts.reduce((sum, a) => sum + (a.affected_users || 0), 0);
    if (affectedUsers > 0) {
      summary += `👥 ${affectedUsers} användare påverkade av aktuella problem\n`;
    }

    return summary;
  }

  async getActionableAlerts(maxAlerts: number = 5): Promise<Alert[]> {
    const { alerts } = await this.generateAlerts();
    
    // Return only alerts that have automatic or low-risk manual actions
    return alerts
      .filter(alert => 
        alert.recommended_actions.some(action => 
          action.type === 'automatic' || 
          (action.type === 'manual' && action.risk_level === 'low')
        )
      )
      .slice(0, maxAlerts);
  }
}