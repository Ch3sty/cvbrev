import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
}

/**
 * Skapar ett background job för CV-analys
 */
export async function createBackgroundJob(
  userId: string,
  cvId: string
): Promise<{ jobId: string; error?: string }> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Skapa job i databasen
    const { data: job, error: insertError } = await supabase
      .from('cv_analysis_jobs')
      .insert({
        user_id: userId,
        cv_id: cvId,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError || !job) {
      console.error('Failed to create background job:', insertError);
      return { jobId: '', error: insertError?.message || 'Failed to create job' };
    }

    // Trigga Edge Function för att starta analysen (ASYNC - fire and forget)
    console.log(`Triggering Edge Function for job ${job.id}...`);

    // Fire-and-forget: Starta Edge Function utan att vänta
    // Edge Function uppdaterar själv job status när den är klar
    supabase.functions.invoke(
      'analyze-cv-background',
      {
        body: {
          jobId: job.id,
          cvId,  // Edge Function v20 förväntar sig cvId istället för cvText
        },
      }
    ).then(({ data, error: invokeError }) => {
      if (invokeError) {
        console.error(`❌ Edge Function invoke error (job ${job.id}):`, invokeError);

        // Markera jobbet som failed asynkront
        supabase
          .from('cv_analysis_jobs')
          .update({
            status: 'failed',
            error: `Edge Function invoke failed: ${invokeError.message}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id)
          .then(() => console.log(`Job ${job.id} marked as failed`));
      } else {
        console.log(`✅ Edge Function triggered successfully for job ${job.id}`);
      }
    }).catch((error) => {
      console.error(`❌ Critical error invoking Edge Function (job ${job.id}):`, error);

      // Markera jobbet som failed asynkront
      supabase
        .from('cv_analysis_jobs')
        .update({
          status: 'failed',
          error: `Critical invoke error: ${error instanceof Error ? error.message : 'Unknown'}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)
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
 * Hämtar status för ett background job
 */
export async function getJobStatus(jobId: string): Promise<BackgroundJob | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: job, error } = await supabase
      .from('cv_analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      console.error('Failed to fetch job status:', error);
      return null;
    }

    return job as BackgroundJob;
  } catch (error) {
    console.error('Error fetching job status:', error);
    return null;
  }
}
