// src/lib/mobilapp/anonym.ts
// Spärren för anonyma konton (docs/plan-app.md, Nivåkollen före kontot).
//
// En anonym session räknas som inloggad i Supabase, och de flesta API-rutter
// kontrollerar bara att någon är inloggad. Utan spärr skulle vem som helst
// kunna skapa anonyma konton direkt mot Supabase, gå förbi registreringen och
// Turnstile och få en egen gratiskvot i AI-funktionerna. Proxyn släpper därför
// bara igenom det Nivåkollen i appen behöver; allt annat nekas tills kontot
// har fått en e-post.

/** API-rutter som en anonym session får anropa. */
const API_TILLATNA = ['/api/traning/', '/api/app/anonym/', '/api/auth/', '/api/public/'];

/** Sidor som en anonym session får öppna (appen skriver om dem till /app). */
const SIDOR_TILLATNA = ['/dashboard/tester', '/app', '/register', '/login', '/auth'];

function under(pathname: string, prefix: string): boolean {
  if (prefix.endsWith('/')) return pathname.startsWith(prefix);
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function anonymTillaten(pathname: string): boolean {
  if (pathname.startsWith('/api/')) return API_TILLATNA.some((p) => under(pathname, p));
  // Idag i appen skickar själv en anonym session vidare till kontosteget.
  if (pathname === '/dashboard' || pathname === '/dashboard/') return true;
  return SIDOR_TILLATNA.some((p) => under(pathname, p));
}

/** Dit en anonym session skickas när den försöker öppna något annat. */
export const ANONYM_TILL_KONTO = '/register?steg=konto';
