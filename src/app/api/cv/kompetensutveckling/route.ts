// /app/api/cv/kompetensutveckling/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { analyzeCompetenceGap, CompetenceAnalysisResult, MissingSkill } from '@/lib/openai/analyzeCompetenceGap';
import { analyzeCompetenceGapGPT5, generateLearningSuggestionsGPT5 } from '@/lib/openai/analyzeCompetenceGapGPT5';
import { logUserActivity } from '@/lib/activity-logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { openai } from '@/lib/openai/api';

// Set max duration for Vercel functions (in seconds)
export const maxDuration = 60; // Vercel limit

// ============================================================================
//  Constants & Configuration
// ============================================================================

// Konstant för att definiera veckobegränsning för gratisanvändare
const WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE = 2; // Endast 2 analys per vecka för gratisanvändare

// --- TYPDEFINITION MED UTÖKADE FÄLT OCH DIREKTLÄNKAR ---
// Denna typ används internt i denna fil och för API-svaret.
export interface LearningSuggestion {
    type: 'course' | 'certification' | 'self-study' | 'project';
    title: string; // Exakt kursnamn
    provider?: string; // Specifik leverantör/plattform
    relevance: string;
    search_keywords?: string[]; // Söktermer för att hitta kursen
    direct_url?: string; // Direktlänk när känd
    duration?: string; // Kurslängd (t.ex. '2 veckor', '3 månader')
    cost?: string; // Kostnad (t.ex. 'Gratis', '15 000 kr')
    priority?: 'essential' | 'recommended' | 'optional'; // Prioritetsnivå
    language?: 'sv' | 'en' | 'other';
}
// --- SLUT TYPDEFINITION ---

// ============================================================================
//  Helper Functions
// ============================================================================

/**
 * Beräknar nästa återställningsdatum (nästa måndag 00:00 UTC) baserat på det senaste återställningstidsstämpeln.
 */
const calculateNextResetDate = (lastResetTimestamp: string | null): Date => {
    const now = new Date();
    const lastReset = lastResetTimestamp ? new Date(lastResetTimestamp) : now;
    const nextReset = new Date(lastReset);
    nextReset.setUTCHours(0, 0, 0, 0);
    const currentDayOfWeek = nextReset.getUTCDay();
    const daysUntilMonday = (currentDayOfWeek === 1) ? 7 : (8 - currentDayOfWeek) % 7;
    if (daysUntilMonday === 0 && lastResetTimestamp === null) {
         nextReset.setUTCDate(nextReset.getUTCDate() + 7);
    } else if (daysUntilMonday > 0) {
        nextReset.setUTCDate(nextReset.getUTCDate() + daysUntilMonday);
    }
    while (nextReset.getTime() <= now.getTime()) {
        console.warn(`Calculated reset date ${nextReset.toISOString()} was not in the future compared to ${now.toISOString()}. Adding 7 days.`);
        nextReset.setUTCDate(nextReset.getUTCDate() + 7);
    }
    return nextReset;
};

/**
 * Hämtar användarprofildata relevant för analysgränser.
 */
async function getUserProfileData(supabase: SupabaseClient<Database>, userId: string) {
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, weekly_competence_analysis_count, last_competence_analysis_reset, next_reset_date')
        .eq('id', userId)
        .single();
    
    if (profileError) {
        const errorMessage = profileError.code === 'PGRST116' 
            ? 'Användarprofil kunde inte hittas.' 
            : `Databasfel vid hämtning av profil: ${profileError.message}`;
        console.error(`API competenceAnalysis: Error fetching profile for user ${userId}:`, profileError);
        throw new Error(errorMessage);
    }
    
    if (!profileData) {
        console.error(`API competenceAnalysis: Profile data is null for user ${userId} despite no error.`);
        throw new Error('Användarprofil saknas.');
    }
    
    return {
        subscriptionTier: ((profileData as any).subscription_tier === 'premium' ? 'premium' : 'free') as 'free' | 'premium',
        currentAnalysisCount: (profileData as any).weekly_competence_analysis_count ?? 0,
        lastAnalysisResetTimestamp: (profileData as any).last_competence_analysis_reset,
        dbNextResetDate: (profileData as any).next_reset_date ? new Date((profileData as any).next_reset_date) : null
    };
}

/**
 * Återställer veckoräknaren för en användare om återställningsdatumet har passerat.
 */
async function checkAndResetAnalysisCount(
    supabase: SupabaseClient<Database>,
    userId: string,
    currentCount: number,
    dbNextResetDate: Date | null,
    lastAnalysisResetTimestamp: string | null
): Promise<{ count: number; lastReset: string; nextReset: Date }> {
    const now = new Date();
    let nextResetDate = (dbNextResetDate && dbNextResetDate > now) 
        ? dbNextResetDate 
        : calculateNextResetDate(lastAnalysisResetTimestamp);
    
    let count = currentCount;
    let lastReset = lastAnalysisResetTimestamp ?? now.toISOString();
    
    // Om det är dags för återställning
    if (now.getTime() >= nextResetDate.getTime()) {
        console.log(`API competenceAnalysis: User ${userId}: Resetting analysis count.`);
        count = 0;
        lastReset = now.toISOString();
        nextResetDate = calculateNextResetDate(lastReset);
        
        const { error: resetError } = await (supabase as any)
            .from('profiles')
            .update({ 
                weekly_competence_analysis_count: 0, 
                last_competence_analysis_reset: lastReset, 
                next_reset_date: nextResetDate.toISOString() 
            })
            .eq('id', userId);
        
        if (resetError) { 
            console.error(`API competenceAnalysis: User ${userId}: Failed to update DB on count reset:`, resetError); 
        } else { 
            console.log(`API competenceAnalysis: User ${userId}: Database updated with reset count and new reset date.`); 
        }
    }
    
    return { count, lastReset, nextReset: nextResetDate };
}

/**
 * Hämtar CV-text för en given användare och CV-ID.
 */
async function getCvText(supabase: SupabaseClient<Database>, userId: string, cvId: string): Promise<string> {
    console.log(`--- DEBUG getCvText: Fetching CV text for CV ID: ${cvId}, User ID: ${userId}`);
    const { data: cvData, error: dbError } = await supabase
        .from('cv_texts')
        .select('cv_text')
        .eq('id', cvId)
        .eq('user_id', userId)
        .single();

    if (dbError || !(cvData as any)?.cv_text) {
        const isNotFoundError = dbError?.code === 'PGRST116';
        const errorMessage = isNotFoundError
            ? 'Kunde inte hitta angivet CV eller så tillhör det inte dig.'
            : `Databasfel vid hämtning av CV: ${dbError?.message || 'Okänt DB-fel'}`;
        console.error(`API competenceAnalysis: Error fetching CV text (CV ID: ${cvId}, User ID: ${userId}):`, dbError);
        const error = new Error(errorMessage);
        (error as any).statusCode = isNotFoundError ? 404 : 500;
        throw error;
    }
    console.log(`--- DEBUG getCvText: CV Text fetched successfully (length: ${(cvData as any).cv_text.length})`);
    return (cvData as any).cv_text;
}

/**
 * Ökar räknaren för en gratisanvändare efter en lyckad analys.
 */
async function incrementFreeUserCount(supabase: SupabaseClient<Database>, userId: string, currentCount: number): Promise<number> {
    const newCount = currentCount + 1;
    const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ weekly_competence_analysis_count: newCount })
        .eq('id', userId);
    
    if (updateError) { 
        console.error(`API competenceAnalysis: User ${userId}: Failed to update analysis count after successful analysis:`, updateError); 
    }
    
    return Math.max(0, WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE - newCount);
}

/**
 * Använder GPT-5 för att hitta läranderesurser och generera direkta länkar för ett specifikt kompetensgap.
 */
async function findLearningResourcesForGap(gap: MissingSkill, targetRole: string = ''): Promise<LearningSuggestion[]> {
    // Use GPT-5 for learning suggestions
    try {
        const suggestions = await generateLearningSuggestionsGPT5(gap, targetRole);
        return suggestions;
    } catch (error) {
        console.error(`Failed to generate learning suggestions with GPT-5 for gap "${gap.skill}":`, error);
        return [];
    }
}

/**
 * Fallback function using GPT-4 if GPT-5 fails
 */
async function findLearningResourcesForGapOld(gap: MissingSkill, language: string = 'sv'): Promise<LearningSuggestion[]> {
    const modelToUse = "gpt-4o-mini"; // Använder GPT-4o-mini som fungerar tillförlitligt
    const maxSuggestionsPerGap = 2; // Max 2 förslag per gap för bättre pedagogik

    const systemPrompt = `
        Du är expert på svenska arbetsmarknaden och yrkesutbildningar.
        För varje kompetensgap, returnera MAX ${maxSuggestionsPerGap} KONKRETA kursförslag.

        VIKTIGA REGLER:
        1. Prioritera Arbetsförmedlingens kurser (ofta gratis)
        2. För yrkescertifikat: Ange ALLTID branschorganisationen
        3. För körkort: Hänvisa till lokala trafikskolor
        4. Inkludera uppskattad tid och kostnad
        5. Var SPECIFIK med kursnamn som faktiskt existerar

        Vanliga svenska utbildningsanordnare:
        - Arbetsförmedlingen (gratis kurser)
        - Lernia (yrkesutbildningar)
        - YH-skolor (yrkeshögskola)
        - BYN (byggbranschens certifikat)
        - Brandskyddsföreningen (säkerhetscertifikat)
        - Transportfackens Yrkes- och Arbetsmiljönämnd (TYA)
        - Komvux (grundläggande kurser)
    `;

    const userPrompt = `
        Hitta MAX ${maxSuggestionsPerGap} konkreta kurser/certifieringar för: "${gap.skill}" (${gap.importance}).
        ${gap.reasoning}

        Ge EXAKTA kursnamn som finns hos svenska utbildningsanordnare.
        Inkludera uppskattad tid, kostnad och om det är obligatoriskt för yrket.
    `;

    try {
        console.log(`--- DEBUG findLearningResourcesForGap: Söker resurser/söktermer för gap: ${JSON.stringify(gap.skill)} (max ${maxSuggestionsPerGap})`);

        // Timeout för varje kursförslag (15 sekunder för bättre kvalitet)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout för kursförslag: ${gap.skill}`)), 15000)
        );

        const completionPromise = openai.chat.completions.create({
            model: modelToUse,
            messages: [ { role: "system", content: systemPrompt }, { role: "user", content: userPrompt } ],
            // GPT-4o-mini med Structured Outputs
            temperature: 0.5, // Balanserad temperatur
            max_tokens: 800, // GPT-4o-mini använder max_tokens
            response_format: {
                type: "json_schema",
                json_schema: {
                    strict: true,
                    name: "learning_suggestions",
                    schema: {
                        type: "object",
                        properties: {
                            suggestions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        type: {
                                            type: "string",
                                            enum: ["course", "certification", "self-study", "project"]
                                        },
                                        title: {
                                            type: "string",
                                            description: "Exakt kursnamn"
                                        },
                                        provider: {
                                            type: ["string", "null"],
                                            description: "Leverantör eller plattform"
                                        },
                                        relevance: {
                                            type: "string",
                                            description: "Förklaring av relevans"
                                        },
                                        search_keywords: {
                                            type: "array",
                                            items: { type: "string" },
                                            description: "Söktermer för att hitta kursen"
                                        },
                                        direct_url: {
                                            type: ["string", "null"],
                                            description: "Direktlänk om känd"
                                        },
                                        duration: {
                                            type: ["string", "null"],
                                            description: "Kurslängd"
                                        },
                                        cost: {
                                            type: ["string", "null"],
                                            description: "Kostnad"
                                        },
                                        priority: {
                                            type: "string",
                                            enum: ["essential", "recommended", "optional"]
                                        },
                                        language: {
                                            type: "string",
                                            enum: ["sv", "en", "other"]
                                        }
                                    },
                                    required: ["type", "title", "relevance", "search_keywords", "priority", "language"],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ["suggestions"],
                        additionalProperties: false
                    }
                }
            }
         });

        // Vänta på det som slutförs först
        const completion = await Promise.race([
            completionPromise,
            timeoutPromise
        ]) as any;

        const content = completion.choices[0].message.content;
        console.log(`--- DEBUG findLearningResourcesForGap: Rått OpenAI-svar (förväntar söktermer) för gap "${gap.skill}": ${content ? content.substring(0, 150) + '...' : 'null'}`);

        if (!content) {
             console.warn(`--- DEBUG findLearningResourcesForGap: Inget innehåll från OpenAI för gap: "${gap.skill}"`);
             return [];
        }

        let suggestions: LearningSuggestion[] = [];
        try {
            const parsedJson = JSON.parse(content);
            console.log(`--- DEBUG findLearningResourcesForGap: Parsat JSON-svar för gap "${gap.skill}"`);

             if (parsedJson && typeof parsedJson === 'object') {
                if (Array.isArray(parsedJson.suggestions)) {
                    suggestions = parsedJson.suggestions;
                    // Map och validera fält
                    suggestions = suggestions.map(s => ({
                        type: s.type || 'course',
                        title: s.title || '',
                        provider: s.provider || undefined,
                        relevance: s.relevance || '',
                        search_keywords: Array.isArray(s.search_keywords) ? s.search_keywords : [],
                        direct_url: s.direct_url || undefined,
                        duration: s.duration || undefined,
                        cost: s.cost || undefined,
                        priority: s.priority || 'recommended',
                        language: s.language || 'sv'
                    }));
                } else {
                    console.warn(`--- DEBUG findLearningResourcesForGap: Oväntad JSON-struktur (saknar 'suggestions'-array) från OpenAI för gap "${gap.skill}".`);
                }
            } else {
                 console.warn(`--- DEBUG findLearningResourcesForGap: Svaret var inte ett JSON-objekt för gap "${gap.skill}".`);
             }

            // Filtrera bort förslag som saknar nödvändiga fält
            suggestions = suggestions.filter(s => s?.type && s?.title && s?.relevance);
            console.log(`--- DEBUG findLearningResourcesForGap: Antal GILTIGA förslag efter filtrering för gap "${gap.skill}": ${suggestions.length}`);

        } catch (parseError) {
            console.error(`--- DEBUG findLearningResourcesForGap: Misslyckades parsa JSON för gap "${gap.skill}":`, parseError, "\nRått innehåll:", content);
            return [];
        }

        return suggestions.slice(0, maxSuggestionsPerGap); // Returnerar max 2

    } catch (error) {
        console.error(`--- DEBUG findLearningResourcesForGap: OpenAI API-anrop misslyckades för gap "${gap.skill}":`, error);
        return []; // Returnera tom array vid API-fel
    }
}

// ============================================================================
//  API Route Handler (POST)
// ============================================================================
export async function POST(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    let userId: string | undefined;
    let requestBody: any = {};
    let analysisInputForStep1: any = null;
    let initialAnalysisResult: CompetenceAnalysisResult | null = null;
    let statusCode = 500; // Default status code for internal errors
    let errorTargetDesc = 'Okänt mål'; // For logging

    try {
        // --- 1. Autentisering ---
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            statusCode = 401;
            throw new Error('Autentisering krävs.');
        }
        userId = user.id;
        console.log(`--- DEBUG POST: User Authenticated: ${userId}`);

        // --- 2. Validera och Parsa Request Body ---
        try {
            requestBody = await request.json();
            console.log(`--- DEBUG POST: Received Request Body`); // Undvik att logga PII (jobbannons)

            if (!requestBody.cvId || typeof requestBody.cvId !== 'string') {
                throw new Error('cvId saknas eller är ogiltigt.');
            }
            if (requestBody.analysisMode !== 'role' && requestBody.analysisMode !== 'jobAd') {
                throw new Error('Ogiltigt eller saknat analysisMode.');
            }

            analysisInputForStep1 = { mode: requestBody.analysisMode, cvId: requestBody.cvId };

            if (requestBody.analysisMode === 'role') {
                if (!requestBody.targetRole || typeof requestBody.targetRole !== 'string' || requestBody.targetRole.trim() === '') {
                    throw new Error('targetRole saknas eller är ogiltigt.');
                }
                analysisInputForStep1.targetRole = requestBody.targetRole;
                analysisInputForStep1.targetCountry = "Sverige"; // Hårdkodat
                errorTargetDesc = `Role: ${analysisInputForStep1.targetRole}/Sverige`;
            } else { // mode === 'jobAd'
                if (!requestBody.jobAdText || typeof requestBody.jobAdText !== 'string' || requestBody.jobAdText.trim().length < 50) {
                    throw new Error('jobAdText saknas, är ogiltigt eller för kort.');
                }
                analysisInputForStep1.jobAdText = requestBody.jobAdText;
                errorTargetDesc = `Job Ad (Mode: ${requestBody.analysisMode})`;
            }
            console.log(`--- DEBUG POST: Parsed analysisInputForStep1 (Mode: ${analysisInputForStep1.mode})`);

        } catch (error: any) {
            statusCode = 400; // Bad Request
            throw new Error(`Ogiltig förfrågan: ${error.message}`);
        }

        // --- 3. Hämta användardata och hantera begränsningar ---
        const profileData = await getUserProfileData(supabase, userId);
        const resetInfo = await checkAndResetAnalysisCount(
            supabase, 
            userId, 
            profileData.currentAnalysisCount, 
            profileData.dbNextResetDate, 
            profileData.lastAnalysisResetTimestamp
        );
        
        // Kontrollera om användaren har nått sin veckogräns
        let currentRemainingAnalyses = WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE - resetInfo.count;
        const nextResetDate = resetInfo.nextReset;
        
        if (profileData.subscriptionTier === 'free' && resetInfo.count >= WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE) {
            console.log(`API competenceAnalysis: User ${userId} (Free): Limit reached after reset check.`);
            return NextResponse.json( 
                { 
                    message: `Du har nått din veckogräns på ${WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE} kompetensanalys(er).`, 
                    remainingAnalyses: 0, 
                    limitReached: true, 
                    nextResetDate: nextResetDate.toISOString() 
                }, 
                { status: 429 }
            );
        }

        // --- 4. Hämta CV-text ---
        const cvText = await getCvText(supabase, userId, analysisInputForStep1.cvId);
        analysisInputForStep1.cvText = cvText; // Lägg till CV-texten för analysen

        // --- 5. Steg 1: Utför initial kompetensanalys (identifiera gap) ---
        console.log(`--- DEBUG POST (Step 1): Performing initial analysis for target: ${errorTargetDesc}`);

        // Use GPT-5 for main analysis - IT'S BETTER!
        try {
            initialAnalysisResult = await analyzeCompetenceGapGPT5(analysisInputForStep1);
            console.log('--- DEBUG: Successfully used GPT-5 for analysis');
        } catch (gpt5Error) {
            console.error('--- DEBUG: GPT-5 failed, falling back to GPT-4:', gpt5Error);
            initialAnalysisResult = await analyzeCompetenceGap(analysisInputForStep1);
        }
        console.log(`--- DEBUG POST (Step 1): Initial analysis successful. Score: ${initialAnalysisResult?.matchScore ?? 'N/A'}%`);

        // --- 6. Steg 2: Hitta läranderesurser/söktermer för identifierade gap ---
        const allGeneratedSuggestions: LearningSuggestion[] = [];
        const gapsToProcess = initialAnalysisResult?.identifiedSkillGaps || [];
        const modelToUseStep2 = "gpt-5-nano"; // Using GPT-5 nano for course suggestions
        const analysisStartTime = Date.now(); // Track start time for timeout check

        if (gapsToProcess.length > 0) {
            // Sortera gapen: 'essential' först, sedan 'desirable'
            gapsToProcess.sort((a, b) => {
                 if (a.importance === 'essential' && b.importance !== 'essential') return -1;
                 if (a.importance !== 'essential' && b.importance === 'essential') return 1;
                 if (a.importance === 'desirable' && b.importance !== 'desirable') return -1;
                 if (a.importance !== 'desirable' && b.importance === 'desirable') return 1;
                 return 0;
             });
            console.log(`--- DEBUG POST (Step 2): Found ${gapsToProcess.length} gaps to process. Processing in order (essential first).`);

            // Begränsa antalet gap som processas för att undvika timeout
            // Ta ENDAST 1 gap för att säkerställa svar inom timeout
            const essentialGaps = gapsToProcess.filter(g => g.importance === 'essential');
            const desirableGaps = gapsToProcess.filter(g => g.importance === 'desirable');
            const gapsToProcessLimited = [...essentialGaps.slice(0, 1)]; // Processa ENDAST 1 gap för att undvika timeout

            console.log(`--- DEBUG POST (Step 2): Processing ${gapsToProcessLimited.length} of ${gapsToProcess.length} gaps (ONE ONLY to avoid timeout).`);

            const targetRole = analysisInputForStep1.mode === 'role'
                ? analysisInputForStep1.targetRole
                : 'Jobbannons';

            console.log(`--- DEBUG POST (Step 2): Processing SINGLE gap to ensure response within 60s`);

            // Process ONLY ONE gap to avoid timeout
            // GPT-5 with web search can take 30-40 seconds
            for (let i = 0; i < gapsToProcessLimited.length; i++) {
                const gap = gapsToProcessLimited[i];
                console.log(`--- DEBUG POST (Step 2): Processing gap ${i+1}/${gapsToProcessLimited.length}: "${gap.skill}"`);

                try {
                    // Use GPT-5 for better suggestions
                    let suggestions: LearningSuggestion[] = [];

                    // Allow up to 40 seconds for single GPT-5 call with web search
                    const startTime = Date.now();

                    try {
                        suggestions = await generateLearningSuggestionsGPT5(gap, targetRole);
                        const elapsed = Date.now() - startTime;
                        console.log(`--- DEBUG: GPT-5 completed for gap "${gap.skill}" in ${elapsed}ms`);
                    } catch (gpt5Err) {
                        const elapsed = Date.now() - startTime;
                        console.error(`--- DEBUG: GPT-5 failed for gap "${gap.skill}" after ${elapsed}ms:`, gpt5Err);
                        // Skip fallback to save time
                        suggestions = [];
                    }

                    console.log(`--- DEBUG POST (Step 2): Processed gap "${gap.skill}", got ${suggestions.length} suggestions`);
                    allGeneratedSuggestions.push(...suggestions);

                    // Check if we're approaching timeout (50 seconds total)
                    const totalElapsed = Date.now() - analysisStartTime;
                    if (totalElapsed > 50000 && i < gapsToProcessLimited.length - 1) {
                        console.warn(`--- WARNING: Approaching timeout after ${i+1} gaps (${totalElapsed}ms elapsed). Stopping.`);
                        break;
                    }
                } catch (err) {
                    console.error(`--- ERROR POST (Step 2): Failed for gap "${gap.skill}":`, err);
                }
            }

            console.log(`--- DEBUG POST (Step 2): Resource finding complete. Generated ${allGeneratedSuggestions.length} suggestions with search keywords.`);
        } else {
             console.log(`--- DEBUG POST (Step 2): No gaps identified in Step 1. Skipping resource finding.`);
        }

        // --- 7. Uppdatera räknaren för gratisanvändare ---
        if (profileData.subscriptionTier === 'free') {
            currentRemainingAnalyses = await incrementFreeUserCount(supabase, userId, resetInfo.count);
        } else {
            currentRemainingAnalyses = Infinity;
        }

        // --- 8. Kombinera Resultat ---
        // Skapa det slutliga objektet som ska returneras till klienten
        const finalResultData = {
            ...(initialAnalysisResult ?? { // Fallback om Steg 1 misslyckades oväntat
                analysisType: 'competence' as const,
                targetDescription: errorTargetDesc,
                matchScore: null,
                cvSummaryForTarget: 'Analysen kunde inte slutföras (Steg 1 misslyckades).',
                identifiedRelevantSkills: [],
                identifiedSkillGaps: [],
                model: 'unknown', tokens: null, cost: null
            }),
            suggestedLearningPath: allGeneratedSuggestions, // Lägg till listan med förslag (nu med söktermer)
            remainingAnalyses: currentRemainingAnalyses,
            nextResetDate: nextResetDate.toISOString(),
            limitReached: profileData.subscriptionTier === 'free' && currentRemainingAnalyses <= 0,
        };
        console.log(`--- DEBUG POST: Final result prepared with ${finalResultData.suggestedLearningPath.length} learning suggestions.`);

        // --- 9. Logga Lyckad Aktivitet ---
        await logUserActivity(userId, 'competence_analysis_completed',
            `Kompetensanalys slutförd mot ${finalResultData.targetDescription}. Match: ${finalResultData.matchScore ?? 'N/A'}%. Genererade förslag: ${finalResultData.suggestedLearningPath.length}`,
            {
                 cvId: analysisInputForStep1.cvId,
                 mode: analysisInputForStep1.mode,
                 target: analysisInputForStep1.mode === 'role' ? { role: analysisInputForStep1.targetRole } : { adLength: analysisInputForStep1.jobAdText?.length ?? 0 },
                 matchScore: finalResultData.matchScore,
                 model_step1: finalResultData.model,
                 model_step2: modelToUseStep2,
                 cost_step1: finalResultData.cost,
                 suggestions_count: finalResultData.suggestedLearningPath.length,
                 tokens_total_step1: finalResultData.tokens?.total ?? 0,
                 remaining_analyses: currentRemainingAnalyses
            }
        );
        console.log(`--- DEBUG POST: Success activity logged for user ${userId}.`);

        // --- 10. Returnera Svar ---
        return NextResponse.json(finalResultData, { status: 200 });

    } catch (error: any) {
        // --- Global Felhantering ---
        console.error(`--- ERROR POST: API FAILED --- User: ${userId ?? 'unknown'} --- Target: ${errorTargetDesc} --- Status: ${error.statusCode || statusCode || 500} --- Error: ${error.message}`);
        console.error("Error Stack:", error.stack || 'No stack available');

        const effectiveStatusCode = error.statusCode || statusCode || 500;
        let message = 'Ett internt serverfel inträffade vid kompetensanalysen.';
        // Anpassa meddelanden baserat på statuskoden vi satte tidigare
        if (effectiveStatusCode === 400) message = error.message; // Använd det specifika felet från valideringen
        else if (effectiveStatusCode === 401) message = error.message; // "Autentisering krävs."
        else if (effectiveStatusCode === 404) message = error.message; // "Kunde inte hitta angivet CV..."

        // Logga misslyckad aktivitet om möjligt
        if (userId) {
             try {
                await logUserActivity(userId, 'competence_analysis_failed',
                    `Misslyckad analys (${errorTargetDesc}): ${error.message}`,
                    {
                        cvId: requestBody?.cvId,
                        mode: requestBody?.analysisMode,
                        error: error.message,
                        statusCode: effectiveStatusCode
                    }
                );
                 console.log(`--- DEBUG POST: Failure activity logged for user ${userId}.`);
             } catch (logError: any) {
                 // Logga om loggningen misslyckas, men krascha inte API:et för det
                 console.error(`--- ERROR POST: Failed to log failure activity for user ${userId}:`, logError.message);
             }
        } else {
            console.error(`--- WARN POST: Could not log failure activity because userId was missing.`);
        }

        // Returnera ett JSON-felmeddelande till klienten
        return NextResponse.json({ message: message }, { status: effectiveStatusCode });
    }
}