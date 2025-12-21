// API endpoint for user cost statistics
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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('ai_usage_costs')
      .select(`
        user_id,
        feature_name,
        cost_sek,
        prompt_tokens,
        completion_tokens,
        created_at,
        profiles!inner(email, full_name, subscription_status)
      `);

    // Apply date filters if provided
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user costs:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Aggregate by user
    const userStats: Record<string, {
      userId: string;
      email: string;
      fullName: string;
      subscriptionStatus: string;
      totalCostSek: number;
      totalCalls: number;
      totalTokens: number;
      featuresUsed: Set<string>;
      firstUsage: Date;
      lastUsage: Date;
    }> = {};

    data.forEach((row: any) => {
      const userId = row.user_id;
      if (!userStats[userId]) {
        userStats[userId] = {
          userId,
          email: row.profiles?.email || 'Unknown',
          fullName: row.profiles?.full_name || 'Unknown',
          subscriptionStatus: row.profiles?.subscription_status || 'free',
          totalCostSek: 0,
          totalCalls: 0,
          totalTokens: 0,
          featuresUsed: new Set(),
          firstUsage: new Date(row.created_at),
          lastUsage: new Date(row.created_at)
        };
      }

      userStats[userId].totalCostSek += parseFloat(row.cost_sek) || 0;
      userStats[userId].totalCalls += 1;
      userStats[userId].totalTokens += (row.prompt_tokens || 0) + (row.completion_tokens || 0);
      userStats[userId].featuresUsed.add(row.feature_name);

      const createdAt = new Date(row.created_at);
      if (createdAt < userStats[userId].firstUsage) {
        userStats[userId].firstUsage = createdAt;
      }
      if (createdAt > userStats[userId].lastUsage) {
        userStats[userId].lastUsage = createdAt;
      }
    });

    // Convert to array and sort by cost (highest first)
    const result = Object.values(userStats)
      .map(stat => ({
        ...stat,
        featuresUsed: Array.from(stat.featuresUsed),
        avgCostPerCall: stat.totalCalls > 0 ? stat.totalCostSek / stat.totalCalls : 0
      }))
      .sort((a, b) => b.totalCostSek - a.totalCostSek)
      .slice(0, limit);

    // Calculate summary
    const allUsers = Object.values(userStats);
    const summary = {
      totalUsers: allUsers.length,
      totalCostSek: allUsers.reduce((sum, u) => sum + u.totalCostSek, 0),
      totalCalls: allUsers.reduce((sum, u) => sum + u.totalCalls, 0),
      avgCostPerUser: allUsers.length > 0 ?
        allUsers.reduce((sum, u) => sum + u.totalCostSek, 0) / allUsers.length : 0,
      premiumUsers: allUsers.filter(u => u.subscriptionStatus === 'active').length,
      freeUsers: allUsers.filter(u => u.subscriptionStatus !== 'active').length
    };

    return NextResponse.json({
      success: true,
      summary,
      users: result
    });

  } catch (error) {
    console.error('Error in user-costs endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
