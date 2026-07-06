// src/lib/interests/threadUnread.ts
// Räknar olästa trådmeddelanden per intresse för en given deltagare.
// "Oläst" = meddelande från MOTPARTEN som skapats efter deltagarens
// last_read_at (eller alla från motparten om ingen läsmarkör finns).
// Delas mellan kandidatens och rekryterarens list-API:er så räkningen är
// konsekvent på båda sidor.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type Admin = SupabaseClient<Database>;

export async function unreadByInterest(
  admin: Admin,
  interestIds: string[],
  viewerUserId: string,
  viewerRole: 'candidate' | 'recruiter'
): Promise<Map<string, { total: number; unread: number }>> {
  const result = new Map<string, { total: number; unread: number }>();
  if (interestIds.length === 0) return result;

  const otherRole = viewerRole === 'candidate' ? 'recruiter' : 'candidate';

  // Alla meddelanden i de aktuella trådarna (id, tråd, roll, tid).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: msgs } = await (admin as any)
    .from('interest_messages')
    .select('interest_id, sender_role, created_at')
    .in('interest_id', interestIds);

  // Deltagarens läsmarkörer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reads } = await (admin as any)
    .from('interest_thread_reads')
    .select('interest_id, last_read_at')
    .eq('user_id', viewerUserId)
    .in('interest_id', interestIds);

  const lastRead = new Map<string, number>();
  for (const r of (reads ?? []) as Array<{ interest_id: string; last_read_at: string }>) {
    lastRead.set(r.interest_id, Date.parse(r.last_read_at));
  }

  for (const m of (msgs ?? []) as Array<{
    interest_id: string;
    sender_role: string;
    created_at: string;
  }>) {
    const entry = result.get(m.interest_id) ?? { total: 0, unread: 0 };
    entry.total += 1;
    if (m.sender_role === otherRole) {
      const readAt = lastRead.get(m.interest_id) ?? 0;
      if (Date.parse(m.created_at) > readAt) entry.unread += 1;
    }
    result.set(m.interest_id, entry);
  }

  return result;
}
