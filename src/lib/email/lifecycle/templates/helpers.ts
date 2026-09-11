// src/lib/email/lifecycle/templates/helpers.ts
// Delade shouldSend-kontroller och formatering för livscykelmailen.

import type { LifecycleContext, LifecycleProfile } from '../types';

/** Har användaren loggat någon av aktiviteterna sedan (default) kontot skapades? */
export async function hasActivity(
  ctx: LifecycleContext,
  activityTypes: string[],
  since?: string
): Promise<boolean> {
  let query = (ctx.admin as any)
    .from('user_activities')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId)
    .in('activity_type', activityTypes);

  if (since) query = query.gte('created_at', since);

  const { count, error } = await query;
  if (error) {
    // Hellre skicka mailet än att tappa det på ett läsfel.
    console.error('[lifecycle] hasActivity-fel:', error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

/** Aktiv eller trialande Stripe-prenumeration, alltså en riktig betalande. */
export function isPayingNow(profile: LifecycleProfile): boolean {
  return ['active', 'trialing'].includes(profile.subscription_status ?? '');
}

/**
 * Har premium just nu, oavsett källa. Reverse trial räknas här (till skillnad
 * från isPayingNow, som aldrig får räkna signup_trial som betalande).
 */
export function hasPremiumNow(profile: LifecycleProfile): boolean {
  if (isPayingNow(profile)) return true;
  if (!profile.premium_until) return false;
  return new Date(profile.premium_until).getTime() > Date.now();
}

/**
 * Testsegmentet: har kört tester men aldrig laddat upp ett CV. Cirka 40
 * procent av nya konton enligt revisionen, och de behöver en annan vinkel.
 */
export async function isTestSegment(ctx: LifecycleContext): Promise<boolean> {
  const { count: testCount, error: testError } = await (ctx.admin as any)
    .from('logic_test_v4_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId);
  if (testError || !testCount) return false;

  const { count: cvCount, error: cvError } = await (ctx.admin as any)
    .from('cv_texts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId);
  if (cvError) return false;

  return (cvCount ?? 0) === 0;
}

const WEEKDAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];

/** Veckodagen då premium tar slut, för ämnesrad och brödtext. */
export function weekdayAfter(premiumUntil: string | null): string {
  if (!premiumUntil) return 'om två dagar';
  const date = new Date(premiumUntil);
  if (isNaN(date.getTime())) return 'om två dagar';
  const stockholmDay = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    weekday: 'short',
  }).format(date);
  const index = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(stockholmDay);
  return index >= 0 ? WEEKDAYS[index] : 'om två dagar';
}

/** Datum i svensk form, t.ex. "14 september". */
export function swedishDate(value: string | Date | null): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/** Namnet på senaste dokumentet, för win-back. Null om inget finns. */
export async function latestDocumentName(ctx: LifecycleContext): Promise<string | null> {
  const { data: letters } = await (ctx.admin as any)
    .from('letters')
    .select('job_title, created_at')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })
    .limit(1);

  const letter = (letters ?? [])[0];
  if (letter?.job_title) return String(letter.job_title);

  const { data: cvs } = await (ctx.admin as any)
    .from('cv_texts')
    .select('file_name, created_at')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })
    .limit(1);

  const cv = (cvs ?? [])[0];
  if (cv?.file_name) return String(cv.file_name);
  return null;
}
