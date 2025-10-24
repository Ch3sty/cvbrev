// /app/api/cv/kompetensutveckling/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { logUserActivity } from '@/lib/activity-logger';

// Set max duration for Vercel functions (in seconds)
export const maxDuration = 10; // Quick response - just creates job

// ============================================================================
//  Constants & Configuration
// ============================================================================

const WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE = 1; // Ändrat: 1 analys per vecka (dynamisk 7-dagars cykel)

// ============================================================================
//  Helper Functions
// ============================================================================

// BORTTAGEN - Använder inte längre fast måndag-återställning
// Ny dynamisk modell: Exakt 7 dagar från första användning

/**
 * Hämtar användarprofildata relevant för analysgränser.
 */
async function getUserProfileData(supabase: any, userId: string) {
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, weekly_competence_analysis_count, weekly_competence_first_used_at, weekly_competence_reset_at')
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
        firstUsedAt: (profileData as any).weekly_competence_first_used_at ? new Date((profileData as any).weekly_competence_first_used_at) : null,
        resetAt: (profileData as any).weekly_competence_reset_at ? new Date((profileData as any).weekly_competence_reset_at) : null
    };
}

/**
 * Hanterar dynamisk 7-dagars kvotcykel för kompetensutveckling.
 * Initierar vid första användning eller återställer efter 7 dagar.
 */
async function checkAndResetAnalysisCount(
    supabase: any,
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

    // Initiera vid första användning
    if (!firstUsedAt || !resetAt) {
        newFirstUsedAt = now;
        newResetAt = new Date(now.getTime() + SEVEN_DAYS_MS);
        count = 0;
        shouldUpdate = true;
        console.log(`API competenceAnalysis: User ${userId}: Initiating quota. Resets at ${newResetAt.toISOString()}`);
    }
    // Återställ om 7 dagar har passerats
    else if (now.getTime() >= resetAt.getTime()) {
        newFirstUsedAt = now;
        newResetAt = new Date(now.getTime() + SEVEN_DAYS_MS);
        count = 0;
        shouldUpdate = true;
        console.log(`API competenceAnalysis: User ${userId}: Resetting quota. New reset at ${newResetAt.toISOString()}`);
    }

    if (shouldUpdate && newFirstUsedAt && newResetAt) {
        const { error: resetError } = await (supabase as any)
            .from('profiles')
            .update({
                weekly_competence_analysis_count: count,
                weekly_competence_first_used_at: newFirstUsedAt.toISOString(),
                weekly_competence_reset_at: newResetAt.toISOString()
            })
            .eq('id', userId);

        if (resetError) {
            console.error(`API competenceAnalysis: User ${userId}: Failed to update quota:`, resetError);
        }
    }

    return { count, resetAt: newResetAt || resetAt || new Date() };
}

// ============================================================================
//  Main Handler - START endpoint
// ============================================================================

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log('--- API /kompetensutveckling/start: Request initiated');

    try {
        // Authenticate user
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.log('--- API /start: Unauthorized access attempt');
            return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
        }

        const userId = user.id;
        console.log(`--- API /start: User authenticated: ${userId}`);

        // Parse request body
        const body = await request.json();
        const { cvId, analysisMode, targetRole, jobAdText } = body;

        // Validate input
        if (!cvId) {
            return NextResponse.json({ error: 'CV ID saknas' }, { status: 400 });
        }

        if (!analysisMode || (analysisMode !== 'role' && analysisMode !== 'jobAd')) {
            return NextResponse.json({ error: 'Ogiltig analysmode' }, { status: 400 });
        }

        if (analysisMode === 'role' && !targetRole) {
            return NextResponse.json({ error: 'Målroll saknas' }, { status: 400 });
        }

        if (analysisMode === 'jobAd' && !jobAdText) {
            return NextResponse.json({ error: 'Jobbannons saknas' }, { status: 400 });
        }

        // Check user profile and limits
        const {
            subscriptionTier,
            currentAnalysisCount,
            firstUsedAt,
            resetAt
        } = await getUserProfileData(supabase, userId);

        console.log(`--- API /start: User ${userId} subscription tier: ${subscriptionTier}, current count: ${currentAnalysisCount}`);

        // Reset counter if needed
        const quotaInfo = await checkAndResetAnalysisCount(
            supabase,
            userId,
            currentAnalysisCount,
            firstUsedAt,
            resetAt
        );

        // Check limits for free tier
        if (subscriptionTier === 'free' && quotaInfo.count >= WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE) {
            console.log(`--- API /start: User ${userId} has reached weekly limit (${quotaInfo.count}/${WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE})`);

            return NextResponse.json({
                error: 'Veckogräns nådd',
                message: `Du har nått din veckogräns för kompetensanalyser (${WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE} per vecka). Uppgradera till Premium för obegränsad användning.`,
                remainingAnalyses: 0,
                nextResetDate: quotaInfo.resetAt.toISOString(),
                currentCount: quotaInfo.count,
                limit: WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE,
                limitReached: true
            }, { status: 429 });
        }

        // Verify CV ownership
        const { data: cvData, error: cvError } = await supabase
            .from('cv_texts')
            .select('cv_text')
            .eq('id', cvId)
            .eq('user_id', userId)
            .single();

        if (cvError || !cvData) {
            console.error(`--- API /start: CV not found or not owned by user: ${cvId}`);
            return NextResponse.json({ error: 'CV hittades inte' }, { status: 404 });
        }

        // Create a new job in the database
        const jobData = {
            user_id: userId,
            cv_id: cvId,
            status: 'pending',
            progress: 0,
            analysis_mode: analysisMode,
            target_role: analysisMode === 'role' ? targetRole : null,
            job_ad_text: analysisMode === 'jobAd' ? jobAdText : null,
            current_step: 'Förbereder analys...'
        };

        const { data: newJob, error: jobError } = await supabase
            .from('competence_analysis_jobs')
            .insert(jobData)
            .select()
            .single();

        if (jobError || !newJob) {
            console.error('--- API /start: Failed to create job:', jobError);
            return NextResponse.json({ error: 'Kunde inte starta analys' }, { status: 500 });
        }

        console.log(`--- API /start: Created job ${newJob.id} for user ${userId}`);

        // Update user's analysis count
        if (subscriptionTier === 'free') {
            const newCount = quotaInfo.count + 1;
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ weekly_competence_analysis_count: newCount })
                .eq('id', userId);

            if (updateError) {
                console.error('--- API /start: Failed to update user count:', updateError);
            } else {
                console.log(`--- API /start: Updated quota for user ${userId}: ${newCount}/${WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE}`);
            }
        }

        // Log activity
        await logUserActivity(userId, 'competence_analysis_started', 'Kompetensanalys startad', {
            jobId: newJob.id,
            analysisMode,
            targetRole: targetRole || null,
            subscriptionTier
        });

        // Trigger edge function to process the job (fire and forget)
        const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const functionUrl = `${projectUrl}/functions/v1/Kompetensutveckling`;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

        console.log('--- API /start: [TRIGGER] Preparing to trigger edge function...');
        console.log(`--- API /start: [TRIGGER] Project URL: ${projectUrl}`);
        console.log(`--- API /start: [TRIGGER] Function URL: ${functionUrl}`);
        console.log(`--- API /start: [TRIGGER] Service key configured: ${serviceKey ? `YES (key length: ${serviceKey.length}, starts with: ${serviceKey.substring(0, 20)}...)` : 'NO - MISSING!'}`);
        console.log(`--- API /start: [TRIGGER] Job ID to send: ${newJob.id}`);

        // Trigger the edge function with timeout and retry
        const triggerEdgeFunction = async (retryCount = 0): Promise<void> => {
            const MAX_RETRIES = 2;
            const TIMEOUT_MS = 10000; // 10 second timeout for trigger

            console.log(`--- API /start: [TRIGGER] Attempt ${retryCount + 1}/${MAX_RETRIES + 1} - Starting fetch...`);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.log(`--- API /start: [TRIGGER] Timeout reached (${TIMEOUT_MS}ms), aborting...`);
                    controller.abort();
                }, TIMEOUT_MS);

                const requestBody = JSON.stringify({ jobId: newJob.id });
                console.log(`--- API /start: [TRIGGER] Request body: ${requestBody}`);
                console.log(`--- API /start: [TRIGGER] Sending POST request to ${functionUrl}...`);

                const fetchStartTime = Date.now();
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${serviceKey}`
                    },
                    body: requestBody,
                    signal: controller.signal
                });

                const fetchDuration = Date.now() - fetchStartTime;
                clearTimeout(timeoutId);

                console.log(`--- API /start: [TRIGGER] Fetch completed in ${fetchDuration}ms`);
                console.log(`--- API /start: [TRIGGER] Response status: ${response.status} ${response.statusText}`);
                console.log(`--- API /start: [TRIGGER] Response headers:`, JSON.stringify([...response.headers.entries()]));

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`--- API /start: [TRIGGER ERROR] Edge function returned ${response.status}: ${errorText}`);

                    // Retry on 5xx errors
                    if (response.status >= 500 && retryCount < MAX_RETRIES) {
                        console.log(`--- API /start: [TRIGGER] Retrying edge function trigger (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
                        return triggerEdgeFunction(retryCount + 1);
                    }

                    throw new Error(`Edge function returned ${response.status}: ${errorText}`);
                } else {
                    const responseText = await response.text();
                    console.log(`--- API /start: [TRIGGER SUCCESS] Edge function triggered successfully!`);
                    console.log(`--- API /start: [TRIGGER SUCCESS] Response body: ${responseText.substring(0, 500)}`);
                }
            } catch (err: any) {
                console.error(`--- API /start: [TRIGGER ERROR] Catch block entered`);
                console.error(`--- API /start: [TRIGGER ERROR] Error name: ${err.name}`);
                console.error(`--- API /start: [TRIGGER ERROR] Error message: ${err.message}`);
                console.error(`--- API /start: [TRIGGER ERROR] Error stack: ${err.stack}`);

                if (err.name === 'AbortError') {
                    console.error(`--- API /start: [TRIGGER ERROR] Edge function trigger timeout after ${TIMEOUT_MS}ms`);

                    // Don't fail the job on timeout - edge function might still be running
                    if (retryCount < MAX_RETRIES) {
                        console.log(`--- API /start: [TRIGGER] Retrying after timeout (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return triggerEdgeFunction(retryCount + 1);
                    }

                    console.warn(`--- API /start: [TRIGGER WARNING] Edge function may still be running despite timeout`);
                    return; // Don't mark as failed - let edge function complete
                }

                console.error(`--- API /start: [TRIGGER ERROR] Non-timeout error: ${err.message}`);

                // Only update to failed if all retries exhausted
                if (retryCount >= MAX_RETRIES) {
                    console.log(`--- API /start: [TRIGGER ERROR] All retries exhausted, marking job as failed...`);
                    await supabase
                        .from('competence_analysis_jobs')
                        .update({
                            status: 'failed',
                            current_step: 'Kunde inte starta analys',
                            error_message: `Trigger error after ${retryCount + 1} attempts: ${err.message}`
                        })
                        .eq('id', newJob.id);

                    console.log('--- API /start: [TRIGGER ERROR] Job status updated to failed');
                } else {
                    console.log(`--- API /start: [TRIGGER ERROR] Retrying (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                    return triggerEdgeFunction(retryCount + 1);
                }
            }
        };

        // Trigger asynchronously (fire and forget with retry)
        console.log('--- API /start: [TRIGGER] Starting async trigger (fire and forget)...');
        triggerEdgeFunction().catch(err => {
            console.error('--- API /start: [TRIGGER ERROR] Unexpected error in trigger function:', err);
            console.error('--- API /start: [TRIGGER ERROR] Stack:', err.stack);
        });

        const responseTime = Date.now() - startTime;
        console.log(`--- API /start: Request completed in ${responseTime}ms`);

        // Return job ID and status URL
        return NextResponse.json({
            success: true,
            jobId: newJob.id,
            status: 'pending',
            message: 'Kompetensanalys har startats',
            statusUrl: `/api/cv/kompetensutveckling/status?id=${newJob.id}`,
            remainingAnalyses: subscriptionTier === 'free' ? Math.max(0, WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE - quotaInfo.count - 1) : null,
            nextResetDate: subscriptionTier === 'free' ? quotaInfo.resetAt.toISOString() : null,
            currentCount: subscriptionTier === 'free' ? (quotaInfo.count + 1) : null,
            limit: subscriptionTier === 'free' ? WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE : null
        });

    } catch (error: any) {
        console.error('--- API /start: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Något gick fel', message: error.message || 'Ett oväntat fel inträffade' },
            { status: 500 }
        );
    }
}