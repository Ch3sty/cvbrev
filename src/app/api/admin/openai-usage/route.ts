// src/app/api/admin/openai-usage/route.ts
// Efter Gemini-migreringen finns ingen extern usage-API (AI Studio saknar motsvarighet
// till OpenAI:s Admin Usage API). All kostnadsdata kommer från interna tabeller
// (usage_log, letters, ai_usage_costs) som fylls per AI-anrop.
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

// GET - Hämta AI usage data (interna estimat)
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
    const source = searchParams.get('source'); // 'letters', 'cv-analysis', etc.

    // Beräkna datumintervall
    const endDate = new Date();
    const startDate = new Date();

    // Hantera "från början" för letters (days=9999)
    if (days === 9999 && source === 'letters') {
      // Hämta äldsta brevet för att sätta startDate
      const { data: oldestLetter } = await supabase
        .from('letters')
        .select('created_at')
        .not('ai_cost', 'is', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (oldestLetter) {
        startDate.setTime(new Date(oldestLetter.created_at).getTime());
      } else {
        startDate.setDate(endDate.getDate() - 30); // Fallback till 30 dagar
      }
    } else {
      startDate.setDate(endDate.getDate() - days);
    }

    // Om source=letters, hämta endast från letters-tabellen
    if (source === 'letters') {
      const { data: lettersData } = await supabase
        .from('letters')
        .select('ai_cost, ai_tokens, ai_model, created_at')
        .not('ai_cost', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (!lettersData) {
        return NextResponse.json({
          success: true,
          data: {
            totalCost: 0,
            totalTokens: 0,
            byModel: {},
            dailyCosts: []
          },
          period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            days
          }
        });
      }

      // Beräkna totalkostnad och tokens
      let totalCost = 0;
      let totalTokens = 0;
      const byModel: Record<string, { cost: number; tokens: number; requests: number }> = {};
      const dailyCostsMap = new Map<string, { cost: number; tokens: number }>();

      lettersData.forEach(letter => {
        const cost = parseFloat(letter.ai_cost?.toString() || '0');
        const tokens = letter.ai_tokens || 0;
        const model = letter.ai_model || 'unknown';
        const date = new Date(letter.created_at).toISOString().split('T')[0];

        totalCost += cost;
        totalTokens += tokens;

        // Per modell
        if (!byModel[model]) {
          byModel[model] = { cost: 0, tokens: 0, requests: 0 };
        }
        byModel[model].cost += cost;
        byModel[model].tokens += tokens;
        byModel[model].requests += 1;

        // Per dag
        if (!dailyCostsMap.has(date)) {
          dailyCostsMap.set(date, { cost: 0, tokens: 0 });
        }
        const dailyData = dailyCostsMap.get(date)!;
        dailyData.cost += cost;
        dailyData.tokens += tokens;
      });

      // Konvertera Map till array och sortera
      const dailyCosts = Array.from(dailyCostsMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return NextResponse.json({
        success: true,
        source: 'letters',
        data: {
          totalCost,
          totalTokens,
          byModel,
          dailyCosts
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days
        }
      });
    }

    // Standard-flöde för andra källor eller ingen source angiven
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

    // Lägg även till kostnader från den enhetliga ai_usage_costs-tabellen
    const { data: aiCostsData } = await supabase
      .from('ai_usage_costs')
      .select('cost_usd, prompt_tokens, completion_tokens')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (aiCostsData) {
      aiCostsData.forEach(row => {
        totalEstimatedCost += parseFloat(row.cost_usd?.toString() || '0');
        totalEstimatedTokens += (row.prompt_tokens || 0) + (row.completion_tokens || 0);
      });
    }

    return NextResponse.json({
      success: true,
      estimatedOnly: true,
      data: {
        totalCost: totalEstimatedCost,
        totalTokens: totalEstimatedTokens,
        totalCostSEK: totalEstimatedCost * 10.5,
        message: 'Interna kostnadsestimat (per-anrop-spårning). Extern usage-API finns inte för Gemini.'
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days
      }
    });

  } catch (error: any) {
    console.error('Error fetching OpenAI usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Tidigare OpenAI-kostnadssynk. Borttagen efter Gemini-migreringen:
// kostnader spåras nu per anrop direkt i ai_usage_costs, ingen extern synk behövs.
export async function POST() {
  return NextResponse.json(
    {
      error: 'OpenAI-synk är borttagen. Kostnader spåras internt per AI-anrop i ai_usage_costs.',
    },
    { status: 410 }
  );
}