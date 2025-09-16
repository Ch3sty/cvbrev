// src/app/api/admin/openai-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import {
  getCachedUsageData,
  syncOpenAICostsToDatabase,
  getAggregatedCosts
} from '@/lib/openai/usage-api';

// GET - Hämta OpenAI usage data
export async function GET(request: NextRequest) {
  // Deklarera variabler utanför inner try-catch för att de ska vara tillgängliga i hela funktionen
  let totalEstimatedCost = 0;
  let totalEstimatedTokens = 0;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Kontrollera autentisering och admin-behörighet
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kontrollera admin-status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Hämta query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const useCache = searchParams.get('cache') !== 'false';

    // Beräkna datumintervall
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Hämta estimerad data från usage_log och letters först (behövs i båda fallen)
    const { data: estimatedData } = await supabase
      .from('usage_log')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: lettersData } = await supabase
      .from('letters')
      .select('ai_cost, ai_tokens, ai_model, created_at')
      .not('ai_cost', 'is', null)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Beräkna totala estimerade kostnader
    if (estimatedData) {
      estimatedData.forEach(log => {
        totalEstimatedCost += parseFloat(log.cost?.toString() || '0');
        totalEstimatedTokens += log.tokens || 0;
      });
    }

    if (lettersData) {
      lettersData.forEach(letter => {
        totalEstimatedCost += parseFloat(letter.ai_cost?.toString() || '0');
        totalEstimatedTokens += letter.ai_tokens || 0;
      });
    }

    try {
      // Hämta data (använd cache om möjligt)
      const usageData = useCache
        ? await getCachedUsageData(startDate, endDate)
        : await getAggregatedCosts(startDate, endDate);

      // Hämta synkad data från databasen
      const { data: syncedData } = await supabase
        .from('openai_usage_sync')
        .select('*')
        .gte('sync_date', startDate.toISOString().split('T')[0])
        .lte('sync_date', endDate.toISOString().split('T')[0])
        .order('sync_date', { ascending: false });

      // Jämför faktiska vs estimerade kostnader
      const comparison = {
        actualCost: usageData.totalCost,
        estimatedCost: totalEstimatedCost,
        difference: usageData.totalCost - totalEstimatedCost,
        differencePercent: totalEstimatedCost > 0
          ? ((usageData.totalCost - totalEstimatedCost) / totalEstimatedCost) * 100
          : 0,
        actualCostSEK: usageData.totalCost * 10.5,
        estimatedCostSEK: totalEstimatedCost * 10.5,
        differenceSEK: (usageData.totalCost - totalEstimatedCost) * 10.5
      };

      return NextResponse.json({
        success: true,
        data: {
          ...usageData,
          comparison,
          syncedData,
          lastSyncedAt: syncedData?.[0]?.updated_at || null
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days
        }
      });

    } catch (apiError: any) {
      // Om OpenAI API misslyckas, returnera endast estimerad data
      console.error('OpenAI API error:', apiError);

      return NextResponse.json({
        success: false,
        error: 'Could not fetch actual usage data from OpenAI',
        estimatedOnly: true,
        data: {
          totalCost: totalEstimatedCost,
          totalTokens: totalEstimatedTokens,
          totalCostSEK: totalEstimatedCost * 10.5,
          message: 'Showing estimated costs only. Admin API key may be missing or invalid.'
        }
      }, { status: 200 }); // Returnera 200 även vid API-fel
    }

  } catch (error: any) {
    console.error('Error fetching OpenAI usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Synkronisera OpenAI kostnader till databasen
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Kontrollera autentisering och admin-behörighet
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kontrollera admin-status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Hämta body
    const body = await request.json();
    const { days = 30 } = body;

    // Beräkna datumintervall
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Synkronisera data
    const result = await syncOpenAICostsToDatabase(supabase, startDate, endDate);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Sync failed', details: result.error },
        { status: 500 }
      );
    }

    // Logga synkroniseringen (ignorera fel här så att sync inte misslyckas)
    try {
      await supabase.from('system_alerts').insert({
        alert_type: 'info',
        title: 'OpenAI Usage Sync',
        message: `Successfully synced ${result.syncedRecords} records from OpenAI API`,
        metadata: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          records_synced: result.syncedRecords
        },
        status: 'resolved'
      });
    } catch (alertError) {
      console.log('Could not log sync to system_alerts:', alertError);
    }

    return NextResponse.json({
      success: true,
      syncedRecords: result.syncedRecords,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days
      }
    });

  } catch (error: any) {
    console.error('Error syncing OpenAI usage:', error);
    return NextResponse.json(
      { error: 'Failed to sync usage data', details: error.message },
      { status: 500 }
    );
  }
}