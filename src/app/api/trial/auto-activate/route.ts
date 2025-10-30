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

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Verify authenticated user matches requested userId
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Check if user already has premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('premium_until, subscription_tier')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({
        error: 'Failed to fetch user profile'
      }, { status: 500 })
    }

    // Check if already premium
    const alreadyPremium = profile?.premium_until && new Date(profile.premium_until) > new Date()
    const hasPremiumTier = profile?.subscription_tier === 'premium'

    if (alreadyPremium || hasPremiumTier) {
      return NextResponse.json({
        success: true,
        message: 'User already has premium access',
        alreadyPremium: true,
        premiumUntil: profile.premium_until
      })
    }

    // Activate 7-day trial
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 7)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        premium_until: trialEndDate.toISOString(),
        premium_source: source || 'signup_trial'
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error activating trial:', updateError)
      return NextResponse.json({
        error: 'Failed to activate trial'
      }, { status: 500 })
    }

    // Award bonus XP for starting trial (non-blocking)
    const { error: xpError } = await supabase.rpc('add_xp_with_cap_check', {
      user_id_param: userId,
      xp_amount: 50,
      source_param: 'trial_activation',
      description_param: 'Aktiverade 7-dagars Premium trial'
    })

    if (xpError) {
      console.warn('Failed to award trial XP:', xpError)
      // Non-critical, continue
    }

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
      console.warn('Failed to create notification:', notifError)
      // Non-critical, continue
    }

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
    console.error('Unexpected error activating trial:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
