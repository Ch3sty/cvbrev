import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getJobStatus } from '@/lib/cv/background-jobs';

/**
 * GET /api/cv/jobs/[jobId]
 * Hämtar status för ett background job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  try {
    // Autentisering
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'Autentisering krävs.' }, { status: 401 });
    }

    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ message: 'Job ID saknas.' }, { status: 400 });
    }

    // Hämta job status
    const job = await getJobStatus(jobId);
    if (!job) {
      return NextResponse.json({ message: 'Job hittades inte.' }, { status: 404 });
    }

    // Verifiera att jobbet tillhör användaren
    if (job.user_id !== user.id) {
      return NextResponse.json({ message: 'Åtkomst nekad.' }, { status: 403 });
    }

    // Om jobbet är completed och usage inte räknats än, uppdatera usage count
    if (job.status === 'completed' && !(job as any).usage_counted) {
      console.log(`Updating usage count for completed job ${jobId}`);

      // Hämta user profile för att kolla subscription tier
      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_tier, weekly_analysis_count')
        .eq('id', user.id)
        .single();

      // Endast uppdatera count för free tier users
      if (profileData?.subscription_tier === 'free') {
        const newCount = (profileData.weekly_analysis_count || 0) + 1;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ weekly_analysis_count: newCount })
          .eq('id', user.id);

        if (updateError) {
          console.error('Failed to update weekly_analysis_count:', updateError);
        } else {
          console.log(`Updated weekly_analysis_count to ${newCount} for user ${user.id}`);
        }
      }

      // Markera job som usage_counted
      const { error: jobUpdateError } = await supabase
        .from('cv_analysis_jobs')
        .update({ usage_counted: true })
        .eq('id', jobId);

      if (jobUpdateError) {
        console.error('Failed to mark job as usage_counted:', jobUpdateError);
      }

      // Award XP for CV analysis
      try {
        const origin = request.headers.get('origin') || 'https://jobbcoach.ai';
        const xpResponse = await fetch(`${origin}/api/gamification/award-xp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            amount: 40,
            source: 'cv_analyzed',
            sourceId: job.cv_id,
            description: 'Genomförde CV-analys'
          })
        });

        if (!xpResponse.ok) {
          console.error('Failed to award XP for CV analysis');
        }
      } catch (xpError) {
        console.error('Error awarding XP:', xpError);
      }
    }

    // Returnera status
    return NextResponse.json({
      id: job.id,
      status: job.status,
      result: job.result,
      error: job.error,
      created_at: job.created_at,
      completed_at: job.completed_at
    });

  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { message: 'Ett fel inträffade vid hämtning av jobbstatus.' },
      { status: 500 }
    );
  }
}
