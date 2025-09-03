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
    
    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();
    
    // Fetch revenue data
    const { data: profiles } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, created_at, stripe_customer_id');
    
    // Calculate metrics
    const activeSubscribers = profiles?.filter(p => p.subscription_status === 'active').length || 0;
    const premiumSubscribers = profiles?.filter(p => p.subscription_tier === 'premium').length || 0;
    const mrr = premiumSubscribers * 149;
    const arr = mrr * 12;
    
    // Calculate growth
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const newSubscribers = profiles?.filter(p => 
      new Date(p.created_at) > lastMonthDate && p.subscription_status === 'active'
    ).length || 0;
    
    const churnedLastMonth = profiles?.filter(p => 
      p.subscription_status === 'cancelled' && 
      new Date(p.created_at) > lastMonthDate
    ).length || 0;
    
    const growthRate = activeSubscribers > 0 ? (newSubscribers / activeSubscribers) * 100 : 0;
    const churnRate = activeSubscribers > 0 ? (churnedLastMonth / activeSubscribers) * 100 : 0;
    
    // Generate daily revenue data for charts
    const dailyRevenue = generateDailyRevenue(30);
    
    return NextResponse.json({
      metrics: {
        mrr,
        arr,
        activeSubscribers,
        premiumSubscribers,
        newSubscribers,
        growthRate,
        churnRate,
        arpu: activeSubscribers > 0 ? mrr / activeSubscribers : 0
      },
      dailyRevenue,
      subscriptionDistribution: [
        { name: 'Free', value: (profiles?.length || 0) - premiumSubscribers },
        { name: 'Premium', value: premiumSubscribers }
      ]
    });
    
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateDailyRevenue(days: number) {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 2000,
      subscriptions: Math.floor(Math.random() * 10) + 5,
      refunds: Math.floor(Math.random() * 3)
    });
  }
  
  return data;
}