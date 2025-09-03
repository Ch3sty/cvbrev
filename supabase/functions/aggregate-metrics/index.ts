import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get date for aggregation
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]

    // Aggregate subscription metrics
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('subscription_status, subscription_tier, created_at')

    const activeSubscribers = profiles?.filter(p => p.subscription_status === 'active').length || 0
    const premiumSubscribers = profiles?.filter(p => p.subscription_tier === 'premium').length || 0
    
    // Calculate new subscribers (created yesterday)
    const newSubscribers = profiles?.filter(p => {
      const createdDate = new Date(p.created_at).toISOString().split('T')[0]
      return createdDate === dateStr && p.subscription_status === 'active'
    }).length || 0

    // Calculate churned subscribers (would need to track this separately)
    const churnedSubscribers = 0 // Placeholder - implement actual logic

    const mrr = premiumSubscribers * 149
    const arr = mrr * 12
    const arpu = activeSubscribers > 0 ? mrr / activeSubscribers : 0
    const churnRate = activeSubscribers > 0 ? (churnedSubscribers / activeSubscribers) * 100 : 0

    // Insert or update subscription metrics
    const { error: metricsError } = await supabaseClient
      .from('subscription_metrics')
      .upsert({
        date: dateStr,
        total_subscribers: activeSubscribers,
        new_subscribers: newSubscribers,
        churned_subscribers: churnedSubscribers,
        mrr: mrr,
        arr: arr,
        average_revenue_per_user: arpu,
        churn_rate: churnRate
      })

    if (metricsError) {
      throw metricsError
    }

    // Aggregate daily usage stats
    const { data: activities } = await supabaseClient
      .from('user_activities')
      .select('user_id, activity_type')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`)

    // Group activities by user
    const userStats = new Map()
    
    activities?.forEach(activity => {
      if (!userStats.has(activity.user_id)) {
        userStats.set(activity.user_id, {
          cv_analyses_count: 0,
          letters_generated_count: 0,
          competence_analyses_count: 0
        })
      }
      
      const stats = userStats.get(activity.user_id)
      
      switch (activity.activity_type) {
        case 'cv_analysis':
          stats.cv_analyses_count++
          break
        case 'letter_generated':
          stats.letters_generated_count++
          break
        case 'competence_analysis':
          stats.competence_analyses_count++
          break
      }
    })

    // Insert daily usage stats
    for (const [userId, stats] of userStats) {
      await supabaseClient
        .from('daily_usage_stats')
        .upsert({
          date: dateStr,
          user_id: userId,
          ...stats,
          created_at: new Date().toISOString()
        })
    }

    // Check for anomalies and create alerts
    if (mrr < 10000) {
      await supabaseClient
        .from('system_alerts')
        .insert({
          alert_type: 'warning',
          title: 'Low MRR Alert',
          description: `Monthly recurring revenue is below threshold: ${mrr} SEK`,
          severity: 3,
          status: 'active',
          metadata: { mrr, threshold: 10000 }
        })
    }

    if (churnRate > 5) {
      await supabaseClient
        .from('system_alerts')
        .insert({
          alert_type: 'critical',
          title: 'High Churn Rate',
          description: `Churn rate exceeded 5%: ${churnRate.toFixed(2)}%`,
          severity: 5,
          status: 'active',
          metadata: { churn_rate: churnRate, threshold: 5 }
        })
    }

    // Generate AI predictions for high-risk users
    const { data: recentUsers } = await supabaseClient
      .from('profiles')
      .select('id, created_at, subscription_status')
      .order('created_at', { ascending: false })
      .limit(100)

    for (const user of recentUsers || []) {
      // Simple churn prediction based on activity
      const { count: activityCount } = await supabaseClient
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const churnProbability = activityCount === 0 ? 80 : activityCount < 3 ? 50 : 20
      const conversionProbability = user.subscription_status === 'free' && activityCount > 5 ? 70 : 30

      await supabaseClient
        .from('user_predictions')
        .upsert({
          user_id: user.id,
          prediction_type: 'churn',
          prediction_value: churnProbability,
          confidence_score: 75,
          factors: { recent_activity: activityCount },
          predicted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

      if (user.subscription_status === 'free') {
        await supabaseClient
          .from('user_predictions')
          .upsert({
            user_id: user.id,
            prediction_type: 'conversion',
            prediction_value: conversionProbability,
            confidence_score: 70,
            factors: { recent_activity: activityCount },
            predicted_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Metrics aggregated successfully',
        data: {
          date: dateStr,
          mrr,
          activeSubscribers,
          newSubscribers
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})