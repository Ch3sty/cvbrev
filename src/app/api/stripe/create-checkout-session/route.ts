// src/app/api/stripe/create-checkout-session/route.ts
// ====================================================
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
      console.error('Checkout Error: User not authenticated:', userError?.message || 'No user found');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    console.log(`Checkout Info: User ${user.id} authenticated.`);

    let priceId: string | null = null;
    try {
        const body = await request.json();
        priceId = body.priceId;
    } catch (parseError) {
        console.error('Checkout Error: Failed to parse request body as JSON.', parseError);
        return new NextResponse('Invalid request body', { status: 400 });
    }
    
    if (!priceId) {
        console.error('Checkout Error: Missing priceId in request body.');
        return new NextResponse('Missing priceId', { status: 400 });
    }
    console.log(`Checkout Info: Received priceId: ${priceId}`);

    let customerId: string | null = null;
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles') 
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { 
            throw new Error(`Error fetching profile: ${profileError.message}`);
        }
        customerId = profile?.stripe_customer_id ?? null; 

    } catch (dbError: any) {
         console.error('Checkout DB Error:', dbError.message);
         return new NextResponse('Internal Server Error fetching profile', { status: 500 });
    }

    if (!customerId) {
      try {
          console.log(`Checkout Info: No existing Stripe customer found for user ${user.id}. Creating new customer.`);
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.user_metadata?.full_name || undefined, 
            metadata: { supabaseUUID: user.id },
          });
          customerId = customer.id;
          console.log(`Checkout Info: Created Stripe customer ${customerId} for user ${user.id}`);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id);

          if (updateError) {
            console.error(`Checkout DB Warning: Failed to update profile for user ${user.id} with stripe_customer_id ${customerId}:`, updateError.message);
          } else {
              console.log(`Checkout Info: Successfully updated profile for user ${user.id} with customer ID.`);
          }
      } catch(customerCreateError: any) {
          console.error(`Checkout Stripe Error: Failed to create Stripe customer for ${user.email}:`, customerCreateError.message);
          return new NextResponse(`Failed to create payment profile: ${customerCreateError.message}`, { status: 500 });
      }
    } else {
        console.log(`Checkout Info: Found existing Stripe customer ${customerId} for user ${user.id}`);
    }

    try {
        console.log(`Checkout Info: Creating Stripe checkout session for customer ${customerId} with price ${priceId}`);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'], 
          mode: 'subscription',
          billing_address_collection: 'required', 
          customer: customerId, 
          line_items: [ { price: priceId, quantity: 1 } ],
          success_url: getURL('create-letter?status=success&session_id={CHECKOUT_SESSION_ID}'), 
          cancel_url: getURL('priser?status=cancelled'), 
          allow_promotion_codes: true, 
          subscription_data: { metadata: { supabaseUUID: user.id } },
          metadata: { supabaseUUID: user.id }
        });

        if (session.url) {
           console.log(`Checkout Info: Created session ${session.id}. Redirecting client to Stripe.`);
           return NextResponse.json({ sessionId: session.id, url: session.url });
        } else {
          console.error(`Checkout Stripe Error: Stripe session ${session.id} created BUT without a URL.`);
          return new NextResponse('Failed to create Stripe session (URL missing)', { status: 500 });
        }
    } catch (sessionCreateError: any) {
         console.error(`Checkout Stripe Error: Failed to create Stripe session:`, sessionCreateError.message);
         const message = sessionCreateError.raw?.message || sessionCreateError.message || "Unknown error creating session";
         return new NextResponse(`Failed to initiate payment: ${message}`, { status: 500 });
    }

  } catch (error: any) {
    console.error('Checkout Error: Unexpected error in POST handler:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}