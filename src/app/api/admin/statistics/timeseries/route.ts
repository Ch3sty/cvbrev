import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format, subDays } from 'date-fns';

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
    const range = searchParams.get('range') || '7d'; // 7d, 30d, 90d, 1y
    const metric = searchParams.get('metric') || 'users'; // users, letters, revenue, activities

    // Bestäm tidsintervall
    const now = new Date();
    let startDate: Date;
    let interval: 'day' | 'week' | 'month' = 'day';

    switch (range) {
      case '7d':
        startDate = subDays(now, 7);
        interval = 'day';
        break;
      case '30d':
        startDate = subDays(now, 30);
        interval = 'day';
        break;
      case '90d':
        startDate = subDays(now, 90);
        interval = 'week';
        break;
      case '1y':
        startDate = subDays(now, 365);
        interval = 'month';
        break;
      default:
        startDate = subDays(now, 7);
        interval = 'day';
    }

    // Generera tidslabels baserat på intervall
    let timePoints: Date[];
    if (interval === 'day') {
      timePoints = eachDayOfInterval({ start: startDate, end: now });
    } else if (interval === 'week') {
      timePoints = eachWeekOfInterval({ start: startDate, end: now });
    } else {
      timePoints = eachMonthOfInterval({ start: startDate, end: now });
    }

    const labels = timePoints.map(date => {
      if (interval === 'day') return format(date, 'MMM dd');
      if (interval === 'week') return format(date, 'MMM dd');
      return format(date, 'MMM yyyy');
    });

    // Hämta data baserat på metrik
    let datasets: any[] = [];

    switch (metric) {
      case 'users': {
        // Hämta nya användare per tidsperiod
        const { data: profiles } = await supabase
          .from('profiles')
          .select('created_at, subscription_tier')
          .gte('created_at', startDate.toISOString())
          .order('created_at');

        const newUsersData = new Array(timePoints.length).fill(0);
        const premiumUsersData = new Array(timePoints.length).fill(0);

        profiles?.forEach(profile => {
          const profileDate = new Date(profile.created_at);
          const index = timePoints.findIndex((point, i) => {
            const nextPoint = timePoints[i + 1];
            return profileDate >= point && (!nextPoint || profileDate < nextPoint);
          });
          
          if (index !== -1) {
            newUsersData[index]++;
            if (profile.subscription_tier === 'premium') {
              premiumUsersData[index]++;
            }
          }
        });

        datasets = [
          {
            label: 'Nya användare',
            data: newUsersData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true
          },
          {
            label: 'Nya premium',
            data: premiumUsersData,
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            fill: true
          }
        ];
        break;
      }

      case 'letters': {
        // Hämta genererade brev per tidsperiod
        const { data: letters } = await supabase
          .from('letters')
          .select('created_at, is_saved, ai_cost')
          .gte('created_at', startDate.toISOString())
          .order('created_at');

        const generatedData = new Array(timePoints.length).fill(0);
        const savedData = new Array(timePoints.length).fill(0);
        const costData = new Array(timePoints.length).fill(0);

        letters?.forEach(letter => {
          const letterDate = new Date(letter.created_at);
          const index = timePoints.findIndex((point, i) => {
            const nextPoint = timePoints[i + 1];
            return letterDate >= point && (!nextPoint || letterDate < nextPoint);
          });
          
          if (index !== -1) {
            generatedData[index]++;
            if (letter.is_saved) {
              savedData[index]++;
            }
            costData[index] += parseFloat(letter.ai_cost?.toString() || '0');
          }
        });

        datasets = [
          {
            label: 'Genererade brev',
            data: generatedData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
          },
          {
            label: 'Sparade brev',
            data: savedData,
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true
          }
        ];
        break;
      }

      case 'revenue': {
        // Hämta intäkter per tidsperiod
        const { data: revenues } = await supabase
          .from('revenue_tracking')
          .select('amount, created_at')
          .eq('status', 'completed')
          .gte('created_at', startDate.toISOString())
          .order('created_at');

        const revenueData = new Array(timePoints.length).fill(0);
        const cumulativeData = new Array(timePoints.length).fill(0);
        let cumulative = 0;

        revenues?.forEach(revenue => {
          const revenueDate = new Date(revenue.created_at);
          const index = timePoints.findIndex((point, i) => {
            const nextPoint = timePoints[i + 1];
            return revenueDate >= point && (!nextPoint || revenueDate < nextPoint);
          });
          
          if (index !== -1) {
            const amount = parseFloat(revenue.amount?.toString() || '0');
            revenueData[index] += amount;
          }
        });

        // Beräkna kumulativ intäkt
        revenueData.forEach((amount, i) => {
          cumulative += amount;
          cumulativeData[i] = cumulative;
        });

        datasets = [
          {
            label: 'Intäkter (SEK)',
            data: revenueData,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true
          },
          {
            label: 'Kumulativ (SEK)',
            data: cumulativeData,
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'rgba(251, 146, 60, 0.1)',
            fill: true
          }
        ];
        break;
      }

      case 'activities': {
        // Hämta aktiviteter per tidsperiod
        const { data: activities } = await supabase
          .from('user_activities')
          .select('created_at, activity_type')
          .gte('created_at', startDate.toISOString())
          .order('created_at');

        const activityData = new Array(timePoints.length).fill(0);
        const loginData = new Array(timePoints.length).fill(0);
        const letterData = new Array(timePoints.length).fill(0);

        activities?.forEach(activity => {
          const activityDate = new Date(activity.created_at);
          const index = timePoints.findIndex((point, i) => {
            const nextPoint = timePoints[i + 1];
            return activityDate >= point && (!nextPoint || activityDate < nextPoint);
          });
          
          if (index !== -1) {
            activityData[index]++;
            if (activity.activity_type === 'login') {
              loginData[index]++;
            } else if (activity.activity_type?.includes('letter')) {
              letterData[index]++;
            }
          }
        });

        datasets = [
          {
            label: 'Totala aktiviteter',
            data: activityData,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true
          },
          {
            label: 'Inloggningar',
            data: loginData,
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true
          },
          {
            label: 'Brevaktiviteter',
            data: letterData,
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            fill: true
          }
        ];
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      labels,
      datasets,
      range,
      metric,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching timeseries data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeseries data', details: error.message },
      { status: 500 }
    );
  }
}