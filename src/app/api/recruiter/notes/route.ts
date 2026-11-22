// /api/recruiter/notes
// Rekryterarens privata anteckning per kandidat, plan-rekryterare-v2 FAS B3.
//
//   GET ?candidateId=  → anteckningen eller null.
//   PUT { candidateId, note } → upsert. Tom sträng raderar raden.
//
// candidateId är kandidatens id mot rekryterare, aldrig kontots id.
//
// En anteckning per (rekryterare, kandidat). Aldrig synlig för kandidaten.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import { userIdForRef } from '@/lib/recruiter/candidateAccess';

export const dynamic = 'force-dynamic';

const NOTE_MAX = 4000;

export async function GET(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const candidateRef = request.nextUrl.searchParams.get('candidateId')?.trim();
    if (!candidateRef) {
      return NextResponse.json({ error: 'candidateId krävs' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const candidateUserId = await userIdForRef(admin, candidateRef);
    if (!candidateUserId) return NextResponse.json({ note: null });

    const { data, error } = await (admin as any)
      .from('recruiter_candidate_notes')
      .select('note, updated_at')
      .eq('recruiter_user_id', user.id)
      .eq('candidate_user_id', candidateUserId)
      .maybeSingle();

    if (error) {
      console.error('Recruiter notes: kunde inte läsa anteckningen', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({
      note: data ? { note: data.note, updatedAt: data.updated_at } : null,
    });
  } catch (error) {
    console.error('Recruiter notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    let body: { candidateId?: string; note?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const candidateRef = typeof body.candidateId === 'string' ? body.candidateId.trim() : '';
    if (!candidateRef) {
      return NextResponse.json({ error: 'candidateId krävs' }, { status: 400 });
    }
    if (typeof body.note !== 'string') {
      return NextResponse.json({ error: 'note krävs (sträng)' }, { status: 400 });
    }

    const note = body.note.trim();
    if (note.length > NOTE_MAX) {
      return NextResponse.json(
        { error: `Anteckningen får vara högst ${NOTE_MAX} tecken` },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const candidateUserId = await userIdForRef(admin, candidateRef);
    if (!candidateUserId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Tom sträng raderar raden.
    if (!note) {
      const { error } = await (admin as any)
        .from('recruiter_candidate_notes')
        .delete()
        .eq('recruiter_user_id', user.id)
        .eq('candidate_user_id', candidateUserId);
      if (error) {
        console.error('Recruiter notes: radering misslyckades', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
      return NextResponse.json({ note: null });
    }

    const { data: upserted, error: upsertError } = await (admin as any)
      .from('recruiter_candidate_notes')
      .upsert(
        {
          recruiter_user_id: user.id,
          candidate_user_id: candidateUserId,
          note,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'recruiter_user_id,candidate_user_id' }
      )
      .select('note, updated_at')
      .single();

    if (upsertError || !upserted) {
      console.error('Recruiter notes: upsert misslyckades', upsertError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({
      note: { note: upserted.note, updatedAt: upserted.updated_at },
    });
  } catch (error) {
    console.error('Recruiter notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
