// /src/app/api/cv/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server'; // Importerar bara funktionen
import { SupabaseClient } from '@supabase/supabase-js';   // <<<--- KORREKT IMPORT HÄR
import { analyzeCvBasic, analyzeCvPremium } from '@/lib/openai/cv-analysis';
import { Database } from '@/types/database.types';
import { parseCV, validateParsedCV } from '@/lib/cv/cv-parser';
import { generateRoleBasedImprovements } from '@/lib/cv/role-based-improvements';

// ============================================================================
//  Constants & Configuration
// ============================================================================

const WEEKLY_ANALYSIS_LIMIT_FREE = 2; // Definiera gräns för gratisanvändare

// ============================================================================
//  Helper Functions
// ============================================================================

/**
 * Calculates the next reset date (next Monday 00:00 UTC) based on the last reset timestamp.
 * Ensures the calculated reset date is always in the future relative to the current time.
 * @param lastResetTimestamp - ISO string of the last reset or null.
 * @returns Date object representing the next reset timestamp.
 */
const calculateNextResetDate = (lastResetTimestamp: string | null): Date => {
    // ... (funktionens kod oförändrad) ...
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
 * Fetches user profile data relevant for analysis limits.
 * @param supabase - Initialized Supabase server client.
 * @param userId - The ID of the user.
 * @returns Profile data or throws an error.
 */
// Använd den importerade SupabaseClient-typen här
async function getUserProfileData(supabase: SupabaseClient<Database>, userId: string) {
    // ... (funktionens kod oförändrad) ...
     const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, weekly_analysis_count, last_analysis_reset, next_reset_date')
        .eq('id', userId)
        .single();
    if (profileError) {
        const errorMessage = profileError.code === 'PGRST116' ? 'Användarprofil kunde inte hittas.' : `Databasfel vid hämtning av profil: ${profileError.message}`;
        console.error(`API analyzeCv: Error fetching profile for user ${userId}:`, profileError);
        throw new Error(errorMessage);
    }
     if (!profileData) {
        console.error(`API analyzeCv: Profile data is null for user ${userId} despite no error.`);
        throw new Error('Användarprofil saknas.');
    }
    return {
        subscriptionTier: ((profileData as any).subscription_tier === 'premium' ? 'premium' : 'free') as 'free' | 'premium',
        currentAnalysisCount: (profileData as any).weekly_analysis_count ?? 0,
        lastAnalysisResetTimestamp: (profileData as any).last_analysis_reset,
        dbNextResetDate: (profileData as any).next_reset_date ? new Date((profileData as any).next_reset_date) : null
    };
}

/**
 * Resets the weekly analysis count for a user if the reset date has passed.
 * @param supabase - Initialized Supabase server client.
 * @param userId - The ID of the user.
 * @param dbNextResetDate - The next reset date stored in the database (or null).
 * @param lastAnalysisResetTimestamp - The timestamp of the last reset.
 * @returns Object containing the reset count, new last reset timestamp, and new next reset date.
 */
// Använd den importerade SupabaseClient-typen här
async function checkAndResetAnalysisCount(
    supabase: SupabaseClient<Database>,
    userId: string,
    currentCount: number,
    dbNextResetDate: Date | null,
    lastAnalysisResetTimestamp: string | null
): Promise<{ count: number; lastReset: string; nextReset: Date }> {
    // ... (funktionens kod oförändrad) ...
     const now = new Date();
    let nextResetDate = (dbNextResetDate && dbNextResetDate > now) ? dbNextResetDate : calculateNextResetDate(lastAnalysisResetTimestamp);
    let count = currentCount;
    let lastReset = lastAnalysisResetTimestamp ?? now.toISOString();
    if (now.getTime() >= nextResetDate.getTime()) {
        console.log(`API analyzeCv: User ${userId}: Resetting analysis count.`);
        count = 0;
        lastReset = now.toISOString();
        nextResetDate = calculateNextResetDate(lastReset);
        const { error: resetError } = await (supabase as any)
            .from('profiles')
            .update({ 
                weekly_analysis_count: 0, 
                last_analysis_reset: lastReset, 
                next_reset_date: nextResetDate.toISOString() 
            })
            .eq('id', userId);
        if (resetError) { console.error(`API analyzeCv: User ${userId}: Failed to update DB on count reset:`, resetError); }
        else { console.log(`API analyzeCv: User ${userId}: Database updated with reset count and new reset date.`); }
    }
    return { count, lastReset, nextReset: nextResetDate };
}


/**
 * Fetches the CV text for a given user and CV ID.
 * @param supabase - Initialized Supabase server client.
 * @param userId - The ID of the user.
 * @param cvId - The ID of the CV.
 * @returns The CV text or throws an error.
 */
// Använd den importerade SupabaseClient-typen här
async function getCvText(supabase: SupabaseClient<Database>, userId: string, cvId: string): Promise<string> {
    // ... (funktionens kod oförändrad) ...
    const { data: cvData, error: dbError } = await supabase
        .from('cv_texts')
        .select('cv_text')
        .eq('id', cvId)
        .eq('user_id', userId)
        .single();
    if (dbError || !(cvData as any)?.cv_text) {
        const isNotFoundError = dbError?.code === 'PGRST116';
        const errorMessage = isNotFoundError ? 'Kunde inte hitta angivet CV eller så tillhör det inte dig.' : `Databasfel vid hämtning av CV: ${dbError?.message || 'Okänt DB-fel'}`;
        console.error(`API analyzeCv: Error fetching CV text (CV ID: ${cvId}, User ID: ${userId}):`, dbError);
        const error = new Error(errorMessage);
        (error as any).statusCode = isNotFoundError ? 404 : 500;
        throw error;
    }
    return (cvData as any).cv_text;
}

/**
 * Updates the analysis count for a free user after a successful analysis.
 * @param supabase - Initialized Supabase server client.
 * @param userId - The ID of the user.
 * @param currentCount - The count *before* this analysis.
 * @returns The remaining analysis count after decrementing.
 */
// Använd den importerade SupabaseClient-typen här
async function decrementFreeUserCount(supabase: SupabaseClient<Database>, userId: string, currentCount: number): Promise<number> {
     // ... (funktionens kod oförändrad) ...
      const newCount = currentCount + 1;
    const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ weekly_analysis_count: newCount })
        .eq('id', userId);
    if (updateError) { console.error(`API analyzeCv: User ${userId}: Failed to update analysis count after successful analysis:`, updateError); }
    return Math.max(0, WEEKLY_ANALYSIS_LIMIT_FREE - newCount);
}


// ============================================================================
//  API Route Handler (POST)
// ============================================================================
export async function POST(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    let userId: string | undefined;

    try {
        // --- 1. Authentication ---
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('API analyzeCv: Authentication failed.', authError);
            return NextResponse.json({ message: 'Autentisering krävs.' }, { status: 401 });
        }
        userId = user.id;

        // --- 2. Request Body Parsing ---
        let cvId: string;
        try {
            const body = await request.json();
            cvId = body.cvId;
            if (!cvId || typeof cvId !== 'string') { throw new Error('cvId saknas eller är ogiltigt i request body.'); }
        } catch (error) {
            console.error('API analyzeCv: Failed to parse request body:', error);
            return NextResponse.json({ message: 'Ogiltig förfrågan.' }, { status: 400 });
        }

        // --- 3. Fetch Profile & Handle Limits/Resets ---
        const profileData = await getUserProfileData(supabase, userId);
        const resetInfo = await checkAndResetAnalysisCount( supabase, userId, profileData.currentAnalysisCount, profileData.dbNextResetDate, profileData.lastAnalysisResetTimestamp );
        let currentRemainingAnalyses = WEEKLY_ANALYSIS_LIMIT_FREE - resetInfo.count;
        const nextResetDate = resetInfo.nextReset;
        if (profileData.subscriptionTier === 'free' && resetInfo.count >= WEEKLY_ANALYSIS_LIMIT_FREE) {
            console.log(`API analyzeCv: User ${userId} (Free): Limit reached after reset check.`);
            return NextResponse.json( { message: `Du har nått din veckogräns på ${WEEKLY_ANALYSIS_LIMIT_FREE} CV-analyser.`, remainingAnalyses: 0, limitReached: true, nextResetDate: nextResetDate.toISOString() }, { status: 429 } );
        }

        // --- 4. Fetch CV Text ---
        const cvText = await getCvText(supabase, userId, cvId);

        // --- 5. Perform AI Analysis with Role-Based Parsing ---
        console.log(`API analyzeCv: User ${userId} (${profileData.subscriptionTier}): Performing analysis for CV ${cvId}...`);

        // OPTIMERING: Kör parseCV och analyzeCv parallellt för att spara tid
        console.log('🚀 Starting parallel analysis (parseCV + analyzeCv)...');
        const startTime = Date.now();

        // Timeout-hantering: Sätt en timeout på 50 sekunder (ger 10s marginal innan Vercel's 60s limit)
        const analysisTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Analysis timeout: Processing took too long (>50s)'));
            }, 50000); // 50 sekunder
        });

        let parsedCV, analysisResult;
        try {
            // Kör analys med timeout
            [parsedCV, analysisResult] = await Promise.race([
                Promise.all([
                    parseCV(cvText),
                    profileData.subscriptionTier === 'premium'
                        ? analyzeCvPremium(cvText)
                        : analyzeCvBasic(cvText)
                ]),
                analysisTimeout
            ]);

            console.log(`⏱️ Parallel analysis completed in ${Date.now() - startTime}ms`);
        } catch (timeoutError) {
            console.error(`⚠️ Analysis timeout after ${Date.now() - startTime}ms`);
            // Returnera delresultat om timeout
            return NextResponse.json(
                {
                    message: 'Analysen tog för lång tid. Försök igen eller kontakta support om problemet kvarstår.',
                    partial: true,
                    error: 'timeout'
                },
                { status: 408 } // Request Timeout
            );
        }

        const isValid = validateParsedCV(parsedCV);
        if (!isValid) {
            console.warn('⚠️ CV parsing validation failed, using fallback analysis');
        }

        // Generate role-based improvements if parsing was successful
        if (isValid && parsedCV.roles.length > 0) {
            console.log(`🎯 Generating role-based improvements for ${parsedCV.roles.length} roles (parallel)...`);
            const roleStartTime = Date.now();

            // OPTIMERING: Kör alla rollförbättringar parallellt istället för sekventiellt
            const roleImprovementPromises = parsedCV.roles.slice(0, 3).map(async (role, index) => {
                console.log(`  → Starting improvements for role ${index + 1}: ${role.title}`);
                const improvements = await generateRoleBasedImprovements(role, {
                    maxSuggestions: 3,
                    focusAreas: ['quantification', 'keywords']
                });
                console.log(`  ✓ Completed improvements for role ${index + 1}: ${role.title}`);
                return improvements;
            });

            // Timeout för rollförbättringar (10 sekunder max)
            const roleTimeout = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Role improvements timeout')), 10000);
            });

            let roleBasedImprovements: any[] = [];
            try {
                // Vänta på alla rollförbättringar samtidigt med timeout
                const roleImprovementResults = await Promise.race([
                    Promise.all(roleImprovementPromises),
                    roleTimeout
                ]);
                roleBasedImprovements = roleImprovementResults.flat();
                console.log(`⏱️ Role improvements completed in ${Date.now() - roleStartTime}ms`);
            } catch (roleTimeoutError) {
                console.warn(`⚠️ Role improvements timeout after ${Date.now() - roleStartTime}ms, continuing without them`);
                // Fortsätt utan rollförbättringar om timeout
                roleBasedImprovements = [];
            }

            // Format role-based improvements for frontend
            const { formatRoleImprovementsForFrontend } = await import('@/lib/cv/role-based-improvements');
            const formattedRoleImprovements = formatRoleImprovementsForFrontend(roleBasedImprovements);

            // Enhance analysis result with formatted role-based improvements
            (analysisResult as any).roleBasedImprovements = formattedRoleImprovements;
            (analysisResult as any).parsedRoles = parsedCV.roles.map(r => ({
                title: r.title,
                company: r.company,
                period: r.period
            }));

            console.log(`✅ Generated ${formattedRoleImprovements.length} role-based improvements (from ${roleBasedImprovements.length} raw improvements)`);
        }

        console.log(`API analyzeCv: User ${userId}: Analysis successful.`);

        // Logga AI-kostnad till usage_log för ekonomisk spårning
        if (analysisResult.cost && analysisResult.model) {
            const { error: usageLogError } = await supabase.from('usage_log').insert({
                user_id: userId,
                feature_type: 'cv_analysis',
                model: analysisResult.model,
                tokens: analysisResult.tokens?.total || 0,
                cost: analysisResult.cost,
                related_id: cvId,  // Use related_id for the CV ID
                metadata: {
                    cv_id: cvId,
                    analysis_type: profileData.subscriptionTier,
                    cost_sek: analysisResult.cost * 10.5,
                    prompt_tokens: analysisResult.tokens?.prompt,
                    completion_tokens: analysisResult.tokens?.completion
                }
            });

            if (usageLogError) {
                console.error('Failed to insert into usage_log:', usageLogError);
            } else {
                console.log(`API analyzeCv: Logged AI cost to usage_log: $${analysisResult.cost} for user ${userId}`);
            }
        }

        // --- 6. Update Count for Free Users (Post-Analysis) ---
        if (profileData.subscriptionTier === 'free') {
            currentRemainingAnalyses = await decrementFreeUserCount(supabase, userId, resetInfo.count);
        } else {
             currentRemainingAnalyses = Infinity;
        }

        // Award XP for CV analysis
        try {
            const xpResponse = await fetch(`${request.headers.get('origin')}/api/gamification/award-xp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify({
                    amount: 40,
                    source: 'cv_analyzed',
                    sourceId: cvId,
                    description: 'Genomförde CV-analys'
                })
            });

            if (!xpResponse.ok) {
                console.error('Failed to award XP for CV analysis');
            }
        } catch (xpError) {
            console.error('Error awarding XP:', xpError);
        }

        // --- 7. Construct and Return Success Response ---
        return NextResponse.json( { ...analysisResult, remainingAnalyses: currentRemainingAnalyses, nextResetDate: nextResetDate.toISOString(), limitReached: profileData.subscriptionTier === 'free' && currentRemainingAnalyses <= 0, }, { status: 200 } );

    } catch (error: any) {
        // --- Global Error Handling ---
        console.error(`API analyzeCv: Unhandled error for user ${userId ?? 'unknown'}:`, error);
        const statusCode = error.statusCode || 500;
        const message = statusCode === 404 ? error.message : error.message || 'Ett internt serverfel inträffade.';
        return NextResponse.json({ message: message }, { status: statusCode });
    }
}