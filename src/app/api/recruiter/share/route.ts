// POST /api/recruiter/share
// Skapar en delningslänk till en kandidatprofil, plan-rekryterare-v2 FAS B6.
//
// Länken öppnas av en hiring manager utan inloggning via den publika sidan
// /delad/kandidat/[token] (uppslaget sker med getSharedCandidate i
// src/lib/recruiter/shareLinks.ts). Maskeringen följer alltid skaparens
// upplåsningsläge. Giltighet: 14 dagar.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import {
  generateShareToken,
  shareLinkExpiry,
  revokeShareLink,
} from '@/lib/recruiter/shareLinks';

export const dynamic = 'force-dynamic';

const TOKEN_INSERT_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    let body: { candidateUserId?: string };
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

    const admin = getSupabaseAdmin();

    // Endast synliga kandidater kan delas.
    const { data: candidate } = await (admin as any)
      .from('candidate_profiles')
      .select('user_id')
      .eq('user_id', candidateUserId)
      .neq('visibility', 'off')
      .maybeSingle();
    if (!candidate) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const expiresAt = shareLinkExpiry().toISOString();

    // Tokenkrock är i praktiken omöjlig (24 slumpbytes), men PK-kollision
    // hanteras ändå med nytt försök i stället för 500.
    let token: string | null = null;
    for (let attempt = 0; attempt < TOKEN_INSERT_ATTEMPTS && !token; attempt++) {
      const candidateToken = generateShareToken();
      const { error: insertError } = await (admin as any)
        .from('recruiter_share_links')
        .insert({
          token: candidateToken,
          recruiter_user_id: user.id,
          candidate_user_id: candidateUserId,
          expires_at: expiresAt,
        });

      if (!insertError) {
        token = candidateToken;
      } else if (insertError.code !== '23505') {
        console.error('Recruiter share: insert misslyckades', insertError);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    if (!token) {
      console.error('Recruiter share: kunde inte skapa unik token');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const origin = request.nextUrl.origin;
    return NextResponse.json({
      url: `${origin}/delad/kandidat/${token}`,
      expiresAt,
    });
  } catch (error) {
    console.error('Recruiter share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/recruiter/share  { candidateUserId }
// Återkallar rekryterarens aktiva delningslänkar för en kandidat i förväg.
export async function DELETE(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    let body: { candidateUserId?: string };
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

    const revoked = await revokeShareLink(user.id, candidateUserId);
    return NextResponse.json({ revoked });
  } catch (error) {
    console.error('Recruiter share revoke error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
