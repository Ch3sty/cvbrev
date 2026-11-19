// src/lib/konto/epostbyte.ts
// Hjälpare för /api/konto/byt-epost och /auth/confirm. Ligger utanför
// route-filen eftersom Next bara tillåter HTTP-metoder som export där.

import { createHash } from 'crypto';

/** Byten per konto och per IP och dygn. Varje försök skickar upp till två mejl. */
export const GRANS_KONTO = 5;
export const GRANS_IP = 10;

/**
 * Om båda adresserna måste bekräfta bytet. Projektet har
 * mailer_secure_email_change_enabled på, men också mailer_autoconfirm på
 * (kontrollerat 2026-11-19), och då kräver Supabase bara en bekräftelse:
 * vilken som helst av länkarna byter adressen direkt (provat mot
 * mnlrpfidyzuaxxlftruf). En länk till den nuvarande adressen skulle alltså
 * låta kontot byta till en adress ingen bekräftat. Därför går länken bara
 * till den nya adressen, och den nuvarande får ett besked utan länk.
 * Stängs mailer_autoconfirm av i Supabase gäller dubbel bekräftelse, och då
 * sätts SUPABASE_EMAIL_CHANGE_DUBBEL=true så att båda får en länk.
 */
export function dubbelBekraftelse(): boolean {
  return process.env.SUPABASE_EMAIL_CHANGE_DUBBEL === 'true';
}

const EPOST = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function giltigEpost(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const e = v.trim().toLowerCase();
  if (e.length > 254 || !EPOST.test(e)) return null;
  return e;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
}

/**
 * Länken i mejlet. Från appen går den via /auth/app/, den enda prefix som
 * appens App Links öppnar i appen; på webben via /auth/confirm. Båda kör
 * samma verifiering.
 */
export function bekraftelseLank(tokenHash: string, appen: boolean): string {
  const vag = appen ? '/auth/app/bekrafta' : '/auth/confirm';
  return `${siteUrl()}${vag}?token_hash=${encodeURIComponent(tokenHash)}&type=email_change`;
}

/**
 * token_hash för länken till den nya adressen. generateLink med
 * email_change_new returnerar ett hashed_token räknat på den NUVARANDE
 * adressen (sha224(nuvarande + otp)), men Supabase sparar och verifierar
 * sha224(ny + otp). Den returnerade hashen ger därför "Email link is invalid
 * or has expired" (provat mot mnlrpfidyzuaxxlftruf 2026-11-19). Vi räknar
 * fram rätt hash ur email_otp på samma sätt som Supabase (GenerateTokenHash).
 */
export function tokenHashNyAdress(nyEpost: string, otp: string): string {
  return createHash('sha224').update(nyEpost + otp).digest('hex');
}

/** Landningen efter en följd länk: halvvägs (en av två) eller klart. */
export const EPOST_LANDNING = '/auth/epost-bytt';

/** Bara relativa sökvägar inom sajten, aldrig protokoll-relativa. */
export function sakerVag(raw: string | null, standard: string): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return standard;
  return raw;
}
