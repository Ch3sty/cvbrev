// src/lib/email/unsubscribe.ts
// HMAC-signerad one-click-avregistrering för kvot/påminnelse-mail.
// Delas av unsubscribe-routen (verifiering) och cron-utskicken (länkbygge).

import crypto from 'crypto';

export function unsubscribeSecret(): string {
  return process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function signUnsubscribe(userId: string): string {
  return crypto.createHmac('sha256', unsubscribeSecret()).update(userId).digest('hex');
}

export function unsubscribeUrl(userId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
  return `${base}/api/email/unsubscribe?uid=${encodeURIComponent(userId)}&sig=${signUnsubscribe(userId)}`;
}

/**
 * Avregistrering som bara stänger veckosammanfattningen. Egen route och egen
 * kolumn (profiles.weekly_digest_opt_out), så den som vill behålla
 * kvotpåminnelserna men slippa veckobrevet inte tvingas välja bort allt.
 * Samma HMAC-hemlighet och samma signatur över userId.
 */
export function unsubscribeDigestUrl(userId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
  return `${base}/api/email/unsubscribe-digest?uid=${encodeURIComponent(userId)}&sig=${signUnsubscribe(userId)}`;
}
