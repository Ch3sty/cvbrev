// /api/recruiter/projects/[projectId]
// Ett enskilt projekt (shortlist), plan-rekryterare-v2 FAS B3.
//
//   GET    → projektet + kandidatkorten (buildCandidateCard) med status/added_at.
//            Kandidater som stängt av synligheten filtreras bort.
//   PATCH  → byt namn { name }.
//   DELETE → radera projektet (och dess medlemsrader).
//
// Ägarskap kontrolleras alltid: raden läses med recruiter_user_id = auth-user,
// annars 404 (obefintligt och någon annans projekt ska inte gå att skilja åt).

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import { recruiterCardsFor } from '@/lib/recruiter/candidateAccess';
import type { RecruiterCard } from '@/lib/recruiter/recruiterView';

export const dynamic = 'force-dynamic';

const NAME_MAX = 80;

interface ProjectRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/** Läser projektet med ägarskapsvillkor. null = finns inte eller inte ditt. */
async function fetchOwnedProject(
  admin: ReturnType<typeof getSupabaseAdmin>,
  projectId: string,
  recruiterUserId: string
): Promise<ProjectRow | null> {
  const { data, error } = await (admin as any)
    .from('recruiter_projects')
    .select('id, name, created_at, updated_at')
    .eq('id', projectId)
    .eq('recruiter_user_id', recruiterUserId)
    .maybeSingle();
  if (error) {
    console.error('Recruiter project: kunde inte läsa projektet', error);
    return null;
  }
  return (data as ProjectRow | null) ?? null;
}

export async function GET(
  _request: NextRequest,
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

    const admin = getSupabaseAdmin();
    const project = await fetchOwnedProject(admin, projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: memberRows, error: memberError } = await (admin as any)
      .from('recruiter_project_candidates')
      .select('candidate_user_id, status, added_at')
      .eq('project_id', projectId)
      .order('added_at', { ascending: false });

    if (memberError) {
      console.error('Recruiter project: kunde inte läsa kandidater', memberError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const members = (memberRows ?? []) as Array<{
      candidate_user_id: string;
      status: string;
      added_at: string;
    }>;

    let candidates: Array<{
      candidateId: string;
      status: string;
      addedAt: string;
      card: RecruiterCard;
    }> = [];

    if (members.length > 0) {
      // Endast synliga profiler: kandidater med visibility 'off' faller bort.
      let cardByUser: Map<string, RecruiterCard>;
      try {
        cardByUser = await recruiterCardsFor(
          admin,
          members.map((m) => m.candidate_user_id)
        );
      } catch (visibleError) {
        console.error('Recruiter project: kunde inte läsa profiler', visibleError);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }

      candidates = members.flatMap((m) => {
        const card = cardByUser.get(m.candidate_user_id);
        if (!card) return []; // synlighet av eller profil borta
        return [
          {
            candidateId: card.candidateId,
            status: m.status,
            addedAt: m.added_at,
            card,
          },
        ];
      });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
      candidates,
    });
  } catch (error) {
    console.error('Recruiter project error:', error);
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

    const { data: updated, error } = await (admin as any)
      .from('recruiter_projects')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('recruiter_user_id', user.id)
      .select('id, name, created_at, updated_at')
      .maybeSingle();

    if (error) {
      console.error('Recruiter project: kunde inte byta namn', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: updated.id,
        name: updated.name,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
  } catch (error) {
    console.error('Recruiter project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const admin = getSupabaseAdmin();
    const project = await fetchOwnedProject(admin, projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Medlemsraderna först (ingen garanti om ON DELETE CASCADE), sedan projektet.
    const { error: memberError } = await (admin as any)
      .from('recruiter_project_candidates')
      .delete()
      .eq('project_id', projectId);
    if (memberError) {
      console.error('Recruiter project: kunde inte radera kandidater', memberError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const { error: deleteError } = await (admin as any)
      .from('recruiter_projects')
      .delete()
      .eq('id', projectId)
      .eq('recruiter_user_id', user.id);
    if (deleteError) {
      console.error('Recruiter project: kunde inte radera projektet', deleteError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recruiter project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
