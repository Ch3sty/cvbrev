// GET /api/recruiter/pool
// Kandidatpoolen för godkända rekryterare. All läsning av candidate_profiles
// sker via admin-klienten (RLS är ägare-endast) EFTER att rekryterarens
// status verifierats. Endast träffkortens fält lämnar servern — aldrig
// löneanspråk, namn eller andra identifierande uppgifter.
//
// Query-params:
//   role          fritext, matchas case-insensitive mot roll och kompetenser
//   region        exakt län (t.ex. "Stockholms län")
//   availability  immediate | one_month | three_months | by_agreement
//   workplace     onsite | hybrid | remote
//   minPercentile någon kognitiv familj med percentil >= värdet
//   strength      personlighetsstyrka (matchar bara profiler som visar dem)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import {
  buildCandidateCard,
  createPercentileContext,
  type CandidateCard,
  type CandidateProfileRow,
} from '@/lib/recruiter/candidateData';

export const dynamic = 'force-dynamic';

const MAX_RESULTS = 50;

export async function GET(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const params = request.nextUrl.searchParams;
    const role = params.get('role')?.trim().toLowerCase() || null;
    const region = params.get('region')?.trim() || null;
    const availability = params.get('availability')?.trim() || null;
    const workplace = params.get('workplace')?.trim() || null;
    const minPercentileRaw = params.get('minPercentile');
    const minPercentile = minPercentileRaw ? Number.parseInt(minPercentileRaw, 10) : null;
    const strength = params.get('strength')?.trim() || null;

    const admin = getSupabaseAdmin();

    // Strukturella filter trycks ned i frågan; fritext/percentil/styrka
    // filtreras efter kortbygget eftersom de kräver härledd data.
    let query = (admin as any)
      .from('candidate_profiles')
      .select(
        'user_id, cv_id, visibility, show_personality, availability, workplace, extent, employment_types, regions, drivers_license'
      )
      .neq('visibility', 'off')
      .order('updated_at', { ascending: false });

    if (region) query = query.contains('regions', [region]);
    if (availability) query = query.eq('availability', availability);
    if (workplace) query = query.contains('workplace', [workplace]);

    const { data: rows, error } = await query;
    if (error) {
      console.error('Recruiter pool: kunde inte läsa candidate_profiles', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const profiles = (rows ?? []) as CandidateProfileRow[];

    // Delad percentilkontext: aggregatfrågorna körs en gång per test_type,
    // inte en gång per kandidat.
    const ctx = createPercentileContext(admin);
    const cards = await Promise.all(
      profiles.map((row) => buildCandidateCard(admin, row, ctx))
    );

    const filtered = cards.filter((card) => {
      if (role) {
        const haystack = [card.role ?? '', ...card.skills].join(' ').toLowerCase();
        if (!haystack.includes(role)) return false;
      }
      if (minPercentile !== null && Number.isFinite(minPercentile)) {
        const hit = card.testBadges.some(
          (b) => b.percentile !== null && b.percentile >= minPercentile
        );
        if (!hit) return false;
      }
      if (strength && !card.personalityStrengths.includes(strength)) return false;
      return true;
    });

    // Rekryterarens redan skickade intressen, för statusknappen på korten.
    const { data: interests } = await (admin as any)
      .from('candidate_interests')
      .select('candidate_user_id, status')
      .eq('recruiter_user_id', user.id);

    const interestByCandidate = new Map<string, string>(
      ((interests ?? []) as Array<{ candidate_user_id: string; status: string }>).map(
        (i) => [i.candidate_user_id, i.status]
      )
    );

    const results = filtered
      .slice(0, MAX_RESULTS)
      .map((card: CandidateCard) => ({
        ...card,
        interestStatus: interestByCandidate.get(card.userId) ?? null,
      }));

    return NextResponse.json({ candidates: results, totalCount: filtered.length });
  } catch (error) {
    console.error('Recruiter pool error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
