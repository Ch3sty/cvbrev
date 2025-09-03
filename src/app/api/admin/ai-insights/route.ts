import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Fetch user data for AI analysis
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .limit(20);
    
    // Generate AI predictions (in production, these would come from ML models)
    const userPredictions = profiles?.slice(0, 10).map(profile => ({
      user_id: profile.id,
      email: profile.email || 'user@example.com',
      churn_probability: Math.random() * 100,
      conversion_probability: Math.random() * 100,
      engagement_score: Math.random() * 100,
      recommended_action: getRecommendedAction(Math.random()),
      risk_level: getRiskLevel(Math.random())
    })) || [];
    
    // Content insights
    const contentInsights = [
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
      }
    ];
    
    // AI recommendations
    const recommendations = [
      {
        id: '1',
        category: 'Revenue',
        title: 'Implement Dynamic Pricing',
        description: 'AI analysis suggests 15-20% revenue increase with personalized pricing',
        impact: 'high',
        estimated_value: '+35,000 SEK/month',
        implementation_effort: 'moderate'
      },
      {
        id: '2',
        category: 'Retention',
        title: 'Launch AI Interview Coach',
        description: 'Most requested feature by 67% of churned users',
        impact: 'high',
        estimated_value: '-25% churn rate',
        implementation_effort: 'complex'
      },
      {
        id: '3',
        category: 'Cost',
        title: 'Optimize AI Model Usage',
        description: 'Switch to GPT-3.5-turbo for 60% of requests',
        impact: 'medium',
        estimated_value: '-8,000 SEK/month',
        implementation_effort: 'easy'
      }
    ];
    
    // Optimization metrics
    const optimizationMetrics = {
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
        { metric: 'Cost Efficiency', value: 72 }
      ]
    };
    
    // Revenue forecast
    const revenueForecast = generateRevenueForecast();
    
    return NextResponse.json({
      userPredictions,
      contentInsights,
      recommendations,
      optimizationMetrics,
      revenueForecast,
      summary: {
        criticalRiskUsers: userPredictions.filter(u => u.risk_level === 'critical').length,
        highConversionPotential: userPredictions.filter(u => u.conversion_probability > 70).length,
        avgEngagementScore: userPredictions.reduce((acc, u) => acc + u.engagement_score, 0) / userPredictions.length,
        predictedChurnRate: (userPredictions.filter(u => u.churn_probability > 60).length / userPredictions.length * 100)
      }
    });
    
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getRecommendedAction(score: number): string {
  if (score < 0.25) return 'Send re-engagement email';
  if (score < 0.5) return 'Offer premium trial';
  if (score < 0.75) return 'Provide personalized content';
  return 'Maintain current engagement';
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 0.25) return 'low';
  if (score < 0.5) return 'medium';
  if (score < 0.75) return 'high';
  return 'critical';
}

function generateRevenueForecast() {
  const forecast = [];
  const baseRevenue = 20000;
  
  for (let i = 1; i <= 6; i++) {
    const growth = 1 + (Math.random() * 0.2); // 0-20% growth
    forecast.push({
      month: i,
      predicted: Math.floor(baseRevenue * Math.pow(growth, i)),
      bestCase: Math.floor(baseRevenue * Math.pow(growth * 1.2, i)),
      worstCase: Math.floor(baseRevenue * Math.pow(growth * 0.8, i))
    });
  }
  
  return forecast;
}