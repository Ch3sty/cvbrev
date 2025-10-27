// src/app/api/admin/pricing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getAllModelPricing } from '@/lib/openai/pricing-sync';

/**
 * GET /api/admin/pricing
 * Returns all model pricing data from database
 * Supports optional ?provider= filter
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

    // Get optional provider filter
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get('provider') || undefined;

    // Fetch all pricing data
    const pricingData = await getAllModelPricing(supabase, provider);

    return NextResponse.json({
      success: true,
      data: pricingData,
      count: pricingData.length
    });

  } catch (error: any) {
    console.error('Pricing API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data', details: error.message },
      { status: 500 }
    );
  }
}
