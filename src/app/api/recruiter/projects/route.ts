// /api/recruiter/projects
// Rekryterarens projekt (shortlists), plan-rekryterare-v2 FAS B3.
//
//   GET  → projektlistan med kandidatantal och de 4 senast tillagda
//          kandidaternas roll-initialer (avatar-stacken), updated_at desc.
//   POST → skapa projekt { name } (trim, 1-80 tecken, max 50 per rekryterare).
//
// Alla skrivningar går via admin-klienten (RLS är läs-only för ägaren).
// Ägarskap avgränsas alltid med recruiter_user_id = auth-user.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';

export const dynamic = 'force-dynamic';

const NAME_MAX = 80;
const MAX_PROJECTS = 50;
const AVATAR_STACK_SIZE = 4;

interface ProjectRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/** "Redovisningsekonom" → "RE", "Data Engineer" → "DE", saknad roll → "?". */
function roleInitials(role: string | null): string {
  if (!role) return '?';
  const words = role
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return '?';
  const initials = words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return initials || '?';
}

export async function GET() {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const admin = getSupabaseAdmin();

    const { data: projectRows, error } = await (admin as any)
      .from('recruiter_projects')
      .select('id, name, created_at, updated_at')
      .eq('recruiter_user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Recruiter projects: kunde inte läsa projekt', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const projects = (projectRows ?? []) as ProjectRow[];
    if (projects.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    // Alla projektmedlemskap i en fråga; antal + senaste 4 räknas i minnet.
    const projectIds = projects.map((p) => p.id);
    const { data: memberRows, error: memberError } = await (admin as any)
      .from('recruiter_project_candidates')
      .select('project_id, candidate_user_id, added_at')
      .in('project_id', projectIds)
      .order('added_at', { ascending: false });

    if (memberError) {
      console.error('Recruiter projects: kunde inte läsa projektkandidater', memberError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const members = (memberRows ?? []) as Array<{
      project_id: string;
      candidate_user_id: string;
      added_at: string;
    }>;

    const countByProject = new Map<string, number>();
    const recentByProject = new Map<string, string[]>();
    for (const m of members) {
      countByProject.set(m.project_id, (countByProject.get(m.project_id) ?? 0) + 1);
      const recent = recentByProject.get(m.project_id) ?? [];
      if (recent.length < AVATAR_STACK_SIZE) {
        recent.push(m.candidate_user_id);
        recentByProject.set(m.project_id, recent);
      }
    }

    // Roll för avatar-initialerna: senaste extraktionen per kandidat.
    const recentCandidateIds = [
      ...new Set([...recentByProject.values()].flat()),
    ];
    const roleByCandidate = new Map<string, string | null>();
    if (recentCandidateIds.length > 0) {
      const { data: cvRows } = await (admin as any)
        .from('active_cv_for_matching')
        .select('user_id, extracted_occupations, parsed_at')
        .in('user_id', recentCandidateIds)
        .order('parsed_at', { ascending: false });

      for (const row of (cvRows ?? []) as Array<{
        user_id: string;
        extracted_occupations: Array<{ original?: string; normalized?: string }> | null;
      }>) {
        if (roleByCandidate.has(row.user_id)) continue; // senaste vinner
        const occ = row.extracted_occupations?.[0];
        roleByCandidate.set(row.user_id, occ?.normalized || occ?.original || null);
      }
    }

    const result = projects.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      candidateCount: countByProject.get(p.id) ?? 0,
      recentInitials: (recentByProject.get(p.id) ?? []).map((candidateId) =>
        roleInitials(roleByCandidate.get(candidateId) ?? null)
      ),
    }));

    return NextResponse.json({ projects: result });
  } catch (error) {
    console.error('Recruiter projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    let body: { name?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > NAME_MAX) {
      return NextResponse.json(
        { error: `Namnet måste vara 1-${NAME_MAX} tecken` },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { count } = await (admin as any)
      .from('recruiter_projects')
      .select('id', { count: 'exact', head: true })
      .eq('recruiter_user_id', user.id);

    if ((count ?? 0) >= MAX_PROJECTS) {
      return NextResponse.json(
        {
          code: 'limit_reached',
          error: `Du kan ha högst ${MAX_PROJECTS} projekt. Ta bort ett gammalt först.`,
        },
        { status: 400 }
      );
    }

    const { data: inserted, error: insertError } = await (admin as any)
      .from('recruiter_projects')
      .insert({ recruiter_user_id: user.id, name })
      .select('id, name, created_at, updated_at')
      .single();

    if (insertError || !inserted) {
      console.error('Recruiter projects: insert misslyckades', insertError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({
      project: {
        id: inserted.id,
        name: inserted.name,
        createdAt: inserted.created_at,
        updatedAt: inserted.updated_at,
        candidateCount: 0,
        recentInitials: [],
      },
    });
  } catch (error) {
    console.error('Recruiter projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
