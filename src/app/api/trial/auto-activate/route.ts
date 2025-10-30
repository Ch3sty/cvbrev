import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

interface TrialActivationRequest {
  userId: string
  source: string
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const body: TrialActivationRequest = await request.json()
    const { userId, source } = body

    console.log('[TRIAL API] Request received:', {
      userId,
      source,
      timestamp: new Date().toISOString(),
      hasAuthHeader: !!request.headers.get('authorization')
    })

    if (!userId) {
      console.error('[TRIAL API] Missing userId in request body')
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Verify authenticated user matches requested userId
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('[TRIAL API] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      requestedUserId: userId,
      matches: user?.id === userId,
      authError: authError?.message
    })

    if (authError || !user || user.id !== userId) {
      console.error('[TRIAL API] Authorization FAILED:', {
        hasAuthError: !!authError,
        hasUser: !!user,
        userIdMatch: user?.id === userId,
        userId
      })
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    console.log('[TRIAL API] Authorization SUCCESS - fetching profile')

    // Check if user already has premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('premium_until, subscription_tier')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('[TRIAL API] Profile fetch FAILED:', {
        error: profileError,
        userId
      })
      return NextResponse.json({
        error: 'Failed to fetch user profile'
      }, { status: 500 })
    }

    console.log('[TRIAL API] Profile fetched:', {
      userId,
      premiumUntil: profile?.premium_until,
      subscriptionTier: profile?.subscription_tier
    })

    // Check if already premium
    const alreadyPremium = profile?.premium_until && new Date(profile.premium_until) > new Date()
    const hasPremiumTier = profile?.subscription_tier === 'premium'

    if (alreadyPremium || hasPremiumTier) {
      console.log('[TRIAL API] User already has premium - skipping activation:', {
        userId,
        alreadyPremium,
        hasPremiumTier,
        premiumUntil: profile.premium_until
      })
      return NextResponse.json({
        success: true,
        message: 'User already has premium access',
        alreadyPremium: true,
        premiumUntil: profile.premium_until
      })
    }

    console.log('[TRIAL API] User eligible for trial - activating')

    // Activate 7-day trial
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 7)

    console.log('[TRIAL API] Updating profile with trial:', {
      userId,
      trialEndDate: trialEndDate.toISOString(),
      source: source || 'signup_trial'
    })

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        premium_until: trialEndDate.toISOString(),
        premium_source: source || 'signup_trial'
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[TRIAL API] Profile update FAILED:', {
        error: updateError,
        userId,
        trialEndDate: trialEndDate.toISOString()
      })
      return NextResponse.json({
        error: 'Failed to activate trial'
      }, { status: 500 })
    }

    console.log('[TRIAL API] Trial activated successfully - awarding XP')

    // Award bonus XP for starting trial (non-blocking)
    const { error: xpError } = await supabase.rpc('add_xp_with_cap_check', {
      user_id_param: userId,
      xp_amount: 50,
      source_param: 'trial_activation',
      description_param: 'Aktiverade 7-dagars Premium trial'
    })

    if (xpError) {
      console.warn('[TRIAL API] XP award failed (non-critical):', xpError)
      // Non-critical, continue
    } else {
      console.log('[TRIAL API] XP awarded successfully')
    }

    console.log('[TRIAL API] Creating notification')

    // Create notification (non-blocking)
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'trial_activated',
        title: 'Välkommen till Premium!',
        message: `Din 7-dagars Premium trial är nu aktiv till ${trialEndDate.toLocaleDateString('sv-SE')}.`,
        metadata: {
          trial_end_date: trialEndDate.toISOString(),
          source
        }
      })

    if (notifError) {
      console.warn('[TRIAL API] Notification creation failed (non-critical):', notifError)
      // Non-critical, continue
    } else {
      console.log('[TRIAL API] Notification created successfully')
    }

    console.log('[TRIAL API] Trial activation COMPLETE:', {
      userId,
      premiumUntil: trialEndDate.toISOString(),
      source
    })

    return NextResponse.json({
      success: true,
      data: {
        premiumUntil: trialEndDate.toISOString(),
        trialDays: 7,
        source,
        message: `7-dagars Premium trial aktiverad! Giltig till ${trialEndDate.toLocaleDateString('sv-SE')}.`
      }
    })

  } catch (error) {
    console.error('[TRIAL API] Unexpected error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
