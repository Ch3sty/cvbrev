// /app/api/cv/kompetensutveckling/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export const maxDuration = 10; // Quick response

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
        }

        // Get job ID from query params
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('id');

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID saknas' }, { status: 400 });
        }

        // Fetch job status from database
        const { data: job, error: jobError } = await supabase
            .from('competence_analysis_jobs')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', user.id)
            .single();

        if (jobError || !job) {
            console.error('Job not found:', jobError);
            return NextResponse.json({ error: 'Analys hittades inte' }, { status: 404 });
        }

        // Format response based on status
        const response: any = {
            jobId: job.id,
            status: job.status,
            progress: job.progress,
            currentStep: job.current_step,
            startedAt: job.started_at,
            updatedAt: job.updated_at
        };

        // Add progress details if in progress
        if (job.status === 'processing_gaps' && job.total_gaps) {
            response.totalGaps = job.total_gaps;
            response.processedGaps = job.processed_gaps;
            response.progressDetail = `Bearbetar kompetensgap ${job.processed_gaps}/${job.total_gaps}`;
        }

        // Add results if completed
        if (job.status === 'completed') {
            response.completedAt = job.completed_at;
            response.results = {
                matchScore: job.match_score,
                cvSummary: job.cv_summary,
                identifiedSkills: job.identified_skills,
                skillGaps: job.skill_gaps,
                learningSuggestions: job.learning_suggestions
            };
        }

        // Add error message if failed
        if (job.status === 'failed') {
            response.errorMessage = job.error_message || 'Analysen misslyckades av okänd anledning';
        }

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Status endpoint error:', error);
        return NextResponse.json(
            { error: 'Något gick fel', message: error.message },
            { status: 500 }
        );
    }
}