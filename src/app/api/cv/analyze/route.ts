// /src/app/api/cv/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { createBackgroundJob } from '@/lib/cv/background-jobs';

// Vercel maxDuration configuration
export const maxDuration = 60; // 60 seconds (Vercel free tier limit)

// ============================================================================
//  Constants & Configuration
// ============================================================================

const WEEKLY_ANALYSIS_LIMIT_FREE = 1; // 1 analys per vecka för gratisanvändare (matchar frontend use-profile.ts)

// ============================================================================
//  Helper Functions
// ============================================================================

// BORTTAGEN - Använder inte längre fast måndag-återställning
// Ny dynamisk modell: Exakt 7 dagar från första användning

/**
 * Extracts general improvements from analysis result
 * General improvements are those that apply to the whole CV, not specific roles
 */
function extractGeneralImprovementsFromAnalysis(analysisResult: any): any[] {
    const generalImprovements: any[] = [];

    // Extract from detailed improvements if available
    const detailedImprovements = analysisResult.detailedImprovements || [];

    detailedImprovements.forEach((improvement: any) => {
        const area = (improvement.area || '').toLowerCase();
        const suggestion = (improvement.suggestion || '').toLowerCase();

        // Check if this is a general improvement (not role-specific)
        const isGeneral =
            area.includes('profilsammanfattning') ||
            area.includes('profil') ||
            area.includes('färdighet') ||
            area.includes('certifiering') ||
            area.includes('språk') ||
            area.includes('utbildning') ||
            area.includes('saknade nyckelord') ||
            suggestion.includes('lägg till färdighet') ||
            suggestion.includes('certifiering') ||
            suggestion.includes('språkkunskap');

        if (isGeneral) {
            let category: 'skills' | 'certifications' | 'languages' | 'profile' = 'skills';

            if (area.includes('profilsammanfattning') || area.includes('profil')) {
                category = 'profile' as any;
            } else if (area.includes('certifiering')) {
                category = 'certifications';
            } else if (area.includes('språk')) {
                category = 'languages';
            }

            generalImprovements.push({
                id: `general-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: improvement.area || 'Allmän förbättring',
                description: improvement.suggestion || improvement.example || 'Förbättring identifierad',
                category,
                selected: false,
                impact: 'high' as const,
                example: improvement.example
            });
        }
    });

    return generalImprovements;
}

/**
 * Fetches user profile data relevant for analysis limits.
 * @param supabase - Initialized Supabase server client.
 * @param userId - The ID of the user.
 * @returns Profile data or throws an error.
 */
async function getUserProfileData(supabase: SupabaseClient<Database>, userId: string) {
     const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, weekly_analysis_count, weekly_analysis_first_used_at, weekly_analysis_reset_at')
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
        firstUsedAt: (profileData as any).weekly_analysis_first_used_at ? new Date((profileData as any).weekly_analysis_first_used_at) : null,
        resetAt: (profileData as any).weekly_analysis_reset_at ? new Date((profileData as any).weekly_analysis_reset_at) : null
    };
}

/**
 * Manages dynamic 7-day quota cycle for CV analysis.
 * Initializes on first use or resets after 7 days.
 * @param supabase - Initialized Supabase server client.
 * @param userId - The ID of the user.
 * @param currentCount - Current analysis count.
 * @param firstUsedAt - When quota was first used (or null).
 * @param resetAt - When quota resets (or null).
 * @returns Object containing the count and reset date.
 */
async function checkAndResetAnalysisCount(
    supabase: SupabaseClient<Database>,
    userId: string,
    currentCount: number,
    firstUsedAt: Date | null,
    resetAt: Date | null
): Promise<{ count: number; resetAt: Date }> {
    const now = new Date();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    let count = currentCount;
    let newFirstUsedAt = firstUsedAt;
    let newResetAt = resetAt;
    let shouldUpdate = false;

    // Initialize on first use
    if (!firstUsedAt || !resetAt) {
        newFirstUsedAt = now;
        newResetAt = new Date(now.getTime() + SEVEN_DAYS_MS);
        count = 0;
        shouldUpdate = true;
        console.log(`API analyzeCv: User ${userId}: Initiating quota. Resets at ${newResetAt.toISOString()}`);
    }
    // Reset if 7 days have passed
    else if (now.getTime() >= resetAt.getTime()) {
        newFirstUsedAt = now;
        newResetAt = new Date(now.getTime() + SEVEN_DAYS_MS);
        count = 0;
        shouldUpdate = true;
        console.log(`API analyzeCv: User ${userId}: Resetting quota. New reset at ${newResetAt.toISOString()}`);
    }

    if (shouldUpdate && newFirstUsedAt && newResetAt) {
        const { error: resetError } = await (supabase as any)
            .from('profiles')
            .update({
                weekly_analysis_count: count,
                weekly_analysis_first_used_at: newFirstUsedAt.toISOString(),
                weekly_analysis_reset_at: newResetAt.toISOString()
            })
            .eq('id', userId);

        if (resetError) {
            console.error(`API analyzeCv: User ${userId}: Failed to update quota:`, resetError);
        }
    }

    return { count, resetAt: newResetAt || resetAt || new Date() };
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
        .select('cv_text, text_extraction_failed')
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

    // Check if text extraction failed
    if ((cvData as any).text_extraction_failed === true) {
        const error = new Error('CV-texten kunde inte extraheras från din PDF. Vänligen ladda upp filen igen eller kontrollera att PDF:en innehåller textbaserat innehåll (inte bara bilder).');
        (error as any).statusCode = 400;
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
    const cookieStore = await cookies();
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
        const resetInfo = await checkAndResetAnalysisCount(
            supabase,
            userId,
            profileData.currentAnalysisCount,
            profileData.firstUsedAt,
            profileData.resetAt
        );

        const currentRemainingAnalyses = WEEKLY_ANALYSIS_LIMIT_FREE - resetInfo.count;
        const nextResetDate = resetInfo.resetAt;

        if (profileData.subscriptionTier === 'free' && resetInfo.count >= WEEKLY_ANALYSIS_LIMIT_FREE) {
            console.log(`API analyzeCv: User ${userId} (Free): Limit reached (${resetInfo.count}/${WEEKLY_ANALYSIS_LIMIT_FREE}).`);
            return NextResponse.json({
                message: `Du har nått din veckogräns på ${WEEKLY_ANALYSIS_LIMIT_FREE} CV-analys per vecka.`,
                remainingAnalyses: 0,
                limitReached: true,
                nextResetDate: nextResetDate.toISOString(),
                currentCount: resetInfo.count,
                limit: WEEKLY_ANALYSIS_LIMIT_FREE
            }, { status: 429 });
        }

        // --- 4. Fetch CV Text ---
        const cvText = await getCvText(supabase, userId, cvId);

        // --- 5. Create Background Job for AI Analysis (100% Async) ---
        console.log(`API analyzeCv: User ${userId} (${profileData.subscriptionTier}): Creating background job for CV ${cvId}...`);

        const { jobId, error: jobError } = await createBackgroundJob(userId, cvId);

        if (jobError || !jobId) {
            console.error('Failed to create background job:', jobError);
            return NextResponse.json(
                { message: 'Kunde inte starta CV-analys. Försök igen.' },
                { status: 500 }
            );
        }

        console.log(`✅ Background job created: ${jobId}`);

        // --- 6. Increment Analysis Count for Free Users ---
        if (profileData.subscriptionTier === 'free') {
            const newCount = resetInfo.count + 1;
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ weekly_analysis_count: newCount })
                .eq('id', userId);

            if (updateError) {
                console.error(`Failed to increment analysis count for user ${userId}:`, updateError);
            } else {
                console.log(`Incremented analysis count for user ${userId}: ${newCount}/${WEEKLY_ANALYSIS_LIMIT_FREE}`);
            }
        }

        // Track onboarding progress for CV analysis
        const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
            user_id: userId,
            step_name: 'analyze_cv'
        });
        if (onboardingError) {
            console.error('Failed to update onboarding progress:', onboardingError.message);
        }

        // Return 202 Accepted immediately with job info
        return NextResponse.json(
            {
                message: 'CV-analysen har startats och körs i bakgrunden.',
                jobId,
                status: 'processing',
                isBackgroundJob: true,
                estimatedTime: '30-60 sekunder',
                remainingAnalyses: profileData.subscriptionTier === 'free' ? (currentRemainingAnalyses - 1) : null,
                nextResetDate: nextResetDate.toISOString(),
                currentCount: profileData.subscriptionTier === 'free' ? (resetInfo.count + 1) : null,
                limit: profileData.subscriptionTier === 'free' ? WEEKLY_ANALYSIS_LIMIT_FREE : null
            },
            { status: 202 } // Accepted
        );

    } catch (error: any) {
        // --- Global Error Handling ---
        console.error(`API analyzeCv: Unhandled error for user ${userId ?? 'unknown'}:`, error);
        const statusCode = error.statusCode || 500;
        const message = statusCode === 404 ? error.message : error.message || 'Ett internt serverfel inträffade.';
        return NextResponse.json({ message: message }, { status: statusCode });
    }
}