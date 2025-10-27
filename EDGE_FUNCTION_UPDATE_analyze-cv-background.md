# CV Analysis Edge Function - Cost Tracking Update

## Fil att uppdatera
`supabase/functions/analyze-cv-background/index.ts`

## Ändringar som behövs

### 1. Lägg till usage tracking utility (längst upp, efter imports)

```typescript
// Add after imports at top of file
interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface UsageTracker {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  calls: Array<{
    step: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
  }>;
}

let usageTracker: UsageTracker = {
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  calls: []
};

function trackAPICall(step: string, model: string, usage: OpenAIUsage | undefined) {
  if (usage) {
    usageTracker.totalPromptTokens += usage.prompt_tokens || 0;
    usageTracker.totalCompletionTokens += usage.completion_tokens || 0;
    usageTracker.calls.push({
      step,
      model,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0
    });
  }
}

async function saveCostTracking(
  supabase: any,
  userId: string,
  jobId: string,
  generationTimeMs: number
) {
  try {
    // Hämta modelpriser från databasen
    const { data: pricing } = await supabase
      .from('model_pricing')
      .select('*')
      .in('model_name', ['gpt-4o', 'gpt-4o-mini']);

    if (!pricing || pricing.length === 0) {
      console.error('[Cost Tracking] No pricing data found');
      return;
    }

    const pricingMap = new Map(pricing.map((p: any) => [p.model_name, p]));

    // Beräkna total kostnad
    let totalCostUsd = 0;
    for (const call of usageTracker.calls) {
      const modelPricing = pricingMap.get(call.model);
      if (modelPricing) {
        const inputCost = (call.promptTokens / 1_000_000) * modelPricing.input_cost_per_million;
        const outputCost = (call.completionTokens / 1_000_000) * modelPricing.output_cost_per_million;
        totalCostUsd += inputCost + outputCost;
      }
    }

    const costSek = totalCostUsd * 10.5; // Convert to SEK

    // Spara i ai_usage_costs
    const { error } = await supabase
      .from('ai_usage_costs')
      .insert({
        user_id: userId,
        feature_name: 'cv_analysis',
        endpoint: '/functions/analyze-cv-background',
        ai_model: 'mixed', // Multiple models used
        prompt_tokens: usageTracker.totalPromptTokens,
        completion_tokens: usageTracker.totalCompletionTokens,
        total_tokens: usageTracker.totalPromptTokens + usageTracker.totalCompletionTokens,
        cost_usd: totalCostUsd,
        cost_sek: costSek,
        generation_time_ms: generationTimeMs,
        metadata: {
          job_id: jobId,
          api_calls: usageTracker.calls.length,
          steps: usageTracker.calls.map(c => c.step),
          models_used: [...new Set(usageTracker.calls.map(c => c.model))]
        }
      });

    if (error) {
      console.error('[Cost Tracking] Failed to save:', error);
    } else {
      console.log(`[Cost Tracking] Saved: $${totalCostUsd.toFixed(6)} USD (${costSek.toFixed(2)} SEK)`);
    }
  } catch (error) {
    console.error('[Cost Tracking] Error:', error);
  }
}
```

### 2. Uppdatera Deno.serve funktionen

Lägg till tracking i början:
```typescript
Deno.serve(async (req) => {
  let jobId;
  const startTime = Date.now(); // ADD THIS

  // Reset usage tracker for this request
  usageTracker = {  // ADD THIS
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    calls: []
  };

  try {
    // ... existing code ...
```

### 3. Lägg till tracking efter varje OpenAI-anrop

**Efter structured CV parsing (ca rad 193):**
```typescript
const structuredData = await structuredParsingResponse.json();
trackAPICall('structured_parsing', 'gpt-4o', structuredData.usage); // ADD THIS
const structuredCV = JSON.parse(structuredData.choices[0].message.content);
```

**Efter profile analysis (ca rad 245):**
```typescript
const profileData = await profileResponse.json();
trackAPICall('profile_summary', 'gpt-4o', profileData.usage); // ADD THIS
const rawProfileData = JSON.parse(profileData.choices[0].message.content);
```

**Efter skills extraction (ca rad 282):**
```typescript
const skillsData = await skillsResponse.json();
trackAPICall('skills_extraction', 'gpt-4o', skillsData.usage); // ADD THIS
const skillSuggestions = JSON.parse(skillsData.choices[0].message.content).skillSuggestions || [];
```

**Efter role batch analysis (ca rad 355 i loop):**
```typescript
const batchData = await batchResponse.json();
trackAPICall(`role_batch_${i + 1}`, 'gpt-4o', batchData.usage); // ADD THIS
const batchResult = JSON.parse(batchData.choices[0].message.content);
```

**Efter general analysis (ca rad 393):**
```typescript
const generalData = await generalResponse.json();
trackAPICall('general_analysis', 'gpt-4o', generalData.usage); // ADD THIS
const generalResult = JSON.parse(generalData.choices[0].message.content);
```

**Efter preview generation (ca rad 458):**
```typescript
const previewData = await previewResponse.json();
trackAPICall('formatted_preview', 'gpt-4o-mini', previewData.usage); // ADD THIS
const formattedPreview = previewData.choices[0].message.content;
```

### 4. Spara cost tracking innan success response

**Efter `console.log(\`[Job ${jobId}] ✅ Analysis completed successfully\`)` (ca rad 516):**

```typescript
console.log(`[Job ${jobId}] ✅ Analysis completed successfully`);

// Track AI usage and costs  // ADD THIS BLOCK
const generationTimeMs = Date.now() - startTime;
// Get userId from job
const { data: jobData } = await supabase
  .from('cv_analysis_jobs')
  .select('user_id')
  .eq('id', jobId)
  .single();

if (jobData?.user_id) {
  await saveCostTracking(supabase, jobData.user_id, jobId, generationTimeMs);
}

return new Response(JSON.stringify({
  success: true,
  jobId
}), {
  status: 200,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## Sammanfattning

Dessa ändringar lägger till:
- ✅ Usage tracking för alla 6-7 OpenAI-anrop i Edge Function
- ✅ Kostnadskalkylering baserad på model_pricing-tabellen
- ✅ Sparande i ai_usage_costs-tabellen
- ✅ Metadata med job_id, antal anrop, och vilka steg som kördes
- ✅ Felhantering så att tracking inte stoppar huvudflödet

## Deploy

Efter att du har gjort ändringarna, deploya med:
```bash
supabase functions deploy analyze-cv-background
```
