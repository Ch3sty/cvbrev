// src/lib/email/lifecycle/runner.ts
// Skickar schemalagda livscykelmail (plan D2). Körs som sektion i
// pricing-sync morgonslot.
//
// Ordningen är medvetet: sent_at skrivs FÖRE email_log. Kraschar processen
// däremellan tappar vi en loggrad, vilket bara påverkar statistiken. Motsatt
// ordning hade riskerat ett andra utskick till samma person, vilket är värre.

import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { AnySupabase, LifecycleProfile, LifecycleContext } from './types';
import { lifecycleTags } from './types';
import { resolveLifecycleEmail, WEEKLY_DIGEST_TYPE } from './registry';
import { scheduleEmail, sendAfterStockholm, isoWeekKey } from './schedule';

/** Avsändaren som redan är verifierad för domänen i Resend. */
export const LIFECYCLE_FROM = 'Jobbcoach.ai <noreply@jobbcoach.ai>';

const MAX_DUE = 150;
const MAX_ATTEMPTS = 3;
const CHUNK_SIZE = 10;
const TIME_BUDGET_MS = 40_000;

/** Dagar utan inloggning då veckosammanfattningen slutar skickas av sig själv. */
const DIGEST_INACTIVE_DAYS = 28;

const PROFILE_COLUMNS =
  'id, email, full_name, subscription_tier, subscription_status, current_period_end, premium_until, premium_source, quota_emails_opt_out, weekly_digest_opt_out, last_active, created_at';

export interface RunnerResult {
  due: number;
  sent: number;
  canceled: number;
  failed: number;
}

interface ScheduleRow {
  id: string;
  user_id: string;
  email_type: string;
  attempts: number;
  metadata: Record<string, unknown> | null;
}

async function cancelRow(admin: AnySupabase, rowId: string, reason: string): Promise<void> {
  await (admin as any)
    .from('email_schedule')
    .update({ canceled_at: new Date().toISOString(), cancel_reason: reason.slice(0, 200) })
    .eq('id', rowId);
}

async function failRow(
  admin: AnySupabase,
  row: ScheduleRow,
  message: string
): Promise<void> {
  await (admin as any)
    .from('email_schedule')
    .update({ attempts: row.attempts + 1, last_error: message.slice(0, 500) })
    .eq('id', row.id);
}

/**
 * Skickar ett schemalagt mail. Returnerar vad som hände så räknarna i
 * RunnerResult kan hållas på ett ställe.
 */
async function processRow(
  admin: AnySupabase,
  resend: Resend,
  row: ScheduleRow,
  profiles: Map<string, LifecycleProfile>
): Promise<'sent' | 'canceled' | 'failed'> {
  const template = resolveLifecycleEmail(row.email_type);
  if (!template) {
    await cancelRow(admin, row.id, 'unknown_email_type');
    return 'canceled';
  }

  const profile = profiles.get(row.user_id);
  if (!profile || !profile.email) {
    await cancelRow(admin, row.id, 'no_email');
    return 'canceled';
  }

  // Opt-out gäller allt utom det snävt transaktionella (betalning, uppsägning).
  if (profile.quota_emails_opt_out === true && !template.transactional) {
    await cancelRow(admin, row.id, 'opted_out');
    return 'canceled';
  }

  const ctx: LifecycleContext = {
    admin,
    userId: row.user_id,
    profile,
    metadata: row.metadata ?? {},
  };

  try {
    if (!(await template.shouldSend(ctx))) {
      await cancelRow(admin, row.id, 'should_send_false');
      return 'canceled';
    }
  } catch (error: any) {
    await failRow(admin, row, `shouldSend: ${error?.message ?? 'okänt fel'}`);
    return 'failed';
  }

  let rendered;
  try {
    rendered = await template.render(ctx);
  } catch (error: any) {
    await failRow(admin, row, `render: ${error?.message ?? 'okänt fel'}`);
    return 'failed';
  }

  const { data, error } = await resend.emails.send({
    from: LIFECYCLE_FROM,
    to: [profile.email],
    subject: rendered.subject,
    html: rendered.html,
    tags: lifecycleTags(row.email_type),
  });

  if (error) {
    await failRow(admin, row, `resend: ${error.message ?? 'okänt fel'}`);
    return 'failed';
  }

  // sent_at först, email_log sedan. Se filhuvudet.
  await (admin as any)
    .from('email_schedule')
    .update({ sent_at: new Date().toISOString(), last_error: null })
    .eq('id', row.id);

  const { error: logError } = await (admin as any).from('email_log').insert({
    resend_id: data?.id ?? null,
    user_id: row.user_id,
    email_type: row.email_type,
    feature: 'lifecycle',
    recipient: profile.email,
    subject: rendered.subject,
  });
  if (logError) {
    console.error(`[lifecycle] email_log misslyckades för ${row.id}:`, logError.message);
  }

  if (row.attempts > 0) {
    console.warn(`[lifecycle] ${row.email_type} till ${row.user_id} lyckades efter ${row.attempts} försök`);
  }

  return 'sent';
}

/** Kör alla förfallna livscykelmail. */
export async function runLifecycleEmails(
  adminClient?: AnySupabase
): Promise<RunnerResult> {
  const admin = (adminClient ?? getSupabaseAdmin()) as AnySupabase;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const startedAt = Date.now();
  const result: RunnerResult = { due: 0, sent: 0, canceled: 0, failed: 0 };

  const { data: dueRows, error } = await (admin as any)
    .from('email_schedule')
    .select('id, user_id, email_type, attempts, metadata')
    .is('sent_at', null)
    .is('canceled_at', null)
    .lt('attempts', MAX_ATTEMPTS)
    .lte('send_after', new Date().toISOString())
    .order('send_after', { ascending: true })
    .limit(MAX_DUE);

  if (error) {
    console.error('[lifecycle] kunde inte hämta förfallna rader:', error.message);
    return result;
  }

  const rows: ScheduleRow[] = dueRows ?? [];
  result.due = rows.length;
  if (rows.length === 0) return result;

  // En profilhämtning för hela körningen i stället för en per rad.
  const userIds = Array.from(new Set(rows.map((row) => row.user_id)));
  const { data: profileRows } = await (admin as any)
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .in('id', userIds);

  const profiles = new Map<string, LifecycleProfile>(
    (profileRows ?? []).map((profile: LifecycleProfile) => [profile.id, profile])
  );

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      console.warn(`[lifecycle] tidsbudget slut, ${rows.length - i} rader kvar till nästa körning`);
      break;
    }

    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const outcomes = await Promise.all(
      chunk.map((row) =>
        processRow(admin, resend, row, profiles).catch((error: any) => {
          console.error(`[lifecycle] oväntat fel på ${row.id}:`, error?.message);
          return 'failed' as const;
        })
      )
    );

    for (const outcome of outcomes) result[outcome] += 1;
  }

  console.log(
    `[lifecycle] due=${result.due} sent=${result.sent} canceled=${result.canceled} failed=${result.failed}`
  );
  return result;
}

/**
 * Win-back-sidojobb: schemalägg winback_14 och winback_30 för profiler som
 * varit borta så länge. Max 50 per typ och körning (planens spamtak).
 * Unique-indexet gör att redan schemalagda rader inte rörs.
 */
export async function scheduleWinbacks(adminClient?: AnySupabase): Promise<{
  winback_14: number;
  winback_30: number;
}> {
  const admin = (adminClient ?? getSupabaseAdmin()) as AnySupabase;
  const counts = { winback_14: 0, winback_30: 0 };

  for (const [type, days] of [
    ['winback_14', 14],
    ['winback_30', 30],
  ] as const) {
    // Fönster: mellan days och days+7 dagars inaktivitet. Utan den övre
    // gränsen skulle varje sedan länge död profil plockas upp varje dag.
    const upper = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const lower = new Date(Date.now() - (days + 7) * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await (admin as any)
      .from('profiles')
      .select('id')
      .not('email', 'is', null)
      .or('quota_emails_opt_out.is.null,quota_emails_opt_out.eq.false')
      .lt('last_active', upper)
      .gte('last_active', lower)
      .limit(50);

    if (error) {
      console.error(`[lifecycle] win-back-urval ${type} misslyckades:`, error.message);
      continue;
    }

    for (const profile of data ?? []) {
      // Skickas i morgondagens körning, samma morgonrytm som resten.
      await scheduleEmail(admin, profile.id, type, sendAfterStockholm(1));
      counts[type] += 1;
    }
  }

  console.log(`[lifecycle] win-back schemalagt: 14d=${counts.winback_14} 30d=${counts.winback_30}`);
  return counts;
}

/**
 * Veckosammanfattningen (plan avsnitt 8, våg 1 punkt 11).
 *
 * Urvalet körs söndag morgon och schemalägger mailet till samma dags körning
 * hos dem som faktiskt har ansökningar igång. Tre spärrar, i den ordning de
 * kostar minst att kontrollera:
 *
 *   1. weekly_digest_opt_out: den egna avregistreringen, som bara stänger
 *      det här mailet och lämnar kvotpåminnelserna orörda.
 *   2. quota_emails_opt_out: den globala avregistreringen. Runnern fångar den
 *      också, men då har vi redan skrivit en rad i onödan.
 *   3. Fyra veckor utan inloggning: den som slutat komma tillbaka ska inte få
 *      ett veckobrev i all evighet. Win-back-spåret äger det fallet i stället.
 *
 * Veckosuffixet i email_type (weekly_digest_2026w37) gör unique-indexet på
 * (user_id, email_type) till dubblettspärr: samma vecka går aldrig två gånger,
 * nästa vecka släpps igenom.
 */
export async function scheduleWeeklyDigests(
  adminClient?: AnySupabase,
  now: Date = new Date()
): Promise<{ scheduled: number; skipped: number }> {
  const admin = (adminClient ?? getSupabaseAdmin()) as AnySupabase;
  const result = { scheduled: 0, skipped: 0 };

  const emailType = `${WEEKLY_DIGEST_TYPE}_${isoWeekKey(now)}`;
  const inactiveCutoff = new Date(now.getTime() - DIGEST_INACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Bara konton med minst en ansökan är intressanta. Vi läser distinkta
  // user_id ur job_applications i stället för att gå igenom alla profiler.
  const { data: appRows, error: appError } = await (admin as any)
    .from('job_applications')
    .select('user_id')
    .limit(5000);

  if (appError) {
    console.error('[weekly_digest] kunde inte läsa ansökningar:', appError.message);
    return result;
  }

  const userIds = Array.from(new Set((appRows ?? []).map((row: any) => row.user_id as string)));
  if (userIds.length === 0) return result;

  const { data: profileRows, error: profileError } = await (admin as any)
    .from('profiles')
    .select('id, email, last_active, quota_emails_opt_out, weekly_digest_opt_out')
    .in('id', userIds);

  if (profileError) {
    console.error('[weekly_digest] kunde inte läsa profiler:', profileError.message);
    return result;
  }

  for (const profile of profileRows ?? []) {
    if (!profile.email) { result.skipped += 1; continue; }
    if (profile.weekly_digest_opt_out === true) { result.skipped += 1; continue; }
    if (profile.quota_emails_opt_out === true) { result.skipped += 1; continue; }
    // Saknad last_active räknas som inaktiv: vi vet inte att hon är kvar.
    if (!profile.last_active || profile.last_active < inactiveCutoff) {
      result.skipped += 1;
      continue;
    }

    // Skickas i samma morgonkörning. shouldSend avgör sedan om veckan har
    // något att berätta, så vi aldrig skickar ett brev om ingenting.
    await scheduleEmail(admin, profile.id, emailType, now);
    result.scheduled += 1;
  }

  console.log(`[weekly_digest] ${emailType}: schemalagt=${result.scheduled} hoppade=${result.skipped}`);
  return result;
}
