// /api/recruiter/projects/[projectId]/candidates
// Kandidater i ett projekt, plan-rekryterare-v2 FAS B3.
//
//   POST   { candidateUserId }         → lägg till (kandidaten måste vara synlig
//                                        i poolen), bumpar projektets updated_at.
//   PATCH  { candidateUserId, status } → uppdatera status (ny/kontaktad/vantar/dialog).
//   DELETE { candidateUserId }         → ta bort ur projektet.
//
// Ägarskap kontrolleras alltid mot recruiter_projects.recruiter_user_id.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['ny', 'kontaktad', 'vantar', 'dialog'] as const;
type ProjectCandidateStatus = (typeof VALID_STATUSES)[number];

/** true om projektet finns och ägs av rekryteraren. */
async function ownsProject(
  admin: ReturnType<typeof getSupabaseAdmin>,
  projectId: string,
  recruiterUserId: string
): Promise<boolean> {
  const { data, error } = await (admin as any)
    .from('recruiter_projects')
    .select('id')
    .eq('id', projectId)
    .eq('recruiter_user_id', recruiterUserId)
    .maybeSingle();
  if (error) {
    console.error('Recruiter project candidates: ägarskapskontroll misslyckades', error);
    return false;
  }
  return Boolean(data);
}

async function touchProject(
  admin: ReturnType<typeof getSupabaseAdmin>,
  projectId: string
): Promise<void> {
  const { error } = await (admin as any)
    .from('recruiter_projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', projectId);
  if (error) {
    console.warn('Recruiter project candidates: kunde inte bumpa updated_at', error);
  }
}

async function readBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await readBody<{ candidateUserId?: string }>(request);
    if (!body) {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }
    const candidateUserId =
      typeof body.candidateUserId === 'string' ? body.candidateUserId.trim() : '';
    if (!candidateUserId) {
      return NextResponse.json({ error: 'candidateUserId krävs' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    if (!(await ownsProject(admin, projectId, user.id))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Kandidaten måste finnas i poolen med synligheten på.
    const { data: candidate } = await (admin as any)
      .from('candidate_profiles')
      .select('user_id')
      .eq('user_id', candidateUserId)
      .neq('visibility', 'off')
      .maybeSingle();
    if (!candidate) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: inserted, error: insertError } = await (admin as any)
      .from('recruiter_project_candidates')
      .insert({
        project_id: projectId,
        candidate_user_id: candidateUserId,
        status: 'ny',
      })
      .select('candidate_user_id, status, added_at')
      .single();

    if (insertError) {
      // Redan i projektet: returnera befintlig rad i stället för fel.
      if (insertError.code === '23505') {
        const { data: existing } = await (admin as any)
          .from('recruiter_project_candidates')
          .select('candidate_user_id, status, added_at')
          .eq('project_id', projectId)
          .eq('candidate_user_id', candidateUserId)
          .maybeSingle();
        return NextResponse.json({
          member: existing
            ? {
                candidateUserId: existing.candidate_user_id,
                status: existing.status,
                addedAt: existing.added_at,
              }
            : null,
          existing: true,
        });
      }
      console.error('Recruiter project candidates: insert misslyckades', insertError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    await touchProject(admin, projectId);

    return NextResponse.json({
      member: {
        candidateUserId: inserted.candidate_user_id,
        status: inserted.status,
        addedAt: inserted.added_at,
      },
      existing: false,
    });
  } catch (error) {
    console.error('Recruiter project candidates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await readBody<{ candidateUserId?: string; status?: string }>(request);
    if (!body) {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }
    const candidateUserId =
      typeof body.candidateUserId === 'string' ? body.candidateUserId.trim() : '';
    if (!candidateUserId) {
      return NextResponse.json({ error: 'candidateUserId krävs' }, { status: 400 });
    }
    const status = body.status;
    if (!status || !VALID_STATUSES.includes(status as ProjectCandidateStatus)) {
      return NextResponse.json(
        { error: `status måste vara en av: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    if (!(await ownsProject(admin, projectId, user.id))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: updated, error } = await (admin as any)
      .from('recruiter_project_candidates')
      .update({ status })
      .eq('project_id', projectId)
      .eq('candidate_user_id', candidateUserId)
      .select('candidate_user_id, status, added_at')
      .maybeSingle();

    if (error) {
      console.error('Recruiter project candidates: statusuppdatering misslyckades', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      member: {
        candidateUserId: updated.candidate_user_id,
        status: updated.status,
        addedAt: updated.added_at,
      },
    });
  } catch (error) {
    console.error('Recruiter project candidates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // candidateUserId tas ur body, med query-param som fallback.
    const body = await readBody<{ candidateUserId?: string }>(request);
    const candidateUserId =
      (typeof body?.candidateUserId === 'string' ? body.candidateUserId.trim() : '') ||
      request.nextUrl.searchParams.get('candidateUserId')?.trim() ||
      '';
    if (!candidateUserId) {
      return NextResponse.json({ error: 'candidateUserId krävs' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    if (!(await ownsProject(admin, projectId, user.id))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { error } = await (admin as any)
      .from('recruiter_project_candidates')
      .delete()
      .eq('project_id', projectId)
      .eq('candidate_user_id', candidateUserId);

    if (error) {
      console.error('Recruiter project candidates: borttagning misslyckades', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recruiter project candidates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
