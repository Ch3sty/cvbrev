/**
 * E-post i CV och brev (2026-10-10).
 *
 * profiles.contact_email är adressen användaren vill visa i dokument. Null
 * eller tom betyder kontoadressen, som fortfarande används för inloggning
 * och kvitton. Alla ställen där en e-postadress hamnar i ett dokument (brev,
 * förhandsvisning, nedladdning, CV-mallar, CV-byggarens förifyllning) ska gå
 * via dokumentEpost() så att reglerna bor på ett ställe.
 *
 * Adressen skickas aldrig till AI-modellen: brevhuvudet sätts på efter
 * modellanropet, och CV-text maskas i src/lib/privacy/pii.ts.
 */

export const EPOST_MAX = 254;

/** Samma regel som databasens check-constraint profiles_contact_email_format. */
const EPOST_FORMAT = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function arGiltigEpost(v: string): boolean {
  const t = v.trim();
  return t.length > 0 && t.length <= EPOST_MAX && EPOST_FORMAT.test(t);
}

type ProfilMedEpost = { contact_email?: string | null; email?: string | null } | null | undefined;
type AnvandareMedEpost = { email?: string | null } | null | undefined;

/** Kontoadressen: profilens kopia i första hand, annars auth-användarens. */
export function kontoEpost(profile: ProfilMedEpost, user?: AnvandareMedEpost): string {
  return (profile?.email ?? '').trim() || (user?.email ?? '').trim();
}

/** Adressen som ska stå i CV och brev. */
export function dokumentEpost(profile: ProfilMedEpost, user?: AnvandareMedEpost): string {
  const egen = (profile?.contact_email ?? '').trim();
  if (egen) return egen;
  return kontoEpost(profile, user);
}

/**
 * Sant när e-postfältet i CV-datan inte är något användaren skrivit: tomt,
 * en platshållare från maskningen ([E-POST], [EMAIL], [EMAIL REMOVED]) eller
 * något som inte ens ser ut som en adress.
 */
export function arTomEllerPlatshallare(v: string | null | undefined): boolean {
  const t = (v ?? '').trim();
  if (!t) return true;
  if (/^\[.*\]$/.test(t)) return true;
  return !t.includes('@');
}

/**
 * Vilken adress ett CV ska visa. Det användaren skrivit i CV-datan vinner.
 * Undantag: står kontoadressen där och användaren har valt en annan adress
 * för dokument, byts den. Kontoadressen kom då från förifyllningen och inte
 * från ett eget val.
 */
export function epostForCv(
  cvEpost: string | null | undefined,
  profile: ProfilMedEpost,
  user?: AnvandareMedEpost
): string {
  const dok = dokumentEpost(profile, user);
  if (arTomEllerPlatshallare(cvEpost)) return dok || (cvEpost ?? '');
  const t = (cvEpost ?? '').trim();
  const konto = kontoEpost(profile, user);
  if (konto && t.toLowerCase() === konto.toLowerCase() && dok && dok.toLowerCase() !== konto.toLowerCase()) {
    return dok;
  }
  return t;
}

const EPOST_I_TEXT = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/**
 * Byter e-postadressen i ett sparat brevs huvud och avslutning mot den
 * aktuella dokumentadressen. Brevets kropp (div.body-content) lämnas orörd,
 * så en adress användaren själv skrivit i texten står kvar.
 */
export function bytEpostIBrev(html: string, epost: string): string {
  if (!epost) return html;
  const ersatt = (s: string) => s.replace(EPOST_I_TEXT, epost);
  const bodyStart = html.search(/<body[\s>]/i);
  const start = bodyStart >= 0 ? bodyStart : 0;
  const huvud = html.slice(0, start);
  const kropp = html.slice(start);
  const m = kropp.match(/<div class="body-content">[\s\S]*?<\/div>/);
  if (!m || m.index === undefined) return huvud + ersatt(kropp);
  const fore = kropp.slice(0, m.index);
  const efter = kropp.slice(m.index + m[0].length);
  return huvud + ersatt(fore) + m[0] + ersatt(efter);
}
