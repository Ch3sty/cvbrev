// src/app/api/cron/pricing-sync/route.ts
// Vercel Cron job for automatic pricing sync AND premium expiration
// Kombinerat cron-jobb eftersom Hobby plan bara tillåter 1 cron
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { syncPricingToDatabase, clearPricingCache } from '@/lib/openai/pricing-sync';
import { generateQuotaBackEmail } from '@/lib/email/quota-back';
import { generateTrialReminderEmail } from '@/lib/email/trial-reminder';

/**
 * Vercel Cron job endpoint
 * Configured in vercel.json to run every hour
 *
 * Kör två uppgifter:
 * 1. Premium expiration check (varje timme)
 * 2. Pricing sync (endast kl 02:00)
 *
 * Security: Vercel automatically adds Authorization header with CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[Combined Cron] Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin() as any;
    const now = new Date();
    const currentHour = now.getUTCHours();

    // Två cron-slottar (Hobby-planen tillåter max 2 cron-jobb, båda pekar hit):
    // - 00:00 UTC: premium-expiration + pricing sync
    // - 06:00 UTC (07/08 svensk tid): kvotpåminnelser + trial-påminnelser,
    //   så mailen landar på morgonen och inte mitt i natten.
    const isMorningSlot = currentHour >= 4;

    const results: any = {
      timestamp: now.toISOString(),
      slot: isMorningSlot ? 'morning' : 'midnight',
      premiumExpiration: null,
      pricingSync: null,
      quotaReminders: null,
      trialReminders: null
    };

    // ====================================
    // 1. PREMIUM EXPIRATION (körs varje timme)
    // ====================================
    console.log('[Combined Cron] Running premium expiration check...');

    try {
      const nowISO = now.toISOString();

      const { data: expiredUsers, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, premium_until, premium_source, subscription_status, subscription_tier')
        .eq('subscription_tier', 'premium')
        .lt('premium_until', nowISO)
        .or('subscription_status.is.null,subscription_status.neq.active,subscription_status.neq.trialing');

      if (fetchError) {
        console.error('[Premium Expiration] Error fetching expired users:', fetchError);
        results.premiumExpiration = { success: false, error: fetchError.message };
      } else if (!expiredUsers || expiredUsers.length === 0) {
        console.log('[Premium Expiration] No expired premiums found');
        results.premiumExpiration = { success: true, expired: 0 };
      } else {
        console.log(`[Premium Expiration] Found ${expiredUsers.length} expired users`);

        const userIds = expiredUsers.map((u: any) => u.id);
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: 'free' })
          .in('id', userIds);

        if (updateError) {
          console.error('[Premium Expiration] Error updating users:', updateError);
          results.premiumExpiration = { success: false, error: updateError.message };
        } else {
          for (const user of expiredUsers) {
            console.log(`[Premium Expiration] Downgraded ${user.email} - Source: ${user.premium_source}, Expired: ${user.premium_until}`);
          }
          results.premiumExpiration = { success: true, expired: expiredUsers.length };
        }
      }
    } catch (error: any) {
      console.error('[Premium Expiration] Unexpected error:', error);
      results.premiumExpiration = { success: false, error: error.message };
    }

    // ====================================
    // 2. PRICING SYNC (midnattsslotten)
    // ====================================
    // Tidigare gate var `currentHour === 2`, men cronen körs 00:00 UTC så
    // syncen kördes i praktiken aldrig. Nu körs den i midnattsslotten.
    if (!isMorningSlot) {
      console.log('[Combined Cron] Running pricing sync (midnight slot)...');

      try {
        // Clear cache before sync
        clearPricingCache();

        // Perform sync
        const result = await syncPricingToDatabase(supabaseAdmin);

        console.log('[Pricing Sync] Sync completed:', {
          success: result.success,
          modelsAdded: result.modelsAdded,
          modelsUpdated: result.modelsUpdated,
          errors: result.errors
        });

        // Log to system_alerts if successful
        if (result.success && (result.modelsAdded > 0 || result.modelsUpdated > 0)) {
          try {
            await supabaseAdmin.from('system_alerts').insert({
              alert_type: 'info',
              title: 'Automated Pricing Sync',
              message: `Daily pricing sync completed: ${result.modelsAdded} added, ${result.modelsUpdated} updated`,
              metadata: {
                models_added: result.modelsAdded,
                models_updated: result.modelsUpdated,
                errors: result.errors,
                synced_at: result.lastSyncedAt,
                triggered_by: 'cron'
              },
              status: 'resolved'
            });
          } catch (alertError) {
            console.error('[Pricing Sync] Could not log to system_alerts:', alertError);
          }
        }

        // If sync failed completely, log error
        if (!result.success || result.errors.length > 0) {
          try {
            await supabaseAdmin.from('system_alerts').insert({
              alert_type: 'error',
              title: 'Pricing Sync Failed',
              message: `Daily pricing sync encountered errors: ${result.errors.join(', ')}`,
              metadata: {
                models_added: result.modelsAdded,
                models_updated: result.modelsUpdated,
                errors: result.errors,
                synced_at: result.lastSyncedAt,
                triggered_by: 'cron'
              },
              status: 'active'
            });
          } catch (alertError) {
            console.error('[Pricing Sync] Could not log error to system_alerts:', alertError);
          }
        }

        results.pricingSync = {
          success: result.success,
          modelsAdded: result.modelsAdded,
          modelsUpdated: result.modelsUpdated,
          errors: result.errors,
          lastSyncedAt: result.lastSyncedAt
        };

      } catch (error: any) {
        console.error('[Pricing Sync] Fatal error:', error);
        results.pricingSync = { success: false, error: error.message };
      }
    } else {
      results.pricingSync = { skipped: true, reason: 'Morning slot handles emails only' };
    }

    // ====================================
    // 3. KVOTPÅMINNELSER (morgonslotten)
    // ====================================
    // Skickar "kvoten är tillbaka"-mail till användare som klickat "Påminn mig"
    // och vars kvot nu öppnat. Respekterar quota_emails_opt_out.
    if (isMorningSlot) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const nowISO = now.toISOString();

        const { data: due, error: dueError } = await supabaseAdmin
          .from('quota_reminders')
          .select('id, user_id, feature')
          .is('sent_at', null)
          .lte('remind_after', nowISO)
          .limit(200);

        if (dueError) throw dueError;

        let sent = 0;
        let skipped = 0;
        for (const reminder of due ?? []) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email, quota_emails_opt_out, subscription_tier')
            .eq('id', reminder.user_id)
            .single();

          // Hoppa över opt-out, saknad e-post och användare som hunnit bli
          // premium (deras kvoter är obegränsade). Markera ändå som hanterad
          // så samma rad inte processas varje morgon.
          if (!profile?.email || profile.quota_emails_opt_out || profile.subscription_tier === 'premium') {
            skipped++;
          } else {
            const { subject, html } = generateQuotaBackEmail(reminder.user_id, reminder.feature);
            // Taggar följer med till Resends webhook-events så statistiken
            // kan grupperas per mailtyp/funktion (endast a-z0-9_- tillåts).
            const featureTag = reminder.feature.replace(/[^a-zA-Z0-9_-]/g, '_');
            const { data: sendData, error: sendError } = await resend.emails.send({
              from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
              to: [profile.email],
              subject,
              html,
              tags: [
                { name: 'type', value: 'quota_back' },
                { name: 'feature', value: featureTag }
              ]
            });
            if (sendError) {
              console.error('[Quota Reminders] Send failed for', reminder.id, sendError);
              continue; // lämna osänd, försöks igen imorgon
            }
            sent++;
            await supabaseAdmin.from('email_log').insert({
              resend_id: sendData?.id ?? null,
              user_id: reminder.user_id,
              email_type: 'quota_back',
              feature: reminder.feature,
              recipient: profile.email,
              subject
            });
          }

          await supabaseAdmin
            .from('quota_reminders')
            .update({ sent_at: nowISO })
            .eq('id', reminder.id);
        }

        console.log(`[Quota Reminders] sent=${sent} skipped=${skipped} due=${due?.length ?? 0}`);
        results.quotaReminders = { success: true, sent, skipped };
      } catch (error: any) {
        console.error('[Quota Reminders] Error:', error);
        results.quotaReminders = { success: false, error: error.message };
      }
    } else {
      results.quotaReminders = { skipped: true, reason: 'Midnight slot' };
    }

    // ====================================
    // 4. TRIAL-PÅMINNELSER (morgonslotten)
    // ====================================
    // Användare som skapade konto (Stripe-kund finns) men aldrig slutförde
    // betalningen, 1-3 dygn gamla, max ett mail per användare.
    if (isMorningSlot) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const dayMs = 24 * 60 * 60 * 1000;
        const minAge = new Date(now.getTime() - 3 * dayMs).toISOString();
        const maxAge = new Date(now.getTime() - 1 * dayMs).toISOString();

        const { data: candidates, error: candError } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('subscription_tier', 'free')
          .not('stripe_customer_id', 'is', null)
          .is('premium_until', null)
          .is('trial_reminder_sent_at', null)
          .eq('quota_emails_opt_out', false)
          .gte('created_at', minAge)
          .lte('created_at', maxAge)
          .limit(100);

        if (candError) throw candError;

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
        let sent = 0;
        for (const candidate of candidates ?? []) {
          if (!candidate.email) continue;
          const resumeUrl = `${baseUrl}/trial-signup?resume=${candidate.id}`;
          const trialSubject = 'Du är nästan klar – slutför din registrering';
          const { data: sendData, error: sendError } = await resend.emails.send({
            from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
            to: [candidate.email],
            subject: trialSubject,
            html: generateTrialReminderEmail(candidate.email, resumeUrl),
            tags: [{ name: 'type', value: 'trial_reminder' }]
          });
          if (sendError) {
            console.error('[Trial Reminders] Send failed for', candidate.id, sendError);
            continue;
          }
          sent++;
          await supabaseAdmin
            .from('profiles')
            .update({ trial_reminder_sent_at: now.toISOString() })
            .eq('id', candidate.id);
          await supabaseAdmin.from('email_log').insert({
            resend_id: sendData?.id ?? null,
            user_id: candidate.id,
            email_type: 'trial_reminder',
            recipient: candidate.email,
            subject: trialSubject
          });
        }

        console.log(`[Trial Reminders] sent=${sent} candidates=${candidates?.length ?? 0}`);
        results.trialReminders = { success: true, sent, candidates: candidates?.length ?? 0 };
      } catch (error: any) {
        console.error('[Trial Reminders] Error:', error);
        results.trialReminders = { success: false, error: error.message };
      }
    } else {
      results.trialReminders = { skipped: true, reason: 'Midnight slot' };
    }

    // Return combined results
    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error: any) {
    console.error('[Combined Cron] Fatal error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
