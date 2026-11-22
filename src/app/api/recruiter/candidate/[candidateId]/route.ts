// GET /api/recruiter/candidate/[candidateId]
// candidateId är kandidatens id mot rekryterare (public_id), aldrig kontots
// id. När kolumnen finns ger kontots id 404, aldrig en omdirigering.
// Detaljprofilen för en kandidat i poolen. 404 om profilen inte är synlig.
//
// Svaret formas av vitlistan i src/lib/recruiter/recruiterView.ts: före
// kandidatens ja ingen fritext ur CV:t, inga arbetsgivare, lärosäten, namn
// eller e-post. Efter ja, eller vid öppen profil, det samtycket säger.
// E-post kräver alltid accepterat intresse. Lönespannet lämnar aldrig servern.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import { findVisibleProfile, recruiterDetailFor } from '@/lib/recruiter/candidateAccess';
import { logProfileView } from '@/lib/recruiter/profileViews';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const { candidateId } = await params;
    const admin = getSupabaseAdmin();

    const row = candidateId ? await findVisibleProfile(admin, candidateId) : null;
    if (!row) {
      // Dold eller obefintlig profil ska inte gå att skilja åt.
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { detail, interestStatus } = await recruiterDetailFor(admin, row, user.id);

    // Profilen har bevisligen lämnats ut till en godkänd rekryterare: logga
    // visningen så kandidaten kan se att profilen faktiskt ses. Avdubblas per
    // dygn och rekryterare inne i logProfileView. Awaitas inte, eftersom en
    // tappad loggrad är ett mindre fel än en långsammare eller trasig
    // profilhämtning.
    void logProfileView(admin, row.user_id, user.id);

    return NextResponse.json({ candidate: detail, interestStatus });
  } catch (error) {
    console.error('Recruiter candidate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
