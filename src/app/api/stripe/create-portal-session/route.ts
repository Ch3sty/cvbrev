// src/app/api/stripe/create-portal-session/route.ts
// ================================================
// KORRIGERAD version - Matchar cookie-hantering i api/profile/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';
import { getURL } from '@/utils/helpers';

export async function POST(request: Request) {
  try {
    // ***** KORRIGERING: Lägg till await cookies() *****
    const cookieStore = await cookies(); // Invanta Promise
    // Skicka det resolverade objektet till din funktion
    const supabase = createServerClient({ cookies: cookieStore });
    // ***** SLUT PÅ KORRIGERING *****

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Portal Session Error: User not authenticated:', userError);
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles') 
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { 
        console.error('Portal Session Error: Error fetching profile:', profileError);
        return new NextResponse('Internal Server Error fetching profile', { status: 500 });
    }
    if (!profile || !profile.stripe_customer_id) {
      console.error(`Portal Session Error: Missing profile or Stripe Customer ID for user ${user.id}.`);
      return new NextResponse('Stripe customer ID not found. Please subscribe first.', { status: 404 });
    }

    const customerId = profile.stripe_customer_id;
    console.log(`Portal Session Info: Creating portal session for customer ${customerId}`);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getURL('profile'), 
    });

    if (!portalSession.url) {
         console.error(`Portal Session Error: Failed to create portal session for customer ${customerId}`);
         throw new Error("Could not create Stripe Customer Portal session.");
    }
    console.log(`Portal Session Info: Created session ${portalSession.id}. Redirect URL: ${portalSession.url}`);

    return NextResponse.json({ url: portalSession.url });

  } catch (error: any) {
    console.error('Error creating Stripe Portal session:', error);
    return new NextResponse(`Error creating portal session: ${error.message}`, { status: 500 });
  }
}