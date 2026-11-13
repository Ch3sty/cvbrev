'use client';

/**
 * Inbyggd inloggning via appskalet (docs/plan-app.md, avsnitt 2.5). Skalet
 * har pluginet @capgo/capacitor-social-login, som visar Androids eget
 * kontoval (Credential Manager) och ger en id-token från Google. Den går
 * till supabase.auth.signInWithIdToken, så ingen omdirigering till Google
 * sker i webbvyn (Google spärrar inloggning i inbäddade webbvyer).
 *
 * Supabase kontrollerar nonce: Google får sha256 av ett slumpat värde och
 * Supabase det råa värdet.
 *
 * window.Capacitor.Plugins är tomt när sidan kommer från servern, så
 * anropen går genom bryggan (skal-plugin.ts, kalla), som köpet och
 * notiserna. I en vanlig webbläsare finns inget skal och inget plugin;
 * harGoogle() är då falskt och knappen visas inaktiv.
 */

import { plattform } from './skal';
import { finnsPlugin, kalla } from './skal-plugin';

type LoginSvar = { provider?: string; result?: { idToken?: string | null; responseType?: string } };

/**
 * Webbklientens id i Google Cloud (OAuth-klienten "Web application"), samma
 * som Supabase Google-leverantören använder. Id-tokens från Android får det
 * som mottagare (aud), och Supabase godkänner just det id:t. Värdet är
 * offentligt (det står i varje inloggningsadress till Google).
 */
export const GOOGLE_WEBBKLIENT =
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || '750584671017-oqt5v13t7c9nsjb56ot0f48qn83rid67.apps.googleusercontent.com';

/** Finns den inbyggda Google-inloggningen (bara i appskalet med pluginet)? */
export function harGoogle(): boolean {
  return plattform() !== null && finnsPlugin('SocialLogin');
}

/** Apple-knappen visas bara på iOS (Apples riktlinje 4.8); på Android är den dold. */
export function arIos(): boolean {
  if (plattform() === 'ios') return true;
  return typeof navigator !== 'undefined' && /JobbcoachApp\/[^\s]+ \(ios\)/.test(navigator.userAgent);
}

let initierad: Promise<unknown> | null = null;

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

function slumpNonce(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

export type GoogleSvar = { ok: true; idToken: string; nonce: string } | { ok: false; avbrutet: boolean; fel: string };

/** Öppnar Googles kontoval i skalet och ger id-token och den råa nonce. */
export async function loggaInMedGoogle(): Promise<GoogleSvar> {
  if (!harGoogle()) return { ok: false, avbrutet: false, fel: 'plugin_saknas' };
  try {
    if (!initierad) initierad = kalla('SocialLogin', 'initialize', { google: { webClientId: GOOGLE_WEBBKLIENT, mode: 'online' } });
    await initierad;
    const nonce = slumpNonce();
    const svar = await kalla<LoginSvar>('SocialLogin', 'login', { provider: 'google', options: { nonce: await sha256Hex(nonce) } });
    const idToken = svar?.result?.idToken;
    if (!idToken) return { ok: false, avbrutet: false, fel: 'ingen_token' };
    return { ok: true, idToken, nonce };
  } catch (e) {
    initierad = null;
    const m = String((e as { message?: unknown })?.message ?? e);
    // Användaren stängde kontovalet: inget fel att visa.
    return { ok: false, avbrutet: /cancel/i.test(m), fel: m.slice(0, 80) };
  }
}
