import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kontrollera autentisering och admin-behörighet
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kontrollera admin-status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Hämta query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('range') || 'week';
    const metric = searchParams.get('metric') || 'all';

    // Beräkna datumintervall
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // All tid
    }

    const statistics: any = {};

    // Användarstatistik
    if (metric === 'all' || metric === 'users') {
      const { data: profiles, count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { count: premiumUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('subscription_tier', 'premium');

      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString());

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .not('last_active', 'is', null)
        .gte('last_active', startDate.toISOString());

      statistics.users = {
        total: totalUsers || 0,
        premium: premiumUsers || 0,
        free: (totalUsers || 0) - (premiumUsers || 0),
        new: newUsers || 0,
        active: activeUsers || 0
      };
    }

    // CV-statistik
    if (metric === 'all' || metric === 'cvs') {
      const { data: cvs, count: totalCvs } = await supabase
        .from('cv_texts')
        .select('*', { count: 'exact' });

      const { count: newCvs } = await supabase
        .from('cv_texts')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString());

      // Beräkna genomsnittlig storlek
      let avgSize = 0;
      if (cvs && cvs.length > 0) {
        const totalSize = cvs.reduce((acc, cv) => acc + (cv.cv_text?.length || 0), 0);
        avgSize = Math.round(totalSize / cvs.length);
      }

      statistics.cvs = {
        total: totalCvs || 0,
        new: newCvs || 0,
        averageSize: avgSize
      };
    }

    // Brevstatistik
    if (metric === 'all' || metric === 'letters') {
      const { data: letters, count: totalLetters } = await supabase
        .from('letters')
        .select('*', { count: 'exact' });

      const { count: savedLetters } = await supabase
        .from('letters')
        .select('*', { count: 'exact' })
        .eq('is_saved', true);

      const { count: newLetters } = await supabase
        .from('letters')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString());

      // Språkdistribution
      const languageDistribution: Record<string, number> = {};
      if (letters) {
        letters.forEach(letter => {
          const lang = letter.language || 'sv';
          languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
        });
      }

      statistics.letters = {
        total: totalLetters || 0,
        saved: savedLetters || 0,
        new: newLetters || 0,
        languages: languageDistribution
      };
    }

    // AI-kostnadsstatistik
    if (metric === 'all' || metric === 'ai') {
      const { data: usageLogs } = await supabase
        .from('usage_log')
        .select('*')
        .gte('created_at', startDate.toISOString());

      let totalCost = 0;
      let totalTokens = 0;
      const modelUsage: Record<string, number> = {};

      if (usageLogs) {
        usageLogs.forEach(log => {
          totalCost += parseFloat(log.cost?.toString() || '0');
          totalTokens += log.tokens || 0;
          if (log.model) {
            modelUsage[log.model] = (modelUsage[log.model] || 0) + 1;
          }
        });
      }

      statistics.ai = {
        totalCost: totalCost,
        totalTokens: totalTokens,
        modelUsage: modelUsage,
        averageCostPerRequest: usageLogs && usageLogs.length > 0 ? totalCost / usageLogs.length : 0
      };
    }

    // Aktivitetsstatistik
    if (metric === 'all' || metric === 'activities') {
      const { data: activities, count: totalActivities } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString());

      // Räkna aktiviteter per typ
      const activityTypes: Record<string, number> = {};
      const userActivityCount: Record<string, number> = {};

      if (activities) {
        activities.forEach(activity => {
          // Räkna per typ
          const type = activity.activity_type || 'unknown';
          activityTypes[type] = (activityTypes[type] || 0) + 1;

          // Räkna per användare
          if (activity.user_id) {
            userActivityCount[activity.user_id] = (userActivityCount[activity.user_id] || 0) + 1;
          }
        });
      }

      // Hitta mest aktiva användare
      const mostActiveUsers = Object.entries(userActivityCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count }));

      statistics.activities = {
        total: totalActivities || 0,
        byType: activityTypes,
        mostActiveUsers: mostActiveUsers
      };
    }

    // Intäktsstatistik
    if (metric === 'all' || metric === 'revenue') {
      const { data: revenues } = await supabase
        .from('revenue_tracking')
        .select('*')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      let totalRevenue = 0;
      if (revenues) {
        totalRevenue = revenues.reduce((acc, rev) => 
          acc + parseFloat(rev.amount?.toString() || '0'), 0
        );
      }

      // Beräkna MRR och ARR
      const { count: premiumCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('subscription_tier', 'premium');

      const mrr = (premiumCount || 0) * 149;
      const arr = mrr * 12;

      statistics.revenue = {
        total: totalRevenue,
        mrr: mrr,
        arr: arr,
        transactions: revenues?.length || 0
      };
    }

    // Systemstatistik
    if (metric === 'all' || metric === 'system') {
      // Hämta senaste systemmetrics
      const { data: metrics } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);

      // Hämta aktiva alerts
      const { count: activeAlerts } = await supabase
        .from('system_alerts')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      // Beräkna genomsnittlig response time från API metrics
      const { data: apiMetrics } = await supabase
        .from('api_metrics')
        .select('response_time_ms')
        .gte('created_at', startDate.toISOString());

      let avgResponseTime = 0;
      if (apiMetrics && apiMetrics.length > 0) {
        const totalTime = apiMetrics.reduce((acc, metric) => 
          acc + (metric.response_time_ms || 0), 0
        );
        avgResponseTime = Math.round(totalTime / apiMetrics.length);
      }

      statistics.system = {
        activeAlerts: activeAlerts || 0,
        averageResponseTime: avgResponseTime,
        metrics: metrics || []
      };
    }

    return NextResponse.json({
      success: true,
      data: statistics,
      dateRange: dateRange,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint för att logga systemmetrics
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Kontrollera autentisering och admin-behörighet
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Spara metric
    const { data, error } = await supabase
      .from('system_metrics')
      .insert({
        metric_type: body.metric_type,
        metric_name: body.metric_name,
        value: body.value,
        unit: body.unit,
        tags: body.tags || {}
      });

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Error logging metric:', error);
    return NextResponse.json(
      { error: 'Failed to log metric', details: error.message },
      { status: 500 }
    );
  }
}