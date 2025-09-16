// src/app/api/admin/stripe-revenue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Initiera Stripe med secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// GET - Hämta Stripe revenue data
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Kontrollera autentisering och admin-behörighet
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kontrollera admin-status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Hämta query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const sync = searchParams.get('sync') === 'true';

    // Beräkna datumintervall
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Konvertera till Unix timestamps (Stripe använder sekunder)
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    try {
      // Hämta alla charges (betalningar) från Stripe
      const charges = await stripe.charges.list({
        created: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
        limit: 100,
      });

      // Hämta alla subscriptions
      const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        status: 'all',
      });

      // Hämta alla invoices
      const invoices = await stripe.invoices.list({
        created: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
        limit: 100,
      });

      // Beräkna totala intäkter från charges
      let totalRevenue = 0;
      let successfulCharges = 0;
      let failedCharges = 0;
      const revenueByDate: Record<string, number> = {};
      const revenueByCustomer: Record<string, { amount: number; email: string }> = {};

      charges.data.forEach(charge => {
        if (charge.paid && !charge.refunded) {
          const amount = charge.amount / 100; // Konvertera från öre till kronor
          totalRevenue += amount;
          successfulCharges++;

          // Gruppera per dag
          const date = new Date(charge.created * 1000).toISOString().split('T')[0];
          revenueByDate[date] = (revenueByDate[date] || 0) + amount;

          // Gruppera per kund
          if (charge.customer) {
            const customerId = charge.customer as string;
            if (!revenueByCustomer[customerId]) {
              revenueByCustomer[customerId] = {
                amount: 0,
                email: charge.billing_details?.email || charge.receipt_email || 'unknown'
              };
            }
            revenueByCustomer[customerId].amount += amount;
          }
        } else if (!charge.paid) {
          failedCharges++;
        }
      });

      // Beräkna MRR och ARR från aktiva subscriptions
      let mrr = 0;
      let activeSubscriptions = 0;
      let canceledSubscriptions = 0;
      let trialingSubscriptions = 0;

      subscriptions.data.forEach(sub => {
        if (sub.status === 'active') {
          activeSubscriptions++;
          // Hämta månadspriset
          const price = sub.items.data[0]?.price;
          if (price && price.recurring) {
            let monthlyAmount = price.unit_amount || 0;

            // Konvertera till månadsbelopp om det är årligt
            if (price.recurring.interval === 'year') {
              monthlyAmount = monthlyAmount / 12;
            }

            mrr += monthlyAmount / 100; // Konvertera från öre till kronor
          }
        } else if (sub.status === 'canceled') {
          canceledSubscriptions++;
        } else if (sub.status === 'trialing') {
          trialingSubscriptions++;
        }
      });

      const arr = mrr * 12;

      // Beräkna refunds
      let totalRefunded = 0;
      let refundCount = 0;

      const refunds = await stripe.refunds.list({
        created: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
        limit: 100,
      });

      refunds.data.forEach(refund => {
        totalRefunded += (refund.amount || 0) / 100;
        refundCount++;
      });

      // Beräkna nettointäkter
      const netRevenue = totalRevenue - totalRefunded;

      // Om sync=true, synka till databasen
      if (sync) {
        // Konvertera revenueByDate till array för databas-insert
        const revenueRecords = Object.entries(revenueByDate).map(([date, amount]) => ({
          user_id: null, // Systemgenrerad data
          amount: amount,
          currency: 'SEK',
          type: 'subscription' as const,
          description: `Stripe revenue for ${date}`,
          stripe_payment_intent_id: null,
          status: 'completed' as const,
          metadata: {
            source: 'stripe_api',
            sync_date: new Date().toISOString(),
            date: date
          },
          created_at: date
        }));

        // Infoga i revenue_tracking tabellen
        if (revenueRecords.length > 0) {
          const { error } = await supabase
            .from('revenue_tracking')
            .upsert(revenueRecords, {
              onConflict: 'created_at',
              ignoreDuplicates: true
            });

          if (error) {
            console.error('Fel vid synkning av intäkter:', error);
          }
        }

        // Uppdatera subscription_metrics
        const metricsData = {
          date: new Date().toISOString().split('T')[0],
          total_subscribers: activeSubscriptions,
          new_subscribers: 0, // Behöver mer logik för detta
          churned_subscribers: canceledSubscriptions,
          mrr: mrr,
          arr: arr,
          average_revenue_per_user: activeSubscriptions > 0 ? mrr / activeSubscriptions : 0,
          churn_rate: activeSubscriptions > 0 ? (canceledSubscriptions / activeSubscriptions) * 100 : 0
        };

        await supabase
          .from('subscription_metrics')
          .upsert(metricsData, {
            onConflict: 'date'
          });
      }

      // Formatera svar
      const responseData = {
        success: true,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days
        },
        revenue: {
          total: Math.round(totalRevenue * 100) / 100,
          net: Math.round(netRevenue * 100) / 100,
          refunded: Math.round(totalRefunded * 100) / 100,
          currency: 'SEK',
          byDate: Object.entries(revenueByDate)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, amount]) => ({
              date,
              amount: Math.round(amount * 100) / 100
            }))
        },
        subscriptions: {
          mrr: Math.round(mrr * 100) / 100,
          arr: Math.round(arr * 100) / 100,
          active: activeSubscriptions,
          canceled: canceledSubscriptions,
          trialing: trialingSubscriptions,
          total: subscriptions.data.length
        },
        charges: {
          successful: successfulCharges,
          failed: failedCharges,
          refunded: refundCount,
          total: charges.data.length
        },
        customers: {
          paying: Object.keys(revenueByCustomer).length,
          topCustomers: Object.entries(revenueByCustomer)
            .sort((a, b) => b[1].amount - a[1].amount)
            .slice(0, 10)
            .map(([id, data]) => ({
              customerId: id,
              email: data.email,
              totalSpent: Math.round(data.amount * 100) / 100
            }))
        },
        invoices: {
          total: invoices.data.length,
          paid: invoices.data.filter(i => i.paid).length,
          unpaid: invoices.data.filter(i => !i.paid).length
        }
      };

      return NextResponse.json(responseData);

    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        {
          error: 'Failed to fetch Stripe data',
          details: stripeError.message,
          code: stripeError.code
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in Stripe revenue endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Synka Stripe-intäkter till databasen
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Kontrollera autentisering och admin-behörighet
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kontrollera admin-status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Hämta body
    const body = await request.json();
    const { days = 30 } = body;

    // Anropa GET med sync=true
    const url = new URL(request.url);
    url.searchParams.set('days', days.toString());
    url.searchParams.set('sync', 'true');

    const getRequest = new NextRequest(url);
    return GET(getRequest);

  } catch (error: any) {
    console.error('Error syncing Stripe revenue:', error);
    return NextResponse.json(
      { error: 'Failed to sync revenue data', details: error.message },
      { status: 500 }
    );
  }
}