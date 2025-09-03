// /app/api/cv/kompetensutveckling/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { analyzeCompetenceGap, CompetenceAnalysisResult, MissingSkill } from '@/lib/openai/analyzeCompetenceGap';
import { logUserActivity } from '@/lib/activity-logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { openai } from '@/lib/openai/api';

// ============================================================================
//  Constants & Configuration
// ============================================================================

// Konstant för att definiera veckobegränsning för gratisanvändare
const WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE = 2; // Endast 2 analys per vecka för gratisanvändare

// --- TYPDEFINITION MED SÖKTERMER ISTÄLLET FÖR URL ---
// Denna typ används internt i denna fil och för API-svaret.
export interface LearningSuggestion {
    type: 'course' | 'certification' | 'self-study' | 'project';
    title: string; // Så exakt som möjligt
    provider?: string; // Tydlig leverantör/plattform
    relevance: string;
    search_keywords?: string[]; // NYTT: Array med föreslagna söktermer
    language?: 'sv' | 'en' | 'other';
    // url?: string; // BORTTAGEN!
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
 * Använder OpenAI för att hitta läranderesurser och generera söktermer för ett specifikt kompetensgap.
 */
async function findLearningResourcesForGap(gap: MissingSkill, language: string = 'sv'): Promise<LearningSuggestion[]> {
    const modelToUse = "gpt-4.1";
    const maxSuggestionsPerGap = 2; // Max antal förslag per identifierat gap

    const systemPrompt = `
        Du är expert på läranderesurser för **Sverige**. Ditt mål är att ge användaren information för att **själv kunna hitta** relevanta resurser.
        Svara ALLTID med JSON: {"suggestions": [{...}, max ${maxSuggestionsPerGap} objekt]}.
        Varje objekt MÅSTE följa strukturen:
        {
            "type": "'course' | 'certification' | 'self-study' | 'project'",
            "title": "Exakt och fullständigt namn på resursen",
            "provider": "Tydligt namn på leverantör/myndighet/plattform",
            "relevance": "Kort motivering varför detta är relevant för gapet I SVERIGE.",
            "search_keywords": ["Lista med 2-3 specifika söktermer användaren kan använda på Google eller leverantörens sida för att hitta detta"],
            "language": "'sv' | 'en' | 'other'"
        }
        **VIKTIGT: Inkludera ALDRIG ett 'url'-fält.** Fokusera på att ge **korrekt 'title' och 'provider'** samt **användbara 'search_keywords'**.

        REGLER FÖR RELEVANTA FÖRSLAG I SVERIGE:
        1.  **Prioritera Svenskt:** Ge stark förtur åt svenska leverantörer/myndigheter.
        2.  **Internationellt:** Endast online-resurser relevanta i Sverige, ej landspecifika.
        3.  **Essentiella Gap:** Försök identifiera den officiella svenska vägen/organisationen i 'provider'.

        Om inga relevanta förslag hittas, returnera {"suggestions": []}. ENDAST JSON.
    `;

    const userPrompt = `
        Hitta max ${maxSuggestionsPerGap} mest relevanta läranderesurserna **för någon i Sverige** för gapet: "${gap.skill}" (Viktighet: ${gap.importance}).
        Följ systemprompten noga. Ge **exakt titel, tydlig leverantör och användbara söktermer**. **Inkludera INTE någon URL.** Prioritera svenska resurser.
    `;

    try {
        console.log(`--- DEBUG findLearningResourcesForGap: Söker resurser/söktermer för gap: ${JSON.stringify(gap.skill)} (max ${maxSuggestionsPerGap})`);
        const completion = await openai.chat.completions.create({
            model: modelToUse,
            messages: [ { role: "system", content: systemPrompt }, { role: "user", content: userPrompt } ],
            temperature: 0.5, // Lite lägre temp för precision
            max_tokens: 500,
            response_format: { type: "json_object" }
         });

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
                    // Säkerställ att url inte finns och att search_keywords är en array
                    suggestions = suggestions.map(s => ({
                        ...s,
                        url: undefined, // Explicit borttagning
                        search_keywords: Array.isArray(s.search_keywords) ? s.search_keywords : [] // Default till tom array
                    }));
                } else {
                    console.warn(`--- DEBUG findLearningResourcesForGap: Oväntad JSON-struktur (saknar 'suggestions'-array) från OpenAI för gap "${gap.skill}".`);
                }
            } else {
                 console.warn(`--- DEBUG findLearningResourcesForGap: Svaret var inte ett JSON-objekt för gap "${gap.skill}".`);
             }

            // Filtrera bort förslag som saknar nödvändiga fält
            suggestions = suggestions.filter(s => s?.type && s?.title && s?.relevance && Array.isArray(s.search_keywords));
            console.log(`--- DEBUG findLearningResourcesForGap: Antal GILTIGA förslag (med söktermer) efter filtrering för gap "${gap.skill}": ${suggestions.length}`);

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
        initialAnalysisResult = await analyzeCompetenceGap(analysisInputForStep1);
        console.log(`--- DEBUG POST (Step 1): Initial analysis successful. Score: ${initialAnalysisResult?.matchScore ?? 'N/A'}%`);

        // --- 6. Steg 2: Hitta läranderesurser/söktermer för identifierade gap ---
        let allGeneratedSuggestions: LearningSuggestion[] = [];
        const gapsToProcess = initialAnalysisResult?.identifiedSkillGaps || [];
        const modelToUseStep2 = "gpt-4.1"; // Modell för detta steg

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

            // Kör API-anropen parallellt för att hitta resurser/söktermer
            const resourcePromises = gapsToProcess.map(gap =>
                findLearningResourcesForGap(gap, 'sv').catch(err => {
                    // Logga felet men fortsätt med övriga gap
                    console.error(`--- ERROR POST (Step 2): Failed findLearningResourcesForGap for gap "${gap.skill}":`, err);
                    return []; // Returnera tom array om ett anrop misslyckas
                })
            );
            const resultsArray = await Promise.all(resourcePromises);
            allGeneratedSuggestions = resultsArray.flat().filter(suggestion => suggestion != null); // Platta ut arrayen av arrayer

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