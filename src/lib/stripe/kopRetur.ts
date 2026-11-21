/**
 * Köpreturen: dit kassan skickar tillbaka efter köpet, med &ladda=1 så att
 * filen laddas ner av sig själv (affärsgranskningen B2). Bara våra egna
 * sidor där en nedladdning väntar godtas, aldrig en godtycklig adress:
 *
 *   /dashboard/cv-mallar?...                CV-mallarna
 *   /dashboard/mina-brev/mallar?...         brevrummets Mallar
 *   /dashboard/mina-brev/<brevets id>?...   brevrummets Brevet
 *
 * Köpsteget (valj-spar) och kassan (create-plan-session) prövar båda.
 * Klientsäker: ren funktion.
 */

const PREFIX = ['/dashboard/cv-mallar?', '/dashboard/mina-brev/mallar?'] as const
const BREVET = /^\/dashboard\/mina-brev\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\?/

export function arKopRetur(v: unknown): v is string {
  if (typeof v !== 'string' || v.length >= 300 || /[\s<>"\\]/.test(v)) return false
  return PREFIX.some((p) => v.startsWith(p)) || BREVET.test(v)
}
