// src/hooks/use-competence-job.ts
import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface CompetenceJob {
  id: string;
  status: 'pending' | 'analyzing' | 'processing_gaps' | 'completed' | 'failed';
  progress: number;
  current_step?: string;
  match_score?: number;
  cv_summary?: string;
  identified_skills?: any;
  skill_gaps?: any;
  learning_suggestions?: any;
  error_message?: string;
  total_gaps?: number;
  processed_gaps?: number;
}

interface UseCompetenceJobResult {
  job: CompetenceJob | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCompetenceJob(jobId: string | null): UseCompetenceJobResult {
  const [job, setJob] = useState<CompetenceJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('competence_analysis_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setJob(data as CompetenceJob);
    } catch (err: any) {
      console.error('Error fetching job:', err);
      setError(err.message || 'Failed to fetch job');
    } finally {
      setLoading(false);
    }
  }, [jobId, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Set up real-time subscription
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`job_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'competence_analysis_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          console.log('Job updated:', payload.new);
          setJob(payload.new as CompetenceJob);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, supabase]);

  // Polling fallback if WebSocket doesn't work
  useEffect(() => {
    if (!jobId || !job) return;

    // Only poll if job is not completed or failed
    if (job.status === 'completed' || job.status === 'failed') return;

    const interval = setInterval(() => {
      fetchJob();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId, job, fetchJob]);

  return {
    job,
    loading,
    error,
    refetch: fetchJob
  };
}