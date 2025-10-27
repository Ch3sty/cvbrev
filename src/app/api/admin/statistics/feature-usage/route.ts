// API endpoint for feature usage statistics
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Check authentication and admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: isAdminData, error: adminError } = await supabase
      .rpc('is_admin');

    if (adminError || !isAdminData) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query
    let query = supabase
      .from('ai_usage_costs')
      .select('feature_name, ai_model, prompt_tokens, completion_tokens, cost_sek, created_at')
      .order('created_at', { ascending: false });

    // Apply date filters if provided
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feature usage:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Aggregate data by feature
    const featureStats: Record<string, {
      featureName: string;
      totalCalls: number;
      totalCostSek: number;
      totalTokens: number;
      avgCostPerCall: number;
      models: Set<string>;
    }> = {};

    data.forEach((row: any) => {
      const feature = row.feature_name;
      if (!featureStats[feature]) {
        featureStats[feature] = {
          featureName: feature,
          totalCalls: 0,
          totalCostSek: 0,
          totalTokens: 0,
          avgCostPerCall: 0,
          models: new Set()
        };
      }

      featureStats[feature].totalCalls += 1;
      featureStats[feature].totalCostSek += parseFloat(row.cost_sek) || 0;
      featureStats[feature].totalTokens += (row.prompt_tokens || 0) + (row.completion_tokens || 0);
      featureStats[feature].models.add(row.ai_model);
    });

    // Calculate averages and convert to array
    const result = Object.values(featureStats).map(stat => ({
      ...stat,
      avgCostPerCall: stat.totalCalls > 0 ? stat.totalCostSek / stat.totalCalls : 0,
      models: Array.from(stat.models)
    })).sort((a, b) => b.totalCalls - a.totalCalls); // Sort by most used

    // Also provide summary
    const summary = {
      totalFeatures: result.length,
      totalCalls: result.reduce((sum, f) => sum + f.totalCalls, 0),
      totalCostSek: result.reduce((sum, f) => sum + f.totalCostSek, 0),
      totalTokens: result.reduce((sum, f) => sum + f.totalTokens, 0)
    };

    return NextResponse.json({
      success: true,
      summary,
      features: result
    });

  } catch (error) {
    console.error('Error in feature-usage endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
