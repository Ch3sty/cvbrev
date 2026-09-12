// src/lib/email/lifecycle/schedule.ts
// Schemaläggning av livscykelmail (docs/plan-konvertering.md, spår D2).
//
// send_after = midnatt svensk tid + n dygn + 7 h. Alltså inte created_at +
// n*24h: mailen ska landa på morgonen oavsett när kontot skapades, och
// ordningen mot nedgraderingen (premium_until = midnatt + 5 dygn + 7 h) ska
// hålla.

import { startOfTodayStockholm } from '@/lib/quota/quotaService';
import type { AnySupabase } from './types';

/** Midnatt svensk tid + n dygn + 7 h. */
export function sendAfterStockholm(days: number, now: Date = new Date()): Date {
  const midnight = startOfTodayStockholm(now);
  return new Date(midnight.getTime() + days * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
}

/**
 * utm på alla CTA-länkar så klick kan tillskrivas rätt mail (spår D7).
 * Relativa paths tillåts och görs absoluta mot NEXT_PUBLIC_SITE_URL.
 */
export function withUtm(url: string, type: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
  let parsed: URL;
  try {
    parsed = new URL(url, base);
  } catch {
    return url;
  }
  parsed.searchParams.set('utm_source', 'lifecycle');
  parsed.searchParams.set('utm_medium', 'email');
  parsed.searchParams.set('utm_campaign', type);
  return parsed.toString();
}

/**
 * Schemalägg ett mail. Unique-indexet (user_id, email_type) gör anropet
 * idempotent: finns raden redan rörs den inte (ignoreDuplicates), så en
 * omkörd signup aldrig ger dubbla utskick eller flyttar send_after.
 */
export async function scheduleEmail(
  admin: AnySupabase,
  userId: string,
  emailType: string,
  sendAfter: Date,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await (admin as any)
    .from('email_schedule')
    .upsert(
      {
        user_id: userId,
        email_type: emailType,
        send_after: sendAfter.toISOString(),
        metadata,
      },
      { onConflict: 'user_id,email_type', ignoreDuplicates: true }
    );
  if (error) {
    console.error(`[lifecycle] scheduleEmail ${emailType} för ${userId} misslyckades:`, error.message);
  }
}

/** Schemalägg flera mail, dagar räknat från midnatt svensk tid. */
export async function scheduleMany(
  admin: AnySupabase,
  userId: string,
  entries: Array<{ type: string; days: number; metadata?: Record<string, unknown> }>,
  now: Date = new Date()
): Promise<void> {
  for (const entry of entries) {
    await scheduleEmail(admin, userId, entry.type, sendAfterStockholm(entry.days, now), entry.metadata ?? {});
  }
}

/**
 * Avbryt schemalagda mail som ännu inte skickats. Prefix matchar med like,
 * så cancelScheduled(admin, id, ['rt_']) tar hela reverse trial-sekvensen.
 */
export async function cancelScheduled(
  admin: AnySupabase,
  userId: string,
  typesOrPrefixes: string[],
  reason: string
): Promise<number> {
  let canceled = 0;
  for (const key of typesOrPrefixes) {
    const query = (admin as any)
      .from('email_schedule')
      .update({ canceled_at: new Date().toISOString(), cancel_reason: reason.slice(0, 200) })
      .eq('user_id', userId)
      .is('sent_at', null)
      .is('canceled_at', null);

    const { data, error } = key.endsWith('_')
      ? await query.like('email_type', `${key}%`).select('id')
      : await query.eq('email_type', key).select('id');

    if (error) {
      console.error(`[lifecycle] cancelScheduled ${key} för ${userId} misslyckades:`, error.message);
      continue;
    }
    canceled += (data ?? []).length;
  }
  return canceled;
}

/**
 * ISO-vecka, t.ex. "2026w37". Ger quota_wall och weekly_digest ett suffix i
 * email_type som byts varje måndag, så unique-indexet på
 * (user_id, email_type) blir dubblettspärr inom veckan men släpper igenom
 * nästa. Bor här, i tidsmodulen, eftersom både hooks och runner behöver den
 * och en import mellan dem hade blivit cirkulär.
 */
export function isoWeekKey(date: Date = new Date()): string {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7; // måndag = 0
  target.setUTCDate(target.getUTCDate() - dayNumber + 3); // torsdagen i veckan
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${target.getUTCFullYear()}w${week}`;
}
