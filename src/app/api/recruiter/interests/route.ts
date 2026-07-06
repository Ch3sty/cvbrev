// GET /api/recruiter/interests
// Rekryterarens skickade intressen (alla statusar), nyast först. Driver
// inbox-vyn i portalen. Varje intresse berikas med kandidatens träffkort
// (buildCandidateCard) så roll, region och testbadges kan visas direkt.
// Kandidater som stängt av synligheten får card: null men raden behålls,
// annars försvinner historik ur rekryterarens inbox.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import {
  buildCandidateCard,
  createPercentileContext,
  type CandidateCard,
  type CandidateProfileRow,
} from '@/lib/recruiter/candidateData';

export const dynamic = 'force-dynamic';

interface InterestRow {
  id: string;
  candidate_user_id: string;
  status: string;
  message: string | null;
  created_at: string;
  responded_at: string | null;
}

export async function GET() {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const admin = getSupabaseAdmin();

    const { data: interestRows, error } = await (admin as any)
      .from('candidate_interests')
      .select('id, candidate_user_id, status, message, created_at, responded_at')
      .eq('recruiter_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Recruiter interests: kunde inte läsa intressen', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const interests = (interestRows ?? []) as InterestRow[];
    if (interests.length === 0) {
      return NextResponse.json({ interests: [] });
    }

    // Ett kort per UNIK kandidat: profilerna hämtas i en fråga och korten
    // byggs en gång var, med delad percentilkontext.
    const uniqueCandidateIds = [...new Set(interests.map((i) => i.candidate_user_id))];

    const { data: profileRows, error: profileError } = await (admin as any)
      .from('candidate_profiles')
      .select(
        'user_id, cv_id, visibility, show_personality, availability, workplace, extent, employment_types, regions, drivers_license, pitch'
      )
      .in('user_id', uniqueCandidateIds)
      .neq('visibility', 'off');

    if (profileError) {
      console.error('Recruiter interests: kunde inte läsa profiler', profileError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const profiles = (profileRows ?? []) as CandidateProfileRow[];
    const ctx = createPercentileContext(admin);
    const cardByCandidate = new Map<string, CandidateCard>();
    await Promise.all(
      profiles.map(async (row) => {
        const card = await buildCandidateCard(admin, row, ctx);
        cardByCandidate.set(row.user_id, card);
      })
    );

    const result = interests.map((i) => ({
      interestId: i.id,
      candidateUserId: i.candidate_user_id,
      status: i.status,
      createdAt: i.created_at,
      respondedAt: i.responded_at,
      message: i.message,
      // null när kandidaten stängt av synligheten sedan intresset skickades.
      card: cardByCandidate.get(i.candidate_user_id) ?? null,
    }));

    return NextResponse.json({ interests: result });
  } catch (error) {
    console.error('Recruiter interests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
