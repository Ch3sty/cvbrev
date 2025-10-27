// src/app/api/cron/pricing-sync/route.ts
// Vercel Cron job for automatic pricing sync every 24 hours
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { syncPricingToDatabase, clearPricingCache } from '@/lib/openai/pricing-sync';

/**
 * Vercel Cron job endpoint
 * Configured in vercel.json to run daily
 *
 * Security: Vercel automatically adds Authorization header with CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[PricingSync Cron] Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[PricingSync Cron] Starting scheduled pricing sync...');

    // Create a server-side Supabase client
    // Note: Cron jobs don't have user context, so we use service role
    const supabase = createServerClient({
      cookies: async () => ({
        get: () => undefined,
        set: () => {},
        remove: () => {}
      })
    });

    // Clear cache before sync
    clearPricingCache();

    // Perform sync
    const result = await syncPricingToDatabase(supabase);

    console.log('[PricingSync Cron] Sync completed:', {
      success: result.success,
      modelsAdded: result.modelsAdded,
      modelsUpdated: result.modelsUpdated,
      errors: result.errors
    });

    // Log to system_alerts if successful
    if (result.success && (result.modelsAdded > 0 || result.modelsUpdated > 0)) {
      try {
        await supabase.from('system_alerts').insert({
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
        console.error('[PricingSync Cron] Could not log to system_alerts:', alertError);
      }
    }

    // If sync failed completely, log error
    if (!result.success || result.errors.length > 0) {
      try {
        await supabase.from('system_alerts').insert({
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
        console.error('[PricingSync Cron] Could not log error to system_alerts:', alertError);
      }
    }

    return NextResponse.json({
      success: result.success,
      data: {
        modelsAdded: result.modelsAdded,
        modelsUpdated: result.modelsUpdated,
        errors: result.errors,
        lastSyncedAt: result.lastSyncedAt
      }
    });

  } catch (error: any) {
    console.error('[PricingSync Cron] Fatal error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
