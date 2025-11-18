// src/app/api/cron/expire-premiums/route.ts
// ===========================================
// Cron job för att rensa utgångna premium-konton
// Körs varje timme via Vercel Cron eller manuellt

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin() as any
    const now = new Date().toISOString()

    console.log('[EXPIRE PREMIUMS] Running at:', now)

    // Find all users with expired premium_until dates
    // BUT only those without active Stripe subscriptions (subscription_status = null or not 'active'/'trialing')
    const { data: expiredUsers, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, premium_until, premium_source, subscription_status, subscription_tier')
      .eq('subscription_tier', 'premium')
      .lt('premium_until', now)
      .or('subscription_status.is.null,subscription_status.neq.active,subscription_status.neq.trialing')

    if (fetchError) {
      console.error('[EXPIRE PREMIUMS] Error fetching expired users:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!expiredUsers || expiredUsers.length === 0) {
      console.log('[EXPIRE PREMIUMS] No expired premiums found')
      return NextResponse.json({
        success: true,
        message: 'No expired premiums',
        expired: 0
      })
    }

    console.log(`[EXPIRE PREMIUMS] Found ${expiredUsers.length} expired users`)

    // Downgrade each user to free tier
    const userIds = expiredUsers.map(u => u.id)

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: 'free',
        // Keep premium_until and premium_source for historical tracking
      })
      .in('id', userIds)

    if (updateError) {
      console.error('[EXPIRE PREMIUMS] Error updating users:', updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // Log each expired premium for monitoring
    for (const user of expiredUsers) {
      console.log(`[EXPIRE PREMIUMS] Downgraded user ${user.id} (${user.email}) - Source: ${user.premium_source}, Expired: ${user.premium_until}`)
    }

    return NextResponse.json({
      success: true,
      message: `Expired ${expiredUsers.length} premium accounts`,
      expired: expiredUsers.length,
      users: expiredUsers.map(u => ({
        id: u.id,
        email: u.email,
        source: u.premium_source,
        expiredAt: u.premium_until
      }))
    })

  } catch (error: any) {
    console.error('[EXPIRE PREMIUMS] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
