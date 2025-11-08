import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json({
        error: 'No Stripe customer found',
        hasSubscription: false
      }, { status: 404 });
    }

    // Get subscription details from Stripe
    if (profile.subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(profile.subscription_id, {
        expand: ['default_payment_method', 'discount', 'latest_invoice']
      });

      // Format subscription data
      const subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        currentPeriodStart: subscription.current_period_start,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at,
        trialEnd: subscription.trial_end,

        // Price info
        amount: subscription.items.data[0]?.price.unit_amount || 0,
        currency: subscription.items.data[0]?.price.currency || 'sek',
        interval: subscription.items.data[0]?.price.recurring?.interval || 'month',

        // Discount info
        discount: subscription.discount ? {
          coupon: {
            id: subscription.discount.coupon.id,
            percentOff: subscription.discount.coupon.percent_off,
            amountOff: subscription.discount.coupon.amount_off,
            duration: subscription.discount.coupon.duration,
            durationInMonths: subscription.discount.coupon.duration_in_months,
          },
          start: subscription.discount.start,
          end: subscription.discount.end,
        } : null,

        // Payment method
        paymentMethod: subscription.default_payment_method ? {
          type: (subscription.default_payment_method as any).type,
          card: (subscription.default_payment_method as any).card ? {
            brand: (subscription.default_payment_method as any).card.brand,
            last4: (subscription.default_payment_method as any).card.last4,
            expMonth: (subscription.default_payment_method as any).card.exp_month,
            expYear: (subscription.default_payment_method as any).card.exp_year,
          } : null
        } : null,

        // Latest invoice
        latestInvoice: subscription.latest_invoice ? {
          amountDue: (subscription.latest_invoice as any).amount_due,
          amountPaid: (subscription.latest_invoice as any).amount_paid,
          status: (subscription.latest_invoice as any).status,
        } : null,
      };

      return NextResponse.json({
        hasSubscription: true,
        subscription: subscriptionData
      });
    }

    return NextResponse.json({
      hasSubscription: false,
      error: 'No active subscription'
    }, { status: 404 });

  } catch (error: any) {
    console.error('Subscription details error:', error);
    return NextResponse.json({
      error: 'Failed to fetch subscription details',
      details: error.message
    }, { status: 500 });
  }
}
