// GET /api/recruiter/pool
// Kandidatpoolen för godkända rekryterare. All läsning av candidate_profiles
// sker via admin-klienten (RLS är ägare-endast) EFTER att rekryterarens
// status verifierats. Endast träffkortens fält lämnar servern — aldrig
// löneanspråk, namn eller andra identifierande uppgifter.
//
// Sök-/filter-/rankningslogiken bor i src/lib/recruiter/poolSearch.ts (delas
// med bevakningscronen). Den här routen är ett tunt skal: auth, parse,
// paginering och intressestatus.
//
// Query-params (listor är kommaseparerade):
//   q               fritext, tokeniseras med AND-logik och relevansrankas
//   seniority       junior | mid | senior | expert (flerval)
//   regions         län (flerval)
//   availability    immediate | one_month | three_months | by_agreement
//   workplace       onsite | hybrid | remote (flerval)
//   extent          full_time | part_time | hourly (flerval)
//   employmentTypes permanent | temporary | consultant (flerval)
//   minPercentile   percentilgolv (90 = topp 10 %)
//   testFamilies    matrislogik | verbal | numerisk (golvet gäller valda)
//   strengths       personlighetsstyrkor (flerval)
//   archetypes      arbetsstils-arketyper (flerval)
//   educationLevels Gymnasial | Eftergymnasial | Kandidat | Master | Forskarnivå
//   budget          månadsbudget i kr (filtrerar, exponeras aldrig)
//   driversLicense  true = kräver B-körkort
//   sort            relevance | seniority | recent | testScore
//   page            1-baserad, pageSize 50

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import {
  runPoolSearch,
  type PoolFilters,
  type PoolSortKey,
  type SeniorityBucket,
} from '@/lib/recruiter/poolSearch';
import type { EducationLevelBucket, FamilyKey } from '@/lib/recruiter/candidateData';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;
const SORT_KEYS: PoolSortKey[] = ['relevance', 'seniority', 'recent', 'testScore'];

function listParam(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const params = request.nextUrl.searchParams;

    const minPercentileRaw = params.get('minPercentile');
    const minPercentile = minPercentileRaw ? Number.parseInt(minPercentileRaw, 10) : null;
    const budgetRaw = params.get('budget');
    const budget = budgetRaw ? Number.parseInt(budgetRaw, 10) : null;

    const filters: PoolFilters = {
      // "role" behålls som alias för äldre klienter.
      q: params.get('q')?.trim() || params.get('role')?.trim() || null,
      seniority: listParam(params, 'seniority') as SeniorityBucket[],
      regions: listParam(params, 'regions').concat(
        params.get('region')?.trim() ? [params.get('region')!.trim()] : []
      ),
      availability: params.get('availability')?.trim() || null,
      workplace: listParam(params, 'workplace'),
      extent: listParam(params, 'extent'),
      employmentTypes: listParam(params, 'employmentTypes'),
      minPercentile: Number.isFinite(minPercentile) ? minPercentile : null,
      testFamilies: listParam(params, 'testFamilies') as FamilyKey[],
      strengths: listParam(params, 'strengths').concat(
        params.get('strength')?.trim() ? [params.get('strength')!.trim()] : []
      ),
      archetypes: listParam(params, 'archetypes'),
      educationLevels: listParam(params, 'educationLevels') as EducationLevelBucket[],
      budget: budget !== null && Number.isFinite(budget) && budget > 0 ? budget : null,
      driversLicense: params.get('driversLicense') === 'true',
    };

    const sortRaw = params.get('sort') as PoolSortKey | null;
    const sort: PoolSortKey = sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : 'relevance';

    const pageRaw = Number.parseInt(params.get('page') ?? '1', 10);
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

    const admin = getSupabaseAdmin();
    const { candidates, total } = await runPoolSearch(admin, filters, sort);

    // Rekryterarens redan skickade intressen, för statusknappen på korten.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: interests } = await (admin as any)
      .from('candidate_interests')
      .select('candidate_user_id, status')
      .eq('recruiter_user_id', user.id);

    const interestByCandidate = new Map<string, string>(
      ((interests ?? []) as Array<{ candidate_user_id: string; status: string }>).map((i) => [
        i.candidate_user_id,
        i.status,
      ])
    );

    const start = (page - 1) * PAGE_SIZE;
    const pageItems = candidates.slice(start, start + PAGE_SIZE).map((card) => ({
      ...card,
      interestStatus: interestByCandidate.get(card.userId) ?? null,
    }));

    return NextResponse.json({
      candidates: pageItems,
      total,
      page,
      pageSize: PAGE_SIZE,
      // Bakåtkompatibelt alias tills alla klienter läser `total`.
      totalCount: total,
    });
  } catch (error) {
    console.error('Recruiter pool error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
