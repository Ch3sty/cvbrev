import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const authHeader = request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin');
    if (adminError || !isAdminData) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Query ai_usage_costs with optional date filtering
    let query = supabase
      .from('ai_usage_costs')
      .select('*');

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching usage stats:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Aggregate usage statistics per feature
    const featureStats: Record<string, {
      featureName: string;
      totalCalls: number;
      uniqueUsers: Set<string>;
      totalCostSek: number;
      totalTokens: number;
      avgCostPerCall: number;
      avgTokensPerCall: number;
      successfulCalls: number;
      models: Set<string>;
      firstUsage: Date;
      lastUsage: Date;
      callsByDate: Record<string, number>;
    }> = {};

    data.forEach((row) => {
      const feature = row.feature_name;
      const userId = row.user_id;
      const costSek = parseFloat(row.cost_sek) || 0;
      const tokens = (row.prompt_tokens || 0) + (row.completion_tokens || 0);
      const createdAt = new Date(row.created_at);
      const dateKey = createdAt.toISOString().split('T')[0];

      if (!featureStats[feature]) {
        featureStats[feature] = {
          featureName: feature,
          totalCalls: 0,
          uniqueUsers: new Set(),
          totalCostSek: 0,
          totalTokens: 0,
          avgCostPerCall: 0,
          avgTokensPerCall: 0,
          successfulCalls: 0,
          models: new Set(),
          firstUsage: createdAt,
          lastUsage: createdAt,
          callsByDate: {},
        };
      }

      const stats = featureStats[feature];
      stats.totalCalls += 1;
      stats.uniqueUsers.add(userId);
      stats.totalCostSek += costSek;
      stats.totalTokens += tokens;
      stats.models.add(row.ai_model);

      // Assume successful if no error in metadata
      if (!row.metadata?.error) {
        stats.successfulCalls += 1;
      }

      // Track first and last usage
      if (createdAt < stats.firstUsage) {
        stats.firstUsage = createdAt;
      }
      if (createdAt > stats.lastUsage) {
        stats.lastUsage = createdAt;
      }

      // Track calls by date
      stats.callsByDate[dateKey] = (stats.callsByDate[dateKey] || 0) + 1;
    });

    // Calculate averages and convert sets to arrays
    const result = Object.values(featureStats).map((stats) => {
      const avgCostPerCall = stats.totalCalls > 0
        ? stats.totalCostSek / stats.totalCalls
        : 0;
      const avgTokensPerCall = stats.totalCalls > 0
        ? stats.totalTokens / stats.totalCalls
        : 0;
      const successRate = stats.totalCalls > 0
        ? (stats.successfulCalls / stats.totalCalls) * 100
        : 0;

      return {
        featureName: stats.featureName,
        totalCalls: stats.totalCalls,
        uniqueUsers: stats.uniqueUsers.size,
        totalCostSek: stats.totalCostSek,
        totalTokens: stats.totalTokens,
        avgCostPerCall,
        avgTokensPerCall: Math.round(avgTokensPerCall),
        avgCallsPerUser: stats.uniqueUsers.size > 0
          ? stats.totalCalls / stats.uniqueUsers.size
          : 0,
        successRate: Math.round(successRate * 10) / 10,
        models: Array.from(stats.models),
        firstUsage: stats.firstUsage.toISOString(),
        lastUsage: stats.lastUsage.toISOString(),
        callsByDate: stats.callsByDate,
      };
    });

    // Sort by total calls (most popular first)
    result.sort((a, b) => b.totalCalls - a.totalCalls);

    // Calculate summary
    const summary = {
      totalFeatures: result.length,
      totalCalls: result.reduce((sum, f) => sum + f.totalCalls, 0),
      totalUniqueUsers: new Set(data.map(r => r.user_id)).size,
      totalCostSek: result.reduce((sum, f) => sum + f.totalCostSek, 0),
      avgSuccessRate: result.length > 0
        ? result.reduce((sum, f) => sum + f.successRate, 0) / result.length
        : 0,
      mostPopular: result[0]?.featureName || null,
      leastPopular: result[result.length - 1]?.featureName || null,
    };

    return NextResponse.json({
      success: true,
      summary,
      features: result,
    });

  } catch (error) {
    console.error('Error in usage stats endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
