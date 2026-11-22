// src/lib/recruiter/shareLinks.ts
// Delningslänkar till hiring managers, plan-rekryterare-v2 FAS B6.
//
// En rekryterare skapar en tokeniserad länk till en kandidatprofil som en
// hiring manager kan öppna UTAN inloggning. Maskeringen är exakt densamma
// som skaparen ser: buildCandidateDetail körs med skaparens upplåsningsläge
// (kontakt upplåst endast om skaparen har ett accepterat intresse, eller om
// profilen är öppen). Länken går ut efter 14 dagar.
//
// Tabellen recruiter_share_links skrivs alltid via admin-klienten (RLS är
// läs-only för ägaren); uppslaget via token är publikt men sker server-side.

import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { findVisibleProfileByUserId, recruiterDetailFor } from '@/lib/recruiter/candidateAccess';
import type { RecruiterDetail } from '@/lib/recruiter/recruiterView';

export const SHARE_LINK_TTL_DAYS = 14;
export const SHARE_TOKEN_LENGTH = 32;

/** 32 tecken URL-säker slump: 24 slumpbytes blir exakt 32 base64url-tecken. */
export function generateShareToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export function shareLinkExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + SHARE_LINK_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export interface SharedCandidate {
  detail: RecruiterDetail;
  expiresAt: string;
}

/**
 * Publikt uppslag av en delningslänk. null om token är okänd, utgången,
 * eller om kandidaten inte längre är synlig i poolen.
 *
 * Detaljen byggs med SKAPARENS recruiter-id så att en delad profil aldrig
 * visar mer än vad rekryteraren själv ser.
 */
export async function getSharedCandidate(token: string): Promise<SharedCandidate | null> {
  const trimmed = token?.trim();
  if (!trimmed || trimmed.length > 64) return null;

  const admin = getSupabaseAdmin();

  const { data: link, error: linkError } = await (admin as any)
    .from('recruiter_share_links')
    .select('token, recruiter_user_id, candidate_user_id, expires_at, revoked_at')
    .eq('token', trimmed)
    .gt('expires_at', new Date().toISOString())
    .is('revoked_at', null)
    .maybeSingle();

  if (linkError) {
    console.error('Share links: kunde inte slå upp token', linkError);
    return null;
  }
  if (!link) return null;

  // Kandidaten måste fortfarande vara synlig i poolen.
  const row = await findVisibleProfileByUserId(admin, link.candidate_user_id);
  if (!row) return null;

  // Skaparens intressestatus avgör upplåsningen, precis som i skaparens vy,
  // och vitlistan formar svaret som för alla andra rekryterarvägar.
  const { detail } = await recruiterDetailFor(admin, row, link.recruiter_user_id, {
    sharedLink: true,
  });

  return { detail, expiresAt: link.expires_at };
}

/**
 * Återkallar en delningslänk i förväg. Bara skaparen får återkalla sina egna
 * länkar (recruiter_user_id måste matcha). Returnerar antalet återkallade rader.
 */
export async function revokeShareLink(
  recruiterUserId: string,
  candidateUserId: string
): Promise<number> {
  const admin = getSupabaseAdmin();
  const { data, error } = await (admin as any)
    .from('recruiter_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('recruiter_user_id', recruiterUserId)
    .eq('candidate_user_id', candidateUserId)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .select('token');
  if (error) {
    console.error('Share links: kunde inte återkalla', error);
    throw error;
  }
  return (data ?? []).length;
}
