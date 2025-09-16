// src/lib/openai/usage-api.ts
// OpenAI Usage API integration för att hämta faktiska kostnader

interface UsageDataPoint {
  timestamp: number;
  model: string;
  n_requests: number;
  n_context_tokens_total: number;
  n_generated_tokens_total: number;
  cost: number;
}

interface CostDataPoint {
  timestamp: number;
  line_item: string;
  model?: string;
  project_id?: string;
  name: string;
  cost: number;
}

interface UsageResponse {
  object: string;
  data: UsageDataPoint[];
  has_more: boolean;
  next_page?: string;
}

interface CostResponse {
  object: string;
  data: CostDataPoint[];
  has_more: boolean;
  next_page?: string;
}

/**
 * Hämtar användningsdata från OpenAI Usage API
 * Kräver Admin API-nyckel
 */
export async function fetchOpenAIUsage(
  startTime: number,
  endTime?: number,
  options?: {
    bucketWidth?: '1m' | '1h' | '1d';
    projectIds?: string[];
    userIds?: string[];
    apiKeyIds?: string[];
    models?: string[];
    groupBy?: ('project_id' | 'user_id' | 'api_key_id' | 'model' | 'batch')[];
    limit?: number;
  }
): Promise<UsageResponse> {
  const adminApiKey = process.env.OPENAI_ADMIN_API_KEY;

  if (!adminApiKey) {
    throw new Error('OPENAI_ADMIN_API_KEY saknas i miljövariabler');
  }

  const params = new URLSearchParams({
    start_time: startTime.toString(),
    ...(endTime && { end_time: endTime.toString() }),
    ...(options?.bucketWidth && { bucket_width: options.bucketWidth }),
    ...(options?.projectIds && { project_ids: options.projectIds.join(',') }),
    ...(options?.userIds && { user_ids: options.userIds.join(',') }),
    ...(options?.apiKeyIds && { api_key_ids: options.apiKeyIds.join(',') }),
    ...(options?.models && { models: options.models.join(',') }),
    ...(options?.groupBy && { group_by: options.groupBy.join(',') }),
    ...(options?.limit && { limit: options.limit.toString() }),
  });

  const response = await fetch(
    `https://api.openai.com/v1/organization/usage/completions?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI Usage API error:', response.status, errorText);
    throw new Error(`OpenAI Usage API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Hämtar kostnadsdata från OpenAI Costs API
 * Kräver Admin API-nyckel
 */
export async function fetchOpenAICosts(
  startTime: number,
  endTime?: number,
  options?: {
    bucketWidth?: '1m' | '1h' | '1d';
    projectIds?: string[];
    groupBy?: ('project_id' | 'line_item')[];
    limit?: number;
  }
): Promise<CostResponse> {
  const adminApiKey = process.env.OPENAI_ADMIN_API_KEY;

  if (!adminApiKey) {
    throw new Error('OPENAI_ADMIN_API_KEY saknas i miljövariabler');
  }

  const params = new URLSearchParams({
    start_time: startTime.toString(),
    ...(endTime && { end_time: endTime.toString() }),
    ...(options?.bucketWidth && { bucket_width: options.bucketWidth }),
    ...(options?.projectIds && { project_ids: options.projectIds.join(',') }),
    ...(options?.groupBy && { group_by: options.groupBy.join(',') }),
    ...(options?.limit && { limit: options.limit.toString() }),
  });

  const response = await fetch(
    `https://api.openai.com/v1/organization/costs?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI Costs API error:', response.status, errorText);
    throw new Error(`OpenAI Costs API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Hämtar aggregerad kostnadsinformation för en tidsperiod
 */
export async function getAggregatedCosts(
  startDate: Date,
  endDate: Date = new Date()
): Promise<{
  totalCost: number;
  totalTokens: number;
  byModel: Record<string, { cost: number; tokens: number; requests: number }>;
  dailyCosts: Array<{ date: string; cost: number; tokens: number }>;
}> {
  try {
    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);

    // Hämta användningsdata
    const usageData = await fetchOpenAIUsage(startTime, endTime, {
      bucketWidth: '1d',
      groupBy: ['model'],
    });

    // Hämta kostnadsdata
    const costData = await fetchOpenAICosts(startTime, endTime, {
      bucketWidth: '1d',
      groupBy: ['line_item'],
    });

    // Aggregera data
    let totalCost = 0;
    let totalTokens = 0;
    const byModel: Record<string, { cost: number; tokens: number; requests: number }> = {};
    const dailyCosts: Array<{ date: string; cost: number; tokens: number }> = [];

    // Processa användningsdata
    for (const point of usageData.data) {
      const model = point.model;
      const tokens = point.n_context_tokens_total + point.n_generated_tokens_total;

      totalTokens += tokens;

      if (!byModel[model]) {
        byModel[model] = { cost: 0, tokens: 0, requests: 0 };
      }

      byModel[model].tokens += tokens;
      byModel[model].requests += point.n_requests;
    }

    // Processa kostnadsdata
    for (const point of costData.data) {
      totalCost += point.cost;

      // Lägg till i daglig kostnad
      const date = new Date(point.timestamp * 1000).toISOString().split('T')[0];
      const existing = dailyCosts.find(d => d.date === date);

      if (existing) {
        existing.cost += point.cost;
      } else {
        dailyCosts.push({
          date,
          cost: point.cost,
          tokens: 0 // Tokens fylls i från usage data
        });
      }

      // Uppdatera model-specifik kostnad om model finns
      if (point.model && byModel[point.model]) {
        byModel[point.model].cost += point.cost;
      }
    }

    // Sortera dagliga kostnader efter datum
    dailyCosts.sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalCost,
      totalTokens,
      byModel,
      dailyCosts,
    };
  } catch (error) {
    console.error('Fel vid hämtning av aggregerade kostnader:', error);
    throw error;
  }
}

/**
 * Synkroniserar OpenAI-kostnader med vår databas
 */
export async function syncOpenAICostsToDatabase(
  supabase: any,
  startDate: Date,
  endDate: Date = new Date()
): Promise<{ success: boolean; syncedRecords: number; error?: string }> {
  try {
    const aggregatedData = await getAggregatedCosts(startDate, endDate);

    // Förbered data för databas-insert
    const records = [];

    // Skapa records per dag och modell
    for (const dailyCost of aggregatedData.dailyCosts) {
      for (const [model, modelData] of Object.entries(aggregatedData.byModel)) {
        // Beräkna proportionell kostnad för denna modell denna dag
        const modelCostRatio = modelData.cost / aggregatedData.totalCost;
        const dailyModelCost = dailyCost.cost * modelCostRatio;

        if (dailyModelCost > 0) {
          records.push({
            sync_date: dailyCost.date,
            model: model,
            actual_cost: dailyModelCost,
            actual_tokens: Math.round(dailyCost.tokens * modelCostRatio),
            requests: Math.round(modelData.requests / aggregatedData.dailyCosts.length),
            metadata: {
              source: 'openai_api',
              synced_at: new Date().toISOString(),
            }
          });
        }
      }
    }

    // Infoga i databasen med upsert (uppdatera om finns, annars skapa ny)
    // Använd upsert utan onConflict parameter eftersom Supabase hanterar det automatiskt med unique index
    const { error } = await supabase
      .from('openai_usage_sync')
      .upsert(records);

    if (error) {
      console.error('Databas-fel vid synkronisering:', error);
      return { success: false, syncedRecords: 0, error: error.message };
    }

    return { success: true, syncedRecords: records.length };
  } catch (error: any) {
    console.error('Fel vid synkronisering av OpenAI-kostnader:', error);
    return { success: false, syncedRecords: 0, error: error.message };
  }
}

/**
 * Cache för att minimera API-anrop
 */
const usageCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuter

export async function getCachedUsageData(
  startDate: Date,
  endDate: Date
): Promise<any> {
  const cacheKey = `${startDate.toISOString()}-${endDate.toISOString()}`;
  const cached = usageCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returnerar cachad OpenAI usage data');
    return cached.data;
  }

  console.log('Hämtar ny OpenAI usage data från API');
  const data = await getAggregatedCosts(startDate, endDate);

  usageCache.set(cacheKey, { data, timestamp: Date.now() });

  // Rensa gamla cache-entries
  for (const [key, value] of usageCache.entries()) {
    if (Date.now() - value.timestamp > CACHE_TTL * 2) {
      usageCache.delete(key);
    }
  }

  return data;
}