// src/app/api/admin/pricing/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { syncPricingToDatabase, clearPricingCache } from '@/lib/openai/pricing-sync';

/**
 * POST /api/admin/pricing/sync
 * Manually triggers a sync of pricing data from LiteLLM to database
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Clear pricing cache before sync
    clearPricingCache();

    // Perform sync
    const result = await syncPricingToDatabase(supabase);

    // Log sync to system_alerts if successful
    if (result.success && (result.modelsAdded > 0 || result.modelsUpdated > 0)) {
      try {
        await supabase.from('system_alerts').insert({
          alert_type: 'info',
          title: 'Pricing Sync Completed',
          message: `Successfully synced pricing data: ${result.modelsAdded} added, ${result.modelsUpdated} updated`,
          metadata: {
            models_added: result.modelsAdded,
            models_updated: result.modelsUpdated,
            errors: result.errors,
            synced_at: result.lastSyncedAt,
            triggered_by: user.id
          },
          status: 'resolved'
        });
      } catch (alertError) {
        console.error('Could not log pricing sync to system_alerts:', alertError);
      }
    }

    // Return result
    return NextResponse.json({
      success: result.success,
      data: {
        modelsAdded: result.modelsAdded,
        modelsUpdated: result.modelsUpdated,
        totalModels: result.modelsAdded + result.modelsUpdated,
        errors: result.errors,
        lastSyncedAt: result.lastSyncedAt
      },
      message: result.success
        ? `Pricing sync successful: ${result.modelsAdded} added, ${result.modelsUpdated} updated`
        : 'Pricing sync failed'
    });

  } catch (error: any) {
    console.error('Pricing sync API error:', error);
    return NextResponse.json(
      { error: 'Failed to sync pricing', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/pricing/sync
 * Returns the status of the last pricing sync
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get latest sync info from model_pricing table
    const { data: latestSync, error } = await supabase
      .from('model_pricing')
      .select('last_updated, source, model_name')
      .eq('source', 'litellm')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    // Count models by source
    const { data: modelCounts } = await supabase
      .from('model_pricing')
      .select('source, model_name');

    const counts = {
      litellm: 0,
      manual: 0,
      total: 0
    };

    if (modelCounts) {
      counts.total = modelCounts.length;
      modelCounts.forEach(model => {
        if (model.source === 'litellm') counts.litellm++;
        if (model.source === 'manual') counts.manual++;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        lastSyncedAt: latestSync?.last_updated || null,
        lastSyncedModel: latestSync?.model_name || null,
        modelCounts: counts,
        syncSource: 'LiteLLM (https://github.com/BerriAI/litellm)'
      }
    });

  } catch (error: any) {
    console.error('Pricing sync status API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status', details: error.message },
      { status: 500 }
    );
  }
}
