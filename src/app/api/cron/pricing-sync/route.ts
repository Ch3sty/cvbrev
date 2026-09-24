// src/app/api/cron/pricing-sync/route.ts
// Vercel Cron job for automatic pricing sync AND premium expiration
// Kombinerat cron-jobb eftersom Hobby plan bara tillåter 1 cron
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { syncPricingToDatabase, clearPricingCache } from '@/lib/openai/pricing-sync';
import { generateQuotaBackEmail } from '@/lib/email/quota-back';
import { generateSavedSearchAlertEmail, type AlertCandidate } from '@/lib/email/saved-search-alert';
import { runPoolSearch, type PoolFilters } from '@/lib/recruiter/poolSearch';
import { runLifecycleEmails, scheduleWinbacks, scheduleWeeklyDigests, scheduleKomIgangMejl } from '@/lib/email/lifecycle/runner';
import { onOnetimeExpired } from '@/lib/email/lifecycle/hooks';
import { createFollowUpNotifications } from '@/lib/notifications/followUp';
import { cleanupExpiredPublicDrafts } from '@/lib/letters/public-draft';
import { cleanupExpiredAnonSessions } from '@/lib/tests/anon-session';
import { cleanupExpiredIntervjuprov } from '@/lib/intervju/rad';
import { cleanupExpiredSmakprov } from '@/lib/personlighet/smakprov-rad';
import { collectAdminMetrics, dagStr } from '@/lib/admin/collect';

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
    // - 06:00 UTC (07/08 svensk tid): kvotpåminnelser och övriga utskick,
    //   så mailen landar på morgonen och inte mitt i natten.
    const isMorningSlot = currentHour >= 4;

    const results: any = {
      timestamp: now.toISOString(),
      slot: isMorningSlot ? 'morning' : 'midnight',
      premiumExpiration: null,
      pricingSync: null,
      quotaReminders: null,
      savedSearchAlerts: null,
      lifecycleEmails: null,
      winbacks: null,
      weeklyDigest: null,
      followUpNotifications: null,
      draftCleanup: null
    };

    // ====================================
    // 1. PREMIUM EXPIRATION (körs varje timme)
    // ====================================
    console.log('[Combined Cron] Running premium expiration check...');

    try {
      const nowISO = now.toISOString();

      // Samma skydd som i expire-premiums: det gamla OR-filtret slapp igenom
      // betalande kunder eftersom 'active' matchade villkoret "<> trialing".
      // Se kommentaren i src/app/api/cron/expire-premiums/route.ts.
      const { data: expiredUsers, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, premium_until, premium_source, subscription_status, subscription_tier')
        .eq('subscription_tier', 'premium')
        .lt('premium_until', nowISO)
        .or('subscription_status.is.null,subscription_status.not.in.(active,trialing)');

      if (fetchError) {
        console.error('[Premium Expiration] Error fetching expired users:', fetchError);
        results.premiumExpiration = { success: false, error: fetchError.message };
      } else if (!expiredUsers || expiredUsers.length === 0) {
        console.log('[Premium Expiration] No expired premiums found');
        results.premiumExpiration = { success: true, expired: 0 };
      } else {
        console.log(`[Premium Expiration] Found ${expiredUsers.length} expired users`);

        const userIds = expiredUsers.map((u: any) => u.id);
        // premium_scope nollas tillsammans med tier: behörigheten är ett spår
        // nu, och ett spår som löpt ut får inte ligga kvar på profilen
        // (docs/plan-paket-och-onboarding.md avsnitt 5).
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: 'free', premium_scope: null })
          .in('id', userIds);

        if (updateError) {
          console.error('[Premium Expiration] Error updating users:', updateError);
          results.premiumExpiration = { success: false, error: updateError.message };
        } else {
          let onetimeMails = 0;
          for (const user of expiredUsers) {
            console.log(`[Premium Expiration] Downgraded ${user.email} - Source: ${user.premium_source}, Expired: ${user.premium_until}`);

            // Spår D3: engångsköp som löpt ut får ett kort "vill du förlänga".
            // Reverse trial (signup_trial) har rt_day6 och ska INTE få det här.
            if (typeof user.premium_source === 'string' && user.premium_source.startsWith('onetime_')) {
              try {
                await onOnetimeExpired(supabaseAdmin, user.id);
                onetimeMails++;
              } catch (hookError: any) {
                console.error('[Premium Expiration] onOnetimeExpired misslyckades:', hookError?.message);
              }
            }
          }
          results.premiumExpiration = { success: true, expired: expiredUsers.length, onetimeMails };
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
    // 2b. ADMINMETRIK (midnattsslotten)
    // ====================================
    // docs/plan-admin.md avsnitt 5.5. Bada Vercel-crons ar upptagna av den
    // har rutten och en tredje gar inte att lagga till pa nuvarande plan, sa
    // insamlingen hakar in har. Varje delsteg har egen tidsgrans pa 10
    // sekunder och fangar sitt eget fel, sa ett hangande Stripe-anrop tar
    // inte ner ovriga jobb i den 60 sekunder langa cronen.
    //
    // Gardagens dag samlas in, inte dagens: vid midnatt har dygnet nyss
    // borjat och alla tal hade varit noll.
    if (!isMorningSlot) {
      try {
        const igar = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        // aterfyll: GSC-luckorna 13 till 20 september uppstod for att Vercel
        // saknade nycklarna medan nattkorningen bara samlade gardagen. Nu tas
        // upp till fem saknade GSC-dagar och tva trattveckor igen per korning,
        // med kvarvarande tid som budget sa dagens siffror alltid gar fore.
        results.adminMetrics = await collectAdminMetrics(supabaseAdmin, dagStr(igar), {
          aterfyll: true,
          budgetMs: 40_000,
        });
      } catch (error: any) {
        console.error('[Adminmetrik] Insamling misslyckades:', error);
        results.adminMetrics = { success: false, error: error.message };
      }
    } else {
      results.adminMetrics = { skipped: true, reason: 'Midnattsslotten samlar in' };
    }

    // ====================================
    // 2c. INTERVJUPROVET: RENSNING (midnattsslotten)
    // ====================================
    // docs/design/intervjuprov-spec-2026-09-23.md avsnitt 6 och
    // docs/design/rod-trad-prov-spec-2026-09-24.md avsnitt 6. Ohämtade
    // intervjusvar och personlighetsprov tas bort efter sju dygn. Hämtade
    // rader har expires_at null och rörs aldrig (ägarens beslut 2, 2026-09-24).
    // Samma rutt som övriga jobb: ett tredje cron-jobb går inte på planen.
    if (!isMorningSlot) {
      results.intervjuprovCleanup = { success: true, deleted: await cleanupExpiredIntervjuprov(supabaseAdmin) };
      results.personlighetsprovCleanup = { success: true, deleted: await cleanupExpiredSmakprov(supabaseAdmin) };
    } else {
      results.intervjuprovCleanup = { skipped: true, reason: 'Midnattsslotten rensar' };
      results.personlighetsprovCleanup = { skipped: true, reason: 'Midnattsslotten rensar' };
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
    // 5. BEVAKNINGSMAIL FÖR SPARADE SÖKNINGAR (morgonslotten)
    // ====================================
    // Rekryterare med notify=true på en sparad sökning får mail när NYA
    // kandidater (aktiva i poolen efter förra utskicket) matchar filtren.
    // Sökningen körs genom samma runPoolSearch som portalen, så mailet och
    // portalen aldrig ger olika svar. Max ett mail per sökning och dygn
    // (morgonslotten körs en gång per dag + 20h-spärr som extra skydd).
    if (isMorningSlot) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const nowISO = now.toISOString();
        const minGapMs = 20 * 60 * 60 * 1000;

        const { data: watches, error: watchError } = await supabaseAdmin
          .from('recruiter_saved_searches')
          .select('id, recruiter_user_id, name, filters, last_notified_at, created_at')
          .eq('notify', true)
          .limit(50);
        if (watchError) throw watchError;

        let sent = 0;
        let checked = 0;
        for (const watch of watches ?? []) {
          const lastNotified = watch.last_notified_at ?? watch.created_at;
          if (
            watch.last_notified_at &&
            now.getTime() - new Date(watch.last_notified_at).getTime() < minGapMs
          ) {
            continue;
          }
          checked++;

          const { candidates } = await runPoolSearch(
            supabaseAdmin,
            (watch.filters ?? {}) as PoolFilters
          );

          // "Ny" = blev aktiv i poolen efter förra utskicket (eller sökningens
          // skapande). activeSince = consent_given_at/created_at på profilen.
          const cutoff = new Date(lastNotified).getTime();
          const fresh = candidates.filter(
            (c) => c.activeSince && new Date(c.activeSince).getTime() > cutoff
          );
          if (fresh.length === 0) continue;

          const { data: recruiterProfile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', watch.recruiter_user_id)
            .single();
          if (!recruiterProfile?.email) continue;

          const alertCandidates: AlertCandidate[] = fresh.slice(0, 3).map((c) => ({
            role: c.role ?? 'Kandidat',
            region: c.regions[0] ?? null,
            years: c.yearsOfExperience,
            // Badge-etiketten är redan färdigformaterad med nivå och percentil.
            topBadge: c.testBadges[0]?.label ?? null,
          }));

          const { subject, html } = generateSavedSearchAlertEmail({
            searchName: watch.name,
            searchId: watch.id,
            total: fresh.length,
            candidates: alertCandidates,
          });

          const { data: sendData, error: sendError } = await resend.emails.send({
            from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
            to: [recruiterProfile.email],
            subject,
            html,
            tags: [{ name: 'type', value: 'saved_search_alert' }]
          });
          if (sendError) {
            console.error('[Saved Search Alerts] Send failed for', watch.id, sendError);
            continue; // lämna orörd, försöks igen imorgon
          }
          sent++;
          await supabaseAdmin.from('email_log').insert({
            resend_id: sendData?.id ?? null,
            user_id: watch.recruiter_user_id,
            email_type: 'saved_search_alert',
            recipient: recruiterProfile.email,
            subject
          });
          await supabaseAdmin
            .from('recruiter_saved_searches')
            .update({ last_notified_at: nowISO })
            .eq('id', watch.id);
        }

        console.log(`[Saved Search Alerts] sent=${sent} checked=${checked} watches=${watches?.length ?? 0}`);
        results.savedSearchAlerts = { success: true, sent, checked };
      } catch (error: any) {
        console.error('[Saved Search Alerts] Error:', error);
        results.savedSearchAlerts = { success: false, error: error.message };
      }
    } else {
      results.savedSearchAlerts = { skipped: true, reason: 'Midnight slot' };
    }

    // ====================================
    // 6. LIVSCYKELMAIL + UNDERHÅLL (morgonslotten)
    // ====================================
    // Runnern skickar förfallna mail ur email_schedule, win-back-sidojobbet
    // schemalägger nya, och utgångna publika utkast städas bort.
    if (isMorningSlot) {
      // Hjälpredans mejl: ett om dagen om nästa bricka till den som betalar,
      // och förnyas i morgon dagen före dragningen. Schemaläggs till nu och
      // skickas i samma körning av runnern nedan.
      try {
        results.komIgangMejl = await scheduleKomIgangMejl(supabaseAdmin, now);
      } catch (error: any) {
        console.error('[Lifecycle] Kom igång-urvalet:', error);
        results.komIgangMejl = { success: false, error: error.message };
      }

      try {
        results.lifecycleEmails = await runLifecycleEmails(supabaseAdmin);
      } catch (error: any) {
        console.error('[Lifecycle] Runner-fel:', error);
        results.lifecycleEmails = { success: false, error: error.message };
      }

      try {
        results.winbacks = await scheduleWinbacks(supabaseAdmin);
      } catch (error: any) {
        console.error('[Lifecycle] Win-back-fel:', error);
        results.winbacks = { success: false, error: error.message };
      }

      // Veckosammanfattningen, bara på söndagar (plan avsnitt 8).
      //
      // AVVIKELSE FRÅN PLANEN: planen säger "söndag kväll". Hobby-planen
      // tillåter bara två cron-jobb (00:00 och 06:00 UTC) och båda pekar hit,
      // så någon kvällsslot finns inte att lägga den i. Mailet skickas därför
      // söndag morgon, 06:00 UTC alltså 08:00 svensk tid. Det är dessutom
      // rimligare för mottagaren: en sammanfattning av veckan som gått läses
      // hellre över söndagsfrukosten än sent på kvällen.
      //
      // Urvalet schemalägger till just den här körningen, men runnern ovan har
      // redan passerat. Raderna skickas alltså i nästa morgonkörning, alltså
      // måndag morgon. För att slippa den förskjutningen körs runnern en gång
      // till direkt efter urvalet, bara för de nyss skapade raderna.
      const isSunday =
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Europe/Stockholm',
          weekday: 'short',
        }).format(now) === 'Sun';

      if (isSunday) {
        try {
          results.weeklyDigest = await scheduleWeeklyDigests(supabaseAdmin, now);
          results.weeklyDigestRun = await runLifecycleEmails(supabaseAdmin);
        } catch (error: any) {
          console.error('[Lifecycle] Veckosammanfattning-fel:', error);
          results.weeklyDigest = { success: false, error: error.message };
        }
      } else {
        results.weeklyDigest = { skipped: true, reason: 'Not Sunday' };
      }

      // Uppföljningsnotiser (våg 2 punkt 20): ger notisklockan innehåll för
      // alla som loggar ansökningar, inte bara de som får rekryterarintresse.
      try {
        results.followUpNotifications = await createFollowUpNotifications(supabaseAdmin, now);
      } catch (error: any) {
        console.error('[Notiser] Uppföljningsfel:', error);
        results.followUpNotifications = { success: false, error: error.message };
      }

      try {
        const deleted = await cleanupExpiredPublicDrafts(supabaseAdmin);
        const deletedTests = await cleanupExpiredAnonSessions(supabaseAdmin);
        results.draftCleanup = { success: true, deleted, deletedTests };
      } catch (error: any) {
        console.error('[Lifecycle] Rensning av publika utkast misslyckades:', error);
        results.draftCleanup = { success: false, error: error.message };
      }
    } else {
      results.lifecycleEmails = { skipped: true, reason: 'Midnight slot' };
      results.winbacks = { skipped: true, reason: 'Midnight slot' };
      results.weeklyDigest = { skipped: true, reason: 'Midnight slot' };
      results.followUpNotifications = { skipped: true, reason: 'Midnight slot' };
      results.draftCleanup = { skipped: true, reason: 'Midnight slot' };
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
