// src/app/api/cron/pricing-sync/route.ts
// Vercel Cron job for automatic pricing sync AND premium expiration
// Kombinerat cron-jobb eftersom Hobby plan bara tillåter 1 cron
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { syncPricingToDatabase, clearPricingCache } from '@/lib/openai/pricing-sync';

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

    const results: any = {
      timestamp: now.toISOString(),
      premiumExpiration: null,
      pricingSync: null
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

        const userIds = expiredUsers.map(u => u.id);
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
    // 2. PRICING SYNC (endast kl 02:00 UTC)
    // ====================================
    if (currentHour === 2) {
      console.log('[Combined Cron] Running pricing sync (scheduled for 02:00 UTC)...');

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
      console.log('[Combined Cron] Skipping pricing sync (only runs at 02:00 UTC, current hour:', currentHour, ')');
      results.pricingSync = { skipped: true, reason: 'Not scheduled for this hour' };
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
