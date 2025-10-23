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

        // Trigger PARALLEL WORKERS to process the job (fire and forget)
        const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const functionUrl = `${projectUrl}/functions/v1/process-competence-analysis`;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

        const WORKERS = 4;
        const GAPS_PER_WORKER = 5;

        console.log(`--- API /start: Triggering ${WORKERS} parallel workers at ${functionUrl}`);

        // First, update job to set total_workers
        supabase
            .from('competence_analysis_jobs')
            .update({ total_workers: WORKERS })
            .eq('id', newJob.id)
            .then(() => {
                console.log(`--- API /start: Set total_workers=${WORKERS} for job ${newJob.id}`);
            });

        // Trigger all workers in parallel (fire and forget)
        const workerPromises = [];
        for (let i = 0; i < WORKERS; i++) {
            const batchStart = i * GAPS_PER_WORKER;

            const promise = fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceKey}`
                },
                body: JSON.stringify({
                    jobId: newJob.id,
                    batchStartIndex: batchStart,
                    batchSize: GAPS_PER_WORKER,
                    isParallel: true,
                    workerIndex: i
                })
            });

            workerPromises.push(promise);
        }

        // Monitor all workers (fire and forget)
        Promise.all(workerPromises).then(responses => {
            const successCount = responses.filter(r => r.ok).length;
            console.log(`--- API /start: ${successCount}/${WORKERS} workers started successfully for job ${newJob.id}`);

            if (successCount === 0) {
                // All workers failed - update job status
                supabase
                    .from('competence_analysis_jobs')
                    .update({
                        status: 'failed',
                        error_message: 'Failed to start any workers',
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', newJob.id)
                    .then(() => {
                        console.log('--- API /start: Job marked as failed - no workers started');
                    });
            }
        }).catch(err => {
            console.error('--- API /start: Failed to trigger parallel workers:', err.message);
            // Update job status asynchronously
            supabase
                .from('competence_analysis_jobs')
                .update({
                    status: 'queued',
                    current_step: 'Väntar på bearbetning...',
                    error_message: `Trigger error: ${err.message}`
                })
                .eq('id', newJob.id)
                .then(() => {
                    console.log('--- API /start: Job status updated to queued after error');
                });
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