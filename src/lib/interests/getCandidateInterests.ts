// src/lib/interests/getCandidateInterests.ts
//
// Kandidatens inkommande intresseanmälningar, hämtade en gång och delade
// mellan två anropare: /dashboard/meddelanden som server component, och
// GET /api/candidate/interests som klienten använder vid navigering.
//
// Logiken låg tidigare bara i routen. Att flytta den hit gör att sidan kan
// köra den direkt på servern i stället för att fetcha vår egen HTTP-route,
// vilket hade lagt till en hel extra rundtur per sidladdning.
//
// Behörigheten är oförändrad: raderna i candidate_interests läses med
// användarens egen klient (RLS släpper igenom rader där
// candidate_user_id = user.id), och admin-klienten används bara för att slå
// upp rekryterarnas namnfält. Kontaktuppgifter lämnar servern endast för
// intressen kandidaten har accepterat.

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { unreadByInterest } from '@/lib/interests/threadUnread';
import type { CandidateInterest } from '@/components/interests/hubTypes';

interface InterestRow {
  id: string;
  recruiter_user_id: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at: string | null;
}

interface RecruiterRow {
  user_id: string;
  company_name: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  phone: string | null;
  website: string | null;
}

export async function getCandidateInterests(
  // Användarens egen klient. Typen är lös eftersom tabellen saknas i de
  // genererade DB-typerna.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<CandidateInterest[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('candidate_interests')
    .select('id, recruiter_user_id, message, status, created_at, responded_at')
    .eq('candidate_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows: InterestRow[] = data ?? [];
  if (rows.length === 0) return [];

  const recruiterIds = Array.from(new Set(rows.map((r) => r.recruiter_user_id)));
  const admin = getSupabaseAdmin();
  const acceptedIds = rows.filter((r) => r.status === 'accepted').map((r) => r.id);

  // Rekryterarnas namnfält och trådstatistiken behöver inte vänta på varandra.
  const [recruiterRes, threadStats] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('recruiter_profiles')
      .select('user_id, company_name, contact_name, contact_role, contact_email, phone, website')
      .in('user_id', recruiterIds),
    unreadByInterest(admin, acceptedIds, userId, 'candidate'),
  ]);

  if (recruiterRes.error) {
    console.error('Error fetching recruiter profiles:', recruiterRes.error);
  }

  const recruiterMap = new Map<string, RecruiterRow>(
    ((recruiterRes.data ?? []) as RecruiterRow[]).map((r) => [r.user_id, r])
  );

  return rows.map((row) => {
    const recruiter = recruiterMap.get(row.recruiter_user_id);
    const accepted = row.status === 'accepted';
    return {
      id: row.id,
      companyName: recruiter?.company_name ?? 'Okänt företag',
      contactName: recruiter?.contact_name ?? null,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      respondedAt: row.responded_at,
      // Kontaktkort + trådhint bara när kandidaten accepterat.
      recruiterContact: accepted
        ? {
            companyName: recruiter?.company_name ?? 'Okänt företag',
            contactName: recruiter?.contact_name ?? null,
            contactRole: recruiter?.contact_role ?? null,
            email: recruiter?.contact_email ?? null,
            phone: recruiter?.phone ?? null,
            website: recruiter?.website ?? null,
          }
        : null,
      messageCount: accepted ? threadStats.get(row.id)?.total ?? 0 : 0,
      unreadCount: accepted ? threadStats.get(row.id)?.unread ?? 0 : 0,
    };
  });
}
