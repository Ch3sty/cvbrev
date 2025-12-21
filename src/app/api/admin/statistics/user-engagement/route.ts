import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Check authentication and admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin');
    if (adminError || !isAdminData) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const feature = searchParams.get('feature'); // Optional: filter by specific feature

    // Query ai_usage_costs with profile join
    let query = supabase
      .from('ai_usage_costs')
      .select(`
        user_id,
        feature_name,
        created_at,
        cost_sek,
        prompt_tokens,
        completion_tokens,
        profiles!inner(email, full_name, subscription_status)
      `);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }
    if (feature) {
      query = query.eq('feature_name', feature);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user engagement:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Aggregate by user and feature
    const userEngagement: Record<string, {
      userId: string;
      email: string;
      fullName: string | null;
      subscriptionStatus: string;
      featureUsage: Record<string, {
        featureName: string;
        calls: number;
        costSek: number;
        tokens: number;
        firstUsed: Date;
        lastUsed: Date;
      }>;
      totalCalls: number;
      totalCostSek: number;
      featuresUsed: Set<string>;
      firstActivity: Date;
      lastActivity: Date;
    }> = {};

    data.forEach((row: any) => {
      const userId = row.user_id;
      const feature = row.feature_name;
      const costSek = parseFloat(row.cost_sek) || 0;
      const tokens = (row.prompt_tokens || 0) + (row.completion_tokens || 0);
      const createdAt = new Date(row.created_at);
      const profile = row.profiles;

      if (!userEngagement[userId]) {
        userEngagement[userId] = {
          userId,
          email: profile.email,
          fullName: profile.full_name,
          subscriptionStatus: profile.subscription_status || 'free',
          featureUsage: {},
          totalCalls: 0,
          totalCostSek: 0,
          featuresUsed: new Set(),
          firstActivity: createdAt,
          lastActivity: createdAt,
        };
      }

      const user = userEngagement[userId];

      // Update feature-specific usage
      if (!user.featureUsage[feature]) {
        user.featureUsage[feature] = {
          featureName: feature,
          calls: 0,
          costSek: 0,
          tokens: 0,
          firstUsed: createdAt,
          lastUsed: createdAt,
        };
      }

      const featureData = user.featureUsage[feature];
      featureData.calls += 1;
      featureData.costSek += costSek;
      featureData.tokens += tokens;

      if (createdAt < featureData.firstUsed) {
        featureData.firstUsed = createdAt;
      }
      if (createdAt > featureData.lastUsed) {
        featureData.lastUsed = createdAt;
      }

      // Update user totals
      user.totalCalls += 1;
      user.totalCostSek += costSek;
      user.featuresUsed.add(feature);

      if (createdAt < user.firstActivity) {
        user.firstActivity = createdAt;
      }
      if (createdAt > user.lastActivity) {
        user.lastActivity = createdAt;
      }
    });

    // Convert to array and calculate engagement score
    const result = Object.values(userEngagement).map((user) => {
      // Engagement score: combination of features used, calls, and recency
      const daysSinceLastActivity = (Date.now() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 100 - daysSinceLastActivity * 2); // Drops 2 points per day
      const diversityScore = (user.featuresUsed.size / 7) * 100; // Max 7 features
      const activityScore = Math.min(100, user.totalCalls * 2); // 2 points per call, max 100
      const engagementScore = (recencyScore * 0.3 + diversityScore * 0.3 + activityScore * 0.4);

      return {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        subscriptionStatus: user.subscriptionStatus,
        totalCalls: user.totalCalls,
        totalCostSek: user.totalCostSek,
        featuresUsed: Array.from(user.featuresUsed),
        featureCount: user.featuresUsed.size,
        featureUsage: Object.values(user.featureUsage).map(f => ({
          featureName: f.featureName,
          calls: f.calls,
          costSek: f.costSek,
          tokens: f.tokens,
          firstUsed: f.firstUsed.toISOString(),
          lastUsed: f.lastUsed.toISOString(),
        })),
        firstActivity: user.firstActivity.toISOString(),
        lastActivity: user.lastActivity.toISOString(),
        daysSinceLastActivity: Math.round(daysSinceLastActivity),
        engagementScore: Math.round(engagementScore),
      };
    });

    // Sort by engagement score (highest first)
    result.sort((a, b) => b.engagementScore - a.engagementScore);

    // Calculate summary
    const summary = {
      totalUsers: result.length,
      avgCallsPerUser: result.length > 0
        ? result.reduce((sum, u) => sum + u.totalCalls, 0) / result.length
        : 0,
      avgCostPerUser: result.length > 0
        ? result.reduce((sum, u) => sum + u.totalCostSek, 0) / result.length
        : 0,
      avgFeaturesPerUser: result.length > 0
        ? result.reduce((sum, u) => sum + u.featureCount, 0) / result.length
        : 0,
      avgEngagementScore: result.length > 0
        ? result.reduce((sum, u) => sum + u.engagementScore, 0) / result.length
        : 0,
      premiumUsers: result.filter(u => u.subscriptionStatus === 'premium').length,
      freeUsers: result.filter(u => u.subscriptionStatus === 'free').length,
    };

    return NextResponse.json({
      success: true,
      summary,
      users: result,
    });

  } catch (error) {
    console.error('Error in user engagement endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
