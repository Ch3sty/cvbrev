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

const WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE = 2; // Endast 2 analys per vecka för gratisanvändare

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
async function getUserProfileData(supabase: any, userId: string) {
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
    supabase: any,
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
            lastAnalysisResetTimestamp,
            dbNextResetDate
        } = await getUserProfileData(supabase, userId);

        console.log(`--- API /start: User ${userId} subscription tier: ${subscriptionTier}, current count: ${currentAnalysisCount}`);

        // Reset counter if needed
        const { count, nextReset } = await checkAndResetAnalysisCount(
            supabase,
            userId,
            currentAnalysisCount,
            dbNextResetDate,
            lastAnalysisResetTimestamp
        );

        // Check limits for free tier
        if (subscriptionTier === 'free' && count >= WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE) {
            console.log(`--- API /start: User ${userId} has reached weekly limit (${count}/${WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE})`);

            return NextResponse.json({
                error: 'Veckogräns nådd',
                message: `Du har nått din veckogräns för kompetensanalyser (${WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE} per vecka). Uppgradera till Premium för obegränsad användning.`,
                remainingAnalyses: 0,
                nextResetDate: nextReset.toISOString(),
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
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    weekly_competence_analysis_count: count + 1,
                    next_reset_date: nextReset.toISOString()
                })
                .eq('id', userId);

            if (updateError) {
                console.error('--- API /start: Failed to update user count:', updateError);
            }
        }

        // Log activity
        await logUserActivity(userId, 'competence_analysis_started', 'Kompetensanalys startad', {
            jobId: newJob.id,
            analysisMode,
            targetRole: targetRole || null,
            subscriptionTier
        });

        // Trigger the Edge Function to process the job (fire and forget)
        const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const functionUrl = `${projectUrl}/functions/v1/process-competence-analysis`;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

        console.log(`--- API /start: Triggering edge function at ${functionUrl}`);

        // Fire and forget - don't wait for the response to avoid Vercel timeout
        fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({ jobId: newJob.id })
        }).then(response => {
            if (response.ok) {
                console.log(`--- API /start: Edge function triggered successfully for job ${newJob.id}`);
            } else {
                console.error(`--- API /start: Edge function returned ${response.status}`);
                // Update job status asynchronously
                supabase
                    .from('competence_analysis_jobs')
                    .update({
                        status: 'queued',
                        current_step: 'Väntar på bearbetning...',
                        error_message: `Edge function error: ${response.status}`
                    })
                    .eq('id', newJob.id)
                    .then(() => {
                        console.log('--- API /start: Job status updated to queued');
                    });
            }
        }).catch(err => {
            console.error('--- API /start: Failed to trigger edge function:', err.message);
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
            remainingAnalyses: subscriptionTier === 'free' ? Math.max(0, WEEKLY_COMPETENCE_ANALYSIS_LIMIT_FREE - count - 1) : null,
            nextResetDate: subscriptionTier === 'free' ? nextReset.toISOString() : null
        });

    } catch (error: any) {
        console.error('--- API /start: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Något gick fel', message: error.message || 'Ett oväntat fel inträffade' },
            { status: 500 }
        );
    }
}