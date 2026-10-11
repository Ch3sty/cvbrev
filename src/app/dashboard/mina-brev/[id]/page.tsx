/**
 * Brevets egen sida är en server component.
 *
 * Brevet är sidans LCP-element. Hämtades det på klienten låg hela kedjan
 * hydrera, fetcha, rita på den kritiska vägen. Nu står brevet i första HTML
 * och klientdelen tar bara över interaktionen.
 *
 * Våg 4 (B1): sidan läser också om brevet redan ligger som sökt tjänst, så
 * att raden "Spara som sökt tjänst" säger sanningen från första målningen.
 * ?klart=1 kommer från brevflödets sista steg och visar bekräftelsen
 * "Brevet klart" på väggen.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getLetterForUser } from '../getLetterForUser';
import ViewLetterClient from './ViewLetterClient';

export default async function ViewLetterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ klart?: string }>;
}) {
  const { id } = await params;
  const { klart } = await searchParams;
  const supabase = createServerClient({ cookies: await cookies() });
  const [{ user, letter }, soktRes] = await Promise.all([
    getLetterForUser(id),
    supabase.from('job_applications').select('id').eq('letter_id', id).limit(1).maybeSingle(),
  ]);

  if (!user) redirect('/login');

  const soktId = (soktRes?.data as { id?: string } | null)?.id ?? null;

  return <ViewLetterClient id={id} initialLetter={letter} soktId={soktId} klart={klart === '1'} />;
}
