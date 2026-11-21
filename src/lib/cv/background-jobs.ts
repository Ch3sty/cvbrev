import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/*
 * Analysjobben läses och skrivs bara av servern (2026-11-21).
 *
 * cv_analysis_jobs.result bär hela analysen med alla förslagstexter, och
 * gratisnivån får bara en filtrerad del (analysForKlient). Därför går
 * kolumnen inte att läsa med användarens JWT, och användaren får inte skriva
 * i tabellen alls (migreringen 20261121120000_cv_analysis_jobs_serverlas.sql).
 * Allt här går med service role, alltid efter att anroparen verifierat
 * användaren och alltid med user_id i villkoret.
 */

export interface BackgroundJob {
  id: string;
  user_id: string;
  cv_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  usage_counted?: boolean | null;
  completion_handled?: boolean;
}

/**
 * Skapar ett background job för CV-analys. Anroparen (/api/cv/analyze) har
 * verifierat användaren, kontrollerat kvoten och att CV:t är hennes.
 */
export async function createBackgroundJob(
  userId: string,
  cvId: string
): Promise<{ jobId: string; error?: string }> {
  try {
    // cv_analysis_jobs saknas i de genererade typerna (som på övriga ställen
    // där admin-klienten skriver i tabellen).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = getSupabaseAdmin() as any;

    // Skapa job i databasen
    // NOTE: usage_counted sätts till true direkt eftersom vi räknar usage i /api/cv/analyze
    // Detta förhindrar dubbelräkning i /api/cv/jobs/[jobId]
    const { data: job, error: insertError } = await admin
      .from('cv_analysis_jobs')
      .insert({
        user_id: userId,
        cv_id: cvId,
        status: 'pending',
        usage_counted: true,
      })
      .select('id')
      .single();

    if (insertError || !job) {
      console.error('Failed to create background job:', insertError);
      return { jobId: '', error: insertError?.message || 'Failed to create job' };
    }

    // Trigga Edge Function för att starta analysen (ASYNC - fire and forget)
    console.log(`Triggering Edge Function for job ${job.id}...`);

    // Fire-and-forget: Starta Edge Function utan att vänta.
    // Anropet går med servicenyckeln som bärare: funktionen godtar bara
    // anrop från servern, aldrig en användares JWT.
    admin.functions.invoke(
      'analyze-cv-background',
      {
        body: {
          jobId: job.id,
          cvId,  // Edge Function v20 förväntar sig cvId istället för cvText
        },
      }
    ).then(({ error: invokeError }: { error: { message: string } | null }) => {
      if (invokeError) {
        console.error(`❌ Edge Function invoke error (job ${job.id}):`, invokeError);

        // Markera jobbet som failed asynkront
        admin
          .from('cv_analysis_jobs')
          .update({
            status: 'failed',
            error: `Edge Function invoke failed: ${invokeError.message}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id)
          .eq('user_id', userId)
          .then(() => console.log(`Job ${job.id} marked as failed`));
      } else {
        console.log(`✅ Edge Function triggered successfully for job ${job.id}`);
      }
    }).catch((error: unknown) => {
      console.error(`❌ Critical error invoking Edge Function (job ${job.id}):`, error);

      // Markera jobbet som failed asynkront
      admin
        .from('cv_analysis_jobs')
        .update({
          status: 'failed',
          error: `Critical invoke error: ${error instanceof Error ? error.message : 'Unknown'}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)
        .eq('user_id', userId)
        .then(() => console.log(`Job ${job.id} marked as failed (critical error)`));
    });

    // Returnera direkt (väntar INTE på Edge Function)
    console.log(`Background job ${job.id} created - Edge Function running asynchronously`);
    return { jobId: job.id };
  } catch (error) {
    console.error('Error creating background job:', error);
    return { jobId: '', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Hämtar ett background job, bara om det tillhör userId. Raden innehåller
 * result ofiltrerat: anroparen filtrerar för gratisnivån innan något lämnar
 * servern.
 */
export async function getJobStatus(jobId: string, userId: string): Promise<BackgroundJob | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: job, error } = await (getSupabaseAdmin() as any)
      .from('cv_analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !job) {
      if (error) console.error('Failed to fetch job status:', error);
      return null;
    }

    return job as unknown as BackgroundJob;
  } catch (error) {
    console.error('Error fetching job status:', error);
    return null;
  }
}
