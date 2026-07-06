// /api/recruiter/notes
// Rekryterarens privata anteckning per kandidat, plan-rekryterare-v2 FAS B3.
//
//   GET ?candidateUserId=  → anteckningen eller null.
//   PUT { candidateUserId, note } → upsert. Tom sträng raderar raden.
//
// En anteckning per (rekryterare, kandidat). Aldrig synlig för kandidaten.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';

export const dynamic = 'force-dynamic';

const NOTE_MAX = 4000;

export async function GET(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const candidateUserId = request.nextUrl.searchParams.get('candidateUserId')?.trim();
    if (!candidateUserId) {
      return NextResponse.json({ error: 'candidateUserId krävs' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

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

    let body: { candidateUserId?: string; note?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const candidateUserId =
      typeof body.candidateUserId === 'string' ? body.candidateUserId.trim() : '';
    if (!candidateUserId) {
      return NextResponse.json({ error: 'candidateUserId krävs' }, { status: 400 });
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
