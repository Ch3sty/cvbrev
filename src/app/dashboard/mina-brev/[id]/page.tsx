/**
 * Brevets egen sida är en server component.
 *
 * Brevet är sidans LCP-element. Hämtades det på klienten låg hela kedjan
 * hydrera, fetcha, rita på den kritiska vägen. Nu står brevet i första HTML
 * och klientdelen tar bara över interaktionen.
 */
import { redirect } from 'next/navigation';
import { getLetterForUser } from '../getLetterForUser';
import ViewLetterClient from './ViewLetterClient';

export default async function ViewLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, letter } = await getLetterForUser(id);

  if (!user) redirect('/login');

  return <ViewLetterClient id={id} initialLetter={letter} />;
}
