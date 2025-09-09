'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  LightBulbIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface UserPrediction {
  user_id: string;
  email: string;
  churn_probability: number;
  conversion_probability: number;
  engagement_score: number;
  recommended_action: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface ContentInsight {
  content_type: string;
  performance_score: number;
  usage_count: number;
  success_rate: number;
  avg_quality_score: number;
}

interface AIRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimated_value: string;
  implementation_effort: 'easy' | 'moderate' | 'complex';
}

export default function AIInsightsDashboard() {
  const [activeTab, setActiveTab] = useState<'predictions' | 'insights' | 'recommendations' | 'optimization'>('predictions');
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>([]);
  const [contentInsights, setContentInsights] = useState<ContentInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [optimizationMetrics, setOptimizationMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAIInsights();
    const interval = setInterval(fetchAIInsights, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAIInsights = async () => {
    try {
      // Fetch user data for predictions
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, user_activities(*)');

      // Generate AI predictions (in production, these would come from ML models)
      const predictions = generateUserPredictions(profiles || []);
      setUserPredictions(predictions);

      // Generate content insights
      const insights = generateContentInsights();
      setContentInsights(insights);

      // Generate AI recommendations
      const recs = generateRecommendations();
      setRecommendations(recs);

      // Generate optimization metrics
      const metrics = generateOptimizationMetrics();
      setOptimizationMetrics(metrics);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setLoading(false);
    }
  };

  const generateUserPredictions = (profiles: any[]): UserPrediction[] => {
    return profiles.slice(0, 10).map(profile => ({
      user_id: profile.id,
      email: profile.email || 'user@example.com',
      churn_probability: Math.random() * 100,
      conversion_probability: Math.random() * 100,
      engagement_score: Math.random() * 100,
      recommended_action: getRecommendedAction(Math.random()),
      risk_level: getRiskLevel(Math.random())
    }));
  };

  const getRecommendedAction = (score: number): string => {
    if (score < 0.25) return 'Send re-engagement email';
    if (score < 0.5) return 'Offer premium trial';
    if (score < 0.75) return 'Provide personalized content';
    return 'Maintain current engagement';
  };

  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score < 0.25) return 'low';
    if (score < 0.5) return 'medium';
    if (score < 0.75) return 'high';
    return 'critical';
  };

  const generateContentInsights = (): ContentInsight[] => {
    return [
      {
        content_type: 'Tech CV',
        performance_score: 92,
        usage_count: 1234,
        success_rate: 87,
        avg_quality_score: 8.5
      },
      {
        content_type: 'Sales Letter',
        performance_score: 88,
        usage_count: 987,
        success_rate: 82,
        avg_quality_score: 8.2
      },
      {
        content_type: 'Marketing CV',
        performance_score: 85,
        usage_count: 756,
        success_rate: 79,
        avg_quality_score: 7.9
      },
      {
        content_type: 'Engineering Letter',
        performance_score: 90,
        usage_count: 543,
        success_rate: 85,
        avg_quality_score: 8.7
      }
    ];
  };

  const generateRecommendations = (): AIRecommendation[] => {
    return [
      {
        id: '1',
        category: 'Revenue',
        title: 'Implement Dynamic Pricing',
        description: 'AI analysis suggests 15-20% revenue increase with personalized pricing based on user segments',
        impact: 'high',
        estimated_value: '+35,000 SEK/month',
        implementation_effort: 'moderate'
      },
      {
        id: '2',
        category: 'Retention',
        title: 'Launch AI Interview Coach',
        description: 'Most requested feature by 67% of churned users. Could reduce churn by 25%',
        impact: 'high',
        estimated_value: '-25% churn rate',
        implementation_effort: 'complex'
      },
      {
        id: '3',
        category: 'Engagement',
        title: 'Add Gamification Elements',
        description: 'Increase user engagement by 40% with achievement badges and progress tracking',
        impact: 'medium',
        estimated_value: '+40% engagement',
        implementation_effort: 'easy'
      },
      {
        id: '4',
        category: 'Cost',
        title: 'Optimize AI Model Usage',
        description: 'Switch to GPT-3.5-turbo for 60% of requests to reduce costs by 8,000 SEK/month',
        impact: 'medium',
        estimated_value: '-8,000 SEK/month',
        implementation_effort: 'easy'
      }
    ];
  };

  const generateOptimizationMetrics = () => {
    return {
      costSavings: {
        current: 45000,
        optimized: 32000,
        savings: 13000,
        percentage: 29
      },
      modelUsage: [
        { model: 'GPT-4', current: 60, recommended: 20, cost: 60 },
        { model: 'GPT-3.5-turbo', current: 30, recommended: 70, cost: 1.5 },
        { model: 'GPT-4-mini', current: 10, recommended: 10, cost: 0.6 }
      ],
      performanceMetrics: [
        { metric: 'Response Time', value: 85 },
        { metric: 'Accuracy', value: 92 },
        { metric: 'User Satisfaction', value: 88 },
        { metric: 'Cost Efficiency', value: 72 },
        { metric: 'Scalability', value: 90 }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Insights & Analytics</h1>
          <p className="text-gray-400 mt-1">Machine learning predictions and intelligent recommendations</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-navy-800 rounded-lg p-1">
          {['predictions', 'insights', 'recommendations', 'optimization'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Risk Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Critical Risk Users</p>
                  <p className="text-2xl font-bold text-red-500">
                    {userPredictions.filter(u => u.risk_level === 'critical').length}
                  </p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">High Conversion Potential</p>
                  <p className="text-2xl font-bold text-green-500">
                    {userPredictions.filter(u => u.conversion_probability > 70).length}
                  </p>
                </div>
                <TrendingUpIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Engagement Score</p>
                  <p className="text-2xl font-bold text-white">
                    {(userPredictions.reduce((acc, u) => acc + u.engagement_score, 0) / userPredictions.length).toFixed(1)}%
                  </p>
                </div>
                <UserGroupIcon className="w-8 h-8 text-pink-500" />
              </div>
            </div>
            <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Predicted Churn Rate</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {(userPredictions.filter(u => u.churn_probability > 60).length / userPredictions.length * 100).toFixed(1)}%
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* User Predictions Table */}
          <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
            <h2 className="text-xl font-bold text-white mb-4">User Risk Predictions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-navy-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Churn Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Conversion Potential
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Recommended Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700">
                  {userPredictions.map((prediction) => (
                    <tr key={prediction.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {prediction.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                prediction.churn_probability > 70 ? 'bg-red-500' :
                                prediction.churn_probability > 40 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${prediction.churn_probability}%` }}
                            />
                          </div>
                          <span className="text-gray-300">{prediction.churn_probability.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                prediction.conversion_probability > 70 ? 'bg-green-500' :
                                prediction.conversion_probability > 40 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${prediction.conversion_probability}%` }}
                            />
                          </div>
                          <span className="text-gray-300">{prediction.conversion_probability.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {prediction.engagement_score.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          prediction.risk_level === 'critical' ? 'bg-red-900 text-red-300' :
                          prediction.risk_level === 'high' ? 'bg-orange-900 text-orange-300' :
                          prediction.risk_level === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-green-900 text-green-300'
                        }`}>
                          {prediction.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {prediction.recommended_action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Content Performance Chart */}
          <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
            <h2 className="text-xl font-bold text-white mb-4">Content Performance Analysis</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={contentInsights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="content_type" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95' }} />
                <Legend />
                <Bar dataKey="performance_score" fill="#ec4899" name="Performance Score" />
                <Bar dataKey="success_rate" fill="#10b981" name="Success Rate %" />
                <Bar dataKey="avg_quality_score" fill="#3b82f6" name="Quality Score (x10)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Usage Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
              <h3 className="text-lg font-bold text-white mb-4">Peak Usage Times</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monday 09:00-11:00</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-700 rounded-full h-2 mr-2">
                      <div className="h-2 rounded-full bg-pink-500" style={{ width: '95%' }} />
                    </div>
                    <span className="text-white">95%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tuesday 14:00-16:00</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-700 rounded-full h-2 mr-2">
                      <div className="h-2 rounded-full bg-pink-500" style={{ width: '82%' }} />
                    </div>
                    <span className="text-white">82%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sunday 19:00-21:00</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-700 rounded-full h-2 mr-2">
                      <div className="h-2 rounded-full bg-pink-500" style={{ width: '78%' }} />
                    </div>
                    <span className="text-white">78%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
              <h3 className="text-lg font-bold text-white mb-4">Feature Adoption</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">AI Letter Generation</span>
                  <span className="text-white">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">CV Analysis</span>
                  <span className="text-white">67%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Competence Matching</span>
                  <span className="text-white">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Interview Preparation</span>
                  <span className="text-white">23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* AI Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-navy-800 rounded-lg p-6 border border-navy-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-6 h-6 text-pink-500" />
                    <div>
                      <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                      <span className="text-xs text-gray-400">{rec.category}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rec.impact === 'high' ? 'bg-red-900 text-red-300' :
                    rec.impact === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-blue-900 text-blue-300'
                  }`}>
                    {rec.impact} impact
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{rec.description}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Estimated Value</p>
                    <p className="text-lg font-bold text-green-500">{rec.estimated_value}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Implementation</p>
                    <p className={`text-sm font-medium ${
                      rec.implementation_effort === 'easy' ? 'text-green-400' :
                      rec.implementation_effort === 'moderate' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {rec.implementation_effort}
                    </p>
                  </div>
                </div>
                
                <button className="mt-4 w-full bg-pink-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-pink-600 transition-colors">
                  View Implementation Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          {/* Cost Optimization Overview */}
          <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
            <h2 className="text-xl font-bold text-white mb-4">AI Cost Optimization</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Current Monthly Cost</p>
                <p className="text-2xl font-bold text-white">{optimizationMetrics.costSavings?.current.toLocaleString()} SEK</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Optimized Cost</p>
                <p className="text-2xl font-bold text-green-500">{optimizationMetrics.costSavings?.optimized.toLocaleString()} SEK</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Potential Savings</p>
                <p className="text-2xl font-bold text-pink-500">
                  {optimizationMetrics.costSavings?.savings.toLocaleString()} SEK
                  <span className="text-sm text-gray-400 ml-2">(-{optimizationMetrics.costSavings?.percentage}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Model Usage Optimization */}
          <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
            <h2 className="text-xl font-bold text-white mb-4">Model Usage Optimization</h2>
            <div className="space-y-4">
              {optimizationMetrics.modelUsage?.map((model: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{model.model}</span>
                    <span className="text-xs text-gray-500">${model.cost}/1K tokens</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Current: {model.current}%</span>
                        <span>Recommended: {model.recommended}%</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="absolute h-2 rounded-full bg-red-500 opacity-50" style={{ width: `${model.current}%` }} />
                          <div className="absolute h-2 rounded-full bg-green-500" style={{ width: `${model.recommended}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Radar Chart */}
          <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
            <h2 className="text-xl font-bold text-white mb-4">System Performance Metrics</h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={optimizationMetrics.performanceMetrics}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                <Radar name="Performance" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}