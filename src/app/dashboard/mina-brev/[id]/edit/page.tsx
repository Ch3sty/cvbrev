/**
 * Redigeringssidan är en server component, av samma skäl som brevets egen
 * sida: brevet är LCP-elementet och hämtades förut på klienten, efter
 * hydrering. Nu står det i första HTML.
 */
import { redirect } from 'next/navigation';
import { getLetterForUser } from '../../getLetterForUser';
import EditLetterClient from './EditLetterClient';

export default async function EditLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, letter } = await getLetterForUser(id);

  if (!user) redirect('/login');

  return <EditLetterClient id={id} initialLetter={letter} />;
}
