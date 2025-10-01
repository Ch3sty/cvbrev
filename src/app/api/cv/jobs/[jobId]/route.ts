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
  { params }: { params: { jobId: string } }
) {
  const cookieStore = cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  try {
    // Autentisering
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'Autentisering krävs.' }, { status: 401 });
    }

    const { jobId } = params;
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
