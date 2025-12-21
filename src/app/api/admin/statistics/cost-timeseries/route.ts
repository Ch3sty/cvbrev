// API endpoint for cost breakdown time series
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

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
    const { data: isAdminData, error: adminError } = await supabase
      .rpc('is_admin');

    if (adminError || !isAdminData) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Default: last 30 days
    const dateTo = searchParams.get('dateTo') || new Date().toISOString();
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    // Fetch data
    const { data, error } = await supabase
      .from('ai_usage_costs')
      .select('feature_name, cost_sek, cost_usd, total_tokens, created_at')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching cost timeseries:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Group data by time period
    const timeSeriesData: Record<string, {
      date: string;
      totalCostSek: number;
      totalCostUsd: number;
      totalTokens: number;
      totalCalls: number;
      byFeature: Record<string, {
        costSek: number;
        calls: number;
        tokens: number;
      }>;
    }> = {};

    data.forEach((row: any) => {
      const date = new Date(row.created_at);
      let periodKey: string;

      // Determine period key based on groupBy parameter
      if (groupBy === 'week') {
        // Get week number
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // Default: day
        periodKey = date.toISOString().split('T')[0];
      }

      if (!timeSeriesData[periodKey]) {
        timeSeriesData[periodKey] = {
          date: periodKey,
          totalCostSek: 0,
          totalCostUsd: 0,
          totalTokens: 0,
          totalCalls: 0,
          byFeature: {}
        };
      }

      const period = timeSeriesData[periodKey];
      period.totalCostSek += parseFloat(row.cost_sek) || 0;
      period.totalCostUsd += parseFloat(row.cost_usd) || 0;
      period.totalTokens += row.total_tokens || 0;
      period.totalCalls += 1;

      // Aggregate by feature within this period
      const feature = row.feature_name;
      if (!period.byFeature[feature]) {
        period.byFeature[feature] = {
          costSek: 0,
          calls: 0,
          tokens: 0
        };
      }

      period.byFeature[feature].costSek += parseFloat(row.cost_sek) || 0;
      period.byFeature[feature].calls += 1;
      period.byFeature[feature].tokens += row.total_tokens || 0;
    });

    // Convert to array and sort by date
    const result = Object.values(timeSeriesData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Calculate summary statistics
    const summary = {
      totalPeriods: result.length,
      totalCostSek: result.reduce((sum, p) => sum + p.totalCostSek, 0),
      totalCostUsd: result.reduce((sum, p) => sum + p.totalCostUsd, 0),
      totalCalls: result.reduce((sum, p) => sum + p.totalCalls, 0),
      totalTokens: result.reduce((sum, p) => sum + p.totalTokens, 0),
      avgCostPerDay: result.length > 0 ?
        result.reduce((sum, p) => sum + p.totalCostSek, 0) / result.length : 0,
      avgCallsPerDay: result.length > 0 ?
        result.reduce((sum, p) => sum + p.totalCalls, 0) / result.length : 0
    };

    // Get all unique features for frontend charting
    const allFeatures = new Set<string>();
    result.forEach(period => {
      Object.keys(period.byFeature).forEach(feature => allFeatures.add(feature));
    });

    return NextResponse.json({
      success: true,
      summary,
      groupBy,
      dateRange: { from: dateFrom, to: dateTo },
      features: Array.from(allFeatures),
      timeSeries: result
    });

  } catch (error) {
    console.error('Error in cost-timeseries endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
