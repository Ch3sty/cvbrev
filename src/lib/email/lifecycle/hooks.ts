// src/lib/email/lifecycle/hooks.ts
// Livscykel-hooks som anropas från signup, webhooks och cron
// (docs/plan-konvertering.md, D2-D3).
//
// Alla hooks är fire-and-forget: de får aldrig fälla anropande route. Fel
// loggas och sväljs.

import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LifecycleProfile, LifecycleContext } from './types';
import { lifecycleTags } from './types';
import { LIFECYCLE_EMAILS } from './registry';
import { LIFECYCLE_FROM } from './runner';
import { scheduleEmail, scheduleMany, cancelScheduled, sendAfterStockholm, isoWeekKey } from './schedule';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

const PROFILE_COLUMNS =
  'id, email, full_name, subscription_tier, subscription_status, current_period_end, premium_until, premium_source, quota_emails_opt_out, last_active, created_at';

async function loadProfile(admin: AnySupabase, userId: string): Promise<LifecycleProfile | null> {
  const { data, error } = await (admin as any)
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error(`[lifecycle] kunde inte läsa profil ${userId}:`, error.message);
    return null;
  }
  return (data as LifecycleProfile) ?? null;
}

/**
 * Skickar ett livscykelmail direkt, utanför schemat. Används för dag 0 och
 * för webhook-utlösta mail som ska ut omedelbart. Loggar i email_log med
 * samma tags som runnern, så statistiken ser dem på samma sätt.
 */
export async function sendLifecycleNow(
  admin: AnySupabase,
  userId: string,
  emailType: string,
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    const template = LIFECYCLE_EMAILS[emailType];
    if (!template) {
      console.error(`[lifecycle] okänd mailtyp ${emailType}`);
      return false;
    }

    const profile = await loadProfile(admin, userId);
    if (!profile?.email) return false;
    if (profile.quota_emails_opt_out === true && !template.transactional) return false;

    const ctx: LifecycleContext = { admin, userId, profile, metadata };
    if (!(await template.shouldSend(ctx))) return false;

    const rendered = await template.render(ctx);
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: LIFECYCLE_FROM,
      to: [profile.email],
      subject: rendered.subject,
      html: rendered.html,
      tags: lifecycleTags(emailType),
    });

    if (error) {
      console.error(`[lifecycle] ${emailType} till ${userId} misslyckades:`, error.message);
      return false;
    }

    await (admin as any).from('email_log').insert({
      resend_id: data?.id ?? null,
      user_id: userId,
      email_type: emailType,
      feature: 'lifecycle',
      recipient: profile.email,
      subject: rendered.subject,
    });
    return true;
  } catch (error: any) {
    console.error(`[lifecycle] sendLifecycleNow ${emailType} kastade:`, error?.message);
    return false;
  }
}

/** Alla fjorton dagsmejl, båda spåren. cancelScheduled matchar exakt. */
const VECKO_MEJLTYPER: string[] = [1, 2, 3, 4, 5, 6, 7].flatMap((n) => [`cv_day${n}`, `test_day${n}`]);

/**
 * Nytt konto skapat.
 *
 * Reverse trial-sekvensen rt_day0 till rt_day10 är borttagen (ägarens beslut
 * 3 i docs/plan-paket-och-onboarding.md): det finns ingen trial att berätta
 * om, och ett välkomstmejl som lovar fem dagar Premium vore fel. Kvar står
 * winback, som gäller den som varit borta oavsett hur kontot började.
 *
 * Veckoserien schemaläggs först vid köp, i onWeekStarted, eftersom den är
 * paketets program och inte kontots.
 */
export async function onUserSignup(admin: AnySupabase, userId: string): Promise<void> {
  try {
    await scheduleMany(admin, userId, [
      { type: 'winback_14', days: 14 },
      { type: 'winback_30', days: 30 },
    ]);
  } catch (error: any) {
    console.error('[lifecycle] kunde inte schemalägga winback:', error?.message);
  }
}

/**
 * Veckan är köpt: schemalägg dagsmejlen (docs/plan-paket-och-onboarding.md,
 * Fas 2B avsnitt 7).
 *
 * Mejlet för dag n går ut morgonen dag n, svensk tid, och dag 1:s mejl först
 * dagen efter köpet: köparen har just sett dag 1 i appen, så samma innehåll
 * i mailen samma kväll vore en upprepning. Hoppar användaren över en dag
 * skickas nästa dags mejl ändå, och mallens shouldSend ser till att ingen
 * påminns om något hon redan gjort.
 *
 * Anropas av webhooken när ett köp bekräftats. Spåret avgör vilken serie.
 */
export async function onWeekStarted(
  admin: AnySupabase,
  userId: string,
  track: 'cv' | 'tester' | 'allt'
): Promise<void> {
  const prefix = track === 'tester' ? 'test' : 'cv';
  try {
    // Byter användaren spår ska den gamla serien inte ligga kvar.
    await cancelScheduled(admin, userId, VECKO_MEJLTYPER, 'week_restarted');
    await scheduleMany(
      admin,
      userId,
      [1, 2, 3, 4, 5, 6, 7].map((n) => ({ type: `${prefix}_day${n}`, days: n }))
    );
  } catch (error: any) {
    console.error('[lifecycle] kunde inte schemalägga veckoserien:', error?.message);
  }
}

/** Veckan är slut eller uppsagd: stoppa dagsmejlen. */
export async function onWeekEnded(admin: AnySupabase, userId: string): Promise<void> {
  try {
    await cancelScheduled(admin, userId, VECKO_MEJLTYPER, 'week_ended');
  } catch (error: any) {
    console.error('[lifecycle] kunde inte avbryta veckoserien:', error?.message);
  }
}

/** Prenumeration avslutad: bekräftelse direkt, erbjudande om tre dagar. */
export async function onSubscriptionDeleted(admin: AnySupabase, userId: string): Promise<void> {
  try {
    await cancelScheduled(admin, userId, ['trial_'], 'subscription_deleted');
    // Dagsmejlen ska inte fortsätta till någon som sagt upp.
    await onWeekEnded(admin, userId);
    await sendLifecycleNow(admin, userId, 'cancel_immediate');
    await scheduleEmail(admin, userId, 'cancel_followup', sendAfterStockholm(3));
  } catch (error: any) {
    console.error('[lifecycle] onSubscriptionDeleted misslyckades:', error?.message);
  }
}

/** Betalningen gick inte igenom. Transaktionellt, ignorerar opt-out. */
export async function onPaymentFailed(admin: AnySupabase, userId: string): Promise<void> {
  try {
    await sendLifecycleNow(admin, userId, 'payment_failed');
  } catch (error: any) {
    console.error('[lifecycle] onPaymentFailed misslyckades:', error?.message);
  }
}

/** Engångsköp (dagspass/vecka) har löpt ut. */
export async function onOnetimeExpired(admin: AnySupabase, userId: string): Promise<void> {
  try {
    await sendLifecycleNow(admin, userId, 'onetime_expired');
  } catch (error: any) {
    console.error('[lifecycle] onOnetimeExpired misslyckades:', error?.message);
  }
}

/**
 * Kvotvägg: skicka quota_wall nu, max en gång per 7 dagar. Veckosuffixet i
 * email_type gör att unique-indexet (user_id, email_type) sköter dubbletterna
 * åt oss, och email_log-kontrollen fångar fallet där veckan just bytt.
 */
export async function onQuotaWall(admin: AnySupabase, userId: string): Promise<void> {
  try {
    const emailType = `quota_wall_${isoWeekKey()}`;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await (admin as any)
      .from('email_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .like('email_type', 'quota_wall%')
      .gte('sent_at', sevenDaysAgo);

    if ((count ?? 0) > 0) return;

    // Schemalägg i stället för att skicka inline: unique-indexet blir då
    // spärren mot dubbletter, och runnern skickar inom ett dygn.
    await scheduleEmail(admin, userId, emailType, new Date());
  } catch (error: any) {
    console.error('[lifecycle] onQuotaWall misslyckades:', error?.message);
  }
}

/**
 * Registrerar att användaren slagit i en kvotvägg och utlöser quota_wall vid
 * tredje träffen på 7 dagar (plan D3).
 *
 * quotaService.ts ägs av spår A, därför ligger räkningen här och anropas
 * från kvotroutarna i stället.
 */
export async function recordQuotaWall(
  admin: AnySupabase,
  userId: string,
  feature: string
): Promise<void> {
  try {
    // Loggas via admin-klienten, inte activity-logger: den senare kör mot
    // browser-klienten och fungerar inte i en server-route.
    await (admin as any).from('user_activities').insert({
      user_id: userId,
      activity_type: 'quota_wall_hit',
      description: `Kvottak nått: ${feature}`,
      metadata: { feature },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await (admin as any)
      .from('user_activities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('activity_type', 'quota_wall_hit')
      .gte('created_at', sevenDaysAgo);

    if (error) {
      console.error('[lifecycle] recordQuotaWall kunde inte räkna:', error.message);
      return;
    }

    if ((count ?? 0) >= 3) {
      await onQuotaWall(admin, userId);
    }
  } catch (error: any) {
    console.error('[lifecycle] recordQuotaWall misslyckades:', error?.message);
  }
}
