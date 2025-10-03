import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Helper: Fetch with timeout and retry logic
async function fetchWithRetry(url: string, options: any, maxRetries = 2, timeout = 30000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Retry ${attempt + 1}/${maxRetries} after error:`, error instanceof Error ? error.message : 'Unknown');
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// KRITISK FIX: Validera och normalisera roleImprovement-objekt
function sanitizeRoleImprovement(role: any): any {
  // Validera att keywords är array av STRINGS (inte objekt, undefined, null, eller tom sträng)
  const validateKeywords = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => typeof item === 'string' && item !== null && item !== undefined && item.trim().length > 0)
      .map(item => String(item).trim());
  };

  // Validera att grammarIssues är array av STRINGS (inte objekt, undefined, null, eller tom sträng)
  const validateGrammarIssues = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => typeof item === 'string' && item !== null && item !== undefined && item.trim().length > 0)
      .map(item => String(item).trim());
  };

  return {
    roleTitle: role?.roleTitle || 'Okänd roll',
    company: role?.company || 'Okänt företag',
    period: role?.period || '',
    currentText: role?.currentText || '',
    suggestedText: role?.suggestedText || '',
    improvements: {
      hasQuantification: role?.improvements?.hasQuantification ?? false,
      keywords: validateKeywords(role?.improvements?.keywords),  // <-- VALIDERA STRINGS!
      grammarIssues: validateGrammarIssues(role?.improvements?.grammarIssues),  // <-- VALIDERA STRINGS!
      atsOptimization: role?.improvements?.atsOptimization ?? false
    },
    atsImpact: typeof role?.atsImpact === 'number' ? role.atsImpact : 0
  };
}

Deno.serve(async (req) => {
  let jobId: string | undefined;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    jobId = requestData.jobId;
    const { cvText, userId } = requestData;

    if (!jobId || !cvText || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (jobId, cvText, or userId)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Job ${jobId}] Starting background analysis`);

    await supabase
      .from('cv_analysis_jobs')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const isPremium = profileData?.subscription_tier === 'premium';

    // 1. Parse CV
    console.log(`[Job ${jobId}] Step 1/6: Parsing CV (${cvText.length} chars)...`);
    const parseResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Du är en CV-parser. Extrahera arbetsroller och personbeskrivning från CV:t i JSON-format.'
          },
          {
            role: 'user',
            content: `Analysera detta CV och extrahera arbetsroller och personbeskrivning:\n\n${cvText}\n\nReturnera JSON med format: { "profileSummary": string | null, "roles": [{ "title": string, "company": string, "period": string, "description": string }] }\n\nVIKTIGT: profileSummary ska vara den inledande texten/personbeskrivningen om den finns, annars null.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    const parseData = await parseResponse.json();
    const parsedCV = JSON.parse(parseData.choices[0].message.content);
    const rolesCount = parsedCV.roles?.length || 0;
    console.log(`[Job ${jobId}] Parsed ${rolesCount} roles and profile summary`);

    // NEW: Parse CV into structured CVMetadata format
    console.log(`[Job ${jobId}] Step 1.5/6: Parsing CV into structured format...`);
    const structuredParsingResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Du är en CV-parser. Extrahera ALL information från CV:t och returnera som strukturerad JSON. Var EXTREMT noggrann med att bevara all text och formatering.'
          },
          {
            role: 'user',
            content: `Parsa detta CV till strukturerad JSON:\n\n${cvText}\n\nReturnera JSON med EXAKT detta format:\n{\n  "personalInfo": {\n    "fullName": string,\n    "email": string,\n    "phone": string,\n    "address": string,\n    "linkedin": string\n  },\n  "summary": string,\n  "experience": [{\n    "position": string,\n    "company": string,\n    "location": string,\n    "startDate": string,\n    "endDate": string (eller null om nuvarande),\n    "description": string[]\n  }],\n  "education": [{\n    "degree": string,\n    "institution": string,\n    "graduationYear": string,\n    "description": string\n  }],\n  "skills": [{\n    "category": string,\n    "skills": string[]\n  }],\n  "languages": [{\n    "language": string,\n    "proficiency": string\n  }],\n  "certifications": [{\n    "name": string,\n    "issuer": string,\n    "date": string\n  }],\n  "references": string\n}\n\nVIKTIGT: Bevara ALL originaltext. Description-fält ska vara arrays med meningar/punkter.`
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      })
    });

    const structuredData = await structuredParsingResponse.json();
    const structuredCV = JSON.parse(structuredData.choices[0].message.content);
    console.log(`[Job ${jobId}] Structured CV parsed: ${structuredCV.experience?.length || 0} experiences, ${structuredCV.education?.length || 0} educations`);

    let analysisResult: any;

    if (isPremium) {
      // 2. Analysera personbeskrivning (Premium)
      console.log(`[Job ${jobId}] Step 2/6: Analyzing profile summary...`);
      let profileSummaryImprovement = null;

      if (parsedCV.profileSummary) {
        const profileResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'Du är en CV-expert. Förbättra personbeskrivningen med kraftfulla nyckelord och tydligt värde.'
              },
              {
                role: 'user',
                content: `Här är det fullständiga CV:t:\n\n${cvText}\n\n---\n\nFörbättra personbeskrivningen/sammanfattningen från CV:t.\n\nReturnera JSON med format: { "currentText": string (EXAKT originaltext från CV:t), "suggestedText": string (förbättrad version), "improvements": string[] }\n\nVIKTIGT: currentText ska vara EXAKT den text som finns i det ursprungliga CV:t, inklusive eventuella fel eller brister.`
              }
            ],
            temperature: 0.6,
            max_tokens: 800,
            response_format: { type: 'json_object' }
          })
        });

        const profileData = await profileResponse.json();
        const rawProfileData = JSON.parse(profileData.choices[0].message.content);
        // Map to frontend expected format: suggestedText -> improvedText, improvements -> changes
        profileSummaryImprovement = {
          currentText: rawProfileData.currentText,
          improvedText: rawProfileData.suggestedText,
          changes: rawProfileData.improvements || [],
          atsImpact: 10 // Static for now
        };
        console.log(`[Job ${jobId}] Profile summary improvement generated`);
      }

      // 3. Extrahera färdigheter från roller (Premium)
      console.log(`[Job ${jobId}] Step 3/6: Extracting skills from role descriptions...`);
      const skillsResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Du är en kompetensanalytiker. Identifiera konkreta färdigheter och teknologier från rollbeskrivningar som användaren kanske glömt lista under sina kompetenser.'
            },
            {
              role: 'user',
              content: `Analysera dessa roller och hitta färdigheter som nämns men kanske inte listas explicit:\n\n${JSON.stringify(parsedCV.roles)}\n\nReturnera JSON med format: { "skillSuggestions": [{ "skill": string, "relevance": string ("high", "medium", "low"), "source": string (konkret roll och företag, t.ex. "Snickare på Durgé Byggnads AB"), "reasoning": string }] }\n\nVIKTIGT: source ska vara exakt "RollTitle på Company" från rollerna ovan.`
            }
          ],
          temperature: 0.5,
          max_tokens: 1200,
          response_format: { type: 'json_object' }
        })
      });

      const skillsData = await skillsResponse.json();
      const skillSuggestions = JSON.parse(skillsData.choices[0].message.content).skillSuggestions || [];
      console.log(`[Job ${jobId}] Found ${skillSuggestions.length} skill suggestions`);

      // 4. Analysera roller med batch processing (Premium)
      console.log(`[Job ${jobId}] Step 4/6: Analyzing roles...`);
      const ROLES_PER_BATCH = 3;
      const allRoleImprovements: any[] = [];
      const roles = parsedCV.roles || [];

      const batches: any[][] = [];
      for (let i = 0; i < roles.length; i += ROLES_PER_BATCH) {
        batches.push(roles.slice(i, i + ROLES_PER_BATCH));
      }

      console.log(`[Job ${jobId}] Processing ${roles.length} roles in ${batches.length} batches...`);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`[Job ${jobId}] Step 4.${i + 1}: Analyzing batch ${i + 1}/${batches.length} (${batch.length} roles)...`);

        const batchResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'Du är en expert CV-rådgivare. Analysera arbetsroller och ge konkreta förbättringsförslag med kvantifiering. Inkludera ALLTID originaltext från CV:t i currentText fältet.'
              },
              {
                role: 'user',
                content: `Här är det fullständiga CV:t:\n\n${cvText}\n\n---\n\nFokusera på dessa roller:\n${JSON.stringify(batch)}\n\nAnalysera dessa roller och ge förbättringsförslag med siffror och KPI:er.\n\nReturnera JSON med format: { "roleBasedImprovements": [{ "roleTitle": string, "company": string, "period": string, "currentText": string (EXAKT originaltext från CV:t för denna roll), "suggestedText": string (förbättrad version), "improvements": { "hasQuantification": boolean, "keywords": string[], "grammarIssues": string[], "atsOptimization": boolean }, "atsImpact": number (1-20) }] }\n\nVIKTIGT: currentText ska vara EXAKT den text som finns i det ursprungliga CV:t för varje roll, inklusive eventuella brister. Hitta texten i det fullständiga CV:t ovan. atsImpact ska vara 1-20, improvements.keywords och improvements.grammarIssues ska ALLTID vara arrays.`
              }
            ],
            temperature: 0.6,
            max_tokens: 2500,
            response_format: { type: 'json_object' }
          })
        });

        const batchData = await batchResponse.json();
        const batchResult = JSON.parse(batchData.choices[0].message.content);

        // KRITISK FIX: Sanitera varje role improvement
        const sanitizedBatch = (batchResult.roleBasedImprovements || []).map(sanitizeRoleImprovement);
        allRoleImprovements.push(...sanitizedBatch);

        console.log(`[Job ${jobId}] Batch ${i + 1} completed: ${sanitizedBatch.length} improvements (sanitized)`);
      }

      // 5. Allmän analys (Premium)
      console.log(`[Job ${jobId}] Step 5/6: Performing general analysis...`);
      const generalResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Du är en CV-expert. Ge konkreta allmänna förbättringsförslag för struktur, formatering, certifieringar och språk. Var ALLTID specifik och ge minst 3-5 förbättringsförslag.'
            },
            {
              role: 'user',
              content: `Ge allmänna förbättringsförslag för detta CV:\n\n${cvText}\n\nReturnera JSON med format: { "generalImprovements": [{ "title": string, "description": string, "category": string ("Struktur", "Formatering", "Innehåll", "Nyckelord") }], "keywords": string[], "atsScore": number (0-100) }\n\nVIKTIGT: Ge MINST 3 konkreta generalImprovements. atsScore ska vara ett heltal mellan 0-100.`
            }
          ],
          temperature: 0.6,
          max_tokens: 1500,
          response_format: { type: 'json_object' }
        })
      });

      const generalData = await generalResponse.json();
      const generalResult = JSON.parse(generalData.choices[0].message.content);

      // Ensure generalImprovements is never empty
      if (!generalResult.generalImprovements || generalResult.generalImprovements.length === 0) {
        generalResult.generalImprovements = [
          { title: 'Lägg till nyckelord', description: 'Inkludera branschspecifika nyckelord för att öka ATS-träffsäkerhet', category: 'Nyckelord' },
          { title: 'Kvantifiera prestationer', description: 'Lägg till mätbara resultat och siffror i dina arbetsbeskrivningar', category: 'Innehåll' },
          { title: 'Förbättra struktur', description: 'Organisera ditt CV i tydliga sektioner med konsekvent formatering', category: 'Struktur' }
        ];
      }

      analysisResult = {
        analysisType: 'premium',
        profileSummary: profileSummaryImprovement,
        skillSuggestions: skillSuggestions,
        roleBasedImprovements: allRoleImprovements,
        generalImprovements: generalResult.generalImprovements,
        keywords: generalResult.keywords || [],
        atsFriendliness: {
          score: generalResult.atsScore || 0,
          feedback: `Ditt CV har en ATS-poäng på ${generalResult.atsScore || 0}/100`,
          missingKeywords: []
        },
        model: 'gpt-4o',
        tokens: { total: 0 }
      };
    } else {
      // Basic-analys
      console.log(`[Job ${jobId}] Step 2/6: Performing basic analysis...`);
      const basicResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Du är en CV-expert. Ge grundläggande förbättringsförslag.'
            },
            {
              role: 'user',
              content: `Analysera detta CV och ge förbättringsförslag:\n\n${cvText}\n\nReturnera JSON med format: { "generalImprovements": [{ "title": string, "description": string, "category": string }] }`
            }
          ],
          temperature: 0.6,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        })
      });

      const basicData = await basicResponse.json();
      analysisResult = JSON.parse(basicData.choices[0].message.content);
      analysisResult.analysisType = 'basic';
      analysisResult.model = 'gpt-4o-mini';

      // Ensure generalImprovements exists for basic tier too
      if (!analysisResult.generalImprovements || analysisResult.generalImprovements.length === 0) {
        analysisResult.generalImprovements = [
          { title: 'Uppgradera till Premium', description: 'Få djupare analys med rollspecifika förbättringar och färdighetsförslag', category: 'Premium' }
        ];
      }
    }

    // Lägg till parsed roles
    analysisResult.parsedRoles = parsedCV.roles?.map((r: any) => ({
      title: r.title,
      company: r.company,
      period: r.period
    })) || [];

    // NEW: Add structured CV data to result
    analysisResult.structuredCV = structuredCV;

    console.log(`[Job ${jobId}] Step 6/6: Saving results (with structured CV data)...`);

    const { error: resultError } = await supabase
      .from('cv_analysis_jobs')
      .update({
        status: 'completed',
        result: analysisResult,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (resultError) {
      console.error(`[Job ${jobId}] Failed to save analysis result:`, resultError);
      throw resultError;
    }

    console.log(`[Job ${jobId}] ✅ Analysis completed successfully`);

    return new Response(
      JSON.stringify({ success: true, jobId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[Job ${jobId || 'unknown'}] ❌ Error in background analysis:`, error);

    if (jobId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('cv_analysis_jobs')
          .update({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);
      } catch (updateError) {
        console.error(`[Job ${jobId}] Failed to update job with error:`, updateError);
      }
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
