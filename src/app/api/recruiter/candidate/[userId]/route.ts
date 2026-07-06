// GET /api/recruiter/candidate/[userId]
// Detaljprofilen för en kandidat i poolen. 404 om profilen inte är synlig.
//
// MASKERINGSREGEL (implementeras i buildCandidateDetail):
//   contactUnlocked = intresse med status 'accepted' ELLER visibility 'open'
//     → låser upp namn + arbetsgivarnamn i historiken.
//   email låses ENBART upp vid accepterat intresse, aldrig av öppen profil.
//   salary_min/salary_max lämnar aldrig servern.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import {
  buildCandidateDetail,
  type CandidateProfileRow,
} from '@/lib/recruiter/candidateData';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const admin = getSupabaseAdmin();

    const { data: profileRow, error } = await (admin as any)
      .from('candidate_profiles')
      .select(
        'user_id, cv_id, visibility, show_personality, availability, workplace, extent, employment_types, regions, drivers_license'
      )
      .eq('user_id', userId)
      .neq('visibility', 'off')
      .maybeSingle();

    if (error) {
      console.error('Recruiter candidate: kunde inte läsa profilen', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!profileRow) {
      // Dold eller obefintlig profil ska inte gå att skilja åt.
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Rekryterarens eget intresse för kandidaten avgör upplåsningen.
    const { data: interest } = await (admin as any)
      .from('candidate_interests')
      .select('id, status, message, created_at, responded_at')
      .eq('recruiter_user_id', user.id)
      .eq('candidate_user_id', userId)
      .maybeSingle();

    const accepted = interest?.status === 'accepted';
    const row = profileRow as CandidateProfileRow;
    const contactUnlocked = accepted || row.visibility === 'open';

    const detail = await buildCandidateDetail(admin, row, contactUnlocked, {
      emailUnlocked: accepted,
    });

    return NextResponse.json({
      candidate: detail,
      interestStatus: interest?.status ?? null,
    });
  } catch (error) {
    console.error('Recruiter candidate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
