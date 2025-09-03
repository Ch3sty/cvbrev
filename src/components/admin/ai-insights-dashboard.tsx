'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  BarChart3,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Bell,
  Settings,
  Info
} from 'lucide-react';

// Import all analytics engines
import { PredictiveAnalyticsOrchestrator } from '@/lib/ai/analytics/predictive-analytics';
import { AutomaticInsightsEngine } from '@/lib/ai/analytics/automatic-insights';
import { SmartAlertingSystem } from '@/lib/ai/analytics/smart-alerts';
import { NLPAnalyticsEngine } from '@/lib/ai/analytics/nlp-analytics';
import { RecommendationEngine } from '@/lib/ai/analytics/recommendation-engine';

// Types for dashboard state
interface DashboardState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  activeTab: 'overview' | 'predictions' | 'insights' | 'alerts' | 'recommendations';
  timeRange: '24h' | '7d' | '30d' | '90d';
}

interface AnalyticsData {
  predictions: any;
  insights: any;
  alerts: any;
  recommendations: any;
  nlpAnalysis: any;
}

/**
 * AI Insights Dashboard Component
 * Comprehensive AI/ML analytics dashboard for admin interface
 */
export default function AIInsightsDashboard() {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    lastUpdated: null,
    activeTab: 'overview',
    timeRange: '7d'
  });

  const [data, setData] = useState<AnalyticsData>({
    predictions: null,
    insights: null,
    alerts: null,
    recommendations: null,
    nlpAnalysis: null
  });

  // Initialize analytics engines
  const [engines] = useState(() => ({
    predictive: new PredictiveAnalyticsOrchestrator(),
    insights: new AutomaticInsightsEngine(),
    alerts: new SmartAlertingSystem(),
    nlp: new NLPAnalyticsEngine(),
    recommendations: new RecommendationEngine()
  }));

  // Load all analytics data
  const loadAnalytics = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [predictions, insights, alerts, recommendations, nlpAnalysis] = await Promise.all([
        engines.predictive.generateFullAnalytics(),
        engines.insights.generateInsights(),
        engines.alerts.generateAlerts(),
        engines.recommendations.generateAllRecommendations(),
        engines.nlp.generateBatchInsights('letters', 50)
      ]);

      setData({
        predictions,
        insights,
        alerts,
        recommendations,
        nlpAnalysis
      });

      setState(prev => ({
        ...prev,
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load analytics'
      }));
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.timeRange]);

  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Översikt', icon: BarChart3 },
    { id: 'predictions', label: 'Prediktioner', icon: Brain },
    { id: 'insights', label: 'Insikter', icon: Sparkles },
    { id: 'alerts', label: 'Varningar', icon: Bell },
    { id: 'recommendations', label: 'Rekommendationer', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-purple-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-pink-500" />
              AI Insights Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Avancerad AI-driven analys och rekommendationer
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Time range selector */}
            <select
              value={state.timeRange}
              onChange={(e) => setState(prev => ({ ...prev, timeRange: e.target.value as any }))}
              className="bg-navy-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-pink-500"
            >
              <option value="24h">24 timmar</option>
              <option value="7d">7 dagar</option>
              <option value="30d">30 dagar</option>
              <option value="90d">90 dagar</option>
            </select>

            {/* Refresh button */}
            <button
              onClick={loadAnalytics}
              disabled={state.loading}
              className="bg-navy-700 text-white p-2 rounded-lg border border-gray-600 hover:border-pink-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${state.loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export button */}
            <button className="bg-navy-700 text-white p-2 rounded-lg border border-gray-600 hover:border-pink-500 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Last updated */}
        {state.lastUpdated && (
          <div className="mt-2 text-sm text-gray-500">
            Senast uppdaterad: {state.lastUpdated.toLocaleTimeString('sv-SE')}
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setState(prev => ({ ...prev, activeTab: tab.id as any }))}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              state.activeTab === tab.id
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {state.error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-200">{state.error}</p>
        </div>
      )}

      {/* Loading state */}
      {state.loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Analyserar data med AI...</p>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {!state.loading && !state.error && (
        <div className="space-y-6">
          {state.activeTab === 'overview' && (
            <OverviewTab data={data} />
          )}
          {state.activeTab === 'predictions' && (
            <PredictionsTab predictions={data.predictions} />
          )}
          {state.activeTab === 'insights' && (
            <InsightsTab insights={data.insights} />
          )}
          {state.activeTab === 'alerts' && (
            <AlertsTab alerts={data.alerts} />
          )}
          {state.activeTab === 'recommendations' && (
            <RecommendationsTab recommendations={data.recommendations} />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Overview Tab Component
 */
function OverviewTab({ data }: { data: AnalyticsData }) {
  const criticalMetrics = [
    {
      label: 'Churn Risk Users',
      value: data.predictions?.churn_analysis?.filter((u: any) => u.risk_level === 'high' || u.risk_level === 'critical').length || 0,
      change: '+12%',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      label: 'Hot Conversion Leads',
      value: data.predictions?.conversion_opportunities?.filter((u: any) => u.conversion_probability > 0.7).length || 0,
      change: '+25%',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      label: 'Revenue Forecast',
      value: `${data.predictions?.revenue_forecast?.[0]?.predicted_revenue || 0} SEK`,
      change: `+${(data.predictions?.revenue_forecast?.[0]?.growth_rate * 100 || 0).toFixed(1)}%`,
      icon: DollarSign,
      color: 'text-yellow-500'
    },
    {
      label: 'Active Alerts',
      value: data.alerts?.alerts?.length || 0,
      change: data.alerts?.alerts?.filter((a: any) => a.priority === 'critical').length + ' critical',
      icon: Bell,
      color: 'text-pink-500'
    }
  ];

  return (
    <div>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {criticalMetrics.map((metric, index) => (
          <div key={index} className="bg-navy-800 rounded-lg p-6 border border-gray-700 hover:border-pink-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">{metric.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{metric.value}</h3>
              </div>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <p className="text-sm text-gray-500">{metric.change}</p>
          </div>
        ))}
      </div>

      {/* Executive Summary */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-pink-500" />
          Executive Summary
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 whitespace-pre-line">
            {data.recommendations?.executive_summary || 'Generating summary...'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Snabbåtgärder</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Kontakta Risk-användare
          </button>
          <button className="bg-navy-700 text-white px-6 py-3 rounded-lg font-medium border border-gray-600 hover:border-pink-500 transition-colors">
            Starta A/B-test
          </button>
          <button className="bg-navy-700 text-white px-6 py-3 rounded-lg font-medium border border-gray-600 hover:border-pink-500 transition-colors">
            Exportera Rapport
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Predictions Tab Component
 */
function PredictionsTab({ predictions }: { predictions: any }) {
  if (!predictions) return <div>Loading predictions...</div>;

  return (
    <div className="space-y-6">
      {/* Churn Predictions */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Churn Predictions</h2>
        <div className="space-y-3">
          {predictions.churn_analysis?.slice(0, 5).map((user: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-navy-700 rounded-lg">
              <div>
                <p className="text-white font-medium">User {user.user_id.slice(0, 8)}...</p>
                <p className="text-gray-400 text-sm">{user.risk_factors.join(', ')}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.risk_level === 'critical' ? 'bg-red-500 text-white' :
                  user.risk_level === 'high' ? 'bg-orange-500 text-white' :
                  user.risk_level === 'medium' ? 'bg-yellow-500 text-black' :
                  'bg-green-500 text-white'
                }`}>
                  {user.risk_level}
                </div>
                <span className="text-white font-bold">{(user.churn_probability * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Predictions */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Conversion Opportunities</h2>
        <div className="space-y-3">
          {predictions.conversion_opportunities?.slice(0, 5).map((user: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-navy-700 rounded-lg">
              <div>
                <p className="text-white font-medium">User {user.user_id.slice(0, 8)}...</p>
                <p className="text-gray-400 text-sm">{user.optimal_offer}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-green-400 font-bold">
                  {(user.conversion_probability * 100).toFixed(0)}%
                </div>
                <button className="px-4 py-1 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 transition-colors">
                  Kontakta
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Revenue Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions.revenue_forecast?.slice(0, 3).map((forecast: any, index: number) => (
            <div key={index} className="bg-navy-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">{forecast.period}</p>
              <p className="text-2xl font-bold text-white mt-2">{forecast.predicted_revenue} SEK</p>
              <p className="text-sm text-gray-500 mt-1">
                {forecast.confidence_interval.low} - {forecast.confidence_interval.high} SEK
              </p>
              <div className="mt-3 space-y-1">
                {forecast.factors.slice(0, 2).map((factor: any, idx: number) => (
                  <p key={idx} className="text-xs text-gray-400">
                    {factor.factor}: {(factor.impact * 100).toFixed(0)}%
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Insights Tab Component
 */
function InsightsTab({ insights }: { insights: any }) {
  if (!insights) return <div>Loading insights...</div>;

  return (
    <div className="space-y-6">
      {/* Anomalies */}
      {insights.anomalies?.length > 0 && (
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Detected Anomalies</h2>
          <div className="space-y-3">
            {insights.anomalies.map((anomaly: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                anomaly.severity === 'critical' ? 'bg-red-900/20 border-red-500' :
                anomaly.severity === 'high' ? 'bg-orange-900/20 border-orange-500' :
                anomaly.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                'bg-blue-900/20 border-blue-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{anomaly.description}</p>
                    <p className="text-gray-400 text-sm mt-1">{anomaly.recommended_action}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    anomaly.severity === 'critical' ? 'bg-red-500 text-white' :
                    anomaly.severity === 'high' ? 'bg-orange-500 text-white' :
                    anomaly.severity === 'medium' ? 'bg-yellow-500 text-black' :
                    'bg-blue-500 text-white'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.trends?.map((trend: any, index: number) => (
            <div key={index} className="bg-navy-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">{trend.metric}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className={`w-5 h-5 ${
                  trend.direction === 'increasing' ? 'text-green-500' :
                  trend.direction === 'decreasing' ? 'text-red-500 rotate-180' :
                  'text-gray-500'
                }`} />
                <span className="text-xl font-bold text-white">
                  {Math.abs(trend.change_percentage).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{trend.forecast}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort Analysis */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Cohort Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-3">Cohort</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Retention</th>
                <th className="pb-3">LTV</th>
                <th className="pb-3">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {insights.cohorts?.map((cohort: any, index: number) => (
                <tr key={index} className="border-t border-gray-700">
                  <td className="py-3 text-white">{cohort.cohort_name}</td>
                  <td className="py-3 text-gray-300">{cohort.size}</td>
                  <td className="py-3 text-gray-300">{(cohort.retention_rate * 100).toFixed(0)}%</td>
                  <td className="py-3 text-gray-300">{cohort.ltv} SEK</td>
                  <td className="py-3 text-gray-300">{(cohort.conversion_rate * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Alerts Tab Component
 */
function AlertsTab({ alerts }: { alerts: any }) {
  if (!alerts) return <div>Loading alerts...</div>;

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Active Alerts</h2>
          <span className="px-3 py-1 bg-pink-500 text-white rounded-full text-sm">
            {alerts.alerts?.length || 0} active
          </span>
        </div>
        
        <div className="space-y-3">
          {alerts.alerts?.map((alert: any, index: number) => (
            <div key={index} className={`p-4 rounded-lg border ${
              alert.priority === 'critical' ? 'bg-red-900/20 border-red-500' :
              alert.priority === 'high' ? 'bg-orange-900/20 border-orange-500' :
              alert.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
              'bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-medium">{alert.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.priority === 'critical' ? 'bg-red-500 text-white' :
                  alert.priority === 'high' ? 'bg-orange-500 text-white' :
                  alert.priority === 'medium' ? 'bg-yellow-500 text-black' :
                  'bg-blue-500 text-white'
                }`}>
                  {alert.priority}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{alert.description}</p>
              
              {/* Recommended Actions */}
              <div className="space-y-2">
                {alert.recommended_actions?.slice(0, 2).map((action: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-300">{action.description}</span>
                    {action.type === 'automatic' && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">Auto</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Impact metrics */}
              {alert.affected_users && (
                <div className="mt-3 pt-3 border-t border-gray-700 flex gap-4 text-sm">
                  <span className="text-gray-400">
                    Affected users: <span className="text-white font-medium">{alert.affected_users}</span>
                  </span>
                  {alert.estimated_loss && (
                    <span className="text-gray-400">
                      Est. loss: <span className="text-red-400 font-medium">{alert.estimated_loss} SEK</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resource Optimizations */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Resource Optimizations</h2>
        <div className="space-y-4">
          {alerts.optimizations?.map((opt: any, index: number) => (
            <div key={index} className="bg-navy-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">{opt.resource}</h3>
                <span className="text-green-400 font-bold">
                  Save {opt.potential_savings.toFixed(0)} SEK/month
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Current</span>
                  <span>Optimal</span>
                </div>
                <div className="bg-navy-600 rounded-full h-2 relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-pink-500 rounded-full"
                    style={{ width: `${(opt.optimal_usage / opt.current_usage) * 100}%` }}
                  ></div>
                </div>
              </div>
              <ul className="space-y-1">
                {opt.recommendations?.slice(0, 2).map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Recommendations Tab Component
 */
function RecommendationsTab({ recommendations }: { recommendations: any }) {
  if (!recommendations) return <div>Loading recommendations...</div>;

  return (
    <div className="space-y-6">
      {/* Pricing Optimization */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Pricing Optimization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400 mb-2">Current vs Recommended</p>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-sm text-gray-500">Current</p>
                <p className="text-2xl font-bold text-white">
                  {recommendations.pricing_optimization?.current_price} SEK
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-500 mb-2" />
              <div>
                <p className="text-sm text-gray-500">Recommended</p>
                <p className="text-2xl font-bold text-green-400">
                  {recommendations.pricing_optimization?.recommended_price} SEK
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              {recommendations.pricing_optimization?.reasoning}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">Expected Impact</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Conversion change</span>
                <span className="text-white font-medium">
                  {(recommendations.pricing_optimization?.expected_conversion_change * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Revenue change</span>
                <span className="text-green-400 font-medium">
                  +{(recommendations.pricing_optimization?.expected_revenue_change * 100 || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Recommendations */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Feature Recommendations</h2>
        <div className="space-y-4">
          {recommendations.feature_recommendations?.slice(0, 3).map((feature: any, index: number) => (
            <div key={index} className="bg-navy-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-medium">{feature.feature_name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  feature.implementation_complexity === 'low' ? 'bg-green-500 text-white' :
                  feature.implementation_complexity === 'medium' ? 'bg-yellow-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  {feature.implementation_complexity} complexity
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-gray-500">User Demand</p>
                  <p className="text-white font-medium">
                    {(feature.user_demand_score * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Revenue Impact</p>
                  <p className="text-green-400 font-medium">
                    +{(feature.revenue_impact * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Time Estimate</p>
                  <p className="text-white font-medium">{feature.development_time_estimate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Strategies */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Engagement Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.engagement_strategies?.map((strategy: any, index: number) => (
            <div key={index} className="bg-navy-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-1">{strategy.strategy_name}</h3>
              <p className="text-gray-400 text-sm mb-3">{strategy.user_segment}</p>
              
              <div className="space-y-2 mb-3">
                {strategy.tactics?.slice(0, 2).map((tactic: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <p className="text-gray-300">{tactic.name}</p>
                    <p className="text-gray-500 text-xs">{tactic.channel} - {tactic.timing}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between text-sm pt-3 border-t border-gray-600">
                <span className="text-gray-500">Retention lift</span>
                <span className="text-green-400 font-medium">
                  +{(strategy.expected_retention_improvement * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}