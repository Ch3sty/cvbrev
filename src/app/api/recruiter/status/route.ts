// GET /api/recruiter/status
// Portalens guard-endpoint: talar om var i rekryterarflödet användaren är.
// Till skillnad från övriga rekryterar-API:er svarar den ALDRIG 403 —
// klienten behöver statusen för att visa rätt vy (registrera/väntar/avslag).

import { NextResponse } from 'next/server';
import { getRecruiterAuth } from '@/lib/recruiter/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getRecruiterAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      status: auth.recruiter?.status ?? 'none',
      companyName: auth.recruiter?.company_name ?? null,
    });
  } catch (error) {
    console.error('Recruiter status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
