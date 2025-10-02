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
  cvId: string,
  cvText: string
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

    // Trigga Edge Function för att starta analysen (ASYNKRONT - fire and forget)
    // Vi väntar INTE på resultatet - Edge Functionen uppdaterar job status själv
    supabase.functions.invoke(
      'analyze-cv-background',
      {
        body: {
          jobId: job.id,
          cvText,
          userId,
        },
      }
    ).catch((error) => {
      // Logga men returnera inte fel - jobbet är redan skapat och Edge Functionen
      // kommer att uppdatera status till 'failed' i databasen om något går fel
      console.error(`Edge function invocation error (job ${job.id}):`, error);
    });

    console.log(`Background job created successfully: ${job.id} - Edge Function triggered asynchronously`);
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
