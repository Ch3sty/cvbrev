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

      // Onboarding: markera analyze_cv som klart NU nar jobbet faktiskt
      // ar slutfort (inte vid jobbskapande som tidigare)
      const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
        user_id: user.id,
        step_name: 'analyze_cv'
      });
      if (onboardingError) {
        console.error('Failed to update onboarding progress (analyze_cv):', onboardingError.message);
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

    // Om jobbet misslyckades, rulla tillbaka räknaren för gratisanvändare
    // Använd usage_counted som lås: sätt till false FÖRST för att undvika race conditions
    if (job.status === 'failed' && (job as any).usage_counted) {
      // Atomär uppdatering: markera rollback INNAN vi dekrementerar räknaren
      // Om två requests kommer in samtidigt, lyckas bara en med denna WHERE-klausul
      const { data: updatedJob, error: lockError } = await supabase
        .from('cv_analysis_jobs')
        .update({ usage_counted: false })
        .eq('id', jobId)
        .eq('usage_counted', true)
        .select('id')
        .single();

      if (updatedJob && !lockError) {
        // Bara denna request fick låset — säkert att dekrementera
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_tier, weekly_analysis_count')
          .eq('id', user.id)
          .single();

        if (profileData?.subscription_tier === 'free' && (profileData.weekly_analysis_count || 0) > 0) {
          const rolledBackCount = (profileData.weekly_analysis_count || 1) - 1;
          const { error: rollbackError } = await supabase
            .from('profiles')
            .update({ weekly_analysis_count: rolledBackCount })
            .eq('id', user.id);

          if (rollbackError) {
            console.error('Failed to rollback weekly_analysis_count:', rollbackError);
          } else {
            console.log(`Rolled back weekly_analysis_count to ${rolledBackCount} for user ${user.id} (job ${jobId} failed)`);
          }
        }
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
